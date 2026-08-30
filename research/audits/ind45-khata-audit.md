# IND-45 Khata audit — 2026-08-30

Scope: `ledger/khata.json` against `ledger/schema.json` and `ledger/AGENT_PROTOCOL.md` only. This is an audit of the IND-45 additions, not a new research finding.

## Required corrections

1. **Repair observation provenance before relying on the claims.** `claim_ind45_missing_route_no_navigation` and `claim_ind45_pending_mutation_route_currently_blank` describe actions/outcomes on 2026-08-30, but cite only IND-32 sources accessed on 2026-08-28. The latter also records a second `/office/` URL absent from its source record. Add claim-specific 2026-08-30 observation sources (or update the cited source records with those exact observations and access date); otherwise remove the dated/action-result wording. `claim_ind45_draft_login_controls_visible` likewise says it was directly observed on 2026-08-30 while its only cited source is recorded as accessed 2026-08-28.

2. **Remove the false contradiction around the mutation report.** `claim_ind32_pending_mutation_report_fields` reports fields observed earlier, while `claim_ind45_pending_mutation_route_currently_blank` reports a blank/not-found result later. These time-bounded observations can both be true; they are route/currentness drift, not incompatible propositions. Remove the `contradictsClaimIds` link and change the IND-45 claim/roadblock from `contested` to `partial` (or `unknown` for current availability). If retained as a contradiction, the IND-32 claim must also have the reciprocal link and `contested` status, per protocol.

3. **Fix invalid `researchedNoSourceFound` markers.** The protocol permits a marker only for an *empty* detail field that was actually searched. `node_sale_deed` marks `failureSignals` and `recoveries` although both arrays have entries; remove both. `node_epid` marks `failureSignals` although it has `failure_ind45_epid_status_no_data`; remove that marker. Its `recoveries` marker is defensible only if the precise search documented by `claim_ind45_epid_specific_failure_recovery_unknown` is retained; otherwise remove it too. `node_missing_property_recovery.checks` is empty, but its marker should remain only if the constrained click-without-data observation is considered an actual search for publicly documented checks, rather than a login/input boundary.

4. **Split or relabel compound claims.**
   - `claim_ind45_status_default_no_data` bundles input controls, table headings, a default row, waiting-list guidance, and a helpline; split into atomic interface observations.
   - `claim_ind45_draft_login_controls_visible` combines visible controls with the service statement about Draft eKhata; split controls from service guidance.
   - `claim_ind45_pending_mutation_route_currently_blank` combines two routes/outcomes; split per route once source evidence is recorded.
   - `claim_ind45_khata_upload_validation_failure` says the application could not proceed **because** of the reported upload error. The citizen account supports a reported sequence, not causation. Reword as “reported both …” (or mark `basis: mixed` and explain the inference).
   - `claim_ind45_khata_prior_holder_correction_block` contains at least final issuance in a prior holder’s name, an eKYC screen condition, and inability to complete correction; retain them as separately qualified report facts if each is needed.

5. **Correct weak node/process links.** `claim_ind45_current_tax_notice_visible` and `claim_ind45_draft_login_controls_visible` establish a public existing-record/Draft eKhata entry surface, not a registered-sale-deed requirement; remove their `node_sale_deed` link (and do not let it imply clean-sale eligibility). `claim_ind45_form24_cancellation_condition` concerns a conditional e-Khata order after verification, yet is presented solely as a sale-deed failure signal. Link it to `node_final_e_khata` and/or `node_mutation`, and keep the limitation that it is neither a live cancellation event nor a portal review sequence.

6. **Deduplicate overlapping Unknowns.** `claim_ind45_epid_specific_failure_recovery_unknown` and `claim_ind45_epid_failure_recovery_unknown` both assert that no EPID-specific correction/recovery was established without entering an identifier. Merge them or narrow one to a distinct, documented question; otherwise they create the appearance of two independent research gaps.

7. **Do not infer a single responsible agency.** `agency_gba` conflates “Bengaluru City Corporations e-Aasthi” with the Greater Bengaluru Authority, while IND-45 portal sources identify the former/Government of Karnataka and the recovery is to a respective ARO. Either use a precisely named portal/municipal-service agency or leave ownership absent/unknown where the source does not attribute it. In particular, do not use the generic `agency_gba` owner to imply that GBA itself operates every portal action or resolves the two citizen-reported roadblocks.

8. **Remove `roadblock_audit_khata` from the evidence graph.** It is a meta-audit narrative, not a user-facing Khata roadblock, and embeds broad unlinked assertions inside required roadblock text. Keep audit conclusions in `research/audits/`, not in `ledger/khata.json`.

## Preserve as limitations

- The IND-45 `Unknown` claims correctly avoid treating blank/default public views, unauthenticated pages, and unsubmitted inputs as case outcomes. Keep that boundary after deduplication.
- The two citizen reports are properly limited to one case each at Grade E. They do not by themselves establish an eKYC rule, a general upload defect, an offline-route absence, or a universal correction barrier.
- The Form 24 document is strong evidence for the stated conditional safeguard, but not for a completed transfer, live portal sequence, eligibility rule, or timing commitment.
