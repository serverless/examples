const puppeteer = require('puppeteer');
const { getChrome } = require('./chrome-script');

module.exports.hello = async (event) => {
  const { url } = event.queryStringParameters;
  const chrome = await getChrome();
  const browser = await puppeteer.connect({
    browserWSEndpoint: chrome.endpoint,
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  const content = await page.evaluate(() => document.body.innerHTML);
  return {
    statusCode: 200,
    body: JSON.stringify({
      content,
    }),
  };
};
