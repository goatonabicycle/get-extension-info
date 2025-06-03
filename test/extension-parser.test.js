/**
 * A simple test for extracting extension information
 */

test('Extracts version number from text', () => {
  // This mimics the version extraction logic from index.js
  const getVersion = (text) => {
    return text.match(/\d+\.\d+\.\d+/)?.[0] || null;
  };
  
  // Test cases
  expect(getVersion('Version: 4.46.0')).toBe('4.46.0');
  expect(getVersion('Current version is 1.2.3')).toBe('1.2.3');
  expect(getVersion('No version here')).toBe(null);
});

test('Extracts user count from text', () => {
  // This mimics the user count extraction logic from index.js
  const getUserCount = (text) => {
    const match = text.match(/(\d+,?\d+,?\d+,?\d+)/);
    return match ? match[1] : null;
  };
  
  // Test cases
  expect(getUserCount('10,000,000+ users')).toBe('10,000,000');
  expect(getUserCount('5,000+ users')).toBe('5,000');
  expect(getUserCount('No users here')).toBe(null);
});
