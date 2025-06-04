test('Extracts version number from text', () => {
  const getVersion = (text) => {
    return text.match(/\d+\.\d+\.\d+/)?.[0] || null;
  };

  expect(getVersion('Version: 4.46.0')).toBe('4.46.0');
  expect(getVersion('Current version is 1.2.3')).toBe('1.2.3');
  expect(getVersion('No version here')).toBe(null);
});

test('Extracts user count from text', () => {
  const getUserCount = (text) => {
    const match = text.match(/(\d+,?\d+,?\d+,?\d+)/);
    return match ? match[1] : null;
  };

  expect(getUserCount('10,000,000+ users')).toBe('10,000,000');
  expect(getUserCount('5,000+ users')).toBe('5,000');
  expect(getUserCount('No users here')).toBe(null);
});
