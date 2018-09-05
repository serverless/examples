package utils

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

type CloudEvent struct {
	CloudEventsVersion string      `json:"cloudEventsVersion"`
	EventID            string      `json:"eventID"`
	Source             string      `json:"source"`
	EventType          string      `json:"eventType"`
	EventTypeVersion   string      `json:"eventTypeVersion"`
	EventTime          time.Time   `json:"eventTime"`
	SchemaURL          string      `json:"schemaURL"`
	ContentType        string      `json:"contentType"`
	Data               interface{} `json:"data"` // from docs: the payload is encoded into a media format which is specified by the contentType attribute (e.g. application/json)
}

type CloudEventInExtension struct {
	Protocol CallRequestHTTP `json:"protocol"`
	Deadline string          `json:"deadline"`
}

type CloudEventOutExtension struct {
	Protocol CallResponseHTTP `json:"protocol"`
}

type CloudEventIn struct {
	CloudEvent
	Extensions CloudEventInExtension `json:"extensions"`
}

type CloudEventOut struct {
	CloudEvent
	Extensions CloudEventOutExtension `json:"extensions"`
}

func writeError(ceOut *CloudEventOut, err error) {
	ceOut.Extensions.Protocol.StatusCode = http.StatusInternalServerError
	ceOut.Data = fmt.Sprintf(`{"error": %v}`, err.Error())
	ceOut.ContentType = "application/json"
	ceOut.EventTime = time.Now()
}

func DoCloudEventOnce(handler Handler, ctx context.Context, in io.Reader, out io.Writer, buf *bytes.Buffer, hdr http.Header) error {
	buf.Reset()
	ResetHeaders(hdr)
	resp := Response{
		Writer: buf,
		Status: 200,
		Header: hdr,
	}

	ceOut := CloudEventOut{
		Extensions: CloudEventOutExtension{
			Protocol: CallResponseHTTP{
				StatusCode: http.StatusOK,
				Headers:    hdr,
			},
		},
		CloudEvent: CloudEvent{
			ContentType: "text/plain",
		},
	}

	var ceIn CloudEventIn
	err := json.NewDecoder(in).Decode(&ceIn)
	if err != nil {
		if err == io.EOF {
			return err
		}
		writeError(&ceOut, err)
	} else {
		SetHeaders(ctx, ceIn.Extensions.Protocol.Headers)
		SetRequestURL(ctx, ceIn.Extensions.Protocol.RequestURL)
		SetMethod(ctx, ceIn.Extensions.Protocol.Method)
		ctx, cancel := CtxWithDeadline(ctx, ceIn.Extensions.Deadline)
		defer cancel()

		if ceIn.ContentType == "application/json" {
			// TODO this is lame, need to make FDK cloud event native and not io.Reader
			err = json.NewEncoder(buf).Encode(ceIn.Data)
			in := strings.NewReader(buf.String()) // string is immutable, we need a copy
			buf.Reset()
			handler.Serve(ctx, in, &resp)
		} else {
			handler.Serve(ctx, strings.NewReader(ceIn.Data.(string)), &resp)
		}
	}

	ceOut.EventID = ceIn.EventID
	ceOut.EventTime = time.Now()
	ceOut.ContentType = ceOut.Extensions.Protocol.Headers.Get("Content-Type")
	ceOut.Data = buf.String()
	return json.NewEncoder(out).Encode(ceOut)
}

func DoCloudEvent(handler Handler, ctx context.Context, in io.Reader, out io.Writer) {
	var buf bytes.Buffer
	hdr := make(http.Header)

	for {
		err := DoCloudEventOnce(handler, ctx, in, out, &buf, hdr)
		if err != nil {
			log.Println(err.Error())
			break
		}
	}
}
