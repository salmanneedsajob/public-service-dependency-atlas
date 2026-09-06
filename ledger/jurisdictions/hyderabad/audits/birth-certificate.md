# Audit — Hyderabad birth certificate (copy of a registered birth)

- **Service:** birth-certificate
- **Jurisdiction:** Hyderabad, Telangana, India
- **Primary scenario:** `scenario_ind32_birth_copy_workflow`
- **Audit date:** 2026-09-06
- **Benchmark version:** 0.1
- **Mode:** grid-only (no nodes, edges, roadblocks, journeys or portal sidecar; their absence is not a finding)

---

## Part 1 — The two dominating questions

### Q1. Two fee figures for one service: one fact told twice, not two channels

**Finding 1 — blocking — `claim_hyderabad_birth_meeseva_fee_45`, `claim_hyderabad_birth_charter_fee_20`, `/cells/cost`**

*What the protocol requires.* Section 1 (integrator): "Do not overwrite conflicting claims: retain both, cross-link them with `contradictsClaimIds`, and mark them `contested` until audited." Section 8: "Only `verified` or `partial` claims may support `stated` or `mentioned`."

*What I observed.* The corporation's current birth and death page gives Rs. 45 payable at any Mee-Seva centre. The corporation's Citizen's Charter gives Rs. 20 per certificate for issue of a birth certificate. Both are published by the same agency, on the same live site, for the same output: a birth certificate for the citizen. The ledger records them as two routes and both claims carry `contradictsClaimIds: []`.

The two-routes reading does not survive inspection of the sources' own words.

1. Only one of the two claims is channel-scoped on its face. Claim `..._meeseva_fee_45` names its channel ("approaches any Mee-Seva centre"). Claim `..._charter_fee_20` does not: the charter's row is "fee for issue of a birth or death certificate", unqualified. The channel attribution appears only in the claim's `notes` ("for the corporation counter route rendered by the AMOH") and is derived from the charter naming the AMOH as the officer rendering the service. Naming the officer who renders a service is not a statement that the fee is confined to a counter channel. The scoping is an inference laid over the source, not an observation of it — a distinction section 5 makes binding.
2. The scoping inference runs against the ledger's own strongest evidence. `claim_hyderabad_birth_institutional_route` records the current page saying that after approval "citizens can take such certificates from Mee-Seva centres **only**", and `claim_hyderabad_birth_meeseva_instant_issue` routes the non-institutional branch to Mee-Seva as well. The current, Grade B evidence therefore routes both branches of this scenario through Mee-Seva. The separate counter channel that the Rs. 20 figure is said to price is not visible on any current reviewed route; it exists only inside the 2013 document.
3. Reconciling the figures as a departmental fee plus a service charge would be the intuition-resolution the protocol forbids. Neither source says it, and no reviewed evidence decomposes Rs. 45.

These are therefore one fact told twice — the amount a citizen pays for a copy of a registered birth in Hyderabad — and section 1 is engaged. Both claims must be cross-linked.

*Resolution of the contested state.* Section 1 marks conflicting claims contested "**until audited**"; the audit is what lifts that holding, and section 13 empowers the auditor to downgrade unsupported claims. The two figures are not equally supported. Rs. 45 rests on direct current observation of the corporation's live page, graded B. Rs. 20 rests on a document twelve years past its own stated revision date, graded C, and the ledger itself carries `claim_hyderabad_birth_current_fee_and_timeframe_unknown` recording that whether it is still in force "is not established by any reviewed public page". The contested state belongs on the charter figure alone. Rs. 45 stays `verified` and carries the cell; Rs. 20 is retained, cross-linked and marked `contested`, and under section 8 it drops out of the cell's `claimIds`.

**Cost remains `stated`** — on the Rs. 45 figure alone, with a note that records the conflict rather than dissolving it. Corrections 1–7.

### Q1(b). The same question for `time`: here the staging is stated, not inferred — no contradiction

**Finding 2 — note — `claim_hyderabad_birth_charter_time_frames`, `claim_hyderabad_birth_meeseva_instant_issue`, `/cells/time`**

The time cell pairs a 7-day and 3-day charter figure with "issued instantly" on the current page. Structurally this looks like the fee conflict, and I tested it the same way. It is not the same.

The current page's own words condition the instant figure: certificates are issued instantly from Mee-Seva "**after approval by** the Registrar or AMOH". The staging is on the face of the source. A 7-day target for issue of the certificate and an instant counter step once approval has happened are compatible descriptions of one journey at two stages, not two competing totals. That is the whole difference from the fee: for time the staging is *observed*; for cost it would have to be *invented*. No contradiction link is warranted and no claim is contested here.

Section 8 further requires that "when the figure covers only one stage, the cell note must say so." The cell note does: it states that the instant figure "covers the counter step, not the prior approval by the Registrar or AMOH, for which no period is published." Compliant. **Time remains `stated`.** No correction.

### Q2. A charter that expired by its own terms: Grade C is exactly the right treatment

**Finding 3 — note — `source_hyderabad_birth_ghmc_citizen_charter` and the five claims drawn from it**

*What the protocol requires.* Section 4: "C — Archived, undated, or visibly outdated official material; **state the date and limitation**." Section 8 admits "a Grade A, B, or C claim" as giving a value a citizen can act on.

*What I observed.* The charter states on its face that it was prepared on 10 May 2013 and would be revised on or before 13 May 2014, and it is still linked from the corporation's live homepage. It is the sole support for the fee, the two time frames, the officer designations and the documents entry on the counter route. The ledger grades every claim from it C, records `publishedAt: 2013-05-10`, states the limitation in the source `notes` and in `meta.disclaimer`, and additionally carries the limitation as a first-class record, `claim_hyderabad_birth_charter_self_expired`.

This is the C row of section 4 applied precisely as written, with the date and the limitation both stated. I accept it, and I record it as correct treatment rather than as a defect.

*Does a document twelve years past its own revision date still give "a value a citizen can act on"?* Yes, and the protocol settles this rather than leaving it to judgement. Section 8 expressly admits Grade C to `stated`, and section 4's C row is written for exactly this material. To hold that visibly outdated official material can never yield an actionable value would delete Grade C from section 8 and would collapse the instrument's distinction between *weak evidence, stated* and *no evidence, absent*. Staleness is priced by the grade and by a stated limitation; it is not a second, hidden veto over cell state.

*Where staleness does bite.* It bites where the stale figure meets a current contrary figure from the same agency for the same output. That is the cost cell, and only the cost cell — handled at Finding 1. Nothing in the reviewed evidence contradicts the 7-day and 3-day frames, the AMOH and DC designations, or the documents column. Those stand as C-supported values with the limitation stated. The line is principled and I state it plainly: **age alone → Grade C plus a stated limitation; age plus a current contrary figure → contradiction under section 1.**

*Cells touched by the charter and their outcome after this audit:* `cost` (Rs. 20 contested out; cell survives on Rs. 45), `time` (`stated`, retained), `owner` (`stated`, retained), `documents` (`mentioned`, retained — see Finding 8). No correction arises from the grading itself.

---

## Part 2 — Ordinary audit

**Finding 4 — correction — `claim_hyderabad_birth_meeseva_instant_issue`**

*Protocol.* Section 1: "one claim asserts one checkable thing." Pre-audit lint item 1: compound or list claims. Section 13: the auditor "may split compound claims." Section 1 also binds identity: "Reuse a record ID once published; change content, not identity."

*Observed.* The claim packs two independently checkable assertions: (a) for a non-institutional birth the citizen approaches Mee-Seva with all required documents including Form 1; and (b) certificates are issued instantly from Mee-Seva after approval by the Registrar or AMOH. It is cited in four of the six cells — `documents` and `eligibility` lean on (a), `time` and `owner` on (b) — so every one of those four citations points at a record half of which is irrelevant to it. This is the one compound claim in the ledger doing load-bearing work across the grid.

*Prescribed fix, preserving identity.* Rather than delete and re-create (which would destroy a published identity, contrary to section 1), the existing record keeps its ID and is narrowed to half (b), which is what its ID names; half (a) is added as `claim_hyderabad_birth_meeseva_noninstitutional_intake`. `documents` and `eligibility` re-point accordingly; `time` and `owner` need no change. Corrections 11–15.

*Scope note carried on the new record.* Half (a) describes intake for a birth **not yet** on the register, which sits at the edge of a scenario scoped to a birth "already registered". It is retained, not excluded, because the corporation's page presents Mee-Seva intake and certificate issue as one counter flow and because the only cell it supports, `documents`, is `mentioned` rather than `stated`. Eligibility does not depend on it: `claim_hyderabad_birth_form_registration_proviso` alone ("issued subject to the entry being found registered with GHMC records") is a clean in-scope rule deciding who qualifies.

**Finding 5 — correction — `claim_hyderabad_birth_form_particulars`, `claim_hyderabad_birth_form_registration_proviso`, `source_hyderabad_birth_application_form`**

*Protocol.* Section 4: "B — An observed current official form." Pre-audit lint item 4: "Grade C assigned to observed current official forms." An unwaived lint finding blocks audit.

*Observed.* The printable application is served live from the corporation's own `CSC_Applications` directory, is the form the corporation currently publishes for this service, and was directly observed on the access date. Both claims drawn from it are graded C, on the stated ground that the form carries no visible date and PDF metadata dates it to 2010.

*Assessment.* Section 4's C row does include "undated" material, so the ledger's reading is reasoned rather than careless, and I record that. But two things govern. First, the B row is specific to the artefact type — an observed current official form — while the C row is a general catch-all; the specific row controls. Second, lint item 4 is asymmetric: the protocol enumerates C-on-an-observed-current-form as a finding and enumerates no converse check. Since most government form PDFs carry no visible date, reading "undated" to capture them would make lint item 4 almost impossible to trigger, which cannot be the drafters' intent. The metadata date is a limitation to state, not a demotion of the artefact.

Both claims move to B. Neither cell state moves (section 8 admits B and C alike), so this is a lint correction, not a scoring one. The source `notes` sentence "so claims from it are graded C" is corrected with them so the ledger does not contradict itself, and the 2010 metadata date is retained as a stated limitation. Corrections 8–10. If the research pass recorded a waiver for this in its handoff, that waiver lies outside my section 12 input boundary and would dispose of the finding.

**Finding 6 — correction — `/cells/owner/note`**

*Protocol.* Section 2: the grid scores the primary scenario only. The scenario summary excludes hospital-side registration steps by name.

*Observed.* The owner note reads part of its support from "the Sub-Registrar or AMC as the recipient of an institutional request" — that is, the office receiving the *hospital's* online submission. That is a hospital-side registration step, expressly excluded from this scenario, and it should not be scoring a cell. This is the only place in the grid where excluded-route evidence is doing work.

*Effect on cell state: none.* Owner remains `stated` on in-scope support: the charter names the AMOH as the officer rendering the service and gives the DC as the officer to approach for delay or default — a designation for the deciding role plus a route for escalating it, which clears section 8's "a contact route for that role" limb and is more than "a statutory designation or general agency name alone"; and the current page names the Registrar or AMOH as the approver who decides the case. The note is corrected to drop the excluded-route reliance and to say why. `claim_hyderabad_birth_institutional_route` stays in `claimIds`: its in-scope half names the Registrars of Births and Deaths as the approving authority. The note's own admission that no circle-level office list or contact number is published is accurate and is retained. Correction 16.

**Finding 7 — note — `claim_hyderabad_birth_hospital_reporting_seven_days`**

The 7-day hospital reporting duty is squarely an excluded hospital-side registration step. It is cited in **no** cell, and its own `notes` say so explicitly: "recorded for the route and not used for the time cell, since hospital-side registration steps are outside this scenario." That is correct handling and I record it as such. The only residual tension is that a claim describing an expressly excluded step carries the primary scenario tag; with no other scenario declared there is nowhere else to put it, and its notes make the exclusion legible. No correction.

**Finding 8 — note — `/cells/documents`: tested in both directions, `mentioned` is correct**

*Protocol.* Section 8: "`documents`: `stated` when the evidence gives an actionable document list **or** names a concrete document with a requirement to submit, provide, upload, produce, or attach it. A reference to documents without telling the citizen what is required is `mentioned`." `absent` means "the reviewed evidence does not touch the topic."

*Not `absent`.* The evidence touches the topic in three distinct places: the charter's documents column for both relevant rows, the current page's instruction to bring "all required documents including Form 1", and a printable application form served by the corporation. The topic is named repeatedly.

*Not `stated`, though the argument for it is real and I record it.* The strongest case for `stated` is that the charter's documents column for these two rows contains exactly one entry, the application in the prescribed format, and nothing else — an exhaustive list of length one, which by the logic of section 3 (an explicit zero is a stated value) would be an actionable list rather than an absence. I do not accept it, for three reasons. First, "an application in the prescribed format" names a document by description without identifying it: the charter neither names nor links `BIRTHREQAPP.pdf`, and the connection to that file is the researcher's, not the source's. Second, the one route the corporation currently directs citizens to tells them to bring "all required documents" and names none — the textbook `mentioned` case, and the ledger's own `claim_hyderabad_birth_copy_documents_unknown` records that the supporting documents for a copy are not established by any reviewed public page. Third, the exhaustiveness is undercut on the charter's own face by the table heading requiring "all copies to be attested by a Gazetted Officer", which contemplates copies of something the column does not name.

So "an application in the prescribed format" does *not* satisfy the concrete-document limb, and equally it is not nothing. `mentioned` is right, the existing note already articulates this reasoning accurately, and section 9's form for a `mentioned` cell (state, searched routes, topic-only claimIds, search note) is satisfied. No correction beyond the claim-ID re-pointing at Finding 4.

**Finding 9 — note — unknowns and the login boundary are correctly kept out of the grid**

*Protocol.* Section 8: "a boundary statement or `Unknown` claim records a limitation, not a positive cell value." Lint item 6: overclaims across an authentication boundary.

*Observed and accepted.* `claim_hyderabad_birth_login_boundary` (`partial`, boundary statement), `claim_hyderabad_birth_current_fee_and_timeframe_unknown` and `claim_hyderabad_birth_copy_documents_unknown` (both `Unknown`/`unknown`, `sourceIds: []`, permitted by the schema's conditional) appear in no cell's `claimIds`. I checked all six cells. The rule is respected exactly.

The `after-submission` cell is the one exposed to an overclaim risk and it survives cleanly. All three supporting claims sit outside the gate: the SMS alert is reported from the public page; the certificate search route was observed publicly and its claim expressly disclaims what it returns ("no number was entered, so nothing is claimed about what it returns"); the certificate template was read as an empty layout with no case data. Nothing is asserted about authenticated or case-specific surfaces. Section 8's `after-submission` test is met on three independent limbs — an alert the citizen receives, a status lookup taking an acknowledgement number, and the downloadable result's own layout — and all are genuinely post-submission rather than steps at or before submission. **`after-submission` remains `stated`.**

**Finding 10 — note — `claim_hyderabad_birth_login_boundary` `basis: "mixed"`**

Section 5 requires that `mixed` "explain the boundary in `notes`", meaning the boundary between what was observed and what was inferred. The notes explain the *login* boundary and the reason the cell does not rest on the gated surface — useful, but not the observation-versus-inference split section 5 asks for. I raise this as a note and propose no correction: fixing it would require me to assert which element of the claim was observed and which inferred, and I have no evidence for that. Inventing it would breach section 13's bar on inventing evidence to complete a record.

**Finding 11 — note — charter claims mirroring two table rows each**

`claim_hyderabad_birth_charter_fee_20` (Rs. 20 / Rs. 20), `..._charter_time_frames` (7 days / 3 days) and `..._charter_officers` (AMOH renders / DC for delay) each state values for the two adjacent charter rows that cover this scenario. A strict reading of lint item 1 would split the time frames, whose two values differ. I propose no correction: both halves of each are in scope (the scenario covers a first certificate *and* extra copies), the pairing mirrors the source table rather than fusing unrelated facts, and no cell is misdirected — the time cell note correctly distinguishes which figure applies to which request. Recorded so the choice is visible, not silent.

**Finding 12 — note — archive snapshots all predate the access date**

Section 11 asks for a snapshot "at access time"; section 14 requires "a Wayback snapshot or documented archival failure." All five sources record a snapshot URL and state honestly that no new capture was pushed from this run. The snapshots date to 2025-03-21, 2026-04-20, 2026-05-17, 2024-05-29 and 2023-04-28 — every one earlier than the 2026-09-06 access date, so none evidences the page as observed on that date. Section 14 is met; section 11's capture-at-access-time expectation is not, and the gap is transparently recorded rather than concealed. Note only.

**Finding 13 — note — `meta.disclaimer` carries wording this audit overturns, outside the pointer contract**

The disclaimer states that the Rs. 45 and Rs. 20 figures "are recorded as different routes rather than reconciled". Finding 1 rejects that framing, so the sentence will need to follow the corrected claims. The corrections pointer contract enumerates `recordType` values agency, scenario, source, claim, node, edge, roadblock and journey; `meta` is not among them, so I cannot express this as a mechanical correction. Flagged here as a stated limitation for the integrator to carry, per section 13's treatment of unapplied corrections.

**Findings — clean checks, recorded for completeness.** Citation gate (section 7): every non-`Unknown` claim carries at least one source; every source supplies a direct link, an exact ISO access date, jurisdiction text specific to Hyderabad, Telangana, India, and agency naming as displayed; no claim rests on a homepage or general-site reference — the agency `officialUrl` points at the specific service page. Reference integrity: all seventeen claims' `sourceIds` resolve to the five source records, and all sixteen cell `claimIds` across the six cells resolve to existing claims; all IDs match the schema pattern. Dates: `meta.asOf`, every `accessedAt`, and this audit date agree at 2026-09-06. Scenario tags (lint item 7): exactly one scenario, matching the manifest `primaryScenarioId`, tagged on every claim, no aliases. Lint item 2: five distinct URLs, no duplicate source. Lint item 3: no secondary sources, so no Grade B on secondary material. Lint item 5: the current page's missing `publishedAt` is covered by an explicit visible-date note. Lint item 8: no nodes, so no `researchedNoSourceFound` markers to verify. Section 3: no explicit-zero values arise. Section 9 form: `stated` cells carry `claimIds` and an actionable-value note; the `mentioned` cell carries searched routes, topic-only claim IDs and a search note. Sidecar `schemaVersion`, `serviceId` and `primaryScenarioId` match the manifest.

---

## Verdict

Cell states accepted after corrections: **`cost` stated** (on the Rs. 45 figure alone; the Rs. 20 charter figure contested and cross-linked, not reconciled), **`documents` mentioned**, **`eligibility` stated**, **`time` stated**, **`owner` stated** (excluded hospital-side support removed from the note), **`after-submission` stated**. **Stated count: 5 of 6.** Corrections proposed: 16.


## Re-audit — 2026-09-06 (IND-91 part B)

A fresh isolated auditor re-audited this row after pre-audit lint remediation, on the section 12 inputs only. 16 corrections were proposed and 16 applied; none unapplied.

(no findings file written)
