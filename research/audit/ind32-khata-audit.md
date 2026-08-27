# Khata ledger audit verdict

## Verdict: revise before relying on the graph

The JSON validates against `ledger/schema.json`; all IDs and cross-record references resolve, contradiction links that exist are reciprocal, IDs are unique, and the observed date values are ISO calendar-valid and no later than `meta.asOf`. Jurisdiction labels are appropriately Bengaluru/Karnataka for municipal claims and Karnataka for the statewide historic KERC material.

This does **not** validate the candidate as an evidence graph. Several edges and journey dependencies assert system transitions which their cited claims expressly say are unestablished. There are also duplicate source/claim records, improper or missing contradiction handling, compound claims, and scenario/node tagging gaps. Preserve the existing Unknown claims; they are the correct boundary for most of these issues.

## Required source and claim changes

1. **Downgrade `claim_legacy_route_taxonomy` to `evidenceGrade: "Unknown"`, retain `status: "unknown"`, and set `sourceIds: []`.** Its only source, `source_bescom_legacy`, points to the BESCOM homepage, while the source note says an unspecified *former* endpoint was unreachable. That URL cannot evidence either the checked endpoint or the broader absence of a current route taxonomy. Keep the information as an Unknown gap. Alternatively, retain Grade B only after recording the actual checked legacy URL and access observation as its source.

2. **Split `claim_standard_authenticated_route` into atomic claims** (all B/observation/verified only if each instruction is visibly stated in `source_bescom_faq`): authentication; selecting Account ID; completing mandatory fields; uploading documents; submitting; retaining the request ID; and paying applicable charges. Do not leave an end-to-end sequence in one claim. Repoint the name-transfer and tracking records to the applicable pieces.

3. **Split `claim_historic_transfer_obligations`.** The stated “atomicity exception” conflicts with the protocol. Create separate historic/partial claims for no arrears, indemnity, fresh agreement, deposit treatment, and the published charge schedule (split LT and HT too if their amounts/rules differ). Keep Grade A only as strength of the historic regulation text and retain `partial` because current applicability is explicitly unconfirmed.

4. **Split or merge the overlapping Draft/Final e-Khata claims.** `claim_ekhata_final_guidance`, `claim_ind32_eaasthi_draft_register_basis`, and `claim_ind32_draft_final_guidance` repeatedly combine the Draft-versus-Final distinction, register basis, login boundary, and input list. Keep one atomic claim per subject (for example: Draft basis; login/download direction; each published Final-input list as a list observation) and remove/repoint duplicate claims. The existing statements do not prove that these inputs are accepted for a particular case.

5. **Merge exact duplicate source records and their duplicate claims.** Use one canonical source ID for each pair and repoint all references before deleting the duplicate:

   - `source_eaasthi_login` / `source_ind32_eaasthi_citizen_login`
   - `source_eaasthi_search` / `source_ind32_eaasthi_public_search`
   - `source_eaasthi_status` / `source_ind32_ekhata_status`
   - `source_citizen_old_owner_recovery` / `source_ind32_old_owner_reapplication` (same Reddit post, with one URL merely including its slug)

   Also merge/repoint redundant claim pairs where the surviving claim retains all cited sources: `claim_ekhata_search_recovery` with `claim_ind32_missing_property_route`/`claim_ind32_public_search_inputs`; `claim_ekhata_status` with `claim_ind32_ekhata_status_public_route`; `claim_mutation_fields` with `claim_ind32_pending_mutation_report_fields`; `claim_ind32_eaasthi_auto_mutation_visible` with `claim_ind32_automatic_mutation_entry`; and `claim_ind32_eaasthi_payment_recovery_text` with `claim_ind32_payment_failure_recovery`. Do not use duplicated observations to imply corroboration.

6. **Remove the false contradiction links between `claim_ind32_reapplication_after_invalidating` and `claim_ind32_missing_document_reapply`; set both `contradictsClaimIds: []`.** They report different case-specific reapplication paths, not incompatible propositions. Their `partial` statuses are appropriate.

7. **Change `claim_ind32_manual_khata_not_automatic` from `contested` to `partial` unless a specific opposing ledger claim is added and cross-linked.** Its current `contested` status has no contradiction link, contrary to the protocol. Grade F is defensible because the account predicts an outcome rather than reporting a completed result; retain the claim as a lead, not a rule.

8. **Do not make current-law claims more definite than their sources permit.** The historic KERC claims and the BBMP Act claims are correctly marked `partial` in light of their source notes. Keep those `partial` statuses and their jurisdiction. Do not upgrade them merely because the underlying documents are A-grade.

## Remove or repair unsupported graph assertions

Remove the following edges rather than preserving their relationship labels with caveats. A caveat saying an implication is not established does not support putting that implication into the graph.

| Record | Required change | Why |
| --- | --- | --- |
| `edge_sale_to_mutation` | Remove. | `claim_mutation_fields` reports visible fields; it does not show a sale deed produces mutation. |
| `edge_mutation_to_final` | Remove. | Its cited claims do not establish that mutation requires Final e-Khata; the label calls it only a “prudent hypothesis.” |
| `edge_final_to_epid` | Remove. | Search/status acceptance of ePID does not show Final e-Khata produces an ePID. |
| `edge_mapping_to_transfer` | Remove. | A standard BESCOM route is documented separately; no claim establishes mapping success as a prerequisite for name transfer generally. |
| `edge_ind32_sale_deed_to_mutation` | Remove. | A report’s deed/date fields do not establish a deed-to-mutation transition. |
| `edge_ind32_final_ekhata_to_epid` | Remove. | The cited public pages accept/display ePID but establish no Final-eKhata-to-ePID mapping. |
| `edge_ind32_mutation_to_status` | Remove. | The report and EPID status screens do not establish a shared case identifier or a mutation-to-status mapping. |

`edge_ind32_mutation_to_final_ekhata` may remain only after it is rewritten as a **conditional** relationship and `claim_ind32_rule10_no_objection_form24` is added as support: after notice, no objection within the stated period, and certification by the authorised officer, Rule 10(3) provides for Form 24. Keep it `partial`; it must not describe a live portal sequence or promise an outcome.

Apply the same repair to journey dependencies and steps:

- Remove `dep_ind32_deed_to_mutation` from `journey_ind32_public_clean_sale_boundary`; it repeats the unsupported sale-deed transition.
- Retain `dep_ind32_draft_final_unknown` and `dep_ind32_pending_to_final_unknown` only as explicit Unknown boundaries, not as affirmative workflow edges.
- Rewrite any journey text that says to use a municipal route “before” another one, or treats a status page as a recovery path, unless a cited claim proves that ordering or handoff. In particular, the clean-sale and missing-property journeys must not imply that the missing-property route feeds EPID status or that the status screen handles a missing property.

## Status and tagging corrections

1. **Set `roadblock_property_missing` to `partial`, not `verified`.** The official page verifies a visible fallback route; no property-specific “missing” state or result was observed. The same principle applies to `roadblock_ind32_property_not_found`: retain its documented route, but set the roadblock itself to `partial` unless it is explicitly defined as “public fallback label visible.”

2. Add `scenario_epid_mapping_failure` to `node_epid.scenarioIds`; that node is in the scenario path and is used by `journey_epid_failure`.

3. Resolve the two other journey/node scenario mismatches explicitly:

   - Either add `scenario_clean_sale` to `node_missing_property_recovery.scenarioIds` and to `claim_ind32_missing_property_route.scenarioIds`, or remove `step_ind32_handle_missing_property` from the clean-sale journey.
   - Either add `scenario_missing_property` to `node_khata_application_status.scenarioIds` and `claim_ind32_ekhata_status_public_route.scenarioIds`, or remove `step_ind32_missing_status_handoff`. The safer evidence reading is removal: an EPID status screen is not shown to recover a property that cannot be found.

4. Standardize node-to-claim indexing. Direct `claim.nodeIds` references resolve, but node `claimIds` are an unrelated subset (including one node-only reference to `claim_ind32_post_login_fields_unknown`). Either make this index reciprocal or state it is intentionally a curated display subset and remove it from integrity-sensitive views. The present mix makes a claim disappear from the node that it explicitly tags.

## Unknowns to preserve

Keep `claim_epid_mapping_unknown`, `claim_ind32_post_login_fields_unknown`, `claim_ind32_mutation_eligibility_unknown`, `claim_ind32_objection_recovery_unknown`, and `claim_ind32_end_to_end_sequence_unknown` at `Unknown/unknown`. They correctly prevent the ledger from treating public labels, report columns, a Form 24 specimen, or citizen accounts as proof of an authenticated end-to-end municipal or BESCOM workflow.
