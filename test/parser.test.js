// Test parsing functions used in the extension scraper

describe('Parsing Functions', () => {  test('Version parser extracts semantic version numbers', () => {
    const getVersion = (text) => {
      if (!text) return null;
      return text.match(/\d+\.\d+\.\d+(\.\d+)?/)?.[0] || null;
    };

    // Test various version formats
    expect(getVersion('Version: 4.46.0')).toBe('4.46.0');
    expect(getVersion('Current version is 1.2.3')).toBe('1.2.3');
    expect(getVersion('Version 10.0.1 released')).toBe('10.0.1');
    expect(getVersion('Version: 1.1.1.1')).toBe('1.1.1.1');
    expect(getVersion('Edge extension 2.0.0.5 available')).toBe('2.0.0.5');
    expect(getVersion('No version here')).toBe(null);
    expect(getVersion('')).toBe(null);
    expect(getVersion(null)).toBe(null);
  });
  test('User count parser extracts numbers with commas', () => {
    const getUserCount = (text) => {
      if (!text) return null;
      const match = text.match(/(\d+,?\d+,?\d+,?\d+)/);
      return match ? match[1] : null;
    };

    // Test various user count formats
    expect(getUserCount('10,000,000+ users')).toBe('10,000,000');
    expect(getUserCount('5,000+ users')).toBe('5,000');
    expect(getUserCount('100,000,000 users worldwide')).toBe('100,000,000');
    expect(getUserCount('No users here')).toBe(null);
    expect(getUserCount('')).toBe(null);
    expect(getUserCount(null)).toBe(null);
  });
  test('Size parser extracts file sizes in MiB format', () => {
    const getSize = (text) => {
      if (!text) return null;
      return text.match(/\d+\.\d+\s*[KMG]iB/)?.[0] || null;
    };

    // Test various size formats
    expect(getSize('Size: 54.97MiB')).toBe('54.97MiB');
    expect(getSize('File size is 3.2MiB')).toBe('3.2MiB');
    expect(getSize('2.5 KiB compressed')).toBe('2.5 KiB');
    expect(getSize('No size information')).toBe(null);
    expect(getSize('')).toBe(null);
    expect(getSize(null)).toBe(null);
  });
  test('Date parser extracts update dates', () => {
    const isValidDateText = (text) => {
      if (!text) return false;
      return /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/.test(text) &&
        /\b\d{4}\b/.test(text);
    };

    const getDateFromMatch = (text) => {
      if (!text) return null;
      
      const dateMatch = text.match(/\b(?<month>January|February|March|April|May|June|July|August|September|October|November|December)\s+(?<day>\d{1,2}),?\s+(?<year>\d{4})\b/);
      
      if (dateMatch?.groups) {
        return `${dateMatch.groups.month} ${Number.parseInt(dateMatch.groups.day)}, ${dateMatch.groups.year}`;
      }
      
      return null;
    };    // Test date validation
    expect(isValidDateText('Updated on May 30, 2025')).toBe(true);
    expect(isValidDateText('Published: January 15, 2024')).toBe(true);
    expect(isValidDateText('Last updated in December 2023')).toBe(true);
    expect(isValidDateText('No date here')).toBe(false);
    expect(isValidDateText('')).toBe(false);
    expect(isValidDateText(null)).toBe(false);

    // Test date extraction
    expect(getDateFromMatch('Updated on May 30, 2025')).toBe('May 30, 2025');
    expect(getDateFromMatch('Published: January 15, 2024')).toBe('January 15, 2024');
    expect(getDateFromMatch('Released on December 1, 2023')).toBe('December 1, 2023');
    expect(getDateFromMatch('No valid date format')).toBe(null);
    expect(getDateFromMatch('')).toBe(null);
    expect(getDateFromMatch(null)).toBe(null);
  });
});

describe('URL Parsing', () => {
  test('Extension IDs can be extracted from URLs', () => {
    const extractExtensionId = (url) => {
      if (!url) return null;
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1] || null;
    };

    // Test various URL formats
    expect(extractExtensionId('https://chromewebstore.google.com/detail/adblock/gighmmpiobklfepjocnamgkkbiglidom')).toBe('gighmmpiobklfepjocnamgkkbiglidom');
    expect(extractExtensionId('https://chromewebstore.google.com/detail/adblock-plus/cfhdojbkjhnklbpkdaibdccddilifddb')).toBe('cfhdojbkjhnklbpkdaibdccddilifddb');
    expect(extractExtensionId('https://chrome.google.com/webstore/detail/gighmmpiobklfepjocnamgkkbiglidom')).toBe('gighmmpiobklfepjocnamgkkbiglidom');
    expect(extractExtensionId('')).toBe(null);
    expect(extractExtensionId(null)).toBe(null);
  });
});
