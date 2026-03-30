const { fetchChromeExtensionInfo } = require("../chrome");

describe("Chrome Extensions", () => {
	describe("API", () => {
		test("Can extract AdBlock Chrome extension data", async () => {
			const extensionId = "gighmmpiobklfepjocnamgkkbiglidom";
			const extensionData = await fetchChromeExtensionInfo(extensionId);
			expect(extensionData.extension).toBeTruthy();
			expect(extensionData.extension).toContain("AdBlock");
			expect(extensionData.version).toMatch(/^\d+\.\d+\.\d+(\.\d+)?$/);
			expect(typeof extensionData.users).toBe("number");
			expect(extensionData.users).toBeGreaterThan(10000);
			expect(extensionData.lastUpdated).toBeTruthy();
			expect(extensionData.url).toContain("chromewebstore.google.com");
			console.log("Chrome AdBlock Extension Data:", extensionData);
		}, 90000);

		test("Can extract Adblock Plus Chrome extension data", async () => {
			const extensionId = "cfhdojbkjhnklbpkdaibdccddilifddb";
			const extensionData = await fetchChromeExtensionInfo(extensionId);
			expect(extensionData.extension).toBeTruthy();
			expect(extensionData.extension).toContain("Adblock Plus");
			expect(extensionData.version).toMatch(/^\d+\.\d+\.\d+(\.\d+)?$/);
			expect(typeof extensionData.users).toBe("number");
			expect(extensionData.users).toBeGreaterThan(10000);
			expect(extensionData.lastUpdated).toBeTruthy();
			expect(extensionData.url).toContain("chromewebstore.google.com");

			console.log("Chrome Adblock Plus Extension Data:", extensionData);
		}, 90000);
	});
	describe("Web Pages", () => {
		async function fetchChromeExtensionPage(extensionId) {
			const url = `https://chromewebstore.google.com/detail/${extensionId}`;
			try {
				const response = await fetch(url);
				return {
					statusCode: response.status,
					url,
					data: await response.text(),
				};
			} catch (error) {
				throw new Error(`Failed to fetch extension page: ${error.message}`);
			}
		}

		test("Can access Chrome extension pages", async () => {
			const adblockId = "gighmmpiobklfepjocnamgkkbiglidom";
			const adblockPlusId = "cfhdojbkjhnklbpkdaibdccddilifddb";

			const adblockInfo = await fetchChromeExtensionPage(adblockId);
			const adblockPlusInfo = await fetchChromeExtensionPage(adblockPlusId);

			expect(adblockInfo.statusCode).toBe(200);
			expect(adblockPlusInfo.statusCode).toBe(200);

			expect(adblockInfo.data).toContain("AdBlock");
			expect(adblockPlusInfo.data).toContain("Adblock Plus");

			console.log("Chrome extension pages are accessible");
		}, 30000);
	});
});
