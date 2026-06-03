/**
 * flat-layout.js - disable per-domain folders.
 *
 * All files land directly in the ZIP root using their original path.
 * Handy when you are only archiving assets from a single origin.
 */
yoink({
  groupByDomain: false,
  filename: "site-assets-flat.zip",
})
