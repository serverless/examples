# Simple SQS Standard Example

This example demonstrates how to setup a SQS Standard and send messages through the message body and attributes.

## Use Cases
- Decouple message producers from message consumers.
- This is one way to architect for scale and reliability.

## Setup
- sls deploy

## Usage
- To print out the logs of the receiver sqs handler on the terminal
  `sls logs -f receiver -t`

- send a HTTP POST request to the sender lambda with a JSON payload