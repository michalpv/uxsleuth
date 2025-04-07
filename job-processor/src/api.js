const axios = require('axios');

async function browserlessLighthouse(url) {
  const postData = {
    url,
    config: {
      extends: "lighthouse:default",
      settings: {
        onlyCategories: [
          // "best practices",
          "performance",
          // "pwa",
          "seo"
        ]
      }
    }
  };

  try {
    const response = await axios.post(`https://chrome.browserless.io/stats?token=${process.env.BROWSERLESS_API_TOKEN}`, postData, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    throw new Error('Failed to get lighthouse report');
  }
}

module.exports = { browserlessLighthouse };