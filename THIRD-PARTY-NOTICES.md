# Third-party notices

The machine draws from two vendored icon libraries. Both are permissive and both allow
commercial use, but neither is MIT — the licenses differ, and the attribution
requirements are not the same:

| Library | License | Attribution required |
| --- | --- | --- |
| [Rune Icons](https://runeicons.com) | **Apache-2.0** (not MIT) | Yes — licence text + notice |
| [Lucide](https://lucide.dev) | **ISC** (MIT-equivalent) | Yes — licence + copyright |

## Rune Icons

- Source: <https://github.com/Nexvyn/runeicons>
- Licence: Apache License 2.0 — full text in [`licenses/runeicons-LICENSE.txt`](licenses/runeicons-LICENSE.txt)
- Copyright 2026 Runeicons
- Vendored: every glyph from the `normal` (outline) set, in
  `src/lib/icons/rune.generated.ts`.

Apache-2.0 permits commercial use, modification and redistribution, including in a
closed-source product. It requires that the licence text and any notices are kept, and
that modified files are marked as modified. Apache-2.0 also carries an explicit patent
grant and a trademark carve-out — the licence does **not** grant rights to the "Rune
Icons" name or logo beyond describing the origin of the work. There is no NOTICE file in
the upstream repository.

**Modifications.** The vendored data in `rune.generated.ts` was machine-extracted from
the upstream SVG sprite using `scripts/build-icons.mjs`. Each entry retains the original
path data unchanged. The glyph was not otherwise modified.

**Brand mark.** The Rune Icons brand mark (the angled "R"-glyph) is drawn from
`app/brand-mark.tsx` in the upstream repository and rendered as a small attribution stamp
on the back of the machine. The mark is used here to credit the project — Apache-2.0
explicitly permits using the name and logo to describe the origin of the work (§6).

## Lucide

- Source: <https://github.com/lucide-icons/lucide>
- Licence: ISC — full text in [`licenses/lucide-LICENSE.txt`](licenses/lucide-LICENSE.txt)
- Copyright (c) 2026 Lucide Icons and Contributors
- Vendored: a curated subset, in `src/lib/icons/lucide.generated.ts`.

**Modifications.** Same treatment as Rune Icons — machine-extracted path data, each
entry unchanged from the source SVG.

**Brand mark.** The Lucide mark is taken as released from `docs/public/logo.svg` — the
same two interlocking arcs, the second in Lucide's own red (`#F56565`) — and rendered as
a small attribution stamp on the back of the machine. The `BRAND_LOGOS_STATEMENT.md` in
the upstream repository addresses Lucide's policy of not accepting brand logos *into* the
Lucide icon set; it does not restrict the use of the Lucide mark itself.

## Regenerating

Both vendored files are generated; see [`scripts/build-icons.mjs`](scripts/build-icons.mjs).
It fetches from `runeicons.com`'s repository sprite and from `lucide-static` on jsDelivr,
so re-running it will pick up new upstream icons.
