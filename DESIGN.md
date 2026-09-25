# eduardopavon.co — design system

The single source of design **intent**. `src/styles/global.css` is the single
source of design **values**; this file never restates one, with the palette as
the stated exception. Roadmap: @SPEC.md · Hard rules and seams: @CLAUDE.md

**There is no token table here.** The usual `DESIGN.md` embeds the token set
because nothing else holds the values; here a live `@theme` sits one file away,
and a copied scale drifts on the first tune.

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
optically. _Loses to:_ the masthead, which is a solid pen band — hence "in the
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
interaction is a convenience, not a route to content. _Loses to:_ the follow
lag, pure decoration and the first thing removed under `prefers-reduced-motion`.

---

## 3. Foundations

Accessibility is a constraint inside each foundation, not a later section. WCAG
2.2 AA is the hard floor site-wide — the artist's market is European and EN 301
549 is built on it. Body and caption text hold **7:1** (AAA 1.4.6).

### Colour

Closed at **five** values, stated literally here and only here, because the
exact values _are_ the argument. Two of the five are bounded rather than
general, and each bound is the reason its value was admitted at all.

| Token              | Value     | Role                                        |
| ------------------ | --------- | ------------------------------------------- |
| `--color-ink`      | `#030A77` | the work's voice: body, captions, metadata  |
| `--color-ground`   | `#F1FFEB` | the page, everywhere, the only ground       |
| `--color-pen`      | `#0000FF` | the site's voice: a literal Bic barrel blue |
| `--color-pen-red`  | `#F52742` | the secondary accent, for dark grounds only |
| `--color-pen-pale` | `#90B6FF` | scrollbars only, and never text             |

`global.css` is authoritative from here on. Verified against the ground: ink
**15.4:1**, pen **8.3:1** — both AAA at any size, so blue is safe at caption
size, not only for headings. Re-verify if a value changes.

**`--color-pen-red` is declared and unused.** It exists for an ink field, where
it measures 4.0:1; the list of plates is a pen field, where it is 2.15:1. It is
kept so an ink field can return, and a value nothing references invites misuse,
so the bound below governs it.

**It is a large-text-only colour, and that is not a style note but its whole
licence to exist.** Measured: **4.0:1 on ink**, **3.85:1 on ground**, **2.15:1
on pen**. Four-to-one clears AA for large text — 24px and up, or 18.7px bold —
and clears nothing else. So: it may carry display-sized type on an ink field,
and nothing else. It may **not** be used for body or caption text on any ground,
it may not be used on pen, and on the light ground it is large-text-only as
well. Reach for it below 24px and the page fails AA.

**`--color-pen-pale` is the scrollbar, and it is a non-text colour.** It is
`--color-pen` lightened along its own hue — `oklch(0.78 0.12 264.05)` against
the pen's 264.05 — so the bar reads as the site's blue and not as a second
accent. Measured: **4.22:1 on pen**, **1.96:1 on ground**, **7.86:1 on ink**.

_The failure it solves._ The thumb is `--color-pen`, which clears the ground at
8.3:1. The **track** is the problem. A scrollbar is a UI component and owes
**3:1** (1.4.11), so the track must hold that against the thumb — and it must
differ from the page as well, or there is no channel for the thumb to run in.
Ink measures 1.86:1 against pen and pen-red 2.15:1, so neither can be the track;
ground clears pen at 8.3:1 but _is_ the page, so it fails the second test
outright. No existing value passes both, and the two together are what set this
value's lightness.

_Its bound._ It may paint a scrollbar's thumb and track and nothing else. It may
**not** be text at any size — 1.96:1 on the ground and 4.22:1 on pen fail every
text threshold. It may **not** be a ground for text: ink on it measures 7.86:1
and would pass, which is exactly the temptation, and a fifth value that can host
type becomes a second ground on a site that has one. It may not paint a rule, a
border, a field or a glass band; each of those already has a value. Put it
anywhere a reader has to read, and the page fails.

**Hierarchy comes from weight, size, space and rule** — how printed books have
always built it — never from fading ink, which collapses contrast (~3.5:1 at
50%, failing AA). **The ladder**, six levels, no grey:

| #   | Role             | Size    | Weight  | Case     | Colour |
| --- | ---------------- | ------- | ------- | -------- | ------ |
| 1   | display          | display | heavy   | upper    | pen    |
| 2   | section label    | label   | bold    | upper    | pen    |
| 3   | work title       | lede    | bold    | sentence | ink    |
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
underlined — meaning is never colour alone (1.4.1) — with two stated exceptions,
both in §6: the list of plates, and the running head, which is the logo.

**Focus** (2.4.11 / 2.4.13) is two-ply: an inner ring in `--color-ground` inside
an outer ring in `--color-ink`, so one ply always contrasts — against the
ground, against a drawing, against a blue field. No new colour, and the only
element allowed to be louder than the work.

**To add a sixth: the door is narrow and it is not the one you want.** A new
value for a scrim, a shadow, a disabled state or a lens rim is refused by test
(§10) — the guard admits only literals inside `@theme`, so adding one is a
deliberate act with a diff, not a one-off. Pen-red and pen-pale were each
admitted the same way: a measured contrast failure no existing value solved, and
a written rule naming where the new value may not go. That is the whole price of
admission, and the bound is the expensive half. A value proposed without one is
refused whatever it measures.

### Typography

**One family, two roles, and the split is the same one the palette makes.**
Everything is Polymath Text. `--font-display` is its **Super** weight (900), and
it is the site's voice: the display step, section labels, the list of plates,
the colophon. `--font-text` is the same family at 400 and 700, and it is the
work's voice: prose, work titles, catalogue lines. One family cannot separate
the two by letterform, so **weight and case** carry the split: the site speaks
in Super capitals, the work in sentence case at 400 and 700. A screenshot with
the colour removed still tells the catalogue from the catalogued, because
nothing describing a specific drawing is ever set in Super or in capitals. The
name is not type at all: it is the logo (§6).

**Three weights exist and each belongs to one role.** Super belongs to the
display role and is the only weight it sets. The text role has exactly **400 and
700, plus both italics**, and its hierarchy is carried by size, space and
**italic**, not by weight. Asking either role for anything else gets the nearest
real weight or a synthesised one: a display element asking for 700 silently
renders 900, and a text element asking for 500 or 600 gets a different
letterform badly drawn. Italic has one standing job: a plate's descriptive line,
where a catalogue has always used it.

**Super is a subset without substitutions.** The kit serves it with kerning but
no GSUB, so it has no tabular figures, no case forms and no stylistic sets.
Anything that must align figures sets in the text role: the folios in the list
of plates are Bold for that reason.

**The display role has a floor: 24px**, the size at which WCAG counts text as
large (the same threshold that bounds `--color-pen-red`). The floor is set by
role, not by legibility: Super still reads as type below it, but the site's
voice is always large text, and a Super capital small enough to sit in a line of
body copy is furniture pretending to be a heading. No step the display role uses
may fall under the floor; test-enforced (§10). The consequence is a real
constraint, not a note: **the display role cannot do small furniture.** Anything
that has to be small belongs to the text role.

**Three text steps** — caption, body, lede — a major third (1.25) apart. The
display role does not use them: it has **two optical steps of its own**,
`--text-label` and `--text-strip`, set by what each has to do rather than by a
ratio, plus `--text-display`, which is fluid because its size is the measure it
must fill. The two optical steps are set against the collapsed logo: each must
stay visibly quieter than the name. A fourth text step or a third display step
needs a role no current one serves — not something that looks slightly too big.
A step that stops being used gets deleted: a token nothing references is one
more thing to keep true.

Relationships that live nowhere in CSS:

- Display is the only step whose leading is below 1.0× its own size. A heavy
  blue display at normal leading reads as a banner, not a title page.
- The catalogue line sits one step below body and shares body's leading, so a
  caption block is a whole number of body lines. Every vertical space derives
  from that unit.
- The prose measure caps near 66 characters. It binds the about archetype and
  the statement, and it is why captions are never centred.

Text-spacing overrides (1.4.12) must break nothing: no step sets line height in
px, and no box holding text has a fixed height.

**Delivery.** Polymath Text is an Adobe Typekit family, **self-hosted at build
time** through Astro's Adobe provider — `fontProviders.adobe({ id })` against
the kit id, in `astro.config.ts`. A runtime `use.typekit.net` stylesheet would
cost render-blocking requests on a third-party origin, no fallback metrics, and
every visitor's IP sent to Adobe; self-hosting removes all three. `font-display`
needs its own fix, below.

The family is requested as **two entries**, one per role: Super roman alone for
the display role, so no Super italic ships, and 400/700 with italics for the
text role. Astro hashes each entry's name, so both can be called Polymath Text.
Each gets **generated fallback metrics** of its own, so the swap cannot shift
layout; that is the one property the self-hosted files must keep.

**`font-display: swap`, and the config must be what decides it.** Typekit
publishes its kit CSS with `font-display: auto`, the Adobe provider reads that
value out of it, and Astro resolves a provider's value ahead of the configured
one — so a face ships `auto`, which Chrome treats as block, unless the provider
value is dropped. `astro.config.ts` drops it. Only the _generated fallback_
faces carry `swap` on their own, so built HTML showing both values is the
symptom of this going wrong. A CI step fails if any page ships
`font-display:auto`.

**No face is preloaded.** The largest paint is never display type: it is the
lede, set in the text role, or the first plate. Under swap it paints in the
fallback first, and a preload only competes with it for the connection; measured
on a throttled connection, every preload made the LCP later.

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
universal, inside `@supports` too, so content is never stranded invisible.
Test-enforced (§10).

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
(`:nth-last-child(1)`), turning "it stopped" into "it ended": in a book, a
chapter ending.

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

**Structure.** A **masthead** that stays: the logo filling the width of the
page, with the **list of plates** as a pen band directly beneath it. The two
stick together and the logo shrinks inside them. Then the **statement** — the
one element at the top of the page that scrolls away, which is what tells the
reader the page has started moving: large, centred, in caps. Then the gallery:
section label, rule, and a single column of plates at the common measure. Then
contact, then the colophon.

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

**Job:** deliver the pen. Where hatching is legible, and where keyboard users
get what the magnifier gives mouse and touch users.

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
the heading and message in ink, the return link. No artwork — a 404 that shows
work rewards a broken link, and the reader is one click from all of it.

---

## 6. Components

**The glazed plate.** The work as an object: a wrapper carrying the work's exact
aspect ratio from the asset's intrinsic dimensions, the image absolutely
positioned inside with `object-fit: contain`, the glazing painted inside it.

**Its corners carry a small radius**, and the glazing's rim follows it, because
a polished sheet does not end in four points. It is the one place the plate
touches the work: the plate clips, so the radius removes `r²(1 − π/4)` of each
corner — at the value that ships, about **8px² per corner, 0.007% of a gallery
plate**, all of it blank margin. That is a rounded edge on the sheet, not a crop
of the composition, and the rule it reads against (§9) exists to stop a work
being tightened to fit a frame. **The bound is that the radius may never grow
past the point where it is doing anything but softening the sheet's own edge**;
it is not a place to express a house style.

Four layers, all positioned, so **every one states its z-index**: the
placeholder (0), the image (1), the rim (2), and the lens (3) above them all.
Leaving any of them on `auto` puts it in DOM order.

**Every plate carries a blurred placeholder** — a copy of the work 20px on its
longest edge, generated by the import script, inlined as a data URI and blurred
on its own layer so the blur never touches the drawing. It breathes slowly while
it waits. The real image is opaque and exactly the same proportion, so it covers
the placeholder the moment it paints: no load hook, no script, nothing to clean
up. A plate with no placeholder falls back to a wash of ink. The plate
**clips**, because the placeholder's blur would otherwise spill past it. That is
not a crop: the box takes its ratio from the asset, so the image can never
exceed it. States: rest; hover or a still hold (the magnifier engages; under a
mouse the cursor hides); reduced motion (no pulse, no lag).

**The glass material.** One material, three objects: the **glazing** fixed over
a plate, the **loupe** held over the work on hover, and the **title bar** the
page passes beneath. They share tokens — pane thickness, dispersion spread, the
alphas the edge is drawn with, and one light angle — so retuning one provably
retunes the other. If a future session can change the loupe without the glazing
following, this has failed. **The check is mechanical:** move `--glass-light` by
30deg and every edge, highlight and shadow on both objects turns with it. A
value that does not turn is a value that has been written by hand.

**Two objects, named, and every value answers to one of them.** The plate is a
sheet of low-iron float glass **lying flat on the paper**. The loupe is a
plano-convex lens **held a couple of centimetres above it**. If a value about to
be written does not correspond to something one of those two objects does, it
does not get written.

Glass over a flat ground is invisible; all the information is at the edge.
Therefore:

- **The plate is four cues and a field that carries nothing.** In order, from
  the outside in: a **contact occlusion**, the light that cannot reach the gap
  under the edge, which is the cue that says _lying on_ and the strongest one
  the plate has; the **contact line**, a 1px hairline where the polished edge
  meets paper and the darkest single mark in the material; the **bevel**, a
  **hairline** falling off around the perimeter on a Fresnel curve; and the
  **edge tint**, which belongs in the bevel band and nowhere else because glass
  is coloured through its thickness. **The bevel is a hairline.** Drawn as a
  soft band several pixels wide it reads as a drawn border, and on a work with
  white paper around it that band stands on the drawing. Seen from directly
  above, a polished float-glass edge is a thin line. The weight belongs outside,
  in the occlusion. Everything but the occlusion is inside the work's bounds. It
  is a light overlay, never a displacement — **the plate does not refract, so
  the work is never distorted**, and that is the part of the promise that does
  not bend.
- **The field carries nothing at all.** Two surfaces reflect about 4% each, so a
  veiling lift of a couple of percent would be physically honest — and the
  falsification test below forbids anything the eye can find there, so the
  answer is zero and the plate spends no layer on it. If you can see where the
  glass is by looking at the middle of a plate, it is wrong.
- **No `backdrop-filter` on a plate.** There is nothing behind a plate to
  refract. It earns its keep only where the page genuinely scrolls beneath
  something: the title card and the section head, both sticky. Those two, and
  nothing else.
- **Over a near-white ground glass reads as dark line-work, not a glow.** The
  ground sits near 0.96 relative luminance — no headroom, and a highlight cannot
  be brighter than the page. The plate edge is therefore drawn with _darker_
  marks, which is why the glazing needs no white specular and no new colour.
  **The loupe is the exception**: it sits over the drawing, not over the ground,
  so it _does_ have headroom, and a bright arris opposite a dark one is most of
  what reads as glass there.
- **The glazing is quiet in the field and definite at the edge.** Over a flat
  near-white ground there is nothing to see but the edge, so that is where the
  weight goes: the contact line is the one mark allowed to be frank, and the
  bevel stays faint enough that it is read rather than noticed. The limit is not
  an alpha cap but **principle 1**, checked by the falsification test below.
- **Dispersion resolves toward the accent.** Real glass fringes cyan and green;
  here the fringe is `--color-pen`, so this glass disperses toward ballpoint
  blue. A deliberate substitution, not an approximation.
- **One thing is painted outside the plate, and only one.** A **contact
  occlusion**: tight, dark, offset along the light, and never wider than the
  pane. A **soft outer cast** is refused: a shadow that reads as thrown reads as
  furniture around a picture rather than as glass on one. The difference is
  extent, so extent is the rule: past the pane's own thickness it has stopped
  being contact and started being cast.
- **The edge varies around the perimeter, and it varies steeply.** A ring of
  constant weight is a border, not glass; a ring that fades evenly from one side
  to the other is a gradient, which is only slightly better. Real reflectance
  climbs at grazing angles, so the falloff is a **Fresnel curve**: near-clear
  across a wide arc around the lit arris, then most of the change crowded into
  the last part before the far edge, which carries the internal reflection. The
  rim is a conic gradient masked to the ring, and the dispersion gathers in the
  arcs between. **One light angle is a shared token**, so two panes never
  disagree about where the light is.
- **The loupe refracts; the plate does not.** Bending light is the part of the
  effect that actually registers, and it needs something behind the glass to
  bend. A plate has only the flat ground behind it, so refracting it would do
  nothing but smear the page. The loupe has the magnified drawing on its own
  layer, so it gets a real `feDisplacementMap`, and **the map is a lens profile,
  not a prism**: displacement is a function of _radius_, ~zero through the
  middle and rising steeply over the last fifth, so the magnified image visibly
  compresses as it approaches the rim. That compression is what makes a circle
  read as a lens rather than as a cropped zoom, and it is worth more than any
  amount of rim decoration. Crossed linear ramps give the radial direction, a
  radial overlay gives the magnitude.
- **The bend is a cue, and it has a ceiling.** The lens exists to show how the
  pen was handled, so a stroke near the rim must still read as that stroke. The
  compression only has to be enough that straight strokes visibly curve toward
  the edge; past a few pixels it stops saying "glass" and starts hiding the
  hatching the lens was raised to show. The ceiling is the filter's `scale`, and
  it binds hardest on the touch lens, where the same pixels are a larger share
  of a smaller radius. The map lives in `public/glass-displacement.svg` — its R
  and G channels are **coordinates, not colour**, which is why it is not a
  palette value.
- **The map's geometry is tied to one ratio, and it is the one place a CSS value
  is restated outside `global.css`.** The stretched map covers the padded view,
  not the visible disc, so the profile has to be drawn to the ratio
  `(--loupe-size / 2) / (--loupe-size / 2 + --loupe-pad)`. Get it wrong and the
  whole bend lands outside the circle and the lens reads flat, which is a silent
  failure with no error anywhere. **`--loupe-pad` is therefore derived from the
  size, never set on its own**, so every lens size lands on the ratio the map is
  drawn to and a second size needs no second map. A custom property computes
  where it is declared, so a lens size is only ever set on `:root`, by input,
  where the one derivation can follow it. Change the derivation and redraw the
  file; the ratio and the reason are written at the top of it.
- **`--loupe-pad` is a budget, not a margin.** It must exceed the largest
  displacement, so the rim bends real image rather than the transparency outside
  it — and no more than that, because the filter runs over that whole box on
  every pointer frame. Derived from the size, that is a floor under the lens: a
  lens too small for its pad to clear the displacement has no room to bend.
- **Weight limit, and how it is checked.** Total painted extent stays under the
  space between a plate and its caption (§3). Beyond that the rule is principle
  1 and the **falsification test**: screenshot a plate, mask the outer 3% of the
  box, and compare what is left against the bare drawing — they must be
  indistinguishable. Then look at the unmasked edge and say which side the light
  is on without checking the token. Both must pass. The loupe's test is its own:
  hold it over hatching and straight pen strokes must bend continuously as they
  approach the rim, with no seam at the clip boundary. A seam means the view is
  not drawn far enough beyond the circle before clipping.

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
metadata and navigation in one element. One entry per work — folio, then title
and year — with folio and title **lined up rather than stacked**, because a
contents page that does not align is just a list.

The entries run in **one full-width line**, not a column, on a **field of
`--color-pen` with the type reversed out in `--color-ground`** — the page's only
solid field, and the exception principle 1 makes for it. Light on pen is 8.3:1,
the verified pair inverted, so nothing in it may be faded.

**On this field the folio has no colour of its own.** On pen the red is
**2.15:1** and the ink **1.86:1** — there is no second readable value in the
palette here, so the folio takes the title's colour and is separated from it by
weight and by its tabular figures instead. The red works only on an ink field.

The titles are set in the **display role**, Super capitals, and set **tight**:
folio and title almost touching, entries barely apart, so the band reads as one
running line rather than a row of labels. **The folio is one weight lighter than
the title** — Bold against Super — so the number recedes and the title leads. It
sets in the text role, because Super has no tabular figures (§3); its line box
is held inside the title's, or two faces' metrics on one baseline grow the strip
past the sum `--masthead-collapsed` is built from. A wider gap reads as two
labels, not one line.

**The line moves, endlessly.** The track holds the list twice and travels
exactly half its own width, so the seam never shows; the duplicate is
`aria-hidden` and out of the tab order, so nothing is announced or focusable
twice. The duration is fixed rather than derived from the content, so adding
works makes the strip longer and its pace slower. It is tuned to hold about 40px
a second over today's list; a wider face or a larger strip step changes the
pace, so retune it with them.

**It is a marquee or a scroll strip, and never both at once.** The two cannot
share one element: the track's translate and the container's scroll offset
compound, and once the sum passes one list width the loop runs off the end of
its own duplicate and shows empty field. No number of duplicates fixes that —
the overshoot is always exactly the distance the track travels — so the pointer
decides which of the two the reader gets.

- **Where hover exists**, it is a marquee. It **pauses on hover, on
  press-and-hold, and on focus-within**, and it is not draggable: hover is what
  makes an undraggable marquee acceptable. It stays programmatically scrollable,
  so a focused row is still scrolled into view, and because the tab order
  contains only the real list and not the duplicate, focus can never carry it
  past the safe offset.
- **Where hover does not exist**, and under `prefers-reduced-motion`, it does
  not move at all, the duplicate is not rendered, and it is an ordinary
  horizontal scroll strip. On touch that is the better object anyway: swiping a
  line that is moving under your thumb is the problem 2.2.2 is about.

Every entry is reachable in both. The page itself never gains a horizontal
scrollbar, which keeps reflow (1.4.10) intact.

**Its block axis is explicitly `hidden`.** `overflow-x: auto` alone makes the
block axis a scroll container as well, which puts a second scroll target under
the pointer at the top of every page in exchange for nothing: the strip has
nothing to scroll vertically.

No buttons, no autoplay control, no script — the whole thing is CSS. Every row
links to that work's plate below (§7, the arrival); rows clear 24px (2.5.8).
**This is the one place links are not underlined at rest:** when every row is a
link the underline is a texture rather than a signal, the list's semantics carry
the affordance, and hover and focus restore the rule. In Phase 3 the rows
retarget to the detail route and gain a current-item marker; nothing else
changes.

**The plate carries no status mark.** A caption that ends on the catalogue line
reads as a catalogue line; a chip after it reads as commerce, and whether a work
is framed or sold is the record's business, not the plate's.

**Status is data, not a visible mark**, and it stays that way. The field remains
in the schema, `ARTWORK_STATUSES` remains the one enum, `statusLabel()` remains
the one label source, and both still flow into the JSON-LD `additionalProperty`
and `llms.txt` — machine-readable for a curator's tooling, absent from the page.
The labels stay in the message files because those two consumers use them. This
holds on every archetype, Phase 3's detail page included: no badge, chip,
bracketed note or caption suffix. A page that needs to state availability is a
new decision with its own entry here.

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
never introduce a sixth colour, sized in `em` so it tracks the type it sits
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
is a sixth colour and a third glyph at once, and it goes through the same door
as any other palette addition (§3).

**The scrollbar.** Site-wide furniture: a `--color-pen` thumb running in a
`--color-pen-pale` track (§3). The colour is declared on `:root` and inherits,
so a scroll container added later is already the right pair; **`scrollbar-width`
does not inherit**, so every container restates it, and one that forgets takes
the platform's full-width bar.

**`thin`, not `auto`.** A site whose only rules are hairlines should not carry a
17px bar down its edge.

**No `::-webkit-scrollbar` rule may draw a bar.** Declaring one opts Blink and
WebKit out of overlay scrollbars and into classic ones that take real layout
width — on a phone, a gutter appearing inside a 320px viewport, against a design
that guarantees one column and no horizontal scroll (§3). The standard
properties do not do that. The single permitted use is `display: none`, which
removes a bar rather than sizing one, and it has exactly one caller. The cost of
the rule is that a browser too old for `scrollbar-color` gets the platform's own
bar: complete, just not blue, which is how everything else here degrades.

**No `scrollbar-gutter`.** Nothing on any page toggles its own overflow, so
there is no width to reserve against — a stable gutter would only add a
permanent empty channel to the one page short enough not to scroll.

**The marquee hides its bar, and that is the rule for it rather than an
omission.** The strip is already a line in motion; a bar beneath it is a second
thing moving, at a different rate, in the only place on the site where anything
moves on its own. It stays a scroll container — swipeable and wheelable while it
runs, still pausing on hover, press-and-hold and focus-within — it simply does
not draw one. Its height is load-bearing too: a visible bar makes the strip
taller than the sum `--masthead-collapsed` is built from, and the sticky section
head below pins to that sum.

**The title card.** The home page's masthead, and the site's one piece of
theatre. The artist's name is **the logo**: a drawn mark, one path, filled in
`currentColor` so it is `--color-pen` like every other piece of the site's
voice. It is **always one line** and its proportion is fixed. At the top of the
page it spans the title card's content box; over the first third of a screen it
shrinks to its collapsed size and then holds while the page runs on beneath it.

- **Its proportion is the viewBox, 1017 × 140, and nothing may distort it.** The
  mark is sized by width and its height follows from the ratio; there is no
  `preserveAspectRatio="none"`, and the viewBox is never cropped, because the
  capitals sit centred in it with the accent in the top band. Every size in the
  masthead sum derives from `--logo-ratio`.
- **Its width comes from its container, never from `100vw`**, which counts a
  classic scrollbar. The title card's content box is `<main>`'s width less the
  margins, so `<main>` is the query container the sums measure.
- **The collapsed size is the smaller of `--logo-collapsed` and the full-width
  size.** At 320px the content box is 280px and the full-width logo is 38.5px
  tall, below the collapsed size, so there it does not shrink at all and it
  never overflows. The collapsed size was chosen against the strip: the name's
  capitals must stay larger than the strip's, or the contents out-shout the
  artist.
- **It is a sticky bar only as tall as its own mark plus padding**, so it costs
  no viewport of its own, and it — with the strip beneath it — must be a child
  of the page's main element: sticky is bounded by its containing block, and
  nested in a section it unsticks the moment that section ends.
- **The logo and the list of plates stick as one block.** They cannot be two
  sticky elements: the logo's height changes as it shrinks, so anything pinned
  below it at a fixed offset would drift. One sticky wrapper, both inside.
- **The sticky stack is a sum, and every offset reads it.**
  `--masthead-collapsed` is the collapsed logo, the title card's padding and the
  strip's line box and padding; the section head pins at it, and a strip jump
  lands a row below it and the section head. The mark is `display: block`, or it
  sits on a baseline with a descender gap under it that no token accounts for.
- **A jump carries the collapse still to come.** A jump's target is fixed when
  it starts, while the logo may still be large, so the plates' scroll margin
  runs on the same scroll timeline and adds whatever the logo has yet to lose.
  From the top of the page or from mid-page, a work lands in the same place.
- **Its resting size is the small one.** The large size lives in the keyframe,
  so a browser without scroll timelines — or a reader who has asked for no
  motion — gets a modest bar rather than one permanently covering a quarter of
  the page.
- **It is the one place the site animates a layout property.** A transform would
  scale the mark but not the sticky bar around it, and the section head pinned
  under it would drift. It is a single element, and the cost is bounded to it.
- **The name stays text.** The mark is `aria-hidden`; the `<h1>` holds the name
  in a visually hidden span, so readers and crawlers get "Eduardo Pavón" and the
  drawing is not asked to carry it.

- **The name is the glass.** The page blurs as it passes _behind_ it: a
  translucent ground with a backdrop blur on the title card itself, not a
  blurred band below the whole masthead — under an opaque strip that blurs
  nothing but the content just emerging. The masthead must not be an isolated
  stacking context, or the backdrop root becomes the masthead itself and there
  is nothing behind it to sample. `<main>`'s container type is containment, not
  a backdrop root, so the glass still samples through it.

**The masthead.** On every page but the home page: the logo, in pen, linking
home — a running head, not a banner. **The home page does not carry it**,
because there the logo _is_ the title card: the cover sets it large, interior
pages carry the running head at the collapsed size. The two share a
`view-transition-name`, set on the mark itself on both pages, so the morph is
one box of one proportion scaling, never a stretch. The link's box is exactly
the mark's, it clears 24px at every width (2.5.8), and it takes the two-ply
focus ring. **It is the second link that is not underlined**: a drawing cannot
carry an underline, and it is a standalone link rather than a link inside text,
which is what 1.4.1 concerns. Its accessible name is the visually hidden name.

**The colophon (footer).** A section label in pen, the rule, then rights,
licence and the site's own credit at caption size in ink. The credit names
whoever built the site, which is not the artist — it reads from `SITE_AUTHOR` in
`src/site.ts` and its sentence is a translated string with a slot, like the
licence line. The last furniture on the page, and allowed to be the quietest
thing on it.

**The language switcher.** The colophon's last line: one entry per locale, each
named in its own language and carrying its own `lang`, so a reader finds their
language whichever edition they are in. Built from the locale list by
`getLanguageLinks()`, so adding a language adds an entry and nothing else. It is
furniture, so pen, at caption size in the text face. The other editions are
plain `<a href hreflang>` links, underlined; the current one is not a link, and
is marked by weight (700) and the missing underline, never by colour alone
(1.4.1). Rows clear 24px (2.5.8). No flags — a flag names a country, not a
language — no menu, no script.

It links **the same page** in every edition, not every edition's home: that is
what makes it a crawlable path between language versions rather than a second
masthead. The one exception is a missing page, which has no other edition, so
the 404 offers each home instead.

It sits in the colophon, not the masthead, because the home page's masthead is
the title card, whose one line is sized to fill the page and has no room for a
second element (§6).

**The site icon.** A detail of _Sin título_ — the head and its headphones — and
the one place a work is shown cropped. An icon is a mark, not a reproduction: it
stands for the site in a tab, a bookmark or a home screen, where no whole work
survives at 16px, and no reader takes it for the drawing. That is the bound:
**the crop may appear only as the site icon**, never on a page, in an OG image
or in structured data, where a reader is looking at the work.

It is derived, not authored: `scripts/generate-icons.mjs` cuts it from the
committed detail tier at recorded coordinates, so it cannot drift from the work.
**Where an icon needs padding** — the iOS touch icon and the maskable safe zone
— the padding is more of the drawing, from a wider crop on the same centre,
never a fill: a fill would be a colour outside the palette. For the same reason
there is no `theme-color` and the manifest carries no colours. The manifest's
`display` is `browser`: a home-screen icon opens the site, not an app.

**The magnifier lens.** §7 owns its behaviour. Visually it is the glass material
above, expressed as a plano-convex lens held above the paper rather than a sheet
resting on it — which is the whole reason it is allowed to be brighter and
heavier than the glazing. **It sits over the drawing, not over the ground, so it
has the headroom the plate does not**, and it spends it on five things, in
descending order of how much each is worth:

1. **The lens profile** (§6, the map), and **the edge compression** that follows
   from it. This is the effect; the rest is trim.
2. **A bright arris and a dark one** — a narrow near-white crescent on the lit
   side against a narrow dark crescent opposite. The plate may not do this.
3. **A secondary reflection**, a fainter ring inboard of the primary at about a
   third of its alpha, because a real pane doubles its edge.
4. **A caustic**, a soft bright concentration inside the rim opposite the light,
   where the refracted cone gathers.
5. **A cast shadow on the work**, softer and further offset than the plate's
   contact occlusion, because this object is held above the paper rather than
   resting on it.

Every one of those is placed from `--glass-light` rather than by hand, so the
rotation check in §6 covers them.

**It must read as an object, and that is a floor rather than a preference.**
Drawn as faintly as the glazing it disappears over a work that is mostly white
paper, and a lens you cannot see is a lens that is not there. This is the one
surface where the material is allowed to be frank, and the plate's restraint
does not transfer to it.

**Under a finger it is smaller, and the finger holds it rather than hides it.**
A lens centred on a fingertip shows the fingertip. So the touch lens is held
just above the finger — its radius plus a fingertip — sliding round to its side
as the finger nears the top of the screen, and clamped inside the viewport. It
magnifies **what is under the lens**, never the point under the finger: a lens
that shows something other than what it sits over reads as a picture of a lens,
not a lens, and the finger becomes the handle it is moved by. It takes
`--loupe-size-touch` because the mouse size cannot stand clear of a finger at
320px. It is drawn fixed, outside the plate: the plate clips, and a fixed lens
inside it would be captured by the scroll reveal's transform. It sits above the
masthead because it is an instrument in the hand and exists only while held.

**Prev/next — Phase 3.** Bottom-right of the detail page, small, in the text
face and in pen, each target ≥24×24px (2.5.8). The list of plates with the
current work marked is the primary navigation; prev/next is the shortcut, not
the main path.

---

## 7. Motion and interaction

| Effect                | Trigger        | Guard                                      | Cost       | Without it              |
| --------------------- | -------------- | ------------------------------------------ | ---------- | ----------------------- |
| Type entrance (404)   | document ready | reduced-motion                             | CSS        | type already in place   |
| Plate placeholder     | load           | reduced-motion; finite, 8 breaths          | CSS        | a static blurred copy   |
| Scroll reveal         | scroll         | `@supports (animation-timeline)` + r-m     | CSS        | works already visible   |
| Arrival               | list of plates | `@view-transition` inside r-m              | CSS        | the jump is instant     |
| View-transition morph | navigation     | `@view-transition` inside r-m              | CSS        | a plain navigation      |
| Magnifier             | hover, or hold | fine pointer: hover; else a still hold     | **script** | the gallery is complete |
| Title card shrink     | scroll         | `@supports (animation-timeline)` + r-m     | CSS        | a small sticky bar      |
| Plate strip marquee   | none, endless  | reduced-motion; pauses on hover/hold/focus | CSS        | a static scroll strip   |

**The staggered entrance runs only on the 404**, the one page that opens with a
block of type; the home page opens with the title card's shrink. Each element
carries its own step index rather than relying on sibling position, so
restructuring a page cannot silently resequence it, and **total duration
including the longest stagger must not exceed 600 ms** — an entrance must never
be what pushes a passing page into a failing LCP. **Plates never animate on
load**, only on scroll.

**A strip jump is an arrival, not a scroll.** A smooth scroll to a work six
screens down passes five other works at some 16,000px a second: a smear, then a
landing with no event, and CSS cannot slow or re-ease the browser's own scroll.
So a row is a navigation to the same page — `?p=<slug>#<slug>`, because a bare
fragment stays in the document and gets no view transition — and the page is not
scrolled at all. The page being left dissolves, the logo morphs into its
collapsed size, the section head glides to its pin, and **the chosen work rises
from below the screen into the place the jump lands it**, arriving as its
placeholder if the drawing is still in flight. Only that work is captured: the
page being left names no plate (a strip link holds focus), and the arriving page
names only its `:target`, so it enters rather than morphing from wherever it sat
before, and nothing streaks. There is no `scroll-behavior: smooth`: it would
turn the arriving page's fragment scroll back into the smear. The query changes
nothing the page renders; the canonical URL stays the edition's. Where view
transitions are missing or motion is reduced, the jump is an instant load at the
same landing point.

**The scroll reveal moves, it does not fade.** It ends at the line a strip jump
lands on, so an arriving work never rests low. With `animation-timeline: view()`
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

Two limits. `feImage` with an external reference is unreliable outside Chromium,
and **the degradation is built rather than hoped for**: a map that fails to load
is an empty result, and an empty result displaces by half the scale in both
axes, which slides the magnified view instead of flattening it. So the filter
synthesises a neutral map from coefficients and composites the loaded one over
it. Where the file does not resolve, the lens is unrefracted magnification —
complete, just flatter. And **no chromatic aberration**: splitting channels
would fringe the drawing in hues the palette does not contain. Dispersion stays
in the rim, in `--color-pen`.

The refracted view is drawn larger than the lens and clipped back to it, so
bending the rim pulls in real image rather than the transparency outside the
circle, which smears.

**Shape.** A passive `pointermove` listener on the plate, or a `touchmove` one
under a finger; latest coordinates applied once per frame in
`requestAnimationFrame`, written out as custom properties so CSS positions via
`translate3d` on the compositor. A short lerp gives the follow lag under a
mouse. No layout reads in a move handler.

**It shows that it is waiting.** The glass appears the instant the lens engages
and pulses while the detail tier is in flight; the magnified view fades in when
it lands. An empty lens reads as broken; an empty lens that is visibly waiting
reads as loading.

**Under a mouse, the lens is the cursor.** While it is up the pointer is hidden,
keyed to the attribute the script sets — so a plate whose lens never initialises
keeps an ordinary pointer rather than none at all. When plates become links in
Phase 3, check this again: a link with no visible cursor is a different
question. A finger has no cursor to hide.

**Constraints.** `(hover: hover) and (pointer: fine)` picks the path: where it
matches, the lens follows hover; everywhere else it follows a held finger. It
takes the list of plates' precedent (§6) — one object per input, never both at
once. Under reduced motion the lag is removed and the lens snaps to the pointer
— the lag is decoration, the lens is a tool; a finger never gets the lag, since
the lens is already offset from it and a lag would only make the magnified point
disagree with the finger. Dismissible with Escape (1.4.13). Progressive: the
gallery is complete with the script absent, blocked or failed, and the lens
reveals nothing that exists nowhere else — it shows the same pixels larger,
which is what keeps it compliant. It needs the detail tier (§8), fetched when
the lens engages, never upfront and never on a passing scroll; magnifying the
gallery derivative shows upscaling artifacts, not hatching, so the lens and the
second tier are one decision. Budgeted at **3 KB minified** — enforced on the
source at 4 KB, since tests do not build (§10). No dependency: GSAP is ~70 KB
gzipped to interpolate two numbers and every dependency is supply-chain surface
under @SECURITY.md; this is a few KB of vanilla JavaScript.

**Under a finger, a scroll always wins.** On a phone the plates are most of the
page, so a finger on a plate is almost always a reader scrolling. The lens
engages only after the finger has held still for a moment; any travel before
that is a scroll and the lens never appears. The browser decides whether a touch
pans when the touch starts, so `touch-action` cannot hand the gesture over
halfway, and pointer events can only watch a pan, never refuse one. The one
mechanism both engines honour is a non-passive `touchmove` listener, in place
before the touch starts, calling `preventDefault()` on a move that is still
cancelable: after a still hold no pan has begun, so the lens takes the rest of
that gesture. If a move arrives uncancelable, a pan already won, and the lens
closes rather than fight it. The cost is that plates are scroll-blocking touch
regions, so their handler stays trivial.

**Never `touch-action: none` on a plate, and never the viewport meta.** Either
one takes scrolling and pinch-zoom from every reader for a convenience to some.
Pinch-zoom is the touch reader's own magnification (1.4.4): two fingers never
start a hold, and a second finger closes an engaged lens and hands the gesture
back.

**A hold is a look; a tap is a tap.** While the lens is up, the plate refuses
the system's long-press — the save-image callout, the context menu, selection,
the image drag — and lifting the finger does not click. Those refusals are keyed
to an attribute the script sets, so without the script a held plate keeps the
system menu. A tap stays a native click, which in Phase 3 navigates; the lens
appearing is the signal that the touch has become a look. The lens closes on
lift, on cancel and on Escape.

**Why a held, moved finger passes.** Nothing happens on touch-down, and lifting
undoes the lens (2.5.2). The function needs no path: holding still anywhere
magnifies that point, and lifting and holding again is the single-pointer
alternative to dragging (2.5.1, 2.5.7). And the lens shows only pixels that
pinch-zoom also shows, so no information depends on the gesture at all.

**Its keyboard equivalent is the detail page, which does not exist yet.** It
ships now because it reveals nothing new, and because holding it would leave the
detail tier unexercised and therefore unverified. The gap is recorded in §10.

## 8. Image resolution

Two committed derivative tiers. Originals never enter the repo — a hard rule in
@CLAUDE.md — and the source folder arrives only through `ARTWORK_ORIGINALS` in a
local `.env`; never hardcode a path into a committed file.

- **Gallery tier**: 2000px max edge, WebP, `src/assets/artworks/`, where the
  collection entries reference it. At 2400px the scanned bond-paper work exceeds
  the budget.
- **Detail tier**: **3000px max edge**, WebP, `src/assets/artworks/detail/`.
  Chosen from the lens, not from a round number: a plate renders near 900 CSS
  px, so a 3000px source gives the loupe about 3.3× — enough to resolve
  individual pen strokes at true source pixels. Its budget is **2.5 MB** per
  file, its own threshold, not a loosening of the gallery tier's.

Both budgets live in the `TIERS` array in `scripts/optimize-images.mjs`, which
the tests import, so they are never written twice.

**The pairing is derived, not authored.** `src/artworks.ts` globs the detail
directory and matches by slug, so no YAML field, no schema change and no chance
of a work shipping half-configured. A test asserts both tiers exist for every
work, with no orphans on either side.

**Repo-size consequence:** two tiers commit roughly 1.4 MB of artwork per work.

---

## 9. Anti-patterns

**The magnifier sets no precedent.** It is the only sanctioned script because it
delivers something CSS cannot express at all — a lens tracking a pointer — and
because the gallery is complete without it. Where an interaction seems to need a
script, the answer is almost always a real URL and a prerendered page, which is
what the detail page will be. Test-enforced.

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

**No dark mode, and no sixth colour** — not for a scrim, a shadow, a disabled
state or a lens rim. A printed object has one ground, and the price of a new
value is in §3. Test-enforced.

**Never crop or distort the work.** A slot bounds width; the plate takes the
work's proportion. A work that does not fit becomes smaller, never tighter. The
plate's corner radius is one bounded exception and it is measured in §6: it
softens the sheet's edge, it does not tighten the work. The site icon is the
other, bounded to the icon alone (§6).

**No muted ink.** Fading ink to build hierarchy fails AA. Use weight, size,
space or a rule.

**No hardcoded user-facing string.** Every text element gets a key in
`src/i18n/ui/<locale>.ts`, furniture included — running heads, section labels,
folio prefixes, the colophon.

**No string-concatenated dimensions.** `formatDimensions()` owns the whole
string; it is interpolated into a translated sentence as one unit.

**No token values restated outside `global.css`**, and no token table in this
file. Two copies of a value is two values the moment one is tuned.

---

## 10. Guards and outstanding

### Test-enforced rules

Load-bearing; everything else here is advisory prose.

| Guard                                                | Test                    |
| ---------------------------------------------------- | ----------------------- |
| No colour literal under `src/` outside `@theme`      | `tests/design.test.ts`  |
| Exactly one client script, within its byte budget    | `tests/design.test.ts`  |
| Every `animation` sits inside a reduced-motion guard | `tests/design.test.ts`  |
| The display role never sets below 24px               | `tests/design.test.ts`  |
| Both image tiers, own budgets, no orphans            | `tests/content.test.ts` |
| No face ships `font-display:auto`                    | `ci.yml`, post-build    |
| Every published URL gets its CSP header              | `ci.yml`, post-build    |

The colour guard allows derived forms — any colour function whose arguments
reference a `--color-*` token — because the glass edge needs alpha variants of
ink and pen. It refuses bare hex, bare colour functions and named colours; a new
colour arrives as a plausible one-off, and the guard is what catches it.
Judgement is deliberately untested — whether the cadence feels composed, whether
the glazing is too heavy, whether a heading is too loud. A guard that produces
false failures gets deleted and takes its real coverage with it.

### Outstanding

Specified here, exercised by no page yet; the structure phase inherits these.

- **The about archetype** (§5). Needs `about.title`, `about.heading`,
  `about.statementLabel`, `about.biographyLabel`, and a portrait asset.
- **The detail archetype** (§5) and **prev/next** (§6). Needs
  `detail.plateLabel`, `detail.prev`, `detail.next`, `detail.record`. Its record
  labels its fields with the existing `artwork.year`, `artwork.medium` and
  `artwork.dimensions`, which nothing else uses yet.
- **The magnifier's keyboard equivalent.** Until the detail page exists,
  keyboard users have only browser zoom. Closed by Phase 3.
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
