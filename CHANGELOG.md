# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-06-03

First named release. The project was rebranded from "script-download-web-assets" to **Yoink**.

### Added

- Global `window.yoink(options)` API replacing the original self-executing snippet.
- Configurable options: `filename`, `types`, `include`, `exclude`, `concurrency`,
  `groupByDomain`, `includeHTML`, `timeoutMs`, `silent`.
- DOM scan (`img`, `script`, `link`, `video`, `audio`, `iframe`, favicons) layered
  on top of `performance.getEntriesByType("resource")` for broader asset discovery.
- Concurrent download pool with a configurable worker count (default 6).
- Per-request timeout via `AbortController`.
- Per-domain folder grouping inside the generated ZIP.
- Path sanitisation against unsafe filename characters.
- Structured progress logs, total-size reporting, and a categorised error summary.
- Programmatic return value (`{ success, failed, skipped, totalBytes, errors, filename }`).
- Bookmarklet variant (`bookmarklet.js`) and a literal-aware minifier
  (`build-bookmarklet.js`) that emits a ready-to-paste `javascript:` URL.
- `examples/` recipes for common workflows (filtering, exclusions, silent mode,
  flat layout, automation).
- MIT `LICENSE` file.
- `package.json` with metadata, keywords, and an npm script for rebuilding the
  bookmarklet.
- `.gitignore` covering node, build artefacts, OS junk, editor dirs, and local
  `.zip` output.
- This `CHANGELOG.md`.

### Changed

- README rewritten with badges, table of contents, configuration reference,
  examples, how-it-works pipeline, browser support, limitations, and
  contributing sections.
- `fetch()` calls now send `credentials: "include"` so cookie-gated assets
  download successfully when the user is already authenticated.
- Default download filename is now `<hostname>.zip` and is overridable via the
  `filename` option.

## [0.1.0] - 2024-09-12

### Added

- Initial proof-of-concept snippet that paginates `performance.getEntriesByType("resource")`,
  loads `JSZip` on demand from a CDN, and downloads a `website-assets.zip` archive.
- Basic README describing the manual console workflow.

[Unreleased]: https://github.com/alvinindra/yoink/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/alvinindra/yoink/releases/tag/v1.0.0
[0.1.0]: https://github.com/alvinindra/yoink/releases/tag/v0.1.0
