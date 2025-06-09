const https = require('node:https');

async function fetchFirefoxExtensionInfo(slug) {
  const apiUrl = `https://addons.mozilla.org/api/v5/addons/addon/${slug}/`;
  console.log(`Fetching from API: ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    console.log(`Status code: ${response.status}`); if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error: ${response.status} - ${errorText}`);
    }
    const jsonData = await response.json();
    const formattedData = {
      extension: jsonData.name.en || jsonData.name['en-US'] || jsonData.name,
      lastUpdated: formatDate(jsonData.last_updated),
      version: jsonData.current_version?.version,
      users: jsonData.average_daily_users,
      size: formatFileSize(jsonData.current_version?.file?.size),
      url: `https://addons.mozilla.org/en-US/firefox/addon/${slug}/`,
      lastChecked: new Date().toISOString()
    };

    return formattedData;
  } catch (err) {
    throw new Error(`Failed to fetch extension info: ${err.message}`);
  }
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

module.exports = {
  fetchFirefoxExtensionInfo
};

if (require.main === module) {
  async function main() {
    try {
      console.log('Fetching AdBlock for Firefox info...');
      const adblockInfo = await fetchFirefoxExtensionInfo('adblock-for-firefox');
      console.log(JSON.stringify(adblockInfo, null, 2));

      console.log('\nFetching Adblock Plus info...');
      const adblockPlusInfo = await fetchFirefoxExtensionInfo('adblock-plus');
      console.log(JSON.stringify(adblockPlusInfo, null, 2));
    } catch (error) {
      console.error('Error:', error);
    }
  }

  main();
}
