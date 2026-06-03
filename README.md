# Yoink

> One-click web asset archiver — yoink every image, script, stylesheet, font, and media file from any webpage into a tidy ZIP, straight from your browser console.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](CHANGELOG.md)
[![No dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen.svg)](#how-it-works)
[![Works everywhere](https://img.shields.io/badge/browser-Chrome%20%7C%20Firefox%20%7C%20Safari%20%7C%20Edge-orange.svg)](#browser-support)

Yoink is a single-file, dependency-free JavaScript snippet that detects every resource the current page loaded (and every asset referenced in the DOM) and bundles them into a ZIP — preserving original paths and grouping by domain. No server, no build step, no extension to install. Just paste and run.

---

## Table of contents

- [Features](#features)
- [Quick start](#quick-start)
- [Installation](#installation)
  - [Option A — Browser console](#option-a--browser-console)
  - [Option B — Bookmarklet](#option-b--bookmarklet-recommended)
- [Configuration](#configuration)
- [Examples](#examples)
- [How it works](#how-it-works)
- [Browser support](#browser-support)
- [Limitations](#limitations)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Zero dependencies** — single self-contained JavaScript file.
- **No build, no install** — paste into the browser console, or save as a bookmarklet.
- **Comprehensive discovery** — combines the Performance API with a DOM scan to catch images, scripts, stylesheets, fonts, video, audio, iframes, and the page HTML itself.
- **Smart filtering** — restrict by asset type, include/exclude with strings or regex.
- **Concurrent downloads** — configurable pool (default: 6) keeps things fast without hammering the server.
- **Preserves structure** — files are placed at their original paths inside the ZIP, grouped by hostname for multi-origin assets.
- **Honest reporting** — progress, per-file logs, total size, and a categorized error summary.
- **Programmatic API** — returns a result object you can chain into automation scripts.
- **Bookmarklet ready** — ships with a build script that produces a `javascript:` URL you can drag to your bookmarks bar.

## Quick start

Open the page you want to archive, open DevTools (`F12` or `Cmd/Ctrl + Shift + I`), go to the **Console** tab, and run:

```js
yoink()
```

A file named `<hostname>.zip` will download. That's it.

If `yoink` isn't defined yet, paste the contents of [`script.js`](./script.js) into the console first.

## Installation

### Option A — Browser console

1. Open the page you want to archive.
2. Open DevTools → Console.
3. Paste the contents of [`script.js`](./script.js) and press Enter.
4. Call `yoink()` (with or without options — see [Configuration](#configuration)).

### Option B — Bookmarklet (recommended)

The bookmarklet loads `script.js` from a CDN and runs `yoink()` automatically. One click, any page.

1. Copy the entire one-line URL from [`bookmarklet.url.txt`](./bookmarklet.url.txt) (starts with `javascript:`).
2. Create a new bookmark in your browser, name it **Yoink**, and paste the URL into the Address/URL field.
3. Visit any page and click the bookmark. The ZIP downloads automatically.

> The bookmarklet pulls the latest `script.js` from jsDelivr. If you want to host your own copy, edit `SCRIPT_URL` in [`bookmarklet.js`](./bookmarklet.js) and rebuild with `node build-bookmarklet.js`.

## Configuration

`yoink()` accepts an options object. All fields are optional.

```js
yoink({
  filename: "my-archive.zip",  // default: "<hostname>.zip"
  types: ["image", "script"],  // default: all types
  include: [/cdn\./],          // only include matching URLs (strings or RegExp)
  exclude: ["analytics"],      // skip matching URLs (strings or RegExp)
  concurrency: 6,              // 1-16, default: 6
  groupByDomain: true,         // default: true; false = flat layout
  includeHTML: true,           // default: true; include the page document
  timeoutMs: 30000,            // per-request timeout, default: 30000
  silent: false,               // default: false; suppress console logs
})
```

### Supported `types`

| Value         | Matches                                  |
| ------------- | ---------------------------------------- |
| `image`       | `<img>`, `<source>`, favicons, etc.      |
| `script`      | `<script src>`, dynamically loaded JS    |
| `stylesheet`  | `<link rel="stylesheet">`, CSS imports   |
| `font`        | Web fonts loaded via `@font-face`        |
| `media`       | `<video>`, `<audio>`, related sources    |
| `document`    | The page HTML and any embedded iframes   |
| `xhr`         | `fetch()` and `XMLHttpRequest` responses |
| `other`       | Anything the browser couldn't classify   |

### Return value

```js
const result = await yoink()
// {
//   success:    42,
//   failed:     3,
//   skipped:    0,
//   totalBytes: 5421873,
//   errors:     [{ url, reason }, ...],
//   filename:   "example.com.zip"
// }
```

## Examples

**Grab only images and fonts:**

```js
yoink({ types: ["image", "font"] })
```

**Skip third-party tracking scripts:**

```js
yoink({ exclude: [/google-analytics/, /gtag/, /facebook\.net/, /hotjar/] })
```

**Mirror a single CDN, with a custom filename:**

```js
yoink({
  include: [/cdn\.example\.com/],
  filename: "example-cdn-mirror.zip",
})
```

**Silent mode for automation:**

```js
const result = await yoink({ silent: true })
if (result.failed > 0) {
  console.warn(`${result.failed} assets failed to download`)
}
```

**Flat layout (no per-domain folders):**

```js
yoink({ groupByDomain: false })
```

## How it works

1. **Discovery.** Yoink calls `performance.getEntriesByType("resource")` to enumerate every network request the page has made since load. It then scans the DOM (`img`, `script`, `link`, `video`, `audio`, `iframe`, favicons) to catch anything performance entries may have missed, and adds the page's own document URL.
2. **Filtering.** The combined list is de-duplicated and filtered against your `types`, `include`, and `exclude` rules.
3. **Fetching.** Resources are fetched concurrently (default 6 at a time) via the native `fetch()` API, with credentials so cookie-gated assets work, and a configurable per-request timeout.
4. **Packaging.** Successful responses are added to an in-memory ZIP via [JSZip](https://stuk.github.io/jszip/), which is loaded on demand from a CDN if it isn't already on the page.
5. **Delivery.** The ZIP is generated as a Blob, attached to a temporary anchor tag, and downloaded as `<filename>`.

The whole pipeline lives inside one IIFE and exposes a single global: `window.yoink`. No prototypes are patched, no event listeners are leaked, the temporary anchor is removed after the click, and the object URL is revoked.

## Browser support

Works in any modern browser with support for:

- `fetch()` and `Promise` (all browsers since 2017)
- `performance.getEntriesByType("resource")` (all evergreen browsers)
- `AbortController` (Chrome 66+, Firefox 57+, Safari 12.1+, Edge 16+)
- `Blob` and `URL.createObjectURL` (universal)

Tested on Chrome, Firefox, Safari, and Edge (Chromium).

## Limitations

- **CORS.** Cross-origin assets are fetched without credentials by default, which avoids conflicts with CDNs that respond with the `Access-Control-Allow-Origin: *` wildcard. Same-origin assets are fetched with `credentials: "include"` so cookie-gated content works. Assets that fail for any other reason (network error, 404, etc.) are logged and skipped.
- **Authentication.** Same-origin assets are sent with `credentials: "include"` so cookie-based sessions work out of the box. Cross-origin assets use `credentials: "omit"` by default. If you need credentials for a specific cross-origin domain, you can modify the `fetchWithTimeout` function.
- **Dynamic content.** Yoink captures what is observable at the moment it runs. If your page lazy-loads images on scroll, scroll first to ensure they're in the Performance buffer or DOM.
- **Performance buffer.** Long-running SPAs can fill and overflow the resource timing buffer. Run Yoink shortly after page load, or call `performance.clearResourceTimings()` and reload if needed.
- **Large pages.** Building the ZIP happens in memory. Archives of multi-hundred MB pages may stress the tab.

## Development

```bash
git clone https://github.com/alvinindra/yoink.git
cd yoink

# rebuild the bookmarklet URL after editing bookmarklet.js
node build-bookmarklet.js
```

There is no build step for `script.js` — it ships as the canonical source. Edit it directly and reload your console.

### Repository layout

```
.
├── script.js              # the main yoink() implementation
├── bookmarklet.js         # bookmarklet source (human-readable)
├── bookmarklet.url.txt    # generated `javascript:` URL for bookmarks
├── build-bookmarklet.js   # node script that regenerates the URL
├── examples/              # ready-to-paste recipes
├── CHANGELOG.md
├── LICENSE
├── package.json
└── README.md
```

## Contributing

Issues and pull requests are welcome. Please:

1. Keep the dependency footprint at zero — `script.js` must remain a single self-contained file.
2. Test in at least Chrome and Firefox before opening a PR.
3. Update the [CHANGELOG](./CHANGELOG.md) under the `[Unreleased]` section.

## License

[MIT](./LICENSE) (c) Alvin Indra
