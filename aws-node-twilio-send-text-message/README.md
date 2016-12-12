# Send SMS Message with Twilio

This example demonstrates how to send SMS messages with the Twilio SDK and AWS lambda.

[Live the live demo](http://twilio-serverless-example.surge.sh)

## Use Cases:

* Sending users confirmation text messages

## Create a Twilio account.

1. Sign up for a Twilio account. Go to (http://www.twilio.com)

2. Create a [new phone number](https://www.twilio.com/console/phone-numbers/) in your Twilio trial account.

3. Grab your ACCOUNT SID and AUTH TOKEN from the [Twilio console](https://www.twilio.com/console) and plug those into the `serverless.yml` file in the next step.

4. Set your `env` variables in `serverless.yml` with your Twilio account values.

  ```yml
  environment:
    TWILIO_ACCOUNT_SID: YOUR-TWILIO-ACCOUNT-SID-HERE
    TWILIO_AUTH_TOKEN: YOUR-TWILIO-AUTH-TOKEN-HERE
    TWILIO_PHONE_NUMBER: YOUR-TWILIO-PHONE-NUMBER-HERE
  ```

5. Invoke the function and send an SMS message

  Update the `to` phone number the `event.json` file and `message` to send in the SMS

  Then invoke the function passing in the event JSON.

  ```bash
  serverless invoke -f sendText --path event.json
  ```

6. (optional) Deploy the frontend application.

  Update the `API_ENDPOINT` variable in `/frontend/index.html` and deploy the `/frontend` folder to a static host of your choice
