# IND-32 independent audit — new electricity

Date: 2026-08-28  
Scope: `ledger/new-electricity.json`, `ledger/schema.json`, `ledger/AGENT_PROTOCOL.md`, and the supplied edge-status policy. This was a read-only audit; it did not open sources, submit a form, or alter ledger data.

## Result

The ledger passes JSON-schema validation and all checked cross-record references resolve. The public journey is appropriately explicit that route selection, eligibility, documents, demand, payment, inspection, and supply are not case outcomes. The observations below are visible documentation limitations, not release blockers.

## Findings

### NE-1 — Legacy new-connection claims are attached to the property-transfer scenario rather than the new-connection scenarios

`claim_ind32_new_electricity_jvs_route`, `claim_ind32_new_electricity_normal_route`, `claim_ind32_new_electricity_jvs_scope`, `claim_ind32_new_electricity_threshold_difference`, `claim_ind32_new_electricity_documents`, `claim_ind32_new_electricity_timing`, `claim_ind32_new_electricity_normal_payment`, and `claim_ind32_new_electricity_regulatory_boundary` all use `scenario_clean_sale` and have no `nodeIds`.

That is structurally valid, but it does not meet the protocol's traceability intent to tag claims to their relevant scenario and, where applicable, dependency node. A user viewing claims by scenario could see property-transfer framing beside new-connection guidance, while the newer `claim_ind32_electricity_workflow_*` records carry the actual new-connection scenario/node links. Keep the limitation visible until these parallel claim sets are reconciled or the legacy set is reclassified.

### NE-2 — Two official-evidence transition edges are labelled `unknown`

`edge_electricity_docs_demand` cites `claim_ind32_electricity_workflow_demand` (official, grade B, partial), and `edge_electricity_demand_tracking` cites `claim_ind32_electricity_workflow_timing` (official, grade B, partial). Both edges are labelled `unknown`.

Under the supplied edge policy, official but route-limited evidence belongs at `partial`; `unknown` is reserved for an evidence gap such as a citizen-only report with no official transition support. The current labels safely avoid asserting a completed application, but they can make the graph appear to have no official basis at all. A `partial` label would communicate the stated limitation more precisely: public material supports a route/demand or timing relationship, while a case-specific demand, payment, tracking reference, and supply outcome remain unobserved.

## Audit checks

- Schema validation: pass.
- IDs and references: pass for agencies, scenarios, sources, claims, nodes, edges, roadblocks, journey steps, and dependencies.
- Evidence boundary: preserved; the journey states that no identifier, upload, payment, or submission was made.
- Edge policy: applied as above; no edge lacks cited evidence, so no edge warrants removal on the supplied policy.
