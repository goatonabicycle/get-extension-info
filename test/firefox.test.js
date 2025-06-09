const { fetchFirefoxExtensionInfo } = require('../firefox-api');

describe('Firefox Extension API', () => {
  test('Can extract AdBlock Firefox extension data via API', async () => {
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

  test('Can extract Adblock Plus Firefox extension data via API', async () => {
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