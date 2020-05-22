#!/bin/bash
mkdir -p layer
cd layer
rm -rf *
curl -O https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-amd64-static.tar.xz
tar -xf ffmpeg-git-amd64-static.tar.xz
mv ffmpeg-git-*-amd64-static ffmpeg
rm ffmpeg-git-amd64-static.tar.xz
