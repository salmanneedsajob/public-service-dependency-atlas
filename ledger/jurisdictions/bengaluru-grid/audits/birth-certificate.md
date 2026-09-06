# Audit — Bengaluru birth certificate (grid-only)

- **Service:** birth-certificate
- **Jurisdiction:** Bengaluru, Karnataka, India
- **Primary scenario:** `scenario_ind32_birth_copy_workflow`
- **Audit date:** 2026-09-06
- **Benchmark version:** 0.1
- **Mode:** grid-only (no nodes, edges, roadblocks, journeys, or portal sidecar expected; their absence is not raised as a finding)

The sidecar scores all six cells `stated`. Each cell was tested separately and in both directions: whether the evidence is strong enough to hold `stated`, and whether a downgrade would be manufactured rather than earned. All six survive. Eleven corrections are proposed; none of them changes a cell state.

---

## Findings

### F1 — `cost` holds `stated` on the service card's amounts

**Severity:** note
**Records:** expectation `birth-certificate` `/cells/cost`; `claim_bengaluru_grid_birth_application_fee_5`; `claim_bengaluru_grid_birth_service_charge_20`; `claim_bengaluru_grid_birth_rule_13_extract_fee`
**Protocol requires:** Section 8 — `cost` is `stated` when the evidence gives an amount a citizen pays or an actionable fee schedule; a fee described only as prescribed, or a payment step without an amount, is `mentioned`.
**Observed:** The card gives Rs. 5 as the application fee and Rs. 20 as a service charge where the application is made through a Grama One, B1 or K1 counter. Both are amounts, not descriptions of an amount. The brevity of the card does not bite here: a fee cell needs a number, and a number is what the card gives. Rs. 5 is independently corroborated by Rule 13(1) at Grade A. The Rs. 20 figure is correctly qualified on the card itself by the channel it applies to, so it is a second amount rather than a contradiction, and no `contradictsClaimIds` link is owed.

Note for the integrator: the cell does **not** rest on the download route's fee. `claim_bengaluru_grid_birth_download_requires_registration_in_ejanma` records that certificates are downloadable "by paying a specific fee" with no amount — on its own that would be `mentioned` under section 8. The cell survives on the card's amounts alone.

### F2 — the claim note on the download route implies an unestablished fee equivalence

**Severity:** note
**Record:** `claim_bengaluru_grid_birth_download_requires_registration_in_ejanma` `/notes`
**Protocol requires:** Section 5 — `basis` records what a source directly shows; a conclusion drawn from it is inference.
**Observed:** The claim text is a faithful observation of the route's own words and is correctly `observation`. The note, however, says "The route names a fee without giving its amount; the amount is on the Seva Sindhu card." Neither page establishes that the card's Rs. 5 application fee *is* the download route's fee; they are two pages describing two payment points. No correction is proposed because the note is hedged and the claim text carries no such assertion, but the `cost` cell must not be read as pricing the online download route.

### F3 — `documents` holds `stated` on the explicit zero

**Severity:** note
**Records:** expectation `birth-certificate` `/cells/documents`; `claim_bengaluru_grid_birth_no_documents_required`
**Protocol requires:** Section 3 — an explicit zero requirement is a stated value, not an absence and not a not-applicable state; the grid has no not-applicable state. Section 8 — `documents` is `stated` on an actionable document list or a concrete document with a requirement to submit; a reference to documents without telling the citizen what is required is `mentioned`.
**Observed:** The card carries a labelled field, "Documents to be submitted with application", answered "NIL". The alternative reading offered for testing — that a bare NIL is a gap in the card rather than a statement that nothing is required — is foreclosed by section 3. A gap would be the field left blank or the topic not appearing; here the question is put and answered, and section 3's own examples (`no upload required`, `no fee`, `no additional eligibility requirement`) are the same shape. The citizen is told what to bring: nothing. `stated` is correct.

Limitation to carry forward: "NIL documents" is not "no prerequisites". The download and status routes both turn on the event already being registered in eJanMa and on the applicant holding a registration number or Sakala number. Those are identifiers rather than documents, so they do not disturb the cell, but the cell should not be read as meaning an applicant needs nothing in hand. Separately, no BBMP counter route was reviewed that could add a document requirement (see F9).

### F4 — `time` holds `stated` on "Immediate"

**Severity:** note
**Records:** expectation `birth-certificate` `/cells/time`; `claim_bengaluru_grid_birth_service_time_immediate`
**Protocol requires:** Section 8 — `time` is `stated` on an actionable duration, deadline, processing period or service-level target; a reference to timing, delay, sequence or processing "without a figure **or usable time rule**" is `mentioned`; and where the figure covers only one stage the cell note must say so.
**Observed:** "Immediate" is not a figure, and the question is whether a word can satisfy the cell. It can, on this wording. The definition is disjunctive: a figure *or* a usable time rule. "Immediate" is not a reference to timing left unresolved — the `mentioned` case is text like "issued after due verification", which names the topic and settles nothing. "Immediate" settles it: the waiting period is zero, and the citizen can act on that by not planning a return trip. It appears as the answer to the card's own service-time-in-days field, i.e. in the slot a service-level target occupies, and the Sakala field observed on the status route confirms the service sits under the state's service-guarantee scheme. Section 3's treatment of an explicit zero as a stated value points the same way.

The one-stage requirement is met: the cell note says the value covers issue of the certificate once the event is on the register, not any earlier registration step. That scoping is the integrator's reading of a card that does not itself say so, but it is the conservative reading and it is exactly the disclosure section 8 demands.

### F5 — `eligibility` holds `stated` on the route rules, not on the card

**Severity:** note
**Records:** expectation `birth-certificate` `/cells/eligibility`; `claim_bengaluru_grid_birth_download_requires_registration_in_ejanma`; `claim_bengaluru_grid_birth_bbmp_registrars`; `claim_bengaluru_grid_birth_eligibility_citizens`
**Protocol requires:** Section 8 — `eligibility` is `stated` when the evidence gives a rule that decides who qualifies or which route applies; naming an applicant category without a usable rule is `mentioned`.
**Observed:** The card's own eligibility line, "citizens of India", is a category and not a rule; standing alone it would be `mentioned`, and the sidecar note says so plainly and cites it "only for completeness". The cell is carried instead by two genuine route rules: a certificate can be downloaded through Seva Sindhu only where the event is registered in eJanMa, and events in the BBMP area are registered in eJanMa by Health Officers and Health Inspectors for their areas. Together an applicant can tell whether the online route is open to them and which office holds the record otherwise. That is the second limb of the definition, met squarely.

Including the topic-only card claim among a `stated` cell's `claimIds` is not prohibited by section 9 and it does not upgrade anything, because the cell does not rest on it. No correction; the sidecar note is transparent about its role.

### F6 — `owner` holds `stated`; the Nadakacheri contact does not carry it

**Severity:** note
**Records:** expectation `birth-certificate` `/cells/owner`; `claim_bengaluru_grid_birth_rule_13_issuer_and_form`; `claim_bengaluru_grid_birth_bbmp_registrars`; `claim_bengaluru_grid_birth_additional_copies_contact`
**Protocol requires:** Section 8 — `owner` is `stated` when the citizen can identify the office, officer or operational role holding the case, including a specific office list, a designation tied to a jurisdiction rule, or a contact route for that role; a statutory designation or general agency name alone is `mentioned`.
**Observed:** The cell is carried by Rule 13(2), which names the Registrar or the Commissioner or Chief Officer of the Municipal Corporation as the issuer of an extract in Form No. 5 — for this jurisdiction, BBMP — and by the portal's designation of Health Officers and Health Inspectors as the registrars for the BBMP area. The second is precisely "a designation tied to a jurisdiction rule". The District Statistical Officer plus the published toll-free number 1800-425-6578 add a contact route.

Two qualifications, neither fatal. First, `claim_bengaluru_grid_birth_additional_copies_contact` is described in its note as "a contact route named for exactly the request this scenario covers", but it directs the citizen to the data entry operators of the concerned Nadakacheri — a taluk-level facility, not a BBMP one. For a BBMP-area applicant that is not obviously the right counter, and the cell should not be read as resting on it. Second, that same claim bundles two request types, additional copies (in scope) and corrections (excluded by the scenario). It is one instruction naming one contact for both, so no split is proposed; the cell rests on the in-scope limb only.

### F7 — `after-submission` holds `stated` on a read-only status route

**Severity:** note
**Records:** expectation `birth-certificate` `/cells/after-submission`; `claim_bengaluru_grid_birth_public_status_route`; `claim_bengaluru_grid_birth_download_requires_registration_in_ejanma`
**Protocol requires:** Section 8 — `after-submission` is `stated` only where the evidence identifies something the citizen sees after submitting, such as a status page, tracker, acknowledgement, receipt, rejection reason or downloadable result; anything at or before submission does not count.
**Observed:** An Application Status route reachable without login, taking a registration number or a Sakala number, is a tracker in the enumerated sense; a certificate downloadable from Seva Sindhu once the event is on the register is a downloadable result. Neither is a pre-submission step. Nothing on the excluded list (registration, document presentation, payment, appointment booking, the act of submission) is being counted here.

The route was read, not queried, and the ledger holds that boundary correctly: the claim asserts only the route's published fields, its note says nothing was entered, and no claim anywhere asserts what the route returns. That is the right treatment under section 5 and section 16, and a public status form with an application-side identifier field is itself the visible post-submission surface the cell asks for, whether or not a number was entered.

### F8 — Grade A is retained for the 1999 rules

**Severity:** note
**Records:** `source_bengaluru_grid_birth_ka_rbd_rules`; `claim_bengaluru_grid_birth_rule_13_extract_fee`; `claim_bengaluru_grid_birth_rule_13_issuer_and_form`; `claim_bengaluru_grid_birth_fee_currency_unknown`
**Protocol requires:** Section 4 — Grade A for a binding law, regulation, commission order or gazette notification; Grade C for official but indirect, incomplete, archived or potentially outdated material, with the date and limitation stated.
**Observed:** The ledger's own note that the published copy carries no visible amendment history was tested as a reason to downgrade to C. Grade A is retained. The document is the primary regulation itself, obtained from the issuing agency's own Act-and-Rules route rather than from an archive or a secondary reproduction, and nothing observed shows supersession. Absence of an amendment-history page is a property of nearly every consolidated statutory PDF; treating it as sufficient for C would collapse the A row for regulations generally, which the table does not intend. The currency question is instead preserved exactly where section 4's Unknown row wants it — as `claim_bengaluru_grid_birth_fee_currency_unknown`, and as a stated limitation on the source and on the claim notes.

This holds only because the *current* Rs. 5 figure in the `cost` cell comes from the Grade B service card observed on the access date, not from the 1999 rule. Were the cell resting on the rule alone, the currency gap would matter to the cell.

### F9 — four cells rest on an undated, unarchived state service card

**Severity:** note
**Record:** `source_bengaluru_grid_birth_seva_sindhu`
**Protocol requires:** Section 8 lint item 5 (a stale or undated source needs a stated limitation); section 11 (archive snapshot for every public source, or the access date, the failure and a limitation); section 14 (a Wayback snapshot **or** documented archival failure).
**Observed:** The card carries no visible last-updated or version date and the Wayback availability API returned no snapshot for it. Both are recorded on the source and in `meta.disclaimer`, so section 11 and section 14 are satisfied by documented archival failure and the lint item is discharged. This is not blocking, and section 8 does not condition `stated` on an archive.

It is, however, the single largest limitation on this row and the integrator should carry it forward: `cost`, `documents`, `time` and the card limb of `eligibility` all rest on one undated page for which no independent record exists of what it said on 2026-09-06. Four of six cells therefore have no corroborating capture. By contrast the eJanMa pages carry a visible footer date of 09/02/2026 and a version string (eJanMa 3.0/3), which is why the home-page-sourced claims are better dated than the card-sourced ones.

### F10 — recorded Wayback snapshots pre-date the access date by two to four years

**Severity:** note
**Records:** `source_bengaluru_grid_birth_ejanma_home`; `source_bengaluru_grid_birth_ka_rbd_rules`; `source_bengaluru_grid_birth_download_route`; `source_bengaluru_grid_birth_status_route`
**Protocol requires:** Section 11 — at access time, capture an archive snapshot for every public source used.
**Observed:** Each of these four points to a pre-existing snapshot (2022-12-08, 2024-05-29, 2024-06-10, 2024-06-11) and each note states plainly that no new capture was pushed from this run. The literal section 14 requirement, "a Wayback snapshot", is met and the disclosure is honest, so no correction is proposed. But none of these snapshots evidences the page as observed on 2026-09-06, and `meta.disclaimer` currently discloses only the Seva Sindhu capture failure, not this. Since `meta` is not an addressable record type, this is stated here as a limitation for the integrator: the disclaimer should say that the archive snapshots held for the eJanMa sources pre-date the access date and corroborate earlier versions of those pages only.

### F11 — a compound statutory fee claim; split

**Severity:** correction
**Record:** `claim_bengaluru_grid_birth_rule_13_extract_fee`
**Protocol requires:** Section 1 — one claim asserts one checkable thing. Section 8 lint item 1 — compound or list claims. Section 13 — the auditor may split compound claims.
**Observed:** The claim asserts three separately checkable statutory fees in one sentence: the extract fee (Rs. 5.00), the search fee schedule (Rs. 2.00 for the first year and Rs. 2.00 for every additional year), and the non-availability certificate fee (Rs. 2.00). Only the first is what the `cost` cell needs. Corrections narrow the existing claim to the extract fee, retaining its ID per section 1's rule that content changes and identity does not, and add two new claims carrying the other two fees verbatim with the same source, grade, basis and status. Nothing is invented: every word of the new claims comes from the compound original.

Because the `cost` cell note refers to "Rs. 2.00 for a first-year search", a further correction adds `claim_bengaluru_grid_birth_rule_13_search_fee` to `/cells/cost/claimIds` so the note stays supported. The non-availability fee is *not* added: that certificate is a different output from the certified copy this scenario covers. The cell state is unchanged.

### F12 — a second compound claim spanning two interfaces; split

**Severity:** correction
**Record:** `claim_bengaluru_grid_birth_user_manual_published`
**Protocol requires:** Section 1 and section 8 lint item 1, as above.
**Observed:** The claim joins an observation of the eJanMa download route to an observation of the Seva Sindhu card in one sentence and cites both sources for the whole. Corrections narrow it to the download-route manual with `sourceIds` reduced accordingly, and add `claim_bengaluru_grid_birth_seva_sindhu_manual_and_apply` for the card's links. The claim supports no cell, so no cell state moves; it is corrected because a shipped ledger should not carry an unwaived lint failure. The residual pairing in the new claim (a manual and an apply route) is one observation of a single card's published entry points, not a compound requirement, and is left intact.

### F13 — a claim asserts properties of routes that were never opened, citing only the portal root

**Severity:** correction
**Record:** `claim_bengaluru_grid_birth_public_verification_route`
**Protocol requires:** Section 5 — `observation` records what a source directly shows; a conclusion drawn from it is inference. Section 7 — citations must resolve to specific pages; a department homepage is a general-site reference. Section 13 — the auditor may downgrade unsupported claims.
**Observed:** The claim says the Birth and Death Verification route and the Registration Details route are "both reachable without login", while its own note concedes "neither was exercised". Reachability without login was therefore not observed; it was inferred from the links appearing in public navigation. Compounding this, the two routes have their own URLs and neither is recorded as a source: the only citation is the portal root, which is standing in as the evidence for pages that were not visited. That is the general-site-reference vice section 7 names, and it is the one place in this ledger where it occurs.

The correction narrows the text to what the cited page actually shows — that the home page publishes navigation links to those two routes — and rewrites the note to state the boundary. Grade B and `basis: observation` then stand correctly, because the narrowed claim is a true direct observation of the page cited. The `after-submission` cell is unaffected: it is carried by the status route and the downloadable result, and this claim is supporting only.

### F14 — home-page sourcing is accepted for text printed on the home page

**Severity:** note
**Records:** `claim_bengaluru_grid_birth_bbmp_registrars`; `claim_bengaluru_grid_birth_private_hospital_reporting`; `claim_bengaluru_grid_birth_additional_copies_contact`; `claim_bengaluru_grid_birth_clarifications_contact`
**Protocol requires:** Section 7 — citations must resolve to specific pages; a department homepage is a general-site reference and claims resting on it are Grade C. Section 4 — Grade B includes direct current observation of a public official interface, and a service portal. Section 1 — grade direct current observation of a public official interface B.
**Observed:** Five claims cite `https://ejanma.karnataka.gov.in/`, the root of the state civil-registration portal. These four are retained at Grade B; only F13's claim is corrected. The distinction is what the citation is being asked to do. Section 7's rule targets a homepage used as a stand-in — the second sentence of that paragraph, "Do not replace a dead specific page with a homepage", names the mischief. For these four the cited text is printed on the root page itself: the registrar arrangement, the contact instructions, the District Statistical Officer, the toll-free number. The citation resolves to the page bearing the content, there is no deeper page being substituted for, and the page is a service portal directly observed on the access date with a visible footer date of 09/02/2026. Section 4's B row covers exactly that. F13's claim is different in kind: it asserted properties of two *other* pages while citing only the root.

This is a judgment call and it is recorded as one so the integrator can see it. It does not affect the count either way: Grade C claims may also support `stated` under section 8.

### F15 — the FAQ limitation claim does not cite the document it describes

**Severity:** note
**Record:** `claim_bengaluru_grid_birth_faq_unreadable`
**Protocol requires:** Section 7 — every non-`Unknown` claim needs at least one source supplying the direct link, exact access date and jurisdiction, and citations must resolve to specific pages. Section 13 — the auditor may not invent evidence to make a record complete.
**Observed:** The claim describes a 76-page FAQ scan with no text layer but cites the portal home page; the FAQ file itself has its own URL and is not recorded as a source. The correct fix is to add the FAQ document as a source with its URL and access date, which this audit cannot do without inventing evidence it does not hold, so no correction is proposed. Unlike F13, this claim asserts nothing about the service — only about what this run could not read — and it is cited in no cell, so nothing rests on it. Recorded so the researcher can supply the missing source record.

### F16 — the excluded hospital-side route is correctly kept out of every cell

**Severity:** note
**Record:** `claim_bengaluru_grid_birth_private_hospital_reporting`
**Protocol requires:** Section 2 — the six-cell grid scores the primary scenario only; tag every claim to at least one scenario. Section 8 — cell states are read off the evidence for that scenario.
**Observed:** The scenario expressly excludes hospital-side registration steps. This claim records that events in private hospitals are reported by the hospital to the Registrar, and it is cited in **no** expectation cell; its note says so explicitly. Verified: it appears in none of the six `claimIds` arrays. No cell has been scored from excluded-route evidence.

Its `scenarioIds` nonetheless tags the primary scenario, whose summary excludes its subject. That is a structural necessity rather than a defect — the schema forbids an empty `scenarioIds` array and this grid-only ledger declares no other scenario — and deleting the claim would destroy retained evidence for no gain. No correction. The integrator should keep it out of any cell if this row is later deepened.

### F17 — the Unknown claim records a limitation only, as required

**Severity:** note
**Record:** `claim_bengaluru_grid_birth_fee_currency_unknown`
**Protocol requires:** Section 8 — only `verified` or `partial` claims may support `stated` or `mentioned`; a boundary statement or `Unknown` claim records a limitation, not a positive cell value.
**Observed:** Checked and correct. The claim is `status: unknown`, `evidenceGrade: Unknown`, `basis: inference`, with an empty `sourceIds` (permitted by the schema's conditional only for Unknown grade). It appears in no cell's `claimIds`; the `cost` cell note refers to the uncertainty narratively, which is a limitation and not a cited support. Every one of the fourteen claims cited across the six cells is `status: verified`. No `partial`, `contested` or `unknown` claim is doing cell work anywhere.

### F18 — state-level evidence carries this city row, but its city-specificity is concentrated in one paragraph

**Severity:** note
**Records:** all sources; `claim_bengaluru_grid_birth_bbmp_registrars`
**Protocol requires:** Section 7 — use jurisdiction text specific to the jurisdiction; a source supplies the direct link, exact access date and jurisdiction.
**Observed:** Every claim carries `"jurisdiction": "Bengaluru, Karnataka, India"`, matching `meta.jurisdiction` and the manifest, and every source note records the jurisdiction with a reasoned statement of why state-level material covers Bengaluru. Section 7's requirement is that the jurisdiction text be specific, and it is.

State-level evidence does carry this row, for three reasons. The Karnataka RBD Rules bind Bengaluru registrars, and Rule 13(2)'s issuer designation expressly reaches the Commissioner or Chief Officer of the Municipal Corporation, which for this jurisdiction is BBMP. Seva Sindhu is the state's delivery portal for Bengaluru residents and its card names B1 (Bangalore One) counters, so it is not purely generic state text for this row. And the eJanMa portal's own text addresses the BBMP area by name.

The one specifically-BBMP claim does enough work, but only just, and it does a lot of it: `claim_bengaluru_grid_birth_bbmp_registrars` supplies the city-specificity of both `eligibility` and `owner`, and it rests on a single home-page paragraph. It is not asked to carry `cost`, `documents` or `time` — appropriate, since fees and Sakala service times are set state-wide and the card is the right source for them. The limitation to carry forward is the concentration: strike that one paragraph and two cells lose their municipal anchor, falling back on the Rule 13(2) statutory designation alone.

### F19 — schema, reference integrity and remaining lint items

**Severity:** note
**Records:** ledger and sidecar as a whole
**Protocol requires:** Section 7 (ISO dates, citation gate); section 8 lint items 2–8; section 9 (six authored cells with state, `claimIds`, note); section 14.
**Observed:** All checked and clean.

- The ledger validates against `benchmark/schemas/ledger.json`: `meta` complete, `scenarios` non-empty, every ID matching the required pattern, `nodes`/`edges`/`roadblocks`/`journeys` present and empty as grid-only mode allows.
- Reference integrity: all seventeen claims resolve to existing sources except the Unknown claim, which the schema permits to have none; all fourteen `claimIds` across the six cells resolve to existing claims; no dangling references in either direction.
- Lint item 2, duplicate sources: five sources, five distinct URLs, one access date. None duplicated.
- Lint item 3, Grade B on a secondary source: no secondary sources exist. Lint item 4, Grade C on an observed current official form: no Grade C records exist.
- Lint item 5, source-date quality: handled at F9 and F10; each source without `publishedAt` carries a visible-date note and a stated limitation.
- Lint item 6, overclaims across an authentication boundary: none. Every route is public; the two read-only routes assert their published fields only.
- Lint item 7, scenario IDs: one scenario, `scenario_ind32_birth_copy_workflow`, matching the manifest `primaryScenarioId` and the sidecar. Every claim is tagged to it. No aliases.
- Lint item 8, `researchedNoSourceFound`: not applicable in grid-only mode; no nodes exist.
- Contradiction links: all `contradictsClaimIds` are empty and no contradiction was found to link. The Rs. 5 card fee and the Rs. 5 statutory extract fee agree; the Rs. 20 service charge is channel-qualified on the card. No false links to remove, no records to mark `contested`.
- Section 9 sidecar form: six cells, correctly named, each with a state, non-empty `claimIds` and an actionable-value note. Empty `searchedRoutes` is correct for `stated` cells.

---

## Verdict

Every cell state in the sidecar is accepted as scored. Eleven corrections are proposed; all are claim-atomicity splits, one over-asserted claim narrowed to its cited evidence, and the one sidecar `claimIds` update those splits require. **No correction changes a cell state.**

**Accepted cell states:** `cost` = stated; `documents` = stated; `eligibility` = stated; `time` = stated; `owner` = stated; `after-submission` = stated. **Stated count: 6 of 6.**

**Unresolved limitations for the integrator:** (1) four cells rest on an undated service card with no archive capture (F9); (2) the eJanMa snapshots pre-date the access date by two to four years and `meta.disclaimer` does not yet say so — `meta` is not an addressable record type, so this must be applied by hand (F10); (3) the row's municipal specificity is concentrated in a single home-page paragraph (F18); (4) the FAQ document is described but not recorded as a source, and the missing URL cannot be supplied without inventing evidence (F15).
