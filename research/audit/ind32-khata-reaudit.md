# IND-32 khata ledger re-audit

**Verdict: conditional fail — three material edge corrections remain.**

Scope was limited to `ledger/khata.json`, `ledger/schema.json`, and `ledger/AGENT_PROTOCOL.md`, applying the supplied edge-evidence policy. No external evidence or prior audit material was reviewed.

1. **`edge_ind32_property_search_to_missing_route` is unsupported as recorded, despite official support in the ledger.** Its label says the route is citizen-reported and not officially documented, its `claimIds` is empty, and its status is `unknown`. This conflicts with `claim_ekhata_search_recovery` (Grade B, verified), which directly records the public e-Aasthi search and its “Do Not Find My Property” recovery route. Link that claim and set the edge to **`verified`**: the official interface supports this conditional transition.

2. **`edge_ind32_mutation_to_final_ekhata` is undergraded.** `claim_ind32_rule10_no_objection_form24` is Grade A and directly establishes the conditional Rule 10(3) transition: after notice, no objection, and certification, a Form 24 e-Khata order is issued. The edge already preserves those conditions in its label, so its status should be **`verified`**, not `partial`. Lack of proof of a particular live-portal completion does not negate the official transition support.

3. **`edge_epid_to_mapping` is misclassified as `unknown`.** `claim_epid_route_visible` is Grade B evidence that BESCOM visibly offers “Name Change with EPID.” It does not establish the cross-system mapping contract, which the label correctly qualifies as unknown, but it does establish one official route involving the EPID. Under the supplied policy, mark the edge **`partial`** rather than `unknown`.

No dangling node, scenario, or claim reference was found among the six edges. The other three edges’ stated statuses are consistent with the evidence and qualifiers recorded in the permitted ledger files.
