build:
	dep ensure -v
	env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o bin/stream main.go

.PHONY: clean
clean:
	rm -rf ./bin ./vendor

.PHONY: deploy
deploy: clean build
	sls deploy --verbose
