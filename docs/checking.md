# Checking

> How this doc set decides what it is allowed to claim. Split out of
> [diagram-language.md](diagram-language.md) on 2026-09-25, because eighty lines of epistemics had
> accumulated *in front of* §1 and the grammar was getting hard to find inside its own commentary.
> That file is the spec; this one is why it can be trusted.

Four documents, four jobs. [diagram-language.md](diagram-language.md) says **how** to draw ·
[process-flow-content.md](process-flow-content.md) says **what** to draw ·
[diagram-build-log.md](diagram-build-log.md) records **what is demonstrably on canvas** · this file says
**how any of that is known**.

## 1. Rules here, facts in the code

**These documents carry rules and reasoning. They do not carry counts, ticks, links or line numbers.**
Those live in the code, and the docs point at the command that reads them.

Four instances of one failure, all on 2026-09-15: A1's ✅ rested on a previous session's belief and nobody
had looked; the board link pointed at a file this project can no longer authenticate to; a registry count
said 33 when the registry held 36 — inside the paragraph warning against undercounting the registry; and a
content spec routed a flow through a service method that has no caller. **Every one was true when written,
and not one had any way to announce that it had stopped being true.**

That is the property prose lacks and code has. **A wrong number in a paragraph fails silently; a wrong
number in a script fails loudly.** Where a fact is volatile — how many events exist, which are published,
what is on the board, where a method is called from — run `node scripts/verify-events.js` or the
equivalent, and distrust any number written in this doc set, including the ones written today.

**Prefer a pointer that fails loudly.** A symbol name and a line number are not the same kind of reference:
grep for `publishWithin` and it either resolves or it does not; land on line 24 and you read something
plausible two lines from what was meant, and nothing tells you. Two citations here were wrong the day they
were written — not drifted, *never correct* — and neither was detectable by reading the page they sat on.
**Cite the symbol; add a line number only where nothing else locates the thing.**

## 2. One failure, three sets of clothes

Three separate discoveries on 2026-09-25 turned out to be the same shape:

| It looked like | It actually was |
|---|---|
| FigJam section names do not render on canvas | true of **exports**, false in the editor — where the complaint came from |
| an act break must be three times the diagram gap | correct until panels arrived and the **fill boundary took the job** |
| the key is board furniture | accurate about **what it is**, wrong about **what it is for** on page 1 |

**Each passed every check anyone applied, and each was wrong on a dimension nothing checked.** That is the
whole family: *not false, and not adequate.*

They fail differently and it is worth keeping the distinctions:

- **A claim true under your only test** is worse than a plainly wrong one, because a wrong claim fails when
  tested and this one passes. **The true half keeps the false half alive.**
- **A rule whose job has moved** stays internally consistent forever. A stale fact is wrong and checking
  catches it; **an obsolete rule is still right, so nothing catches it.** When a new channel takes over a
  distinction, the old channel's thresholds stop being requirements and quietly become habits — which is
  how a grammar accretes rules nobody can justify and nobody dares remove.
- **A classification accurate about identity** can still license the wrong treatment. *Furniture* correctly
  described the key and permitted it to shrink to a tenth of the page. **Importance is contextual and a
  global label hides that.**

**Two questions catch all three, and neither is asked by default:**

> *What would this look like if it were false, and can anything I own see that?*
>
> *What would break if this were dropped?*

The second one caught its own author on the day it was written — a 4px gap was about to be defended on a
rule whose work the panel fill had already taken over.

## 3. Where the instruments are blind

Two checks failed together on the section-name case: a property readback saw two individually correct
objects, and **an export cannot render section names at all.** Every screenshot this project takes is an
export.

**When a claim and a complaint disagree, suspect the instrument before the complaint.** And where the
instruments are blind, the person looking at the board is not a redundant check — **they are the only
instrument.** When a visual report cannot be reproduced in an export, the honest response is *we cannot see
this class of defect*, never *we verified it is fine*.

**A grep cannot verify a multi-word claim in a hard-wrapped file, and every doc in this set is hard
wrapped.** Checking whether a rule survived a restructure by grepping its phrase returns a confident zero
whenever the phrase happens to straddle a line break — which is how a clean restructure nearly had a defect
raised against it. **Search for the rarest single token in the claim, not the sentence**, or use a
multiline search and say so.

Note which way that failed: it manufactured work rather than hiding a fault, **and that was luck, not
design.** The same blindness pointed the other way — grepping to confirm something is *still there*,
matching a fragment, concluding it survived — passes silently and is the version that will eventually cost
something.

**A signal that a process finished is not a signal that it produced anything.** A dispatched build was
killed mid-run by a platform limit; the notification that arrived said only that the session had gone idle,
which is the same notification a completed build sends. **Read as completion it was wrong, and read as
failure it would also have been wrong** — it carried neither. The board, checked directly, carried both:
unchanged dimensions, and no partial state to clean up.

So: **check the artefact, never the notification about the artefact.** This is the same shape as an export
that renders a board but not its section names — an instrument reporting faithfully on the thing it
measures, which is not the thing you wanted to know.

**Most of these share one cause: a proxy standing in for the property actually cared about.** Four in a
single session — grouping tokens by name prefix when the property was *does this vary by mode*; guarding
staleness by timestamp when it was *does the content match*; trusting a build output when it was *does this
match its source*; counting grep hits when it was *how many tokens exist*. **Every one of those proxies was
exact when it was chosen, and every one had quietly stopped being so.**

**And a proxy nobody consumes cannot be noticed when it rots.** The website's `--accent` had been a purple
from a dead design for who knows how long; it survived because `var(--accent)` is referenced **twice** in
the whole stylesheet while the real brand blue is written inline forty-one times. **Low-usage declarations
are where staleness hides, because nothing exercises them** — so when auditing, count the references, not
just the values.

A proxy is not a mistake — the real property is often expensive and the proxy is usually fine. **So write
down what it stands for.** A proxy with its referent recorded is a shortcut someone can re-check; one
without is a claim nobody can audit, including you.

**And record which instrument you used.** Two entries in this doc set contradicted each other about whether
a screenshot technique worked on a filled panel. Both reasoned about the fill; **neither recorded which API
it had called** — so both looked complete, neither was reproducible, and the second read as a correction of
the first rather than as a second unexplained result. A head-to-head test settled it in one attempt:
`get_screenshot` renders the panel flat, `node.screenshot()` inside `use_figma` composites it. **The
variable was never the one either entry was reasoning about.**

So a claim of the form *X works* carries nothing without the conditions it was observed under.
**An observation without its instrument is not a finding, it is an anecdote** — and two anecdotes can
contradict each other while both appear to be records.

**The canvas is an instrument too, and what it tests is the spec.** Twice a layout has refused to be drawn,
and both times the rule was at fault rather than the geometry: §16.2 demanded a panel padding and a column
gap that a fixed content width could not both satisfy, and §2.5 demanded a wash enclose arms whose
terminations belong to a band the wash should not reach. **A layout that cannot be drawn is usually a spec
that has claimed too much** — so when geometry refuses, check the rule before rearranging the nodes. The
refusal is information, and it is the only instrument here that reads a spec for internal consistency
without being asked to.

**A structural change can invalidate the marks on the structure, in the same pass that makes it legal.**
The §2.5 clarification that let B4b's fork be drawn is what made B4b's wash false: the mark did not change,
its subject did. So **"do the marks still hold?" belongs inside a structural change, not in a review after
it** — by review time the mark has been correct for a week and reads as settled.

**It tests the content too, and that is the third time it has paid.** B4b's fork could not be drawn, which
forced the question *which box actually raises this error* — and the answer was that the no-position exit
had been hanging on a step the failing path never reaches: `setReportingLine` **returns** out of the
same-day correction arm before the position is resolved at all. **A false claim about the code, on the
canvas, past every readback and two reviews**, found only because a layout refused. Readbacks check that a
node is what you asked for; nothing checks that what you asked for was true.

**This extends to vendor documentation, the one source that had been taken on faith.** The Figma plugin
skill states flatly that `figma.createPage()` throws in FigJam. It does not, in this file — probed
directly, it returned a page. Believing the sentence would have made the five-page split look
unexecutable, and nothing would have contradicted it. **Probe the API, then write down what it did.**

## 4. When a correction earns a permanent note

These files keep their wrong turns visible — the `-1px` tracking example, the middle dot that acquired four
jobs, the wash defence aimed at the wrong risk. The habit is load-bearing: **a spec that records only its
conclusions reads as though it were always correct, and the next person to find a rule inconvenient has
nothing to argue with.**

But *a future session might repeat this* is a justification that never runs out, and a file where every past
error leaves a permanent paragraph grows without bound. So:

> **A correction earns a permanent note only when the wrong version was attractive** — when it looked
> right, and would look right again to someone reasoning carefully. Then the note prevents a recurrence.
>
> **When the error was a slip, fix it silently.** Nobody was going to reach for that version anyway, and
> the note costs a reader attention for nothing.

## 5. Adding a rule and reconciling one are different acts

Only the first feels like work. **Arithmetic has a procedure, so it gets one; consistency has none, so it
gets skipped** — which is why, twice on 2026-09-25, a numeric error was caught before a contradiction
sitting two sentences away from it.

Before adding a rule to any file in this set, **grep it for what it already claims about that subject, and
reconcile rather than append.** A section added beside the claim it disproves leaves a reader to decide
which one is the mistake, and they will usually pick the newer one.

**The same applies to correcting a claim, and it fails more quietly.** A false statement — *"this is a
static site"* — was corrected in the two places where it was doing argumentative work, and survived in a
third where it was merely describing. **A correction applied by meaning reaches the instances you were
thinking about; the ones that survive are where the claim was incidental, which is exactly where you are
not looking.**

It nearly reached a box label, which is the worst resting place available: **a diagram states things
nobody re-checks.** So — **search for the claim, never rely on remembering where you made it.** Correcting
the argument feels like finishing; it is half the job.
