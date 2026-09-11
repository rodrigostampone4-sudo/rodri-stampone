# Header logo visual QA

## Evidence

The screenshot files below are local QA evidence and are not runtime inputs.

- Source visual truth: `C:\Users\mater\AppData\Local\Temp\codex-clipboard-da8555a4-8491-4762-b5b4-712eeab8027d.png` (206 x 183), showing the framed 4SIDE mark selected for removal.
- Browser-rendered baseline: `C:\Users\mater\.codex\visualizations\2026\09\11\01a08ee4-43bd-7a81-83e4-d4c24d0bcae5\rodri-logo-before-390.png` (390 x 844), CSS viewport 390 x 844, device pixel ratio 1.
- Browser-rendered implementation:
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08ee4-43bd-7a81-83e4-d4c24d0bcae5\rodri-logo-after-390.png` (390 x 844), CSS viewport 390 x 844, device pixel ratio 1.
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08ee4-43bd-7a81-83e4-d4c24d0bcae5\rodri-logo-after-1440.png` (1440 x 900), CSS viewport 1440 x 900, device pixel ratio 1.
- State: published Sanity content rendered by the local Astro static preview.
- Density normalization: implementation captures use one screenshot pixel per CSS pixel. Baseline and implementation were compared together at the same 390 x 844 viewport and page state.

## Full-view comparison

The mobile before/after comparison confirms that the square border disappears
without changing the logo position, header height, neon sign, handle, event
heading, or first event row. The desktop capture confirms the same treatment at
the wider responsive header.

## Focused logo evidence

The logo is readable at full size in the 390 px captures, so no additional crop
was required. Before the change, the image had a `1px solid` border using the
14% white border token. After the change, the computed border is `0px none`.
Mobile image geometry remains 34.0625 x 34.0625 px at left 25.84375 px and top
13.640625 px. Desktop image geometry remains 68.796875 x 68.796875 px. The
mobile link retains a 44 px height.

## Findings

No actionable P0, P1, or P2 visual differences remain in the requested change.

- Fonts and typography: unchanged across the header, event heading, and event list.
- Spacing and layout rhythm: logo dimensions, offsets, header line, and clickable-area geometry are unchanged; only the visible frame is removed.
- Colors and visual tokens: the border token is no longer applied to the logo; all other header colors and glow treatments remain unchanged.
- Image quality and asset fidelity: the existing transparent `/favicon.svg` asset remains sharp and unmodified at both responsive sizes.
- Copy and content: unchanged.

## Comparison history

1. Baseline at 390 x 844: logo border computed as `1px solid rgba(255, 255, 255, 0.14)`; image measured 34.0625 px square and link height measured 44 px.
2. Fix applied: remove only the border declaration from `.brand-link img`.
3. Post-fix at 390 x 844: border computes as `0px none`; image position and dimensions match the baseline exactly.
4. Desktop pass at 1440 x 900: border remains absent, logo measures 68.796875 px square, and no horizontal overflow is present.

## Interaction and runtime checks

- Page loaded with meaningful content and no framework error overlay.
- Browser error log was empty.
- Interactive snapshot retained the header link labeled `Abrir Instagram de 4SIDE` and all event actions.
- No external destination was opened because link behavior and URLs were not changed.

## Implementation checklist

- [x] Remove the visible frame from the header logo.
- [x] Preserve logo dimensions, position, transparency, and click target.
- [x] Verify mobile and desktop responsive headers.
- [x] Check browser errors and horizontal overflow.

final result: passed
