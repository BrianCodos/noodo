# NOODO · Figma source

File: https://www.figma.com/design/TFCiDPh55B1lg3qrkFv4jb/MOODO?node-id=66-2

Built from the restored UI 70 of the NOODO web player, 24 November 2026.

## Contents

- 3 variable collections: primitives, semantic roles, responsive Desktop/Mobile.
- 370 variables, 55 component families / 324 variants, 6 bound text styles and a semantic player effect style.
- Local component sets with nested instances, text/swap properties, state variants, Auto Layout.
- 46 desktop and 46 mobile compositions including empty/error/demo payment/community states.
- Editable icons and genre illustrations; individual original app assets.
- Start here and Foundations document structure, semantics, responsive behavior and limitations.

## Decisions

- App shell preserved; the rejected 20/60/20 layout is not used.
- Compact queue uses song + artist in two lines, like and add.
- SF Pro is reported missing by Figma despite appearing in available fonts. Roboto is the explicitly documented editable adaptation. The website font was not changed.
- The map is a schematic editable composition, not exact geographic cartography.
- Payment/community screens are demos. QR-like artwork is explicitly invalid for admission.
- The local library lives in this Figma file; team-library publication is not claimed.

## Maintenance

Use semantic variables and instances. Preserve text style bindings. Opacity variable bindings use percentage values (100 enabled / 40 disabled), not raw node opacity (0–1).

The ledger maps actual Figma IDs. The JavaScript files are implementation references for the MCP $fig runtime, not browser scripts. Start a new Figma MCP session when resuming; do not assume the recorded session is reusable.

Do not rerun creation scripts blindly. Inspect current nodes and reuse the ledger. Read QA-revalidation.md for the independent review and closure; QA-before-fixes.md records the earlier findings.

## Final corrections

- TrackRow mobile includes like, add and support in the same horizontal row. Compact queue still uses only song, artist, like and add.
- EventPoster separates 3:4 list artwork from square cover/catalog. Its width and height bind to event/art/listWidth and event/art/listHeight. Four desktop and ten mobile list instances use it.
- Checkout uses name, email, email confirmation and phone, matching the web implementation.
- Fluid instances use Fill; do not apply fixed master-width bindings to them. Mobile community cards use content/mobileWidth.
- The web song-list container rule keeps Support beside like/add with 44px targets. Shared advertising markup was synchronized across artist/article/event entry points to prevent startup failure on a missing promo-tickets element. Six design-system checks pass; the artist route was visually verified at the annotated viewport.

## Verification limits

The independent agent scanned 92 screen compositions for horizontal overflow and checked 2,845 returned text nodes for missing fonts/styles. Visual review covered representative screens and affected components, not all 92 renders. This is not a complete pixel-perfect certification or a fully wired interactive prototype. See the QA panel inside Start here for the same scope and adaptations.

