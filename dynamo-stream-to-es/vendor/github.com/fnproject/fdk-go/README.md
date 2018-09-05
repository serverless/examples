# Go Fn Development Kit (FDK)

[![GoDoc](https://godoc.org/github.com/fnproject/fdk-go?status.svg)](https://godoc.org/github.com/fnproject/fdk-go)

fdk-go provides convenience functions for writing Go fn code

For getting started with fn, please refer to https://github.com/fnproject/fn/blob/master/README.md

# Installing fdk-go

```sh
go get github.com/fnproject/fdk-go
```

or your favorite vendoring solution :)

# Examples

For a simple getting started, see the [examples](/examples/hello) and follow
the [README](/examples/README.md). If you already have `fn` set up it
will take 2 minutes!

# Advanced example

TODO going to move to [examples](examples/) too :)

```go
package main

import (
  "context"
  "fmt"
  "io"
  "encoding/json"
  
  fdk "github.com/fnproject/fdk-go"
  "net/http"
)

func main() {
  fdk.Handle(fdk.HandlerFunc(myHandler))
}

func myHandler(ctx context.Context, in io.Reader, out io.Writer) {
  fnctx := fdk.Context(ctx)

  contentType := fnctx.Header.Get("Content-Type")
  if contentType != "application/json" {
    fdk.WriteStatus(out, 400)
    fdk.SetHeader(out, "Content-Type", "application/json")
    io.WriteString(out, `{"error":"invalid content type"}`)
    return
  }

  if fnctx.Method != "PUT" {
    fdk.WriteStatus(out, 404)
    fdk.SetHeader(out, "Content-Type", "application/json")
    io.WriteString(out, `{"error":"route not found"}`)
    return
  }

  var person struct {
    Name string `json:"name"`
  }
  json.NewDecoder(in).Decode(&person)

  // you can write your own headers & status, if you'd like to
  fdk.WriteStatus(out, 201)
  fdk.SetHeader(out, "Content-Type", "application/json")

  all := struct {
    Name   string            `json:"name"`
    Header http.Header       `json:"header"`
    Config map[string]string `json:"config"`
  }{
    Name: person.Name,
    Header: fnctx.Header,
    Config: fnctx.Config,
  }

  json.NewEncoder(out).Encode(&all)
}
```
