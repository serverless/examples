package utils

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

func DoJSON(handler Handler, ctx context.Context, in io.Reader, out io.Writer) {
	var buf bytes.Buffer
	hdr := make(http.Header)

	for {
		err := DoJSONOnce(handler, ctx, in, out, &buf, hdr)
		if err != nil {
			break
		}
	}
}

type CallRequestHTTP struct {
	Type       string      `json:"type"`
	RequestURL string      `json:"request_url"`
	Method     string      `json:"method"`
	Headers    http.Header `json:"headers"`
}

type JsonIn struct {
	CallID      string          `json:"call_id"`
	Deadline    string          `json:"deadline"`
	Body        string          `json:"body"`
	ContentType string          `json:"content_type"`
	Protocol    CallRequestHTTP `json:"protocol"`
}

type CallResponseHTTP struct {
	StatusCode int         `json:"status_code,omitempty"`
	Headers    http.Header `json:"headers,omitempty"`
}

type JsonOut struct {
	Body        string           `json:"body"`
	ContentType string           `json:"content_type"`
	Protocol    CallResponseHTTP `json:"protocol,omitempty"`
}

func GetJSONResp(buf *bytes.Buffer, fnResp *Response) *JsonOut {

	hResp := &JsonOut{
		Body:        buf.String(),
		ContentType: "",
		Protocol: CallResponseHTTP{
			StatusCode: fnResp.Status,
			Headers:    fnResp.Header,
		},
	}

	return hResp
}

func DoJSONOnce(handler Handler, ctx context.Context, in io.Reader, out io.Writer, buf *bytes.Buffer, hdr http.Header) error {
	buf.Reset()
	ResetHeaders(hdr)
	resp := Response{
		Writer: buf,
		Status: 200,
		Header: hdr,
	}

	var jsonRequest JsonIn
	err := json.NewDecoder(in).Decode(&jsonRequest)
	if err != nil {
		// stdin now closed
		if err == io.EOF {
			return err
		}
		resp.Status = http.StatusInternalServerError
		io.WriteString(resp, fmt.Sprintf(`{"error": %v}`, err.Error()))
	} else {

		SetHeaders(ctx, jsonRequest.Protocol.Headers)
		SetRequestURL(ctx, jsonRequest.Protocol.RequestURL)
		SetMethod(ctx, jsonRequest.Protocol.Method)
		ctx, cancel := CtxWithDeadline(ctx, jsonRequest.Deadline)
		defer cancel()
		handler.Serve(ctx, strings.NewReader(jsonRequest.Body), &resp)
	}

	jsonResponse := GetJSONResp(buf, &resp)
	json.NewEncoder(out).Encode(jsonResponse)
	return nil
}
