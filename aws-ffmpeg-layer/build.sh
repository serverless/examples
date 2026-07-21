#!/bin/bash
# Downloads a static ffmpeg binary matching the Lambda arm64 architecture
# used by this example's serverless.yml (provider.architecture: arm64).
# If you switch back to x86_64, use ffmpeg-release-amd64-static.tar.xz instead.
mkdir -p layer
cd layer
rm -rf *
curl -O https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-arm64-static.tar.xz
tar -xf ffmpeg-release-arm64-static.tar.xz
mv ffmpeg-*-arm64-static ffmpeg
rm ffmpeg-release-arm64-static.tar.xz
