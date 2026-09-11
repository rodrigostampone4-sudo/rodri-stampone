# Wrapped mobile event metadata visual QA

## Evidence

- Source visual truth:
  - User requirement: one-line venues keep the producer on that line; two-line venues size to their longest visible line and center the producer against the full text block.
  - `C:\Dev\repos\active\Rodri Stampone\.codex-remote-attachments\01a08f02-8431-7ea1-b585-8ad49d088984\400f38c5-edeb-4f30-9b26-e23435210de4\1-Photo-1.jpg` (653 x 1280), real-device evidence that `Club Araoz` was unnecessarily forced to two lines.
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\club-araoz-gap-audit-320.png` (320 x 812).
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\club-araoz-gap-audit-337.png` (337 x 812).
- Browser-rendered implementation:
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\wrapped-event-meta-final-320.png` (320 x 812).
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\wrapped-event-meta-final-337.png` (337 x 812).
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\wrapped-event-meta-final-375.png` (375 x 812).
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\wrapped-event-meta-final-390.png` (390 x 844).
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\event-meta-gap-4px-337.png` (337 x 812), final spacing pass.
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\event-meta-gap-4px-375.png` (375 x 812), final spacing pass.
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\club-araoz-single-line-final-337.png` (337 x 812), compact breakpoint edge.
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\club-araoz-single-line-final-360.png` (360 x 800), representative phone width.
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\club-araoz-single-line-final-390.png` (390 x 844), wider phone width.
- Side-by-side comparisons:
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\club-araoz-before-after-320.png` (656 x 812).
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\club-araoz-before-after-337.png` (690 x 812).
- State: published Sanity event content in the local Astro static preview. All captures use one screenshot pixel per CSS pixel at device pixel ratio 1.

## Findings

No actionable P0, P1, or P2 visual differences remain for the requested metadata behavior.

- Fonts and typography: existing families, sizes, weights, line heights, and letter spacing are unchanged. `The Lift`, `The Bow`, and `Club Araoz` remain on one line; `Punta Carrasco` remains on two.
- Spacing and layout rhythm: the producer follows the longest rendered venue line with a measured 3.98-4 px gap instead of the previous 23.62-37.05 px empty track. Its center differs from the venue text center by 0.34 px due to font-metric rounding.
- Colors and visual tokens: venue, producer, action, border, and accent colors are unchanged.
- Image quality and asset fidelity: no image assets are involved in this adjustment.
- Copy and content: event, venue, and producer text is unchanged.
- Responsive behavior: no producer overlaps `Mesas` in the final 320, 337, 352, 353, 360, 375, 390, or 408 px checks. At 337 px, `Club Araoz` remains on one line with 4 px before `Elements` and 4.03 px before `Mesas`.

## Full-view and focused comparison

The browser captures keep the existing date, title, Tickets, Mesas, separators, and vertical rhythm. The real-device source is a downsampled 653 px JPEG and cannot provide exact CSS-pixel geometry, so the browser checks supply the focused evidence: `Club Araoz` and `Elements` share one line with a 4 px gap at every tested width, while `Punta Carrasco` preserves the centered two-line treatment.

## Comparison history

1. Earlier P2: `fit-content(4rem)` preserved short multi-word venues but left 23.62-37.05 px of visible empty track before the producer on `Club Araoz`.
2. Fix: add an explicit compact/wrapped venue presentation. Compact venues use `max-content`; wrapped venues use `min-content`; both retain centered grid alignment.
3. First post-fix P2: at 337 px, `Punta Carrasco` and `Elements` overlapped the `Mesas` boundary by 1.67 px.
4. Fix: reduce only the mobile producer's inline padding by 2 px per side.
5. User polish pass: increase the mobile venue-to-producer gap from 3 px to 4 px.
6. Final evidence: all tested venues keep the intended line count and 4 px venue-to-producer gap without action overlap or horizontal viewport overflow.
7. Real-device P2: `Club Araoz` was still classified as a wrapped venue even where the complete label fit.
8. Fix: reserve the wrapped variant for labels longer than `Club Araoz` and extend the existing compact grid through 352 px, preventing overlap at the narrow transition without reintroducing the line break.
9. Post-fix evidence: `Club Araoz` stays on one line from 320 through 408 px; `Punta Carrasco` stays on two, and all producer/action boundaries remain separate.

## Interaction and runtime checks

- The local page renders meaningful published content without an error overlay.
- Browser error output is empty.
- Interactive snapshot retains every venue link and every Tickets and Mesas action.
- External destinations were not opened because link behavior and URLs are unchanged.

## Validation

- `npm test`: 62 tests passed.
- `npm run check`: 35 files checked with 0 errors, warnings, or hints.
- Focused producer-label test: 5 tests passed after the final CSS adjustment.
- `npm run build`: production static build completed with published Sanity content after the final adjustment.
- Browser validation: 320, 337, 352, 353, 360, 375, 390, and 408 px; final captures at 337 x 812, 360 x 800, and 390 x 844.

final result: passed
