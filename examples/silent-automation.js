/**
 * silent-automation.js - headless / Puppeteer-friendly.
 *
 * Suppresses all console output and returns a structured result object
 * you can inspect or forward to CI/logging pipelines.
 *
 * Example (in a Puppeteer page.evaluate context):
 *   const result = await page.evaluate(async () => {
 *     const y = await window.yoink({ silent: true })
 *     return { ok: y.success, bad: y.failed, file: y.filename }
 *   })
 *   console.log(result)
 */
;(async () => {
  const result = await yoink({ silent: true })

  console.table({
    "Assets saved": result.success,
    "Assets failed": result.failed,
    "Total size (MB)": (result.totalBytes / 1024 / 1024).toFixed(2),
    "Filename": result.filename,
  })

  if (result.errors.length > 0) {
    console.warn("Failed URLs:")
    result.errors.forEach(({ url, reason }) =>
      console.warn(`  ${reason} - ${url}`)
    )
  }
})()
