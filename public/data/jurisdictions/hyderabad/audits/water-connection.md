# Audit — Hyderabad new domestic water connection

- **Service:** `water-connection`
- **Jurisdiction:** Hyderabad, Telangana, India
- **Primary scenario:** `scenario_ind32_water_residential`
- **Audit date:** 2026-09-06
- **Benchmark version:** 0.1
- **Mode:** grid-only (no nodes, edges, roadblocks, journeys, or portal sidecar; their absence is not raised as a finding)

The sidecar presented all six cells as `stated`. One cell does not survive. Four claims carry a grade the protocol does not permit on the source cited, one claim is compound across two unrelated topics, and the rest of the ledger is sound. Fourteen corrections are proposed. No correction invents evidence; where a gap cannot be closed without new research it is recorded below as a limitation for the integrator rather than papered over.

---

## Findings

### F-01 — `time` cell rests on one column of a two-column table the ledger itself cannot resolve

**Severity:** blocking
**Record:** `expectation` `water-connection`, `/cells/time/state` (and `/cells/time/claimIds`, `/cells/time/searchedRoutes`, `/cells/time/note`)

**What the protocol requires.** Section 8 defines `time` as `stated` "when the evidence gives an actionable duration, deadline, processing period, or service-level target," and defines `stated` generally as a Grade A, B, or C claim that "gives a value a citizen can act on." The same section closes with a rule that governs this case directly: "a boundary statement or `Unknown` claim records a limitation, not a positive cell value." Section 5 forbids a conclusion drawn from a source being presented as what the source shows.

**What I observed.** `source_hyderabad_water_swc_sla` sets out an existing and a revised procedure side by side and, on the ledger's own account, "does not state which is in force." The ledger records both faithfully — `claim_hyderabad_water_sla_category_i_stages` (revised) and `claim_hyderabad_water_sla_existing_procedure_stages` (existing) — and then records `claim_hyderabad_water_which_sla_in_force_unknown`, an `Unknown` claim stating that which procedure governs on the access date "is not established by any reviewed public page." The `time` cell cites the revised claim alone and presents its figures as the actionable value.

The two columns are not variants of one answer. Payment of connection charges is 15 days under the revised procedure and 60 under the existing one; generation of the consumer account number is 5 days against 29. A citizen told "15 days" who is in fact governed by the existing procedure has been given a wrong number, not an incomplete one.

Selecting the revised column is an inference — the plausible one, that a column labelled "revised" superseded the one labelled "existing" — but it is precisely the inference the ledger declines to draw in `claim_hyderabad_water_which_sla_in_force_unknown`. The sidecar cannot rest a positive cell on an inference the ledger refuses. Nor does the document's own face support it: the SLA carries no visible date and is placed at 2020 only by file metadata, so "revised" is not anchored as current in 2026 either. The cell note discloses the split, but section 8's closing rule means a note cannot convert an `Unknown` into a cell value; disclosure is not cure.

**The distinction that decides this, and why it does not spread to `cost`.** Section 8 tolerates *incompleteness* in a `stated` cell — it says so expressly for `time`, requiring only that "when the figure covers only one stage, the cell note must say so." What it does not tolerate is *indeterminacy*: two published, mutually exclusive answers with the publisher silent on which is live. `cost` is incomplete — the line cost is an estimate on the schedule of rates and the deposit is unknowable before connection — but the board publishes one schedule, so the citizen has one answer that is right as far as it goes. `time` has two answers and no way to choose. That is the line, and `time` falls on the wrong side of it.

**Correction.** `/cells/time/state` `stated` → `mentioned`; `claimIds` extended to carry both procedures as topic-only support; `searchedRoutes` populated with the routes actually read; note rewritten as a search note. Under section 8 the topic is named and figures appear, but no figure is established as the one that applies.

---

### F-02 — Section 1's contradiction rule does not apply to two procedures printed in one document

**Severity:** note
**Records:** `claim_hyderabad_water_sla_category_i_stages`, `claim_hyderabad_water_sla_existing_procedure_stages`

**What the protocol requires.** Section 1 directs the integrator not to overwrite conflicting claims but to "retain both, cross-link them with `contradictsClaimIds`, and mark them `contested` until audited."

**What I observed.** Both claims are retained; neither carries a `contradictsClaimIds` link and both are `verified`. I asked whether that is a defect and conclude it is not, and I propose no correction.

The rule is aimed at two pieces of evidence that disagree about the same fact. Here there is one publisher, one document, and two procedures the document itself labels and distinguishes. Each claim accurately recites the column it names. As statements of what the SLA prints, they are both true and they do not conflict; asserting a contradiction between them would assert that the document contradicts itself, which it does not — it sets out a before and an after. `contested` would be wronger still: that status marks a claim whose evidence is disputed, and neither claim's evidence is in any doubt. The document plainly says both things.

The correct instrument for this defect is the one the ledger already reached for — an `Unknown` claim recording that the choice between the procedures is unestablished — combined with the cell state corrected at F-01. The researcher got the ledger right here and the sidecar wrong.

---

### F-03 — Charge table provenance: Grade B upheld

**Severity:** note
**Record:** `claim_hyderabad_water_category_i_charges`

**What the protocol requires.** Section 4 grades B "a current official procedure, form, service portal, circular, or agency page," and C "official but indirect, incomplete, archived, or potentially outdated material."

**What I observed.** The claim rests on `source_hyderabad_water_citizen_charter`, the Citizens Charter dated "May 2024" on its title page, and its notes record that the table is attributed to Managing Director's proceedings No.24/E1/97/2003 dated 30 January 2003. I tested whether that attribution pulls the claim to C and conclude it does not.

The cited source is the charter, not the 2003 proceedings, and the claim is worded as what the charter publishes. The charter is the board's own current, face-dated publication of its fee schedule; it prints the amounts rather than describing a rule held elsewhere. Grade C's "indirect" targets material that points at a rule instead of stating it — a press release, a summary, a general-site reference — which this is not. The 2003 attribution is provenance, showing where the figures derive their authority, and the board's decision to reprint them in a 2024 charter is affirmative evidence that it holds them out as current. Age of the underlying order is not, by itself, "potentially outdated material" when the publisher has republished the table two years before the access date.

Grade A is unavailable on this record because the 2003 proceedings are not cited as a source; a claim resting on the charter is correctly B. Two observations for the integrator rather than corrections: the charter states of itself that it is not a legal document for enforcement, which bears on legal force but not on the source's currency or officialness and so does not move the grade; and if a future pass obtains the 2003 proceedings directly, a Grade A claim becomes available.

---

### F-04 — Grade B on a claim resting solely on an undated 2018 file

**Severity:** correction
**Record:** `claim_hyderabad_water_occupancy_certificate_relief`, `/evidenceGrade` and `/notes`

**What the protocol requires.** Section 4: "C | Archived, undated, or visibly outdated official material; state the date and limitation."

**What I observed.** The claim's only source is `source_hyderabad_water_documents_list`, whose own notes say the file "carries no visible date on its face; the file metadata records a creation date of 2018-07-25, **so claims from it are graded C**." The claim is graded B. The ledger therefore contradicts its own source record.

The researcher applied this rule correctly to the parallel case — `source_hyderabad_water_swc_sla` is undated on its face and dated 2020 by metadata, and both claims resting on it are graded C with the rationale stated inline. The documents file was simply not given the same treatment. Downgraded to C, with the date and limitation stated on the claim to match the established pattern. The `documents` and `eligibility` cells both cite this claim; C supports `stated`, so no cell state changes.

---

### F-05 — Same defect on the document matrix

**Severity:** correction
**Record:** `claim_hyderabad_water_document_matrix_by_category`, `/evidenceGrade` and `/notes`

**What the protocol requires.** Section 4, C row, as at F-04.

**What I observed.** This claim also rests solely on `source_hyderabad_water_documents_list` and is also graded B, against the source record's own statement that claims from it are graded C. Downgraded to C with the limitation stated. The `documents` cell cites it; C supports `stated`, so the cell is unaffected.

---

### F-06 — The narrative document list is correctly Grade B

**Severity:** note
**Record:** `claim_hyderabad_water_document_list_narrative`

I checked this claim against F-04 and F-05 and it is distinguishable. It cites both `source_hyderabad_water_documents_list` and `source_hyderabad_water_citizen_charter`, and its notes record that "the same list appears in the board's standalone documents file and in annexure IV of the citizens charter." Because it is independently supported by the current, face-dated May 2024 charter, the undated 2018 file is corroboration rather than sole support, and Grade B is correct. No correction. This is the distinction that makes F-04 and F-05 the narrow findings they are rather than a blanket downgrade of everything touching that file.

---

### F-07 — Grade B on a claim resting on the department homepage

**Severity:** correction
**Record:** `claim_hyderabad_water_prospective_routes_published`, `/evidenceGrade` and `/notes`

**What the protocol requires.** Section 7 is categorical: "Citations must resolve to specific pages: a department homepage is a `General-site reference`, and claims resting on it are Grade C, never presented as a specific source." Section 4 repeats it: "C | A department homepage or general-site reference; never use it as a specific citation."

**What I observed.** The claim's only source is `source_hyderabad_water_board_site`, whose URL is `https://hyderabadwater.gov.in/en` — the board's homepage. The claim is graded B.

I weighed the competing rule. Section 4's B row covers "direct current observation of a public official interface," and section 1 directs that such observation be graded B rather than E. But that provision fixes observation against citizen report and against inference; it does not displace the homepage rule, which section 7 states without exception and section 4 restates in the C row. The homepage rule exists because a homepage is a moving target — what its navigation shows today is not a stable citation. This claim is about exactly that: the list of route titles in the board's site navigation on one date. It is the paradigm case the rule was written for, not an exception to it.

Downgraded to C. The `after-submission` cell cites this claim; C supports `stated`, so the cell is unaffected. The researcher did understand the distinction — `source_hyderabad_water_status_route` is a specific page URL and its claim is properly B — so this is an oversight on two records, not a misunderstanding.

---

### F-08 — Same defect on the customer care contacts

**Severity:** correction
**Record:** `claim_hyderabad_water_customer_care_contacts`, `/evidenceGrade` and `/notes`

**What the protocol requires.** Section 7 and section 4's C row, as at F-07.

**What I observed.** The claim rests solely on `source_hyderabad_water_board_site` (the homepage) and is graded B. Its own text — contacts published "on every page of its site" — is a general-site assertion by construction. Downgraded to C with the rationale stated. The `owner` cell cites it; C supports `stated`, and as recorded at F-13 the cell does not depend on this claim in any event.

---

### F-09 — Compound claim spanning after-submission surfaces and pre-submission help resources

**Severity:** correction
**Records:** `claim_hyderabad_water_status_tracking_and_sms` `/text`; new claim `claim_hyderabad_water_application_help_resources`

**What the protocol requires.** Section 1: "one claim asserts one checkable thing." Section 8 lint item 1 flags compound or list claims, and section 13 permits the auditor to split them. Section 8 also holds that "a step at or before submission — including registration, document presentation, payment, appointment booking, or the act of submission — is not after-submission evidence."

**What I observed.** The claim asserts four things across two unrelated topics: that application status can be tracked on the website; that SMS messages are sent to the applicant; that a user manual for filling the online application is on the website; and that there is a help desk at the head office with kiosks at cash counters. The first two are post-submission surfaces and are the claim's contribution to the `after-submission` cell. The last two are help resources available at or before submission and, under section 8, are not after-submission evidence at all.

Split: the original claim is trimmed to the tracking and SMS assertions, and the help resources move to a new Grade B claim on the charter that supports no expectation cell. The `after-submission` cell note already draws only on the tracking and SMS content, so it remains accurate and needs no amendment.

---

### F-10 — Compound claims accepted, with one overlap noted

**Severity:** note
**Records:** `claim_hyderabad_water_sanction_conditions`, `claim_hyderabad_water_meter_obligation`, `claim_hyderabad_water_category_i_charges`, `claim_hyderabad_water_other_amounts_payable`, `claim_hyderabad_water_document_list_narrative`

Several claims recite multi-row tables or multi-item lists, and I tested each against section 1's atomicity rule. The charge bands, the further amounts payable, and the enclosure list are each a single published schedule or list; reciting one faithfully as one claim asserts one checkable thing, and splitting them would fragment a unit the source presents as a unit. Accepted.

`claim_hyderabad_water_sanction_conditions` is the closest call. It bundles four rules — sanction subject to technical feasibility and the 1989 Act, that sanction confers no right or evidence of ownership, the rainwater harvesting structure, and the sump and meter chamber — of which the ownership disclaimer is a statement of legal effect with little in common with the construction preconditions. I accept it because all four are published together as the conditions attached to sanction and release, and the `eligibility` cell uses them as that single bundle; the claim misleads no one. It is recorded here so the integrator can see the judgement was made rather than missed. This is a weaker case for splitting than F-09, where the two halves fell on opposite sides of an express section 8 boundary.

Separately, the meter chamber requirement appears in both `claim_hyderabad_water_sanction_conditions` and `claim_hyderabad_water_meter_obligation`. Both statements are accurate and the duplication distorts nothing, so I do not propose a merge.

---

### F-11 — Scope discipline verified: only in-scope rows recited

**Severity:** note
**Records:** `claim_hyderabad_water_category_i_charges`, `claim_hyderabad_water_document_matrix_by_category`, `claim_hyderabad_water_other_amounts_payable`

The scenario excludes bulk and high-rise connections, commercial use, regularisation, name transfer, tanker supply and second connections. The charge table, the document matrix and the sanction rules all come from tables covering several categories at once, so I checked each recitation against the scenario boundary.

The charge claim recites the Category-1 bands only, and its notes record that Category-1 is defined in the same annexure as individual connections other than those in categories II and III — this scenario's case. The matrix claim recites the Category I row only, and its notes state that the matrix also carries Category II, Category III, below-poverty-line and second-connection rows "which are outside this scenario." The further-amounts claim expressly excludes source augmentation charges as bulk-only. No out-of-scope row has been recited as though it applied here. This is done well and I record it as such.

---

### F-12 — The 20mm-and-above threshold is in scope, applied consistently

**Severity:** note
**Records:** `claim_hyderabad_water_processing_fee`, `claim_hyderabad_water_swc_sanctions_and_address`

Both claims carry a 20mm-and-above threshold: the Rs. 2,000 processing fee, and sanction at the Single Window Cell. I considered whether these fall outside a scenario centred on a domestic connection, which the SLA treats at 15mm.

They do not. A single-family dwelling can take a 20mm connection; the exclusions in the scenario summary are bulk, high-rise, commercial, regularisation, transfer and tanker supply, none of which is a function of a 20mm service pipe. Both claims state the threshold conditionally and neither asserts that this scenario's applicant falls above it, so a citizen is not misled either way. The treatment is consistent across the two claims, which matters: it would be incoherent to admit 20mm for the fee and exclude it for the sanctioning office.

One consequence for the integrator: because `claim_hyderabad_water_swc_sanctions_and_address` speaks to 20mm and above, the reviewed evidence does not name the sanctioning office for a 15mm connection through that claim. The `owner` cell does not fail on this — see F-13 — but the gap is real and worth closing in a later pass.

---

### F-13 — `owner` upheld on the jurisdiction rule, not on the head-office address

**Severity:** note
**Record:** `expectation` `water-connection`, `/cells/owner`

Section 8 makes `owner` `stated` where the evidence lets a citizen identify the office or role that holds the case, "including a specific office list, a designation tied to a jurisdiction rule, or a contact route for that role." I tested the cell in both directions.

It holds, but on `claim_hyderabad_water_circle_and_division_sanction` and `claim_hyderabad_water_jurisdiction_annexure` rather than on the head-office address. The first states that circle offices and divisional offices sanction new connections within their respective jurisdictions — a designation tied to a jurisdiction rule, in the section 8 words, and one that covers connections generally rather than only 20mm and above. The second publishes an annexure mapping divisions and circles to the localities, municipalities and constituencies they cover — a specific office list that lets a citizen move from an address to the office. Together those clear the bar without needing the Single Window Cell claim, which is why the F-12 gap does not sink the cell.

`claim_hyderabad_water_customer_care_contacts` is a general utility helpline rather than a contact route for the deciding role, so it carries little weight here; the cell would stand without it, and its downgrade at F-08 therefore changes nothing. I also considered whether the Single Window Cell allocation conflicts with the circle and division allocation. It does not: head office handling larger connections while circles and divisions handle their areas is a published division of labour, not a contradiction, and no cross-link is warranted.

---

### F-14 — `basis` checked: no claim asserts what a route returns

**Severity:** note
**Records:** `claim_hyderabad_water_status_route_published`, `claim_hyderabad_water_prospective_routes_published`, `claim_hyderabad_water_status_tracking_and_sms`, `claim_hyderabad_water_which_sla_in_force_unknown`, `claim_hyderabad_water_deposit_amount_unknown`

Section 5 requires `basis` to separate what a source directly shows from a conclusion drawn from it, and section 1 warns against inferring a working journey from published requirements. I checked every claim touching a route and found no overclaim.

`claim_hyderabad_water_status_route_published` asserts that the route is published and reachable without login, and its notes state that "the route and its title were observed; no application reference was entered, so nothing is claimed about what it returns." Reachability without authenticating is directly observed when the page renders, so `observation` is correct, and the claim stops exactly where the observation stops. `claim_hyderabad_water_prospective_routes_published` asserts only that routes bearing given titles are published, with "none was exercised" recorded. `claim_hyderabad_water_status_tracking_and_sms` is framed throughout as what the charter states, not as verified system behaviour.

The two `Unknown` claims are both `inference` with status `unknown`, which is right: each is a conclusion about what the reviewed evidence fails to establish, not something a page shows. Both are correctly excluded from every cell, consistent with section 8's rule that an `Unknown` claim records a limitation rather than a positive cell value — the sidecar observed that rule for these two claims while breaching its spirit at `time`, which is the F-01 finding.

I also confirmed the ledger carries no boundary claim and needs none: the routes it rests on are public, no login was crossed, and the bot-detection challenge was read around in a browser rather than evaded, with no CAPTCHA solved or attempted.

---

### F-15 — Source lacking a visible-date note

**Severity:** note
**Record:** `source_hyderabad_water_status_route`

Section 8 lint item 5 requires source-date quality: `publishedAt` missing without a visible-date note is a finding. This source has no `publishedAt`, and its notes record agency naming, the read-only nature of the visit and the archive position, but do not state whether the page carries a visible date or last-updated stamp.

I propose no correction, because supplying either a date or a statement that none is displayed would require observing the page, and I will not invent evidence to complete a record. Recorded as a limitation for the integrator: either add a visible-date note or a `publishedAt` on the next pass. The other four sources satisfy this rule — two carry `publishedAt` from a visible date, and the two undated PDFs carry explicit no-visible-date notes with the metadata date and the resulting grade limitation.

---

### F-16 — Archive coverage: availability queried, capture not attempted

**Severity:** note
**Records:** all five source records

Section 11 requires an archive snapshot to be captured at access time for every public source used, and provides that if capture fails the access date, the failure and a limitation are recorded.

Four of the five sources have no snapshot, and each records the access date, the failure and a limitation, retaining the original official URL — the fallback is properly executed and no homepage has been substituted for a dead specific page. But each note also states that "the Wayback availability API returned no snapshot" and that "no new capture was pushed from this run." Querying availability establishes that no snapshot exists; it is not an attempted capture. Section 11's duty is affirmative, so what is recorded is a capture not attempted rather than a capture that failed.

I propose no correction: pushing captures is research work outside an audit's remit, and I will not restate the record as a failure when the note honestly says a capture was never pushed. Recorded as a limitation for the integrator. The `meta.disclaimer` already surfaces this to readers, as it does the two-procedure problem; `meta` is not correctable through this contract, and after F-01 the disclaimer's account of the SLA split reads consistently with the corrected `time` cell, so no disclaimer change is needed.

---

### F-17 — Structural checks clean

**Severity:** note

Reference integrity: every `claimId` in all six sidecar cells resolves to a claim in the ledger, every `sourceId` on every claim resolves to a source record, and all five sources are used by at least one claim. All record IDs match the schema's ID pattern. The ledger is schema-valid on inspection: required fields present throughout, enums respected, and the two `Unknown` claims correctly carry empty `sourceIds`, which the schema permits only because their grade is `Unknown`.

Dates and jurisdiction: every date is ISO `YYYY-MM-DD`; every `accessedAt` is 2026-09-06 and matches `meta.asOf`; every claim and every source note carries the jurisdiction string "Hyderabad, Telangana, India", matching `meta.jurisdiction`. Recording the charter's title-page "May 2024" as `publishedAt` 2024-05-01 is a sound convention for a month-only date and is disclosed in the source note.

Scenario tags: every claim is tagged to `scenario_ind32_water_residential`, which matches the manifest's `primaryScenarioId`; no aliases and no undeclared scenario IDs appear.

Unused claims: `claim_hyderabad_water_online_application_route` and `claim_hyderabad_water_escalation_columns` support no cell, correctly. The first describes applying, presenting documents to the inspecting officer and paying on intimation — all at or before submission, and so barred from `after-submission` by section 8. The second is kept out of `owner` on the strength of its own note, which records that the escalation column's reproduced rows are maintenance complaints rather than a new connection. Declining to use an escalation column that does not cover this service is the right call and I record it as good discipline.

`cost`, `documents` and `eligibility` upheld: `cost` gives concrete amounts and a banded schedule, and its incompleteness is disclosed and carried as a separate `Unknown` claim rather than hidden (see the distinction drawn at F-01). `documents` names concrete documents with a requirement to submit them. `eligibility` clears the bar chiefly on the occupancy-certificate relief, a rule keyed to measurable plot area and building height that decides which document route applies, supported by the pre-release construction preconditions; the feasibility condition alone would have been closer to `mentioned`.

---

## Verdict

Cell states accepted: **cost `stated`; documents `stated`; eligibility `stated`; time `mentioned`; owner `stated`; after-submission `stated` — 5 of 6 stated.**

Corrections proposed: 14 (1 blocking cell-state change expressed across 4 sidecar fields, 4 evidence-grade downgrades with 4 matching note amendments, and 1 compound-claim split across 2 records). Unresolved limitations for the integrator: the visible-date note missing on `source_hyderabad_water_status_route` (F-15); archive captures queried but never pushed for four sources (F-16); and the sanctioning office for a 15mm connection not named by the reviewed evidence (F-12).


## Re-audit — 2026-09-06 (IND-91 part B)

A fresh isolated auditor re-audited this row after pre-audit lint remediation, on the section 12 inputs only. 5 corrections were proposed and 5 applied; none unapplied.

(no findings file written)
