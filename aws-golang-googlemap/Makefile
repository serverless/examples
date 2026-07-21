.PHONY: build clean deploy

build: bin/getgeolocation.zip bin/getnearbylocation.zip bin/getgeodetail.zip

bin/getgeolocation.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./getgeolocation
	zip -j bin/getgeolocation.zip bootstrap && rm bootstrap

bin/getnearbylocation.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./getnearbylocation
	zip -j bin/getnearbylocation.zip bootstrap && rm bootstrap

bin/getgeodetail.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./getgeodetail
	zip -j bin/getgeodetail.zip bootstrap && rm bootstrap

clean:
	rm -rf bin bootstrap

deploy: build
	serverless deploy --verbose
