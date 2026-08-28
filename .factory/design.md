# Visual thesis: the repository night market

API Handoff Audit uses **night-market neon signage**. A handoff repository can feel like a lane of half-labelled stalls: one person knows which door opens, while the next sees loose files and missing signs. The interface turns those clues into a lit inspection board. It must feel specific to developer work, never like a generic dashboard.

## Palette

The site is deliberately single-mode. A night market only reads as such against an ink-dark ground.

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#07080d` | Page background |
| `--stall` | `#11131c` | Raised panels |
| `--paper` | `#f5f0e8` | Primary text |
| `--smoke` | `#b9bdc9` | Secondary text |
| `--cyan` | `#52f5e6` | Primary action, links, focus |
| `--pink` | `#ff5ccf` | Sign edges and selected states |
| `--amber` | `#ffd166` | Warnings and price |
| `--red` | `#ff7b7b` | Failures |
| `--green` | `#8df0a9` | Passed checks |

Body copy and controls meet 4.5:1 contrast. Color is always paired with a word, symbol, or border pattern.

## Type

- **Display and wordmark:** self-hosted `Space Grotesk`, semibold. Its squared counters resemble shop signs and terminal windows.
- **Body and code:** self-hosted `IBM Plex Mono`, regular/medium. The monospace rhythm connects the landing page to audit output without imitating a stock terminal theme.
- Body text starts at 16px with 1.6 line height. Headings use tight tracking and no all-caps paragraphs.

## Shape and spacing

- An 8px base scale: 8, 16, 24, 32, 48, 64, 96.
- Panels use clipped 14px corners, like paper slips cut for a stall board.
- Neon double rules appear only around the main audit preview and the primary action.
- Findings are rows, not a grid of generic feature cards.
- Desktop composition is asymmetric: copy occupies the narrow left lane; the audit signboard crosses the wider right lane. At 390px it becomes one readable column.

## Motion

The signature motion is a **sign warm-up**: cyan edges brighten once as a result enters, while audit rows arrive in source order over 240ms. Nothing loops. Hover movement is limited to a 2px physical lift. With `prefers-reduced-motion`, states change instantly and the art remains still.

## Asset plan and provenance

- `hero-market-768.webp` and `hero-market-1280.webp`: original raster illustration generated for this product with `/opt/fleet/lib/gen-image.sh`, then converted locally to WebP. Prompt: “A cinematic editorial illustration of a narrow night market alley transformed into an API repository inspection lane; hanging neon placards shaped like file tabs, variable tags, a checklist clipboard and a small terminal window; deep ink black, electric cyan, hot pink and amber; tactile screen-printed texture, oblique perspective, room for UI overlay, no readable words, no logos, no people, no gradients, no watermark.” Deployment: factory image model. License: project-owned generated asset.
- The route motif, wordmark, status marks, favicon, and Open Graph composition are hand-made in HTML/CSS/SVG in this repository. No stock assets or external icon sets.

## Accessibility behavior

Focus uses a 3px cyan ring plus a dark offset. All targets are at least 44px. Status icons include text. The illustration is supplemental and receives purpose-focused alt text. The page remains complete without motion or images.
