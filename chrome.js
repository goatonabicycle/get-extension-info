const {
	setupBrowser,
	extractVersion,
	extractUserCount,
	extractSizeFromText,
	extractDateFromText,
	formatExtensionData,
} = require("./utils");

async function fetchChromeExtensionInfo(extensionId) {
	const { createPage, cleanup } = await setupBrowser();
	let extensionData = null;

	try {
		const page = await createPage("chrome");
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
				const updatedLabels = Array.from(
					document.querySelectorAll("div"),
				).filter(
					(el) =>
						el.textContent.trim() === "Updated" ||
						el.textContent.includes("Last updated") ||
						el.textContent.includes("Updated:"),
				);

				if (updatedLabels.length > 0) {
					const dateElement =
						updatedLabels[0].nextElementSibling ||
						updatedLabels[0].parentElement?.nextElementSibling;

					if (dateElement) {
						return dateElement.textContent.trim();
					}
				}

				const dateElements = Array.from(
					document.querySelectorAll("div"),
				).filter((el) => {
					const text = el.textContent || "";
					return (
						(text.includes("Updated") || text.includes("Published")) &&
						/January|February|March|April|May|June|July|August|September|October|November|December/.test(
							text,
						)
					);
				});

				if (dateElements.length > 0) {
					return dateElements[0].textContent.trim();
				}

				return null;
			};

			return {
				extension: getText("h1"),
				lastUpdatedText: getLastUpdated(),
				versionText: getVersion(),
				usersText: getUsers(),
				sizeText: getSize(),
				url: window.location.href,
			};
		});

		const extractedData = {
			extension: extensionData.extension,
			lastUpdated: extractDateFromText(extensionData.lastUpdatedText),
			version: extractVersion(extensionData.versionText),
			users: extractUserCount(extensionData.usersText),
			size: extractSizeFromText(extensionData.sizeText),
			url: extensionData.url,
		};

		return formatExtensionData(extractedData);
	} catch (error) {
		console.error(`Error fetching Chrome extension ${extensionId}:`, error);
		throw error;
	} finally {
		await cleanup();
	}
}

module.exports = {
	fetchChromeExtensionInfo,
};
