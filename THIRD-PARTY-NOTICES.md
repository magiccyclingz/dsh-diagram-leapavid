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

### Material included in this repository

- The 50 diagram-type descriptions in `src/types.final.json`, extracted from
  `skills/diagram-design/references/type-*.md` and inlined into
  `client.js` as the `DATA` table.
- The example preview images in `src/previews/*.webp` and their inlined
  copies in `client.js` (`PREVIEWS` / `PREVIEWS_DETAIL`), rendered from
  `skills/diagram-design/assets/example-*.html`.

### Modifications

- Descriptions were extracted and normalized for display: Markdown markers,
  links, and inline code were removed; table rows were flattened; variant
  subsections and code blocks were skipped. The wording and meaning were not
  intentionally changed.
- Preview images were rendered with headless Chrome at 2x device pixel ratio,
  cropped to the diagram's content bounds, resized, and encoded as WebP.

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

## dsh-ai-diagrams

The `diagram-design` skill and the `diagram_save` / `diagram_validate` /
`diagram_svg` / `diagram_png` tools are provided by the
[`dsh-ai-diagrams`](https://www.npmjs.com/package/dsh-ai-diagrams) package,
installed separately as a dependency. They are not bundled in this
repository. Their copyright and license terms belong to that package and its
upstream project; see the package for details.
