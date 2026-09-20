# eduardopavon.co — design system

The single source of design **intent**. `src/styles/global.css` is the single
source of design **values**; this file never restates one, with the palette as
the stated exception. Roadmap: @SPEC.md · Hard rules and seams: @CLAUDE.md

**Why there is no token table here.** The common `DESIGN.md` convention embeds
the whole token set, because those files are portable context for an agent with
no codebase to read — nothing else holds the values. Ours has a live `@theme`
one file away, and a copied scale drifts on the first tune. We take the
convention's prose-and-rationale half and decline its token-table half.

---

## 1. Intent

The site presents the drawings of Eduardo Pavón — ballpoint pen on paper and
plastic canvas — to galleries, curators, collectors and press. Its readers are
deciding whether to exhibit, write about or buy a work. They need the work large
and faithful, the metadata exact, and the page fast enough that none of that is
in question.

---

## 2. Principles

**1. The drawing is the darkest mass in the gallery.** No element that is not a
work may present a contiguous field of ink anywhere the work is shown. _Why:_
ballpoint hatching is built from density, so anything denser beats the work
optically. _Loses to:_ the masthead, which is a solid ink band — hence "in the
gallery" rather than "on the page". It is fixed at the top, outside the field
the plates occupy, and nothing below it may copy the move. Also loses to focus
indication, which may be as loud as it needs to be.

**2. Blue speaks for the site; ink speaks for the work.** `--color-pen` carries
the site's own voice — masthead, section labels, folios, rules, links. Anything
describing a specific drawing — title, medium, dimensions, year, status — is
`--color-ink`. _Why:_ a structural accent that also labels works makes the
catalogue and the catalogued speak in one register. _Loses to:_ nothing. The
test is mechanical: point at any blue pixel and ask whether it describes one
specific drawing; if yes, it is the wrong colour.

**3. A plate is bounded by width, never by proportion.** Every box a work
occupies takes the work's own aspect ratio, so height follows the drawing. There
is no frame to fill and therefore nothing to crop. _Why:_ the promise is
faithful reproduction, and a percentage height against an aspect-ratio-derived
box silently crops every plate. _Loses to:_ the viewport. A tall work at the
common measure is taller than a screen, and in the gallery it is allowed to be;
seeing a work whole is the detail page's job.

**4. The composition is a rule, not an act of authorship.** Where a work appears
derives from its position in the sequence; no work is individually placed or
excepted. _Why:_ `add-artwork` must add work nine without a designer in the
room. _Loses to:_ the perfect page — a hand-placed gallery would beat this one
for eight specific works and be wrong for the ninth.

**5. Motion and script are borrowed, not owned.** Every animation is opt-out and
every page is complete when nothing runs; the site ships exactly one script and
it adds no information. _Why:_ performance is this project's SEO, and its one
interaction is a convenience, not a route to content. _Loses to:_ the follow lag
and the scroll specular, pure decoration and the first things removed under
`prefers-reduced-motion`.

---

## 3. Foundations

Accessibility is a constraint inside each foundation, not a later section. WCAG
2.2 AA is the hard floor site-wide — the artist's market is European and EN 301
549 is built on it. Body and caption text hold **7:1** (AAA 1.4.6).

### Colour

Closed at **four** values, stated literally here and only here, because the
exact values _are_ the argument. It was three; the fourth was added when the
masthead moved to an ink field and the accent turned out to be unreadable on it
(1.86:1). See the bound on it below — a fourth colour is only survivable if it
comes with one.

| Token             | Value     | Role                                        |
| ----------------- | --------- | ------------------------------------------- |
| `--color-ink`     | `#030A77` | the work's voice: body, captions, metadata  |
| `--color-ground`  | `#F1FFEB` | the page, everywhere, the only ground       |
| `--color-pen`     | `#0000FF` | the site's voice: a literal Bic barrel blue |
| `--color-pen-red` | `#F52742` | the secondary accent, for dark grounds only |

`global.css` is authoritative from here on. Verified against the ground: ink
**15.4:1**, pen **8.3:1** — both AAA at any size, so blue is safe at caption
size, not only for headings. Re-verify if a value changes.

**`--color-pen-red` is declared and currently unused.** It was added for the
strip's folio while that field was ink, where it measured 4.0:1; the field then
became pen, where it is 2.15:1, and the folio fell back to the ground colour. It
is kept because the decision to add it was deliberate and the ink field may
return — but a palette value nothing references is a standing invitation to
misuse, so the bound below is what governs it if it comes back.

**It is a large-text-only colour, and that is not a style note but its whole
licence to exist.** Measured: **4.0:1 on ink**, **3.85:1 on ground**, **2.15:1
on pen**. Four-to-one clears AA for large text — 24px and up, or 18.7px bold —
and clears nothing else. So: it may carry display-sized type on an ink field,
which is the masthead strip's folio and today its only use. It may **not** be
used for body or caption text on any ground, it may not be used on pen, and on
the light ground it is large-text-only as well. Reach for it below 24px and the
page fails AA.

**There is no muted token and none may be added.** Fading ink with opacity to
build hierarchy collapses contrast (~3.5:1 at 50%, failing AA). Hierarchy comes
from weight, size, space and rule — how printed books have always built it.
**The ladder**, six levels, no grey:

| #   | Role             | Size    | Weight  | Case     | Colour |
| --- | ---------------- | ------- | ------- | -------- | ------ |
| 1   | display          | display | heavy   | upper    | pen    |
| 2   | section label    | label   | bold    | upper    | pen    |
| 3   | work title       | lede    | medium  | sentence | ink    |
| 4   | prose / lede     | body    | regular | sentence | ink    |
| 5   | catalogue line   | caption | regular | sentence | ink    |
| 6   | folio / colophon | label   | bold    | upper    | pen    |

Levels 2 and 6 share a treatment and differ only by position; both are
furniture, and furniture should be one thing.

**Light only.** `color-scheme: light` is declared so user-agent surfaces —
scrollbars, form controls, autofill — do not invert under a design with no dark
ground. A printed object has one ground: a decision, not an omission.

**`--color-pen` is decorative everywhere except links and the focus ring**,
which are informational and hold 3:1 (1.4.11). Rules, folios, section labels and
the glazing edge carry nothing the text does not already carry. Links are
underlined — meaning is never colour alone (1.4.1) — with the one stated
exception in §6.

**Focus** (2.4.11 / 2.4.13) is two-ply: an inner ring in `--color-ground` inside
an outer ring in `--color-ink`, so one ply always contrasts — against the
ground, against a drawing, against a blue field. No fourth colour, and the only
element allowed to be louder than the work.

**To add a fifth: you cannot.** A new value for a scrim, a shadow, a disabled
state or a lens rim is refused by test (§10) — the guard admits only literals
inside `@theme`, so adding one is a deliberate act with a diff, not a one-off.
The fourth was earned by a measured failure and arrived with a size bound. That
is the price of admission: a new colour needs a contrast problem no existing
value solves, and a written rule for where it may not go.

### Typography

**Two faces, and the split is the same one the palette makes.** `--font-display`
(Irregardless Variable) is the site's voice: the display step, section labels,
folios, the colophon. `--font-text` (Polymath Text) is the work's voice: prose,
work titles, catalogue lines. A reader can tell the catalogue from the
catalogued by the letterforms alone, which is what makes principle 2 legible
even in a screenshot with the colour removed.

**The weight axis belongs to the display face**, which is variable over
**300–800 — there is no 900 in it.** Two positions are used: **heavy** (the top
of the range) for the name, and **bold**, the step below, for everything else it
sets — section labels and the masthead strip. The name is the heaviest thing on
the site and nothing else may match it.

**The wide round alternates belong to the name alone.** They are the face's
signature, and set on section labels or on the strip they read light and airy at
those sizes, where the plain forms are denser for the same weight. One rule
carries them, on `.display`; nothing else turns them on.

**The text face has exactly two weights — 400 and 700 — plus both italics.** Its
hierarchy is therefore carried by size, space and **italic**, not by weight.
Asking it for 500 or 600 gets a synthesised approximation, which is a different
letterform badly drawn; the rule is that no text-face element may request a
weight other than 400 or 700. Italic has one standing job: a plate's descriptive
line, where a catalogue has always used it.

**The display face has a floor: 30px.** It is condensed, with tall wide-round
caps, and below that it stops reading as type and starts reading as texture. No
step the display face uses may fall under the floor; test-enforced (§10). The
consequence is a real constraint, not a note: **this face cannot do small
furniture.** Anything that has to be small belongs to the text face.

**Four text steps** — micro, caption, body, lede — generated by a major third
(1.25). The display face does not use them: it has **two optical steps of its
own**, `--text-label` and `--text-strip`, set by what each has to do rather than
by a ratio, plus `--text-display`, which is fluid because its size is the
measure it must fill. A fifth text step or a third display step needs a role no
current one serves — not something that looks slightly too big. A step that
stops being used gets deleted: `--text-heading` was carried for the unbuilt
about page and removed, because a token nothing references is one more thing to
keep true.

Relationships that live nowhere in CSS:

- Display is the only step whose leading is below 1.0× its own size. A heavy
  blue display at normal leading reads as a banner, not a title page.
- The catalogue line sits one step below body and shares body's leading, so a
  caption block is a whole number of body lines. Every vertical space derives
  from that unit.
- Micro is the only tracked step; tracking substitutes for the size it gives up,
  since uppercase micro without tracking is a smear.
- The prose measure caps near 66 characters. It binds the about archetype and
  the statement, and it is why captions are never centred.

Text-spacing overrides (1.4.12) must break nothing: no step sets line height in
px, and no box holding text has a fixed height.

**Delivery.** Both faces are Adobe Typekit families, **self-hosted at build
time** through Astro's Adobe provider — `fontProviders.adobe({ id })` against
the kit id, in `astro.config.ts`. They shipped briefly as a runtime
`use.typekit.net` stylesheet, which cost two render-blocking requests on a
third-party origin, a `font-display: auto` we could not override, no fallback
metrics, and Adobe seeing every visitor's IP. Self-hosting removes three of the
four; the fourth followed the faces home and is treated below.

Three properties the self-hosted files must keep, each of which would break the
design silently if it went:

- **The variable weight axis.** Request `['300 800']`, or the faces arrive as
  static instances and 700 and 800 are synthesised.
- **`ss02`**, which carries the name's wide round alternates at a measured
  advance of 4.912 per 1px — the title card's divisor.
- **Generated fallback metrics**, so the swap cannot shift layout.

**`font-display: swap`, and the config must be what decides it.** Typekit
publishes its kit CSS with `font-display: auto`, the Adobe provider reads that
value out of it, and Astro resolves a provider's value ahead of the configured
one — so a face ships `auto`, which Chrome treats as block, unless the provider
value is dropped. `astro.config.ts` drops it. Only the _generated fallback_
faces carry `swap` on their own, so built HTML showing both values is the
symptom of this going wrong. A CI step fails if any page ships
`font-display:auto`.

Only the display face is preloaded: it sets the name, which is the largest thing
on the page.

### Space and grid

**The spacing unit is the body line height**, not an arbitrary 4px step, so
vertical rhythm and text rhythm are one rhythm. Every space is a whole multiple
or simple fraction of it. Binding relationships:

- **The space opening a cycle is at least twice the widest space inside one**,
  so a cycle boundary is felt without being announced. This is the only thing
  carrying the cadence, so it is load-bearing rather than decorative.
- **A caption is closer to its own plate than to the next one** — the space
  after a caption is never smaller than the space between a plate and its
  caption.
- **The glazing's painted extent is less than the space between a plate and its
  caption**, so the glass never appears to touch anything but its own work.
- **The outer page margin is at least the column gutter** wherever the grid has
  more than one column, so the page's edge is never tighter than the gaps
  inside.

Reflow (1.4.10): one column at every width, so there is nothing to collapse and
no horizontal scroll at 320px.

### Line and rule

Rules are furniture, therefore `--color-pen`, and there are exactly two: the
**section rule** under a section label, and the **closing rule** beneath the
gallery's last work. A third rule needs a third kind of division and there is
not one. Rules are hairlines; a rule thick enough to read as a bar competes with
the work (principle 1).

### Motion

CSS only, with the one scripted exception in §7. Every animation is
**double-guarded**: the hidden or displaced start state lives inside
`prefers-reduced-motion: no-preference` and, where the mechanism is not
universal, inside `@supports` too, so content is never stranded invisible. This
project shipped that bug once; it is now test-enforced (§10).

**Two durations only** — short for state changes, long for entrances and reveals
— with one shared easing curve. A third duration asks the reader to distinguish
two speeds, and nothing here is worth that.

### Proportion

The work's proportion always wins. A plate takes its aspect ratio from the
asset's intrinsic dimensions, and **every gallery plate takes the same width** —
the common measure — so height is the only thing that varies, and it varies
because the drawing does. Nothing is stretched; there is no box to be cropped
by.

**No plate is height-capped.** A cap makes tall works narrower than short ones,
destroying the evenness the common measure exists for. The cost is that a tall
work exceeds the viewport in the gallery. The common measure is a single token —
the dial for trading magnificence against seeing a work whole.

## 4. The cadence

The gallery is **one column at every width**, every plate at the same measure,
paced by a **repeating cycle of five spacing slots**. A rule, not authorship
(principle 4).

**The gallery is one column, and rhythm is the cadence's only instrument.** No
slot may carry a column span, a height cap or an offset of its own: works at
differing sizes read as some being too large, which is the claim a single column
at a common measure exists to refuse.

**Slot to work.** A work's slot is its **position in the sequence**, never the
value of its `order` field: `slot = ((rank − 1) mod 5) + 1`. Gaps and
renumbering therefore cannot desynchronise it. In CSS that is
`:nth-child(5n+k)`.

| #   | Slot  | Space before it | Reads as              |
| --- | ----- | --------------- | --------------------- |
| 1   | open  | cycle           | a new gathering       |
| 2   | verso | row             | a plate on its own    |
| 3   | recto | pair            | facing the one before |
| 4   | inset | row             | a plate on its own    |
| 5   | close | pair            | closing the gathering |

Slots 3 and 5 sit tight against the work above, so a cycle holds two pairs and
one clear break. The break before slot 1 is at least twice the largest space
inside a cycle (§3) — that ratio is what makes a gathering legible without a
heading announcing it. **Why five:** an even cycle against this collection
produces identical gatherings, and a repeated even period reads as regular
again.

**Every plate is the same width**, so nothing outranks anything else. A plate
narrower or wider than the measure is impossible. This is the rule the single
column exists to make true, and it is why no slot may reintroduce a size, a span
or a cap of its own.

**Incomplete cycles.** A cycle that runs out of works simply ends — no filler,
no reflow. The **last work, whatever its slot, carries the closing rule**
(`:nth-last-child(1)`), turning "it stopped" into "it ended". Today's eight
works end mid-gathering; in a book that is a chapter ending, and the rule says
so.

**Narrow widths.** Nothing changes but the measure, which is already fluid.
There is no collapse to get wrong and no reflow (1.4.10) to defend — phone and
desktop read identically. That is the compensation for losing the composition.

**Arbitrary aspect ratios.** The measure bounds width; height follows the work.
A very tall work is very tall. Nothing is cropped or distorted, at any width,
for any ratio (§3).

**Phase 3's morph.** `view-transition-name` sits on the element whose box is
exactly the work's box. Because that box carries the work's own aspect ratio,
the gallery→detail morph interpolates two boxes of equal proportion and reads as
one object moving rather than a stretch. A uniform measure makes this easier:
every morph starts from the same width. The glazing fades out during it — the
detail page is unglazed.

---

## 5. Page archetypes

### Gallery / home

**Job:** show the body of work in sequence and let a reader judge it without
clicking.

**Structure.** A **masthead** that stays: the artist's name as one line filling
the page, with the **list of plates** as an ink band directly beneath it. The
two stick together and the name shrinks inside them. Then the **statement** —
the one element at the top of the page that scrolls away, which is what tells
the reader the page has started moving: display-sized, centred, in caps. Then
the gallery: section label, rule, and a single column of plates at the common
measure. Then contact, then the colophon.

**There is no hero.** A frontispiece spread puts one work in a privileged
position ahead of the others, which is a claim the single column gives up
making. The page runs name → contents → work, and the first plate is simply the
first plate.

**This page carries no masthead**, because the title card is one (§6). It is the
only page that does not.

**Must not:** give any plate a size, span or cap of its own; show more than one
blue element larger than body size per viewport height (principle 2's prominence
test — screenshot a viewport and count); force `100svh` at narrow widths, where
it strands content below the fold.

### Artwork detail — Phase 3, specified not built

**Job:** deliver the pen. Where hatching is legible, and where keyboard and
touch users get what the magnifier gives mouse users.

**Structure.** The work fills the viewport, contained, at the detail tier (§8).
Chrome retreats to the corners: folio and title top-left, catalogue line
bottom-left, prev/next bottom-right. Below the fold, the full record and the
list of plates with the current work marked — better than a bare prev/next,
because a curator can move through the body of work without returning to the
gallery.

**Not glazed.** Glass is the plate: a work seen at a distance, as an object on a
wall. This page is the work in the hand, and glass between the reader and the
hatching is precisely what it exists to remove. A surface treatment — the one
place a `backdrop-filter` would have something to refract — would veil the
drawing.

**Must not:** crop to fill the viewport; carry the magnifier, which is redundant
here and for which this page is the accessible equivalent.

### About — Phase 2, specified not built

**Job:** the statement and biography, for a curator writing about the work.

**Structure.** Prose at the measure, one column on the verso half, portrait on
the recto. Section labels and rules divide statement from biography from record.
The display step appears once, at the top.

**Must not:** exceed the measure; use the cadence — the cadence paces images and
this page is text.

### 404

**Job:** say the page is not in the book and return the reader to it.

**Structure.** Type only, on the measure: the numeral at display size in pen,
the message at body size in ink, the return link. No artwork — a 404 that shows
work rewards a broken link, and the reader is one click from all of it.

---

## 6. Components

**The glazed plate.** The work as an object: a wrapper carrying the work's exact
aspect ratio from the asset's intrinsic dimensions, the image absolutely
positioned inside with `object-fit: contain`, the glazing painted inside it.

Three layers, all positioned, so **every one states its z-index**: the
placeholder (0), the image (1), the rim (2), and the lens (3) above them all.
Leaving any of them on `auto` puts it in DOM order, which is how the rim ended
up under the image and later the lens under both.

**Every plate carries a blurred placeholder** — a 20px-wide copy of the work,
generated by the import script, inlined as a data URI and blurred on its own
layer so the blur never touches the drawing. It breathes slowly while it waits.
The real image is opaque and exactly the same proportion, so it covers the
placeholder the moment it paints: no load hook, no script, nothing to clean up.
A plate with no placeholder falls back to a wash of ink. The plate **clips**,
because the placeholder's blur would otherwise spill past it. That does not
reopen the Phase 1 crop: the box takes its ratio from the asset, so the image
can never exceed it. States: rest; hover (the magnifier engages, the cursor
hides); reduced motion (no pulse, no lag).

**The glass material.** One material, three objects: the **glazing** fixed over
a plate, the **loupe** held over the work on hover, and the **title bar** the
page passes beneath. They share tokens — pane thickness, dispersion spread, the
alphas the edge is drawn with, and one light angle — so retuning one provably
retunes the other. If a future session can change the loupe without the glazing
following, this has failed.

Glass over a flat ground is invisible; all the information is at the edge.
Therefore:

- **On a plate, the glass is inside the work's bounds.** Contact line inset, rim
  just inside the edge, light travelling across the surface. Painted entirely
  outside the rectangle it reads as a drop shadow instead, which is what
  everything outside a rectangle at low alpha does. The cost is accepted: a
  highlight passes over the drawing and the outermost hairline is overlaid. It
  is a light overlay, never a displacement — **the plate does not refract, so
  the work is never distorted**, and that is the part of the promise that does
  not bend.
- **No `backdrop-filter` on a plate.** There is nothing behind a plate to
  refract. It earns its keep only where the page genuinely scrolls beneath
  something: the title card and the section head, both sticky. Those two, and
  nothing else.
- **Over a near-white ground glass reads as dark line-work, not a glow.** The
  ground sits near 0.96 relative luminance — no headroom, and a highlight cannot
  be brighter than the page. The plate edge is therefore drawn with _darker_
  marks. "Glass needs a white specular" is the obvious wrong assumption here,
  and it is why the glazing needs no fourth colour. **The loupe is the
  exception**: it sits over the drawing, not over the ground, so it _does_ have
  headroom, and a bright arris opposite a dark one is most of what reads as
  glass there.
- **The glazing is almost invisible, and that is correct.** Glass over a flat
  white ground shows nothing but a delicate, uneven hairline and a soft cast
  shadow. The alphas are deliberately low; raising them turns the glazing into a
  mount.
- **Dispersion resolves toward the accent.** Real glass fringes cyan and green;
  here the fringe is `--color-pen`, so this glass disperses toward ballpoint
  blue. A deliberate substitution, not an approximation.
- **Nothing is painted outside the plate.** An outer cast shadow reads as
  furniture around a picture rather than as glass on one.
- **The edge varies around the perimeter.** A ring of constant weight is a
  border, not glass. The rim is a conic gradient masked to the ring: the arris
  facing the light is almost clear, the far edges carry the internal
  reflections, the dispersion gathers in the arcs between. **One light angle is
  a shared token**, so two panes never disagree about where the light is.
- **The loupe refracts; the plate does not.** Bending light is the part of the
  effect that actually registers, and it needs something behind the glass to
  bend. A plate has only the flat ground behind it, so refracting it would do
  nothing but smear the page. The loupe has the magnified drawing on its own
  layer, so it gets a real `feDisplacementMap`: crossed linear ramps encode the
  x and y offsets, a radial core pins the middle back to neutral, and the bend
  concentrates at the rim the way it does in real glass. The map lives in
  `public/glass-displacement.svg` — its R and G channels are **coordinates, not
  colour**, which is why it is not a fourth palette value.
- **Weight limit.** Total painted extent stays under the space between a plate
  and its caption (§3), and every band is drawn below half alpha, so the glazing
  can never read denser than the drawing (principle 1). The test for "too
  heavy": screenshot the gallery and ask whether any edge is visible before the
  work it surrounds.

**Glazing is uniform** across every plate regardless of status. Glazing only
`Enmarcada` works would make half the gallery inconsistent to encode a
distinction belonging to the record, not the object.

**Materials encode categories.** Glass means _the work_ — the plate, the loupe,
anything that is the drawing or an instrument for looking at it. Anything that
is a _record about_ the work — status, metadata, navigation, masthead — is
line-work and type. Reaching for glass on a UI element is a category error.

**The caption block.** Work title (level 3), then the catalogue line (level 5):
one line, slash-separated, year parenthesised — catalogue-like rather than a
stacked block of labelled fields, and nothing after it. Dimensions come from
`formatDimensions()` and are interpolated into a translated sentence whole; the
component never concatenates.

**The list of plates.** The strongest idea taken from the reference: contents,
metadata and navigation in one element. One entry per work — folio in pen, title
and year in ink, at caption size — with folio and title **lined up rather than
stacked**, because a contents page that does not align is just a list.

The entries run in **one full-width line**, not a column, on a **field of
`--color-pen` with the type reversed out in `--color-ground`** — the page's only
solid field, and the amendment principle 1 had to make for it. Light on pen is
8.3:1, the verified pair inverted, so nothing in it may be faded.

**On this field the folio has no colour of its own.** It was set in
`--color-pen-red` while the field was ink, where it measured 4.0:1. On pen the
red is **2.15:1** and the ink **1.86:1** — there is no second readable value in
the palette here, so the folio takes the title's colour and is separated from it
by weight and by its tabular figures instead. That is the cost of the blue
field; the red works only on the dark one.

They are set in the **display face**, like the name above them — without its
wide round alternates, which belong to the name alone — and set **tight**: folio
and title almost touching, entries barely apart, so the band reads as one
running line rather than a row of labels. **The folio is one weight lighter than
the title** — 400 against the strip's 700 — so the number recedes and the title
leads. An earlier build set the folio light against a _heavy_ title and read
badly; the difference is the size of the gap, not the direction of it.

**The line moves, endlessly.** The track holds the list twice and travels
exactly half its own width, so the seam never shows; the duplicate is
`aria-hidden` and out of the tab order, so nothing is announced or focusable
twice. The duration is fixed rather than derived from the content, so adding
works makes the strip longer and its pace slower.

Moving content that starts on its own is governed by **2.2.2**, and it is also
simply hard to click. So: it **pauses on hover, on press-and-hold, and on
focus-within**; it stays a scroll container at all times, so it can be swiped or
wheeled by hand while it runs; and under `prefers-reduced-motion` it does not
move at all, the duplicate is not rendered, and it is an ordinary horizontal
scroll strip. Every entry is reachable in all three cases. The page itself never
gains a horizontal scrollbar, which keeps reflow (1.4.10) intact.

No buttons, no autoplay control, no script — the whole thing is CSS. Every row
links to that work's plate below, scrolling smoothly (§7); rows clear 24px
(2.5.8). **This is the one place links are not underlined at rest:** when every
row is a link the underline is a texture rather than a signal, the list's
semantics carry the affordance, and hover and focus restore the rule. Titles
stay ink — they name specific drawings (principle 2). In Phase 3 the rows
retarget to the detail route and gain a current-item marker; nothing else
changes.

**The plate carries no status mark.** A caption that ends on the catalogue line
reads as a catalogue line; a chip after it reads as commerce, and whether a work
is framed or sold is the record's business, not the plate's.

**Status is data, not a visible mark**, and it stays that way. The field remains
in the schema, `ARTWORK_STATUSES` remains the one enum, `statusLabel()` remains
the one label source, and both still flow into the JSON-LD `additionalProperty`
and `llms.txt` — machine-readable for a curator's tooling, absent from the page.
The Spanish labels stay in `src/i18n/ui/es.ts` because those two consumers use
them. This holds on every archetype, Phase 3's detail page included: no badge,
chip, bracketed note or caption suffix. A page that needs to state availability
is a new decision with its own entry here.

**The contact section.** The last thing the gallery says, sitting between the
closing rule and the colophon: section label, rule, one line of prose at the
measure, then the contact points as links. It is the site's voice, not a work's
— pen, underlined, ordinary body size (principle 2). Its head does **not**
stick: the gallery's head pins because a reader scrolls a long column under it
and needs to know what they are in, and a section three lines tall has nothing
to pin for. Two sticky heads at one offset would also have to negotiate the same
inset, which is a mechanism to maintain for no gain.

The addresses are **data, not strings**: `ARTIST_CONTACT` in `src/site.ts` holds
the mail address and the Instagram handle and URL, the way `SITE_AUTHOR` holds
the credit, and the visible line is a translated template they are interpolated
into. Adding a contact point is one entry there and one key in
`src/i18n/ui/<locale>.ts`.

**Icons are inline line-work SVG, drawn here, and that is the whole policy.**
Each glyph is written into the component as a `<svg>` on a 24 unit box,
`fill: none`, stroked in `currentColor` so it inherits the link's pen and can
never introduce a fifth colour, sized in `em` so it tracks the type it sits
beside. The reasons this beats every alternative, in order: an icon set
(`astro-icon`, Lucide, Simple Icons) is a dependency, and @SECURITY.md prices
those; an icon font ships a face for two glyphs and fails when it does not load;
a sprite or `<img>` costs a request and cannot take `currentColor`. Two glyphs
is not a system — **if a fourth or fifth glyph ever appears, that is the moment
to reconsider, not before.**

Each glyph is `aria-hidden` with `focusable="false"`, because **the label
carries the meaning**: the visible text names the channel and the address, so
nothing is conveyed by the mark alone (1.4.1), and a reader with images off
loses nothing. The underline sits on that label rather than on the link box, so
the rule does not run under the glyph. Rows clear 24px (2.5.8).

The Instagram glyph is **our own line drawing of a camera, not the brand mark.**
The official asset is a filled, gradient-capable logo that would have to arrive
as its own colour and its own file; this is the same shape in the site's
line-work, which is what the material rule asks for — a record _about_ the work
is line and type. If Instagram's brand terms ever require the exact mark, that
is a fourth colour and a fourth glyph at once, and it goes through the same door
as any other palette addition (§3).

**The title card.** The home page's masthead, and the site's one piece of
theatre. The name is **always one line**, sized to fill the width of the page —
never wrapped, never two lines. What changes on scroll is its **font-size**,
falling to `--titlecard-min` over the first screen and then holding while the
page runs on beneath it.

- **It is a sticky bar only as tall as its own text plus padding**, so it costs
  no viewport of its own, and it — with the strip beneath it — must be a child
  of the page's main element: sticky is bounded by its containing block, and
  nested in a section it unsticks the moment that section ends.
- **The name and the list of plates stick as one block.** They cannot be two
  sticky elements: the name's height changes as it shrinks, so anything pinned
  below it at a fixed offset would drift. One sticky wrapper, both inside.
- **Its resting size is the small one.** The large size lives in the keyframe,
  so a browser without scroll timelines — or a reader who has asked for no
  motion — gets a modest bar rather than one permanently covering a quarter of
  the page. Building it the other way round is the obvious mistake.
- **It is the one place the site animates a layout property.** No transform
  reproduces "one line, always filling the page, getting smaller"; a scale would
  change the width too. It is a single text node, and the cost is bounded to it.
- **Its width divisor is tied to one string.** The size is the page's inner
  width divided by the measured advance of _this name_, in this face, in caps
  with the wide round alternates, per 1px of font-size. **Change the artist's
  name and it must be measured again**, or the line stops filling the page. This
  is the only value in the system that depends on its content.

- **The name is the glass.** The page blurs as it passes _behind_ it: a
  translucent ground with a backdrop blur on the title card itself, not a
  blurred band below the whole masthead — under an opaque strip that blurs
  nothing but the content just emerging. The masthead must not be an isolated
  stacking context, or the backdrop root becomes the masthead itself and there
  is nothing behind it to sample.

**The masthead.** On every page but the home page: the artist's name at micro
size, semibold, tracked, in pen, linking home — a running head, not a banner.
**The home page does not carry it**, because there the name _is_ the display
step: the cover sets the name large, interior pages carry the running head. The
two share a `view-transition-name`, so navigating between them morphs one into
the other. The tagline, displaced from the display slot, becomes the statement.

**The colophon (footer).** A section label in pen, the rule, then rights,
licence and the site's own credit at caption size in ink. The credit names
whoever built the site, which is not the artist — it reads from `SITE_AUTHOR` in
`src/site.ts` and its sentence is a translated string with a slot, like the
licence line. The last furniture on the page, and allowed to be the quietest
thing on it.

**The magnifier lens.** §7. Visually it is the glass material above, expressed
as a circle held in the hand rather than fixed over the work.

**Prev/next — Phase 3.** Bottom-right of the detail page, micro size in pen,
each target ≥24×24px (2.5.8). The list of plates with the current work marked is
the primary navigation; prev/next is the shortcut, not the main path.

---

## 7. Motion and interaction

| Effect                | Trigger        | Guard                                      | Cost       | Without it              |
| --------------------- | -------------- | ------------------------------------------ | ---------- | ----------------------- |
| Type entrance (404)   | document ready | reduced-motion                             | CSS        | type already in place   |
| Plate placeholder     | load           | reduced-motion; finite, 8 breaths          | CSS        | a static blurred copy   |
| Scroll reveal         | scroll         | `@supports (animation-timeline)` + r-m     | CSS        | works already visible   |
| Smooth scroll         | list of plates | reduced-motion                             | CSS        | the jump is instant     |
| View-transition morph | navigation     | `@view-transition` opt-in                  | CSS        | a plain navigation      |
| Magnifier             | pointer        | `(hover: hover) and (pointer: fine)`       | **script** | the gallery is complete |
| Title card shrink     | scroll         | `@supports (animation-timeline)` + r-m     | CSS        | a small sticky bar      |
| Plate strip marquee   | none, endless  | reduced-motion; pauses on hover/hold/focus | CSS        | a static scroll strip   |

**The staggered entrance survives only on the 404**, which is the one page that
still opens with a block of type. The home page lost it with the hero: its
opening is the title card's shrink instead. Each element carries its own step
index rather than relying on sibling position, so restructuring a page cannot
silently resequence it, and **total duration including the longest stagger must
not exceed 600 ms** — an entrance must never be what pushes a passing page into
a failing LCP. **Plates never animate on load**, only on scroll.

**The scroll reveal moves, it does not fade.** With `animation-timeline: view()`
opacity is a _function of scroll position_, not a transition that finishes, so a
reader who stops mid-entry rests at whatever contrast the fade is passing
through. Ink needs **0.712** opacity to hold the 7:1 floor and **0.580** to
clear AA at all, so no fade starting at zero is survivable. Flooring the fade
tunes to one palette value and says nothing about the next element put inside a
`.reveal`; transform-only cannot fail, and is the same rule §9 states as "no
muted ink".

**There is no scroll-linked specular.** On a light ground a travelling highlight
reads as a reflex passing over the work rather than as light on glass. **The
glazing is the borders and nothing else**: a contact line inset at the work's
edge and the conic rim just inside it, both static.

**The magnifier — the one script.** Invariant #1 admits exactly one client
script (@SPEC.md, @CLAUDE.md). The effect splits in two, which is what makes it
affordable. **Magnification is not a `backdrop-filter` problem** — that blurs
what is behind an element and cannot magnify. The zoom is a scaled copy: a lens
whose background image is the high-resolution source, `background-size` scaled
up, `background-position` derived from the cursor. **Glass realism is plain
CSS**, from the shared glass tokens. Both work everywhere.

**Refraction runs through plain `filter`, not `backdrop-filter`.** SVG filters
in `backdrop-filter` are Chromium-only (w3c/svgwg#1142), but the loupe carries
the magnified drawing as its own layer, so it never needs to sample what is
behind it.

Two limits. `feImage` with an external reference is unreliable outside Chromium;
where it does not resolve the lens degrades to unrefracted magnification —
complete, just flatter. And **no chromatic aberration**: splitting channels
would fringe the drawing in hues the palette does not contain. Dispersion stays
in the rim, in `--color-pen`.

The refracted view is drawn larger than the lens and clipped back to it, so
bending the rim pulls in real image rather than the transparency outside the
circle, which smears.

**The lens does not appear until its image has.** The detail tier is fetched on
`pointerenter`, so there is a moment when the loupe exists with nothing to show.
It stays hidden through that moment rather than showing an empty or blurred
disc: a lens that arrives before its image reads as broken, not as loading, and
a defocus-while-loading reads the same way. The lens reads heavier than the
glazing, being held in the hand rather than fixed over the work, but from the
same constants multiplied, so retuning the material moves both objects together.

**Shape.** A passive `pointermove` listener on the plate; latest coordinates
applied once per frame in `requestAnimationFrame`, written out as custom
properties so CSS positions via `translate3d` on the compositor. A short lerp
gives the follow lag. No layout reads in the handler.

**It shows that it is waiting.** The glass appears the instant the pointer is
over a plate and pulses while the detail tier is in flight; the magnified view
fades in when it lands. An empty lens reads as broken, but an empty lens that is
visibly waiting reads as loading — which is the difference between the version
that was rejected and this one.

**The lens is the cursor.** While it is up the pointer is hidden, keyed to the
attribute the script sets — so a plate whose lens never initialises keeps an
ordinary pointer rather than none at all. When plates become links in Phase 3,
check this again: a link with no visible cursor is a different question.

**Constraints.** Gated to `(hover: hover) and (pointer: fine)`, so touch devices
never instantiate it. Under reduced motion the lag is removed and the lens snaps
to the pointer — the lag is decoration, the lens is a tool. Dismissible with
Escape (1.4.13). Progressive: the gallery is complete with the script absent,
blocked or failed, and the lens reveals nothing that exists nowhere else — it
shows the same pixels larger, which is what keeps it compliant. It needs the
detail tier (§8), fetched on `pointerenter`, not upfront; magnifying the gallery
derivative shows upscaling artifacts, not hatching, so the lens and the second
tier are one decision. Budgeted at **3 KB minified** — enforced on the source at
4 KB, since tests do not build; it currently ships at about 1.2 KB (§10). No
dependency: GSAP is ~70 KB gzipped to interpolate two numbers and every
dependency is supply-chain surface under @SECURITY.md; this is ~3 KB of vanilla
JavaScript.

**Its accessible equivalent is the detail page, which does not exist yet.** It
ships now because it reveals nothing new, and because holding it would leave the
detail tier unexercised and therefore unverified. The gap is recorded in §10.

## 8. Image resolution

Two committed derivative tiers. Originals never enter the repo — a hard rule in
@CLAUDE.md — and the source folder arrives only through `ARTWORK_ORIGINALS` in a
local `.env`; never hardcode a path into a committed file.

- **Gallery tier**, unchanged: 2000px max edge, WebP, `src/assets/artworks/`.
  2400px was tried and blew the budget on the scanned bond-paper work.
- **Detail tier**, new: **3000px max edge**, WebP,
  `src/assets/artworks/detail/`. Chosen from the lens, not from a round number:
  a plate renders near 900 CSS px, so a 3000px source gives the loupe about 3.3×
  — enough to resolve individual pen strokes at true source pixels. Its budget
  is **2.5 MB** per file, its own threshold, not a loosening of the gallery
  tier's.

Both budgets are exported constants in `scripts/optimize-images.mjs`, imported
by the tests, never numbers written twice. Existing gallery assets do not move —
collection entries reference their paths.

**The pairing is derived, not authored.** `src/artworks.ts` globs the detail
directory and matches by slug, so no YAML field, no schema change and no chance
of a work shipping half-configured. A test asserts both tiers exist for every
work, with no orphans on either side.

**Repo-size consequence:** two tiers put artwork assets at roughly 10 MB.

---

## 9. Anti-patterns

**The magnifier sets no precedent.** It is the only sanctioned script because it
delivers something CSS cannot express at all — a lens tracking a pointer — and
because the gallery is complete without it. Where an interaction seems to need a
script, the answer is almost always a real URL and a prerendered page, which is
what the detail page already is. Test-enforced.

**No second script, no framework, no animation or utility library.** Zero
hydration, zero client runtime beyond the lens; a library that interpolates two
numbers costs more than the feature.

**No icon set, icon font or sprite sheet.** The two contact glyphs are inline
SVG in the component, stroked in `currentColor` (§6). A library for them is a
dependency, a font for them is a face, and both lose the palette's guarantee.

**No lightbox or modal viewer.** It is a page pretending to be a page. The
detail route is a real URL: linkable, indexable, shareable with a curator, and
free.

**No client-side router.** It breaks cross-document view transitions, which are
the motion system, and it is a runtime the site does not have.

**No dark mode, and no fifth colour** — not for a scrim, a shadow, a disabled
state or a lens rim. A printed object has one ground. The palette went from
three to four once, to fix a measured contrast failure, and the new value came
bounded to large text on dark grounds (§3). That bound is the price of a new
value. Test-enforced.

**Never crop or distort the work.** A slot bounds width; the plate takes the
work's proportion. A work that does not fit becomes smaller, never tighter.

**No muted ink.** Fading ink to build hierarchy fails AA. Use weight, size,
space or a rule.

**No hardcoded user-facing string.** Every text element gets a key in
`src/i18n/ui/<locale>.ts`, furniture included — running heads, section labels,
folio prefixes, the colophon.

**No string-concatenated dimensions.** `formatDimensions()` owns the whole
string; it is interpolated into a translated sentence as one unit.

**No token values restated outside `global.css`**, and no token table in this
file. Two copies of a value is two values the moment one is tuned.

**No committed originals, no host install.** Docker is the only local surface.

---

## 10. Guards and outstanding

### Test-enforced rules

Load-bearing; everything else here is advisory prose.

| Guard                                                | Test                    |
| ---------------------------------------------------- | ----------------------- |
| No colour literal under `src/` outside `@theme`      | `tests/design.test.ts`  |
| Exactly one client script, within its byte budget    | `tests/design.test.ts`  |
| Every `animation` sits inside a reduced-motion guard | `tests/design.test.ts`  |
| Both image tiers, own budgets, no orphans            | `tests/content.test.ts` |
| No face ships `font-display:auto`                    | `ci.yml`, post-build    |
| Every published URL gets its CSP header              | `ci.yml`, post-build    |

The colour guard allows derived forms — any colour function whose arguments
reference a `--color-*` token — because the glass edge needs alpha variants of
ink and pen. It refuses bare hex, bare colour functions and named colours; a
fourth colour arrives as a plausible one-off, and the guard is what catches it.
Judgement is deliberately untested — whether the cadence feels composed, whether
the glazing is too heavy, whether a heading is too loud. A guard that produces
false failures gets deleted and takes its real coverage with it.

### Outstanding

Specified here, exercised by no page yet; the structure phase inherits these.

- **The about archetype** (§5). Needs `about.title`, `about.heading`,
  `about.statementLabel`, `about.biographyLabel`, and a portrait asset.
- **The detail archetype** (§5) and **prev/next** (§6). Needs
  `detail.plateLabel`, `detail.prev`, `detail.next`, `detail.record`.
- **The magnifier's accessible equivalent.** Until the detail page exists,
  keyboard and touch users have only browser zoom. Closed by Phase 3.
- **The list of plates becomes route navigation**, with the current work marked.
- **Glazing on a second page type.** Only the gallery exercises it today.

---

## 11. Open questions

**How wide should the common measure be?** One token, trading magnificence
against seeing a work whole: at its current value a portrait work is taller than
a laptop viewport. Revisit when the detail page ships, since that is the page
whose job is seeing a work whole.

**Does the gallery keep a visible section label?** On a page whose whole body is
the gallery, "Obra" names the obvious. Keep it for now: it is the seam where a
second section — a series, a year range — attaches, and removing it is one line.

**Does the two-tier pipeline want its own skill?** It lives in `add-artwork`
today. Leave it there until a second operation needs it — a skill per procedure
is cheaper than a skill per file.
