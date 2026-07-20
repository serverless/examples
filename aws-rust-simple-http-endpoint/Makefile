.PHONY: build clean deploy test

build: bin/hello.zip

bin/hello.zip:
	mkdir -p bin
	cargo lambda build --release --arm64
	zip -j bin/hello.zip target/lambda/hello/bootstrap

test:
	cargo test

clean:
	rm -rf bin target

deploy: build
	serverless deploy --verbose
