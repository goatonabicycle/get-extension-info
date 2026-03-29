# get-extension-info

Scrapes browser extension metadata (version, user count, size, last updated) from the Chrome, Firefox, Edge, and Opera stores, plus GitLab release data. Runs hourly via GitHub Actions and uploads the results to Cloudflare R2.

## Data

The GitHub Action uploads three files to Cloudflare R2 on each run:

- `extension-latest.json` — latest snapshot
- `extension-history.json` — full history
- `feed.rss` — RSS feed of version changes

## Running locally

```bash
npm install
node index.js
```

## Adding extensions

Edit the extension lists at the top of `index.js`.
