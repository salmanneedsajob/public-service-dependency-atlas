# IND-71 passport ledger audit

**Audit date:** 2026-09-04  
**Inputs:** `ledger/passport.json`, `ledger/schema.json`, `ledger/AGENT_PROTOCOL.md` only  
**Verdict:** **Not ready to ship / definition of done not met.** The ledger is valid against the supplied JSON Schema and all recorded references resolve, but binding protocol structures are absent, claim atomicity is not clean, one fee claim is not current enough for citizen action, and several cross-record links or semantics need correction.

## Isolation and method

This audit used only the three authorized inputs. It did not inspect handoffs, Linear, git history/diffs, research notes, portal pages, or the correction-application script. The corrections document therefore uses the section 13 contract and a conservative envelope. No evidence was invented.

The ledger contains 6 agencies, 3 scenarios, 9 sources, 20 claims, 14 nodes, 12 edges, 5 roadblocks, and 4 journeys. A direct schema walk found no JSON Schema violations. All agency, scenario, source, claim, node, roadblock, edge, journey-step, and journey-dependency references resolve. There are no duplicate source URL/access-date pairs and no duplicate record IDs.

## Blocking findings

### IND71-F001 — protocol-required primary scenario declaration is absent

Section 2 requires exactly one manifest-declared `primaryScenarioId`. The ledger strongly suggests `scenario_passport_fresh_adult_normal`, but neither the ledger nor the supplied schema has a field for that declaration. The scenario path also omits four records used as primary-scenario eligibility/document/post-submission evidence: `node_passport_fresh_category`, `node_passport_document_advisor`, `node_passport_police_verification`, and `node_passport_dispatch`.

- Proposed ledger correction: **IND71-C077**, completing the evident primary path without asserting a new scenario.
- Uncorrectable here: **IND71-LIM-001**, adding the actual manifest declaration requires a protocol/schema extension or a manifest outside the supplied ledger.

### IND71-F002 — all six authored expectation cells are absent

The supplied schema has no expectations property and rejects additional top-level properties. Therefore the section 9 block cannot be represented schema-validly. Applying section 8 strictly to the evidence already in the ledger yields this audit view (not a replacement for the required official-pass block):

| Cell | Audit state | Existing support | Required note |
| --- | --- | --- | --- |
| cost | mentioned | `claim_ind71_payment_appointment_guidance`; the numeric fee claim is contested by IND71-C001–C004 | Payment is required, but no current actionable amount survives audit. |
| documents | stated | `claim_passport_adult_normal_document_categories`, `claim_passport_psk_originals_and_copies` | Address/date-of-birth proof categories and originals/copies are actionable, subject to the stated category limitation. |
| eligibility | stated | `claim_passport_fresh_ordinary_category` | Fresh ordinary applies when no ordinary passport was previously held. |
| time | stated | `claim_passport_pre_pv_dispatch_timing` | Three working days covers only dispatch after receipt of a recommendatory report, not end-to-end processing. |
| owner | stated | `claim_passport_bengaluru_rpo_owner`, `claim_passport_police_verification_decision` | The identified RPO/Passport Office is limited to the published office/decision role, not an applicant-specific PSK or case owner. |
| after-submission | stated | `claim_ind71_application_arn_after_submission`, `claim_ind71_psk_visit_guidance` after proposed splits | ARN generation and appointment confirmation are visible post-submission surfaces; case tracking itself remains unknown. |

This is **IND71-LIM-002**. The schema must first gain a protocol-compatible authored expectations structure.

### IND71-F003 — required portal and route-observation records are absent

The source notes preserve useful public observations for `passportindia.gov.in` and `services1.passportindia.gov.in`, but they are not section 10 portal records. Missing structured fields include portal operator, languages, observation timestamp, visible version/date, and nested route observations with entry/final URL, redirects, link counts, authentication prerequisites, public/case-data boundary, dependencies, guidance/tracking/error/recovery surfaces, evidence IDs, and limitations. The supplied schema has no portal property, so this is **IND71-LIM-003** and cannot be fixed schema-validly in `ledger/passport.json` alone.

### IND71-F004 — the fee claim is not safe as a current actionable amount

`claim_passport_normal_36_page_fee` cites an undated booklet while its own note says a fee revision was effective before the ledger access date. No cited claim/source establishes the post-revision amount. The claim must not support `cost: stated`.

- **IND71-C001:** qualify the text as an undated-booklet observation.
- **IND71-C002:** downgrade B to C under section 4's undated/potentially outdated rule.
- **IND71-C003:** mark the claim contested.
- **IND71-C004:** remove the uncited revision assertion while retaining the currentness limitation.

The same undated booklet supports two other claims. Their cautious `partial` status is appropriate, but section 4 requires Grade C: **IND71-C005–C006**.

### IND71-F005 — pre-audit atomicity is not clean

The following claims contain multiple independently checkable propositions and would be caught by the section 8 compound/list lint:

- `claim_passport_police_verification_decision`
- `claim_ind71_home_public_handoffs_visible`
- `claim_ind71_apply_requires_register_login`
- `claim_ind71_prelogin_controls_visible`
- `claim_ind71_rpo_selection_guidance`
- `claim_ind71_application_sections_and_submission_guidance`
- `claim_ind71_payment_appointment_guidance`
- `claim_ind71_psk_visit_guidance`
- `claim_ind71_citizen_tatkal_document_not_accepted`
- `claim_ind71_citizen_post_pv_pending_and_escalation_reported`

The structured set proposes atomic splits while preserving source, scenario, node, grade, basis, status, and quarantine: **IND71-C007–C066**. No new factual content is introduced; new claim records contain only propositions already present in the cited original claim/source note. The dependent node, edge, roadblock, and journey references are updated in the same correction set.

### IND71-F006 — source-linked detail and reciprocal node linkage defects

Five original claim/node associations are one-way. Corrections **IND71-C023, C038–C040, C045, and C071–C072** restore the materially relevant reciprocal links, including placing the fee and appointment claims on the primary payment node.

`detail_ind71_public_call_center` cites a claim that does not mention the call center; **IND71-C011–C017** give it an atomic supporting claim. `detail_passport_document_advisor_recovery` asserts that the blank advisor will produce a case-specific list even though the recorded observation explicitly did not select answers; **IND71-C068–C072** turn this into a bounded observed check and preserve the unobserved result as unknown/not-yet-researched.

### IND71-F007 — unsupported or misclassified relationships

- `edge_passport_documents_to_application` asserts that confirming documents is a prerequisite to the account-bound application, but its two claims establish document categories and an appointment prerequisite, not that ordering. **IND71-C078** deletes the unsupported edge.
- `edge_passport_psk_to_pv` asserts a PSK-to-police-verification sequence, while its only claim establishes who decides whether verification is required, not when. **IND71-C079** deletes the unsupported edge.
- `edge_ind71_citizen_police_to_followup` uses `blocks` and causal wording for a single reported sequence. **IND71-C062–C064** change it to a neutral quarantined mapping and cite the separated report claims.
- The pre-login credential warning is guidance, not a failure signal. **IND71-C022–C026** split and move it to checks.

### IND71-F008 — direct internal contradiction in journey notes

`journey_ind71_fresh_adult_normal_public_boundary.documentationQualityNotes[2]` says no police-verification-delay branch is recorded, while the ledger contains that scenario, a supporting claim, a roadblock, and a separate journey note saying it was encountered. **IND71-C080** replaces the contradictory note with a ledger-faithful limitation.

## Other protocol checks

### Sources, dates, jurisdiction, grades, and basis

- All nine sources have specific URLs and ISO access dates. The two citizen sources also have ISO publication dates.
- Official sources without `publishedAt` state that no visible date was shown and record a currentness limitation. Archive notes are present for every used source: each records either capture failure/timeout or absence of a snapshot; no authenticated, personal, payment, or case-specific page was archived.
- Official current procedures and direct public-interface observations are Grade B; citizen accounts are Grade E and use reported wording. The three undated-booklet grades are corrected to C.
- Claim jurisdiction strings are consistently `Bengaluru, Karnataka, India`. Source-level Bengaluru/Karnataka applicability is missing or imprecise on four newer/citizen records; **IND71-C073–C076** make the existing context explicit without changing the source's national or reported scope.
- `basis` is generally sound: source/interface statements are observations, and citizen claims observe what an account reported rather than treating it as an official rule. No `mixed` claim lacks a boundary note because there are no `mixed` claims.

### Scenario tags and contradictions

Every claim has at least one valid scenario ID and every referenced node exists. Citizen evidence is confined to `scenario_citizen_reported` and citizen-only nodes, edges, roadblocks, and journeys. The two citizen accounts are Tatkal/non-comparable and are not used to establish primary-scenario rules.

No `contradictsClaimIds` link is present. That is acceptable for the two non-comparable citizen accounts, which section 12 says must remain quarantined. The fee-currentness conflict is not represented by a source-backed contrary claim, so audit does not invent one; it contests the stale numeric claim instead.

Whether branch IDs were predeclared, whether `scenario_citizen_reported` is a permitted quarantine ID rather than a Wave 2 alias, and whether one-record identity was preserved cannot be proven from the authorized inputs. See **IND71-LIM-004** and **IND71-LIM-005**.

### `researchedNoSourceFound`

There are **zero** `researchedNoSourceFound` markers, so no unsupported marker needs removal. Nineteen node detail fields are empty and omit the marker; section 6 correctly requires those fields to remain visibly **not yet researched**, not to be inferred as government documentation gaps. The ledger does not contain the searched-route evidence needed to add any marker.

### Citizen-evidence quarantine and privacy

The citizen sources are Grade E, first-person, explicitly non-generalized, and isolated from the primary scenario. Their notes say names/handles and case identifiers were omitted. No address, phone number, account/application ID, identity document, credential, or other personal data is retained. Proposed splits retain the same quarantine and do not create an official recovery rule.

### Safety boundaries and disclaimer

The ledger consistently says no login, credentials, OTP, CAPTCHA bypass, payment, booking, submission, document upload, case lookup, or live application action occurred. It does not call private APIs or claim to be official advice. `meta.asOf` is present and the disclaimer is explicit. Safety passes.

### Derived status and definition of done

The derived Mapped diagnostic is not manually edited. The evident primary path has partial nodes and multiple empty, unmarked fields, so it is not Mapped; that is informational only.

Definition of done fails because `primaryScenarioId`, the six authored expectations, and portal/route records are not representable; the lint is not clean until the corrections are applied; and the supplied ledger cannot establish pre-flight completion, isolated handoffs, lint waivers, correction application, validation output, or start/finish comments. These workflow artifacts are outside the allowed inputs (**IND71-LIM-006**). After the ledger corrections are applied, a schema/protocol revision and a fresh validation/finish step are still required.

## Correction and limitation summary

- Proposed corrections: **80** (`IND71-C001` through `IND71-C080`).
- Corrections applied by this audit: **0**. The audit was instructed not to modify the ledger.
- Unapplied corrections: **80**.
- Recorded protocol limitations: **6** (`IND71-LIM-001` through `IND71-LIM-006`).
