# Audit — Mumbai property-tax payment

- **Service:** property-tax-payment
- **Jurisdiction:** Mumbai, Maharashtra, India
- **Primary scenario:** `scenario_property_tax_payment_known_sas_pid`
- **Audit date:** 2026-09-06
- **Benchmark version:** 0.1
- **Mode:** grid-only (no nodes, edges, roadblocks, journeys or portal sidecar expected; their absence is not raised)

Inputs were limited to the integrated ledger, the expectations sidecar, `benchmark/schemas/ledger.json`, `benchmark/PROTOCOL.md`, `benchmark/schemas/corrections.json`, and the manifest entry. No researcher notes or handoffs were received or sought; no browsing was performed.

---

## Findings

### F-01 — correction — `expectation/property-tax-payment` `/cells/documents`

**Record:** expectations sidecar, cell `documents` (currently `absent`, `claimIds: []`).

**What the protocol requires:** Section 8 defines `absent` as "the reviewed evidence does not touch the topic", and `mentioned` as "the topic is named but no actionable value is given". For `documents` specifically: "`stated` when the evidence gives an actionable document list or names a concrete document with a requirement to submit, provide, upload, produce, or attach it. A reference to documents without telling the citizen what is required is `mentioned`."

**What I observed:** `claim_mumbai_ptax_account_number_from_bill` (Grade B, `verified`, scenario-tagged to the primary scenario) states that the Property Account No. "is shown on the upper portion of the property tax bill". That names a concrete document — the property tax bill — as the artefact the citizen must have in hand to carry out the very transaction this scenario describes, and it is on a reviewed route. The reviewed evidence therefore *touches* the topic. It stops short of `stated`, because no route imposes a requirement to submit, provide, upload, produce or attach anything, and the portal even supplies a Search route for owners without the bill. That gap is exactly what the second sentence of the `documents` definition calls `mentioned`, not `absent`.

The cell's existing note is accurate about what is missing ("Nothing on the portal tells an owner … what to submit, provide, upload, produce or attach"). But that sentence establishes the boundary between `stated` and `mentioned`, not the boundary between `mentioned` and `absent`, and the cell was scored on the wrong one.

I checked the section 3 explicit-zero rule against this cell: no reviewed route states "no documents required" or any equivalent zero, so section 3 does not lift the cell. The scope exclusion of the change-of-name circular is legitimate — mutation is excluded by the scenario summary — and I have not used it as evidence in either direction.

**Correction:** state `absent` → `mentioned`; `claimIds` `[]` → `["claim_mumbai_ptax_account_number_from_bill"]`; note amended. Searched routes retained.

### F-02 — correction — `expectation/property-tax-payment` `/cells/time`

**Record:** expectations sidecar, cell `time` (currently `absent`, `claimIds: []`).

**What the protocol requires:** Section 8 for `time`: "`stated` when the evidence gives an actionable duration, deadline, processing period, or service-level target. A reference to timing, delay, **sequence**, or **processing** without a figure or usable time rule is `mentioned`."

**What I observed:** `claim_mumbai_ptax_first_in_first_out_rule` (Grade B, `verified`) states that online payment "is applied on a first-in first-out basis, with the oldest bill adjusted first". That is a rule about the order in which payments are processed, expressed by the age of the bills — a reference to sequence and to processing. The definition names both of those words as topic-touching references that yield `mentioned` when no figure accompanies them, and no figure accompanies this one.

This is the closest of the three calls in this audit, and I record why it lands where it does. The cell's existing note is entirely correct that there is no due date, no instalment period, no rebate or penalty deadline and no service-level target on any reviewed route; the reviewed corpus is genuinely barren of time figures. But `absent` asserts something stronger than "no figure" — it asserts that the evidence does not touch the topic at all, and a first-in-first-out processing rule does touch it.

Two things I tested and rejected as *not* touching `time`. First, the instant-payment route's `discount` and `advance` fields (`claim_mumbai_ptax_public_instant_payment_route`): reading an early-payment window or a due date out of a field labelled "Discount", or a deadline out of "Advance", is an inference the ledger does not make and that section 5 forbids the auditor from supplying. Those fields bear on `cost`, not on `time`. Second, `claim_mumbai_ptax_due_date_unknown` is an `Unknown` claim; section 8 is explicit that an `Unknown` claim records a limitation and not a positive cell value, and the sidecar correctly did not list it. Neither of these lifts the cell, and neither is affected by this correction.

**Correction:** state `absent` → `mentioned`; `claimIds` `[]` → `["claim_mumbai_ptax_first_in_first_out_rule"]`; note amended to say precisely what is and is not touched. Searched routes retained.

### F-03 — correction — `expectation/property-tax-payment` `/cells/after-submission`

**Record:** expectations sidecar, cell `after-submission` (currently `absent`, `claimIds: []`).

**What the protocol requires:** Section 8 for `after-submission`: "`stated` only when the evidence identifies something the citizen sees after submitting … A step at or before submission — including registration, document presentation, **payment**, appointment booking, or the act of submission — is not after-submission evidence. **An outcome named without a visible or actionable post-submission surface is `mentioned`.**"

**What I observed:** `claim_mumbai_ptax_first_in_first_out_rule` describes what becomes of the money *after* it is paid: the payment "is applied on a first-in first-out basis, with the oldest bill adjusted first", and a citizen who wanted it applied to a specific bill "should contact the Assessment & Collection department of the respective ward". The application of the payment to a bill is not a step at or before submission — payment is the submission, and this is its disposition. The ward route is recourse after the fact. So an outcome is named, and a recourse is named, on a reviewed public route.

No visible or actionable post-submission surface accompanies that outcome: nothing on any reviewed route names a receipt, acknowledgement, transaction reference, status page or downloadable result. That combination — outcome named, surface absent — is the exact case section 8 assigns to `mentioned`.

The cell's existing note addresses only the instant-payment route's outstanding-bill display, correctly observing that it is what the citizen sees *before* paying. It does not address the first-in-first-out application rule at all, and that rule is what carries the cell. The note's handling of the CAPTCHA boundary is right and is preserved: `claim_mumbai_ptax_login_behind_captcha` is a boundary statement and `claim_mumbai_ptax_payment_receipt_surface_unknown` is `Unknown`; neither may support a positive cell value, and neither was used to support one, here or anywhere in the sidecar.

**Correction:** state `absent` → `mentioned`; `claimIds` `[]` → `["claim_mumbai_ptax_first_in_first_out_rule"]`; note amended. Searched routes retained.

### F-04 — correction — `source_mumbai_ptax_contact_and_faq`

**What the protocol requires:** Section 7 — "Every non-`Unknown` claim needs at least one source. A source supplies the direct link, exact access date, and jurisdiction. Citations must resolve to specific pages."

**What I observed:** This one source record documents two distinct routes, and its `url` is the Contact Us route, `…/index.html#/contactus`. `claim_mumbai_ptax_faq_route_empty` (Grade B) is an assertion about the *FAQ* route's rendered content and cites this source. A reader following that citation lands on Contact Us, not on the page where the claim can be checked; the FAQ route's exact URL appears nowhere in the ledger, only in the sidecar's `searchedRoutes`. The citation therefore does not resolve to the specific page the claim rests on.

This is not the failure mode section 7 warns about most sharply — no homepage has been substituted for a dead specific page, and both routes are specific pages on the same portal, honestly declared as observed on the access date. The defect is that only one of the two direct links is recorded. The minimal fix that closes it is to record the FAQ route's exact URL in the source's notes; splitting the record was considered and rejected as churn the protocol does not prescribe.

**Correction:** `/notes` amended to carry both route URLs and to say which one `claim_mumbai_ptax_faq_route_empty` rests on. No grade, status or claim change.

### F-05 — note — `cost` cell upheld as `stated`

I examined the challenge that an eleven-year-old percentage table cannot give "a value a citizen can act on" for a current-year payment, and I reject it.

Section 8 defines `stated` as "a Grade A, B, or **C** claim gives a value a citizen can act on", and defines the `cost` cell's `stated` trigger as "an amount a citizen pays **or an actionable fee schedule**". The `mentioned` triggers it lists are all figure-absence cases: "a fee described only as prescribed, a payment step without an amount, or a penalty payable by the agency". Staleness is not among them. `claim_mumbai_ptax_residential_rate_table` gives ten concrete percentages for the residential user category, and `claim_mumbai_ptax_user_category_determines_rate` tells the citizen which table is theirs; a citizen with a capital value can compute a number today.

The protocol's own mechanism for currency risk is the grade, not the cell state. Section 4 assigns C to "archived, undated, or visibly outdated official material" and requires the date and limitation to be stated — which both claims do in `notes`, and which the cell note does at length. Scoring this cell `mentioned` because the schedule is Grade C would make Grade C incapable of ever supporting `stated`, in direct contradiction of the section 8 sentence that names C as sufficient. The currency gap is real and is correctly carried as a limitation in three places (the claim notes, the source notes, and `meta.disclaimer`); it is not a cell-state defect.

Corroborating rather than undercutting this: `claim_mumbai_ptax_rate_documents_stop_at_2019_20` (Grade B) establishes, by current observation of the corporation's own document index, that nothing later exists on that route. The ledger is not resting on an old file while a newer one goes unread; it has checked and recorded that there is no newer one. No correction.

### F-06 — note — `owner` cell upheld as `stated`

I examined whether a list of ward e-mail addresses meets section 8's bar, and it does — on all three of the limbs the definition offers, not just one.

Section 8: "`stated` when the evidence lets a citizen identify the office, officer, or operational role that holds or decides the case, including **a specific office list**, **a designation tied to a jurisdiction rule**, or **a contact route for that role**. A statutory designation or general agency name alone is `mentioned`." `claim_mumbai_ptax_ward_assessor_email_table` (Grade B) records a table headed "E-mail IDs of Asstt. Assessor & Collector of wards" giving one address per ward. That is a specific office list; the Assistant Assessor & Collector is an operational role, not a statutory designation floating free of a route; the ward index is the jurisdiction rule that tells a citizen *which* of those addresses is theirs; and an e-mail address is a contact route for that role. The definition nowhere requires a telephone number, an officer's name, or a street address.

`claim_mumbai_ptax_first_in_first_out_rule` adds a second, independent identification of the same office, named as the place to go when a payment must land on a specific bill. And the cell note honestly records the countervailing evidence — `claim_mumbai_ptax_contact_page_headquarters_only`, showing that the portal's designated Contact Us route offers only a headquarters address and a feedback mailbox. That poverty is worth recording, but it does not erase a ward-indexed role list published on the portal's own public entry page. No correction.

### F-07 — note — `claim_mumbai_ptax_first_in_first_out_rule` is borderline compound

Section 1 requires that "one claim asserts one checkable thing", section 8 lint item 1 flags compound claims, and section 13 permits the auditor to split them. This claim carries two propositions — the first-in-first-out application rule, and the instruction to approach the ward Assessment & Collection department for a specific bill — and after the corrections above it supports four different cells (`eligibility`, `time`, `owner`, `after-submission`), which is a fair signal of compoundness.

I have not split it. Both halves come from one contiguous notice on one route, both are checkable in a single reading of that notice, the second half is the remedy attached to the first rather than an unrelated assertion, and no cell state depends on the split: `owner` is independently carried by the ward e-mail table, and `time` and `after-submission` are `mentioned` either way. A future pass may split it for tidiness; it is not an evidence defect and I have not manufactured a correction for it.

### F-08 — note — `claim_mumbai_ptax_residential_rate_table` is a list claim

Ten rate components in one claim reads against lint item 1. Accepted as atomic: it transcribes a single row of a single table for a single user category from a single source, and every element is checkable in one place in one look. Splitting it into ten claims would destroy the actionable fee schedule that makes the `cost` cell legible and would serve no verification purpose. Same reasoning applied, more weakly, to `claim_mumbai_ptax_public_instant_payment_route`, which inventories the field labels of one screen.

### F-09 — note — wording of `claim_mumbai_ptax_public_instant_payment_route`

The claim text says the route "displays the property account number, billing name, property address" and the amount fields, while no property account number was entered. Read alone, that could be taken as asserting that real data was seen. It is not an overclaim in substance, because the claim's own `notes` bound it exactly ("The route's own field labels were observed. No property account number was entered, so nothing is claimed about what it returns for a real property"), `basis` is correctly `observation` of those labels, and the `cost` cell note independently records that the payable amount is returned only after a number is entered, which this run did not do. No cell rests on returned values. I recommend, without proposing a correction, that a future revision say "publishes fields for" rather than "displays"; the record is self-limiting as it stands.

### F-10 — note — two cell notes lean on material that is not in the ledger

The `documents` note cites "the corporation's circular for change of name in the property-tax record" and the `time` note cites a "real-time or three days" timeline and BMC's Citizen Charter route. None of these has a source or claim record in the ledger, so within the audit input boundary they cannot be checked. They are used only to *exclude* evidence from an out-of-scope route (mutation, which the scenario summary excludes explicitly), so they create no unsupported positive value and I have preserved the exclusions. I record the general point: a cell note should rest on recorded sources even when it is explaining what it declined to count. The Citizen Charter URL is at least recorded in `searchedRoutes`, which section 9 permits.

### F-11 — note — boundary and `Unknown` handling is correct throughout

`claim_mumbai_ptax_login_behind_captcha` is `basis: mixed`, `status: partial`, Grade B, and its notes name the boundary precisely as section 5 requires ("The observation is the login form; the inference is that the account view lies past it. No CAPTCHA was attempted"). It is a boundary statement and appears in no cell's `claimIds`. `claim_mumbai_ptax_payment_receipt_surface_unknown` and `claim_mumbai_ptax_due_date_unknown` are Grade `Unknown` with no sources — permitted by the schema's conditional and by section 4's `Unknown` row — and neither supports a cell. No overclaim crosses the login or CAPTCHA boundary anywhere in the ledger, and lint item 6 is clean. The safety boundary in section 16 was respected: no login, no CAPTCHA, no payment, no personal data.

### F-12 — note — mechanical checks clean

Schema: valid against `benchmark/schemas/ledger.json`; all IDs match the `^[a-z][a-z0-9]*_[a-z0-9_]+$` pattern; all required properties present; no additional properties. Reference integrity: every `claimId` in the sidecar exists in the ledger, every `sourceId` in every claim exists, no source is orphaned, no dangling references, and no `contradictsClaimIds` links exist to verify or remove. Dates: ISO throughout, `asOf`, all five `accessedAt` values and the audit date all 2026-09-06, `publishedAt` 2015-04-01 on the rate schedule. Jurisdiction: `Mumbai, Maharashtra, India` on `meta` and on every claim, and recorded in every source's notes with the agency naming shown on the access date, as section 1 requires. Scenario tags: every claim carries the manifest's `primaryScenarioId` and no alias exists; the sidecar's `serviceId` and `primaryScenarioId` match the manifest. Evidence grades against the section 4 table: B for direct current observation of a public official interface on all seven portal-observation claims, correctly not E, per section 1; C for the two claims resting on the 2015 rate schedule as potentially outdated official material, with the date and limitation stated; B for the document-index claim, because the claim is about the index's current content even though the files it lists are old; `Unknown` where no usable source exists. Lint items 2, 3, 4, 5, 6 and 7 are clean — five distinct source URLs, no secondary sources, no C on a current observed form, every undated source carrying a visible-date note, no authentication overclaim, no undeclared scenario. Section 11: every source records a snapshot or a documented capture failure with a limitation, and no substitute homepage was used. Section 3: no explicit zero appears anywhere in the reviewed evidence, so no cell is lifted or lowered by it.

---

## Verdict

No blocking findings. Four correction-severity findings (F-01 to F-04), carried by ten correction objects in `property-tax-payment.corrections.json`: three cell states with their `claimIds` and notes, and one source's notes. The evidence base itself stands; no record was found unsupported and no claim was downgraded.

Accepted cell states: `cost` **stated**, `documents` **mentioned**, `eligibility` **stated**, `time` **mentioned**, `owner` **stated**, `after-submission` **mentioned**. **Stated count: 3 of 6.**

The corrections change three cells from `absent` to `mentioned` and leave the stated count unchanged. What they change is the claim the scorecard makes about the government: not that Mumbai's payment route is silent on documents, timing and what follows a payment, but that it gestures at each — a bill where your number is printed, an order in which your money is applied, a rule for where it lands and whom to ask if it lands wrong — and gives an actionable value for none of them.


## Re-audit — 2026-09-06 (IND-91 part B)

A fresh isolated auditor re-audited this row after pre-audit lint remediation, on the section 12 inputs only. 3 corrections were proposed and 3 applied; none unapplied.

# Re-audit: Mumbai / property-tax-payment (grid-only)

Inputs: ledger `ledger/jurisdictions/mumbai/property-tax-payment.json`, expectations sidecar
`ledger/jurisdictions/mumbai/expectations/property-tax-payment.json`, the mumbai/property-tax-payment
manifest entry, `benchmark/schemas/ledger.json`, `benchmark/PROTOCOL.md`, `benchmark/schemas/corrections.json`.
Grid-only row: no nodes, edges, roadblocks or journeys, so sections 6 and 10 are not in scope.
No URL was opened; every judgement below is from the recorded text.

## Cell-by-cell verdicts

### F1 — `cost` = `stated` is correct (PROTOCOL §8, cost definition; §4 grade table)
The eleven listed claims are all `verified` and Grade C, and Grade C is admissible support for
`stated` ("a Grade A, B, or C claim gives a value a citizen can act on"). Ten rate lines expressed as
percentages of capital value for the residential user category, plus the rule that the residential
table is the applicable one, constitute an actionable fee schedule, which the cost definition
accepts alongside a bare amount. The 2015 effective date and the absent current-year rate are a
currency limitation; §4 puts exactly that material at Grade C rather than removing it from support,
and the cell note states the limitation as §8's cost row requires of partial coverage. No change.

### F2 — `cost` claim list is complete for the state it records (PROTOCOL §8 limitation rule; §9)
`claim_mumbai_ptax_rate_documents_stop_at_2019_20`, `_2` and `_3` are recited in the cost note but are
not listed, and that is right: they record what the corporation does *not* publish, and §8 says a
limitation is not a positive cell value. `claim_mumbai_ptax_public_instant_payment_route_4` (the
route's amount labels) and `_5` (an online payment action) are payment-step-without-an-amount
evidence, i.e. `mentioned`-grade topic material that §9 makes optional and only for
`mentioned`/`absent` cells. No change.

### F3 — `documents` = `mentioned` is correct (PROTOCOL §8, documents definition; §3)
`claim_mumbai_ptax_account_number_from_bill_2` names one concrete document — the property tax bill —
as where the Property Account No. is printed, with no requirement to submit, provide, upload, produce
or attach it. That is the definition's "reference to documents without telling the citizen what is
required". The note correctly rules out §3 (no reviewed route states an explicit zero), so `stated`
is not reachable that way either. No change.

### F4 — two cell notes assert published material that no source or claim in this ledger records (PROTOCOL §7; §9)
The `documents` note asserts that "Document requirements do appear on the corporation's circular for
change of name in the property-tax record", and the `time` note asserts that the portal publishes a
"real-time or three days" timeline for change of name. Both are statements about what the corporation
publishes, both are used to justify an exclusion, and neither is backed by any source record or claim
in the ledger — no change-of-name circular is among the five sources. Under §7 every assertion about
published official material needs a citation that resolves to a specific page. Because the exclusion
does not change either cell's state, no correction is emitted; the researcher should either record
the circular as a source with a scoped-out claim or drop the assertion from the note.

### F5 — `eligibility` = `stated` is correct, but the claim list is wrong in both directions (PROTOCOL §8, eligibility definition; audit check 2)
The state is sound: `claim_mumbai_ptax_account_number_from_bill` (+`_2`, `_3`) gives the identifier
route a citizen must use, and `claim_mumbai_ptax_user_category_determines_rate` is a rule that decides
which rate route applies to this residential property. The list, however, carries
`claim_mumbai_ptax_first_in_first_out_rule` and `_2`, which assert only that an online payment is
applied first-in first-out and that the oldest bill is adjusted first. Those are processing-sequence
facts — the row's own `time` note classifies them exactly that way ("a rule about the order in which
payments are processed") — and neither decides who qualifies or which route applies. Meanwhile the
note's third sentence ("paying against a specific bill requires the ward Assessment and Collection
department instead") is asserted by `claim_mumbai_ptax_first_in_first_out_rule_3`, which is a
self-contained route rule and is absent from the list. Correction 1 removes the two sequence claims
and adds `_3`. The state remains `stated` on the identifier and user-category rules regardless.

### F6 — `time` = `mentioned` is correct (PROTOCOL §8, time definition)
First-in first-out ordering is a reference to sequence with no figure and no usable time rule, which
the definition places at `mentioned`. `claim_mumbai_ptax_due_date_unknown` and `_2` are Grade
`Unknown` and correctly kept out of the list: §8 says an `Unknown` claim records a limitation, never
a positive cell value, and the note says so in terms. Searched routes are recorded as §9 requires for
a `mentioned` cell. No change.

### F7 — `owner` = `stated` is correct (PROTOCOL §8, owner definition)
`claim_mumbai_ptax_ward_assessor_email_table` is a specific office list with a contact route for the
role that assesses and collects, indexed by ward — the definition's central case, well past "a
statutory designation or general agency name alone". `claim_mumbai_ptax_first_in_first_out_rule_3`
names the ward Assessment & Collection department as the office to approach, supporting the same
state. `claim_mumbai_ptax_contact_page_headquarters_only` and `_2` are recited in the note but are
counter-evidence (what the Contact Us route omits) rather than support, so their absence from the
list is correct under the same §8 limitation rule applied in F2. No change.

### F8 — `after-submission` = `mentioned` is correct, one supporting claim is missing (PROTOCOL §8, after-submission definition; audit check 2)
The state is right: the FIFO claims name an outcome of the money after payment while no receipt,
acknowledgement, transaction reference, status route or downloadable result is identified, which is
precisely "an outcome named without a visible or actionable post-submission surface". The three
`claim_mumbai_ptax_payment_receipt_surface_unknown*` claims are Grade `Unknown` and correctly
excluded, as is the boundary claim about the login. But the note's own reasoning rests on
`claim_mumbai_ptax_first_in_first_out_rule_3` ("it names the ward Assessment and Collection
department as the route for a citizen who wanted it applied to a specific bill instead; both are
outcomes and recourse after payment") and that claim is not in the list. Correction 2 adds it. State
unchanged.

## Claim, grade and basis findings

### F9 — `claim_mumbai_ptax_login_behind_captcha` records `basis: "mixed"` but now asserts only an observation (PROTOCOL §5)
Its text — "the citizen login requires a property account number and a CAPTCHA" — is what the login
form directly shows, and its own notes say "The observation is the login form" and that the claim was
split "into the observation and the inference drawn from it", with the inference now living in
`claim_mumbai_ptax_login_behind_captcha_2`. §5 reserves `mixed` for a claim that carries both and
requires the boundary to be explained in notes; after the split there is no inference left in this
record, so `basis` should be `observation`. Correction 3. Its `status: "partial"` is left alone: the
claim supports no cell, so nothing turns on it, and an auditor should not upgrade a status.
`claim_mumbai_ptax_login_behind_captcha_2` keeps `mixed` legitimately — an absence across reviewed
pages plus the inference from the form — and its notes explain that boundary.

### F10 — `claim_mumbai_ptax_public_instant_payment_route_2` is an unwaived list claim of the shape the manifest waives twice (PROTOCOL §8 lint check 1 and the waiver rule)
The claim asserts that the Instant Payment route "displays the property account number, the billing
name and the property address" — three comma-listed field labels read from one route in one
observation. `_3` (breakdown heads) and `_4` (amount labels) are the identical shape and each carries
a `compound-claim` waiver on the manifest entry with the reasoning that a comma list of one route's
own field labels is a single published list. `_2` has no waiver, and §8 says an unwaived lint finding
blocks audit. The consistent remedy is to extend the manifest waiver to `_2` on the same reasoning,
not to split three field labels into three claims. No ledger correction is emitted because the waiver
lives in the manifest entry rather than in a ledger or expectations record.

### F11 — two further two-part claims, accepted as atomic (PROTOCOL §8 lint check 1)
`claim_mumbai_ptax_contact_page_headquarters_only` ("only the corporation's headquarters address …
and a portal feedback e-mail address") and `claim_mumbai_ptax_login_behind_captcha` ("a property
account number and a CAPTCHA") each pair two items. Each pair is one page's contact block and one
login gate respectively, checkable in one look, so both pass the "one claim asserts one checkable
thing" test. Recorded so that a reviewer acting on F10 treats these consistently and does not split
them.

### F12 — one source record covers two distinct routes, and a claim rests on the route that is not the record's `url` (PROTOCOL §7; §11)
`source_mumbai_ptax_contact_and_faq` carries `url` `…/index.html#/contactus` but its notes state that
it also covers `…/index.html#/faq`, and `claim_mumbai_ptax_faq_route_empty` — the claim that the FAQ
route rendered a heading and no content, a finding this row leans on in its `meta.disclaimer` and in
the `documents` and `time` notes — rests on the FAQ route, not on the recorded URL. §7 requires
citations to resolve to specific pages. The remedy is to split this into two source records, each
with its own URL, access date, agency naming, archive outcome and limitation, and to repoint
`claim_mumbai_ptax_faq_route_empty` at the FAQ record. No correction is emitted: creating the second
source record means authoring archive and limitation text, which is researcher work rather than an
auditor's field-level correction. The row should not be signed off until it is done.

### F13 — evidence grades and the archive rule are otherwise sound (PROTOCOL §1, §4, §7, §11)
Direct current observations of the public portal routes are Grade B, as §1 directs for the
public-workflow pass and §4 confirms; the 2015 rate schedule is Grade C with the outdated-material
limitation stated on both the source and every claim resting on it, matching §4's C rows.
`source_mumbai_ptax_portal_home` is the specific page carrying the observed login field, ward e-mail
table, KYC text and calculator description, not a general-site homepage reference, so B is right
there too. Every non-`Unknown` claim carries at least one source and the six `Unknown` claims carry
none, satisfying the §7 gate and the schema's conditional. All five sources record either a Wayback
snapshot or a documented capture failure plus a limitation, as §11 requires, with no substitute
homepage anywhere. Access dates are ISO and the jurisdiction string is specific on every source and
claim. Every claim is tagged to the single manifest-declared primary scenario.

### F14 — the boundary discipline of §8 holds across the grid (PROTOCOL §8, final sentence)
No cell list contains an `Unknown` claim or a boundary statement. The two `partial` boundary claims
about the login and the account view, and the six `Unknown` claims about receipts, status routes, the
due date and rebates or penalties, appear in no cell and are described as limitations in the
`cost`, `time` and `after-submission` notes. This is the rule most often broken and it is kept here.

## Summary

Fourteen findings. Three corrections, all confined to record fields whose current values are exact.
No cell state changes: `cost`, `eligibility` and `owner` remain `stated`; `documents`, `time` and
`after-submission` remain `mentioned`. Two findings (F10, F12) are blocking in the sense of §8 and §7
but their remedies fall outside the field-level corrections contract, so they are recorded here for
the researcher and belong in the unresolved-limitations line of the finish comment.
