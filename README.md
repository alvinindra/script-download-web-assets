# Script Download Web Assets

A simple, dependency-free JavaScript snippet to download all loaded assets (images, stylesheets, scripts, etc.) from the current webpage into a ZIP file.

## How it works

The script leverages the browser's `performance.getEntriesByType("resource")` API to detect all resources dynamically loaded by the current page. It then uses the `JSZip` library to package these resources and automatically triggers a download of a `website-assets.zip` file containing preserving their original paths.

## Usage

1. Open the webpage you want to download assets from.
2. Open your browser's Developer Tools (usually `F12` or `Cmd/Ctrl + Shift + I`).
3. Navigate to the **Console** tab.
4. Copy the entire contents of `script.js` and paste it into the console, then hit **Enter**.

```javascript
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
  
  // ... rest of the script executes and downloads the zip
```

5. The script will dynamically load the necessary `JSZip` library, fetch all the assets, and package them. You can monitor the progress in the console logs.
6. A file named `website-assets.zip` will automatically start downloading once complete.

## Notes

- **CORS Issues:** Some resources (like fonts or cross-origin images) might fail to download if they don't have permissive Cross-Origin Resource Sharing (CORS) headers. Those failed assets will be logged but skipped.
- **Dynamic Assets Only:** The script captures assets intercepted by the Performance API. It might not capture initially loaded DOM elements if the performance entries have been cleared.

## License

MIT
