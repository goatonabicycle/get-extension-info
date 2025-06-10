const { setupBrowser } = require('./utils');

async function fetchChromeExtensionInfo(extensionId) {
  const { createPage, cleanup } = await setupBrowser();
  let extensionData = null;
  try {
    const page = await createPage('chrome');
    const url = `https://chromewebstore.google.com/detail/${extensionId}`;

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
        return versionEl
          ? versionEl.textContent.match(/\d+\.\d+\.\d+/)?.[0]
          : null;
      };

      const getUsers = () => {
        const userEl = Array.from(document.querySelectorAll("div")).find(
          (el) =>
            el.textContent.includes("users") &&
            el.textContent.match(/\d+,?\d+,?\d+,?\d+/),
        );
        if (!userEl) return null;
        const match = userEl.textContent.match(/(\d+,?\d+,?\d+,?\d+)/);
        return match ? Number.parseInt(match[1].replace(/,/g, "")) : null;
      };

      const getSize = () => {
        const sizeEl = Array.from(document.querySelectorAll("div")).find((el) =>
          el.textContent.includes("Size"),
        );
        const sizeMatch = sizeEl
          ? sizeEl.textContent.match(/(\d+\.\d+)\s*([KMG]iB)/)
          : null;

        if (sizeMatch) {
          return `${sizeMatch[1]}${sizeMatch[2]}`; // Format as "5.50MiB" without space
        }
        return null;
      };

      const getLastUpdated = () => {
        const isValidDateText = (text) => {
          return /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/.test(text) &&
            /\b\d{4}\b/.test(text);
        };

        const updatedLabels = Array.from(document.querySelectorAll("div")).filter(el =>
          el.textContent.trim() === "Updated" ||
          el.textContent.includes("Last updated") ||
          el.textContent.includes("Updated:")
        );

        if (updatedLabels.length > 0) {
          const dateElement = updatedLabels[0].nextElementSibling ||
            updatedLabels[0].parentElement?.nextElementSibling;

          if (dateElement) {
            const dateText = dateElement.textContent.trim();
            if (isValidDateText(dateText)) {
              return dateText;
            }
          }
        }

        const dateElements = Array.from(document.querySelectorAll("div")).filter(el => {
          const text = el.textContent || "";
          return isValidDateText(text) &&
            (text.includes("Updated") || text.includes("Published"));
        });

        if (dateElements.length > 0) {
          const dateText = dateElements[0].textContent.trim();
          const dateMatch = dateText.match(/\b(?<month>January|February|March|April|May|June|July|August|September|October|November|December)\s+(?<day>\d{1,2}),?\s+(?<year>\d{4})\b/);

          if (dateMatch?.groups) {
            return `${dateMatch.groups.month} ${Number.parseInt(dateMatch.groups.day)}, ${dateMatch.groups.year}`;
          }
        }

        return null;
      };

      return {
        extension: getText("h1"),
        lastUpdated: getLastUpdated(),
        version: getVersion(),
        users: getUsers(),
        size: getSize(),
        url: window.location.href,
        lastChecked: new Date().toISOString(),
      };
    });

  } catch (error) {
    console.error(`Error fetching Chrome extension ${extensionId}:`, error);
    throw error;
  } finally {
    await cleanup();
  }

  return extensionData;
}

module.exports = {
  fetchChromeExtensionInfo
};
