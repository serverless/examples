build:
	dep ensure -v
	env GOOS=linux go build -ldflags="-s -w" -o bin/dynamo-stream-to-es cmd/dynamo-stream-to-es/main.go