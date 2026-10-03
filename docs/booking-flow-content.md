# Book a call — flow content

> The client booking flow for the Tethr website, for the **Tethr — Book a call** FigJam board.
> Grammar is [diagram-language.md](diagram-language.md); verification discipline is
> [checking.md](checking.md). This file says what to draw.

**Single page. Two perspectives — technical and plain language — and two states, today and proposed.**

---

## 0. Ground truth, checked in `../tethr` on 2026-09-29

The nav path Talha described exists. **The form at the end of it is not hosted here at all — it is an
outbound link that opens Tally in a new tab**, and nothing else in the chain is built.

| Step | State |
|---|---|
| Navbar *"Work with us"* → `/apply` | **exists** — `src/components/navbar.js` |
| CTA *"Hire Talent"* → `/apply#hire` | **exists** — `src/components/cta.js` |
| `/apply#hire` → hire panel | **exists** — `src/components/apply-choice.js` |
| *"Tell us what you need"* → the form | **exists as an outbound link** — `apply-choice.js:87`, `target="_blank"`, to `tally.so/r/GxjYve`. No iframe, no `data-tally`, no embed script anywhere in `src` or the HTML |
| Custom "Book a call" form | **does not exist** — a design only |
| Supabase | **not in this repo.** No client, no config, no table reference anywhere |
| Google Calendar | **does not exist** |

```bash
cd ../tethr && grep -rln "supabase" --include=*.js --include=*.html . | grep -v node_modules
```

Returns nothing. Talha says a Supabase backend is already in place; **it is not wired to this site**, and
whether the table and keys exist is a question for him rather than an assumption for us.

> **What this codebase cannot tell us, and must not be read as telling us.** Tally's destinations —
> webhooks, Notion, email — are configured in Tally's own dashboard and are invisible to any grep here.
> `open-positions.js:5` says so in its own comment: *"connect it to your Notion."* So the claim this repo
> supports is **"nothing in this codebase receives or stores the submission"** — not *"the lead goes
> nowhere."* Same shape as the section-name defect in [checking.md](checking.md) §2: our instrument cannot
> see that surface, so **the absence of evidence is not the finding — the blindness is.**
>
> **Answered by Talha, 2026-09-29: the Tally form is wired to Notion.** Not Supabase. So TODAY's band 3 is
> **not empty** — the lead is captured, in Notion, by a route this repo cannot see. Drawn as empty it would
> have been a false finding, and it is exactly the one our instruments would have produced unchallenged.

### 0.1 This is a proposal, and that changes the deliverable

The HRMS set described working code. `06` described a largely unbuilt process and we only discovered that
afterwards. **This flow is a third thing: a proposed replacement for something that works today.**

So the deliverable is **two diagrams side by side, not one**:

- **TODAY** — nav → apply → hire → *a click that leaves the site*. That is the whole flow. It works.
- **PROPOSED** — the custom form, Supabase, the calendar, and everything that hangs off them.

**Do not merge them into one diagram with proposed steps marked.** That needs a fifth mark meaning "not
built yet", and a mark that says *this part is fiction* is the one thing this grammar has consistently
refused. Two diagrams need no new vocabulary, and **the comparison is itself the argument** — four boxes
against fifteen shows the cost of the change at a glance, which a single annotated diagram would hide.

---

## 1. Grammar deltas for this board

Most of the language carries. Three changes, and they matter because **an imported mark with no referent
is worse than a missing one.**

**Dropped: the tenant boundary frame.** There is no tenancy here. It stays unused rather than repurposed —
these boards share readers, and the frame means tenant execution on the HRMS board. A symbol that means one
thing on Monday's board and another on Tuesday's is the collision `one symbol, one meaning` exists to stop.

**Dropped: the publisher rule for event pills.** There is no `DOMAIN_EVENT_NAMES` here and no outbox. A pill
on this board is justified by a real webhook, email send or queued job — **named and locatable**, never by
intent. Same standard, different evidence.

**Kept, and it carries the most weight here: module-qualified identifiers.** This flow crosses into three
systems Tethr does not own. That crossing is carried by the label — `Supabase · insert lead`,
`Google Calendar · hold slot` — exactly as A3 carries `modules/account` into `core/auth` at zero structural
cost. **No new mark for "external service."**

The crossing's *risk* is carried where risk always is: a failure exit. An external system being down is a
domain failure of this flow, not an ambient platform one, so it earns a band-3 exit under §2.1.

---

## 2. TODAY — what happens now

- **Band 1** — navbar *Work with us* → `/apply` choice screen → *Hire talent* → *"Tell us what you need"*,
  which **leaves the site in a new tab.** Band 1 ends there.
- **Band 2** — client-side state only. `apply-choice.js` swaps between `root` and `hire`; the route never
  changes and **this flow has no submit, no handler and no server step.**

  > **Not because the site is static — it is not.** `api/notion.js` and `api/position-page.js` are Vercel
  > serverless handlers (`export default async function handler(req, res)`) and `vercel.json` rewrites
  > `/positions/:slug` to the second one. The claim "static site" appeared three times in this spec and was
  > corrected in §4.1 and §0 before this one was caught. **Say what is true of the flow, not of the site:**
  > the booking path has no server step, while the site plainly has server steps elsewhere. Drawing
  > "static site" on the canvas would have published the error, and a box label is the worst place for a
  > claim nobody re-checks.
- **Band 3** — `Tally · store submission in Notion`. Off-site, configured in Tally's dashboard, confirmed
  by Talha rather than by the repo — **label it as reported, not as verified**, since nothing here can
  check it and it can be changed in a settings screen without a commit.

**The last thing Tethr's own code does in this flow is a click.** The spine holds no write, and everything
after the click happens in systems configured elsewhere. **The lead is captured; it is just captured
somewhere no product surface can query.** That is the honest argument for the proposal — not *leads are
lost*, which would have been the wrong finding, but *leads land where nothing else can reach them*.

---

## 3. PROPOSED — the flow to draw

**Talha, 2026-09-29:** *"google calendar to set the dates → sends email to client that its booked for what
slot and then it gets posted to notion, that's the proposed."*

So the chain is: the form → Google Calendar → a confirmation email → Notion.

**The store is Notion, not Supabase.** His opening brief said Supabase; his last two messages say Notion,
and the site already has a Notion integration. Build to Notion. **What that costs is in §4.0 and it is not
nothing** — but it is his call and it is a one-box change if he reverses it.

1. **Client fills the form** — name, position, company, email, hardest hiring problem, headcount band,
   urgency. One page, on `tethrhq.com`.
2. **Client-side validation** — required fields, email shape. Failure exit: inline, no submit.
3. **`api/lead · capture the enquiry`** — one more serverless function beside `notion.js` and
   `position-page.js`. **Synchronous. The client waits for this one** (§4.1).
4. **`Google Calendar · present availability`**.
5. **Client picks a slot.**
6. **`Google Calendar · create event`** — the booking exists from this moment.
7. **`Google Calendar · email the client`** — see §4.7; this is Google's own invite unless someone builds
   otherwise, and the diagram should say which.
8. **Confirmation screen.**

**Band 3** — `api/lead · attach the slot`, fire-and-forget off step 6; the confirmation email as a
consequence pill; and the failure exits: submit rejected, calendar unavailable, slot taken between offer
and confirm.

> **This line read `Notion · attach the slot` until 2026-09-25.** It was written before §4.0's one-box
> ruling and did not get swept when that ruling landed, so the step list and the ruling contradicted each
> other on the same page and a worker had to choose between them. **Third instance of the same failure:**
> a correction applied to the argument, not to the instances — the one `checking.md` §5 exists to prevent,
> committed after the rule was written. The rule is right; applying it takes a grep, not an intention.

**Band 2 is full here and empty in TODAY.** That contrast is the clearest statement this board can make and
it is why the key leads with the band miniature.

## 4. Recommendations Talha asked for

He invited changes to the post-form flow. These are ordered by what they cost if ignored.

### 4.0 The proposal as described does not close the gap that TODAY exposes

TODAY's finding is that **the lead lands where no Tethr surface can query it.** The proposed chain ends in
Notion — **the same store.** So the proposal fixes the two things it sets out to fix, and leaves the third
untouched:

| | Today | Proposed |
|---|---|---|
| Client stays on `tethrhq.com` | no | **yes** |
| Client can book a call themselves | no | **yes** |
| Lead is queryable by a Tethr product surface | no | **no** |

**That is worth stating rather than quietly drawing.** If Supabase was in the original brief because the
lead needs to reach a dashboard or the HRMS, this chain does not get it there, and nobody will notice until
someone asks the database a question it cannot answer. If Notion is genuinely where leads belong, the
proposal is complete and this note is just a closed question.

**Talha, 2026-09-29: *"I am going to migrate to Supabase down the line."*** So this is a staging post
rather than a destination, and that has a design consequence worth drawing:

> **Keep the store in one box.** Every write goes through `api/lead`, and Notion is named inside it rather
> than scattered across the flow. Then the migration is one box changing its label — not a hunt through a
> diagram, and not a hunt through the code the diagram describes.

This is the cheapest thing on the list and the only one that gets more valuable the longer it is left
alone.

### 4.1 The lead must be durable before the calendar — and today Tethr never sees the submit

**Anything that happens after the insert can fail without costing a lead.** Anything before it means an
abandoned calendar step is an abandoned lead, and the calendar is exactly where people abandon — it is the
step that asks for a commitment the form did not. The booking is the bonus; **the lead is the product of
this page.**

**Talha asked directly whether the post happens after the booking or simultaneously. Neither — before, and
the two writes are not the same kind of write.**

| | When | Client waits? | Cost if it fails |
|---|---|---|---|
| **Write the lead** | on submit, before the calendar | **yes** — synchronous, band 2 | **the lead, entirely** |
| **Attach the slot** | after the booking exists | **no** — fire-and-forget, band 3 | one field, recoverable from the calendar |

**The asymmetry is the whole answer.** A failed first write loses a client who was standing right there and
would happily have retried — so make them wait the few hundred milliseconds and show them an error if it
breaks. A failed second write loses a field that Google Calendar still holds, so blocking the confirmation
screen on it would trade a real cost for an imaginary one.

That also answers the *simultaneous* option: **the client cannot be shown a slot they have not chosen yet**,
so the two writes are inherently ordered. What is genuinely concurrent is only the second one against the
confirmation screen, and band 3 is exactly how this grammar draws that.

**One row, updated — not two.** The lead and its booking are one enquiry.

**On the mechanism, which the earlier fork settles.** An earlier draft said "save on submit", which assumes
Tethr observes the submit — untrue while the form lives on tally.so. Talha's mockup resolves it: the form
is ours, so the submit is ours, and the fork below is decided in favour of the second row.

| Route | What it costs | What it gets |
|---|---|---|
| **Tally webhook → Supabase** | configuration, no new UI | the row, with Tally still owning the form and its look |
| **Rebuild the form on-site** | a form, a submit path, and one more `api/` function | the design Talha drew, the field set he wants, the calendar on one page, and the client never leaves tethrhq.com |

Talha's mockup is the second route, and **it is cheaper than an earlier draft of this section claimed.**
That draft said it would give "a static site a server surface". **The site is not static.** `api/notion.js`
and `api/position-page.js` are already serverless handlers — `export default async function handler(req,
res)`, with `vercel.json` present. A lead endpoint is *one more function in a directory that already has
two*, not a new capability.

So the real trade is narrower: **a settings change versus one endpoint plus a form.** Both are small. The
deciding factor is not cost, it is that route two keeps the client on `tethrhq.com` and puts the data
somewhere queryable — which is the point of the exercise.

### 4.2 Do not build availability. Use Google's own appointment scheduling, or Cal.com

Availability is deceptively hard: timezones, working hours, buffers between calls, double-booking races,
daylight saving, and the client's calendar versus ours. **Every one of those is solved in a product that
costs less than a week of building it.**

A custom implementation also owns the race in §4.4, which a hosted scheduler does not.

### 4.3 Link the two records, or you have two disconnected systems

If the calendar is a plain embed, a booking lands in Google with **no reference to the Supabase row.** Then
nobody can answer *"which lead is this call with?"* without matching by email and hoping.

Pass the lead id into the booking — as a prefill field or in the event description — and **write the
booking back to the lead row via webhook.** Both halves are needed; the id alone gives you a link nothing
follows.

### 4.4 The slot race is real and it is worth one box on the diagram

Two clients see the same free slot and both pick it. Whoever confirms second gets a call that is not in our
calendar, and finds out at the meeting. **A hosted scheduler handles this; a custom one must hold the slot
between offer and confirm**, which is the second-hardest part of §4.2's list.

Draw the failure exit either way: *slot taken while you were choosing — pick another.*

### 4.5 Ask for timezone, or infer it and show it back

The form does not ask. A client picking "2pm" in an unstated timezone is a no-show waiting to happen.
Infer from the browser, **display it next to the slots**, and let them change it.

### 4.6 Row-level security is not optional on a public form

A public page holding a Supabase anon key needs a policy that permits **insert only** on the leads table.
Without it, the same key that writes a lead can read every lead — names, companies, emails, and what each
one said their hardest hiring problem is. **That is a client list, and it would be published in the page
source.**

Rate limiting and a captcha belong here too, but RLS is the one that is a breach rather than a nuisance.

### 4.7 Decide who sends the confirmation

Google's own confirmation is generic and arrives from Google. A Tethr-sent confirmation needs a send path —
the website has none today. **Cheapest honest answer: let the scheduler send it for now**, and draw that as
`Google Calendar · send confirmation` rather than implying Tethr does it.

---

## 5. Plain-language version

Same two states, same content, no service names — `Supabase · insert lead` becomes *"we save your details"*;
`Google Calendar · create event` becomes *"the call goes in both calendars."* The failure exits stay, because
they are what a person actually experiences.

**The TODAY diagram in plain language is one line: *"you fill in a form and we get an email."*** That is
worth drawing, because it is the clearest possible statement of why the proposal exists.
