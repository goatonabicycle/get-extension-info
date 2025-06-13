const { setupBrowser, extractVersion, extractUserCount, extractSizeFromText, extractDateFromText, formatExtensionData } = require('./utils');

async function fetchOperaExtensionInfo(extensionId) {
  const { createPage, cleanup } = await setupBrowser();
  let extensionData = null;

  try {
    const page = await createPage('opera');
    const url = `https://addons.opera.com/en/extensions/details/${extensionId}/`;

    await page.goto(url, {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 60000,
    });

    await page.waitForSelector("h1", { timeout: 30000 });

    extensionData = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent.trim() : null;
      };

      const getVersion = () => {
        const versionEl = Array.from(document.querySelectorAll("div")).find(
          (el) => el.textContent.includes("Version"),
        );
        return versionEl ? versionEl.textContent : null;
      };

      const getUsers = () => {
        const userEl = Array.from(document.querySelectorAll("div")).find(
          (el) =>
            el.textContent.includes("users") &&
            el.textContent.match(/\d+,?\d+,?\d+,?\d+/),
        );
        return userEl ? userEl.textContent : null;
      };

      const getSize = () => {
        const sizeEl = Array.from(document.querySelectorAll("div")).find((el) =>
          el.textContent.includes("Size"),
        );
        return sizeEl ? sizeEl.textContent : null;
      };

      const getLastUpdated = () => {
        const updatedLabels = Array.from(document.querySelectorAll("div")).filter(el =>
          el.textContent.trim() === "Updated" ||
          el.textContent.includes("Last updated") ||
          el.textContent.includes("Updated:") ||
          el.textContent.includes("Last Updated")
        );

        if (updatedLabels.length > 0) {
          const label = updatedLabels[0];
          const parent = label.parentElement;
          if (parent) {
            const siblings = Array.from(parent.children);
            const labelIndex = siblings.indexOf(label);
            if (labelIndex >= 0 && labelIndex + 1 < siblings.length) {
              return siblings[labelIndex + 1].textContent.trim();
            }
          }
        }

        const dateElements = Array.from(document.querySelectorAll("div")).filter(el => {
          const text = el.textContent.trim();
          return /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/.test(text) ||
            /\b\d{1,2}\/\d{1,2}\/\d{4}\b/.test(text);
        });

        return dateElements.length > 0 ? dateElements[0].textContent.trim() : null;
      };

      return {
        extension: getText("h1"),
        version: getVersion(),
        users: getUsers(),
        size: getSize(),
        lastUpdated: getLastUpdated(),
        url: window.location.href,
      };
    });

    if (extensionData) {
      extensionData.version = extractVersion(extensionData.version);
      extensionData.users = extractUserCount(extensionData.users);
      extensionData.size = extractSizeFromText(extensionData.size);
      extensionData.lastUpdated = extractDateFromText(extensionData.lastUpdated);
    }

    return formatExtensionData(extensionData);
  } catch (err) {
    console.error(`Error fetching Opera extension ${extensionId}:`, err);
    throw new Error(`Failed to fetch extension info: ${err.message}`);
  } finally {
    await cleanup();
  }
}

module.exports = {
  fetchOperaExtensionInfo
};
