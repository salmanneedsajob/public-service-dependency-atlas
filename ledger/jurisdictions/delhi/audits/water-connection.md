# Audit — Delhi new domestic water connection

- **Service:** water-connection
- **Jurisdiction:** Delhi, NCT of Delhi, India
- **Primary scenario:** `scenario_ind32_water_residential` — the individual owner of a built residential property with no connection applies for a new domestic supply; bulk and high-rise, commercial, regularisation of unauthorised connections, mutation and tanker supply are excluded
- **Audit date:** 2026-09-06
- **Benchmark version:** 0.1
- **Mode:** grid-only (no nodes, edges, roadblocks, journeys or portal sidecar; their absence is not raised as a finding)

Severity key: **blocking** — nothing ships until resolved; **correction** — a structured correction is proposed in `water-connection.corrections.json`; **note** — recorded observation, no correction proposed.

---

## Findings

### F1 — correction — six claims resting on the citizens charter are graded B where section 4 requires C

**Records:** `claim_delhi_water_simplified_document_list`, `claim_delhi_water_doorstep_fee`, `claim_delhi_water_charter_delivery_time_fifteen_days`, `claim_delhi_water_doorstep_timeframe`, `claim_delhi_water_officer_responsible_zro`, `claim_delhi_water_portal_tracking_facility_listed` (source `source_delhi_water_djb_citizens_charter`)

**What the protocol requires:** Section 4 grades at C "Official but indirect, incomplete, archived, or potentially outdated material" and, separately, "Archived, undated, or visibly outdated official material; state the date and limitation." Section 4 closes with the rule that grades describe source strength, not convenience.

**What I observed:** The source record itself concedes the two facts that decide this. The PDF "carries no visible issue or revision date", and its own text "refers to a Board resolution dated 26 October 2021 and to rainwater-harvesting timelines extended to 30 September 2022, so its currency is not established by the document." Both C triggers are therefore met on the ledger's own record: the material is undated, and it is visibly outdated in the specific sense that its internal reference points are a five-year-old Board resolution and a timeline that expired four years before the access date. The hosting page's "Last Updated: 03/09/2026" footer dates the page, not the file, and the researcher correctly declined to treat it as dating the document. The charter also states of itself that it is not a legal document for enforcement, which is a further indirectness signal. Grade B, which section 4 reserves for a *current* official procedure, form, portal, circular or agency page, is not available for this file.

**Effect on cells:** None of the six cells collapses. Section 8 admits a Grade A, B **or** C claim as support for `stated`, so the downgrade changes the recorded strength of the evidence without changing any cell state. It does concentrate a real weakness in `time`: after this correction, both figures that constitute the *service-level target* (15 days in the charter's service table, 15 days on the doorstep route) rest on C material, and the only B-grade figure in that cell — `claim_delhi_water_demand_payment_deadline` — is a deadline binding on the applicant, not a commitment by the Board. The rewritten `time` note (F6) records this. `owner` and `after-submission` each retain independent B-grade support (`claim_delhi_water_zro_office_directory_published` and `claim_delhi_water_zro_approves_sanction`; `claim_delhi_water_public_status_tracking_route`), and `documents` and `cost` each retain B-grade support from the FAQ and the observed form.

The limitation itself is already stated in `meta.disclaimer` and in the source notes, so section 8 lint item 5 is satisfied on the limitation limb; only the grade is wrong.

### F2 — note — the FAQ, form, status route and contact directory are correctly retained at B

**Records:** `source_delhi_water_djb_faq`, `source_delhi_water_djb_new_connection_form`, `source_delhi_water_djb_track_status`, `source_delhi_water_djb_contact_directory`

I tested whether F1's reasoning generalises, since three of these four also record no visible date. It does not, and the distinction is worth stating because it is the line the correction set depends on. Section 4's B row expressly covers "a current official procedure, form, service portal, circular, or agency page, including direct current observation of a public official interface", and a second B row covers "an observed current official form"; section 8 lint item 4 makes grading an observed current official form at C a lint failure. The FAQ, the new-connection form and the status route were read live on the portal on the access date, which is what makes them current; none of them carries internal content that dates itself to an expired period. The contact directory is a static file with no visible issue date, but likewise carries nothing that marks it as superseded. What separates the charter is not undatedness alone but undatedness *plus* internal text whose own reference points have expired. These four stay at B.

### F3 — correction — the status-route claim asserts, as observation, return content that was never observed

**Record:** `claim_delhi_water_public_status_tracking_route`

**What the protocol requires:** Section 5 keeps `basis` separate from grade — `observation` records what a source or interface directly shows, `inference` records a conclusion drawn from it, `mixed` must explain the boundary in `notes`, and a source grade does not turn an inference into an observation. Section 10 requires that case-data-bound surfaces "remain unknown rather than inferred". Section 8 lint item 6 targets overclaims across an authentication or other boundary.

**What I observed:** The claim is recorded `basis: observation`, `status: verified`, and its text asserts that the route "returns the applicant's details, the application status, and a dated list of actions performed with remarks." Its own notes then concede the opposite: "The route's own field labels were observed; no reference number was entered and no case data was retrieved." What was directly observed is the route's existence, its public reachability without login, and that it accepts an application reference number for a new connection. What it renders on submission sits behind a case-data boundary this run correctly did not cross, so the return-content half is an inference from the page's labels. That is precisely the `mixed` case, and section 5 requires the boundary be explained in `notes` — which it already is, so the notes need no change. `status` is likewise overstated at `verified`; `partial` is the accurate record.

**Effect on the cell:** `after-submission` survives. Section 8 admits `partial` claims as support for `stated`, and the part of the claim that carries the cell is the directly observed part: a public, reachable status page that takes a new-connection reference number is a "status page, tracker" in the definition's own terms, and it is actionable by the citizen after submitting. The cell would not survive on the inferred half alone.

### F4 — correction — a claim in the `owner` cell compounds two jurisdiction rules for two different routes

**Record:** `claim_delhi_water_zro_approves_sanction`; new record `claim_delhi_water_executive_engineer_scope`

**What the protocol requires:** Section 1 — "one claim asserts one checkable thing". Section 8 lint item 1 checks for compound or list claims. Section 13 permits the auditor to split compound claims.

**What I observed:** The claim asserts both that a new connection is sanctioned subject to the approval of the ZRO or competent authority — the in-scope residential rule that the `owner` cell relies on — and that technical feasibility assessment and sanction of a **commercial or bulk connection** fall to the Executive Engineer concerned. Those are two different decision-makers for two different service routes, one of which the primary scenario expressly excludes, joined only by "and". The second half is worth keeping: it is route-selection evidence that tells a citizen the residential route is the one that applies to them. But it should be a claim in its own right, not a rider inside the claim that scores `owner`.

The correction narrows `/text` to the in-scope rule, updates `/notes` which would otherwise reference a half that is no longer there, and adds `claim_delhi_water_executive_engineer_scope` carrying the excluded-route sentence verbatim with the same source, grade and basis. No evidence is lost and none is invented. The new claim is tagged to the primary scenario, as section 2 requires every claim to be, and its notes record that it is deliberately not cited by the `owner` cell, which scores the residential route.

### F5 — correction — the `cost` cell note asserts evidence that no claim in the ledger records

**Record:** expectation `water-connection`, `/cells/cost/note`

**What the protocol requires:** Section 9 — a `stated` cell writes its state, `claimIds`, and an actionable-value note. Section 7 — every non-`Unknown` claim needs at least one source, and citations must resolve to specific pages. Section 13 — the auditor may not invent evidence to make a record complete, and by the same standard a cell note may not carry evidence the ledger does not hold.

**What I observed:** The note's closing sentence reads: "The published total is not exhaustive: beyond 5 metres the applicant bears the contractor's cost, which the same route says is not billed by the Board." That is a substantive evidential assertion about what the FAQ says, attributed to "the same route", and **no claim in this ledger records it**. `claim_delhi_water_domestic_charges_table` stops at "where the distance from the property to the DJB network is up to 5 metres"; nothing else in the ledger touches beyond-5-metre costs, contractors, or what the Board does and does not bill. The note is smuggling an uncited finding into the sidecar through prose. The underlying observation — that the schedule is not established as exhaustive — is legitimate and should stay, but as a stated limitation about the reviewed evidence, not as an assertion about what a source says.

The rewrite also tightens two things I tested while I was in the cell. First, `claim_delhi_water_development_charges_unauthorised_colonies` (Rs. 45,000 / Rs. 1,00,000) and `claim_delhi_water_doorstep_fee` (Rs. 50) are route-specific, not amounts the general-case scoped applicant pays: the first turns on the colony's regularisation status and the second on choosing the optional doorstep route. Both are correctly in the cell — the scenario excludes regularisation of an unauthorised *connection*, not applicants living in an unauthorised regularised *colony*, and the ledger's own claim note draws that distinction correctly — but the note should not read as though they stack for every applicant. Second, the FAQ yields two separate Rs. 10 amounts, an "application fee for water" in the charges table and a Rs. 10 form-and-processing charge in `claim_delhi_water_application_form_fee`, and the reviewed evidence does not establish whether these are the same charge. I propose no correction on that point — resolving it would require re-reading the source, and I will not guess — but the rewritten note records it.

**Effect on the cell:** `cost` stays `stated`. Section 8 asks for "an amount a citizen pays or an actionable fee schedule" and does not require exhaustiveness; the FAQ's domestic table is a line-by-line schedule of amounts, in this scenario's category.

### F6 — correction — the `time` cell note likewise asserts evidence no claim records

**Record:** expectation `water-connection`, `/cells/time/note`

**What the protocol requires:** Section 8 — for `time`, "when the figure covers only one stage, the cell note must say so." Section 9 and section 13 as in F5.

**What I observed:** The one-stage disclosure requirement is met — the note does say the 15-day figure covers sanction, which is the point the cell most needed to concede, and that is properly supported: `claim_delhi_water_doorstep_timeframe` ties the 15 days to "sanction of a new water or sewer connection", and `claim_delhi_water_demand_payment_deadline` shows that a further stage, a demand raised by the ZRO office, follows sanction. The defect is in the same sentence's continuation: "no figure is published for the physical installation that follows, which the same evidence says is executed by a licensed plumber at the applicant's cost." No claim in this ledger records a licensed plumber, an installation stage, or who bears its cost. As in F5, an uncited assertion is doing work in the sidecar.

A second, smaller inaccuracy: the note says the 15 days is "named against the responsible officer in the charter's service table". The ledger holds a claim that the charter names the ZRO as responsible officer and a claim that the charter's service table gives 15 days, but nothing establishes that the two appear in the same row. The rewrite drops the assertion.

The rewritten note keeps the one-stage disclosure section 8 demands, states the post-sanction gap as a limitation on the reviewed evidence rather than as a fact about a plumber, keeps the distinction between the Board's service target and the applicant's own fifteen-day payment deadline, and records the F1 grade position.

**Effect on the cell:** `time` stays `stated`. A published 15-day delivery time in a charter's table of services is "an actionable duration, deadline, processing period, or service-level target" under section 8, and the one-stage condition the definition attaches is satisfied by the note.

### F7 — note — the `documents` cell was tested against the scenario scope and holds

**Record:** expectation `water-connection`, `/cells/documents`

I pressed hardest here. `claim_delhi_water_simplified_document_list` — the enumerated list of voter ID, ration card, passport, PAN, driving licence, Aadhaar, bank passbook or government photo ID, plus three months' paid electricity bills and an undertaking — is written by the charter for "unauthorised or regularised colonies, urban and rural villages and slum katras". It is not the list for a scoped applicant whose property sits outside those categories, and if the cell rested on it alone I would have scored the cell down. It does not. The claim's own note and the cell note both state the scoping in terms, which is the disclosure the protocol wants, and the list is legitimately in the cell because a scoped applicant in a regularised colony is inside this scenario.

For the general case the cell stands on two other claims. `claim_delhi_water_form_photo_and_id_upload` records a concrete document — a passport-size photograph, as an image file under 1 MB — with an explicit requirement to upload it, observed on the current public form, applying to any online applicant including this one; that satisfies section 8's second limb outright ("names a concrete document with a requirement to submit, provide, upload, produce, or attach it"). `claim_delhi_water_identity_and_ownership_documents` gives a proof of identity document and a property ownership document as a condition of sanction. The second is a document class rather than a named instrument, which puts it near the line, but section 8's `mentioned` counterexample is "a reference to documents without telling the citizen what is required", and the FAQ does tell the citizen what is required. `stated` accepted.

### F8 — note — the `after-submission` cell was tested against section 8's exclusion and the ledger's own exclusions are correct

**Record:** expectation `water-connection`, `/cells/after-submission`

Section 8 disqualifies "a step at or before submission — including registration, document presentation, payment, appointment booking, or the act of submission". Three claims that could have been wrongly recruited are correctly kept out of the cell. `claim_delhi_water_application_submission_routes` describes where an application can be lodged, and its own note says so explicitly: "A step at submission, not after it; recorded for the route, not for the after-submission cell." `claim_delhi_water_registered_consumer_boundary` is a boundary statement, recorded `partial`/`mixed` with the observation-inference boundary explained, and section 8's rule that "a boundary statement or `Unknown` claim records a limitation, not a positive cell value" is honoured — it appears in no cell. `claim_delhi_water_sanction_outcome_notice_unknown` is graded `Unknown` with `status: unknown`, empty `sourceIds` (which the ledger schema permits only for `Unknown`, correctly), and is likewise cited by no cell.

What carries the cell is a genuine post-submission surface, subject to F3. The route was read and never queried; that limits what may be claimed about its output, which F3 corrects, but it does not make the surface less visible or less actionable to a citizen holding a reference number. `stated` accepted.

### F9 — note — two source records omit a visible-date statement (section 8 lint item 5 residue)

**Records:** `source_delhi_water_djb_new_connection_form`, `source_delhi_water_djb_track_status`

Lint item 5 checks "missing `publishedAt` without a visible-date note". No source in this ledger carries `publishedAt`. Three of the five compensate with an explicit statement in `notes` — the FAQ ("shows no visible last-updated or version date"), the charter (at length), the contact directory ("shows no visible issue date"). The form and the status-route records say only that they were observed and read-only; neither states whether the page displayed a version or last-updated date. No correction is proposed: supplying the answer would require observing the pages, and inventing either answer to close a lint item is exactly what section 13 forbids. It affects no cell state. Recorded for the integrator to close by re-observation.

### F10 — note — archive snapshots predate the access date by seven to fourteen months

**Records:** all five sources

Section 11 requires an archive snapshot captured "at access time" and, where capture fails, the access date, the failure and a limitation. The charter handles failure exactly right: the availability API returned nothing, the original official URL is retained, no substitute homepage was used, and the failure is recorded as a limitation — section 11's requirement met in full. The other four point to pre-existing Wayback snapshots dated 2025-07-04, 2025-08-09, 2025-10-10 and 2026-02-15, each recording "no new capture was pushed from this run". Those snapshots evidence the pages as they stood seven to fourteen months before the access date, not as they were read on 2026-09-06, so if a link later dies the ledger cannot point to a copy of what was actually observed. Section 14's definition of done asks for "a Wayback snapshot or documented archival failure", which is satisfied on the letter, so this is recorded as a note rather than a correction. It is a durability weakness in the run, not a defect in any cell.

### F11 — note — login-boundary handling is correct and no cell rests past a boundary

Lint item 6 targets overclaims across a login boundary. This ledger is clean on that count and unusually explicit about it. `claim_delhi_water_registered_consumer_boundary` records the FAQ's own list of registered-consumer-only functions, is graded `partial` with `basis: mixed`, explains in `notes` which half is observation and which is inference as section 5 requires, and is cited by no cell. The form and the status route are both recorded as reachable without login, which is what makes the `documents` and `after-submission` evidence admissible without crossing anything. The one boundary the run did cross the line on is a case-data boundary, not an authentication one, and that is F3.

### F12 — note — citation gate, dates, jurisdiction, scenario tags and reference integrity are green

Section 7: all twenty-two non-`Unknown` claims carry at least one `sourceId`, and the single `Unknown` claim carries none, as the schema requires. All five source URLs resolve to specific pages or files — a FAQ page, a charter PDF, a form page, a status route, a directory PDF. None is a department homepage used as a specific citation; the agency record's `officialUrl` is a portal root but is an agency record, not a claim citation. All dates are ISO and every `accessedAt` is 2026-09-06, matching `meta.asOf` and the audit date. Every claim's `jurisdiction` string is "Delhi, NCT of Delhi, India", identical to `meta.jurisdiction` and to the manifest, and every source repeats it in `notes` with the agency naming displayed on the access date. All twenty-three claims are tagged to `scenario_ind32_water_residential` and to nothing else; that is the manifest's `primaryScenarioId`, the scenario record's `id` matches, no alias appears. Every `claimId` in all six sidecar cells resolves to a claim that exists — twenty distinct claims cited across the six cells with no repeats — and the three uncited claims are the three that section 8 requires be uncited (F8). `contradictsClaimIds` is empty throughout, consistent with a ledger holding no contradictions; I found none the integrator should have linked.

### F13 — note — one claim ID names content its text does not carry

**Record:** `claim_delhi_water_form_photo_and_id_upload`

The ID promises a photo *and ID* upload; the text covers only the passport-size photograph. Section 1 is explicit that a published record ID is reused and that content changes, not identity, so no correction is proposed. Recorded so a later reader does not assume the form's ID-upload requirement is evidenced here — it is not.

### F14 — note — the remaining multi-part claims were tested for atomicity and accepted

Having split one claim in F4, I state the standard I applied so the treatment is consistent rather than arbitrary. A claim asserts one checkable thing when it states one rule together with its qualifiers and carve-outs. On that standard `claim_delhi_water_who_can_apply` is one applicability rule with a geographic carve-out; `claim_delhi_water_completed_authorised_construction` is one rule about the state of the premises stated with its converse; `claim_delhi_water_one_connection_per_dwelling` is one allocation rule with its height limit; and `claim_delhi_water_domestic_charges_table` is one observation of one published table, which section 6's preference for "a small number of precise claims over narrative summaries" positively favours over seven fragments. `claim_delhi_water_zro_approves_sanction` failed the standard because its two halves name different decision-makers for different service routes, one of them expressly excluded from this scenario — different subjects, not a rule and its qualifier.

### F15 — note — grid-only mode and explicit zeros

`nodes`, `edges`, `roadblocks` and `journeys` are all empty and there is no portal sidecar, which is legitimate in grid-only mode and is not raised. Consequently sections 6 and 10 have nothing to bite on: there are no `researchedNoSourceFound` markers to verify against public-route evidence, and no route observations to check. `scenario.pathNodeIds` is correctly empty and `scenario.status` is `partial`. Section 3 has no application here — no cell rests on an explicit zero. The ledger is schema-valid against `schemas/ledger.json` as it stands, and remains so after the proposed corrections.

---

## Verdict

The unusual all-`stated` result survives audit, but not untouched: the evidence behind it is weaker in two places than the ledger recorded, and the sidecar was carrying two findings that no claim supports. Six claims drop from B to C, the status-route claim drops from verified/observation to partial/mixed, one compound claim is split, and two cell notes are rewritten to remove uncited assertions and to state the gaps as limitations. None of that moves a cell, because section 8 admits Grade C evidence and `partial` claims as support for `stated`, and because each cell retains support that was directly observed within the scenario's scope.

**Accepted cell states: cost `stated`; documents `stated`; eligibility `stated`; time `stated`; owner `stated`; after-submission `stated` — 6 of 6 stated.**
