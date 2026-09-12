# Three-row mobile event metadata visual QA

## Evidence

- Source visual truth:
  - User requirement: on mobile, event information uses three visual levels: artist, venue, and producer. Artist names may use two lines; venue and producer each remain on one line. Tablet and desktop stay unchanged.
  - `C:\Dev\repos\active\Rodri Stampone\.codex-remote-attachments\01a08f02-8431-7ea1-b585-8ad49d088984\400f38c5-edeb-4f30-9b26-e23435210de4\1-Photo-1.jpg` (653 x 1280), real-device evidence for the narrow event-card layout.
- Browser-rendered implementation:
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\three-row-mobile-final-320.png` (320 x 812).
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\three-row-mobile-final-337.png` (337 x 812).
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\three-row-mobile-final-360.png` (360 x 800).
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\three-row-mobile-final-375.png` (375 x 812).
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\three-row-mobile-final-390.png` (390 x 844).
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\three-row-mobile-final-672.png` (672 x 900), final mobile breakpoint.
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\three-row-mobile-final-673.png` (673 x 900), first non-mobile pixel.
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\three-row-mobile-final-768.png` (768 x 1024), iPad-width control.
- State: the exact final mobile CSS was applied transiently to the published event markup in the browser. Captures use one screenshot pixel per CSS pixel at device pixel ratio 1.

## Findings

No actionable P0, P1, or P2 visual differences remain for the requested behavior.

- Hierarchy: mobile cards show artist, venue, and producer as three distinct visual levels. Artist names use one or two lines according to available width.
- Metadata: all current venues, including `Club Araoz` and `Punta Carrasco`, remain on one line from 320 through 672 px. Producer chips also remain on one line and align to the venue's left edge.
- Spacing: venue and producer use a fixed 4 px row gap. Their containing column can use the free width before the actions while reserving 108 px for the right-side controls.
- Actions: no venue or producer overlaps Tickets or Mesas at any tested width. Both actions retain 44 px minimum heights.
- Responsive behavior: the three-level presentation applies through 672 px. At 673 and 768 px, venue and producer retain the existing tablet/desktop row and no mobile override is applied.
- Overflow: no horizontal viewport overflow or metadata overflow was measured at 320, 337, 360, 375, 390, 672, 673, or 768 px.
- Visual language: typography, colors, borders, date column, copy, and CTA styling are unchanged.

## Implementation notes

- Removed the character-count heuristic and its wrapped-venue modifier because rendered width cannot be inferred reliably from string length.
- Mobile metadata now uses a single-column grid. Venue and producer no longer compete for columns or determine each other's position.
- The narrower 27rem and 22rem producer exceptions are no longer necessary; the 22rem event-grid reduction remains for the smallest supported viewport.

## Interaction and runtime checks

- The published page rendered meaningful content without an error overlay.
- Browser error output was empty.
- The interactive snapshot retained every venue, Tickets, and Mesas link.
- External destinations were not opened because link behavior and URLs are unchanged.

## Validation

- `npm test`: 62 tests passed.
- `npm run check`: 35 files checked with 0 errors, warnings, or hints.
- Focused producer-label test: 5 tests passed.
- `npm run build`: blocked while rendering `/` because `PUBLIC_SANITY_PROJECT_ID` is unavailable in this local environment; compilation completed before the configuration guard.
- Browser validation: 320, 337, 360, 375, 390, 672, 673, and 768 px; no action overlap, metadata overflow, or viewport overflow.

final result: passed with the documented local build-environment limitation
