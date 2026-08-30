# Independent BESCOM exception audit

## Verdict

**Needs targeted correction before the exception journeys are treated as source-supported.** The new Conditions-PDF claims are generally atomic, dated, linked, and appropriately cautious at Grade C/`partial`; direct public-interface observations are generally Grade B/`verified`; and the explicit Unknown claims properly have no sources. Reference-integrity checks found no dangling scenario, node, claim, source, roadblock, or journey references. The recorded NOC contradiction is reciprocal and contested. Exception nodes carry no `researchedNoSourceFound` markers, so there is no unsupported marker to remove.

## Findings

1. **P1 — Login-boundary claim overstates its source.** `claim_ind_exceptions_bescom_login_boundary` is Grade B/`observation`, but its source observation establishes only that the login page displays User ID, password, and CAPTCHA. It does not establish that account-specific name-transfer fields “can be reached” only after that login. The same unsupported causal step appears in `roadblock_ind_exceptions_authentication`'s likely cause. Limit the claim to the visible login controls and the fact that no authenticated fields were inspected, or make the latter an `inference`/`partial` statement.

2. **P1 — Verified transfer-to-tracker edge is applied to unverified exception scenarios.** `edge_transfer_to_tracking` is `verified` and is tagged tenant, deceased-consumer, and consent-unavailable scenarios, although the ledger separately says current exception acceptance and any case outcome are Unknown. The standard workflow and public tracker support a conditional standard-route statement, not proof that an exception submission reaches a request ID. Mark the edge `partial` for those scenarios and state the condition explicitly, or remove the exception scenario tags.

3. **P2 — The 1912 recovery lacks a supporting claim.** `recovery_ind_exceptions_1912_lead` says the public BESCOM pages display Call 1912 but cites only `claim_ind_exceptions_bescom_current_exception_unknown`, which has no source and does not assert that fact. Link a separate source-backed, appropriately scoped claim for the visible help channel (without asserting exception applicability), then retain the recovery as `partial`.

4. **P2 — One citizen claim's Bengaluru jurisdiction is not supported by its ledger source metadata.** `claim_indexceptions_bescom_tenant_owner_cooperation_block_reported` says `Bengaluru, Karnataka, India`, while `source_indexceptions_bescom_tenant_owner_cooperation_report` identifies only a LegalAdviceIndia post and its notes do not record a Bengaluru location. Amend the jurisdiction to what the retained source establishes, or document the location in the source notes before retaining the Bengaluru tag.

5. **P2 — A reused exception dependency claim is compound.** `claim_historic_transfer_obligations` combines no-arrears, indemnity, fresh-agreement, deposit, and LT/HT charge assertions. Its own “atomicity exception” conflicts with the protocol's one-checkable-thing rule. Split it into atomic historic claims and update the exception edges/journeys to cite only the relevant conditions.

## No finding

The 2026-08-31 exception sources have access dates; their wording correctly discloses the older Conditions PDF and avoids presenting it as a current checklist. The new source-linked Conditions claims do not overstate current acceptance, and the tenant/previous-contact citizen accounts are framed as individual reports rather than rules.
