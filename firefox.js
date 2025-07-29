const { formatExtensionData, setupBrowser, extractDateFromText } = require('./utils');

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

async function getFirefoxWebDate(slug) {
  const { createPage, cleanup } = await setupBrowser();

  try {
    const page = await createPage('firefox');
    const url = `https://addons.mozilla.org/en-US/firefox/addon/${slug}/`;

    await page.goto(url, {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 60000,
    });

    const webDate = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll("*"));

      const lastUpdatedEl = allElements.find(el => {
        const text = el.textContent || "";
        return text.includes("Last updated") && (
          text.includes("days ago") ||
          text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/)
        );
      });

      if (lastUpdatedEl) {
        // Extract date from text like "Last updated21 days ago (Jul 8, 2025)"
        const dateMatch = lastUpdatedEl.textContent.match(/\(([A-Za-z]{3}\s+\d{1,2},\s+\d{4})\)/);
        if (dateMatch) {
          return dateMatch[1];
        }

        // Also try to extract from "Last updated X days ago (Jul 8, 2025)" format
        const dateMatch2 = lastUpdatedEl.textContent.match(/\(([A-Za-z]+\s+\d{1,2},\s+\d{4})\)/);
        if (dateMatch2) {
          return dateMatch2[1];
        }
      }

      return null;
    });

    await cleanup();
    return webDate;
  } catch (error) {
    console.error(`Error fetching web date for ${slug}:`, error);
    await cleanup();
    return null;
  }
}

async function fetchFirefoxExtensionInfo(slug) {
  const apiUrl = `https://addons.mozilla.org/api/v5/addons/addon/${slug}/`;
  console.log(`Fetching from API: ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    console.log(`Status code: ${response.status}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error: ${response.status} - ${errorText}`);
    }
    const jsonData = await response.json();

    const extensionData = extractFirefoxExtensionData(jsonData, slug);

    console.log(`Fetching web date for ${slug}...`);
    const webDate = await getFirefoxWebDate(slug);
    if (webDate) {
      const expandedDate = webDate.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/, (match) => {
        const months = {
          'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
          'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
          'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
        };
        return months[match] || match;
      });
      extensionData.lastUpdated = extractDateFromText(expandedDate) || extensionData.lastUpdated;
    }

    return formatExtensionData(extensionData);
  } catch (err) {
    console.error(`Error fetching Firefox extension ${slug}:`, err);
    throw new Error(`Failed to fetch extension info: ${err.message}`);
  }
}

module.exports = {
  fetchFirefoxExtensionInfo
};
