# Landing event card design QA

## Evidence

- Source visual truth:
  - `C:\Users\mater\AppData\Local\Temp\codex-clipboard-42fc9220-8dcb-45fb-b5d1-9e5ac11e5d9d.png` (992 x 607), the annotated event-card sketch.
  - `C:\Users\mater\AppData\Local\Temp\codex-clipboard-55117354-1a0a-45ea-9ad3-d9d09505e59e.jpg` (900 x 1600), the wider sketch context.
  - The user's supplied designer transcript resolves the intended measurements and hierarchy: 20 px edge inset, 12 px from date to artist, artist/date/Tickets top alignment, at least 24 px from venue to producer, producer aligned to the left edge, a denser Tickets button with larger type, and Mesas as a secondary action or link.
- Browser-rendered implementation:
  - `C:\Users\mater\.codex\visualizations\2026\09\12\01a0933c-a2c0-7702-bc02-11f181426498\event-card-built-final-390.png` (335 x 182), focused first-card capture from the final static build.
  - `C:\Users\mater\.codex\visualizations\2026\09\12\01a0933c-a2c0-7702-bc02-11f181426498\event-cards-aligned-built-390.png` (390 x 844), final static-build viewport showing both `Elements` and `4SIDE` cards with one shared artist/venue axis.
  - `C:\Users\mater\.codex\visualizations\2026\09\12\01a0933c-a2c0-7702-bc02-11f181426498\landing-built-final-390.png` (375 x 2938), full-page capture from the final static build.
  - Responsive focused captures at 320, 768, and 1440 px browser viewports: `event-card-final-320.png` (280 x 182), `event-card-final-768.png` (691 x 166), and `event-card-final-1440.png` (1309 x 187).
- Viewport and normalization: the primary browser viewport was 390 x 844 CSS px at device pixel ratio 1. The vertical scrollbar leaves a 375 px page capture and a 335 px card after the existing 20 px page gutters. The source is a photographed freehand specification rather than a same-viewport raster mock, so the comparison normalizes hierarchy and measured spacing rather than literal pixel shape or color.
- State: initial dark landing with current published Sanity event data. No external destination was opened.

## Full-view comparison

The full-page build retains the established landing header, event ordering, type system, palette, profile section, portrait, and footer. Only the event-card composition changes. Cards now follow the sketch consistently: date and producer share the left axis, artist and venue form the center stack, and Tickets with a linked Mesas action share the right axis.

## Focused region comparison

The source sketch and final aligned-cards capture were opened together for direct comparison. The implementation matches every explicit spatial rule: 20 px top/right/bottom/left content insets, a 12 px date-to-artist gap, zero-pixel vertical offset between date, artist, and Tickets, a 12 px artist-to-venue gap, and a 24 px venue-to-producer gap. Mesas is presented as the underlined secondary link shown in the sketch. The follow-up alignment rule is also visible across repeated cards: shorter `4SIDE` chips no longer pull artist and venue text toward the date.

## Findings

No actionable P0, P1, or P2 visual differences remain.

- Fonts and typography: the existing Space Grotesk/Syncopate system is preserved. Artist wrapping remains one or two lines depending on available width. Tickets increases from 0.625rem to 0.75rem and uses tighter 6 x 10 px padding; the previous arrow is removed to match the sketch and reduce visual air.
- Spacing and layout rhythm: browser measurements at 320, 375, 390, 672, 673, 768, 992, 993, and 1440 px confirm 20 px edge insets, 12 px date-to-artist separation, 24 px venue-to-producer separation, and exact top alignment. At every tested width, every artist and venue text block has one common horizontal start; the maximum measured cross-card delta is 0 px. There is no card or page overflow. Producer and Mesas placement remains stable when artist names wrap.
- Colors and visual tokens: the existing black surface, white display type, muted metadata, orange Tickets action, borders, hover colors, and producer treatment remain mapped to the current landing tokens.
- Image quality and asset fidelity: the cards contain no source imagery. No landing image, logo, icon asset, crop, compression, or rendering behavior changes. Removing the decorative Tickets arrow does not replace it with a simulated asset.
- Copy and content: dates, artist names, venues, producer names, Tickets, Mesas, accessible labels, and URLs remain unchanged.
- Accessibility and interaction: Tickets, venue, and Mesas remain three distinct links. Keyboard focus reached each control; hit testing confirmed that the visible Tickets control resolves to the ticket overlay while venue and Mesas resolve to their own anchors. Each keeps a real destination, `target="_blank"`, and `rel="noreferrer"`. Tickets and Mesas retain 44 px control height. External links were not activated during QA.

## Comparison history

- Original card comparison: no P0, P1, or P2 mismatch remained against the sketch after implementing the supplied card hierarchy and measurements.
- Follow-up alignment measurement at 390 px: the per-card `max-content` column placed `Elements` titles at x = 113 px and `4SIDE` titles at x = 90.21875 px, a 22.78125 px mismatch.
- Alignment correction: the event list now owns the leading `max-content` track and each card participates through CSS subgrid. The longest rendered producer chip therefore sets one dynamic width for the whole list; a 3.8125rem fallback preserves the current longest-chip width where subgrid is unavailable.
- Post-build confirmation at 390 px: CSS subgrid is active; all seven cards place both artist and venue text at x = 113 px, including `Elements` and `4SIDE`. Tickets and Mesas measure 44 px high, every card has 0 px overflow, and the page has 0 px horizontal overflow.

## Validation

- Focused event-card tests: 7 passed.
- Full test suite: 64 passed.
- `npm run check`: 35 files checked with 0 errors, warnings, or hints.
- `npm run build`: passed using the project's public Sanity configuration without printing its values.
- `git diff --check`: passed.
- Browser: meaningful content rendered, no error overlay, no page errors, and no console output after a clean static-preview reload.

final result: passed
