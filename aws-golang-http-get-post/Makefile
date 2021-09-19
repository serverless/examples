.PHONY: build clean deploy

build:
	cd getFolder && env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o ../bin/getBin getExample.go && cd ..
	cd getFolder && env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o ../bin/getQueryBin getQueryExample.go && cd ..
	cd postFolder && env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o ../bin/postBin ./postExample.go && cd ..

clean:
	rm -rf ./bin ./vendor Gopkg.lock

deploy: clean build
	sls deploy --verbose
