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
