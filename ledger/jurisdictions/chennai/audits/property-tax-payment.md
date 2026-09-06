# Audit — Chennai property-tax payment

- **Service:** property-tax-payment
- **Jurisdiction:** Chennai, Tamil Nadu, India
- **Primary scenario:** `scenario_property_tax_payment_known_sas_pid`
- **Audit date:** 2026-09-06
- **Benchmark version:** 0.1
- **Mode:** grid-only (no nodes, edges, roadblocks, journeys or portal sidecar; their absence is not raised as a finding)

Inputs were the integrated ledger, the expectations sidecar, `benchmark/schemas/ledger.json`, `benchmark/PROTOCOL.md`, the corrections contract and the manifest entry. No researcher notes or handoffs were received, and none were sought.

---

## Findings

### F1 — `cost` scored `stated` on an explicit zero that is not the amount a citizen pays

- **Severity:** correction
- **Record:** `expectation:property-tax-payment` → `/cells/cost/state`, `/cells/cost/note` (supporting claim `claim_chennai_ptax_online_nil_transaction_fee`)
- **Protocol requires:** Section 8 — `cost` is `stated` "when the evidence gives an amount a citizen pays or an actionable fee schedule", and names the deficient case: "a payment step without an amount ... is `mentioned`". Section 3 — an explicit zero "must be recorded as `stated` when the *applicable* evidence states it", and the grid has no not-applicable state.
- **Observed:** The cell rests on a single claim, that the rules-and-procedure page states a "Nil" transaction fee for the online channel. The ledger separately records `claim_chennai_ptax_amount_payable_unknown`: the tax itself cannot be derived from any public page, because the percentage of annual value and the location-wise basic rate the corporation's own method depends on are both missing from the page that cites them, and the calculator that would supply them points at an unreachable staging host.
- **Ruling:** The cell is downgraded to `mentioned`. What a citizen pays through this route is the tax plus the channel charge. The evidence quantifies only the second component, at zero; the first is not merely unpublished but underivable by the corporation's own published method. A zero on one component of a two-part sum whose other component is unknown does not "give an amount a citizen pays", and the corporation's payment route is precisely the section 8 failure case — a payment step without an amount.
  Section 3 is not defeated by this ruling and is doing its proper work: the explicit zero is real evidence, it keeps the cell off `absent`, and `claim_chennai_ptax_online_nil_transaction_fee` is retained in the cell's `claimIds` as a topic-only claim under section 9. Section 3 fixes how a zero is read; it does not make a zero on a peripheral charge stand in for the service's own charge. The cell already records three searched routes and so satisfies section 9's requirement for a `mentioned` cell.
  The unknown claim is correctly kept out of the cell: under section 8 an `Unknown` claim records a limitation, not a positive cell value.

### F2 — `after-submission` scored `stated` on a route that was read, not exercised

- **Severity:** note (no correction; the cell stands)
- **Records:** `expectation:property-tax-payment` → `/cells/after-submission`; `claim_chennai_ptax_public_receipt_route` (`mixed` / `partial`), `claim_chennai_ptax_payment_status_route` (`observation` / `verified`)
- **Protocol requires:** Section 8 — `after-submission` is `stated` "only when the evidence identifies something the citizen sees after submitting, such as a status page, tracker, acknowledgement, receipt, rejection reason, or downloadable result"; a step at or before submission, including payment itself, does not count; and only `verified` or `partial` claims may support a positive cell value. Section 16 — do not pay or query real case data.
- **Observed:** The corporation publishes a Property Tax Online Payment Receipt route reachable without login, observed with its title and its four input fields (zone, division, bill, sub number) on the access date, alongside a Property Tax Status route and a Property Tax Payment Status route observed as published links and entry forms. No identifier was entered, no payment was begun, and no case data was retrieved.
- **Ruling:** `stated` stands. The section 8 test is one of identification, not of exercise: the evidence must identify a post-submission surface, and a published receipt route named as such, with the case-identifier fields it takes, is identified. Requiring the route to be exercised would make the cell unreachable by any compliant run, since exercising it demands a real bill number and a completed payment — both forbidden by section 16. The protocol cannot require what its own safety boundary prohibits.
  The `mixed`/`partial` grading is not a defect but the correct application of section 5: the notes state the boundary exactly (route, title and fields observed; what it returns for a real property inferred), and section 8 admits `partial` claims as supporters. The receipt is also unambiguously after the submission — payment is the submission here, and a receipt of payment follows it.
  Recorded as a note because the cell is the weakest `stated` in the grid: it rests on a published surface whose behaviour was never seen. The cell note already discloses this in terms.

### F3 — `documents` scored `mentioned`: both directions tested

- **Severity:** note (no correction; the cell stands)
- **Records:** `expectation:property-tax-payment` → `/cells/documents`; `claim_chennai_ptax_payment_modes`, `claim_chennai_ptax_assessment_documents_are_other_route`
- **Protocol requires:** Section 8 — `documents` is `stated` when the evidence "gives an actionable document list or names a concrete document with a requirement to submit, provide, upload, produce, or attach it"; a reference to documents without telling the citizen what is required is `mentioned`; `absent` means the reviewed evidence does not touch the topic.
- **Tested toward `stated`, rejected:** The cheque or demand draft drawn in favour of "The Revenue Officer, Corporation of Chennai" is a concretely specified instrument carrying an instruction to tender it. It does not satisfy the limb. In this grid's own vocabulary a payment and a document presentation are distinct categories of step — section 8's `after-submission` definition enumerates "registration, document presentation, payment" as separate items — so a payment instrument is the payment, not documentation the citizen must furnish alongside it. The contrary reading would score `documents` as `stated` for every service that accepts a cheque, which would empty the cell of meaning and duplicate the `cost` cell.
- **Tested toward `absent`, rejected:** The evidence does touch the topic. The same rules-and-procedure page that carries the payment guidance publishes a real document list — registered documents in the applicant's favour, a filled Form-6, and the last tax paid receipt — which a citizen reading for payment will meet, but which is given for applying for assessment of property tax, a route this scenario excludes. Documents are referred to without the citizen being told what is required for paying an existing assessment: the textbook `mentioned`.
- **Secondary point resolved:** `claim_chennai_ptax_assessment_documents_are_other_route` is a boundary statement, and section 8 says a boundary statement "records a limitation, not a positive cell value", which sits in tension with its appearance in the cell's `claimIds`. Resolved in favour of leaving the record alone: section 9 expressly permits "optional topic-only `claimIds`" for a `mentioned` or `absent` cell, which is the more specific provision, and the cell note's phrase "it is not counted here" means not counted toward `stated`. The cell's `mentioned` state is in any case carried independently by `claim_chennai_ptax_payment_modes`. No correction is proposed for this; a correction here would be churn.

### F4 — `claim_chennai_ptax_payment_modes` is a compound claim

- **Severity:** correction
- **Record:** `claim_chennai_ptax_payment_modes` → `/text`, `/notes`; consequential `expectation:property-tax-payment` → `/cells/documents/claimIds`
- **Protocol requires:** Section 1 — "one claim asserts one checkable thing". Section 8 lint item 1 — compound or list claims are a lint finding, and an unwaived finding blocks audit. Section 13 — the auditor may split compound claims.
- **Observed:** The claim asserts two distinct rules drawn from different instructions on the page: (a) that the assessee should pay by cheque or demand draft drawn in favour of "The Revenue Officer, Corporation of Chennai", and (b) that the modes are tax collectors, eleven named banks under a walk-in system, e-seva centres run by Tamil Nadu Arasu Cable Television Corporation across four office types, and online. Limb (a) is already recorded atomically elsewhere, as `claim_chennai_ptax_revenue_officer_is_payee` — the duplication is what makes the compounding visible. An enumeration of the channels the page itself lists is one checkable thing and is not split further.
- **Ruling:** The claim text is narrowed to the modes list, and its notes are updated, rather than a new record being created; identity is preserved as section 1 requires, and no evidence is added or removed. Because the `documents` cell drew its cheque/demand-draft topic anchor from the stripped limb, `claim_chennai_ptax_revenue_officer_is_payee` is added to `/cells/documents/claimIds` so the cell keeps the same anchor from the atomic record. No cell state changes: the `eligibility` cell relies only on the modes limb, which survives intact, and the `owner` cell is untouched.

### F5 — Grade B on substantive rules taken from a page that declares itself pending update

- **Severity:** correction
- **Records:** `claim_chennai_ptax_half_yearly_basis`, `claim_chennai_ptax_annual_value_factor`, `claim_chennai_ptax_library_cess` → `/evidenceGrade` (source `source_chennai_ptax_assessment_method`)
- **Protocol requires:** Section 4 — Grade B is "a current official procedure, form, service portal, circular, or agency page, including direct current observation of a public official interface"; Grade C is "official but indirect, **incomplete**, archived, or **potentially outdated** material" and "archived, undated, or visibly outdated official material; state the date and limitation". Grades describe source strength, not convenience.
- **Observed:** The assessment-method page carries three C-triggers at once, all recorded in the ledger's own source note: it shows no visible last-updated or version date; its newest cited authority is from 2001 and its citations run back to 1972; and it is incomplete on its face, referring the citizen to a percentage table "given above" and to an annexure of location-wise basic rates, neither of which is present, before ending with the literal placeholder "TO BE UPDATED". The three claims above assert present-tense substantive rules from that page — that the tax is half-yearly on annual rental value under section 100 of the 1919 Act, that the annual value is the monthly rental value multiplied by 10.92, and that a 10 per cent library cess applies to the general tax component.
- **Ruling:** Downgraded B to C. A page that announces its own pending update, dates nothing, and omits the very figures its method depends on is "potentially outdated" and "incomplete" material within the meaning of section 4, whatever the strength of the publisher. Section 4's requirement to "state the date and limitation" is already met: the source record states the 1972–2001 citation range, the absent date, and the placeholder, and `meta.disclaimer` carries the missing table and annexure as a limitation, so no further edit is proposed.
  No cell state moves as a result. Section 8 admits a Grade A, B **or C** claim as the basis for `stated`, so `eligibility` and `time` are unaffected.

### F6 — `claim_chennai_ptax_rate_table_and_annexure_missing` retained at Grade B

- **Severity:** note
- **Record:** `claim_chennai_ptax_rate_table_and_annexure_missing`
- **Protocol requires:** Section 4 — Grade B includes "direct current observation of a public official interface".
- **Observed and ruled:** This claim rests on the same undated, self-declaredly pending page as F5, but its content is the current state of that page — that the cited table and annexure are not on it and that it ends with "TO BE UPDATED". The currency of that observation is fixed by the auditor-side access date, not by the page's own vintage, so the F5 reasoning does not reach it. B stands. The same reasoning keeps `claim_chennai_ptax_calculator_points_to_staging_host` and `claim_chennai_ptax_know_your_status_404` at B: each asserts the behaviour of a link on the section index as observed on the access date.

### F7 — `source_chennai_ptax_rules_procedure` retained at Grade B: the line drawn

- **Severity:** note
- **Records:** `source_chennai_ptax_rules_procedure` and the claims resting on it (`claim_chennai_ptax_online_nil_transaction_fee`, `claim_chennai_ptax_payment_modes`, `claim_chennai_ptax_revenue_officer_is_payee`, `claim_chennai_ptax_assessment_documents_are_other_route`)
- **Protocol requires:** Sections 4 and 8 lint item 5 — undated sources are handled by recording a visible-date note or stated limitation, not by automatic downgrade; lint item 4 warns against assigning C to observed current official material.
- **Observed and ruled:** This page also ends with "TO BE UPDATED" and also shows no visible date, so the question of parity with F5 arises squarely. B is retained. The downgrade in F5 rests not on the placeholder alone but on concrete, stateable evidence of outdatedness and incompleteness — a citation range stopping at 2001 and two missing figures the page's own method requires. The rules-and-procedure page offers nothing comparable: it is the corporation's operative payment guidance as published today, and nothing in its content is shown to be superseded. Downgrading on the placeholder alone would push almost every undated government page to C and would collide with lint item 5, which resolves undatedness by disclosure. That disclosure is present in the source note. Recorded as a note so the line is visible and reviewable rather than silent.

### F8 — Scenario identifier carries a vocabulary artefact from another jurisdiction

- **Severity:** note (no correction)
- **Record:** `scenario_property_tax_payment_known_sas_pid`
- **Protocol requires:** Section 1 — "reuse a record ID once published; change content, not identity". Section 2 — every ledger has exactly one manifest-declared `primaryScenarioId`; do not introduce scenario aliases.
- **Observed:** The identifier's `sas_pid` element denotes a self-assessment property identification number, which is not how Chennai identifies a property: the corporation's routes take a zone number, division code, bill number and sub number, and the scenario's own label and summary correctly say "known bill number" and "known identifier". The identifier is nonetheless the one the manifest declares, and every claim tags it correctly.
- **Ruling:** No correction. Changing it would break agreement with the manifest and violate the identity rule; the label and summary already carry the accurate Chennai vocabulary. Flagged so it is not mistaken for evidence that a PID-style identifier exists in Chennai.

### F9 — Archive snapshots were not captured at access time

- **Severity:** note (no correction possible)
- **Records:** all five sources
- **Protocol requires:** Section 11 — "at access time, capture an archive snapshot for every public source used"; if capture fails, record the access date, the failure and a limitation; archive failure never permits a substitute homepage or an unsupported claim. Section 14 — public sources need a snapshot or a documented archival failure.
- **Observed:** No new capture was pushed from this run for any source. Three sources point to pre-existing Wayback snapshots substantially older than the 2026-09-06 access date: the section index (2024-07-04), the rules-and-procedure page (2022-07-17, noted in the record as more than four years earlier) and the online payment route (2022-09-26). Two sources — the assessment-method page and the receipt route — have no snapshot at all, and each records the availability-API failure, retains the original official URL, and states the limitation.
- **Ruling:** The section 14 done-criterion is met, since every source carries either a snapshot or a documented failure, and no homepage substitution occurred. The section 11 capture-at-access-time requirement was not met, and the auditor cannot cure it without creating evidence. Carried forward as an unresolved limitation: the two "TO BE UPDATED" pages that carry the most consequential findings are exactly the two with no snapshot, so those findings are not independently re-checkable after the pages change.

### F10 — Status routes reported reachable while a status link on the same index returns 404

- **Severity:** note (no correction)
- **Records:** `claim_chennai_ptax_payment_status_route`, `claim_chennai_ptax_know_your_status_404`, `contradictsClaimIds` on both (empty)
- **Protocol requires:** Section 1 (integrator) — retain conflicting claims, cross-link them, mark them `contested` until audited. Section 5 — `observation` records what an interface directly shows.
- **Observed:** One claim asserts that a Property Tax Status route and a Property Tax Payment Status route are published alongside the payment route and reachable without login; another records that the "Know your Status" link on the same section index returned HTTP 404 on the access date. The three surfaces carry different published titles, and the first claim's note states the routes were observed as published links **and entry forms**, meaning at least one status surface rendered. On that record the two claims describe different links and do not conflict, so the empty `contradictsClaimIds` and the `verified` status are correct and no `contested` marking is warranted.
- **Ruling:** No correction. Noted because the section index is demonstrably carrying at least one broken status link and one dead calculator link, so the `after-submission` cell's supporting surfaces should be re-checked on any later run.

### F11 — Checks passing without finding

- **Severity:** note
- **Citation gate (section 7):** green. Every non-`Unknown` claim carries at least one source; the two `Unknown` claims carry none, which the ledger schema permits and section 7 requires. All five sources give a direct specific link, the exact ISO access date (2026-09-06), the jurisdiction string and the agency naming as displayed. No homepage or general-site reference is used as a specific citation: `source_chennai_ptax_section_index` is a property-tax section index and is cited only for the behaviour and presence of links on that page, which is the correct specific source for those assertions.
- **Dates, jurisdiction, scenario tags:** all dates are ISO `YYYY-MM-DD`; `meta.asOf` matches every access date; every claim's jurisdiction is "Chennai, Tamil Nadu, India", matching `meta.jurisdiction`; every claim tags the primary scenario and no other; no aliases; `nodeIds` are empty throughout, consistent with grid-only mode.
- **Reference integrity:** every `sourceIds` entry resolves; all five sources are used and none is orphaned; every `claimIds` entry in all six sidecar cells resolves to an existing claim; the sidecar's `serviceId` and `primaryScenarioId` match the manifest entry; the ledger is valid against `benchmark/schemas/ledger.json`, including the id pattern, the source `type` enum and the requirement that a non-`Unknown` grade carry at least one source.
- **Basis rule (section 5):** the one `mixed` claim explains its boundary in `notes` as required; the two `inference` claims are both `Unknown` and both state a conclusion rather than an observation; no claim marked `observation` was found to be asserting an inference.
- **Login and case-data boundary (lint item 6):** no overclaim. Every route is public; the receipt claim marks the case-data boundary as inference rather than asserting what it returns; no personal data appears, and the published Revenue Officer telephone numbers are institutional contact details.
- **Duplicate sources (lint item 2), Grade B on secondary sources (lint item 3), Grade C on observed current official forms (lint item 4):** none found. All five source URLs are distinct; no secondary sources are present.
- **Unknown-claim discipline (section 8):** both `Unknown` claims — the due date and the amount payable — are correctly excluded from every expectation cell and recorded as limitations, and both are preserved rather than resolved. `claim_chennai_ptax_amount_payable_unknown` is the record on which finding F1 turns.

---

## Verdict

Cell states accepted: **`cost` mentioned** (downgraded from `stated`, F1), **`documents` mentioned** (accepted, F3), **`eligibility` stated** (accepted), **`time` mentioned** (accepted), **`owner` stated** (accepted), **`after-submission` stated** (accepted, F2). **Stated count: 3 of 6.**

Corrections proposed: 8 — one cell state, one cell note, one cell `claimIds`, one claim text with its notes, and three evidence-grade downgrades. Unresolved limitation carried forward: no archive snapshot was captured at access time for any source, and the two pages ending in "TO BE UPDATED" have none at all (F9).


## Re-audit — 2026-09-06 (IND-91 part B)

A fresh isolated auditor re-audited this row after pre-audit lint remediation, on the section 12 inputs only. 4 corrections were proposed and 4 applied; none unapplied.

# Audit — Chennai, property-tax-payment

Row: `chennai` / `property-tax-payment`, mode `grid-only`, primary scenario
`scenario_property_tax_payment_known_sas_pid` (manifest, ledger and sidecar agree).
Inputs: the ledger, the expectations sidecar, the manifest entry for this row,
`benchmark/schemas/ledger.json`, `benchmark/PROTOCOL.md`, `benchmark/schemas/corrections.json`.
No other file was read and no URL was opened; every judgement below is made from the
ledger and sidecar text as written.

**Correction policy used here.** Corrections are proposed only as field-level changes to
existing records, where `old` can be quoted exactly and the generic application step can
match `recordType` + `recordId` + field path + old value. Structural changes — splitting a
compound claim, merging a duplicate, deleting a record — are recorded as findings for a
remediation pass rather than encoded as corrections, because they would make the atomic
correction set depend on record IDs that do not yet exist and risk rejecting the whole set.

---

## F1 — `cost` is recorded as `mentioned` but the evidence states an explicit zero

Records: `expectations` cell `cost`; `claim_chennai_ptax_online_nil_transaction_fee`.
Rules: PROTOCOL section 3, section 8 (`cost` definition), section 8 expectation-cell definitions.

The cell's only claim is Grade B, `verified`, `observation`, and reads: the rules and
procedure page "states that payment can be made online at www.chennaicorporation.gov.in
with 'Nil' transaction fee by using a credit card, debit card or net banking." That is a
quantified charge for using this service's online channel, published by the agency, with
the value zero.

Section 3 is not permissive on this point: "An explicit zero requirement is a stated value,
not an absence and not a not-applicable state. For example, `free`, `no upload required`,
`no fee` ... must be recorded as `stated` when the applicable evidence states it."

The cell note misreads that rule. It says the Nil figure is "retained here under protocol
section 3 so that the cell is not scored absent." Section 3 does not say an explicit zero
rescues a cell from `absent`; it says an explicit zero **is** `stated`. The note's own
wording concedes the substance — "one real charge is quantified" — which is exactly the
section 8 test for `cost` (`stated` when the evidence gives an amount a citizen pays). The
three `mentioned` triggers in the section 8 `cost` definition do not fit: this is not a fee
"described only as prescribed", not "a payment step without an amount" (the online step has
an amount, and it is nil), and not a penalty payable by the agency.

The tax liability itself is genuinely underivable — the percentage table and the
location-wise annexure the corporation's own method depends on are absent from the page that
cites them, and the calculator that would supply them points at an unreachable staging host.
That gap is correctly carried as `claim_chennai_ptax_amount_payable_unknown` /
`_2` and, under the section 8 rule that an `Unknown` claim "records a limitation, not a
positive cell value", it cannot pull the cell down any more than it could push it up. The
cell's state is set by the strongest qualifying claim it holds, and that claim states an
amount.

Correction C1 proposed: `/cells/cost/state` `mentioned` → `stated`.

**Flagged, not proposed:** section 9 requires a `stated` cell to carry an actionable-value
note. The current `cost` note argues the case for `mentioned` and will read as drift once C1
is applied. It must be rewritten to state the actionable value (Nil transaction fee on the
online channel, by credit card, debit card or net banking) and to keep the tax-amount gap as
the cell's stated limitation. I have not encoded that as a correction because this audit's
correction set is confined to `/state` and `/claimIds` on expectation cells; the rewrite is
an unapplied correction in the section 14 sense and should ship as a stated limitation until
it is made. `searchedRoutes` on the cell may be retained; section 9 does not forbid it on a
`stated` cell.

## F2 — `documents` lists a claim that asserts nothing about documents

Records: `expectations` cell `documents`; `claim_chennai_ptax_payment_modes`.
Rules: PROTOCOL section 8 (`documents` definition), section 9 (topic-only `claimIds`).

`claim_chennai_ptax_payment_modes` now reads, in full: "The corporation's property tax rules
and procedure page lists the modes of paying property tax." After the IND-91 part B split,
every substantive mode moved to `_2` through `_6` and the cheque-or-demand-draft instruction
moved to `claim_chennai_ptax_revenue_officer_is_payee` (its own notes record both moves).
What is left asserts that a list of payment modes exists. It names no document, and it does
not name the documents topic at all, so it is not even a permissible topic-only claim for a
`mentioned` cell under section 9. The cell's actual documents content is carried by
`claim_chennai_ptax_assessment_documents_are_other_route` and `_2`, both of which remain in
the list.

Correction C2 proposed: remove `claim_chennai_ptax_payment_modes` from
`/cells/documents/claimIds`. The cell state is unaffected — see F12.

## F3 — `eligibility` lists a valuation-method claim that decides nothing

Records: `expectations` cell `eligibility`; `claim_chennai_ptax_half_yearly_basis_2`.
Rule: PROTOCOL section 8 (`eligibility` definition).

`claim_chennai_ptax_half_yearly_basis_2` states that annual rental value "is arrived at from
the reasonable letting value under section 100 of the Chennai City Municipal Corporation Act
1919." That is how the base of the tax is computed. It gives no rule that decides who
qualifies or which route applies, which is the whole of the section 8 `eligibility` test. It
is also not reflected in the eligibility note, which cites the bill-number requirement, the
payment modes and the half-yearly liability inside Chennai city limits, and says nothing
about section 100.

Correction C3 proposed: remove `claim_chennai_ptax_half_yearly_basis_2` from
`/cells/eligibility/claimIds`.

The cell's `stated` state survives independently and is correct: the bill-number requirement
(`claim_chennai_ptax_bill_number_required`, waived as compound in the manifest on coherent
reasoning — one published set of input fields read off the routes) plus the instruction to
confirm the bill number before paying (`_2`) is a usable rule about which route a citizen can
use, and the four published modes (`claim_chennai_ptax_payment_modes_2` … `_6`) decide which
route applies. `claim_chennai_ptax_half_yearly_basis` is retained: on its own it would be
applicability-only and therefore `mentioned`-level under section 8, but as supporting
applicability inside a cell already `stated` on other claims it is properly placed.

## F4 — `claim_chennai_ptax_public_receipt_route` is still marked `mixed` after its inference was split out

Record: `claim_chennai_ptax_public_receipt_route`.
Rule: PROTOCOL section 5 (basis rule).

The claim's text is now purely observational: "The corporation publishes a Property Tax
Online Payment Receipt route that is reachable without login." Its own notes confirm the
whole of it was seen — "The observation is the route, its title and its four input fields on
the access date" — and the inferential part, what the route returns for a real property,
moved to `claim_chennai_ptax_public_receipt_route_2`, whose notes carry the boundary
("The inference is what the route returns for a real property, since no identifier was
entered and no case data was retrieved"). Section 5 reserves `mixed` for a claim whose notes
"explain the boundary"; with the inference removed there is no boundary left inside this
claim. `mixed` is a residue of the split.

Correction C4 proposed: `claim_chennai_ptax_public_receipt_route` `/basis` `mixed` →
`observation`.

`/status` is deliberately left at `partial`. Section 13 lists downgrading, not upgrading,
among the auditor's powers, and `partial` claims may support a `stated` cell under section 8,
so nothing in the grid turns on it. Recorded here so a later pass can decide.

## F5 — the `after-submission` note attributes `mixed`/`partial` to the wrong claim

Record: `expectations` cell `after-submission` (note text).
Rules: PROTOCOL section 5, section 9.

The note explains "which is why the receipt claim is recorded as mixed and partial rather
than as a verified observation of what it returns." That rationale now belongs only to
`claim_chennai_ptax_public_receipt_route_2`; applied to
`claim_chennai_ptax_public_receipt_route` it is the mislabel described in F4. Note-level
only, no correction proposed.

The cell state itself is correct. A published receipt route plus published status routes are
surfaces the citizen sees after paying, which is the section 8 `after-submission` test, and
none of the three cited claims is a step at or before submission. Both receipt claims are
`partial`, which section 8 expressly permits in support of `stated`.

## F6 — inconsistent grades across two sources with the same recorded defects

Records: `source_chennai_ptax_rules_procedure`, `source_chennai_ptax_assessment_method`, and
the claims drawn from each.
Rule: PROTOCOL section 4 (evidence-grade table), section 8 lint checks 3 and 4.

Both source notes record the same two defects: no visible last-updated or version date, and
a page ending in the literal text "TO BE UPDATED". The rules-procedure note goes further and
says the page "declares itself unfinished, so what it states may not be current or complete."
Yet the substantive-rule claims drawn from the assessment-method page are Grade C
(`claim_chennai_ptax_half_yearly_basis`, `_2`, `claim_chennai_ptax_annual_value_factor`,
`claim_chennai_ptax_library_cess`, `_2`) while the substantive-rule claims drawn from the
rules-procedure page are Grade B (`claim_chennai_ptax_online_nil_transaction_fee`,
`claim_chennai_ptax_payment_modes_2` … `_6`, `claim_chennai_ptax_revenue_officer_is_payee`,
`claim_chennai_ptax_assessment_documents_are_other_route_2`).

The ledger does draw a defensible internal line at the assessment-method page — B for what
the page's own surface shows (a reference exists, the table is absent, the page ends with
"TO BE UPDATED": `claim_chennai_ptax_rate_table_and_annexure_missing` and `_2` … `_4`), C for
the substantive rules whose currency depends on undated material. That line is not applied to
the rules-procedure page.

No correction is proposed, for three reasons. Section 4's rows genuinely overlap here: the B
row covers "a current official procedure ... or agency page, including direct current
observation of a public official interface", and every one of these claims is of the form
"the page states X", read live on 2026-09-06; the C row covers "incomplete ... or undated
official material", which also fits. Section 8's lint check 4 treats Grade C on observed
current official material as a defect rather than a virtue, so a blanket downgrade is not
obviously the safer reading. And nothing in the grid turns on it — section 8 admits Grade A,
B or C alike for `stated`, so every cell holds its state either way. The row should
nonetheless settle on one treatment; the assessment-method page carries an extra defect the
rules-procedure page does not (authorities dated 1972 to 2001), which is a sufficient reason
for the split as it stands, and that reasoning should be written into the source notes rather
than left implicit.

## F7 — unwaived compound and list claims

Records: `claim_chennai_ptax_annual_value_factor`, `claim_chennai_ptax_payment_status_route`,
`claim_chennai_ptax_online_nil_transaction_fee`,
`claim_chennai_ptax_assessment_documents_are_other_route_2`; manifest `lintWaivers`.
Rules: PROTOCOL section 1 ("one claim asserts one checkable thing"), section 8 lint check 1
and the waiver rule.

The manifest carries exactly one waiver, for `claim_chennai_ptax_bill_number_required`, on
reasoning I accept. Four claims the part B split did not reach are not covered by it:

- `claim_chennai_ptax_annual_value_factor` — genuinely compound. It asserts the 10.92
  multiplier **and**, in a trailing clause, that the page "works the derivation through a
  numeric example." Those are two independently checkable things; the second is the same kind
  of page-surface observation that was split out elsewhere in this ledger. Recommended split:
  narrow the text to the multiplier and record the worked example as
  `claim_chennai_ptax_annual_value_factor_2`, same source, same grade.
- `claim_chennai_ptax_payment_status_route` — asserts two distinct published routes ("a
  Property Tax Status route **and** a Property Tax Payment Status route"). Each is separately
  checkable. This claim supports the `after-submission` cell, so the split matters to the
  evidence behind a `stated` cell, though the cell's state does not depend on it —
  `claim_chennai_ptax_public_receipt_route` and `_2` carry it.
- `claim_chennai_ptax_online_nil_transaction_fee` — presents as a list claim (credit card,
  debit card, net banking). I read the instruments as the scope of one published fee
  statement, on the same reasoning the manifest already accepted for
  `claim_chennai_ptax_bill_number_required`, but that reasoning is not recorded anywhere for
  this claim. Since F1 makes this claim the sole support for a `stated` cell, it should
  carry an explicit waiver entry rather than rest on an unstated analogy.
- `claim_chennai_ptax_assessment_documents_are_other_route_2` — the same pattern (registered
  documents **or** Form-6 **or** last tax paid receipt): one published list, expressed as
  alternatives. Waivable on the same reasoning; presently unwaived.

Section 8 says an unwaived lint finding blocks audit. Recorded as findings for a remediation
pass under the correction policy stated at the top: two of these need new claim records and
two need manifest waiver entries, neither of which is a field-level correction on an existing
ledger record.

## F8 — an observed absence recorded as `Unknown` with no source, duplicating a sourced claim

Records: `claim_chennai_ptax_amount_payable_unknown_2`,
`claim_chennai_ptax_rate_table_and_annexure_missing_3`.
Rules: PROTOCOL section 4 (`Unknown` = "No usable source yet"), section 5, section 13
(auditor may merge duplicates).

`claim_chennai_ptax_amount_payable_unknown_2` reads: "The percentage of annual value and the
location-wise basic rate the corporation's own method depends on are both missing from the
page that cites them." That is an observation of a specific page, made on the access date. It
is graded `Unknown`, based on `inference`, with an empty `sourceIds`. The identical fact is
already recorded as `claim_chennai_ptax_rate_table_and_annexure_missing_3` ("Neither that
table nor that annexure appears anywhere on the page"), Grade B, `observation`, `verified`,
cited to `source_chennai_ptax_assessment_method`. Its own notes even say the point: "The
observed absence is separately checkable from the unknown it produces" — which is the reason
it should not itself be the unknown.

The claim escapes the section 7 citation gate only because `Unknown` exempts it, and it is a
duplicate of a properly sourced claim. Recommended: delete it as a duplicate of
`claim_chennai_ptax_rate_table_and_annexure_missing_3` and keep
`claim_chennai_ptax_amount_payable_unknown`, which is a true unknown (the payable amount)
correctly graded. No correction encoded — a deletion is a structural change under the policy
above. Nothing in the grid depends on it; the claim supports no cell.

`claim_chennai_ptax_due_date_unknown`, `_2` and `claim_chennai_ptax_amount_payable_unknown`
are by contrast correctly `Unknown`/`inference`/no source: each records an absence of
published information rather than an observation of a page, and none of them appears in any
cell's `claimIds`, which is what section 8 requires of an `Unknown` claim.

## F9 — residual header claims left by the part B split

Records: `claim_chennai_ptax_payment_modes`,
`claim_chennai_ptax_assessment_documents_are_other_route`.
Rule: PROTOCOL section 1, section 8 lint check 1.

Both now assert only that the page publishes a list — the substance sits in their numbered
siblings. They are atomic, so they do not fail lint, and they are legitimate as scaffolding.
They should not be leaned on as supporting evidence, which is the specific defect in F2;
`claim_chennai_ptax_payment_modes` also appears in the `eligibility` list, where it is
harmless because `_2` … `_6` carry the actual rule. No correction proposed there.

## F10 — the `cost` cell's claim list against the published method claims

Records: `expectations` cell `cost`; `claim_chennai_ptax_half_yearly_basis`,
`claim_chennai_ptax_annual_value_factor`, `claim_chennai_ptax_library_cess`, `_2`.
Rules: PROTOCOL section 9, section 8 (`cost` definition).

Four `verified` claims describe the published half of the tax computation — a half-yearly
percentage of annual rental value, the 10.92 multiplier, and a 10 per cent library cess on
the general tax component — and none appears in the `cost` cell. Under the current
`mentioned` state they would have been the natural topic-only `claimIds` section 9 allows,
and the cell instead carries the argument in prose. With C1 applied the cell becomes
`stated` on the explicit zero, and section 9 asks a `stated` cell for the claims that give
the actionable value; these method fragments do not give one (each is a rate applied to a
base the corporation does not publish), so they are correctly left out. No correction. The
rewritten note called for in F1 should keep the tax-side gap visible.

## F11 — the `documents` cell state is right, and the two near-misses that do not change it

Records: `expectations` cell `documents`; `claim_chennai_ptax_revenue_officer_is_payee`,
`claim_chennai_ptax_assessment_documents_are_other_route_3`.
Rule: PROTOCOL section 8 (`documents` definition and the boundary-claim rule).

Two readings could have moved this cell and both fail.

A cheque or demand draft drawn in favour of "The Revenue Officer, Corporation of Chennai" is
a concrete instrument the citizen hands over, which brushes against the section 8 `stated`
trigger ("names a concrete document with a requirement to submit, provide, upload, produce,
or attach it"). I concur with the cell note that it does not qualify: it is the payment
itself, not a document produced in support of the payment, and section 8 keeps payment in the
`cost` cell. The published document list — registered documents, Form-6, last tax paid
receipt — is real and actionable but is given for applying for assessment, which this
scenario's summary excludes, so it cannot make this scenario's cell `stated`. The evidence
does touch the topic, so `absent` is wrong too. `mentioned` is correct.

Separately, `claim_chennai_ptax_assessment_documents_are_other_route_3` ("That document list
is not given for paying tax on an existing assessment") is a scope-boundary statement, and
section 8 says a boundary statement "records a limitation, not a positive cell value". It is
retained here because it is doing the opposite of inflating the cell — it is the reason the
list is not counted — and the cell note says so explicitly. Flagged so the reading is on the
record; no correction.

## F12 — checks that passed

- Reference integrity: every `claimId` in the sidecar resolves to a claim in the ledger;
  every `sourceId` on every claim resolves to a source; no dangling references.
- Scenario policy (section 2): manifest `primaryScenarioId`, sidecar `primaryScenarioId` and
  the ledger's single scenario all read `scenario_property_tax_payment_known_sas_pid`; all 34
  claims are tagged to it and to nothing else; no aliases.
- Citation gate (section 7): every non-`Unknown` claim carries at least one source; all four
  empty-source claims are graded `Unknown`, which the ledger schema's conditional permits. No
  claim rests on a department homepage — `source_chennai_ptax_section_index` is the property
  tax section index and the claims drawn from it (the calculator link target, the HTTP 404,
  the published status routes) are direct observations of that specific page, which section 4
  grades B.
- Dates and jurisdiction (section 7): all five sources carry `accessedAt` 2026-09-06 in ISO
  form, matching `meta.asOf`; every claim's jurisdiction text is "Chennai, Tamil Nadu, India",
  matching the manifest.
- Archive rule (section 11): each of the five sources records either a Wayback snapshot URL
  or a documented capture failure, with the staleness of the three old snapshots stated as a
  limitation. No substitute homepage was used for a failed capture.
- Grid-only mode: `nodes`, `edges`, `roadblocks` and `journeys` are empty and
  `scenarios[0].pathNodeIds` is empty, consistent with the manifest's `mode: grid-only`; there
  are no `researchedNoSourceFound` markers to verify under section 6.
- Six cells present with a state each (section 9); `owner`, `time` and `after-submission`
  states are correct as recorded — `owner` `stated` on a named role plus a published contact
  route (section 8 expressly counts "a contact route for that role"); `time` `mentioned`
  because a half-yearly cycle is a cycle without a due date, penalty date, rebate deadline or
  service-level figure, and the note says so.
- Boundary and `Unknown` claims (`claim_chennai_ptax_due_date_unknown`, `_2`,
  `claim_chennai_ptax_amount_payable_unknown`, `_2`,
  `claim_chennai_ptax_rate_table_and_annexure_missing` and `_2` … `_4`,
  `claim_chennai_ptax_calculator_points_to_staging_host` and `_2`,
  `claim_chennai_ptax_know_your_status_404`) are absent from every cell's `claimIds`, as
  section 8 requires.
- Safety: the ledger records read-only observation of the payment, status and receipt routes
  with no identifier entered and no payment begun, and the disclaimer and `asOf` are present.
  No URL was opened during this audit.

---

## Corrections proposed

| # | Record | Field | Old → New |
| --- | --- | --- | --- |
| C1 | `expectations` `property-tax-payment:cost` | `/cells/cost/state` | `mentioned` → `stated` |
| C2 | `expectations` `property-tax-payment:documents` | `/cells/documents/claimIds` | drop `claim_chennai_ptax_payment_modes` |
| C3 | `expectations` `property-tax-payment:eligibility` | `/cells/eligibility/claimIds` | drop `claim_chennai_ptax_half_yearly_basis_2` |
| C4 | `claim` `claim_chennai_ptax_public_receipt_route` | `/basis` | `mixed` → `observation` |

One cell state changes: `cost`, `mentioned` → `stated`. No other cell state changes.

## Unapplied items to carry as stated limitations

- The `cost` cell note must be rewritten as an actionable-value note (F1).
- Splits for `claim_chennai_ptax_annual_value_factor` and
  `claim_chennai_ptax_payment_status_route`; waiver entries for
  `claim_chennai_ptax_online_nil_transaction_fee` and
  `claim_chennai_ptax_assessment_documents_are_other_route_2` (F7).
- Deletion of `claim_chennai_ptax_amount_payable_unknown_2` as a duplicate (F8).
- The grade treatment across `source_chennai_ptax_rules_procedure` and
  `source_chennai_ptax_assessment_method` should be reconciled in the source notes (F6).
