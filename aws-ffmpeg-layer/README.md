<!--
title: 'AWS FFmpeg Layer'
description: 'AWS FFmpeg Layer & a service using it to create GIFs'
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/tdhopper'
authorName: 'Timothy Hopper'
authorAvatar: 'https://avatars0.githubusercontent.com/u/611122?v=4&s=140'
-->

# AWS FFmpeg Layer & a service using it to create GIFs

```
git clone https://github.com/serverless/examples
cd examples/aws-ffmpeg-layer
npm install
./build.sh
serverless deploy
```

`build.sh` downloads a static `ffmpeg`/`ffprobe` build from [johnvansickle.com/ffmpeg](https://johnvansickle.com/ffmpeg/) into `layer/ffmpeg`, which is packaged as a Lambda layer and mounted at `/opt/ffmpeg` for the `mkgif` function. The script fetches the `arm64` static build to match this example's `provider.architecture: arm64`; if you switch the function back to `x86_64`, update `build.sh` to fetch `ffmpeg-release-amd64-static.tar.xz` instead.

The S3 bucket that triggers `mkgif` defaults to `gifmaker-${sls:stage}-${aws:accountId}` (stage- and account-qualified, so it won't collide with other deployments of this example). Override it with `BUCKET=my-bucket-name serverless deploy` if you need a specific name.

After running deploy, you should see output similar to:

```
Deploying "gifmaker" to stage "dev" (us-east-1)

✔ Service deployed to stack gifmaker-dev (58s)

functions:
  mkgif: gifmaker-dev-mkgif (1.4 kB)
```

See the blog post about this example for more details:
https://serverless.com/blog/publish-aws-lambda-layers-serverless-framework/
