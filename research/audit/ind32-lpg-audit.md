# IND-32 LPG ledger audit

## Scope and result

Audited `ledger/lpg.json` against `ledger/schema.json` and `ledger/AGENT_PROTOCOL.md` only. The JSON validates against the supplied schema; all IDs are unique, all checked cross-references resolve, all non-`Unknown` claims have a source, dates are ISO-shaped, and URLs are present. This is an evidence-quality audit, not a factual re-research.

The LPG-specific material is a useful **partial, Bharatgas-specific historical/public-route map**, not a verified current Bengaluru transfer journey. Its retained unknowns should ship.

## Findings to ship as limitations

- **Service-scope contamination — material.** The file carries 22 BESCOM/e-Khata claims, six electricity-transfer scenarios, eight electricity-transfer edges, 11 related roadblocks, and six electricity-transfer journeys. They are unrelated to an LPG ledger and obscure what the LPG evidence actually supports. Their source and reference links resolve, but they do not establish an LPG dependency.
- **Evidence grades are overstated.** `claim_lpg_transfer_types`, `claim_lpg_same_area`, `claim_lpg_same_town_vouchers`, `claim_lpg_kys_and_household`, `claim_lpg_address_notice`, and the four `claim_lpg_w_*` observations are grade **A**, although their linked sources are an official form or guidance, not a binding law/regulation/order. Under the protocol these are B when current direct official material, or C where the 2021 manual is treated as potentially dated. They should not be presented as grade-A requirements.
- **The 2021-manual limitation is not encoded in source dates.** `source_lpg_manual` and `source_lpg_w_manual` say “Official 2021 manual” in notes but omit `publishedAt`; its same-area and same-town route therefore has an access date (2026-08-28) but no machine-readable publication date. That makes current applicability especially uncertain.
- **Claims are often compound.** `claim_lpg_transfer_types` combines five distinct form types; `claim_lpg_kys_and_household` combines age/citizenship, distributor documents, equipment security, household-connection, and independent-kitchen conditions; both route-step claims combine several voucher/document actions. The multi-item unknown claims also bundle separate unresolved facts. This falls short of the protocol’s one-checkable-assertion rule and limits precise downstream citation.
- **Source-link hygiene is incomplete.** `source_lpg_services`, `source_lpg_w_services`, and inherited `source_citizen_missing_draft` are not cited by any claim. The service directory source is consequently not evidence for a route. `source_lpg_manual`/`source_lpg_w_manual` and `source_lpg_transfer_form`/`source_lpg_w_form` also duplicate the same URLs under separate IDs, which fragments provenance.
- **Citizen evidence is correctly limited but internally inconsistent in linking.** The 2016 Indane and 2011 Bharatgas accounts are appropriately E/partial and explicitly historical/carrier-specific. `claim_ind32_lpg_citizen_move_friction` one-way links to the reported Indane success claim as a contradiction, while the reciprocal link is absent and both remain `partial`; if treated as a conflict, the protocol requires cross-links and `contested` status. The experiences are not necessarily contradictory, so the safer shipped reading is simply channel variation.

## Unknowns, contradictions, and edges

`claim_lpg_unknown_case`, `claim_lpg_w_unknown`, and `claim_ind32_lpg_citizen_current_route_unknown` properly retain the decisive unknowns: OMC/distributor and service area for an address, accepted proof, fees/security, inter-town route, approval, timing, and delivery/result. Do not promote these to a working end-to-end journey.

All LPG edges cite existing claims. The case-dependent outcome edges are `unknown`, and documented route edges are `partial`; this satisfies the edge-evidence policy. No evidence-backed edge should be removed on the basis of this audit. The issue is scope and precision, not a missing reference.

## Jurisdiction and status

LPG claims use Bengaluru/Karnataka or Karnataka jurisdiction text. The official material is Bharatgas-specific, while one citizen account is Indane-specific; no record establishes that either route is the current route for a supplied Bengaluru connection. Statuses for the LPG unknown/outcome nodes and roadblocks are conservatively `unknown`/`partial`, which is appropriate. This report does not change the ledger.
