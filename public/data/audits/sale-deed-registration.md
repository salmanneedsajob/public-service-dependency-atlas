# IND-78 — Sale-deed registration audit

**Audit date:** 2026-09-05  
**Scope:** `sale-deed-registration` only. This fresh audit used only the integrated ledger, its expectation and portal sidecars, the matching manifest entry, the ledger schema, and the research protocol/corrections contract.

## Verdict

**Not done.** The manifest and sidecar consistently declare the primary scenario, and all six expectation cells are authored. The ledger nevertheless has a broken primary-path reference, incomplete portal-route observations, source-type and claim-atomicity defects, and no recorded archival snapshot or documented archive-capture failure for any official public source. The schema has no archive-snapshot or source-jurisdiction field, so those omissions cannot be repaired truthfully from the permitted audit inputs.

## Findings

### Primary scenario, references, and atomicity

- The manifest and expectation sidecar use `scenario_sale_deed_bengaluru_residential`; no undeclared branch is recorded.
- The ledger scenario path references nonexistent `node_sale_deed_registration_public_route`. `C07` replaces it with the existing, connected IND-78 primary path.
- `claim_ind78_property_registration_scope` combines document registration and public-record maintenance. `C05` retains only the directly supported registration proposition; no new split claim is invented.
- `node_ind78_property_transaction` omits its document-checklist unknown claim from aggregate `claimIds`; its post-registration integration check describes integration claims it does not cite. `C08`–`C09` repair those references.

### Sources, grades, basis, citations, dates, and archives

- Claim scenario IDs and every non-`Unknown` claim-source link resolve. Unknown claims have no sources, as allowed. Dates are ISO-formatted and source notes generally state visible-date limitations.
- The two statutes support Grade A but are typed as `official_guidance`, not `law`; the two public-interface observation sources support Grade B observation claims but are typed as `official_guidance`, not `firsthand_observation`. `C01`–`C04` correct those classifications.
- No official public source records a Wayback snapshot URL or documented archive-capture failure. The citizen notes explain why snapshots were not requested, but are neither snapshots nor capture failures. This breaches protocol section 11 and blocks done.
- The schema disallows archive and jurisdiction fields on sources. The audit cannot invent an archival event, agency display, or source-level jurisdiction. A new bounded research pass and, for structured fields, a schema/contract change are required.
- `claim_ind78_kaveri_project_director_designation` retains an unnecessary individual name. `C06` removes it.

### Expectations

All six cells are present and their states comply with section 8: cost is `mentioned` because no current actionable amount exists; documents is `mentioned` without a checklist; eligibility is `stated` by the statutory applicability rule; historical time is `mentioned`, not a current SLA; owner is `stated` by the department/SRO office category; and after-submission is `mentioned` by limited historical SMS/integration material. Mentioned cells include searched routes. No expectation correction is proposed.

### Portal routes and login boundary

- Both portal records include a service ID, observation time, host, owner/operator metadata, and a primary-scenario route. No login, OTP, CAPTCHA solving, data entry, payment, appointment, or submission was attempted; safety is respected.
- Both route observations leave the public-procedure/case-data boundary, CAPTCHA dependency, JavaScript dependency, and route evidence IDs blank. `C14`–`C18` and `C21`–`C24` make those limits explicit and attach existing evidence.
- The Kaveri version/date field and Revenue agency/version fields are blank rather than observed limitations. `C19`–`C20` correct this without claiming data was visible.

### `researchedNoSourceFound`, citizen evidence, roadblocks, and safety

- No node claims `researchedNoSourceFound`. Because the audit inputs show bounded timeout observations rather than a completed relevant recovery-route search, none may be added. Empty recoveries remain visibly not yet researched.
- The unavailable-seeds roadblock names both routes but cites only Kaveri, calls a page-body failure absence of a “usable 200 response,” and states an unestablished root cause. `C10`–`C13` correct wording, linkage, and status.
- Citizen claims are E-grade and expressly limited to self-report; titles and notes do not retain the prohibited identifiers named in section 12. Yet section 12 requires quarantine to `citizen_reported`, which the supplied schema cannot represent. The audit cannot add such a field or move the claims without schema violation, and does not delete evidence merely to mask the contract conflict. This is a blocking limitation.
- The ledger has a visible disclaimer and `asOf` date; no unsafe live interaction is recorded.

## Definition of done

The service is **not done** under section 14: audit corrections are proposed but unapplied, portal records are incomplete until applied, official archive requirements are unmet, and citizen quarantine cannot be represented in the present schema. Derived Mapped status is informational only.

## Corrections

`research/audits/ind78-sale-deed-registration-corrections.json` contains 24 atomic, unapplied corrections (`C01`–`C24`). Archive and citizen-quarantine findings have no truthful schema-valid mechanical correction from this audit input boundary and remain explicit limitations.
