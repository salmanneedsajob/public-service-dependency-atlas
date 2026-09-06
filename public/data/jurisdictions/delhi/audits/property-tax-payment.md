# Audit — Delhi property-tax payment

- **Service:** property-tax-payment
- **Jurisdiction:** Delhi, NCT of Delhi, India
- **Primary scenario:** `scenario_property_tax_payment_known_sas_pid` — current year's payment on a residential property already on the register with a known identifier; first-time assessment, mutation, arrears disputes and commercial property excluded
- **Audit date:** 2026-09-06
- **Benchmark version:** 0.1
- **Mode:** grid-only (no nodes, edges, roadblocks, journeys or portal sidecar; their absence is not a finding)
- **Corrections proposed:** 10

---

## Findings

### 1. correction — `expectation:property-tax-payment` `/cells/documents` — `stated` is not supported for this scenario

**Protocol requires.** Section 8: `documents` is `stated` when the evidence gives an actionable document list or names a concrete document with a requirement to submit, provide, upload, produce or attach it; "a reference to documents without telling the citizen what is required is `mentioned`". Section 2: the six-cell grid scores the manifest-declared primary scenario only.

**Observed.** The cell is `stated` on a single claim, `claim_delhi_ptax_documents_required`, which reports the citizen charter's document row for **property tax return filing (House Tax)**: the applicant's ID proof and a property document containing the property address. Three things count against `stated` here.

- The two items named are the inputs that establish a property and an owner. The primary scenario is a payment on a property *already on the register with a known UPIC*, and it explicitly excludes first-time assessment and mutation. A document that proves the property address is exactly what a known-identifier payment does not need.
- The sidecar's own note concedes the problem — "the charter does not distinguish the payment case from first-time filing" — and then scores the cell `stated` anyway. A source that does not distinguish the primary scenario from an excluded route does not tell *this* citizen what is required.
- No payment-route source corroborates it. `source_delhi_ptax_ptr_portal_info` and `source_delhi_ptax_rbd_page_taxpayer_block`, the two pages that actually describe paying, state no document requirement, and the surface that would state one sits behind citizen login with an OTP and a CAPTCHA (`claim_delhi_ptax_payment_behind_login_and_captcha`, correctly recorded as a boundary limitation).

The topic is named and a topic-only claim exists, so the correct state is `mentioned`, not `absent`. I did **not** score an explicit zero under section 3: no reviewed route states that no document or upload is required, and the auditor may not supply that absence. The claim itself is accurate about what the charter lists and is not downgraded; only its note, which reads as the rationale for a `stated` cell, is corrected to record the scope limitation. Searched routes are added because section 9 requires them for a `mentioned` cell; the three URLs added are the public routes already recorded as sources and accessed on 2026-09-06, not new research.

**Applied symmetrically.** The same charter row also feeds `eligibility` and `time`, and I did not downgrade those. The distinction is scope-sensitivity, not source identity: a document list is intrinsically transaction-specific, whereas "the facility is for the general public holding residential or commercial property under MCD's jurisdiction" is true of the payment case whichever route brought the citizen there, and it is joined by two payment-route rules from the portal (`claim_delhi_ptax_upic_mandatory`, `claim_delhi_ptax_portal_registration_mandatory`). Likewise the charter's "Property Tax Receipt - Instant" figure is corroborated in the payment route by `claim_delhi_ptax_receipt_download`. `documents` is the only cell whose sole support is the charter's generic row with no payment-route corroboration.

### 2. correction — `expectation:property-tax-payment` `/cells/after-submission` — cell survives as `stated`, but one cited claim is not after-submission evidence

**Protocol requires.** Section 8: `after-submission` is `stated` only when the evidence identifies something the citizen sees after submitting — a status page, tracker, acknowledgement, receipt, rejection reason or downloadable result; a step at or before submission is not after-submission evidence.

**Observed.** The cell cites three claims. `claim_delhi_ptax_receipt_download` — the public taxpayer instructions tell the taxpayer to download the tax payment receipt for future reference — is a downloadable result that exists only after payment, is Grade B, `verified`, `observation`, and is read from a public page rather than from behind the login. It carries the cell on its own, and it is not an overclaim across the login boundary: the claim asserts what the public instruction says, not what the authenticated receipt screen shows. `claim_delhi_ptax_receipt_instant_sla` corroborates it. The cell is accepted as `stated`.

`claim_delhi_ptax_tax_due_certificate_route`, however, records a public "Generate Tax Due Certificate" route reachable at any time, including before any payment is made. It is not something the citizen sees *after submitting*, so under section 8 it cannot support this cell. It is removed from the cell's `claimIds` and from the cell note; the claim itself stays in the ledger unchanged.

### 3. correction — `claim_delhi_ptax_portal_registration_mandatory` — compound claim

**Protocol requires.** Section 1: one claim asserts one checkable thing, and the auditor may split compound claims. Section 8 lint item 1 flags compound or list claims; no waiver is visible in the audit inputs.

**Observed.** The claim asserts two separable obligations from the same instruction block: that registration on the MCD portal is mandatory for all taxpayers, and that all property tax must be filed through the MCD portal only. The first is a prerequisite, the second a route-exclusivity rule; each is independently checkable and could be falsified alone. Split into `claim_delhi_ptax_portal_registration_mandatory` (registration) and a new `claim_delhi_ptax_portal_only_filing` (portal-only filing), same source, grade, basis and status, and no new evidence introduced. The `eligibility` cell's `claimIds` gain the new claim so the cell's evidence is unchanged in substance.

By contrast, `claim_delhi_ptax_documents_required` enumerates a two-item list but asserts one checkable thing — what the charter's document row lists — and is left intact.

### 4. blocking — `source_delhi_ptax_rbd_page_taxpayer_block` and `source_delhi_ptax_rate_schedule_2025_26` — no agency naming as displayed on the access date

**Protocol requires.** Section 1: for every source, record the exact access date, jurisdiction, and agency name **as displayed on that access date**. Section 14 repeats it as a done criterion: public sources include visible agency naming, access date, and a Wayback snapshot or documented archival failure.

**Observed.** Two of the four sources carry the naming line ("Agency naming as displayed on the access date: ..."); these two do not. The `publisher` field says "Municipal Corporation of Delhi", but that is the record's own attribution, not naming observed on the page. This is material rather than cosmetic: `source_delhi_ptax_rbd_page_taxpayer_block` is a births-and-deaths page being cited in a property-tax ledger, so what naming it displayed is exactly the thing a reader needs in order to accept the citation, and it is the source under the claim that carries the `after-submission` cell.

**No correction proposed.** Supplying the displayed naming would be inventing evidence (section 13). It must be re-observed by the official-source pass, or recorded as a stated limitation by that pass. Access dates, jurisdictions and archive status are otherwise complete: three existing Wayback snapshots are recorded, and `source_delhi_ptax_ptr_portal_info` records a documented capture failure with the original URL retained, which section 11 permits.

### 5. note — `expectation:property-tax-payment` `/cells/time` — cell note asserts a portal warning that no claim records

Section 9 requires a `stated` cell's note to carry the actionable value; section 7's citation gate requires claim-source references to be present and valid. The note ends "no timeline is published for the scrutiny step the same portal warns about". No claim in this ledger records any portal warning about a scrutiny step, so the clause is an assertion the audit inputs cannot check. Corrected to the claim-supported form. The cell state is unaffected, and the section 8 requirement that a one-stage figure be flagged in the note is satisfied either way.

### 6. note — `/cells/cost` tested upward and held at `mentioned`

Section 8 makes a published rate schedule a `stated` cost cell when it amounts to an *actionable* fee schedule, so I tested for an upward correction and rejected it on three independent grounds. The latest schedule on the portal is for FY 2025-2026 while the current financial year on the access date is 2026-2027, so it is not the schedule for the year this scenario pays; the 2026-2027 route returned an HTML page rather than a schedule (`claim_delhi_ptax_rate_schedule_latest_is_2025_26`). The file is a scanned PDF with no text layer, and the source record is explicit that "only the existence, title and financial year of the schedule are recorded, never its contents" — so no claim in the ledger states any rate, and a cell may only be scored from cited evidence. Raising the cell would require reading figures nobody read, which section 13 forbids. The two rebate percentages that *are* published are discounts on an amount no reviewed route states, which section 8 places under "a payment step without an amount". `mentioned` stands, with five searched routes recorded as section 9 requires.

### 7. note — `/cells/owner` tested upward and held at `mentioned`

Section 8 allows `stated` on a specific office list, a designation tied to a jurisdiction rule, or a contact route for the deciding role. The zone, ward and colony mapping with twelve named zones is a jurisdiction mapping that locates a property, but it names no office, officer or role that holds or decides a payment case, and it is itself dated "as on 27.08.2024"; `support-mcd@mcd.nic.in` is a general portal helpdesk, not a contact route for the deciding role; "Property Tax Department" is a general agency name, which section 8 places explicitly under `mentioned`. Three searched routes are recorded, including the one that 404s. `mentioned` stands. `claim_delhi_ptax_charter_key_contacts_empty` and `claim_delhi_ptax_know_your_corporation_dead` appear in the cell note but not in `claimIds`; `claimIds` are optional on a `mentioned` cell, so this is left alone.

### 8. note — contradiction handling is correct, and no contested claim is cited by any cell

`claim_delhi_ptax_advance_rebate_ten_percent` and `claim_delhi_ptax_advance_rebate_fifteen_percent` are both retained, both `contested`, reciprocally cross-linked through `contradictsClaimIds`, and neither is resolved by intuition — section 1 as written. The section 8 test is the sharper one: only `verified` or `partial` claims may support `stated` or `mentioned`, so a `contested` record may not be cited by a cell at all. Neither appears in any cell's `claimIds`. The uncontested residue was correctly isolated into a separate claim: `claim_delhi_ptax_advance_rebate_deadline` (`verified`) carries only the 30 June date the two pages agree on, and is what the `cost` and `time` cells cite. This is the right shape and needs no correction.

### 9. note — boundary and `Unknown` records are correctly excluded from every positive cell

Section 8: a boundary statement or `Unknown` claim records a limitation, not a positive cell value. `claim_delhi_ptax_payment_behind_login_and_captcha` (`partial`, basis `mixed`) is cited by no cell, and its notes name the observation/inference boundary as section 5 requires — the login form and its instructions observed, the location of the pay-tax action inferred. `claim_delhi_ptax_current_year_amount_unknown` is `unknown`/`Unknown`/`inference` with no sources, which the schema permits and section 7 exempts from the citation gate, is cited by no cell, and correctly separates the public calculator route (not exercised, because entering a real identifier is outside the safety boundary) from the login boundary. `claim_delhi_ptax_rate_schedule_not_machine_readable` is likewise a limitation and cited by no cell. I found no claim asserting anything about a post-login surface; the safety boundary appears to have been respected.

### 10. note — citation gate, dates, tags and reference integrity pass

Every non-`Unknown` claim carries at least one source. No citation rests on a department homepage; the dead "Know your corporation" link is recorded as observed rather than replaced by a homepage, as section 7 demands. All dates are ISO and all four `accessedAt` values equal `meta.asOf` (2026-09-06). Every claim carries the jurisdiction string "Delhi, NCT of Delhi, India", matching `meta` and the manifest. Every claim is tagged to the primary scenario and to no undeclared scenario. Every `sourceIds`, `contradictsClaimIds` and sidecar `claimIds` reference resolves; there are no orphans and no dangling ids. The sidecar's `serviceId` and `primaryScenarioId` match the manifest. Grades are defensible under section 4: no Grade B on a secondary source, and the single Grade C sits on outdated, unreadable official material, which is what C is for. The record is schema-valid against `benchmark/schemas/ledger.json`, including the conditional that only non-`Unknown` claims require a source.

### 11. note — scenario id retains SAS/PID terminology while the ledger uses UPIC

`scenario_property_tax_payment_known_sas_pid` is labelled "known UPIC" and the claims speak of UPIC throughout. This is a cosmetic mismatch between an identifier and its content, not a scenario alias: the id matches the manifest's `primaryScenarioId` exactly and is the only scenario in the ledger. Section 1 says reuse a record id once published and change content, not identity, so it is left as it is.

---

## Verdict

Cell states accepted after corrections: **cost `mentioned`, documents `mentioned` (corrected down from `stated`), eligibility `stated`, time `stated`, owner `mentioned`, after-submission `stated` (accepted on narrowed evidence) — stated count 3 of 6** (filed as 4 of 6).
