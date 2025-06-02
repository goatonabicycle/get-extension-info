const puppeteer = require("puppeteer");
const fs = require("node:fs").promises;
const path = require("node:path");

const EXTENSIONS = [
	"gighmmpiobklfepjocnamgkkbiglidom", // AdBlock
	"cfhdojbkjhnklbpkdaibdccddilifddb", // Adblock Plus
];

const LATEST_DATA_PATH = path.join(__dirname, "data", "extension-latest.json");
const HISTORY_DATA_PATH = path.join(
	__dirname,
	"data",
	"extension-history.json",
);

async function getExtensionInfo(extensionId) {
	const browser = await puppeteer.launch({
		headless: "new",
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
		executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
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
				const dateElements = Array.from(document.querySelectorAll("div")).filter((el) => {
					const text = el.textContent || "";
					return text.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/) &&
						text.match(/\b\d{4}\b/);
				});

				if (!dateElements.length) return null;

				const dateText = dateElements[0].textContent.trim();
				const dateMatch = dateText.match(/\b(?<month>January|February|March|April|May|June|July|August|September|October|November|December)\s+(?<day>\d{1,2}),\s+(?<year>\d{4})\b/);

				if (!dateMatch || !dateMatch.groups) return null;

				return `${dateMatch.groups.month} ${Number.parseInt(dateMatch.groups.day)}, ${dateMatch.groups.year}`;
			};

			return {
				extension: getText("h1"),
				lastUpdated: getLastUpdated(),
				version: getVersion(),
				users: getUsers(),
				size: getSize(),
				store: "chrome",
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
	let historyData = [];

	try {
		const historyContent = await fs.readFile(HISTORY_DATA_PATH, "utf8");
		const validJSON = historyContent.replace(/^\s*\/\/.*\r?\n/gm, "");
		historyData = JSON.parse(validJSON);
		console.log(`Loaded history data for ${historyData.length} extensions`);
	} catch (error) {
		console.log(
			"No existing history file found, checking for latest data to use as initial history",
		);

		try {
			const latestContent = await fs.readFile(LATEST_DATA_PATH, "utf8");
			const validJSON = latestContent.replace(/^\s*\/\/.*\r?\n/gm, "");
			const latestData = JSON.parse(validJSON);
			console.log(
				`Found latest data for ${latestData.length} extensions, using as initial history`,
			);

			for (let i = 0; i < latestData.length; i++) {
				const ext = latestData[i];
				if (ext.url) {
					const urlMatch = ext.url.match(/\/([^\/]+?)$/);
					const id = urlMatch ? urlMatch[1] : null;

					if (id) {
						historyData.push({
							id: id,
							name: ext.extension,
							updates: [
								{
									version: ext.version,
									users: ext.users,
									size: ext.size,
									store: ext.store || "chrome",
									lastUpdated: ext.lastUpdated,
									recordedAt: ext.lastChecked || new Date().toISOString(),
								},
							],
						});
					}
				}
			}

			console.log(
				`Initialized history with ${historyData.length} extensions from latest data`,
			);
		} catch (latestError) {
			console.log("No existing latest data file found either, starting fresh");
		}
	}

	const newLatestData = [];

	for (const extensionId of EXTENSIONS) {
		try {
			const extensionInfo = await getExtensionInfo(extensionId);
			newLatestData.push(extensionInfo);

			let extensionHistory = historyData.find((e) => e.id === extensionId);
			if (!extensionHistory) {
				extensionHistory = {
					id: extensionId,
					name: extensionInfo.extension,
					updates: [{
						version: extensionInfo.version,
						users: extensionInfo.users,
						size: extensionInfo.size,
						store: extensionInfo.store,
						lastUpdated: extensionInfo.lastUpdated,
						recordedAt: new Date().toISOString(),
					}],
				};
				historyData.push(extensionHistory);
				continue;
			}

			const lastUpdate =
				extensionHistory.updates[extensionHistory.updates.length - 1];

			if (
				lastUpdate.version !== extensionInfo.version ||
				lastUpdate.users !== extensionInfo.users ||
				lastUpdate.size !== extensionInfo.size
			) {
				extensionHistory.updates.push({
					version: extensionInfo.version,
					users: extensionInfo.users,
					size: extensionInfo.size,
					store: extensionInfo.store,
					lastUpdated: extensionInfo.lastUpdated,
					recordedAt: new Date().toISOString(),
				});
			}
		} catch (error) {
			console.error(`Error fetching info for ${extensionId}:`, error);
		}
	}

	await fs.mkdir(path.dirname(LATEST_DATA_PATH), { recursive: true });
	await fs.writeFile(LATEST_DATA_PATH, JSON.stringify(newLatestData, null, 2));
	await fs.writeFile(HISTORY_DATA_PATH, JSON.stringify(historyData, null, 2));

	console.log("Extension data updated");
}

main().catch(console.error);
