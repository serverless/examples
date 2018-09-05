package utils

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

type Handler interface {
	Serve(ctx context.Context, in io.Reader, out io.Writer)
}

// Context will return an *fn.Ctx that can be used to read configuration and
// request information from an incoming request.
func Context(ctx context.Context) *Ctx {
	return ctx.Value(ctxKey).(*Ctx)
}

func WithContext(ctx context.Context, fnctx *Ctx) context.Context {
	return context.WithValue(ctx, ctxKey, fnctx)
}

// Ctx provides access to Config and Headers from fn.
type Ctx struct {
	Header     http.Header
	Config     map[string]string
	RequestURL string
	Method     string
}

type key struct{}

var ctxKey = new(key)

func Do(handler Handler, format string, in io.Reader, out io.Writer) {
	ctx := BuildCtx()
	switch format {
	case "http":
		DoHTTP(handler, ctx, in, out)
	case "json":
		DoJSON(handler, ctx, in, out)
	case "cloudevent":
		DoCloudEvent(handler, ctx, in, out)
	case "default":
		DoDefault(handler, ctx, in, out)
	default:
		panic("unknown format (fdk-go): " + format)
	}
}

// doDefault only runs once, since it is a 'cold' function
func DoDefault(handler Handler, ctx context.Context, in io.Reader, out io.Writer) {
	SetHeaders(ctx, BuildHeadersFromEnv())
	fnDeadline, _ := os.LookupEnv("FN_DEADLINE")

	ctx, cancel := CtxWithDeadline(ctx, fnDeadline)
	defer cancel()

	handler.Serve(ctx, in, out)
}

// doHTTP runs a loop, reading http requests from in and writing
// http responses to out
func DoHTTP(handler Handler, ctx context.Context, in io.Reader, out io.Writer) {
	var buf bytes.Buffer
	// maps don't get down-sized, so we can reuse this as it's likely that the
	// user sends in the same amount of headers over and over (but still clear
	// b/w runs) -- buf uses same principle
	hdr := make(http.Header)

	for {
		err := DoHTTPOnce(handler, ctx, in, out, &buf, hdr)
		if err != nil {
			break
		}
	}
}

func CtxWithDeadline(ctx context.Context, fnDeadline string) (context.Context, context.CancelFunc) {
	t, err := time.Parse(time.RFC3339, fnDeadline)
	if err == nil {
		return context.WithDeadline(ctx, t)
	}
	return context.WithCancel(ctx)
}

func ResetHeaders(m http.Header) {
	for k := range m { // compiler optimizes this to 1 instruction now
		delete(m, k)
	}
}

// response is a general purpose response struct any format can use to record
// user's code responses before formatting them appropriately.
type Response struct {
	Status int
	Header http.Header

	io.Writer
}

var (
	BaseHeaders = map[string]struct{}{
		`FN_APP_NAME`: struct{}{},
		`FN_PATH`:     struct{}{},
		`FN_METHOD`:   struct{}{},
		`FN_FORMAT`:   struct{}{},
		`FN_MEMORY`:   struct{}{},
		`FN_TYPE`:     struct{}{},
	}

	HeaderPrefix = `FN_HEADER_`

	ExactHeaders = map[string]struct{}{
		`FN_CALL_ID`:     struct{}{},
		`FN_METHOD`:      struct{}{},
		`FN_REQUEST_URL`: struct{}{},
	}
)

func SetHeaders(ctx context.Context, hdr http.Header) {
	fctx := ctx.Value(ctxKey).(*Ctx)
	fctx.Header = hdr
}

func SetRequestURL(ctx context.Context, requestURL string) {
	fctx := ctx.Value(ctxKey).(*Ctx)
	fctx.RequestURL = requestURL
}

func SetMethod(ctx context.Context, method string) {
	fctx := ctx.Value(ctxKey).(*Ctx)
	fctx.Method = method
}

func BuildCtx() context.Context {
	ctx := &Ctx{
		Config: BuildConfig(),
		// allow caller to build headers separately (to avoid map alloc)
	}

	return WithContext(context.Background(), ctx)
}

func BuildConfig() map[string]string {
	cfg := make(map[string]string, len(BaseHeaders))

	for _, e := range os.Environ() {
		vs := strings.SplitN(e, "=", 2)
		if len(vs) < 2 {
			vs = append(vs, "")
		}
		cfg[vs[0]] = vs[1]
	}
	return cfg
}

func BuildHeadersFromEnv() http.Header {
	env := os.Environ()
	hdr := make(http.Header, len(env)-len(BaseHeaders))

	for _, e := range env {
		vs := strings.SplitN(e, "=", 2)
		hdrKey := IsHeaderKey(vs[0])
		if hdrKey == "" {
			continue
		}
		if len(vs) < 2 {
			vs = append(vs, "")
		}
		// rebuild these as 'http' headers
		vs = strings.Split(vs[1], ", ")
		for _, v := range vs {
			hdr.Add(hdrKey, v)
		}
	}
	return hdr
}

// for getting headers out of env
func IsHeaderKey(key string) string {
	if strings.HasPrefix(key, HeaderPrefix) {
		return strings.TrimPrefix(key, HeaderPrefix)
	}
	_, ok := ExactHeaders[key]
	if ok {
		return key
	}
	return ""
}
