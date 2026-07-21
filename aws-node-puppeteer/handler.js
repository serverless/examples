import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const hello = async (event) => {
  const { url } = event.queryStringParameters;
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  const content = await page.evaluate(() => document.body.innerHTML);
  await browser.close();
  return {
    statusCode: 200,
    body: JSON.stringify({
      content,
    }),
  };
};
