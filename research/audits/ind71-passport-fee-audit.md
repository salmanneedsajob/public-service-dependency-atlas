# IND-71 passport fee audit

## Scope

Fresh isolated audit of the `cost` expectation cell and only these five touched records:

- `source_ind71_passport_fee_structure_20260906`
- `source_ind71_passport_fee_revision_notification_20260906`
- `claim_ind71_passport_fresh_adult_normal_fee_20260906`
- `claim_ind71_passport_fee_revision_effective_20260701`
- `claim_passport_normal_36_page_fee`

No external browsing or additional evidence was used.

## Verdict

Pass. No structured corrections are required.

The `cost` cell is correctly `stated` under protocol section 8. `claim_ind71_passport_fresh_adult_normal_fee_20260906` gives the citizen an actionable amount—Rs.2,500 for a fresh 36-page passport with ten-year validity—and is `verified` with Grade C official evidence. `claim_ind71_passport_fee_revision_effective_20260701` separately supplies the 1 July 2026 effective date. The cell note states both the amount and the indirect-observation limitation.

## Checks

- Source linkage: pass. Each non-Unknown claim cites one in-scope official source, and each cited source exists.
- Dates: pass. Both sources have ISO access dates. The fee-structure source records that no visible publication or update date was available; the revision source records `publishedAt` as 2026-06-25 and the claim states the separate 2026-07-01 effective date.
- Agency naming and jurisdiction: pass. Both source notes identify the displayed agency as the Ministry of External Affairs, Government of India, and state applicability to Bengaluru, Karnataka, India. Claim jurisdiction and the manifest primary scenario align.
- Archive notes: pass. Both sources record the 2026-09-06 Wayback attempt, its failure, the reason, and that no substitute or snapshot URL is asserted.
- Evidence grade: pass. Grade C is appropriate because both claims rely on official but indirectly observed material; the fee page rendered a maintenance shell and the notification host could not be retrieved directly.
- Basis: pass. `observation` is appropriately limited to what the public indexes displayed; the claim texts and notes do not assert a completed payment or live fee calculation.
- Atomicity: pass. The current-fee claim states one category-specific amount, and the revision claim states one effective-date fact. The older fee claim likewise states one category-specific amount.
- Reciprocal contradiction: pass. `claim_ind71_passport_fresh_adult_normal_fee_20260906` and `claim_passport_normal_36_page_fee` cite each other in `contradictsClaimIds`. The older Rs.1,500 claim is `contested` and explicitly notes that its undated booklet may be outdated. The effective-date claim does not itself state an amount and therefore needs no contradiction link.
- Expectation support: pass. The cell cites the current amount claim and effective-date claim, uses `state: stated`, and contains an actionable-value note plus the Grade C limitation. Empty `searchedRoutes` is appropriate for a stated cell.

## Counts and IDs

- Sources audited: 2 — `source_ind71_passport_fee_structure_20260906`, `source_ind71_passport_fee_revision_notification_20260906`
- Claims audited: 3 — `claim_ind71_passport_fresh_adult_normal_fee_20260906`, `claim_ind71_passport_fee_revision_effective_20260701`, `claim_passport_normal_36_page_fee`
- Expectation cells audited: 1 — `cost`
- Corrections proposed: 0
- Correction IDs: none

