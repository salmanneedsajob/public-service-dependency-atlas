# IND-32 independent audit — death certificate

Date: 2026-08-28  
Scope: `ledger/death-certificate.json`, `ledger/schema.json`, `ledger/AGENT_PROTOCOL.md`, and the supplied edge-status policy. This was a read-only audit; it did not open sources, search for a record, or alter ledger data.

## Result

The ledger passes JSON-schema validation and all checked cross-record references resolve. The public journey consistently keeps individual record state, registrar, fee, timing, correction eligibility, and certificate outcome unknown. The observations below are visible documentation limitations, not release blockers.

## Findings

### DC-1 — Three death-service roadblocks are connected to a property-sale node and scenario

`roadblock_ind32_death_current_portal`, `roadblock_ind32_death_record_state`, and `roadblock_ind32_death_currentness` use `node_sale_deed` and `scenario_clean_sale`. Their supporting claims (`claim_ind32_death_current_service`, `claim_ind32_death_bbmp_directory`, `claim_ind32_death_ejanma_routing`, `claim_ind32_death_ejanma_public_tools`, `claim_ind32_death_form6_timing`, `claim_ind32_death_sakala_target`, and `claim_ind32_death_statutory_boundary`) likewise use `scenario_clean_sale` and no target dependency node.

The IDs resolve, so this is not a schema failure. It is, however, a user-visible relevance limitation under the protocol: a death-certificate roadblock may surface with a sale-deed context instead of the corresponding `scenario_ind32_death_*` and `node_death_*` records. The newer `roadblock_ind32_death_workflow_*` set is correctly scoped and makes the uncertainty visible; retain the mismatch as a stated limitation until the older parallel records are reconciled.

### DC-2 — Officially supported edges are shown as `unknown` rather than route-limited `partial`

`edge_death_classify_registrar`, `edge_death_tools_outcome`, and `edge_death_registrar_outcome` are `unknown`, although their cited workflow claims include official grade-B material: e-JanMa registrar routing and public tool labels. The evidence does not establish an individual event's route or result, but it does support the limited public relationships represented by the graph.

Under the supplied edge policy, these are better communicated as `partial`: the route/tool-to-outcome relationship has official, incomplete support; the actual registrar, record match, correction/delay decision, fee, and issued certificate remain unknown. Leaving the edges as `unknown` is conservative, but can misleadingly suggest that only citizen evidence or no evidence exists.

## Audit checks

- Schema validation: pass.
- IDs and references: pass for agencies, scenarios, sources, claims, nodes, edges, roadblocks, journey steps, and dependencies.
- Evidence boundary: preserved; the journey records that no deceased-person data, login, lookup, download, upload, payment, or submission was made.
- Edge policy: applied as above; all target edges have cited evidence, so none meets the supplied policy's removal condition.
