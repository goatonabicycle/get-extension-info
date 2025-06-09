const puppeteer = require("puppeteer");

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

module.exports = {
  setupBrowser
};
