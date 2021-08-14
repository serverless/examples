.PHONY: build clean deploy

build:
	dep ensure -v
	env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o bin/getgeolocation getgeolocation/main.go
	env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o bin/getsearchlocation getsearchlocation/main.go
	env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o bin/getnearbylocation getnearbylocation/main.go
	env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o bin/getgeodetail getgeodetail/main.go

clean:
	rm -rf ./bin ./vendor Gopkg.lock

deploy: clean build
	sls deploy --verbose
