.PHONY: build clean deploy format

build: bin/create.zip bin/delete.zip bin/get.zip bin/list.zip bin/update.zip

bin/create.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./todos/create
	zip -j bin/create.zip bootstrap && rm bootstrap

bin/delete.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./todos/delete
	zip -j bin/delete.zip bootstrap && rm bootstrap

bin/get.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./todos/get
	zip -j bin/get.zip bootstrap && rm bootstrap

bin/list.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./todos/list
	zip -j bin/list.zip bootstrap && rm bootstrap

bin/update.zip:
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./todos/update
	zip -j bin/update.zip bootstrap && rm bootstrap

clean:
	rm -rf bin bootstrap

deploy: build
	serverless deploy --verbose

format:
	gofmt -w todos/create/main.go
	gofmt -w todos/delete/main.go
	gofmt -w todos/get/main.go
	gofmt -w todos/list/main.go
	gofmt -w todos/update/main.go
