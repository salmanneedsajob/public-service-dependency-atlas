# IND-32 property-tax audit

## Result

The IND-32 property-tax records parse cleanly and the audited claims, nested details, journey steps, dependencies, and top-level edges resolve to existing IDs. The reusable journey dependency from the pending-mutation report to application status is now retained as `edge_workflow_mutation_to_status_ind32`, with the same `unknown` status and claim linkage.

## Stated limitations

1. **Unknown-edge marker is not machine-readable.** `edge_workflow_lookup_to_mutation_ind32` and `edge_workflow_mutation_to_status_ind32` preserve uncertainty in their prose and `unknown` status, but neither label uses the IND-32 edge-policy marker `reported-undocumented`. Consumers that depend on that marker cannot distinguish these unknown relationships from ordinary narrative labels without parsing text.

2. **End-to-end public workflow remains deliberately unproven.** The ledger correctly retains `claim_ind32_property_workflow_post_login_unknown` and `claim_ind32_property_workflow_sequence_unknown` as `Unknown`; no current public source establishes a property-specific route through login, validation, objection, payment, final e-Khata, and tax-register update.

3. **The file is a mixed ledger.** Pre-existing BESCOM/KERC agencies, scenarios, and records remain alongside the property-tax material. The IND-32 property-tax journey is internally linked, but downstream consumers need to scope to the property IND-32 scenario/node IDs rather than assume every record in this file concerns property tax.

These are documented limitations, not blockers.
