function extractExtensionId(url) {
  if (!url) return null;
  const urlMatch = url.match(/\/([^\/]+?)$/);
  return urlMatch ? urlMatch[1] : null;
}

function updateExtensionHistory(historyData, store, extensionInfo) {
  if (!extensionInfo.url) return historyData;

  const extensionId = extractExtensionId(extensionInfo.url);
  if (!extensionId) return historyData;

  if (!historyData[store]) {
    historyData[store] = [];
  }

  let extensionHistory = historyData[store].find((e) => e.id === extensionId);
  if (!extensionHistory) {
    extensionHistory = {
      id: extensionId,
      name: extensionInfo.extension,
      updates: []
    };
    historyData[store].push(extensionHistory);
  }

  const update = {
    version: extensionInfo.version,
    users: extensionInfo.users,
    size: extensionInfo.size,
    lastUpdated: extensionInfo.lastUpdated,
    recordedAt: new Date().toISOString()
  };

  const lastUpdate = extensionHistory.updates.length > 0 ?
    extensionHistory.updates[extensionHistory.updates.length - 1] : null;

  if (!lastUpdate ||
    lastUpdate.version !== update.version ||
    lastUpdate.users !== update.users ||
    lastUpdate.size !== update.size) {
    extensionHistory.updates.push(update);
  }

  return historyData;
}

module.exports = {
  extractExtensionId,
  updateExtensionHistory
};
