# Installed Web App Updates

Status: binding product/release contract.

## Player contract
Once Poply has been added to the Home Screen / installed as a web app, normal releases must arrive without deleting and re-adding the app.

- Online launches fetch the current canonical GitHub Pages files first.
- If the app stays open while a new canonical release deploys, returning to the app checks the release marker and reloads automatically when the SHA changed.
- Offline launches fall back to the last successfully fetched app files.
- App updates never clear or replace the Poply game save in `localStorage`.
- The manifest has a stable `id` so release changes do not create a second app identity.

## Implementation
- `sw.js`: same-origin network-first service worker with last-good Cache Storage fallback.
- `src/aaa-updates.js`: registers the worker with `updateViaCache: 'none'`, remembers the release active at page boot, checks again on foreground/pageshow/focus and periodically while visible, and reloads on a newer canonical SHA.
- `release.json`: development marker in source. The Pages workflow overwrites it with the exact `GITHUB_SHA` and deploy timestamp immediately before uploading the site.
- `.github/workflows/pwa-update-qa.yml`: real WebKit release A → release B test, save-preservation check and offline fallback check.

## Release safety
A release is not considered verified for this contract unless normal CI, the existing Browser QA and the dedicated PWA Update QA are green on the relevant exact head/main SHA. The PWA QA must prove:
1. the page becomes controlled by `sw.js`;
2. a changed release marker triggers an automatic reload;
3. the same real Poply save survives that reload;
4. the last-good app still boots offline.
