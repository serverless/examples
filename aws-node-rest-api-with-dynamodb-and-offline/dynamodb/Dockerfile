FROM amazon/dynamodb-local

WORKDIR /home/dynamodblocal

RUN mkdir ./db && chown -R 1000 ./db

CMD ["-jar", "DynamoDBLocal.jar", "-dbPath", "./db", "-sharedDb"]
VOLUME ["./db"]
