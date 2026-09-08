export type AuthoredBrief = {
  rules: string;
  unconfirmed: string;
  todo: string;
  questions: string[];
};

/**
 * These are deliberately exceptional, scenario-specific explanations. The general brief
 * remains assembled directly from the ledger so this layer cannot affect other routes.
 */
const authoredBriefs: Record<string, AuthoredBrief> = {
  scenario_consent_unavailable: {
    // claim_ind_exceptions_no_consent_ownership_evidence, claim_historic_alternative_evidence, claim_ind_exceptions_no_consent_occupancy_scope
    rules:
      "BESCOM's published Conditions of Supply say that when the previous consumer's consent is missing, ownership evidence can stand in for it: a registered sale deed, khata, partition deed, or a succession or heirship certificate. For a tenant, occupancy proof such as a lease deed is mentioned, but only for non-commercial lighting connections.",
    // claim_ind_exceptions_bescom_current_exception_unknown, claim_ind_exceptions_exception_acceptance_unknown, claim_ind_exceptions_no_consent_fresh_deposit, claim_ind_exceptions_bescom_login_boundary, claim_ind_exceptions_bescom_jvs_blank
    unconfirmed:
      'That document is older text. No current public BESCOM page says whether this route is still accepted, which documents are taken today, what deposit applies when consent is absent, or which office decides it. The online name-change form sits behind a customer login, so we could not see what it asks.',
    // claim_ind_exceptions_bescom_current_exception_unknown, claim_ind_exceptions_exception_acceptance_unknown, claim_ind_exceptions_no_consent_fresh_deposit, claim_ind_exceptions_bescom_login_boundary, claim_ind_exceptions_bescom_jvs_blank
    todo: 'Ask BESCOM in writing before you upload anything. Get the current position on those three points, keep the reply, then apply once.',
    questions: [
      // claim_ind_exceptions_bescom_current_exception_unknown, claim_ind_exceptions_exception_acceptance_unknown
      'Is the consent-alternative route in the Conditions of Supply still accepted for a name transfer today, and which documents are accepted now?',
      // claim_ind_exceptions_no_consent_fresh_deposit, claim_ind_exceptions_bescom_current_exception_unknown
      "What deposit or arrears treatment applies when the previous consumer's consent is unavailable?",
      // claim_ind_exceptions_bescom_current_exception_unknown, claim_ind_exceptions_bescom_login_boundary, claim_ind_exceptions_bescom_jvs_blank
      'Which office or channel decides this exception, and can it be submitted online, or must it be in person?',
    ],
  },
};

export function getAuthoredBrief(scenarioId: string): AuthoredBrief | undefined {
  return authoredBriefs[scenarioId];
}
