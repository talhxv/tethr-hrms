# Process flow content

> What each of the ten diagrams actually contains, band by band, derived from the code on 2026-09-15.
> Ruled by the design head under Talha's authorization to complete the set.

Three documents, three jobs. [diagram-language.md](diagram-language.md) says **how** to draw;
[diagram-build-log.md](diagram-build-log.md) records **what is demonstrably on canvas**; this file says
**what to draw**. §6 of the language doc is a scope list — one line per flow — and a scope list is not a
specification. Ten diagrams improvised at build time is how a set drifts.

**Every claim below was read out of the code, not out of a document.** That distinction is the whole
lesson of this project so far: a tick resting on a previous session's belief, a stale event count, and a
vocabulary argument applied to a phrase that was pointing at a canvas. Where this file states a fact, the
command that proves it is given. Re-run them; do not trust this file's numbers when the code is reachable.

---

## 0. Verified ground truth

### 0.1 The event registry is 36, not 33

`DOMAIN_EVENT_NAMES` in `packages/shared/src/events/domain-event.ts` holds **36** entries. The language
doc's §5 research gotcha says 33 — stale by three. Flow 10 is an inventory, so it counts at build time:

```bash
node -e "const s=require('fs').readFileSync('packages/shared/src/events/domain-event.ts','utf8');
console.log([...s.match(/DOMAIN_EVENT_NAMES = \[([\s\S]*?)\] as const/)[1].matchAll(/'([^']+)'/g)].length)"
```

**Do not replace 33 with 36 in the language doc.** A hardcoded count goes stale the next time someone adds
an event; that is how it went wrong the first time. Replace it with the command.

### 0.2 Thirty-four events have publishers. Two do not.

Per §3's rule, a pill is justified only by a publish site in a service. **Do not read the list of them from
this file.** Thirty-four rows of file-and-line references stood here until 2026-09-15 and were cut: that is
data about the code, and by this doc set's own rule — *rules here, facts in the code* — data belongs in the
command. Leaving the table with a "this may be stale" caveat attached is the weaker fix, the same one
rejected for §3's grep.

```bash
node scripts/verify-events.js                # registry count, every publisher, every consumer
node scripts/verify-events.js --markdown     # the same, as pasteable tables
node scripts/verify-events.js --pill <name>  # may this one event be drawn? exit 0 yes, exit 1 no
```

What stays below is the part that is judgement rather than data. Judgement does not drift the same way: if
a thirty-seventh event lands tomorrow, the shape of what follows survives it.

**`user.created` and `user.linkedToEmployee` have no publisher anywhere in `packages/api/src`.** Declared
and typed, never fired. They are not drawable in any diagram — including flow 10's map, where an unfired
event has no arrow to draw. The language doc already records the `user.created` case; `user.linkedToEmployee`
is the same defect and was not previously noted.

**Two exit codes, two questions, deliberately not merged:**

- `--strict` is a CI gate on **contract integrity** — the API references a name the shared contract does
  not declare. It does **not** cover the pill rule, and must not: a declared-but-unpublished name breaks no
  runtime, and failing a build over an unused type declaration would be wrong.
- `--pill <name>` answers **"may I draw this?"** for one event — exit 0 to draw, exit 1 not to. It is the
  inverse direction, and it is where `user.created` and `user.linkedToEmployee` fail.

`user.created` passes `--strict` and fails `--pill`. Both are correct. Read undrawable-because-unpublished
off `--pill` or off the default output's Published-vs-Registry line, never off the `--strict` exit code.

### 0.3 Only seven events are consumed. This is the most important fact in the set.

Eleven handler registrations, across seven distinct events:

| Event | Consumer module | What it does |
|---|---|---|
| `employee.terminated` | `core/auth` | disable the departed person's logins |
| `employee.terminated` | `benefits` | end enrollments |
| `employee.terminated` | `finance/billing` | close billing membership at the last working day |
| `employee.terminated` | `finance/compensation` | close compensation records |
| `employee.terminated` | `finance/payroll` | open final settlement |
| `payroll.finalized` | `finance/billing` | draft services invoices from the run |
| `compensation.revised` | `finance/payroll` | mark draft runs stale |
| `compensation.taxProfileChanged` | `finance/payroll` | mark draft runs stale |
| `benefits.enrollmentChanged` | `finance/payroll` | mark draft runs stale |
| `form.submitted` | `recruitment` | intake an application |
| `hiringRequest.submitted` | `recruitment` | open the requisition |

**Line numbers are deliberately absent** — `--pill <name>` prints the current ones. The third column is
what survives: it cannot be derived from a grep, and it is the reason this table is worth having at all.

> **Where the line falls, since this doc still contains numbers.** A count that carries an argument stays,
> with the command named beside it — a reader cannot follow "seven of thirty-four" without the shape. A
> count that is pure reference data goes. That is why §0.2's thirty-four rows were cut and this table's
> eleven were not: one was a lookup table, this one is a claim about how the system is wired. Do not strip
> every number out of this file chasing the rule, and do not reinstate a lookup table because this one was
> allowed to stay.

**The other twenty-seven published events have no listener.** That is not a defect to hide — it is a young
system with its seams declared ahead of its couplings — but it governs what band 3 may show:

> **A pill says the event was emitted. A consequence step in band 3 may be drawn only where a consumer is
> registered.** Everywhere else band 3 is pills and failure exits, and nothing more.

This is the rule most likely to be broken by a session improvising at build time, because an empty-looking
band 3 feels like an unfinished diagram. It is not. B4 emits two events that nobody listens to, and drawing
imagined consequences under it would manufacture exactly the false seam §3 forbids.

### 0.4 The machinery every flow sits on

`service → publisher.publishWithin(manager, …)` writes an `outbox_messages` row **inside the caller's
business transaction** (`core/events/domain-event-publisher.service.ts`) → `OutboxRelay.relayPendingBatch`
polls pending rows → `EventBus.dispatch` → registered handlers → status `processed`, or `attempts += 1` and
`failed` after `MAX_ATTEMPTS` (`outbox-relay.service.ts`).

Do not draw this pipeline in the nine process flows — it is identical in all of them and belongs to flow 10.
What it justifies in the process flows is the **dash**: publication is transactional, delivery is not.

---

## 1. Board structure — five acts, read in order

**Superseded 2026-09-16.** An earlier ruling here kept Talha's three sketch headings as the layout, on the
grounds that his axis (actor) and §6's (domain) were different and non-competing. That was the right call
while his sketches were placeholders and nobody had asked for a restructure. He then asked for one:
*"restructure it, order it better… proper consistent flows that make sense and tell a story."*

**Actor-grouping cannot tell a story. It tells three stories in parallel**, one per actor, and asks the
reader to interleave them. Judged against his own stated criterion, the domain order wins — and it wins
because it is already chronological. This is the life of a company inside the system:

| Act | Section label | Flows | What the act says |
|---|---|---|---|
| **01** | ACCESS & IDENTITY | A1 signup · A2 client onboarding · A3 login, select & switch | a workspace comes into existence, and people get into it |
| **02** | PEOPLE | B4 employee onboarding · B4b reporting line & assignment · B5 separation | people arrive, are placed, and leave |
| **03** | TIME | C6 leave request · C7 clock → timesheet → lock | what those people do with their days |
| **04** | MONEY | D8 payroll run → payslip · D9 invoice → issue → paid | days become pay, and pay becomes revenue |
| **05** | SYSTEM | E10 module boundaries & event map | the machinery underneath all four |

Read top to bottom that is a sentence: *a company is created, staffed, worked in, paid out, and here is the
machine that did it.* Nothing in the grammar changes — this is where diagrams sit and in what order, not
how they are drawn.

**Sign-up precedes sign-in, and that ordering is load-bearing.** You cannot log into a workspace that does
not exist. A1 creates the tenant; A3 enters it. Talha's instinct — *"first flow would be either sign in or
sign up"* — resolves to signup, and the two Access flows either side of it (A2's Tethr-driven path, A3's
multi-workspace picker) only make sense once the reader has seen a workspace get made.

**B5 stays with B4 rather than moving to the end.** Chronologically a separation is the last thing that
happens, and putting it last would give the reader billing and payroll *before* the flow whose fan-out
touches them. That is the more dramatic order. It is not the better one: Act 02 promises a lifecycle, and a
lifecycle includes its end. Splitting it leaves Act 02 incomplete and Act 05 a dumping ground. The forward
references in B5's band 3 — billing closing a membership, payroll opening a final settlement — are module
names, and a forward reference to a module the reader meets two acts later is a thing a map tolerates.
**Section cohesion beats chronological drama.**

### 1.0 Clearing the sketches

Talha has asked for the placeholder sketches to go: *"i need to clean out all the rest bs."* That waives the
earlier standing instruction to leave everything he drew untouched — it was mine, protecting his work while
he was away, and he is present and explicit now.

- **Clear** the sketch boxes that a finished diagram replaces, as that diagram lands. Not in advance: a
  region should never be empty of both the sketch and its replacement.
- **Keep** the "Development Process — Tethr" region. That is reserved space for work he said he would fill
  in himself, not leftover scaffolding. Place nothing there and remove nothing from it.
- **Log every removal** in `diagram-build-log.md` with what was removed and what replaced it. Deleting
  someone's canvas content is not reversible by them if they cannot see what went.
- **Anything ambiguous stays and gets listed** for him rather than being judged. The cost of leaving one
  stray sticky is a stray sticky; the cost of deleting something he meant to keep is unrecoverable.

**"Salary Slip" is the tail of D8, not its own flow.** `PayrollRunService.getPayslipWithLines`
(`payroll-run.service.ts:921`) is a read against a finalized run. Drawing it as a separate diagram would put
the same flow on the board twice, which damages the one-map property worse than any palette slip. Draw it
once inside D8, with the employee-facing payslip view as a band-1 surface. If Talha wants an
employee-perspective *retrieval* flow, that is a different and nearly trivial diagram — his call, made
explicitly, not by default.

### 1.0.1 What the key must contain

The current legend is four role swatches and three connector samples. That is a **vocabulary** list, and the
thing a first-time reader most needs is the **grammar**. Rebuild it to carry both.

The gap is specific and it is the whole reason the key needs work: **bands are a layout rule, so nothing on
any diagram is ever labelled with its band.** A reader shown nine diagrams has no way to discover that
vertical position carries meaning. It is the single most load-bearing convention in the set and it is
invisible on every artefact that uses it.

So the key, top to bottom:

1. **A miniature three-band diagram** — four small boxes, one pill, one failure exit, correctly positioned,
   with the three band meanings labelled to the left: *the human · the synchronous spine · the async plane*.
   One row of type each. This is the part that is new and the part that matters.
2. **The four roles, labelled with their meaning**, not just shown: process box (*a step the system takes*),
   event pill (*published on the outbox*), failure exit (*this flow can end here*), boundary frame
   (*execution inside a tenant context* — and nothing else).
3. **The two edges, labelled**: solid (*synchronous, the happy path*), dashed royal blue (*fire-and-forget
   consequence*). The dash is on the relationship, never the node — say so here, because that is the rule
   an editor is most likely to undo by restyling a pill.
4. **One line on type**: DM Mono means *this exact string exists in the codebase*. Without it the identifier
   lines read as decoration.
5. **The section-label motif itself**, shown once, so a reader knows the eyebrow-rule-title stack is a
   header and not a diagram element.

Keep it a reading instrument: no ornament, no chain link, no sample of the palette for its own sake. A
swatch a reader cannot name the meaning of is not helping them read.

It stays board furniture under its own `KEY` label with generous clearance above the first act's section
label, per §8 — and it remains the reference copy every diagram takes its shapes from.

### 1.0.2 Board layout — how the acts are sectioned and paced

**The diagnosis.** Eleven diagrams sit in one column with no typographic level above the flow title.
Eleven titles at 34px, eleven eyebrows at 12px, and the only thing announcing an act is an eyebrow that
repeats the same words three times running. **There is no hierarchy, so there is no navigation** — a reader
scrolling ten thousand pixels has nothing telling them where they are or how much is left.

Everything below adds one level above the flow title and paces the column against it. No diagram's internals
change.

**Acts flow horizontally. Each level of the hierarchy alternates axis.**

> **Reversed 2026-09-17.** An earlier draft of this section ruled one vertical column, arguing that a story
> has one reading order and columns make it ambiguous — *down, or across?* That argument was wrong twice
> over. It objected to a **grid** while rejecting **horizontal**, which are not the same thing; and the
> ambiguity it feared is already handled, because **the acts are numbered and indexed, so the order is
> carried by `01…05` and the table of contents, not by position.** Once numbering carries the sequence,
> position is free to serve scanning instead. Talha asked for a board that is good to sift through, and
> sifting is scanning, not serial reading.

The layout principle, which is worth more than the specific arrangement:

| Level | Axis | Why |
|---|---|---|
| A flow's spine | **horizontal** | left to right already means sequence (§1) |
| Diagrams within an act | **vertical** | keeps the act one narrow column, and avoids horizontal-inside-horizontal |
| Acts across the board | **horizontal** | landscape, like every screen and every deck these are read in |

**Each level alternates axis, so a reader never confuses which level they are traversing.** That is the
whole reason this works, and it is the constraint to preserve if the arrangement ever changes.

**Arrangement: three acts per row, wrapping.** With five acts that is `01 02 03` / `04 05`. Roughly
9,200 × 4,400 — about 2:1, close to the shape of a screen, against the 1:4.4 ribbon it replaces. Column
widths are set by the widest diagram in each act; row heights by the tallest column in that row. **Ragged
column heights are fine** — Act 05 holds one diagram and will be short. Do not pad acts to match.

Do not widen diagrams to fill a column, and do not reflow a flow's spine to make a column tidier. The
diagrams are fixed; only their placement moves.

**1 · Masthead, index, key — the opening.** Top-left, above the first act row, reading down:

- The board title, already present.
- **An act index**, five lines, each the act number, its name, and the one-line description from §1's table.
  A ten-thousand-pixel document needs a table of contents; this is it, and it is the cheapest navigation aid
  available.
- One line of reading instruction: the acts run top to bottom in the order a company lives through them.
- **The key**, moved out of its island at `-6000` and into the column above Act 01. It is the first thing a
  reader needs, so it belongs where they arrive, not off to one side. §8's "top-left, generous clearance"
  is better served by this than by isolation.

**2 · The act header — the level that is missing.** Once per act, never per diagram:

| Element | Spec |
|---|---|
| Rule | **Full width of that act's column** × 3px, accent `#0755e9` |
| Act number + name | Manrope ExtraBold, uppercase, **56px**, tracking `+0.5px`, `#001131` |
| Description | Manrope Medium 16px, `#667899` — the §1 table's one-liner |

The rule is the same vocabulary as a flow's 64px rule, thirty-eight times longer. **Hierarchy through scale,
in a language that already does hierarchy through scale** — no new element is introduced. 56px against the
flow title's 34px reads unmistakably as one level up.

**3 · No act container, and this one is not negotiable.** Do not box an act in a stroked frame. **The
accent-stroked rectangle already means exactly one thing — execution inside a tenant context** — and a
container in the same treatment would give the set's most precise symbol a second meaning at board scale,
retroactively, across every diagram already drawn. §intro's rule is about this exact move. A rule plus
whitespace sections the board; a frame would cost more than it buys. A tinted background band is also out:
it competes with the boxes' white fills and it is the swimlane chrome §1 rejects, arriving one level up.

**4 · Rhythm.** Separation is carried by space, so the space has to be unambiguous:

- Diagram → next diagram **within** an act: current spacing, unchanged.
- Between act columns: **three times** the within-act diagram gap, and the same between rows. An act break
  must be visibly a *different kind* of gap, not a slightly bigger one — if a reader has to measure, it is
  not working.
- Act rule → act header: tight, they are one unit.
- Act header → first diagram: about one diagram gap.

**5 · The eyebrow earns its place.** It currently reads `01  ACCESS & IDENTITY` on three consecutive
diagrams, saying what the act header will now say, three times. Change it to carry position as well as
context:

```
01 · ACCESS & IDENTITY · 2 OF 3
```

Still one mono line at 12px. A reader inside the act knows how far through it they are, and a diagram
screenshotted on its own still says which act it belongs to — which the position alone would have lost.

**6 · Leave the right edges ragged.** Flows are 4 to 8 boxes long. **Do not pad short diagrams to line up.**
Padding would add content that means nothing to make a shape that means nothing, and B4's shortness is
load-bearing (§5). The act rule, spanning its column, gives a consistent edge to read against — which is
what raggedness actually needed: a frame of reference, not uniformity.

> **Scoped, 2026-09-25: ragged applies to diagrams, never to the panels that hold them.** When acts were
> headers and whitespace, ragged edges read as honest variation in content volume. Once §16 made each act a
> filled block, a row of blocks with different bottoms reads as broken rather than as honest — so the
> panels square up into a grid while the diagrams inside keep their natural size and position. **Content
> stays honest; containers square up.** A container larger than its contents is not padding, it is what a
> container is. This scopes the rule above rather than reversing it: nothing is added to a short diagram,
> and B4's shortness is still load-bearing.

**7 · Talha's "Development Process — Tethr" region is untouched**, in place, nothing added and nothing
moved.

### 1.1 Build order — A1 first, then §6's order

**Build in act order: A1, A2, A3, B4, B4b, B5, C6, C7, D8, D9, E10** — which is §6's order, and is now
also the board's reading order (§1). A1 is a rebuild; the original is stranded on an unreachable Figma
account. The rebuilt key (§1.0.1) comes before all of them.

The design head briefly ruled B5 first, on the grounds that `employee.terminated` fanning out to five
consumers is the best demonstration of what band 3 buys. Talha overruled it, and was right. Three reasons,
the third of which neither of us had:

1. **The board fills in reading order.** Regions read left to right, top to bottom. A set with its opening
   diagram missing and its fifth one present reads as broken, not as in-progress.
2. **A signup is where a reader's model of the product starts.** Ordering by which diagram best flatters
   the notation is a demo argument; ordering by the reader's journey is a product one.
3. **A1 is the set's reference composition, and the legend is not a substitute.** The legend fixes palette
   and shape vocabulary. A1 fixes *composition* — band spacing at full width, where the boundary caption
   sits relative to its frame, how a failure exit reads, how many identifier lines a diagram carries before
   it looks noisy. §5's gotchas cite A1's caption offset by name. Building the most complex diagram in the
   set before that reference exists on the current board means deriving it twice and reconciling later.

Deviating from §6's order needs a reason better than "this one demonstrates the grammar best." §6 is
dependency-ordered; that ordering was load-bearing and got overridden for presentation.

---

## 2. A1 — Self-serve signup

`AccountService.signUp` · `modules/account/account.service.ts:63`

**The original build is the reference composition for the whole set** (§1.1). Talha kept a capture of it and
it is the standard the rebuild meets or beats. Its spine is richer than an earlier draft of this section
said, and the diagram was right where the draft was wrong — both failure exits below are real.

- **Band 1** — the sign-up form: org name, email, password.
- **Band 2** — public prechecks (advisory, `legalNameIsAlreadyUsed`) → the `signUp` mutation (public, no
  session) → workspace guard (`hasCreatedWorkspace`, one self-serve workspace per person) →
  `OrganizationService.create` (slugifies the legal name, prechecks the slug, unique index behind it — *this
  row is the tenant*) → **boundary frame: `tenantContext.run(organizationId)`** wrapping
  `createUser({ isWorkspaceCreator: true })` → `assignSystemRole('clientAdmin')` → issue session token
  (JWT: userId + organizationId) → return `AuthPayload`.
- **Band 3** — `organization.created` pill. **Two** failure exits, both `ConflictError`: *already founded a
  workspace with this email*, and *workspace name taken* — the second because `slugify('Acme, Inc.')` and
  `slugify('Acme Inc')` collide on `acme-inc`, which is a genuinely non-obvious fact and earns its place.

There are two `tenantContext.run` calls on this path, not one: `OrganizationService.create` opens one
around its own `organization.created` publish, and `signUp` opens another around user creation. **Draw only
the second.** One frame per diagram is the budget; the inner one wraps a single publish and framing both
would turn the symbol into decoration.

**No `user.created` pill** (§0.2). The boundary frame is correct here and means what it always means: the
user is created inside the new tenant's context, and the organization is created outside it because the
tenant does not exist yet. That contrast is the diagram's point.

Identifiers (3): `AccountService.signUp` · `tenantContext.run(organizationId)` · `isWorkspaceCreator: true`.

### 2.1 Rebuilding A1 — what to keep, what to fix

**Keep, unchanged.** The section motif (mono eyebrow, blue rule, heavy uppercase title) is right. The
two-line box — human label above, code identifier below — is the pattern that makes the set readable, and
it should not change. Red failure exits hanging below the spine, the dashed royal-blue connector to the
event pill, and the section label sharing an x-origin with the first spine box: all correct, all preserved.

**Six defects to fix in the rebuild.** None is cosmetic; each one costs a reader something.

1. **Truncated labels.** *"org name + email + password…"* and *"already founded a workspace…"* both clip
   with an ellipsis. In a reading instrument a clipped label is a failure — the reader cannot recover what
   was cut and does not know how much is missing. **Shorten the text to fit the box; do not widen the box**,
   which breaks the pitch and cascades into every diagram after it.
2. **The boundary caption is a filled capsule, and so is the event pill.** `tenantContext.run(organizationId)`
   renders as a solid royal-blue chip; `organization.created` renders as a capsule. Two distinct roles
   wearing one silhouette, which is the thing §3 leans on to tell them apart — *capsule against the square*.
   The caption is specified in §5 as **plain royal-blue DM Mono text above the frame**, not a chip. Revert
   it. This is the highest-severity item here: it quietly spends the set's clearest visual distinction.
3. **Orphaned edge labels.** *"signed in"* floats between the last two boxes saying what the connector
   already says, and *"already founded"* sits above a failure box whose own first line repeats it. §5's
   gotcha calls this out directly. **Cut both.**
4. **Inconsistent box widths.** The spine boxes and the two failure exits each vary by a few pixels.
   One width, one pitch, no exceptions — an eye reads a ragged grid as sloppiness before it reads content.
5. **The event pill is not capsule enough.** It renders as a rounded rectangle at roughly box proportions.
   A capsule's corner radius is half its height; make it one, and let it be visibly shorter than a process
   box so the silhouette does the work.
6. **Spine length.** Nine boxes in one unbroken run is a long horizontal scan and the widest diagram in the
   set. Not a defect to fix by cutting content — the content is right — but the rebuild should confirm the
   right edge still clears the next act's column, and every later flow should treat nine as the ceiling
   rather than the norm.

## 3. A2 — Tethr-driven client onboarding

`AccountService.onboardClient` · `account.service.ts:108`

- **Band 1** — `WorkspaceOnboardingForm (stepped)` → `OnboardingFlow`.
- **Band 2** — `ClientService.getById | create` → `OrganizationService.create({ kind: 'client', clientId })`
  → **boundary: `tenantContext.run(organizationId)`** wrapping *two* user creations:
  `createUser({ isWorkspaceCreator: true })` + `assignSystemRole('clientAdmin')`, then `createUser` +
  `assignSystemRole('tethrAdmin')`.
- **Band 3** — `organization.created` pill.

**The two-admin seeding is this diagram's reason to exist.** Every client org gets a clientAdmin *and* a
tethrAdmin together, so there is never a window where a newly onboarded client has no Tethr staff able to
work inside it. Draw both branches; collapsing them to "create admins" throws away the fact.

Identifiers (4 — the cap bends for seams, §4): `AccountService.onboardClient` ·
`tenantContext.run(organizationId)` · `isWorkspaceCreator: true` · `assignSystemRole('tethrAdmin')`.
`isWorkspaceCreator: true` is the seam back to A1's guard — set here so a later self-serve signup with this
email is correctly recognised.

## 4. A3 — Login, workspace select & switch

`AccountService.login` `:159` · `listSwitchableWorkspaces` `:197` · `switchWorkspace` `:223`

- **Band 1** — `LoginPage` → (conditional) workspace picker.
- **Band 2** — `AccountService.login` → `AuthService.findVerifiedUsers(email, password)` → **branch on
  count**: exactly one → `getAccessForUserInOrganization` → `issueToken`; more than one →
  `issueWorkspaceSelectionToken(email, organizationIds)` + resolve display names → picker →
  `AuthService.resolveWorkspaceSelection(selectionToken, organizationId)`.
  Then the switch path: `switchWorkspace` → `findAccountsForEmail` → same-email, non-disabled guard →
  `issueToken`. **No password step** — the caller already holds a valid session.
- **Band 3** — no events. Failure exits: `UnauthenticatedError` (bad credentials) and
  `UnauthenticatedError` (*"You do not have an account in that workspace"*).

**No boundary frame on this diagram.** The module crossing from `modules/account` into `core/auth` is the
most interesting fact about A3, and §intro rules that it is carried by module-qualified identifiers at zero
structural cost — `AccountService.login` against `AuthService.resolveWorkspaceSelection`. The frame means
tenant execution and nothing else.

Identifiers (3): `AccountService.login` · `AuthService.resolveWorkspaceSelection` · `issueWorkspaceSelectionToken`.

## 5. B4 — Employee onboarding → assignment

`EmployeeService.create` `:97` · `AssignmentService.setReportingLine`
`modules/assignment/assignment.service.ts:126`

> **Corrected 2026-09-15 after the build session checked the exposed surface and this spec had not.** An
> earlier draft of this section routed band 2 through `AssignmentService.create`. That method has **no
> caller anywhere in `packages/api/src`** — it is reachable from `setReportingLine` and from tests, and
> nothing else. (`authz.service.ts:80,:99` calls a different `assignments.create` entirely: RBAC role
> assignment, `userId`/`roleId`. Same word, different module.) Verified with:
> `grep -rn "assignmentService.create" packages/api/src --include=*.resolver.ts`

> **Split 2026-09-16.** This was one diagram with a deliberately broken spine. At ten band-2 boxes it
> overran the width budget, and the branch inside `setReportingLine` is a real two-armed branch that cannot
> be drawn as a skip. It is now **two diagrams** — §5 here and §5.1 below — because the seam they split on
> is one the code already has: two GraphQL mutations, two permissions, two band-1 surfaces. Three
> independent axes agree, which is what distinguishes a real seam from a layout convenience.
>
> **The condition attached to that split is not optional** — see §5.1. The broken spine was carrying the
> set's best product finding, and a split that drops it is worse than an overrun diagram.

**B4 is the flow where a person becomes a record, and then it stops. The stopping is the point.**

- **Band 1** — the employee create form.
- **Band 2** — `EmployeeService.create`: one transaction, save `Employee` (`employmentStatus: 'active'`,
  `workerType` default `'permanent'`) → publish `employee.created` → audit. **Ends there.** The new
  employee holds no assignment and no position, and nothing in this flow gives them one.
- **Band 3** — `employee.created` pill. Nothing else; it has no consumer (§0.3).

A four-box spine with one pill under it will look sparse beside A1's eight. **Leave it sparse.** The flow
genuinely is this short, and padding it to look substantial would be the first lie in the set. Its
shortness is the same statement the broken connector used to make.

**Talha's sketch says Name / Role / Salary / XYZ. Salary is not written here.** `CreateEmployeeInput`
(`employee.resolver.ts:246`) carries no salary field; pay lives in `finance/compensation`
(`PaySetupPanel`, `CompensationPage`). Draw what exists — an employee record and an assignment — and do not
add a compensation step to match the sketch. **Flag this to Talha:** his sketch may be describing a composite
onboarding form he wants and does not yet have, which is a product finding worth more than the diagram.

Identifiers (3): `EmployeeService.create` · `AssignmentService.setReportingLine` ·
`NotFoundError('No position to assign this employee to')`.

**No boundary frame on this diagram.** A1 and A2 earn the frame because they bootstrap a tenant that does
not exist yet; B4 runs entirely inside the caller's established tenant, so there is no crossing to mark.
Framing it would make the symbol mean "this is multi-tenant software" — true of every diagram in the set,
and therefore the second meaning §intro forbids. The same applies to §5.1.

## 5.1 B4b — Reporting line & assignment

`AssignmentService.setReportingLine` · entered only from `setEmployeeManager`
(`employee.resolver.ts`) — the single exposed door into the assignment module.

**The condition on the split.** B4's broken connector was asserting a product finding: a freshly created
employee has no position, and there is no path that gives them one. A missing connector asserts that. **Two
separate diagrams do not** — they read as two unrelated features, and an absence is far easier to miss than
a statement. So the finding moves here and gets stated positively instead:

> **`NotFoundError('No position to assign this employee to')` is this diagram's most prominent failure
> exit, not a footnote among three.** Give it the leftmost, largest exit position. A reader who has just
> come from B4 — where an employee was created with no position — arrives at a flow that refuses exactly
> that employee. That is a stronger assertion of the gap than the broken connector ever was, because it is
> something the diagram says rather than something it omits.

- **Band 1** — the manager / reporting-line control (`setEmployeeManager`).
- **Band 2** — `setReportingLine` → self-reporting guard (`EffectiveDatingError`) → `assertNoReportingCycle`
  → `currentPrimary(employeeId, effectiveDate)` → **the branch**, two arms:
  - **same-day correction** (`current.validFrom === effectiveDate`) → `correctReportingLine` edits the row
    in place → publishes `assignment.updated`;
  - **dated change** → `end(current.id, effectiveDate)` (publishes `assignment.ended`) → `create`
    (publishes `assignment.created`).
- **Band 3** — `assignment.updated`, `assignment.ended`, `assignment.created` pills, none with a consumer.
  Failure exits: **no-position** (foregrounded, above), self-reporting, reporting cycle.

Eight boxes at most, which now fits: the two permission gates and `EmployeeService.create` left with §5.

**Draw the branch as two short parallel runs inside band 2, not as a fourth row.** A fourth y-position with
a meaning is a band, and inventing a band to hold branch arms is the swimlane failure arriving by the back
door — §1.1 pre-ruled the analogous case for multi-actor flows. Two arms at the same y, diverging from
`currentPrimary` and both terminating into band 3, stay inside the grammar.

The half-open range rule is the best effective-dating material in the set and it is why this diagram now
has room to exist: closing the old assignment *at* the effective date leaves no gap and no overlap with one
starting the same day, and a change on the day the assignment starts is a correction rather than a new
dated fact, so history does not fill with zero-length ranges. That distinction is the whole reason the
branch has two arms, and collapsing it into one box would have spent the diagram to say nothing.

Identifiers (3): `AssignmentService.setReportingLine` · `current.validFrom === effectiveDate` ·
`NotFoundError('No position to assign this employee to')`.

## 6. B5 — Separation / offboarding

`EmployeeService.separate` `:224` (`terminate` `:213` delegates to it)

- **Band 1** — `Admin · record separation` (role-prefixed per §1.1).
- **Band 2** — one transaction: set `employmentStatus: 'terminated'` + `terminationDate` → publish
  `employee.terminated` → create `EmployeeSeparation` (type, relieving date, reason, encashment) → publish
  `employee.separationRecorded` → seed offboarding task definitions (clearance, …).
- **Band 3** — **two** pills from that transaction: `employee.terminated` and `employee.separationRecorded`.
  `employee.terminated` fans out to **five consumers in four modules** — disable logins (`core/auth`), end
  benefit enrollments, close billing membership at the last working day, close compensation records, open
  final settlement.

> **Corrected 2026-09-16.** An earlier draft listed four sibling pills here, adding
> `employee.offboardingTaskUpdated` and `employee.exitInterviewRecorded`. **`separate()` publishes exactly
> two.** It seeds six offboarding task rows and publishes nothing for them; `offboardingTaskUpdated` fires
> later from `employee-offboarding.service.ts` when a task is *updated*, and `exitInterviewRecorded` from
> `employee-exit-interview.service.ts`. Both are real parts of offboarding but they are **downstream
> operations with their own band-2 steps**, not siblings in the separation transaction. Drawing them as
> siblings would say one transaction emits four events, which is false.

**This is the richest diagram in the set and the best argument for band 3 existing at all.** One admin
action, one transaction, five modules reacting without a single synchronous call between them.

### 6.1 A fan-out is drawn as a fan

**Ruled 2026-09-16, and this is a rule rather than an exception for B5.** Where one event has several
consumers, they **stack vertically off the publishing pill**, one dashed connector each — they are not laid
out left to right.

The reason is semantic before it is spatial. **§1 establishes that band 2 reads left to right: horizontal
position means sequence.** The five consumers of `employee.terminated` fire independently off one dispatch;
none precedes another. A horizontal row would assert an order that does not exist, which makes it wrong
rather than merely wide. Narrowing the boxes to fit the row (and breaking one-width-one-pitch) or letting
the row overrun the column both preserve the lie and pay for it.

**Why this is not the fourth-row failure rejected for B4b's branch arms.** Those two arms are *the same kind
of thing* — two ways one mutation proceeds — so they belong at one y, and separating them would have
invented a distinction. Pills and consequence steps are *different kinds of thing*, and the language
already says so: a pill states that an event was emitted, a consequence step states that a module reacted,
and §0.3 permits the second only where a consumer is registered. Giving them different y-positions reflects
a distinction the grammar already carries. Inventing one, and reflecting one, are not the same move.

This also spends the cheap axis. Horizontal space is bounded by the next act's column; vertical space is
bounded by the next act's row, and acts simply move down. **B5 becomes tall rather than wide**, band 3's
top row stays two pills across, and the eight-box budget is never approached.

Today `employee.terminated` is the only event with more than one consumer — `node scripts/verify-events.js
--pill <name>` says so per event. The rule stands for whichever event acquires a second one next.

Identifiers (3): `EmployeeService.separate` · `employmentStatus: 'terminated'` ·
`disableUsersForEmployee` (the seam into `core/auth`).

## 7. C6 — Leave request → approval

`LeaveRequestService` · `modules/leave/leave-request.service.ts:64`

- **Band 1** — `Employee · request leave` → `Approver · decide` (§1.1 role prefixes; **no split band**).
- **Band 2** — date-order guard → `LeaveTypeService.findById` → `HolidayService.getHolidayDates` →
  `countWorkingDays(start, end, holidays)` → `resolveEntitlement(employeeId, leaveTypeId, default, startDate)`
  → transaction: balance guard `entitled − used − pending` → reserve `pendingDays` → save `LeaveRequest`
  (`status: 'pending'`) → publish `leave.requested` → workflow engine approval → `approve` / `reject` /
  `cancel`, each settling the reserved balance.
- **Band 3** — `leave.requested`, `leave.approved`, `leave.rejected`, `leave.cancelled` pills. **No
  consumers.** Failure exits: `ValidationFailedError` — *"Requested range contains no working days"* and
  *"Insufficient leave balance"*.

> **`leave.cancelled` is not an approver outcome.** The first build hung all three of approved / rejected /
> cancelled off the approval step. `approve` and `reject` take a `decidedByUserId`; **`cancel` does not** —
> the code says so outright: *"Cancellation by the requester — no decider, releases the reservation."* It is
> the requester withdrawing, which can happen while the request is still pending and without any approver
> involved. Give it its own band-1 entry (`Employee · cancel`) and its own short path to the pill. Drawn as
> an approver outcome it asserts that an approver cancels, which is false and is the kind of error a reader
> cannot catch because the picture looks reasonable.

The service comment says `leave.approved` "feeds Payroll later." **Later means there is no consumer today.**
Do not draw an arrow into D8.

The reserve-then-settle balance mechanic (`pendingDays` on submit, moved to `usedDays` on approve, released
on reject/cancel) is what makes this flow non-trivial. Show the reservation.

Identifiers (3): `LeaveRequestService.submit` · `countWorkingDays` · `status: 'pending'`.

## 8. C7 — Clock → timesheet → lock

`TimesheetService` · `modules/attendance/timesheet.service.ts`

- **Band 1** — `Employee · clock in/out` → `Employee · submit` → `Approver · approve` → `Admin · lock`.
- **Band 2** — `open` `:35` → `submit` `:52` (rolls up `TimeEntry` hours) → `approve` `:90` → `lock` `:108`.
- **Band 3** — `timesheet.submitted`, `timesheet.locked` pills. **No consumers.**

The service calls `locked` "the immutable handoff to Payroll." It is a handoff by intent, not by wiring —
no consumer exists — so it is a pill, not an arrow into D8. A four-state lifecycle in one band with two
pills below it; this is the simplest diagram in the set and should look it.

Identifiers (3): `TimesheetService.submit` · `TimesheetService.lock` · `status: 'locked'`.

## 9. D8 — Payroll run → finalize → payslip

`PayrollRunService` · `finance/payroll/payroll-run.service.ts`

- **Band 1** — `Payroll admin · create run` → review lines → `Payroll admin · submit for approval` →
  `Approver · finalize` → `Employee · payslip` (the "Salary Slip" surface, §1).
- **Band 2** — `createRun` `:285` → `updateRunLine` `:314` / `removeRunLine` `:388` → `finalizeRun` `:417`:
  guard (no lines) → `taxSlabs.getActiveLadder()` → per line, categorize components → `taxableBase` →
  `compensation.getTaxProfile(employeeId, periodEnd)` → compute withholding → set `status: 'finalized'`,
  `payDate`, totals → publish `payroll.finalized`. Payslip read: `getPayslipWithLines` `:921`.
- **Band 3** — **three inbound dashed arrows at the left** (§1.1's pre-ruled event-triggered case, arriving
  mid-flow rather than at the start): `compensation.revised`, `compensation.taxProfileChanged`,
  `benefits.enrollmentChanged`, each rising into `markDraftsStaleFor*` `:676`–`:690`. Outbound:
  `payroll.finalized` pill, dashed onward — **this is the seam to D9 and must render identically there.**

**The effective-dating fact is worth a box:** the tax profile is resolved against `periodEnd`, not against
the day finalize happens to run. That is non-negotiable #4 doing real work in the money path, and it is the
kind of detail a reader will not get from the code without hunting.

Three inbound staleness events make this the one flow where band 3 carries traffic in both directions.
Keep them at the left so the eye reads "these arrive, then the run proceeds."

Identifiers (3): `PayrollRunService.finalizeRun` · `compensation.getTaxProfile(employeeId, periodEnd)` ·
`status: 'finalized'`.

## 10. D9 — `payroll.finalized` → invoice → issue → paid

`BillingConsumer` `finance/billing/billing.consumer.ts:30` · `InvoiceService`

- **Band 3, far left** — inbound `payroll.finalized` pill, dashed connector **rising into band 2**. Band 1
  is empty at the start and that is correct (§1.1). This is the flow the pre-ruled case was written for.
- **Band 2** — `BillingConsumer.handle` → `idempotency.runOnce(CONSUMER_NAME, event, …)` → **boundary frame:
  `tenantContext.run(event.tenantId)`** → `InvoiceService.draftInvoicesFromRun(runId)` `:788` →
  `addDraftLine` / `updateDraftLine` `:1156`–`:1200` → `issueInvoice` `:1237` (unique-number retry on 23505;
  **snapshot sender name, address, bank details and payment terms onto the invoice**; `status: 'issued'`) →
  publish `invoice.issued` → `markInvoicePaid` `:1341` (pessimistic write lock, `status === 'issued'` guard,
  `paidAt`, `paymentReference`).
- **Band 1** — `Finance · review draft` → `Finance · issue` → `Finance · confirm payment`.
- **Band 3, right** — `invoice.issued` pill. No consumer.

**Two things make this the most instructive diagram in the set.** First, `tenantContext.run(event.tenantId)`
is the boundary frame's purest case: the relay runs outside any request, so there is no ambient tenant and
one must be re-established from the event. Nowhere else does the frame's meaning — *execution inside a
tenant context* — matter so visibly. Second, the issue-time snapshot of sender and bank details is
non-negotiable #3 drawn: the invoice keeps the values it used, so reprinting it years later does not pick
up today's bank account.

Identifiers (4 — seam bend): `BillingConsumer` · `tenantContext.run(event.tenantId)` ·
`draftInvoicesFromRun` · `status: 'issued'`.

## 11. E10 — Module boundaries & event map

**Not a process flow.** No actor, no happy path, no bands, no time axis. Build it last, under its own rules.

Content, counted at build time rather than copied from here:

- **`core/` (12)** — audit, auth, authz, config, database, documents, events, notifications, pdf, queue,
  tenancy, workflow.
- **`modules/` (15)** — account, assignment, attendance, benefits, clients, employee, employee-records,
  engagement, expenses, finance, forms, leave, organization, position, recruitment.
- **The dependency rule as structure:** `modules/` → `core/`, never the reverse.
- **Arrows are consumers, not publishers.** The only real runtime couplings are the eleven registrations in
  §0.3. Draw those seven events as arrows between modules; the remaining twenty-seven published events are
  emitted and unheard, and should read as such.

**The asymmetry is the map's thesis: thirty-four events published, seven listened to.** Resist the urge to
present that as a gap. It is a modular monolith with its seams declared before its couplings are needed —
which is the architecture working, not failing. But it must be drawn honestly; a map that implies
thirty-four live couplings would be a lie about the system.

### 11.1 E10 is a coupling map, not an inventory — rebuild

The first build drew all twenty-seven modules as a grid, then tried to route seven couplings across it. It
does not work, and the reasons generalise:

- **Connectors route through boxes.** The `employee → core/auth` line passes straight through `engagement`.
  With a full grid there is no clean path, because **a grid ordered for inventory and a layout that needs
  adjacency for arrows are in direct conflict** — and inventory won by default.
- **The same relationship is drawn two ways** — short arrows between adjacent cells, long routed arrows over
  the top. A reader cannot tell they mean the same thing, and adjacency begins to look meaningful when it
  is not.
- **The prose block and the mono coupling table exist because the arrows failed.** A diagram that needs a
  table restating its own content is telling you the diagram is not carrying it. The table is the tell, not
  the fix.

**The rule that follows: draw the couplings, list the rest.**

- **Boxes only for modules that have an arrow** — today `employee`, `core/auth`, `benefits`,
  `finance/billing`, `finance/compensation`, `finance/payroll`, `forms`, `recruitment`. Eight boxes,
  positioned **for the arrows** rather than alphabetically, so every connector is a straight run that
  crosses nothing.
- **Everything else is one line of text**, named under a label saying what they are: emitted and unheard,
  or not yet publishing. They are inventory, and inventory is what `verify-events.js` is for.
- **Cut the mono coupling table.** Once eight boxes carry seven clean arrows it is duplicate content.
- **One sentence of prose, not four.** The thirty-four-published/seven-listened asymmetry is the thesis and
  earns a line. Which registrations are intra-module belongs in this document, not on the canvas.
- **Do not hardcode `modules/ (15)` / `core/ (12)` into labels.** A count in a label is a fact with an
  expiry date — the same rule as everywhere else.

**No box on this map wears the boundary treatment.** The rebuild rendered `core/auth` in the accent fill
and royal-blue stroke to mark it as platform rather than domain. That treatment means exactly one thing —
execution inside a tenant context — and E10 is the worst possible place to give it a second, because this
is the diagram a reader consults to learn how the modules relate. **The `core/` prefix in the label already
carries it**, at zero cost and with no ambiguity. The tell was that the prose underneath had to explain the
box: *"the one core box above is a consumer, not a dependency."* A symbol needing a caption to disambiguate
it has already failed.

Four of the eleven registrations are intra-module (`finance/payroll` consuming `compensation.revised` and
`compensation.taxProfileChanged`, `finance/billing` consuming `payroll.finalized`, `recruitment` consuming
its own `hiringRequest.submitted`) so they have no arrow *between* boxes. Draw all four as a short self-loop
or omit all four and say so in the prose line — either is honest; inconsistency between them is not.

---

## 12. Gaps found while specifying

Findings for Talha, not diagram content. Recorded here because they surfaced from reading the code against
the flows, and would otherwise be lost.

1. **`user.created` and `user.linkedToEmployee` are declared and typed but never published.** Two of
   thirty-six. Either wire them or drop them; a permanently unfired event in a shared contract is a trap for
   the next person who assumes it fires.
2. **B4's onboarding form does not capture salary**, though Talha's own sketch says it should. That is
   plausibly a real product gap rather than a sketch error.
3. **The language doc's event count (33) was stale.** Replace the number with the command in §0.1 so it
   cannot go stale again.
4. **`CLAUDE.md`'s "Current state" claims Phases 0–2.** The tree holds finance, expenses, benefits,
   recruitment, engagement, forms, clients and employee-records — Phases 3–5 in substantial part. The
   orientation doc understates the system by two phases, which is how a reader ends up planning work that
   already exists.
5. ~~No `scripts/verify-events.js` exists.~~ **Written and committed.** Every claim in §0.2 and §0.3 is now
   reproducible in one command, so flow 10's inventory and every future pill can be re-verified instead of
   rebuilt from scratch. This was the load-bearing one: the doc set's new rule is *rules here, facts in the
   code*, and a rule that says "go verify" without a tool to verify with is a rule people skip.

---

## 13. The second perspective — three human journeys

Talha: *"make 2 different perspectives, one is technical other is non technical for a user to understand
the basic flow. Understand flow more in depth like a human would do and make the flows that way so that it
doesn't have any gaps or flaws."*

### 13.1 The two views differ in what counts as a step — not in how much jargon they carry

**Stripping the identifiers off a technical diagram yields a worse technical diagram, not a human one.** It
still has guards, service boundaries, event pills and failure exits — none of which a person experiences.

| | Technical set | Human set |
|---|---|---|
| The unit is | a service call | a moment the person lives through |
| The narrative is | what the system does | what the person does, sees, waits for and decides |
| It fails when | it says something false about the code | it skips a moment the person actually has |

### 13.2 It is three journeys, not eleven mirrors

**The technical set fragments by module because the module is the technical unit. A person's experience
does not fragment there.** Nobody lives through "flow A1, then flow B4" — they live one continuous life in
the product. Mirroring eleven diagrams would impose the system's seams on a reader who does not have them.

Three lifelines, each one continuous strip read left to right:

- **The founder** — finds the product, signs up, lands in an empty workspace, adds people, runs a first payroll.
- **The employee** — is added by someone else, gets access somehow, requests leave, logs time, is paid, leaves.
- **Tethr staff** — onboards a client workspace, seeds its admins, supports it.

The employee journey is the one to draw first. **It is the only journey whose first moment is something
another person did**, and that asymmetry is where most of the gaps below live.

### 13.3 Its own grammar — four marks, and one of them is the point

The three-band grammar does not apply: bands 2 and 3 are system concepts. This view gets its own minimal
set, reusing the existing palette and type so the two views read as one family.

| Mark | Means |
|---|---|
| **Moment** | a box: what the person does, or what they are shown |
| **Wait** | the person is waiting on something out of their hands |
| **Decision** | the person chooses, and the branches differ for them |
| **Dead end** | *the journey stops here and the product offers no way forward* — failure red, the existing colour for "this ends here" |

**The dead-end mark is the instrument, not a decoration.** Talha asked for flows with no gaps; a gap is
found by walking a journey and being forced to draw *"…and then nothing happens."* That is exactly how B4's
missing assignment path surfaced — nobody reasoned it out, someone tried to draw the next step and there
wasn't one.

**When a dead end appears, draw it. Do not route around it, and do not invent the step that should be
there.** A journey drawn as it should be is fiction; a journey drawn as it is, with the hole visible, is
the deliverable. Every dead end goes in §13.5 as a product finding too.

### 13.4 The human view is the index into the technical one

Each moment carries the act that covers it — `→ 02 PEOPLE` — in the mono eyebrow style. A reader starts
with what a person experiences and descends into how the system does it. That is the order of
understanding, so the human strip sits **above** the technical acts on the board, read first.

### 13.5 Gaps this pass will surface — verified before drawing

These came out of walking the journeys against the code. **Verify each at build time** rather than
trusting this list; the commands are given. They are findings for Talha, and several are the *reason* a
journey dead-ends.

1. **Almost nothing notifies anyone.** `NotificationService` is real — Resend email, Slack webhook, both
   with logger fallbacks — and has **exactly two call sites in the entire API**, both in `recruitment`
   (`application-intake`, `hiring-request-submitted`).
   ```bash
   grep -rn "notifications\.send" packages/api/src --include=*.ts | grep -v '\.spec\.' | wc -l
   ```
   So: a leave request reaches no approver, an approval reaches no employee, a submitted timesheet reaches
   no one, a finalized payroll announces itself to nobody, a ready payslip is never mentioned, and an
   issued invoice is never sent to the client. **Every one of those is a person waiting for something that
   never arrives** — the single largest gap class in the product, and invisible in the technical set
   because the system is behaving correctly at every step.
2. **There is no invite flow, and the product tells users there is.** `signUp` refuses a second workspace
   with *"Ask an admin to invite you into another one"* — no invite mutation, no invite email, no
   acceptance path exists. The copy promises a door that is not there.
3. **`UserStatus` declares `'invited'` and nothing ever writes it.** The column defaults to `'invited'`,
   but `createUser` sets `status: 'active'` explicitly, and `findVerifiedUsers` only excludes `'disabled'`.
   A state with no transition in, and no behavioural effect. Same class as `user.created`: declared, never
   used.
4. **A2 seeds two admins with passwords typed by Tethr staff.** `onboardClient` takes `adminPassword` and
   `hrAdminPassword` as inputs, and nothing emails either person. Those credentials have to travel
   out-of-band, which is both a journey gap and a security one.
5. **B4 creates an employee who cannot be placed** — no exposed `createAssignment`, so they hold no
   position, and setting their manager fails with *"No position to assign this employee to."* Already
   drawn in the technical set; on the employee journey it is the **first** dead end, one moment in.
6. **The founder lands in an empty workspace with no next step drawn.** A1 ends at "authenticated". What
   the person sees then — an empty state, a checklist, nothing — is unanswered, and it is the moment that
   decides whether they stay.
7. **The probation process is stored and never computed.** `noticePeriodDays` and `probationEndDate` are
   carried through `create-employee.input.ts`, `employee.output.ts`, `update-employee.input.ts` and the
   resolver — settable, readable, and **read by no service.** Nothing schedules from them, warns on them or
   ends anything because of them.
   ```bash
   grep -rn "probationEndDate\|noticePeriodDays" packages/api/src --include=*.ts \
     | grep -v '\.spec\.' | grep -v migrations | grep -v '/dto/' | grep -v resolver
   ```
   **This is the sharpest instance of the pattern, because of where it lands.** `06 EMPLOYEE PERFORMANCE`
   — the hand-drawn diagram this whole grammar was taken from — describes a 30/90-day probation cycle with
   notifications, deferrals and a post-probation letter. The system stores the dates that cycle turns on
   and computes nothing from them. Same class as the notification gap and as `'invited'`: **the data model
   anticipating a process nobody built.** A diagram of 06 drawn against the code would be almost entirely
   dead ends.

### 13.6 Build practice

**One pass, all three journeys**, pre-ruled so nothing needs to come back: grammar is §13.3, persona count
is three, dead ends get drawn rather than fixed, and a dead end is a finding rather than a defect. Same
readback-and-log discipline per diagram. Screenshot each — the defects that matter here are collisions and
illegibility, which no readback sees.

---

## 14. Curating the set against 06 — the hand-made standard

Talha: *"review the 06 employee performance one on your own and using that as a standard since it was
handmade by a human, curate the other ones too… I want this to be crystal clear process flow with no room
for errors and most if not all cases handled for and accounted for, specially the HAPPY FLOW."*

Reviewed on canvas at full resolution, 2026-09-22. **06 is better than the generated set at five specific
things and worse at four.** Import the five; do not import the four. Reverence is not curation.

### 14.1 What 06 does that the generated set does not

**1 · The happy path is one unbroken row, and everything else hangs below it.**

`Employee Fully Onboarded · Day 0` → notify manager → notify HR → notify manager → post-probation clauses
→ confirmation received → letter to employee → `Post Probation Review Cycle Completed`. Eight boxes, one
line, no interruption. **A reader finds the happy path in under a second, because it is the only thing that
runs all the way across.**

Our band 2 is *defined* as "the synchronous spine… the happy path" — but in a branchy flow it *contains*
the branches, so the happy path is inferable rather than visible.

> **Corrected 2026-09-22, on canvas evidence.** A first draft named C6's `leave.approved` / `leave.rejected`
> as the proof case. **It is not one.** Both are *pills in band 3* reached by dashed connectors from a
> single box, and `Approver · decide` has exactly one outgoing connector — there is nothing on the spine to
> drop. C6's band 2 already runs unbroken and passes §14.3's own cover test today.
>
> **And the symmetry should not be fixed.** §3 forbids restyling a pill to suit a diagram — the same pill
> is a joint into the plain-language mirror and anywhere else it appears, so per-diagram emphasis would
> break the property that makes the set one map. Nor is there a mark to spend: highlighting `leave.approved`
> marks *the norm*, which §3's asymmetry argument rules out, and red on `leave.rejected` would miscolour a
> valid business outcome as a failure. **The words carry it, no mark is warranted, and the question is
> closed** — happy/unhappy asymmetry lives in band 2's shape, not in band 3's styling.

**2 · Elapsed time is labelled on the connector.** `30 Days Later`, `85 Days Later`. §1.1 rejected a time
axis for a good reason — horizontal position cannot encode sequence *and* duration at once. **That ban
overshot: it killed the axis and took duration labels with it.** A label on an edge encodes nothing
positionally; it just says how long the wait is. For a ninety-day probation that is the most important fact
in the flow, and our set cannot currently express it at all.

**3 · Pre-requisites are stated off to the side.** *"Need to log manager email & name at onboarding · Need
to train employee on how this process works · Need to train manager on how this process works."* These are
**conditions that must already be true for the flow to work**, and two of the three are operational rather
than technical — they exist in no codebase, and no amount of reading the API would surface them. The
generated set has no device for this and is therefore silently incomplete.

**4 · Per-client configuration is stated.** *"30 Day review on/off · Post Probation Date − 90 Day review
on/off · Further review cadence 3mo / 4mo / bi-annual."* CLAUDE.md's non-negotiable #5 is *configuration is
data, not code* — and **not one diagram in the set shows which parts of a flow a tenant can change.** A
reader cannot separate fixed behaviour from a client setting, in a product whose architecture rests on that
distinction.

**5 · One negative assertion, drawn.** *"90-Day Review CANNOT be rejected by manager. Only Tethr user
can."* A stated constraint that forecloses a misreading. Cheap, and there is no equivalent anywhere in the
generated set.

### 14.2 What the generated set does better — do not regress these

- **Failure exits in red.** 06 has none. Its Snooze and Reject arms are correctly *not* failures, but 06
  has no way to say "this ends badly" at all, and our set does.
- **The async plane.** 06 draws `Send System & Email Notification` as an ordinary synchronous step. It is
  not. The pill-and-dash distinction carries something 06 cannot.
- **Systematic bands.** 06's second row sits at an ad-hoc y; ours means the same thing everywhere.
- **Named nodes and correct spelling.** 06's diamond reads `Decision`, which names nothing, and it carries
  three spelling errors. **Take the construct, not the accident** (§2.4).

### 14.3 Ruling 1 — happy-path primacy

**Where a flow has more than one outcome, the happy path runs unbroken along band 2 to a captioned
terminator, and every alternative leaves it downward.** The happy path is the only thing that reaches the
right edge.

**Band 2 carries one path — the happy one. Everything else sits below it.** That covers two cases a
narrower "arms drop downward" wording missed:

- **An alternative arm** drops below band 2 before running right, and never continues along the spine.
- **An independent secondary path** — its own band-1 entry, not a branch off anything — also sits below
  band 2. C6's `Employee · cancel` is the live case: it currently occupies band 2 *to the right of* the
  approval box, so the rightmost thing on the spine is a cancellation and the happy path stops short of it.
  The rule bites correctly there. **The reserved property is that band 2's rightmost extent belongs to the
  happy path**, and it does not matter whether the thing out-reaching it is an arm or a separate entry.

Where a flow has two arms, the happy one is the **ordinary** case, not the tidier-looking one. B4b's is the
dated change (`End current` → `Create new`); the same-day correction drops below. That is not a guess —
`domain-event.ts` says `assignment.updated` is *"a correction to an assignment that has not taken effect
yet… typically fixing a mistake rather than dating a real change."* **Fixing a mistake is not the happy
path.**

- Also applies to A3 (single-match login is the spine; the picker drops), D8 and D9.
- **This is a layout rule, not a new mark.** Nothing is added; things move.

> **B4b's actual defect is worse than "arms on the spine".** Its fork from `Find current assignment` runs
> `Correct in place` → `End current` → `Create new` **left to right along band 2**, so a reader scanning the
> spine sees three consecutive steps and the fork is invisible. A sequence that is really a choice is a
> stronger misreading than two arms of equal weight, because the reader is not weighing anything — they are
> confidently wrong about the order of operations.

The test, and it is exactly what Talha is asking for: **cover the diagram's bottom two-thirds and the happy
path must still read end to end.** If it does not, an arm is sitting on the spine and needs dropping.

**Scope: Ruling 1 governs outcomes, not frequencies.** Where two paths reach *the same* outcome by
different routes, neither is an alternative and nothing drops. A3 is the case: a single-match login and a
multi-workspace login both end authenticated, and the picker is not a deviation — it is an extra step some
users take. §2.3 already settled the structure there on coverage grounds (*structure follows coverage;
labels carry frequency*), knowing full well that it inverts frequency, and Ruling 1 does not reverse it.
Making the short path the spine would orphan the picker steps onto a branch and leave the spine showing
less than the whole mechanism.

**A common path is not the same thing as a happy path.** Frequency is metadata about a mechanism; the
superset path *is* the mechanism. If frequency should ever win over coverage, that is a reversal of §2.3
and belongs in §2.3, argued on its own terms — never applied as a side effect of a layout pass.

**C6's cancel path: merge the decision, do not relocate it.** The cancel path is complete in itself —
`Employee · cancel` in band 1, solid down to `Cancel, releasing the reservation` on band 2, dashed down to
`leave.cancelled` in band 3. **What it has no connector to is the request flow.** It is an independent path
sharing a diagram, not a fragment with a missing edge, and **an independent entry is not an arm** — Ruling
1's drop has no meaning for it, because you cannot subordinate a path to a spine it never left. (An earlier
draft of this line said it had "no connector to anything", which would send a reader hunting for an edge
that is not missing.) The code settles what to do instead: `approve`, `reject` and `cancel` all call the same `decide()`, differing
only in `decidedByUserId: null`. **So it is one mechanism with three outcomes and two triggers, and it
should be drawn that way** — one decision box on band 2, both actors in band 1 above it
(`Approver · decide`, `Employee · cancel`), three outcome pills in band 3, and a §2.4 terminator on the
spine reading `Request settled`. Band 2 then ends at the decision box, nothing out-reaches the happy path,
and Ruling 1 is satisfied structurally rather than by moving boxes around.

The trade, stated so it can be argued: merging loses the implication that a cancellation can happen earlier
than a decision. Band 1 carrying both actors and the box naming the no-decider case covers most of it, and
band 2 encodes sequence rather than elapsed time anyway (§1.1). If the canvas says otherwise once it is
drawn, that is worth reporting rather than absorbing.

### 14.4 Ruling 2 — duration on the connector where a wait is material

**§1.1's time-axis rejection stands; its accidental ban on duration labels is lifted.** A duration goes on
the connector as a label in the eyebrow style — DM Mono, muted — **only where the wait is material to the
reader**: probation windows, notice periods, payment terms, approval SLAs. Never on an ordinary
step-to-step connector, where it is noise.

This does not reintroduce an axis. A label says *how long*; position still says *what order*; the two stay
separate. Where the duration is configurable rather than fixed, say so — `net 7 days (configurable)` —
which is Ruling 3 doing its work inside a label.

### 14.5 Ruling 3 — the standing note block

Every diagram may carry a note block at its x-origin, above band 1: a DM Mono eyebrow label with
plain-language bullets under it. **Three headings, each included only when it has content — an empty
heading is worse than an absent one:**

| Heading | Holds |
|---|---|
| `PRE-REQUISITES` | what must already be true for this flow to work, including operational and training facts that live in no codebase |
| `PER-CLIENT CONFIG` | what a tenant can change — non-negotiable #5's surface, per flow |
| `CANNOT` | a constraint that forecloses a likely misreading, stated as a negative |

> **`PER-CLIENT CONFIG` is the most valuable heading and the easiest to fill from the wrong source. Do not
> read it from `core/config`** — that is a Zod schema over environment variables: no entity, no
> `organizationId`, nothing per-tenant about it, and it is the obvious wrong place to look precisely
> because of its name. The per-tenant surface is the config *entities*:
>
> ```bash
> find packages/api/src/modules -name "*.entity.ts" | xargs grep -ln "organizationId"
> ```
>
> Verified 2026-09-22, that yields `leave-type`, `holiday-calendar`, `holiday` (leave), `grade`
> (position), `pay-component`, `salary-structure`, `salary-structure-component` (finance/compensation) and
> `client-billing-config` (finance/billing). **A tenant-scoped row is the definition of a client setting;
> an env var is the definition of a deployment setting.** Filling the first from the second would put
> plausible, wrong content under the heading that matters most.

**This is the device that answers "all cases accounted for."** A flow diagram shows what happens; it has no
way to show what had to be true first, what varies by client, or what is forbidden. Those three are exactly
where unhandled cases hide — and 06 found all three because it was drawn by someone thinking about running
the process rather than about the code.

`CANNOT` earns its place because a diagram cannot express absence. `90-Day Review CANNOT be rejected by
manager` is unguessable from a picture of the happy path, and a reader who assumes symmetry with the 30-day
review gets it wrong with no way to notice.

### 14.5.1 Ruling 1 meets §2.5 — the wash encloses the branch, not the arms

Ruling 1 and the exclusivity wash collide on B4b, the only diagram that has one. The wash was built around
both arms as peers; Ruling 1 makes one of them the spine and drops the other, at which point they are not
peers and a wash around the single remaining arm fails §2.5's own *"two or more arms"* test.

**Resolution: the wash encloses the branch entire — the branch point and every arm, the spine arm
included.** The spine arm runs through the wash along band 2; alternatives drop below, inside it.

This is not a compromise, it is a correction to §2.5's framing. That section says *"the arms sit on a
wash"* — arms-centric, which is what made peerhood look load-bearing. **The thing that is plural is the
path at that point, not a collection of equals.** Branch-centric wording is truer to what the mark means,
it stops the wash implying the arms are interchangeable — exactly what Ruling 1 wants it to stop implying —
and both rules survive with no change to either one's wording. Recorded in §2.5 by its author.

### 14.6 Ruling 4 — name the decision

A diamond reads `Manager chooses` or `Approver decides`, never `Decision`. The label says what is being
chosen; the arms say the options. `Decision` spends a node to restate a shape's own name.

### 14.7 Three sets now exist — the technical set is normative

The board carries the technical acts, an **IN PLAIN LANGUAGE** mirror of all eleven, and three human
journeys — roughly twenty-five diagrams where §13.2 planned fourteen.

**The mirror set is a fair reading of what Talha asked for** — *"two perspectives, one technical one
non-technical"* — and it answers a question the journeys cannot: *what does **this** flow do, without
jargon.* Someone asking how payroll works wants the plain-language payroll diagram, not a founder lifeline.
§13.2's "three journeys, not eleven mirrors" was my narrowing of his ask; the broader reading has proved
useful. It stays.

But three parallel sets is the maintenance risk this project exists to avoid, so:

> **The technical set is normative. The plain-language mirror and the journeys derive from it.** A change to
> a flow's content updates all three or none — a mirror that has drifted from its source is worse than no
> mirror, because it is confidently wrong in front of the audience least equipped to catch it.

Record each change against all three in the build log. If that becomes burdensome, **the correct response
is to cut the mirror set, not to let it drift.**

### 14.8 Application order

1. **Ruling 1 across the technical set** — happy-path primacy is the ask, and it is pure layout.
2. **Ruling 4** — one label each, trivial.
3. **Ruling 3 on the technical set**, where there is content. Expect `PER-CLIENT CONFIG` to be the hardest
   and the most valuable: it requires reading the config tables, not the service code.
4. **Rulings 1 and 3 on the plain-language mirror** — a non-technical reader needs "what varies per client"
   more than a technical one does.
5. **Ruling 2** wherever a material wait exists, all three sets.
6. **Ruling 1 on the journeys** last — their dead ends already subordinate the unhappy paths, so the gain
   is smallest there.

Screenshot each diagram after the pass. **Happy-path primacy is a claim about what the eye finds first, and
no readback can check it.**

---

## 15. Pages — the top-level split

Talha: *"create larger sections and separate into pages as well."*

**Pages are the larger sections.** One page now carries roughly twenty-five diagrams across three parallel
sets plus furniture — past what any single canvas should hold, and the reason acts stopped reading as
distinct units no matter how much clearance they were given. Whitespace cannot separate what is simply too
much for one surface.

### 15.1 Split by audience, not by act

The acts are the *within-page* structure and they work. The split above them is **who is reading**:

| # | Page | Holds | For |
|---|---|---|---|
| 1 | **Start here** | board title · page index · the key · the three journeys | anyone opening the board cold |
| 2 | **In plain language** | the eleven mirrors, five acts | stakeholders, onboarding, anyone outside engineering |
| 3 | **Technical** | the eleven flows and the module map, five acts | engineering |
| 4 | **Employee performance** | `06`, untouched | its owner |
| 5 | **Development process** | Talha's reserved region, untouched | its owner |

**Page 1 is the landing page and the journeys belong on it**, because the journeys *are* the overview — a
reader who sees what an employee, a founder and Tethr staff each live through has the whole product in
three strips before they choose a page. The index then tells them where the detail is.

**Plain language precedes technical.** Broader audience first, and it is the gentler on-ramp for a reader
who will end up on page 3 anyway.

`06` gets its own page rather than sitting in a set, because §13.5's gap 7 established what it actually is:
**a specification, not a description.** The probation cycle it draws is largely unbuilt. Filing it beside
flows that describe working code would misrepresent both.

### 15.2 One key, on page 1, and only there

§8's reference-copy rule stands, and duplicating the key onto every set page would recreate exactly the
drift risk §14.7 names for the mirror set. **The key lives on page 1. Each set page carries a one-line
pointer to it, not a copy.** A board is not a printed document — flipping back is one click, and a second
key that has drifted is worse than a key one click away.

The journeys' `MARKS` key stays with the journeys on page 1, since it explains a grammar used nowhere else.

> **The key is board furniture everywhere except page 1, where it is the payload — and calling it furniture
> is what let it shrink.** §8's classification is accurate: it is board-level, not part of any diagram. But
> *furniture* describes what a thing **is**, not what it is **for**, and it licenses exactly the treatment
> the key received — small, peripheral, at the edge, a tenth of the page width with gaps around it larger
> than itself. On pages 2–5 that is correct, because there the key is a reference you glance back at. **On
> page 1 everything else is navigation, so the key is the only thing a reader cannot proceed without.**
>
> **Importance is contextual and a global classification hides that.** Size the key by what it is for on
> the page it is on. Anything that redistributes its contents must also preserve §8's adjacency of the
> boundary frame and the alternate wash, in that order — a widening pass is precisely the kind of change
> that undoes an adjacency rule without noticing.

### 15.3 Every page opens with a title block

A reader landing on page 3 directly has no orientation at all today. Each page gets, at its top-left:

- the page name, in the act-header treatment;
- one line saying what is on it and who it is for;
- the pointer to the key on page 1.

This is the same argument as the contents index: **a surface that can be entered directly must say where
you are.** Deep links and shared page URLs make that the normal case, not the exception.

### 15.4 Acts grow now that there is room

With eleven diagrams on a page instead of twenty-five, the act header is the largest thing on its page
after the page title, and should be sized like it — **scale it up from 56px, keeping the flow title at 34
so the step up is unmistakable.** Give each act more clearance than the current three-times gap; there is
room now and the whole point of the split was to spend it.

Layout within a page is unchanged: acts flow horizontally, diagrams stack vertically inside them, spines
read left to right (§1.0.2). **The alternating-axis principle survives the split** — it was never about how
many diagrams were on the surface.

### 15.5 What the split breaks, and what to do about it

Three things depend on everything being one page. Handle them in the same pass:

1. **Cross-set references.** A journey moment reads `→ 02 PEOPLE`, and that act now lives on another page.
   Make it name the page: `→ Technical · 02 PEOPLE`. A reference that cannot be followed is worse than none.
2. **Build-log coordinates.** Every origin recorded so far is page-relative and there was only one page.
   From here each entry records its page, and the existing entries get a line saying which page they were
   written against.
3. **Talha's two regions move intact.** Nothing inside `06` or `Development Process — Tethr` changes —
   they move as units to their own pages, and the move itself gets logged. **If anything inside either
   region would have to change to make the move work, stop and ask rather than adjusting it.**

### 15.6 Execution

Move one page at a time, verify, then the next. Twenty-five diagrams crossing page boundaries is the
largest mechanical operation this board has had, and a half-finished move is worse than not starting —
a diagram on the wrong page with its connectors left behind is unrecoverable without a rebuild.

Screenshot each page after its move. **Page-level readability is a claim about what a reader finds when
they land cold, and no readback checks it.**

---

## 16. Sections, panels and a warmer ground

Talha, looking at the whole board zoomed out: *"this is not sectioned off or have any structure or
orientation… make use of sections and pages and also figure out how to dim the colour of the background to
a little more creamier colour."*

He is right, and **§1.0.2's "no act container, not negotiable" is the reason.** That ruling is now
partially reversed — see §16.1 for exactly how far.

### 16.1 Reversing the container ban, and its limit

The ban had two arguments and each was correct about something narrower than what it banned:

- *An accent-stroked container would give the boundary frame a second meaning.* **True of a blue container.
  Not true of a neutral warm panel**, which shares no hue with the frame and carries no stroke or caption —
  the same construction argument §2.5 uses to separate the wash from the frame.
- *A tinted band competes with the boxes' white fills and is swimlane chrome one level up.* **True of a
  tinted band inside a diagram.** A swimlane divides one diagram by actor; an act panel groups whole
  diagrams. Different level, different object — the same distinction that let act headers exist as board
  furniture rather than diagram grammar.

**What the ban got wrong is what actually reads at board zoom.** Typography and whitespace carry structure
at reading zoom and carry *nothing* zoomed out: headers vanish, hairline rules vanish, and whitespace reads
as emptiness rather than as separation. A reader taking in the whole board sees a scatter of grey specks.
**Only filled regions survive zooming out**, and the set had none.

**The limit, which is not reversed:** no container is stroked, none is blue, none carries a caption of its
own (the act header already names it), and nothing inside a diagram gains a fill. Panels are board
furniture at act level and nowhere else.

### 16.2 Three tones, each lighter than the last

A warm ground with cooler cards on it is what makes layering legible at any zoom:

| Layer | Fill | Reads as |
|---|---|---|
| Page canvas | `#f2ede3` | the warm ground Talha asked for |
| Act panel | `#faf7f1` | a raised area holding a group |
| Process box | `#ffffff` unchanged | the content itself |

The canvas is set per page: `figma.currentPage.backgrounds = [{ type: 'SOLID', color: … }]`. Panels are
plain rectangles, corner radius 6, no stroke, behind everything.

> **Corrected 2026-09-25. An earlier draft required "clearance on all four sides at least equal to the
> diagram-to-diagram gap", and that is not satisfiable alongside the grid.** Panel padding `P` and column
> gap `G` trade against a budget fixed entirely by the content: with panels at `origin − P`, one uniform
> width, an act pitch of 2944 and a widest act content of 2588, **`2P + G = 356`**. At `P = 160` the gap
> collapses to 36. The spec demanded two properties that cannot both hold, and the conflict only surfaced
> when the second was applied — which is the stated reason the build log requires before a doc is amended
> instead of a canvas.
>
> **The rule is the trade, not either number: the gap wins.** `G` separates one act from the next; `P` only
> buys breathing room inside an act that its own fill already delimits. Spend the budget on the boundary
> that carries meaning. Recompute both whenever the widest act's content changes — these are derived
> values, not settings.
>
> A property of the content worth recording so nobody hunts for a nicer pair: `356 ≡ 4 (mod 8)`, so on a
> 4px grid the gap is always `≡ 4 (mod 8)`. **No choice of `P` puts both values on an 8px grid.**

**A panel may be wider than its contents, and on a single-act page it must be.** Act 05's module map gets a
full grid column with empty space in it; page 1's journeys panel takes the page's full content width. These
are one rule, not two exceptions: **cream reads as nothing, panel reads as room.** The panel edge is what
converts emptiness from accident into allocation, so a body panel narrower than the header above it reads
as unfinished no matter how little content it holds. Contents stay their natural size and left-align inside.

**Once acts are filled panels, the fill boundary carries the hierarchy and gap sizes stop being signal.**
§1.0.2 asked for an act break three times the diagram gap, on the argument that a break a reader has to
measure is not working. That was written when whitespace was the only separator. It is superseded on both
axes: a cream gap between two panels and a panel-coloured gap between two diagrams **look nothing alike at
any size**, so the act break no longer depends on being larger. The gaps are now spacing, and only the
fill is signal.

**Two palette risks to check on canvas before committing, not after:**

1. **The failure fill `#fdecec` is a warm pink, and the new ground is warm.** It may muddy where it used to
   pop. Red failure exits are the highest-value colour in the language (§3) and losing their distinctness
   to a background change would be a bad trade. If it goes soft, the ground moves — not the red.
2. **The hairline `#dce3ee` is a cool grey on what is now a warm panel.** Check it still reads as a border
   rather than as a colour cast.

Verify both by eye at reading zoom and at full-board zoom. **A palette that works at one zoom and fails at
the other has not been checked.**

### 16.3 Sequence — colour and panels first, pages second

§15's page split is the larger reorganisation and it still stands. But **do §16 first.** It is one pass, it
is immediately visible at the zoom Talha is actually looking at, and it works whether or not the pages have
landed yet. Panels move with their contents when the pages happen.

### 16.4 Fix the broken boundary captions — this is urgent and independent

Two chips reading `A2 tena…` and `D9 tena…` are rendering **oversized, truncated, and overlapping diagram
content**, once in the technical set and once in the plain-language mirror. They are boundary captions that
have been prefixed with a diagram id, turned into filled blue chips, and clipped.

Three separate defects in one object: a filled blue capsule is the collision §2.1 already ruled against
(it wears the event pill's silhouette), the truncation loses the content, and the size is wrong for a
caption. **Revert them to §5's specification — plain royal DM Mono text above the frame, no chip, no
prefix, not clipped.** Do this regardless of anything else in this section; it is visible at every zoom and
it is wrong at all of them.

### 16.5 The header zone is still scattered

The board title, the contents index and the key sit at three unrelated positions with the index far right
of the title and much smaller than it. §1.0.2 called for these laid out as one horizontal header zone and
that has not landed. **A reader's first fixation should find title, index and key as one object**, because
that block is the whole of the board's orientation.
