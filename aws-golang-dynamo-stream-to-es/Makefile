build:
	dep ensure -v
	env GOOS=linux go build -ldflags="-s -w" -o bin/aws-golang-dynamo-stream-to-es cmd/aws-golang-dynamo-stream-to-es/main.go