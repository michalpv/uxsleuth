// API key in env var OPENAI_API_KEY
const OpenAI = require('openai');
const puppeteer = require('puppeteer-core');
const { performance } = require('perf_hooks');
const { BROWSER_WIDTH, BROWSER_HEIGHT } = require('./consts');

const openai = new OpenAI();

const { systemPrompt, categories } = require('./prompts');

const MAX_TOKENS = 4096;

// DONT forget to await browser.close(); when totally finished.
async function initWebdriver(url) {
  // Note: launch arguments are provided to browserless via get parameters:
  const browserWSEndpoint = `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_TOKEN}&--window-size=${BROWSER_WIDTH},${BROWSER_HEIGHT}`;

  let browser;
  if (process.env.NODE_ENV === 'production') {
    browser = await puppeteer.connect({ browserWSEndpoint });
  } else {
    browser = await require('puppeteer').launch({
      executablePath: '/usr/bin/chromium',
      args: [
        `--window-size=${BROWSER_WIDTH},${BROWSER_HEIGHT}`,
        `--no-sandbox`
      ]
    });
  }

  const page = await browser.newPage();

  await page.setViewport({ width: BROWSER_WIDTH, height: BROWSER_HEIGHT });

  await page.goto(url);

  return { browser, page };
}

async function runJob(jobParameters) {
  const { url } = jobParameters;
  console.log(`Processing job: ${url}`);

  const start = performance.now();

  const { browser, page } = await initWebdriver(url);

  const results = [];
  for (const category of categories) {
    try {
      console.log(`Processing category: ${category.name}`);
      const { context, content } = await category.contentGenerationFunction(page);
      // TODO: optimization; run this completion asynchronously and start running the next contentGenerationFunction at the same time.
      const response = await openai.responses.create({
        model: category.freeModel,
        input: [
          {
            role: "system", 
            content: [
              { type: "input_text", text: systemPrompt }
            ]
          },
          {
            role: "user",
            content: [
              { type: "input_text", text: `Category: ${category.name}` }
            ]
          },
          ...content
        ]
      });
      
      console.log(response.output_text);

      results.push({
        category: category.name,
        context,
        response: response.output_text
      });
    } catch (err) {
      console.error('Error calling OpenAI API: ', err);
      // Cleanup
      await browser.close();
      throw new Error('Failed to process job');
    }
  }

  // Cleanup
  await browser.close();

  const end = performance.now();

  return {
    url,
    processingTime : `${((end - start) / 1000).toFixed(2)}s`,
    results
  };
}

module.exports = { runJob };