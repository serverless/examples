#!/bin/bash

cd gateway
serverless deploy
sleep 5s

cd ..
cd products
serverless deploy
sleep 5s

cd ..
cd transactions
serverless deploy
sleep 5s

cd ..
cd users
serverless deploy
sleep 5s

echo "Press any key to continue"
read