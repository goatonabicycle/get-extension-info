const fs = require('node:fs');
const path = require('node:path');

function loadTestData() {
  const latestDataPath = path.join(__dirname, '..', 'data', 'extension-latest.json');
  const historyDataPath = path.join(__dirname, '..', 'data', 'extension-history.json');

  expect(fs.existsSync(latestDataPath)).toBe(true);
  expect(fs.existsSync(historyDataPath)).toBe(true);

  const latestData = JSON.parse(fs.readFileSync(latestDataPath, 'utf8'));
  const historyData = JSON.parse(fs.readFileSync(historyDataPath, 'utf8'));

  return { latestData, historyData };
}

describe('File System Structure', () => {
  test('Data folder exists with required files', () => {
    const dataFolder = path.join(__dirname, '..', 'data');
    expect(fs.existsSync(dataFolder)).toBe(true);

    const latestDataPath = path.join(dataFolder, 'extension-latest.json');
    const historyDataPath = path.join(dataFolder, 'extension-history.json');

    expect(fs.existsSync(latestDataPath)).toBe(true);
    expect(fs.existsSync(historyDataPath)).toBe(true);
  });
});

describe('Data Structure', () => {
  let latestData;
  let historyData;

  beforeAll(() => {
    const data = loadTestData();
    latestData = data.latestData;
    historyData = data.historyData;
  });

  test('JSON files should be valid objects', () => {
    expect(typeof latestData).toBe('object');
    expect(typeof historyData).toBe('object');
  });

  test('Data should be organized by store', () => {
    expect(latestData).toHaveProperty('chrome');
    expect(historyData).toHaveProperty('chrome');
    expect(latestData).toHaveProperty('firefox');
    expect(historyData).toHaveProperty('firefox');
    expect(latestData).toHaveProperty('edge');
    expect(historyData).toHaveProperty('edge');
    expect(latestData).toHaveProperty('opera');
    expect(historyData).toHaveProperty('opera');
  });

  test('Latest data should have proper extension structure', () => {
    expect(latestData.chrome).toBeInstanceOf(Array);

    if (latestData.chrome.length > 0) {
      const extension = latestData.chrome[0];

      expect(extension).toHaveProperty('extension');
      expect(extension).toHaveProperty('lastUpdated');
      expect(extension).toHaveProperty('version');
      expect(extension).toHaveProperty('users');
      expect(extension).toHaveProperty('size');
      expect(extension).toHaveProperty('url');
      expect(extension).toHaveProperty('lastChecked');

      expect(extension.extension).toBeTruthy();
      expect(extension.lastUpdated).toBeTruthy();
      expect(extension.version).toBeTruthy();
      expect(extension.users).toBeTruthy();
      expect(extension.size).toBeTruthy();
      expect(extension.url).toBeTruthy();
      expect(extension.lastChecked).toBeTruthy();
    }

    expect(latestData.firefox).toBeInstanceOf(Array);

    if (latestData.firefox.length > 0) {
      const extension = latestData.firefox[0];

      expect(extension).toHaveProperty('extension');
      expect(extension).toHaveProperty('lastUpdated');
      expect(extension).toHaveProperty('version');
      expect(extension).toHaveProperty('users');
      expect(extension).toHaveProperty('size');
      expect(extension).toHaveProperty('url');
      expect(extension).toHaveProperty('lastChecked');
    }

    expect(latestData.edge).toBeInstanceOf(Array);

    if (latestData.edge.length > 0) {
      const extension = latestData.edge[0];

      expect(extension).toHaveProperty('extension');
      expect(extension).toHaveProperty('lastUpdated');
      expect(extension).toHaveProperty('version');
      expect(extension).toHaveProperty('users');
      expect(extension).toHaveProperty('size');
      expect(extension).toHaveProperty('url');
      expect(extension).toHaveProperty('lastChecked');

      expect(extension.extension).toBeTruthy();
      expect(extension.lastUpdated).toBeTruthy();
      expect(extension.version).toBeTruthy();
      expect(extension.users).toBeTruthy();
      expect(extension.url).toBeTruthy();
      expect(extension.lastChecked).toBeTruthy();
    }

    expect(latestData.opera).toBeInstanceOf(Array);

    if (latestData.opera.length > 0) {
      const extension = latestData.opera[0];

      expect(extension).toHaveProperty('extension');
      expect(extension).toHaveProperty('lastUpdated');
      expect(extension).toHaveProperty('version');
      expect(extension).toHaveProperty('users');
      expect(extension).toHaveProperty('size');
      expect(extension).toHaveProperty('url');
      expect(extension).toHaveProperty('lastChecked');

      expect(extension.extension).toBeTruthy();
      expect(extension.lastUpdated).toBeTruthy();
      expect(extension.version).toBeTruthy();
      expect(extension.users).toBeTruthy();
      expect(extension.url).toBeTruthy();
      expect(extension.lastChecked).toBeTruthy();
    }
  });

  test('History data should have proper extension structure', () => {
    expect(historyData.chrome).toBeInstanceOf(Array);

    if (historyData.chrome.length > 0) {
      const extension = historyData.chrome[0];

      expect(extension).toHaveProperty('id');
      expect(extension).toHaveProperty('name');
      expect(extension).toHaveProperty('updates');
      expect(extension.updates).toBeInstanceOf(Array);

      expect(extension.id).toBeTruthy();
      expect(extension.name).toBeTruthy();
      expect(extension.updates.length).toBeGreaterThan(0);

      if (extension.updates.length > 0) {
        const update = extension.updates[0];

        expect(update).toHaveProperty('version');
        expect(update).toHaveProperty('users');
        expect(update).toHaveProperty('size');
        expect(update).toHaveProperty('lastUpdated');
        expect(update).toHaveProperty('recordedAt');
        expect(update.version).toBeTruthy();
        expect(update.users).toBeTruthy();
        if (extension.id !== 'ndcileolkflehcjpmjnfbnaibdcgglog' &&
          extension.id !== 'gmgoamodcdcjnbaobigkjelfplakmdhh') {
          expect(update.size).toBeTruthy();
        }
        expect(update.lastUpdated).toBeTruthy();
        expect(update.recordedAt).toBeTruthy();
      }
    }

    expect(historyData.firefox).toBeInstanceOf(Array);

    if (historyData.firefox.length > 0) {
      const extension = historyData.firefox[0];

      expect(extension).toHaveProperty('id');
      expect(extension).toHaveProperty('name');
      expect(extension).toHaveProperty('updates');
      expect(extension.updates).toBeInstanceOf(Array);

      expect(extension.id).toBeTruthy();
      expect(extension.name).toBeTruthy();
      expect(extension.updates.length).toBeGreaterThan(0);

      if (extension.updates.length > 0) {
        const update = extension.updates[0];

        expect(update).toHaveProperty('version');
        expect(update).toHaveProperty('users');
        expect(update).toHaveProperty('size');
        expect(update).toHaveProperty('lastUpdated');
        expect(update).toHaveProperty('recordedAt');

        expect(update.version).toBeTruthy();
        expect(update.users).toBeTruthy();
        expect(update.size).toBeTruthy();
        expect(update.lastUpdated).toBeTruthy();
        expect(update.recordedAt).toBeTruthy();
      }
    }

    expect(historyData.edge).toBeInstanceOf(Array);

    if (historyData.edge.length > 0) {
      const extension = historyData.edge[0];

      expect(extension).toHaveProperty('id');
      expect(extension).toHaveProperty('name');
      expect(extension).toHaveProperty('updates');
      expect(extension.updates).toBeInstanceOf(Array);

      expect(extension.id).toBeTruthy();
      expect(extension.name).toBeTruthy();
      expect(extension.updates.length).toBeGreaterThan(0);

      if (extension.updates.length > 0) {
        const update = extension.updates[0];

        expect(update).toHaveProperty('version');
        expect(update).toHaveProperty('users');
        expect(update).toHaveProperty('size');
        expect(update).toHaveProperty('lastUpdated');
        expect(update).toHaveProperty('recordedAt'); expect(update.version).toBeTruthy();
        expect(update.users).toBeTruthy();

        // Edge extensions may have null size
        if (extension.id !== 'ndcileolkflehcjpmjnfbnaibdcgglog' &&
          extension.id !== 'gmgoamodcdcjnbaobigkjelfplakmdhh') {
          expect(update.size).toBeTruthy();
        }
        expect(update.lastUpdated).toBeTruthy();
        expect(update.recordedAt).toBeTruthy();
      }
    }

    expect(historyData.opera).toBeInstanceOf(Array);

    if (historyData.opera.length > 0) {
      const extension = historyData.opera[0];

      expect(extension).toHaveProperty('id');
      expect(extension).toHaveProperty('name');
      expect(extension).toHaveProperty('updates');
      expect(extension.updates).toBeInstanceOf(Array);

      expect(extension.id).toBeTruthy();
      expect(extension.name).toBeTruthy();
      expect(extension.updates.length).toBeGreaterThan(0);

      if (extension.updates.length > 0) {
        const update = extension.updates[0];

        expect(update).toHaveProperty('version');
        expect(update).toHaveProperty('users');
        expect(update).toHaveProperty('size');
        expect(update).toHaveProperty('lastUpdated');
        expect(update).toHaveProperty('recordedAt');
        expect(update.version).toBeTruthy();
        expect(update.users).toBeTruthy();
        expect(update.lastUpdated).toBeTruthy();
        expect(update.recordedAt).toBeTruthy();
      }
    }
  });
});
