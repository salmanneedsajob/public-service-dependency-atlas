# Audit — water-connection (Bengaluru grid-only)

- **Service:** `water-connection`
- **Jurisdiction:** Bengaluru, Karnataka, India
- **Primary scenario:** `scenario_ind32_water_residential`
- **Audit date:** 2026-09-06
- **Benchmark version:** 0.1
- **Mode:** grid-only (no nodes, edges, roadblocks, journeys; no portal sidecar — absence not raised as a finding)
- **Inputs received:** integrated ledger, expectations sidecar, `benchmark/schemas/ledger.json`, `benchmark/PROTOCOL.md`, `benchmark/schemas/corrections.json`, and the manifest entry. Nothing else.

---

## Findings

### F1 — blocking — `claim_bengaluru_grid_water_english_route_not_carried` fails the section 7 citation gate

**Protocol requires.** Section 7: every non-`Unknown` claim needs at least one source; a source supplies the direct link, exact access date and jurisdiction; and citations must resolve to specific pages. Section 1 (auditor) permits downgrading, or marking `contested`, when the evidence does not support the wording.

**Observed.** The claim asserts an observation about **the board's corporate site** — that its English language route did not carry through to *its contact information and office location pages*, which rendered in Kannada. Its only cited source is `source_bengaluru_grid_water_owc_portal`, whose URL is `https://owc.bwssb.gov.in/` and whose own source note describes it as the Jaladhare consumer portal offering OTP login, consumer user manuals, an important-documents route and a public application-status route. That source record does not cover the corporate site at `bwssb.karnataka.gov.in`, and no source record anywhere in the ledger covers it. The three corporate-site URLs the claim is actually about — `https://bwssb.karnataka.gov.in/en`, `.../BWSSB+Office+location/en`, `.../Contact+Us/Contact+Info/en` — appear only in the owner cell's `searchedRoutes`, which record that a route was searched and are not sources.

The claim is therefore uncited for what it asserts, while carrying `status: verified`, `evidenceGrade: B`, `basis: observation`, and while being cited in a scored expectation cell.

**Resolution.** Status downgraded `verified` → `contested` and the reason recorded in the claim's `notes` (corrections 1 and 2). The observation is **retained**, not deleted — section 6's spirit and section 13's limits both point that way, and the auditor may not invent a source record for pages it did not see. The grade stays `B`: grade describes the strength of the kind of source, and a direct observation of a public official interface would be B if a source record for it existed. Adding such a record would require inventing an access date, the agency naming displayed, and an archive result, which section 13 forbids.

### F2 — correction — the owner cell scores a claim that F1 downgrades

**Protocol requires.** Section 8: only `verified` or `partial` claims may support `stated` or `mentioned`.

**Observed.** `cells.owner.claimIds` cites `claim_bengaluru_grid_water_english_route_not_carried`, which F1 marks `contested`. The cell's `note` also states the unsupported observation as an established fact.

**Resolution.** The claim id is removed from `cells/owner/claimIds` and the closing clause of `cells/owner/note` is rewritten to record the route as searched and the claim as contested (corrections 3 and 4). The cell's **state does not change**: it is still carried by `claim_bengaluru_grid_water_toll_free_and_helpdesk` and `claim_bengaluru_grid_water_status_shows_stage_and_officer`, both `verified`. The corporate-site URLs remain in `searchedRoutes`, which is correct — they were searched, and a `mentioned` cell is required to record searched routes.

### F3 — correction (not mechanically applicable) — `source_bengaluru_grid_water_fee_documents` has neither `publishedAt` nor a visible-date note

**Protocol requires.** Section 8, lint item 5: source-date quality — missing `publishedAt` without a visible-date note, or a stale or undated source without a stated limitation. An unwaived lint finding blocks audit.

**Observed.** Of the five sources, `source_bengaluru_grid_water_owcv2_consumer` and `source_bengaluru_grid_water_owc_portal` carry no `publishedAt` but each states "no visible last-updated date"; `source_bengaluru_grid_water_consumer_manual` and `source_bengaluru_grid_water_tariff_2025` carry `publishedAt`. `source_bengaluru_grid_water_fee_documents` carries neither a `publishedAt` nor any statement about whether the route shows a date. Two claims rest on it, including one of the five cost-cell claims.

**Resolution.** No correction is proposed. The fix is an observation this audit does not hold, and section 13 bars inventing one. This ships as a stated limitation: the important-documents route's currency is undocumented, and the finding must be closed by a fresh observation of that route or by a named waiver in the handoff.

### F4 — note — `cost` accepted at `mentioned`; it is neither `stated` nor `absent`

**Protocol requires.** Section 8: `cost` is `stated` when the evidence gives an amount a citizen pays or an actionable fee schedule; a fee described only as prescribed, or a payment step without an amount, is `mentioned`; `absent` means the reviewed evidence does not touch the topic.

**Observed and decided.** Naming every component and publishing a document for each does **not** amount to an actionable fee schedule when no figure could be read from any of those documents. "Actionable" is a property of what the evidence gives the citizen, not of the publisher's filing practice. The ledger is careful about this: `claim_bengaluru_grid_water_rate_documents_unreadable` records the unreadability as a limitation on this run's reach and explicitly declines to claim what the documents contain, so the ledger holds **no** evidence of any amount. A cell cannot be `stated` on a schedule whose values are not in evidence — that would be scoring an assumption about the scans rather than the record.

`absent` is equally wrong: the topic is touched more thoroughly than in most rows. The board names application fee, attachment fee, inspection charges, three months minimum deposit, meter cost for mechanical and AMR meters, sanitary point charges, GBWASP and BCC charges, prorata charges, and line cost "as per actuals"; it publishes a route titled *Know Your Connection Fees*; and the application form must be bought. Three of these map directly onto section 8's own `mentioned` examples — "line cost as per actuals" is a fee described only as prescribed, and buying the application form is a payment step without an amount.

All five cited claims are `verified`, so all are admissible support for `mentioned`. `mentioned` stands. Worth recording plainly: this cell reads as a documentation failure of an unusual kind — the publisher answered the question in a form no reader can use, and the one route that promises the total returns a zero-byte file.

### F5 — note — `owner` accepted at `mentioned`; the assigned officer may support the cell, but only at `mentioned`

**A premise correction first.** There is no rule at section 3 that personal case surfaces behind login are private by right rather than a documentation failure. Section 3 is the explicit-zero rule and says nothing about login. The protocol's actual handling of the login boundary is in section 1 (public-workflow: mark anything requiring login `unknown`), section 8 lint item 6 (overclaims across an authentication boundary), and section 10 (login- or case-data-bound surfaces remain unknown rather than inferred). This audit decides the cell on section 8's `owner` definition and those rules, not on the stated premise.

**Protocol requires.** Section 8: `owner` is `stated` when the evidence lets a citizen identify the office, officer or operational role that holds or decides the case — a specific office list, a designation tied to a jurisdiction rule, or a contact route for that role. A statutory designation or general agency name alone is `mentioned`. Only `verified` or `partial` claims may support a cell; a boundary statement records a limitation, never a positive value.

**Observed and decided.** `claim_bengaluru_grid_water_status_shows_stage_and_officer` **is not a boundary claim**. It is a `verified`, Grade B, `observation` claim about what a public consumer manual states, read without login; the boundary claim is `claim_bengaluru_grid_water_login_boundary`, which is separate, `partial`, `basis: mixed` with the boundary explained in its notes, and correctly cited by no cell. So the assigned-officer claim is admissible support and *can* carry the cell — at `mentioned`.

It cannot carry `stated`. A per-application assigned officer gives the citizen no name, no designation, no office and no jurisdiction rule before they apply; it is not a specific office list, not a designation tied to a jurisdiction rule, and not a contact route for the deciding role. It names the topic — someone holds the case — and gives nothing to act on. That is the definition of `mentioned`. The remaining support, `claim_bengaluru_grid_water_toll_free_and_helpdesk`, is institutional contact: a helpline is a route into the board, not a route to the role that decides. Its own note says so, correctly.

`mentioned` stands, on two claims after F2.

### F6 — note — `time` accepted at `mentioned`; counting stages does touch the timing topic

**Protocol requires.** Section 8: `time` is `stated` on an actionable duration, deadline, processing period or service-level target; "a reference to timing, delay, **sequence**, or processing without a figure or usable time rule is `mentioned`."

**Observed and decided.** A count of stages completed is a reference to sequence and to processing progress. Section 8 names sequence and processing explicitly as topic-touching, which settles it: the cell is `mentioned`, not `absent`. `absent` would require the reviewed evidence not to touch the topic at all, and it does. No figure, deadline or service-level target appears on any reviewed route, so `stated` is unavailable; the sidecar note says this and adds, correctly, that the only dated statement anywhere on the reviewed routes is a notice that expired in July 2021. The one supporting claim is `verified`. The "figure covers only one stage" proviso does not apply — there is no figure.

### F7 — note — `after-submission` accepted at `stated`; and the cell is not restricted to public surfaces

**Protocol requires.** Section 8: `after-submission` is `stated` only when the evidence identifies something the citizen sees after submitting — a status page, tracker, acknowledgement, receipt, rejection reason or downloadable result. A step at or before submission, including payment, is not after-submission evidence.

**Observed and decided.** The definition asks what the *citizen* sees after submitting. It does not require that surface to be reachable without login, and no other section imposes that restriction; what the login rules bar is *inferring* about gated surfaces, which is a different thing. The manual-derived claims here do not infer: each is scoped as "the board's consumer user manual states that…", which is an observation of a public Grade B document about what the board documents, not an assertion that an unseen screen behaved a certain way. That scoping is done consistently and well across every manual claim in this ledger and is the reason lint item 6 does not fire.

Even on the narrowest reading the cell survives on public evidence alone: `claim_bengaluru_grid_water_public_status_routes` identifies two application-status routes reachable without login, and a status page is the first item in section 8's own list. The acknowledgement, the demand note generated on approval and the payment receipt are all post-submission surfaces; the *payment step* is excluded by section 8 but the *receipt* is expressly included, and the cell does not rest on the step.

`stated` stands.

### F8 — note — Grade B retained on `source_bengaluru_grid_water_owcv2_consumer` despite the notice that expired in 2021

**Protocol requires.** Section 4: B covers a current official procedure, form, service portal, circular or agency page, including direct current observation of a public official interface; C covers archived, undated, or visibly outdated official material, with the date and limitation stated.

**Observed and decided.** B is right for claims other than the notice itself. The page is the board's live consumer entry point, served and directly observed on the access date — the exact case section 4 grades B. A single expired banner about demand-note validity is one element of a live page, not evidence that the page's procedural content is archived or superseded; treating it otherwise would make B unreachable for any government page carrying an old notice. The currency limitation is properly stated in the source note and again in `meta.disclaimer`, which is what section 4's C row and lint item 5 require of a source whose currency is in question. `claim_bengaluru_grid_water_stale_notice` is itself correctly B: it asserts only that the page carries the notice, which was observed, not that the notice is in force.

### F9 — note — claim atomicity: single published enumerations accepted; heterogeneous bundles flagged, not split

**Protocol requires.** Section 1: one claim asserts one checkable thing. Section 8 lint item 1: compound or list claims. Section 13: the auditor may split compound claims.

**Observed and decided.** The line taken, applied consistently: reproducing one published enumeration from one source — a document list, a tariff table, a fee-component list, one screen's contents — is one checkable thing, and splitting it would fragment the evidence without improving it. On that basis `claim_bengaluru_grid_water_documents_required`, `claim_bengaluru_grid_water_recurring_tariff`, `claim_bengaluru_grid_water_rate_components_published` and `claim_bengaluru_grid_water_status_shows_stage_and_officer` are accepted as written. Notably, `claim_bengaluru_grid_water_status_shows_stage_and_officer` supports three different cells (`time`, `owner`, `after-submission`) from three different elements of one screen description; that is uncomfortable, but each cell's note isolates the element it relies on, no cell state turns on the bundling, and the same atomicity rule that would split it would also split the document list.

Three claims do bundle assertions of genuinely different kinds and would be cleaner split, though no cell state depends on the difference and no correction is proposed:

- `claim_bengaluru_grid_water_mandatory_documents_manual` — a document list, plus an upload count limit, plus a file-size limit.
- `claim_bengaluru_grid_water_application_form_purchased` — a five-step sequence (log in, supply contact details, pay to buy the form, fill, upload).
- `claim_bengaluru_grid_water_toll_free_and_helpdesk` — a phone number, plus four separately linked routes.

One wording point on `claim_bengaluru_grid_water_rate_components_published`: it ends "and states that line cost is charged as per actuals", which is a content assertion embedded in a publication claim, and read carelessly it appears to contradict `claim_bengaluru_grid_water_rate_documents_unreadable`. It does not: the component names and the "as per actuals" wording are readable page text and link labels on the consumer routes, while the unreadable material is the linked scans. No contradiction link is warranted, and none is present.

### F10 — note — `basis` discipline holds; no claim asserts what a route returns on the strength of having read it

**Protocol requires.** Section 5: `observation` records what a source or interface directly shows, `inference` records a conclusion drawn from it, `mixed` must explain the boundary in `notes`.

**Observed.** Every assertion about a return is backed by a retrieval, not by reading a link: `claim_bengaluru_grid_water_know_your_fees_empty` reports a zero-byte file that was fetched; `claim_bengaluru_grid_water_rate_documents_unreadable` reports files that "were retrieved". The counter-case is handled explicitly and correctly — `claim_bengaluru_grid_water_public_status_routes` states that the routes and their fields were observed and that "nothing was entered, so no claim is made about what they return", which is exactly the right restraint and keeps the after-submission cell clean. The three `Unknown` claims are `inference`, which is right for a conclusion drawn across the reviewed set. `claim_bengaluru_grid_water_login_boundary` is `mixed` and its notes explain the boundary, satisfying section 5.

One weakness, no correction: `claim_bengaluru_grid_water_know_your_fees_empty` reports a retrieval of `.../Know_your_connection_fees.pdf`, but its cited source record (`source_bengaluru_grid_water_owcv2_consumer`) does not document that retrieval the way `source_bengaluru_grid_water_fee_documents` documents its own. The citation is accepted — the download is a sub-resource of the same portal, reached from the observed page, and the source title names the rates route — but the source record would be stronger for recording it.

### F11 — note — `Unknown` claims and the boundary claim are correctly excluded from every cell

**Protocol requires.** Section 8: only `verified` or `partial` claims may support `stated` or `mentioned`; a boundary statement or `Unknown` claim records a limitation, not a positive cell value. Section 7 and the ledger schema exempt `Unknown`-grade claims from the source requirement.

**Observed.** The three `Unknown` claims (`..._connection_charge_unknown`, `..._timeline_unknown`, `..._deciding_office_unknown`) carry `evidenceGrade: Unknown`, `status: unknown`, empty `sourceIds` — schema-valid and gate-exempt — and are cited by no cell. `claim_bengaluru_grid_water_login_boundary` is `partial` and so would be *eligible* to support a cell, but is cited by none; its own note says it is "not used to support any positive cell value". Both handled correctly. This is the part of the ledger that most clearly preserves its unknowns rather than converting them into scores.

### F12 — note — no cell is scored from evidence belonging to an excluded route

The scenario excludes bulk and high-rise connections, commercial use, regularisation, name transfer and tanker supply. Nothing scored touches those. The nearest risk is `claim_bengaluru_grid_water_recurring_tariff`, a full readable tariff schedule that could tempt a `stated` cost cell; it is correctly kept out of `cells.cost.claimIds`, with both the claim note and the cell note stating why — it is what a household pays once connected, not what obtaining the connection costs. The EMI route and the 110-village route scored under `eligibility` are residential routes within the scenario, not exclusions.

### F13 — note — archive handling meets section 14 as written, by documented failure rather than capture

Four of the five sources have no snapshot; each records the access date, the failed lookup and the limitation, and retains the original official URL, which is what section 11 requires when capture fails and what section 14 accepts as "documented archival failure". One source carries a real snapshot. The weakness worth naming: each note reports that "the Wayback availability API returned no snapshot" and that "no new capture was pushed from this run" — a lookup finding nothing is not the same as attempting the capture section 11 asks for at access time. Compliant as written; a stronger run would push captures.

### F14 — note — `meta.disclaimer` repeats the statement F1 downgrades; not addressable, raised as a limitation

`meta` is not an addressable `recordType` under the pointer contract, so no correction is proposed. For the integrator: `meta.disclaimer` asserts that "the board's English-language route does not carry through to its contact and office-location pages, which render in Kannada". After F1 that statement rests on a `contested` claim with no source record for the pages observed. Either source the corporate-site pages properly and restore the claim, or soften the disclaimer clause to a searched-route limitation. The disclaimer is otherwise accurate against the record: every rate document a one-page scan, the *Know Your Connection Fees* route returning a zero-byte file, the amount computed past a login not crossed, and four of five source URLs without a snapshot — all four check out against the claims and sources.

### F15 — note — reference integrity, dates, jurisdiction strings and scenario tags are clean

Twenty claims and five sources; every `sourceIds` and `scenarioIds` entry resolves; every sidecar `claimIds` entry resolves to an existing claim. All record ids match the schema id pattern. Every date is ISO `YYYY-MM-DD` and every `accessedAt` is `2026-09-06`, matching `meta.asOf`. Every claim carries the jurisdiction string "Bengaluru, Karnataka, India", matching `meta.jurisdiction` and the manifest. Every claim is tagged to `scenario_ind32_water_residential`, the manifest's `primaryScenarioId`, which is the sidecar's `primaryScenarioId` and the only scenario in the ledger; no aliases, no undeclared ids. Every source note carries the jurisdiction and the agency naming as displayed on the access date. Six authored cells are present. `contradictsClaimIds` is empty throughout and no genuine contradiction was found requiring a link: the entry page's document list and the manual's differ only in that the manual's list is introduced as non-exhaustive ("mandatory documents include") and adds the road cutting endorsement, which is addition, not conflict. `nodes`, `edges`, `roadblocks` and `journeys` are empty as grid-only mode permits.

### F16 — note — no explicit-zero value was suppressed

Section 3 requires an explicit zero to be recorded as `stated`. The reviewed evidence contains none for this service — the application form is bought rather than free, and no route states a nil fee, a nil upload requirement or a nil eligibility condition. Nothing to record.

---

## Unresolved limitations for the integrator

1. F3: `source_bengaluru_grid_water_fee_documents` has neither `publishedAt` nor a visible-date note (lint item 5). Not mechanically correctable from audit inputs; close by re-observation or a named waiver.
2. F14: `meta.disclaimer` repeats the English-route statement downgraded by F1; `meta` is not addressable by a correction.
3. The corporate site `bwssb.karnataka.gov.in` was searched for the owner cell but has no source record. Until one exists, no claim about that site can be cited.
4. Cost, time and owner rest on documented absence rather than on published values; the cost absence is partly a login boundary and partly published documents that cannot be read at all.

---

## Verdict

Accepted cell states, after the four corrections in `water-connection.corrections.json` are applied:

| Cell | State |
| --- | --- |
| cost | `mentioned` |
| documents | `stated` |
| eligibility | `stated` |
| time | `mentioned` |
| owner | `mentioned` |
| after-submission | `stated` |

**Verdict: cost mentioned, documents stated, eligibility stated, time mentioned, owner mentioned, after-submission stated — stated count 3 of 6.**

No cell state proposed by the sidecar is changed by this audit. Corrections proposed: 4.
