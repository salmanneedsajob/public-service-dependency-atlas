# Audit: Chennai new domestic water connection

- **Service:** water-connection
- **Jurisdiction:** Chennai, Tamil Nadu, India
- **Primary scenario:** `scenario_ind32_water_residential` — the individual owner of a built residential property with no connection applies for a new domestic supply. Bulk or high-rise, commercial, regularisation of an unauthorised connection, name transfer and tanker supply are excluded.
- **Audit date:** 2026-09-06
- **Benchmark version:** 0.1
- **Mode:** grid-only. The ledger legitimately holds no nodes, edges, roadblocks or journeys and there is no portal sidecar; their absence is not raised as a finding, and sections 6 and 10 are not exercised.
- **Ledger:** `ledger/jurisdictions/chennai/water-connection.json` — 1 agency, 1 scenario, 5 sources, 23 claims.
- **Sidecar:** `ledger/jurisdictions/chennai/expectations/water-connection.json` — six cells, all authored `stated`.

---

## Findings

### F-01 — note — `claim_chennai_water_connection_charge_table`, `claim_chennai_water_meter_testing_charges`, cell `cost`

**Required.** Section 8: `cost` is `stated` "when the evidence gives an amount a citizen pays **or an actionable fee schedule**"; it is `mentioned` where a fee is "described only as prescribed", where there is "a payment step without an amount", or for "a penalty payable by the agency".

**Observed.** The cited evidence is a table of rupee amounts banded by dwelling-unit area (Rs. 100 water and Rs. 100 sewer up to 500 sq ft; Rs. 5,000 and Rs. 5,000 up to 100 sq m; Rs. 7,500 and Rs. 7,500 above that) plus meter-testing charges of Rs. 100 to Rs. 500 by equivalent dwelling units. I tested the sidecar's `stated` in both directions and accept it. None of the three `mentioned` triggers is present: the fee is not merely "prescribed", the amounts are printed, and no penalty on the agency is involved. That the applicant must locate their own band is what a fee schedule is; section 8 lists "an actionable fee schedule" as an independent `stated` trigger, which would be redundant with "an amount a citizen pays" if the cell demanded a single computable figure. The unpublished deposit components (`claim_chennai_water_deposit_amounts_unknown`) mean the applicant cannot compute a **total**, which is a real legibility gap, but section 8 does not condition `cost` on a total. The gap is handled correctly: it is carried as a separate `Unknown` claim, that claim supports no cell (section 8: an `Unknown` claim "records a limitation, not a positive cell value"), and it is disclosed in the cell note and in `meta.disclaimer`. Verdict: `cost` = `stated`.

### F-02 — correction — cell `cost`

**Required.** Section 9: a `stated` cell writes its state, `claimIds`, and an actionable-value note. The note's assertions should be traceable to ledger records.

**Observed.** The cost note asserts that "the form's own list of components includes deposit amounts for water and sewer whose figures do not appear on any reviewed route". The record that establishes this, `claim_chennai_water_amount_payable_components` (`verified`, Grade B), is cited by no cell. The supporting `Unknown` claim cannot be added as support under section 8, but the `verified` components claim can. Correction proposed: add `claim_chennai_water_amount_payable_components` to `/cells/cost/claimIds`. This does not change the cell state.

### F-03 — note — cells `cost`, `documents`; scenario exclusion test

**Required.** Section 2: the six-cell grid scores the declared primary scenario only. The scenario excludes bulk and high-rise connections, commercial use, regularisation, name transfer and tanker supply.

**Observed.** The charge and enclosure claims are drawn from tables and guidelines that cover several categories at once, so I tested them for exclusion leakage and found none material. `claim_chennai_water_connection_charge_table` recites only the residential rows and says so; `claim_chennai_water_meter_testing_charges` recites a category-neutral schedule keyed to equivalent dwelling units; the source is expressly the "general category" form, not a bulk-supply instrument. No claim asserts a commercial, bulk, high-rise, regularisation, transfer or tanker value. One boundary is worth recording: the third charge band is recited as "the same rate applying to all other residential buildings and flats", which reaches past the individual independent house at the centre of the scenario, though it stays inside the residential family and does not touch an excluded route. The value a scoped citizen acts on is the independent-house band. Likewise the enclosure list preserves the form's own "where applicable" qualifiers rather than asserting them of the scoped case, with `claim_chennai_water_small_house_document_relief` and `claim_chennai_water_completion_certificate_exemption` supplying the scoped qualification. Accepted as scoped.

### F-04 — note — cell `time`; `claim_chennai_water_performance_standards_table`, `claim_chennai_water_stage_timeline_table`

**Required.** Section 8: `time` is `stated` on "an actionable duration, deadline, processing period, or service-level target"; and "when the figure covers only one stage, the cell note must say so".

**Observed.** The one-stage disclosure rule is **not triggered** here, and is satisfied in any event. It is not triggered because the 15-day figure does not cover one stage: it spans registration to connection and is decomposed into a five-stage table that sums to the same 15 days, alongside two further targets (3 days for deficiency intimation, 5 days for the sanction order). It is satisfied in any event because the note volunteers both caveats a citizen needs — that "the 15 days run from registration of the application, not from the day the citizen first walks in", and that one of the five stages, three days for the consumer to pay, "is a deadline on the citizen rather than on the board". A run-from-registration target is still an actionable processing period; the unmeasured interval before registration is a disclosed limitation, not a defect in the figure. Verdict: `time` = `stated`.

### F-05 — note — `claim_chennai_water_registration_acknowledgement`, `claim_chennai_water_stage_timeline_table`, `claim_chennai_water_sanction_order_after_payment`

**Required.** Section 1 (integrator): "Do not overwrite conflicting claims: retain both, cross-link them with `contradictsClaimIds`, and mark them `contested` until audited." Section 13: the auditor may remove false contradiction links and downgrade unsupported claims, but "may not invent evidence".

**Observed.** Two published sequences sit in the ledger without cross-linking. The application form's counter instruction (`claim_chennai_water_registration_acknowledgement`) has the applicant register "the filled application, with the receipt for payment of the connection charges" — payment precedes registration. The charter's stage table (`claim_chennai_water_stage_timeline_table`) places "payment to be made by the consumer" as stage three of five, after processing, verification and approval, and `claim_chennai_water_sanction_order_after_payment` has an intimation to pay issued only on approval by the Area Engineer. I am **not** proposing a contradiction link or a `contested` downgrade: the two may describe different payment events (connection charges tendered up front versus a post-assessment demand covering deposits and advance tax), and the reviewed evidence does not settle which, so linking them would resolve by intuition, which section 12 forbids. Recorded for the researcher as an unresolved divergence in the payment sequence between the counter and online routes. No cell state turns on it.

### F-06 — correction — cell `after-submission`

**Required.** Section 8: `after-submission` is `stated` "only when the evidence identifies something the citizen sees after submitting"; a step at or before submission is not after-submission evidence. Section 9: a `stated` cell carries an actionable-value note. Section 8 lint item 6: overclaims across a login or other authentication boundary.

**Observed.** The cell is scored from **two routes, not one**, and the note does not say so. Two of the four cited claims are online-route evidence: `claim_chennai_water_registration_id_and_sms` is expressly conditioned on "a successful online transaction", and the ledger's own `claim_chennai_water_online_application_needs_login` records that the online route requires the consumer to create an applicant login first — so that registration-ID surface sits behind an authentication boundary. `claim_chennai_water_sanction_order_after_payment` describes approval preceding payment, the online sequence identified in F-05 rather than the counter sequence. Meanwhile the charges, enclosures and registration instructions carrying `cost`, `documents` and `eligibility` are counter-route material. Presenting a login-gated surface in a cell note without naming the gate, beside cells scored from the unauthenticated counter route, is an overclaim across the login boundary at the cell-note level.

The claims themselves are **not** overclaims and are not removed: each reports what a public official page states, attributed and Grade B on observation of that page, not an observation of a logged-in interface, and each is `verified` as section 8 requires of supporting claims. The proportionate remedy is disclosure. Correction proposed to `/cells/after-submission/note`.

The cell remains `stated`, because it survives on route-compatible evidence independent of the login boundary: `claim_chennai_water_public_status_route` is a direct current observation of the board's online-services page publishing a link to know the status of a new water or sewer connection — a tracker, in section 8's own enumeration — and `claim_chennai_water_status_published_periodically` records the charter's statement that the status of registered applications is published periodically on the website, which is route-agnostic because it speaks of registered applications. Verdict: `after-submission` = `stated`, with the route split disclosed.

### F-07 — correction — `claim_chennai_water_public_status_route`

**Required.** Section 1 (auditor): "Downgrade or mark `contested` when evidence does not support the wording." Section 8 lint item 6: overclaims across an authentication boundary. Section 16: no login, and no exercising of live application routes.

**Observed.** The claim states the two links are "both reachable without login". Neither link was exercised — the claim's own note says so — so what was observed is that the **page publishing the links** is public, not that either destination is usable unauthenticated. As worded the claim also reads against `claim_chennai_water_online_application_needs_login`, which states the online apply route requires an applicant login first; the two are reconcilable (a public link to an authenticated destination) but the current wording invites the reader to take the stronger sense. Correction proposed to `/text`, confining the assertion to the observation. I am deliberately **not** adding a `contradictsClaimIds` link between the two claims: once the wording is corrected the conflict dissolves, and section 13 directs the auditor to remove false contradiction links rather than create them. The corrected claim still supports `after-submission`: an observed, publicly published status link identifies a tracker.

### F-08 — note — cell `documents`; `claim_chennai_water_enclosure_list`

**Required.** Section 8: `documents` is `stated` "when the evidence gives an actionable document list or names a concrete document with a requirement to submit, provide, upload, produce, or attach it". Section 4: Grade B covers "An observed current official form".

**Observed.** The enclosure list appears in the guidelines printed on the application form PDF rather than on any service page, which I tested as a possible defect and reject as one. Section 8 imposes no requirement about **where** an actionable list is published, and section 4 grades an observed current official form at B outright — lint item 4 treats assigning Grade C to an observed current official form as a defect, so the form is the strongest, not the weakest, place for this list to live. The list is enumerated, each item carries an attach-or-produce requirement, and it is scoped in the citizen's favour by `claim_chennai_water_small_house_document_relief` and `claim_chennai_water_completion_certificate_exemption`. Recorded as a findability limitation only: the citizen must download a fourteen-page PDF reached from the board's RTI new-connection route to learn what to bring, and no reviewed service page carries the list. Verdict: `documents` = `stated`.

### F-09 — note — cell `eligibility`

**Required.** Section 8: `eligibility` is `stated` on "a rule that decides who qualifies or which route applies"; naming an applicant category "without a usable rule" is `mentioned`.

**Observed.** Two of the three cited claims carry the cell. `claim_chennai_water_completion_certificate_exemption` is a usable threshold rule (residential up to 12 m, not exceeding 3 dwelling units or 750 sq m, exempt from producing a completion certificate) that decides whether a scoped applicant qualifies without the hardest enclosure. `claim_chennai_water_self_assessment_no_plumber` decides who may lodge the application, the licensed-plumber requirement having been dispensed with. The third citation, `claim_chennai_water_connection_charge_table`, is a fee schedule cited as an eligibility rule; deciding which **band** applies is not deciding who qualifies or which route applies, and it is topic-adjacent padding. I am not proposing its removal: it does not carry the cell, and striking it would be cosmetic. Separately recorded: no reviewed evidence states a core qualification rule for a new domestic connection (for example an authorised-building or assessed-to-property-tax precondition, or a requirement that the premises abut a public main); the cell rests on qualification-adjacent rules, which section 8 permits. Verdict: `eligibility` = `stated`.

### F-10 — note — cell `owner`

**Required.** Section 8: `owner` is `stated` when the evidence "lets a citizen identify the office, officer, or operational role that holds or decides the case, including a specific office list, a designation tied to a jurisdiction rule, or a contact route for that role"; "a statutory designation or general agency name alone is `mentioned`".

**Observed.** All four supports clear the bar and none is a bare agency name: the form is addressed to the Area Engineer, so the receiving office is named on the instrument the citizen fills in; the charter ties the Depot Engineer, Deputy Area Engineer and Area Engineer to the specific stage each owns; the board publishes an area office table giving location, address and telephone number, which is a specific office list and a contact route; and the escalation matrix names four designations with a period at each level, specific to new-connection applications rather than to supply complaints. `claim_chennai_water_area_office_directory` records institutional contact details only, consistent with section 16. Verdict: `owner` = `stated`.

### F-11 — note — claim atomicity across the ledger

**Required.** Section 1: "one claim asserts one checkable thing"; the auditor "may split compound claims". Section 8 lint item 1: compound or list claims.

**Observed.** Ten claims recite multi-row tables or multi-limb provisions: the connection charge table, meter testing charges, the amount-payable components, the enclosure list, the small-house relief, the six particulars, the performance standards, the stage timeline, the escalation matrix and the domestic tariff. I applied one consistent rule: a claim that recites a **single published table or a single published provision**, attributed to the source that publishes it, asserts one checkable thing — that the table or provision is published with that content — and splitting it would fragment a schedule whose rows are only usable together. On that rule every one of the ten is atomic and I propose no splits. The closest case is `claim_chennai_water_meter_testing_charges`, which carries both a charge schedule and the bore and sewer sizes for each band; these are separate facts, but they are separate **columns of one table**, so the same rule keeps it whole. No claim in the ledger fuses two independent sources or two unrelated provisions. No unsplit compound claim affects a cell state.

### F-12 — correction — `claim_chennai_water_online_application_needs_login`

**Required.** Section 5: "`mixed` must explain the boundary in `notes`."

**Observed.** The claim is `basis: mixed`, `status: partial`, and its notes read: "Boundary statement, recorded as a limitation and not used to support any positive cell value. The counter route needs no login and is where the published charges, enclosures and timelines apply." The notes explain the **login** boundary but not the **basis** boundary section 5 requires: they do not say which element is observed and which is inferred. The claim text itself is a pure recitation of what the charter states, i.e. observation; the inferential element is the second sentence of the notes, which reads the counter route as login-free from the form's counter registration instructions rather than from any statement in either source. Correction proposed to `/notes` naming the boundary. I have not changed `basis` to `observation`, because the record does carry an inferred component; the deficiency is that the record does not label it.

### F-13 — correction — `source_chennai_water_online_route`

**Required.** Section 8 lint item 5: source-date quality — "missing `publishedAt` without a visible-date note, or a stale or undated source without a stated limitation". Section 14: sources must carry visible agency naming, access date, and a snapshot or documented archival failure.

**Observed.** This source has no `publishedAt` and its notes record no visible version or last-updated date and no statement that none is shown. Its two sibling undated sources handle this correctly and show the standard the ledger otherwise meets: `source_chennai_water_general_tariff` notes "It shows no visible effective date, which is recorded as a limitation", and `source_chennai_water_area_office_list` notes "Shows no separate last-updated date beyond the site footer". This one is silent, so an unwaived lint item 5 finding stands against it. Correction proposed to `/notes` recording the absence as a limitation. I have **not** written any assertion about what the page displays, since I did not observe it and section 13 forbids inventing evidence; the correction records the gap in the record, not a new observation. Agency naming and access date are present, and the archival failure is documented.

### F-14 — note — evidence grades against the section 4 table

**Required.** Section 4 grade table; lint items 3 and 4.

**Observed.** I tested the two grades the brief flags and accept both as B.

The citizen charter (`source_chennai_water_citizen_charter`) is a 2021 charter whose footer shows "Last reviewed and updated on 08-04-2024", recorded as `publishedAt`, revising a 1998 charter issued under G.O. No.58. Grade B fits: it is "a current official procedure ... or agency page", live on the board's current site and carrying a review stamp. Grade C's trigger is material that is "archived, undated, or visibly outdated"; this charter is on the live site, is dated, and shows nothing marking it superseded. Two years and five months since review is a staleness signal, not a supersession, and the source note states the date and the lineage as section 4's Grade C row would require even if C applied. Accepted as B, not C.

The application form (`source_chennai_water_application_form`) is titled for 2023-2024 with file metadata of 2024-04-08, published from the board's own new-connection route. Section 4 gives an explicit row — "B | An observed current official form" — and lint item 4 makes "Grade C assigned to observed current official forms" a defect in its own right. Grading this C would itself be a lint failure. Accepted as B, not C.

Two further grades I considered and accept without correction: `claim_chennai_water_domestic_tariff` and `claim_chennai_water_area_office_directory` both rest on live official pages that show no date, where section 4's B row ("including direct current observation of a public official interface") and its C row ("undated ... official material") point in opposite directions. I resolve in favour of B, because what was performed was direct current observation of a live official interface and both source records state the date limitation. The choice is consequence-free for the grid: the tariff claim supports no cell, and section 8 admits Grade C claims to `stated` in any event, so the `owner` cell would stand either way. No secondary source is graded B, and no claim is graded above the strength of its source.

### F-15 — note — citation gate, dates, jurisdiction, scenario tags, reference integrity

**Required.** Section 7 (every non-`Unknown` claim needs at least one source; citations resolve to specific pages, never a homepage; ISO dates; jurisdiction text specific to the jurisdiction), section 2 (every claim tagged to at least one scenario), section 8 lint item 2 (duplicate sources) and item 7 (undeclared or incorrect scenario IDs).

**Observed.** Clean. All 22 non-`Unknown` claims carry at least one `sourceId` and every `sourceId` resolves to a defined source. The single `Unknown` claim, `claim_chennai_water_deposit_amounts_unknown`, correctly carries an empty `sourceIds`, `basis: inference`, `status: unknown`, and a note justifying retention under section 4's `Unknown` row. All five sources are specific pages or files on the working host `cmwssb.tn.gov.in`; none is a homepage or general-site reference, and the dead older host `chennaimetrowater.tn.gov.in` was disclosed in `meta.disclaimer` rather than substituted with a homepage, as section 7 requires. No two sources share a URL and access date. All dates are ISO and every `accessedAt` is 2026-09-06, matching `meta.asOf`. Every claim carries `jurisdiction: "Chennai, Tamil Nadu, India"`, matching `meta.jurisdiction`. Every claim is tagged to `scenario_ind32_water_residential` and no other scenario ID appears anywhere in the ledger or sidecar; the sidecar's `primaryScenarioId` matches the manifest. All 20 `claimIds` referenced across the six cells resolve to existing claims. All 23 claim IDs and all 5 source IDs are unique and match the schema ID pattern. The ledger validates against `benchmark/schemas/ledger.json`, including the conditional requiring a source on every non-`Unknown` claim.

### F-16 — note — supporting-status rule, and the two records excluded from the grid

**Required.** Section 8: "Only `verified` or `partial` claims may support `stated` or `mentioned`; a boundary statement or `Unknown` claim records a limitation, not a positive cell value." Section 8 `after-submission`: a step at or before submission "including registration, document presentation, payment, appointment booking, or the act of submission—is not after-submission evidence".

**Observed.** Correctly handled, and this is the sidecar's strongest work. All 20 cited claims are `verified`. The two records that must not support a cell support none: `claim_chennai_water_deposit_amounts_unknown` (`Unknown`) and `claim_chennai_water_online_application_needs_login` (the boundary statement, `partial`) are cited by no cell, and each carries a note saying so. Two further exclusions are correctly reasoned rather than accidental: `claim_chennai_water_registration_acknowledgement` is kept out of `after-submission` because the counter acknowledgment is handed over at submission, which section 8 excludes by name, and `claim_chennai_water_domestic_tariff` is kept out of `cost` because ongoing metered billing is not the cost of obtaining the connection. Both claims carry notes recording the reasoning. Section 3's explicit-zero rule is applied correctly in the other direction: the free application form and the advance-tax exemption for the smallest residential band are scored as stated values in `cost`, not as absences.

### F-17 — note — archive snapshots

**Required.** Section 11: capture a snapshot for every public source; if capture fails, record the access date, the failure, and a limitation; archive failure does not permit a substitute homepage. Section 14: "a Wayback snapshot or documented archival failure".

**Observed.** Substantially compliant, with one wording caveat. Two sources point to existing snapshots with dates. Three record that the Wayback availability API returned nothing, retain the original official URL, and state the capture failure as a limitation, which is also disclosed in `meta.disclaimer`. No homepage was substituted for any of them. The caveat: all five notes say "no new capture was pushed from this run", which describes a decision not to attempt a capture rather than an attempted capture that failed. The three unsnapshotted sources are therefore closer to a disclosed non-attempt than to a documented failure under section 11's literal wording. The disclosure is complete enough that I raise this as a note only, but the shipping gate in section 14 would be met more cleanly by attempting the captures.

---

## Verdict

I tested each cell in both directions against the section 8 definitions and accept all six as authored. `cost` is `stated` on an actionable fee schedule, section 8's own independent trigger, with the unpublished deposit components correctly quarantined as an `Unknown` claim that supports no cell (F-01). `time` is `stated`; the one-stage disclosure rule is not triggered by a five-stage figure and is satisfied by the note regardless (F-04). `documents` is `stated`; section 8 imposes no publication-location requirement and section 4 grades an observed current official form at B (F-08). `after-submission` is `stated`, but is scored from two routes rather than one and requires the route split and the login gate to be disclosed in its note; it survives on the observed public status route and the route-agnostic charter statement (F-06, F-07). `eligibility` and `owner` are `stated` on usable rules and a specific office list (F-09, F-10). No correction changes a cell state. Five corrections are proposed, none inventing evidence; three protect against overclaim or unlabelled inference, one closes a lint item 5 date-quality gap, and one improves note traceability.

**Cell states accepted: cost `stated`, documents `stated`, eligibility `stated`, time `stated`, owner `stated`, after-submission `stated` — 6 of 6 stated.**


## Re-audit — 2026-09-06 (IND-91 part B)

A fresh isolated auditor re-audited this row after pre-audit lint remediation, on the section 12 inputs only. 6 corrections were proposed and 6 applied; none unapplied.

# Re-audit: Chennai, new domestic water connection (grid-only)

Row: `chennai` / `water-connection`, primary scenario `scenario_ind32_water_residential`, ledger `asOf` 2026-09-06, manifest mode `grid-only` with one declared lint waiver (`claim_chennai_water_six_particulars_3`, compound-claim).

Inputs read: the ledger, the expectations sidecar, the manifest entry for this row only, `benchmark/schemas/ledger.json`, `benchmark/PROTOCOL.md`, `benchmark/schemas/corrections.json`. No URL was opened and no other jurisdiction, audit file or corrections file was read.

Verdict in one line: all six cell states are correct and none is changed; six corrections are proposed, all of them to cell membership plus one claim `basis`; several unwaived atomicity findings are raised that need either a split by the integrator or a manifest waiver before the row can be treated as audit-clean.

---

## Cell-by-cell verdict (PROTOCOL section 8)

| Cell | Recorded | Audit verdict | Membership change |
| --- | --- | --- | --- |
| cost | `stated` | correct | 1 removal |
| documents | `stated` | correct | 1 removal, 1 addition |
| eligibility | `stated` | correct | 2 removals |
| time | `stated` | correct | 1 addition |
| owner | `stated` | correct | none |
| after-submission | `stated` | correct | 2 removals |

Every claim listed in every cell has `status: "verified"`, so the section 8 gate that only `verified` or `partial` claims may support `stated` or `mentioned` is satisfied on its face. The two records that are not positive evidence — `claim_chennai_water_online_application_needs_login` (`partial`, boundary statement) and `claim_chennai_water_deposit_amounts_unknown` (`unknown`, Grade Unknown, no sources) — are correctly kept out of every cell and referenced only in prose. Reference integrity is clean: all 89 cell-referenced IDs resolve, no dangling IDs, 90 claims in the ledger.

---

## Findings

### F1 — `after-submission` cites a boundary statement as support
**Record:** expectations `/cells/after-submission/claimIds`, entry `claim_chennai_water_public_status_route_4`.
**Rule:** PROTOCOL section 8, expectation-cell definitions: "a boundary statement or `Unknown` claim records a limitation, not a positive cell value."
The claim reads "Whether either destination requires authentication is not established by this observation." That is precisely a boundary statement about an authentication boundary. Its `verified` status lets it past the status gate, but its substance is a limitation and it cannot count toward a positive cell value. The cell note already carries this limitation in prose, which is the right place for it. **Correction proposed:** remove from the cell's `claimIds`. The cell stays `stated`.

### F2 — `after-submission` cites a pre-submission surface
**Record:** expectations `/cells/after-submission/claimIds`, entry `claim_chennai_water_public_status_route_2`.
**Rule:** PROTOCOL section 8, `after-submission`: "A step at or before submission — including registration, document presentation, payment, appointment booking, or the act of submission — is not after-submission evidence."
The claim records that the online services route publishes a link *to apply* for a new water or sewer connection. An apply link is the act of submission, not something the citizen sees after it. Its sibling `_3` (link to know the status) is the after-submission limb and is correctly listed. **Correction proposed:** remove `_2`. The cell stays `stated` on `_3`, `claim_chennai_water_status_published_periodically`, the sanction-order family and the registration-ID family.

### F3 — `basis` on `claim_chennai_water_public_status_route_4` is not observation
**Record:** claim `claim_chennai_water_public_status_route_4`, field `/basis`.
**Rule:** PROTOCOL section 5: "`observation` records what a source or interface directly shows … A source grade does not turn an inference into an observation."
The online services route does not display the proposition that authentication behind its two links is unestablished. That proposition is a conclusion about the limits of the research pass, and the claim's own notes give the reasoning (neither link exercised, no login used, no reference entered). **Correction proposed:** `/basis` `observation` → `inference`. Grade B and `verified` are left alone; the source was genuinely observed, only the inferential step is mislabelled.

### F4 — `cost` cites a claim that asserts no amount
**Record:** expectations `/cells/cost/claimIds`, entry `claim_chennai_water_meter_testing_charges_7`.
**Rule:** PROTOCOL section 8, `cost`: `stated` requires "an amount a citizen pays or an actionable fee schedule."
The claim asserts that the table gives the bore size for the water connection and the size of the sewer connection for each band. That is a technical specification carrying no figure in rupees and no fee rule. It was split out of the meter-testing family during IND-91 part B but does not belong to the cost topic at all. **Correction proposed:** remove. The cell stays `stated` on the Rs. 100 / Rs. 5,000 / Rs. 7,500 connection-charge bands and the Rs. 100–500 meter-testing bands.

### F5 — the industrial limb is scored into two cells but is outside the primary scenario
**Record:** `claim_chennai_water_completion_certificate_exemption_3`, listed in `/cells/documents/claimIds` and `/cells/eligibility/claimIds`.
**Rule:** PROTOCOL section 2 ("The six-cell expectation grid scores that scenario only") and section 8, second audit check.
The claim states that all types of industrial buildings are exempt from producing a completion certificate. `scenario_ind32_water_residential` is an individual owner of a built residential property, with commercial and bulk connections expressly excluded, so the industrial limb asserts nothing about the scored case. The residential limbs (`_1` height, `_2` dwelling units and area) do the work and remain in both cells. **Correction proposed:** remove from `documents` and from `eligibility`. Neither state changes.
Note on scope: the claim is tagged to `scenario_ind32_water_residential` because that is the ledger's only scenario, and section 2 forbids inventing aliases. Keeping the record in the ledger while dropping it from the two cell lists is the right resolution; I do not propose a scenario-tag change.

### F6 — `eligibility` cites a fee-schedule claim as an eligibility rule
**Record:** expectations `/cells/eligibility/claimIds`, entry `claim_chennai_water_connection_charge_table`.
**Rule:** PROTOCOL section 8, `eligibility`: `stated` requires "a rule that decides who qualifies or which route applies."
The claim asserts only that the form publishes a table of connection charges per equivalent dwelling unit for residential independent houses. It states no rule about applicant category, qualification or route. The cell note's reasoning — that "the charge and the enclosures turn on the equivalent dwelling units computed from built-up area" — is the note author's synthesis and is not what the cited claim asserts, so the claim cannot carry the cell. **Correction proposed:** remove. The cell stays `stated` on the completion-certificate exemption rule and the self-assessment / no-licensed-plumber rules.

### F7 — `documents` is missing a claim that supports it
**Record:** `claim_chennai_water_registration_acknowledgement_4`, absent from `/cells/documents/claimIds`.
**Rule:** PROTOCOL section 8, `documents`, and the second audit check on claims that support a cell but are missing from its list.
The claim states that the filled application must carry the receipt for payment of the connection charges and the necessary enclosures. That names a concrete document with a requirement to attach it, which is exactly the section 8 documents test. It is currently in no cell at all. **Correction proposed:** add to `documents`.

### F8 — `time` is missing an actionable deadline
**Record:** `claim_chennai_water_registration_acknowledgement_3`, absent from `/cells/time/claimIds`.
**Rule:** PROTOCOL section 8, `time`: `stated` on "an actionable duration, deadline, processing period, or service-level target."
The claim states that the registration counter accepts applications before 3.00 p.m. on working days. That is a usable deadline on the counter route from which the cost, documents and eligibility cells are scored, and it is distinct from the 15-day service-level target already cited. It is currently in no cell. **Correction proposed:** add to `time`.

### F9 — unwaived list claims survive the IND-91 part B split
**Records:** `claim_chennai_water_amount_payable_components_2`, `claim_chennai_water_amount_payable_components_3`, `claim_chennai_water_area_office_directory_2`, `claim_chennai_water_registration_acknowledgement_2`, `claim_chennai_water_meter_testing_charges_7`.
**Rule:** PROTOCOL section 8, pre-audit lint check 1 (compound or list claims), and section 8's first audit check: one claim asserts one checkable thing. "An unwaived finding blocks audit."
Each of these packs several independently checkable items into one claim:
- `_components_2`: connection charges for water, connection charges for sewer, advance tax where applicable, meter testing charges (four items).
- `_components_3`: deposit for water, deposit for sewer, caution deposit for a temporary connection, any penalty (four items).
- `area_office_directory_2`: area number, location, office address, telephone number (four columns).
- `registration_acknowledgement_2`: in person, by an authorised person, by post (three modes).
- `meter_testing_charges_7`: bore size for the water connection and size of the sewer connection (two specs).
The manifest declares exactly one lint waiver, for `claim_chennai_water_six_particulars_3`, whose reasoning ("one published set of particulars, not several independent assertions, and the claim supports no expectation cell") applies with equal force to `area_office_directory_2` and `registration_acknowledgement_2` and with less force to the two `_components` claims, which enumerate charge heads a citizen must each compute. No correction is proposed here: the contract in section 13 changes fields on existing records, whereas the fix is either a split by the integrator or an extension of the manifest's `lintWaivers`. Recorded as a blocking lint finding.

### F10 — two officer-role claims are compound across stages
**Records:** `claim_chennai_water_officer_roles_in_process_2` ("receives the application and schedules and conducts the inspection and completes the connection") and `claim_chennai_water_officer_roles_in_process_4` ("approves the connection and issues the work order").
**Rule:** PROTOCOL section 8, lint check 1 and the first audit check.
`_2` in particular bundles three duties that fall at three different stages of the published process and are separately checkable against the charter. Same disposition as F9: split or waive. This does not affect the `owner` cell state, which is comfortably `stated` on the area-office table with addresses and telephone numbers, the form's addressee, and the four-designation escalation matrix.

### F11 — internal contradiction in the online-route source note
**Record:** source `source_chennai_water_online_route`, `notes`.
**Rule:** PROTOCOL section 4 (Grade B includes "direct current observation of a public official interface") and section 8 lint check 5 (source-date quality).
The same note asserts "Direct current observation of a public official interface offering two links" and, two sentences later, "the audit did not observe the page and records the absence as an unresolved limitation rather than asserting what the page displays." Read charitably the second sentence is about the absence of a visible last-updated date only, but as written it undercuts the observation on which the Grade B of `claim_chennai_water_public_status_route`, `_2` and `_3` rests, and those three claims carry part of the `after-submission` cell. No correction is proposed because the fix is a wording repair by the researcher, not a field-value change an auditor can assert; recorded as a limitation to resolve before the row ships.

### F12 — the login boundary on the registration-ID family is disclosed and does not overclaim
**Records:** `claim_chennai_water_registration_id_and_sms` and `_2`–`_5`, read against `claim_chennai_water_online_application_needs_login`.
**Rule:** PROTOCOL section 8, lint check 6 (overclaims across a login or other authentication boundary).
Reviewed, no change. The registration-ID surfaces are expressly conditioned on a successful online transaction, and the online route requires an applicant login first. The claims nevertheless record what the citizen charter publishes about that route, not anything observed behind a login, and the cell note discloses the boundary at length and states that the cell is carried independently by the public status link and the charter's statement that the status of registered applications is published periodically. The boundary claim itself is `partial` / `mixed`, with the observation-versus-inference split explained in its notes as section 5 requires, and it is kept out of every cell. This is correct handling.

### F13 — Grade B on the 2021 citizen charter is defensible
**Record:** source `source_chennai_water_citizen_charter`.
**Rule:** PROTOCOL section 4 (Grade B "a current official procedure … or agency page"; Grade C "archived, undated, or visibly outdated official material; state the date and limitation") and section 8 lint check 5.
Reviewed, no change. The charter identifies itself as the Citizen Charter 2021 and shows "last reviewed and updated on 08-04-2024" against an access date of 2026-09-06, which is a real staleness risk. But it is the document the board currently publishes on its live host, not archived or superseded material, so Grade B holds; and the source note states both the date and the limitation that its standards and rates may have moved, which is what check 5 asks for. The same reasoning sustains Grade B on the 2023-2024 application form, which is an observed current official form and would be a check 4 violation at Grade C.

### F14 — explicit zeros and out-of-scope costs are handled correctly
**Records:** `claim_chennai_water_application_free_and_where` (form free of cost), `claim_chennai_water_small_house_document_relief_4` (no advance tax for the smallest band), the `claim_chennai_water_domestic_tariff` family, `claim_chennai_water_deposit_amounts_unknown`.
**Rule:** PROTOCOL section 3 (explicit zero counts as stated) and section 8, cost cell.
Reviewed, no change. Both explicit zeros are recorded as stated values inside the cost cell, which is what section 3 requires. The ongoing metered tariff family is deliberately excluded from the cost cell — it is what the household pays once connected, not what the connection costs — and that exclusion is right for a cell scoped to obtaining the connection. The unpublished water and sewer deposit amounts are carried as a separate Grade Unknown claim with no sources, correctly outside the cell and correctly flagged in the cell note, which is the section 8 treatment of an Unknown claim. The three form-availability claims (`_2`, `_3`, `_4`) were examined and retained: they scope where the free-of-cost form can be had and so attach to the explicit zero rather than floating free of the cost topic.

### F15 — citation gate and archive rule are green
**Rule:** PROTOCOL sections 7 and 11.
Reviewed, no change. Every non-Unknown claim carries at least one source; the only sourceless claim is Grade Unknown, as the ledger schema's conditional requires. All five sources give a specific page or file rather than a homepage, with ISO access dates and jurisdiction text specific to Chennai, Tamil Nadu, India. Two sources point to pre-access-date Wayback snapshots and state the limitation that the snapshot does not preserve the page as reviewed; three record the capture failure, retain the original official URL, and state the limitation, which is exactly what section 11 permits. No substitute homepage was used anywhere.

### F16 — grid-only shape and scenario policy are consistent
**Rule:** PROTOCOL sections 1, 2 and the ledger schema.
Reviewed, no change. `nodes`, `edges`, `roadblocks` and `journeys` are empty and the manifest declares `mode: "grid-only"`, which the meta disclaimer repeats. Section 6's `researchedNoSourceFound` rule is therefore not engaged. Exactly one scenario is declared, it matches the manifest's `primaryScenarioId` and the sidecar's `primaryScenarioId`, and every claim is tagged to it. `scenario.status` is `partial`, which is honest for a grid-only run.

---

## Corrections summary

Six correction objects, in `reaudit-chennai-water-connection.corrections.json`:

1. `expectations` / `water-connection:cost` / `/cells/cost/claimIds` — remove `claim_chennai_water_meter_testing_charges_7` (F4).
2. `expectations` / `water-connection:documents` / `/cells/documents/claimIds` — remove `claim_chennai_water_completion_certificate_exemption_3`, add `claim_chennai_water_registration_acknowledgement_4` (F5, F7).
3. `expectations` / `water-connection:eligibility` / `/cells/eligibility/claimIds` — remove `claim_chennai_water_completion_certificate_exemption_3` and `claim_chennai_water_connection_charge_table` (F5, F6).
4. `expectations` / `water-connection:time` / `/cells/time/claimIds` — add `claim_chennai_water_registration_acknowledgement_3` (F8).
5. `expectations` / `water-connection:after-submission` / `/cells/after-submission/claimIds` — remove `claim_chennai_water_public_status_route_2` and `claim_chennai_water_public_status_route_4` (F1, F2).
6. `claim` / `claim_chennai_water_public_status_route_4` / `/basis` — `observation` → `inference` (F3).

No cell state changes. No `/cells/<cell>/state` correction is proposed: all six cells are `stated` and all six remain `stated` after every proposed membership change.

Findings raised without a correction, because the fix is a split or a waiver rather than a field-value change: F9, F10 (atomicity, blocking under section 8 until split or waived) and F11 (source note wording).

No evidence was invented and no URL was opened; every judgement above rests on the ledger and sidecar text as written.
