.PHONY: build clean deploy

build:
	dep ensure -v
	env GOOS=linux go build -ldflags="-s -w" -o bin/getgeolocation getgeolocation/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/getsearchlocation getsearchlocation/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/getnearbylocation getnearbylocation/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/getgeodetail getgeodetail/main.go

clean:
	rm -rf ./bin ./vendor Gopkg.lock

deploy: clean build
	sls deploy --verbose
