# Third-Party Notices

This project is released under the MIT License; see LICENSE. It also includes
material derived from the following open-source project. The original copyright
notice and license are reproduced below.

## diagram-design

- **Project:** diagram-design
- **Author:** Cathryn Lavery
- **Source:** https://github.com/cathrynlavery/diagram-design
- **License:** MIT
- **Copyright:** Copyright (c) 2025 Cathryn Lavery
- **Bundled snapshot:** see `skill/UPSTREAM.json` (version and commit)

### Material included in this repository

- The `skill/` directory:
  - `skill/SKILL.md`
  - `skill/references/*.md` (70 reference documents)
  - `skill/templates/template.html`, `template-dark.html`, `template-full.html`,
    `template-terminal.html`, `template-motion.html`
  - `skill/LICENSE` (upstream MIT text)
- The 50 diagram-type descriptions in `src/types.final.json`, extracted from
  `skill/references/type-*.md` and inlined into `client.js` as the `DATA` table.
- The example preview images in `src/previews/*.webp` and their inlined
  copies in `client.js` (`PREVIEWS` / `PREVIEWS_DETAIL`), rendered from the
  upstream `assets/example-*.html` files.

### Modifications

- The bundled `skill/` is a subset of the upstream skill: SKILL.md, references,
  five HTML templates, and the LICENSE are copied without rewriting their
  content. `skill/UPSTREAM.json` is added by this project to record the source
  version and commit.
- Descriptions were extracted and normalized for display: Markdown markers,
  links, and inline code were removed; table rows were flattened; variant
  subsections and code blocks were skipped. The wording and meaning were not
  intentionally changed.
- Preview images were rendered with headless Chrome at 2x device pixel ratio,
  cropped to the diagram's content bounds, resized, and encoded as WebP.
- The plugin composes a generation prompt from the bundled skill at runtime;
  it does not modify the upstream writing, layout rules, or templates.

### License

```text
MIT License

Copyright (c) 2025 Cathryn Lavery

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## LeapAvid Design MD (palette data)

- **Project:** LeapAvid Design MD
- **Source:** local project `LeapAvid-Design-md/design-md`
- **License:** MIT
- **Copyright:** Copyright (c) 2026 VoltAgent

### Material included in this repository

- `palettes.json`: ten curated palettes derived from the color tokens in
  `design-md/<brand>/DESIGN.md` (Airbnb, Apple, Linear, Vercel, Stripe, Notion,
  Claude, Binance, Starbucks, Mastercard).

### Modifications

- Selected ten of the 84 brand design languages and mapped their colors onto the
  diagram-design semantic roles (`paper`, `paper2`, `ink`, `muted`, `soft`,
  `rule`, `ruleSolid`, `accent`, `accentBrand`, `accentTint`, `link`,
  `onAccent`).
- Adjusted some accent and muted values to meet the plugin's readability contract
  (WCAG 4.5:1 for text, 3:1 for non-text). The original brand accent is kept in
  `accentBrand` and in the visible swatches; for example Airbnb uses `#d42a4b`
  for readable accent text while the swatch shows the original Rausch `#ff385c`.
- Added Chinese display names, descriptions, and usage guidance. Brand names and
  colors remain the property of their respective owners; this project is not
  affiliated with or endorsed by those brands.

### License

```text
MIT License

Copyright (c) 2026 VoltAgent

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## No runtime dependency on dsh-ai-diagrams

Earlier versions of this plugin required the separate `dsh-ai-diagrams` package
for the `diagram-design` skill and `diagram_save` tools. As of 0.2.0, the
required skill material is bundled in `skill/` and the plugin composes prompts
itself; `dsh-ai-diagrams` is no longer a runtime dependency and is not bundled.
