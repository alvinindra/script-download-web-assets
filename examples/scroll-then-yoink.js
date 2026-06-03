/**
 * scroll-then-yoink.js - trigger lazy-loaded assets before archiving.
 *
 * Scrolls the page to the bottom to force the browser to load any
 * images, videos, or other resources behind lazy-loading / infinite
 * scroll patterns, then runs Yoink after a short settle delay.
 */
;(async () => {
  const SCROLL_DELAY = 800   // ms between scroll steps
  const SETTLE_DELAY = 2000  // ms to wait after reaching the bottom

  async function scrollToBottom() {
    const distance = window.innerHeight
    let previousHeight = document.body.scrollHeight

    for (;;) {
      window.scrollBy(0, distance)
      await new Promise((r) => setTimeout(r, SCROLL_DELAY))

      if (document.body.scrollHeight === previousHeight) break
      previousHeight = document.body.scrollHeight
    }
  }

  console.log("[scroll-then-yoink] scrolling to trigger lazy assets...")
  await scrollToBottom()

  console.log(`[scroll-then-yoink] settling (${SETTLE_DELAY}ms)...`)
  await new Promise((r) => setTimeout(r, SETTLE_DELAY))

  window.scrollTo(0, 0)
  console.log("[scroll-then-yoink] archiving...")

  const result = await yoink()
  console.log("[scroll-then-yoink] done.", result)
})()
