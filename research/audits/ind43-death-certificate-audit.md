# IND-43 — Death certificate audit

Scope: read-only review of `ledger/death-certificate.json` against the local schema and protocol. No sources were opened and no live lookup was run.

## Findings

1. **Remove `roadblock_audit_death_certificate` (material integrity failure).** Its `symptom` is a pasted audit report, including a purported scope, result, and unrelated identifiers such as `node_sale_deed` and `scenario_clean_sale`. It has no supporting claims. It is not an atomic user-visible blocker and its `unknown` status does not make the narrative evidence-backed.

2. **Resolve the dangling agency link.** `roadblock_ind43_death_identifier_boundary.ownerAgencyIds` cites `agency_bengaluru_smart_city_ind43`, which does not exist in `agencies`. Either add a properly supported agency record or remove the ownership assertion; the BenSCL contact page alone does not establish responsibility for this death-record process.

3. **Do not treat the SmartNet UI as an authorised death-certificate route without an attribution source.** `claim_ind43_death_event_selector`, `claim_ind43_death_search_modes`, `claim_ind43_death_registration_fields`, `claim_ind43_death_temporary_field`, `claim_ind43_death_dod_fields`, and `claim_ind43_death_public_controls` are Grade B. The in-ledger observation establishes visible controls, but no source establishes that the BenSCL/SmartNet page is an official/authorised civil-registration service or connects it to e-JanMa/BBMP. Add that evidence, or downgrade and label it only as an observed public page. The same boundary applies to uses of that page as a recovery route.

4. **Split compound claims and their derived details.** The protocol requires one checkable assertion per claim. At minimum, split:
   - `claim_ind43_death_public_search_fields` (selector, two fields, CAPTCHA, and old-ULB link);
   - `claim_ind43_death_manual_lookup_modes` (two distinct lookup modes and their fields);
   - `claim_ind43_death_manual_output_flow` (verification, copies, CAPTCHA, payment, acknowledgement, tracking, and delivery);
   - `claim_ind43_death_act_search_certified_copy` (search right, electronic/other certificate, certification, and cause-of-death restriction);
   - `claim_ind43_death_act_appeal` (two appeal paths, deadline/form, and decision period); and
   - `claim_ind43_death_published_recovery` (generic BenSCL contact details versus two page controls).

5. **Correct the false contradiction status.** `claim_ind43_death_correction_office_request` (a reported submission) and `claim_ind43_death_correction_court_pending` (a different family’s reported pending case) can both be true. They are not contradictory claims. Remove their reciprocal `contradictsClaimIds` links and change `contested` to the evidence-limited status otherwise warranted (normally `partial`).

6. **Repair edge evidence before presenting it as workflow.** `edge_death_entry_classify`, `edge_death_classify_tools`, `edge_death_classify_registrar`, `edge_death_tools_outcome`, and `edge_death_registrar_outcome` assert sequence or production relationships that their listed claims do not establish. In particular, the registrar edge extends routing to correction/delayed cases without correction/delay routing evidence, and the two outcome edges cite general tool labels/unknown-state claims rather than evidence that the named action produces the outcome. Keep these as unknown limitations or attach narrowly matching claims.

7. **Align correction material with the correction scenario.** `claim_ind43_death_act_correction`, `claim_ind43_death_act_appeal`, `claim_ind43_death_act_rules_public_boundary`, `claim_ind43_death_correction_objection_unknown`, and `roadblock_ind43_death_correction_objection_documentation` are tagged only to `scenario_ind32_death_copy`, although they describe correction/appeal. The correction roadblock is therefore absent from its own scenario while the claimed route is not established for a copy. Add the correction scenario (and retain the BBMP-mechanics limitation) or narrow/remove the copy association.

8. **Do not call generic contact/navigation a case recovery.** `claim_ind43_death_published_recovery`, `recovery_ind43_death_contact`, `recovery_ind43_death_support_boundary`, and `roadblock_ind43_death_identifier_boundary` convert a generic BenSCL contact page and a `Back` control into death-record support/recovery. The record explicitly says the contact page is not a promise of resolution and supplies no death-specific support evidence. Describe these only as generic contact/navigation; keep no-record, delivery, and current-help outcomes explicitly unknown.

9. **Keep the unobserved-submit limitation on the lookup node, not as outcome evidence.** `claim_ind43_death_public_controls` only observes controls before submission, yet it is attached to `node_death_outcome` and used by `check_ind43_death_submit_boundary`. It cannot evidence certificate outcome, status, fee, or delivery. Move it to the lookup/input boundary and retain `claim_ind43_death_outcome_unknown` for the outcome limitation.

## Marker check

All node `researchedNoSourceFound` arrays are empty. No unsupported no-source marker was found; the record instead represents its gaps through explicit `unknown` details and claims.
