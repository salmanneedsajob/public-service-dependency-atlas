# IND-32 trade-license ledger audit

## Scope and result

Audited `ledger/trade-license.json` against `ledger/schema.json` and `ledger/AGENT_PROTOCOL.md` only. The JSON validates against the supplied schema; all checked references resolve, IDs are unique, all non-`Unknown` claims cite at least one source, and recorded access dates are ISO-shaped.

The service-specific evidence is a **partial public-guide map**. It supports public entry labels and some legacy BBMP guide sequence, not a current case-specific GBA trade-licence path, fee, inspection, or issuance result.

## Findings to ship as limitations

- **Service-scope contamination — material.** The file retains 22 BESCOM/e-Khata claims, six electricity-transfer scenarios, eight electricity-transfer edges, 11 roadblocks, and six journeys unrelated to trade licensing. These records have valid links but do not constitute trade-licence evidence and distort the service journey.
- **Atomicity is weak in the core trade claims.** `claim_trade_act_353` combines the prohibition, Schedule X scope, provisos, and an amendment exemption. `claim_trade_new_steps` combines fields, documents, OTP, term choice, and payment. `claim_trade_faq_docs_years` combines documents, optional occupancy material, formats, file size, term length, status, certificate, and receipt. `claim_trade_otls_flow` combines application creation, challan, payment modes, inspection, three review roles, approval, and issue. These should not be read as indivisible verified requirements.
- **Currentness is not established.** The ledger itself calls the OTLS flow “dated” and retains a GBA/legacy-BBMP transition roadblock, but source records contain no `publishedAt`. `accessedAt: 2026-08-28` proves retrieval only. The public guides therefore cannot establish current corporation/ward/MOH routing, category applicability, exemption, fees, inspection practice, timing, or licence issue.
- **No citizen evidence was retained.** `claim_ind32_trade_citizen_evidence_gap` properly states this as `Unknown`; it must not be converted into an inference that the published flow succeeds in practice. The roadblock for that gap is also appropriately `unknown`.
- **Citation identity is fragmented.** The new-registration guide, FAQ, OTLS description, and GBA page each recur under separate `source_trade_*` and `source_trade_w_*` IDs for the same URLs. Inherited `source_citizen_missing_draft` is unused by any claim. This does not break references, but it makes provenance harder to audit.

## Unknowns, contradictions, and edges

`claim_trade_unknown_case` and `claim_trade_w_unknown` rightly retain unknown applicability, authority/ward routing, fee, payment, inspection, approval, status, and licence outcome. The edge chain reports unobserved document/payment/review/issue outcomes as `unknown` and guide-backed entry/document relationships as `partial`. This complies with the edge-evidence rule; do not remove any cited edge merely because it is not an observed live case.

No service-specific contradictory claims are recorded. The inherited BESCOM NOC conflict is irrelevant to this service and should not be read as a trade-licence contradiction.

## Jurisdiction and status

Trade-specific claims use Bengaluru/Karnataka or Karnataka jurisdiction text, but the material does not resolve the current GBA-versus-legacy-BBMP operational authority for a supplied premises. The statutory source is a binding-law type and the public guides are B/partial, which is generally aligned with their limited wording. In particular, the ledger’s `unknown` case/outcome statuses are appropriately conservative. This report does not change the ledger.
