# IND-46 — trade-licence audit

Scope: `ledger/trade-license.json` reviewed only against the supplied schema and protocol. No ledger or site records were changed. The JSON parses, top-level IDs are unique, every non-`Unknown` claim has a source, and all checked references resolve **except the three agency references below**.

## Required corrections

1. **Repair dangling agencies (material).** `roadblock_ind46_legacy_routes` names `agency_gba_trade_ind46` and `agency_bbmp_trade_ind46_legacy`; `roadblock_ind46_trade_outcome_boundary` names `agency_gba_trade_ind46`. None exists in `agencies`. Replace them with evidence-supported existing agencies or add real agency records; do not leave inferred current/legacy ownership.

2. **Remove invalid `researchedNoSourceFound` markers (material).** The protocol permits a marker only for an empty field whose route was actually searched. These marker/field pairs are nonempty: `node_trade_w_entry.failureSignals`, `node_trade_w_entry.recoveries`, `node_trade_w_payment.recoveries`, and all three of `node_trade_w_issue.checks`, `.failureSignals`, and `.recoveries`. Remove the markers. Do not infer new markers from the refused routes or the authentication boundary.

3. **Remove `roadblock_audit_trade_license`.** It stores raw, truncated audit prose as a user-facing roadblock, has no supporting claims, and asserts unrelated BESCOM/e-Khata contamination not present in this ledger. It is neither a trade-licence failure mode nor usable evidence.

4. **Do not present inaccessible legacy content as current B-grade guidance.** `claim_ind46_trade_new_sequence` is Grade B although the same dated source URL is separately recorded as refusing connection on the same access date (`claim_ind46_manual_route_refused`). Keep the refusal observation at B, but mark the published-guide content historical/indirect (C) unless a currently accessible official copy is captured. Apply the same explicit access-time distinction to the FAQ and OTLS content claims versus their refused-route observations; otherwise mark the affected content claims `contested` and cross-link them. The source notes must not call a refused same-day route a “Direct public PDF/page” without explaining the historical capture.

5. **Split compound claims before relying on them.** At minimum split the independent propositions in `claim_trade_act_353`, `claim_ind46_trade_new_sequence`, `claim_ind46_trade_faq_documents`, `claim_ind46_trade_faq_payment_features`, `claim_ind46_trade_annexure_requirements`, `claim_ind46_trade_inspection_timing`, `claim_ind46_trade_refusal_refund_controls`, `claim_ind46_trade_otls_payment_review`, `claim_ind46_trade_otls_output`, and `claim_ind46_trade_contact_recovery_leads`. In particular, the generic India Code landing reference does not itself substantiate the old claim's detailed MSME/large-industry amendment assertion; retain the statutory basis separately and keep exemption applicability Unknown without a direct provision.

6. **Correct renewal scope and downstream links.** `scenario_trade_w_renewal` claims a prior-application-number and payment path without a supporting renewal-specific claim/source; it should be `unknown` and say only that a public renewal label exists, until a renewal route is verified. The IND-46 OTLS source describes a **new case**, so remove its renewal scenario tags from `claim_ind46_trade_otls_payment_review`, `claim_ind46_trade_otls_output`, and the edges/journey steps that use them unless a renewal source is added. The sole journey is tagged to the new scenario but titled “new/renewal”; scope it to new only or add independently supported renewal steps.

7. **Fix mislinked or overstated graph records.**
   - `edge_trade_w_review_issue` says review may result in a “return,” but its cited OTLS and Unknown claims do not establish that alternative. Link a distinct rejection/endorsement claim and restrict it to new filing, or remove “return.”
   - `edge_trade_w_payment_review` and `edge_trade_w_review_issue` are `unknown` despite their cited historical workflow claims. If retained as historical relationships, mark them `partial`; if describing a current route, keep them Unknown but do not use dated claims as proof.
   - `roadblock_ind46_trade_legacy_route` describes refused/legacy routes but omits the three direct refused-route claims; add those links or narrow the roadblock to the directory/contact limitation it currently cites.
   - `roadblock_ind46_trade_outcome_boundary` mentions inspection/review but omits `node_trade_w_review`, and also has a dangling agency. Fix both.
   - `claim_ind46_downstream_unknown` bundles documents through licence issue but is attached only to the issue node. Split it or attach each atomic limit to the relevant node.

## Status and disclosure

The direct citizen-service-directory observation is an atomic, fully observed directory fact and should be `verified` at Grade B; its inability to establish target eligibility or case outcome belongs in separate Unknown limitations, not in a downgraded directory fact. The dated FAQ, Annexure F/G, OTLS and contact material may remain Grade C only as historical leads, with their legacy/current-implementation limit visible on every dependent route, fee, timing, rejection, refund, review, and recovery statement. No current target, eligibility, fee, authentication requirement, validation result, inspection, approval, or licence outcome is established.
