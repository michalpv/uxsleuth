const { browserlessLighthouse } = require('./api');
const { BROWSER_WIDTH, BROWSER_HEIGHT, SCREENSHOT_MAX_HEIGHT } = require('./consts');

const systemPrompt =
`
# UX Designer Consultancy Guide for Web Developers

As a seasoned consultant in UI/UX design and front-end development, I bring a wealth of knowledge and best practices to the table. My expertise lies in providing thorough analyses, leveraging industry terminology, and offering actionable solutions to enhance the digital experience.

## Core Responsibilities

1. Deliver comprehensive evaluations of UI/UX elements and suggest strategic enhancements, integrating storytelling and real-world scenarios for a more relatable approach.
2. Conduct in-depth analysis of user interaction flow and accessibility standards, incorporating current industry trends and case studies for context.
3. Offer precise, actionable modifications and performance optimization recommendations, using descriptive visual imagery to clarify the suggested changes.
4. Engage in constructive conversations with clients to explain the impact of web development choices on user experience, using personal experiences and advanced techniques to add depth.

## Task

Upon receiving details regarding a client's website, engage constructively to provide insightful analyses and recommendations. Clients seek advice tailored to specific concerns or metrics they aim to improve, with a rationale behind each suggestion and its impact on the user journey.

## Format

Respond with Markdown formatting, excluding the \`\`\`markdown tag. Use only: \`code\`, **bold**, *italic*, # H1, ## H2, ### H3, ordered and unordered lists; refrain from using additional formatting elements. Also note that these elements are block-level and each will be rendered on a new line.
Go into as much depth in your analysis as possible.

## Categories for Detailed Analysis

The client will ask for an analysis on one of the following categories; respond only with analyses concerning that category.
Please think outside of the box; provide as much insight, (heavy) criticism, and suggestions as possible, including relevant data for reference if necessary. Make a 700 word detailed report for each:

### Layout, Content, and Relevance
### SEO
### Performance
### Security
### Accessibility
### User Flows

## Conclusion

My objective is to interpret client needs and provide clear, professional guidance. I am committed to delivering concise and focused advice tailored to enhance the design and function of their websites. My approach is both analytical and practical, aimed at elevating user experiences and website performance.
`;
// TODO: add points for user-flow later on

/*
README:

Here is a guideline for how runJob and this script works:

UX Sleuth returns a report segmented by "Categories". Each category consists of metrics; these are the points that the LLM will evaluate and
provide feedback on. Metrics are fed to the LLM to inform it what kind of response is expected.

Each category is given it's own thread. After the system prompt, subsequent user messages provide context (information from the crawl) and explicitly asks for an evaluation
given said context. The results are compiled in such a format that the frontend can parse and render for each category.

When writing the (asynchronous) contentGenerationFunction for each category, explicitly state which category is to be processed in the user prompt. Return the
context (the info gathered from crawling the site) and the content (the actual message content sent to OpenAI's chat completions API).
  Context types:
    - text: used for raw text (ex. Website title)
    - code: used for code-formatted text (ex. meta tags)
    - image: used for displaying images (ex. website screenshots passed to gpt4-vision-preview)
The contentGenerationFunction accepts a page parameter, which is an initialized puppeteer page that is already on the website. Since
contentGenerationFunction is executed for each category in succession, the page will be left in the state the previous category left it in.
*/

async function delay(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms)
  });
}

async function autoScroll(page) {
  // Returns height scrolled on the page, not exceeding SCREENSHOT_MAX_HEIGHT
  return await page.evaluate(async ({browserHeight, maxHeight}) => {
    return await new Promise((resolve, reject) => {
      let totalHeight = browserHeight;
      const distance = 100;
      const delay = 200; // Increase the delay if needed to allow for content loading

      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        // Check if we've reached the bottom of the dynamically loading content
        if (totalHeight >= scrollHeight || totalHeight >= maxHeight) {
          clearInterval(timer);
          resolve(totalHeight);
        }
      }, delay);
    });
  }, {browserHeight: BROWSER_HEIGHT, maxHeight: SCREENSHOT_MAX_HEIGHT});
}

async function scrollToTop(page) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
}

// Returns the relevant prompt content as an array see: https://platform.openai.com/docs/api-reference/chat/create#chat-create-messages
// Will be called in this order; so some metrics may wanted to be prompted first (if putting everything in one message thread, more expensive though).
const categories = [
  {
    name: "Layout, Content, and Relevance",
    freeModel: "gpt-4o", // Model to use for free reports. (Paid reports use gpt4-vision-preview, see runJobPremium)
    contentGenerationFunction: async (page) => {
      // Auto scroll to bottom of page (load all content)
      const scrollHeight = await autoScroll(page);
      await delay(2000); // Make sure all animated content gets loaded
      const screenshot = `data:image/png;base64,${await page.screenshot({
        encoding: 'base64',
        clip: {
          x: 0,
          y: 0,
          width: BROWSER_WIDTH,
          height: scrollHeight
        }
      })}`;

      await scrollToTop(page);

      return {
        context: [ // Info from the site to be rendered on the frontend for user's reference
          { type: "image", imageUrl: screenshot }
        ],
        content: [
          {
            role: "user",
            content: [
              { type: "input_text", text: "Attached I have included a screenshot of the webpage." },
              { type: "input_image", image_url: screenshot }
            ]
          }
        ]
      };
    },
  },
  {
    name: "SEO",
    freeModel: "gpt-4o",
    contentGenerationFunction: async (page) => {
      const MAX_ELEMENT = 10;
      const MAX_CONTENT_LENGTH = 150; // Ignore overly large content from all tags

      async function getMetaTags() {
        return await page.$$eval('meta', (elements, maxElement) => elements.map(e => e.outerHTML).slice(0, maxElement).join('\n'), MAX_ELEMENT);
      }

      async function getHeaders() {
        return (await page.$$eval('h1, h2, h3, h4, h5, h6', (elements, maxElement) => 
            elements.map(e => `${e.tagName.toLowerCase()} ${e.textContent.trim()}`).slice(0, maxElement).join('\n'),
            MAX_ELEMENT
          )
        );
      }

      async function getImageAlts() {
        return (await page.$$eval('img', (imgs, maxElement) => imgs.map(img => `src="${img.src}" alt="${img.alt}"`).slice(0, maxElement).join('\n'), MAX_ELEMENT));
      }

      // TODO: loading time metrics

      async function getStructuredData() {
        return (await page.$$eval('script[type="application/ld+json"]', (scripts, maxElement) => scripts.map(e => e.textContent).slice(0, maxElement).join('\n'), MAX_ELEMENT));
      }

      async function getLinks() {
        return (await page.$$eval('a', (anchors, maxElement) => anchors.map(anchor => `<a href="${anchor.href}">${anchor.textContent.trim()}</a>`).slice(0, maxElement).join('\n'), MAX_ELEMENT));
      }

      const title = await page.title();
      const url = page.url();

      const metaTags = await getMetaTags();
      const headers = await getHeaders();
      const imageAlts = await getImageAlts();
      const structuredData = await getStructuredData();
      const links = await getLinks();

      const seoText = `The website title is ${title}.
Website URL: ${url}
Meta tags embedded in the webpage:
${metaTags}
Headers present on the webpage:
${headers}
Image alts present on the webpage:
${imageAlts}
Structured data (from \`ld+json\` scripts) present on the webpage:
${structuredData}
Links present on the webpage:
${links}`;

      return {
        context: [], // Empty for frontend reference
        content: [
          {
            role: "user",
            content: [
              { type: "input_text", text: seoText }
            ]
          }
        ]
      };
    },
  },
  {
    name: "Accessibility",
    freeModel: "gpt-4o",
    contentGenerationFunction: async (page) => {
      await page.emulateVisionDeficiency('achromatopsia')
      const screenshot1 = `data:image/png;base64,${await page.screenshot({ encoding: 'base64' })}`;

      await page.emulateVisionDeficiency('deuteranopia');
      const screenshot2 = `data:image/png;base64,${await page.screenshot({ encoding: 'base64' })}`;

      await page.emulateVisionDeficiency('blurredVision');
      const screenshot3 = `data:image/png;base64,${await page.screenshot({ encoding: 'base64' })}`;

      return {
        context: [ // Info from the site to be rendered on the frontend for user's reference
          { type: "image", imageUrl: screenshot1 },
          { type: "image", imageUrl: screenshot2 },
          { type: "image", imageUrl: screenshot3 },
        ],
        content: [ // Using the new API format
          {
            role: "user",
            content: [
              { type: "input_text", text: "I have included screenshots of the webpage as viewed by visitors with different vision deficiencies:" },
              { type: "input_text", text: "1. Screenshot of webpage viewed with achromatopsia:" },
              { type: "input_image", image_url: screenshot1 },
              { type: "input_text", text: "2. Screenshot of webpage viewed with deuteranopia:" },
              { type: "input_image", image_url: screenshot2 },
              { type: "input_text", text: "3. Screenshot of webpage viewed with blurred vision:" },
              { type: "input_image", image_url: screenshot3 },
              { type: "input_text", text: "Please analyze the accessibility issues visible in these screenshots." }
            ]
          }
        ]
      };
    },
  },
];

module.exports = { systemPrompt, categories };