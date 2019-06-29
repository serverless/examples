# AWS-python-line-echo-bot

This is a simple echo bot on LINE bot (python)

# Bebore you start

1. Line developer account
2. [Line Message API](https://developers.line.biz/en/docs/messaging-api/getting-started/)

# Get Started

1. Install serverless via npm

```bash=
$ npm install -g serverless
```

2. Setup your **AWS** ceritficate

```bash=
export AWS_ACCESS_KEY_ID=<your-key-here>
export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>
```

3. Setup you line bot secret & key

```python=
line_bot_api = LineBotApi('YOUR_CHANNEL_ACCESS_TOKEN')
handler = WebhookHandler('YOUR_CHANNEL_SECRET')
```

5. Deploy the webhhok function

```bash=
npm install
serverless deploy
```

![Echo bot](https://i.imgur.com/Tn1XS13.png)
