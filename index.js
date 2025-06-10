const fs = require("node:fs").promises;
const path = require("node:path");
const { extractExtensionId, updateExtensionHistory } = require("./utils");
const { fetchFirefoxExtensionInfo } = require("./firefox");
const { fetchChromeExtensionInfo } = require("./chrome");

const CHROME_EXTENSIONS = [
	"gighmmpiobklfepjocnamgkkbiglidom", // AdBlock
	"cfhdojbkjhnklbpkdaibdccddilifddb", // Adblock Plus
];

const FIREFOX_EXTENSIONS = [
	{ slug: "adblock-for-firefox" },  // AdBlock
	{ slug: "adblock-plus" },  // Adblock Plus
];

const LATEST_DATA_PATH = path.join(__dirname, "data", "extension-latest.json");
const HISTORY_DATA_PATH = path.join(
	__dirname,
	"data",
	"extension-history.json",
);

async function fetchAllChromeExtensionsInfo() {
	const extensionsInfo = [];

	for (const extensionId of CHROME_EXTENSIONS) {
		console.log(`Fetching Chrome extension: ${extensionId}`);
		const extensionInfo = await fetchChromeExtensionInfo(extensionId);
		extensionsInfo.push(extensionInfo);
	}

	return extensionsInfo;
}

async function fetchAllFirefoxExtensionsInfo() {
	const extensionsInfo = [];

	for (const extension of FIREFOX_EXTENSIONS) {

		console.log(`Fetching Firefox extension: ${extension.slug}`);
		const extensionInfo = await fetchFirefoxExtensionInfo(extension.slug);
		extensionsInfo.push(extensionInfo);
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
			}

			for (let i = 0; i < latestFirefoxExtensions.length; i++) {
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
