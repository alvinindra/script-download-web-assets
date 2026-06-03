/*!
 * Yoink - One-click web asset archiver
 * https://github.com/alvinindra/yoink
 *
 * Paste this entire file into your browser's DevTools console on any page,
 * then call `yoink()` to download every detected asset as a ZIP.
 *
 * Usage:
 *   yoink()                                    // default settings
 *   yoink({ filename: "my-site.zip" })         // custom filename
 *   yoink({ types: ["image", "script"] })      // only images and scripts
 *   yoink({ exclude: [/analytics/, /gtag/] })  // skip matching URLs
 *   yoink({ groupByDomain: false })            // flat structure
 *
 * License: MIT
 */
;(() => {
  const JSZIP_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
  const VERSION = "1.0.0"

  const TYPE_MAP = {
    image: ["img", "image"],
    script: ["script"],
    stylesheet: ["css", "link", "stylesheet"],
    font: ["font"],
    media: ["video", "audio", "media"],
    document: ["iframe", "document", "html"],
    xhr: ["xhr", "fetch"],
    other: ["other"],
  }

  function log(silent, level, ...args) {
    if (silent) return
    const prefix = "[yoink]"
    if (level === "warn") console.warn(prefix, ...args)
    else if (level === "error") console.error(prefix, ...args)
    else console.log(prefix, ...args)
  }

  async function loadJSZip() {
    if (window.JSZip) return window.JSZip
    await new Promise((resolve, reject) => {
      const s = document.createElement("script")
      s.src = JSZIP_CDN
      s.onload = resolve
      s.onerror = () => reject(new Error("Failed to load JSZip from CDN"))
      document.head.appendChild(s)
    })
    if (!window.JSZip) throw new Error("JSZip did not initialize")
    return window.JSZip
  }

  function collectResources() {
    const urls = new Set()
    const meta = new Map()

    for (const entry of performance.getEntriesByType("resource")) {
      if (!entry.name) continue
      urls.add(entry.name)
      meta.set(entry.name, {
        type: entry.initiatorType || "other",
        size: entry.transferSize || 0,
      })
    }

    const domSelectors = [
      ["img[src]", "src", "image"],
      ["source[src]", "src", "media"],
      ["video[src]", "src", "media"],
      ["audio[src]", "src", "media"],
      ["script[src]", "src", "script"],
      ['link[rel="stylesheet"][href]', "href", "stylesheet"],
      ['link[rel~="icon"][href]', "href", "image"],
      ["iframe[src]", "src", "document"],
    ]

    for (const [selector, attr, type] of domSelectors) {
      for (const el of document.querySelectorAll(selector)) {
        const raw = el.getAttribute(attr)
        if (!raw) continue
        try {
          const abs = new URL(raw, document.baseURI).href
          if (!urls.has(abs)) {
            urls.add(abs)
            meta.set(abs, { type, size: 0 })
          }
        } catch {
          // ignore invalid URLs
        }
      }
    }

    if (document.documentURI) {
      urls.add(document.documentURI)
      if (!meta.has(document.documentURI)) {
        meta.set(document.documentURI, { type: "document", size: 0 })
      }
    }

    return Array.from(urls).map((url) => ({ url, ...meta.get(url) }))
  }

  function matchesType(entryType, requestedTypes) {
    if (!requestedTypes || requestedTypes.length === 0) return true
    const aliases = new Set()
    for (const t of requestedTypes) {
      const key = t.toLowerCase()
      aliases.add(key)
      for (const [canonical, list] of Object.entries(TYPE_MAP)) {
        if (canonical === key || list.includes(key)) {
          aliases.add(canonical)
          list.forEach((a) => aliases.add(a))
        }
      }
    }
    return aliases.has(entryType.toLowerCase())
  }

  function matchesPatterns(url, patterns) {
    if (!patterns || patterns.length === 0) return false
    return patterns.some((p) => {
      if (p instanceof RegExp) return p.test(url)
      if (typeof p === "string") return url.includes(p)
      return false
    })
  }

  function sanitizePath(segment) {
    return segment.replace(/[<>:"|?*\x00-\x1F]/g, "_")
  }

  function buildZipPath(url, groupByDomain) {
    const u = new URL(url)
    let pathname = decodeURIComponent(u.pathname).replace(/^\/+/, "")
    if (!pathname || pathname.endsWith("/")) pathname += "index.html"

    const parts = pathname.split("/").map(sanitizePath)
    const safePath = parts.join("/")

    if (groupByDomain) {
      return `${sanitizePath(u.hostname)}/${safePath}`
    }
    return safePath
  }

  async function fetchWithTimeout(url, timeoutMs) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(url, { signal: controller.signal })
    } finally {
      clearTimeout(timer)
    }
  }

  async function runPool(items, worker, concurrency) {
    const results = new Array(items.length)
    let cursor = 0
    const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++
        results[i] = await worker(items[i], i)
      }
    })
    await Promise.all(runners)
    return results
  }

  async function yoink(options = {}) {
    const config = {
      filename: options.filename || `${window.location.hostname || "yoink"}.zip`,
      types: options.types || null,
      include: options.include || [],
      exclude: options.exclude || [],
      concurrency: Math.max(1, Math.min(options.concurrency || 6, 16)),
      groupByDomain: options.groupByDomain !== false,
      timeoutMs: options.timeoutMs || 30000,
      silent: options.silent === true,
      includeHTML: options.includeHTML !== false,
    }

    log(config.silent, "info", `v${VERSION} starting on ${window.location.href}`)

    const JSZip = await loadJSZip()
    const zip = new JSZip()

    let resources = collectResources()
    log(config.silent, "info", `Found ${resources.length} unique resources`)

    if (config.types) {
      resources = resources.filter((r) => matchesType(r.type, config.types))
    }
    if (config.include.length) {
      resources = resources.filter((r) => matchesPatterns(r.url, config.include))
    }
    if (config.exclude.length) {
      resources = resources.filter((r) => !matchesPatterns(r.url, config.exclude))
    }
    if (!config.includeHTML) {
      resources = resources.filter((r) => r.type !== "document")
    }

    log(config.silent, "info", `Downloading ${resources.length} after filters (concurrency: ${config.concurrency})`)

    const stats = { success: 0, failed: 0, skipped: 0, totalBytes: 0, errors: [] }
    let completed = 0

    await runPool(
      resources,
      async (resource) => {
        const { url } = resource
        try {
          const res = await fetchWithTimeout(url, config.timeoutMs)
          if (!res.ok) {
            stats.failed++
            stats.errors.push({ url, reason: `HTTP ${res.status}` })
            log(config.silent, "warn", `[fail] ${res.status} ${url}`)
            return
          }
          const blob = await res.blob()
          const path = buildZipPath(url, config.groupByDomain)
          zip.file(path, blob)
          stats.success++
          stats.totalBytes += blob.size
          log(config.silent, "info", `[ok] ${path} (${(blob.size / 1024).toFixed(1)} KB)`)
        } catch (err) {
          stats.failed++
          stats.errors.push({ url, reason: err.message || String(err) })
          log(config.silent, "warn", `[fail] ${err.message || err} ${url}`)
        } finally {
          completed++
          if (completed % 10 === 0 || completed === resources.length) {
            log(
              config.silent,
              "info",
              `Progress: ${completed}/${resources.length} (${Math.round((completed / resources.length) * 100)}%)`,
            )
          }
        }
      },
      config.concurrency,
    )

    if (stats.success === 0) {
      log(config.silent, "error", "No assets were downloaded. Aborting ZIP creation.")
      return { ...stats, filename: null }
    }

    log(config.silent, "info", "Generating ZIP archive...")
    const content = await zip.generateAsync(
      { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
      (meta) => {
        if (Math.round(meta.percent) % 25 === 0) {
          log(config.silent, "info", `Zipping: ${Math.round(meta.percent)}%`)
        }
      },
    )

    const a = document.createElement("a")
    a.href = URL.createObjectURL(content)
    a.download = config.filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)

    log(
      config.silent,
      "info",
      `Done. Saved ${config.filename} - ${stats.success} ok, ${stats.failed} failed, ${(stats.totalBytes / 1024 / 1024).toFixed(2)} MB`,
    )

    return { ...stats, filename: config.filename }
  }

  window.yoink = yoink
  if (typeof module !== "undefined" && module.exports) module.exports = yoink

  console.log(
    `%c[yoink] v${VERSION} loaded. Call yoink() to start, or yoink({ ... }) with options.`,
    "color:#6366f1;font-weight:bold",
  )
})()
