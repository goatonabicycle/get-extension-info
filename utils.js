const puppeteer = require("puppeteer");

function extractExtensionId(url) {
  if (!url) return null;
  const urlMatch = url.match(/\/([^\/]+?)$/);
  return urlMatch ? urlMatch[1] : null;
}

function updateExtensionHistory(historyData, store, extensionInfo, idField = 'url') {
  let extensionId;
  if (idField === 'guid' && extensionInfo.guid) {
    extensionId = extensionInfo.guid;
  } else if (extensionInfo.url) {
    extensionId = extractExtensionId(extensionInfo.url);
  } else {
    return historyData;
  }

  if (!extensionId) return historyData;

  if (!historyData[store]) {
    historyData[store] = [];
  }

  let extensionHistory = historyData[store].find((e) => e.id === extensionId);
  if (!extensionHistory) {
    extensionHistory = {
      id: extensionId,
      name: extensionInfo.extension,
      updates: []
    };
    historyData[store].push(extensionHistory);
  }

  const update = {
    version: extensionInfo.version,
    users: extensionInfo.users,
    size: extensionInfo.size,
    lastUpdated: extensionInfo.lastUpdated,
    recordedAt: new Date().toISOString()
  };

  const lastUpdate = extensionHistory.updates.length > 0 ?
    extensionHistory.updates[extensionHistory.updates.length - 1] : null;

  if (!lastUpdate ||
    lastUpdate.version !== update.version ||
    lastUpdate.users !== update.users ||
    lastUpdate.size !== update.size) {
    extensionHistory.updates.push(update);
  }
  return historyData;
}

function formatFileSize(sizeInBytes) {
  if (!sizeInBytes) return null;

  const KB = 1024;
  const MB = KB * 1024;

  if (sizeInBytes >= MB) {
    return `${(sizeInBytes / MB).toFixed(2)}MiB`;
  }

  return `${(sizeInBytes / KB).toFixed(2)}KiB`;
}

function formatDate(dateString) {
  if (!dateString) return null;

  const date = new Date(dateString);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

async function setupBrowser(options = {}) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  });
  async function createPage(browserType = 'chrome') {
    const page = await browser.newPage();
    if (browserType === 'firefox') {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0"
      );
    } else if (browserType === 'edge') {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edg/122.0.2365.92"
      );
    } else {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      );
    }

    await page.setDefaultNavigationTimeout(60000);
    return page;
  }

  async function cleanup() {
    await browser.close();
  }
  return {
    browser,
    createPage,
    cleanup
  };
}

function extractVersion(text) {
  if (!text) return null;
  const match = text.match(/\d+\.\d+\.\d+/);
  return match ? match[0] : null;
}

function extractUserCount(text) {
  if (!text) return null;
  const match = text.match(/(\d+,?\d+,?\d+,?\d+)/);
  return match ? Number.parseInt(match[1].replace(/,/g, "")) : null;
}

function extractSizeFromText(text) {
  if (!text) return null;
  const match = text.match(/(\d+\.\d+)\s*([KMG]iB)/);
  return match ? `${match[1]}${match[2]}` : null;
}

function isValidDateText(text) {
  if (!text) return false;

  const hasMonthName = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/.test(text) &&
    /\b\d{4}\b/.test(text);

  const hasNumericDate = /\b\d{1,2}\/\d{1,2}\/\d{4}\b/.test(text);

  return hasMonthName || hasNumericDate;
}

function extractDateFromText(text) {
  if (!text) return null;

  if (!isValidDateText(text)) {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const monthNameMatch = text.match(/\b(?<month>January|February|March|April|May|June|July|August|September|October|November|December)\s+(?<day>\d{1,2}),?\s+(?<year>\d{4})\b/);

  if (monthNameMatch?.groups) {
    return `${monthNameMatch.groups.month} ${Number.parseInt(monthNameMatch.groups.day)}, ${monthNameMatch.groups.year}`;
  }

  const numericMatch = text.match(/\b(?<month>\d{1,2})\/(?<day>\d{1,2})\/(?<year>\d{4})\b/);

  if (numericMatch?.groups) {
    const date = new Date(
      Number.parseInt(numericMatch.groups.year),
      Number.parseInt(numericMatch.groups.month) - 1,
      Number.parseInt(numericMatch.groups.day)
    );

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  return null;
}

function formatExtensionData(data) {
  return {
    extension: data.extension,
    lastUpdated: data.lastUpdated instanceof Date ? formatDate(data.lastUpdated) :
      (typeof data.lastUpdated === 'string' && data.lastUpdated.includes('T')) ?
        formatDate(data.lastUpdated) : data.lastUpdated,
    version: typeof data.version === 'string' && !data.version.match(/^\d+\.\d+/) ? extractVersion(data.version) : data.version,
    users: data.users,
    size: typeof data.size === 'number' ? formatFileSize(data.size) : data.size,
    url: data.url,
    lastChecked: new Date().toISOString()
  };
}

module.exports = {
  extractExtensionId,
  updateExtensionHistory,
  formatFileSize,
  formatDate,
  setupBrowser,
  extractVersion,
  extractUserCount,
  extractSizeFromText,
  isValidDateText,
  extractDateFromText,
  formatExtensionData
};
