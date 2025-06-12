const { formatExtensionData } = require('./utils');

function extractFirefoxExtensionData(jsonData, slug) {
  return {
    extension: jsonData.name.en || jsonData.name['en-US'] || jsonData.name,
    lastUpdated: jsonData.last_updated,
    version: jsonData.current_version?.version,
    users: jsonData.average_daily_users,
    size: jsonData.current_version?.file?.size,
    url: `https://addons.mozilla.org/en-US/firefox/addon/${slug}/`
  };
}

async function fetchFirefoxExtensionInfo(slug) {
  const apiUrl = `https://addons.mozilla.org/api/v5/addons/addon/${slug}/`;
  console.log(`Fetching from API: ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }); console.log(`Status code: ${response.status}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error: ${response.status} - ${errorText}`);
    }
    const jsonData = await response.json();

    const extensionData = extractFirefoxExtensionData(jsonData, slug);

    return formatExtensionData(extensionData);
  } catch (err) {
    console.error(`Error fetching Firefox extension ${slug}:`, err);
    throw new Error(`Failed to fetch extension info: ${err.message}`);
  }
}

module.exports = {
  fetchFirefoxExtensionInfo
};
