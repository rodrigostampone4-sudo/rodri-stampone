# Mobile event metadata visual QA

## Evidence

- Source visual truth: `C:\Users\mater\AppData\Local\Temp\codex-clipboard-303c57ca-21d5-450f-95a9-2eecaf308dde.png` (449 x 559). It shows the reported mobile state at 375 x 812 and 390 x 844.
- Browser-rendered implementation:
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\event-meta-top-aligned-list-375.png` (375 x 812), CSS viewport 375 x 812, device pixel ratio 1.
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\event-meta-top-aligned-focus-390.png` (390 x 844), CSS viewport 390 x 844, device pixel ratio 1.
- Combined comparison: `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\event-meta-source-vs-adjusted-375.png` (774 x 815).
- State: published Sanity events rendered by the local Astro static preview.
- Density normalization: the 375 px source frame was cropped from the responsive-tester screenshot at 206 x 448 and scaled to 375 x 815. The implementation was captured at one screenshot pixel per CSS pixel. The surrounding tester chrome was excluded from the focused comparison.

## Full-view comparison

The normalized comparison shows the same event sequence and mobile card structure. The venue and producer remain side by side in one metadata row. `Club Araoz` now uses the available venue width instead of breaking after `Club`, while `Punta Carrasco` keeps its intentional two-line wrap. The producer chip aligns with the first venue line rather than dropping toward the second line.

No horizontal viewport overflow is present at 375 x 812 or 390 x 844. Ticket and table actions retain their original columns and dimensions.

## Focused metadata evidence

The venue and producer details are legible in the normalized comparison, so no additional crop was needed. Browser measurements at 375 px show a `0px` top-offset difference between every venue box and its producer chip. At 390 px, both `Club Araoz` and `Punta Carrasco` also have a `0px` top-offset difference. `Punta Carrasco` remains two lines while its chip stays aligned with `Punta`.

## Findings

No actionable P0, P1, or P2 visual differences remain in the requested metadata adjustment.

- Fonts and typography: families, sizes, weights, line heights, and title wrapping are unchanged. Venue wrapping changes only where the available narrow-screen width permits it.
- Spacing and layout rhythm: metadata remains a two-column row; the producer chip is top-aligned with the venue and stays close to its left edge.
- Colors and visual tokens: venue, chip, border, and accent colors are unchanged.
- Image quality and asset fidelity: no image assets are involved in this adjustment.
- Copy and content: event, venue, and producer text is unchanged.

## Comparison history

1. Source state: multi-line venues visually placed the producer chip near the second line, and `Club Araoz` wrapped despite fitting at the target viewport.
2. Width correction already present: narrow metadata uses a 5.5rem venue track at 375-432 px and preserves the 4rem fallback below 336 px.
3. Current fix: top-align the metadata grid, mapped venue link, and producer chip for all viewports up to 432 px.
4. Post-fix evidence: at 375 px and 390 px, venue and producer top edges match exactly; `Club Araoz` is one line, `Punta Carrasco` is two lines, and no horizontal overflow is present.

## Interaction and runtime checks

- The local page loaded with meaningful published event content and no framework error overlay.
- Browser error output was empty.
- The interactive snapshot retained the mapped venue links plus every Tickets and Mesas action.
- External destinations were not opened because link behavior and URLs were not changed.

## Implementation checklist

- [x] Keep venue and producer parallel in one metadata row.
- [x] Align producer chips with the first venue line at 375 px and 390 px.
- [x] Preserve the compact fallback below 336 px.
- [x] Verify browser rendering, interactions, and horizontal overflow.

final result: passed
