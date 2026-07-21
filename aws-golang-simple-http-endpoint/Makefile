.PHONY: build clean deploy

build: bin/hello.zip bin/world.zip

bin/hello.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./hello
	zip -j bin/hello.zip bootstrap && rm bootstrap

bin/world.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./world
	zip -j bin/world.zip bootstrap && rm bootstrap

clean:
	rm -rf bin bootstrap

deploy: build
	serverless deploy --verbose
