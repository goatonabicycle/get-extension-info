const { setupBrowser } = require('./utils');

async function fetchGitLabReleases() {
  const { createPage, cleanup } = await setupBrowser();

  try {
    const page = await createPage();
    const url = 'https://gitlab.com/eyeo/browser-extensions-and-premium/extensions/extensions/-/releases';

    console.log(`Navigating to GitLab releases: ${url}`);
    await page.goto(url, {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 60000,
    });

    await page.waitForSelector('h2, .release-item, [data-testid="release-block"]', { timeout: 30000 });

    const releases = await page.evaluate(() => {
      const releases = [];

      const releaseHeaders = Array.from(document.querySelectorAll('h2, h3, .release-title, [data-testid*="release"]')).concat(
        Array.from(document.querySelectorAll('*')).filter(el => {
          const text = el.textContent || '';
          return text.match(/^(Adblock Plus|AdBlock)\s+\d+\.\d+\.\d+$/) ||
            text.match(/^(adblockplus|adblock)-\d+\.\d+\.\d+$/);
        })
      );

      for (const header of releaseHeaders) {
        const headerText = header.textContent.trim();

        const adblockPlusMatch = headerText.match(/^Adblock Plus\s+(\d+\.\d+\.\d+)$/);
        const adblockMatch = headerText.match(/^AdBlock\s+(\d+\.\d+\.\d+)$/);

        if (adblockPlusMatch || adblockMatch) {
          const extension = adblockPlusMatch ? 'adblockplus' : 'adblock';
          const version = (adblockPlusMatch || adblockMatch)[1];

          let releaseDate = null;
          let parent = header.parentElement;

          for (let i = 0; i < 5 && parent; i++) {
            const dateText = parent.textContent || '';
            const dateMatch = dateText.match(/(\d{4}-\d{2}-\d{2})|((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4})/);
            if (dateMatch) {
              releaseDate = dateMatch[0];
              break;
            }
            parent = parent.parentElement;
          }

          const timeElements = header.parentElement?.querySelectorAll('time') || [];
          for (const timeEl of timeElements) {
            if (timeEl.dateTime || timeEl.textContent.match(/\d{4}-\d{2}-\d{2}/)) {
              releaseDate = timeEl.dateTime || timeEl.textContent.match(/\d{4}-\d{2}-\d{2}/)[0];
            }
          }

          const existing = releases.find(r => r.extension === extension && r.version === version);
          if (!existing) {
            releases.push({
              extension,
              version,
              releaseDate,
              headerText,
              found: true
            });
          }
        }
      }

      return releases;
    });

    console.log('\n=== GitLab Releases Found ===');
    releases.forEach((release, i) => {
      console.log(`${i + 1}. ${release.extension} v${release.version} - ${release.releaseDate || 'No date found'}`);
      console.log(`   Header: "${release.headerText}"`);
    });

    if (releases.length === 0) {
      console.log('No releases found. Checking page structure...');

      // Debug: Show what we can find on the page
      const debugInfo = await page.evaluate(() => {
        const allHeaders = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.textContent.trim()).slice(0, 10);
        const releaseWords = Array.from(document.querySelectorAll('*')).filter(el =>
          el.textContent?.toLowerCase().includes('adblock')
        ).map(el => el.textContent.trim().substring(0, 100)).slice(0, 5);

        return { allHeaders, releaseWords };
      });

      console.log('Headers found:', debugInfo.allHeaders);
      console.log('Elements with "adblock":', debugInfo.releaseWords);
    }

    await cleanup();
    return releases;
  } catch (error) {
    console.error('Error fetching GitLab releases:', error);
    await cleanup();
    return [];
  }
}

function getLatestGitLabReleases(releases) {
  // Get latest version for each extension
  const adblockReleases = releases.filter(r => r.extension === 'adblock').sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
  const adblockPlusReleases = releases.filter(r => r.extension === 'adblockplus').sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

  return {
    adblock: adblockReleases[0] ? {
      version: adblockReleases[0].version,
      releaseDate: adblockReleases[0].releaseDate
    } : null,
    adblockplus: adblockPlusReleases[0] ? {
      version: adblockPlusReleases[0].version,
      releaseDate: adblockPlusReleases[0].releaseDate
    } : null
  };
}

if (require.main === module) {
  fetchGitLabReleases();
}

module.exports = {
  fetchGitLabReleases,
  getLatestGitLabReleases
};