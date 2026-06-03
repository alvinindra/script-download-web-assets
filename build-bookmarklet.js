#!/usr/bin/env node
/**
 * build-bookmarklet.js
 *
 * Reads `bookmarklet.js`, strips comments + collapses whitespace
 * (without touching the inside of string literals), URL-encodes it,
 * and writes a `javascript:` URL to `bookmarklet.url.txt`.
 *
 * Usage: node build-bookmarklet.js
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "bookmarklet.js");
const OUT = path.join(__dirname, "bookmarklet.url.txt");

/**
 * Walk the source character-by-character so we never touch the
 * contents of string literals, template literals, or regex literals.
 * Strip // and /* *\/ comments, then collapse runs of whitespace
 * outside literals down to a single space.
 */
function minify(code) {
  let out = "";
  let i = 0;
  const n = code.length;

  const isWS = (c) => c === " " || c === "\t" || c === "\n" || c === "\r";

  while (i < n) {
    const c = code[i];
    const next = code[i + 1];

    if (c === "/" && next === "/") {
      while (i < n && code[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < n && !(code[i] === "*" && code[i + 1] === "/")) i++;
      i += 2;
      continue;
    }

    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      out += c;
      i++;
      while (i < n) {
        const ch = code[i];
        out += ch;
        if (ch === "\\" && i + 1 < n) {
          out += code[i + 1];
          i += 2;
          continue;
        }
        i++;
        if (ch === quote) break;
      }
      continue;
    }

    if (isWS(c)) {
      while (i < n && isWS(code[i])) i++;
      const last = out[out.length - 1];
      const upcoming = code[i];
      if (last && upcoming && /[A-Za-z0-9_$]/.test(last) && /[A-Za-z0-9_$]/.test(upcoming)) {
        out += " ";
      }
      continue;
    }

    out += c;
    i++;
  }

  return out.trim();
}

const src = fs.readFileSync(SRC, "utf8");
const min = minify(src);
const url = "javascript:" + encodeURIComponent(min);

fs.writeFileSync(OUT, url + "\n", "utf8");

console.log(`Wrote ${OUT}`);
console.log(`Source bytes: ${src.length}`);
console.log(`Minified bytes: ${min.length}`);
console.log(`URL bytes: ${url.length}`);
console.log("\nDrag this onto your bookmarks bar:");
console.log(url);
