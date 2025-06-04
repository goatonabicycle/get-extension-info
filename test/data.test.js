const fs = require('node:fs');
const path = require('node:path');

// Helper function to load test data
function loadTestData() {
  const latestDataPath = path.join(__dirname, '..', 'data', 'extension-latest.json');
  const historyDataPath = path.join(__dirname, '..', 'data', 'extension-history.json');

  // Make sure files exist first
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
    // Future stores will be added here (Firefox, Edge, etc.)
  });

  test('Latest data should have proper extension structure', () => {
    expect(latestData.chrome).toBeInstanceOf(Array);
    
    if (latestData.chrome.length > 0) {
      const extension = latestData.chrome[0];
      
      // Check required properties
      expect(extension).toHaveProperty('extension');
      expect(extension).toHaveProperty('lastUpdated');
      expect(extension).toHaveProperty('version');
      expect(extension).toHaveProperty('users');
      expect(extension).toHaveProperty('size');
      expect(extension).toHaveProperty('url');
      expect(extension).toHaveProperty('lastChecked');
      
      // Verify non-null values
      expect(extension.extension).toBeTruthy();
      expect(extension.lastUpdated).toBeTruthy();
      expect(extension.version).toBeTruthy();
      expect(extension.users).toBeTruthy();
      expect(extension.size).toBeTruthy();
      expect(extension.url).toBeTruthy();
      expect(extension.lastChecked).toBeTruthy();
    }
  });

  test('History data should have proper extension structure', () => {
    expect(historyData.chrome).toBeInstanceOf(Array);
    
    if (historyData.chrome.length > 0) {
      const extension = historyData.chrome[0];
      
      // Check required properties
      expect(extension).toHaveProperty('id');
      expect(extension).toHaveProperty('name');
      expect(extension).toHaveProperty('updates');
      expect(extension.updates).toBeInstanceOf(Array);
      
      // Verify non-null values
      expect(extension.id).toBeTruthy();
      expect(extension.name).toBeTruthy();
      expect(extension.updates.length).toBeGreaterThan(0);
      
      if (extension.updates.length > 0) {
        const update = extension.updates[0];
        
        // Check required properties in update
        expect(update).toHaveProperty('version');
        expect(update).toHaveProperty('users');
        expect(update).toHaveProperty('size');
        expect(update).toHaveProperty('lastUpdated');
        expect(update).toHaveProperty('recordedAt');
        
        // Verify non-null values
        expect(update.version).toBeTruthy();
        expect(update.users).toBeTruthy();
        expect(update.size).toBeTruthy();
        expect(update.lastUpdated).toBeTruthy();
        expect(update.recordedAt).toBeTruthy();
      }
    }
  });
});

describe('Data Format Validation', () => {
  let latestData;
  let historyData;

  beforeAll(() => {
    const data = loadTestData();
    latestData = data.latestData;
    historyData = data.historyData;
  });

  test('Version numbers should follow semantic versioning format', () => {
    // Test latest data version formats
    for (const extension of latestData.chrome) {
      expect(extension.version).toMatch(/^\d+\.\d+\.\d+$/);
      
      // Parse version numbers and verify they are valid
      const [major, minor, patch] = extension.version.split('.').map(Number);
      expect(Number.isInteger(major)).toBe(true);
      expect(Number.isInteger(minor)).toBe(true);
      expect(Number.isInteger(patch)).toBe(true);
    }
    
    // Test history data version formats
    for (const extension of historyData.chrome) {
      for (const update of extension.updates) {
        expect(update.version).toMatch(/^\d+\.\d+\.\d+$/);
        
        // Parse version numbers and verify they are valid
        const [major, minor, patch] = update.version.split('.').map(Number);
        expect(Number.isInteger(major)).toBe(true);
        expect(Number.isInteger(minor)).toBe(true);
        expect(Number.isInteger(patch)).toBe(true);
      }
    }
  });

  test('Date formats should be consistent and valid', () => {
    // Test latest data date formats
    for (const extension of latestData.chrome) {
      expect(extension.lastUpdated).toMatch(
        /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}$/
      );
      
      const dateObj = new Date(extension.lastChecked);
      expect(dateObj.toString()).not.toBe('Invalid Date');
    }
    
    // Test history data date formats
    for (const extension of historyData.chrome) {
      for (const update of extension.updates) {
        expect(update.lastUpdated).toMatch(
          /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}$/
        );
        
        const recordedAtDate = new Date(update.recordedAt);
        expect(recordedAtDate.toString()).not.toBe('Invalid Date');
      }
    }
  });

  test('URLs should have the correct format for Chrome Web Store', () => {
    for (const extension of latestData.chrome) {
      expect(extension.url).toMatch(
        /^https:\/\/chromewebstore\.google\.com\/detail\/.*\/[a-z]{32}$/
      );
    }
  });

  test('User counts should be positive integers', () => {
    for (const extension of latestData.chrome) {
      expect(typeof extension.users).toBe('number');
      expect(extension.users).toBeGreaterThan(0);
    }
    
    for (const extension of historyData.chrome) {
      for (const update of extension.updates) {
        expect(typeof update.users).toBe('number');
        expect(update.users).toBeGreaterThan(0);
      }
    }
  });

  test('Size should be in the correct format', () => {
    const sizeRegex = /^\d+\.\d+MiB$/;
    
    for (const extension of latestData.chrome) {
      expect(extension.size).toMatch(sizeRegex);
    }
    
    for (const extension of historyData.chrome) {
      for (const update of extension.updates) {
        expect(update.size).toMatch(sizeRegex);
      }
    }
  });
});

describe('Data Integrity', () => {
  let latestData;
  let historyData;

  beforeAll(() => {
    const data = loadTestData();
    latestData = data.latestData;
    historyData = data.historyData;
  });

  test('AdBlock extension data should be complete and valid', () => {
    const adblockId = 'gighmmpiobklfepjocnamgkkbiglidom';
    const storedAdblock = latestData.chrome.find(ext => ext.url.includes(adblockId));
    
    expect(storedAdblock).toBeDefined();
    expect(storedAdblock.extension).toBe('AdBlock — block ads across the web');
    expect(storedAdblock.users).toBeGreaterThan(10000000); // Should have millions of users
    
    // Check that history data exists and matches
    const adblockHistory = historyData.chrome.find(ext => ext.id === adblockId);
    expect(adblockHistory).toBeDefined();
    expect(adblockHistory.updates.length).toBeGreaterThan(0);
    
    // Verify latest version in history matches latest data
    const latestHistoryUpdate = adblockHistory.updates[adblockHistory.updates.length - 1];
    expect(latestHistoryUpdate.version).toBe(storedAdblock.version);
  });

  test('Adblock Plus extension data should be complete and valid', () => {
    const adblockPlusId = 'cfhdojbkjhnklbpkdaibdccddilifddb';
    const storedAdblockPlus = latestData.chrome.find(ext => ext.url.includes(adblockPlusId));
    
    expect(storedAdblockPlus).toBeDefined();
    expect(storedAdblockPlus.extension).toBe('Adblock Plus - free ad blocker');
    expect(storedAdblockPlus.users).toBeGreaterThan(10000000); // Should have millions of users
    
    // Check that history data exists and matches
    const adblockPlusHistory = historyData.chrome.find(ext => ext.id === adblockPlusId);
    expect(adblockPlusHistory).toBeDefined();
    expect(adblockPlusHistory.updates.length).toBeGreaterThan(0);
    
    // Verify latest version in history matches latest data
    const latestHistoryUpdate = adblockPlusHistory.updates[adblockPlusHistory.updates.length - 1];
    expect(latestHistoryUpdate.version).toBe(storedAdblockPlus.version);
  });

  test('History updates should be in chronological order', () => {
    for (const extension of historyData.chrome) {
      const updates = extension.updates;
      
      // Skip if there's only one update
      if (updates.length <= 1) continue;
      
      for (let i = 1; i < updates.length; i++) {
        const prevRecordedAt = new Date(updates[i-1].recordedAt);
        const currRecordedAt = new Date(updates[i].recordedAt);
        
        // Each update should have a recordedAt date later than or equal to the previous one
        expect(currRecordedAt.getTime()).toBeGreaterThanOrEqual(prevRecordedAt.getTime());
      }
    }
  });
});

describe('Latest and History Data Consistency', () => {
  let latestData;
  let historyData;

  beforeAll(() => {
    const data = loadTestData();
    latestData = data.latestData;
    historyData = data.historyData;
  });

  test('All extensions in latest data should have history records', () => {
    for (const extension of latestData.chrome) {
      // Extract the extension ID from the URL
      const urlParts = extension.url.split('/');
      const extensionId = urlParts[urlParts.length - 1];
      
      // Find the corresponding history record
      const historyRecord = historyData.chrome.find(record => record.id === extensionId);
      
      expect(historyRecord).toBeDefined();
      expect(historyRecord.name).toBe(extension.extension);
    }
  });

  test('Latest data version should match most recent history version', () => {
    for (const extension of latestData.chrome) {
      // Extract the extension ID from the URL
      const urlParts = extension.url.split('/');
      const extensionId = urlParts[urlParts.length - 1];
      
      // Find the corresponding history record
      const historyRecord = historyData.chrome.find(record => record.id === extensionId);
      
      if (historyRecord && historyRecord.updates.length > 0) {
        // Get the most recent update from history
        const latestHistoryUpdate = historyRecord.updates[historyRecord.updates.length - 1];
        
        // The version in latest data should match the most recent version in history
        expect(extension.version).toBe(latestHistoryUpdate.version);
      }
    }
  });
});
