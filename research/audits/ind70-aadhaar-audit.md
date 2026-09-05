# IND-70 isolated audit — Aadhaar demographic address update

Audit date: 2026-09-05  
Service: `aadhaar-address-update`  
Primary scenario: `scenario_aadhaar_address_update_online_poa`

## Verdict

**Corrections required before this service is done.** The integrated ledger is schema-valid and its references resolve, but the expectation sidecar is stale relative to the integrated public-route evidence, three citizen reports have invalid contradiction links, one portal record has no evidence IDs, the primary journey orders a later quality review before immediate post-submission surfaces, and several citation/detail and dating records need correction.

The accompanying corrections document contains one atomic set. No evidence is invented. Where the record lacks support, the correction removes the unsupported record or relationship.

## Scope and counts

- Inputs reviewed: integrated ledger, expectations sidecar, portal sidecar, the service manifest entry, ledger schema, and protocol.
- Integrated records: 10 sources, 29 claims, 6 nodes, 4 edges, 2 roadblocks, and 2 journeys.
- Claims by grade: 24 B, 4 E, 1 F. Claims by status: 24 verified, 4 partial, 1 contested.
- Portal sidecar: 3 portal records and 3 route observations before corrections.
- No `researchedNoSourceFound` marker is present. Empty node fields therefore remain “not yet researched”; no unsupported marker needs removal.

## Findings

### 1. Expectation grid does not reflect the integrated primary-scenario evidence — blocking

The public route supplies Grade B, verified, primary-scenario observations for a **₹75 fee** (`claim_ind70_fee_display`) and **“Up to 30 days”** (`claim_ind70_time_display`). Under protocol section 8, both are actionable values, so `cost` and `time` must be `stated`, not `mentioned` and `absent`. The time note must also preserve the public-label scope because the authenticated start/end semantics were not observed.

The `after-submission` cell is otherwise supported by the SRN, invoice, and status-route claims, but it also cites four claims tagged only to the rejected branch. The six-cell grid scores the primary scenario only, so those branch-only claim IDs and the corresponding rejection sentence must be removed from that cell.

The `documents`, `eligibility`, and `owner` cells satisfy the section 8 definitions. The owner claim identifies the operational quality-and-processing role that conducts later verification, which is sufficient for `stated` under the owner definition.

### 2. One claim is compound — blocking

`claim_ind70_poa_required_and_upload` asserts both an upload requirement and a later verification event and attaches itself to two nodes. The later-review fact already has the atomic `claim_ind70_quality_processing_team_review`. The correction narrows the compound claim to the upload requirement and removes its quality-review node reference.

The other claims are sufficiently atomic for the propositions they preserve. Evidence grades follow the protocol table: current official guidance, the official form, and direct public-interface observations are B; citizen accounts are E; the retained citizen speculation is F. The `observation` basis is consistent with the wording, including the claims that merely record what a citizen reported or speculated.

### 3. Citizen evidence is quarantined, but contradiction links are false — blocking

The citizen sources and claims are correctly isolated as `citizen_evidence`, Grades E/F, qualified as individual reports, and stripped of handles, addresses, identifiers, and household details. They do not establish an official rule.

However, a successful report and a rejected report do not logically contradict one another merely because they describe different outcomes. The 2026 success report is also not comparable in period to the 2020 rejection report. All three `contradictsClaimIds` arrays involved must therefore be cleared.

### 4. Source-date and archive recording needs limited repair — blocking

Three official FAQ sources were accessed on 2026-09-05 while `meta.asOf` remains 2026-09-04. The ledger date must move to 2026-09-05 so the visible as-of date does not predate evidence used by the ledger.

Official public sources include agency naming, Bengaluru/Karnataka applicability, exact access dates, and either a documented archive failure or, for the authentication-bound login page, an explicit archive exemption consistent with section 11. Undated official pages state the date limitation. The three public citizen sources say the Wayback capture was unavailable, but do not explicitly record the failure date and preservation limitation; their notes must be made explicit.

### 5. One portal and route record are unsupported — blocking

`portal_ind70_myaadhaar_entry` and `route_ind70_myaadhaar_entry` both have empty evidence-ID arrays. Their own limitation states that the homepage was not retained as evidence. Protocol section 10 requires evidence source IDs for portal and route observations. No authorized input supplies a source record for this homepage observation, so the portal record must be removed rather than backfilled from an unrelated page.

The remaining `portal_ind70_myaadhaarbeta` and `portal_ind70_tathya_login` records contain the required owner/operator/naming, timestamp, language, visible-version limitation, route URLs, link counts, authentication boundary, dependencies, public surfaces, evidence IDs, and limitations. Authentication- and case-data-bound surfaces remain unknown.

### 6. Journey chronology and one edge are not supported — blocking

The primary journey places “later quality and processing review” before the SRN/invoice/status step. The cited evidence instead says the SRN and invoice are available after successful submission and that document verification occurs later. The correction reorders those two steps.

`edge_ind70_submission_to_post` runs from the later-review node to the post-submission node, but none of its claim IDs supports that direction. It must be removed. The remaining three edges have supporting claims.

Two journey documentation-quality notes are also stale: one says an FAQ had a visible review date even though its source record says no visible date was observed, and another says the myAadhaar route was not observed and no fee/time value exists despite the integrated public-route evidence. Both notes are corrected.

### 7. Several node-detail URLs are general category links — blocking

Five node details use the general online-address FAQ category URL even though claim-specific FAQ pages are retained, and the registered-mobile detail points to a different page than its claim source. Section 7 requires specific citations. The corrections replace these URLs with the corresponding claim-specific FAQ or document URL.

### 8. Duplicate agency identity — correction required for clean integration

`agency_uidai_ind70` and `agency_uidai` represent the same UIDAI agency with the same name and official URL. The correction atomically repoints the three generic-ID references to `agency_uidai_ind70` and removes `agency_uidai`. Reference integrity remains intact after the complete correction set is applied.

## Schema and reference integrity

The integrated ledger conforms to `ledger/schema.json`. All scenario, node, source, claim, agency, roadblock, journey-step, journey-dependency, expectation-claim, portal-source, and portal-scenario references resolve before corrections. IDs are unique, and there are no duplicate source URL/access-date pairs.

The correction set must be applied atomically. Applying only the agency-reference changes without the agency deletion, or only part of the journey/expectation changes, would create drift from the audited result.

## Post-correction limitations

- The authenticated upload, payment, submission, status-result, and rejection-handling interfaces remain unobserved by design.
- The public route’s “Up to 30 days” label is actionable for the expectation cell, but its authenticated start and end events were not observed.
- The removed bare-homepage portal observation has no retained source record and cannot be restored without a new public-workflow evidence capture.
- Empty node `failureSignals` and `recoveries` fields without `researchedNoSourceFound` remain “not yet researched,” not proof that no public guidance exists.
