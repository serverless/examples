.PHONY: build clean deploy

build: bin/get.zip bin/getquery.zip bin/post.zip

bin/get.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./get
	zip -j bin/get.zip bootstrap && rm bootstrap

bin/getquery.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./getquery
	zip -j bin/getquery.zip bootstrap && rm bootstrap

bin/post.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./post
	zip -j bin/post.zip bootstrap && rm bootstrap

clean:
	rm -rf bin bootstrap

deploy: build
	serverless deploy --verbose
