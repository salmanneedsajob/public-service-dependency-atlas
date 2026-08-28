# IND-32 water-connection audit

## Result

The IND-32 water-connection records parse cleanly and their audited claims, nested details, journey steps, dependencies, and top-level edges resolve to existing IDs. Both journey dependencies are represented as top-level edges with matching endpoints, claim linkage, and status.

## Stated limitations

1. **Six official-guidance claims are over-graded.** `claim_ind32_water_manual_stages`, `claim_ind32_water_manual_consumer_site_fields`, `claim_ind32_water_manual_documents`, `claim_ind32_water_manual_review`, `claim_ind32_water_manual_demand_payment`, and `claim_ind32_water_faq_workflow` use evidence grade `A`, while their cited sources are `official_guidance`. Under the protocol, those direct official manual/FAQ observations support grade `B`, not grade `A` (which is reserved for binding law, regulation, order, or gazette material). Treat their present grade as a traceability limitation, not proof of binding requirements.

2. **Parallel claim/source families duplicate the same evidence.** The `source_ind32_bwssb_*` and `source_ind32_water_*` records duplicate the Jaladhare manual/FAQ/grievance evidence, and several claims duplicate the same assertion under different IDs (including manual stages, document uploads, review charges, demand conditions, grievance fields, the end-to-end unknown, and route-currentness uncertainty). This weakens the protocol's one-record identity discipline and could permit future divergence between equivalent records.

3. **Unknown-edge marker is not machine-readable.** `edge_ind32_water_review_to_inspection` and `edge_ind32_water_payment_to_rr` retain `unknown` status and explanatory prose, but neither label uses the IND-32 edge-policy marker `reported-undocumented`. A marker-dependent consumer would need to parse prose to identify the unsupported relationships.

4. **The property-specific route remains unverified.** The ledger appropriately preserves the mobile-OTP versus legacy SAJALA uncertainty, conditional-document variation, and the absence of a case-specific inspection, demand note, payment, or RR-number result as `unknown`/`partial`. These records should not be read as an approved end-to-end connection path.

These are documented limitations, not blockers.
