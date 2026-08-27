# IND-32 final khata audit

## Material findings

1. **Broken claim references in node details.** Fourteen nested `checks`, `failureSignals`, or `recoveries` reference claim IDs that do not exist: `claim_ind32_automatic_mutation_entry`, `claim_ind32_pending_mutation_report_fields` (twice), `claim_ind32_payment_failure_recovery` (four times), `claim_ind32_public_search_inputs` (three times), `claim_ind32_ekhata_status_public_route` (three times), and `claim_ind32_missing_property_route` (twice). These records therefore lose their evidence linkage and violate reference integrity.

2. **Verified municipal journey facts lack claim linkage.** Eight verified IND-32 journey steps have empty `claimIds`; `dep_ind32_epid_status` is also marked `verified` with no claim ID. In particular, the ledger already contains the relevant verified claim (`claim_ekhata_status`) that the public status page accepts an EPID, but neither the dependency nor a top-level edge links it. This leaves verified workflow assertions unsupported in the rendered journey.

3. **Supported journey dependencies are missing from `edges`.** `dep_ind32_deed_to_mutation` is `partial` and cites public municipal evidence, and `dep_ind32_epid_status` is `verified`, but neither relationship is represented in the top-level `edges` collection. The protocol assigns reusable system relationships to `edges`; under the supplied edge policy, these edges must be retained and assigned the strongest supported status.

4. **The recorded unknown Final-eKhata/mutation ordering is not preserved as an edge.** `dep_ind32_draft_final_unknown` explicitly records that the ordering between `node_final_e_khata` and `node_mutation` is unknown, but no corresponding top-level edge retains that uncertainty. Per the edge policy, it should be kept as an unknown edge labelled `reported-undocumented`, rather than being omitted.
