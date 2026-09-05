# IND-72 property-tax-payment audit

Audit date: 2026-09-05  
Service: `property-tax-payment`  
Primary scenario: `scenario_property_tax_payment_known_sas_pid`  
Verdict: **corrections required; not done**

## Input boundary and method

This fresh audit used only the integrated ledger, its expectations and portal sidecars, the service's manifest entry, `ledger/schema.json`, and `ledger/AGENT_PROTOCOL.md`. No researcher handoff, issue discussion, other ledger, external page, or git state was used. The proposed changes are recorded in `ind72-property-tax-payment-corrections.json` and were not applied.

The ledger parses as JSON and conforms to the supplied ledger schema on structural inspection. All claim-to-source, claim-to-node, claim-to-scenario, node-to-claim, and scenario-to-node references resolve. The ledger contains 8 sources, 43 claims (32 Grade B/verified and 11 Grade E/partial), 3 declared scenarios, 1 node, and no edges, roadblocks, or journeys. No duplicate source URL/access-date pairs were found.

## Findings

### Blocking findings

1. **The node's owner is a citizen forum, not the service authority.** `agency_property_tax_payment` is named “Reddit / r/bangalore,” uses a Reddit URL, and owns `node_property_tax_payment_public_route`. This conflicts with the official-source publishers and with the portal record, which names Bengaluru City Corporations as service owner and GBA/Government of Karnataka in the displayed agency naming. Corrections replace the agency's name, short name, and official URL while preserving its ID.

2. **Five expectation cells lack the authored notes required by protocol section 9.** The substantive states are otherwise supported under section 8:

   - `cost: mentioned` is correct because the Grade B rebate/interest/penalty calendar touches cost but gives no amount or actionable fee schedule; its searched routes are present, but its search note is blank.
   - `documents: absent` is correct because its reviewed routes are recorded and no claim names a document the citizen must submit, provide, upload, produce, or attach; its search note is blank.
   - `eligibility: stated` is correct because `claim_ind72_service_eligibility` gives the usable rule “property owners within Bengaluru City Corporation limits”; the actionable-value note is blank.
   - `time: stated` is correct. Four Grade B/verified claims give an actionable rebate window and interest/penalty start dates, and the existing note correctly limits the value to the payment calendar rather than processing time.
   - `owner: stated` is correct because the Grade B claims identify the Joint Commissioner of Revenue Head Office, its location, and contact routes; the actionable-value note is blank.
   - `after-submission: stated` is correct because the official procedure identifies real-time confirmation and receipt generation after payment; the actionable-value note is blank. Its current supporting claim is compound and is replaced by the two existing atomic claims.

3. **Claim atomicity is not clean.** `claim_ind72_confirmation_receipt` combines confirmation and receipt generation even though atomic claims for both facts already exist. It should be deleted, removed from the node, and replaced in the expectation cell by `claim_ind72_public_service_confirmation` and `claim_ind72_public_service_receipt_generation`. One other official claim and one citizen claim combine separable assertions; the corrections narrow each to one checkable statement without adding evidence. These are lint-blocking compound-claim findings under section 8.

4. **Public-route evidence was not integrated into the node or journey.** All three node detail arrays are empty and `researchedNoSourceFound` is omitted. Omitting the marker is correct—routes actually found public checks, failure signals, and recoveries, so a no-source marker would be false—but leaving all arrays empty incorrectly renders those fields as “not yet researched.” The corrections populate one supported check, one supported failure signal, and three supported recoveries. A partial primary-scenario journey and one official failed-transaction roadblock are added from existing Grade B claims; no citizen report is used to establish an official rule.

5. **Portal route scenario tags omit the declared branches whose evidence they record.** The manifest and ledger consistently declare `scenario_property_tax_payment_failed` and `scenario_property_tax_receipt_discrepancy`, and ledger claims tie public home/receipt/refund sources to those branches. Yet every route observation lists only the primary scenario. Corrections add the failed-payment branch to the home and refund-policy route arrays, and the receipt-discrepancy branch to the home and receipt-print route arrays. The refund-route limitation is narrowed so it distinguishes a published branch from an unperformed live failure.

6. **Source-level jurisdiction is not explicit.** Every claim has the correct Bengaluru/Karnataka jurisdiction, and every non-Unknown claim has at least one resolving source ID, but protocol section 7 also requires the source to supply jurisdiction. Because the supplied source schema has no dedicated jurisdiction property, corrections append `Jurisdiction: Bengaluru, Karnataka, India.` to each source's notes. Direct URLs and ISO access dates are already present.

7. **Definition of done is not met.** The primary scenario is fixed and present, the six cells exist, source archival outcomes are recorded, portal records exist, and this fresh audit is complete. However, the correction set is intentionally unapplied; no clean/waived pre-audit lint result, post-correction green validation, or finish comment is evidenced within the permitted audit inputs. The manifest also remains `published: false` and `reportIncluded: false`. These are explicit unresolved completion limitations, not grounds to infer success.

### Checks that pass

- **Declared scenarios:** The primary scenario matches the manifest, and both ledger branches are predeclared in the manifest. No undeclared scenario alias appears.
- **`researchedNoSourceFound`:** No marker is present, so there is no unsupported marker to remove. The corrections use the found route evidence rather than inventing a no-source result.
- **Archive notes:** Every used source records either a Wayback capture failure/unconfirmed capture and its limitation. Original URLs and access dates are retained. No authenticated, payment, personal, or case-specific page was archived.
- **Citizen quarantine and redaction:** Citizen sources are typed `citizen_evidence`; their claims use Grade E, `partial` status, `citizen_` IDs, and explicit `citizen_reported` quarantine notes. They contain no retained names, handles, property/account/application identifiers, addresses, phone numbers, or identity data. They do not support expectation cells, node details, the proposed official roadblock, or an official recovery rule. No unsupported contradiction link is present.
- **Evidence grade and basis:** Current official portals, procedure text, form observation, and policy are Grade B. Citizen accounts are Grade E. Claims consistently distinguish page/form statements from unperformed case-bound actions in their notes. No inference is mislabeled as observation and no unexplained `mixed` basis appears.
- **Citation linkage:** Every non-Unknown claim cites at least one existing source; source and portal evidence references resolve; dates use ISO format; links are specific service, form, policy, or forum pages rather than substitute department homepages.
- **Portal record:** One portal record describes the observed host and includes timestamp, owner/operator, agency naming, languages, version, evidence, redirects/counts, authentication and case-data boundaries, CAPTCHA/JavaScript constraints, public guidance/tracking/error/recovery surfaces, and limitations. No login-bound or case-data result is inferred.
- **Safety:** The disclaimer and `asOf` date are present. Claims and route limitations consistently state that no identifier, owner-name fragment, CAPTCHA, OTP, login, payment, grievance, receipt request, or case-data access was attempted. No private API, bypass, or sensitive personal data appears.

## Correction-set disposition

The companion JSON contains 30 atomic corrections. They form one drift-checked set across the ledger and its two sidecars: 3 agency fixes, 8 source-jurisdiction note additions, 5 expectation-note fixes, 1 expectation citation replacement, 4 claim/reference atomicity fixes, 3 node-detail integrations, 2 new integrated records, and 4 portal-route fixes. The entire set remains unapplied as required. Until it is applied atomically and validation/lint are green, this service must remain not done.
