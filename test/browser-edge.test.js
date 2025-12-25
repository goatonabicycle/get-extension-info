const { fetchEdgeExtensionInfo } = require('../edge');

describe('Edge Extensions', () => {
  describe('API', () => {
    test('Can extract AdBlock Edge extension data', async () => {
      const extensionId = "ndcileolkflehcjpmjnfbnaibdcgglog";
      const extensionData = await fetchEdgeExtensionInfo(extensionId);

      expect(extensionData.extension).toBeTruthy();
      expect(extensionData.extension).toContain('AdBlock');
      expect(extensionData.version).toMatch(/^\d+\.\d+\.\d+(\.\d+)?$/);
      expect(typeof extensionData.users).toBe('number');
      expect(extensionData.users).toBeGreaterThan(10000);
      expect(extensionData.lastUpdated).toBeTruthy();
      expect(extensionData.url).toContain('microsoftedge.microsoft.com');

      console.log('Edge AdBlock Extension Data:', extensionData);
    }, 90000);

    test('Can extract Adblock Plus Edge extension data', async () => {
      const extensionId = "gmgoamodcdcjnbaobigkjelfplakmdhh";
      const extensionData = await fetchEdgeExtensionInfo(extensionId);

      expect(extensionData.extension).toBeTruthy();
      expect(extensionData.extension).toContain('Adblock Plus');
      expect(extensionData.version).toMatch(/^\d+\.\d+\.\d+(\.\d+)?$/);
      expect(typeof extensionData.users).toBe('number');
      expect(extensionData.users).toBeGreaterThan(10000);
      expect(extensionData.lastUpdated).toBeTruthy();
      expect(extensionData.url).toContain('microsoftedge.microsoft.com');

      console.log('Edge Adblock Plus Extension Data:', extensionData);
    }, 90000);
  });

  describe('Web Pages', () => {
    async function fetchEdgeExtensionPage(extensionId) {
      const url = `https://microsoftedge.microsoft.com/addons/detail/${extensionId}`;

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

    test('Can access Edge extension pages', async () => {
      const adblockId = "ndcileolkflehcjpmjnfbnaibdcgglog";
      const adblockPlusId = "gmgoamodcdcjnbaobigkjelfplakmdhh";

      const adblockInfo = await fetchEdgeExtensionPage(adblockId);
      const adblockPlusInfo = await fetchEdgeExtensionPage(adblockPlusId);

      expect(adblockInfo.statusCode).toBe(200);
      expect(adblockPlusInfo.statusCode).toBe(200);
      expect(adblockInfo.data).toContain('AdBlock');
      expect(adblockPlusInfo.data).toContain('Adblock Plus');

      console.log('Edge extension pages accessible:', {
        adblock: adblockInfo.statusCode,
        adblockPlus: adblockPlusInfo.statusCode
      });
    });
  });
});
