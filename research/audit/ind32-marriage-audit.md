# IND-32 marriage ledger audit

## Scope and result

Audited `ledger/marriage.json` against `ledger/schema.json` and `ledger/AGENT_PROTOCOL.md` only. The JSON validates against the supplied schema; IDs are unique, checked references resolve, non-`Unknown` claims have sources, and recorded access dates are ISO-shaped. This assesses the ledger’s stated evidence, not the live legal or portal position.

The marriage material supports a **partial legal-route map and a public Kaveri entry lead**. It does not support a current, case-specific Bengaluru registration procedure; that boundary is mostly retained correctly.

## Findings to ship as limitations

- **Service-scope contamination — material.** The ledger contains 22 BESCOM/e-Khata claims, six electricity-transfer scenarios, eight electricity-transfer edges, 11 roadblocks, and six journeys that have no marriage-registration connection. Their references resolve but they materially confuse scope and introduce irrelevant evidence into a marriage artifact.
- **Grade A is unsupported for two administrative claims.** `claim_marriage_department_mandate` and `claim_marriage_w_route` use an annual report (`official_guidance`) rather than a binding source, so their grade A is incompatible with the protocol. B (current official observation) or C (official but dated/indirect report) is the defensible range.
- **The compulsory-registration claim is only indirectly evidenced.** `claim_marriage_kar_compulsory` is grade A but its source notes that the India Code PDF did not load and describes only the official search result. With no accessible Act text recorded, the exact “compulsory” formulation is indirect/incomplete and should be C/partial rather than treated as a directly verified binding rule.
- **Several claims are compound rather than atomic.** `claim_marriage_sma_notice` combines notice, 30-day residence, entry/publication, and objections. `claim_marriage_sma_certificate` combines declaration, solemnization, certificate, and the separate Chapter III registration route. `claim_marriage_public_kaveri_boundary` combines the department’s digital-program statement with a portal-access conclusion. The broad unknown claims similarly combine SRO, fee, checklist, availability, timing, and outcome; they should remain limitations, not one inferred missing requirement.
- **Source dates provide retrieval, not currency.** All sources carry `accessedAt`, but none carries `publishedAt` (permitted by schema). The Annual Report is named 2023–24 in its title/notes, yet that vintage is not machine-readable. It cannot establish present Kaveri field availability, a particular SRO route, or downstream online/offline behaviour.
- **The contradiction treatment is not protocol-compliant.** `claim_ind32_marriage_citizen_online_success` and `claim_ind32_marriage_citizen_objection_reset` are linked as contradictions but both have `partial` status, whereas genuinely conflicting linked claims must be `contested`. They may describe different stages of the same user experience and are not logically inconsistent. Either way, neither anecdote establishes a universal Kaveri procedure.
- **Source hygiene is noisy.** Inherited `source_citizen_missing_draft` is unused. The report/law/portal workflow sources are duplicated under `source_marriage_*` and `source_marriage_w_*` IDs despite having the same URLs, fragmenting citation identity.

## Unknowns, contradictions, and edges

`claim_marriage_unknown_case`, `claim_marriage_w_unknown`, and `claim_ind32_marriage_citizen_current_sro_route_unknown` correctly preserve the key unverified facts: legal route for the couple, competent Bengaluru SRO/Marriage Officer, fee, document/original/witness checklist, appointment, timing, objection result, and certificate issuance. The one citizen account remains E/partial and is appropriately described as anecdotal.

Every marriage edge has existing claim references. Outcome edges are `unknown` and route/notice edges are `partial`; no edge is reported as a verified undocumented dependency. Preserve these edges and their uncertainty. The separate HMA, SMA solemnization, and SMA existing-marriage-registration scenarios are conceptually sound, but do not imply the live Kaveri flow was observed.

## Jurisdiction and status

Claims distinguish Bengaluru/Karnataka from India-wide statutes with Karnataka implementation language, which is necessary. The missing link is case-specific local jurisdiction, not an absence of stated geography. Public Kaveri access is explicitly only a landing-page observation; no login or application outcome was observed. This report does not change the ledger.
