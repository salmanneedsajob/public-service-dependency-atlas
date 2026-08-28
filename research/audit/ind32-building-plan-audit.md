# IND-32 building-plan ledger audit

## Scope and result

Audited `ledger/building-plan.json` against `ledger/schema.json` and `ledger/AGENT_PROTOCOL.md` only. The JSON validates against the supplied schema; IDs are unique, all checked links resolve, every non-`Unknown` claim has a source, and recorded dates are ISO-shaped.

The service-specific material is a **partial, public-description map** for historical/legacy BBMP BPAS-style routes. It is not evidence of the current route, category, checklist, fee, scrutiny, inspection, or sanction outcome for any Bengaluru property.

## Findings to ship as limitations

- **Service-scope contamination — material.** The ledger contains 22 BESCOM/e-Khata claims, six electricity-transfer scenarios, eight electricity-transfer edges, 11 roadblocks, and six journeys that do not concern building permission. Their link integrity is sound, but their inclusion makes the building-plan graph misleadingly broad.
- **Core claims are compound.** `claim_building_sec299` combines application duty with multiple plan/document types and rule/bye-law conditions. `claim_building_bpas_docs` combines CAD plans, various NOCs, sale deed, Khata, and proposal-dependent conditions. `claim_building_bpas_review` combines inward review, DCR scrutiny, correction loop, and site inspection. `claim_building_bpas_fee_license` combines fee calculation, approval-role routing, and PDF licence output. The workflow claims repeat those bundles. This does not satisfy the protocol’s atomic-claim rule and weakens per-step citation.
- **Grade/source mismatch requires caution.** `claim_building_sec299` describes statute text but is grade B despite linking a source typed `law`. If the statutory text was directly verified, A is the protocol’s matching source grade; if the record is only an indirect public observation, the claim needs C/partial wording. The ledger does not make that basis boundary clear.
- **Currentness is unresolved.** `source_building_bpas` is called a “dated BPAS workflow” in the claims but carries no `publishedAt`; retrieval on 2026-08-28 does not prove it is current. The stored GBA/legacy transition uncertainty must remain prominent, especially for competent authority, zone, route category, registered-professional requirement, documents/NOCs, fees, inspection, and sanction.
- **Citizen accounts are not general rules.** The “stuck” report and road-classification/unofficial-demand report are correctly E/partial and caveated. They establish neither a delay cause nor a road-classification rule, entitlement, official fee, or misconduct finding. Their associated outcome unknown is necessary.
- **Source hygiene is incomplete.** `source_building_submission`, `source_building_w_gba`, and inherited `source_citizen_missing_draft` are uncited by claims. The GBA/procedure/BPAS/submission sources are also duplicated under ordinary and `_w_` IDs for the same URLs, fragmenting provenance.

## Unknowns, contradictions, and edges

`claim_building_unknown_case`, `claim_building_w_unknown`, and `claim_ind32_building_citizen_current_outcome_unknown` correctly preserve the unknown case facts. The documented graph’s unobserved upload, scrutiny, inspection, fee, and licence transitions are labelled `unknown`; public-route and professional leads are `partial`. That is compliant with the edge-evidence policy. Preserve every cited edge; nothing here is an undocumented edge mislabeled as verified.

No service-specific contradiction links are recorded. The inherited BESCOM NOC conflict is unrelated and should not be carried into any building-permission conclusion.

## Jurisdiction and status

Claims use Bengaluru/Karnataka or Karnataka jurisdiction text, but this is not the same as proving the competent present-day authority for an individual site. The public login boundary is appropriately recorded and no application was made. Outcomes remain unknown rather than inferred from public descriptions, which is the correct status posture. This report does not change the ledger.
