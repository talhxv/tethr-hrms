# Diagram language

> The visual grammar for Tethr HRMS process diagrams. Structure ruled by the design head, 2026-09-15;
> visual language re-based on the Tethr brand book the same day.

**Two design systems are in play, and they do not compete — they apply to different things.**

| System | Source | Governs |
|---|---|---|
| **Tethr brand** | `../../tethr/design.md` | These diagrams. Decks, posts, any artefact representing the company. |
| **HRMS product** | [design.md](../design.md) → `packages/ui/src/theme/` | The application UI. Screens, components, product surfaces. |

The HRMS is an umbrella project under Tethr, the managing company. A process diagram is a *company*
artefact — it gets read in decks, reviews and onboarding, not inside the product — so it wears the Tethr
brand. Product screens keep the HRMS tokens (indigo `#3e63dd`, Inter). Do not mix the two in one artefact.

**The artefact's medium decides, not its content.** A product screenshot inside a brand deck is still a
product screenshot — it keeps indigo and Inter; the deck around it wears the brand. Without this line,
someone eventually "harmonises" the app to match a deck, and the brand eats the product.

### How this file knows what it claims

**The verification discipline lives in [checking.md](checking.md)** — what this doc set is allowed to
assert, why volatile facts belong in a command rather than in prose, where the instruments are blind, and
when a correction earns a permanent note.

Eighty lines of it used to sit here, ahead of §1. It was all earned, and it was in the wrong place: a
reader opening this file to find out what a wash means had to wade through the epistemics first. **The
grammar was getting hard to find inside its own commentary.**

That is not only a courtesy to the reader. **Someone reaching for a new mark is usually someone who could
not find the existing rule** — so inventing vocabulary is a findability symptom before it is a discipline
problem, and **a grammar that buries its own rules manufactures the drift it forbids.** Forbidding
invention does not fix that; making the rule easy to reach does.

One rule from there is worth repeating in
place, because it governs every number below: **cite the symbol, not the line — a symbol name either
resolves or it does not, while a line number fails silently two lines from what was meant.**

### One symbol, one meaning

**The accent boundary frame means exactly one thing: execution inside a tenant context.** Do not reuse it
for anything else, however tempting — a module crossing, a transaction, a retry scope. Giving a symbol a
second meaning breaks it everywhere it already appears, retroactively, in diagrams nobody is re-reading.

**The negative test, which matters as much as the rule:** a flow that runs entirely inside a tenant already
established by its caller has no crossing to mark, and gets no frame. A1, A2 and D9 earn one — the first two
bootstrap a tenant that does not exist yet, and D9's relay runs outside any request and must re-establish
one from the event. B4 does not. Framing a flow that never crosses would quietly redefine the symbol as
"this is multi-tenant software", which is true of every diagram in the set and therefore says nothing —
the second meaning this rule exists to prevent, arrived at by omission rather than by reuse.

A3 crosses from `modules/account` into `core/auth` mid-flow, which is the most interesting fact about it.
It is carried by **module-qualified identifiers** (`AccountService.login` against
`AuthService.resolveWorkspaceSelection`) at zero structural cost. Module boundaries are drawn as structure
only in flow 10 — which is one more reason flow 10 needs its own grammar instead of inheriting this one.

### Take the brand's palette, type and section motif — never its ornament

**Decorative brand motifs are forbidden in diagrams:** the chain link, the swirl, the radial glow, the
glass sphere, the grid overlay, the Instrument Serif flourish. The brand book's §7 "Quick Reference" says
to include a chain link — that guidance is written for social posts and decks. **A diagram is a reading
instrument, not a piece of creative.** This is a rule rather than a judgement call precisely because the
failure mode is someone reading §7 literally at diagram 5 and adding ornament to a working diagram.

Diagrams live in one FigJam board, separate from the product design file:
**[HRMS — User Flows](https://www.figma.com/board/CwLecjQLRS0x9Q28UHQ1zP)**

> Moved 2026-09-15. The original board (`lo9lRiwc2xwltXtrhCKZyL`) belongs to a Figma account this project no
> longer authenticates as, taking flow A1 and the original legend with it. Neither is damaged; both are
> unreachable, which for our purposes is the same as gone. **A board link in a document is not a guarantee of
> access** — which is why §8 now says to rebuild the legend on the current board rather than to treat any
> single copy as canonical.

Process diagrams are not product surfaces. They have a different lifecycle, different reviewers, and a
different edit cadence than screens and components. FigJam is chosen for one concrete reason: its
connectors re-route when a box moves. Across ten diagrams revised as the backend moves, hand-placed
connectors in a design file would make every edit manual rework.

## 1. The three-band grammar

A band is a **constant y-position with a constant meaning**. Bands are a layout rule, not a drawn
element — nothing is stroked, nothing is labelled, there is no swimlane chrome. Swimlane headers and
dividing rules are precisely the "complex flow chart" this set is meant to avoid.

| Band | y offset | Holds |
|---|---|---|
| 1 | `0` | **The human.** Web pages, forms, pickers — anything the user is shown and acts on. |
| 2 | `+140` | **The synchronous spine.** Services, guards, writes. Reads left to right. |
| 3 | `+300` | **The async plane.** Events in, events out, and failure exits. |

> Middle band is the happy path; above it is the human; below it is the async plane.

Band 3 is deliberately *the async plane* rather than merely "consequence" — that generalisation is what
lets a flow triggered by another flow's event use the same three bands (see §1.1).

### 1.1 Pre-ruled cases — no fourth band, no time axis

Ruled in advance so no diagram improvises. All four answers are "no new structure".

- **A flow triggered by an event, not a human** (flow 9 begins at `payroll.finalized`, emitted by flow 8):
  the inbound trigger enters at the **left of band 3** as an ordinary event pill, with a dashed connector
  rising **into** band 2. Dashed already means async causation; the direction simply reverses. Band 1 is
  empty at the start, and that is fine.
- **Multi-actor approval** (flow 8's initiator and approver are different people): no split, no fourth
  band. Band 1 is "the human" generically; when actors differ, prefix the box label with the role —
  `Payroll admin · submit for approval`, `Approver · review`. One line, no structural change. Splitting
  band 1 per actor is swimlanes through the back door.
- **Long async waits** (a calculation job that hands off and resumes): step → dashed connector down to an
  event pill → dashed connector back up to the resuming step. No new apparatus.
- **An alternative that drops off the spine is a stub, not a track.** Happy-path primacy
  (`process-flow-content.md` §14.3) sends alternatives below band 2, and the obvious reading of that
  smuggles in the fourth band this section has now rejected four times: **if every diagram's alternatives
  sit at a constant offset below band 2, that is a constant y with a constant meaning across diagrams,
  which is the definition of a band.** So an alternative drops, runs a short distance, and terminates — in
  a pill, a failure exit, or a §2.4 circle. It never establishes a parallel row running alongside the
  spine.

  **The corollary is the useful half: an alternative long enough to need its own track is the signal that
  it is its own diagram.** B4 and B4b were split on that reflex before this rule existed; this is the same
  test arriving from the other direction, and it means the rule costs nothing to obey — the case where it
  bites is a case where splitting was already right.
- **A time axis is rejected** and should not be proposed. It makes horizontal position encode two things
  at once — sequence and elapsed duration — and none of these flows have durations worth drawing to scale.

If something *other* than these surprises you, describe it to the design head in words. Do not spend a
screenshot before the description has been ruled on.

## 2. No decision diamonds

A guard is an ordinary process box. Its failure leaves the **bottom edge** as a red arrow into band 3. The
downward arrow already says "this can fail here"; a diamond doubles the node count and adds a shape the
reader has to decode. Confirmed on canvas: nothing is lost.

**Every failure exit says what the actor does next**, not just what broke. A1's reads
`ConflictError / dead end — ask for an invite`. This matches the Tethr voice: state the problem plainly,
then resolve it.

### 2.0 Label grammar — the middle dot means one thing

**In a box label, `·` separates an actor from their action. That is its only job.**

`Employee · request leave` · `Approver · decide` · `Payroll admin · create run`. This is §1.1's pre-ruled
multi-actor convention and it is correct.

**An actor is whatever acts — it does not have to be a person.** `core/auth · disable logins` and
`finance/billing · close membership at the last working day` satisfy this rule rather than being exempted
from it: the module is the subject, the action is the predicate, and the relationship points the same way
as `Employee · request leave`. **The invariant is direction, not animacy** — left acts, right is what it
does. The human examples dominate only because §1.1's origin was multi-actor *human* flows.

In B5's fan the dot is not merely permitted, it is *correct*. That diagram's whole thesis is that five
modules react independently, so the module belongs in subject position. Demoting it to
`Disable logins (core/auth)` would put the most important fact on the diagram inside a parenthesis.

It had quietly acquired four more jobs, and Talha caught it on the canvas — *"what is this dot doing? it
just makes it a bit confusing"*:

| Seen on the board | What the dot was doing | Direction |
|---|---|---|
| `Employee · request leave` | actor → action | left is the **subject** |
| `Check name availability · advisory` | step → qualifier | left is the **content** |
| `Guard · start before end` | category → condition | left is a **label** |
| `Cancel · release reservation` | verb → effect | left is the **action** |
| `Finalize · payDate, totals` | step → what it writes | left is the **action** |

**The first two point in opposite directions.** In `Employee · request leave` the left side acts on the
right; in `Check name availability · advisory` the right side describes the left. Same mark, reversed
relationship, three boxes apart. A reader cannot learn a rule from that, which is exactly why it reads as
noise rather than structure. One symbol, one meaning — the rule applies to punctuation as much as to shapes,
and punctuation is where it slips, because nobody thinks of a separator as a symbol.

**The fixes, in order of preference:**

1. **A qualifier goes in parentheses** — `Check name availability (advisory)`. Parentheses universally mean
   *aside*, they collide with nothing, and no new mark is introduced. (Mono parentheses are code —
   `tenantContext.run(organizationId)` — a different typographic register, so no clash.)
2. **A category prefix is dropped.** `Guard · start before end` becomes `Start before end`. §2 already
   establishes that a guard is an ordinary box whose failure leaves the bottom edge in red — **the red exit
   already says "guard", so the word is redundant with the picture.**

   **Where no exit is drawn, the sentence carries it instead: phrase the check as a constraint.** §2.1
   rules some failures ambient, so a guard can legitimately have no red arrow — and then a bare
   `Start before end` leaves nothing marking it as a check at all. Write `Start must precede end`:
   **"must" makes it unmistakably a constraint rather than an action**, which is what the red arrow would
   otherwise have said. No prefix, no dot, and clearer than the version it replaces.

   **Do not go looking for these from a list.** An earlier draft here named two such guards; one of them
   turned out to have an exit and was correct bare. Which boxes qualify changes every time an exit is
   added or removed — it is a volatile fact, and §intro's rule applies to this document's own examples.
   Check the box in front of you: **exit drawn, state the condition; no exit, state the constraint.**
3. **A verb-and-effect is written as language** — `Cancel, releasing the reservation`. It is a sentence;
   set it as one.
4. **What a step writes belongs on line 2**, where the code identifiers already live:
   `Finalize run` over `payDate, totals, status: 'finalized'`.

**The mono eyebrow keeps its dots** — `01 · ACCESS & IDENTITY · 2 OF 3` is a metadata line in DM Mono, a
different register from a Manrope box label. §3 establishes type as a legitimate carrier of distinction in
this language; a breadcrumb separator in mono is not the same mark as a relationship operator in a box.

> Worth noting how this got in: **the original A1 had it right.** Its precheck box read
> `Public prechecks (advisory)` — parentheses, correctly. The 2026-09-16 rebuild changed it to a dot while
> matching the role-prefix pattern it saw elsewhere. **A convention spreads to places it does not fit by
> looking like consistency**, which is the failure mode to watch for whenever a pattern is working well.

### 2.1 Which failures earn a band-3 exit

**Band 3 failure exits are for domain failures, not ambient platform failures.** Authorization denial,
transport errors and required-field validation are identical across every guarded mutation in the system;
drawing them on eight diagrams teaches nothing by the third. A failure earns its place when it is specific
to *this* flow's domain logic — name taken, client not found, already founded a workspace.

A permission gate therefore gets a **box** (it says what the system enforces) but **no failure exit**.

The test is not "is this an auth error" but **"is this failure identical across every guarded mutation?"**
A3's rejected workspace selection looks ambient and isn't: `resolveWorkspaceSelection` (auth.service.ts:144)
refuses any `organizationId` not in the token's own `organizationIds`, and refuses a token of the wrong
type. That is a **containment guarantee** — a selection token cannot reach a workspace it was not minted
for — which exists nowhere else in the system and is the reason a two-step login is safe at all. It earns
its exit, and the label leads with the containment, not the expiry: the scope violation is the half a
reader learns from.

### 2.2 When a branch is structural, and when it is only a label

**A branch is structural only if its arms differ in something a later box depends on.** Reconvergence
alone is not the test — two arms can reconverge and still leave state a downstream box reads.

A2's "attach existing client or found a new one" is a label, not a structure: both arms produce a Client
whose id the workspace references, and every later box is identical. (`clientService.create` is a bare
`save` with no uniqueness check, so the new-client arm cannot even fail — the asymmetry is already fully
carried by the failure exit hanging off the box.)

**A client-side wizard is one band-1 box, however many steps it has.** Same principle, different surface:
the steps differ in nothing a later box depends on, they reconverge into a single payload, and the server
sees one mutation. Note the shape with `(stepped)` in the label. Drawing four band-1 boxes for a four-step
form would tell the reader the server sees four calls when it sees one.

**Band 1 holds more than one box.** Mid-process human input — A3's workspace picker, an approver's review
screen — is band 1, not band 2, because band 1 means "the human", not "the entry point". Narrowing it to
the entry point costs you in every flow where a person acts partway through, which includes 6 and 8.

### 2.3 Skip connectors

When one path strictly contains another, **make the spine the path that visits every step** and draw the
short path as a forward connector that skips boxes. Nothing is orphaned onto a branch, and the alternate
path reads as a shortcut rather than a detour. A3: the multi-workspace login is the spine, and
`single match · most logins` skips from credential verification straight to the session token, visibly
avoiding a round trip through the human.

Four constraints:

- **Forward only.** A skip never points backward. A backward connector is a loop — a different construct,
  needing its own ruling. Do not improvise one.
- **Subordinate to the spine.** Same weight as a sync connector, never heavier; shallow arc if it arcs. It
  must not become the line the eye follows first.
- **Always labelled with its condition** — and with frequency where frequency would otherwise mislead.
  Drawing the superset as the spine inverts frequency: most logins are single-workspace, so the structure
  makes the common case look exceptional. **Structure follows coverage; labels carry frequency.**
- **Only when the long path is a strict superset.** If two arms each have steps the other lacks, it is not
  a skip — it is a real branch and does not get this treatment. Escalate rather than improvise.

### 2.4 Every path ends in an open circle

**A path that simply stops is unmarked, and an unmarked stop is indistinguishable from an unfinished
drawing.** Nothing on the canvas tells the reader whether `Return AuthPayload` is where the flow ends or
where the author ran out of time. Every other ending in this language is marked — red for failure, a pill
for an emission — and the ordinary one, the flow reaching its end, was the only one drawn as absence.

**An open circle, 24 x 24, no fill, ink-navy hairline, with a caption naming what has ended.** It is the
standard flowchart terminator, it costs one node, and it is the one mark a reader does not have to learn.

> Imported from `06 EMPLOYEE PERFORMANCE`, drawn by hand on this board by its owner and ruled in on
> 2026-09-22: *"that was hand made … that is so much better … use the unfilled circle to represent the end
> of the path."* The hand-drawn version uses Inter 10 and a near-black `#242424`; the mark is adopted, its
> type and hex are re-based on §3 and §4 like everything else. **Take the construct, not the accident.**

**Only the terminal end takes one.** A path end is a node with no outgoing connector — and three of those
already end a path, so adding a circle would say "ends here" twice in two different alphabets:

- a **failure exit**: red *is* the ending, and §3 spends the colour precisely so it needs no second mark;
- an **event pill**: the emission is the end of that async branch, and a pill is identical everywhere it
  appears (§3) — decorating some pills with a terminator and not others would break the joints rule;
- **anything in flow 10**: it is a map with no paths, so it has no path ends.

Everything else with no outgoing connector gets a circle. If a box has none and you cannot say what ended
there, that is the finding — **look for the connector nobody drew**, do not paper it with a terminator.

> **Known gap in this test, seen twice and not yet ruled: a box whose only outgoing edges are dashed
> emissions.** C6's `Workflow approval → settle balance` and B4b's `Create new assignment` both end their
> spine and both fire pills, so the mechanical "no outgoing connector" test skips them and neither carries
> a terminator. The spine visibly stops and nothing marks it — which is the exact condition §2.4 was
> written against, arriving through a test that measures edges rather than *synchronous* edges.
> **Leaving it open deliberately:** the fix is probably "no outgoing *solid* edge", but that would add
> terminators across two boards at once and the rule should be decided on its merits rather than as a
> side effect of a layout pass. Recorded so the next reader knows it is a known hole, not an oversight.

**The circle marks the ending; the caption names it — when the ending has a name the last box has not
already given it.** `Return AuthPayload` ends in `Session issued`: the box is the act, the caption is the
state it leaves behind, and the reader learns something. **Where the last box already *is* the outcome, the
circle stands bare.** B5's fan ends in five boxes that each read `core/auth · disable logins`,
`benefits · end enrollments` and so on; captioning those would restate each box in worse words. The circle
still does its whole primary job unaided — it says the path stops here rather than running off the page.

Never `Success`, `Done` or `End`. §3's asymmetry argument applies unchanged: the spine ending *is* success,
so a caption saying so has spent a node for zero information — and a caption that restates its own box has
spent one for less than zero, because now the reader checks whether the two differ.

Geometry: the circle continues the spine's direction at the standard `32` box gap, centred on the last
box's cross axis; the connector into it is an ordinary spine connector. The caption is a separate text node,
centred under the circle at `+8`, fixed width `160`. Floating text does not move with its shape (§4 rejected
it for box identifiers for exactly that reason) — accepted here because a terminator is a leaf: nothing
downstream of it can move.

**That geometry gives the caption an 88px clear zone, and the caption has to fit it.** The text node is 160
wide and centred 32 past the box, so ink wider than 88px overhangs the box it follows; the first build of
this mark put `Client workspace ready` on A2 and "workspace" crossed the tenant frame's royal stroke.
**Measure the ink, not the character count** — the built captions run 56–85px. §2.4's own example
`Session issued` measures 85, one character inside the limit, which says the geometry was written for
captions of about that length rather than that the geometry is wrong. A caption that will not fit is a
caption doing too much: the circle says the path ended, so the words only have to name the state.

### 2.5 A branch into mutually exclusive arms sits in a wash

Where one branch point opens two or more arms that are **alternatives** — one of them happens, not all —
**the branch sits on a wash**: royal `#0755e9` at 5% over the canvas, corner radius 6, no stroke, no
caption, behind everything, `32` clear on every side. It reads as one region of the drawing where the path
has temporarily become plural.

**The wash encloses the branch entire — the branch point and every arm, the ordinary arm included.** This
paragraph read *"the arms sit on a wash"* until it was corrected on review the same day: arms-centric
wording made peerhood look load-bearing, as though the mark asserted the arms were interchangeable. It
never did. **What is plural is the path at that point, not a collection of equals** — and the difference
matters the moment one arm is the ordinary one, because a mark implying interchangeability would then be
making a claim the diagram is trying to deny. Nothing about the fill or the exclusivity test changes.

**And "entire" means the branch's band-2 extent. The wash stops above band 3.** An arm's *termination* is
not part of the branch: arms end in pills, failure exits and §2.4 circles, and those are **consequences of
the branch rather than members of it** — which is what band 3 is for, and the reason every other
consequence in the set already lives there. No arm loses its enclosure, because **an arm is the path, not
its ending.**

> This was ruled on 2026-09-25 against a real obstruction, and the geometry is worth recording because it
> is what exposed the overreach. B4b's fork could not be redrawn at all under the earlier wording: the
> wash had to reach the branch point, so its left edge was pinned; a failure exit hanging under that point
> capped its bottom at band 3; and a dropped arm needed to start below where the wash was allowed to end.
> **The three constraints were unsatisfiable by 64px**, and the only fixes on offer moved a neighbouring
> diagram or re-hung an exit.
>
> The build stopped and reported rather than improvising, which is what made the ruling possible — **a
> layout that cannot be drawn is usually a spec that has claimed too much**, and the arithmetic is the
> thing that says so out loud. The earlier wording was written against peerhood and silently annexed band
> 3 on the way past.

**The negative test: the wash marks plurality on band 2, so if the alternatives have dropped, it goes.**
A fork whose arms sit side by side on the spine needs the mark, because nothing else says they are not a
sequence. A fork whose alternative has been dropped below band 2 does not — **the drop says it**, and a
wash left across the remaining boxes marks a genuine left-to-right sequence as "one of these, not all".
Both B4b washes were removed on 2026-09-29 for exactly this, the same day the rule that permitted them was
clarified. A three-armed fork keeping two arms on band 2 still earns one.

> **A mark can outlive the thing it marks.** The wash was correct when three arms sat in a row looking
> like a sequence; it was the only thing saying otherwise. Then happy-path primacy dropped the alternative,
> the drop took over the job, and **the wash went from clarifying to contradicting without anyone editing
> it.** Nothing about the mark changed — its subject did. This is the obsolescence case arriving in a mark
> instead of in a rule, and it is worth knowing it can happen *in the same pass that makes the mark legal*:
> the clarification that let B4b be drawn is what made its wash false.

**"One of these", never "all of these".** B5's five module consequences fan off one event and every one of
them happens; that is a fan, not a choice, and it gets no wash. Applying the wash there would teach the
reader that a wash means "several things at once", which is the opposite of what it means in the diagram
three columns over. **The test is exclusivity, not plurality.**

**A wash is not a boundary frame, and the difference has to survive a glance.** §intro gives the accent
boundary exactly one meaning — execution inside a tenant context — and a second blue region on the canvas
is the most likely way that rule ever gets broken. So the two are separated by construction, not by hue:

| | Fill | Stroke | Caption |
|---|---|---|---|
| **Boundary frame** | `#e7efff` | `#0755e9` 1.5px | royal DM Mono, above it |
| **Alternate wash** | royal at 5% | none | none |

**Framed versus washed.** A frame has an edge and announces itself; a wash has no edge and sits under the
drawing. That is a real difference and it holds at reading zoom — but **the risk it defends against is not
the one that will actually happen**, and this paragraph said otherwise until it was corrected on review the
same day it was written.

Two blue regions in one view is **simultaneous** confusion, and a reader comparing them side by side will
always tell a frame from a wash. The failure that will actually occur is **sequential**: someone learns
*blue region = tenant context* from A1, meets a blue region in C6 three days later, and carries the meaning
across. They are not comparing. They are remembering — and **memory keeps the hue and drops the
construction.** A defence that only works while both are on screen defends the easy case.

**So the mechanism is the legend, not the diagram.** The boundary frame and the alternate wash sit
**adjacent in the key, as a pair**: the contrast is the entry, not two entries that happen to both be blue.
Do not separate them to keep the key tidy — adjacency *is* the teaching, and it is the only place in the
set where a reader meets both marks in one glance with their names attached.

That also settles a question worth ruling before someone asks it: **a single diagram may carry both, and
one that does is the best teacher in the set.** The first instinct is to forbid the combination; it is
wrong, because a distinction of this kind is only ever learned by contrast. Forbidding it would remove the
one place the contrast appears at full size.

The wash can therefore afford no caption of its own (§8) — the key carries its meaning, and carries it
against the mark it must not be confused with.

> **Known adjacency, recorded before it becomes a defect.** The wash tint over the canvas lands close in
> value to the `wait` fill in the plain-language journeys' four-mark grammar. They do not co-occur in any
> diagram today, and a `wait` box has a border where a wash has none — but the first journey to gain a
> branch puts both in one view. Check it then; do not pre-emptively move either, since no diagram is
> currently wrong.

### 2.5.1 On the warm ground the wash is a value mark, not a hue mark

The board moved to a warm ground (`#f2ede3`) on 2026-09-25. **The wash stays at royal `#0755e9` at 5%,
and on that ground it is no longer blue.** Measured off the canvas rather than from this spec:

| Ground | Composite | Blue lift (b − r) | Value step vs ground |
|---|---|---|---|
| old `#f5f5f5` | `#e9edf4` | **+11** — reads blue | 12 / 8 / 1 |
| warm `#f2ede3` | `#e6e5e3` | **−3** — blue sits *below* red | 12 / 8 / 0 |

At 5% the ground dominates, and cream's own warm bias (r 242 against b 227) is larger than the blue can
overcome. Restoring a visible blue lift needs **10% opacity**, solved over the range.

**The 10% is not spent, and the deciding fact is the last column: the value step is unchanged.** 12/8/0
against 12/8/1 — the wash is exactly as findable as the version already accepted and shipped. Nothing was
lost that anyone relied on. **The hue went, and the hue was never the semantic**; "the path is plural here"
is said as well by a value step as by a tint.

**Spending the 10% would buy back the collision this section exists to prevent.** A boundary frame's royal
is a 1.5px stroke at *full* opacity, which the ground cannot touch; a 5% fill it annihilates. So on cream
**there is no second blue region left to misremember** — the sequential-confusion failure above is gone at
the source rather than managed. Raising the wash would restore the blue and the hazard together, to
preserve an appearance the mark never needed.

> "It accidentally improved" is a weak argument by itself. It holds here because the test is whether the
> current state is better, not how it got there — and a hazard removed at the source beats the same hazard
> handled by apparatus.

**Three consequences, each of which outlives this particular ground:**

1. **The distinction has inverted, and this section's apparatus is now the redundancy rather than the
   load-bearing part.** §2.5 separates frame from wash *by construction* — framed versus washed — with hue
   as the shared hazard. On cream it is the other way round: **hue carries the distinction (frame blue,
   wash neutral) and construction is the backup.** Keep the construction rule anyway; it costs nothing and
   it is what survives the next ground change.
2. **The wash's appearance is now a function of the ground, and nothing about the wash says so.** This is
   the same shape as the 39 section rules holding a reference to page 5 — *a dependency invisible from the
   thing that depends on it*. So it is recorded as a coupling: **any future ground change requires
   re-checking the wash composite before it ships**, because the mark can change character without any
   edit to the mark.
3. **The legend's wash sample sits on the same ground, so the key and the canvas agree by construction.**
   Worth stating because the obvious way this becomes untenable — a key showing a blue swatch for a mark
   that renders grey — *cannot happen here*, and it cannot happen for a structural reason rather than
   because someone remembers to maintain it.

**Where a wash exists, its branch point is a diamond** — but only when the box at that point is *entirely*
the choice (`Approver · decide`), in which case convert it in place and keep its label. §2's ban on
diamonds is on **guards**, whose failure is better drawn as a red bottom exit; a genuine choice between
arms is what a diamond has always meant, and the plain-language journeys already use one on that basis.
Where the branch point is a step that happens to have two outcomes, leave it a box — do not manufacture a
decision node to justify the wash.

## 3. The six marks — Tethr palette

Nothing outside this table gets a colour.

> **One device is not in this file and should be findable from it: the standing note block.**
> `PRE-REQUISITES` / `PER-CLIENT CONFIG` / `CANNOT`, specified in
> [process-flow-content.md](process-flow-content.md) §14.5 — a DM Mono eyebrow with plain-language
> bullets, at the diagram's x-origin above band 1, each heading included only where it has content. It is
> how a diagram says what had to be true first, what varies by client, and what is forbidden — **none of
> which a flow picture can express.**
>
> It is cross-referenced here because a build session was sent to "the grammar" for a diagram that needed
> one, and found it by scanning the *build log's* heading list. **A rule that exists and cannot be found
> is, from where the builder is standing, the same as a rule that does not exist** — and the reflex when
> a device is missing is to invent one.

| Role | Fill | Border | Label | Shape | Type |
|---|---|---|---|---|---|
| **Process step** | `#ffffff` | `#dce3ee` | `#001131` ink navy | square | Manrope Medium |
| **Boundary** (tenant/system crossing) | `#e7efff` pale blue | `#0755e9` royal, 1.5px | `#0755e9` | section | DM Mono caption |
| **Emitted event** | `#ffffff` | `#c7d0e0` | `#667899` muted | capsule | DM Mono |
| **Failure exit** | `#fdecec` | `#f1b4b4` | `#e03131` problem red | square | Manrope Medium |
| **End of path** (§2.4) | none | `#001131` 1.5px | caption below, `#001131` | 24px circle | Manrope Medium 12 |
| **Alternate wash** (§2.5) | `#0755e9` at 5% | none | none | rounded rect, behind | — |

**Canvas: `#f1f5fd`** — Tethr's service-card ground. White boxes read as cards lifted off it, which is the
brand's own card idiom and does the separation work a hairline border cannot.

**Connectors:** spine `#657187` — ink navy at ~58% over the canvas — 1.5px, elbowed, arrowhead at the
target end only. Async emissions are **royal blue `#0755e9`, dashed `[6,4]`**. Failure arrows are `#e03131`.

> **The spine is always the most prominent path; nothing hanging off it may outweigh it.**
> An earlier build had a light-grey spine against bright blue async offshoots, so the offshoots
> out-shouted the happy path. Survivable in A1 with two events; in payroll with six, the spine would lose.

### Stated deviations from the brand book

Both are deliberate. Undocumented approximations drift; documented ones hold.

- **Borders and muted text sit one step darker than the book's web values.** The book gives borders as
  `rgba(0,17,49,0.08–0.12)` and muted text as `rgba(0,17,49,0.5)`; the diagram uses `#dce3ee`, `#c7d0e0`
  and `#667899`. Reason: those alphas are tuned for a web page, where a border is one affordance among
  many. **A diagram box's border is its only definition.** (FigJam strokes also take no alpha, so brand
  transparencies have to be pre-flattened regardless.)
- **No green, ever.** Tethr's status accents are a red/green/**blue** trio where blue is Tethr itself —
  problem, the ordinary fix that isn't us, then Tethr. Importing green as a success terminal wouldn't just
  borrow a status colour, it would import a competitive narrative.
  The structural reason generalises beyond this brand: **in a process diagram success is the default — the
  spine ending IS success. You mark the exception, not the norm.** A green terminal spends a colour for
  zero information; red earns its colour because failure is the deviation. The asymmetry is correct.

### The dash belongs on the relationship, not the node

**Solid edge = synchronous happy path. Dashed royal-blue edge = fire-and-forget consequence.**

Semantically exact: the event isn't dashed, the causal link to it is asynchronous.

It is also the only thing that works. An earlier spec dashed the event pill's *border*; on canvas that pill
had no visible border at all at viewing zoom. **Root cause, worth stating so nobody retries it in diagram
6: every border in this language is a low-contrast hairline by design, so no border can carry a semantic
signal.** Put semantic weight on edges, fills, silhouette or type — never on a border.

Events are distinguished three ways without it: capsule silhouette against the square, muted navy label,
and DM Mono type.

### Event pills are the joints of the set

**The same event renders identically everywhere it appears** — same shape, same hex, same mono, same
string. Flow 9's inbound `payroll.finalized` pill is visually identical to flow 8's outbound one, so the
two diagrams seam together on sight.

This is the highest-value property in the whole set: it turns ten pictures into one map. Never rename an
event to read better in local context, and never restyle a pill to suit a particular diagram. The wording
is the event name from `packages/shared`, verbatim.

**A seam is anything one flow writes that another flow reads.** Events are the common case; flags and
status fields count too. A2's `isWorkspaceCreator: true` is what makes A1's "already founded a workspace?"
guard fire for that person later — so A2 is the answer to the question A1 raises, and the flag has to be
on the box for the two to connect. Flow 10 must map the state seams, not only the event ones.

### Never draw an event pill you have not verified

Before drawing any pill — outbound or inbound trigger — confirm a real publisher exists:

```bash
node scripts/verify-events.js --pill <event.name>    # exit 0 = draw it, exit 1 = do not
```

A pill is justified only by a **publish site in a service**. Not a name-registry entry in
`packages/shared`, not a spec file, and not a consumer registration — a consumer proves someone *listens*,
never that anyone *fires*.

> This was a `grep -rn "'<event.name>'"` until 2026-09-15. That command matches the registry entry and
> every consumer registration too, so the paragraph above had to tell the reader which hits to mentally
> discard — **a check whose correctness depends on the reader reading carefully is the weak kind**, and
> this is the rule we have already been burnt by. The command now answers the actual question and says
> whether band 3 gets a consequence step as well: no consumer means the pill stands alone (§0.3 of
> [process-flow-content.md](process-flow-content.md)).

This is not hypothetical. A1 originally drew `user.created`, which is declared at
`packages/shared/src/events/domain-event.ts:49` and typed at `:134` but has **zero publishers** anywhere
in the API — `auth.service.ts` does not even import `DomainEventPublisher`. Under the joints rule a pill
for a never-fired event is worse than an omission: it manufactures a seam to a connection that does not
exist. Do not annotate such events as "declared, not emitted" either — that adds a fifth semantic role to
the language to document a temporary gap in the code. **Six marks; the diagram shows reality.**

## 4. Typography — Manrope

Per the Tethr brand book, Manrope is the workhorse.

| Role | Font | Size | Tracking |
|---|---|---|---|
| Diagram title | Manrope ExtraBold, uppercase | 34px | `+0.5px` |
| Step label | Manrope Medium | 14px | normal |
| Eyebrow / section label | DM Mono, uppercase | 12px | `+12%` |
| Code identifier (event pill, boundary caption) | DM Mono Medium | 14px | normal |

> **Uppercase always takes positive tracking, and the amount scales inversely with size. Negative
> tracking belongs only to sentence case.** The brand book is internally consistent on this and it is easy
> to cross its two systems: every negative-tracking spec is a *sentence-case display headline* (hero
> `-2.5px`), while every *uppercase* spec takes positive tracking (eyebrows `0.08–0.18em`, tags
> `1.5–2px`). A 12px eyebrow needs a lot (`0.12em`); a 34px display title needs very little (`≈+0.5px`).

Tethr specifies "Consolas / monospace" for labels, eyebrows and code. DM Mono is the available mono face
and is already the HRMS code face, so it serves both systems — **DM Mono means "this exact string exists
in the codebase."**

**The consequence, which this section stated only as a premise until 2026-09-29: a label that is not
verbatim must not be set in mono.** The rule ties a typeface to a truth claim, so it binds in both
directions — change the wording and the typeface has to follow, or the type starts lying. This has now
been paid twice. The plain-language mirror moved 36 pills, captions and module boxes off mono when their
wording stopped being code. The Book a Call board's `Tally · store submission in Notion (reported)`
never went on mono at all: it names a setting in a Tally dashboard, which is not a string in any
repository. **Ask what the label claims to be before choosing its face.**

> **Straight quotes only, and check them.** A first pass set `status: 'pending'` with curly quotes. The
> codebase uses straight ones, so the curly form is *not the string it claims to be* — the identifier rule
> broken by a character nobody looks at. Editors and canvas tools smart-quote silently, so this will recur;
> read the quote characters back like any other property. Same shape as the middle dot: the rules that slip
> are the ones carried by marks too small to register as marks.

4px grid: box padding `8px 16px` · box→box gap `32` · band→band gap `48` · diagram→diagram gap `160`.

**These are exact values, not minima.** Asked in 2026-09-29 while a build had 64px of granted room and needed 60:
spending all 64 would have made one diagram gap 164 while every other on the board is 160. It spent 60 and
landed on the number. **A minimum drifts** — each pass takes what it is given, no single step is wrong, and
the rhythm is gone in five passes with nobody having decided anything. Where a gap genuinely cannot be
held, say so and take the smallest departure, rather than reading the constraint as permission.

### The section-label motif

Tethr's standard section rule, reused as every diagram's header. Three stacked elements, left-aligned at
the diagram's x-origin:

```
[01]  ACCESS & IDENTITY        <- DM Mono 12, +12% tracking, #667899, at y-196
────                            <- 64 x 3px rule, #0755e9, at y-164
SELF-SERVE SIGNUP               <- Manrope ExtraBold 34, +0.5px, #001131, at y-146
```

The eyebrow carries the group letter and name; the title is the flow. This is what makes a board of ten
diagrams scan as one document.

> **Two frames, same geometry — read the offsets above as relative to band 1** (`-196 / -164 / -146`).
> [diagram-build-log.md](diagram-build-log.md) records the identical motif relative to a *diagram origin*
> (`+0 / +32 / +50`). Neither is wrong and neither said which it was, so a builder holding both had to
> derive that they agree. They do. Stated here so nobody derives it a third time.

> The title's `+0.5px` read `-1px` until 2026-09-15, contradicting both the table above and the
> positive-tracking rule three paragraphs up. The rule was right and the example was wrong — which is the
> dangerous way round, because a build session copies the example. **When a spec states a rule and then
> shows an example, the example is the part that gets followed; check it against the rule before trusting
> either.**

### Where mono can and cannot go

A FigJam `ShapeWithText` has a single text sublayer typed `NonResizableTextMixin`, which has no
`setRangeFontName` / `setRangeFontSize` / `setRangeFills`. **Mixed typography inside one shape is
impossible.**

- **Process boxes:** the code identifier is a second line in Manrope, same size as the human label.
  Accepted — `AccountService.signUp` and `isWorkspaceCreator: true` self-mark as code through CamelCase,
  dots and colons.
- **Whole-shape identifiers get mono.** An event pill (`organization.created`) or a boundary caption
  (`tenantContext.run(organizationId)`) is a single uniform run, so DM Mono applies cleanly.

Rejected: separate floating mono text nodes (they don't move with the box, reintroducing the maintenance
tax that decided the FigJam call), and a side key (makes the reader look away, breaking the four-second
read).

**Cap: roughly 3 identifier lines per diagram** — the entry point, and any box whose implementation isn't
obvious from its name. Without the cap, payroll ends up with twelve symbol lines.

Two clarifications on the cap:

- **It is a budget against noise, not a quota.** Spend a fourth when it buys a cross-diagram seam — that
  is exactly the "earns navigation" test. A2 carries four because `isWorkspaceCreator: true` is the seam
  back to A1. The cap bends for seams specifically; that is not a general loophole.
- **Band-1 surface names don't count against it.** One per diagram, always the same position, telling the
  reader where to go and look — a navigational anchor, not spine clutter. Name the surface in every
  diagram's band 1 (`SignUpPage`, `WorkspaceOnboardingForm (stepped)`); adjacent diagrams disagreeing about
  whether they name their surface is worse than either convention, and naming both makes a real asymmetry
  visible — the self-serve path is a plain form, the Tethr-driven one a three-step wizard.

## 5. Gotchas

- **FigJam section names do not render in an export — but they DO render in the editor viewport, and that
  is where the board is read.** This bullet said only the first half until 2026-09-25, and the second half
  is what bit: every boundary frame also carries an explicit caption text node at `section.x + 4`,
  `section.y - 26` (royal blue, DM Mono 14px), which is *exactly* where FigJam draws its own section
  label. Two labels, one position. The board's owner saw it as oversized truncated chips reading
  `A2 tena…` and `D9 tena…` overlapping the diagrams; every screenshot this project had taken was an
  export, so no screenshot could ever have shown it.
  **So blank the section name** (a single space) and let the styled caption carry the meaning — it is the
  only one of the two that can obey §3 and §4. All six boundary sections were blanked on 2026-09-25.

  > **The general lesson is about the verification instrument, not about sections.** §7 spends screenshots
  > to catch what readbacks miss, and this defect was invisible to both: a property readback saw two
  > correct objects, and an export saw one of them. **An instrument that cannot see a class of defect will
  > report a clean board indefinitely.** Where the complaint comes from the editor, the check has to come
  > from the editor too — which in practice means asking the person looking at it.
- **A `ShapeWithText` cannot render thinner than roughly 18px** — a 64×3 rule came out as a rounded blob.
  Draw rules as a **floating connector**: `connectorStart`/`connectorEnd` by position, `STRAIGHT`, both
  stroke caps `NONE`, `strokeWeight: 3`.
- **Edge labels collide with boxes when the gap is short.** Prefer a boundary caption over an edge label
  wherever a boundary already exists.
- **FigJam strokes take no alpha** — pre-flatten brand `rgba()` values onto the canvas colour.
- **Two different screenshot APIs exist and only one composites. This is the whole rule.**
  `node.screenshot({ contentsOnly: false })`, called inside `use_figma`, **does** composite everything
  sitting over the node. The `get_screenshot` MCP tool on the same node **does not** — it renders that
  node's own subtree, so a back-most act panel comes back as a flat rectangle of its fill colour, and
  passing `contentsOnly: false` to it changes nothing. Tested head to head on one node, one fill, one
  moment: composited from `use_figma`, blank from `get_screenshot`.

  So: **to read a region of a board, call `node.screenshot()` on its panel from inside `use_figma`.**
  `page.screenshot()` composites too but caps its returned image near 1080px, so above roughly 2000px of
  board it stops being legible and the panel is the only way in.

  > **Recorded wrong twice before it was tested, in opposite directions.** One pass hit a blank render and
  > retired region crops entirely; the next got a composite and un-retired them, attributing the
  > difference to the node's fill. Both generalised from a single observation, and **both were reasoning
  > about the fill while the variable was the API.** The blank renders were `get_screenshot`; the
  > composites were `use_figma`. Nobody ran the two side by side until someone reported the correction
  > failing to reproduce — which is the only reason the real condition surfaced.
  >
  > The lesson is not "test more". It is that **a claim of the form "X works" needs the conditions under
  > which it was observed**, or the next person reproduces a different setup and reasonably concludes the
  > opposite. Neither of the earlier entries named which tool it had used, and that omission is what made
  > two contradictory records both look complete.

- **A floating connector endpoint carries `endpointNodeId` *and* `position` at the same time**, so
  branching on one silently loses the other. A positional rule reports `endpointNodeId === "<page id>"`
  because FigJam attaches it to the page — so `ep.endpointNodeId ? readNode(ep) : readPosition(ep)` takes
  the node arm, returns no coordinates, and **a filter on y then drops every rule on the board without
  erroring.** Read both fields. This is §7.1's false pass in miniature: the readback looked clean and
  returned nothing for a whole class of node.
- **Custom hex over FigJam's native swatches is the correct trade.** Shapes register as "custom" colour
  rather than clickable palette swatches; matching the brand beats editor convenience.

### Research gotchas

- **A single-file grep supports a presence claim, never an absence claim.** "No publisher exists" needs a
  tree-wide `grep -rn … packages/api/src`; "this file has no wizard" says nothing about the sibling
  component that does. A confident structural claim about absence was wrong exactly once this way — the
  workspace intake *is* stepped, via `WorkspaceOnboardingForm` → `OnboardingFlow`, just not in the page file.
- **Event names are not uniformly cased.** Any inventory regex must be case-agnostic: a pattern requiring
  an all-lowercase first segment silently drops `employeeAssessment.*`, `employeeDocument.*`,
  `employeeFeedback.*` and `hiringRequest.*`, undercounting the registry by six. `DOMAIN_EVENT_NAMES`
  holds **36** entries as of 2026-09-15, of which **34 are actually published** — `user.created` and
  `user.linkedToEmployee` are declared and typed but have no publisher anywhere in `packages/api/src`, so
  neither is drawable, in any flow or in flow 10's map. Flow 10 is an inventory; an inventory that is six
  short is simply wrong.

  > This line itself read **33** until 2026-09-15 and was wrong by three, in a paragraph whose whole point
  > is not undercounting the registry. **A hard-coded count in prose is a fact with an expiry date.** Re-run
  > the inventory at build time rather than trusting any number written here — including this one.
  > Two traps when you do: a naive `grep` for `name: '<word>.<word>'` also catches string literals like
  > `'Contract.pdf'`, and the registry is not uniformly cased, so a pattern demanding a lowercase first
  > segment silently drops `employeeAssessment.*`, `hiringRequest.*` and their siblings.

## 6. Scope

| Group | Flows |
|---|---|
| **A · Access & identity** | 1 Self-serve signup ✅ · 2 Tethr-driven client onboarding ✅ · 3 Login, workspace select & switch ✅ |
| **B · People lifecycle** | 4 Employee onboarding ✅ · 4b Reporting line & assignment ✅ · 5 Separation / offboarding ✅ |
| **C · Time** | 6 Leave request → approval ✅ · 7 Clock → timesheet → lock ✅ |
| **D · Money** | 8 Payroll run → finalize → payslip ✅ · 9 `payroll.finalized` → invoice → issue → paid ✅ |
| **E · Platform** | 10 Module boundaries & event map ✅ |

### 6.1 Board regions — the actor axis

The board carries its own headings, written by the person who owns it, and they are **not** a competing
decomposition. **Their axis is the actor; §6's is the domain.** §6 is a *build* order — dependency-ordered
and event-aware — while the headings are a *reading* layout, and the grammar depends on neither. So both
stand, mapped:

| Board region (theirs) | Flows (ours) |
|---|---|
| **System & Admin Flows** | A1, A2, A3, B4 ✅, B5 |
| **Employee Flows** | C6 leave request, C7 clock → timesheet, and their "Salary Slip" |
| **Finance Module Flows** | D8, D9 |
| **Development Process — Tethr** | Theirs. Not claimed by this set. |

E10 is a system map, not a user flow, and belongs to no actor region — it wants its own area near the
legend.

**Open question, not yet decided: "Salary Slip" is probably not its own flow.** The payslip is the tail of
D8. Drawing it under two headings would put one flow on the board twice, which damages "ten pictures, one
map" far more than any palette slip. Default is to draw it once in Finance with the employee-facing view as
a band-1 surface inside it. An employee-perspective *payslip retrieval* flow is a different and near-trivial
thing — worth drawing only if actually wanted.

**Sketches on the board are not specs.** `Go to X Page → Press X form → Add info → Submit` is a click-path:
band 1, and nothing else. A sketch becomes the band-1 row of the real diagram; it does not set the
diagram's altitude. Mirroring a sketch's level of detail back at its author shows them nothing they did not
already draw.

### What the tick means

**A flow is ✅ only when a build call's folded-in verification readback confirmed it on canvas, and that
readback is written down.** ⚠️ means a session believed it built the flow and nothing checked; ❌ means it
does not exist on the current board at all.

The distinction is not pedantry. A1 carried a plain ✅ that rested on nothing but a previous session's
belief, and it was passed onward twice as established fact — once in this document, once by the design head
— before anyone noticed no one had looked. §7 already requires verification inside the build call; the gap
was that its output died with the transcript that produced it. A tick backed by a readback nobody can
retrieve is the same tick as one backed by nothing.

Evidence goes in **[docs/diagram-build-log.md](diagram-build-log.md)**, not here — the readbacks are
machine output in bulk, and interleaving them with the language would bury the language. This document says
what the grammar is; the build log says what is demonstrably on canvas.

**Flow 10 is not a process flow** — it is a system map, with no actor, no happy path and no time axis. The
three-band grammar does not apply. Build it last, under its own rules, and do not let it distort the
grammar for the nine flows that are genuinely sequential.

## 7. Build practice

**The call budget is no longer the constraint.** `whoami` reports plan tier `pro` with a **Full** seat,
which Figma's own rate-limit doc puts at **200 tool calls/day, 10/min** — not the 20/month this section was
written around. That old figure came from a Starter plan with a View seat, on a Figma account this project
no longer uses.

Everything this section said about rationing is therefore struck. What replaces it is not "spend freely"
but a *different rhythm*, because scarcity and abundance argue for opposite build shapes:

- **Build incrementally and verify per diagram, not per batch.** Under scarcity you build four diagrams in
  one script and read back once, because the call is the expensive thing. Under abundance the expensive
  thing is a mistake propagated across four diagrams before anyone looks. Smaller units, smaller blast
  radius, errors caught at diagram 1.
- **Spend screenshots on what only eyes can catch** — overlap, collision, illegibility, mid-word wrapping.
  This section always wanted that and could not afford it. It is now the cheapest defect-finder available
  and it is not optional: see the B4 entry in the build log, where a numeric fit check passed a box whose
  identifier was visibly broken in half.
- **Fold verification into the build call anyway.** Not to save a call — to make the readback contemporaneous
  with the write, so a silent no-op is caught in the same breath as the thing that caused it.
- **Build to this document, not to review.** The language is settled; if it is applied as written, it is right.

### 7.1 What a readback has to actually check

A readback is only evidence if it *could have failed*. B4's fit check compared `shape.text.height` against
box height; on a FigJam `ShapeWithText` that property is `undefined`, so every comparison was `false` and
the check reported a pass it never performed. It took a screenshot to find the box whose identifier wrapped
mid-word.

**Assert the shape of what you read before you trust the comparison** — that a number is a number, that an
array is non-empty, that a colour came back at all. A check that cannot fail is worse than no check: no
check leaves you looking, a false pass stops you looking.

### 7.2 Retired: the spend ledger

A ledger lived here, to answer "how many calls are left" for a 20/month cap. **Removed** — at 200/day the
question it answered no longer has stakes, and bookkeeping nobody needs is bookkeeping nobody maintains.

Kept because it generalises: the ledger's first row was very nearly reconstructed from memory and marked
"estimated". It was not, and the entry instead read *unknown, not zero*. **A record that invents its own
history is worse than an absent one** — the same principle that later downgraded A1's tick and rewrote the
fit check. If call budgets ever bind again, restore the ledger, not the guesswork.

### 7.3 Verification evidence

The readback §7 mandates is worthless if it only ever exists in a transcript. **Every build call's returned
fills, strokes, `dashPattern`, `fontName` and positions get pasted into
[docs/diagram-build-log.md](diagram-build-log.md), in the same turn, before the flow may be marked ✅ in §6.**

Two properties make this cheap enough that there is no excuse to skip it: the readback is already being
produced (§7 folds it into the build script at zero extra calls), and pasting it costs nothing but tokens.
The only thing being added is that it survives the session.

A flow whose evidence block is missing is ⚠️, regardless of how confident the session that built it was.

## 8. Consistency mechanism

FigJam has no variables, so the palette applies as literal hex. The legend at the top-left of the board is
the reference copy — **every new diagram copies its shapes from the legend** rather than re-entering hex
values. That is the only enforcement this file format allows.

**The legend carries every mark, including the two added on 2026-09-22.** A wash has no caption and a
terminator circle is 24px of hairline; both are legible only because the legend says what they are. A mark
that is not in the legend is a mark the reader has to guess, so adding one to the grammar is not finished
until the legend shows it.

**The key is an index of the board, not a catalogue of the language.** It tells a reader what they will
meet on these pages. The language lives in this file, and a builder reaching for a mark will find its rule
here whether or not the key has a row for it. **Those are two documents for two different people**, and
conflating them turns every "should this row exist?" into a false dilemma.

The stated rule above has a reciprocal, which went unstated until 2026-09-29 and had to be answered twice
by instinct before anyone wrote it down: **a key row with no mark on the board is as wrong as a mark with
no key row.** It teaches a reader to watch for something that is not there, costs them attention, and
leaves them wondering what they missed. **A rule that only works when someone has good instincts is half a
rule.**

Applied the same day: B4b's two washes were removed under §2.5's negative test, leaving none on the board,
so **the key's alternate-wash row was removed with them.** The wash remains part of the language and §2.5
still governs it; it is simply not currently drawn on this board.

**Conditional, and it expires if the ground changes back: the boundary frame and the alternate wash sit
adjacent, in that order, whenever both are present *and both read as blue*.** §2.5 gives the reason — the
confusion they invite is sequential, a reader remembering a hue across three days, so the key is the only
surface where the two are met together and told apart.

> **That premise had not held since the warm ground landed**, and nobody noticed for days. On the cream
> ground the wash composites to a neutral value step — measured blue lift of minus 3 — so the frame became
> the only blue region on the board and the pairing stopped protecting anything. **A rule can be live
> protection one day and decoration the next because of a change in an unrelated section**, which is why
> this one now states the condition it depends on rather than only the behaviour.

**The legend is board furniture, not part of any diagram.** It sits under its own `KEY` label with
generous clearance (currently ~390px) above the first diagram's section label. Every diagram's header must
be the topmost thing in its own region — otherwise the header reads as a caption belonging to whatever sits
above it.
