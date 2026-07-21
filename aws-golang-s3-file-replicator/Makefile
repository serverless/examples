.PHONY: build clean deploy

build: bin/replicate.zip

bin/replicate.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./src
	zip -j bin/replicate.zip bootstrap && rm bootstrap

clean:
	rm -rf bin bootstrap

deploy: build
	serverless deploy --verbose
