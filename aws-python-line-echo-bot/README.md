# AWS-python-line-echo-bot

This is a simple echo bot on LINE bot (python)

## Bebore you start

1. Line developer account
2. [Line Message API](https://developers.line.biz/en/docs/messaging-api/getting-started/)

## Get Started

### Install serverless via npm

```bash=
$ npm install -g serverless
```

### Setup your AWS ceritficate

```bash=
export AWS_ACCESS_KEY_ID=<your-key-here>
export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>
```

### Setup you line bot secret & key

```python=
line_bot_api = LineBotApi('YOUR_CHANNEL_ACCESS_TOKEN')
handler = WebhookHandler('YOUR_CHANNEL_SECRET')
```

### Deploy the webhhok function

```bash=
npm install
serverless deploy
```
