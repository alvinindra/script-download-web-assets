# Examples

Ready-to-paste recipes for common Yoink workflows. Each snippet assumes that
[`../script.js`](../script.js) has already been loaded in the browser tab — paste
its contents into the DevTools console once per session, or use the
[bookmarklet](../README.md#option-b--bookmarklet-recommended).

| Recipe                                            | What it does                                                   |
| ------------------------------------------------- | -------------------------------------------------------------- |
| [`basic.js`](./basic.js)                          | Plain `yoink()` call with default settings                     |
| [`filter-by-type.js`](./filter-by-type.js)        | Archive only images and fonts                                  |
| [`exclude-trackers.js`](./exclude-trackers.js)    | Skip analytics, ads, and other third-party trackers            |
| [`mirror-cdn.js`](./mirror-cdn.js)                | Mirror assets from a single CDN domain with a custom filename  |
| [`flat-layout.js`](./flat-layout.js)              | Disable per-domain folders for a flat ZIP layout               |
| [`silent-automation.js`](./silent-automation.js)  | Headless / Puppeteer-friendly run that returns a result object |
| [`scroll-then-yoink.js`](./scroll-then-yoink.js)  | Auto-scroll to trigger lazy-loaded assets before archiving     |

Run any of them by pasting the file contents into the console after `script.js`
is loaded. To convert one into a bookmarklet, edit `bookmarklet.js` to call the
desired snippet instead of plain `yoink()` and rebuild.
