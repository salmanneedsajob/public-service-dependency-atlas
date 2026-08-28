# IND-32 audit — birth certificate ledger

**Scope.** One independent, read-only audit of `ledger/birth-certificate.json` against `ledger/schema.json` and `ledger/AGENT_PROTOCOL.md`, completed 2026-08-28. This is an audit report, not a ledger change.

**Result.** The document passes the JSON Schema, and its 21 edges have claim references. Preserve the evidence-backed graph: 19 `partial`, one `unknown`, and one `verified` edge. In particular, the partial/unknown birth-workflow edges appropriately retain the stated limitation that the current BBMP transition, required fields, submission, payment, result, and tracking were not publicly observed. The statutory claims support the legal relationships, not a completed current municipal journey.

## Material findings

1. **Broken reference integrity in the legacy citizen-evidence branch.** Seventeen references resolve to neither a current scenario nor node. This leaves seven claims and two roadblocks detached from the graph, despite the schema itself accepting the strings.

   - Missing `scenario_birth_name_addition`: `claim_ind32_birth_name_addition_delay`, `claim_ind32_birth_registered_office_assertion`, `claim_ind32_birth_name_correction_direct_success`, and `roadblock_ind32_birth_name_addition_stalled`.
   - Missing `scenario_birth_certificate_copy`: `claim_ind32_birth_qr_version_rejection`.
   - Missing `node_birth_name_addition`: the first three claims above and `roadblock_ind32_birth_name_addition_stalled`.
   - Missing `node_birth_certificate_copy`: `claim_ind32_birth_ledger_copy_mismatch`, `claim_ind32_birth_name_correction_direct_success`, `claim_ind32_birth_qr_version_rejection`, and `roadblock_ind32_birth_reissued_copy_differs`.
   - Missing `node_birth_record_correction`: `claim_ind32_birth_ledger_copy_mismatch`, `claim_ind32_birth_correction_introduced_error`, `claim_ind32_birth_name_correction_direct_success`, and `roadblock_ind32_birth_reissued_copy_differs`.

   **Ship limitation:** the citizen-evidence failure modes are not currently renderable or traceable through a valid scenario/node path; they must not be presented as part of the current workflow graph until the retained IDs are reconciled.

2. **Two overlapping birth workflow taxonomies are not consistently joined.** The older `scenario_birth_*` paths reference nodes whose `scenarioIds` only contain the newer `scenario_ind32_birth_*_workflow` IDs. The affected path memberships are:

   - `node_event_jurisdiction` in four older scenarios: registered copy, name inclusion, correction, and delayed/missing;
   - `node_name_inclusion` in older name inclusion;
   - `node_delayed_registration` in older delayed/missing; and
   - `node_authenticity` in older authenticity.

   The same drift appears in five old-scenario edge tags: `edge_ind32_birth_jurisdiction_search`, `edge_ind32_birth_name_certificate`, `edge_ind32_birth_delayed_search`, and `edge_ind32_birth_public_authenticity` each names a scenario absent from at least one endpoint. This is not a reason to delete the partial edges: their linked Act/directory claims are evidence-backed. It is a graph-navigation limitation caused by a partially retired taxonomy.

3. **Several unknowns are compound and therefore not independently auditable.** `claim_ind32_birth_current_case_unknown` combines record existence, Registrar ownership, documents/fees, online acceptance, and issuance. `claim_ind32_birth_workflow_end_to_end_unknown` combines public entry, jurisdiction, lookup, submission, payment, review, output, authenticity, and status. The evidence boundary is candid, but each listed uncertainty can change independently; the protocol calls for atomic claims.

4. **The only contested IND-32 birth claim has no contradiction link.** `claim_ind32_birth_registered_office_assertion` is `contested` but its `contradictsClaimIds` is empty. Its citizen source is a usable lead, but the ledger does not identify the competing claim or explain the contest. Treat the statement as a stated limitation, not as an office-jurisdiction rule.

5. **Two current-workflow sources are unused.** `source_ind32_birth_workflow_ejanma` and `source_ind32_birth_workflow_bbmp_it` are not cited by any claim. They create no incorrect claim, but do not strengthen the present graph.

## Checks performed

- JSON Schema validation: pass.
- IDs: unique within each top-level collection.
- All source, scenario, node, claim, agency, roadblock, journey-step, and journey-dependency references: pass except the 17 birth references itemized above.
- Non-`Unknown`-grade claims: all have at least one source; IND-32 sources have ISO access dates and Bengaluru/Karnataka jurisdiction text is present.
- No edge was downgraded or removed in this audit. The legal/public-directory evidence does not establish an end-to-end live BBMP process, which remains the correct displayed limitation.
