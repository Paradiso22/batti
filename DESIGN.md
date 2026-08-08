---
name: Batti
description: Spese di gruppo come al POS — batti l'importo, stampa lo scontrino, salda i conti.
colors:
  chassis-0: "#131518"
  chassis-1: "#22252a"
  chassis-2: "#2c3036"
  chassis-3: "#3a3f47"
  silk: "#ccd1d9"
  silk-dim: "#969ca8"
  paper: "#f7f5ef"
  paper-dim: "#eae6d9"
  ink: "#272419"
  ink-2: "#6c6757"
  line: "#beb7a2"
  green: "#1f8a4c"
  green-hi: "#29a35d"
  green-lo: "#135c33"
  red: "#c6392f"
  red-hi: "#d84c42"
  red-lo: "#8c231c"
  yellow: "#e8b93c"
  yellow-hi: "#f2cb5e"
  yellow-lo: "#a87e14"
  key-bone: "#d9d5c9"
  key-bone-hi: "#e8e5dc"
  key-bone-lo: "#a8a292"
  key-ink: "#34302a"
  lcd-0: "#131a14"
  lcd-1: "#1c2a1e"
  lcd-on: "#a6f2a4"
  lcd-mid: "#6fae70"
  lcd-dim: "#2e4030"
  lcd-amber: "#f0c46a"
  led-on: "#59e07c"
  m1: "#2f6bd8"
  m2: "#c76a10"
  m3: "#0e9488"
  m4: "#8a4fc9"
  m5: "#8a7a1f"
  m6: "#c94f7c"
typography:
  display: { fontFamily: "DSEG7, Azeret Mono, monospace", fontSize: "clamp(22px, 7vw, 32px)", fontWeight: 700, lineHeight: 1 }
  title: { fontFamily: "Azeret Mono, ui-monospace, monospace", fontSize: "15px", fontWeight: 700, letterSpacing: "0.3em" }
  body: { fontFamily: "Azeret Mono, ui-monospace, monospace", fontSize: "13.5px", fontWeight: 500, lineHeight: 1.25 }
  label: { fontFamily: "Barlow Semi Condensed, Barlow, sans-serif", fontSize: "14px", fontWeight: 700, letterSpacing: "0.08em" }
  label-mono: { fontFamily: "Azeret Mono, ui-monospace, monospace", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.16em" }
  ui: { fontFamily: "Barlow, system-ui, sans-serif", fontSize: "16px", fontWeight: 400 }
rounded:
  paper: "0"
  rail: "3.5px"
  seg: "9px"
  sm: "10px"
  key: "12px"
  fab: "14px"
  sheet: "18px"
  shell: "30px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "10px"
  lg: "14px"
  xl: "16px"
components:
  key-bone: { backgroundColor: "{colors.key-bone}", textColor: "{colors.key-ink}", rounded: "{rounded.key}", padding: "13px 16px", height: "48px", typography: "{typography.label}" }
  key-green: { backgroundColor: "{colors.green}", textColor: "#ffffff", rounded: "{rounded.key}", padding: "13px 16px", height: "48px" }
  key-red: { backgroundColor: "{colors.red}", textColor: "#ffffff", rounded: "{rounded.key}", padding: "13px 16px", height: "48px" }
  key-yellow: { backgroundColor: "{colors.yellow}", textColor: "#3a2c07", rounded: "{rounded.key}", padding: "13px 16px", height: "48px" }
  key-sm: { backgroundColor: "{colors.key-bone}", textColor: "{colors.key-ink}", rounded: "{rounded.sm}", padding: "9px 14px", height: "40px" }
  nav-key: { backgroundColor: "{colors.chassis-2}", textColor: "{colors.silk-dim}", rounded: "{rounded.sm}", padding: "8px 2px 7px" }
  chip: { backgroundColor: "rgba(255,255,255,.35)", textColor: "{colors.ink}", rounded: "{rounded.pill}", padding: "7px 12px" }
  lcd: { backgroundColor: "{colors.lcd-0}", textColor: "{colors.lcd-on}", rounded: "{rounded.sm}", padding: "12px 14px 10px" }
  paper-slip: { backgroundColor: "{colors.paper}", textColor: "{colors.ink}", rounded: "{rounded.paper}", padding: "14px 16px 18px" }
  input: { backgroundColor: "transparent", textColor: "{colors.ink}", rounded: "{rounded.paper}", padding: "6px 2px", typography: "{typography.ui}" }
---

# Design System: Batti

## Overview

**Creative North Star: "Il POS di casa"** (seed ac97e945, Operate mode)

The app is a domestic POS terminal: the whole UI is one physical object — a gunmetal Italian bancomat that prints household expenses on ivory thermal paper. The direction contract (verbatim from `index.html`): **THESIS** — registrare una spesa e battere uno scontrino; rifiuta il layout fintech a card pastello con tab bar. **OWN-WORLD** — chassis gunmetal con tasti in gomma (verde conferma, rosso annulla, giallo correzione), display LCD a segmenti verde fosforo, record su carta termica avorio in mono da scontrino, grottesco serigrafato per le etichette chassis. **STORY** — apri e leggi sul display chi deve cosa; batti l'importo, confermi col tasto verde, la spesa si stampa sullo scontrino. **FIRST VIEWPORT** — LCD in alto, scontrino sotto, navigazione e tasto verde BATTI in basso. **FORM** — POS/bancomat italiano + scontrino termico.

Every surface belongs to one of three materials: **chassis** (dark housing: navigation, sheets, toasts), **LCD** (phosphor-green status glass), **paper** (all data records). Nothing floats in an abstract app-space.

**Key Characteristics:**
- One terminal, three materials; every element states which one it is made of.
- Rubber keys with real travel; data printed in receipt mono; status glows on glass.
- Italian receipt voice: uppercase, letter-spaced, dashed rules, `·` separators, ✻ dingbats.

## Colors

A machine palette: dark gunmetal housing, ivory paper, phosphor green — with rubber-key signal colors doing all the talking.

### Primary
- **Verde POS** (`green`, with `green-hi`/`green-lo` for gradient top and ledge): the confirm color. Green keys (BATTI, Conferma, Esegui), positive balances, on-track budget fills, current-month chart column, focused input underline.
- **Fosforo** (`lcd-on` on `lcd-0`/`lcd-1` glass; `lcd-mid` for secondary lines, `lcd-dim` for unlit ghost segments, `led-on` for LEDs and the active nav dot): the LCD's only voice. `lcd-amber` is the LCD's warning state (debt amounts, offline/local/pending sync LEDs).

### Secondary
- **Rosso annulla** (`red`, `red-hi`/`red-lo`): cancel, delete, destroy, negative balances, over-budget fills. Never decorative.
- **Giallo correzione** (`yellow`, `yellow-hi`/`yellow-lo`): correction keys (Importo, Azzera) and the global focus-visible outline.

### Tertiary
- **Maglie dei membri** (`m1`–`m6`): member identity colors for dots, chips, stackbars, legends.

### Neutral
- **Chassis** (`chassis-0` page depth → `chassis-3` raised edges) with **silk** / **silk-dim** silkscreened labels on it.
- **Carta termica** (`paper`, `paper-dim` for rail tracks) carrying **ink** text, **ink-2** faded ink, and **line** for dashed rules and hairline borders. `key-bone`/`key-bone-hi`/`key-bone-lo` + `key-ink` are the neutral rubber keys.

**The Traffic-Light Rule.** Green means confirm, red means cancel/destroy, yellow means correct. A key's color is its meaning; never use these hues for decoration or emphasis.
**The Fixed Jersey Rule.** A member's color is `MCOLORS[member.c % 6]` — assigned at creation, stored on the member, identical in every chip, dot, stackbar and legend. Never reassign or restyle it.

## Typography

**Display Font:** DSEG7 Classic Bold (LCD digits only) · **Body Font:** Azeret Mono (400/500/700 — everything printed on paper) · **Label Font:** Barlow Semi Condensed (600/700 — silkscreen on chassis and keys) · **Base UI:** Barlow (400–700 fallback surface).

**Character:** thermal-printer mono for records, seven-segment digits for the display, condensed grotesque silkscreen for the machine's own labels. Uppercase + tracking is the machine speaking; mixed case is user data.

### Hierarchy
- **Display** (DSEG7 700, clamp(22px, 7vw, 32px), lh 1): LCD amount, with phosphor glow and `8`-ghost underlay.
- **Title** (mono 700, 15px, ls .3em, uppercase): receipt headers (`.r-title`); meta line below is mono 500 10px ls .18em.
- **Body** (mono 500, 13.5px): receipt row descriptions; secondary "who" line mono 10.5px `ink-2`.
- **Amount** (mono 700, 14px, `tabular-nums`): all money; `€` as 10px `ink-2` suffix. Format `it-IT` with comma ("87,40"); LCD digits use dot ("87.40").
- **Label** (Barlow Semi Condensed 700, 14px, ls .08em, uppercase): key caps; nav keys 9px; sheet titles 13px ls .14em.
- **Label-mono** (mono 700, 10.5px, ls .16em, uppercase, `ink-2`): form labels (`.f-label`); LCD captions are mono 500 10–12px ls .12–.18em.

**The LCD-Only Rule.** DSEG7 renders LCD digits and nothing else. Data must always be legible: records, amounts and forms are Azeret Mono — the pixel/segment look is reserved for the display glass.

## Layout

One vertical terminal column, mobile-first: `.terminal` max-width 470px, full height, holding a fixed stack — LCD frame on top, `.paper-scroll` (flex 1, the only scroll region, 132px bottom padding to clear the dock), and an absolute bottom `.dock` that fades up from chassis (gradient from transparent to `chassis-1` at 26%), containing the right-aligned green FAB row and a 5-column nav grid. Safe-area insets (`--sat`/`--sab`) pad LCD top and dock bottom. At ≥720px the terminal becomes a physical device on a desk: centered 440px × min(880px, 100dvh − 48px), 30px radius, 1px `#34383f` border, deep drop shadow. Sheets overlay from the bottom (max-height 92%, backdrop `rgba(8,9,11,.6)`). Spacing is a loose 2px rhythm — 6/8/10/12/14/16px gaps; paper slips stack with 14px gaps; rows use 8–11px vertical padding with dashed dividers instead of margins.

## Elevation & Depth

Depth is physical, not atmospheric: hard ledges under rubber keys, deep insets behind glass, and paper resting above the housing. Keys carry a solid ledge (`0 4px 0 <lo-color>` + soft `0 6px 12px rgba(0,0,0,.35)` + `inset 0 1px 0` white top light); the LCD sits in a well (`inset 0 2px 8px rgba(0,0,0,.75)` plus a diagonal glass-reflection overlay); paper slips cast `0 6px 18px rgba(0,0,0,.45)` (perforated slips via `drop-shadow` so the zigzag edge keeps its shadow); sheets throw `0 -14px 40px rgba(0,0,0,.55)`; toasts `0 8px 24px rgba(0,0,0,.5)`.

**The Rubber Ledge Rule.** Anything pressable has a visible ledge and loses it when pressed: `:active` translates down (3px keys, 2px nav keys) while the ledge shadow collapses from 4px/3px to 1px, in 70ms ease-out. No ledge, not a key.

## Shapes

Soft-rectangle machine parts: keys 12px (small 10px, FAB 14px, pad keys 12px), LCD and nav keys 10px, segmented control 9px, sheet top corners 18px, device shell 30px, toast 10px, rails 3.5px. Chips are full pills (999px). Paper is the exception: dead-sharp 0px corners with 7px zigzag perforation strips (`.perf`, two 45° gradients, 9px teeth; `.perf.top` mirrored) at tear edges. On paper, structure is drawn with 1px dashed `line` rules (solid variant before totals) and 1.5px solid `line` borders on controls — never boxes with fills.

## Components

### Keys (`.key`)
Rubber terminal keys: Barlow Semi Condensed 700 uppercase on a vertical gradient (`*-hi` → base), ledge in `*-lo`. Variants: **bone** (default, `key-ink` text), **green** / **red** / **yellow** (Traffic-Light semantics; white text, yellow uses `#3a2c07`), **`--sm`** (40px, 3px ledge), **`--wide`** (full width), FAB (15px text, 14px radius). Disabled = opacity .45. `.key-row` lays keys flex-1 with 10px gaps; the red/cancel key sits left, green/confirm right.

### LCD (`lcd()` in app.js)
Anatomy: `.lcd-top` (context line + bold right value, `lcd-mid`) → `.lcd-main` (uppercase caption + `.lcd-num`) → `.lcd-sub` (LED + sync status). `.lcd-num` layers a `.ghost` of all-`8` segments in `lcd-dim` beneath the `.lit` digits (glow `0 0 10px rgba(166,242,164,.35)`). `is-amber` switches digits to `lcd-amber` (ghost `#403822`) — used when the viewer owes money. LEDs: 7px dots, `led-on` green = synced/ready, amber = local/offline/pending. `is-flash` blinks the caption (360ms, steps(2), ×2) when a print just happened. The pad sheet reuses the LCD as its amount display.

### Paper / Receipt
Slips are `.perf-wrap` (perf top + `.paper` + perf bottom). Paper texture: faint 5px horizontal thermal banding (repeating gradient, `rgba(120,105,70,.028)`) over `paper`. Contents: centered mono `r-head`, dashed `r-rule`s, `.r-date` day separators (dashed lines flanking "GIO 08/08"), receipt rows (`.rrow`: 26px icon / description + who / right-aligned amount, dashed dividers), `.r-total` uppercase total line after a solid rule. Transfers are ghosted in `ink-2` with the swap icon. Empty states are printed on the paper in the same voice. Forms also live on paper: `.f-label` mono labels over `.f-input` transparent fields with a 1px `line` bottom border (focus: green underline, no ring).

### Chips, catgrid, seg
`.chip`: pill on paper, 1.5px `line` border, member `--mcol` dot; selected (`aria-pressed`) = colored border + inset ring + white bg + colored ✓ (a text glyph). `.catbtn`: 4-column grid of category tiles (icon + 9px mono uppercase label); selected = green border/ring, green icon, white bg. `.seg`: joined segmented control; pressed segment inverts to `ink` bg / `paper` text.

### Bars
`.rail`: 7px track in `paper-dim`; `.fill` is `ink` by default, **`ok`** green / **`over`** red for budget state. `.stackbar`: 14px who-spent bar, member-colored `<i>` segments sized by `flex:<cents>`, 2px gaps, 3px min-width, 4px radius.

### Sheets & dock
`.sheet-panel`: chassis bottom sheet (18px top radius, grip bar, uppercase silk title); inside, forms are again paper slips, and action rows are key-rows. The nav dock: five `.nav-key` chassis keys (icon + 9px label + status dot); active page = `silk` text + glowing `led-on` dot; inactive dots are dark recesses. Toast: chassis pill with green LED, `role="status"`, bottom-centered above the dock.

### Icons
Single stroke set: `PATHS` in app.js, 24px viewBox, `stroke-width 1.75`, round caps/joins, `currentColor`, default 20px (contextual 15–22px). Extend by adding paths to `PATHS` — no second icon style, no emoji.

### Motion
- **The Print Moment** (the one authored flourish): a new expense feeds onto the receipt — `.rrow--new` runs `feed` 480ms `steps(8)`: slides down 16px while a `clip-path` reveals it top-to-bottom like a dot-matrix printhead. Triggered only for just-saved expenses (`S.justPrinted`), paired with the LCD caption blink.
- Sheets rise with `sheetup` 240ms `cubic-bezier(.2,.9,.3,1)`; toasts fade up 200ms; key travel 70ms ease-out.
- `prefers-reduced-motion`: all animations and key transitions off — states land instantly.

## Do's and Don'ts

### Do:
- **Do** keep every money value in integer cents end-to-end; render with `fmtCents` (it-IT, always 2 decimals) in `tabular-nums` mono, `€` as a small suffix.
- **Do** assign every new surface to a material: data prints on paper, controls are rubber keys, status glows on the LCD, housing is chassis.
- **Do** use `aria-pressed` for selection states, `aria-current="page"` for nav, and the yellow `focus-visible` outline everywhere.
- **Do** speak the receipt voice for machine text: Italian, uppercase, letter-spaced mono, `·` separators, dashed rules.

### Don't:
- **Don't** use emoji as icons — only the `PATHS` 1.75-stroke set (✻ and ✓ are typographic glyphs, not icons).
- **Don't** put DSEG7 or fake-pixel type on data; segment rendering belongs to the LCD alone.
- **Don't** break the Traffic-Light or Fixed Jersey rules: signal hues carry meaning, member colors are identity.
- **Don't** reintroduce the rejected world: no pastel fintech cards, no floating tab bar, no shadows-as-decoration, no rounded paper.
