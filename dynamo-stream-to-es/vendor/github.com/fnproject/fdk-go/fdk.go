package fdk

import (
	"context"
	"io"
	"net/http"
	"os"

	"github.com/fnproject/fdk-go/utils"
)

type Handler interface {
	Serve(ctx context.Context, in io.Reader, out io.Writer)
}

type HandlerFunc func(ctx context.Context, in io.Reader, out io.Writer)

func (f HandlerFunc) Serve(ctx context.Context, in io.Reader, out io.Writer) {
	f(ctx, in, out)
}

// Context will return an *fn.Ctx that can be used to read configuration and
// request information from an incoming request.
func Context(ctx context.Context) *Ctx {
	utilsCtx := utils.Context(ctx)
	return &Ctx{
		Header:     utilsCtx.Header,
		Config:     utilsCtx.Config,
		RequestURL: utilsCtx.RequestURL,
		Method:     utilsCtx.Method,
	}
}

func WithContext(ctx context.Context, fnctx *Ctx) context.Context {
	utilsCtx := &utils.Ctx{
		Header:     fnctx.Header,
		Config:     fnctx.Config,
		RequestURL: fnctx.RequestURL,
		Method:     fnctx.Method,
	}
	return utils.WithContext(ctx, utilsCtx)
}

// Ctx provides access to Config and Headers from fn.
type Ctx struct {
	Header     http.Header
	Config     map[string]string
	RequestURL string
	Method     string
}

// AddHeader will add a header on the function response, for hot function
// formats.
func AddHeader(out io.Writer, key, value string) {
	if resp, ok := out.(*utils.Response); ok {
		resp.Header.Add(key, value)
	}
}

// SetHeader will set a header on the function response, for hot function
// formats.
func SetHeader(out io.Writer, key, value string) {
	if resp, ok := out.(*utils.Response); ok {
		resp.Header.Set(key, value)
	}
}

// WriteStatus will set the status code to return in the function response, for
// hot function formats.
func WriteStatus(out io.Writer, status int) {
	if resp, ok := out.(*utils.Response); ok {
		resp.Status = status
	}
}

// Handle will run the event loop for a function. Handle should be invoked
// through main() in a user's function and can handle communication between the
// function and fn server via any of the supported formats.
func Handle(handler Handler) {
	format, _ := os.LookupEnv("FN_FORMAT")
	utils.Do(handler, format, os.Stdin, os.Stdout)
}
