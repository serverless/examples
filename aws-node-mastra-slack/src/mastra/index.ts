
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { storage } from './store';
import crypto from 'crypto';

import type { Context } from 'hono';
import { registerApiRoute } from '@mastra/core/server';

import bolt from "@slack/bolt";
import type { AgentGenerateOptions } from "@mastra/core/agent";

import { weatherAgent } from './agents/weather-agent';

const socketMode = process.env.SERVERLESS_LOCAL === "true";

const slackConfig: bolt.AppOptions = {
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode,
}

const boltApp = new bolt.App(slackConfig);

const eventHandler = async ({
  event,
  context,
  say,
}: {
  event: bolt.KnownEventFromType<"message">;
  context: bolt.Context;
  say: (params: bolt.SayArguments) => Promise<unknown>;
}) => {
  const isDM = event.channel_type === "im";

  const textMessage = (event as {text?: string}).text;
  const isMention = textMessage?.includes(`<@${context.botUserId}>`);

  const shouldRespond = isDM || isMention;

  if(shouldRespond) {
    const responseThreadId = "thread_ts" in event ? event.thread_ts : event.ts;
   
    const agentOptions: AgentGenerateOptions = {
      resourceId: context.botUserId || context.botId || "bot",
      threadId: responseThreadId!,
    };

    let responseMessage = "";

    try {
      const generateOptions = { ...agentOptions, output: undefined }
      const result = await weatherAgent.generate(textMessage!, generateOptions)
      responseMessage = result.text;
    } catch (error) {
      responseMessage = `Error occurred while calling Agent: ${(error as Error).message}`
    }

    await say({
      text: responseMessage,
      thread_ts: responseThreadId,
    })
  }

}

boltApp.event("message", eventHandler);

const verifySlackSignature = async (c: Context) => {
  const slackTimestamp = c.req.header("x-slack-request-timestamp");
  const slackSignature = c.req.header("x-slack-signature");
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;

  if (!slackTimestamp || Number(slackTimestamp) < fiveMinutesAgo)
    return false;

  const sigBasestring = `v0:${slackTimestamp}:${await c.req.text()}`;
  const hmac = crypto.createHmac("sha256", slackConfig.signingSecret!);
  hmac.update(sigBasestring);
  const mySignature = `v0=${hmac.digest("hex")}`;
  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(slackSignature!),
  );
}

const requestHandler = async (c: Context) => {
  const body = await c.req.json();

  // Verify slack signature before we continue
  if(!(await verifySlackSignature(c))) {
    return c.json({ error: 'Invalid Slack signature' }, 401);
  }

  if(body.type === 'url_verification') {
    return c.json({challenge: body.challenge})
  }

  let ackCalled = false;
  let ackResponse: Response | undefined;
  const ackFn = async (response?: unknown) => {
    if(ackCalled) {
      return;
    }

    ackCalled = true;

    if(response instanceof Error) {
      ackResponse = c.json({error: response.message}, 500)
    } else if (!response) {
      ackResponse = c.text("")
    } else {
      ackResponse = c.json(response)
    }
  }

  if (body.type === 'event_callback') {
    const response = c.json({status: 'ok'})

    const event: bolt.ReceiverEvent = {
      body,
      ack: ackFn,
    }

    boltApp.processEvent(event).catch((error) => {
      console.error("Error processing event", error)
    })

    return response;
  } else {
    return ackResponse || c.json({status: 'ok'})
  }
}

const apiRoutes = socketMode ? [] : [
  registerApiRoute('/slack',{
    method: 'POST',
    handler: requestHandler
  })
]

export const mastra = new Mastra({
  agents: { weatherAgent },
  storage: storage,
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
    host: '0.0.0.0',
    apiRoutes
  }
});
 
if(socketMode) {
  await boltApp.start();
}