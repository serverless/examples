import type { Handler } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

process.on('unhandledRejection', (reason) => {
  console.error(reason);
});

process.on('uncaughtException', (reason) => {
  console.error(reason);
});

let cachedHandler: Handler;

async function bootstrap(): Promise<Handler> {
  const expressApp = express();
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  await nestApp.init();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event, context) => {
  cachedHandler = cachedHandler ?? (await bootstrap());
  // @codegenie/serverless-express v5's handler is Promise-based and never
  // invokes this callback (see configure.js: `async function handler (event, context)`),
  // but its aws-lambda `Handler` type still requires 3 args at the call site.
  // Our own Lambda entry point above must stay 2-arg: nodejs24.x's runtime
  // detects 3-arg (event, context, callback) handlers as legacy callback-style
  // and throws Runtime.CallbackHandlerDeprecated.
  return cachedHandler(event, context, () => {});
};
