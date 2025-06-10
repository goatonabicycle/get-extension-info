function extractExtensionId(url) {
  if (!url) return null;
  const urlMatch = url.match(/\/([^\/]+?)$/);
  return urlMatch ? urlMatch[1] : null;
}

function updateExtensionHistory(historyData, store, extensionInfo, idField = 'url') {
  let extensionId;
  if (idField === 'guid' && extensionInfo.guid) {
    extensionId = extensionInfo.guid;
  } else if (extensionInfo.url) {
    extensionId = extractExtensionId(extensionInfo.url);
  } else {
    return historyData;
  }

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

function formatFileSize(sizeInBytes) {
  if (!sizeInBytes) return null;

  const KB = 1024;
  const MB = KB * 1024;

  if (sizeInBytes >= MB) {
    return `${(sizeInBytes / MB).toFixed(2)}MiB`;
  }

  return `${(sizeInBytes / KB).toFixed(2)}KiB`;
}

function formatDate(dateString) {
  if (!dateString) return null;

  const date = new Date(dateString);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

module.exports = {
  extractExtensionId,
  updateExtensionHistory,
  formatFileSize,
  formatDate
};
