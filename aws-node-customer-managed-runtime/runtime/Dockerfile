# The runtime image: the Lambda Node.js 24 base image plus a file the platform
# team adds. Only COPY, so the image builds for arm64 on any machine.
FROM public.ecr.aws/lambda/nodejs:24
COPY runtime-info.json /etc/runtime-info.json
