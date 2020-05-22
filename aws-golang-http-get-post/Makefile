.PHONY: build clean deploy

build:
	dep ensure -v
	env GOOS=linux go build -ldflags="-s -w" -o bin/getBin getFolder/getExample.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/postBin postFolder/postExample.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/getQueryBin getFolder/getQueryExample.go

clean:
	rm -rf ./bin ./vendor Gopkg.lock

deploy: clean build
	sls deploy --verbose
