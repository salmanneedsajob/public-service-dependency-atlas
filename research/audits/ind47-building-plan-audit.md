# IND-47 independent audit — building-plan ledger

Audited 2026-08-31 against only `ledger/building-plan.json`, `ledger/schema.json`, and `ledger/AGENT_PROTOCOL.md`. This report does not alter the ledger.

## Result

The JSON parses, IDs are unique, and the direct ID references checked for claims, sources, nodes, scenarios, and node-detail claim lists resolve. Every non-`Unknown` claim has at least one source. Those structural checks do **not** make the route or the displayed journey reliable: citation scope, claim atomicity, reciprocal evidence links, and scenario coverage are materially unsound.

## Findings and required corrections

1. **Material — the historical route claim has no reproducible supporting citation.** `claim_building_w_route` says a “public procedure index” labels Sakala/manual, Suvarna, CC/OC, and head-office routes, but it cites `source_building_w_procedure`, whose URL/title are the BPAS FAQ. The claim’s own notes say the original endpoint is unavailable. The cited record therefore is expressly not the procedure-index evidence asserted.

   **Correct:** replace it with a specific still-public official procedure document/page that actually displays those labels, including its access date; otherwise change the claim to `Unknown`, unlink the route edges/scenarios that rely on it, and state that the historic route labels could not be independently reproduced.

2. **Material — scenario journeys overclaim a sequenced route from mixed-era, partial evidence.** Both `scenario_building_w_suvarna` and `scenario_building_w_general` show the same linear path through inspection, fee, and licence, while its supporting edges rely chiefly on the dated/manual claims `claim_building_w_scrutiny` and `claim_building_w_fee_license`. The current FAQ source also describes later CC/OC stages, not evidence that every proposal follows this exact sequence. `edge_building_w_inspection_fee` in particular states that inspection/review precedes fee/authority processing without a claim that establishes that ordering for the current route.

   **Correct:** keep the scenarios as unordered “public evidence leads,” or split them into separately evidenced current stages. Mark the inspection-to-fee edge `unknown` with an explicit limitation unless a current source proves the order. Do not present the path as an end-to-end application route.

3. **Material — the scenarios omit their own entry node.** `journey_building_w_public` begins at `node_building_w_entry`, but neither `scenario_building_w_suvarna` nor `scenario_building_w_general` includes that node in `pathNodeIds`. The route is therefore not representable from the scenario path alone.

   **Correct:** add `node_building_w_entry` as the first path node if the scenario is retained as a journey, or remove the journey step and describe it as a standalone public-interface observation.

4. **Material — source-to-node linkage is substantially incomplete.** Many IND-47 claims name a node in `claim.nodeIds` but are absent from that node’s `claimIds`. Examples include:

   - `node_building_w_professional`: current professional/CAF/manual/form claims;
   - `node_building_w_docs`: e-Khata, NOC, checklist, form, and single-window claims;
   - `node_building_w_inspection`: current NOC/inspection, Suvarna, checklist, and published-inspection claims;
   - `node_building_w_fee`: demand-note, payment-mode, calculator, Suvarna, and manual claims; and
   - `node_building_w_license`: e-Khata, stages, timing, citizen-search, and reported dependency claims.

   The inverse node list is what a renderer will ordinarily use, so the strongest current evidence is hidden while old C-grade statements remain prominent.

   **Correct:** make `node.claimIds` exactly reconcile with claims that name the node, or document a deliberately one-way relation in the schema. Add current B-grade evidence before retaining dated C-grade summaries.

5. **Material — empty detail fields conceal evidence that was actually found.** `node_building_w_inspection` and `node_building_w_license` have empty `checks`, `failureSignals`, and `recoveries`, yet current/public claims are linked to each node (for example `claim_ind47_site_inspection_document_schedule`, `claim_ind47_eight_permit_steps`, and `claim_ind47_ekatha_mandatory_message`). Under the protocol, an omitted marker means “not yet researched”; `researchedNoSourceFound: []` is not a substitute for recording found evidence.

   **Correct:** add supported detail records to these nodes, including the age/currentness limitation. Do **not** add `researchedNoSourceFound` for a field where a public source was found. For genuinely unsearched failure/recovery routes, leave the field unmarked and state “not yet researched” in the rendered limitation.

6. **Material — claims are frequently compound, contrary to the atomic-claim rule.** Clear examples are `claim_ind47_public_entry_surface`, `claim_ind47_online_application_inputs`, `claim_ind47_documents_nocs`, `claim_ind47_status_and_stages`, `claim_ind47_risk_matrix`, `claim_ind47_suvarna_scope_and_published_steps`, and `claim_ind47_recovery_published`. Each combines multiple independently checkable controls, requirements, thresholds, workflow steps, or recovery channels. `claim_ind47_fee_and_payment_guidance` also combines demand-note timing with the conclusion that payment instructions conflict.

   **Correct:** split each into atomic records: one for each portal notice/control, professional/CAF statement, document class, NOC dependency, stage list, risk/timeline statement, Suvarna eligibility threshold, published procedural step, and recovery channel. Link only the relevant node and scenario to each new record. Preserve the current broad wording only as a narrative renderer summary, not a claim.

7. **Material — several direct public observations are incorrectly only `partial`.** A claim worded solely as “the current public [page/FAQ] says/displays …” is a directly observed official interface statement and should be `verified` at grade B even though property-specific applicability is unknown. This affects, at minimum, `claim_ind47_ekatha_mandatory_message`, `claim_ind47_online_professional_predcr_route`, `claim_ind47_faq_document_leads`, `claim_ind47_noc_conditions`, `claim_ind47_eight_permit_steps`, `claim_ind47_public_checklist_inputs`, `claim_ind47_suvarna_document_leads`, `claim_ind47_suvarna_ten_working_days`, and `claim_ind47_citizen_search_fields`.

   **Correct:** set the source-observation claim `verified`; add a separate `Unknown`/`partial` inference for applicability to an individual property. This preserves the protocol’s distinction between source strength and a live case outcome.

8. **Material — “unknown” boundary claims mislabel an inference as observation.** `claim_ind47_live_case_boundary_unknown` and `claim_ind47_post_login_path_unknown` infer what the pass cannot establish from a public/login boundary. The boundary itself is observed; the unestablished case state is an inference.

   **Correct:** set `basis` to `inference`, or `mixed` and explicitly separate the observed control from the conclusion in `notes`.

9. **Material — payment conflict is incompletely modelled.** `claim_ind47_fee_and_payment_guidance` and `claim_ind47_online_only_payment_do_guidance` are reciprocally linked and rightly `contested`, but the separately recorded `claim_ind47_online_only_payment_mode` says cash/cheque/DD are not accepted and is only `partial` with no contradiction link. It is part of the same payment-mode conflict. The ledger also does not preserve each FAQ question/answer context, so “therefore internally conflicting” is stronger than the citation record supports.

   **Correct:** split the payment statements by FAQ answer and charge/stage; link every incompatible proposition reciprocally and mark the service-level instruction `contested`. If the answer contexts cannot be shown, downgrade the conflict conclusion and state that the public page contains unreconciled guidance rather than asserting a system contradiction.

10. **Material — the map/builder “contradiction” is not established.** `claim_ind47_building_public_map_signal_reported` and `claim_ind47_building_builder_sanction_representation_reported` come from the same unverified prospective-buyer account. A map signal and a claimed sanctioned plan are not inherently mutually exclusive; the post does not authenticate either record or establish the asserted interpretation. Calling the records contradictory elevates a single report into a factual conflict.

   **Correct:** retain two E-grade, `partial` first-person reports if useful, remove the reciprocal contradiction links and `contested` status, and label the roadblock as an unverified due-diligence lead. A contradiction may be added only after two independently verifiable, mutually exclusive records are cited.

11. **Material — stale sources and duplicate representations weaken citation policy.** The ledger carries older `source_building_w_*` citations alongside IND-47 current sources for the same BPAS entry, FAQ, and manual. `source_building_w_submission` describes a publicly reachable official entry yet supports a C-grade/`partial` login-boundary claim; under the protocol a current unauthenticated public-interface observation is B. `source_ind47_bpas_public_entry` and `source_ind47_bpas_entry_live` also duplicate the same observation as an official portal and firsthand observation without a stated reason for choosing one.

   **Correct:** consolidate duplicate source records by URL/access event, give the direct current observation B weight, and retain dated material as C only where the manual itself is dated or otherwise not current. Cite the actual document used; do not cite a general home page or a substitute FAQ for historic content.

12. **Material — `claim_building_sec299` is unsupported by its cited source as described.** `source_building_kmc_299` says it is a general India Code entry point, does not reproduce every captured detail, and is not claim-specific. It cannot support the claim’s detailed recitation of section 299 requirements.

   **Correct:** cite the exact official Act/section text and retain grade A only if that text is verified. Until then, make the detailed statutory claim `Unknown` or replace it with the narrower, sourced statement that an official Act entry point exists.

13. **Moderate — agency records are misleading and duplicated.** `agency_bda_ind32_building` names BDA but gives the BBMP home page as its official URL. The `*_ind32` and `*_ind32_w` agency records duplicate GBA/BPAS identities. This impairs ownership and source attribution even though the IDs resolve.

   **Correct:** use BDA’s actual official URL or remove the record, and consolidate duplicate agency identities. Update every affected `ownerAgencyId` rather than creating parallel “w” entities.

14. **Moderate — the embedded audit roadblock is not valid evidence and is truncated.** `roadblock_audit_building_plan` places a markdown audit inside `symptom`, with no claims, only one unrelated node/scenario, and an incomplete final sentence (“makes the building-plan graph mislead”). It asserts audit conclusions/counts without a traceable evidence record. An audit report belongs outside the service journey.

   **Correct:** remove this roadblock from the service graph and use this external audit report. If a user-facing limitation must remain in the ledger, make it a short, sourced, service-relevant statement with no unsupported counts.

## Limitations that must ship if unresolved

- The ledger establishes public-interface text and a mixture of dated BBMP materials; it does not establish the correct GBA/city-corporation route, category, professional eligibility, checklist, NOCs, fee demand, payment acceptance, inspection, or approval for a property.
- Current authenticated form sequence, validations, handoffs, and case outcomes remain unknown; no login, value entry, upload, payment, or submission was observed.
- Suvarna/manual/head-office labels and their applicability are not reproducibly current until the missing procedure-index citation is replaced.
- The displayed linear route is a research scaffold, not a confirmed end-to-end workflow.
- Payment guidance is unresolved until the exact current FAQ contexts are reconciled by an authoritative source.
- Citizen reports are leads only. They do not establish delays, map/legal status, sanction validity, or utility-connection requirements.
