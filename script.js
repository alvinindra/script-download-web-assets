;(async () => {
  // Load JSZip
  if (!window.JSZip) {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script")
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    })
  }

  const zip = new JSZip()

  const urls = [
    ...new Set(
      performance
        .getEntriesByType("resource")
        .map((r) => r.name)
        .filter(Boolean),
    ),
  ]

  console.log(`Found ${urls.length} resources`)

  let success = 0
  let failed = 0

  for (const url of urls) {
    try {
      const u = new URL(url)

      const res = await fetch(url)

      if (!res.ok) {
        failed++
        continue
      }

      const blob = await res.blob()

      let path = u.pathname.replace(/^\/+/, "")

      if (!path) {
        path = "index.html"
      }

      zip.file(path, blob)

      success++

      console.log(`✓ ${path}`)
    } catch (e) {
      failed++
      console.warn(`✗ ${url}`)
    }
  }

  console.log(`Downloaded ${success}, Failed ${failed}`)

  const content = await zip.generateAsync({
    type: "blob",
  })

  const a = document.createElement("a")
  a.href = URL.createObjectURL(content)
  a.download = `${window.location.hostname}.zip`
  a.click()

  console.log("ZIP exported")
})()
