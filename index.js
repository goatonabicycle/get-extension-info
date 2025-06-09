const puppeteer = require("puppeteer");
const fs = require("node:fs").promises;
const path = require("node:path");
const { setupBrowser } = require("./browser");
const { extractExtensionId, updateExtensionHistory } = require("./utils");
const { fetchFirefoxExtensionInfo } = require("./firefox-api");

const CHROME_EXTENSIONS = [
	"gighmmpiobklfepjocnamgkkbiglidom", // AdBlock
	"cfhdojbkjhnklbpkdaibdccddilifddb", // Adblock Plus
];

const FIREFOX_EXTENSIONS = [
	{ slug: "adblock-for-firefox", guid: "jid1-NIfFY2CA8fy1tg@jetpack" },  // AdBlock
	{ slug: "adblock-plus", guid: "{d10d0bf8-f5b5-c8b4-a8b2-2b9879e08c5d}" },  // Adblock Plus
];

const LATEST_DATA_PATH = path.join(__dirname, "data", "extension-latest.json");
const HISTORY_DATA_PATH = path.join(
	__dirname,
	"data",
	"extension-history.json",
);


async function scrapeChromeExtension(page) {
	return await page.evaluate(() => {
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
			return sizeEl
				? sizeEl.textContent.match(/\d+\.\d+\s*[KMG]iB/)?.[0]
				: null;
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
}

async function fetchAllChromeExtensionsInfo() {
	const extensionsInfo = [];
	const { browser, createPage, cleanup } = await setupBrowser();

	try {
		for (const extensionId of CHROME_EXTENSIONS) {
			try {
				const page = await createPage();
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

				const extensionInfo = await scrapeChromeExtension(page);
				extensionsInfo.push(extensionInfo);
			} catch (error) {
				console.error(`Error fetching info for Chrome extension ${extensionId}:`, error);
			}
		}
	} finally {
		await cleanup();
	}
	return extensionsInfo;
}

async function fetchAllFirefoxExtensionsInfo() {
	const extensionsInfo = [];

	try {
		for (const extension of FIREFOX_EXTENSIONS) {
			try {
				console.log(`Fetching Firefox extension: ${extension.slug}`);
				const extensionInfo = await fetchFirefoxExtensionInfo(extension.slug);
				extensionsInfo.push(extensionInfo);
			} catch (error) {
				console.error(`Error fetching info for Firefox extension ${extension.slug}:`, error);
			}
		}
	} catch (error) {
		console.error("Error in fetchAllFirefoxExtensionsInfo:", error);
	}

	return extensionsInfo;
}

async function main() {
	let historyData = { chrome: [], firefox: [] };

	try {
		const historyContent = await fs.readFile(HISTORY_DATA_PATH, "utf8");
		const validJSON = historyContent.replace(/^\s*\/\/.*\r?\n/gm, "");
		historyData = JSON.parse(validJSON);
		console.log(`Loaded history data for ${Object.keys(historyData).length} stores`);
	} catch (error) {
		console.log(
			"No existing history file found, checking for latest data to use as initial history",
		);
		try {
			const latestContent = await fs.readFile(LATEST_DATA_PATH, "utf8");
			const validJSON = latestContent.replace(/^\s*\/\/.*\r?\n/gm, "");
			const latestData = JSON.parse(validJSON);

			const latestChromeExtensions = latestData.chrome || [];
			const latestFirefoxExtensions = latestData.firefox || [];

			console.log(
				`Found latest data for ${latestChromeExtensions.length} chrome extensions and ${latestFirefoxExtensions.length} firefox extensions, using as initial history`,
			);

			if (!historyData.chrome) {
				historyData.chrome = [];
			}

			for (let i = 0; i < latestChromeExtensions.length; i++) {
				const ext = latestChromeExtensions[i];
				if (ext.url) {
					const id = extractExtensionId(ext.url);

					if (id) {
						historyData.chrome.push({
							id: id,
							name: ext.extension,
							updates: [{
								version: ext.version,
								users: ext.users,
								size: ext.size,
								lastUpdated: ext.lastUpdated,
								recordedAt: ext.lastChecked || new Date().toISOString(),
							}],
						});
					}
				}
			}

			if (!historyData.firefox) {
				historyData.firefox = [];
			} for (let i = 0; i < latestFirefoxExtensions.length; i++) {
				const ext = latestFirefoxExtensions[i];
				const extId = extractExtensionId(ext.url);
				if (extId) {
					historyData.firefox.push({
						id: extId,
						name: ext.extension,
						updates: [{
							version: ext.version,
							users: ext.users,
							size: ext.size,
							lastUpdated: ext.lastUpdated,
							recordedAt: ext.lastChecked || new Date().toISOString(),
						}],
					});
				}
			}

			console.log(
				`Initialized history with ${historyData.chrome.length} Chrome extensions and ${historyData.firefox.length} Firefox extensions from latest data`,
			);
		} catch (latestError) {
			console.log("No existing latest data file found either, starting fresh");
		}
	}
	const newLatestData = { chrome: [], firefox: [] };

	const chromeExtensionsInfo = await fetchAllChromeExtensionsInfo(); newLatestData.chrome = chromeExtensionsInfo;

	for (const extensionInfo of chromeExtensionsInfo) {
		historyData = updateExtensionHistory(historyData, 'chrome', extensionInfo);
	}

	const firefoxExtensionsInfo = await fetchAllFirefoxExtensionsInfo();
	newLatestData.firefox = firefoxExtensionsInfo;
	for (const extensionInfo of firefoxExtensionsInfo) {
		historyData = updateExtensionHistory(historyData, 'firefox', extensionInfo, 'url');
	}

	await fs.mkdir(path.dirname(LATEST_DATA_PATH), { recursive: true });
	await fs.writeFile(LATEST_DATA_PATH, JSON.stringify(newLatestData, null, 2));
	await fs.writeFile(HISTORY_DATA_PATH, JSON.stringify(historyData, null, 2));

	console.log("Extension data updated for Chrome and Firefox");
}

main().catch(console.error);
