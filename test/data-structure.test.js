const fs = require('node:fs');
const path = require('node:path');

describe('Data folder structure', () => {
  test('Data folder exists', () => {
    const dataFolder = path.join(__dirname, '..', 'data');
    expect(fs.existsSync(dataFolder)).toBe(true);
  });

  test('Required data files exist', () => {
    const latestDataPath = path.join(__dirname, '..', 'data', 'extension-latest.json');
    const historyDataPath = path.join(__dirname, '..', 'data', 'extension-history.json');

    expect(fs.existsSync(latestDataPath)).toBe(true);
    expect(fs.existsSync(historyDataPath)).toBe(true);
  });
});

describe('Data structure validation', () => {
  let latestData;
  let historyData;

  beforeAll(() => {
    const latestDataPath = path.join(__dirname, '..', 'data', 'extension-latest.json');
    const historyDataPath = path.join(__dirname, '..', 'data', 'extension-history.json');

    latestData = JSON.parse(fs.readFileSync(latestDataPath, 'utf8'));
    historyData = JSON.parse(fs.readFileSync(historyDataPath, 'utf8'));
  });

  test('Latest data should be grouped by store', () => {
    expect(latestData).toHaveProperty('chrome');
    // TODO: Firefox vibes here soon.
  });

  test('Chrome store data should have the expected structure', () => {
    expect(latestData.chrome).toBeInstanceOf(Array); if (latestData.chrome.length > 0) {
      const sampleExtension = latestData.chrome[0];
      expect(sampleExtension).toHaveProperty('extension');
      expect(sampleExtension).toHaveProperty('lastUpdated');
      expect(sampleExtension.lastUpdated).not.toBeNull();
      expect(sampleExtension).toHaveProperty('version');
      expect(sampleExtension).toHaveProperty('users');
      expect(sampleExtension).toHaveProperty('size');
      expect(sampleExtension).toHaveProperty('url');
      expect(sampleExtension).toHaveProperty('lastChecked');
    }
  });

  test('History data should be grouped by store', () => {
    expect(historyData).toHaveProperty('chrome');
  });

  test('History data should contain proper extension records', () => {
    expect(historyData.chrome).toBeInstanceOf(Array);

    if (historyData.chrome && historyData.chrome.length > 0) {
      const sampleExtension = historyData.chrome[0];

      expect(sampleExtension).toHaveProperty('id');
      expect(sampleExtension).toHaveProperty('name');
      expect(sampleExtension).toHaveProperty('updates');
      expect(sampleExtension.updates).toBeInstanceOf(Array); if (sampleExtension.updates.length > 0) {
        const update = sampleExtension.updates[0];
        expect(update).toHaveProperty('version');
        expect(update).toHaveProperty('users');
        expect(update).toHaveProperty('size');
        expect(update).toHaveProperty('lastUpdated');
        expect(update.lastUpdated).not.toBeNull();
        expect(update).toHaveProperty('recordedAt');
      }
    }
  });
});
