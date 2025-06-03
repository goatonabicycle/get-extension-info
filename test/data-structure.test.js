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
