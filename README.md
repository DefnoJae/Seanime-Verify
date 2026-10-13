# Seanime Verify

Version 0.1.0 is a verification-detection library and a Seanime diagnostic plugin. It is **not a working CAPTCHA solver** or playback gateway. No separately running service, browser launch, cookie copying, or user-side dependency installation is included.

The optional plugin adds a Seanime Verify sidebar page with an on-demand site-access check. Its result is not an episode-playback test. It cannot automatically authorize MKissa or Anime Nexus. Official site addresses are displayed for human verification; verification in another browser may not authorize Seanime.

Install the diagnostic preview using `https://raw.githubusercontent.com/DefnoJae/Seanime-Verify/main/Manifest.json` in Seanime's Extensions screen. Providers bundle `src/verify.js` at development build time; the diagnostic plugin is not required for their error handling. This does not create a shared live cookie session across extensions.

## Current feasibility result

Tested against the user's installed Seanime 3.10.3 on 13 October 2026:

- MKissa episode-source request returned `NEED_CAPTCHA`.
- Native fetch requests to the Nexus site and catalogue API returned HTTP 403 with Cloudflare challenge HTML.
- `ChromeDP.newBrowser` failed with `google-chrome: executable file not found in %PATH%`. The exposed options do not include an executable path or existing browser session.
- Nexus's older implementation also needs a persistent authorization socket and fresh signed media-segment requests. A verification page alone cannot replace that gateway. No native extension route-registration API was found in the inspected Seanime source.

The complete requested experience remains blocked. No automatic solver, successful shared authorization, or Nexus v2 playback is claimed. A browser integration change in Seanime or another supported authorization/playback route requires investigation before a playback release.

## Development

Run `node build.cjs` and `node --test tests/*.test.cjs`. Library code is bundled rather than fetched and evaluated at runtime. Response bodies, cookies, challenge solutions, and credentials are not logged or persisted. Tests use fixtures; no CAPTCHA-solving service is involved.
