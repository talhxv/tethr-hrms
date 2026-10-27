# Design kits — Tethr brand and Tethr HRMS

> Design-head spec for `TET-269` and its children `TET-271` (brand kit) and `TET-272` (product kit).
> `TET-270` (componentise) and `TET-273` (adopt) depend on both and come after.

Two published Figma libraries. **Everything below exists to stop them becoming the thing this project has
spent a fortnight learning to distrust: a mirror that drifts from its source.**

---

## 0. What already exists

| Source | Holds | Count |
|---|---|---|
| `packages/ui/src/theme/colors-light.ts` + `colors-dark.ts` | themed colour | **73 tokens**, of which **47 actually differ between modes** |
| `packages/ui/src/theme/common.ts` | spacing, radius, typography, icon, layout, zIndex, animation | **74 primitives** |
| `design.md` | HRMS visual language, prose | 385 lines |
| `../tethr/design.md` | Tethr brand, prose | 160 lines |

**147 token definitions already exist in typed code.** That number decides the method.

> An earlier draft of this table said ~190, from a grep that counted group headers (`accent:`, `border:`)
> as tokens. `scripts/emit-design-tokens.js` counts leaves and reports 147. **A number I put in prose from
> a crude command, exactly the thing `checking.md` §1 is about** — and the emitter is now the answer to it.

---

## 1. Generate the product kit. Do not transcribe it.

**A hundred and forty-seven values typed by hand into Figma is not a kit, it is a snapshot with a half-life.**
It would be wrong within a sprint and nothing would announce it.

- **Emit** the theme as JSON from `packages/ui/src/theme/` — the files are typed and already structured.
- **Build** the Figma variables from that JSON inside `use_figma`, via the Variables API.
- **Keep the emitter**, committed, so the kit can be regenerated rather than repaired.

**`packages/ui` is the source of truth and the Figma kit is a projection of it.** Never the reverse. A
designer who needs a new token adds it in code; the kit follows. This is the same relationship the
technical diagrams have to the codebase, and it works for the same reason.

### 1.1 Light and dark are modes of one collection, not two collections

`colors-light.ts` and `colors-dark.ts` hold **identical key sets** — 73 each, of which 47 carry different
values. That is exactly what Figma variable modes are for.

**All 73 stay mode-varying, including the 26 that happen to be equal today.** The code declares them in
both files, so the code calls them themed; that two values currently match is a fact about today's palette,
not about the token's nature. Demoting them to primitives would make the kit disagree with the source about
what *kind* of token something is, and the drift check would then have to carry an exception list.

One collection, two modes, one variable per token. **Dark-mode parity then becomes structurally impossible
to break** rather than something a reviewer has to remember: a token missing from one mode is a visible
gap in the variable table, not a bug discovered later on a dark screen.

### 1.2 The kit needs a drift check, and it is not optional

**We wrote the rule that a mirror which has drifted from its source is worse than no mirror** — because it
is confidently wrong in front of the audience least able to catch it. A Figma kit copied from code is
exactly that mirror.

So: **a script that diffs the published variables against the coded theme and fails loudly.** Same shape as
`scripts/verify-events.js` — it exists so the claim *the kit matches the code* is checkable in one command
rather than asserted in a doc. Without it this kit is a liability within a month.

**This applies to the product kit only, and the asymmetry should be stated rather than papered over.** The
brand kit has nothing to diff against: its source is prose, and the website hardcodes the values it ought
to reference (see §3). **So the product kit can prove it matches its source and the brand kit cannot** —
which is a reason to give the brand kit a token layer eventually, not a reason to pretend the two are
checked the same way.

---

## 2. The two kits are independent — measured, not argued

**Superseded 2026-10-03.** This section used to say *share structure, not expression*. Both inventories now
exist, and the overlap was counted rather than assumed:

| Shared between the kits | Count |
|---|---|
| Colours | **1** — `#ffffff` |
| Typefaces | **0** |
| Radius values | **1** — `999`, a pill sentinel |

**White is not a brand decision and `999` is not a foundation.** The overlap is empty of meaning, so the
kits are independent as a matter of fact rather than of policy — and `TET-269`'s framing of *"product kit
built on top of brand kit"* is wrong at the token layer. **They are siblings, not parent and child.**

**Even the 4px grid cannot be aliased, and that is the row we had both pencilled in as matching.** Only one
side declares it: `packages/ui` sets `SPACING_MULTIPLIER = 4` and every space and radius obeys it;
**`design.md` never mentions a 4px grid at all.** Its radii happen to divide by four, and the only grid it
names is a 64px hero overlay, which is a motif. **Aliasing the product's scale into the brand kit would
impose a rule the brand has not made** — which is *alias what matches, duplicate what differs* applied to
the one row that looked safest.

### 2.1 What the old section got right, and why it is kept



**`TET-272` says the product kit "uses the brand kit's foundations instead of redefining them." Taken
literally that is wrong, and it would undo the distinction `design.md` exists to protect.**

The values diverge, and not by accident:

| | Tethr brand | HRMS product |
|---|---|---|
| Accent | `#2B44FF` primary, `#0755E9` royal | indigo `accent1…accent12` scale |
| Type | Manrope | Inter |
| Spacing grid | 4px | **4px** |

**Colour and typeface are not shared and must not be aliased across kits.** `design.md` is explicit: a
product screenshot inside a brand deck keeps indigo and Inter; the deck around it wears the brand. *"Without
this line, someone eventually harmonises the app to match a deck, and the brand eats the product."* A
product kit that inherits brand colour is that sentence coming true through tooling.

**What the kits genuinely share is structure** — the 4px grid, and whatever else turns out to match on
inspection rather than on assumption. That layer is worth factoring; the expressive layer is not.

**So the inheritance is narrow and must be verified rather than declared.** Before aliasing any variable
across kits, check the two values are actually equal today. **Alias what matches; duplicate what differs
and say why in the kit's usage page.** A brand kit and a product kit that look like one kit is the failure
mode, not the goal.

---

## 3. Build order

1. **Product kit (`TET-272`) first.** Its source is machine-readable, so it is fastest, most verifiable, and
   carries the drift risk that compounds. Generate, build, check.
2. **Brand kit (`TET-271`) second, and hand-sourced — there is no generator to write.** The diagram boards
   are already a de-facto brand kit in use, which is the best evidence of what that layer actually needs.

   > **Do not generate it from `../tethr/src/style.css`. That is the obvious move and it would poison the
   > kit.** The site has a `:root` block of 14 custom properties, but the brand's real values are
   > **hardcoded 88 times** through the stylesheet — `#2B44FF` and `'Manrope', sans-serif` written out
   > inline rather than referenced. Worse, the `:root` block is **stale**: `--accent` is `#aa3bff`, a
   > purple from an earlier design, and `--sans` is a system stack. A generator pointed at it would emit a
   > purple, system-font brand kit and every number in it would verify.
   >
   > **So `design.md` is the brand's source of truth and nothing in the codebase consumes it.** That is a
   > finding about the website, not just about the kit.
3. **`TET-270` componentise** and **`TET-273` adopt** follow both. Neither can start before the variables
   exist, because a component bound to hardcoded values is the thing `TET-270` is meant to eliminate.

**Both kits need Figma files**, named plainly: **`Tethr — Brand Kit`** and **`Tethr HRMS — Product Kit`**.

> **Creating them is Talha's call, not the design head's.** An earlier draft of this line said *create them
> if they do not exist* — written to unblock a worker that was holding a gate it had set with him. **A gate
> a peer can open on your behalf is not a gate**, and that instruction was the exact shape this project has
> refused all fortnight. Retracted. Nothing is created until he answers.

---

## 4. Scope discipline

A kit's usage page is part of the kit, not an extra. **Every rule in it should be one a reader could
otherwise get wrong** — the do's-and-don'ts page that only restates what the variables already show is
the kind of content this project has spent a fortnight learning to cut.

Two that are worth writing because they are not visible from the variables alone:

- **The medium decides, not the content.** A product screenshot in a brand deck keeps product tokens.
- **A token added to the kit but not to `packages/ui` is a token that does not exist.** The kit is a
  projection; drawing with something the code lacks produces a design nobody can build.
