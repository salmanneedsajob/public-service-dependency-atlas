# IND-72 property-tax-payment audit

**Audit date:** 2026-09-04  
**Input boundary:** `ledger/property-tax-payment.json`, `ledger/expectations/property-tax-payment.json`, `ledger/portals/property-tax-payment.json`, the `property-tax-payment` manifest entry, `ledger/schema.json`, `ledger/AGENT_PROTOCOL.md`, and its section 13 corrections contract only.  
**Verdict:** **Not ready to ship; definition of done is not met.** The main ledger is schema-valid and its references resolve, but the evidence dates are future-dated relative to this audit, the actual primary payment route was not observed, and 30 atomic corrections remain unapplied.

## Blocking findings

### B1 — Evidence dates are not credible as of the audit date; no correction proposed

The ledger `meta.asOf`, all seven source `accessedAt` values, archive-attempt notes, and the portal `observedAt` are dated 2026-09-05, one day after this 2026-09-04 audit. Exact access dates are part of the citation gate and archive rule. The auditor cannot infer whether the intended date was 2026-09-04 or whether the audit is premature, so changing these values would invent evidence. The service remains blocked until the actual access/observation dates are established and all linked dates are made internally truthful.

### B2 — The primary payment route is missing; no correction proposed

The manifest fixes `scenario_property_tax_payment_known_sas_pid` as the primary scenario, but the portal sidecar observes only the explanatory service-details page, the receipt-print form, and the refund-policy page. It does not contain the route where a known SAS/PID is entered, demand is retrieved, payment begins, or the public/case-data boundary of that route is observed. The ledger therefore does not substantiate the primary scenario's defining prerequisite or trace its actual entry route. The auditor cannot add an unobserved URL or route record.

### B3 — Service ownership is assigned to a citizen forum (corrections 1–3)

The only agency record is named `Reddit / r/bangalore`, and the service node points to it as `ownerAgencyId`. Citizen evidence cannot establish the official service owner. The portal sidecar instead identifies Bengaluru City Corporations and shows GBA naming. Corrections 1–3 retain the published agency record ID while replacing its content with the official owner and official service URL.

## Correctable findings

### C1 — Source metadata does not satisfy source-level specificity (corrections 4–12)

- `source_ind72_tax_receipt_print` is an observed current official form but is typed as `official_guidance`; correction 4 changes it to `official_form`.
- `source_ind72_official_service_details.publishedAt` treats a footer version date as the page's publication date even though its own note says the page has no separate publication date; correction 5 removes the unsupported date.
- None of the seven source records supplies jurisdiction at source level. Corrections 6–12 append `Jurisdiction: Bengaluru, Karnataka, India.` to the source notes. Direct URLs, publisher names, access-date fields, and archival-failure explanations are otherwise present.

### C2 — Expectation cells are not fully authored, and after-submission is understated (corrections 13–22)

All six cells exist and score the manifest primary scenario, but every required human-authored note is blank.

| Cell | Current state | Audit state | Rationale |
| --- | --- | --- | --- |
| cost | mentioned | mentioned | Online payment is named, but no citizen-paid amount or actionable fee schedule is given. Correction 13 links the topic-only payment claim; correction 14 supplies the search note. |
| documents | absent | absent | The reviewed route does not identify a document that must be submitted, provided, uploaded, produced, or attached. Correction 15 supplies the search note. |
| eligibility | stated | stated | A verified Grade B claim limits the service to property owners within Bengaluru City Corporation limits. Correction 16 supplies the actionable-value note. |
| time | mentioned | mentioned | Assessment-year timing is touched, but no actionable duration, deadline, processing period, or SLA is captured. Correction 17 supplies the search note. |
| owner | mentioned | mentioned | Agency/head-office naming is present, but no claim identifies the office or operational role that holds or decides a case. Correction 18 supplies the search note. |
| after-submission | mentioned | stated | Verified Grade B claims say the portal gives real-time payment confirmation and generates a receipt after payment—both expressly qualify as visible post-submission surfaces. Corrections 19–22 set the state, claims, routes, and actionable note. |

### C3 — The published failed-transaction branch is inconsistently tagged (corrections 23–25)

The manifest declares `scenario_property_tax_payment_failed`, and the ledger records that scenario as encountered. Yet the two official failed-transaction claims and the refund-policy route observation are tagged only to the primary scenario. Corrections 23–25 add the applicable failed-payment branch while retaining the primary-scenario link.

### C4 — Portal fields contain semantic errors (corrections 26–30)

- All three `javascriptDependencies` fields repeat CAPTCHA text rather than reporting JavaScript dependency or the observation limitation. Corrections 26–28 separate these concepts.
- The receipt form's assessment-year selector is an input prerequisite, not a tracking surface. Correction 29 removes it from `trackingSurfaces`; it remains described by the form guidance and claims.
- The refund route says the failure branch was not recorded as encountered, contradicting the ledger's declared branch. Correction 30 limits the statement to the fact that no live failure was created and the route was observed only in policy text.

## Protocol checks

- **Schema and references:** Pass. AJV draft-2020 validation of the main ledger against `ledger/schema.json` returned valid with no errors. All claim, source, node, scenario, expectation, and portal evidence references resolve. No duplicate source URL/access-date pairs were found.
- **Scenario declaration:** Partial. The manifest primary and both branch IDs exactly match the three ledger scenarios; no undeclared scenario ID is used. The primary route gap in B2 blocks completion, and failed-branch tagging needs corrections 23–25.
- **Claim atomicity:** Pass. The 21 claims are individually checkable; citizen receipt/debit/status/grievance observations are split instead of bundled. No split correction is required.
- **Grades and basis:** Pass. Current official pages/forms are Grade B observations; citizen accounts are Grade E observations with `partial` status and explicit non-universality. No inference is mislabeled as an observed end-to-end payment.
- **Citation linkage and specificity:** Partial. Every non-Unknown claim has a resolving source and every claim has Bengaluru/Karnataka jurisdiction plus scenario tags. Direct page/post URLs are used rather than homepages. Source-level jurisdiction is missing until corrections 6–12 apply, and future access dates in B1 block the citation gate.
- **Archive rule:** Partial. Every public source note records either a failed or unconfirmed Wayback capture and retains the original URL; no authenticated, personal, payment, or case page was archived. The archive attempts are future-dated under B1 and must be reconciled.
- **Citizen quarantine and redaction:** Pass. Citizen records use `citizen_evidence`, Grade E, `partial`, citizen-prefixed IDs, and explicit `citizen_reported` quarantine notes. They retain no names, handles, property/account/application identifiers, addresses, phone numbers, or identity data. They do not support expectation cells or official rules. No contradiction link is required because the accounts do not establish the same route and comparable period strongly enough to satisfy section 12.
- **Nodes, edges, roadblocks, and journeys:** Pass with visible incompleteness. The single node has empty `checks`, `failureSignals`, and `recoveries`; no edge is required for a one-node path. No end-to-end journey is inferred from published fragments. Citizen failure accounts remain quarantined claims rather than official roadblocks.
- **`researchedNoSourceFound`:** Pass. No marker is present, so no unsupported marker must be removed. The three empty node fields must continue to render as **not yet researched**, not as evidence that no public source exists.
- **Portal record:** Partial. One portal record includes host, observation timestamp, owner/operator, displayed agency naming, languages, version, source IDs, and three detailed route observations. B2 and corrections 25–30 prevent a clean result.
- **Safety:** Pass. The ledger disclaimer and node/route limitations prohibit or avoid login, identifiers, CAPTCHA submission, payment, case lookup, and personal data. No claim presents the ledger as official advice.
- **Pre-audit lint:** Not clean. The unsupported `publishedAt`, official-form type, scenario tagging, source jurisdiction, and future-date defects are unwaived in the authorized inputs.
- **Derived Mapped status:** Not reached. The default-path node has empty detail arrays without `researchedNoSourceFound`; this is informational and is not itself a completion target.

## Corrections and done assessment

The companion JSON contains **30 proposed, 0 applied, 30 unapplied** atomic corrections. Applying them must be one drift-checked atomic operation. Separately, B1 and B2 require new truthful evidence and therefore have no correction objects.

Definition of done is not met: the citation dates are not credible as of audit, the primary payment route is absent, lint is not clean or waived, this audit's corrections are unapplied, validation has not been rerun after correction application, and no finish comment can truthfully report completion. The existing main-ledger schema validation and six-cell presence are necessary but insufficient.
