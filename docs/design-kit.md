# Design kits — Tethr brand and Tethr HRMS

> Design-head spec for `TET-269` and its children `TET-271` (brand kit) and `TET-272` (product kit).
> `TET-270` (componentise) and `TET-273` (adopt) depend on both and come after.

Two published Figma libraries. **Everything below exists to stop them becoming the thing this project has
spent a fortnight learning to distrust: a mirror that drifts from its source.**

---

## 0. What already exists

| Source | Holds | Count |
|---|---|---|
| `packages/ui/src/theme/colors-light.ts` | product colour, light | **59 tokens** |
| `packages/ui/src/theme/colors-dark.ts` | product colour, dark | **59 tokens** |
| `packages/ui/src/theme/common.ts` | spacing, radius, typography, icon, layout, zIndex, animation | **71 tokens** |
| `design.md` | HRMS visual language, prose | 385 lines |
| `../tethr/design.md` | Tethr brand, prose | 160 lines |

**~190 token definitions already exist in typed code.** That number decides the method.

---

## 1. Generate the product kit. Do not transcribe it.

**A hundred and ninety values typed by hand into Figma is not a kit, it is a snapshot with a half-life.**
It would be wrong within a sprint and nothing would announce it.

- **Emit** the theme as JSON from `packages/ui/src/theme/` — the files are typed and already structured.
- **Build** the Figma variables from that JSON inside `use_figma`, via the Variables API.
- **Keep the emitter**, committed, so the kit can be regenerated rather than repaired.

**`packages/ui` is the source of truth and the Figma kit is a projection of it.** Never the reverse. A
designer who needs a new token adds it in code; the kit follows. This is the same relationship the
technical diagrams have to the codebase, and it works for the same reason.

### 1.1 Light and dark are modes of one collection, not two collections

`colors-light.ts` and `colors-dark.ts` hold **identical key sets** — 59 each. That is exactly what Figma
variable modes are for.

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

---

## 2. The two kits share structure, not expression

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
2. **Brand kit (`TET-271`) second.** Hand-sourced from `../tethr/design.md`, so it needs judgement rather
   than a pipeline — and the diagram boards are already a de-facto brand kit in use, which is evidence of
   what the brand layer actually needs.
3. **`TET-270` componentise** and **`TET-273` adopt** follow both. Neither can start before the variables
   exist, because a component bound to hardcoded values is the thing `TET-270` is meant to eliminate.

**Both kits need Figma files.** Create them if they do not exist — `create_new_file` is exempt from the
call budget — named plainly: **`Tethr — Brand Kit`** and **`Tethr HRMS — Product Kit`**. Report the keys.

---

## 4. Scope discipline

A kit's usage page is part of the kit, not an extra. **Every rule in it should be one a reader could
otherwise get wrong** — the do's-and-don'ts page that only restates what the variables already show is
the kind of content this project has spent a fortnight learning to cut.

Two that are worth writing because they are not visible from the variables alone:

- **The medium decides, not the content.** A product screenshot in a brand deck keeps product tokens.
- **A token added to the kit but not to `packages/ui` is a token that does not exist.** The kit is a
  projection; drawing with something the code lacks produces a design nobody can build.
