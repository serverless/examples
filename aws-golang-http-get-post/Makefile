.PHONY: build clean deploy

build:
	dep ensure -v
	env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o bin/getBin getFolder/getExample.go
	env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o bin/postBin postFolder/postExample.go
	env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o bin/getQueryBin getFolder/getQueryExample.go

clean:
	rm -rf ./bin ./vendor Gopkg.lock

deploy: clean build
	sls deploy --verbose
