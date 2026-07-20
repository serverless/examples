.PHONY: build clean deploy

build: bin/authorize.zip bin/authorize2.zip bin/hello-world.zip bin/hello-world2.zip ## Build golang binaries

bin/authorize.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./functions/auth
	zip -j bin/authorize.zip bootstrap && rm bootstrap

bin/authorize2.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./functions/auth2
	zip -j bin/authorize2.zip bootstrap && rm bootstrap

bin/hello-world.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./functions/hello-world
	zip -j bin/hello-world.zip bootstrap && rm bootstrap

bin/hello-world2.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./functions/hello-world2
	zip -j bin/hello-world2.zip bootstrap && rm bootstrap

clean:
	rm -rf bin bootstrap

deploy: build
	serverless deploy
