# Diagram build log

> Verification evidence for the process-flow set. Governed by
> [diagram-language.md](diagram-language.md) §7.2; the grammar itself lives there, not here.

This file exists because a tick in §6's scope table was resting on a previous session's belief rather than
on anything anyone had checked, and got passed onward as fact twice before that was noticed. §7 already
required verification to be folded into each build call — the missing half was that its output died with
the transcript.

**The rule:** a flow is ✅ in §6 only when its readback is recorded below. No entry, no tick.

Each entry records what the build call's final readback actually returned — not what the script asked for.
The distinction is the entire point: a silent no-op returns the old value, and only a readback of the real
node catches it.

## Entry format

```
## <flow id> — <flow name>
Built: <date> · Call: <ledger row #> · Board: <url>

| Node | Property | Expected | Returned |
|---|---|---|---|
| ... | fill | #ffffff | #ffffff |

Anomalies: <anything returned that did not match, and what was done about it — or "none">
```

Record positions for at least the diagram origin and one node per band, so a collapsed or overlapping
layout is detectable without a screenshot.

**Every entry records its page, from 2026-09-25 onward.** §15.5 of
[process-flow-content.md](process-flow-content.md) requires it, because origins stopped being unique the
moment the board became five canvases. **Every entry above the "Pages — the top-level split" entry was
written against the single-page board**, when there was only `Page 1` and a page column would have said
nothing. Those coordinates are still correct — nothing was translated by the split — but to read them you
need to know which page the region now lives on:

| Region in an older entry | Page it now lives on |
|---|---|
| Legend / key, masthead, contents index, the three journeys | **1 · Start here** |
| The `IN PLAIN LANGUAGE` mirror set (x −13200…−4848) | **2 · In plain language** |
| The technical acts 01–05 and E10 (x −4032…4320) | **3 · Technical** |
| `06 EMPLOYEE PERFORMANCE` (x 720…3527) | **4 · Employee performance** |
| `Development Process — Tethr` (x −7872…−6412) | **5 · Development process** |

Where a readback disagrees with the spec, the **returned** value is the fact about the canvas — it is not
thereby the fact about what is correct. **The default is to fix the canvas.** Amending
[diagram-language.md](diagram-language.md) instead requires a stated reason the spec is wrong; that the
canvas disagrees with it is not such a reason. Otherwise a fumbled hex has a sanctioned route into the
grammar, and the language drifts to match accidents. The grammar leads the canvas — that direction is the
whole basis of §7's "build to this document, not to review". Say which way it went, and why, in Anomalies.

---

## A1 — Self-serve signup

**Unbuilt on this board, and its evidence gap can never be closed.** A1 was built on
`lo9lRiwc2xwltXtrhCKZyL`, which belongs to a Figma account this project no longer authenticates as —
`get_figjam` against it returns "you don't have edit access to this file". The diagram is not damaged; it is
unreachable, which for our purposes is the same as absent. So is the original legend.

This is why §8's consistency mechanism now reads *rebuild the legend on the current board first*: a
reference copy that lives in someone else's file is not a mechanism, it is a memory.

---

## Legend — board furniture

Built: 2026-09-15 · Board: https://www.figma.com/board/CwLecjQLRS0x9Q28UHQ1zP · Origin `(-6000, -906)`

| Node | Property | Expected | Returned |
|---|---|---|---|
| Process step `28:121` | fill / stroke | `#ffffff` / `#dce3ee` | `#ffffff` / `#dce3ee` |
| Boundary `28:125` | fill / stroke / weight | `#e7efff` / `#0755e9` / 1.5 | `#e7efff` / `#0755e9` / 1.5 |
| Event pill `28:129` | shape / stroke / text | capsule / `#c7d0e0` / `#667899` | `ROUNDED_RECTANGLE` / `#c7d0e0` / `#667899` |
| Failure exit `28:133` | fill / stroke / text | `#fdecec` / `#f1b4b4` / `#e03131` | `#fdecec` / `#f1b4b4` / `#e03131` |
| Sync sample `28:137` | stroke / dash | `#657187` / none | `#657187` / `[]` |
| Async sample `28:142` | stroke / dash | `#0755e9` / `[6,4]` | `#0755e9` / `[6,4]` |
| Failure sample `28:147` | stroke | `#e03131` | `#e03131` |

Anomalies: none. Fonts returned `Manrope Medium` and `DM Mono Medium` as specified; both families are
available in this file (probed via `listAvailableFontsAsync` before building, so the §4 type spec is
executable rather than aspirational).

---

## B4 — Employee onboarding → assignment

Built: 2026-09-15 · Board: https://www.figma.com/board/CwLecjQLRS0x9Q28UHQ1zP · Origin `(-4032, 420)`
Grid: box `280 × 96`, pitch `312`, bands at `y 420 / 560 / 720`

| Node | Property | Expected | Returned |
|---|---|---|---|
| Eyebrow `25:26` | font / size / tracking / fill | DM Mono Medium / 12 / +12% / `#667899` | as expected |
| Rule `25:27` | weight / stroke / type | 3 / `#0755e9` / STRAIGHT | as expected |
| Title `25:31` | font / size / tracking | Manrope ExtraBold / 34 / +0.5px | as expected |
| All 9 process boxes | fill / stroke / font | `#ffffff` / `#dce3ee` / Manrope Medium 14 | as expected |
| Both event pills | shape / stroke / text fill | capsule / `#c7d0e0` / `#667899` | as expected |
| All 3 failure exits | fill / stroke / text fill | `#fdecec` / `#f1b4b4` / `#e03131` | as expected |
| 7 spine connectors | stroke / weight / dash | `#657187` / 1.5 / none | as expected |
| 2 async connectors | stroke / dash | `#0755e9` / `[6,4]` | as expected |
| 3 failure connectors | stroke | `#e03131` | as expected |

Positions: band-1 origin `(-4032, 420)`; band 2 `y 560`; band 3 `y 720`. Pairwise overlap check across all
14 shapes returned zero collisions, and a check against every non-connector node on the page returned zero
overlaps with the user's own sketches. Right edge `-1568`, clear of the "Employee Flows" column at `-1520`.

Event pills — both publishers confirmed by grep before drawing:
`employee.created` → `employee.service.ts:124` · `assignment.created` → `assignment.service.ts:75`.

**Anomalies:**

1. **Text-fit check was vacuous; a screenshot caught what it missed.** The readback compared
   `shape.text.height` against box height, but `text.height` returns `undefined` on a FigJam
   `ShapeWithText`, so `undefined > n` was silently `false` for every box and the check reported a clean
   pass it had not performed. A screenshot then showed `AssignmentService.setReportingLine` breaking
   mid-word as `setReporti / ngLine`. **A readback that cannot fail is not evidence.** Any future numeric
   fit check must assert the property is a number before trusting the comparison.
2. **Fixed by widening the grid, not shortening the label** — boxes `220 → 280`, pitch `252 → 312`.
   Shortening to `setReportingLine` would have cost the module-qualified form, which is what shows this
   flow crossing from `modules/employee` into `modules/assignment` at zero structural cost (§ *One symbol,
   one meaning*). Re-verified by screenshot: the identifier now sits on one line.
3. **No boundary frame drawn, deliberately.** A1 and A2 bootstrap a tenant that does not exist yet via
   `tenantContext.run(...)`, and the frame marks that crossing. B4 runs entirely inside the caller's
   existing tenant — there is no crossing to mark, and framing the whole diagram would make the symbol mean
   "this is multi-tenant software", which is every diagram. Flagged to the design head as a grammar point.
4. **The spine is deliberately broken between `EmployeeService.create` and the second permission gate.**
   Creating the employee and setting their manager are two separate admin actions; no connector joins them
   because no synchronous path does. See the finding below.

**What the diagram surfaced that the scope line did not:** §6 calls this flow "Employee onboarding →
assignment" as though it were one path. It is not. The create form calls `createEmployee` alone — there is
no exposed `createAssignment` mutation, and the only write path into assignment is `setEmployeeManager` →
`setReportingLine`. A freshly created employee therefore holds no assignment and no position, so the very
next step fails with `NotFoundError('No position to assign this employee to')` unless a `positionId` is
supplied. That failure is the most informative node in the diagram.

---

## Key — board furniture, v2

Built: 2026-09-16 · Origin `(-6000, -1000)` · Replaces the v1 legend (removed: `28:120,121,125,129,133,137,141,142,146,147,151`)

Rebuilt per `process-flow-content.md` §1.0.1. The v1 legend was a **vocabulary** list — four swatches and
three connector samples — and the thing a first-time reader most needs is the **grammar**. The specific gap:
bands are a layout rule, so no diagram ever labels its bands, which makes the most load-bearing convention
in the set invisible on every artefact that uses it.

Now carries, top to bottom: a miniature three-band diagram with the band meanings labelled down the left
(`the human` / `the synchronous spine` / `the async plane`), wired with the real edge grammar at small
scale · the four roles **with their meanings written**, not merely shown · both edge types labelled · the
dash-belongs-to-the-relationship rule · the DM Mono convention · and the section-label motif shown once so
the header stack reads as a header.

Verified by screenshot as a whole block, not node by node. All palette values returned as specified.

---

## A1 — Self-serve signup

Built: 2026-09-16 · Origin `(-4032, 420)` · Act 01, slot 1
Grid: box `280 × 96`, pitch `312`, bands at `y 420 / 560 / 720`. Right edge `-1568`, clears the next column.

Rebuilt from scratch — the original was stranded on an unreachable Figma account. Talha's capture of it was
the reference composition; §2.1's six defects were all addressed in the rebuild rather than reproduced:

| Defect in the original | How the rebuild handles it |
|---|---|
| Truncated labels ending in `…` | Every label shortened to fit 280px. Box width and pitch unchanged. |
| Boundary caption drawn as a filled capsule | Plain royal-blue DM Mono text above the frame (§5). Capsule silhouette is reserved for event pills. |
| Orphaned edge labels (`signed in`, `already founded`) | No edge labels anywhere. Verified: every connector returned an empty `text`. |
| Inconsistent box widths | One width (280), one pitch (312), no exceptions. |
| Event pill not capsule enough | `ROUNDED_RECTANGLE`, 60px tall against the box's 96 — silhouette does the work. |
| Nine-box spine | Eight boxes. Right edge `-1568` confirmed clear of the `-1520` column. |

Spine: advisory name check → `AccountService.signUp` (public, no session) → one-workspace guard → create
organization (unique slug) → **[`tenantContext.run(organizationId)`]** create first admin
(`isWorkspaceCreator: true`) → assign `clientAdmin` → issue JWT → return `AuthPayload`.

Band 3: `organization.created` pill (publisher confirmed, `organization.service.ts:79`) and **two**
`ConflictError` exits — email already founded a workspace, and workspace name taken.

**Anomalies:**

1. **A screenshot caught a routing fault no readback could.** The slug-collision failure connector left its
   guard's **right** edge and ran horizontally straight through the tenant boundary frame and the box inside
   it. Every property read back correct — stroke `#e03131`, weight 1.5, elbowed — because the defect was in
   the *route*, which no property describes. Re-anchored to the guard's bottom edge; the horizontal run now
   sits at `y ≈ 690`, below the frame's `672`. Re-verified by screenshot.
2. **Only the outer `tenantContext.run` is drawn, deliberately.** There are two on this path — the inner one
   inside `OrganizationService.create` wraps just its own publish. Drawing both would make the frame
   decoration rather than a boundary. Per §2.
3. **Same `FAIL` vs `FAIL_INK` typo twice**, once in each legend build. Both times the script threw and
   rolled back cleanly with nothing partial on canvas — verified by querying the target region before
   retrying, not assumed.

---

## Removals from Talha's board

| Removed | What it was | Replaced by | When |
|---|---|---|---|
| `2:85` + `2:96` `2:102` `2:123` `2:165` (+3 orphaned connectors) | The "Employee Onboarding Flow" sketch: `Go to X Page → Press X form → Add the following information (Name / Role / Sallary / XYZ) → Submit` | B4, built and verified | 2026-09-16 |

Still on the board and **not** removed, pending their replacements: `2:53` System & Admin Flows · `2:3`
Employee Flows · `2:244` Finance Module Flows · `2:197` Leave Request Flow · `3:259` Salary Slip Flow ·
`2:4` Log into Portal · `2:220` Navigate to XYZ · `2:237` HRMS User Flows (board title).

**Kept permanently, by instruction:** `3:251` Development Process — Tethr and `3:255` its note. That is
reserved space Talha said he would fill himself, not leftover scaffolding.

Note on the sketch's content: it wrote `Sallary`, and `create-employee.input.ts` has no salary field —
pay lives in `finance/compensation`. The sketch was an intent, which is the reason §1.0 says a sketch sets
band 1 and never the diagram's altitude.

---

## A2 — Tethr-driven client onboarding

Built: 2026-09-16 · Origin `(-4032, 1180)` · Act 01, slot 2 · Grid unchanged (280/312, bands +0/+140/+300)

Spine: `client:manage` gate → `AccountService.onboardClient` (attach existing client or found one) → create
workspace `kind: 'client'` → **[`tenantContext.run(organizationId)`]** create client admin
(`isWorkspaceCreator: true`) → assign `clientAdmin` → create Tethr admin → `assignSystemRole('tethrAdmin')`.

Band 3: `organization.created` pill · one `ConflictError` exit (client not found).

Four identifiers, one over the §4 cap, which bends for seams: `isWorkspaceCreator: true` is the seam back to
A1's guard — set here so a later self-serve signup with the same email is correctly recognised.

All four seeding steps sit **inside** the frame. Collapsing them to "create admins" would throw away the
fact the diagram exists to show: every client org gets a clientAdmin *and* a tethrAdmin together, so there
is never a window where a newly onboarded client has no Tethr staff able to work inside it.

Readback: section `(-3112, 1304) 1248 × 128`, fill `#e7efff`, stroke `#0755e9` @1.5. Inner boxes returned
absolute x `-3096 / -2784 / -2472 / -2160` — exactly on the 312 pitch. Right edge `-1864`, clears `-1520`.

Anomalies: the section reported **7** children against the 4 boxes appended. Inspected rather than assumed:
the extra three are the connectors running wholly *between* inner boxes, which FigJam auto-adopts. That is
correct — an edge inside the frame belongs to the frame and should travel with it. A1's section shows the
same pattern (3 children: 2 boxes + 1 internal connector).

## A3 — Login, workspace select & switch

*Not yet built.*

---

## A3 — Login, workspace select & switch

Built: 2026-09-16 · Origin `(-4032, 1940)` · Act 01, slot 3 · 8 boxes, right edge `-1568`

Band 1 holds **two** boxes — `LoginPage` and the mid-flow workspace picker. Band 1 means "the human", not
"the entry point"; narrowing it to the entry would cost every flow where a person acts partway through.

Spine is the multi-workspace path (the superset), with the set's first **skip connector**: `single match ·
most logins` from credential verification straight to the session token, visibly avoiding the picker round
trip. Same weight as the spine, forward only, labelled with its condition *and* its frequency — drawing the
superset as the spine inverts frequency, so structure follows coverage and the label carries frequency.

Band 3 has **no event pills** — this flow publishes nothing. Three failure exits: bad credentials, the
containment refusal from `resolveWorkspaceSelection`, and no-account-in-that-workspace on the switch path.

No boundary frame: the `modules/account` → `core/auth` crossing is carried by module-qualified identifiers
(`AccountService.login` against `AuthService.resolveWorkspaceSelection`), which is §intro's rule.

Anomalies: none.

---

## B4 / B4b — the split

Split 2026-09-16 under `process-flow-content.md` §5 and §5.1, after a §2.3 escalation.

**Why.** B4's corrected spec needed ten band-2 boxes and ran to roughly `-944` against the `-1520` column
every other diagram holds. The branch inside `setReportingLine` is a genuine two-armed branch — neither arm
is a subset of the other — so §2.3's skip treatment was explicitly unavailable. The seam chosen is one the
code already has: two GraphQL mutations, two permissions, two band-1 surfaces. Three independent axes agree,
which is what separates a real seam from a layout convenience.

**Measured, not asserted:** eight boxes lands at exactly `-1568` (A1, A3 and B4b all confirm it). Eight is
the width budget; §2.1 was corrected from nine. The rule that came out of it matters more than the number —
*a flow that needs more boxes is telling you it is two flows.*

### B4 — Employee onboarding · origin `(-4032, 2700)`

Four band-2 boxes, one pill, no failure exits. `employee:write` gate → `EmployeeService.create` → save
`Employee` (active, permanent) → audit. `employee.created` publishes and **nothing consumes it** (§0.3).

**It is sparse beside A1's eight and stays sparse.** The flow genuinely is this short. Padding it would be
the first lie in the set, and its shortness makes the same statement the old broken connector did.

Removed from the old combined diagram (captured before deletion): `25:36` Set manager · `25:48` assignment
gate · `25:52` Set reporting line · `25:56` cycle guard · `25:60` Resolve position · `25:64` Create
assignment · `26:51` assignment.created · `26:55`/`26:59`/`26:63` the three exits. All rebuilt in B4b.

### B4b — Reporting line & assignment · origin `(-4032, 3460)`

Eight boxes, right edge `-1568`. `assignment:write` gate → `setReportingLine` → self-report guard → cycle
guard → `currentPrimary` → **the branch**: `correct in place` (same-day) on one arm, `end current` →
`create new` on the other. Both arms sit at band-2 y and both terminate into band 3 — not a fourth row,
because a fourth y-position with a meaning is a band, and inventing one to hold branch arms is the swimlane
failure by the back door.

Band 3: `assignment.updated` · `assignment.ended` · `assignment.created`, none with a consumer. Three
failure exits.

**The condition on the split, honoured.** B4's broken connector was asserting a product finding — a freshly
created employee has no position and nothing gives them one. A missing connector asserts that; two separate
diagrams do not, and an absence is far easier to miss than a statement. So `No position to assign this
employee to` is drawn at **128px against the other exits' 96**, the only size deviation anywhere in the set,
and it is deliberate. A reader arriving from B4 meets the flow that refuses exactly the employee B4 created.

**Anomalies:**

1. **Both branch edge labels were cut after a screenshot.** `same day` and `dated change` each repeated
   their own target box (`Correct in place · same-day change`, `End current · at effective date`) — §5's
   orphaned-edge-label gotcha exactly. They also physically did not fit: the box gap is 32px. Branch
   conditions live in the arm's first box, not on the edge into it.
2. **The dated arm was rerouted over the top.** Routed under, it ran a long horizontal line through band 3
   between the failure exits and the pills. Band 1 is empty at that x, so the arc goes above. Readback
   cannot see this — only the screenshot could.
3. **Connector index off by one when clearing labels.** The first attempt targeted `53:396`, an unlabelled
   connector whose `text.fontName` is invalid, and `loadFontAsync` threw on the empty family. Refetched by
   *reading* each connector's endpoints and text rather than trusting creation order — position in a
   returned array is not an identifier.

---

## B5 — Separation & offboarding

Built: 2026-09-16 · Origin `(-4032, 4220)` · Act 02, slot 6 · Band 2 four boxes; band 3 runs **tall**

Band 2: `EmployeeService.separate` → set `employmentStatus: 'terminated'` → create `EmployeeSeparation` →
seed offboarding tasks. Band 3 top row: `employee.terminated` and `employee.separationRecorded`.

**Two events, not four.** The spec originally listed four pills here and I sized the layout against that.
`separate()` publishes exactly two; `employee.offboardingTaskUpdated` fires later from
`employee-offboarding.service.ts` when a task is updated, and `employee.exitInterviewRecorded` from
`employee-exit-interview.service.ts`. Both are offboarding, but they are downstream operations with their
own band-2 steps — drawing them as siblings would assert that one transaction emits four events, which is
false. Verified against the publish sites before redrawing.

**The fan is drawn as a fan, not a row — and the reason is semantic, not spatial.** Band 2 reads left to
right, so in this language **horizontal position means sequence**. The five consumers of
`employee.terminated` fire independently off one dispatch; none precedes another. A horizontal row would
assert an order that does not exist. They stack vertically instead, one dashed connector each, indented one
column so every connector descends a shared trunk and enters from the left.

This is why it is not the fourth-row failure rejected for B4b's branch arms. B4b's arms are the *same kind
of thing* — two ways one mutation proceeds — so one y is right, and splitting them would have invented a
distinction. A pill and a consequence step are *different kinds of thing*, and the grammar already says so:
a pill states an event was emitted, a consequence step states a module reacted, and §0.3 permits the second
only where a consumer is registered. **Inventing a distinction and reflecting one are not the same move.**

It also spends the cheap axis. Horizontal is bounded by the next act's column; vertical is bounded by the
next act's row, and acts simply move down. So the eight-box budget is never approached and §2.1 needs no
exception clause — better than sanctioning an overrun, since "it collides with nothing today" is a fact
with an expiry date.

Consumers drawn module-qualified so the reach is visible: `core/auth · disable logins` ·
`benefits · end enrollments` · `finance/billing · close membership at last working day` ·
`finance/compensation · close compensation records` · `finance/payroll · open final settlement`.

Fan occupies `y 4620–5196` at `x -3408`. **The next slot must start below `5356`** — subsequent diagrams
are re-pitched from the flat 760 accordingly.

**Anomalies:**

1. **First fan routing was wrong and only the screenshot showed it.** With the stack in the pill's own
   column, four connectors doubled back around the left of the stack and the fifth struck through the first
   box's label. Every property was correct; the fault was entirely in the routing. Indenting the stack one
   column and entering from the left fixed it.
2. Running total of defects caught by eye that no readback could see: **five** — A1's arrow through the
   tenant frame, B4b's two redundant edge labels, B4b's dated arm through the band-3 gap, and this. All
   were geometry that was individually correct and collectively wrong. **Individually correct geometry can
   still collide, and only eyes see it.**

---

## C6 — Leave request → approval

Built: 2026-09-16 · Origin `(-4032, 5560)` · Act 03 · 7 spine boxes, right edge `-1568`

Two role-prefixed band-1 boxes (`Employee · request leave`, `Approver · decide`) — §1.1's multi-actor rule:
a prefix, not a split band. Spine carries the reserve-then-settle mechanic, which is what makes this flow
non-trivial: `pendingDays` reserved on submit, settled on approve/reject/cancel.

Band 3: `leave.requested` under the save, then `leave.approved` / `leave.rejected` / `leave.cancelled`
**stacked vertically**. Same reasoning as B5's fan — these are three mutually exclusive outcomes of one box,
and a horizontal row would assert a sequence between them that does not exist. Two failure exits: no working
days in range, insufficient balance.

No arrow into D8. The service comment says `leave.approved` "feeds Payroll later" — later means there is no
consumer today, and a pill for an unheard event is the honest drawing.

## C7 — Clock → timesheet → lock

Built: 2026-09-16 · Origin `(-4032, 6440)` · Act 03 · 4 boxes, right edge `-2816`

The simplest diagram in the set and it looks it: a four-state lifecycle, four role-prefixed band-1 entries
above their own steps, two pills below. No failure exits — no domain-specific refusals exist on this path.

`timesheet.locked` is called "the immutable handoff to Payroll" in the service. It is a handoff by intent,
not by wiring: no consumer exists, so it is a pill and not an arrow into D8.

## D8 — Payroll run → finalize → payslip

Built: 2026-09-16 · Origin `(-4032, 7160)` · Act 04 · 8 boxes, right edge `-1568`

**The one flow where band 3 carries traffic in both directions.** Three inbound staleness events —
`compensation.revised`, `compensation.taxProfileChanged`, `benefits.enrollmentChanged` — stacked at band 3
left, each rising dashed into `Mark drafts stale`. §1.1's pre-ruled case: the dash means async causation and
only the direction reverses. Outbound `payroll.finalized` at the right, which is the seam into D9.

The tax profile is drawn as its own box resolved **at `periodEnd`**, not at the moment finalize runs —
non-negotiable #4 doing real work in the money path, and not something a reader would get from the code
without hunting. "Salary Slip" is folded in here as the `Employee · payslip` band-1 surface rather than
drawn as its own flow, per §1.

Anomalies: the payslip connector initially looped around the finalize box's right side; rerouted straight up
(the payslip sits directly above it) with the approver entering from the left. **Caught by screenshot.**
Also: my first fix attempt used node IDs derived by counting positions in the returned `createdNodeIds`
array and targeted the wrong three nodes. Re-resolved by *reading each node's text*. Second instance of the
same mistake today — **position in a returned array is not an identifier.**

## D9 — Invoice → issue → paid

Built: 2026-09-16 · Origin `(-4032, 8040)` · Act 04 · 8 boxes, right edge `-1568`

**Band 1 is empty at the start and that is correct.** This flow is triggered by another flow's event, not by
a person: the inbound `payroll.finalized` pill sits at band 3 far left with a dashed connector rising into
`BillingConsumer`. It renders identically to D8's outbound pill — same shape, same hex, same mono, same
string — so the two diagrams seam on sight.

**The boundary frame's purest case.** `tenantContext.run(event.tenantId)` — the relay runs outside any
request, so there is no ambient tenant and one must be re-established from the event itself. Nowhere else
does the frame's meaning matter so visibly.

The `Snapshot sender, bank, terms` box is non-negotiable #3 drawn: the invoice keeps the values it used, so
reprinting it years later does not pick up today's bank account.

## E10 — Module boundaries & event map

Built: 2026-09-16 · Origin `(-4032, 8700)` · Act 05 · **Not a process flow** — no actor, no happy path, no
bands, no time axis, built under its own rules per §11.

Counts read from the filesystem at build time, not copied from the spec: **`core/` 12** (audit, auth, authz,
config, database, documents, events, notifications, pdf, queue, tenancy, workflow) and **`modules/` 15**
(account, assignment, attendance, benefits, clients, employee, employee-records, engagement, expenses,
finance, forms, leave, organization, position, recruitment). Both matched §11.

Modules are ordered so every event-coupled one sits in the top row, keeping arrows short. **Arrows are
consumers, not publishers** — only a registered handler earns one. Five are drawable between boxes; the
other four registrations are internal to a single module and are stated in text rather than faked as
self-loops.

The thesis is written on the map so it cannot be misread as a defect: 34 published, 7 listened to over 11
registrations, the other 27 emitted and unheard — seams declared before couplings are needed, which is the
architecture working. The note cites `node scripts/verify-events.js` rather than freezing the numbers.

**Anomalies:** the first build labelled each arrow with its event name. At a 16px cell gap the labels
rendered straight across the module names they pointed at — `employee`, `benefits` and `recruitment` were
all obscured, and one label clipped to the meaningless fragment `lln`. This is §5's edge-label gotcha, and
a label that covers the node it points at is worse than no label. Labels stripped; all seven couplings are
named in a list below the map instead. One arrow was also dipping through the second row; rerouted between
adjacent cells. **Both caught by screenshot, neither visible in any readback.**

---

## Defects caught by eye that no readback could see

Running tally across the build, kept because it is the concrete case for §7's screenshot rule:

1. A1 — failure arrow cut through the tenant frame and the box inside it
2. B4b — two edge labels repeating their own target boxes, in a 32px gap
3. B4b — dated-change arm routed through band 3 between the exits and the pills
4. B5 — fan connectors doubled back around the stack; one struck through a label
5. D8 — payslip connector looped around the finalize box instead of going up
6. E10 — arrow labels rendered across the module names they pointed at
7. B4 (earlier) — `AssignmentService.setReportingLine` breaking mid-word

Every one had correct properties. **Individually correct geometry can still collide, and only eyes see it.**

---

## Removals from Talha's board — final

Cleared once each replacement was on canvas, never in advance. Every node's text was read back and matched
what was expected before it was deleted.

| Removed | Was | Replaced by |
|---|---|---|
| `2:85` `2:96` `2:102` `2:123` `2:165` | "Employee Onboarding Flow" sketch | B4 |
| `2:53` | "System & Admin Flows" heading | acts 01 / 02 |
| `2:3` | "Employee Flows" heading | act 03 |
| `2:244` | "Finance Module Flows" heading | act 04 |
| `2:197` `2:4` `2:220` | "Leave Request Flow" + Log into Portal / Navigate to XYZ | C6 |

**Kept deliberately:**

- `2:237` **HRMS User Flows** — the board title.
- `3:251` + `3:255` **Development Process — Tethr** and its note. Reserved space Talha said he would fill
  himself, not leftover scaffolding. Nothing placed there, nothing removed from it.
- `3:259` **Salary Slip Flow** — *left standing deliberately, and it needs his decision.* The payslip is
  drawn once inside D8 as an `Employee · payslip` band-1 surface, because drawing it twice would put one
  flow on the board under two headings. But §1.0 says an employee-perspective *retrieval* flow is his call
  made explicitly, not by default — so removing his heading would be implementing the default silently.
  It stays until he says which he wants.

That last one is §1.0's ambiguity rule doing its job: the cost of leaving one stray heading is a stray
heading; the cost of deleting something he meant to keep is unrecoverable by him.

---

# Review round — 2026-09-16

The design head screenshotted the finished board and worked through it rather than asking this session to
self-assess. Twelve findings. That separation matters: **the session that built a thing is the worst
reviewer of it**, because it sees what it intended. Every finding below was invisible from inside the build.

## Correctness — these said false things

1. **C6 drew `leave.cancelled` as an approver outcome. It is not.** `approve` and `reject` take a
   `decidedByUserId`; `cancel` does not, and `leave-request.service.ts:172` says *"Cancellation by the
   requester — no decider, releases the reservation."* Verified before acting. It is the requester
   withdrawing, possibly while still pending, with no approver involved.

   **This is the worst class of error in the set** — the picture looked reasonable, so no reader would have
   caught it. A diagram that is merely ugly gets fixed; a diagram that is quietly wrong gets believed.

   Fixed by giving cancellation its own band-1 entry (`Employee · cancel`) and its own short path
   (`Cancel · release reservation / no decider`) terminating in its own pill, entirely independent of the
   approval spine. To free the column, `Resolve entitlement` and the balance guard merged into one box —
   defensible, since they are one logical question ("do they have the days?") and the failure exit stays
   attached to it.

2. **D8's approver connector crossed a box's text, and sat above the wrong spine box.** `Approver · finalize`
   triggers `Finalize`, not `Categorize components`. Merged the tax-ladder and categorise steps and folded
   withholding into finalize — seven boxes instead of eight — so the approver now sits directly above the
   box it triggers and drops straight down. The payslip moved one column right, so its connector runs right
   and up into an empty column rather than crossing anything (which also answers the "only upward arrow in
   the set" note: it is now a right-then-up into a box's bottom edge, the same shape as any other entry).

## E10 — rebuilt, and the diagnosis generalises

3–4. The old E10 routed `employee → core/auth` **straight through the `engagement` box**, and drew one
relationship two ways — short arrows between adjacent grid cells, long routed arrows over the top — so a
reader could not tell they meant the same thing.

**The root cause is worth keeping: a grid ordered for inventory and a layout that needs adjacency for arrows
are in direct conflict, and inventory won by default.** That is why no connector had a clean route. And the
prose block plus the mono coupling table existed *because* the arrows had failed — **a diagram that needs a
table to restate its own content is telling you the diagram is not carrying it.** The table was the tell,
not the fix.

Rebuilt as a **coupling map, not an inventory**: only the eight modules that actually consume an event get a
box, positioned for the arrows. At `finance/` sub-module granularity those eight are exactly the eight with
arrows, which also dissolves three of the four "intra-module registrations with nothing to draw" — only
`recruitment`'s self-registration remains, and it is stated in one line rather than faked as a self-loop.

Every connector is now a straight run crossing nothing: `employee` fans right into a column of five
consumers; `compensation → payroll` and `payroll → billing` are adjacent verticals; `benefits → payroll`
brackets right where nothing sits. Counts are gone from the labels — that is inventory, and
`verify-events.js` is what inventory is for. The hidden grid principle (row 1 coupled, rows 2–3 alphabetical)
dissolved with the grid: a good idea nobody can see is not a good idea.

## Polish

5. The key's section-motif sample used **"SELF-SERVE SIGNUP"**, a real flow title appearing twice on the
   board — a reader could reasonably think the key *was* A1. Now `00  ACT NAME` / `FLOW TITLE`.
6. The key's `boundary frame` swatch rendered mid-string in a different face. Re-set to uniform DM Mono 12
   and re-verified by screenshot.
7. **"Salary Slip Flow" removed.** This session had deliberately left it pending an explicit decision. That
   was the wrong call twice over: the payslip is already drawn inside D8, so the heading was orphaned with
   nothing under it, and Talha had asked for the sketches cleared. Removing a heading does not foreclose
   anything — if he wants an employee-side retrieval flow it is a new diagram either way.

## Not changed, deliberately

- **C6's three stacked outcome pills** stay. They resemble B5's fan, but the far ends differ (pills vs
  consequence boxes) and nobody reads approve/reject/cancel as concurrent.
- **B4b's 128px no-position exit** stays. One deliberate, documented size deviation carrying meaning is not
  the ragged-grid failure, which is undeliberate variation carrying none.

## Two process notes from this round

- **Three times today a node was targeted by counting its position in a returned `createdNodeIds` array,
  and all three times it was the wrong node.** Every fix since resolves nodes by reading their text or
  endpoints. Position in a returned array is not an identifier — it is a coincidence that usually holds.
- The defects-caught-by-eye tally is now **eleven**. Not one was visible in a property readback.

---

# Layout pass — 2026-09-17

Executed after the correctness fixes and E10's rebuild, so E10 moved once rather than twice.

**The diagnosis, which explains every item.** Eleven diagrams and **no typographic level above the flow
title** — eleven titles at 34px, eleven eyebrows at 12px, and the only thing announcing an act was an
eyebrow repeating the same words three times running. No hierarchy means no navigation: a reader scrolling
ten thousand pixels had nothing telling them where they were or how much was left. **No diagram's internals
changed.**

## What was added

**Act headers** — one new level, built entirely from vocabulary already in use: a full-column rule
`2464 × 3px` in accent, above Manrope ExtraBold **56px** uppercase at `+0.5px`, with the act's one-liner in
Medium 16 muted. The rule is a flow's own 64px rule at thirty-eight times the length. **Hierarchy through
scale, in a language that already does hierarchy through scale** — 56 against 34 reads as one level up
without introducing anything new.

**Act index** at the top of the column: five lines, number, name, one-liner. A ten-thousand-pixel document
needs a table of contents and this is the cheapest navigation available.

**The key moved into the column**, from its island at `x -6000` to `x -4032` above Act 01. It is the first
thing a reader needs, so it belongs where they arrive rather than off to one side.

**Eyebrows now earn their line.** They said `01  ACCESS & IDENTITY` on three consecutive diagrams — exactly
what the act header now says. They read `01 · ACCESS & IDENTITY · 2 OF 3`: a reader inside an act knows how
far through they are, and a diagram screenshotted alone still says which act it belongs to, which a
position-only label would have lost.

## Three rulings held

1. **No act container frame, and no tinted band.** The accent-stroked rectangle means execution inside a
   tenant context and nothing else. A container in that treatment would give the set's most precise symbol a
   second meaning *at board scale, retroactively, across every diagram already drawn*. A tinted background
   would compete with the white box fills and is the swimlane chrome §1 rejects, arriving one level up.
   Rule plus whitespace is enough.
2. **One column, not two.** Columns are the obvious fix for a tall ribbon and wrong here: the set was
   ordered to tell a story, and columns make the order ambiguous at every act boundary — down, or across?
   The board is a document and documents are tall. **Reading order beats aspect ratio.**
3. **Right edges left ragged.** B4 and C7 were not padded to line up with A1. Padding adds content that
   means nothing to make a shape that means nothing, and B4's shortness is load-bearing. The full-width act
   rule gives the column a consistent edge to read *against*, which is what raggedness actually needed — a
   frame of reference, not uniformity.

## Rhythm, measured rather than assumed

Within an act: 160px from one diagram's bottom to the next's eyebrow. At an act break: **480px, exactly
three times**. An act break has to be visibly a *different kind* of gap — if a reader has to measure it, it
is not working.

Verified from the canvas, not from the plan: act rules at `1456 / 4292 / 7704 / 9800 / 11972`; all eleven
eyebrows in order at the expected offsets; **zero collisions across all 131 shapes on the board.**

## How the move was done

Diagrams were shifted **bottom-to-top**. Each moves further than the one above it, so working downward would
have placed an already-moved diagram inside the next diagram's selection range and moved it twice. Floating
connectors — the 64px flow rules — carry endpoint positions rather than an `x`/`y`, so they were shifted
through `connectorStart`/`connectorEnd`; connectors attached to nodes re-routed themselves, which is the
property that chose FigJam in the first place.

Talha's **Development Process — Tethr** region and the board title were confirmed untouched by reading their
coordinates back after every pass.

## Layout pass, second arrangement — horizontal acts

**The one-column ruling was reversed, and the vertical pass had already been executed when the reversal
landed.** No harm — the diagrams are fixed objects and only placement moved, so this was a rearrange rather
than a rebuild. Worth recording anyway: the reversal message assumed nothing had been moved yet, and it had.

**Why the reversal is right.** The original argument — a story has one reading order, columns make it
ambiguous, *down or across?* — objected to a **grid** while rejecting **horizontal**, which are not the same
thing. A single horizontal row is exactly as unambiguous as a single vertical one. And the ambiguity was
already handled: **the acts are numbered and indexed, so sequence is carried by `01…05` and the contents
list, not by position.** Once numbering carries the order, position is free to serve scanning — and sifting
through a board is scanning, not serial reading.

**The principle, which outlives the arrangement:**

| Level | Axis |
|---|---|
| A flow's spine | horizontal — left to right already means sequence |
| Diagrams within an act | vertical — keeps an act one narrow column, avoiding horizontal-inside-horizontal |
| Acts across the board | horizontal — landscape, like every screen these get read on |

**Each level alternates axis, so a reader never confuses which level they are traversing.** That is the
constraint to hold if the arrangement ever changes again.

**Arrangement:** three acts per row, wrapping — `01 02 03` / `04 05`. Act origins `(-4032, 1456)`,
`(-1088, 1456)`, `(1856, 1456)`, `(-4032, 4868)`, `(-1088, 4868)`. Column pitch 2944 = widest diagram 2464
plus the 480 act gap; row gap 480, the same three-times rhythm. Masthead, contents and key sit top-left
above the first row.

Board extent went from roughly `2,500 × 11,000` (1 : 4.4) to `8,352 × 6,914` (about 1.2 : 1).

**Act rules now span their own act's column** rather than a global width, which is better — the rule
measures something real. Measured from the canvas: 2464 for acts 01–04, **620 for act 05**, which holds one
short diagram.

**Ragged column heights left alone.** Act 03 ends well above acts 01 and 02 because it holds two diagrams
against three, and act 05 is shorter still. Nothing was padded, no diagram widened to fill a column, no
spine reflowed to tidy one. Same reasoning as the ragged right edges: padding adds content that means
nothing to make a shape that means nothing.

**Anomaly:** the first attempt to resize the act rules measured each column with a lower x bound but no
upper one, so act 01's rule came back **8352px** — spanning all three columns of its row instead of its own.
Caught in the returned measurements, not on canvas. Re-measured with both bounds; all five now match their
act. *A measurement with one open end is not a measurement of the thing you named.*

Verified after the move: **zero collisions across all 131 shapes**, and Talha's Development Process — Tethr
region and the board title confirmed in place by reading their coordinates back.

---

# Review round two — 2026-09-17

## Serious — a reserved symbol was spent on E10

E10 rendered `core/auth` in the **accent fill with a royal-blue stroke**. That is the boundary treatment,
and it means exactly one thing: execution inside a tenant context. Here it was being used to mean "this one
is platform, not domain."

**E10 is the worst possible place in the set to give that symbol a second meaning**, because it is the
diagram a reader consults to learn how modules relate — whatever it teaches there, they carry back to every
other diagram.

The tell was in this session's own prose. The caption read *"the one core box above is a consumer, not a
dependency."* **A symbol that needs a caption to disambiguate it has already failed.** Fixed: ordinary box,
ordinary border. Nothing is lost, because the `core/` prefix in the label already carried the distinction
for free and without ambiguity. The caption went with it — with the symbol gone, the disambiguation had
nothing left to disambiguate.

**Worth recording as a pattern rather than a slip.** The accent treatment is the most visually distinct tool
in the palette, which is exactly why it is reserved — and reaching for it was reaching for the most
available way to mark "a different kind of thing". **The pressure to spend a reserved symbol is highest on
the diagram that most needs to make a distinction.** Knowing that in advance is the only defence, because in
the moment it reads as the obvious choice rather than as a violation.

## Minor

- `compensation.revised` / `compensation.taxProfileChanged` stacked tight enough that the second overlapped
  the `benefits → payroll` bracket connector. Same class as the B4b edge labels, tighter. All three E10
  edge labels moved clear of the bracket.
- **Header zone laid out horizontally** — masthead left (`-4032`), contents centre (`-1088`), key right
  (`1856`), all on one band above the first act row. It previously stacked in a narrow left column with the
  whole top band empty above acts 02 and 03, which read as mid-build rather than finished.

## Confirmed on canvas by the reviewer, not from this log

C6's cancel path (own band-1 entry, own step, own pill, approval fanning only to approved and rejected) and
E10's rebuild both verified independently. The defects-caught-by-eye tally stands at **thirteen**.

---

# The dot sweep — 2026-09-17

Talha pointed at `Check name availability · advisory` and asked what the dot was doing. It was doing five
different jobs across the set, and **two of them pointed in opposite directions**: in `Employee · request
leave` the left side acts on the right; in `Check name availability · advisory` the right side describes the
left. Same mark, reversed relationship, three boxes apart in the same act. A reader cannot derive a rule
from that, so it reads as noise rather than structure.

**One symbol, one meaning applies to punctuation too — and punctuation is where it slips, because nobody
thinks of a separator as a symbol.** That is why it survived eleven diagrams while both sessions were
watching the shapes closely.

**Rule (`diagram-language.md` §2.0): in a box label, `·` separates an actor from their action, and that is
its only job.**

## What changed — 36 labels of 54 audited

| Was doing | Fix | Examples |
|---|---|---|
| step → qualifier | parentheses | `Check name availability (advisory)`, `Issue session token (JWT)`, `Create workspace (kind: client)` |
| verb → effect | set it as language | `Audit the create`, `Cancel, releasing the reservation`, `Submit, rolling up TimeEntry hours` |
| step → what it writes | move to line 2 | `Save Employee` / `active, permanent`, `Create EmployeeSeparation` / `type, date, reason` |
| category → condition | drop the category | `Guard · no reporting cycle` → `No reporting cycle` |
| category → code value | move to line 2 | `Permission gate` / `employee:write`, `Assign role` / `clientAdmin` |

Dropping `Guard ·` is safe because §2 already says a guard is an ordinary box whose failure leaves the
bottom edge in red. **The red exit already says "guard"** — the word was redundant with the picture.

## The 18 that kept their dot, and why

Fifteen are human actors (`Employee · request leave`, `Finance · issue`, `Payroll admin · create run`).
Five are B5's fan-out consumers — `core/auth · disable logins`, `finance/billing · close membership at last
working day`. **A module is an actor in that sentence**: it is the thing performing the action, the left
side is the subject, and the relationship points the same way as every human one. Kept deliberately rather
than by omission.

The mono eyebrow keeps its dots too. `01 · ACCESS & IDENTITY · 2 OF 3` is a metadata line in DM Mono, a
different typographic register from a Manrope box label, and §3 already establishes type as a legitimate
carrier of distinction. A breadcrumb separator in mono is not the same mark as a relationship operator in a
box.

## How it got in, which is the part worth keeping

**The original A1 had it right.** Its precheck box read `Public prechecks (advisory)` — parentheses,
correctly. The rebuild changed it to a dot while matching the role-prefix pattern it saw everywhere else.

**A convention spreads into places it does not fit precisely by looking like consistency.** That is the same
class of trap as the geometry gotchas, one level up: there, individually correct geometry collided; here, an
individually sensible label choice collided with a convention it superficially resembled. Watch for it
whenever a pattern is working well — that is exactly when it gets applied past its edge.

**Anomaly:** two labels were written with curly quotes (`status: ‘pending’`) in the first pass. DM Mono and
the identifier line mean *this exact string exists in the codebase*, and the code uses straight quotes, so
the curly form quietly made them not-the-string. Corrected in the same round.

## Dot sweep — follow-ups

**B5's five fan-out consumers keep their dots, and for a stronger reason than "the rule permits it".**
§2.0's invariant is **direction, not animacy** — an actor is whatever acts. `core/auth · disable logins` has
the module as subject and the action as predicate, pointing the same way as `Employee · request leave`. The
human examples dominated only because the convention originated in multi-actor human flows, which is a fact
about its origin and not a constraint on it.

The stronger point: on B5 the dot is not merely permitted, it is *correct*. That diagram's entire thesis is
that five modules react independently, so the module belongs in subject position. `Disable logins
(core/auth)` would bury the most important fact on the set's most-cited diagram inside a parenthesis.

**Only one guard actually needed re-phrasing, not two — and the error was mine.** This session reported two
exit-less guards from memory of what it had drawn rather than from the canvas. Checked properly, by scanning
every connector leaving each de-prefixed guard and testing its stroke against the failure red:

| Guard | Red exits | Outcome |
|---|---|---|
| `Start before end` (C6) | 0 | → `Start must precede end` |
| `Same email, not disabled` (A3) | 1 | left bare — the arrow carries the check |
| `One workspace per person` (A1) | 1 | left bare |
| `Not reporting to self` (B4b) | 1 | left bare |
| `No reporting cycle` (B4b) | 1 | left bare |
| `Run has lines` (D8) | 1 | left bare |
| C6's merged entitlement box | 1 | left bare |

**"Must" makes it unmistakably a constraint rather than an action** — the sentence carries what the red
arrow would have said. Where no exit is drawn, the language carries the check.

The mistake is the day's pattern one more time: **reading intent instead of the artefact.** Same failure as
A1's tick resting on a previous session's belief, and the same fix — go look. It cost one script, and it
stopped a rule generalising from a case that was not a case.

---

# What this build actually taught

Three defect classes, all of which shared one property:

1. **Geometry** — individually correct pieces that collided. An arrow through a tenant frame, a fan
   doubling back through its own stack, labels rendered across the nodes they pointed at.
2. **Convention** — an individually sensible choice colliding with a convention it superficially resembled.
   A1's `Public prechecks (advisory)` became `· advisory` in the rebuild *precisely by looking like* the
   role-prefix pattern everywhere else. **A convention spreads into places it does not fit by looking like
   consistency**, which makes a well-working pattern the most dangerous moment.
3. **Marks too small to register as marks** — a curly quote silently making `status: 'pending'` not the
   string it claims to be, and a separator doing five contradictory jobs because nobody thinks of
   punctuation as a symbol.

**None was visible from inside the thing being built, and none appeared in any property readback.** That is
the argument for the screenshot pass and for a second session reviewing, in one sentence.

Final tally: **fifteen defects caught by eye that no readback saw.**

---

# The second perspective — three human journeys · 2026-09-22

Built per `process-flow-content.md` §13. The technical acts were shifted down a uniform 1600 to open the
band above them; a uniform delta needs no ordering, since nothing moves relative to anything else.

## The two views differ in what counts as a step

Stripping identifiers off a technical diagram yields a *worse technical diagram*, not a human one — it still
has guards, service boundaries, event pills and failure exits, none of which a person experiences.
Technical unit = a service call. Human unit = a moment someone lives through. **Different decomposition,
not a filter.**

Three journeys, not eleven mirrors: the technical set fragments by module because the module is the
technical unit, and **a person's experience does not fragment there.** Nobody lives through "flow A1 then
flow B4."

The employee journey is drawn first — it is the only one whose opening moment is something another person
did, and that asymmetry is where most of the gaps are.

## Grammar — four marks

`moment` (white box) · `wait` (card-ground fill, muted — passive by silhouette) · `decision` (diamond) ·
`dead end` (failure red, the existing colour for "this ends here").

**The diamond is safe here and would not have been in the technical set.** §2's ban was scoped to *guards*,
whose failure is better shown as a red bottom exit; a person's choice is a genuine branch, which is what a
diamond actually means. It appears nowhere in the technical set, so it carries no second meaning. Used
exactly once, on the only real choice in the three journeys: which client workspace a Tethr staffer enters.

## The gaps — all verified against the code before drawing

| # | Gap | Verification |
|---|---|---|
| 1 | **Almost nothing notifies anyone.** `NotificationService` is real — Resend + Slack transports — with **two call sites in the whole API**, both in `recruitment`. | grep of every `NotificationService` reference |
| 2 | **No invite flow, and the product says there is.** `signUp` refuses a second workspace with *"Ask an admin to invite you into another one"*; no invite mutation exists in any resolver. | `grep -rln "invite" --include=*.resolver.ts` → empty |
| 3 | **`'invited'` is a state nothing can reach.** The column defaults to it, but `createUser` sets `status: 'active'` explicitly, and login only excludes `'disabled'`. | `user.entity.ts:7,23`; `auth.service.ts:47,85` |
| 4 | **A2 seeds two admins with passwords typed by staff**, and nothing emails either person. | `onboardClient` inputs; no notification call in `account` |

Nine dead ends drawn across the three journeys. **Every one was found by trying to draw the next moment and
finding there wasn't one** — not by reasoning about the code. That is what the mark is for.

The largest class by far is gap 1: a leave request reaches no approver, an approval reaches no employee, a
finalized payroll announces itself to nobody, a ready payslip is never mentioned, an issued invoice is never
sent. **Each is a person waiting for something that never arrives — and every one is invisible in the
technical set, because the system behaves correctly at every step.** That is the clearest argument for why
the second perspective was worth drawing at all.

**Gap 3 is deliberately not drawn.** `'invited'` has no transition in and no behavioural effect, so nobody
lives through it — and a moment is defined as something a person lives through. It is a real finding and it
is recorded here, but putting it on a journey would have been the same error as drawing a pill for an event
with no publisher. Logged rather than drawn, on purpose.

**Anomaly:** the decision diamond clipped its label at 280 × 96. A diamond's usable width tapers toward top
and bottom, so a label sized for a rectangle does not fit — resized to 280 × 184 and re-verified by
screenshot. Sixteenth defect caught by eye that no readback saw.

## Something else is on the board

A `06  EMPLOYEE PERFORMANCE` act header and roughly 62 nodes — *Manager Chooses to Fill / Snooze / Reject*,
*Send 1-Pager to Employee* — exist on the board and were **not created by this session**. They sit in row 2
beside acts 04 and 05, and the uniform 1600 shift moved them along with the acts, which keeps them aligned.

**Nothing of theirs was edited.** The 11 collisions the post-build check reported are all internal to that
set — a container enclosing its own contents — and none involves any node from this session or the
technical acts.

---

# Plain-language set — eleven mirrors · 2026-09-22

**The three-journey reading of "non-technical" was wrong.** Talha: *"the flows need to be exactly like how
they are for the technical ones but with less technical razzle dazzle — it's going to be the replica of the
exact same flows but will have non technical flow."*

So: **eleven diagrams, same structure, same boxes, same arrows, same dead ends — only the words change.**
The three abstract journeys stay; they were liked, and they answer a different question. They are not the
deliverable.

## Built by cloning, not redrawing

Every technical diagram was cloned wholesale at a uniform `+10000` y-offset, with all 115 connectors
recreated against a node-id map so the geometry mirrors exactly. Rebuilding by hand would have meant
re-deriving 131 positions, and any drift between the two sets would make them stop being comparable — which
is the entire point of a mirror.

Three E10 edge labels sat at `x -368`, just outside the act-05 clone window, and were missed by the first
pass. Caught by re-reading the plain band rather than assuming the clone was complete, and recovered.

## What "less technical" actually meant

Not fewer boxes — **different words in the same boxes**:

| Technical | Plain |
|---|---|
| `Sign up (no session yet)` / `AccountService.signUp` | You submit it — not signed in yet |
| `Permission gate` / `employee:write` | Only someone allowed to add people |
| `tenantContext.run(organizationId)` | inside the new workspace |
| `Resolve tax profile at periodEnd` / `compensation.getTaxProfile` | We use the tax details as they stood at the period end |
| `Snapshot sender, bank, terms` / `status: 'issued'` | Sender, bank and terms are frozen onto it |
| `employee.terminated` | Someone has left |
| `core/auth · disable logins` | Their logins are switched off |
| `MODULE BOUNDARIES & EVENT MAP` | WHAT TELLS WHAT |

Verified with a regex sweep for service names, dotted event names, permission strings, code literals and
`core/` `finance/` prefixes across the whole plain band: **zero matches remaining.**

**One consequence that had to follow, and nearly didn't.** §4 says DM Mono means *this exact string exists
in the codebase*. Once a pill reads `A new workspace was created`, that is no longer true — so mono would
have been actively lying on 36 nodes. Every plain pill, boundary caption and module box moved to Manrope.
The eyebrows stay mono, because `01 · ACCESS & IDENTITY · 1 OF 3` is still metadata and still exact.

That is the same class as the curly-quote defect, arrived at from the opposite direction: there, a
character change broke a string's claim to be verbatim; here, a wording change broke the *typeface's* claim.
**A convention that ties type to truth has to be re-checked whenever the truth changes, not only the type.**

## Board layout now

- `y -900 … 460` — masthead, contents, key
- `y 700 … 2576` — three human journeys (the abstract view)
- `y 3056 … 8160` — the technical set, five acts in two rows
- `y 12300 … 18160` — **IN PLAIN LANGUAGE**, the eleven mirrors

Another session's `06 EMPLOYEE PERFORMANCE` work sits in the technical row 2 and was neither cloned nor
edited.

---

# The two new marks — end-of-path circle & alternate wash · 2026-09-22

Applied `diagram-language.md` §2.4 (end-of-path circle), §2.5 (alternate wash) and the amended §8 (the
legend carries every mark, and carries two of them as an adjacent pair) across the whole board, matching
the hand-drawn `06 EMPLOYEE PERFORMANCE` reference. **Nothing in `06 EMPLOYEE PERFORMANCE` was edited** —
it is the reference, and its six marked nodes were read back at the end of the pass at the same
coordinates and colours they held at the start.

## Legend first — §8

Two rows added to the key at `(1856, -400…)`, in the existing row pattern (sample at `x 1856`,
explanatory text at `x 2026`, 56px pitch). The block below the role rows — both edge samples, both notes
and the section-label motif — was shifted down `112` to open them.

| Node | Property | Expected | Returned |
|---|---|---|---|
| Circle sample `120:1679` | shape / size | ELLIPSE / 24×24 | ELLIPSE / 24×24 |
| Circle sample `120:1679` | fill / stroke / weight | opacity 0 / `#001131` / 1.5 | `#ffffff@0` / `#001131@1` / 1.5 |
| Circle sample `120:1679` | position (final) | `(1919, 62)` | `(1919, 62)` |
| Circle label `120:1682` | font / size / fill / position | Manrope Medium / 14 / `#001131` / `(2026, 66)` | Manrope/Medium / 14 / `#001131@1` / `(2026, 66)` |
| Wash sample `120:1683` | shape / size / position | SQUARE / 150×40 / `(1856, 166)` | SQUARE / 150×40 / `(1856, 166)` |
| Wash sample `120:1683` | fill / stroke count | `#0755e9` @0.05 / 0 | `#0755e9@0.05` / 0 |
| Wash label `120:1687` | font / size / fill / position | Manrope Medium / 14 / `#001131` / `(2026, 178)` | Manrope/Medium / 14 / `#001131@1` / `(2026, 178)` |
| Boundary sample `47:168` | position (final) | `(1856, 110)` | `(1856, 110)` |
| Boundary label `47:172` | position (final) | `(2026, 122)` | `(2026, 122)` |
| Shifted block `47:177 / 173 / 182 / 178 / 183 / 184 / 185 / 186 / 190` | y + 112 | 125→237, 134→246, 169→281, 178→290, 214→326, 270→382, 338→450, 370→482, 388→500 | all as expected |
| Missed caption `47:191` | y + 112 | 438→550 | 438→550 |

Wording: `a path ends here` · `alternate paths — one of these, not all`.

**The key was then rebuilt once, on review, to put the boundary frame and the alternate wash adjacent.**
The first build ran `… failure exit · boundary frame · circle · wash`, which separated the two blue marks
by an unrelated row. §2.5 and §8 were amended the same day to make that adjacency load-bearing — the
confusion between a frame and a wash is *sequential*, someone remembering a hue three days after A1, so
the key is the only surface where the two are ever met together with their names attached. Final order,
read back off the canvas in render order:

`process box (-114)` · `event.pill (-58)` · `failure exit (-2)` · **`end-of-path circle (62)`** ·
**`boundary frame (110)`** · **`alternate wash (166)`**

The circle moved up rather than the wash moving down, which costs nothing and buys a second grouping: the
two *terminal* marks (failure exit, circle) are now adjacent as well as the two *region* marks.

## Mark 1 — end-of-path circles

**Path ends were re-derived from the canvas, not taken from the brief.** 330 shapes, 339 connectors,
**109 sinks** (shapes with out-degree 0) — the count the brief carried, and it still held. After the §2.4
exclusions the genuine path ends are **24, not the ~40 the brief estimated**. Breakdown of the 109:

| Class | Count | Treatment |
|---|---|---|
| Failure exits (fill `#fdecec`) | 36 | excluded — red is already the ending |
| Event pills (`ROUNDED_RECTANGLE`) | 31 | excluded — the emission ends that branch |
| Flow 10 / `05 · SYSTEM`, both bands | 6 | excluded — a map has no paths |
| `06 EMPLOYEE PERFORMANCE` (`91:*`) | 6 | excluded — the reference, untouched |
| Board furniture (key + MARKS key) | 6 | excluded |
| **Genuine path ends** | **24** | one circle each |

Per circle: `ShapeWithText` ELLIPSE 24×24, fill opacity 0, stroke `#001131` 1.5, empty text; reached by an
ELBOWED connector `#657187` 1.5, start cap `NONE`, end cap `ARROW_LINES`; placed at `box.right + 32`,
centred on the box's cross axis.

| Diagram | Node ended | Circle id | Circle at | Caption |
|---|---|---|---|---|
| A1 | `49:169` Return AuthPayload | `122:1683` | `(-1536, 3688)` | `Session issued` |
| A2 | `51:223` Assign role / assignSystemRole | `123:1688` | `(-1848, 4440)` | `Client live` |
| B4 | `53:302` Audit the create | `123:1696` | `(160, 3688)` | `On record` |
| B5 spine | `55:358` Seed offboarding tasks | `123:1704` | `(160, 5188)` | `Exit under way` |
| B5 fan ×5 | `55:394 / 398 / 402 / 406 / 410` | `124:1703 / 1710 / 1717 / 1724 / 1731` | `(-152, 5448 / 5568 / 5688 / 5808 / 5928)` | **bare** |
| D8 | `57:539` Employee · payslip | `124:1738` | `(-1536, 6960)` | **bare** |
| D9 | `58:636` Record paidAt, paymentReference | `124:1745` | `(-1536, 7976)` | `Invoice paid` |
| Journey 1 | `102:914` You leave | `124:1753` | `(-1536, 1192)` | **bare** |
| Journey 3 | `103:1030` You work inside that client | `124:1760` | `(-2160, 2376)` | **bare** |
| plain A1 | `105:1127` You land in your new workspace | `125:1748` | `(-10704, 4398)` | **bare** |
| plain A2 | `105:1021` That one is made a Tethr administrator | `125:1755` | `(-11016, 5150)` | `Client is live` |
| plain B4 | `105:1367` We record who did it | `125:1763` | `(-9008, 4398)` | `On record` |
| plain B5 spine | `105:1326` Offboarding tasks are created | `125:1771` | `(-9008, 5898)` | `Exit under way` |
| plain B5 fan ×5 | `105:1335 / 1338 / 1341 / 1344 / 1347` | `125:1794 / 1801 / 1808 / 1815 / 1822` | `(-9320, 6158 / 6278 / 6398 / 6518 / 6638)` | **bare** |
| plain D8 | `105:1762` Employee · payslip | `125:1779` | `(-10704, 7670)` | **bare** |
| plain D9 | `105:1743` The date and reference are recorded | `125:1786` | `(-10704, 8686)` | `Invoice paid` |

Captions: **9 earned, 15 bare.** Every caption node returned Manrope/Medium 12, `#001131@1`,
`textAlignHorizontal: CENTER`, `textAutoResize: HEIGHT`, node width 160, placed at
`(circleCentre − 80, circleBottom + 8)`.

The bare ones divide into two kinds, and both are §2.4 as written. **Ten are bare because the last box
already *is* the outcome** — B5's two fans (`core/auth · disable logins`, `Their logins are switched off`
and their four siblings each side), which §2.4 names explicitly. **Five are bare because captioning them
would restate their own box**: `Employee · payslip` in both bands, `You leave`, `You work inside that
client`, and plain A1's `You land in your new workspace`.

That last one is the only place the plain band diverges structurally from the technical band. Technical A1
ends `Return AuthPayload`, which is an act, so `Session issued` names the state it leaves and is earned.
Plain A1's mirror of that box reads `You land in your new workspace`, which is already the state — so a
caption there would restate it, and §2.4's test is on what the box says. **The mirror rule is about words;
the caption rule is about whether the words have already done the job.** Recorded because it is the one
divergence a reader diffing the two bands will find.

Uniformity check at the end of the pass, asserted rather than assumed — fill opacity is the number `0`,
stroke resolves to `#001131`, `strokeWeight === 1.5`, size `24×24` — **all 24 passed; the only circles that
failed are the four hand-drawn ones in `06`** (`#242424` at 1px), which is the correct result: they are the
reference and were not to be restyled.

## Mark 2 — alternate wash

**Branch points were derived, not searched for.** Every shape with two or more outgoing *solid, non-red*
connectors was enumerated — dashed royal connectors are async emissions and red ones are failure exits, so
neither is an arm. That returned **8 branch points, of which 4 are inside `06 EMPLOYEE PERFORMANCE`**. Of
the remaining four, two are one branch mirrored and two are the other:

| Branch point | Arms | Ruling |
|---|---|---|
| `53:340` B4b *Find current assignment* | `Correct in place` ‖ `End current → Create new` | **wash** — genuine divergence, neither arm a subset |
| `105:1282` plain B4b *We find their current placement* | same, mirrored | **wash** |
| `52:248` A3 *Verify credentials* | `Mint selection token …` ‖ skip to `Issue session token` | **no wash** — §2.3 skip, see below |
| `105:1070` plain A3 *We check your email and password* | same, mirrored | **no wash** |

| Node | Property | Expected | Returned |
|---|---|---|---|
| Wash `128:1803` (B4b) | position / size | `(440, 4336)` / 968×160 | `(440, 4336)` / 968×160 |
| Wash `128:1803` | fill / strokes / corner / z | `#0755e9`@0.05 / none / 6 / back | `#0755e9@0.05` / 0 / 6 / page index 1 |
| Wash `128:1807` (plain B4b) | position / size | `(-8728, 5046)` / 968×160 | `(-8728, 5046)` / 968×160 |
| Wash `128:1807` | fill / strokes / corner / z | `#0755e9`@0.05 / none / 6 / back | `#0755e9@0.05` / 0 / 6 / page index 0 |

Both washes clear `32` on every side of the arms they contain, and the bottom edge lands exactly `32` above
the band-3 pills — the pills are deliberately **outside** the wash: they are emissions from the arms, not
arms, and band 3 is not where the spine becomes plural.

**Diamond conversions: none, deliberately.** §2.5 converts the branch point only where the box is *entirely*
the choice. Both wash branch points are lookups — `Find current assignment` / `We find their current
placement` — i.e. steps that happen to have two outcomes, which §2.5 explicitly says to leave as boxes
rather than manufacturing a decision node to justify the wash.

**Reference nodes re-read at the end of the pass, unchanged:** `91:1191` `91:1234` `91:1344` `91:1708`
ELLIPSE 24×24 `#1e1e1e@0` / `#242424` @1 at `(1912, 7498)` `(1912, 7386)` `(2224, 7274)` `(3376, 7052)`;
`91:1472` SQUARE 1144×466 `#3dadff@0.05` / `#f2f8fc` @4 at `(1152, 7122)`; `91:1594` SQUARE 280×96
`#ffffff` / `#dce3ee` at `(2672, 7122)`. Identical to the pre-build read.

Board totals after the pass: **358 shapes** (+24 circles, +2 washes, +2 legend samples) and **363
connectors** (+24). Re-deriving sinks returns **113**, of which **29 are 24px circles** (24 new, 4 in `06`,
1 in the key) and the only non-circle, non-pill, non-red, non-furniture sinks left are the two washes
themselves — i.e. **no genuine path end is left unmarked.**

## Screenshots spent

The key's mark column · A1's tail (the pattern, before the other 23) · A2's tail · B4b with its wash ·
**B5 in full, as its own named step** · **plain B5 in full, as its own named step** · act 04's two tails ·
the journeys' two tails · plain B4b with its wash · plain B4's tail.

**B5's five bare terminators were looked at deliberately and they do not clutter.** They are identical,
bare, evenly spaced on the fan's own 120 pitch, and each sits on its box's centre line, so they resolve
into a single vertical column — one edge to the fan rather than five competing marks. Total added ink is
five 24px hairlines against five 280×96 boxes. The sixth circle, the spine terminator with `Exit under
way`, sits a row up and to the right and reads as separate, which is correct: it ends the spine, they end
the five branches. The same holds in the plain mirror. **What the column buys is the joint** — B5's five
endings are now visibly the same kind of ending as A1's and D9's, which is the whole reason the mark
exists, and it is precisely the diagram where a reader would otherwise have had to infer it.

**Anomalies:**

1. **§2.4's caption geometry only clears the box for captions of about 14 characters or fewer, and the
   canvas was not told to change — the captions were.** A 160-wide caption centred on a circle sitting `32`
   past the box overhangs the box by 36px of *node*, which is harmless, but the *ink* overhangs by
   `inkWidth/2 − 44`. The first pass wrote `Client workspace ready` on A2 and a screenshot showed the word
   "workspace" crossing the tenant boundary frame's royal stroke. Per this file's own rule the default is
   to fix the canvas, not the doc — so the geometry was kept and the captions shortened to fit it
   (`Client live`, `On record`, `Exit under way`), with the ink width measured on canvas rather than
   estimated: 56 / 56 / 82 / 85 / 67 / 68 px, all under the 88px clear zone. **§2.4's own example,
   `Session issued`, measures 85px — it sits one character inside the limit, which is evidence the spec's
   geometry was written for captions of that length rather than evidence the geometry is wrong.**
2. **`cornerRadius` is read-only on a FigJam `ShapeWithText`**, so §2.5's `cornerRadius: 6` cannot be set.
   It does not need to be: FigJam derives it from the shape's size, and both diagram washes returned
   **6** unprompted, matching the hand-drawn reference's `91:1472`. The 150×40 legend sample returns **3**
   for the same reason. Recorded rather than fixed — there is nothing to fix.
3. **A screenshot caught a legend collision a bounding-box check had no chance to see, because the node was
   outside the window I read.** The first region read was bounded `y ≤ 400`; the caption
   `every diagram carries this header stack` sits at `y 438`, so the 112px shift left it sitting on top of
   `00 ACT NAME`. *A measurement with one open end is not a measurement of the thing you named* — the same
   anomaly as the act-rule width, arrived at from the other side. Seventeenth defect caught by eye that no
   readback saw.
4. **§2.5 names `Approver · decide` as the example of a wash branch point, and on this board that box is
   not a branch point.** C6's `Approver · decide` (`56:406`) has exactly **one** outgoing connector, into
   `Workflow approval → settle balance` (`56:434`); it is that box which fans, and it fans into two
   *pills* over dashed connectors. So C6 gets no wash: its plurality lives entirely in the async plane, the
   spine never becomes plural, and there are no arms to enclose. The review round of 2026-09-16 had already
   ruled that "nobody reads approve/reject/cancel as concurrent" — washing them would add a mark to solve a
   problem that round found did not exist. **The spec's example is a description of a shape the language
   permits, not a claim about what is on the canvas; §intro's rule applies to §2.5's example too.**
5. **A3's skip is not a wash, and the discriminator is already in this file.** `Verify credentials` does
   open two mutually exclusive arms, so §2.5's exclusivity test passes on its face. But the B4/B4b split
   entry above states the rule that separates the two constructs: §2.3's skip is for a path that is a
   *strict superset* of the other, §2.5's wash for arms where "neither arm is a subset of the other". A
   wash over A3's long arm would also invert §2.3's third constraint — the skip must stay *subordinate to
   the spine* — by making the long route the visually marked region. No wash; the labelled skip connector
   already carries it.
6. **Journey 3's diamond is not a branch point either.** `Which client workspace?` has one outgoing
   connector: every choice leads to the same next moment. §2.5's test is on drawn arms, so no wash — and
   the diamond is correctly already a diamond, so no conversion was needed there either.
7. **The wash tint and the human journeys' `wait` fill are close in value** — `#0755e9` at 5% over the
   `#f1f5fd` ground lands near the `wait` box's own `#f1f5fd`. They never co-occur in one diagram (the
   journeys have no wash), and a `wait` box has a border while a wash has none, so nothing was changed.
   Noted because it is the kind of adjacency that becomes a defect the first time a journey gains a branch.
8. **The wash's left edge lands exactly on its branch box's right edge**, because the box gap and the
   wash's clearance are both `32`. Checked on screen rather than reasoned about: it reads as the alternate
   region beginning at the branch, which is right, and the arm connector crosses the edge without
   incident. No change made; recorded so the coincidence is not mistaken for a miscalculation later.

# Rulings 2 & 3 — duration labels and standing note blocks · 2026-09-22

Applied `process-flow-content.md` §14.5 (Ruling 3, the standing note block) and §14.4 (Ruling 2,
duration on the connector) **to the eleven technical diagrams only**. Rulings 1 and 4 were explicitly
out of scope for this pass and nothing was moved, resized, restyled or re-parented: the entire output
is new text nodes in previously empty space. `06 EMPLOYEE PERFORMANCE` was not touched — its two
duration connectors were read back unchanged at the end of the pass. The plain-language mirrors and the
three journeys were not touched either; §14.7 makes the technical set normative and the mirror is a
separate, later instruction.

## The geometry, measured before anything was written

Every one of the eleven diagrams has **exactly the same clear strip**: the section-motif title's node
bottom sits at `origin.y + 96` and band 1's first box at `origin.y + 196`, so the usable space below the
motif and above band 1 is **100px**, board-wide. Measured with a window **bounded at both ends**
(`y ∈ [origin.y + 90, origin.y + 200]`, `x ∈ [origin.x − 400, origin.x + 3600]`) after the last pass's
third anomaly — *a measurement with one open end is not a measurement of the thing you named.*

| Diagram | Origin | Title bottom | Band 1 top | Strip | Occupied by |
|---|---|---|---|---|---|
| A1 | `(-4032, 3316)` | 3412 | 3512 | 100 | nothing |
| A2 | `(-4032, 4068)` | 4164 | 4264 | 100 | nothing |
| A3 | `(-4032, 4820)` | 4916 | 5016 | 100 | nothing |
| B4 | `(-1088, 3316)` | 3412 | 3512 | 100 | nothing |
| B4b | `(-1088, 4032)` | 4128 | 4228 | 100 | nothing |
| B5 | `(-1088, 4816)` | 4912 | 5012 | 100 | nothing |
| C6 | `(1856, 3316)` | 3412 | 3512 | 100 | nothing |
| C7 | `(1856, 4116)` | 4212 | 4312 | 100 | nothing |
| D8 | `(-4032, 6728)` | 6824 | 6924 | 100 | nothing |
| D9 | `(-4032, 7604)` | 7700 | 7800 | 100 | nothing |
| E10 | `(-1088, 6728)` | 6824 | 6884 | **20** | its own prose line `66:733` at `6828–6864` |

**100px will not hold a stacked multi-heading block**, so the block runs as **columns across the strip**,
not as a list down it: each heading is one column at `700` wide on a `748` pitch, eyebrow at
`origin.y + 114`, body at `origin.y + 136`. Three columns reach `origin.x + 2196`, inside the act
column's `2464`. Clearance is `18` above the block and `24` below it for a two-line body. Nothing was
moved to make this fit; the lines were written to fit the space, which is the same resolution the
end-of-path captions got.

## What each diagram earned

Seven of eleven carry a block. **Four earned nothing and that is the recorded result, not a shortfall.**

| Node | Property | Expected | Returned |
|---|---|---|---|
| A1 eyebrow `135:1807` | font / size / tracking / case | DM Mono Medium / 12 / `+12%` / UPPER | `DM Mono/Medium` / 12 / `{PERCENT,12}` / `UPPER` |
| A1 eyebrow `135:1807` | fill / position / height | `#667899` / `(-4032, 3430)` / 16 | `#667899` / `(-4032, 3430)` / 16 |
| A1 body `135:1808` | font / size / leading / fill | Manrope Medium / 12 / 18px / `#001131` | `Manrope/Medium` / 12 / 18 / `#001131` |
| A1 body `135:1808` | width / height / lines / no wrap | 700 / 36 / 2 / true | 700 / 36 / 2 / **true** |
| B4 `137:1807 / 1808` | eyebrow + 2-line body | `#667899` 16h / `#001131` 700×36 | as expected, `noWrap: true` |
| B5 `137:1809 / 1810` | eyebrow + 1-line body | `#667899` 16h / `#001131` 700×18 | as expected, `noWrap: true` |
| C6 `138:1807 / 1808` | `PER-CLIENT CONFIG` col 1 at `x 1856` | 700×36, 2 lines | `(1856, 3430/3452)`, 700×36, `noWrap: true` |
| C6 `138:1809 / 1810` | `CANNOT` col 2 at `x 2604` | 700×36, 2 lines | `(2604, 3430/3452)`, 700×36, `noWrap: true` |
| C7 `138:1811 / 1812` | eyebrow + 1-line body | 700×18 | as expected, `noWrap: true` |
| D8 `139:1807…1812` | three columns at `-4032 / -3284 / -2536` | 2 / 2 / 1 lines | as expected, all `noWrap: true` |
| D8 block | right edge vs act column | `≤ -1568` | `-1836` |
| D8 block | bottom vs band 1 | `< 6924` | `6900` |
| D9 `139:1813…1816` | two columns at `-4032 / -3284` | 2 / 1 lines | as expected, all `noWrap: true` |
| D9 block | bottom vs band 1 | `< 7800` | `7776` |

**The fit check can fail, and was built to.** Each body node is `textAutoResize: 'HEIGHT'` at a fixed
`700` width with an explicit `lineHeight: {PIXELS, 18}`, so `height === 18 × declaredLineCount` is true
only if no line wrapped. Every read asserted the *shape* of the value first — `typeof height === 'number'`,
`fills` is a one-element `SOLID` array before any hex comparison — per §7.1. This is deliberately not
B4's old `shape.text.height` check: a plain `TEXT` node has a real numeric height where a FigJam
`ShapeWithText` returns `undefined`.

### Verbatim text, and the symbol that justifies each line

| Diagram | Heading | Line | Justified by |
|---|---|---|---|
| A1 | `CANNOT` | `Found a second workspace from this form with the same email.` | `AccountService.signUp` → `AuthService.hasCreatedWorkspace(email)` → `ConflictError` |
| A1 | `CANNOT` | `Only founding is capped — one email may be a member of any number of workspaces.` | the guard's own comment; `AuthService.createUser` carries no membership cap |
| B4 | `CANNOT` | `Set a position, a manager or pay here — the create form carries none of them.` | `CreateEmployeeInput` (`dto/create-employee.input.ts`) — 17 fields, none of them position, manager or pay |
| B4 | `CANNOT` | `Be run by a client's own admin — employee:write is seeded to Tethr roles only.` | `@RequirePermissions(PERMISSIONS.employeeWrite)` on `createEmployee`; `SYSTEM_ROLES` gives `employee:write` to `tethrAdmin`/`tethrHr`, not `clientAdmin` |
| B5 | `CANNOT` | `Change the offboarding checklist — the six tasks are fixed in code, not tenant data.` | `OFFBOARDING_DEFINITIONS` in `EmployeeService.separate`, over the closed union `EmployeeOffboardingTaskKey` |
| C6 | `PER-CLIENT CONFIG` | `Leave types: paid or unpaid, whether approval is needed, default annual entitlement.` | `LeaveType` (`leave_types`), `TenantScopedEntity`, columns `paid` / `requiresApproval` / `defaultAnnualEntitlement` |
| C6 | `PER-CLIENT CONFIG` | `Holiday calendars and their dates — a holiday inside a request does not spend leave.` | `HolidayCalendar`, `Holiday`, both `TenantScopedEntity`; `HolidayService.getHolidayDates` feeds `countWorkingDays` |
| C6 | `CANNOT` | `Set a working week — the weekend is fixed to Saturday and Sunday in code.` | `countWorkingDays` → `isWeekend` (`packages/shared/src/temporal/date-range.ts`); the signature takes holidays and nothing else |
| C6 | `CANNOT` | `Be approved by a client's own admin — leave:approve is seeded to Tethr roles only.` | `@RequirePermissions(PERMISSIONS.leaveApprove)` on the decide mutations; `SYSTEM_ROLES` → `tethrAdmin`, `tethrHr` |
| C7 | `CANNOT` | `Reopen a locked timesheet — the lifecycle only ever moves forward.` | `TimesheetService.submit/approve/lock` status guards; a tree-wide grep finds **three** writes to `Timesheet.status`, all forward, all in that file |
| D8 | `PER-CLIENT CONFIG` | `Pay components, and how a salary structure splits gross pay into them.` | `PayComponent`, `SalaryStructure`, `SalaryStructureComponent` — all `TenantScopedEntity` |
| D8 | `PER-CLIENT CONFIG` | `The withholding ladder — one active tax slab group per client.` | `TaxSlabGroup` / `TaxSlab`, `TenantScopedEntity`, `isActive`; resolved by `TaxSlabService.getActiveLadder` |
| D8 | `CANNOT` | `Edit a run once it is finalized — only drafts take line edits or removals.` | `ConflictError('Only draft runs can be edited')` in `updateRunLine`; `'Only draft run lines can be removed'` in `removeRunLine` |
| D8 | `CANNOT` | `Be run by a client's own admin — payroll:write and payroll:finalize are Tethr-only.` | `@RequirePermissions` on the run mutations; `SYSTEM_ROLES` → `tethrAdmin`, `tethrFinance` |
| D8 | `PRE-REQUISITES` | `A tax slab group must be active — with none, withholding silently computes as zero.` | `getActiveLadder()` returns `null` when no group `isActive`; `finalizeRun` passes `ladder ?? []` into `calculateMonthlyWithholding` and does not throw |
| D9 | `PER-CLIENT CONFIG` | `Commercial terms: the per-employee monthly fee, its currency and the anchor day.` | `ClientBillingConfig.feeAmount / feeCurrency / anchorDay`, `TenantScopedEntity`, unique per org |
| D9 | `PER-CLIENT CONFIG` | `Payment terms in days, and the sender and bank details printed on the invoice.` | `ClientBillingConfig.paymentTermsNetDays` and the `sender*` / `bank*` columns, read into `issuedSnapshot` at issue |
| D9 | `CANNOT` | `Edit an invoice once it is issued — only a draft can be changed or voided.` | `ConflictError('Only draft invoices can be edited …')` and `'Only drafts can be voided …'` in `InvoiceService` |

### The four that earned nothing

- **A2** — the only candidate was `PERMISSIONS.clientManage` (`tethrAdmin` only, and `clientAdmin`
  demonstrably lacks it). Rejected as **redundant with the diagram's own title**,
  `TETHR-DRIVEN CLIENT ONBOARDING`, which already says who drives it. §2.4's rule against a caption that
  restates its own box applies to a note block restating its own title.
- **A3** — every constraint it has is already a drawn failure exit (bad credentials; the
  `resolveWorkspaceSelection` containment guarantee). No tenant-scoped config touches login.
- **B4b** — all three of its constraints (no position, self-reporting, reporting cycle) are already
  failure exits, and the no-position one is deliberately the **foregrounded** exit per §5.1. A
  `PRE-REQUISITES` bullet restating it would dilute the diagram's strongest statement. No config.
- **E10** — no actor, no happy path, nothing configurable, and geometrically its strip is already spent
  on its own prose line (`66:733`, `6828–6864`, first box at `6884`, 20px clear). Checked, then left alone.

## Ruling 2 — one duration earned, and it could not be drawn

**Exactly one material wait in the technical set has a number behind it**, and the search for others was
exhaustive rather than impressionistic:

| Candidate wait | Number? | Result |
|---|---|---|
| D9 invoice issued → payment confirmed | **yes** — `ClientBillingConfig.paymentTermsNetDays` (default `7`), applied as `invoice.dueDate = addIsoDays(issueDate, config?.paymentTermsNetDays ?? 7)` | earned `net 7 days (configurable)` |
| B5 notice period | `Employee.noticePeriodDays` exists but **`separate()` never reads it** | unsourced — no label |
| B4 probation window | `probationEndDate` / `scheduledConfirmationDate` are stored and read by nothing | unsourced — no label |
| C6 / C7 / D8 approval SLA | none — `workflow.service.ts` says *"chains/steps/escalation layer in"* a future pass | unsourced — no label |
| D8 pay date | set from input at finalize; no fixed interval | unsourced — no label |
| D9 anchor day 20 | a billing *trigger*, not a wait on a connector | not a duration |

The one earned label **was built, screenshotted, and reverted**, because it does not fit:

| Node | Property | Expected | Returned |
|---|---|---|---|
| `58:690` (issue → mark paid) | endpoints | `58:661` → `58:632` | `58:661` → `58:632` |
| `58:690` | bbox before | `(-2188, 7988)` 25×0 | `(-2188, 7988)` 25×0 |
| `58:690` | bbox with label | small growth | `(-2277, 7969)` **196×34** |
| `58:690` | label font after set | `DM Mono/Medium` | **`Inter/Medium`** — see anomaly 2 |
| `58:690` | bbox after revert | `(-2188, 7988)` 25×0 | `(-2188, 7988)` 25×0, `characters.length === 0` |
| `58:690` | stroke / weight / type after revert | `#657187` / 1.5 / ELBOWED | `#657187` / 1.5 / ELBOWED |

## Screenshots spent

A1's header band · B4's · B5's · C6's two-column block · C7's · D8's three-column block · D9's ·
D9's issue→paid connector **with** the duration label (the one that caught it) · the same region after
the revert. Each screenshot was taken by inserting a canvas-coloured `ShapeWithText` at page index 0,
calling `screenshot({ contentsOnly: false })` on it and removing it in the same call — a back-most probe
is needed because `get_screenshot` crops to the node it is given and no node on this board spans a
diagram's header band. A zero-opacity probe returns a **blank image**; the probe has to be opaque and
behind everything. All probes verified removed (`leftoverProbes: []`).

> **Retired, 2026-09-25 — do not rebuild this.** The probe was never necessary. `await page.screenshot({
> scale })` renders a composited *full-page* view that already includes the page background, so there is
> nothing left for a back-most opaque rectangle to supply, and `get_screenshot`'s crop-to-node limitation
> that motivated it does not apply to a page node. The five closing screenshots of the title-spacing pass
> were taken that way on all five pages and created no node at all. Every sentence above stays as the
> record of why it was built; this line is why it stops.

**Board totals after the pass: 888 top-level nodes** (866 + 22 text nodes: 10 eyebrows, 12 bodies).
Twenty-four previously-measured existing nodes re-read at the end — including `06`'s `91:742`, `91:745`,
`91:813` and its two duration connectors, which still read `30 Days Later` and `85 Days Later` —
**zero moved**.

**Anomalies:**

1. **Ruling 2 is not placeable on this board's geometry, and this is the finding of the pass.** §4 fixes
   `box→box gap 32`, so every step-to-step connector in the set is a **25px drawn run**. A connector label
   is centred on that run and sized by its own ink: `net 7 days (configurable)` rendered **196px wide**,
   overhanging the issue box by ~72px and `Mark paid (write lock, must be issued)` by ~70px, and crossing
   the tenant boundary frame's royal stroke — visible in the screenshot, invisible to any readback. The
   ruling was imported from `06`, whose connectors span **225 and 177px** because its boxes sit on a much
   looser pitch. **The label was reverted rather than shrunk or nudged**: shortening it to `net 7` would
   drop the `(configurable)` qualifier §14.4 explicitly requires, and opening a gap means moving
   `Mark paid`, which this pass was forbidden to do and should not do unilaterally anyway. Escalated, not
   fudged. §14.4 needs either a geometry exception for connectors that carry a label, or a different
   carrier for a duration.
2. **Setting `fontName` on a `ConnectorNode`'s text sublayer silently did not take.** After
   `conn.text.fontName = {family:'DM Mono', style:'Medium'}` the readback returned **`Inter/Medium`**,
   while the rendered screenshot showed mono letterforms. One of the two is lying and I did not determine
   which, because the label was being reverted anyway. Recorded so the next session to attempt a
   connector label knows not to trust that property — it is the same class of defect as
   `shape.text.height`: a read that looks like a check and is not.
3. **A zero-opacity screenshot probe renders blank.** First attempt returned an empty PNG; the probe has
   to be opaque, canvas-coloured and at page index 0 for `contentsOnly: false` to composite the real
   content over it. Costless once known, and it is the only way to screenshot a region of a FigJam board
   that has no node spanning it.
4. **My own expected-count expression was wrong and the raw numbers caught it.** The verification script
   computed `expectedCount = 866 + 22 - 12 = 876` against an actual `888`. The arithmetic was the bug,
   not the board: 866 baseline + 22 created = 888, which is what the canvas returned. Recorded because a
   readback that compares against a miscomputed expectation is a false *failure* — the mirror image of
   §7.1's false pass, and it would have been read as a missing-node defect if the parts had not been
   returned separately. **Return the inputs to a comparison, not only its verdict.**
5. **`packages/api/src/core/config/` was checked and deliberately cited nowhere.** It is a Zod schema
   over environment variables — a deployment setting, not a row a client can change. Every
   `PER-CLIENT CONFIG` line traces to a `TenantScopedEntity` confirmed `organizationId`-scoped in its own
   entity file.
6. **Role permissions are seeded, not editable — so the permission `CANNOT`s are true today by absence
   of a mutation, not by a guard.** `SYSTEM_ROLES` seeds `Role.permissions` through `ensureSystemRole`,
   and `roles.save` has **exactly one call site**, which only creates. There is no role-editing mutation
   anywhere in `packages/api/src`, so `clientAdmin` cannot today acquire `leave:approve`, `employee:write`
   or `payroll:finalize`. But `system-roles.ts` says in a comment that an administrator *can later adapt a
   role without shipping code* — so the day that mutation lands, four note-block lines become false. They
   are worded as *"seeded to Tethr roles only"* rather than *"a client admin can never"* for exactly that
   reason. **Flagged for Talha:** this is the one place in the pass where a drawn claim has a known
   expiry condition.
7. **`clientAdmin` holds `attendance:approve` but not `leave:approve`.** That asymmetry is why C7 carries
   no permission line and C6 does; it is also worth Talha's eye, because nothing in the code explains why
   a client may approve a timesheet but not a day off.

---

# B4b happy-path primacy (attempted) & D9's duration in the note block · 2026-09-22

Authorised as the first pass in this series permitted to **move** existing nodes, and only inside B4b
(`02 · PEOPLE · 2 OF 3`, REPORTING LINE & ASSIGNMENT) and its plain-language mirror.

## Job 1 — B4b · not built. The three requirements are mutually unsatisfiable on this geometry.

**Nothing on the canvas was moved.** The spine fix is trivial; it is requirement 3 (re-fit the wash,
branch-centric per §2.5) together with requirement 4 (do not disturb the failure exit) that closes the
door. Recorded here in full because the next session will otherwise re-derive it.

### Measured before-state (readback, technical set)

| Node | Name | Returned x, y | w × h |
|---|---|---|---|
| `53:340` | Find current assignment / currentPrimary | `160, 4368` | 280 × 96 |
| `53:344` | Correct in place (same-day change) | `472, 4368` | 280 × 96 |
| `53:348` | End current (at effective date) | `784, 4368` | 280 × 96 |
| `53:352` | Create new assignment | `1096, 4368` | 280 × 96 |
| `53:364` | failure exit · no position | `160, 4528` | 280 × **128** |
| `53:368` | `assignment.updated` | `472, 4528` | 280 × 60 |
| `53:372` | `assignment.ended` | `784, 4528` | 280 × 60 |
| `53:376` | `assignment.created` | `1096, 4528` | 280 × 60 |
| `128:1803` | alternate wash | `440, 4336` | 968 × 160 |
| `55:336` | B5's eyebrow — first node of the next diagram | `-1088, 4816` | — |

Connector topology returned: `53:400` `53:340 → 53:344` (RIGHT→LEFT), `53:404` `53:340 → 53:348`
(**TOP→TOP**, an arc over `53:344`), `53:408` `53:348 → 53:352`, dashed `[6,4]` royal
`53:412/416/420` from each arm box down to its pill, red `53:432` `53:340 → 53:364`.
So the fork *is* wired as a fork and drawn as a sequence — which is exactly §14.3's stated defect.

### Mirror, re-measured rather than assumed

It **is** the technical set translated by exactly `(-9168, +710)`, and the offset was verified node by
node rather than inferred: branch point `105:1282` `(-9008, 5078)`, dropped arm `105:1285` `(-8696, 5078)`,
spine `105:1288` `(-8384, 5078)` → `105:1291` `(-8072, 5078)`, failure exit `105:1300` `(-9008, 5238)`
280 × **128**, pills `105:1303/1306/1309` at `(-8696 / -8384 / -8072, 5238)`, wash `128:1807`
`(-8728, 5046)` 968 × 160, next diagram's eyebrow `105:1312` at `y 5526`. Every gap below is identical,
so the impossibility is identical and is not an artefact of one set's spacing.

### The contradiction, with the arithmetic

Let `D` be the dropped arm box (`53:344`, 280 × 96).

1. **Req 1 pins the spine.** `53:340` cannot move — its red exit `53:364` hangs directly beneath it at
   `x 160` and req 4 forbids disturbing that. Pitch 312 ⇒ `53:348 → x 472`, `53:352 → x 784`, and
   req 1's "each pill stays under its source" ⇒ `53:372 → x 472`, `53:376 → x 784`, both on band 3.
2. **Req 3 pins the wash's left edge.** The wash encloses the branch point with 32 clear ⇒
   `wash.left = 160 − 32 = 128`.
3. **Req 4 caps the wash's bottom.** `53:364` occupies `x ∈ [160, 440] · y ∈ [4528, 4656]`, and the wash
   spans that x-range for its whole height. No collision ⇒ `wash.bottom ≤ 4528`.
4. **⇒ the lowest arm may not fall past `4496`** (`4528 − 32` clearance).
5. **Req 2 needs the opposite.** "Below band 2" means `D.top ≥ 4464` (band 2's boxes are `4368–4464`),
   so `D.bottom ≥ 4560`. **`4560 > 4496` — contradiction, by 64px.** Solving for a height that would fit
   gives `D.h ≤ 32` at *zero* clearance below band 2, which is neither legible for the two-line label
   nor readable as a drop.

**Every escape leaves B4b or leaves the grammar:**

- **Below band 3.** B4b's bottom edge is `4656` (the tall failure exit) and B5's first node is at `4816`
  — the §4 diagram→diagram gap of **exactly 160**. `D` alone wants `96 + 32 = 128`; `D` plus its pill
  wants `96 + 32 + 60 = 188`. Either eats the gap, and restoring it means moving B5 and everything
  beneath it. Same numbers in the mirror: bottom `5366`, next diagram `5526`, gap **exactly 160**.
- **The one free column, `x 1096`** (vacated when `Create new` moves to 784). Then `wash.right ≥ 1408`
  and `wash.bottom ≥ 4656`, so the wash swallows the failure exit *and* both spine pills — §2.5's mark
  would then be asserting that a red exit is one of the branch's arms. The arm's own connector would
  also run ~650px horizontally beneath the full width of the spine, which is precisely §1.1's
  "parallel row running alongside the spine" and the negation of "visibly short".
- **Shrinking `D`, lifting the pills off band 3, or hanging a pill sideways.** All of these restyle the
  language to make a layout fit. §14.3 is explicit that Ruling 1 "is a layout rule, not a new mark.
  Nothing is added; things move."

**Escalated, not fudged** — the same disposition as Ruling 2's connector label in the previous pass, and
for a structurally identical reason: a rule imported from `06`'s looser geometry meeting a grid that has
no slack left. What would unlock it is a ruling, not a nudge: (a) 160px more vertical room for B4b, which
means moving B5 and the mirror's B5 down; or (b) a §2.5 amendment letting the wash stop above band 3 with
the dropped arm hanging below its edge; or (c) permission to re-hang failure exit `53:364`.

## Job 2 — D9's duration, carried by the note block

`04 · MONEY · 2 OF 2`, INVOICE → ISSUE → PAID. Note body `139:1814`, second bullet.

**Source verified before writing, both halves:**
`packages/api/src/core/database/migrations/1789390244861-InitialSchema.ts:201` —
`"paymentTermsNetDays" integer NOT NULL DEFAULT '7'`; and
`packages/api/src/modules/finance/billing/invoice.service.ts:1297` —
`invoice.dueDate = addIsoDays(issueDate, config?.paymentTermsNetDays ?? 7)`. The column default and the
code fallback agree on `7`, so `net 7 by default` is true from either direction.
`invoice-pdf.service.ts:162` prints `Net ${paymentTermsNetDays}`, which is where the `net` wording comes
from rather than being invented for the diagram.

Qualifier set in **parentheses** per §2.0's first fix ("a qualifier goes in parentheses"), not a middle dot.

| Node | Property | Expected | Returned |
|---|---|---|---|
| `139:1814` | line 2 before | `Payment terms in days, and the sender and bank details printed on the invoice.` | same |
| `139:1814` | line 2 after | `Payment terms in days (net 7 by default), and the sender and bank details printed on the invoice.` | same |
| `139:1814` | x, y | `-4032, 7740` | `-4032, 7740` |
| `139:1814` | width | `700` | `700` |
| `139:1814` | height | `36` (still 2 lines × 18) | `36` |
| `139:1814` | line count | `2` | `2` |
| `139:1814` | clearance to `58:612` | `24` | `24` |
| `139:1814` | fontName | `Manrope / Medium (wght 500)` | `Manrope / Medium (wght 500)` |
| `139:1814` | fontSize / lineHeight / letterSpacing | `12` / `18px` / `0%` | `12` / `18px` / `0%` |
| `139:1814` | fill | `#001131` | `{0, 0.0667, 0.1922}` = `#001131` |
| `139:1814` | curly quotes present | `false` | `false` |

**Ink measured before writing, not after.** A throwaway `WIDTH_AND_HEIGHT` text node in the node's own
font rendered the candidates at: current line 1 **463px**, current line 2 **438px**, the chosen string
**537px**, an em-dash variant 547px, a comma variant 530px — all inside the 700px column, so the
two-line height and the 24px clearance below the block were never at risk. Probe removed and confirmed
gone in the same call. No connector label was added anywhere.

## Sink check (§2.4) — board-wide, after the pass

338 `SHAPE_WITH_TEXT`, 349 connectors, **113 sinks**: 29 end-of-path circles, 30 event pills, 36 red
failure exits, 2 washes, and 16 furniture / flow-10 / imported-`06` shapes (the key's samples, E10's
module boxes and their mirrors, `06`'s deferred-review box, the journeys' four-mark key). **No new path
end appeared and no circle was orphaned** — the single circle with no incoming connector is `120:1679`,
the legend's own `key · end of path` sample at `(1919, 62)`, which is board furniture and was already in
that state. B4b being untouched, its sink profile is unchanged.

**Anomalies:**

1. **`node.text` throws on a `SECTION`.** A region scan that read `n.text` without narrowing by type died
   on `58:648` (`D9 tenant boundary`) with *"no such property 'text' on SECTION node"*. Narrow by
   `n.type` before touching `text`, exactly as §7.1 says for `shape.text.height` — same class of defect,
   and it fails loudly here only because SECTION happens to throw rather than return `undefined`.
2. **The mirror's constant offset held, and was still worth checking.** `(-9168, +710)` reproduced every
   node position and every clearance. Recorded so the *next* pass still measures rather than trusting
   this line — the offset is a fact about today's canvas, not a guarantee.
3. **The B4b screenshot was taken with the opaque back-most probe described in the previous entry**, and
   it is what confirms the defect is real to the eye: `Correct in place` · `End current` ·
   `Create new` read as three consecutive spine steps, with the fork carried only by a pale TOP→TOP arc
   that the eye does not separate from the spine at reading zoom. The cover test could not be applied to
   an after-state, because there is no after-state.

---

## Pages — the top-level split (§15)

Split: 2026-09-25 · Board: https://www.figma.com/board/CwLecjQLRS0x9Q28UHQ1zP
Page: **all five** — this entry is the split itself.

**Re-origin vectors: none.** Every one of the 888 nodes kept its absolute `x`/`y`. No page was
translated, so every coordinate in every entry above this one still reads true; only the page column was
missing, and the table under "Entry format" now supplies it.

### Phase 1 — classification, asserted before the first move

888 top-level children on `Page 1`. Every one assigned to exactly one of five pages. All assertions below
ran **before** anything was reparented.

| Assertion | Expected | Returned |
|---|---|---|
| `childCount` is a finite number | true | true (`888`) |
| `childCount === 888` | true | true |
| every child has an `absoluteBoundingBox` | 0 missing | 0 missing |
| all 13 known anchors found | true | true |
| all 13 anchors at their expected coordinates | true | true |
| connector count | 349 | 349 |
| assignment map non-empty | > 0 | 888 |
| **every child assigned exactly once** | `total === childCount`, 0 unassigned | `888 === 888`, 0 unassigned |
| no duplicate ids among children | 888 unique | 888 unique |
| **no connector spans two pages** | 0 | **0** |
| no unresolved endpoint reference | 0 | 0 |

Endpoint resolution: **602** endpoints resolved to a top-level node, **18** resolved to a node nested
inside a boundary `SECTION` (mapped up to its top-level ancestor), **78** floating (the 39 diagram rules,
which are position-endpoint connectors per §5). 602 + 18 + 78 = 698 = 349 × 2. ✓

| Page | Nodes | `SHAPE_WITH_TEXT` | `TEXT` | `CONNECTOR` | `SECTION` | Extents (x0, y0, x1, y1) |
|---|---|---|---|---|---|---|
| 1 · Start here | 145 | 47 | 61 | 37 | 0 | −4032, −907, 2486, 2576 |
| 2 · In plain language | 329 | 133 | 50 | 143 | 3 | −13200, 3010, −4848, 8870 |
| 3 · Technical | 349 | 133 | 71 | 142 | 3 | −4032, 3056, 4320, 8160 |
| 4 · Employee performance | 63 | 25 | 11 | 27 | 0 | 720, 6468, 3527, 7588 |
| 5 · Development process | 2 | 0 | 2 | 0 | 0 | −7872, −907, −6412, −471 |
| **Total** | **888** | 338 | 195 | 349 | 6 | — |

**The `06` trap, handled by two independent rules that were made to agree.** §15's warning is that `06`
sits inside the technical set's bounding box (technical spans x −4032…4320 · y 3056…8160; `06` sits at
x 720…3527 · y 6468…7588), so any purely geometric rule mis-sorts it. `06` was therefore classified by
**explicit node membership** (id prefix `91:` / `92:`) *and* by an explicit region box, and the two were
compared node by node. They agree on all 63 — no node carries the `91`/`92` prefix outside the box, and
no node without it falls inside. See Anomaly 1 for the one 2px discrepancy that surfaced and what it was.

### Phase 2 — the moves

Each page was created, populated and read back in **one** call, so the readback is contemporaneous with
the write (§7).

| Page | Before | Moved | Count matched | Positions preserved | Endpoints on-page | Floating | Off-page |
|---|---|---|---|---|---|---|---|
| 1 · Start here | 145 | 145 | ✅ | ✅ 0 drift | 66 | 8 | **0** |
| 2 · In plain language | 329 | 329 | ✅ | ✅ 0 drift | 252 | 34 | **0** |
| 3 · Technical | 349 | 349 | ✅ | ✅ 0 drift | 252 | 32 | **0** |
| 4 · Employee performance | 63 | 63 | ✅ | ✅ 0 drift | 50 | 4 | **0** |
| 5 · Development process | 2 | **0** | ✅ | ✅ (nothing moved) | 0 | 0 | **0** |

**Pages 4 and 5 moved as units, and this was proved rather than asserted.** Every node in each region was
snapshotted before and after the move across id, type, absolute x/y/w/h, name, shape type, text
characters, font family/style/size, letter spacing, line height, auto-resize mode, fill, stroke, stroke
weight, connector line type, dash pattern and both endpoint ids — then diffed field by field:

- `06 EMPLOYEE PERFORMANCE`: **747 properties compared across 63 nodes, 0 diffs.**
- `Development Process — Tethr`: **28 properties compared across 2 nodes, 0 diffs** — and trivially so,
  because zero nodes moved (see Anomaly 3).

Nothing inside either region had to change for the move to work, so §15.5's stop condition was not hit.

**Cross-page reparenting was probed on throwaway nodes before any real content was touched.** Three
synthetic shape/connector trios were moved to a scratch page in three orders — connector first, endpoints
first, and a deliberate *partial* move leaving the connector behind — and `endpointNodeId` survived all
three, as did `x`/`y`. The probe nodes and the scratch page were removed in the same call. This is what
licensed moving 888 nodes without fearing a detach mid-operation.

### Phase 3 — what the split breaks (§15.5)

**1 · Cross-page references — found by text search, not from memory.** A board-wide scan for `→` and for
act names found **14** journey eyebrows on page 1 pointing into acts that now live on page 3. All 14
rewritten; ink measured in the node's own font **before** writing, per the §7.1 discipline:

| Old text | New text | Ink before | Ink after | Column | Fits |
|---|---|---|---|---|---|
| `→ 01 ACCESS & IDENTITY` | `→ Technical · 01 ACCESS & IDENTITY` | 146px | **225px** | 280px | ✅ |
| `→ 02 PEOPLE` | `→ Technical · 02 PEOPLE` | 73px | **152px** | 280px | ✅ |
| `→ 03 TIME` | `→ Technical · 03 TIME` | 60px | **139px** | 280px | ✅ |
| `→ 04 MONEY` | `→ Technical · 04 MONEY` | 66px | **146px** | 280px | ✅ |

Nodes: `102:884` `102:889` `102:894` `102:899` `102:908` `102:913` `102:918` `103:928` `103:937`
`103:942` `103:947` `103:952` `103:1012` `103:1025`. All 14 returned `height 14` after the edit — one
line each, **none wrapped**. Type unchanged throughout: `DM Mono / Medium`, `fontSize 11`,
`letterSpacing 0%`, fill `#667899` → `{102,120,153}`, `textAutoResize HEIGHT`, width 280.

**2 · One key, on page 1, no copies.** No key was duplicated. Pages 2–5 each carry a single DM Mono
pointer line reading `KEY ON PAGE 1 · START HERE`; page 1's reads
`KEY ON THIS PAGE · TO THE RIGHT, UNDER ITS OWN KEY LABEL`. The journeys' `MARKS` key
(`102:859`–`102:876`) stayed with the journeys on page 1, per §15.2.

**3 · Every page opens with a title block.** Built from the existing ramp only — no new type level was
invented. The 72px page title is the level already on the board (`106:1683` `IN PLAIN LANGUAGE`, read back
as `Manrope / ExtraBold` 72, height 98), one step above the 56px act header (`68:727`) and two above the
34px flow title.

| Element | Spec, read back from the built nodes |
|---|---|
| Eyebrow | `DM Mono / Medium` 12px · `letterSpacing PERCENT 12` · `#667899` → `{102,120,153}` |
| Rule | `CONNECTOR` · `STRAIGHT` · `strokeWeight 3` · `#0755e9` → `{7,85,233}` · caps `NONE`/`NONE` |
| Page title | `Manrope / ExtraBold` 72px · `letterSpacing PIXELS 0.5` · `#001131` → `{0,17,49}` · height 98 |
| Description | `Manrope / Medium` 18px (16 on page 1) · `letterSpacing PERCENT 0` · `#667899` · `textAutoResize HEIGHT` |
| Key pointer | same as eyebrow |

| Page | Block origin | Block bottom | First content | Clearance | Description lines |
|---|---|---|---|---|---|
| 1 · Start here | `(-4032, -520)` | −351 | masthead bottom −643 | 91 below the masthead | 1 |
| 2 · In plain language | `(-13200, 3010)` (existing header extended) | 3179 | 3766 | 587 | 1 |
| 3 · Technical | `(-4032, 2700)` | 2869 | 3056 | **187** | 1 |
| 4 · Employee performance | `(720, 6100)` | 6269 | 6468 | **199** | 1 |
| 5 · Development process | `(-7872, -1300)` | −1131 | −907 | **224** | 1 |

For pages 4 and 5 the block sits **entirely outside** the owner's region — asserted, not eyeballed: every
block node's bottom edge was compared against the region's top edge (0 overlaps), and the region's own
extents were recomputed after the write and found identical (`[720, 6468, 3527, 7588]` and
`[-7872, -907, -6412, -471]`).

Exact wording, as built:

- **Page 1** — `PAGE 1 OF 5` / `START HERE` / *"The board title, the contents index, the key to every
  mark, and the three human journeys — what an employee, a founder and Tethr staff each live through. For
  anyone opening the board cold."* / `KEY ON THIS PAGE · TO THE RIGHT, UNDER ITS OWN KEY LABEL`
- **Page 2** — `PAGE 2 OF 5` / `IN PLAIN LANGUAGE` / *"The same eleven flows, step for step, with the
  machinery taken out. Every box, arrow and dead end matches the technical set on page 3 — only the words
  change. For stakeholders, onboarding, and anyone outside engineering."* / `KEY ON PAGE 1 · START HERE`
- **Page 3** — `PAGE 3 OF 5` / `TECHNICAL` / *"The eleven flows and the module map, in five acts — what
  the system does, named as the code names it. For engineering."* / `KEY ON PAGE 1 · START HERE`
- **Page 4** — `PAGE 4 OF 5` / `EMPLOYEE PERFORMANCE` / *"06, drawn by hand on this board by its owner —
  the 30/90-day probation cycle as it should run. It is a specification, not a description of built code.
  For its owner."* / `KEY ON PAGE 1 · START HERE`
- **Page 5** — `PAGE 5 OF 5` / `DEVELOPMENT PROCESS` / *"Reserved space, owned by Talha. This project
  places nothing here and removes nothing from it. For its owner."* / `KEY ON PAGE 1 · START HERE`

### Final state

| # | Page | id | Children | = moved + added |
|---|---|---|---|---|
| 1 | Start here | `182:1807` | 150 | 145 + 5 |
| 2 | In plain language | `183:1614` | 331 | 329 + 2 |
| 3 | Technical | `184:929` | 354 | 349 + 5 |
| 4 | Employee performance | `186:244` | 68 | 63 + 5 |
| 5 | Development process | `0:1` | 7 | 2 + 5 |
| | **Total** | | **910** | **888 + 22** |

Page order matches §15.1 exactly. Each page's children were re-read **after** switching to it with
`setCurrentPageAsync` — the counts a script reads for a non-current page are the lazily-loaded partial set
and are not evidence (see Anomaly 5). Screenshots taken of all five.

**Anomalies:**

1. **`91:722` failed the geometric `06` test by 2px and the id-prefix test caught it.** `06`'s act rule
   sits at `(720, 6468)`, and the first region box was written with a lower bound of `y ≥ 6470` — taken
   from `06`'s act-header text at `y 6490` rather than from the rule 22px above it. The prefix rule said
   `06`, the box rule said not-`06`, the script **threw and moved nothing**, and the box was corrected to
   `y ≥ 6460` (still 1096px clear of the nearest technical node). This is the one case the whole
   two-independent-rules construction was built for, and it is worth noting that it fired on *furniture*
   rather than on a diagram box. The earlier Phase-1 agreement check had run on non-connectors only, so it
   could not have found this — **a check narrowed to the wrong population is the same defect class as
   §7.1's check that could not fail.**
2. **The 39 diagram rules are position-endpoint connectors whose `endpointNodeId` reads `0:1`.** FigJam
   reports a floating endpoint as attached to the page rather than as a `position` endpoint, and `0:1` is
   the original page — now page 5, `Development process`. So a readback on pages 1–4 reports these
   endpoints as "off page". They are not broken: all 39 render correctly in the screenshots, and the rules
   are drawn exactly as §5 prescribes. Recorded so the next session does not chase 39 phantom detached
   connectors.
3. **Page deletion was refused by the environment, and the result is better than the plan.** The original
   `Page 1` was to be emptied and removed. The removal was blocked, so it was instead **renamed in place**
   to `Development process` and reordered last — which means page 5 moved **zero nodes**, and the reserved
   region is untouched by construction rather than by verification. Its node id is `0:1`.
4. **Page 2's own description contained a spatial reference the split falsified.** `106:1684` read
   *"matches the technical set **above** it"* — true on one canvas, false on five. Changed to *"matches
   the technical set **on page 3**"*, and the node widened 2000 → 2600 so the added audience clause stays
   on one line (readback: `height 25`, one line, right edge −10600, next column at −10256). This was not
   on the §15.5 list; it is the same defect as the journey eyebrows and was found by the same text search.
5. **`page.children.length` lies for a non-current page.** Immediately after the split, one script reading
   all five pages returned `4, 17, 16, 2, 2` children. Pages load incrementally, so a page that is not
   `figma.currentPage` reports only what happens to be loaded. Every count in this entry was taken either
   in the same call that wrote the page or after an explicit `setCurrentPageAsync`. **A partial count that
   looks like a plausible number is worse than an error** — §7.1's rule arriving through a property that
   returns a wrong number instead of `undefined`.
6. **Page backgrounds were copied, and they are the FigJam default.** Each new page got `src.backgrounds`,
   which read back as `#f5f5f5` — not §16.2's warm `#f2ede3`, and not `#f1f5fd`. §16's colour-and-panels
   pass has not landed; the split preserved the status quo rather than pre-empting it. §16.3 says §16
   should have come first, and it did not.
7. **The page-1 `CONTENTS` index still lists the five acts without naming the page they live on.** It is
   the same class of unfollowable reference as the journey eyebrows, but it was left alone: turning an act
   index into a page index is a design decision for the design head, not a mechanical fix, and §15.5's
   list does not name it. Flagged rather than judged.

## Latent: 39 section rules hold a hard reference to page 5 — **RESOLVED 2026-09-25**

> **Resolution, recorded here and evidenced in full under
> [The page-5 coupling, repaired](#the-page-5-coupling-repaired--2026-09-25) below.** The coupling is gone:
> **zero endpoints on pages 1–4 reference `0:1`.** Every affected rule was **rebuilt, not re-pointed** — a
> new connector created on its own host page with identical properties and identical absolute positions,
> both endpoints positional, asserted against the original off the canvas (17 properties exactly, three
> geometries within 0.5px, all 36 matching to the digit), and only then was the old rule deleted and the
> new one `insertChild`ed at the old one's index. That answers the objection this section was written
> around: nothing was re-pointed, so nothing could snap to a magnet and move.
>
> **The count was 36, not 39, and the diagnosis below is right about everything except the number.** The
> `Start here 4` row counted page 1's four *floating connectors*, three of which are the key's own
> specimens rather than section rules, and those three had already been re-hosted by a later pass. See
> Anomaly 1 of the repair entry. Page 5's own rule `190:1829` still references `0:1` and is correct by
> definition — `0:1` is its host page.
>
> **Deleting, exporting or moving page 5 is now a local operation.** The history below is kept because the
> failure it describes — a page repurposed rather than deleted, silently becoming the anchor for 36
> decorative marks on four other pages — is the part worth not re-learning.

Verified independently after the split, 2026-09-25, on all five pages.

Every floating endpoint in the set resolves — **0 unresolved, 0 dangling**. But 78 endpoint halves (39
connectors x 2) report `endpointNodeId: "0:1"`. These are the section-label motif's 3px rules, which §5 of
[diagram-language.md](diagram-language.md) requires be drawn as *positional* floating connectors precisely
because a `ShapeWithText` cannot render thinner than ~18px. FigJam records such an endpoint against the
page node.

`0:1` was the board's only page. The split repurposed it as **page 5, "Development process"** rather than
deleting it — which was the right call for the move, and has a consequence nobody chose:

> **39 decorative rules spread across pages 1-4 now hold a hard reference to page 5.** They render
> correctly today. But page 5 is the reserved region owned by the board's owner — the page most likely to
> be deleted, exported alone, or moved out. **Deleting page 5 is therefore not a local operation**, and
> nothing on pages 1-4 would warn anyone before it happened.

| Page | Rules referencing `0:1` |
|---|---|
| Start here | 4 |
| In plain language | 17 |
| Technical | 16 |
| Employee performance | 2 |

Connectors created *after* the split attach to their own host page (8 endpoint halves), so this affects
only rules that predate it. ~~**Not repaired.** Re-pointing a positional endpoint risks snapping a rule to
a magnet and moving it, and the rendering is correct — so the fragility is recorded rather than traded for
a visible defect. If page 5 is ever removed, re-check every eyebrow rule on the remaining pages first.~~

**Superseded the same day.** The ruling was sound on its own terms and its premise was too narrow: it
weighed *re-point* against *leave alone* and found no acceptable move, having never considered *rebuild*.
A new connector on the correct page, asserted against the original before the original is deleted, gets
the correctness without ever touching a live endpoint — and a rebuild that fails its assertion leaves both
objects standing, so the downside case is a duplicate rule and a report rather than a moved one. **When
both options in a two-option decision are bad, the useful question is which option was never listed.**

Recorded because the original note framed this as a readback artefact to ignore ("nobody chases 39
phantoms"). The artefact is real, and so is the coupling underneath it; only the first half is harmless.

---

# §16 — the warm ground, act panels and the header zone · 2026-09-25

Applied `process-flow-content.md` §16 (ground, panels, the reversed container ban and its limit) and §16.5
(the header zone) across all five pages. Board: https://www.figma.com/board/CwLecjQLRS0x9Q28UHQ1zP

**Pages are recorded per entry, per §15.5.** Every coordinate below is absolute and page-scoped.

## Page backgrounds — before and after

All five read back `#f5f5f5` before (FigJam's default, carried over by the split — Anomaly 6 of the
previous entry) and `#f2ede3` after. Each was read back **in the same call that wrote it**.

| Page | id | Before | After | Returned after |
|---|---|---|---|---|
| 1 · Start here | `182:1807` | `#f5f5f5` | `#f2ede3` | `{0.9490196, 0.9294118, 0.8901961}` |
| 2 · In plain language | `183:1614` | `#f5f5f5` | `#f2ede3` | `{0.9490196, 0.9294118, 0.8901961}` |
| 3 · Technical | `184:929` | `#f5f5f5` | `#f2ede3` | `{0.9490196, 0.9294118, 0.8901961}` |
| 4 · Employee performance | `186:244` | `#f5f5f5` | `#f2ede3` | `{0.9490196, 0.9294118, 0.8901961}` |
| 5 · Development process | `0:1` | `#f5f5f5` | `#f2ede3` | `{0.9490196, 0.9294118, 0.8901961}` |

Final board-wide sweep, each page **explicitly `loadAsync()`d first** (§15's `children.length` trap):
`allWarm: true`, `allPanelCountsOk: true`, 11 panels, 922 top-level nodes (910 + 11 panels + 1 index note).
`suspects: []` on every page — no screenshot probe survived any call.

## The palette check, run before the ground was committed board-wide

**Page 3 alone got the ground first**, and both risks were judged on real content at both zooms before the
other four pages were touched. The check could have failed: if `#fdecec` had gone soft the ground was to
move, not the red.

| Assertion | Expected | Returned |
|---|---|---|
| `#fdecec` failure exits found on page 3 | > 0 | **12** (`51:206` `52:276` `52:280` `52:284` `53:356` `53:360` …) |
| `#dce3ee` hairline boxes found on page 3 | > 0 | **99** |
| background after write is `#f2ede3` | true | true |

**Verdict: the ground does not damage the red, at either zoom, and no ground change is needed.** At
reading zoom (scale 2, `51:206` and its neighbours, sitting on the `#faf7f1` panel) the failure exit reads
as an unmistakably pink card with a salmon `#f1b4b4` edge and `#e03131` text; the warm ground is duller
and greener than the fill, so the pink separates by saturation as well as by value. At full-board zoom the
twelve exits are still the only pink marks on the page and still read as red specks. `#dce3ee` reads as a
border, not a cast: at scale 2 every white box is defined by a visible cool hairline against the near-white
panel, and the pale-blue boundary frames and royal strokes are unaffected.

## Act panels — one per act, `#faf7f1`, radius 6, no stroke, index 0

Bounds were **re-derived from each act's contents**, not taken from any recorded origin: every top-level
child was read for `absoluteBoundingBox`, page-header nodes split off by y, and the remainder clustered by
union-find with a 150px pad per side (so a 160 within-act gap merges and a 480 act break does not). The
script **threw rather than drew** unless it got exactly 5 clusters, the cluster members summed to the
content count, and every cluster contained a 56px act header.

| Page | Cluster assertion | Returned |
|---|---|---|
| 3 · Technical | 5 clusters · members sum to 349 · every cluster has a 56px header | `5` · `349 === 349` · true |
| 2 · In plain language | 5 clusters · members sum to 326 · every cluster has a 56px header | `5` · `326 === 326` · true |

### Page 3 · Technical

| Panel | Wraps | x, y | w × h | x1, y1 | Act contents |
|---|---|---|---|---|---|
| `195:1146` | `01  ACCESS & IDENTITY` | −4192, 2896 | 2908 × 2676 | −1284, 5572 | −4032, 3056 → −1444, 5412 (82 nodes) |
| `195:1150` | `02  PEOPLE` | −1248, 2896 | 2816 × 3252 | 1568, 6148 | −1088, 3056 → 1408, 5988 (96) |
| `195:1154` | `03  TIME` | 1696, 2896 | 2784 × 1936 | 4480, 4832 | 1856, 3056 → 4320, 4672 (64) |
| `195:1158` | `04  MONEY` | −4192, 6308 | 2908 × 2012 | −1284, 8320 | −4032, 6468 → −1444, 8160 (75) |
| `195:1162` | `05  SYSTEM` | −1248, 6308 | 1520 × 1436 | 272, 7744 | −1088, 6468 → 112, 7584 (32) |

### Page 2 · In plain language

| Panel | Wraps | x, y | w × h | x1, y1 | Act contents |
|---|---|---|---|---|---|
| `195:1851` | `01  ACCESS & IDENTITY` | −13360, 3606 | 2840 × 2676 | −10520, 6282 | −13200, 3766 → −10680, 6122 (79 nodes) |
| `195:1855` | `02  PEOPLE` | −10416, 3606 | 2816 × 3252 | −7600, 6858 | −10256, 3766 → −7760, 6698 (92) |
| `195:1859` | `03  TIME` | −7472, 3606 | 2784 × 1936 | −4688, 5542 | −7312, 3766 → −4848, 5382 (58) |
| `195:1863` | `04  MONEY` | −13360, 7018 | 2908 × 2012 | −10452, 9030 | −13200, 7178 → −10612, 8870 (65) |
| `195:1867` | `05  SYSTEM` | −10416, 7018 | 1520 × 1418 | −8896, 8436 | −10256, 7178 → −9056, 8276 (32) |

### Page 1 · Start here — one panel, and why

| Panel | Wraps | x, y | w × h | x1, y1 | Contents |
|---|---|---|---|---|---|
| `196:1144` | `HOW PEOPLE EXPERIENCE IT` | −4192, 540 | 4024 × 2196 | −168, 2736 | −4032, 700 → −328, 2576 (91 nodes) |

**The three journeys got one panel between them, not three, and the board's own geometry decided it.**
Journey 1 ends at y 1392 and journey 2 begins at 1552 — a **160** gap, which is §4's *diagram-to-diagram*
gap, the rhythm used **inside** an act on pages 2 and 3, not the 480 used between acts. Three panels each
padded by the required 160 would have overlapped each other by exactly 160px, so the stated clearance and
three panels are not simultaneously satisfiable without moving diagrams — which this pass was not asked to
do. The region also carries a 56px `HOW PEOPLE EXPERIENCE IT` header over a full-width 3px rule, which is
the identical construction to `01  ACCESS & IDENTITY`. So the journeys region **is one act** by the
board's own grammar, and the panel wraps it entire, including its `MARKS` key (`102:859`–`102:876`), which
§15.2 keeps with the journeys.

| Property | Expected | Returned (all 11 panels) |
|---|---|---|
| fill | `#faf7f1` | `{0.98039216, 0.96862745, 0.94509804}`, opacity 1 |
| stroke | none | `strokes.length === 0` |
| corner radius | 6 | 6 |
| z-order | behind everything | `index 0` at insert; final indices 0–4 (back-most block) |
| encloses its act ±160 | true | `allEnclose: true` on both multi-act pages |
| panel-to-panel overlap | none | `panelOverlaps: []` on both pages |

Tightest clearances measured: **36px** between panels 01 and 02 on page 3, **104px** between 01 and 02 on
page 2, **128px** between 02 and 03 on both. Panel top to page title block: **27px** on page 3, **427px**
on page 2 (Anomaly 1).

Pages 4 and 5 got the ground and **no panel** — both are their owner's reserved regions. Page 5's seven
nodes were snapshotted before and after: `nodesUnmoved: true`.

## Page 4 · the `06` alternate-flow wash, before and after the ground change

**Nothing inside `06` was edited.** The wash `91:1472` was read back after the ground change and is
identical to before:

| Node | Property | Before | After |
|---|---|---|---|
| `91:1472` | fill | `#3dadff` `{0.23921569, 0.6784314, 1}` @ opacity `0.05` | identical |
| `91:1472` | node opacity | 1 | 1 |
| `91:1472` | bounds | 1152, 7122, 1144 × 466 | identical |
| page `186:244` | child count | 68 | 68 |

**What changed is how it renders, and it is a real change.** Screenshots taken at full-board zoom and at
wash close-up, before and after, each composited over an opaque ground-coloured probe at index 0.

- **Before**, over `#f5f5f5`: the wash read as a pale **cool blue** field — unmistakably blue, low
  contrast against the near-white ground, its edge found mainly by hue rather than by value.
- **After**, over `#f2ede3`: 5% blue over cream neutralises. The region now reads as a **desaturated
  grey-green** patch. Its *edge is more visible than before* — the value difference against warm cream is
  larger than it was against `#f5f5f5`, so the region is if anything easier to find — but it has **lost
  its blue identity**. It no longer says "blue" at a glance.

**Reported, not fixed.** The wash is still legible as a region, so this is not a defect requiring a
compensating edit, and §16's rule that nothing inside `06` may be adjusted stands. But `06` is the one
place on the board where a 5% tint is being asked to carry meaning over a warm ground, and the hue it
carried is gone. If its owner wants blue back, the fix is a stronger tint inside `06`, which is his call.

## The header zone (§16.5) — title, index and key as one band

The existing page-1 title block was **incorporated, not duplicated**: `189:312` `PAGE 1 OF 5`, `189:317`
`START HERE`, `189:318` the description and `189:319` the key pointer all kept their type and their
`x −4032`, and became column 1 of the band.

| Element | Node | Before | After |
|---|---|---|---|
| Masthead | `2:237` | −4032, −907 · 1458 × 264 · Inter/Bold 176 | unchanged |
| Eyebrow, col 1 | `189:312` | −4032, −552 | unchanged |
| Eyebrow, col 2 | `68:707` `CONTENTS` | −1088, **−400** | −1088, **−552** |
| Eyebrow, col 3 | `46:138` `KEY` | 1856, **−400** | 1856, **−552** |
| Rule | `189:313` | −4032 → **−1568**, y −520, w **2464** | −4032 → **2486**, y −520, w **6518** |
| Col 1 body | `189:317` / `189:318` / `189:319` | −4032, −498 / −400 / −367 | unchanged positions |
| Col 2 body | `68:708`–`68:722` | rows at −366 … −230 | rows at **−494, −460, −426, −392, −358** |
| Col 2 note | `197:1146` (new) | — | −1088, **−316** |
| Col 3 body | 37 key nodes | y −400 … 568 | y **−552 … 416** (Δy −152) |

Rule readback: `CONNECTOR` · `STRAIGHT` · `strokeWeight 3` · `#0755e9` → `{0.02745098, 0.33333334, 0.91372550}` · x −4032, w 6518. `ruleSpansAllThree: true`.

The key block moved as 37 nodes: **29 moved by `y`**, and **6 connector endpoints** repositioned through
`connectorStart`/`connectorEnd` (the two edge samples and the 64px flow rule are positional; the five
mini-diagram connectors are node-attached at both ends and re-routed themselves). The count was asserted
before the move — the script threw unless it found exactly 37. The key block clears the journeys panel:
`keyVsPanelClear: true` (key bottom 416, panel top 540; no x overlap either).

### `CONTENTS` rebuilt as a page index, not an act index

The fifteen existing row nodes were **re-used**, so no type level was invented — the readback confirms
`DM Mono/Medium 14` royal for the number, `Manrope/ExtraBold 14` ink-navy for the name,
`Manrope/Medium 14` `#667899` for the line. The mirror note is a clone of `68:710`, same style.

| # | Name (ink) | Line | Line ink |
|---|---|---|---|
| 1 | `START HERE` (89) | `Where you are now — orientation for the whole board. For anyone opening it cold.` | 526 |
| 2 | `IN PLAIN LANGUAGE` (144) | `The eleven flows with the machinery taken out. For stakeholders, onboarding, anyone outside engineering.` | 695 |
| 3 | `TECHNICAL` (83) | `The same eleven flows and the module map, named as the code names them. For engineering.` | 611 |
| 4 | `EMPLOYEE PERFORMANCE` (190) | `06, the 30/90-day probation cycle as it should run — a specification, not built code. For its owner.` | 628 |
| 5 | `DEVELOPMENT PROCESS` (180) | `Reserved space. This project places nothing here and removes nothing from it. For its owner.` | 601 |

Mirror note, `197:1146`, x −1088, y −316, ink **619**, height 19:
`Pages 2 and 3 carry the same five acts in the same order — one in plain language, one technical.`

Key pointer `189:319`: `KEY ON THIS PAGE · TO THE RIGHT, UNDER ITS OWN KEY LABEL` →
`KEY · RIGHT OF THIS HEADER` (224px, one line) — the old wording was wayfinding for a key that is no
longer scattered.

Every node was set `textAutoResize WIDTH_AND_HEIGHT` **before** its characters, so no row can wrap, and
the ink was then measured rather than estimated:

| Assertion | Expected | Returned |
|---|---|---|
| number/name/line share a y on every row | true | `allRowsAligned: true` |
| name ink clears the line column (x + w < −796) | true | `allNamesFit: true` (widest 190) |
| line ink clears the key column (x + w < 1792) | true | `allDescsClearKey: true` (widest right edge 907) |
| every cell one line (h ≤ 24) | true | `allOneLine: true` (18 / 19 / 19) |
| mirror note one line | true | `noteOneLine: true`, h 19 |

**Acts are numbered `01`–`05`, pages `1`–`5`.** The single digit is load-bearing: the old index listed
acts with the same names that now appear on two pages, which is the unfollowable-reference defect already
fixed on the journey eyebrows. A one-digit page number cannot be mistaken for a two-digit act number, and
the mirror note names the relationship outright.

## Screenshots spent

Page 4 full board and wash close-up **before** the ground change · the same two **after** · page 3 at
reading zoom (scale 2, a failure exit on its panel) and full board · page 2 full board · page 1 full
board, header band, and the index at scale 1 · page 5 full board. Ten, each via an opaque ground-coloured
`ShapeWithText` probe at index 0 removed in the same call; every page returned `probesRemoved: true` and
the final sweep returned `suspects: []`.

**Anomalies:**

1. **Page 3's act panels clear the page title block by 27px, which is correct by the rule and tight by
   eye.** The `TECHNICAL` block's key pointer bottoms out at y 2869 and acts 01/02/03's panels start at
   2896. The 160 clearance is measured from the act's *contents* (y 3056), as §16 specifies, and the page
   header is not act content — so the rule is satisfied and the number is a consequence of the split
   having placed page 3's header only 187px above its first act. Page 2, whose header sits 587px clear,
   returns 427. **Not adjusted**: moving the panel would break the stated clearance, and moving the header
   is a §15 decision. Flagged for the design head, since it is the one place a panel nearly touches
   something it does not hold.
2. **`128:1803` matched a "leftover probe" filter and is not a probe.** The first page-3 call's leftover
   check looked for a stroke-less `SHAPE_WITH_TEXT` wider than 900px and returned `128:1803` — which is
   the §2.5 alternate wash built on 2026-09-22, a stroke-less wide shape by construction. The check was
   too loose in the direction that produces a **false alarm**, not a false pass, so nothing was missed;
   the final sweep narrowed it by excluding named panels and returned `[]` on all five pages. Recorded
   because §7.1 cuts both ways: a check that cannot fail is worse, but a check that fires on the wrong
   population still has to be read before it is believed.
3. **The page-1 journeys panel has a wide empty right half, and it is honest rather than a defect.** The
   panel runs to x −328 because the `MARKS` key sits there, while the journey strips end at −1512. Same
   reasoning as the ragged act columns: nothing was padded, widened or moved to tidy the shape.
4. **The masthead is still Inter/Bold 176 sentence-case, alone on a board of Manrope.** `2:237`
   `HRMS User Flows` predates the type ramp and now sits directly above `START HERE` in Manrope/ExtraBold
   72 uppercase, inside one header band, where the mismatch is newly conspicuous. **Not changed** — the
   board title's typeface is not a §16 question and re-basing it is a call for the design head. §4 says
   the ramp is Manrope; on the strength of that this should probably be Manrope/ExtraBold, but the rule
   leads the canvas only when someone rules it.
5. **`189:318`, page 1's description, partly restates index row 1.** It reads *"The board title, the
   contents index, the key to every mark, and the three human journeys — for anyone opening the board
   cold."* Row 1 was therefore written as `Where you are now — orientation for the whole board` rather
   than repeating the inventory a second time 2000px to its right. The description itself was left alone:
   the brief was to incorporate the existing title block, not to rewrite it.
6. **The 39 floating section rules that reference `0:1` were not touched**, per the standing ruling. Note
   that `189:313`, page 1's header rule, *was* re-pointed in this pass — it is not one of the 39: it was
   created after the split, and its readback shows both endpoints carrying `endpointNodeId 182:1807`,
   page 1's own id, before and after.

---

# The page-5 coupling, repaired · 2026-09-25

Resolves the **"Latent: 39 section rules hold a hard reference to page 5"** entry above. Board:
https://www.figma.com/board/CwLecjQLRS0x9Q28UHQ1zP · **Pages are recorded per entry, per §15.5**; every
coordinate below is absolute and page-scoped.

**Method: rebuild, never re-point.** The standing ruling refused to repair this because re-pointing a
positional endpoint can snap the rule to a nearby magnet and visibly move it — trading a hidden fragility
for a visible defect. That objection is answered by not re-pointing anything. For each rule: read its full
property set, **create a new connector on the correct page** with identical properties and identical
absolute positions and both endpoints positional, **read the new rule back off the canvas and assert**,
and only then delete the old one and `insertChild` the new one at the old one's index. `connectorStart` /
`connectorEnd` were never reassigned on an existing node.

## Re-derived scope — 36, not 39

The count was re-derived rather than taken from the note above, and it disagrees. Every connector on every
page was walked (`findAllWithCriteria`, whole tree — not `page.children`, which misses the connectors
FigJam adopts into boundary sections) and **every endpoint half was classified into exactly one of four
buckets**: attached to an ordinary node, floating on its own host page, floating on another page, or no
endpoint id at all. The buckets sum to `2 × connectorCount` on all five pages, so nothing was silently
dropped — see Anomaly 1 for why the old figure was 39.

| Page | id | Connectors | Rules on `0:1` **before** | Rebuilt | Rules on `0:1` **after** |
|---|---|---|---|---|---|
| 1 · Start here | `182:1807` | 38 | **1** | 1 | **0** |
| 2 · In plain language | `183:1614` | 150 | **17** | 17 | **0** |
| 3 · Technical | `184:929` | 150 | **16** | 16 | **0** |
| 4 · Employee performance | `186:244` | 28 | **2** | 2 | **0** |
| 5 · Development process | `0:1` | 1 | 1 *(its own page — correct by definition)* | **0, left alone** | 1 |
| **Total, pages 1–4** | | | **36** | **36** | **0** |

Failed assertions: **none**. No rule was left un-rebuilt, and nothing was deleted on faith.

## What was asserted before each deletion

Seventeen properties compared **exactly** — `name`, `visible`, `locked`, `opacity`, `blendMode`, `strokes`
(the full paint JSON, not just the hex), `strokeStyleId`, `strokeWeight`, `strokeAlign`, `strokeJoin`,
`dashPattern`, `connectorLineType`, both stroke caps, `cornerRadius`, `rotation`, and the connector's text
`characters` — plus three geometric comparisons within **0.5px**: `connectorStart.position`,
`connectorEnd.position`, and `absoluteBoundingBox`, which is the one read that is genuinely *off the
canvas* rather than an echo of what was written. Finally `endpointNodeId` on both halves had to equal the
**host page's** id, which is the whole point of the exercise.

**The source was shape-asserted before any comparison ran (§7.1).** Both positions and the bounding box
had to be arrays of finite numbers, `strokeWeight` a number, the stroke paint a non-trivial string, the
caps and line type strings, `cornerRadius` a number, the text readable, and the old index `>= 0`. A source
failing any of those would have been reported and skipped, not compared. Every rule below returned
`allExactKeysMatched: true`, a 0.0px endpoint delta and a 0.0px bounding-box delta — all 36 matched to the
digit, not merely inside tolerance.

### Page 1 · Start here

| Old → new | Start | End | Length | Index |
|---|---|---|---|---|
| `102:853` → `201:1146` | −4032, 700 | −1568, 700 | 2464 | 117 → 117 |

Page-1 rules **not** in scope and untouched: `47:186` (the key's 64px section-motif sample), `47:173` /
`47:178` (the key's 1.5px solid and dashed connector samples) and `189:313` (the page header rule) — all
four already carry `182:1807`.

### Page 2 · In plain language — 17

| Old → new | Start | End | Length | Index |
|---|---|---|---|---|
| `105:1133` → `203:1841` | −13200, 4058 | −13136, 4058 | 64 | 191 |
| `105:1137` → `203:1845` | −13200, 4810 | −13136, 4810 | 64 | 192 |
| `105:1165` → `203:1849` | −13200, 5562 | −13136, 5562 | 64 | 199 |
| `105:1221` → `203:1853` | −13200, 3766 | −10736, 3766 | 2464 | 213 |
| `105:1372` → `203:1857` | −10256, 4058 | −10192, 4058 | 64 | 214 |
| `105:1376` → `203:1861` | −10256, 4774 | −10192, 4774 | 64 | 215 |
| `105:1436` → `203:1865` | −10256, 5558 | −10192, 5558 | 64 | 230 |
| `105:1484` → `203:1869` | −10256, 3766 | −7792, 3766 | 2464 | 242 |
| `105:1592` → `203:1873` | −7312, 4058 | −7248, 4058 | 64 | 246 |
| `105:1596` → `204:1841` | −7312, 4858 | −7248, 4858 | 64 | 247 |
| `105:1692` → `204:1845` | −7312, 3766 | −4848, 3766 | 2464 | 267 |
| `105:1803` → `204:1849` | −13200, 7470 | −13136, 7470 | 64 | 268 |
| `105:1807` → `204:1853` | −13200, 8346 | −13136, 8346 | 64 | 269 |
| `105:1907` → `204:1857` | −13200, 7178 | −10736, 7178 | 2464 | 288 |
| `105:1945` → `204:1861` | −10256, 7470 | −10192, 7470 | 64 | 289 |
| `105:1949` → `204:1865` | −10256, 7178 | −9636, 7178 | 620 | 290 |
| `106:1679` → `204:1869` | −13200, 3010 | −4848, 3010 | 8352 | 300 |

Eleven eyebrow rules at 64, four act rules at 2464, act 05's at 620, and the page header rule at 8352 —
which is the page's full 17, so page 2's rule inventory is now entirely locally hosted.

### Page 3 · Technical — 16

| Old → new | Start | End | Length | Index |
|---|---|---|---|---|
| `25:27` → `204:1873` | −1088, 3348 | −1024, 3348 | 64 | 212 |
| `44:111` → `204:1877` | −4032, 3348 | −3968, 3348 | 64 | 213 |
| `51:181` → `204:1881` | −4032, 4100 | −3968, 4100 | 64 | 214 |
| `52:231` → `204:1885` | −4032, 4852 | −3968, 4852 | 64 | 221 |
| `53:315` → `204:1889` | −1088, 4064 | −1024, 4064 | 64 | 235 |
| `55:337` → `204:1893` | −1088, 4848 | −1024, 4848 | 64 | 250 |
| `56:397` → `204:1897` | 1856, 3348 | 1920, 3348 | 64 | 262 |
| `56:520` → `204:1901` | 1856, 4148 | 1920, 4148 | 64 | 263 |
| `57:522` → `204:1905` | −4032, 6760 | −3968, 6760 | 64 | 273 |
| `58:607` → `204:1909` | −4032, 7636 | −3968, 7636 | 64 | 274 |
| `59:672` → `204:1913` | −1088, 6760 | −1024, 6760 | 64 | 284 |
| `68:723` → `204:1917` | −4032, 3056 | −1568, 3056 | 2464 | 314 |
| `68:729` → `204:1921` | −1088, 3056 | 1376, 3056 | 2464 | 315 |
| `68:735` → `204:1925` | 1856, 3056 | 4320, 3056 | 2464 | 316 |
| `68:741` → `204:1929` | −4032, 6468 | −1568, 6468 | 2464 | 317 |
| `68:747` → `204:1933` | −1088, 6468 | −468, 6468 | 620 | 318 |

Eleven eyebrow rules at 64 and the five act rules. The page header rule `190:1688` (8352) was created
after the split, already carried `184:929`, and was not touched.

### Page 4 · Employee performance — 2, and the page proved unchanged around them

| Old → new | Start | End | Length | Index |
|---|---|---|---|---|
| `91:735` → `202:1146` | 720, 6760 | 784, 6760 | 64 | 36 |
| `91:722` → `202:1150` | 720, 6468 | 1340, 6468 | 620 | 38 |

**`06` is hand-drawn by the board's owner and is the reference standard for the whole grammar**, so the
brief was to prove the rest of the page untouched rather than to assume it. Every node on the page was
signed **before and after** the rebuild on 24 fields — id, type, name, parent id, index within parent,
`absoluteBoundingBox` to 3dp, visibility, lock, opacity, rotation, fills, strokes, stroke weight, dash
pattern, characters, font name, font size, shape type, both connector endpoints, line type, both stroke
caps and corner radius — and the two signature maps compared key by key.

| Assertion | Expected | Returned |
|---|---|---|
| nodes on page, before → after | equal | `68` → `68` |
| other nodes whose signature changed | 0 | **0** (of 66) |
| nodes unexpectedly removed | `[]` | `[]` |
| nodes unexpectedly added (beyond the 2 new rules) | `[]` | `[]` |
| rules referencing `0:1` after | 0 | **0** |

Page 4's third rule, `190:1821` (the page header rule, 2808), already carried `186:244` and was not
touched. Neither rule needed improvising, so the "leave it and report" escape was not used.

## Final board-wide sweep

Run after all four pages, each page explicitly `loadAsync()`d first (§15's `children.length` trap).

| Page | Nodes | Connectors | Halves attached to a node | Halves floating on own page | **Halves floating on another page** | Rules | All rules locally hosted |
|---|---|---|---|---|---|---|---|
| 1 · Start here | 152 | 38 | 66 | 10 | **0** | 3 | ✅ |
| 2 · In plain language | 353 | 150 | 266 | 34 | **0** | 17 | ✅ |
| 3 · Technical | 376 | 150 | 266 | 34 | **0** | 17 | ✅ |
| 4 · Employee performance | 68 | 28 | 50 | 6 | **0** | 3 | ✅ |
| 5 · Development process | 7 | 1 | 0 | 2 | **0** | 1 | ✅ |

**Endpoints still referencing `0:1` from pages 1–4: zero.** The only endpoints on `0:1` anywhere on the
board are page 5's own rule `190:1829`, where `0:1` *is* the host page. Node counts are unchanged on every
page, so the rebuild was net-neutral: 36 nodes out, 36 in, each at its predecessor's index.

**The partition is the part that could fail.** Every endpoint half lands in exactly one bucket and the
buckets sum to `2 × connectors` on all five pages (76 / 300 / 300 / 56 / 2). A cross-page reference to any
page — not only to `0:1` — would surface here; the sweep found none, which is a stronger statement than
the one asked for.

## Screenshots spent

Pages 1, 2, 3 and 4 in full, each read for *presence and placement of every rule* rather than for general
tidiness, plus one 1:1 close-up of page 3's act 05 header.

- **Page 4** — page rule, the 620 act rule above `06  EMPLOYEE PERFORMANCE`, and the 64 eyebrow rule above
  `30 Day - 90 Day Reviews`: all three present, correctly placed, everything else identical to before.
- **Page 1** — the rebuilt 2464 rule sits above `HOW PEOPLE EXPERIENCE IT` exactly as before; the key's
  samples and the page rule are unaffected.
- **Pages 2 and 3** — counted by eye against the readback: eleven eyebrow rules, five act rules and one
  page rule each, seventeen apiece, none missing and none displaced.
- **Close-up** — at 1:1 both of act 05's rebuilt rules render as crisp 3px royal-blue rules left-aligned to
  the act origin, the 620 above `05  SYSTEM` and the 64 between `05 · SYSTEM · 1 OF 1` and
  `MODULE BOUNDARIES & EVENT MAP`. **This is the check a readback cannot make**: §5 draws these as
  connectors precisely because a `ShapeWithText` renders a 3px rule as a rounded blob, and only an eye can
  confirm the rebuilt ones did not become blobs.

**Anomalies:**

1. **The figure was 39 and the canvas said 36, and the difference is entirely page 1.** The note above
   tabulated `Start here 4`; today page 1 holds **one**. Re-derived twice by different routes — a
   whole-tree scan and an exhaustive endpoint partition — which agree. The reconciliation is in the split
   entry's own numbers: it recorded **8 floating endpoint halves** on page 1, that is **4 floating
   connectors**, and all four then referenced `0:1`. But only one of those four is a section rule. The
   other three are the key's own specimens — `47:173` and `47:178`, the 1.5px solid and dashed connector
   samples, and `47:186`, the 64px section-motif sample — and all three now carry `182:1807`. So two
   things were true at once: **the table counted floating connectors and called them rules**, and **a
   later pass re-wrote three of them**, almost certainly the §15/§16 move of the key block into the header
   zone, since moving a floating connector means rewriting its endpoints and that re-hosts it. §16's
   Anomaly 6 says only `189:313` was re-pointed; that is incomplete. *A count copied forward from a note
   is a fact with an expiry date* — §intro's rule, landing on this log's own prose.
2. **The endpoint readback carries the position as well as the node id, and that is what made this
   repairable.** The previous entry reports `endpointNodeId: "0:1"` and stops there, which reads as though
   the coordinates were lost to the page reference. They are not: `connectorStart` returns
   `{endpointNodeId, position}` together, so every original x/y was recoverable exactly and the new rules
   could be placed by number rather than re-derived from a bounding box. Recorded because a session
   reading only the old note would plan a harder and less exact job than the one that exists.
3. **`strokeMiterLimit` does not exist on a FigJam `CONNECTOR`** and the first attempt threw on reading it.
   Nothing had been written at that point, so the retry was clean. Every property is now read through a
   `k in node` guard. This is §7.1 arriving from the friendly direction: a property that throws announces
   itself, where the `text.height` case that started §7.1 returned `undefined` and let a check quietly
   pass. The set a connector here actually exposes was probed and written down rather than assumed:
   `strokeMiterLimit`, `effects` and `isMask` are absent; `cornerRadius` is present, reads `24` and is
   read-only, so it is compared and never set.
4. **`get_screenshot` on an act panel renders the panel alone, even with `contentsOnly: false`.** The
   diagrams sit *on top of* the panel rather than inside it, so the first close-up came back as an empty
   beige rectangle. **It could easily have been read as "the rules are gone".** The 1:1 shot instead used
   the board's established technique — a transient opaque ground-coloured probe at index 0, screenshotted
   and removed in the same call: probe `205:1841`, page-3 node count `376` before and `376` after, and
   `getNodeByIdAsync` returned `null` for it after removal. Same family as §5's section-name gotcha:
   **the instrument reported something about itself and it looked like a fact about the board.**
5. **Page 5's own rule was checked and left.** `190:1829` (2464, at −7872, −1300) has both endpoints on
   `0:1`, which is its host page, so it is correct by construction. The reserved region is untouched:
   7 nodes before, 7 after, nothing created, nothing removed.
6. **Z-order was preserved by construction, not by hope.** Each new rule was appended, asserted, and only
   then swapped in — old `remove()` followed by `insertChild(oldIndex, new)`, which lands the new node in
   the vacated slot. All 36 returned `oldIndex === newIndex`. Nothing jumped in front of or behind a
   panel, a wash or a diagram.

---

# The act panels squared into a grid · 2026-09-25

Board: https://www.figma.com/board/CwLecjQLRS0x9Q28UHQ1zP · **Pages recorded per §15.5**; every coordinate
below is absolute and page-scoped. Ruled by §1.0.2's 2026-09-25 scoping of rule 6 — *content stays honest,
containers square up.* **Eleven panel rectangles were resized and repositioned and nothing else was
touched**: 766 content nodes were bbox-compared before and after and `contentMovedCount` returned **0** on
all three pages.

## The solve — one budget, and it is fixed by the content

The act content origins are evenly pitched, which was asserted rather than assumed (the script threw
otherwise):

| Page | Row 1 origins | Row 2 origins | Pitch |
|---|---|---|---|
| 3 · Technical | −4032 · −1088 · 1856 | −4032 · −1088 | 2944, twice |
| 2 · In plain language | −13200 · −10256 · −7312 | −13200 · −10256 | 2944, twice |

Panels are left-aligned at `origin − P` with a single width `W`, so the **column gap is `2944 − W`, constant
for free**. Symmetric padding on the widest act content gives `W = widest + 2P`, and therefore the whole
problem reduces to one budget:

```
widest act content anywhere = 2588   (page 3 acts 01 and 04; page 2 act 04)
2P + G = 2944 − 2588 = 356
```

**Padding and inter-panel gap trade off directly, and 356px is all there is.** Options on the 4px grid:

| P | W | G | Read |
|---|---|---|---|
| 160 (§16 as built) | 2908 | **36** | panels almost touching — the defect being fixed |
| 128 | 2844 | 100 | gap still under the 160 diagram rhythm |
| **96** | **2780** | **164** | **chosen** — gap just clears §4's 160 diagram gap; padding is 2 × 48 |
| 80 | 2748 | 196 | gap comfortable, padding below 2 × 48 |

**Chosen: `P = 96`, `W = 2780`, `G = 164`.** The reasoning, stated rather than picked: the gap has to read
as *at least* as strong a separation as the 160 gap that already separates diagrams *inside* an act,
otherwise the act break is weaker than the break one level down — and 164 is the smallest 4px value that
clears it. Spending the remaining 192 as 96 a side keeps padding in §4's own family (96 = 2 × 48 = 3 × 32)
and is still four times the 24px an act header's rule needs to look seated. A gap between hard-edged filled
blocks reads stronger than the same distance of plain whitespace, so 164 does more work than 160 did.

**8px was proved impossible, not skipped.** `356 ≡ 4 (mod 8)`, so for any `P` on the 4px grid,
`G = 356 − 2P ≡ 4 (mod 8)` — the gap can never be a multiple of 8. Both numbers land on §4's stated 4px
grid; neither can land on 8. That is a property of the content, not of the choice.

**§16.2's "clearance on all four sides at least equal to the diagram-to-diagram gap" cannot survive this,
and that is where the cost lands.** With `P ≥ 160` the gap is ≤ 36. Horizontal clearance therefore drops
from 160 to 96. Vertically the budget is more generous — row 1 content bottoms at 5988 and row 2 tops at
6468, a 480 act break — so 96 a side there *buys* row separation rather than spending it.

## Title clearance — one value, every page

The trigger: page 3's panels cleared their title block by **27** and page 2's by **427**, because the old
rule measured from act *contents* while a reader perceives the panel *edge*. Row 1's shared top edge is now
`titleBlockBottom + 96` on every page — the same 96 as the padding, so one number governs the system.

| Page | Title-block bottom | Row-1 panel top | Clearance | Resulting top padding |
|---|---|---|---|---|
| 1 · Start here | **416** (header band, §16.5) | 512 | **96** | 188 |
| 2 · In plain language | **3179** | 3275 | **96** | **491** |
| 3 · Technical | **2869** | 2965 | **96** | 91 |

96 is also the largest round value page 3 can afford: it has only 187px between title bottom and content
top, so `C + topPadding = 187` there, and 96/91 splits it almost exactly in half. Anything larger starves
the top padding; `C = 160` would put the old 27px defect back, inside the panel.

**Page 1's measurement is definitional and is recorded as such.** §16.5 makes page 1's header *one band* —
title, index and key — whose lowest element is the key at y 416. Measuring instead from the nearest column
directly above the panel (`197:1146`, bottom −297) would put the panel top at −201 and leave a **901px**
empty band inside it. The band-bottom reading was taken; the alternative is in Anomalies.

## Page 3 · Technical — before → after

| Panel | Act | Before `x, y · w × h` | After `x, y · w × h` | After `x1, y1` |
|---|---|---|---|---|
| `195:1146` | 01 ACCESS & IDENTITY | −4192, 2896 · 2908 × 2676 | **−4128, 2965 · 2780 × 3119** | −1348, 6084 |
| `195:1150` | 02 PEOPLE | −1248, 2896 · 2816 × 3252 | **−1184, 2965 · 2780 × 3119** | 1596, 6084 |
| `195:1154` | 03 TIME | 1696, 2896 · 2784 × 1936 | **1760, 2965 · 2780 × 3119** | 4540, 6084 |
| `195:1158` | 04 MONEY | −4192, 6308 · 2908 × 2012 | **−4128, 6372 · 2780 × 1884** | −1348, 8256 |
| `195:1162` | 05 SYSTEM | −1248, 6308 · 1520 × 1436 | **−1184, 6372 · 2780 × 1884** | 1596, 8256 |

Act content, re-derived from canvas and unchanged by this pass: 01 `−4032, 3056 → −1444, 5412` (82 nodes) ·
02 `−1088, 3056 → 1408, 5988` (96) · 03 `1856, 3056 → 4320, 4672` (64) · 04 `−4032, 6468 → −1444, 8160`
(75) · 05 `−1088, 6468 → 112, 7584` (32). Row 1's bottom is set by act 02 (5988 + 96); row 2's by act 04.

## Page 2 · In plain language — before → after

| Panel | Act | Before `x, y · w × h` | After `x, y · w × h` | After `x1, y1` |
|---|---|---|---|---|
| `195:1851` | 01 ACCESS & IDENTITY | −13360, 3606 · 2840 × 2676 | **−13296, 3275 · 2780 × 3519** | −10516, 6794 |
| `195:1855` | 02 PEOPLE | −10416, 3606 · 2816 × 3252 | **−10352, 3275 · 2780 × 3519** | −7572, 6794 |
| `195:1859` | 03 TIME | −7472, 3606 · 2784 × 1936 | **−7408, 3275 · 2780 × 3519** | −4628, 6794 |
| `195:1863` | 04 MONEY | −13360, 7018 · 2908 × 2012 | **−13296, 7082 · 2780 × 1884** | −10516, 8966 |
| `195:1867` | 05 SYSTEM | −10416, 7018 · 1520 × 1418 | **−10352, 7082 · 2780 × 1884** | −7572, 8966 |

Act content: 01 `−13200, 3766 → −10680, 6122` (79) · 02 `−10256, 3766 → −7760, 6698` (92) ·
03 `−7312, 3766 → −4848, 5382` (58) · 04 `−13200, 7178 → −10612, 8870` (65) ·
05 `−10256, 7178 → −9056, 8276` (32). **Page 2 was re-derived independently and is not page 3 translated**
— its row-1 widest content is 2520, not 2588, so its 01 panel carries 164 of right padding where page 3's
carries 96. One `W` was kept board-wide anyway, so the column edges align down both pages.

## Page 1 · Start here — before → after

| Panel | Before | After | Padding |
|---|---|---|---|
| `196:1144` | −4192, 540 · 4024 × 2196 | **−4128, 512 · 3896 × 2160** | 96 left / 96 right / 96 bottom / 188 top |

Content `−4032, 700 → −328, 2576` (91 nodes), unchanged. No column grid exists here; the pass applied the
padding and the clearance rule only.

## Grid assertions — returned, not intended

| Assertion | Page 3 | Page 2 |
|---|---|---|
| single column width | `2780` | `2780` |
| column gaps, row 1 | `[164, 164]` | `[164, 164]` |
| column gap, row 2 | `[164]` | `[164]` |
| row tops | `[2965, 6372]` | `[3275, 7082]` |
| each row shares a bottom edge | `[true, true]` | `[true, true]` |
| **row gap** | **288** | **288** |
| title clearance | 96 | 96 |
| content nodes checked / moved | 349 / **0** | 326 / **0** |
| content outside its panel | `[]` | `[]` |
| panel-to-panel overlap | `[]` | `[]` |
| panel overlaps the title block | `[]` | `[]` |
| panel index < min content index | `zFail: []` | `zFail: []` |

Page 1: `contentChecked 91`, `contentMovedCount 0`, `encloseFail []`, `headerHit []`, `zOk true`
(panel idx 0, min content idx 43).

Membership was re-derived from the *old* panel bounds and asserted to partition the page exactly
(`members.sum === children − panels − header`, thrown otherwise), so the enclosure check afterwards was run
against a population that could have failed rather than against a filter that selected its own answer.

**The row gap was the flagged risk and it went the other way.** Squaring row 1 to act 02's bottom at the
old 160 padding would have left 160 between two large filled blocks — the brief's worry. Dropping padding
to 96 spends 192 less of the 480 act break, so the gap came out at **288**, not 160: comfortably more than
the 164 column gap, which is right, because a row break should read as the larger move. Checked by eye at
full-board zoom on both pages — it reads as a deliberate band of ground, not as a seam.

Board-wide sweep, **every page `loadAsync()`d first** (§15's `children.length` trap): 922 top-level nodes,
11 panels, `leftoverProbes: []`, all five page backgrounds `#f2ede3`, `zOrderOk: true` on every page. All
11 panels returned `SHAPE_WITH_TEXT`, fill `{0.98039216, 0.96862745, 0.94509804}` (`#faf7f1`),
`cornerRadius 6`, `strokes.length 0`. Pages 4 and 5 untouched: 68 and 7 children, `panelsPresent 0`.

## Screenshots spent

Five, one per page at full-board zoom, which is the only view that can answer the board owner's original
whole-board complaint. Pages 1–3 each via a transient ground-coloured `ShapeWithText` probe at index 0,
removed in the same call (`probeRemoved: true`, `getNodeByIdAsync` → `null`); pages 4 and 5 read-only, no
node created. **The probe turned out to be unnecessary** — `page.screenshot()` renders the page background
on its own, as pages 4 and 5 demonstrated. Recorded so the next session does not inherit a ritual.

**Anomalies:**

1. **Page 2's row-1 panels now carry a 491px empty band above their act headers, and it is the direct,
   unavoidable price of fixed clearance.** Page 2's title block sits 587 above its first act where page 3's
   sits 187; with the clearance pinned at 96 the difference has to go *inside* the panel. The total
   distance a reader sees from title to first diagram is unchanged at 587 — only the panel edge moved, from
   427 below the title to 96. At full-board zoom it reads as a generous, uniform top margin rather than as
   an error, because all three panels in the row share it exactly. **But top padding is now 91 on page 3
   and 491 on page 2, and a reader flipping between the pages sees panels that are tight at the top on one
   and airy on the other.** Fixed clearance and uniform padding are not simultaneously satisfiable while
   the two headers sit at different heights above their content; the brief chose clearance, and this is
   what that costs. Closing it would mean moving page 2's title block down by about 400 — a header move,
   outside this pass's scope, and a §15 call.
2. **Page 1's clearance is measured from the header *band*, not from the column directly above the panel.**
   §16.5 built that header as one three-column band, and its lowest element is the key at y 416, off to the
   right of the panel at x 1856–2486 — so the 96 is measured against something that is not horizontally
   above the panel. The alternative reading (the `CONTENTS` column, bottom −297) is internally more
   consistent but puts a 901px empty band inside the panel, which is anomaly 1 an order of magnitude worse.
   Flagged because the two readings differ by 713px and the choice is a judgement, not a measurement.
3. **§16.2's "clearance on all four sides at least equal to the diagram-to-diagram gap" is now violated
   horizontally, deliberately.** It was written before the panels were a grid and it is arithmetically
   incompatible with one: `2P + G = 356` makes `P = 160` cost a 36px gap. The doc still says 160; the
   canvas says 96. **§16.2 needs amending to say what the panel padding actually is and why** — this log is
   not where that rule lives, and a canvas silently disagreeing with its own spec is how the last six
   passes got into trouble.
4. **Act 03 on both pages and act 05 on both pages now hold large empty areas** — 03 TIME's content is 1616
   tall inside a 3119-tall panel, and 05 SYSTEM's is 1200 wide inside a 2780-wide one. **This is the ruling
   working, not a defect**: §1.0.2's scoping says the container squares up while the content stays honest,
   and nothing was padded, stretched, reflowed or centred to fill either. Recorded so a later session does
   not "fix" it.
5. **Panel top coordinates inherit odd values from the title blocks** — 2965 on page 3 and 3275 on page 2,
   because the key-pointer text bottoms out at 2869 and 3179 respectively. Every *spacing* value in this
   pass (96, 164, 288, 2780) is on §4's 4px grid; the absolute y of a panel edge is not, and cannot be
   while the clearance is exact. Rounding the tops to 2968/3276 would have made the clearances 99/97 and
   broken the one thing the ruling asked to be identical across pages. Exactness of the clearance was
   chosen over evenness of a coordinate nobody can see.

## Title-to-content distance — one value, every page

Built: 2026-09-25 · Board: https://www.figma.com/board/CwLecjQLRS0x9Q28UHQ1zP · **Pages recorded per
§15.5**; every coordinate below is absolute and page-scoped.

The previous entry's **Anomaly 1** is the trigger and this entry closes it. Fixed 96px panel clearance
exposed that page 2's row-1 panels carried **491** of empty panel above their act headers where page 3's
carried **91**. Both were uniform within their page; 491 read as a mistake.

**The brief's framing was corrected before building.** It arrived as *"every page's title block occupies a
fixed block, so panels start at the same y on all five pages."* The second half does not follow. Pages are
separate canvases — nobody ever sees two at once, so a shared absolute y is not a property a reader can
perceive, and it would not have equalised the interior padding anyway, because page 2's mirror set sits
+710 from page 3's. What a reader *does* perceive is **the distance from the title block to the first
block of content**. Equalise that and the interior padding equalises as a consequence, which is what
happened.

**Chosen distance: 187.** It is page 3's existing value, taken as the reference because it is the tightest
of the five and it reads correctly. It is also the value the previous entry's clearance arithmetic was
already built around: `C + topPadding = 187` with `C = 96` is what produces the 91 top padding, so holding
187 board-wide makes 96/91 the outcome everywhere instead of on one page only.

**Which is cheaper per page — move the title block, or move the panel top?** The question resolves the
same way on every page, and it is not a free choice: the distance is measured *title → content*, content
cannot move, so only the title can. The panel top is not an independent quantity at all — it is
`titleBlockBottom + 96`, derived. So the title block moves and the panel top follows it. Page 3 is the
exception and the cheapest case of all: it already sat at 187, so **nothing on page 3 was touched** — no
title move, no panel move, read-only verification.

### Title blocks — before → after

| Page | Title block | Before (bbox) | After (bbox) | Δy |
|---|---|---|---|---|
| 1 · Start here | header band, 60 nodes | −4032, −907 → 2486, **416** | −4032, −219 → 2486, **513** | +688 translation, and the band is 591 shorter (key re-laid, below) |
| 2 · In plain language | 5 nodes | −13200, 2978 → −4848, **3179** | −13200, 3378 → −4848, **3579** | **+400** |
| 3 · Technical | 5 nodes | −4032, 2668 → 4320, **2869** | *unchanged — reference* | 0 |
| 4 · Employee performance | 5 nodes | 720, 6068 → 3528, **6269** | 720, 6080 → 3528, **6281** | **+12** |
| 5 · Development process | 5 nodes | −7872, −1332 → −5408, **−1131** | −7872, −1295 → −5408, **−1094** | **+37** |

Distance returned per page, measured title-block-bottom → first content node: **187 · 187 · 187 · 187 ·
187**. Before: 284 (page 1, band reading) · 587 · 187 · 199 · 224.

**Pages 4 and 5 were moved and nothing else on them was touched.** Both title blocks are this project's
own furniture (the `190:18xx` eyebrow / rule / title / description / key-pointer set); page 4's hand-drawn
`06` and page 5's reserved text are the owner's, and neither needed to move for the distance to hold — 63
and 2 content nodes respectively, **zero moved**.

### Panel tops — before → after

| Page | Panel | Before `x, y · w × h` | After `x, y · w × h` | Bottom |
|---|---|---|---|---|
| 1 | `196:1144` | −4128, 512 · 3896 × 2160 | **−4128, 609 · 6710 × 2063** | 2672 (unchanged) |
| 2 | `195:1851` | −13296, 3275 · 2780 × 3519 | **−13296, 3675 · 2780 × 3119** | 6794 (unchanged) |
| 2 | `195:1855` | −10352, 3275 · 2780 × 3519 | **−10352, 3675 · 2780 × 3119** | 6794 (unchanged) |
| 2 | `195:1859` | −7408, 3275 · 2780 × 3519 | **−7408, 3675 · 2780 × 3119** | 6794 (unchanged) |
| 2 | `195:1863` `195:1867` | −13296 / −10352, 7082 · 2780 × 1884 | *unchanged* | 8966 |
| 3 | all five | 2965 (row 1) / 6372 (row 2) | *unchanged* | 6084 / 8256 |

Page 1's width change is the addendum, not the clearance rule; the clearance rule moved only its top edge.

### Interior padding now — returned per panel

| Page | Panel | top | left | right | bottom | nodes inside |
|---|---|---|---|---|---|---|
| 1 | `196:1144` | **91** | 96 | 2910 | 96 | 91 |
| 2 | `195:1851` 01 | **91** | 96 | 164 | 672 | 79 |
| 2 | `195:1855` 02 | **91** | 96 | 188 | 96 | 92 |
| 2 | `195:1859` 03 | **91** | 96 | 220 | 1412 | 58 |
| 2 | `195:1863` 04 | 96 | 96 | 96 | 96 | 65 |
| 2 | `195:1867` 05 | 96 | 96 | 1484 | 690 | 32 |
| 3 | `195:1146` 01 | **91** | 96 | 96 | 672 | 82 |
| 3 | `195:1150` 02 | **91** | 96 | 188 | 96 | 96 |
| 3 | `195:1154` 03 | **91** | 96 | 220 | 1412 | 64 |
| 3 | `195:1158` 04 | 96 | 96 | 96 | 96 | 75 |
| 3 | `195:1162` 05 | 96 | 96 | 1484 | 672 | 32 |

**The top padding of every title-adjacent panel on the board is now 91, and 491 exists nowhere.** Row 2's
96 is correct and untouched: a second-row panel's top is derived from the 288 row gap, not from a title.

### Page 1 · the header re-layout (addendum, same pass)

Three fixes arrived mid-pass from a landing-page design review. Two were built; one was not, and the
reason is Anomaly 3.

**The panel now spans the page's content width.** The content width is the page rule `189:313` — literally
the line drawn under the header — at **6518** (−4032 → 2486). The panel is that span inset by −96 on each
side: **−4128 → 2582, w 6710**. The journeys did not move; only the right edge did (−232 → 2582).

**The KEY block was re-laid from one tall column into three, and is now the widest block in the header.**

| | Before | After |
|---|---|---|
| key block bbox | 1856, −552 → 2486, 416 · **630 × 968** | 451, 136 → 2485, 513 · **2034 × 377** |
| column 1 · band miniature | — | 451, 182 → 1081, 366 |
| column 2 · the six marks | — | 1245, 182 → 1761, 502 |
| column 3 · edges, notes, header stack | — | 1925, 182 → 2485, 513 |

Sub-column gaps **164 · 164**, all three column tops **182**. Every group translated **rigidly** — col 1
by (−1405, +688), col 2 by (−611, +448), col 3 by (+69, +97) — so no gap *inside* a group changed by a
pixel, and nothing was restyled or resized. §8's positional pair survives and was read back by name:
**boundary frame at 1245, 406 and alternate wash at 1245, 462** — same column, consecutive, in that order.
The five band-miniature connectors are node-attached and followed their shapes; the three free connectors
(`47:173`, `47:178`, `47:186`) are page-attached and were moved by `x`/`y`, which was **probed first**: the
script moved `47:186`, read it back, and would have returned `abort` without touching anything else had
the assignment not taken. It took, on all four pages that have a free connector.

**The three header blocks are now evenly distributed across the content width.**

| Block | Before | After | Width |
|---|---|---|---|
| masthead | −4032 → −2032 | *unchanged* | 2000 |
| CONTENTS index | −1088 → −93 | **−1288 → −293** | 995 |
| KEY | 1856 → 2486 | **451 → 2485** | 2034 |

Gaps **744 · 744** (before: 944 · 1949). Both on §4's 4px grid.

### Grid assertions — returned, not intended

| Assertion | Page 1 | Page 2 | Page 3 |
|---|---|---|---|
| title → first content | **187** | **187** | **187** |
| title-block bottom → panel top | **96** | **96** | **96** |
| single panel width | 6710 | `2780` | `2780` |
| column gaps, row 1 | n/a | `[164, 164]` | `[164, 164]` |
| row tops | `[609]` | `[3675, 7082]` | `[2965, 6372]` |
| each row shares a bottom edge | `[2672]` | `[6794]` · `[8966]` | `[6084]` · `[8256]` |
| **row gap** | n/a | **288** | **288** |
| content nodes checked / moved | 91 / **0** | 326 / **0** | 349 / **0** |
| content outside its panel | `[]` | `[]` | `[]` |
| panel overlaps the title block | `[]` | `[]` | `[]` |
| panel index < min content index | `zFail: []` (0 < 43) | `zFail: []` | `zFail: []` |

Pages 4 and 5: 63 / **0** and 2 / **0** content nodes moved, no panels, `headerHit []`.

**Every write asserted its own comparator could fail.** Each script captured `[x, y, w, h]` for *every*
child before mutating, then counted how many children came back changed and threw if that count was not
the exact number intended — 37 on page 1's key call, 24 on page 1's band call, 8 on page 2, 5 on page 4,
5 on page 5. A comparator that reported "nothing moved" while the intended moves also read as unmoved
would have failed that count. Child counts were asserted up front too (152 · 336 · 359 · 68 · 7), panel
membership was re-derived from returned geometry rather than from a stored list, and every page in the
closing sweep was `loadAsync()`d before its children were read (§15's `children.length` trap).

Board-wide: 922 top-level nodes, 11 panels, all five page backgrounds `#f2ede3` (242, 237, 227).

### Screenshots spent

Five, one per page at full-board zoom — the only view that answers the owner's original whole-board
complaint. **No probe node was created on any page**: `await page.screenshot({ scale })` composites the
page background itself. Scales 0.32 · 0.28 · 0.24 · 0.32 · 0.32, chosen per page extent.

**Anomalies:**

1. **Page 1's title-block bottom is set by the KEY column, not by the key-pointer line, and a sweep in
   this very pass measured it wrong.** The closing sweep used each page's `key pointer` node as the block
   bottom — correct on pages 2–5, where it is the lowest element — and so read page 1 as `titleBottom 337,
   distance 363, clearance 272`. The band's real bottom is **513** (`47:191`, the key's third column),
   giving 187 and 96, as the page-1 write call's own band-bbox readback returned. Caught by cross-checking
   two readbacks that measured the same thing differently. **Any future page-1 check must measure the band
   bbox over all 60 header nodes, never a single node.** §7.1 paying for itself twice in one pass — see
   anomaly 7 for the other.
2. **Page 1's panel is 2910 empty on the right against 96 on the left** — 43% of its width carries no
   content. This is the addendum's explicit ruling ("cream reads as nothing, panel reads as room"), and the
   same ruling as §1.0.2's for acts 03 and 05. It is deliberate; do not "fix" it by stretching or centring
   the journeys. What it buys: the panel and the header band now terminate at the same x, so the page no
   longer has a ragged right edge with a cream void behind it.
3. **The addendum's item 2 — "align the panel's left edge to the header zone's left edge" — was not
   executed, because it is already satisfied in the only sense available.** The header's left edge is
   −4032; so is the journeys'. The panel sits at −4128 because it is a *padded container*: the 96 is the
   left padding. Making the two flush would either zero the journeys' left padding (breaking the invariant
   this entire pass is built on) or require moving the header 96 left, de-aligning the header text from the
   body text below it. Pages 2 and 3 have the identical relationship (−13296 vs −13200; −4128 vs −4032), so
   changing page 1 alone would introduce exactly the page-to-page inconsistency this pass exists to remove.
   **What the complaint actually described was asymmetry, not offset**: the panel was 96 *past* the header
   on the left and 2718 *short* of it on the right. Item 1 fixed that — the panel is now 96 outside the
   header zone on both sides. If flushness is still wanted, it is a board-wide change to all three pages,
   in its own pass.
4. **The CONTENTS index left the board's column grid.** It moved from −1088 to −1288, and −1088 is one of
   the board's three column x-positions (−4032 / −1088 / 1856 — the same columns pages 2 and 3 put their
   acts on). The `MARKS` block sits at −1088 directly below it, inside the panel, and the two are now
   de-aligned by 200. Even distribution and the column grid are not simultaneously satisfiable here: with
   the blocks on-grid the gaps are 944 and 1949, which is the defect the addendum asked to remove. Even
   distribution was chosen because it was asked for explicitly; −1288 is then forced arithmetic once the
   key's right edge is pinned to the rule, not a preference.
5. **The KEY block's right edge is 2485 and the page rule's is 2486.** The content width 6518 is even and
   the CONTENTS block's measured text width 995 is odd, so no layout can give both gaps an integer 4px
   value *and* land the last block exactly on the rule. The 1px was put where nothing can be compared
   against it — between the key and the end of the rule — rather than between the two visible gaps. Same
   class as the previous entry's anomaly 5.
6. **Page 4 still has no panel**, so at full-board zoom its act sits on bare cream while pages 2 and 3 sit
   on panels. This is now the most visible remaining inconsistency in the board's structure. It is out of
   scope by instruction — page 4 is `06`, hand-drawn by the owner and the reference standard for the
   grammar — and is recorded here as a decision for him, not a defect to fix unasked.
7. **The leftover-probe name filter produced a false positive again.** `/probe|scratch|temp/i` matched
   page 3's `53:320`, a real content box named `Manager control setEmployeeManager` — "se**tEmp**loyee".
   The previous entry logged the same class of false positive on `128:1803`. **The filter is a name
   heuristic and is not evidence of a leftover node**; this pass created no nodes at all, which is the
   actual evidence. If the filter is kept, anchor it (`^probe`) rather than trusting a substring.
8. **Page 2's description did not need shortening and was not touched.** The brief anticipated it might no
   longer fit. It does: `106:1684` is `textAutoResize: HEIGHT`, 18px, 220 characters in a 2600-wide block,
   height **25** — one line, the same block every other page's description occupies (page 3's is 118
   characters in the same 2600 × 25). The text is longer than the others; the *block* is identical.
9. **§16.2 of the content doc still disagrees with the canvas** — carried forward unresolved from the
   previous entry's anomaly 3. It says clearance on all four sides at least equals the diagram-to-diagram
   gap; the canvas says 96, and now also says 91 above a title-adjacent act header. **§16.2 needs amending
   to describe the panel padding that actually exists**, including the 91/96 distinction and why it is 91
   rather than 96 (the exact 187 splits into 96 outside the panel edge and 91 inside it).

---

# BOARD: TETHR — BOOK A CALL · `YNBnqA4Ho6sFWXxfbc1vfn` · TODAY, two versions · 2026-09-29

> **This is a different board from every entry above it.** Everything before this heading is the HRMS
> board, `CwLecjQLRS0x9Q28UHQ1zP`. This entry and anything under it is
> **[Tethr — Book a Call](https://www.figma.com/board/YNBnqA4Ho6sFWXxfbc1vfn/Tethr---Book-a-Call)**,
> fileKey `YNBnqA4Ho6sFWXxfbc1vfn`, single page `0:1` ("Page 1"). Node ids are **not** comparable across
> the two files. Spec: [booking-flow-content.md](booking-flow-content.md) §1 (grammar deltas) and §2
> (TODAY). §3 PROPOSED was on hold and **nothing from it was drawn**.

Board was empty at the start of the pass — `childCount: 0`, one page. Built: the TODAY flow in two
versions, technical above, plain language below, on one page.

## Grammar deltas applied (§1 of the spec)

| Delta | On canvas |
|---|---|
| **No tenant boundary frame** | `boundaryFrameCount: 0` — zero `SECTION` nodes on the page, and no `#e7efff` fill anywhere. Dropped, not repurposed. |
| **Pill justified by a real named destination, not by `DOMAIN_EVENT_NAMES`** | One pill. Its destination is Tally to Notion, named in the label, and marked `(reported)` because no instrument here can see it. |
| **External crossing carried by the module-qualified identifier** | `Tally · store submission in Notion` — actor `Tally`, action `store submission in Notion`. No new mark for "external service". |

## The reported qualifier — rule, not invention

The pill reads **`Tally · store submission in Notion (reported)`**. §2.0 of
[diagram-language.md](diagram-language.md) rules that a qualifier goes in parentheses
(`Check name availability (advisory)`), and explicitly rejects the middle dot for that job. The dot in this
label does its one legitimate job — actor to action — and the parenthesis carries the aside. **No sixth
mark, no new shape, no new colour, no new hue.**

> Rule needed: §2.0 qualifier · Found unaided: **no — not yet reached** · Where looked first: n/a.
> Honest detail, because *not applicable* is a real answer: `diagram-language.md` was read in full, §2.0
> included, before any build call. But the correction arrived while geometry was still being gathered from
> this log, **before the pill label had been decided**, so the rule was never actually applied unaided and
> no credit is claimed for it. Drawn exactly as the correction specifies; nothing had to be swapped and the
> change cost nothing.

### Two more rules that had to be hunted for

Recorded because a rule that cannot be found is, from the build seat, a rule that does not exist.

| Rule needed | Found unaided | Where looked first | Note |
|---|---|---|---|
| §2.0 qualifier to parentheses | no — not yet reached | n/a | see above |
| **The standing note block** (`PRE-REQUISITES` / `PER-CLIENT CONFIG` / `CANNOT`) | yes, but late | `diagram-language.md` — **it is not there** | The device lives only in `process-flow-content.md` §14.5, and was reached by scanning *this log's* heading list, not the grammar doc. The brief named `diagram-language.md` as "the grammar"; a whole mark-adjacent device is absent from it. **This is the navigability gap of the pass.** |
| **A pill whose label is not a verbatim codebase string must leave DM Mono** | yes | `diagram-language.md` §4 | §4 states *"DM Mono means this exact string exists in the codebase"* but does not state the consequence. The consequence is recorded only in this log's `Plain-language set — eleven mirrors` entry (*"a wording change broke the typeface's claim"*). Inference required; the grammar doc states the premise and not the rule. |
| Diagram-origin frame of reference | yes, after reconciling | both | §4 gives the motif as `-196 / -164 / -146` **relative to band 1**; this log's `Rulings 2 & 3` entry gives `+0 / +32 / +50` with band 1 at `+196` **relative to a diagram origin**. Identical geometry, two frames. Reconciled to the origin frame; noted because a reader meeting only one of them will not know the other exists. |

## Page furniture — returned values

| Node | Property | Expected | Returned |
|---|---|---|---|
| Page `0:1` | background | `#f2ede3` | `#f2ede3` (was `#f5f5f5`) |
| Panel `4:2` | type / pos / size | RECTANGLE / `(-96, -96)` / 1532 x 1544 | `RECTANGLE` / `(-96, -96)` / 1532 x 1544 |
| Panel `4:2` | fill / strokes / corner / z | `#faf7f1` / none / 6 / behind | `#faf7f1` / `0` strokes / `6` / **page index 0** |
| Page eyebrow `4:3` | font / size / tracking / fill / pos | DM Mono Medium / 12 / +12% / `#667899` / `(0, -488)` | `DM Mono/Medium` / 12 / `{PERCENT,12}` / `#667899` / `(0, -488)` · 258 x 16 |
| Page title `4:4` | font / size / tracking / fill / pos | Manrope ExtraBold / 34 / `+0.5px` / `#001131` / `(0, -438)` | `Manrope/ExtraBold` / 34 / `{PIXELS,0.5}` / `#001131` / `(0, -438)` · 222 x 46 |
| Page description `4:5` | font / lineHeight / width / lines | Manrope Medium 14 / 20px / 640 / 2 | `Manrope/Medium` / `{PIXELS,20}` / 640 x **40** / `HEIGHT` |
| Key pointer `4:6` | font / pos | DM Mono Medium 12 / `(0, -320)` | `DM Mono/Medium` 12 `#667899` / `(0, -320)` · 215 x 16 |
| Page rule `4:7` | type / lineType / weight / stroke / caps | CONNECTOR / STRAIGHT / 3 / `#0755e9` / NONE-NONE | `CONNECTOR` / `STRAIGHT` / 3 / `#0755e9` / `NONE/NONE` |
| Page rule `4:7` | endpoints attached to **this page** | `0:1`, `(0,-456)` to `(64,-456)` | `endpointNodeId: "0:1"`, `(0,-456)` to `(64,-456)` |

Header band bottom (lowest ink: key row 5 label, y -201). Panel top -96. **Clearance 105**, against the
96 the HRMS board holds; recorded as returned, not adjusted, because 96 is a floor and the band bottom is
set by the key rather than by the title block.

## The legend — every mark used, and only those

§8 says a mark not in the legend is a mark the reader has to guess. It also says the boundary frame and the
alternate wash sit **adjacent, as a pair**. Neither mark is used on this board, so **neither is in the key**:
including them would teach two marks that appear nowhere, and the adjacency rule has nothing to pair.
Likewise **no failure-exit row** — this flow has no drawable domain failure (§2.1), `failureExitCount: 0`.

Census run over the canvas at the end of the pass, so the key is checked against reality rather than intent:
`SQUARE 9` · `ROUNDED_RECTANGLE 3` · `ELLIPSE 3` · `failureExitCount 0` · `washCount 0` ·
`boundaryFrameCount 0` · edges `solid 12 / dashed 3`. Each shape census is *8 diagram + 1 key sample*,
*2 pills + 1 key sample*, *2 circles + 1 key sample* — i.e. **every mark on the board has a key row and
every key row has a mark on the board.**

| Row | Sample node | Returned | Label node | Wording |
|---|---|---|---|---|
| eyebrow | `5:5` | `DM Mono/Medium` 12 `#667899` `(800,-488)` | — | `KEY` |
| 1 process step | `5:6` | SQUARE 150x40 `(800,-456)` `#ffffff` / `#dce3ee` @1 | `5:10` `(970,-444)` 111x19 | `a step in the flow` |
| 2 event pill | `5:11` | ROUNDED_RECTANGLE 150x40 `(800,-400)` `#ffffff` / `#c7d0e0` @1 | `5:15` `(970,-388)` 214x19 | `work this flow sets off elsewhere` |
| 3 end of path | `5:16` | ELLIPSE 24x24 `(863,-336)` fill `#ffffff`@**0** / `#001131` @**1.5** | `5:19` `(970,-332)` 110x19 | `a path ends here` |
| 4 sync edge | `5:20` | CONNECTOR STRAIGHT `#657187` 1.5 dash `[]` `NONE/ARROW_LINES` `(800,-268)` to `(950,-268)` | `5:24` `(970,-276)` 88x19 | `the next step` |
| 5 async edge | `5:25` | CONNECTOR STRAIGHT `#0755e9` 1.5 dash `[6,4]` `NONE/ARROW_LINES` `(800,-212)` to `(950,-212)` | `5:29` `(970,-220)` 198x19 | `a consequence, not waited for` |

Row 2's wording is the §1 delta made readable: **not** "an event this flow emits" — there is no event
registry here — but *work this flow sets off elsewhere*, which is what a webhook, an email send and a
queued job have in common.

## Technical · `CLIENT ENQUIRY — TODAY` · origin `(0, 0)`

Grid identical to the HRMS set: box `280 x 96`, pitch `312`, bands at `origin + 196 / 336 / 496`.
Title bottom `96`, note block `114-172`, band 1 top `196` — the same 100px strip, 24 clear below the note.

| Node | Property | Expected | Returned |
|---|---|---|---|
| Eyebrow `5:30` | font / tracking / pos | DM Mono Medium 12 / +12% / `(0,0)` | `DM Mono/Medium` 12 / `{PERCENT,12}` / `(0,0)` · 319 x 16 · `01 · BOOK A CALL · TECHNICAL · 1 OF 2` |
| Title `5:31` | font / tracking / pos | Manrope ExtraBold 34 / `+0.5px` / `(0,50)` | `Manrope/ExtraBold` 34 / `{PIXELS,0.5}` / `(0,50)` · 437 x 46 |
| Rule `5:32` | lineType / weight / stroke / caps / endpoints | STRAIGHT / 3 / `#0755e9` / NONE-NONE / page | `STRAIGHT` / 3 / `#0755e9` / `NONE/NONE` / `0:1` `(0,32)` to `(64,32)` |
| Note eyebrow `5:36` | heading | `CANNOT` (§14.5) | `CANNOT` · `DM Mono/Medium` 12 `#667899` `(0,114)` 51 x 16 |
| Note body `5:37` | font / lineHeight / width / **noWrap** | Manrope Medium 12 / 18px / 700 / height === 18 x 2 | `Manrope/Medium` 12 / `{PIXELS,18}` / 700 x **36** / `heightIsNumber: true`, `noWrap: true` |
| Band 1 `6:20` | pos / size / fill / stroke | `(0,196)` 280x96 `#ffffff` / `#dce3ee` @1 | as expected · `Visitor · open Work with us` + `navbar.js` |
| Band 1 `6:24` | pos | `(312,196)` | `(312,196)` · `Apply choice screen` + `apply-choice.js` |
| Band 1 `6:28` | pos | `(624,196)` | `(624,196)` · `Visitor · pick Hire talent` + `/apply#hire (no route change)` |
| Band 1 `6:32` | pos | `(936,196)` | `(936,196)` · `Visitor · pick Tell us what you need` + `tally.so/r/GxjYve (new tab)` |
| Spine `6:36 / 6:40 / 6:44` | lineType / stroke / dash / caps | ELBOWED / `#657187` 1.5 / none / NONE-ARROW_LINES | all `ELBOWED` / `#657187` / 1.5 / `[]` / `NONE/ARROW_LINES`, edge text `""` |
| Spine `8:47` | `6:32` RIGHT to circle LEFT | — | `6:32:RIGHT` to `8:39:LEFT`, `ELBOWED` `#657187` 1.5 `[]` |
| Circle `8:39` | shape / size / fill / stroke / pos | ELLIPSE 24x24 / opacity 0 / `#001131` 1.5 / `(1248,232)` | `ELLIPSE` 24x24 / `#ffffff`@**0** / `#001131` @**1.5** / `(1248,232)` |
| Caption `8:42` | font / align / width / pos | Manrope Medium 12 / CENTER / 160 / `(1180,264)` | `Manrope/Medium` 12 / `CENTER` / 160 x 16 / `(1180,264)` · `On tally.so` |
| Caption `8:42` | **ink <= 88** (§2.4) | measured, not counted | **59** — probe node created, width read, node removed |
| Pill `8:43` | shape / size / fill / stroke / pos | ROUNDED_RECTANGLE 360x60 / `#ffffff` / `#c7d0e0` / `(896,496)` | as expected, `weight 1` |
| Pill `8:43` | text | Manrope Medium 14 `#667899` | `Manrope/Medium` 14 `#667899` · `Tally · store submission in Notion (reported)` |
| Pill `8:43` | **ink one line** | <= 328 (360 - 32 padding) | **286** |
| Async `8:51` | stroke / dash / from-to | `#0755e9` 1.5 `[6,4]` / bottom edge to pill top | `#0755e9` 1.5 `[6,4]` `ELBOWED` `6:32:BOTTOM` to `8:43:TOP` |

**Band 2 is empty, and that is the drawing.** §2.2 puts a client-side state swap in band 1, not band 2:
`apply-choice.js` swaps `root` and `hire` with no route change, so it is a property of a band-1 box, not a
step in the spine. With no submit, no handler and no server step, band 2 has nothing to hold. An empty band
is invisible, so **the `CANNOT` note block names it in words** — *Receive the submission — this path has no
submit, no handler and no server step.* The second line carries the finding — *Query the lead from any
Tethr surface — it is captured, in Notion, not here.* **The phrase "static site" appears nowhere on the
canvas**; the claim drawn is about the flow, not the site.

## Plain language · `GETTING IN TOUCH — TODAY` · origin `(0, 796)`

Same structure, same boxes, same arrows, same grid — only the words change.

| Node | Returned |
|---|---|
| Eyebrow `9:47` | `DM Mono/Medium` 12 `{PERCENT,12}` `#667899` `(0,796)` 362 x 16 · `01 · BOOK A CALL · PLAIN LANGUAGE · 2 OF 2` |
| Title `9:48` | `Manrope/ExtraBold` 34 `{PIXELS,0.5}` `#001131` `(0,846)` 484 x 46 |
| Rule `9:49` | `STRAIGHT` 3 `#0755e9` `NONE/NONE` `0:1` `(0,828)` to `(64,828)` |
| Note eyebrow `9:53` | `CANNOT` · `(0,910)` 51 x 16 |
| Note body `9:54` | `Manrope/Medium` 12 `{PIXELS,18}` 700 x **36** · `noWrap: true` |
| Band 1 `10:50 / 10:54 / 10:58 / 10:62` | `(0 / 312 / 624 / 936, 992)` 280x96 `#ffffff` / `#dce3ee` @1, `Manrope/Medium` 14 `#001131` |
| Spine `10:66 / 10:70 / 10:74 / 11:77` | `ELBOWED` `#657187` 1.5 `[]` `NONE/ARROW_LINES` |
| Circle `11:69` | `ELLIPSE` 24x24 `(1248,1028)` `#ffffff`@0 / `#001131` @1.5 |
| Caption `11:72` | `Manrope/Medium` 12 `CENTER` 160 x 16 `(1180,1060)` · `Off our site` · **ink 62** <= 88 |
| Pill `11:73` | `ROUNDED_RECTANGLE` 360x60 `(896,1292)` `#ffffff` / `#c7d0e0` @1, text `Manrope/Medium` 14 `#667899` · `Tally · keep your answers in Notion (reported)` · **ink 295** <= 328 |
| Async `11:81` | `#0755e9` 1.5 `[6,4]` `ELBOWED` `10:62:BOTTOM` to `11:73:TOP` |

**Mirror assertions, returned rather than intended** — every one could have failed:

- `mirrorXMatches: true` — plain box *i* sits at the same `x` as technical box *i* (`[0, 312, 624, 936]`,
  compared against the technical nodes read back by id, not against the numbers the script passed).
- `mirrorGeometry: { circleX: true, circleDy: true, pillX: true, pillDy: true, capX: true, capDy: true }`
  — every tail node is at the identical `x` and exactly `+796` in `y`.
- `identifierLeaks: []` — the plain labels swept for `.js`, `api/`, `#hire`, `tally.so`, dotted call
  syntax, `core/` and `modules/`. Note the sweep **does not** flag `Tally` or `Notion`: they are product
  names a non-technical reader knows, not code identifiers, and the §1 delta needs them to carry the
  external crossing.

## Board-wide checks, at the end of the pass

| Check | Returned |
|---|---|
| Page background | `#f2ede3` |
| Panel padding, **derived from the canvas bbox** (22 non-connector nodes inside it) | left **96** · top **96** · right **96** · bottom **96** |
| Content bbox inside the panel | `(0, 0)` to `(1340, 1352)` |
| Sinks (shapes with out-degree 0) | 7 — `5:6` `5:11` `5:16` `8:39` `8:43` `11:69` `11:73` |
| Unexplained sinks | **1**: `5:6`, the key's own process-step sample — board furniture, which §2.4 excludes. No genuine path end is unmarked. |
| Totals | 51 children · 15 shapes · 15 connectors · 20 texts |

## Stated deviations

1. **The event pill is Manrope, not DM Mono — on both versions.** §3's table gives the pill DM Mono, but
   §4 makes DM Mono mean *this exact string exists in the codebase*, and `Tally · store submission in
   Notion (reported)` is a description of a destination configured in Tally's dashboard — there is no such
   string anywhere. Mono would be **actively lying**, which is the precise defect the plain-language pass
   fixed on 36 nodes. Same cause, same fix. The pill is still unmistakable: §3 names three distinguishers
   and two of them are untouched — capsule silhouette against the square, muted `#667899` label.
2. **Pill 360 x 60, not the 280 the HRMS boxes use.** Measured, not guessed: the label inks at 286, and 280
   would have wrapped it inside a 60px capsule. Both pills on this board are 360, so nothing is
   non-uniform *within* the board; the HRMS board's pills are a different file and are not compared.
3. **Diagram-to-diagram gap 240, not §4's 160.** These are two *versions of one diagram* stacked on one
   page, where the set's convention is to keep them on separate pages. The wider gap is what stops a reader
   taking the mirror for a continuation of the technical spine.
4. **Header-band clearance 105, not 96.** 96 is the floor; the band's lowest ink is the key's last label.
   Not adjusted — recorded.

## Anomalies

1. **`figma.createRectangle()` works in FigJam.** Probed with a `try`/`catch` fallback to a `SQUARE`
   `ShapeWithText`; the `try` branch succeeded and `panelKind` returned `RECTANGLE`. Same class as
   `figma.createPage()` in [checking.md](checking.md) §3 — the vendor framing ("most design nodes are
   blocked in FigJam") is not a reliable guide to any particular node type. **Probe, then write down what
   it did.**
2. **A throw inside the `return` object rolled the entire script back.** A shorthand-property typo
   (`captionLimit88`) threw *after* five nodes had been created. Rather than assume the rollback, the page
   was read: `childCount: 29`, all from prior calls, `probesLeftBehind: []`. Nothing partial on canvas,
   confirmed the same way A1's two `FAIL_INK` typos were. The script was then re-run whole.
3. **The pill was 40px off box 4's centre and no readback could see it.** Every property returned correct;
   the defect was that the elbowed async connector had to jog sideways to reach it. **Caught by screenshot
   only** — the same shape as A1's routing fault and B4's split identifier. Fixed by setting
   `pill.x = box4.centre - 180`; re-read as `centred: true`, and both pills now hang on a straight drop.
4. **Region-crop screenshots do not work, and the technique is retired.** An unfilled `RECTANGLE` sized
   over the mirror half, screenshotted with `{ contentsOnly: false }`, rendered **blank** — the same
   behaviour the brief records for `get_screenshot` on a panel. `await page.screenshot({ scale })` remains
   the only way to composite the ground with the content; it renders the whole page and that is the cost.
5. **The circles' empty text sublayer returns `Inter/Medium` 16 `#000000`.** They carry no characters, so
   nothing renders; recorded so a future uniformity sweep does not read it as a defect.
6. **`shape.text.height` is `undefined` on a FigJam `ShapeWithText`, as §7.1 says.** No box-fit comparison
   was built on it. `textHeightType: "undefined"` was returned explicitly for all four technical boxes so
   the absence is on the record rather than silently skipped, and box fit was checked by eye instead.

## Screenshots spent

Page at `scale 1` after the technical diagram, before the mirror existed (caught anomaly 3) · page at
`scale 0.6`, full-board zoom, after both · the failed crop probe (anomaly 4) · page at `scale 1`, reading
zoom, final. No mid-word wrapping, no collision, no truncation in either version; the `#dce3ee` hairline
still reads as a border on the warm `#faf7f1` panel at both zooms (§16.2 risk 2 — checked, holds). §16.2
risk 1, the `#fdecec` failure fill on a warm ground, **could not be checked here**: this board has no
failure exit.

## Not built, deliberately

**§3 PROPOSED.** On hold in the spec; nothing from it is on this board. No fifth mark meaning "not built
yet" was invented, and none was needed.

---

# BOOK A CALL · KEY — THREE-BAND MINIATURE · 2026-09-29

> Same board, `YNBnqA4Ho6sFWXxfbc1vfn`, page `0:1`. Spec: [process-flow-content.md](process-flow-content.md)
> §1.0.1. Adds the one thing the key was missing — **bands are a layout rule, so nothing on any diagram is
> ever labelled with its band**, and a reader shown these two diagrams had no way to discover that vertical
> position carries meaning. The `CANNOT` note carried the empty spine in words; nothing carried it in the
> picture.

Board before: `childCount: 51`. After: **59** — eight nodes created, five moved, nothing deleted, no
diagram touched.

## Key geometry, re-derived from the canvas before writing

Not taken from the brief and not taken from this log's own earlier table — read back off page `0:1` and
then written against. It agrees with the `The legend` table above: sample column **x 800**, label column
**x 970**, row pitch **56**, label offset **row top + 12**, label type **Manrope Medium 14 / `#001131` /
`{PERCENT,0}` / lineHeight AUTO**, row tops `-456 / -400 / -344 / -288 / -232`.

## The miniature — returned values

Marks are `RECTANGLE` nodes, not `ShapeWithText`: they carry no characters, so the ~18px `ShapeWithText`
floor (§5) would have set the size instead of the design, and the empty-text-sublayer artefact logged as
anomaly 5 of the previous entry does not arise. `figma.createRectangle()` in FigJam was already established
by anomaly 1 of that entry.

| Node | id | Property | Expected | Returned |
|---|---|---|---|---|
| band 1 box | `15:77` | pos / size / fill / stroke / corner | `(800,-560)` 44x20 `#ffffff` / `#dce3ee` @1 / 3 | `(800,-560)` 44x20 `#ffffff@1` / `#dce3ee@1` @1 / **3** |
| band 2 box 1 | `15:78` | pos | `(800,-528)` 44x20 | `(800,-528)` 44x20 `#ffffff@1` / `#dce3ee@1` / 3 |
| band 2 box 2 | `15:79` | pos | `(848,-528)` 44x20 | `(848,-528)` 44x20 `#ffffff@1` / `#dce3ee@1` / 3 |
| band 2 box 3 | `15:80` | pos | `(896,-528)` 44x20 | `(896,-528)` 44x20 `#ffffff@1` / `#dce3ee@1` / 3 |
| band 3 pill | `15:81` | pos / size / stroke / **corner = half height** | `(848,-496)` 44x14 `#c7d0e0` / 7 | `(848,-496)` 44x14 `#ffffff@1` / `#c7d0e0@1` @1 / **7** |
| label 1 | `15:82` | font / size / fill / pos / ink | Manrope Medium 14 `#001131` `(970,-559)` | `Manrope/Medium` 14 `#001131@1` `{PERCENT,0}` `(970,-559)` · **71** x 19 · `the human` |
| label 2 | `15:83` | pos / ink | `(970,-527)` | `(970,-527)` · **150** x 19 · `the synchronous spine` |
| label 3 | `15:84` | pos / ink | `(970,-498)` | `(970,-498)` · **104** x 19 · `the async plane` |

**Derived from the canvas, not asserted:** miniature bbox `(800,-560)` to `(1120,-479)`, **320 x 81** ·
eyebrow-to-miniature gap **32** (the same gap the eyebrow had to row 1) · miniature-bottom-to-row-1-top
**23** · marks' right edge to the label column **30** clear. Longest label ink 150 against the key's
existing longest of 214, so the label column's right extent is unchanged.

**Grid.** Band pitch **32** — chosen for type, not scaled from the diagram. The real bands are 140/160
apart on a 96-tall box; scaled to a 20-tall box that is 24/28, which leaves a 19px label line 5px of air.
Uniform 32 gives 13 and 10. **Legibility of the band labels beat proportional fidelity**, and the miniature
makes no measurement claim — it is an illustration of the grammar.

**Composition: 1 box in band 1, 3 in band 2, 1 pill in band 3.** Four boxes and one pill, which is
§1.0.1's own count with the failure exit removed. 1-then-3 rather than 2-then-2 because it draws **the
ordinary shape** — the human touches the flow once, the system does the work — which is the exact inverse
of what both diagrams on this board show, and the inversion is the point.

**No connectors in the miniature, and this was a decision.** A dashed royal stub from the spine to the pill
would have had 12 visible pixels to render `[6,4]` in — a little over one dash, which reads as a blob. §3
already refuses to put semantic weight on anything that cannot render. The two edge types have their own
key rows below; the miniature's job is band occupancy.

## What moved, and by how much

**Nothing below the miniature moved, and no diagram moved.** The five existing key rows were read back by
id after the write and every one matched its pre-pass position: `5:6 (800,-456)` · `5:10 (970,-444)` ·
`5:11 (800,-400)` · `5:15 (970,-388)` · `5:16 (863,-336)` · `5:19 (970,-332)` · `5:24 (970,-276)` ·
`5:29 (970,-220)`. Connectors `5:20` and `5:25` untouched at `(800,-268)-(950,-268)` and
`(800,-212)-(950,-212)`.

**The key grew upward instead of downward, because downward does not fit.** The header band's lowest ink is
the key's own row-5 label at `-201` and the panel top is `-96` — **105 of clearance, against a 96 floor**.
The miniature occupies 104 including its separation, so pushing the five rows down would have left 1px and
put the key on the panel edge. The only alternative was moving the panel, which moves both diagrams.

| Node | Before | After | Delta |
|---|---|---|---|
| `5:5` KEY eyebrow | `(800,-488)` | `(800,-592)` | **up 104** |
| `4:3` Page eyebrow | `(0,-488)` | `(0,-592)` | up 104 |
| `4:4` Page title | `(0,-438)` | `(0,-542)` | up 104 |
| `4:7` Page title rule (connector) | `(0,-456)`-`(64,-456)` | `(0,-560)`-`(64,-560)` | up 104 |
| `4:5` Page description | `(0,-376)` | `(0,-480)` | up 104 |
| `4:6` Key pointer | `(0,-320)` | `(0,-424)` | up 104 |

**The masthead moved because of a screenshot, not because of arithmetic.** The first build moved only the
KEY eyebrow, leaving the key's top 104 above the masthead's. Nothing collided and every number was correct
— and the shot showed the board's top-left corner empty with the title block floating in the middle of the
header band. The two columns were on a shared top edge at `-488`, which is not a coincidence at that
precision. Moved the masthead the same 104 and re-shot: `topsAligned: true`, both eyebrows at `-592`.

**Band extents, derived after both writes:** top `-592` (was `-488`) · bottom **`-201`, unchanged** ·
clearance to panel **105, unchanged**. The left column's gap below the key pointer grows 208 to 312; that
space was already in the band, below the masthead rather than above it.

## Screenshots spent

Page at `scale 1` after the miniature, before the masthead move (caught the floating masthead) · page at
`scale 1` after it, reading zoom · page at `scale 0.5`, full-board zoom. No collision, no truncation, no
mid-word wrap. At full-board zoom the key reads as one block: eyebrow, the miniature as a tight three-row
stack, a visible but not separating gap, then the five sample rows at their own wider pitch.

## §1.0.1 items that did not fit this board

1. **The failure exit is not in the miniature.** Pre-ruled: this board has no drawable domain failure
   (`failureExitCount: 0`) and the key has no failure row, so a miniature showing one would teach a reader
   to look for a mark that is nowhere on the board.
2. **"Labelled to the left" was inverted to the key's label column.** §1.0.1 puts the band meanings left of
   the miniature; this key puts every sample at x 800 and every label at x 970. Following §1.0.1 literally
   would have swapped the two columns for three rows only, so the key would have read as two instruments.
   Row-alignment does the attaching either way. **The key's own convention won; §1.0.1's wording predates
   it.**
3. **§1.0.1's item 4, the line on type, has no content here.** *DM Mono means this exact string exists in
   the codebase* — and on this board no diagram label is in DM Mono at all. The pill is Manrope by stated
   deviation 1 of the entry above, and the only mono on the canvas is the eyebrows. A type row would state
   a rule the board does not exercise.
4. **§1.0.1's item 5, the section-label motif shown once, is not built.** Out of scope for this pass, not
   ruled against. Recorded so it is not mistaken for a decision.

## Rules needed and where they were looked for

| Rule needed | Found unaided | Where looked first | Note |
|---|---|---|---|
| **The key's own row geometry** — sample column, label column, row pitch, label offset within a row | no | `diagram-language.md` §8 — **it is not there** | §8 gives the legend's purpose, the every-mark rule and the frame/wash adjacency, and **no geometry at all**. The numbers exist only in this log's `The legend` table, and were then re-derived off the canvas. Same shape as the standing-note-block gap logged in the entry above: the grammar doc does not describe the one artefact it calls the reference copy. |
| **Which side a key row's label sits on** | conflict, unresolved by any doc | `process-flow-content.md` §1.0.1 against the canvas | §1.0.1 says left, the built key says right. Nothing anywhere ranks a spec written before an artefact against the artefact. Resolved on the one-block test; recorded above as deviation 2. |
| **Whether a legend sample may be a plain `RECTANGLE`** | yes, by inference | `diagram-language.md` §5 | §5's ~18px floor is stated for `ShapeWithText` specifically. That it does not bind a `RECTANGLE` is an inference from the node type, not a rule anyone wrote. |
| Header-band clearance floor (96) | yes | `diagram-build-log.md` | Only in this log, in the entry above. Not a grammar rule; treated as one here because it is the only number that constrains where the key may grow. |

## Anomalies

1. **A read-only probe threw on `node.shapeType` for a `RECTANGLE`.** The panel `4:2` is a `RECTANGLE`, and
   `shapeType` exists on `SHAPE_WITH_TEXT` only — the error is a hard property-access failure, not
   `undefined`. Guarded with `'shapeType' in n` and re-run. **No nodes were created by the failed call**,
   and the retry read `childCount: 51`, the pre-pass figure, which is the evidence rather than the
   assumption — the previous entry's anomaly 2 is why that was checked instead of presumed.
2. **The first canvas read silently dropped all three connectors.** `connectorStart.endpointNodeId` is
   `"0:1"` — the page — **and** `position` is set, so an `endpointNodeId ? … : position` branch took the
   node arm and returned no coordinates. The filter then dropped them from the header band as having no y.
   A readback that quietly returns nothing for a whole node class is §7.1's false pass in miniature: the
   call looked clean. Re-read explicitly by id; `4:7`, `5:20` and `5:25` all confirmed. **On this board a
   floating rule is attached to the page and positioned — read both fields, never one or the other.**
3. **No leftover-node filter was run and none is claimed.** This pass created eight nodes, all returned by
   id and all read back; the count went 51 to 59 with no unexplained delta. The name-heuristic probe filter
   logged as a false positive twice in the entries above was deliberately not used.
4. **The band-2 emptiness is now teachable, not self-evident.** Honest limit, recorded rather than claimed
   away: the miniature establishes that the middle row means the synchronous spine, but a reader still has
   to carry that onto a diagram 750px below, where the band-2 y-position holds nothing and is therefore
   invisible. What makes it land is the long dashed drop from band 1 straight past band 2 to the pill —
   the miniature now names what that drop skips. **The `CANNOT` note is still doing the decisive work in
   words.**

---

# BOOK A CALL · PROPOSED, two versions · 2026-09-29

> Same board, `YNBnqA4Ho6sFWXxfbc1vfn`, page `0:1`. Spec: [booking-flow-content.md](booking-flow-content.md)
> §3 (the flow), §4.0 (the store and the `CANNOT` line), §4.1 (the two kinds of write), §4.7 (the email).
> Grammar: [diagram-language.md](diagram-language.md). **Everything above the `BOARD: TETHR — BOOK A CALL`
> heading is the HRMS board; node ids are not comparable across the two files.**

Board before: `childCount: 59`. After: **125** — 66 created, 18 moved, 3 mutated in place, nothing deleted,
**no existing diagram touched**.

## The brief changed mid-pass, and it cost nothing

The pass was briefed to draw the lead written on submit as **our amendment** to the owner's described order,
with the departure carried in the diagram's description line. Between reading the spec and writing the first
node, the owner ruled on the ordering himself and §3/§4.1 were rewritten: the order is now **his**, the
second write became a **band-3 fire-and-forget** rather than a spine step, the store was consolidated into
one box, and the `CANNOT` line was reworded to say the Notion gap is scheduled rather than missed.

**Rework cost: zero.** The change landed after the spec was read and before any `use_figma` write. Recorded
because "how much of a brief change lands as rework" is only answerable if the cases where it is free are
written down too — and the reason it was free is §7's incremental rhythm, not luck: the planning had been
done in prose, and prose is cheap to throw away.

**The departure note was removed from the plan, not from the canvas** — it was never drawn.

## What §3 says and what the canvas holds

§3 lists nine numbered steps. **Eight of them are on the canvas; one is not a box, deliberately.**

| §3 | On canvas |
|---|---|
| 1 Client fills the form | band 1, col 0 |
| 2 Client-side validation | **not its own box.** Folded into the band-1 form box as line 3, `Required fields must pass to submit` |
| 3 `api/lead · capture the enquiry` | band 2, col 1 — the one box that names the store |
| 4 `Google Calendar · present availability` | band 2, col 2 |
| 5 Client picks a slot | band 1, col 3 |
| 6 `Google Calendar · create event` | band 2, col 4 |
| 7 `Google Calendar · email the client` | **band 3 pill**, not a spine box, per §3's own band-3 paragraph |
| 8 Confirmation screen | band 1, col 5 |
| band 3 `attach the slot` | band 3 process box, col 5, dashed royal off step 6 |

**Step 2 is a property of a band-1 box, not a step in the spine**, on this board's own precedent: the
previous entry put `apply-choice.js`'s client-side state swap in band 1 for exactly this reason, and §2.2
collapses a client-side wizard into one band-1 box. §2.1 independently forbids a band-3 exit for
required-field validation, so the box would have had nothing hanging off it. Phrased as a constraint per
§2.0 fix 2 — **"must" carries the check where no red arrow does.**

**§3's band-3 label `Notion · attach the slot to the enquiry` was not used.** §4.0's ruling — *keep the store
in one box, every write through `api/lead`* — makes `Notion` in subject position wrong: it would put the
store in a second node and cost the Supabase migration a redraw. Drawn as
`api/lead · attach the slot` / `Updates the same enquiry row`, with Notion named only in the col-1 box.
The two directives are in the same document and disagree; §4.0 is the later and more specific, and it is the
one whose violation is expensive.

**"Fire-and-forget off step 6" versus "off the confirmation".** §3 says step 6; the coordinating brief said
"off the confirmation" twice. Drawn **off step 6** (`Google Calendar · create event`), which is §3's explicit
word and the honest mechanism — the server both returns to the confirmation screen and fires the attach, so
the two race each other, which is exactly what §4.1 means by *"genuinely concurrent ... against the
confirmation screen"*. Hanging it off the confirmation screen would have said the browser triggers it.

## Geometry

Grid as the previous entry: box `280 x 96`, pitch `312`, box gap `32`, diagram-to-diagram `240`.
**Bands at origin `+252 / +392 / +552`** — 140 and 300 from band 1, per §1, unchanged; the origin-to-band-1
offset is 56 deeper than TODAY's `+196` because PROPOSED carries a description line TODAY does not.

| Element | Offset from diagram origin | Derivation |
|---|---|---|
| eyebrow / rule / title | `+0 / +32 / +50` | the motif, unchanged |
| description | `+112` | title bottom `96` + **16**, the masthead's own title-to-description gap |
| `CANNOT` eyebrow | `+170` | description bottom `152` + **18**, TODAY's title-to-note gap |
| `CANNOT` body | `+192` | eyebrow bottom + 6, as TODAY |
| band 1 | `+252` | note bottom `228` + **24**, as TODAY |

Technical origin `(0, 1592)` = TODAY plain's bottom `1352` + 240. Plain origin `(0, 2480)` = technical's
bottom `2240` + 240. **Mirror offset 888**, asserted against nodes read back by id, not against the numbers
passed in.

## The description line — furniture that did not exist where the brief said it did

The brief located the departure note in *"the diagram's description line, under the title — the established
furniture that TODAY already uses for its one-line description."* **TODAY has no diagram-level description
line.** Read off the canvas before drawing: both TODAY diagrams run eyebrow → rule → title → `CANNOT`, and
the only description on the board is the **page** masthead's, `4:5`. The furniture exists; its scope did not.

Instantiated at diagram scope with the page description's exact returned type spec —
`Manrope/Medium` 14 / `{PIXELS,20}` lineHeight / `#667899` / `textAutoResize: HEIGHT`, width **700** to match
the note block's column rather than the masthead's 640. Both descriptions returned height **40**, two lines,
which is what the `+252` band-1 offset was computed against and it could have failed.

## Page furniture — returned values

| Node | Property | Before | Returned after |
|---|---|---|---|
| Panel `4:2` | size | `1532 x 1544` | **`2156 x 3320`** at `(-96,-96)`, page index **0** |
| Panel `4:2` | padding, derived from the bbox of 60 non-connector nodes | 96 / 96 / 96 / 96 | **96 / 96 / 96 / 96**, content bbox `(0,0)`–`(1964,3128)` |
| Page eyebrow `4:3` | y | `-592` | `-648` |
| Page title `4:4` | y | `-542` | `-598` |
| Page rule `4:7` | endpoints | `(0,-560)`–`(64,-560)`, `endpointNodeId "0:1"` | `(0,-616)`–`(64,-616)`, `endpointNodeId "0:1"`, `STRAIGHT` 3 `#0755e9` `NONE/NONE` |
| Page description `4:5` | y / text | `-480` / "…as it runs today… One diagram in two versions" | `-536` / **"The client enquiry path on tethrhq.com — as it runs today, and as proposed. Two diagrams, each in two versions: technical above, plain language below."** · 640 x **40**, still two lines |
| Key pointer `4:6` | y | `-424` | `-480` |
| Header band | bottom ink / clearance to panel | `-201` / 105 | **`-201` / 105, unchanged** |

**The page description was rewritten because the board falsified it.** It said *one diagram in two
versions*; the board now holds two diagrams in two versions each. A masthead that describes the wrong board
is the cheapest kind of wrong claim to leave behind and the hardest to notice, because nobody re-reads
furniture.

## The key — one row gained, everything else proved untouched

**The key grew upward again, for the same reason as last time.** Pushing five rows down 56 would have left
the last label at `-145` against a panel top of `-96` — inside the 96 floor. So rows 1–2 and the miniature
moved up 56 and **the new row was slotted into the space they vacated**: nothing below row 2 moved at all,
and the band bottom stayed at `-201`.

| Row | Sample | Returned | Label | Returned | Wording |
|---|---|---|---|---|---|
| eyebrow | `5:5` | `(800,-648)` | — | — | `KEY` |
| miniature band 1 | `15:77` | `(800,-616)` 44x20 | `15:82` | `(970,-615)` 71x19 | `the human` |
| miniature band 2 | `15:78/79/80` | `(800/848/896,-584)` 44x20 | `15:83` | `(970,-583)` 150x19 | `the synchronous spine` |
| miniature band 3 | `15:81` | `(848,-552)` 44x14 | `15:84` | `(970,-554)` 104x19 | `the async plane` |
| 1 process step | `5:6` | `(800,-512)` 150x40 | `5:10` | `(970,-500)` 111x19 | `a step in the flow` |
| 2 event pill | `5:11` | `(800,-456)` 150x40 | `5:15` | `(970,-444)` 214x19 | `work this flow sets off elsewhere` |
| **3 failure exit (new)** | **`22:77`** | **`(800,-400)` 150x40 · SQUARE · `#fdecec` / `#f1b4b4` @1 · corner 3 · 0 characters** | **`22:81`** | **`(970,-388)` 188x19 · `Manrope/Medium` 14 `#001131` `{PERCENT,0}`** | **`a failure, and what to do next`** |
| 4 end of path | `5:16` | `(863,-336)` 24x24 | `5:19` | `(970,-332)` 110x19 | `a path ends here` |
| 5 sync edge | `5:20` | `(800,-268)`–`(950,-268)` | `5:24` | `(970,-276)` 88x19 | `the next step` |
| 6 async edge | `5:25` | `(800,-212)`–`(950,-212)` | `5:29` | `(970,-220)` 198x19 | `a consequence, not waited for` |

Row pitch **56** throughout, sample column **800**, label column **970**, label offset **row top + 12** —
§8's recorded geometry, obeyed without re-deriving it this time because §8 now carries it.

**The label wording is not §1.0.1's.** §1.0.1 gives the failure exit as *"this flow can end here"*; the key's
own voice is what each mark **does** (`a step in the flow`, `work this flow sets off elsewhere`), and §2
requires every exit to say what the actor does next. `a failure, and what to do next` teaches both halves.
Ink **188** against the key's existing longest **214**, so the label column's right extent is unchanged.

**Nothing crept in, proved rather than assumed.** All 21 key nodes read back by id — `keyMissing: []`. A
sweep for anything at `x >= 780, y < -96` **not** on that list returned `keyBandStrays: []`. Position-by-
position, every pre-existing row matched its recorded value plus the 56 shift, and rows 4–6 matched their
pre-pass values exactly.

**Row 3 earns its place by census, not by intent:** `failureExitCount: 7` — six on the diagrams and the key's
own sample. Every mark on the board has a key row and every key row has a mark on the board.

## Technical · `CLIENT ENQUIRY — PROPOSED` · origin `(0, 1592)`

| Node | id | Returned |
|---|---|---|
| Eyebrow | `23:79` | `DM Mono/Medium` 12 `{PERCENT,12}` `#667899` `(0,1592)` 319x16 · `02 · BOOK A CALL · TECHNICAL · 1 OF 2` |
| Rule | `23:80` | `CONNECTOR` `STRAIGHT` 3 `#0755e9` `NONE/NONE` · `endpointNodeId "0:1"` `(0,1624)`–`(64,1624)` |
| Title | `23:84` | `Manrope/ExtraBold` 34 `{PIXELS,0.5}` `#001131` `(0,1642)` **511**x46 · `CLIENT ENQUIRY — PROPOSED` |
| Description | `23:85` | `Manrope/Medium` 14 `{PIXELS,20}` `#667899` `(0,1704)` 700x**40** `HEIGHT` |
| Note eyebrow | `23:86` | `CANNOT` · `DM Mono/Medium` 12 `(0,1762)` 51x16 |
| Note body | `23:87` | `Manrope/Medium` 12 `{PIXELS,18}` `#001131` `(0,1784)` 700x**36** `HEIGHT` |
| band 1 · form | `24:82` | `(0,1844)` 280x96 `#ffffff@1` / `#dce3ee` @1 / corner 6 · `Client · fill the booking form` / `tethrhq.com (one page)` / `Required fields must pass to submit` |
| band 2 · capture | `24:86` | `(312,1984)` · `api/lead · capture the enquiry` / `Writes the lead to Notion on submit` |
| band 2 · availability | `24:90` | `(624,1984)` · `Google Calendar · present availability` |
| band 1 · pick | `24:94` | `(936,1844)` · `Client · pick a slot` |
| band 2 · create event | `24:98` | `(1248,1984)` · `Google Calendar · create event` / `The booking exists from here` |
| band 1 · confirmation | `24:102` | `(1560,1844)` · `Confirmation screen` |
| End of path | `24:106` | `ELLIPSE` 24x24 `(1872,1880)` `#ffffff@0` / `#001131` @1.5 |
| End caption | `24:109` | `Manrope/Medium` 12 `CENTER` 160x16 `(1804,1912)` · `Call booked` · **ink 65** ≤ 88 |
| band 3 · submit rejected | `25:96` | `(312,2144)` 280x96 `#fdecec@1` / `#f1b4b4` @1 · text `#e03131` · `Submit rejected — nothing saved yet;` / `show an error and let them retry` |
| band 3 · calendar unavailable | `25:100` | `(624,2144)` · `Calendar unavailable — the lead is` / `already saved; follow up by email` |
| band 3 · slot taken | `25:104` | `(936,2144)` · `Slot taken between offer and` / `confirm — pick another` |
| band 3 · pill | `25:108` | `ROUNDED_RECTANGLE` **280x60** `(1248,2144)` `#ffffff` / `#c7d0e0` @1 corner 24 · `Manrope/Medium` 14 `#667899` · `Google Calendar · email the client` |
| band 3 · attach | `25:112` | `SQUARE` `(1560,2144)` 280x96 `#ffffff` / `#dce3ee` · `api/lead · attach the slot` / `Updates the same enquiry row` |
| End of path, async | `25:116` | `ELLIPSE` 24x24 `(1872,2180)` `#ffffff@0` / `#001131` @1.5 · **no caption** |

**Connectors** `25:128 25:132 25:136 25:140 25:144 25:148` spine · `25:152 25:156 25:160` failure ·
`25:164 25:168` async · `25:172` async end stub. All `ELBOWED`, all `NONE/ARROW_LINES`, all attached by
`endpointNodeId` + `magnet` (`allAttachedByNode: true`). Spine and stub `#657187` 1.5 `[]`; failure
`#e03131` 1.5 `[]`; async `#0755e9` 1.5 `[6,4]`.

**Ink measured, not counted** — 20 probe text nodes created at `Manrope/Medium` with the shape's own
`{PERCENT,-1.1}` tracking, width read, every node removed. Every line ≤ **248** (280 less 32 padding);
widest **238** (`Submit rejected — nothing saved yet;`). `inkAllFit: true`, `inkChecksRan: 20`.
`shape.text.height` returned `"undefined"` for every box, as §7.1 says, so **no box-fit comparison was built
on it** — the fit claim rests on the probes and the screenshots.

**Derived after the write, not asserted:** band-3 row gaps `[32,32,32,32]`, every band-3 node **directly
beneath its source box**, pill centre `1388` === create-event centre (`pillCentredUnderCreateEvent: true`),
both circles centred on their band's cross axis, caption centred on its circle.

## Plain language · `GETTING IN TOUCH — PROPOSED` · origin `(0, 2480)`

Same structure, same boxes, same arrows, same grid — only the words change.

| Node | id | Returned |
|---|---|---|
| Eyebrow | `26:144` | `(0,2480)` 362x16 · `02 · BOOK A CALL · PLAIN LANGUAGE · 2 OF 2` |
| Rule | `26:145` | `STRAIGHT` 3 `#0755e9` `NONE/NONE` `0:1` `(0,2512)`–`(64,2512)` |
| Title | `26:149` | `Manrope/ExtraBold` 34 `{PIXELS,0.5}` `(0,2530)` **558**x46 |
| Description | `26:150` | 700x**40** `HEIGHT` · `How booking a call would work — you fill in our form, we save your details straight away, then you pick a time and it goes in the diary.` |
| Note eyebrow / body | `26:151` / `26:152` | `(0,2650)` 51x16 · `(0,2672)` 700x**36** |
| Spine boxes | `26:153 26:157 26:161 26:165 26:169 26:173` | `(0/312/624/936/1248/1560, 2732 or 2872)` 280x96 |
| Circle / caption | `26:177` / `26:180` | `(1872,2768)` 24x24 · `(1804,2800)` 160x16 `Call booked` ink **66** |
| band 3 | `27:161 27:165 27:169 27:173 27:177` | `(312/624/936/1248/1560, 3032)`, pill 280x60 |
| Circle, async | `27:181` | `(1872,3068)` 24x24 |
| Connectors | `27:193 … 27:237` | 7 spine `#657187`, 3 red `#e03131`, 2 royal `[6,4]` |

**Mirror assertions, returned rather than intended** — each read the technical node back by id and each
could have failed:

- `mirrorXAllMatch: true` and `mirrorDyAll888: true` for all **six** spine boxes, both circles, the caption,
  all **five** band-3 nodes and all **twelve** connectors — 26 node pairs.
- `mirrorSizeAllMatch: true` for band 3, so the 60-tall pill mirrors a 60-tall pill.
- `mirrorShapeAllMatch: true` for the connectors — every routed elbow has the identical bbox 888 lower,
  which is the only evidence that FigJam routed the two fans the same way.
- `identifierLeaks: []` across 14 plain strings, swept for `.js`, `api/`, `#hire`, `tally.so`, **`tethrhq`**,
  `core/`, `modules/` and dotted call syntax. `Notion`, `Supabase` and `Google Calendar` are deliberately not
  in the sweep: they are product names a non-technical reader knows, and §1's delta needs them to carry the
  external crossing. `tethrhq` **is** in the sweep, and the plain form box says `One page, on our own site`.
- Ink: every plain line ≤ 248, widest **244** (`Google Calendar · show you free times`) — 4px of margin,
  confirmed on one line by screenshot rather than left on the arithmetic.

## Board-wide checks, at the end of the pass

| Check | Returned |
|---|---|
| Page background | `#f2ede3` |
| Totals | **125** children · 42 shapes · 41 connectors · 36 texts · 6 rectangles |
| Shape census | `SQUARE 30` · `ROUNDED_RECTANGLE 5` · `ELLIPSE 7` |
| `failureExitCount` (`#fdecec`) | **7** — 6 diagram + 1 key sample |
| `washCount` / `boundaryFrameCount` / `#e7efff` fills | **0 / 0 / 0** |
| Edges | solid **34** / dashed **7** · `#657187` 23 · `#0755e9` 12 · `#e03131` 6 |
| Sinks (shapes with out-degree 0) | **20** |
| Unexplained sinks | **1** — `5:6`, the key's own process-step sample. Board furniture, which §2.4 excludes. Every genuine path end is marked. |
| Panel padding | 96 / 96 / 96 / 96 |
| Header band | top `-648` · bottom `-201` · clearance to panel **105** |

## Stated deviations

1. **PROPOSED's pills are 280 wide; TODAY's are 360.** Measured, not guessed: `Google Calendar · email the
   client` inks at **214** and its plain mirror at **213**, both comfortably inside 280's 248. The 360 was
   justified in the previous entry by a 286 ink; at 214 it would buy nothing and would cost the thing that
   matters more here — **every band-3 node sits in its own 280 column directly beneath its source box**, four
   uniform 32px gaps, which is what makes a five-object band 3 readable at all. Uniformity within a *row*
   beat uniformity across *diagrams*.
2. **The pills are Manrope, not §3's DM Mono** — carried forward from the previous entry's deviation 1, same
   cause: `Google Calendar · email the client` is not a string in any repository, and the flow it describes is
   not built. Mono would claim otherwise. Capsule silhouette and the muted `#667899` label still distinguish it.
3. **The band-3 `attach the slot` box is a process box, not a pill.** §1's delta justifies a pill by a real
   webhook, email send or queued job. A write is none of those; it is a consequence *step*, reached by a
   dashed royal edge. The dash is on the relationship, which is §3's own rule.
4. **PROPOSED's band 1 sits at origin `+252`, TODAY's at `+196`.** The 56 is the description line TODAY does
   not carry. Band *spacing* (140 / 300) is identical, which is the part the grammar rules.
5. **Diagram-to-diagram gap 240, not §4's 160** — unchanged from the previous entry, same reason.
6. **Header-band clearance 105, not 96** — unchanged; 96 is a floor and the band bottom is set by the key.

## Anomalies

1. **The panel was grown to the wrong width first, and the readback caught it.** Sized to `2088` against a
   predicted content right edge of `1896` (the terminator circle). The derived padding came back **28**, not
   96: the right edge is set by the **end-caption text nodes**, 160 wide and centred on a 24px circle, so they
   overhang it by 68. Corrected to `2156`; padding re-derived as 96/96/96/96 and the offending nodes named in
   the return (`whatSetsTheRightEdge: [24:109, 26:180]`). **The previous entry's content bbox had the same
   shape** — `maxX 1340` is TODAY's caption right edge, not its circle — so the number to predict was on the
   record and was still mispredicted. **Derive the bbox; do not compute it from the shapes you think matter.**
2. **A region crop DOES work when the rectangle is filled.** The previous entry retired region crops after an
   *unfilled* `RECTANGLE` rendered blank. `await panel.screenshot({ contentsOnly: false })` on the act panel
   `4:2` — a filled `#faf7f1` rectangle — **composited all four diagrams at reading zoom**, which
   `page.screenshot()` can no longer do now the page is 3776 tall and the returned image is capped near
   1080px. The retirement was one case too broad: **the fill is what the renderer needs, not the node type.**
3. **Three connectors off one magnet would have muddied the colour, and it changed the drawing.** The first
   layout hung the slot-taken failure exit, the email pill **and** the attach box off `create event`'s BOTTOM.
   Two dashed royals from one magnet share their trunk and read as a clean fan; adding a red one puts red and
   dashed blue on the same 32px segment in the 64px corridor between bands 2 and 3. **No readback can see
   that** — every property would have returned correct, exactly as with the previous entry's off-centre pill.
   Resolved by hanging the slot-taken exit on **step 5** (`Client · pick a slot`) instead, which §4.4's own
   wording supports — *"slot taken while you were choosing — pick another"* — and which leaves every failure
   exit straight below its source. **The alternative reading is on the record: the create-event call is what
   mechanically discovers the race, and hanging it on step 6 is defensible.** It was traded for legibility
   with the trade written down, not resolved.
4. **The brief located a piece of furniture that does not exist.** See the description-line section above.
   Not drawn around and not invented past: the *style* was taken from the page description verbatim and
   instantiated at a new scope. Recorded because the brief will be read again.
5. **No leftover-node filter was run and none is claimed.** 66 nodes created, every one returned by id and
   read back; `childCount` went 59 → 125 with no unexplained delta. The 20 + 20 ink probes were removed inside
   the same script and the count proves it. The name-heuristic filter logged as a false positive three times
   above was deliberately not used.
6. **The circles' empty text sublayer still returns `Inter/Medium` 16 `#000000`** — carried forward; they
   carry no characters, so nothing renders.

## Screenshots spent

Page at `scale 0.9` after the technical version, before the mirror existed — read the fan off `create event`,
the band-1/band-2 zig-zag and the new pink key row · page at `scale 0.45`, full-board · panel `4:2` at
`scale 0.6` with `contentsOnly: false`, reading zoom, all four diagrams (anomaly 2). **No mid-word wrapping,
no truncation, no collision in either version.** The `#fdecec` failure fill on the warm `#faf7f1` panel —
§16.2 risk 1, which the previous entry **could not check because this board had no failure exit** — now reads
as an unmistakably pink card with a salmon edge at both zooms. **Checked, holds.**

## Does the band-2 contrast land? — full-board read

**Yes, and it is now the first thing the board says.** At full-board zoom TODAY is a single horizontal row of
four boxes with a long dashed drop past nothing to a lone pill; PROPOSED is a dense zig-zag across two rows
with a five-object band 3 under it. The eye does not need to know what a band *is* to see that one drawing
has a middle and the other does not.

**The honest limit, carried forward from the previous entry's anomaly 4 and now partly discharged.** That
entry recorded that band-2 emptiness was teachable but not self-evident, because a reader had to carry the
miniature's meaning 750px down to a y-position holding nothing. PROPOSED fixes the harder half: the reader no
longer has to imagine what band 2 would look like occupied — it is on the same page, 240px below. What
remains is that the two diagrams' band-1 offsets differ by 56, so the comparison is of *shape*, not of a
shared ruler. That is the right comparison and no ruler was ever drawn, but it is worth stating that the
contrast is read, not measured.

## Rules needed and where they were looked for

| Rule needed | Found unaided | Where looked first | Note |
|---|---|---|---|
| **A per-diagram description line — its existence, position and type** | **no** | `diagram-language.md` §4 (the type table and the section-label motif), then the canvas | §4 specifies the eyebrow-rule-title stack and says nothing about a description under it. `process-flow-content.md` has one hit for "description" and it is the act index. **The device exists on this board as page furniture only**, and the brief described it as diagram furniture. Resolved off the canvas, from `4:5`'s returned properties. **This is the navigability gap of the pass** — the same shape as the standing note block and the key geometry before it: a device that is on the artefact and in no document. |
| Which band a client-side validation step belongs in | yes, after reconciling three places | `diagram-language.md` §1 band table | The table alone points at band 2 ("guards"); §2.2 and **this log's previous entry** together point at band 1 as a property of the form box. The deciding sentence is in the build log, not the grammar. |
| Whether a band-3 consequence step takes a §2.4 terminator | yes | `diagram-language.md` §2.4 | Ruled by the exclusion list — failure exits, pills and flow 10 are excluded, and a consequence *box* is not. B5's bare-circle precedent settles the caption. Clean; no inference needed. |
| Failure-exit fill / stroke / text hexes | yes | `diagram-language.md` §3 | The six-mark table. **No size is specified anywhere for a failure exit**; `280 x 96` was taken from the process box, since §3 calls it a square and the grid gives the square. Recorded as a choice, not a rule. |
| Key row geometry (sample 800, label 970, pitch 56, offset +12) | **yes** | `diagram-language.md` §8 | **Found immediately** — §8 gained these numbers on 2026-09-29 precisely because the previous pass could not find them. First time in this log that a findability gap logged by one pass was closed before the next needed it. Worth noting as the mechanism working. |

---

# BOOK A CALL · PROPOSED — the slot-taken exit re-hung on `create event` · 2026-09-29

> Same board, `YNBnqA4Ho6sFWXxfbc1vfn`, page `0:1`. **One change, applied to both PROPOSED versions.**
> Neither TODAY diagram was touched; the HRMS board was not opened.

**This reverses anomaly 3 of the entry above, deliberately and with the reason named.** That pass hung
`Slot taken between offer and confirm — pick another` on **step 5** (`Client · pick a slot`) to keep red
and dashed royal off one magnet, and wrote the alternative reading down rather than resolving it. The
alternative is the rule: §2 of [diagram-language.md](diagram-language.md) hangs an exit on the box that
**raises** the error, and the create call is what raises this one — that box's own second line says *"The
booking exists from here."* A1 hangs *already founded a workspace* on the workspace guard, not the sign-up
form; C6 hangs *insufficient balance* on the balance guard, not the request step. Same pattern.

The counter-argument was re-weighed and rejected: the label says *"pick another"*, so hanging it on
pick-a-slot makes the loop legible — but that ranks **where the reader goes next** above **where the failure
happened**, and every other diagram in both sets answers the second question.

**The obstruction was destination occupancy, not corridor crowding.** The space directly below create-event
held the email pill, so a red drop from create-event would have landed on it. The fix is a shift, not a
reroute: band 3's tail moves right one 312 pitch, the red exit takes the bottom corridor alone, and the two
dashed royal connectors move to create-event's **right** edge.

Board before: `childCount: 125`. After: **125** — nothing created, nothing deleted, **8 nodes moved, 6
connectors re-sourced, the panel resized**.

## What moved — before and after, read back by id

### Technical · `CLIENT ENQUIRY — PROPOSED`

| Node | id | Before | After |
|---|---|---|---|
| band 3 · slot taken | `25:104` | `(936, 2144)` 280x96 | **`(1248, 2144)`** 280x96 |
| band 3 · email pill | `25:108` | `(1248, 2144)` 280x60 | **`(1560, 2144)`** 280x60 |
| band 3 · attach the slot | `25:112` | `(1560, 2144)` 280x96 | **`(1872, 2144)`** 280x96 |
| band 3 · terminator | `25:116` | `(1872, 2180)` 24x24 | **`(2184, 2180)`** 24x24 |

### Plain language · `GETTING IN TOUCH — PROPOSED`

| Node | id | Before | After |
|---|---|---|---|
| band 3 · someone took that time | `27:169` | `(936, 3032)` 280x96 | **`(1248, 3032)`** 280x96 |
| band 3 · email pill | `27:173` | `(1248, 3032)` 280x60 | **`(1560, 3032)`** 280x60 |
| band 3 · we add your time | `27:177` | `(1560, 3032)` 280x96 | **`(1872, 3032)`** 280x96 |
| band 3 · terminator | `27:181` | `(1872, 3068)` 24x24 | **`(2184, 3068)`** 24x24 |

**`y` is unchanged on all eight** (`yUnchanged: true`), and no spine box, circle or caption moved in either
version. Node ids for the mirror were **re-derived off the canvas**, not assumed from the technical set.

## The re-sourced connector, and the two that changed edge

| Connector | Was | Now | Returned bbox |
|---|---|---|---|
| `25:160` red exit | `24:94` (`Client · pick a slot`) **BOTTOM** → `25:104` TOP | **`24:98` (`Google Calendar · create event`) BOTTOM** → `25:104` TOP | `(1076,1944)` 0x197 → **`(1388,2084)` 0x57** |
| `25:164` dashed royal | `24:98` **BOTTOM** → `25:108` TOP | `24:98` **RIGHT** → `25:108` TOP | `(1388,2084)` 0x57 → **`(1532,2032)` 168x108** |
| `25:168` dashed royal | `24:98` **BOTTOM** → `25:112` TOP | `24:98` **RIGHT** → `25:112` TOP | `(1388,2084)` 312x57 → **`(1532,2032)` 480x108** |
| `27:225` red exit | `26:165` **BOTTOM** → `27:169` TOP | **`26:169` (`Google Calendar · book the call`) BOTTOM** → `27:169` TOP | `(1076,2832)` 0x197 → **`(1388,2972)` 0x57** |
| `27:229` dashed royal | `26:169` **BOTTOM** → `27:173` TOP | `26:169` **RIGHT** → `27:173` TOP | `(1388,2972)` 0x57 → **`(1532,2920)` 168x108** |
| `27:233` dashed royal | `26:169` **BOTTOM** → `27:177` TOP | `26:169` **RIGHT** → `27:177` TOP | `(1388,2972)` 312x57 → **`(1532,2920)` 480x108** |

Every stroke re-read after the write: red `#e03131` 1.5 `[]`, dashed royal `#0755e9` 1.5 `[6,4]`, all
`ELBOWED`, all attached by `endpointNodeId` + `magnet`. `redStillRed: true`, `dashedPairStillDashed: true`
on both versions.

**The corridor claim, proved by sweep rather than by eye alone.** Every connector leaving `24:98` was
enumerated: `25:144` spine **RIGHT** → confirmation · `25:160` red **BOTTOM** → slot taken · `25:164`
dashed **RIGHT** → pill · `25:168` dashed **RIGHT** → attach. **The bottom magnet now carries exactly one
edge, and it is the red one.** Identical enumeration off `26:169` in the mirror. The sweep off the old
source came back with one connector each — `24:94` → `25:140` spine only, `26:165` → `27:205` spine only —
so nothing was left hanging on pick-a-slot.

**The red exit now drops 57px instead of 197.** It leaves band 2 and lands in band 3 without passing a band
it does not belong to; the old routing fell from band 1 straight past an occupied band 2.

**`slotTakenDirectlyUnderCreateEvent: true`** — centre `1388` on both nodes, derived from the two boxes
rather than from the numbers passed in.

## Band 3 after the shift — and the gap that appeared

Row gaps, derived: `[32, 344, 32, 32]`. **The 344 is the column the exit vacated, and it is now correct
rather than a hole.** Column `936` holds a band-1 box (`Client · pick a slot`) and nothing in band 2 —
that column has no synchronous step, so it can raise no failure and band 3 has nothing to put there.
**The empty band-3 column now matches the empty band-2 column exactly**, which is more coherent than the
arrangement it replaces, where a red arrow fell 197px from band 1 across an occupied band 2.

The previous entry justified four uniform 32 gaps as *"what makes a five-object band 3 readable at all"*.
That still holds for the four objects that hang off band-2 boxes; the fifth gap is structure, not a
spacing failure.

## The panel — re-derived, not extrapolated

| | Before | After |
|---|---|---|
| Panel `4:2` | `(-96,-96)` **2156 x 3320**, page index 0 | `(-96,-96)` **2400 x 3320**, page index 0 |
| Content bbox (60 non-connector nodes at `y >= -96`) | `(0,0)`–`(1964,3128)` | **`(0,0)`–`(2208,3128)`** |
| Derived padding | 96 / 96 / 96 / 96 | **96 / 96 / 96 / 96** (`paddingAll96: true`) |
| `whatSetsTheRightEdge` | `24:109`, `26:180` — the `Call booked` captions | **`25:116`, `27:181` — the two async terminator circles** |
| `whatSetsTheBottomEdge` | — | `27:161 27:165 27:169 27:177`, band 3 of the mirror |

**The thing that sets the right edge changed, and that is the finding.** The previous entry's anomaly 1
mispredicted the panel because the `Call booked` captions — 160 wide, centred on a 24px circle — overhang
their circles by 68. Those captions are still there and still overhang, at right edge `1964`; they are now
**244px inside** the edge, because the async terminators moved past them. **A rule of the form "the
captions set the right edge" would have been wrong one pass after it was learned.** The general form is the
one already on the record and it survived: *derive the bbox; do not compute it from the shapes you think
matter.* The derivation names its own setter, so it did not have to be right in advance.

Height unchanged: the deepest ink is still the mirror's band 3 at `3128`, which did not move in `y`.

## Mirror assertions — 26 pairs, every one read back by id

- `mirrorXAllMatch: true` and `mirrorDyAll888: true` across **14 node pairs** — six spine boxes, both
  circles, the `Call booked` caption, and all **five** band-3 nodes including the four that moved.
- `mirrorSizeAllMatch: true` — the 60-tall pill still mirrors a 60-tall pill.
- `connectorMirrorShapeAllMatch: true` across **12 connector pairs**: identical bbox `x`, `w`, `h` and
  exactly `+888` in `y`, which is the only evidence FigJam re-routed the two changed fans the same way.
- `connectorMirrorMagnetsAllMatch: true` — both endpoints' magnets match pairwise, so the mirror's red exit
  leaves a BOTTOM and its dashed pair leave a RIGHT, same as the technical.

**The `+888` offset holds after the change**, asserted against nodes read back by id rather than against
the numbers the script passed in.

## Screenshots spent

Panel `4:2` at `scale 0.62` with `contentsOnly: false` — one shot, all four diagrams at reading zoom. What
it was spent on, per the brief: **the red exit and the dashed pair are in different corridors.** The red
drops vertically from create-event's bottom edge into the box directly beneath it; the two dashed royals
leave the right edge, run right along the box's cross axis at `y2032`, and turn down at `1700` and `2012`
— the pill's and the attach box's own centres. The two dashed share a 168px trunk before splitting, which
is the clean fan §3's dash rule wants and the thing anomaly 3 was protecting.

**Band 3 is legible at reading zoom**, in both versions. Nothing overlaps: three pink cards, a capsule and a
white box, each in its own 280 column, with the terminator circle 32 past the last box. The 344 gap reads as
a column with nothing in it rather than as a mis-set row, because the band-2 column above it is empty too.

**Checked and holding:** the grey spine also leaves create-event's RIGHT magnet, so three edges share that
point — but the spine turns **up** to band 1 immediately while both dashed turn **down**, and the two
directions separate within the first 25px. Solid grey against dashed royal, diverging at the magnet. This is
the one place the new arrangement could have re-created the problem it fixed, and it does not.

## Rules needed and where they were looked for

| Rule needed | Found unaided | Where looked first | Note |
|---|---|---|---|
| **Which box a failure exit hangs on** | **yes** | `diagram-language.md` §2 | *"A guard is an ordinary process box. Its failure leaves the bottom edge as a red arrow into band 3."* The subject of that sentence is the box that fails, and §2's own example (`ConflictError / dead end — ask for an invite` on A1) hangs on the guard, not on the form. Clean; no inference needed. **The rule was always findable — the previous pass found it and traded it away for legibility, which is a different kind of miss and is why it was written down rather than silently resolved.** |
| Whether a band-3 row may have a gap | **no** | `diagram-language.md` §1, §1.1, then this log | Nothing anywhere rules on band-3 column spacing. The only statement is this log's previous entry calling four uniform 32 gaps *"what makes a five-object band 3 readable"* — an observation about one drawing, not a rule. Resolved on the structure: band 3 hangs off band 2, so a column with no band-2 box has no band-3 slot. **Recorded as a candidate rule, not asserted as one.** |
| Panel padding value and how to apply it | yes | this log, `Page furniture` tables | 96 on all four sides, derived from the content bbox. Not in `diagram-language.md` at all — §4's grid gives box, band and diagram gaps and says nothing about an act panel, which is board furniture the grammar does not describe. Same shape as the standing note block, the key geometry and the description line before it. |

## Anomalies

1. **`whatSetsTheRightEdge` changed owner mid-board-life.** Documented above rather than here as a defect,
   because nothing was wrong — but it is worth an anomaly line: a derived quantity whose *identity* changes
   is a class of fact no readback flags, since every value returns correct either way. The derivation
   naming its setter is what made it visible.
2. **Nothing was created and nothing deleted; `childCount` is 125 before and after.** No leftover-node
   filter was run and none is claimed — the count is the evidence, and every mutated node was returned by
   id and read back. The name-heuristic probe filter logged as a false positive four times above was again
   deliberately not used.
3. **No rollback occurred and it was checked rather than assumed.** The previous entries record a throw
   inside a returned object rolling a whole script back on this board. Both write calls returned cleanly
   and their readbacks were taken from `getNodeByIdAsync` **after** the mutation, in the same call, so a
   silent no-op would have shown as an unchanged position.
4. **The empty text sublayer on the circles still returns `Inter/Medium` 16 `#000000`** — carried forward
   for the third entry running; they carry no characters, so nothing renders.

---

# B4b under the clarified §2.5 · page 2's padding re-derived · page 4's act panel · 2026-09-29

> **HRMS board**, https://www.figma.com/board/CwLecjQLRS0x9Q28UHQ1zP. The Book a Call board
> (`YNBnqA4Ho6sFWXxfbc1vfn`) was not opened. **Pages recorded per §15.5**; every coordinate is absolute
> and page-scoped.
>
> Three jobs. **One built** — page 4's act panel. **One already satisfied** — page 2's panel padding,
> which a later pass than the brief's source had already closed. **One still not buildable** — B4b's fork,
> for a reason the §2.5 clarification does not touch and which is stated below as arithmetic.
>
> **Written after an interruption.** Jobs 2 and 3 were measured and, for page 4, built before the session
> was cut; Job 1's arithmetic and this entry were finished after it resumed. Nothing rolled back and
> nothing was rebuilt — the canvas was re-read on resume and matched what the first half had left.

## Job 1 — B4b · still not built. The wash obstruction is gone; a second one was always there.

Page: **3 · Technical** (`184:929`) and **2 · In plain language** (`183:1614`). **Nothing was moved on
either page. No node was created, deleted or restyled.**

### §2.5's clarification does close its own half, and that is worth recording first

Under the clarified wording — the wash encloses the branch's **band-2 extent** and stops above band 3 —
the re-fitted wash is fully determined and fully legal:

| | Today | Under the clarified rule |
|---|---|---|
| `128:1803` technical | `(440, 4336)` 968 × 160 | **`(128, 4336)` 968 × 160** → right edge 1096, bottom 4496 |
| `128:1807` mirror | `(-8728, 5046)` 968 × 160 | **`(-9040, 5046)` 968 × 160** → right edge -8072, bottom 5206 |

Same width, same height, slid exactly one 312 pitch left: left edge `160 − 32`, right edge
`784 + 280 + 32`, bottom 32 above band 3 and therefore 32 clear of the failure exit `53:364`, whose top is
4528. **Requirement 3 and requirement 4 no longer collide.** The 2026-09-22 entry's contradiction is
closed, exactly as the brief said it would be.

### What blocks it now is the drop, and the shortfall is invariant

Re-read from the canvas today, not carried from the previous entry — every figure below was returned:

| Node | Name | x, y | w × h |
|---|---|---|---|
| `53:340` | Find current assignment / currentPrimary | `160, 4368` | 280 × 96 |
| `53:344` | Correct in place (same-day change) | `472, 4368` | 280 × 96 |
| `53:348` | End current (at effective date) | `784, 4368` | 280 × 96 |
| `53:352` | Create new assignment | `1096, 4368` | 280 × 96 |
| `53:364` | failure exit · no position | `160, 4528` | 280 × **128** → bottom **4656** |
| `53:368` | `assignment.updated` | `472, 4528` | 280 × 60 |
| `53:372` | `assignment.ended` | `784, 4528` | 280 × 60 |
| `53:376` | `assignment.created` | `1096, 4528` | 280 × 60 |
| `55:336` | B5's eyebrow — first ink of the next diagram | `-1088, 4816` | 172 × 16 |

Band 1 is 4228, band 2 is 4368 (`+140`), band 3 is 4528 (`+300`). Connector topology returned as before:
`53:400` `53:340 → 53:344` RIGHT→LEFT, `53:404` `53:340 → 53:348` **TOP→TOP** (the arc that carries the
fork today), `53:408` `53:348 → 53:352`, dashed `[6,4]` `53:412/416/420` from each arm down to its pill,
red `53:432` `53:340 → 53:364`. The defect §14.3 describes is real and still there.

**The budget.** B4b's lowest ink is 4656. B5's first ink is 4816. The gap is **exactly 160** — §4's
diagram→diagram gap, to the pixel — so B4b has **zero vertical slack**. Usable space below band 2:

```
band 2 bottom            4464
B4b's allowed bottom     4656   ( = 4816 − 160 )
usable                    192
```

**The stub.** §1.1's stub is a box *and* its pill:

```
clear below band 2         32   (§4's box→box gap, the minimum in the grammar)
box 53:344                 96
box → pill                 32   (the same minimum; the set actually uses 64 everywhere)
pill 53:368                60
                     ---------
needed                    220   (252 at the set's real 64 box→pill gap)
```

**220 against 192 — short by 28. At the gap the set actually uses, 252 against 192 — short by 60.**

**This shortfall does not depend on which column the arm lands in.** It is a property of band 2's bottom,
B5's top and §4's gap. Choosing a column can only make it worse, and every column does:

| Column | Band 2 after the spine closes up | Band 3 after | Earliest the stub may start | Stub bottom (32 / 64) | Gap left to B5 |
|---|---|---|---|---|---|
| 160 | branch point `53:340` | failure exit `53:364` → 4656 | 4688 | 4876 / 4908 | **−60 / −92** — overlaps B5 |
| 472 | `53:348` End current | `53:372` ended → 4588 | 4620 | 4808 / 4840 | **8 / −24** |
| 784 | `53:352` Create new | `53:376` created → 4588 | 4620 | 4808 / 4840 | **8 / −24** |
| 1096 | **free** (vacated) | **free** (vacated) | 4496 | 4684 / 4716 | **132 / 100** |

Only 1096 comes close, and it fails for the reason the 2026-09-22 entry already gave — a reason the §2.5
clarification does not touch. The arm's source is `53:340` at x160. A drop into 1096 runs **936px
horizontally**, from the branch point to x1236, threading the 64px corridor between band 2 and band 3,
under both spine boxes, and **crossing both dashed pill drops** (`53:416` at x612, `53:420` at x924). That
is §1.1's *"parallel row running alongside the spine"* word for word, and the brief's own prohibition. Any
other routing is worse: leaving the branch point's RIGHT magnet puts the horizontal run at y4416, straight
through the two spine boxes.

**So the requirement splits in two and the halves point opposite ways.** The only column with room cannot
be reached without a long parallel run; the only columns close enough for a short drop are full — of the
failure exit the brief pins, and of the two pills the brief requires to stay under their own boxes.

### Every escape, checked and priced

- **Move B5 down.** Cheaper than the last entry thought — **64 would do, not 160**, and it stays inside the
  grid: act 02's content bottom 5988 → 6052, row-1 panels 3119 → 3183 tall, row gap 288 → **224**, still
  comfortably above the 164 column gap. **But it does not help**, because the blocker in column 1096 is the
  connector, not the budget, and 64px does not shorten a 936px run.
- **Shorten or re-hang the failure exit `53:364`.** Forbidden by the brief. It would free the branch
  point's own column — the best column there is, a straight drop out of the source — but **the 28 survives
  it**: the budget is fixed by 4464, 4816 and the 160 gap, not by the exit's height.
- **Hang the pill beside the box instead of under it.** Bottom 4716, gap 100, and it invents a second
  orientation for a mark used ~30 times on this board.
- **Shrink the box or the pill.** Restyling the language to make a layout fit; §14.3 is explicit that
  Ruling 1 *"is a layout rule, not a new mark."*

### What would actually unlock it — a ruling, not a nudge

**Both of these together, and neither alone**: (a) free the branch point's own column by re-hanging or
shortening the failure exit `53:364`, and (b) give B4b about 64px more vertical room by moving B5 — and the
mirror's B5 — down. The drop then falls straight out of `53:340`'s bottom edge into `(160, 4496)` with
`assignment.updated` at `(160, 4624)`: the shortest drop available, directly under its source, with the
clarified wash at `(128, 4336)` 968 × 160 sitting above it exactly as §2.5 now describes.

The alternative ruling is an amendment to §4 saying the diagram gap is measured against the next diagram's
**ink in the same columns** rather than against its bounding box — B5 has no ink at all at x ≥ 472, and its
nearest ink to a stub at x1096 would be 844px to the left and below it — but that alone still leaves the
936px connector, so by itself it unlocks nothing.

### The mirror, re-measured rather than assumed

Per §14.7 the same change would have to land on page 2, so its geometry was measured independently and the
offset verified node by node rather than inferred. It is `(-9168, +710)` again, and it still holds:
branch point `105:1282` `(-9008, 5078)`, dropped arm `105:1285` `(-8696, 5078)`, spine `105:1288`
`(-8384, 5078)` → `105:1291` `(-8072, 5078)`, failure exit `105:1300` `(-9008, 5238)` 280 × **128** →
bottom **5366**, pills `105:1303/1306/1309` at `(-8696 / -8384 / -8072, 5238)`, wash `128:1807`
`(-8728, 5046)` 968 × 160, next diagram's eyebrow `105:1312` at `(-10256, 5526)`. **5526 − 5366 = 160** —
the identical zero-slack gap. Every clearance matches the technical set, so the shortfall is 28 there too,
and it is not an artefact of one set's spacing. There is no journeys equivalent, so §14.7's *all three or
none* is satisfied by changing none.

**No screenshot was spent on B4b.** §7 asks for one per *changed* diagram and §14.3's cover test needs an
after-state; there is no after-state. The 2026-09-22 entry already records what the defect looks like at
reading zoom.

## Job 2 — page 2's panel padding · already satisfied; nothing was written

Page: **2 · In plain language** (`183:1614`), checked against **3 · Technical** (`184:929`).

The brief's ~491 is a stale figure. It was true when the act panels were squared into a grid, and the
**Title-to-content distance — one value, every page** entry above closed it: page 2's title block moved
`+400` and its row-1 panels moved `3275 → 3675`. Re-derived from today's canvas rather than trusted from
that entry, with membership re-partitioned from the returned panel bounds (`orphans: []` on both pages, so
the enclosure check ran against a population that could have failed):

| | Page 2 | Page 3 |
|---|---|---|
| title-block bbox | `-13200, 3378 → -4848, 3579` (5 nodes) | `-4032, 2668 → 4320, 2869` (5 nodes) |
| row-1 panel top | **3675** | **2965** |
| title bottom → panel top | **96** | **96** |
| row-1 act content top | 3766 | 3056 |
| **interior top padding, row 1** | **91 · 91 · 91** | **91 · 91 · 91** |
| interior top padding, row 2 | 96 · 96 | 96 · 96 |
| interior left padding, all five | 96 ×5 | 96 ×5 |
| panel widths | 2780 ×5 | 2780 ×5 |
| row-1 column gaps | `[164, 164]` | `[164, 164]` |
| row-2 column gap | `[164]` | `[164]` |
| row tops | `[3675, 7082]` | `[2965, 6372]` |
| shared bottom per row | `[6794]` · `[8966]` | `[6084]` · `[8256]` |
| **row gap** | **288** | **288** |
| content outside its panel | none — all five `enclosed: true` | none |
| panel index < min content index | `4 < 5` | `4 < 5` |

**Page 2's interior padding is already identical to page 3's, panel for panel.** 491 exists nowhere on the
board. Nothing was written and nothing needed to be: the grid-preservation clause was never reached,
because there was no change to make.

## Job 3 — page 4's act panel · built

Page: **4 · Employee performance** (`186:244`). One node created; **nothing else on the page touched.**

### Derivation — from the canvas, not from the brief's numbers

```
content bbox (63 nodes, the 5 title-block nodes excluded)   720, 6468 → 3527.25, 7588
title-block bbox (190:1820/1821/1825/1826/1827)             720, 6080 → 3528,    6281
title bottom → content top                                  187   (the board-wide value)
```

The content's right edge is **3527.25**, set by `91:1709` *Post Probation Review Cycle Completed* — a §2.4
caption overhanging the 24px circle `91:1708` it labels, which ends at 3400. Predicted from "the last
node" it would have been 3400 and the panel would have clipped the caption by 127px.

| Edge | Derivation | Value |
|---|---|---|
| left | content left − 96 | **624** |
| top | **title bottom + 96** | **6377** |
| right | content right + 96 | **3623.25** |
| bottom | content bottom + 96 | **7684** |

**The top is 96 of *clearance*, which makes the interior top padding 91 — and that is what "match pages 2
and 3" means.** The brief asked for 96 on all four sides; on this board a title-adjacent panel has never
had 96 above its act header. Every one on pages 1, 2 and 3 runs `titleBottom + 96` outside and **91**
inside, because the 187 splits that way. Taking the brief literally would have made page 4 the only panel
on the board with 96 inside and 91 outside — inverting the one value the title-to-content ruling exists to
hold identical across pages. 91/96 was chosen; the 5px is recorded in the anomalies rather than absorbed
silently.

> **Added 2026-09-29, by the pass that followed.** Read this as a **decision, not a deviation.** The 91 at
> the top was chosen deliberately to preserve the title-to-content invariant — the one value the whole
> title-to-content ruling exists to hold identical across every page — and taking the brief's literal 96
> would have broken that invariant on the only page it had not yet reached. It was the right call. The
> anomaly list is where it was *disclosed*, not where it was *excused*: a builder re-deriving page 4's
> panel should reproduce 91/96 on purpose, and should not "fix" it to 96/96. Confirmed still standing on
> the canvas at the time of this note — page 4's panel `230:1841` untouched at `(624, 6377)`.

### The panel, read back

| Property | Value | Against `195:1150` (page 3, 02 PEOPLE) |
|---|---|---|
| id | **`230:1841`** | — |
| name | `ACT PANEL · 06 EMPLOYEE PERFORMANCE` | same pattern |
| type / shapeType | `SHAPE_WITH_TEXT` / `SQUARE` | **read off `195:1150` in the same call, not assumed** |
| x, y · w × h | **`624, 6377` · 2999.25 × 1307** | width derived, not the 2780 column — page 4's content is 2807.25 wide |
| x1, y1 | `3623.25, 7684` | — |
| fill | `{0.98039216, 0.96862745, 0.94509804}` = **`#faf7f1`** | the reference panel's own colour object |
| cornerRadius | **6** | 6 |
| strokes | **0** | 0 |
| page index | **0** — backmost; min content index 1 | `4 < 5` there, same relation |
| interior padding | **top 91 · left 96 · right 96 · bottom 96** | 91 / 96 / 96 / 96 |
| title bottom → panel top | **96** | 96 |
| encloses all content | **true** | true |

### Byte-identity — 68 nodes signed before and after, 0 changed

Each signature covers `type · name · visible · locked · absoluteBoundingBox (3dp) · rotation · opacity ·
fills · strokes · strokeWeight · dashPattern · cornerRadius`, plus for TEXT `characters · fontName ·
fontSize · lineHeight · letterSpacing · both alignments · textAutoResize · textDecoration`, for
SHAPE_WITH_TEXT the same over `node.text` plus `shapeType`, and for CONNECTOR **both endpoints'
`endpointNodeId`, `magnet` *and* `position`** — never one or the other — plus `connectorLineType`, both
stroke caps and the connector's own label text.

Signatures were taken in a **separate read call first**, re-taken at the top of the write call and asserted
equal before a single node was created (`drift: []`, `extra: []`), then taken again after. The write call
was built to abort: any non-zero diff removes the panel and returns the diff instead of the result.

```
aggregate over all 68, before   4373bc2d
aggregate over all 68, after    4373bc2d
signed 68 · changed 0 · childCount 68 → 69
```

```
91:1472 5b60f8ef  Shape with text (the owner's pale region)   91:1191 87370a4b  Shape with text
91:734  ecf673e1  06 · EMPLOYEE PERFORMANCE                   91:1234 24080d2f  Shape with text
91:736  638b45a5  30 Day - 90 Day Reviews                     91:1344 c30a8688  Shape with text
91:742  1b2a8a48  Employee Fully Onboarded Day 0              91:1708 50a95ca5  Shape with text
91:744  2bc02e62  Send System & Email Notification…           91:1214 78e48bbe  Reasons Logged Review Closed
91:723  bf271a82  06 EMPLOYEE PERFORMANCE                     91:1235 9f3b7c23  Notification will be sent…
91:724  f783b229  How we enable employee reviews & growth     91:1345 decd6f36  Employee Recieves Feedback
91:795  f6136aaf  Text (Pre-Req)                              91:1709 2162e3ab  Post Probation Review Cycle…
92:1811 550ccfe4  Text (Per Client Configs)                   91:1548 5afc8aad  Review Completed
91:813  69aa5325  Notify HR of probation ending               91:1594 65cdd84a  Review Deferred to a new date
91:830  931d5248  Manager Chooses to Fill                     91:1562 806fcee7  Post Probation Confirmation…
91:1051 2effb779  Manager Chooses to Snooze                   91:1641 1fb7e6af  Post Probation Letter Sent out
91:1063 d71db11e  Manager Chooses to Reject                   91:1615 279f8e4c  Send 1-Pager to Employee…
91:939  39832256  Manager receives Email & System…            91:1681 d8d7e4fe  Text (90-Day Review CANNOT…)
91:995  bb7c1b7d  Decision (diamond)                          202:1146 238883ff Connector line
91:847  68f19af2  System translates review information…       91:745  8542d53   30 Days Later
91:1076 577685c0  Manager must provide reason                 202:1150 9bee6598 Connector line
91:1090 44cf426e  Manager must provide new date…              91:814  9e7243e8  85 Days Later
91:871  f093b258  Send 1-Pager to Employee…                   91:848  a1fc7aeb  Connector line
91:901  a902a70a  Notification Sent to Manager…               91:872  6084b268  Connector line
91:1439 537e3acd  Post Probation Clauses Confirmation…        91:902  a6e9e5c5  Connector line
91:1452 bb3ff202  90 Day Review Notification Sent out         91:949  828b2053  Connector line
91:1030 ac8c3af   Connector line                              91:1549 220d1793  Connector line
91:1041 1f822322  Connector line                              91:1563 a3bcbe75  Connector line
91:1083 e2a2d259  Connector line                              91:1601 65bda45a  Connector line
91:1101 17233e9d  Connector line                              91:1616 51aab05c  Connector line
91:1119 331a3397  Connector line                              91:1664 8e98f01b  Connector line
91:1133 25a6515c  Connector line                              91:1690 40e9ac18  Connector line
91:1192 52db187f  Connector line                              91:1732 9492addb  Connector line
91:1278 c690439a  Connector line                              91:1753 22a3ffc2  Connector line
91:1352 f418c406  Connector line                              190:1820 e73aa5ad page eyebrow      (ours)
91:1499 8e263ca8  Connector line                              190:1821 219365b  page rule         (ours)
91:1521 6919ff67  Connector line                              190:1825 f4b3854c page title        (ours)
                                                              190:1826 cc086f8a page description  (ours)
                                                              190:1827 e4450f56 key pointer       (ours)
```

### Screenshots spent

Two. `await panel.screenshot({ contentsOnly: false })` on `230:1841` inside the write call — the act at
reading zoom, confirming the caption at 3527.25 sits inside the panel and the act header sits 91 below the
top edge. Then `await page.screenshot({ scale: 0.3 })` for the whole page, the only view that answers the
complaint this job exists for: page 4 now reads as a title band on cream above a panel, the same two-tone
structure as pages 2 and 3. No probe node was created — the page composites its own background.

## Rules needed and where they were looked for

| Rule needed | Found unaided | Where looked first | Note |
|---|---|---|---|
| **What the wash must enclose after the clarification** | **yes** | `diagram-language.md` §2.5 | The clarified paragraph names the band-2 extent, says the wash stops above band 3, and explains why a termination is not a member of the branch. It determined the new bounds with no inference. The block quote under it records the very obstruction this pass was sent to clear — **a rule that carries the case that produced it is the most findable kind there is.** |
| **Where a dropped alternative may sit** | **partly** | `diagram-language.md` §1.1, then §4 | §1.1 rules out a parallel row and names the three legal terminations, but gives **no drop offset and no clearance**, so the 32 was taken from §4's box→box gap and the 64 box→pill from the band offsets. Both are derivations, not quotations. **This is the gap that decides the job** — with a stated drop offset the 28px shortfall would be arithmetic on stated numbers instead of inferred ones. It belongs in §1.1. |
| **Panel padding and how to apply it** | yes, and the answer was wrong | this log's previous entry, *Rules needed* table | That table says *"96 on all four sides, derived from the content bbox"* — true of a row-2 panel, **not** of a title-adjacent one, which runs 96 outside and 91 inside. The brief inherited the error from there. **A findability line is itself a source, and this one needs correcting.** |
| Whether §4's diagram gap is bbox-to-bbox or column-wise | **no** | `diagram-language.md` §4, §1, this log | §4 gives the number and nothing else. B5 has no ink at all at x ≥ 472, so the two readings differ by everything for this job. **Resolved conservatively — bbox — and recorded as a candidate amendment**, not asserted as a rule. |

## Anomalies

1. **The 28 is the interesting number, and it is invariant.** The 2026-09-22 entry's 64 came from the
   wash/failure-exit collision and is gone. What remains — `220 needed, 192 available` — survives every
   rearrangement that keeps §4's 160 diagram gap, because all three of its terms (band 2's bottom, B5's
   top, the gap) sit outside the fork. **A shortfall that does not move when you move the layout is a spec
   conflict, not a layout problem**, which is why this entry proposes a ruling rather than a nudge.
2. **`node.connectorText` does not exist on a FigJam CONNECTOR.** It throws *"no such property
   'connectorText' on CONNECTOR node"* and killed a whole page-4 read that was otherwise fine. The label
   lives at `node.text.characters`, guarded with `'text' in n`. Same class as the SECTION/`text` throw
   logged on 2026-09-22: **narrow by capability before touching a sublayer property**, and prefer
   `'x' in node` to a remembered property name.
3. **Adding page 4's panel changes what one of the owner's shapes composites against, without changing a
   single one of its properties.** `91:1472` is his pale region — `rgb(61,173,255)` at **5%**, the same
   construction as §2.5's wash. Over the cream ground it rendered ≈`#e9eae4`; over `#faf7f1` it now renders
   ≈`#f1f3f2`. Nothing of his was edited and the byte-identity diff is clean, but §2.5.1's coupling — *"the
   wash's appearance is a function of the ground, and nothing about the wash says so"* — has just been
   demonstrated on a shape that is neither a wash nor ours. Recorded, not fixed: the same thing happened to
   every wash on pages 2 and 3 when the panels arrived, and it is the price of the panel.
4. **Page 4's panel is 2999.25 wide, and the fraction is the owner's caption, not a rounding error.**
   `91:1709`'s bbox ends at 3527.25. Rounding out to 3624 would have made the right padding 96.75 against
   96 everywhere else; the previous entry's anomaly 5 set the precedent — **exactness of the derived
   clearance over evenness of a coordinate nobody can see** — so the fraction was kept.
5. **The 5px between the brief's "96 on all four sides" and the 91 that was built.** Carried down from the
   findability table. The brief's wording is inherited from a log line describing row-2 panels; pages 1, 2
   and 3 all run 91 at the top of a title-adjacent panel. Built to match the canvas and the
   title-to-content ruling rather than the brief's literal figure, and flagged because it is a judgement,
   not a measurement.
6. **Inserting the panel at index 0 shifts every other child's index by one.** No property of any node
   changed — the signature deliberately excludes index — and relative z-order among the 68 is preserved.
   Stated because a future pass diffing indices rather than properties would read 68 "changes".
7. **Page 2 needed no write, and that is the second time a brief has arrived describing a state the board
   had already left.** Both times the entry immediately above in this log was the thing that had already
   fixed it. **Re-deriving from the canvas before believing a brief's numbers is paying for itself once per
   pass**, which is what §7.1 is for.
8. **This entry was written across an interruption.** Page 4's panel was created before it; Job 1's
   arithmetic and this write-up after. On resume the canvas was re-read rather than assumed — page 4 at 69
   children with `230:1841` at `(624, 6377)`, B4b untouched with `53:344` still at `(472, 4368)` — so no
   half-applied state was carried into the second half.

---

# B4b's fork, built — the exit was hanging on the wrong box · 2026-09-29

> **HRMS board**, https://www.figma.com/board/CwLecjQLRS0x9Q28UHQ1zP. The Book a Call board
> (`YNBnqA4Ho6sFWXxfbc1vfn`) was not opened. **Pages recorded per §15.5:** page **3 · Technical**
> (`184:929`) and page **2 · In plain language** (`183:1614`), both changed, per §14.7. Every coordinate
> is absolute and page-scoped.
>
> **Built.** Third attempt, and the thing that unlocked it was not the 64px of vertical room that was
> granted. It was `assignment.service.ts`. **The no-position exit had been hanging on a box that cannot
> raise it**, and putting it on the box that does frees the only column the drop ever needed.

## What actually unlocked it — not the grant, the code

`packages/api/src/modules/assignment/assignment.service.ts`, `setReportingLine` at line 203. Read before
anything was moved, and the statement order is the whole argument:

```
220-224   const current = await this.currentPrimary(...)                    <- Find current assignment
234-236   if (current && current.validFrom === input.effectiveDate)
              return this.correctReportingLine(current, ...)                <- Correct in place, AND IT RETURNS
238-242   if (current) await this.end(current.id, input.effectiveDate, ...) <- End current
244       const positionId = input.positionId ?? (current ? toId(current.positionId) : null)
245-249   if (!positionId) throw new NotFoundError('No position to assign this employee to', ...)
251       return this.create({ employeeId, positionId, validFrom, ... })    <- Create new assignment
```

**The correction arm returns at 236.** Position resolution happens at 244, on the other arm only, and the
no-position error is raised at 245 — four statements downstream of the box the exit was drawn under.
`currentPrimary` looks up an assignment; it returns a row or `null` and **throws nothing**.

So the drawing was wrong on **§2** (*"A guard is an ordinary process box. Its failure leaves the bottom
edge as a red arrow into band 3"*), not merely inconvenient. Two things follow, and the second is the one
that matters:

1. **Moving the exit is a correctness fix, not a layout concession.** The standing ruling — *"an exit
   belongs on the box that raises it"* — is precisely what **requires** the move. The Case-2 refusal was
   sound on its own terms and was never in play: it presupposed the exit was already on its raiser.
2. **The raiser had no box.** B4b already draws this exact construct twice — `Not reporting to self` →
   `53:356`, `No reporting cycle` → `53:360`. Each guard has its own box and its own exit. The third
   failure had an exit and no box, which is why its exit had drifted onto a neighbour. Adding
   `Resolve position` makes it the third of three, not a new invention.

## The "fourth case" — measured, and it dissolved twice

**First framing (contention at x160): wrong anchor.** §1.1 drops *the arm*, and the arm is `53:344`
`Correct in place` at **x472** — not the fork at x160. Confirmed on canvas. x160 was never contended by
the arm's own drop.

**Second framing (contention at x472): real, and worse than "ugly".** If the arm drops in its own column
and the spine closes up, `End current` moves 784 → 472 and its pill `assignment.ended` moves with it to
`(472, 4528)`. The arm's shortest legal drop slot is `(472, 4496)` — box `4496 … 4592`. Those two rects
**overlap by 64px of height in the same column.** It is not a misreading risk; it is a collision. So the
"stub reads as hanging off the wrong arm" ruling would never have been reached on that arrangement — the
arrangement is geometrically impossible, and the only legal version of it leaves a hole at 472.

**The code dissolves both.** With the exit on its raiser, band 3 at x160 empties, and the arm drops
**straight out of the bottom edge of the box it leaves** — the shortest drop available anywhere on the
diagram, directly under its own source.

**The decision test, applied as stated: where does the stub sit?** Measured at **x160**, under branch
point `53:340`. Under the branch point ⇒ **close the spine, no gap.** Nothing is mis-parented, so the
falsehood the gap ruling exists to prevent does not arise. The gap ruling was not overturned; it was
tested and found not to apply.

## Band 2 does not grow, and it had no room to

| | x160 | x472 | x784 | x1096 |
|---|---|---|---|---|
| **band 2, before** | Find current assignment | Correct in place | End current | Create new assignment |
| **band 2, after** | Find current assignment | End current | **Resolve position** | Create new assignment |
| **band 3, before** | no-position exit (128) | `assignment.updated` | `assignment.ended` | `assignment.created` |
| **band 3, after** | *(the stub, at 4496 / 4656)* | `assignment.ended` | **no-position exit (128)** | `assignment.created` |

Four boxes before, four after. **This was not a preference — band 2 could not have grown.** B4b's spine
is eight boxes, `-1088 … 1376`; act 02's panel is `-1184 … 1596` and its interior right limit is
`1596 − 96 = 1500`. A ninth column at 1408 would end at **1688**, overflowing by 188. The one arrangement
that fits is the one where the new box lands in the slot the dropped arm vacates.

## The vertical, to the pixel

```
band 2 bottom                                   4464
+  32   §4 box->box gap, the drop               4496    stub box top
+  96   box height                              4592    stub box bottom
+  64   the set's real box->pill gap            4656    stub pill top
+  60   pill height                             4716    stub pill bottom  = B4b's lowest ink
+ 160   §4 diagram->diagram gap                 4876    earliest legal B5 ink
        B5's first ink before this pass         4816
                                           ---------
        required move                              60
        granted                                    64
```

**60 was spent, not 64, and that is deliberate.** At 64 the diagram gap becomes **164** — four above §4's
number, which this board otherwise holds to the pixel (both previous B4b entries measured it at *exactly*
160, on both pages). At 60 it lands on **160 exactly, on both pages**. The grant was a ceiling; spending
under it costs nothing and preserves the invariant, whereas spending all of it would have traded a
board-wide exact value for four pixels nobody can see. The consequence the brief pre-accepted still
lands, one notch smaller: **row gap 288 → 228** rather than 224, still far above the 164 column gap.

The 64 box→pill gap is the set's own: band 2's bottom `4464` to band 3's top `4528`. §4's *"band→band
gap 48"* is not what the canvas uses (it runs 44 above band 2 and 64 below it); the band offsets in §1
(`+140` / `+300`) are what the grid actually obeys.

## Page 3 · Technical (`184:929`) — what moved where

| Node | Before | After |
|---|---|---|
| `53:340` Find current assignment / `currentPrimary` | `(160, 4368)` 280×96 | **unchanged** |
| `53:344` Correct in place (same-day change) | `(472, 4368)` | **`(160, 4496)`** — the drop |
| `53:348` End current (at effective date) | `(784, 4368)` | **`(472, 4368)`** |
| `236:1843` **Resolve position (given, else inherited)** | — | **created, `(784, 4368)` 280×96** |
| `53:352` Create new assignment | `(1096, 4368)` | **unchanged** |
| `53:364` no-position exit, 280×**128** | `(160, 4528)` | **`(784, 4528)`** — size and text untouched |
| `53:368` `assignment.updated` | `(472, 4528)` 280×60 | **`(160, 4656)`** |
| `53:372` `assignment.ended` | `(784, 4528)` | **`(472, 4528)`** |
| `53:376` `assignment.created` | `(1096, 4528)` | **unchanged** |
| `128:1803` alternate wash | `(440, 4336)` 968×160 | **`(128, 4336)` 1280×160** |

| Connector | Before | After |
|---|---|---|
| `53:400` | `53:340` RIGHT → `53:344` LEFT | **`53:340` BOTTOM → `53:344` TOP** — a 24.5px vertical drop at x300 |
| `53:404` | `53:340` **TOP → `53:348` TOP** (the arc that hid the fork) | **`53:340` RIGHT → `53:348` LEFT** — an ordinary 24.5px spine link |
| `53:408` | `53:348` RIGHT → `53:352` LEFT | **`53:348` RIGHT → `236:1843` LEFT** |
| `236:1847` | — | **created:** `236:1843` RIGHT → `53:352` LEFT, cloned from `53:408` so the style is identical |
| `53:432` red | `53:340` BOTTOM → `53:364` TOP | **`236:1843` BOTTOM → `53:364` TOP** — the §2 fix |
| `53:412` / `53:416` / `53:420` dashed | endpoints unchanged | followed their boxes; the `53:344 → 53:368` drop is still exactly 64 |

**B5 and everything beneath it: 41 nodes, `+60` in y.** 23 nodes repositioned, 1 floating connector
(`204:1893`, B5's title rule) rewritten at both endpoints, 17 node-attached connectors followed on their
own. **B5's new origin: eyebrow `55:336` at `(-1088, 4876)`**, rule `204:1893` at y `4908`, title
`55:341` at `4926`, band 1 `55:342` at `5072`. Act 02's content bottom `5988 → 6048`.

**Row-1 act panels re-derived, not nudged:** `195:1146` / `195:1150` / `195:1154`, tops unchanged at
`2965`, heights `3119 → 3179`, shared bottom `6084 → 6144` = deepest row-1 content `6048` + 96. Interior
padding after: **top 91 · left 96** on all three; bottom `732 / 96 / 1472`, act 02 binding at 96. Widths
still 2780, column gaps still 164, panels still behind all content. Row 2 (`195:1158`, `195:1162`)
untouched at `y 6372`, 2780×1884 — row gap `6372 − 6144 =` **228**.

## Page 2 · In plain language (`183:1614`) — the mirror, measured on its own

| Node | Before | After |
|---|---|---|
| `105:1282` We find their current placement | `(-9008, 5078)` | **unchanged** |
| `105:1285` Same-day change — corrected in place | `(-8696, 5078)` | **`(-9008, 5206)`** |
| `105:1288` The old placement ends on that date | `(-8384, 5078)` | **`(-8696, 5078)`** |
| `239:1848` **We use the position given, or the one they had** | — | **created, `(-8384, 5078)` 280×96** |
| `105:1291` A new placement starts | `(-8072, 5078)` | **unchanged** |
| `105:1300` no-position exit, 280×**128** | `(-9008, 5238)` | **`(-8384, 5238)`** |
| `105:1303` Their placement was corrected | `(-8696, 5238)` | **`(-9008, 5366)`** |
| `105:1306` A placement ended | `(-8384, 5238)` | **`(-8696, 5238)`** |
| `105:1309` A placement started | `(-8072, 5238)` | **unchanged** |
| `128:1807` alternate wash | `(-8728, 5046)` 968×160 | **`(-9040, 5046)` 1280×160** |

Connectors mirrored exactly: `105:1400` → BOTTOM/TOP, `105:1404` → RIGHT/LEFT (the arc gone),
`105:1408` → `239:1848` LEFT, **`239:1852` created** (`239:1848` RIGHT → `105:1291` LEFT), red `105:1420`
re-hung on `239:1848` BOTTOM.

**B5 mirror: 39 nodes, `+60`.** 21 repositioned, 1 floating connector (`203:1865`), 17 followed.
**New origin: eyebrow `105:1312` at `(-10256, 5586)`.** Act 02 content bottom `6698 → 6758`.
Row-1 panels `195:1851` / `195:1855` / `195:1859`: tops `3675`, heights `3119 → 3179`, shared bottom
`6794 → 6854`, padding top 91 / left 96 / bottom 96 (act 02 binding). Row 2 untouched at `7082`.
Row gap **228** — identical to page 3.

**The `(-9168, +710)` offset was re-derived after the move, not assumed, and it still holds.** Every
changed node: `53:344`↔`105:1285`, `53:368`↔`105:1303`, `53:348`↔`105:1288`, `53:364`↔`105:1300`,
`236:1843`↔`239:1848`, wash↔wash, B5 eyebrow `(-1088, 4876)`↔`(-10256, 5586)`, and the panels
(`6144` ↔ `6854`). All `Δx = -9168`, all `Δy = +710`. The brief was right to insist it be re-measured;
it was, node by node, and it survives the pass rather than being relied on through it.

## The wash, under the clarified §2.5

Branch band-2 extent = branch point through the last arm box: `160 … 1376` (technical),
`-9008 … -7792` (mirror). Wash = that, 32 out on every side, stopping above band 3.

| | Before | After |
|---|---|---|
| `128:1803` | `(440, 4336)` 968×160 → `440 … 1408` | **`(128, 4336)` 1280×160 → `128 … 1408`** |
| `128:1807` | `(-8728, 5046)` 968×160 | **`(-9040, 5046)` 1280×160 → `-9040 … -7760`** |

Measured clearances, both pages identical: left to branch point **32**, right from the last arm **32**,
top to band 2 **32**, bottom above band 3 **32**. Behind all content on both pages (wash index 5, min
content index 36). **Only the left edge moved** — the right edge was already correct, and the previous
entry's projected 968-wide wash was computed against an arrangement where the spine closes into three
columns; the built arrangement keeps four, so the wash is 1280.

## Readback — every clearance in the fork, both pages

| Relation | Page 3 | Page 2 |
|---|---|---|
| band-2 column gaps, all three new adjacencies | 32 · 32 · 32 | 32 · 32 · 32 |
| band 2 bottom → stub top (§1.1's drop) | **32** | **32** |
| stub bottom → stub pill top | **64** | **64** |
| stub right → next band-3 node left | 32 | 32 |
| preceding band-3 exit right → stub left | 32 | 32 |
| band 2 bottom → band 3 top | 64 | 64 |
| exit right → last pill left | 32 | 32 |
| **pairwise overlaps among all 16 diagram nodes** | **0** | **0** |
| connectors on the page / dangling endpoints | 144 / **0** | 144 / **0** |
| floating endpoints (the diagram rules, §5) | 34 | 34 |
| child count before → after | 359 → **361** | 336 → **338** |
| B4b lowest ink → B5 first ink | 4716 → 4876 = **160** | 5426 → 5586 = **160** |

## §14.3's cover test, by eye

Screenshots taken with the opaque back-most cream probe, removed in the call that created it both times
(`probeRemoved: true` asserted each time).

**Before:** `Find current assignment` · `Correct in place` · `End current` · `Create new assignment` read
as four consecutive spine steps. The fork was carried only by a pale TOP→TOP arc that the eye does not
separate from the spine, and the wash began *after* the branch point, so the mark pointed at the arms
instead of at the branch. The red exit hung under a lookup.

**After, and it passes.** Cover everything below band 2 and the spine reads end to end without a break:
`Manager control` → `Permission gate` → `Set reporting line` → `Not reporting to self` →
`No reporting cycle` → `Find current assignment` → `End current` → `Resolve position` →
`Create new assignment`. Eight boxes, one line, nothing out-reaching it. Uncover the bottom and the
correction is unmistakably subordinate: it hangs one step below its own source, in its own column, with
its pill below it, and the red exit now sits under the box that raises it. The mirror reads the same, box
for box. **The defect §14.3 describes is gone from B4b.**

## Anomalies

1. **An x-range is not a column when the panel grid has two rows — and it cost a revert.** The first B5
   move filtered act 02 by `x ∈ [-1184, 1596]` plus `y ≥ 4720`. **Act 05 sits in the same x-column, in
   row 2**, so the filter swept up 21 of its nodes and moved them 60px, and the "deepest row-1 content"
   then resolved to `8160` and stretched all three row-1 panels to 5291 tall. Caught on the returned
   readback, **reverted by the exact inverse in the next call**, and every restored coordinate checked
   against the pre-move measurements (`55:336` → `4816`, `55:410` → `5892`, `137:1809` → `4930`,
   `123:1704` → `5188`, `204:1893` → `4848`, panels → `3119` / bottom `6084`, and act 05's own
   `59:671` → `6728`, `66:806` → `7358`). Redone with **rect membership** — inside the panel in x *and*
   y — which is how the pages entry partitioned in the first place. **The lesson is specific: on this
   board a column of x belongs to two acts, and only the panel rectangle distinguishes them.**
2. **The membership partition found 5 orphans and they were correct.** The page title block
   (`190:1687` … `190:1694`) sits above every panel. Excluded by name rather than by loosening the test,
   so `orphans: 0` stays a real guard on the next pass instead of quietly becoming a tolerance.
3. **The wash's left edge lands exactly on the preceding spine box's right edge.** `53:336` ends at 128
   and the wash starts at 128; `105:1279` ends at -9040 and the wash starts at -9040. This is an
   identity in the grid, not a mistake: §2.5's 32 of clearance is the same number as §4's column gap, so
   any wash whose branch point is not the first box on band 2 will always butt against its predecessor.
   Recorded so nobody "corrects" it to 144 and breaks §2.5's arithmetic instead.
4. **The stub's top edge is flush with the wash's bottom edge** (`4496` / `5206` on the two pages). The
   same coincidence from the other direction: the clarified §2.5 stops the wash 32 above band 3, and
   §1.1's minimum drop is 32 below band 2 — the same line. On canvas it reads as the arm emerging from
   the wash's lower edge, which is exactly what it is, so it was kept rather than padded around.
5. **`shapeWithText.text.height` does not exist, and it fails *quietly*.** It was used to assert the new
   label fitted the 96px box's 80px interior; it returned `undefined`, `undefined <= 80` evaluated
   `false`, and the assertion reported a failure that had not happened. Same family as the SECTION/`text`
   throw and `connectorText` — but worse, because those throw and this one lies. Resolved by screenshot
   (`await box.screenshot({ scale: 2 })`): the technical label sets one line, the plain-language mirror
   two. **Prefer a property that throws to one that returns undefined; prefer a picture to either.**
6. **Page 2's B5 has no note block and page 3's does.** `137:1809` / `137:1810` at `(-1088, 4930/4952)`
   have no mirror counterpart — which is why the same move is 23 nodes on page 3 and 21 on page 2.
   Pre-existing and not touched here, but flagged: §14.7 makes the mirror derive from the technical set,
   and a Ruling-3 note present on one and absent on the other is precisely the drift it warns about.
7. **B4b's band 2 still ends without a §2.4 terminator.** `53:352` / `105:1291` have only their dashed
   pill drop; §14.3 asks the happy path to run *"to a captioned terminator"*. There is room — a 24px
   circle at 1408 ends at 1432 against the panel's 1500 interior limit. **Not added:** this pass moved
   things and corrected one mis-parented exit; adding a mark is a different authorisation. It is the
   obvious next candidate and it is cheap.
8. **The new box's z-index is next to its siblings, not in column order.** Inserted at index 45 on both
   pages, so it sits after `53:352` / `105:1291` in the stack rather than between the boxes it sits
   between on canvas. No overlaps exist, so nothing composites differently; noted because a pass diffing
   indices rather than geometry would read it as out of order.
9. **Both previous entries' predictions were right, and one of them was right for the wrong reason.**
   The 2026-09-22 entry named *"permission to re-hang failure exit `53:364`"* and *"160px more vertical
   room"*; the 2026-09-29 entry narrowed the second to *"about 64px"* and said the two were needed
   **together, and neither alone**. That is exactly what happened — 60px and a re-hung exit. But the
   re-hang was never the concession both entries assumed it would have to be: **it was a defect in the
   drawing, and the only reason it read as a concession is that nobody had checked the exit against the
   code.** Two passes refused on arithmetic that was correct and complete, over a premise that was false.
   **When a layout is unsatisfiable, re-check the content premises, not only the geometry.**

## Rules needed and where they were looked for

| Rule needed | Found unaided | Where looked first | Note |
|---|---|---|---|
| **Which box a failure exit belongs to** | **yes** | `diagram-language.md` §2 | *"Its failure leaves the bottom edge as a red arrow into band 3."* Unambiguous, and it was the rule that unlocked the job. **The rule did not fail — the drawing did, and for two passes nobody tested it against the source.** A rule can be perfectly findable and still be silently unenforced. |
| **Where a dropped alternative may sit** | **partly** | §1.1, then §4 | §1.1 still gives no drop offset and no clearance. The 32 came from §4's box→box gap and the 64 from the band offsets — derivations, not quotations, **for the second pass running**. The previous entry already flagged this as "the gap that decides the job"; it decided this one too. It belongs in §1.1 as a number. |
| **What the wash encloses** | **yes** | §2.5 | Determined both washes with no inference, again. The clarified paragraph is doing its job. |
| **Whether §4's 160 is a minimum or an exact value** | **no** | §4, this log | §4 gives the number and no modality. The board holds it to the pixel, so it was treated as exact and 60 of the granted 64 was spent. **If it is a minimum, 64 was free and the row gap would be 224.** One sentence in §4 settles it. |
| **Whether a layout pass may add a box** | **no** | §14.3, §14.7 | §14.3 says Ruling 1 *"is a layout rule, not a new mark. Nothing is added."* This pass added one — not for Ruling 1, but for §2, on code evidence, to give an existing exit a raiser. The two rules do not speak to each other. Handled as a **content correction** and applied to both sets per §14.7, and recorded as an open question rather than treated as a precedent. |

## Screenshots spent

Eight. Two before on page 3 (whole diagram at 0.4 for the cover test, fork detail at 0.75), one 2× check
of each new box's label to confirm it sets inside the 80px interior, two after on page 3, two after on
page 2 at the mirrored framings (`-10288, 4710` and `-9072, 4890`, derived from page 3's by the
`(-9168, +710)` offset so the two sets are compared at identical crops). Every probe removed in the call
that created it, with removal asserted.

## Not done

**Nothing was committed.** Page 4 was opened once, read-only, to confirm `230:1841` still stands at
`(624, 6377)` 2999.25×1307 with 91/96/96/96 padding and 96 from the title block — the measurement behind
the addendum added to the previous entry above. Nothing on it was changed. The journeys have no B4b
equivalent, so §14.7's *all three or none* is satisfied by changing the two sets that have one.
