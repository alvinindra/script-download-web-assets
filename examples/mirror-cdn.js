/**
 * mirror-cdn.js - mirror all assets from a single CDN domain.
 *
 * Filters to only assets served from your chosen CDN, then saves them
 * into a flat, predictable structure under a custom filename.
 */
yoink({
  include: [/cdn\.example\.com/, /assets\.example\.com/],
  filename: "example-cdn-mirror.zip",
  groupByDomain: false,
})
