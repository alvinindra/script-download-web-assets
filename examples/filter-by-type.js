/**
 * filter-by-type.js - archive only images and web fonts.
 *
 * Useful when you only care about a page's design assets and want to
 * keep the archive small.
 */
yoink({
  types: ["image", "font"],
  filename: "design-assets.zip",
})
