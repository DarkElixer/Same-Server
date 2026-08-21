# Applying "Aurora Glass" to the Same-Server frontend

Design source: `Live TV Glass.dc.html` (3a home · 3b live browse · 3c player · 3d mobile).
Nothing about routing, data fetching or the API changes — this is a styling + shell change.

## 1. Tokens first (do this before touching screens)

**`src/styles/theme.js`** — replace the values, keep the keys so nothing breaks:

```js
export const theme = {
  colors: {
    background: "#07070F",
    surface: "rgba(255,255,255,0.055)", // glass base
    surfaceRaised: "rgba(255,255,255,0.10)", // glass-hi base
    border: "rgba(255,255,255,0.10)",
    borderStrong: "rgba(255,255,255,0.16)",
    text: "#F2F1F9",
    muted: "#9B99B5",
    faint: "#7F7D99",
    accent: "#7C5CFF",
    accentSoft: "#C4B5FD",
    accent2: "#22D3EE",
    live: "#F87171",
    gradientPrimary: "linear-gradient(120deg,#C4B5FD,#7C5CFF 45%,#22D3EE)",
    gradientBar: "linear-gradient(90deg,#7C5CFF,#22D3EE)",
    overlayBottom: "linear-gradient(0deg,rgba(7,7,15,.95),transparent 62%)",
  },
  radii: { sm: "10px", md: "14px", lg: "20px", xl: "24px", pill: "999px" },
  shadows: {
    glass: "0 10px 40px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.22)",
    lift: "0 14px 40px rgba(124,92,255,.28)",
    cta: "0 12px 34px rgba(124,92,255,.5)",
  },
  blur: { glass: "blur(26px) saturate(140%)" },
};
```

**`src/styles/GlobalStyles.jsx`** — body background `#07070F`, font stack Manrope (body) / Space Grotesk (display), and a themed `:focus-visible` ring (`2px solid #C4B5FD`, offset 2px). Remove the yellow glow and 32px radii.

**`frontend/index.html`** — add the two Google Font links and set `<meta name="theme-color" content="#07070F">`.

**New `src/styles/mixins.js`** — the three reusable recipes every screen uses:

```js
export const glass = (t) => `
  background: ${t.colors.surface};
  backdrop-filter: ${t.blur.glass};
  -webkit-backdrop-filter: ${t.blur.glass};
  border: 1px solid ${t.colors.border};
`;
export const glassHi = (t) => `
  background: linear-gradient(150deg, rgba(255,255,255,.14), rgba(255,255,255,.045));
  backdrop-filter: ${t.blur.glass};
  -webkit-backdrop-filter: ${t.blur.glass};
  border: 1px solid ${t.colors.borderStrong};
  box-shadow: ${t.shadows.glass};
`;
export const aurora = `/* absolutely-positioned blurred blobs, see AuroraBackdrop */`;
```

**New `src/ui/AuroraBackdrop.jsx`** — the three blurred colour blobs (violet / cyan / magenta, `filter: blur(90px)`, `pointer-events:none`) rendered once behind the app. Everything glassy needs this to have something to refract.

## 2. Screen-by-screen file map

| Screen            | Files to change                                                                        | What changes                                                                                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| App shell         | `src/ui/AppLayout.jsx`                                                                 | Sticky bar → centred floating glass nav pill (brand dot, Home/Live/Movies/Series/My List, search + cast icon buttons, avatar). Mount `AuroraBackdrop` here.                    |
| Mobile shell      | **new** `src/ui/TabBar.jsx`                                                            | Floating glass tab bar (Home · Live · Movies · My List) shown under 768px; add ~104px bottom padding to scroll containers so rows clear it.                                    |
| Home              | `src/features/homepage/Home.jsx`, `homeRowStyles.js`                                   | Full-bleed 486px hero (LIVE badge, gradient headline, CTA + two glass pills, stat line), then rows. The two big "LIVE TV / MOVIES & SERIES" cards go away — the nav covers it. |
| Rows              | `VodRow.jsx`, `VodRowSkeleton.jsx`, `ui/Image.jsx`                                     | Poster/tile treatment: 16px radius, translucent gradient fill, hover lift + violet glow.                                                                                       |
| Continue watching | `ContinueWatching.jsx`, `MyListPreview.jsx`                                            | 290×164 glass tiles with a gradient progress bar.                                                                                                                              |
| Live browse       | `features/live/LiveCategories.jsx`, `LiveChannels.jsx`, `ui/Box.jsx`, `ui/GridBox.jsx` | Channel card = logo chip + name + now-playing + quality/country pills.                                                                                                         |
| Filters           | **new** `src/features/live/FilterDock.jsx`                                             | The glass pill dock (category · country · quality · A–Z) above the grid.                                                                                                       |
| Player            | `ui/Player.jsx`, `features/player/HlsPlayer.jsx`, `styles/player_overlay.css`          | Glass top-left title bar, top-right icon cluster, bottom glass control bar with gradient scrubber + up-next cards.                                                             |
| Zap drawer        | **new** `src/features/live/ChannelDrawer.jsx`                                          | Right-hand glass channel switcher; on mobile the same list becomes a bottom sheet. Wire ↑/↓ keys to it.                                                                        |
| Search            | `ui/Search.jsx`, `features/SearchBar/SearchedItemBox.jsx`, `NothingFound.jsx`          | Glass field, grouped results with count pills.                                                                                                                                 |
| My List           | `features/mylist/MyList.jsx`, `ui/FavoriteButton.jsx`                                  | Segmented pills (All/Channels/Movies/Series); heart becomes a glass icon button.                                                                                               |
| Loading           | `ui/GridSkeleton.jsx`, `GroupSkeleton.jsx`, `skeletonStyles.js`, `PlayerSkeleton.jsx`  | Shimmer on translucent fills instead of solid grey.                                                                                                                            |

## 3. Assets you still need to supply

- Channel-logo fallback (currently the pixabay TV image) — a neutral monogram chip is in the mockups.
- Poster fallback for VOD items with no `screenshot_uri`.
- Optional hero artwork for the home banner; otherwise the top item's own backdrop.

## 4. Practical notes

- `backdrop-filter` is expensive: cap it to the nav, dock, control bar and drawer — not to every card. Add a fallback:
  `@supports not (backdrop-filter: blur(1px)) { background: rgba(20,20,32,.92); }`
- Keep the aurora blobs static (no animation) — they repaint the whole compositor layer on low-end TV browsers.
- Contrast: body copy uses `#9B99B5` or lighter on the dark ground; never the violet accent at 12–14px.
- `DESIGN.md` in the repo still describes the old yellow glass system — replace it with this file so agents don't reapply the old tokens.

## 5. Suggested order

1. Tokens + GlobalStyles + fonts + AuroraBackdrop (whole app shifts palette in one commit).
2. AppLayout nav + TabBar.
3. Home hero and rows.
4. Live browse + FilterDock.
5. Player + ChannelDrawer.
6. Search, My List, skeletons.
