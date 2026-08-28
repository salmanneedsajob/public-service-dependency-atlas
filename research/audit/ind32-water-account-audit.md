# IND-32 audit — water account ledger

**Scope.** One independent, read-only audit of `ledger/water-account.json` against `ledger/schema.json` and `ledger/AGENT_PROTOCOL.md`, completed 2026-08-28. This is an audit report, not a ledger change.

**Result.** The document passes the JSON Schema and all checked internal references resolve. Scenario path-node membership, edge endpoint scenario membership, and journey references are internally consistent. Preserve all 12 edges: eight `partial`, three `unknown`, and one `verified`. The three `unknown` account-transfer edges are evidence-backed by the inspected public Jaladhare/FAQ material and correctly state what was *not* observed; they should remain visible rather than be removed.

## Material findings

1. **The decisive unknown claims are compound.** `claim_ind32_water_account_transfer_unknown` jointly covers whether sale, inheritance, tenancy, death, and spelling correction share a route, plus documents, arrears, deposit, fees, and service standards. `claim_ind32_water_account_workflow_case_unknown` jointly covers documents, arrears/deposits, fee, status, approval, and timing. These are meaningful documented gaps, but they are multiple separately checkable claims and cannot be individually updated or contradicted under the protocol.

   **Ship limitation:** current public material does not establish an existing-account name-transfer workflow. It must not be rendered as a list of requirements, a fee promise, a decision path, or a completion-time commitment.

2. **Five IND-32 water-account claims are attached only to the inherited generic electricity `scenario_clean_sale` and to no dependency node.** The affected claims are `claim_ind32_water_account_board_authority`, `claim_ind32_water_account_public_adjacent_only`, `claim_ind32_water_account_faq_scope`, `claim_ind32_water_account_contact_route`, and `claim_ind32_water_account_transfer_unknown`. The later `claim_ind32_water_account_workflow_*` claims are correctly attached to the four water scenarios and nodes, so the data is not unsupported; however, the earlier evidence block is orphaned from the intended water-account paths. It will not reliably inform the journey/roadblock renderings.

3. **One cited official source is unused.** `source_ind32_water_account_district_directory` is not referenced by a claim. This is a maintenance limitation only; it does not validate or invalidate the transfer workflow.

4. **The two citizen leads are appropriately non-universal but should not be promoted.** `claim_ind32_water_account_citizen_office_quote` is a single Grade-E report, and `claim_ind32_water_account_citizen_prior_holder_barrier` is a Grade-F lead. Neither establishes BWSSB charges, an office rule, or a prior-holder requirement. No conflicting formal claim is supplied, so no operational conclusion can be drawn from them.

## Checks performed

- JSON Schema validation: pass.
- IDs: unique within each top-level collection.
- All source, scenario, node, claim, agency, roadblock, journey-step, and journey-dependency references: pass.
- All non-`Unknown`-grade claims have sources; IND-32 sources have ISO access dates and the ledger jurisdiction is Bengaluru, Karnataka.
- The unknown/partial edges retain their explicit evidence boundary. No edge was downgraded, deleted, or re-audited.
