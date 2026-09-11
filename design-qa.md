# Events landing visual QA

## Evidence

The paths below refer to local, non-versioned QA captures. They document the
validated session but are not runtime inputs or portable repository assets.

- Source visual truth: `C:\Users\mater\AppData\Local\Temp\codex-clipboard-34f566d7-da1d-4c1f-accd-6c81882ec2be.png` (731 x 738), showing the numeric event counter below the heading.
- Browser-rendered baseline: `C:\Users\mater\AppData\Local\Temp\rodri-events-before-1440.png` (1440 x 900), CSS viewport 1440 x 900, device pixel ratio 1.
- Browser-rendered implementation:
  - `C:\Users\mater\AppData\Local\Temp\rodri-events-after-1440.png` (1440 x 900), CSS viewport 1440 x 900, device pixel ratio 1.
  - `C:\Users\mater\AppData\Local\Temp\rodri-events-after-731.png` (731 x 738), CSS viewport 731 x 738, device pixel ratio 1.
  - `C:\Users\mater\AppData\Local\Temp\rodri-events-after-390.png` (390 x 844), CSS viewport 390 x 844, device pixel ratio 1.
- State: published Sanity event content rendered by the local Astro static preview.
- Density normalization: each implementation capture uses one screenshot pixel per CSS pixel. The user reference and the 731 x 738 implementation were opened together in the same comparison input; the requested delta was also compared against the matching 1440 x 900 baseline to avoid treating pre-existing viewport-scale differences as regressions.

## Full-view comparison

The combined source/implementation comparison shows that the boxed numeric
counter is absent and the released vertical space is used by the event list.
At 1440 x 900, the heading retained its 226.546875 px top and 193.53125 px
height, while the list moved from 580.078125 px to 492.078125 px: an 88 px
upward shift without changing the heading composition. The 390 x 844 view
keeps the same hierarchy, places the list at 308.015625 px, and has no
horizontal overflow.

## Focused evidence

A separate focused crop was not needed because the removed counter, heading,
section boundary, and first event row are all clearly readable in the full
captures. DOM measurements supplied the exact before/after geometry for the
affected region.

## Findings

No actionable P0, P1, or P2 visual differences remain in the requested change.

- Fonts and typography: the existing heading and event typography, weights, line heights, tracking, wrapping, and antialiasing are unchanged.
- Spacing and layout rhythm: removing the counter collapses its 56 px top margin and 32 px box height, moving the list upward by 88 px while preserving the established section margin and alignments.
- Colors and visual tokens: unchanged; no new colors, borders, gradients, or effects were introduced.
- Image quality and asset fidelity: existing logo and event assets, crops, glow treatment, and responsive image behavior are unchanged.
- Copy and content: the numeric total is removed; event titles, dates, venues, producers, actions, and empty-state copy are preserved.

## Comparison history

1. Baseline at 1440 x 900: the counter was visible from 476.078125 px to 508.078125 px and the first event-list boundary began at 580.078125 px.
2. Fix applied: remove the counter markup and styles, and decouple client-side expiration synchronization from the removed element.
3. Post-fix at 1440 x 900: no counter exists; the heading geometry is unchanged and the event list begins at 492.078125 px, 88 px higher.
4. Responsive pass at 390 x 844: no counter, no framework overlay, no horizontal overflow, and the event list follows the heading with the existing 72 px section gap.

## Interaction and runtime checks

- Page loaded with meaningful content and no framework error overlay.
- Browser error log was empty.
- Interactive snapshot exposed seven ticket links plus the existing Maps and Mesas links.
- Keyboard focus reached `Saltar al contenido`; activation set `#contenido` and aligned the main content to the viewport top.
- External destinations were not opened because this change does not alter their URLs or behavior.

## Implementation checklist

- [x] Remove the numeric event counter from the landing.
- [x] Reclaim its vertical space so event content moves upward.
- [x] Preserve event-expiration and empty-state synchronization.
- [x] Verify desktop and mobile rendering, interactions, errors, and overflow.

final result: passed
