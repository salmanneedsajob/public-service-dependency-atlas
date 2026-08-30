# IND-44 — new electricity audit

Scope: ledger-only review of `new-electricity.json` against the supplied schema and protocol. This does not re-open sources or determine the underlying law or portal behaviour.

## Findings requiring correction or explicit disclosure

1. **Normal-route evidence is tagged as the JVS scenario.** `claim_ind44_electricity_normal_form_fields`, `claim_ind44_electricity_document_upload_boundary`, `claim_ind44_normal_form_controls`, `claim_ind44_normal_faq_route`, and `claim_ind44_normal_payment_boundary` all describe the normal route/form but carry only `scenario_ind32_electricity_jvs`. This misstates provenance and leaves the normal scenario without the evidence that purportedly supports it. The broad KERC timing, acknowledgement, escalation, and charge claims are likewise presented only as JVS evidence even where their wording is not JVS-specific.

2. **Three IND-44 roadblocks name an agency that does not exist.** `roadblock_ind44_route_case_unknown`, `roadblock_ind44_form_submission_boundary`, and `roadblock_ind44_published_payment_failure` reference `agency_bescom_ind44_new_electricity`; the ledger defines only `agency_bescom_ind32_new_electricity`. Their owner attribution is therefore unresolved.

3. **The declared document conflict is not marked contested.** `claim_ind44_electricity_document_upload_boundary` and `claim_ind44_kerc_two_documents_150kw` mutually list one another in `contradictsClaimIds`, yet both are `partial`, as is `roadblock_ind44_electricity_document_conflict`. The protocol requires conflicting claims to remain `contested` until audited. The report must not imply that the portal categories have been reconciled with the regulation.

4. **A “researched no source found” marker is invalid.** `node_electricity_documents.researchedNoSourceFound` contains `recoveries`, but that field is non-empty (`recovery_ind44_jvs_document_guidance`) and has linked claims. The protocol reserves this marker for an *empty* field after an actual public-route search. Neither condition is recorded here.

5. **The demand-to-tracking edge asserts an unsupported order.** `edge_electricity_demand_tracking` says payment and field processing precede request tracking/supply, but its linked claims establish only conditional timing and blank tracker controls. Conversely, `claim_ind44_kerc_application_ack` says online submission generates a registration number, which is a plausible tracker input before payment/field work; it is not linked to the edge. Keep the sequence Unknown rather than presenting this `requires` relation as a supported dependency.

6. **Several “verified” records are compound rather than atomic.** The route/default-route claim, normal-form claims, and the JVS detail, miscellaneous, and document-control inventories bundle many independently checkable controls into single claims. `claim_ind44_kerc_default_escalation` similarly bundles compensation, call-centre, complaints, escalation, tracking, notifications, and auto-escalation. Their single grades/statuses cannot accurately attach to every component; split or downgrade/disclose the aggregation.

7. **The timing claim over-grades a general-site reference.** `claim_ind44_public_timing_text` combines the home-page 24-hour and EODB 7/15-day labels with the FAQ wording but is Grade B. Its home-page source notes explicitly call that source general, not claim-specific, and say wording dependent on it should be Grade C or Unknown. Separate the FAQ observation from each home-page timing label and grade the latter consistently.

8. **The payment-failure contact is not actionable as written.** `claim_ind44_payment_error_recovery` gives Bill Desk as `@billdesk.com`, which is not a complete email address, while no complete address is preserved in the linked source metadata. Retain only the usable telephone/1912 route or disclose that the email transcription is incomplete.

9. **Journey coverage remains materially narrower than the IND-44 evidence.** The only journey is the older JVS public-boundary journey and uses no IND-44 claims. There is no journey that carries the newly asserted normal route, network-extension clock, document conflict, acknowledgement/tracker relationship, or published escalation path. The ledger should explicitly state that those are detached evidence fragments, not a verified end-to-end normal or network journey.

No additional `researchedNoSourceFound` markers were present. Claim-source IDs and the IND-44 edge/roadblock claim IDs otherwise resolve; this does not cure the semantic linkage and attribution defects above.
