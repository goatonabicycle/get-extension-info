const { fetchChromeExtensionInfo } = require('./chrome');
const { fetchFirefoxExtensionInfo } = require('./firefox');

module.exports = {
  fetchChromeExtensionInfo,
  fetchFirefoxExtensionInfo
};
