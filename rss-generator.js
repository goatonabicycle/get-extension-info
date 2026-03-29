const RSS = require("rss");
const fs = require("node:fs").promises;
const path = require("node:path");

/**
 * Generates an RSS feed from extension history data
 * @param {Object} historyData - Extension history organized by store
 * @param {Object} latestData - Latest extension data organized by store
 * @param {Object} options - Generation options
 * @returns {string} RSS XML feed
 */
function generateRSSFeed(historyData, latestData, options = {}) {
	const {
		title = "Browser Extension Updates",
		description = "Updates and changes to popular browser extensions",
		site_url = "https://pub-079f1d96c32c4039998e87fd3c5b549d.r2.dev/",
		feed_url = "https://pub-079f1d96c32c4039998e87fd3c5b549d.r2.dev/feed.rss",
		maxItems = 50,
	} = options;

	const feed = new RSS({
		title,
		description,
		site_url,
		feed_url,
		generator: "get-extension-info",
	});

	const items = [];

	// Process each store
	for (const [store, extensions] of Object.entries(historyData)) {
		if (!Array.isArray(extensions)) continue;

		for (const extension of extensions) {
			const updates = extension.updates || [];

			if (updates.length === 0) continue;

			const latestUpdate = updates[updates.length - 1];

			// Detect version changes
			if (updates.length >= 2) {
				const previousUpdate = updates[updates.length - 2];

				if (previousUpdate.version !== latestUpdate.version) {
					items.push({
						title: `${extension.name} updated to v${latestUpdate.version} (${store})`,
						guid: `${store}-${extension.id}-${latestUpdate.version}`,
						url: getExtensionLink(store, extension.id, latestData[store]),
						description: buildDescription(
							extension,
							latestUpdate,
							previousUpdate,
						),
						date: new Date(latestUpdate.recordedAt),
					});
				}
			} else {
				// First-time tracking
				items.push({
					title: `Now tracking: ${extension.name} v${latestUpdate.version} (${store})`,
					guid: `${store}-${extension.id}-initial`,
					url: getExtensionLink(store, extension.id, latestData[store]),
					description: buildDescription(extension, latestUpdate, null),
					date: new Date(latestUpdate.recordedAt),
				});
			}
		}
	}

	// Sort by date (newest first) and limit
	items
		.sort((a, b) => b.date - a.date)
		.slice(0, maxItems)
		.forEach((item) => feed.item(item));

	return feed.xml({ indent: true });
}

/**
 * Builds item description from update data
 */
function buildDescription(extension, latest, previous) {
	const parts = [];

	if (previous) {
		parts.push(`Updated from v${previous.version} to v${latest.version}`);
	} else {
		parts.push(`Version ${latest.version}`);
	}

	if (latest.users) {
		parts.push(`${latest.users.toLocaleString()} users`);
	}

	if (latest.size) {
		parts.push(`Size: ${latest.size}`);
	}

	if (latest.lastUpdated) {
		parts.push(`Released: ${latest.lastUpdated}`);
	}

	if (previous?.users && latest.users) {
		const change = latest.users - previous.users;
		if (change !== 0) {
			const sign = change > 0 ? "+" : "";
			parts.push(`User change: ${sign}${change.toLocaleString()}`);
		}
	}

	return parts.join(" | ");
}

/**
 * Gets the extension store link
 */
function getExtensionLink(store, extensionId, latestStoreData) {
	// Try to get URL from latest data
	if (Array.isArray(latestStoreData)) {
		const extData = latestStoreData.find((ext) =>
			ext.url?.includes(extensionId),
		);
		if (extData?.url) return extData.url;
	}

	// Fallback to constructing URL
	const baseUrls = {
		chrome: "https://chromewebstore.google.com/detail/",
		firefox: "https://addons.mozilla.org/en-US/firefox/addon/",
		edge: "https://microsoftedge.microsoft.com/addons/detail/",
		opera: "https://addons.opera.com/en/extensions/details/",
	};

	return baseUrls[store] ? baseUrls[store] + extensionId : "";
}

/**
 * Saves RSS feed to file
 */
async function saveRSSFeed(historyData, latestData, outputPath, options = {}) {
	const rssContent = generateRSSFeed(historyData, latestData, options);
	await fs.mkdir(path.dirname(outputPath), { recursive: true });
	await fs.writeFile(outputPath, rssContent, "utf8");
	console.log(`RSS feed saved to ${outputPath}`);
	return rssContent;
}

module.exports = {
	generateRSSFeed,
	saveRSSFeed,
};
