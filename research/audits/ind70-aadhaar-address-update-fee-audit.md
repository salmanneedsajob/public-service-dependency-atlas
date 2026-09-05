# IND-70 Aadhaar address update fee audit

Audit date: 2026-09-06  
Scope: the `cost` expectation cell and the two fee-addendum sources plus seven named fee claims. No other expectation cell or ledger record was audited.

## Verdict

The `cost` expectation is correctly `stated` under protocol section 8. Both cited claims are verified Grade B observations from current official UIDAI public surfaces and give the actionable amount of ₹75 for the public Address update route. The expectation note keeps the primary online own-proof-of-address route distinct from the Head-of-Family method, Aadhaar-centre demographic-update pricing, and the separately named Document update service.

One correction is required before this scoped audit is clean: `claim_ind70_fee_display` uses `India; nationally administered service, including Bengaluru residents` as its jurisdiction. Protocol section 7 requires Bengaluru/Karnataka-specific jurisdiction text. The claim should use the ledger's standard `Bengaluru, Karnataka, India (UIDAI national service)` wording. This is a metadata correction only; it does not change the fee amount, evidence grade, basis, status, or expectation state.

## Checks

- Source linkage: pass. Every audited non-Unknown claim points to an in-ledger source that supports its wording. `claim_ind70_fee_display` is supported by the observed public Update Address route and the current My Aadhaar page; the six addendum claims each point to the appropriate audited UIDAI source.
- Dates: pass for the scoped source records. Both access dates are ISO-formatted as 2026-09-06. `source_ind70_fee_addendum_uidai_my_aadhaar_20260906` records the visible last-updated date and its publication date separately. `source_ind70_fee_addendum_uidai_charge_sheet_20260906` does not invent a publication date and documents both the PDF's lack of a printed date and the current UIDAI page's upload label.
- Agency naming and jurisdiction: source records pass. Both name Unique Identification Authority of India and state the Bengaluru, Karnataka applicability of the national service. One claim-level jurisdiction correction is required as described above.
- Archive notes: pass. The My Aadhaar source records the dated timeout, lack of response bytes, lack of snapshot, and lack of substitution. The charge-sheet source supplies a Wayback snapshot URL and retains the original UIDAI URL.
- Grade and basis: pass. Grade B and `observation` are appropriate for current official UIDAI guidance/public-interface statements directly displaying the fee schedule.
- Atomicity: pass. Each audited claim states one checkable proposition. The two ₹75 claims are corroborative rather than improperly compound: one records the route display and the other records the current My Aadhaar page.
- Scenario separation: pass. The primary fee claims concern Address update and are tagged to `scenario_aadhaar_address_update_online_poa`. The source limitation transparently states that the My Aadhaar fee card does not break the amount down between own-document and Head-of-Family methods; the existing public-route observation supplies the primary-route context. The centre claims are explicitly labelled comparison-only, and the Document update claims expressly identify a distinct service whose temporary online waiver must not be applied to an address-change request. None of those comparison claims is cited as positive support in the cost cell.
- Cost expectation: pass. `stated` is justified because the cell cites verified Grade B claims with an actionable ₹75 amount. Its note correctly says that a conditional free demographic component at a centre and the separate Document update waiver do not turn the primary online address-change fee into zero.

## Counts and IDs

- Sources audited: 2 — `source_ind70_fee_addendum_uidai_my_aadhaar_20260906`, `source_ind70_fee_addendum_uidai_charge_sheet_20260906`.
- Claims audited: 7 — `claim_ind70_fee_display`, `claim_ind70_fee_addendum_online_address_75`, `claim_ind70_fee_addendum_centre_address_is_demographic`, `claim_ind70_fee_addendum_centre_demographic_separate_75`, `claim_ind70_fee_addendum_centre_demographic_combined_free`, `claim_ind70_fee_addendum_document_update_distinct`, `claim_ind70_fee_addendum_document_update_online_free_until_20270614`.
- Expectation cells audited: 1 — `cost`.
- Corrections proposed: 1, affecting `claim_ind70_fee_display` at `/jurisdiction`.
- Corrections applied: 0; application is outside this isolated audit.
- Unapplied corrections: 1, affecting `claim_ind70_fee_display`.

