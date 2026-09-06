# Audit — Chennai birth certificate (copy of a registered birth)

- **Service:** birth-certificate
- **Jurisdiction:** Chennai, Tamil Nadu, India
- **Primary scenario:** `scenario_ind32_birth_copy_workflow`
- **Audit date:** 2026-09-06
- **Benchmark version:** 0.1
- **Mode:** grid-only (no nodes, edges, roadblocks, journeys; no portal sidecar — absence not raised)

Inputs were confined to the integrated ledger, the expectations sidecar, `benchmark/schemas/ledger.json`, `benchmark/PROTOCOL.md`, `benchmark/schemas/corrections.json`, and the service's manifest entry, per protocol section 12. No handoffs, no researcher notes, no external browsing.

---

## Findings

### F1 — Statute versus portal on cost is not a contradiction

**Severity:** note
**Records:** `claim_chennai_birth_extract_fee_200`, `claim_chennai_birth_portal_download_free`

**What the protocol requires.** Section 1 (Integrator): "Do not overwrite conflicting claims: retain both, cross-link them with `contradictsClaimIds`, and mark them `contested` until audited." The closing words put the resolution with the audit, and section 13 says the auditor may remove false contradiction links. Section 8 admits only `verified` or `partial` claims into a cell, so a `contested` pair would fall out of `cost`.

**What I observed.** Rule 13(1) fixes Rs. 200 for granting an extract of a birth and Rs. 200 for every additional copy. The state portal states that the general public may download birth and death certificates free of cost for events registered from 1 January 2018 onwards. These do not assert incompatible values of the same variable. The statutory fee attaches to an extract granted by the Registrar under section 17 of the Act; the portal statement attaches to self-service download from the state portal, and the portal itself scopes that offer by registration date and routes earlier events to the local body (`claim_chennai_birth_portal_covers_from_2018`). Route-dependent pricing, with each route's price stated by the instrument that governs it, is two facts, not one fact told two ways. Nothing in Rule 13 purports to price every channel by which a citizen may obtain a copy.

**Verdict.** The contradiction rule does not apply. Both claims stay `verified`, `contradictsClaimIds` stay empty, and both remain admissible to the `cost` cell. No correction.

### F2 — Gazetted rules may carry a cell for a city-scoped route

**Severity:** note
**Records:** `cells/cost`, `claim_chennai_birth_extract_fee_200`, `claim_chennai_birth_search_fee_100`

**What the protocol requires.** Section 8: "`stated` means a Grade A, B, or C claim gives a value a citizen can act on." Grade A is defined in section 4 as "a binding law, regulation, commission order, or gazette notification". For `cost`: "`stated` when the evidence gives an amount a citizen pays or an actionable fee schedule. A fee described only as prescribed, a payment step without an amount, or a penalty payable by the agency is `mentioned`."

**What I observed.** The definition is written around the claim's grade and the actionability of the value, not around which surface published it — and it names Grade A first. Reading it to require the city's own route to restate the figure would make Grade A evidence structurally incapable of carrying a cell, which the table contradicts. The test the rule actually sets is whether the citizen gets a value to act on: Rule 13(1) gives figures (Rs. 200, Rs. 100), not "such fee as may be prescribed"; the Rules are state-wide subordinate legislation and Chennai sits inside them, which the source note records; and the ledger records the operative amendment (G.O.Ms.No.360 dated 12.10.2017) so the figures cited are the ones in force, not the superseded Rs. 5 / Rs. 2.

That the Greater Chennai Corporation's own page carries no fee text at all (`claim_chennai_birth_gcc_routes_offered`) is a genuine legibility deficit and it is on the record, but it is a finding about the city, not a reason to score the cell down. Section 3's principle points the same way: do not record as an absence something the applicable evidence states.

**Verdict.** `cost` = `stated` is upheld. Statutory evidence carries a cell when the rule is in force, applies to the jurisdiction, and fixes an actual figure. No correction.

### F3 — `time` is scored from evidence the scenario excludes

**Severity:** correction
**Records:** `cells/time`; `claim_chennai_birth_collect_within_30_days`, `claim_chennai_birth_institutional_collect_within_30_days`, `claim_chennai_birth_uncollected_posted_in_fifteen_days`

**What the protocol requires.** Section 2: "The six-cell expectation grid scores that scenario only" and "Done is evaluated on the primary scenario alone." Section 8, `time`: "`stated` when the evidence gives an actionable duration, deadline, processing period, or service-level target. A reference to timing, delay, sequence, or processing without a figure or usable time rule is `mentioned`; when the figure covers only one stage, the cell note must say so."

**What I observed.** The scenario summary fixes the trigger as a birth **already registered** where the family needs a certified copy or a first certificate, and expressly excludes "hospital-side registration steps". All three cited figures attach to the registration event, not to the in-scope request:

- Rule 8(2) runs thirty days **from the reporting of the birth** — a window that opens and closes as part of registration.
- Rule 8(4) is collection **from the officer or person in charge of the institution** — the hospital-side step the scenario excludes by name.
- Rule 8(5) is a duty triggered by the **expiry of that collection period**, requiring no request from the citizen at all.

None of them tells a citizen who is now seeking a copy how long anything will take. No reviewed route gives a processing period for a request for a copy, and the state portal publishes no service-level target for its download — the sidecar's own note concedes both. The "one stage" clause in the definition governs a figure covering one stage of the in-scope journey; it does not license importing a figure from a journey the scenario excludes.

I considered the contrary reading — that a family with a registered birth and no certificate is precisely the family Rule 8(5) protects, so the fifteen-day posting duty is in scope. It does not survive: 8(5) is automatic and time-barred to the registration window, and for a family requesting a copy later it yields no duration at all.

Timing is nonetheless named by reviewed evidence, so the cell is not `absent`.

**Correction.** `/cells/time/state` `stated` → `mentioned`; note rewritten to state the scope limitation; `searchedRoutes` populated from the routes the ledger's own sources attest, as section 9 requires of a `mentioned` cell. The three claims are retained as topic-only claim IDs — they are true statements of the Rules and `verified`, and section 9 permits topic-only IDs on a `mentioned` cell.

### F4 — `after-submission` rests on a step the definition excludes and on an outcome named without a surface

**Severity:** correction
**Records:** `cells/after-submission`; `claim_chennai_birth_uncollected_posted_in_fifteen_days`, `claim_chennai_birth_extract_form_and_certification`

**What the protocol requires.** Section 8, `after-submission`: "`stated` only when the evidence identifies something the citizen sees after submitting, such as a status page, tracker, acknowledgement, receipt, rejection reason, or downloadable result. A step at or before submission—including **registration**, document presentation, payment, appointment booking, or the act of submission—is not after-submission evidence. An outcome named without a visible or actionable post-submission surface is `mentioned`."

**What I observed.** Both cited claims fail the definition, each for its own reason.

Rule 8(5) is a consequence of registration. The definition names registration in its exclusion list, and independently the duty answers to no submission by the in-scope citizen — there is nothing they submit and nothing they then see. It is not after-submission evidence for this scenario.

Rules 8(1) and 13(2) name the output — the extract in Form No. 5, certified in the manner of section 76 of the Indian Evidence Act. That is an outcome named. It is not a status page, tracker, acknowledgement, receipt, rejection reason, or downloadable result; nothing in it is a surface the citizen reaches. The definition's closing sentence is written for exactly this case and sends it to `mentioned`.

I also checked whether anything else in the ledger could carry the cell. `claim_chennai_birth_portal_download_free` names a downloadable result, but the state portal's own download route returned HTTP 404 on the access date (`claim_chennai_birth_crstn_service_routes_404`), so no such surface was observed; and the corporation's working download sits behind an OTP that this run correctly did not cross. Nothing reaches `stated`.

**Correction.** `/cells/after-submission/state` `stated` → `mentioned`; note rewritten; `searchedRoutes` populated. Claim IDs retained as topic-only.

### F5 — `owner` should be `stated`

**Severity:** correction
**Records:** `cells/owner`; `claim_chennai_birth_registrars_by_local_area`, `claim_chennai_birth_portal_covers_from_2018`, `claim_chennai_birth_gcc_routes_offered`

**What the protocol requires.** Section 8, `owner`: "`stated` when the evidence lets a citizen identify the office, officer, or **operational role** that holds or decides the case, including a specific office list, **a designation tied to a jurisdiction rule**, or a contact route for that role. A statutory designation or general agency name alone is `mentioned`."

**What I observed.** The definition is disjunctive: three sufficient forms, any one of which meets the lead test, and the lead test admits a role, not only a named office. The distinction the second sentence draws must therefore be between a bare designation — "there shall be a Registrar" — and a designation accompanied by a rule that tells the citizen *which* holder is theirs.

The portal's recital is the latter. It states that registrars have been appointed **for each local area** under section 7 of the Registration of Births and Deaths Act, 1969, **for births and deaths occurring in their jurisdiction**. That is a designation of an operational role bound to a jurisdiction rule: the birth occurred in Chennai, so the case is held by the Registrar of Births and Deaths for that local area. The portal's route rule supplies the body — for events registered before 1 January 2018 "the respective local bodies may be approached" — and the ledger names the local body, the Greater Chennai Corporation, in its agency record and throughout.

Tested in the other direction: the sidecar's ground for `mentioned` is that nothing lets the citizen move from their address to a named office. That is true and it is a real deficit, but it is the test for "a specific office list", which is one of three admitted forms, not the requirement. Applying it as the requirement collapses the disjunction and reads "a designation tied to a jurisdiction rule" out of the definition entirely.

The deficit stays on the record where it belongs, as the standing limitation `claim_chennai_birth_local_registrar_office_unknown` (Grade Unknown, status `unknown`), which is correctly cited in no cell.

**Correction.** `/cells/owner/state` `mentioned` → `stated`; note rewritten as the actionable-value note section 9 requires of a `stated` cell, carrying the office-list limitation forward. Claim IDs corrected: `claim_chennai_birth_gcc_routes_offered` is removed — it enumerates four service routes and asserts the absence of guidance, and names no office, officer or role, so it cannot supply an actionable value; `claim_chennai_birth_portal_covers_from_2018` is added, since it is the claim that routes the citizen to the local body. The populated `searchedRoutes` array is left in place: section 9 does not require it on a `stated` cell, but it usefully records the two dead routes.

### F6 — The `owner` cell note addresses the auditor directly

**Severity:** correction
**Record:** `cells/owner` (`/note`)

**What the protocol requires.** Section 12: the audit "must not receive researcher reasoning or pass handoffs." Section 9 defines a cell note as an actionable-value note or a search note. Section 13: "The audit is isolated."

**What I observed.** The note ends: "Recorded for the auditor: this is thinner than a designation tied to a jurisdiction rule of the kind the cell definition admits, because nothing lets the citizen move from their address to a named office." That is an argument addressed to the audit about how to score the cell, carried into the audit's permitted input by being written inside the sidecar. Whatever its merit, routing advocacy through a permitted channel defeats the isolation the protocol builds. I decided F5 from the protocol text and the claims; the note's argument is recorded here and set aside.

**Correction.** Folded into the `/cells/owner/note` rewrite at F5, which states the evidence and the limitation without addressing the audit.

### F7 — `eligibility` is `stated`, but partly on excluded evidence

**Severity:** correction
**Records:** `cells/eligibility`; `claim_chennai_birth_portal_covers_from_2018`, `claim_chennai_birth_collect_within_30_days`, `claim_chennai_birth_institutional_collect_within_30_days`

**What the protocol requires.** Section 8, `eligibility`: "`stated` when the evidence gives a rule that decides who qualifies or which route applies." Section 2 scores the primary scenario only.

**What I observed.** The cell stands on its own on `claim_chennai_birth_portal_covers_from_2018`: registration date decides the route — portal download for events registered from 1 January 2018, the local body for earlier ones. That is squarely "a rule that decides ... which route applies", it is in scope, Grade B, `verified`, and directly observed. The cell state is not in doubt.

The other two cited claims are the same Rules 8(2) and 8(4) ruled out of scope at F3 — who may collect the extract at the moment of registration, one of them at the hospital counter the scenario excludes. Consistency requires they not support this cell either. Removing them does not change the state.

**Correction.** `/cells/eligibility/claimIds` reduced to the in-scope route rule; note rewritten to match. State unchanged at `stated`.

### F8 — Scope is not recorded on the two registration-flow claims that carried cells

**Severity:** correction
**Records:** `claim_chennai_birth_institutional_collect_within_30_days` (`/notes`), `claim_chennai_birth_uncollected_posted_in_fifteen_days` (`/notes`)

**What the protocol requires.** Section 8 lint item 7, "undeclared or incorrect scenario IDs"; section 2, "Tag every claim to at least one scenario"; section 1 (Auditor), "Downgrade or mark `contested` when evidence does not support the wording."

**What I observed.** Two claims need their scope recorded on the claim itself, not only in the cell notes.

`claim_chennai_birth_institutional_collect_within_30_days` states a rule about collection from the officer in charge of the institution — the hospital-side step the scenario summary excludes by name — yet it is tagged to the primary scenario and carries an empty note. The schema forbids an empty `scenarioIds` (`nonEmptyRefList`) and the ledger declares only one scenario, so the tag cannot simply be removed without deleting the claim; and deleting a true, Grade A, correctly sourced statement of the Rules would destroy evidence to fix a labelling problem. The proportionate remedy is to record the scope on the claim so it cannot silently carry cell weight again.

`claim_chennai_birth_uncollected_posted_in_fifteen_days` carries a note calling Rule 8(5) "the surface by which the family receives the certificate without asking again". That characterisation is the reading that carried `after-submission` to `stated`, and it does not survive the definition: the duty arises on the expiry of the post-registration collection period and answers to no submission by the citizen. The claim's text, Grade A, `basis` and `verified` status are all sound and stay as they are; only the note's characterisation is corrected.

`claim_chennai_birth_collect_within_30_days` needs nothing — its note already says honestly that the deadline is for "collecting the first extract".

**Correction.** `/notes` on the institutional-collection claim set from `""` to a note recording the excluded hospital-side scope; `/notes` on the posting-duty claim rewritten to record that it is triggered automatically rather than by a submission, so it is neither a post-submission surface nor a processing time for this scenario.

### F9 — Compound claims: section 8 lint item 1 is not visibly clean

**Severity:** note
**Records:** `claim_chennai_birth_gcc_routes_offered`, `claim_chennai_birth_gcc_download_needs_otp`, `claim_chennai_birth_extract_form_and_certification`, `claim_chennai_birth_extract_fee_200`, `claim_chennai_birth_search_fee_100`, `claim_chennai_birth_gcc_page_nav_404`, `claim_chennai_birth_crstn_service_routes_404`, `claim_chennai_birth_crstn_guidance_pdfs_404`

**What the protocol requires.** Section 1: "one claim asserts one checkable thing." Section 8 lint item 1 blocks audit on compound or list claims unless waived by record ID and reason. Section 13 permits the auditor to split compound claims.

**What I observed.** Several claims yoke more than one assertion. Two shapes recur:

1. A positive enumeration joined to a distinct negative absence finding — `..._gcc_routes_offered` ("offers four routes ... and no guidance text on fees, documents, timelines or offices") and `..._gcc_download_needs_otp` ("offers only registration ... and shows no fee, document list, timeline or office").
2. Two provisions of an instrument asserted together — `..._extract_form_and_certification` (Rules 8(1) and 13(2): the form number, and the manner of certification), and the two fee claims, each stating a base figure and an incremental one.

I have not split them, and I record the reasoning so it can be reviewed. Each of these records one act of observation of one page, or one fee schedule in one rule sub-clause, and each half is sourced identically; splitting would multiply records without adding a checkable fact or changing any cell state. Claims that list several instances of a single observed fact — the routes and files that returned HTTP 404 — I read as one checkable thing and not compound at all.

That said, no waiver is visible in the ledger for the shape-1 claims, and on the plain words of the lint they are compound. **The researcher should either split them or record a named waiver before publication.** Note that once the F5 correction removes `..._gcc_routes_offered` from the `owner` cell, no compound claim carries a cell state, so nothing in the shipped grid turns on this.

### F10 — Grading of the state portal home page as a source is correct

**Severity:** note
**Record:** `source_chennai_birth_crstn_portal` and the four claims resting on it

**What the protocol requires.** Section 4: "A department homepage or general-site reference; never use it as a specific citation" → Grade C. Section 7: "a department homepage is a `General-site reference`, and claims resting on it are Grade C, never presented as a specific source. Do not replace a dead specific page with a homepage." Section 1 and section 4: direct current observation of a public official interface is Grade B.

**What I observed.** The source is `https://crstn.org/`, a portal home page, and it is graded B. The homepage rule does not bite here, because the claims resting on it assert what that page itself displays — its free-download statement, its 2018 coverage rule, its section 7 recital — rather than borrowing the homepage as a stand-in citation for a fact documented on some other page. That is direct current observation of a public official interface, which sections 1 and 4 grade B.

The discipline the second half of the rule protects was also kept: the specific pages that would have carried procedures and a document list are recorded as returning HTTP 404 (`claim_chennai_birth_crstn_guidance_pdfs_404`) rather than quietly replaced by the home page. No correction.

### F11 — Evidence grades against the section 4 table

**Severity:** note

**What I observed.** Checked every claim.

- Grade **A** on the six Rules claims: correct. The Tamil Nadu Registration of Births and Deaths Rules, 2000 are subordinate legislation published in the Tamil Nadu Government Gazette Extraordinary (No. 976, Part III, Section 1(a), 29.12.1999, recorded as `publishedAt`), which is "a binding law, regulation, commission order, or gazette notification".
- Grade **B** on the live-observation claims (portal home page, GCC page, the 404 sweeps, the gccservices route): correct, and correctly not E — section 1 is explicit that direct current observation of a public official interface is B, with E reserved for genuine citizen accounts. There is no citizen evidence in this ledger, so no `scenario_citizen_reported` quarantine question arises.
- Grade **Unknown** on the two limitation claims: correct, and consistent with the schema's conditional, which waives the source requirement only for `Unknown`.
- No Grade B on a secondary source (lint item 3), no Grade C on an observed current official form (lint item 4). No secondary or citizen source appears at all.

**`basis`** (section 5) is sound throughout. The Rules and observation claims are `observation`; the two limitation claims are `inference`; `claim_chennai_birth_gcc_download_needs_otp` is `mixed` and its note explains the boundary as section 5 requires — "The observation is the page's own form; the inference is that the certificate lies past the OTP." Where an inference is carried in a note on an `observation` claim (the route-distinction reasoning on `..._extract_fee_200`, the speculation on `..._crstn_guidance_pdfs_404` that the Documents file "would have carried a document list"), the claim *text* remains observational, so `basis` is not misstated; but the second of those is unverifiable — the file 404'd — and should be read as conjecture, not as a finding about what the state omits.

### F12 — Archive records: compliant, with a live limitation

**Severity:** note
**Records:** `source_chennai_birth_gcc_page`, `source_chennai_birth_gccservices_route`

**What the protocol requires.** Section 11: capture an archive snapshot at access time for every public source and record the snapshot URL; if capture fails, record the access date, the failure, and a limitation. Section 14: "a Wayback snapshot or documented archival failure."

**What I observed.** Every source carries either a snapshot URL or a documented failure, so the gate is met. Two limitations are worth naming rather than passing over. `source_chennai_birth_gcc_page` points at a snapshot from 2022-07-11, more than four years before the access date, so the archive does not evidence the state the claims describe — the claims rest on direct current observation and are sound, but the snapshot cannot corroborate them if the page changes. `source_chennai_birth_gccservices_route` has no snapshot at all; the failure is recorded and the original official URL retained, exactly as section 11 directs, and no homepage substitute was introduced. In both cases the ledger records that no new capture was pushed from this run. No correction; recorded as a standing limitation.

### F13 — The OTP boundary is handled without overclaim

**Severity:** note
**Record:** `claim_chennai_birth_gcc_download_needs_otp`

**What the protocol requires.** Section 8 lint item 6, overclaims across a login or other authentication boundary; section 16, do not log in or use OTPs; section 8, "a boundary statement or `Unknown` claim records a limitation, not a positive cell value."

**What I observed.** The claim is confined to what the page shows before the boundary, its status is `partial`, its `basis` is `mixed` with the boundary explained, its note states "Boundary statement, recorded as a limitation and not used to support any positive cell value", and it is cited in no cell. The `after-submission` note explicitly declines to count the gated download as a surface. Nothing infers what lies past the OTP, and the meta disclaimer records that the boundary was not crossed and that the portal CAPTCHA was not attempted. This is correct on every count, and it survives the F4 correction — with `after-submission` at `mentioned`, the exclusion still holds.

### F14 — Unknown claims record only limitations

**Severity:** note
**Records:** `claim_chennai_birth_documents_for_copy_unknown`, `claim_chennai_birth_local_registrar_office_unknown`

**What I observed.** Both are Grade `Unknown`, status `unknown`, with empty `sourceIds` as the schema's conditional permits, and both are cited in no expectation cell — correct under section 8, which admits only `verified` or `partial` claims to a cell. Both notes state that the gap is not login-related but a dead public route, which keeps them out of the boundary category. Preserved as section 1 requires of the auditor ("Preserve unknowns"). No correction.

### F15 — `documents` = `mentioned` upheld; one phrase in the note overreaches

**Severity:** note
**Record:** `cells/documents`

**What the protocol requires.** Section 8, `documents`: "`stated` when the evidence gives an actionable document list or names a concrete document with a requirement to submit, provide, upload, produce, or attach it. A reference to documents without telling the citizen what is required is `mentioned`." Section 9 requires searched routes and a search note on a `mentioned` cell.

**What I observed.** No reviewed route names a single document a citizen must produce for a copy of an already registered birth. The topic is nonetheless touched — the portal's own menu carries a Documents item — so `mentioned` rather than `absent` is right, and the cell records six searched routes and a search note as section 9 requires.

One phrase overreaches: "the Rules impose no document requirement for an extract under section 17" asserts a negative reading of the whole instrument, where no claim in the ledger supports it and the honest statement is that none was found. The cell state is unaffected and I propose no correction, but the phrasing should be read as a not-found, not as a finding about the Rules.

### F16 — Structural checks

**Severity:** note

**What I observed.** All clean.

- **Schema.** Validates against `benchmark/schemas/ledger.json`: all nine top-level keys present, `meta` carries exactly its six required properties under `additionalProperties: false`, `schemaVersion` is the required `1.0.0`, every ID matches `^[a-z][a-z0-9]*_[a-z0-9_]+$`, every `type`, `evidenceGrade`, `basis` and `status` is in enum, and the conditional requiring at least one source on a non-`Unknown` claim holds for all fifteen graded claims.
- **Reference integrity.** Every `sourceIds` entry resolves to a declared source; every `scenarioIds` entry resolves to the declared scenario; `contradictsClaimIds` are empty throughout and, per F1, correctly so; no dangling reference in either direction.
- **Scenario.** Exactly one scenario, its ID matches the manifest's `primaryScenarioId`, tagged `primary`, with `pathNodeIds` empty as grid-only mode permits. Every claim is tagged to it (section 2); the scope objection to three of those tags is F3/F8, not a dangling-reference fault.
- **Dates.** All ISO `YYYY-MM-DD`. `meta.asOf` (2026-09-06) matches every source `accessedAt` and the audit date. The two sources without `publishedAt` each carry the visible-date note section 8 lint item 5 requires ("shows no visible last-updated or version date"), and the two with one record where the date is displayed.
- **Jurisdiction.** `meta.jurisdiction` and all seventeen claim `jurisdiction` strings read "Chennai, Tamil Nadu, India"; each source note records jurisdiction and the agency naming as displayed on the access date, per section 1.
- **Citation gate (section 7).** Green: every non-`Unknown` claim has a source; every source supplies a direct link, an exact access date, and a jurisdiction; no dead specific page was replaced by a homepage; and see F10 on the one home-page source.
- **Duplicate sources** (lint item 2): none — four distinct URLs.
- **Grid-only.** `nodes`, `edges`, `roadblocks`, `journeys` are empty and no portal sidecar exists, as the manifest's `grid-only` mode permits; not raised. No `researchedNoSourceFound` marker exists to verify, since there are no nodes.
- **Sidecar.** Exactly six cells, each with one state, matching section 9's cell list and the manifest's `primaryScenarioId`.

---

## Cell states accepted

| Cell | Sidecar | Audited | Basis |
| --- | --- | --- | --- |
| `cost` | stated | **stated** | Rule 13(1) fixes actual figures and the portal states an explicit zero for its own route; F1, F2 |
| `documents` | mentioned | **mentioned** | Topic named, no document required of the citizen anywhere on the reviewed routes; F15 |
| `eligibility` | stated | **stated** | Registration date decides the route; claim IDs trimmed to in-scope evidence; F7 |
| `time` | stated | **mentioned** | Every figure attaches to registration or hospital-side collection, both excluded by the scenario; F3 |
| `owner` | mentioned | **stated** | A designation of an operational role tied to a jurisdiction rule, which section 8 expressly admits; F5 |
| `after-submission` | stated | **mentioned** | Registration-stage duty is excluded by the definition; Form No. 5 is an outcome named without a surface; F4 |

**Verdict: cost stated, documents mentioned, eligibility stated, time mentioned, owner stated, after-submission mentioned — 3 of 6 cells stated.**

Corrections proposed: 13, in `birth-certificate.corrections.json`. Standing limitations after correction: no office list or contact route for the Chennai registrar (`claim_chennai_birth_local_registrar_office_unknown`); no document list for a copy of a registered birth (`claim_chennai_birth_documents_for_copy_unknown`); no processing period or service-level target for a request for a copy; no observed post-submission surface, the state portal's download route returning HTTP 404 and the corporation's sitting behind an uncrossed OTP; no archive snapshot for `source_chennai_birth_gccservices_route` and a four-year-stale one for `source_chennai_birth_gcc_page`; and section 8 lint item 1 unresolved for the claims named at F9.


## Re-audit — 2026-09-06 (IND-91 part B)

A fresh isolated auditor re-audited this row after pre-audit lint remediation, on the section 12 inputs only. 7 corrections were proposed and 7 applied; none unapplied.

# Re-audit: Chennai birth certificate (grid-only row)

Row: `ledger/jurisdictions/chennai/birth-certificate.json`, expectations `ledger/jurisdictions/chennai/expectations/birth-certificate.json`.
Manifest entry: `jurisdictionSlug` chennai, `serviceId` birth-certificate, `primaryScenarioId` `scenario_ind32_birth_copy_workflow`, `mode` grid-only, one lint waiver (`claim_chennai_birth_gcc_routes_offered_2`, compound-claim).
Protocol: v0.1. Audit date: 2026-09-06. Judged from the ledger and sidecar text as written; no URL was opened.

## Summary of cell verdicts

| Cell | Recorded | Audit verdict |
| --- | --- | --- |
| cost | stated | correct (claim set corrected for atomicity) |
| documents | mentioned | correct |
| eligibility | stated | correct |
| time | mentioned | **wrong — should be `stated`** |
| owner | stated | correct |
| after-submission | mentioned | correct |

Eleven findings. Seven corrections. One cell state change proposed: `time`, `mentioned` to `stated`.

---

## F1. `time` is recorded as `mentioned` although a Grade A verified claim gives an in-scope deadline (PROTOCOL section 8, `time` definition)

Record: expectations `/cells/time/state`, currently `mentioned`.

Section 8 defines `time` as `stated` "when the evidence gives an actionable duration, deadline, processing period, or service-level target", and reserves `mentioned` for "a reference to timing, delay, sequence, or processing without a figure or usable time rule". The same definition anticipates exactly the situation this row is in: "when the figure covers only one stage, the cell note must say so" — a stage figure keeps the cell `stated` and is handled in the note, it does not demote the cell.

The row holds a figure. `claim_chennai_birth_collect_within_30_days` (Grade A, `observation`, `verified`) records that Rule 8(2) allows the extract to be collected from the Registrar within 30 days of the reporting of a domiciliary birth reported directly to the Registrar; the claim's own note calls it "A deadline binding on the family for collecting the first extract."

The scenario summary puts that within scope. `scenario_ind32_birth_copy_workflow` covers "a certified copy **or first certificate** of a birth already registered in the city's civil register, by the municipal civil-registration route, public entry, online where offered and counter route otherwise", and its exclusions are delayed registration, name inclusion, corrections, births outside the city and *hospital-side* registration steps. Rule 8(2) is the Registrar-side route, not a hospital-side step, so the deadline attaches to a stage of this scenario. The cell note's reasoning — that the periods attach to the registration event rather than to a request for a copy — is a correct scope observation about Rule 8(4) and Rule 8(5), but it is applied too widely when it also disqualifies Rule 8(2).

Section 8's first rule is satisfied: only `verified` or `partial` claims may support `stated`, and the supporting claim is `verified` at Grade A.

Correction proposed: `/cells/time/state` `mentioned` to `stated`.

Consequence not proposed as a correction: `/cells/time/note` still opens "The topic is named without a usable time rule for this scenario" and must be re-authored to say that the figure covers the collection stage only and that no processing period, deadline or service-level target is published for a later copy request. Section 9 makes the expectations block human-authored, and this correction set's field paths are limited to `state` and `claimIds`, so the note is left to the official pass and is recorded here as an unapplied requirement.

## F2. Once `time` is `stated`, four of its six `claimIds` do not carry the cell's value (PROTOCOL sections 8 and 9)

Record: expectations `/cells/time/claimIds`.

Section 9 permits "optional topic-only `claimIds`" for `mentioned` and `absent` cells, which is why the present list is admissible at the present state. A `stated` cell instead records "its state, `claimIds`, and an actionable-value note", so its cited claims must supply the value.

Ruled out by the cell's own reasoning: `claim_chennai_birth_institutional_collect_within_30_days` and `claim_chennai_birth_institutional_collect_within_30_days_2` govern collection from the officer in charge of the institution, the hospital-side step the scenario excludes and which the claim notes themselves say "does not supply a value for any expectation cell of this scenario"; `claim_chennai_birth_uncollected_posted_in_fifteen_days` and `claim_chennai_birth_uncollected_posted_in_fifteen_days_2` place a duty on the Registrar or institution officer that is triggered by expiry of the collection period rather than by any citizen submission. `claim_chennai_birth_collect_within_30_days_2` names who may collect, not a duration.

Correction proposed: `/cells/time/claimIds` reduced to `claim_chennai_birth_collect_within_30_days`. The excluded periods stay in the ledger and belong in the re-authored note as scope limitations.

## F3. `claim_chennai_birth_extract_fee_200` is a compound claim and is not waived (PROTOCOL section 1; section 8 lint check 1)

Record: `claim_chennai_birth_extract_fee_200`, field `/text`.

The text asserts two separately checkable amounts: the fee for granting an extract (Rs. 200) and the fee for every additional copy (Rs. 200). Section 1 requires that "one claim asserts one checkable thing"; section 8 lint check 1 blocks "compound or list claims", and an unwaived finding blocks audit. The manifest entry waives one record only, `claim_chennai_birth_gcc_routes_offered_2`.

The row is also inconsistent with its own convention: the parallel Rule 13(1) search fee was split into `claim_chennai_birth_search_fee_100` and `claim_chennai_birth_search_fee_100_2` during the IND-91 part B remediation precisely because it "carried two amounts in one sentence". The extract fee has the same shape and was not split.

Corrections proposed: `/text` reduced to the extract limb; a new atomic claim `claim_chennai_birth_extract_fee_200_2` carrying the additional-copy limb with the same source, grade, basis and status; and `/cells/cost/claimIds` extended to cite it. No value changes, so `cost` remains `stated`.

## F4. `claim_chennai_birth_documents_for_copy_unknown_2` records an observation as Unknown/inference with no source, duplicating a Grade B claim (PROTOCOL sections 4, 5, 7, 13)

Record: `claim_chennai_birth_documents_for_copy_unknown_2`.

The text — "The one portal route that would carry a document list returned HTTP 404 on the access date" — is what an interface directly showed. Section 5: `observation` records what a source or interface directly shows, `inference` a conclusion drawn from it; the record says `inference`. Section 4 grades a "direct current observation of a public official interface" B, and reserves `Unknown` for "No usable source yet"; the record says `Unknown` and carries `sourceIds: []`, which is admissible under the section 7 citation gate only because Unknown claims are exempt from it. A usable source exists and is already in this ledger.

The same observation is already carried correctly by `claim_chennai_birth_crstn_guidance_pdfs_404` (Grade B, `observation`, `verified`, sourced to `source_chennai_birth_crstn_portal`), whose note states that "The Documents file is the one route on the portal that would have carried a document list for this service".

Correction proposed: delete the duplicate, which section 13 permits ("merge duplicates"). The genuine unknown, `claim_chennai_birth_documents_for_copy_unknown`, is preserved, as section 1 requires. No cell cites the deleted record, so no cell value moves. Its parent's note ("Split ... the reason for the gap is asserted separately") should be trimmed when the correction is applied.

## F5. `claim_chennai_birth_local_registrar_office_unknown_3` has the same defect (PROTOCOL sections 4, 5, 13)

Record: `claim_chennai_birth_local_registrar_office_unknown_3`.

"The corporation's zonal details route returned HTTP 404 on the access date" is a pure observation of a public official interface, recorded as `Unknown` / `inference` / `unknown` with no `sourceIds`. `claim_chennai_birth_gcc_page_nav_404` and `claim_chennai_birth_gcc_page_nav_404_2` already carry it at Grade B, `verified`, sourced to `source_chennai_birth_gcc_page`, naming zonal details among the failing header links.

Correction proposed: delete as a duplicate. The two genuine unknowns in the group, `claim_chennai_birth_local_registrar_office_unknown` and `_2`, are preserved, and the `owner` cell note cites the parent rather than this fragment, so nothing is left dangling.

## F6. Eight Grade B claims rest on a portal home page, against section 7's homepage rule — flagged, not corrected

Records: `source_chennai_birth_crstn_portal` (`https://crstn.org/`, titled "... portal home page") and the claims resting on it: `claim_chennai_birth_portal_download_free`, `claim_chennai_birth_portal_covers_from_2018`, `_2`, `claim_chennai_birth_registrars_by_local_area`, `_2`, `claim_chennai_birth_crstn_service_routes_404`, `_2`, `claim_chennai_birth_crstn_guidance_pdfs_404`, `_2`.

Section 7 says "a department homepage is a `General-site reference`, and claims resting on it are Grade C, never presented as a specific source", and section 4 repeats the C row. Section 4 also grades "direct current observation of a public official interface" B, and section 1 instructs the public-workflow pass to grade such observation B.

I do not propose a downgrade. The statements claimed here are text the home page itself displays, and the claims are worded as observations of that page ("The Tamil Nadu civil registration portal states that ..."), which is the section 4 B case rather than the section 7 case of citing a homepage as a stand-in for a specific page published elsewhere; section 7's related prohibition, "Do not replace a dead specific page with a homepage", is likewise about substitution and the ledger records the dead specific routes separately rather than substituting for them. Nothing turns on it for scoring in any event: section 8 admits a Grade A, B **or C** claim in support of `stated`, so `cost`, `eligibility` and `owner` would remain `stated` either way.

Residual exposure worth recording in the row's limitations: the source note documents the footer, the last-updated stamp and the CAPTCHA but does not say that the free-download statement, the from-2018 route rule and the section 7 registrar appointment text all appear on the home page itself. Adding that sentence would close the section 7 question on the face of the record.

## F7. Or-list claims and one unwaived multi-route claim (PROTOCOL section 8 lint check 1)

Records: `claim_chennai_birth_gcc_routes_offered_3`, `claim_chennai_birth_gcc_download_needs_otp_3`, `claim_chennai_birth_crstn_service_routes_404_2`, `claim_chennai_birth_crstn_guidance_pdfs_404`.

The first three are single negative sweep observations over a named set of topics or routes ("carries no guidance text on fees or documents or timelines or offices"; "shows no fee or required documents or timeline or office on the page"; "Those routes include the birth certificate download route or the child name inclusion route or the registration dashboard"). I read each as one check — the absence of a topic set on one page, or the membership of one tested set — and propose no correction.

`claim_chennai_birth_crstn_guidance_pdfs_404` is different. It merges the failure and the route list in one sentence across four distinct route requests (About Us file, Procedures file, Documents file, birth reporting form), against the convention the same remediation applied to `claim_chennai_birth_gcc_page_nav_404`, which was split into the failure, the affected links, the hosts tested and the working equivalents. It is unwaived on the manifest, and it is the load-bearing claim for the `documents` cell. I do not propose the split as a correction, because splitting the row's only support for a `mentioned` cell risks more drift than it removes, but the manifest's `lintWaivers` should either cover this record with a stated reason or the record should be split on the ledger's own pattern.

## F8. `documents` cites a claim that does not touch the topic, and its note asserts something no claim carries (PROTOCOL sections 8 and 9)

Record: expectations `/cells/documents/claimIds`, second entry `claim_chennai_birth_crstn_guidance_pdfs_404_2`.

That claim asserts that the Act and Rules PDFs resolved on the access date. It says nothing about what a citizen must produce, so it does not support the cell's state. I propose no correction: the cell is `mentioned`, where section 9 expressly allows "optional topic-only `claimIds`", and the claim records the boundary of what was reachable, which is why the Rules are citable while the guidance is not.

Related, and worth the researcher's attention: the cell note ends "and the Rules impose no document requirement for an extract under section 17". No claim in the ledger asserts that. Under section 3 an explicit "no documents required" would be a `stated` value; as an unclaimed note sentence it supports nothing and should either be carried by a claim or dropped. The cell state remains `mentioned` on the evidence as recorded — the portal's own menu names a Documents item and it returned 404, so the topic is named without an actionable value, which is the section 8 definition of `mentioned`.

## F9. `owner` cites one claim that names no office or role — retained (PROTOCOL section 8, `owner` definition)

Record: expectations `/cells/owner/claimIds`, entry `claim_chennai_birth_portal_covers_from_2018`.

That claim states that certificates for events registered from 1 January 2018 are downloaded from the portal; it identifies a route, not "the office, officer, or operational role that holds or decides the case". The cell's value comes from `claim_chennai_birth_registrars_by_local_area` and `_2` (a designation tied to a jurisdiction rule, which the definition expressly admits) and from `claim_chennai_birth_portal_covers_from_2018_2` (pre-2018 events go to the respective local body). I propose no correction because `_2` reads "for events prior to that date", whose referent exists only in the claim it was split from; removing the first limb would leave the cell citing a claim with a dangling date. The `stated` state is correct, and the cell correctly quarantines the missing office list as `claim_chennai_birth_local_registrar_office_unknown` rather than counting it.

## F10. Source dating and archive records (PROTOCOL section 11; section 8 lint check 5)

Records: `source_chennai_birth_gccservices_route`, and all four sources.

`source_chennai_birth_gccservices_route` has no `publishedAt` and a visible-date note ("Shows no visible last-updated date"), but no stated limitation on its currency, unlike `source_chennai_birth_gcc_page`, which records "Limitation: the page is undated, so its currency rests on the access-date observation alone". Lint check 5 covers "a stale or undated source without a stated limitation", and this is unwaived. One sentence closes it; I propose no correction rather than rewrite a long note field and risk drift on application.

Separately, section 11 requires an archive snapshot captured at access time for every public source. No source in this row was captured on 2026-09-06: three point at pre-existing Wayback snapshots (2026-05-19, 2026-06-13 and 2022-07-11, the last more than four years old) and each records the shortfall as a limitation, and the fourth records that the availability API returned no snapshot. The failures are documented as section 11 requires and no substitute homepage was used, so this is recorded as a standing limitation of the row rather than a correction.

## F11. `documents` searched routes do not cover every route its supporting claim names (PROTOCOL section 9)

Record: expectations `/cells/documents/searchedRoutes`.

The supporting claim names four failing routes — About Us file, Procedures file, Documents file, birth reporting form — but the cell lists `https://crstn.org/AboutUs/documents.pdf` and `https://crstn.org/AboutUs/FAQ.pdf` and no URL for the Procedures file or the birth reporting form (the About Us file URL appears under `owner` instead). The route that decides the cell is listed, so the section 9 requirement that a `mentioned` cell record searched route IDs or URLs is met in substance; the list should be completed so the record matches the claim it rests on. No correction proposed.

---

## Checks that passed

- Cell states `cost`, `documents`, `eligibility`, `owner` and `after-submission` match the section 8 definitions. `cost` gives amounts a citizen pays plus an explicit zero for the online route, recorded as a stated value under section 3 and correctly kept alongside the statutory fee as two routes rather than a contradiction. `eligibility` gives a rule deciding which route applies. `owner` gives a designation tied to a jurisdiction rule. `after-submission` names an outcome (the Form No. 5 extract, certified under section 76 of the Indian Evidence Act) with no status page, tracker, acknowledgement, receipt, rejection reason or downloadable result observed, which is the definition's `mentioned` case.
- The section 8 rule that only `verified` or `partial` claims may support `stated` or `mentioned` holds for every cell. The boundary claims `claim_chennai_birth_gcc_download_needs_otp`, `_2` and `_3` (`partial`, `mixed`) are cited by no cell and are recorded as limitations in the `after-submission` note, exactly as the rule requires. The five `Unknown` claims are cited by no cell.
- No cell rests on a login-boundary crossing. The OTP boundary was not crossed, no login was used and the CAPTCHA was not attempted, consistent with section 16.
- Evidence grades match section 4 elsewhere: Rules PDF claims Grade A as a regulation; direct observations of the GCC page, the gccservices route and the portal Grade B, not E, per section 1 and section 4.
- Basis matches section 5 elsewhere: observations of page contents and HTTP responses are `observation`; the `mixed` boundary claims explain the boundary in `notes`; the true unknowns are `inference`.
- Citation gate, section 7: every non-`Unknown` claim carries at least one source; sources carry direct link, ISO access date, jurisdiction text specific to Chennai, Tamil Nadu, India, and agency naming as displayed on the access date. No dead specific page was replaced by a homepage.
- Schema, `benchmark/schemas/ledger.json`: required keys present; ids match the id pattern; every `scenarioIds`, `sourceIds` and `contradictsClaimIds` reference resolves; the conditional requiring at least one source for non-`Unknown` claims holds. Grid-only mode is consistent with empty `nodes`, `edges`, `roadblocks` and `journeys`, and with no `researchedNoSourceFound` markers to verify under section 6.
- Scenario policy, section 2: exactly one scenario, matching the manifest `primaryScenarioId`; every claim tagged to it; no aliases.
