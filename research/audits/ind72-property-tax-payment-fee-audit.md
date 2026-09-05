# IND-72 property-tax payment fee audit

Audit date: 2026-09-06  
Scope: the `cost` expectation cell and the three specified fee records only. No external evidence was consulted.

## Verdict

Two corrections are required. Both fee claims must be downgraded from evidence Grade B to Grade C because their sole official source is explicitly undated. The source note records retrieval and the missing visible publication/revision date, but protocol section 4 assigns archived, undated, or visibly outdated official material Grade C.

The `cost` expectation remains correctly `stated`. Under protocol sections 3 and 8, an explicit zero is an actionable cost value, and a verified Grade C claim may support `stated`. The cell cites only the zero City Corporation-added service-fee claim. Its note correctly separates statutory property tax from the fee question and warns that the transaction must not be described as wholly fee-free because possible bank/payment-gateway charges have no reviewed amount or actionable schedule.

## Record checks

| Record | Result |
| --- | --- |
| `source_ind72_refund_cancellation_pdf_fee_addendum` | Pass. It has a specific official PDF URL, ISO access date `2026-09-06`, Bengaluru/Karnataka jurisdiction, and the displayed agency name `Bengaluru City Corporations`. Its notes disclose that the PDF has no visible publication or revision date and limit currentness to retrieval. They also record the exact Wayback attempt, timeout, absence of a confirmed snapshot, and retention of the original URL. |
| `claim_ind72_city_corporation_zero_additional_service_fee` | Pass except grade. Its source, primary scenario, and node references resolve. The observation basis and verified status are consistent with the represented official-policy statement. It is atomic: it states one scoped zero fee. Its notes expressly exclude statutory property tax from the fee question and do not extend the zero to bank or gateway charges. Grade must change from B to C because the source is undated. |
| `claim_ind72_bank_gateway_charges_if_any_nonrefundable` | Pass except grade. Its source, primary scenario, and node references resolve. The observation basis and verified status are consistent with the represented official-policy statement. It is atomic: it addresses refundability only. Its notes preserve the unknown applicability and amount of any bank/payment-gateway charge and correctly state that this claim does not independently support a `stated` cost. Grade must change from B to C because the source is undated. |
| `cost` expectation cell | Pass unchanged. State `stated`, supporting claim linkage, empty searched-routes list, and note comply with sections 3, 8, and 9. The cell does not treat statutory property tax as a service fee and does not broaden the City Corporation's explicit zero to unknown third-party charges. |

## Counts and IDs

- Records audited: 4 — one source, two claims, and one expectation cell.
- Corrections proposed: 2.
- Correction IDs: `claim_ind72_city_corporation_zero_additional_service_fee` at `/evidenceGrade`; `claim_ind72_bank_gateway_charges_if_any_nonrefundable` at `/evidenceGrade`.
- Corrections applied: 0; this isolated audit does not edit ledger records or sidecars.
- Unapplied corrections: 2, represented in `ind72-property-tax-payment-fee-corrections.json`.
- Other findings requiring correction: 0.
