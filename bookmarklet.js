/*!
 * Yoink Bookmarklet Source
 *
 * This file is the human-readable source for the Yoink bookmarklet.
 * To install:
 *   1. Create a new bookmark in your browser.
 *   2. Set the name to "Yoink".
 *   3. Paste the URL from `bookmarklet.url.txt` into the URL/address field.
 *   4. Click the bookmark on any page to grab all assets.
 *
 * To regenerate `bookmarklet.url.txt` after editing this file, run:
 *   node build-bookmarklet.js
 *
 * Note: use explicit semicolons everywhere so the minifier can safely
 * collapse whitespace without breaking automatic semicolon insertion.
 */
(function () {
  if (window.__yoinkLoading) {
    console.warn("[yoink] already loading...");
    return;
  }
  window.__yoinkLoading = true;
  var SCRIPT_URL = "https://cdn.jsdelivr.net/gh/alvinindra/yoink@main/script.js";
  var run = function () {
    if (typeof window.yoink === "function") {
      window.yoink();
    } else {
      console.error("[yoink] failed to initialize");
    }
  };
  if (typeof window.yoink === "function") {
    run();
    return;
  }
  var s = document.createElement("script");
  s.src = SCRIPT_URL;
  s.crossOrigin = "anonymous";
  s.onload = function () {
    window.__yoinkLoading = false;
    run();
  };
  s.onerror = function () {
    window.__yoinkLoading = false;
    console.error("[yoink] failed to load script from", SCRIPT_URL);
  };
  document.head.appendChild(s);
})();
