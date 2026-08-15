# Screenshot QA — Board atmosphere band

Date: 2026-08-15
PR: #77 — Visual: author the spare Board atmosphere band
Start main: `97931e1d4bdc03eb41df541f8af7853de399cee4`

## Baseline evidence
Successful main Browser QA:
- run `31867229940`
- artifact `9242397128`
- digest `sha256:26741aadbb832665232a60a5939826b5fefa73bed0e97ef90a2e4903f84539db`

Actually opened before implementation:
- `01-board-390x844.png`
- `04-board-short-safari.png` (390×720)

Baseline finding: the 7×7 Werkbank itself was clear and stable, but the necessary spare portrait band between the square Board and bottom navigation still read as a broad, mostly empty dark-teal field. Existing faint color pools did not make the area feel fully authored.

## Iteration history
### Version 1 — rejected
Head: `6023508e34b05cb868f392d868873712345b9b95`
- CI `31867809654` — success
- Browser QA `31867809716` — success
- artifact `9242551428`
- digest `sha256:76868e85f7fbcfa8da953bad7417b391d4e72c3d418681eea43e90ef02f04fcc`

Actually opened:
- `01-board-390x844.png`
- `04-board-short-safari.png`

Decision: rejected despite green automation. Direct comparison against baseline showed the new layer was visually too subtle to justify the pass.

### Version 2 — improved but not final
Head: `b10257395c10df141444159f807cebe001e5cf08`
- Browser QA `31867960250` — success
- artifact `9242594053`
- digest `sha256:86283c01ac21987fbf2817692fc9890578f00546051c8102dafe5266cc1bd365`
- CI `31867960210` — failed only in the new isolated palette contract because the implementation RGB values changed during the visual iteration; the repository's existing `npm test` suite was fully green.

Actually opened:
- `01-board-390x844.png`
- `04-board-short-safari.png`

Decision: visually clearer than Version 1, but the 390×844 view still left too much untouched dark space above the authored lower layer. Iterated again rather than merging.

### Version 3 — accepted visual implementation
Head: `a33ca8270b695db71a604f3271c217522a0bbd1f`
- CI `31868139391` — success
- Browser QA `31868139385` — success
- artifact `9242637022`
- digest `sha256:61d480defb5e0b0ed02cb332950612704a484de7d9001487c07d0400a1654e59`

Actually opened:
- `01-board-390x844.png`
- `04-board-short-safari.png`

Accepted findings:
- The tall-phone spare zone now carries restrained amber, cyan and green reflected light from directly below the Board through the full available band instead of reading as a flat empty slab.
- The short 390×720 view keeps a compact version of the treatment; bottom navigation remains visually dominant and unobstructed.
- Tiny ambient points and material texture remain decorative only; they do not imply a tappable object or gameplay reward.
- The square 7×7 Board geometry, Board cells, item hit targets, generators, Storage control, customer cards and primary navigation are unchanged.
- The treatment uses only background/pseudo-element composition with `pointer-events:none`.
- `prefers-reduced-motion` removes the ambient drift while retaining the static authored composition.
- No new clipping, overlap or document-scroll issue was visible in the reviewed screenshots.

## Files / collision safety
Implementation intentionally stays outside active PR ownership:
- `src/aaa-board-atmosphere.js`
- `src/aaa-main.js`
- `tests/aaa-board-atmosphere.test.js`
- `.github/workflows/ci.yml`
- this QA record

The pass does not touch PR #55 dynamic-FX files or PR #58 Place03/session/domain/Collection/Map/view files.

## Final release rule
This document commit changes the PR exact head. The implementation is only mergeable after normal CI and full Browser QA are green again on that final documented head and the final generated 390×844 and 390×720 Board screenshots are reopened and still accepted. Post-merge exact-main CI, Browser QA and canonical Pages deploy must then all succeed.
