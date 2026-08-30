# IND-49 LPG audit

Scope: `ledger/lpg.json`, `ledger/schema.json`, and `ledger/AGENT_PROTOCOL.md` only. This is an audit, not a ledger edit.

## Ship decision

**Do not ship IND-49 as a single Bengaluru LPG journey.** It can ship only as clearly separated, provider-specific public guidance with the case outcome hidden as Unknown. The current material does not determine a consumer's OMC, assigned distributor, service area, provider-specific document packet, eligibility, or transaction result.

## Required corrections before shipping

1. **Split the provider and move branches.** `scenario_lpg_workflow_same_town` is a same-town scenario but contains `claim_ind49_iocl_out_town` and `claim_ind49_hpcl_out_town`; `journey_ind49_lpg_same_town_public` is titled “Same-town or out-of-town.” Create a distinct out-of-town scenario/path, or remove those claims from the same-town scenario and journey. Do not make a same-town path imply equipment surrender, TV/refund, or reconnection.

2. **Separate address update from portability.** `journey_ind49_lpg_same_area_public` combines an existing-distributor address update with portability to another distributor. These are different actions and are supported by different OMC pages. A Bharatgas locator cannot identify the OMC for an already-existing unknown Indane or HP Gas connection; it is only a BPCL locator after the provider is known. Give portability its own provider-specific scenario and portal node, and retain the address-update path as an existing-distributor branch.

3. **Make the family/death path internally consistent.** `scenario_lpg_family_or_death.pathNodeIds` names `node_lpg_transfer_type` and `node_lpg_document_check`, while `journey_ind49_lpg_family_public` uses `node_lpg_w_route`, `node_lpg_w_proof`, and `node_lpg_w_outcome`; those workflow nodes do not declare the family scenario. Either rewire the journey to the scenario path or add correctly supported family nodes and scenario memberships. The only current IND-49 family/death form evidence is Bharatgas-specific, so the scenario must say Bharatgas or acquire equivalent current Indane/HP evidence.

4. **Stop merging OMC artifacts in shared nodes and edges.** `node_lpg_w_transfer_out`, `node_lpg_w_transfer_in`, `edge_lpg_w_out_in`, and their summaries use a hybrid “TTV/CTA Out/TSV/CTA In” sequence while their attached claims cover IndianOil and HPCL. TTV/TSV and HP e-CTA are carrier-specific terminology; the cited pages do not establish one interchangeable flow. Use carrier-specific nodes/edges, with a neutral precondition node only for “provider and move boundary unknown.” Also change the BPCL-owned workflow nodes when they present Indane/HP rules; use the relevant OMC or a neutral OMC group without suggesting a BPCL procedure governs the other carriers.

5. **Split compound claims into atomic claims.** At minimum split:
   - `claim_ind49_lpg_indane_transfer_branches` into same-area, same-town, and out-of-town observations;
   - `claim_ind49_lpg_hp_transfer_branches` into within/adjoining-city and outside-town observations;
   - `claim_ind49_bpcl_portability_limits` into selected-city scope, zero-fee/deposit statement, and login requirement;
   - `claim_ind49_hpcl_portability_auth` and `claim_ind49_lpg_hp_portability_login_otp` into route/scope and authentication assertions;
   - `claim_ind49_pib_omc_digital_services` and `claim_ind49_pib_registered_login` by provider/action and historic service condition;
   - the multi-item Unknown claims (`claim_ind49_current_bengaluru_unknowns` and `claim_ind49_lpg_current_case_unknown`) into provider, service-area, document, fee, and outcome unknowns.

   The two latter claims materially duplicate each other. Keep one atomic Unknown per unanswered fact; do not use a long Unknown list as source-free support for every downstream node.

6. **Correct evidence grade and provenance.** The protocol assigns grade **B** to a current official form. `claim_ind49_bpcl_form_types` is a direct observation of `source_ind49_bpcl_form` (an official form accessed 2026-08-31) and should be B unless the form could not actually be read, in which case it must be C/partial with that precise limitation. Conversely, the 2021 PIB release is official historical policy context, not a current rule or live transaction record: keep it C/partial and do not surface its three-day withdrawal/automatic-transfer statement as present Bengaluru procedure.

7. **Resolve duplicate and contradictory source provenance.** `source_ind49_bpcl_portability` and `source_ind49_lpg_bharatgas_portability` cite the same URL on the same date but differ in type and observation notes. The latter says current rendering was observed while direct navigation to the host was unavailable. The corresponding login source makes the same incompatible assertion. Consolidate each page into one source record that states how it was observed; if the asserted fields were not directly observed, downgrade the dependent B/verified claims to C/partial or Unknown. Do not retain two records to make the same page look independently corroborated.

8. **Constrain the declaration and blank-form claims.** `claim_ind49_bpcl_written_address_notice` and `claim_ind49_bpcl_declaration_kyc` report Bharatgas undertaking text. They are not a binding government requirement, a universal OMC procedure, or evidence that a particular written request/KYC packet will be accepted. Attach them only to a BPCL-specific context and split the address-notice, KYC, identity/address-proof, and household/de-duplication statements.

9. **Repair detail links.** Legacy workflow checks point to the generic `https://www.bharatpetroleum.in/` while claiming support from specific manuals/forms; IND-49 checks are mostly better. Every check/failure/recovery should link to the exact carrier source supporting it, not a generic homepage. `check_ind49_kyc` combines HP and BPCL evidence but links only HP; split it or provide two detail records.

10. **Remove unsupported `researchedNoSourceFound` markers.** `node_lpg_w_transfer_out`, `node_lpg_w_transfer_in`, `node_lpg_w_update`, and `node_lpg_w_outcome` mark empty detail fields as searched. The constrained ledger does not record a field-specific public-route search establishing “no source found”; it records public guidance and no live case. Per protocol, remove these markers until such a search is recorded. In particular, do not mark `node_lpg_w_outcome.checks` as searched-empty while a dated PIB outcome claim is attached; either add a narrowly worded historical check or leave the field visibly not yet researched.

11. **Reclassify citizen reports as historical leads, not workflow roadblocks.** The three E claims are correctly framed as one-person reports, but their roadblocks are attached to the current `same_town` path even when the actual service boundary is unknown. The address-update report may be same-area; the payment report may be any move type; neither establishes a current route. Move them to a separately labelled historical/citizen-evidence context, or remove scenario tags that imply a determined branch. Split the online-report claim: reported transfer completion, failed document download, feedback contact, and reported resolution are distinct facts.

## Government/OMC boundary

IndianOil, HPCL, and BPCL/Bharatgas pages are OMC/distributor guidance. They may support a claim about that carrier's published page, not a common government-mandated LPG transfer workflow. The PIB item is a dated government communication about OMC services, not a law, regulation, current selected-city list, or proof that an account will transfer automatically. Keep this boundary in titles, node ownership, journey text, and recovery language.

## Contradictions and status hygiene

- No pair of IND-49 claims is presently cross-linked as a contradiction. The carrier sequences are not contradictions; they are separate provider rules. The ledger instead creates a false combined sequence. Separate the records rather than adding `contradictsClaimIds`.
- `verified` is appropriate only for the observed page/form statement, not for an end-to-end route. The current verified compound branch claims should become independently verified source observations after splitting; all case eligibility, service-area matching, fee, timing, approval, number change, and delivery claims remain Unknown.
- Roadblocks with an unknown OMC should not name BPCL and the generic OMC group as if both own the specific case. Leave ownership unknown or create provider-specific roadblocks.

## Residual ship limitations

Even after correction, the ledger may state only that public pages/forms/portal boundaries were observed on 2026-08-31 and that a live case was not entered. It must not state or imply that Bengaluru is a selected Bharatgas portability city, that any named address is served by a distributor, that a document will be accepted, that a fee/refund applies, or that the PIB's historical automatic-transfer timing currently operates.
