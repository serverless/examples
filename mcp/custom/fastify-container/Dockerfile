# A portable HTTP-server image made Lambda-compatible by the Lambda Web
# Adapter extension - the only Lambda-specific line is the COPY below. The
# same image runs unchanged on Fargate, App Runner, or any container host.
#
# The platform is pinned so the image matches the Lambda function's
# architecture (x86_64 by default) no matter what machine builds it - an
# image built on an Apple Silicon laptop without the pin fails at invoke
# with "exec format error". For Graviton, switch this to linux/arm64 and
# set `architecture: arm64` on the function.
FROM --platform=linux/amd64 public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 AS lambda-adapter

FROM --platform=linux/amd64 public.ecr.aws/docker/library/node:22-slim

COPY --from=lambda-adapter /lambda-adapter /opt/extensions/lambda-adapter

ENV PORT=8000 AWS_LWA_INVOKE_MODE=response_stream

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src

EXPOSE 8000
CMD ["node", "src/index.mjs"]
