# Onboarding automation (n8n) — integration guide

For: whoever maintains the n8n onboarding workflow. This moves the trigger from
the Notion **Start Automation** button to the HRMS **Run automation** button,
and moves the write-back from the Notion Status tag to the HRMS.

## How it works today (Notion)

- A person is a row in the Notion **Employees** database.
- Their **Status** tag says where they are: `Pre-Onboard` → `Offer Letter - Review`
  → `Offer Letter - Sent` → `Employee Record - Review` → `Employee Record - Sent`
  → `Contract Letter - Review` → `Contract Letter - Sent` → `Salary Letter - Review`
  → `Salary Letter - Generated` → `Active`.
- HR presses **Start Automation**. Notion posts the row to an n8n webhook.
- n8n branches on Status, does the step (drafts or sends the letter or form), and
  writes the next Status back to Notion.

## How it works with the HRMS

1. HR opens the employee → **Onboarding** tab → **Run automation**.
2. The HRMS records a *run* and, a few seconds later, POSTs it to the n8n webhook.
3. n8n does exactly what it does today, branching on the same Status strings
   (`stageLabel`).
4. Instead of updating Notion, n8n POSTs the result to the HRMS **callback**. The
   HRMS moves the person to the new stage and shows the result to HR.

HR can also set the stage by hand (the same as changing the tag in Notion).

## What changes in the workflow

| Today (Notion) | With the HRMS |
|---|---|
| Notion button → Webhook node | HRMS → the same Webhook node (new URL is fine too) |
| Read Status from the Notion page | Read `stageLabel` (same strings) or `stage` from the body |
| Read name, email, salary… from Notion properties | Read them from the body (table below) |
| "Update a database page" → Status | HTTP Request → `POST {{$json.body.callback.url}}` |

Everything in between (Google Docs templates, Gmail, Drive folders) stays as is.

### 1. Webhook trigger

- Webhook node, method `POST`, respond **Immediately** (the HRMS waits at most
  15 seconds for a 2xx).
- Authentication: **Header Auth**, name `Authorization`, value
  `Bearer <ONBOARDING_AUTOMATION_SECRET>`.
- Copy the node's **production** URL into HRMS → Settings → Automations →
  Webhook URL, tick *Turn on*, save.

Every request also carries:

| Header | Value |
|---|---|
| `Authorization` | `Bearer <secret>` |
| `X-HRMS-Signature` | `sha256=<hex HMAC-SHA256 of the raw body, keyed with the secret>` |
| `X-HRMS-Delivery` | the run id (same as `runId` in the body) |

The bearer check is enough. The signature is there if you also want to verify
the body (see the Code node at the end).

### 2. Body the HRMS sends

```json
{
  "version": 1,
  "event": "onboarding.automation.requested",
  "runId": "709a5e2f-23a3-4ca0-bfb4-80a7c507ffd7",
  "requestedAt": "2026-11-25T13:12:04.000Z",
  "requestedByUserId": "…",
  "workspace": { "organizationId": "…", "name": "Tethr" },
  "stage": "offerLetterReview",
  "stageLabel": "Offer Letter - Review",
  "employee": {
    "id": "…",
    "employeeNumber": "TTR-099",
    "fullName": "Alex Morgan",
    "firstName": "Alex",
    "lastName": "Morgan",
    "personalEmail": "alex@example.com",
    "workEmail": null,
    "phone": "+92 300 0000000",
    "roleTitle": "Product Engineer",
    "startDate": "2026-12-01",
    "workerType": "permanent",
    "probationEndDate": "2027-03-01",
    "noticePeriodDays": 30,
    "documentsFolderUrl": "https://drive.google.com/drive/folders/…"
  },
  "compensation": {
    "currency": "PKR",
    "annualAmount": 1800000,
    "monthlyAmount": 150000,
    "effectiveFrom": "2026-12-01"
  },
  "callback": { "url": "https://api.tethrhq.com/automations/onboarding/callback", "method": "POST" }
}
```

In n8n the body is under `$json.body`. For example, `{{$json.body.stageLabel}}`.

`compensation` is `null` until a salary is set up for the person in the HRMS
(Employee → Job & pay). `documentsFolderUrl` is `null` until the workflow
reports one back, or HR adds it.

#### Notion property → payload field

| Notion property | Payload field |
|---|---|
| Status | `stageLabel` (same strings) / `stage` (key) |
| Full Name | `employee.fullName` (`firstName`, `lastName`) |
| Personal Email | `employee.personalEmail` |
| Work Email | `employee.workEmail` |
| Phone | `employee.phone` |
| Role / Title | `employee.roleTitle` |
| Start Date | `employee.startDate` |
| Employment Type | `employee.workerType` (`permanent`, `fixedTerm`, `contractor`, `intern`, `temporary`) |
| Salary (PKR) / Salary (USD) | `compensation.monthlyAmount` + `compensation.currency` (`annualAmount` too) |
| Docs Drive | `employee.documentsFolderUrl` |
| Client | `workspace.name` (the person's HRMS workspace) |
| Alt-ID / Global-ID | `employee.employeeNumber` |
| Page id (for the update) | `runId` (send it back in the callback) |

### 3. Report back (replaces "Update Notion page")

HTTP Request node:

- Method `POST`, URL `{{$('Webhook').item.json.body.callback.url}}`
- Header `Authorization: Bearer <secret>` (same Header Auth credential)
- JSON body:

```json
{
  "runId": "{{$('Webhook').item.json.body.runId}}",
  "status": "succeeded",
  "stage": "Offer Letter - Sent",
  "documentUrl": "https://docs.google.com/document/d/…",
  "documentsFolderUrl": "https://drive.google.com/drive/folders/…",
  "message": "Offer letter emailed"
}
```

| Field | Required | Notes |
|---|---|---|
| `runId` | yes | from the incoming body |
| `status` | no | `succeeded` (default) or `failed` |
| `stage` | no | the new stage, either the Notion label (`Offer Letter - Sent`) or the key (`offerLetterSent`). Leave it out to keep the stage as is. Ignored when `status` is `failed`. |
| `documentUrl` | no | the letter this run produced; HR gets an *Open document* link |
| `documentsFolderUrl` | no | the person's Drive folder; stored and sent back on every later run |
| `message` | no | shown to HR as-is (use it for the error on a failure branch) |

Responses: `200 {"ok":true,"runId":…,"status":…,"stage":…}` · `400` bad body
(the message says which field) · `401` wrong secret · `404` unknown run id ·
`503` automation not configured on the server. Extra fields in the body are
ignored, so the whole item can be sent.

Call it **once per run**. A repeated call for a finished run changes nothing and
returns the current state.

On an error branch, send `{"runId": …, "status": "failed", "message": "Template not found"}`
so HR sees why. If the callback never arrives, HR can run the step again after
10 minutes.

### Optional: verify the signature (Code node)

```js
const crypto = require('crypto');
const secret = $env.HRMS_ONBOARDING_SECRET;
const raw = JSON.stringify($json.body); // n8n parses the body; re-serialise as sent
const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(raw).digest('hex');
if ($json.headers['x-hrms-signature'] !== expected) throw new Error('Bad signature');
return $input.all();
```

(Re-serialising works because the HRMS sends compact JSON. If you need
byte-exact checks, turn on *Raw Body* in the Webhook node and hash that.)

## Setting it up (HRMS side)

1. **Secret.** Generate one (`openssl rand -hex 32`) and set
   `ONBOARDING_AUTOMATION_SECRET` on the API (Coolify → tethr-hrms-api →
   Environment Variables, runtime). Give the same value to the n8n credential.
   Don't paste it into Slack or chat.
2. **Public address.** Make sure `PUBLIC_API_URL=https://api.tethrhq.com` is set
   on the API, or the callback URL in the payload is `null`.
3. **Database.** Apply migration `1793730000000-OnboardingAutomation` (three new
   tables, nothing else changes). Apply that one migration deliberately rather
   than running every pending one.
4. **Redeploy** the API and the web app.
5. **Connect.** HRMS → Settings → Automations: paste the n8n production webhook
   URL, tick *Turn on*, save. The badge turns **Connected**.
6. **Test** on a test employee: Onboarding tab → Run automation. The run shows
   *Starting* → *Running* → *Done* with the new stage.

People who are still candidates in Notion (`Pre-Onboard`) need an employee
record in the HRMS (hire date = start date) before they can be run.

## Who can do what

- **Run automation / set stage:** Tethr admin and Tethr HR (`employee:write`).
- **See the stage and history:** anyone who can see the employee's sensitive
  records.
- **Connect the workflow:** Tethr admin (`organization:manage`).

The salary goes to n8n inside the payload. It is never shown to the person
pressing the button.
