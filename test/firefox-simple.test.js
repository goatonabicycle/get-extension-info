// Basic test for Firefox extension structure
const https = require('node:https');

async function fetchFirefoxExtensionInfo(slug) {
  const url = `https://addons.mozilla.org/en-US/firefox/addon/${slug}/`;

  try {
    const response = await fetch(url);
    return {
      statusCode: response.status,
      url,
      data: await response.text()
    };
  } catch (error) {
    throw new Error(`Failed to fetch extension info: ${error.message}`);
  }
}

describe('Firefox Extension Structure', () => {
  test('Can access Firefox extension pages', async () => {
    const adblockInfo = await fetchFirefoxExtensionInfo('adblock-for-firefox');
    const adblockPlusInfo = await fetchFirefoxExtensionInfo('adblock-plus');

    expect(adblockInfo.statusCode).toBe(200);
    expect(adblockPlusInfo.statusCode).toBe(200);

    expect(adblockInfo.data).toContain('AdBlock');
    expect(adblockPlusInfo.data).toContain('Adblock Plus');

    expect(adblockInfo.data).toMatch(/version/i);
    expect(adblockPlusInfo.data).toMatch(/version/i);

    console.log('Firefox URLs are accessible');
  }, 30000);
});
