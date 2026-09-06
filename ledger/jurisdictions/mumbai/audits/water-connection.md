# Audit — Mumbai new domestic water connection

- **Service:** `water-connection`
- **Jurisdiction:** Mumbai, Maharashtra, India
- **Primary scenario:** `scenario_ind32_water_residential` — the individual owner of a built residential property with no connection applies for a new domestic supply; bulk or high-rise, commercial, regularisation of an unauthorised connection, name transfer and tanker supply excluded
- **Audit date:** 2026-09-06
- **Benchmark version:** 0.1
- **Mode:** grid-only (no nodes, edges, roadblocks, journeys or portal sidecar; their absence is not raised as a finding)

---

## The two threshold questions

### 1. Provenance — is a ward Section 4 RTI manual valid evidence for a city-wide scoped route?

**Ruling: yes, at Grade C, and the claim wording already narrows correctly. No cell falls on provenance grounds. One cell note overstates the corroboration and is corrected.**

Section 7 requires "jurisdiction text specific to `<jurisdiction>`". The jurisdiction is Mumbai, Maharashtra, India. A Section 4 manual published by the office of the Assistant Engineer (Water Works) of K/West or D ward is text published by an office of the Municipal Corporation of Greater Mumbai, inside Mumbai, about the Hydraulic Engineer's Department procedure. It is jurisdiction-specific text. Section 7 asks for specificity to the jurisdiction, not for the publishing office's remit to be coextensive with the jurisdiction; the ward is a sub-unit of the jurisdiction, not a different one.

Section 4 then grades it. A ward manual describing a departmental procedure is official but indirect material relative to a city-wide route, and it is undated on its face. Both routes in the table land on **C**: "Official but indirect, incomplete, archived, or potentially outdated material" and "Archived, undated, or visibly outdated official material; state the date and limitation." The ledger grades every manual-based claim C and states the date and the limitation in the source notes and in `meta.disclaimer`. That is the correct handling. Nothing in section 4 or section 8 bars a Grade C claim from supporting a `stated` cell; section 8 admits A, B or C explicitly. So the answer to "must cells resting only on ward manuals fall?" is no — the protocol has already priced this material in at C and admitted C.

On whether the claims should be narrowed to say what they actually show: they already are. Every manual-based claim is worded as reported speech — "The ward water works RTI manual states / lists / publishes …" — not as an assertion of city-wide law, and each carries its source IDs so a reader can see which ward. Where a fact is genuinely ward-specific rather than departmental, the researcher named the ward: `claim_mumbai_water_ward_office_contact_published` reads "The K/West ward water works RTI manual publishes the office … for that ward". That is the right convention applied in the right place, and rewriting the other claim texts to prefix a ward name would be cosmetic churn, not a correction. I have not proposed it.

What the cross-check does and does not buy is the part that needed tightening. The D-ward manual is recorded, in its own source note, as read "only as a cross-check that a second ward publishes the same procedure and the same time-limit table". The claims that cite both wards — application route, time-limit table, deciding officers, permission form, connection release — therefore carry two-ward corroboration and are the strongest manual-based material here: the same text in two independently published ward manuals is good evidence that it is departmental boilerplate rather than one ward's local practice. The claims citing K/West alone do not carry that corroboration. The **documents** cell rests entirely on three K/West-only claims, yet its note says "The lists sit in ward Section 4 RTI manuals" — plural, which reads as the same multi-ward corroboration the time cell has. Both document lists come from one ward. Corrected (C2). Likewise the **owner** note reads as though the evidence hands every applicant their ward office contact; the published contact block is K/West's. Corrected (C3).

### 2. Currency — is Grade C right, and can an eleven-year-old procedure still be acted on?

**Ruling: Grade C is right, and the age does not by itself demote any cell. It is recorded as a limitation, which is what the protocol requires of it.**

Grade C is the correct grade and, on this material, the only correct one. Section 4's row "Archived, undated, or visibly outdated official material; state the date and limitation" fits the manuals exactly: no visible issue date, PDF metadata of 2017-03-02 (K/West) and 2015-04-06 (D). The ledger applies C to every manual-based claim and states both the dates and the limitation, in the source notes and in `meta.disclaimer`. Section 8's lint item 5 — a stale or undated source without a stated limitation — is satisfied, and item 5's other half, missing `publishedAt` without a visible-date note, is satisfied too because each source note records what the file does and does not show.

On whether an eleven-year-old procedure still gives a value the citizen can act on: the protocol has already answered this and I decline to invent a stricter bar. Section 8 defines `stated` as "a Grade A, B, or C claim gives a value a citizen can act on", and C is *defined* as the potentially-outdated grade. Reading age as an independent disqualifier would empty the C row of the grade table and would mean no expectation cell could ever rest on archived or undated official material, which is not what section 8 says. The protocol's design is that the age travels with the claim as a stated limitation and the grade tells the reader how much weight to put on it. That is what has happened here.

Two things reinforce the ruling on the facts. First, this material is not superseded — it is the only procedure the corporation publishes at all; the live New Water Connection route carries two forms and no guidance whatsoever (`claim_mumbai_water_nwc_route_is_forms_only`, Grade B). A citizen acting today has this or nothing. Second, the specific figures most exposed to age are the money ones, and those are precisely the figures the manuals do not give: the connection charge is recorded as unpublished (`claim_mumbai_water_connection_charges_unknown`). Durations, document lists, category rules and officer designations decay more slowly than tariffs.

The one currency point that cuts the other way is graded correctly and should stay visible: the application form's folder entry was last changed 2015-09-18, and the Rs. 200 scrutiny fee printed on it is the single most age-sensitive number in the ledger, because it is a rupee amount from a form that has not been touched in eleven years.

---

## Findings

### F1 — correction — `expectation` / `water-connection`, cell `cost`, note

**Protocol:** Section 8 requires the cell note to describe the evidence accurately; the audit checks expectation-cell states and their supporting statements against the ledger.

**Observed:** The cost note says the scrutiny fee is required "before the application is scrutinised". The ledger's own time-limit claim (`claim_mumbai_water_time_limit_table`) puts the steps in this order: scrutiny of the application 15 days, letter to the party 2 days, compliance by the party with the scrutiny fee 30 days, site visit report after compliance 7 days. The fee is paid at the compliance step, on the letter that follows scrutiny — not before scrutiny. The note contradicts the ledger's own evidence on a point a citizen would plan around. The cell state is unaffected. Corrected in C1.

### F2 — correction — `expectation` / `water-connection`, cell `documents`, note

**Protocol:** Sections 4 and 7 — material must be graded by source strength and the record must say what the evidence actually shows.

**Observed:** The note attributes the lists to "ward Section 4 RTI manuals", plural, which reads as cross-ward corroboration. All three supporting claims (`claim_mumbai_water_documents_planned_building`, `claim_mumbai_water_documents_tolerable_structure`, `claim_mumbai_water_document_categories`) cite `source_mumbai_water_rti_manual_kwest` alone, and the D-ward source note limits that manual's use to the procedure and the time-limit table. The document lists are single-ward and uncorroborated. This is a limitation on the note, not on the state: a single ward's Section 4 manual is Grade C official material giving a concrete, actionable list, which section 8 admits. Corrected in C2.

### F3 — correction — `expectation` / `water-connection`, cell `owner`, note

**Protocol:** Section 8, `owner` — `stated` on an office list, a designation tied to a jurisdiction rule, or a contact route for that role.

**Observed:** The note ends "and publishes that officer's ward office address, telephone, e-mail and visiting hours", which reads as though any applicant can find their own ward office this way. `claim_mumbai_water_ward_office_contact_published` is explicitly scoped to K/West ward, and the claim text says so. An applicant in another ward gets the designation and the ward-office route — which is on its own enough for `stated`, being a designation tied to a jurisdiction rule — but not a published contact for their own ward. The cell state is unaffected; the note is narrowed. Corrected in C3.

### F4 — correction — `claim` / `claim_mumbai_water_bills_and_receipts_by_ccn`, `/basis` and `/notes`

**Protocol:** Section 5 — `observation` records what a source or interface directly shows, `inference` records a conclusion drawn from it, and `mixed` must explain the boundary in `notes`. Section 16 forbids querying real case data.

**Observed:** `basis` is `observation`, but the claim asserts an outcome — that the portal "lets a consumer download a duplicate bill or a duplicate receipt by entering the consumer number". What the interface directly showed on the access date is the public page offering those two options keyed to a consumer number with no login wall; the claim's own note records that no consumer number was entered. That a download is actually delivered is a conclusion drawn from the published options, and it could not have been verified without entering a real consumer number, which section 16 rightly forbids. This is exactly the case `mixed` exists for. The claim supports no expectation cell — the after-submission cell correctly excludes it as a surface that follows the connection rather than the application — so nothing in the grid moves. Corrected in C4 and C5.

### F5 — note — `claim` / list-form claims (`claim_mumbai_water_documents_planned_building`, `claim_mumbai_water_documents_tolerable_structure`, `claim_mumbai_water_time_limit_table`, `claim_mumbai_water_installation_time_limits`, `claim_mumbai_water_document_categories`)

**Protocol:** Section 1, one claim asserts one checkable thing; section 8 lint item 1 flags compound or list claims; section 13 permits the auditor to split compound claims.

**Observed:** Five claims reproduce a published enumerated list or table. I am not splitting them. Each asserts one checkable thing — that one identified list or table, with that content, appears in one identified document — and each is verifiable against its source in a single act. Splitting a document list into one claim per document, or a time table into one claim per row, would destroy the very thing sections 8's `documents` and `time` definitions ask for ("an actionable document list", "an actionable duration"), and would multiply records without adding a single checkable assertion. Recorded so the decision is visible rather than silent.

### F6 — note — `expectation` / cell `eligibility`, supporting claims

**Protocol:** Section 8, `eligibility` — `stated` on a rule that decides who qualifies or which route applies.

**Observed:** The cell is carried by `claim_mumbai_water_document_categories`, which sets out requirements by connection category and so decides which route applies to a given property. That alone meets the definition. The other two supports are weaker than the note implies and are recorded here rather than corrected. `claim_mumbai_water_application_through_licensed_plumber` is a lodging-channel rule, not an eligibility rule, though it does constrain who may put the papers in. The note's reading that a planned-building connection "turns on the building already holding an occupation or building completion certificate" is an entailment drawn from a document list rather than a stated eligibility condition — a tight entailment, since a copy cannot be attached by someone who has none, but an entailment. The cell does not depend on either.

### F7 — note — `claim` / `claim_mumbai_water_documents_tolerable_structure`, scenario fit

**Protocol:** Section 2, tag every claim to at least one scenario; section 8 lint item 7, undeclared or incorrect scenario IDs.

**Observed:** The tolerable-structure document list includes "a no-objection certificate from the owner of the premises", which presupposes an applicant who is not the owner. The primary scenario is the individual **owner** of a built residential property. The list is not out of scope — a tolerable structure is an existing built residential property, and the scenario's exclusions (bulk or high-rise, commercial, regularisation, name transfer, tanker) do not reach it — but it is the neighbouring route rather than this scenario's own, and the `documents` cell stands on the planned-building list without it. No correction; the tag is defensible and the claim's note already frames it as a second list.

### F8 — note — `source` / `source_mumbai_water_nwc_form_other`, Grade B on a 2015 form

**Protocol:** Section 4, "An observed current official form" is B; section 8 lint item 4 makes Grade C on an observed current official form a lint failure.

**Observed:** `claim_mumbai_water_scrutiny_fee_200` is graded B against a form whose folder entry was last changed 2015-09-18. There is real tension with section 4's "visibly outdated official material" row. B is correct: "current" here means currently published and operative — the form is served from the corporation's own live new-connection route, no newer version exists, and grading it C would trip lint item 4. The 2015 change date is recorded as a limitation on the source and in `meta.disclaimer`, which is the right place for it. Flagged because this single rupee figure carries the whole `cost` cell and is the ledger's most age-exposed number.

### F9 — note — `claim` / `claim_mumbai_water_application_status_route_unknown`, `claim_mumbai_water_connection_charges_unknown`

**Protocol:** Section 8 — only `verified` or `partial` claims may support `stated` or `mentioned`; a boundary statement or `Unknown` claim records a limitation, not a positive cell value. Section 7 — every non-`Unknown` claim needs at least one source.

**Observed:** Handled correctly. Both are `evidenceGrade: Unknown`, `status: unknown`, `basis: inference`, with empty `sourceIds` — schema-valid, since the ledger schema requires a source only when the grade is not `Unknown`, and section 7's citation gate exempts `Unknown` claims. Neither appears in any cell's `claimIds`. Both notes record that the gap is not login-related, so neither is a disguised overclaim across an authentication boundary under lint item 6. This is the correct treatment and it is the reason the `cost` and `after-submission` cells can be read honestly.

### F10 — note — `source` / all five, archive handling

**Protocol:** Section 11 — capture an archive snapshot at access time for every public source; if capture fails, record the access date, the failure, and a limitation.

**Observed:** Four sources point to pre-existing Wayback snapshots (three from 2022-03-07, one from 2026-06-06) and each records "no new capture was pushed from this run". `source_mumbai_water_nwc_forms_page` records that the availability API returned no snapshot, retains the original official URL, and records the failure as a limitation, which is what the rule requires on failure. Relying on pre-existing snapshots rather than capturing at access time is a deviation from the letter of section 11, but the rule's purpose — a snapshot URL recorded with the source, and no substitution of a homepage for a dead specific page — is met, and the three 2022 snapshots cover static PDFs whose content is dated 2015 and 2017 anyway. No correction.

### F11 — note — schema, references, dates, jurisdiction and tags

**Protocol:** Sections 7 and 12; ledger schema 1.0.0.

**Observed:** Clean. All record IDs match the schema pattern. Every `sourceIds` and every sidecar `claimIds` entry resolves to an existing record; all fifteen claim IDs cited across the six cells exist. All dates are ISO `YYYY-MM-DD`. Every claim carries `jurisdiction: "Mumbai, Maharashtra, India"`, matching `meta.jurisdiction`, and every source note states the jurisdiction and the agency naming as displayed on the access date. Every claim is tagged to `scenario_ind32_water_residential` and no other, and `scenarioIds` is non-empty throughout. No two sources share a URL and access date (lint item 2). No secondary source is graded B (lint item 3). No `researchedNoSourceFound` markers exist to verify, this being grid-only. `basis` is `observation` on every source-backed claim and `inference` on both `Unknown` claims, correct in every case except F4.

---

## Cell-by-cell verdict

**`cost` — stated (accepted).** This was the cell flagged for hardest scrutiny, and it holds. Section 8 sets the bar at "an amount a citizen pays **or** an actionable fee schedule", and lists the three things that make the cell `mentioned` instead: a fee described only as prescribed, a payment step without an amount, or a penalty payable by the agency. Rs. 200 is none of those — it is a specific rupee amount, printed on the corporation's own application form for this service, observed directly (Grade B, `verified`), and mandatory: the published time-limit table makes the party's compliance with the scrutiny fee a step the application cannot pass. The definition does not ask for the total cost or for a complete schedule; where the protocol wants partial coverage disclosed rather than penalised it says so, as it does in the `time` definition ("when the figure covers only one stage, the cell note must say so"). Reading a totality requirement into `cost` would be inventing a rule. The honest objection — that Rs. 200 is a procedural fee while the connection charge itself is unpublished — is real and is handled the way section 8 directs: the gap sits in `claim_mumbai_water_connection_charges_unknown`, an `Unknown` claim recording a limitation, correctly kept out of the cell's `claimIds`, and disclosed in the cell note. What the grid records is that Mumbai publishes one small fee and not the price of the connection; that is a true and unflattering reading, and it is the reading the protocol's definitions produce.

**`documents` — stated (accepted).** Two concrete, enumerated lists with a requirement to submit, plus a category rule saying which list applies. Grade C, `verified`, single-ward provenance recorded as a limitation (F2, C2).

**`eligibility` — stated (accepted).** `claim_mumbai_water_document_categories` gives a usable rule for which route applies, which the definition accepts alongside who qualifies. Carried by that claim; the other two supports are weaker than the note implies (F6).

**`time` — stated (accepted).** A step-by-step time-limit table with figures for every step, cross-checked in two wards' manuals, plus a second set of limits for the installation stage. The definition's staging requirement is met: the note says the figures are per step, that no total is published, and that the approval step's number of levels is unstated.

**`owner` — stated (accepted).** Approving authorities named by designation, the scrutinising and inspecting officer named, and the Assistant Engineer Water Works **of the ward** named as the officer who signs and issues the permission form — a designation tied to a jurisdiction rule, which is more than the "statutory designation or general agency name alone" that the definition demotes to `mentioned`. The K/West contact block is a bonus, now scoped correctly (F3, C3).

**`after-submission` — stated (accepted).** The strictest definition in section 8, and it is met at the anchor rather than at the edges. `claim_mumbai_water_permission_form_issued` does not merely name an outcome: it says how the applicant is informed (by issue of a Permission Form), what the document contains (the approvals and conditions, with which the applicant then has a year to comply), and which officer issues it. That is a visible, actionable post-submission surface, and it is none of the things the definition excludes — it is not registration, document presentation, payment, appointment booking, or the act of submission, all of which sit far earlier in the published table. The rejection-letter step supplies the refusal artefact, though the manual is silent on whether it carries reasons, as the claim's note honestly records. The absence of any tracker or reference number is not folded in: it sits in `claim_mumbai_water_application_status_route_unknown` as a limitation, and the Grade B duplicate-bill portal is explicitly excluded as a surface that follows the connection rather than the application. That exclusion is the right call and is the reason this cell can be read as `stated` without embarrassment.

---

## Verdict

**Accepted cell states — cost: stated; documents: stated; eligibility: stated; time: stated; owner: stated; after-submission: stated. Stated count: 6 of 6.**

No blocking findings. Five corrections proposed, all to cell notes or to one unused claim's `basis` and `notes`; none changes a cell state, a claim status, an evidence grade, or the stated count. The ward-manual provenance and the 2015–2017 currency of the underlying material are accepted as Grade C evidence with limitations stated, per sections 4, 7 and 8, and remain the dominant qualification on everything this grid reports.
