#!/bin/bash

echo "Demolishing your awesome stacks..."
cd products
serverless remove

cd ..
cd transactions
serverless remove

cd ..
cd users
serverless remove

cd ..
cd gateway
serverless remove

echo "Demolishing complete :)"
read