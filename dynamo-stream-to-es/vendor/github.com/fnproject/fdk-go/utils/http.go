package utils

import (
	"bufio"
	"bytes"
	"context"
	"io"
	"io/ioutil"
	"net/http"
	"strconv"
)

func GetHTTPResp(buf *bytes.Buffer, fnResp *Response, req *http.Request) http.Response {

	fnResp.Header.Set("Content-Length", strconv.Itoa(buf.Len()))

	hResp := http.Response{
		ProtoMajor:    1,
		ProtoMinor:    1,
		StatusCode:    fnResp.Status,
		Request:       req,
		Body:          ioutil.NopCloser(buf),
		ContentLength: int64(buf.Len()),
		Header:        fnResp.Header,
	}

	return hResp
}

func DoHTTPOnce(handler Handler, ctx context.Context, in io.Reader, out io.Writer, buf *bytes.Buffer, hdr http.Header) error {
	buf.Reset()
	ResetHeaders(hdr)
	resp := Response{
		Writer: buf,
		Status: 200,
		Header: hdr,
	}

	req, err := http.ReadRequest(bufio.NewReader(in))
	if err != nil {
		// stdin now closed
		if err == io.EOF {
			return err
		}
		// TODO it would be nice if we could let the user format this response to their preferred style..
		resp.Status = http.StatusInternalServerError
		io.WriteString(resp, err.Error())
	} else {
		fnDeadline := Context(ctx).Header.Get("FN_DEADLINE")
		ctx, cancel := CtxWithDeadline(ctx, fnDeadline)
		defer cancel()

		SetHeaders(ctx, req.Header)
		SetRequestURL(ctx, req.URL.String())
		SetMethod(ctx, req.Method)
		handler.Serve(ctx, req.Body, &resp)
	}

	hResp := GetHTTPResp(buf, &resp, req)
	hResp.Write(out)
	return nil
}
