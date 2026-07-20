FROM public.ecr.aws/docker/library/node:24-slim
WORKDIR /app
COPY app.js .
# 8080 = application port (callers reach it through the proxy).
# 9000 = lifecycle-hook port (the platform posts ready/run/etc. here).
EXPOSE 8080 9000
CMD ["node", "app.js"]
