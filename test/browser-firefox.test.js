const { fetchFirefoxExtensionInfo } = require('../firefox-api');

describe('Firefox Extensions', () => {
  describe('API', () => {
    test('Can extract AdBlock Firefox extension data', async () => {
      const slug = "adblock-for-firefox";
      const extensionData = await fetchFirefoxExtensionInfo(slug);

      expect(extensionData.extension).toBeTruthy();
      expect(extensionData.extension).toContain('AdBlock');
      expect(extensionData.version).toMatch(/^\d+\.\d+(\.\d+)?$/);
      expect(typeof extensionData.users).toBe('number');
      expect(extensionData.users).toBeGreaterThan(10000);
      expect(extensionData.lastUpdated).toBeTruthy();
      expect(extensionData.url).toContain('addons.mozilla.org');

      console.log('Firefox AdBlock Extension Data:', extensionData);
    }, 90000);

    test('Can extract Adblock Plus Firefox extension data', async () => {
      const slug = "adblock-plus";
      const extensionData = await fetchFirefoxExtensionInfo(slug);

      expect(extensionData.extension).toBeTruthy();
      expect(extensionData.extension).toContain('Adblock Plus');
      expect(extensionData.version).toMatch(/^\d+\.\d+(\.\d+)?$/);
      expect(typeof extensionData.users).toBe('number');
      expect(extensionData.users).toBeGreaterThan(10000);
      expect(extensionData.lastUpdated).toBeTruthy();
      expect(extensionData.url).toContain('addons.mozilla.org');

      console.log('Firefox Adblock Plus Extension Data:', extensionData);
    }, 90000);
  });

  describe('Web Pages', () => {
    async function fetchFirefoxExtensionPage(slug) {
      const url = `https://addons.mozilla.org/en-US/firefox/addon/${slug}/`;

      try {
        const response = await fetch(url);
        return {
          statusCode: response.status,
          url,
          data: await response.text()
        };
      } catch (error) {
        throw new Error(`Failed to fetch extension page: ${error.message}`);
      }
    }

    test('Can access Firefox extension pages', async () => {
      const adblockInfo = await fetchFirefoxExtensionPage('adblock-for-firefox');
      const adblockPlusInfo = await fetchFirefoxExtensionPage('adblock-plus');

      expect(adblockInfo.statusCode).toBe(200);
      expect(adblockPlusInfo.statusCode).toBe(200);

      expect(adblockInfo.data).toContain('AdBlock');
      expect(adblockPlusInfo.data).toContain('Adblock Plus');

      expect(adblockInfo.data).toMatch(/version/i);
      expect(adblockPlusInfo.data).toMatch(/version/i);

      console.log('Firefox extension pages are accessible');
    }, 30000);
  });
});
