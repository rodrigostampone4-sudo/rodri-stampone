# Mobile event information spacing visual QA

## Evidence

- Source visual truth:
  - User requirement: on mobile only, artist, venue, and producer remain three visual levels; artist may wrap to two lines, while venue and producer stay on one line. The artist-to-venue and venue-to-producer spacing should read as equal. Tablet and desktop stay unchanged.
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\single-line-gap-proposal-final-375.png` (375 x 812), the selected browser-rendered proposal.
  - `C:\Dev\repos\active\Rodri Stampone\.codex-remote-attachments\01a08f02-8431-7ea1-b585-8ad49d088984\400f38c5-edeb-4f30-9b26-e23435210de4\1-Photo-1.jpg` (653 x 1280), original real-device evidence.
- Browser-rendered implementation:
  - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\mobile-spacing-local-final-375-full.png` (360 x 2605), full-page capture from a 375 x 812 CSS viewport; the 15 px width difference is the browser scrollbar.
  - Focused event-list captures from the built local preview at device pixel ratio 1:
    - `C:\Users\mater\.codex\visualizations\2026\09\11\01a08f02-8431-7ea1-b585-8ad49d088984\mobile-spacing-local-final-320.png` (280 x 952), from a 320 x 812 CSS viewport.
    - `mobile-spacing-local-final-375.png` (320 x 911), from a 375 x 812 CSS viewport.
    - `mobile-spacing-local-final-390.png` (335 x 911), from a 390 x 844 CSS viewport.
    - `mobile-spacing-local-final-672.png` (603 x 848), from a 672 x 900 CSS viewport.
    - `mobile-spacing-local-final-673.png` (604 x 1091), from a 673 x 900 CSS viewport.
    - `mobile-spacing-local-final-768.png` (691 x 1091), from a 768 x 1024 CSS viewport.
- State: the built local preview rendered production event data and the committed-source candidate directly in Chromium. Screenshot dimensions reflect the event-list element crop; CSS viewport and device pixel ratio are recorded above.

## Full-view comparison

The selected 375 px proposal and the implemented 375 px full-page capture retain the same header, event ordering, typography, colors, borders, CTA treatment, and three-level event hierarchy. The implementation extends the confirmed card rhythm consistently through the complete event list and leaves the profile section unchanged.

## Focused region comparison

The focused event-list captures make the affected details readable at narrow mobile, wide mobile, and the mobile/tablet boundary:

- At 320 px, longer artist names wrap to two lines; every current venue and producer remains on one line.
- At 375 and 390 px, `PAVEL PETROV` and `Club Araoz` each use one line, and the producer chip remains aligned to the venue's left edge.
- At 672 px, the mobile three-level layout remains active. At 673 and 768 px, the existing tablet two-column metadata presentation returns unchanged.

## Findings

No actionable P0, P1, or P2 visual differences remain.

- Spacing and layout rhythm: artist-to-venue is 17.95 px and venue-to-producer is 17.84 px for both one- and two-line artist names. One-line cards are 121.09 px high; two-line cards are 141.89 px high.
- Action rhythm: Tickets-to-Mesas is 8.09 px for one-line artist cards and 28.89 px for two-line artist cards. This follows the content height without adding empty rows.
- Bottom alignment: the producer chip and Mesas both end 13 px above the card border at all tested mobile widths.
- Responsive safety: no title, venue, producer, Tickets, or Mesas overlap was observed at 320, 375, 390, 672, 673, or 768 px. No page overflow beyond the declared 320 px minimum width was observed.
- Fonts and typography: the existing Space Grotesk/Syncopate families, weights, sizes, line heights, letter spacing, and wrapping behavior are unchanged.
- Colors and visual tokens: the black surface, muted metadata, orange producer edge, white type, and orange Tickets CTA continue using the existing tokens.
- Image and asset fidelity: no images, logos, icons, crops, or asset rendering changed.
- Copy and content: event titles, venues, producers, dates, labels, URLs, and accessible names are unchanged.

## Comparison history

- Earlier finding: one-line artists left about 27.95 px before the venue, while two-line artists left about 17.56 px and venue-to-producer measured about 17.84 px.
- Cause: artist title shared the outer grid row whose height was set by the date and Tickets control, so unused row height accumulated below a one-line title.
- Fix: added an `event-info` wrapper that is `display: contents` outside mobile and becomes an independent one-column grid at 42rem and below. It owns a 7 px title-to-metadata gap while venue and producer retain their 4 px internal gap.
- Post-fix evidence: measured artist-to-venue and venue-to-producer gaps are 17.95 px and 17.84 px across one- and two-line examples. Focused captures confirm the mobile rendering and the 672/673 px boundary.

## Interaction and runtime checks

- Meaningful page content rendered from the built local preview without an error overlay.
- Browser error output was empty.
- The interactive snapshot retained each event ticket overlay, venue Maps link, and Mesas WhatsApp link.
- External destinations were not opened because link semantics and URLs are unchanged.
- An initial unconfigured dev-server attempt returned HTTP 500 at the existing Sanity configuration guard. The final static build used the published site's public Sanity configuration, and its local preview passed browser verification.

## Validation

- Focused producer-label test: 5 tests passed.
- `npm test`: 62 tests passed.
- `npm run check`: 35 files checked with 0 errors, warnings, or hints.
- `npm run build`: passed after resolving the published site's public Sanity configuration without printing it.
- Browser matrix: 320, 375, 390, 672, 673, and 768 px.

final result: passed
