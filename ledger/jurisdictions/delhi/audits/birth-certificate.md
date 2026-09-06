# Audit: Delhi birth certificate (copy of a registered birth)

- **Service:** birth-certificate
- **Jurisdiction:** Delhi, NCT of Delhi, India
- **Primary scenario:** `scenario_ind32_birth_copy_workflow`
- **Audit date:** 2026-09-06
- **Benchmark version:** 0.1
- **Run:** second audit run for this service. The ledger now carries five sources and twenty-one claims, including a fifth source (`source_delhi_birth_mcd_citizen_charter`) and five claims added after the first run. This run re-audits every record from scratch and assumes no earlier verdict.
- **Mode:** grid-only. The absence of nodes, edges, roadblocks, journeys and a portal sidecar is legitimate and is not raised as a finding.

## Findings

### F1 — correction — Grade B rests on undated official material

**Records:** `claim_delhi_birth_mcd_sla_one_week`, `claim_delhi_birth_mcd_sla_institutional_instant`, `claim_delhi_birth_mcd_institutional_processing`, `claim_delhi_birth_mcd_domiciliary_route` (source `source_delhi_birth_mcd_citizen_charter`).

**Protocol requires:** Section 4 grades "Archived, undated, or visibly outdated official material; state the date and limitation" as **C**. The C row is disjunctive: undated alone is sufficient. Grade B covers a *current* official procedure, form, portal, circular or agency page. Section 8 lint item 5 also targets stale or undated sources.

**Observed:** All four claims are graded **B**, yet the source's own note records that the charter "is served as a page-flip reader and shows no publication or revision date". These four claims assert what the charter *prescribes* — a service-delivery timeline, an institutional timeline, and two routing rules — and the currency of a prescription cannot be established from an undated document. The claims are downgraded to **C**. This does not change any cell state, since section 8 permits a Grade C claim to support `stated`; it changes what the grid honestly says about the strength of the evidence beneath it.

### F2 — note — one Grade B on the same undated source is upheld

**Record:** `claim_delhi_birth_mcd_charter_key_contacts_empty`.

**Protocol requires:** Section 4 grades direct current observation of a public official interface **B**.

**Observed:** This claim asserts the *present visible state* of the page — that the "Key Contacts" heading is followed by no contact, name, designation or telephone number — rather than a rule whose currency depends on the document's date. The observation was made on the access date and is current by construction. Grade B is upheld. The distinction drawn here, and applied against F1, is between a claim about what an undated document prescribes and a claim about what the page displays today.

### F3 — correction — a cell scored from an excluded route

**Records:** `claim_delhi_birth_mcd_institutional_processing`, `claim_delhi_birth_mcd_domiciliary_route`, `claim_delhi_birth_mcd_sla_institutional_instant`, and the sidecar cell `eligibility`.

**Protocol requires:** Section 2 scores the six-cell grid on the manifest-declared primary scenario only. The scenario summary scopes this service to "a certified copy or first certificate of a birth **already registered**" and expressly excludes "hospital-side registration steps".

**Observed:** The `eligibility` cell cites two MCD citizen-charter rows that belong to the registration stage, not to the copy route:

- `claim_delhi_birth_mcd_institutional_processing` states that for an institutional event "the processing for issuance of the certificate is done by the health unit where the child is born" — a hospital-side step the scenario excludes. Used as a route rule for this scenario it would send a parent of an already-registered, hospital-born child to the hospital, against the FAQ's plain-paper application to the concerned area Registrar and MCD's own zone-routing instruction.
- `claim_delhi_birth_mcd_domiciliary_route` states that for home and other delivery events "the parents can apply for the certificate directly on the MCD portal online" — that is the initial application for a birth not yet on the register. Its note, "Matches the scoped applicant type, a parent resident in the city", matches the applicant but not the scenario's trigger condition.

The ledger already applies exactly this reasoning to `claim_delhi_birth_mcd_certificate_printout`, which is marked `partial` because it "sits in the sequence that begins with the informant registering the event". The same treatment is applied here: both claims are set to `partial` with scope notes and removed from the `eligibility` cell's `claimIds`. `claim_delhi_birth_mcd_sla_institutional_instant` is scoped to the same institutional route and is set to `partial` for consistency, though it carries no cell weight. All three are retained in the ledger; none is deleted.

**Effect on the cell:** `eligibility` remains **stated**. It still rests on `claim_delhi_birth_place_of_occurrence_rule` (Grade B, verified: registration only at the place of occurrence, so an event outside Delhi cannot be handled here) and `claim_delhi_birth_mcd_zone_routing` (Grade B, verified: the request must go to the zone where the event took place or it may be rejected). Both are usable rules that decide which route applies, and both are on the copy route.

### F4 — correction — compound claim

**Record:** `claim_delhi_birth_registrar_directory_published`.

**Protocol requires:** Section 1, "one claim asserts one checkable thing"; the auditor may split compound claims (sections 1 and 13); section 8 lint item 1 flags compound or list claims.

**Observed:** The claim asserts two separately checkable things — that a downloadable Directory of Area Wise Registrar and Sub-Registrar is published, and that the directorate's office email and telephone are given. In the `owner` cell the single claim was carrying two different prongs of the section 8 definition at once, "a specific office list" and "a contact route for that role", which is the precise harm a compound claim causes. The claim is split, following the precedent already recorded in `claim_delhi_birth_subregistrar_designation`. The new claim `claim_delhi_birth_directorate_office_contact` carries the contact route, same source, same grade, same basis; no evidence is added or invented.

### F5 — correction — a cell note overstates the currency of its second source

**Record:** sidecar cell `time`.

**Protocol requires:** Section 9, a `stated` cell carries an actionable-value note; section 4 requires the date and limitation to be stated for undated material.

**Observed:** The `time` note describes MCD's citizen charter as "A second, current MCD source ... which does not depend on the potentially outdated Chief Registrar charter". The independence from the pre-2022 corporations is true; "current" is not established, because that charter is itself undated (F1). After correction, every figure in this cell comes from undated official material. The note is rewritten to record that limitation and to keep the existing, correct single-stage caveat.

### F6 — note — `documents` examined hardest and upheld

**Record:** sidecar cell `documents`, on `claim_delhi_birth_application_plain_paper` and `claim_delhi_birth_application_particulars`.

**Protocol requires:** Section 8, `documents` is `stated` when the evidence "gives an actionable document list **or** names a concrete document with a requirement to submit, provide, upload, produce, or attach it".

**Observed:** The cell rests on the application itself rather than on a supporting-proof list, and that was tested against the definition. The definition's second limb is satisfied on its face: the FAQ names a concrete document — an application on plain paper — with a requirement to submit it to the concerned area Registrar or Sub-Registrar, and a second claim gives the five particulars it must contain, so a citizen knows what to produce and where to take it. The claim is Grade B, verified, and expressly about obtaining a certificate "after registration", so it is on this scenario and not on an excluded route. The definition does not require supporting proof, and the cell note already discloses the boundary — that no reviewed official route publishes a proof-of-identity list for a copy of an already registered birth. **Upheld as `stated`**, with the boundary note kept as written.

### F7 — note — `time` examined hardest and upheld

**Record:** sidecar cell `time`.

**Protocol requires:** Section 8, `time` is `stated` when the evidence gives an actionable duration, deadline, processing period or service-level target, with a cell note where the figure covers only one stage; section 8 permits Grade A, B or C to support `stated`.

**Observed:** The undated provenance is real (F1, F5) but is not disqualifying: Grade C explicitly supports a `stated` cell, and the strongest figure, `claim_delhi_birth_issue_within_seven_days`, is directly on-scenario — 7 days from the date of receipt of the application, on the express proviso that the birth has already been registered. The note already says the figure covers issue only, not any counter queue or collection step, as the definition requires. **Upheld as `stated`**, on Grade C evidence with the limitation now recorded in the note.

### F8 — note — no overclaim across the login boundary

**Records:** `claim_delhi_birth_mcd_citizen_surface_behind_signup`, `claim_delhi_birth_post_submission_surface_unknown`, sidecar cell `after-submission`.

**Protocol requires:** Section 5, `mixed` must explain the boundary in notes; section 8, only `verified` or `partial` claims may support `stated` or `mentioned`, and a boundary statement or `Unknown` claim records a limitation, not a positive cell value; sections 8 and 16 forbid crossing an authentication boundary or claiming past it.

**Observed:** Clean. The boundary claim is `basis: mixed` and separates observation from inference in its notes; it is `partial` and is cited in no cell, appearing only in the `after-submission` note as a limitation. The `Unknown` claim carries no sources, `basis: inference`, `status: unknown`, and is cited in no cell. `after-submission` is scored `mentioned` on two claims that are `partial` and `verified` respectively, which the rule permits. The state is correct under the definition: collection at a counter and a printout after official approval name an outcome without a visible post-submission surface, and the printout sits in the registration sequence, so neither can carry `stated`; the topic is nonetheless touched, so `absent` would be wrong.

### F9 — note — archive snapshots predate the access date

**Records:** all five sources.

**Protocol requires:** Section 11, capture an archive snapshot at access time and record the snapshot URL; if capture fails, record the access date, the failure and a limitation. Section 14 accepts "a Wayback snapshot or documented archival failure".

**Observed:** Every source records a snapshot URL and states plainly that it is a pre-existing capture and that "no new capture was pushed from this run". The snapshots date from 2024-08-09, 2025-10-21, 2026-01-03, 2026-01-09 and 2026-02-13, all earlier than the 2026-09-06 access date, so none of them evidences the page as observed on the access date; the Chief Registrar charter's snapshot is over two years older than the observation. The section 14 requirement is met literally and the practice is disclosed uniformly, so this is recorded as a limitation rather than a correction. No substitute homepage was used and no dead link was papered over.

### F10 — note — `issue_within_seven_days` cross-cited in two cells

**Records:** `claim_delhi_birth_issue_within_seven_days`, cells `eligibility` and `time`.

**Observed:** The claim is primarily a timing figure, and citing it under `eligibility` was tested. Its proviso — "provided the birth has already been registered" — is a genuine condition on who the route serves, and the `eligibility` note leans on exactly that. Accepted as written; the cell does not depend on it, since two Grade B route rules carry the cell on their own.

### F11 — note — `cost` rests on visibly outdated official material, disclosed

**Records:** `claim_delhi_birth_additional_copy_fee`, `claim_delhi_birth_first_copy_free`, cell `cost`.

**Observed:** Both claims are Grade C from the Chief Registrar's charter, which names the pre-2022 trifurcated corporations. Grade C supports `stated`, the Rs. 20 per additional copy figure is an amount the citizen pays, and the free first copy is an explicit zero, which section 3 requires to be recorded as `stated` rather than as an absence. The cell note already records that no current MCD page restates the copy fee; the fifth source added since the first run yielded no fee claim, which is consistent with that note. **Upheld as `stated`**, and flagged alongside `time` as the grid's weakest-provenance stated cells.

### F12 — note — structural checks clean

**Protocol requires:** Sections 2, 7 and the ledger schema — atomicity, source linkage, ISO dates, jurisdiction text, scenario tags, reference integrity.

**Observed:** Every non-`Unknown` claim carries at least one source and the single `Unknown` claim correctly carries none. Every `sourceIds` and every sidecar `claimId` resolves to an existing record; `contradictsClaimIds` is empty throughout and no false contradiction link was found. Every claim is tagged to `scenario_ind32_birth_copy_workflow` and to nothing else, matching the manifest `primaryScenarioId`; no scenario alias appears. All dates are ISO and all `accessedAt` values equal the ledger `asOf`. Every claim's jurisdiction string is exactly "Delhi, NCT of Delhi, India". No citation rests on a department homepage: all five source URLs are specific pages or documents. Record IDs match the schema pattern and no identity was changed by this audit — the one split reuses the parent ID for the retained half and adds a new ID for the separated half. The scenario record, `status: partial` with empty `pathNodeIds`, is consistent with grid-only mode.

### F13 — note — no blocking findings

No finding in this run blocks the service. Four corrections change evidence grades, three change claim statuses, four change claim text or notes, one adds a split claim and four change sidecar cells; none removes a claim, none invents evidence, and no cell state changes.

## Verdict

Accepted cell states: **cost = stated; documents = stated; eligibility = stated; time = stated; owner = stated; after-submission = mentioned — 5 of 6 stated.**

`documents` and `time` were tested hardest and are upheld on the section 8 definitions, `time` on Grade C evidence whose undated provenance is now stated in the cell note. `eligibility` is upheld as `stated` on the copy-route rules alone, after the institutional and domiciliary registration-stage evidence was removed from it. `after-submission` remains `mentioned`: no reviewed public route shows an acknowledgement, application number, tracker, receipt, rejection reason or downloadable result for a copy of an already registered birth, and the MCD citizen surface that might carry one lies behind portal signup, which this run correctly did not cross.


## Re-audit — 2026-09-06 (IND-91 part B)

A fresh isolated auditor re-audited this row after pre-audit lint remediation, on the section 12 inputs only. 4 corrections were proposed and 4 applied; none unapplied.

# Re-audit — Delhi, birth certificate (grid-only row)

Row: `delhi` / `birth-certificate`
Primary scenario: `scenario_ind32_birth_copy_workflow`
Mode: grid-only (manifest); ledger carries no nodes, edges, roadblocks or journeys.
Inputs: ledger, expectations sidecar, the manifest entry for this row, `schemas/ledger.json`, `PROTOCOL.md`, `schemas/corrections.json`. Nothing else was opened; no URL was visited.

## Summary

Sixteen findings. Four corrections proposed. No expectation-cell **state** changes: all six cells are recorded correctly against the section 8 definitions. Two corrections touch claim metadata (`basis`, `evidenceGrade`); two touch cell `claimIds` lists without changing any cell state.

---

## Cell-by-cell verdicts

### F1 — `cost` = `stated` is correct

Section 8 (`cost`): `stated` when the evidence gives an amount a citizen pays. `claim_delhi_birth_additional_copy_fee` gives Rs. 20 per additional copy of a birth certificate under section 17 — a payable amount, not a fee "as prescribed" and not a payment step without a figure. `claim_delhi_birth_first_copy_free` is an explicit zero and section 3 requires it to be recorded as a stated value rather than an absence. Both are `verified`, both Grade C, and section 8 admits A, B or C for `stated`. The cell note discloses the Grade C basis and that no current MCD page restates the copy fee. Correct.

`claim_delhi_birth_first_copy_free_2` (free copy to the informant immediately after registration) is checked and retained: it delimits *which* copy the zero attaches to, and the cell note's phrase "the first copy free to the informant" rests on it. It is scope-limiting support for the zero, not a stray timing claim. No change.

### F2 — `documents` = `stated` is correct

Section 8 (`documents`): `stated` when the evidence names a concrete document with a requirement to submit it, or gives an actionable document list. `claim_delhi_birth_application_plain_paper` names a concrete document (an application on plain paper) with a requirement to submit it to the concerned area Registrar or Sub-Registrar; `claim_delhi_birth_application_particulars` supplies the actionable content list (five particulars, items i to v); `_2` supplies the place-of-birth content rule for a domiciliary birth. All three are `verified` Grade B.

Checked against the obvious challenge: the `after-submission` definition expressly excludes "the act of submission", but the `documents` definition carries no equivalent exclusion, so the application form itself is legitimate `documents` evidence. The cell note honestly records the residual boundary — no reviewed official route publishes a supporting proof-of-identity list for a copy of an already registered birth. Correct.

### F3 — `eligibility` = `stated` is correct

Section 8 (`eligibility`): `stated` when the evidence gives a rule that decides who qualifies or which route applies. Three usable rules are cited: registration only at the place of occurrence, so an event outside Delhi cannot be handled here (`claim_delhi_birth_place_of_occurrence_rule`, B, `verified`); the birth must already be registered (`claim_delhi_birth_issue_within_seven_days_2`, C, `verified`); and the request must go to the zone in which the event took place or may be rejected (`claim_delhi_birth_mcd_zone_routing`, B, `verified`). None is a bare naming of "applicability" or an applicant category. Correct.

The cell note's removal of the two MCD citizen-charter rows is also correct under section 2 (the grid scores the primary scenario only): `claim_delhi_birth_mcd_institutional_processing` is a hospital-side registration step the scenario excludes, and `claim_delhi_birth_mcd_domiciliary_route` describes the registration application rather than a request for a copy of a birth already on the register. Both are retained in the ledger as `partial`, which is the right disposition — scope-limited, not deleted.

### F4 — `time` = `stated` is correct

Section 8 (`time`): `stated` when the evidence gives an actionable duration, deadline, processing period, or service-level target, and where the figure covers only one stage the cell note must say so. The 7-day issue period and the 3-day/7-day delivery schedule are actionable figures, and the note discharges the one-stage duty explicitly ("covers issue of the certificate only, not any counter queue or collection step"). The note also states the Grade C limitation for every figure in the cell. Correct. See F9 for a `claimIds` completeness point that does not change the state.

### F5 — `owner` = `stated` is correct

Section 8 (`owner`): `stated` when the citizen can identify the office, officer, or operational role that holds or decides the case, including a designation tied to a jurisdiction rule or a specific office list. `claim_delhi_birth_registrar_designation` is exactly a designation tied to a jurisdiction rule — the Deputy Health Officer of the zone is Registrar for events in that zone — and `claim_delhi_birth_registrar_directory_published` supplies the area-wise office list. Those two alone carry the cell past `mentioned` (which is where a bare statutory designation or general agency name would leave it). `claim_delhi_birth_collection_point` and `claim_delhi_birth_chief_registrar_not_issuer` add the collection point and the negative routing rule. Correct. See F10 for one listed claim that does not support the cell.

### F6 — `after-submission` = `mentioned` is correct, and is not `stated`

This is the cell most exposed to an over-read. `claim_delhi_birth_mcd_certificate_printout` — a printout of the certificate may be taken after approval of MCD officials — looks on its face like the "downloadable result" that section 8 admits for `stated`, and section 8 permits a `partial` claim to support a positive cell value, so status alone does not bar it. The correct ground for `mentioned` is scope: the guideline sits in the sequence that begins with the informant registering the event, so the submission it follows is a *registration* submission, not the copy request this scenario scores. Section 2 restricts the grid to the primary scenario. For that scenario the outcome is named with no visible or actionable post-submission surface, which is section 8's definition of `mentioned`. The cell note states this reasoning. Correct.

The exclusions are also handled correctly under section 8's last sentence — only `verified` or `partial` claims may support a cell value, and a boundary statement or `Unknown` claim records a limitation, never a positive value:

- `claim_delhi_birth_post_submission_surface_unknown` (Grade `Unknown`, status `unknown`) appears in **no** cell's `claimIds` and is referenced only as a limitation in the note. Correct.
- `claim_delhi_birth_mcd_citizen_surface_behind_signup` and `_2` are boundary statements about the portal signup wall; both appear in no cell's `claimIds`, and the note records the boundary as a limitation rather than a finding. Correct.

`searchedRoutes` is populated with four URLs, satisfying section 9's requirement that a `mentioned` cell record searched routes and a search note. The other five cells are `stated` and record `claimIds` plus an actionable-value note, which is what section 9 asks of them; their empty `searchedRoutes` arrays are not a defect.

---

## Defects (corrections proposed)

### F7 — `claim_delhi_birth_mcd_citizen_surface_behind_signup`: `basis` "mixed" is no longer supported → CORRECTION 1

Section 5: `observation` records what a source or interface directly shows, `inference` records a conclusion drawn from it, and `mixed` **must explain the boundary in `notes`**.

The claim text as it now stands is "MCD's public instructions direct the citizen to sign up on the portal with a preferably Aadhaar-linked mobile number." That is purely what the page displays; it contains no inferential component. Its notes record that the boundary was not crossed and that the claim was split, but they do not explain any observation/inference boundary — because the inference was moved out during the IND-91 part B split. The sibling `_2` carries the inference and correctly explains the boundary in its own notes ("the observation is that the public page offers signup and instructions only; the inference is that the citizen certificate surface lies past that boundary"), so `mixed` is right there and stale here.

Proposed: `/basis` `"mixed"` → `"observation"`. Grade B and status `partial` are unaffected; the claim continues to support no cell value.

### F8 — `claim_delhi_birth_mcd_charter_key_contacts_empty`: Grade B contradicts its own source and its four siblings → CORRECTION 2

Section 4 assigns **C** to "Archived, undated, or visibly outdated official material; state the date and limitation". The source `source_delhi_birth_mcd_citizen_charter` records "Visible date: none is shown" and states, in its own notes, "the document is undated, so its currency cannot be checked, **which is why claims resting on it are graded C**."

Four claims resting on that source are graded C and say so in their notes (`claim_delhi_birth_mcd_sla_one_week`, `claim_delhi_birth_mcd_sla_institutional_instant`, `claim_delhi_birth_mcd_institutional_processing`, `claim_delhi_birth_mcd_domiciliary_route`). `claim_delhi_birth_mcd_charter_key_contacts_empty` rests on the same undated document but is graded B. Section 4's B row for "direct current observation of a public official interface" cannot distinguish it, since the same observation route produced the four C-graded siblings. Section 4 also states that grades describe source strength, not convenience.

Proposed: `/evidenceGrade` `"B"` → `"C"`. The claim is not cited in any cell's `claimIds`, so no cell state depends on this; the `owner` note's use of it as a counter-observation is unaffected.

### F9 — `time` cell note asserts a qualifier whose claim is not in its `claimIds` → CORRECTION 3

The `time` note reads "7 days from the date of receipt of the application, **expressly for a birth that has already been registered**". That qualifier is asserted by `claim_delhi_birth_issue_within_seven_days_2`, which was split out of the 7-day claim precisely to carry the proviso. It is listed under `eligibility` but not under `time`, so the `time` cell states a claim-backed fact without listing its claim.

Section 9 requires a `stated` cell to record its `claimIds` and an actionable-value note; the qualifier is part of the actionable value, since it tells the citizen which applicants the 7-day figure applies to. Multi-cell listing is already the pattern in this sidecar (`claim_delhi_birth_collection_point` appears under both `owner` and `after-submission`), so nothing bars listing it twice.

Proposed: add `claim_delhi_birth_issue_within_seven_days_2` to `/cells/time/claimIds`. The state remains `stated` — the figure itself comes from `claim_delhi_birth_issue_within_seven_days`.

### F10 — `owner` cell lists a contact route for an office it separately says is not the case-holder → CORRECTION 4

Section 8 (`owner`) admits "a contact route for **that role**" — the role that holds or decides the case. `claim_delhi_birth_directorate_office_contact` gives the Directorate's office email and telephone. But `claim_delhi_birth_chief_registrar_not_issuer`, listed in the same cell, establishes that the Office of Chief Registrar (B&D) does not itself issue birth certificates. So the contact is a route to an office that expressly does not hold this case, and for this scenario it points away from the zone Registrar the cell is meant to identify — the very failure mode the negative routing claim warns about.

Two further signals that the listing is an artefact rather than a judgement: the cell note enumerates four items (zone Registrar designation, collection point, area-wise directory, Chief Registrar not the issuer) and does not mention the directorate contact at all; and the claim was created by the previous audit as an atomicity split out of `claim_delhi_birth_registrar_directory_published`, so it appears to have inherited that claim's cell membership.

Proposed: remove `claim_delhi_birth_directorate_office_contact` from `/cells/owner/claimIds`. The state remains `stated` on the designation tied to a jurisdiction rule plus the published area-wise directory. The claim stays in the ledger as `verified` Grade B institutional contact detail.

---

## Findings recorded without a correction

### F11 — `claim_delhi_birth_delivery_time_schedule` carries two durations and has no lint waiver

Section 8, first check, flags compound or list claims. The claim asserts "3 days for a new record **and** 7 days for an old manual record" — two separately checkable figures, and two different answers for two different citizens. It is cited in the `time` cell, so unlike the waived list claims it is load-bearing.

The manifest entry waives three comparable claims (`claim_delhi_birth_issuing_local_bodies`, `claim_delhi_birth_application_particulars`, `claim_delhi_birth_mcd_domiciliary_route`) on the reasoning that a single published list or row is one checkable fact. That reasoning reaches this claim too — it reports one row of one published time schedule — but no waiver names it. Section 8 states an unwaived finding blocks audit.

No ledger correction proposed: the honest remedies are either a manifest `lintWaivers` entry on the same reasoning already accepted for `claim_delhi_birth_application_particulars`, or a split into two claims with both added to `/cells/time/claimIds`. Choosing between them is a maintainer call, and the manifest is not an expectations or ledger record. Flagged for disposition.

### F12 — `claim_delhi_birth_mcd_citizen_surface_behind_signup_2` asserts more breadth than it cites

The claim text is a negative across "**any** reviewed public MCD page", but its `sourceIds` list only `source_delhi_birth_mcd_rbd_instructions`. A second MCD source exists in this ledger (`source_delhi_birth_mcd_citizen_charter`, whose notes record it was "found after the first audit run and added before re-audit"). Section 7 requires the citation to carry the claim.

No correction proposed. Narrowing the text to the page actually cited would be the safe fix, and adding the charter as a second source would be the other, but I cannot confirm from the ledger and sidecar text alone that the certificate search-and-download surface was looked for on the charter — and section 13 bars inventing evidence to make a record complete. The claim supports no cell value, so nothing downstream turns on it.

### F13 — the two Sub-Registrar designation claims are cited in no cell; checked and correct

`claim_delhi_birth_subregistrar_designation` (vaccinators) and `_2` (paramedical staff of health centres) are `verified` Grade C and are cited in no cell's `claimIds`, even though the first claim's notes argue relevance to the copy route because the FAQ directs the plain-paper application to the concerned area Registrar or Sub-Registrar.

That omission is correct. Section 8 (`owner`) says "A statutory designation or general agency name alone is `mentioned`" — a designation by staff category tells a citizen what a Sub-Registrar is, but not which office holds their case. The `owner` cell reaches `stated` on the zone-tied Registrar designation and the area-wise directory, and adding these would not strengthen it. They are correctly retained in the ledger and correctly left out of the grid.

### F14 — archive-snapshot rule: consistent documented deviation across all five sources

Section 11 requires an archive snapshot captured **at access time** for every public source used, and where capture fails, a recorded access date, failure, and limitation. All five sources record a pre-existing Wayback snapshot, state "no new capture was pushed from this run", and state the limitation that the snapshot predates the 2026-09-06 access date. This is documented rather than silent, and section 14 accepts "a Wayback snapshot or documented archival failure", but a not-attempted capture is not a failed capture. Flagged; no correction, since this is a run-level practice issue affecting every source uniformly rather than a defect in any one record.

### F15 — two borderline compound claims checked and judged atomic

`claim_delhi_birth_chief_registrar_not_issuer` ("does not itself issue ... and issues only certified copies of English-translated birth certificates") is one delimitation of a single office's issuing scope, the second half being a carve-out from the first, not an independent assertion. `claim_delhi_birth_mcd_zone_routing` ("must be applied to the zone where the event took place and ... an incorrect zone might lead to rejection") is one published instruction with its stated consequence. Both pass the section 8 atomicity check. No change.

### F16 — gate checks that pass

- **Citation gate (section 7).** Every non-`Unknown` claim carries at least one `sourceId`; the only claim with an empty `sourceIds` is `claim_delhi_birth_post_submission_surface_unknown`, which is Grade `Unknown` and so is permitted by both the gate and `schemas/ledger.json`'s conditional `minItems`. All five source URLs resolve to specific pages, forms or documents — none is a department homepage used as a specific citation, so no claim is downgraded on that ground.
- **Source dates (section 8, check 5).** The two DES pages carry `publishedAt` 2026-08-17 with a note naming the visible footer date. The three undated sources each state "no visible date" plus an explicit currency limitation. Clean.
- **Grades (section 4).** Grade C on all Chief Registrar charter claims is right — the document is undated and names the pre-2022 trifurcated corporations. Grade B on the DES FAQ, DES registration page and MCD instructions claims is right — current official agency pages and direct observation of a public official interface. The single defect is F8.
- **Basis (section 5).** All `observation` claims report what a source shows; the one `inference` claim (`claim_delhi_birth_post_submission_surface_unknown`) is correctly Grade `Unknown` and status `unknown`; the one correctly-`mixed` claim explains its boundary in notes. The single defect is F7.
- **Cell support status (section 8).** Every claim listed in every cell's `claimIds` is `verified` or `partial`. No `contested` or `unknown` claim supports any cell value.
- **Scenario tags and reference integrity (sections 2, 7).** Every claim carries `scenario_ind32_birth_copy_workflow` and no other scenario; no aliases. Every `sourceId` referenced by a claim, and every `claimId` referenced by the sidecar, resolves to an existing record. `primaryScenarioId` matches across manifest, ledger and sidecar.
- **Grid-only shape.** `nodes`, `edges`, `roadblocks` and `journeys` are empty and `pathNodeIds` is empty, consistent with the manifest's `mode: "grid-only"`. Section 6's `researchedNoSourceFound` rules are therefore not engaged: no node exists to carry a marker, so there is no unbacked marker to remove.
- **Safety (section 16).** The ledger records the portal signup wall as an uncrossed boundary, states no login was used and no personal data entered, and carries the disclaimer and `asOf` date in `meta`.
