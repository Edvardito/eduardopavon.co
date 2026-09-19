# Artwork and content license

Copyright © José Eduardo Hernández Pavón, who exhibits as **Eduardo Pavón**. All
artworks are the property of the artist.

The **source code** of this repository is released under the MIT License (see
[LICENSE](LICENSE)). That permission applies to the code **only**.

The **artworks and their reproductions** are licensed separately, under
**[Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)](https://creativecommons.org/licenses/by-nc-nd/4.0/)**.

## What this covers

- Every image under `src/assets/artworks/` — both the 2000px gallery tier and
  the 3000px `detail/` tier
- Every rendition of those images produced by the build (`dist/_astro/*`) and
  served from eduardopavon.co
- The artwork titles, media descriptions and related text in
  `src/content/artworks/`

## What you may do

- **Share** — copy and redistribute the images in any medium or format,
  **provided you credit "Eduardo Pavón"** and link to the license.

## What you may not do

- **Commercial use** — you may not use the artworks for commercial purposes.
- **Derivatives** — you may not remix, transform, crop or build upon the
  artworks and distribute the result.

## Requesting other permissions

Uses beyond this license — exhibition, print, commercial licensing, or
derivative work — require the artist's written permission. Contact the artist
directly.

## Rights metadata

Rights are also declared machine-readably, so they travel with the work:

- The committed image masters carry EXIF (`Artist`, `Copyright`) and XMP Rights
  Management (`dc:rights`, `xmpRights:WebStatement`, `cc:license`) written by
  `scripts/optimize-images.mjs`.
- Each page declares `<link rel="license">` and `<meta name="rights">`.
- Each artwork's JSON-LD carries `copyrightHolder`, `copyrightNotice`,
  `creditText`, `license` and `usageInfo`.

Note that `astro:assets` re-encodes images for delivery and does not preserve
embedded metadata, so the served renditions rely on the page-level rights markup
above rather than on EXIF/XMP.
