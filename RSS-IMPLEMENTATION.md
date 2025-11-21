# RSS Feed Implementation

## Summary

Successfully implemented RSS feed generation for browser extension updates using the `rss` npm package (v1.2.2).

## What Was Added

### 1. RSS Generator Module (`rss-generator.js`)
- Generates RSS 2.0 compliant feeds from extension history data
- Detects version changes and creates RSS items for:
  - **Version updates**: When an extension releases a new version
  - **New tracking**: When an extension is first added to monitoring
- Includes metadata: user count, file size, release date, user count changes
- Configurable options (title, description, max items, etc.)

### 2. Automatic Feed Generation
- Integrated into `index.js` main workflow
- RSS feed automatically generated after fetching extension data
- Saved to `data/feed.rss`

### 3. Testing
- Comprehensive test suite in `test/rss-generator.test.js`
- Tests RSS structure, metadata, version detection, and item limits
- All 8 tests passing ✅

### 4. Dependencies
- Added `rss@1.2.2` package (battle-tested, used by Ghost CMS)
- Only 2 sub-dependencies (mime-types, xml)

## How It Works

1. **Data Collection**: The scraper fetches extension info from stores (existing functionality)
2. **History Tracking**: Updates are recorded in `extension-history.json` (existing)
3. **RSS Generation**: New step that:
   - Compares current vs previous updates in history
   - Creates RSS items for version changes
   - Outputs valid RSS 2.0 XML to `data/feed.rss`

## RSS Feed Features

- **Valid RSS 2.0 XML** with proper namespaces
- **Unique GUIDs** for each item (`{store}-{extensionId}-{version}`)
- **Publication dates** from recorded timestamps
- **Rich descriptions** with version, users, size, and change metrics
- **Direct links** to extension store pages
- **Sorted by date** (newest first)
- **Configurable limit** (default: 50 items)

## Usage

### Generate Feed Automatically
```bash
npm start
```

This will:
1. Fetch all extension data
2. Update JSON files
3. Generate RSS feed at `data/feed.rss`

### Programmatic Usage
```javascript
const { saveRSSFeed } = require('./rss-generator');

await saveRSSFeed(historyData, latestData, 'data/feed.rss', {
  title: 'Custom Title',
  description: 'Custom Description',
  maxItems: 100
});
```

## Example RSS Output

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Browser Extension Updates</title>
    <description>Updates and changes to popular browser extensions</description>
    <link>https://pub-079f1d96c32c4039998e87fd3c5b549d.r2.dev/</link>
    <item>
      <title>AdBlock updated to v6.32.1 (chrome)</title>
      <description>Updated from v6.32.0 to v6.32.1 | 62,000,000 users | ...</description>
      <link>https://chromewebstore.google.com/detail/...</link>
      <guid>chrome-gighmmpiobklfepjocnamgkkbiglidom-6.32.1</guid>
      <pubDate>Thu, 20 Nov 2025 20:19:07 GMT</pubDate>
    </item>
  </channel>
</rss>
```

## Testing the Feed

1. **W3C Validator**: https://validator.w3.org/feed/
2. **RSS Readers**: Test with Feedly, Inoreader, or any RSS reader
3. **Automated Tests**: `npm test -- test/rss-generator.test.js`

## Files Modified/Added

- ✅ `rss-generator.js` - New RSS generation module
- ✅ `test/rss-generator.test.js` - New test suite
- ✅ `index.js` - Added RSS feed generation step
- ✅ `package.json` - Added `rss` dependency
- ✅ `data/feed.rss` - Generated RSS feed (auto-created)

## Why It's Easy to Maintain

1. **Library-based**: Uses proven `rss` package, not hand-rolled XML
2. **Simple API**: ~150 lines of code with clear functions
3. **Well-tested**: 8 comprehensive tests covering all features
4. **Integrated**: Automatically runs with existing scraper workflow
5. **No breaking changes**: Existing functionality untouched

## Next Steps (Optional)

- Upload `feed.rss` to Cloudflare R2 alongside JSON files
- Add RSS feed link to project documentation
- Monitor feed in RSS reader for extension updates
- Consider adding email notifications via RSS-to-email service
