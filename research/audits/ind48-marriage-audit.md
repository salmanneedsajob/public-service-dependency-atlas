# IND-48 marriage ledger audit

## Scope

Audited only `ledger/marriage.json` against the supplied `ledger/schema.json` and `ledger/AGENT_PROTOCOL.md`. No live site, handoff, git history, or other project material was inspected. This is therefore a ledger-integrity audit, not a re-verification of government services or URLs.

## Result

The IND-48 additions contain useful current primary-law and public-interface observations, but the ledger is not ready to present as a single coherent marriage journey. It currently mixes a legacy route graph with an IND-48 graph, duplicates sources and claims, and lets route-unknown citizen evidence appear as HMA evidence. The documented public record supports statutory route information and observed interface guidance; it does **not** support a case-specific Bengaluru application outcome, SRO allocation, or universal checklist.

## Required corrections before presentation

### 1. Source support and currentness

- Change `claim_marriage_department_mandate`, `claim_marriage_w_route`, and `claim_ind48_department_routes_kaveri` from Grade **A** to **C** and from `verified` to `partial`. Their cited annual report is official but indirect and from 2023–24; it is not a binding law, regulation, order, or gazette as Grade A requires. `claim_marriage_ind48_department_routes` already uses the appropriate C/partial treatment.
- Retire or rebind the five general India Code sources (`source_marriage_kar_act`, `source_marriage_hma`, `source_marriage_sma`, `source_marriage_w_hma`, `source_marriage_w_sma`). They all cite only `https://www.indiacode.nic.in/indiacode/` and explicitly say they are not claim-specific. Where the matching IND-48 direct Act PDF exists, point the legacy claims/checks to that exact source and URL instead. Where there is no direct text, retain C/partial rather than treating the search entry as current statutory proof.
- Consolidate exact-URL duplicates while preserving the published record ID selected as canonical: the annual report appears four times; the HMA PDF twice; the Kaveri landing URL three times; the 2025 Reddit discussion twice. Do not use duplicate source records to imply independent corroboration.
- Treat the Kaveri FAQ/dashboard fragment URLs as locators for separate read-only observations of the **same landing page**, not as separate server routes. Their titles/notes should say which expanded panel or dashboard state was observed, with the observation context needed to reconcile the later blank-render observation.
- `source_marriage_ind48_kaveri` records a blank page, while `source_ind48_kaveri_dashboard` and the FAQ records assert rich content on the same landing page and date. Keep both observations, but add their observation context (session/device/time if recorded) and link the claims as an unresolved render-state discrepancy. Do not phrase either as the unconditional current state of the public page.

### 2. Claim atomicity and citation-gate scope

- Split `claim_ind48_kaveri_hma_route_identity` into post-marriage route, offline Aadhaar rule, online Aadhaar rule, and no-initial-SRO-visit guidance. Each has different scope and should not carry the untested implication that later attendance is impossible.
- Split `claim_ind48_kaveri_sma_intended_route` into pre-marriage service, FAQ’s current-address rule, signed-notice personal-appearance guidance, and offline-Aadhaar rule. Keep the FAQ’s “current address” wording distinct from the Act’s district-residence rule; the two sources do not establish that they are identical tests.
- Split `claim_ind48_kaveri_sma_other_forms_route` into online identity/eKYC, offline personal appearance, online certificate download after approval, and offline issue after verification. The claim presently converts several route-specific FAQ answers into one broad procedure.
- Split `claim_ind48_kaveri_documents_witnesses_photos` at least into witness number/age, age proof, address proof, identity proof, ceremony evidence, and photo format/size. Tag each to only the route/category the FAQ answer actually addresses. In particular, the notes acknowledge different joint-photo and intended-notice-photo rules, so a combined HMA+SMA claim is too broad.
- Split `claim_ind48_kaveri_operations` into payment trigger, accepted payment channels/manual-payment exclusion, rescheduling interval, and edit-after-return rule. No part of this source proves a real payment, booking, or correction outcome.
- Split the multi-section statutory claims, especially `claim_ind48_sma_objection_solemnization_certificate` and `claim_ind48_sma_other_forms_registration`, into one checkable proposition per statutory step. The present bundled claims cover inquiry, appeal, declaration, witnesses, solemnization, certificate, lapse/new notice, eligibility, notice, objections, and registration in one citation gate.
- Do not reuse source support across a stronger claim than the source supplies. The annual report supports departmental context, not a current Kaveri flow; the Acts support statutory conditions/forms, not current Karnataka portal fields, fees, SRO allocation, or operational SLAs; citizen sources support only the reporter’s stated experience.

### 3. Scenarios, journeys, nodes, and links

- Add a separate scenario and path for **SMA registration of a marriage celebrated in another form**. It is a separate statutory branch in sections 15–16 and in `claim_ind48_kaveri_sma_other_forms_route`, but `scenario_marriage_w_sma` currently describes only notice/solemnization and its path omits that branch.
- Do not tag `claim_ind48_marriage_reported_digital_certificate`, `claim_ind48_marriage_reported_repeated_objections`, `claim_ind48_marriage_reported_rejection_then_certificate`, `claim_ind48_marriage_reported_witness_save_error`, or `claim_ind48_marriage_reported_pending_non_sma` as `scenario_marriage_w_hma`. The sources do not establish HMA; the last expressly establishes only non-SMA. Create an explicitly unclassified Kaveri-report scenario (or otherwise label the reports route-unknown) and keep it separate from the statutory HMA journey.
- Split `journey_marriage_w_public`: it is assigned to the HMA scenario but its statutory step includes the SMA claim. Supply one HMA journey and at least one SMA intended-marriage journey; a distinct SMA-other-forms journey is needed if that branch remains in the ledger. No journey should imply that a conceptual portal lead is a completed sequence.
- Consolidate the two parallel graphs (`node_marriage_*` and `node_marriage_w_*`) and their duplicate route/edge/roadblock records. The scenarios use the `_w_` graph, while the legacy graph remains in the ledger with overlapping evidence. Preserve IDs according to the protocol, but make one graph canonical in rendering and update/relink records instead of presenting two procedures.
- Replace generic India Code detail links in legacy checks (for example `check_marriage_hma`, `check_marriage_sma_notice`, and related failure details) with the direct Act-PDF links already recorded by IND-48. The existing generic links do not take a reader to the quoted section.
- `roadblock_audit_marriage` must be removed from the journey ledger. Its 900-character `symptom` embeds a prior audit narrative about BESCOM/e-Khata material, has no supporting claims, and is not a marriage user-visible roadblock. Audit findings belong in this audit artifact, not a roadblock record.

### 4. Grades and statuses

- A claim status should describe whether the **wording of that claim** is supported, not whether a user’s end-to-end application was tested. After splitting, direct FAQ transcriptions and direct dashboard observations can be `verified` at Grade B, while their applicability to an individual case remains `unknown` in a separate claim/node. Keep the blank-render observation `partial` unless its rendering context is sufficiently recorded to make it reproducible.
- Reconcile check/detail status with the linked claim. Several legacy checks are `verified` while relying on C/partial general-site claims (for example `check_marriage_w_hma` and `check_marriage_w_sma_notice`). Their check status should be `partial` until re-cited to the direct statute.
- `node_marriage_w_sma_solemn` and `node_marriage_w_outcome` should not be blanket `unknown` if they retain verified statutory checks; use `partial` for the documented legal framework and keep the live case outcome Unknown in its own claim. Conversely, no verified node/edge may imply a verified Kaveri submission, payment, review, or certificate outcome.

### 5. Contradictions and citizen evidence

- Remove the mutual contradiction links between `claim_ind32_marriage_citizen_online_success` and `claim_ind32_marriage_citizen_objection_reset`. A successful certificate report and a report of a verification reset are not mutually exclusive.
- Remove the contradiction links and `contested` statuses among `claim_ind48_marriage_reported_digital_certificate`, `claim_ind48_marriage_reported_repeated_objections`, and `claim_ind48_marriage_reported_pending_non_sma`. They are separate anecdotes (and the first two may describe stages within the same source), not conflicting propositions. Use Grade E/partial with their existing one-case limitations.
- Preserve the Sakala/PSGA timing discrepancy as an **apparent scope conflict** only. `claim_ind48_kaveri_faq_sakala_one_day` and `claim_ind48_kaveri_dashboard_public_controls` may describe different services or SLA labels. Keep both observations, add the precise selected service/category if known, and do not promise either one- or three-day processing for a particular case. Mark the comparison contested only if it is confirmed that both labels apply to the same service state.

### 6. `researchedNoSourceFound` markers

All current markers should be removed. The protocol permits a marker only for a field that is empty **and** has an actual recorded public-route search for that field.

- `node_marriage_w_route`, `node_marriage_w_hma`, `node_marriage_w_sma_notice`, `node_marriage_w_sma_solemn`, and `node_marriage_w_kaveri` mark fields that are not empty, which directly violates the marker definition.
- `node_marriage_w_outcome` marks `checks` even though that field is non-empty. Its empty `failureSignals` and `recoveries` lack a field-specific public-route search record; a blank landing page/login boundary is not enough under the protocol.

Leave genuinely empty, unmarked fields visibly “not yet researched.” Add a marker only after recording the searched relevant public route and its lack of an answer.

## Limitations to ship if no correction is made

- The ledger establishes legal frameworks and selected public-interface text as of the recorded observations, not the current result for a particular couple.
- A couple’s legal route, ceremony status, residence/jurisdiction, current Marriage Officer/SRO, form fields, originals, appointment, payment, objection handling, review, and certificate outcome remain case-specific or Unknown.
- Kaveri rendering/content observations on the same landing page are not yet reconciled; neither blank rendering nor FAQ/dashboard content proves universal availability.
- Citizen reports are useful failure signals only. They do not establish the applicable route, required documents, processing time, service standard, or a recovery that will work in another case.
