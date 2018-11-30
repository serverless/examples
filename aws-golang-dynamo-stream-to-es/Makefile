build:
	dep ensure -v
	env GOOS=linux go build -ldflags="-s -w" -o bin/aws-golang-dynamo-stream-to-elasticsearch cmd/aws-golang-dynamo-stream-to-elasticsearch/main.go
