const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const path = require("path");

const EXTENSIONS = [
  "gighmmpiobklfepjocnamgkkbiglidom", // AdBlock
  "cfhdojbkjhnklbpkdaibdccddilifddb", // Adblock Plus
];

async function getExtensionInfo(extensionId) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    );
    await page.setDefaultNavigationTimeout(60000);

    const url = `https://chrome.google.com/webstore/detail/${extensionId}`;
    console.log(`Navigating to: ${url}`);

    const response = await page.goto(url, {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 60000,
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to load page: ${response.status()} ${response.statusText()}`,
      );
    }

    await page.waitForSelector("h1", { timeout: 30000 });

    const extensionInfo = await page.evaluate(() => {
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
        return match ? parseInt(match[1].replace(/,/g, "")) : null;
      };

      const getSize = () => {
        const sizeEl = Array.from(document.querySelectorAll("div")).find((el) =>
          el.textContent.includes("Size"),
        );
        return sizeEl
          ? sizeEl.textContent.match(/\d+\.\d+\s*[KMG]iB/)?.[0]
          : null;
      };

      const getLastUpdated = () => {
        const dateEl = Array.from(document.querySelectorAll("div")).find((el) =>
          el.textContent.match(
            /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/,
          ),
        );
        if (!dateEl) return null;
        const match = dateEl.textContent.match(
          /\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4})\b/,
        );
        return match
          ? match[1].replace(/(\d+),/, (_, day) => parseInt(day) + ",")
          : null;
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

    return extensionInfo;
  } finally {
    await browser.close();
  }
}

async function main() {
  try {
    const dataDir = path.join(__dirname, "data");
    await fs.mkdir(dataDir, { recursive: true });

    const results = await Promise.all(
      EXTENSIONS.map(async (id) => {
        try {
          console.log(`\nScraping ${id}...`);
          const info = await getExtensionInfo(id);
          console.log("Successfully scraped");
          return info;
        } catch (error) {
          console.error(`Error scraping ${id}:`, error.message);
          return null;
        }
      }),
    );

    const validResults = results.filter(Boolean);
    if (validResults.length === 0) {
      throw new Error("Failed to scrape any extensions");
    }

    await fs.writeFile(
      path.join(dataDir, "extension-latest.json"),
      JSON.stringify(validResults, null, 2),
    );

    console.log("\nScript completed successfully");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
