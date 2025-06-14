const { fetchOperaExtensionInfo } = require('../opera');

describe('Opera Extensions', () => {
  describe('API', () => {
    test('Can extract Adblock Plus Opera extension data', async () => {
      const extensionId = "adblock-plus";
      const extensionData = await fetchOperaExtensionInfo(extensionId);

      expect(extensionData.extension).toBeTruthy();
      expect(extensionData.extension).toContain('Adblock Plus');
      expect(extensionData.version).toMatch(/^\d+\.\d+(\.\d+)?$/);
      expect(typeof extensionData.users).toBe('number');
      expect(extensionData.users).toBeGreaterThan(10000);
      expect(extensionData.lastUpdated).toBeTruthy();
      expect(extensionData.url).toContain('addons.opera.com');

      console.log('Opera Adblock Plus Extension Data:', extensionData);
    }, 90000);
  });

  describe('Web Pages', () => {
    async function fetchOperaExtensionPage(extensionId) {
      const url = `https://addons.opera.com/en/extensions/details/${extensionId}/`;

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

    test('Adblock Plus page exists', async () => {
      const page = await fetchOperaExtensionPage('adblock-plus');
      expect(page.statusCode).toBe(200);
      expect(page.data).toContain('Adblock Plus');
    }, 30000);
  });
});
