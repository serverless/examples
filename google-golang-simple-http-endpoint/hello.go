package hello

import (
	"bytes"
	"encoding/json"
	"net/http"
)

// Hello is a simple HTTP handler that addresses HTTP requests to the /hello endpoint
func Hello(w http.ResponseWriter, r *http.Request) {
	var buf bytes.Buffer

	body, err := json.Marshal(map[string]interface{}{
		"message": "Go Serverless v1! Your function executed hello successfully!",
	})
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(err.Error()))
		return
	}
	json.HTMLEscape(&buf, body)

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("MyCompany-Func-Reply", "hello-handler")
	w.Write(buf.Bytes())
}
