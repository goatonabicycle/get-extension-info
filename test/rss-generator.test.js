const { generateRSSFeed } = require("../rss-generator");

describe("RSS Feed Generator", () => {
	const mockHistoryData = {
		chrome: [
			{
				id: "test-extension-1",
				name: "Test Extension",
				updates: [
					{
						version: "1.0.0",
						users: 1000000,
						size: "5.0MiB",
						lastUpdated: "November 1, 2025",
						recordedAt: "2025-11-01T10:00:00.000Z",
					},
					{
						version: "1.1.0",
						users: 1200000,
						size: "5.2MiB",
						lastUpdated: "November 15, 2025",
						recordedAt: "2025-11-15T10:00:00.000Z",
					},
				],
			},
		],
		firefox: [
			{
				id: "firefox-ext-1",
				name: "Firefox Extension",
				updates: [
					{
						version: "2.0.0",
						users: 500000,
						size: "3.0MiB",
						lastUpdated: "November 10, 2025",
						recordedAt: "2025-11-10T10:00:00.000Z",
					},
				],
			},
		],
	};

	const mockLatestData = {
		chrome: [
			{
				extension: "Test Extension",
				url: "https://chromewebstore.google.com/detail/test-extension-1",
			},
		],
		firefox: [
			{
				extension: "Firefox Extension",
				url: "https://addons.mozilla.org/en-US/firefox/addon/firefox-ext-1",
			},
		],
	};

	test("Should generate valid RSS 2.0 XML", () => {
		const rss = generateRSSFeed(mockHistoryData, mockLatestData);

		expect(rss).toContain('<?xml version="1.0" encoding="UTF-8"?>');
		expect(rss).toContain('<rss');
		expect(rss).toContain('version="2.0"');
		expect(rss).toContain("<channel>");
		expect(rss).toContain("</channel>");
		expect(rss).toContain("</rss>");
	});

	test("Should include feed metadata", () => {
		const rss = generateRSSFeed(mockHistoryData, mockLatestData, {
			title: "Custom Title",
			description: "Custom Description",
		});

		expect(rss).toContain("Custom Title");
		expect(rss).toContain("Custom Description");
	});

	test("Should create items for version changes", () => {
		const rss = generateRSSFeed(mockHistoryData, mockLatestData);

		expect(rss).toContain("Test Extension updated to v1.1.0");
		expect(rss).toContain("(chrome)");
	});

	test("Should create items for first-time tracked extensions", () => {
		const rss = generateRSSFeed(mockHistoryData, mockLatestData);

		expect(rss).toContain("Now tracking: Firefox Extension");
	});

	test("Should include extension metadata in description", () => {
		const rss = generateRSSFeed(mockHistoryData, mockLatestData);

		// toLocaleString uses space as separator in some locales
		expect(rss).toMatch(/1[,\s]200[,\s]000 users/);
		expect(rss).toContain("5.2MiB");
	});

	test("Should include proper links to extension stores", () => {
		const rss = generateRSSFeed(mockHistoryData, mockLatestData);

		expect(rss).toContain("chromewebstore.google.com");
		expect(rss).toContain("addons.mozilla.org");
	});

	test("Should limit items when maxItems specified", () => {
		const rss = generateRSSFeed(mockHistoryData, mockLatestData, {
			maxItems: 1,
		});

		const itemCount = (rss.match(/<item>/g) || []).length;
		expect(itemCount).toBe(1);
	});

	test("Should include publication dates", () => {
		const rss = generateRSSFeed(mockHistoryData, mockLatestData);

		expect(rss).toContain("<pubDate>");
		expect(rss).toContain("</pubDate>");
	});
});
