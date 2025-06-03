const fs = require('node:fs');
const path = require('node:path');

test('extension-latest.json has valid structure', () => {
  const latestDataPath = path.join(__dirname, '..', 'data', 'extension-latest.json');
  const latestData = JSON.parse(fs.readFileSync(latestDataPath, 'utf8'));

  expect(typeof latestData).toBe('object');
});

test('extension-history.json has valid structure', () => {
  const historyDataPath = path.join(__dirname, '..', 'data', 'extension-history.json');
  const historyData = JSON.parse(fs.readFileSync(historyDataPath, 'utf8'));

  expect(typeof historyData).toBe('object');
});
