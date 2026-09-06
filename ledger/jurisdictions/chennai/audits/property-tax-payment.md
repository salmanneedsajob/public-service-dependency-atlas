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
