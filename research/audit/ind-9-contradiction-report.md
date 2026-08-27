# IND-9 audit — BESCOM name-transfer ledger

Audited on 2026-08-27 against `ledger/schema.json` v1.0.0 and the committed IND-4, IND-6, IND-7, and IND-8 handoffs. The canonical result is `ledger/research.json`. It retains only public-source evidence and does not claim access to authenticated workflows, backend mapping, or private APIs.

## Contract reconciliation

IND-9's older description has six roadblock labels, but the accepted v1 contract permits exactly `documentation`, `process`, and `infrastructure`. The ledger does not widen that enum.

| Older label | Canonical v1 handling |
| --- | --- |
| documentation | `documentation` |
| process | `process` |
| integration | `infrastructure` (cross-system EPID-to-account mapping) |
| implementation | `infrastructure` (login, upload, and unseen-application system behaviour) |
| policy | `documentation` when the public/current rule is unclear; `partial` status preserves the applicability gap |
| unknown | Closest observable failure layer plus `unknown` status and notes; no cause is invented |

No supplied roadblock required a fourth category. The representation limit is explicit: a v1 category describes the user-visible layer, not a proven root cause.

## Duplicate and provenance reconciliation

The handoffs remain unmodified. The canonical ledger consolidates identical public observations while recording their originating source IDs in source notes:

- KERC consolidated Conditions: IND-4 `source_kerc_conditions_supply` and IND-8 `source_kerc_cos_consolidated` → `source_kerc_conditions_supply`.
- BESCOM home, FAQ, and tracker observations: IND-4, IND-6, and IND-8 variants → `source_bescom_home`, `source_bescom_faq`, and `source_bescom_tracker`.
- e-Aasthi login, search, and EPID-status observations: IND-6 and IND-8 variants → `source_eaasthi_login`, `source_eaasthi_search`, and `source_eaasthi_status`.
- Equivalent current-official claims were collapsed into atomic canonical claims such as `claim_standard_authenticated_route`; the original handoff claims stay available as provenance. Citizen accounts were not upgraded, merged into official claims, or used to fill authenticated gaps.

## Actual contradiction

### Consent/NOC requirement differs across citizen accounts

- **Side A:** `claim_citizen_old_noc` (IND-7 `claim_citizen_older_noc_route_reported`, source `source_citizen_bescom_noc_offline`) is an older offline-process account reporting a previous-owner or builder NOC requirement.
- **Side B:** `claim_citizen_no_builder_noc` (IND-7 `claim_citizen_updated_e_khata_route_no_builder_noc_reported`, source `source_citizen_bescom_login_payment`) is a 2026 account reporting online completion after e-Khata update without a builder NOC.

Both claims are Grade E, `contested`, and symmetrically cross-linked. Impacted scenarios are **clean sale** and **consent unavailable**. Recovery burden is material: a person cannot safely decide whether to chase consent/NOC, proceed with e-Khata, or prepare another evidence branch from desk research alone; the ledger directs them to obtain an authorized current answer rather than treating either report as policy.

The apparent 24-hour wording, legacy route taxonomy, and historic seven-day legal consequence were reviewed but are **not** recorded as contradictions: they describe different routes, timing anchors, or legal effects. Their applicability limits are preserved as `partial`.

## High-impact unknowns to follow up

These are phrased as questions, not severity scores or a formal rubric.

1. What exact current rules validate an EPID against a BESCOM Account ID, and which agency owns repair when the match fails?
2. What public-safe error classes, escalation channel, and expected resolution path exist for EPID-to-account mapping failures?
3. Which documents, identity checks, payments, agreements, and decision states are required after authentication for the EPID route and the standard name-change route?
4. Are Clause 36.01 alternatives, arrears, indemnity, deposit treatment, fees, and tenant non-commercial scope currently operative for BESCOM name transfer?
5. Under what current conditions, if any, is prior-owner or builder NOC/consent required after e-Khata update?
6. What confirms approval downstream (account view or bill), and when should a pending request be escalated?

## Evidence handling decisions

- Current public-interface observations remain Grade **B**.
- Citizen reports remain Grade **E** (and would remain **F** if uncorroborated assertions were retained); they identify failure modes only.
- Historic Conditions text remains Grade **A** and `partial`, because present applicability has not been established.
- Authenticated and backend behaviour remains **Unknown**. No field-level workflow, live form, account, or private API was accessed.
