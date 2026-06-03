/**
 * exclude-trackers.js - skip common analytics, ad, and tracking domains.
 *
 * Yoink will still discover these resources, but they will be filtered out
 * before fetching, so the archive stays focused on real page content.
 */
yoink({
  exclude: [
    /google-analytics\.com/,
    /googletagmanager\.com/,
    /gtag\//,
    /doubleclick\.net/,
    /facebook\.net/,
    /facebook\.com\/tr/,
    /hotjar\.com/,
    /clarity\.ms/,
    /segment\.(io|com)/,
    /mixpanel\.com/,
    /amplitude\.com/,
    /sentry\.io/,
    /newrelic\.com/,
  ],
})
