# Public Service Legibility Benchmark v0.1

## 1. Purpose and the one-sentence question

The Public Service Legibility Benchmark measures whether public documentation lets a citizen know what to expect before a case begins. The question is: **for one clearly scoped public-service route, how many of six practical expectations are stated in public evidence?** The citizen is the subject; an agent is only the measuring device.

## 2. What is measured

Each service has one primary scenario and six cells: cost, documents, eligibility, time, owner, and after-submission. Each cell is `stated`, `mentioned`, or `absent`. An explicit zero is stated when the applicable evidence says it.

`stated` means a Grade A, B, or C claim gives a value a citizen can act on. `mentioned` means the topic is named but no actionable value is given. `absent` means the reviewed evidence does not touch the topic. Only `verified` or `partial` claims may support `stated` or `mentioned`; a boundary statement or `Unknown` claim records a limitation, not a positive cell value.

- `cost`: `stated` when the evidence gives an amount a citizen pays or an actionable fee schedule. A fee described only as prescribed, a payment step without an amount, or a penalty payable by the agency is `mentioned`.
- `documents`: `stated` when the evidence gives an actionable document list or names a concrete document with a requirement to submit, provide, upload, produce, or attach it. A reference to documents without telling the citizen what is required is `mentioned`.
- `eligibility`: `stated` when the evidence gives a rule that decides who qualifies or which route applies. Naming eligibility, applicability, jurisdiction, or an applicant category without a usable rule is `mentioned`.
- `time`: `stated` when the evidence gives an actionable duration, deadline, processing period, or service-level target. A reference to timing, delay, sequence, or processing without a figure or usable time rule is `mentioned`; when the figure covers only one stage, the cell note must say so.
- `owner`: `stated` when the evidence lets a citizen identify the office, officer, or operational role that holds or decides the case, including a specific office list, a designation tied to a jurisdiction rule, or a contact route for that role. A statutory designation or general agency name alone is `mentioned`.
- `after-submission`: `stated` only when the evidence identifies something the citizen sees after submitting, such as a status page, tracker, acknowledgement, receipt, rejection reason, or downloadable result. A step at or before submission—including registration, document presentation, payment, appointment booking, or the act of submission—is not after-submission evidence. An outcome named without a visible or actionable post-submission surface is `mentioned`.

## 3. What is excluded and why

Personal case data behind login is private by right, not a documentation failure. Strip an Unknown claim only when its text or linked required state names login, sign-in, OTP, authentication, credentials, password, CAPTCHA, or user ID; also strip it when every linked source names one of those terms. Apply the same explicit-term rule to roadblocks. Do not infer an authentication boundary from a generic account synonym.

## 4. Scoping

Write one primary scenario before research: trigger, applicant type, route class, jurisdiction, and exclusions. For comparable jurisdictions, keep the same trigger, applicant type, and route class; only the jurisdiction and its public institutions change. Predeclare branch IDs for stable identifiers, record them only when encountered, and evaluate completion on the primary scenario alone.

## 5. Evidence

Grade A is binding law, regulation, commission order, or gazette notification. Grade B is a current official procedure, form, service portal, circular, agency page, or direct current observation of a public official interface. Grade C is official but indirect, incomplete, archived, undated, or potentially outdated material; press releases, annual reports, and general-site references are C, and a general-site reference is never a specific citation. Grade D is reputable secondary reporting; E is genuine public first-person evidence; F is an uncorroborated lead; Unknown has no usable source.

Keep basis separate from grade: observation records what a source shows, inference records a conclusion, and mixed explains the boundary. One claim asserts one checkable thing. Every non-Unknown claim has a dated, jurisdiction-specific, direct source link. Capture an archive snapshot for every public source; document failure and its limitation, never substitute a homepage.

## 6. Method

Grid-only mode uses one official-source pass, a light audit of the six cells, and a scorecard; it is the scaling and cross-jurisdiction unit. Deep-ledger mode uses official-source, public-workflow, citizen-evidence, integration, and a separate fresh audit, with nodes, edges, roadblocks, journeys, and portal records; use it for pilot sites and disputed services.

The auditor receives only the integrated ledger, expectations sidecar, portal sidecar, manifest entry, ledger schema, protocol, and corrections contract. It does not receive handoffs or researcher reasoning. It returns markdown findings and corrections JSON; each correction gives record type, record ID, exact JSON Pointer, old value, new value, reason, and source or audit support. Apply corrections atomically; unapplied corrections become stated limitations.

## 7. Portal friction signals

When a portal sidecar exists, record route-level checked and dead-link counts, visible date or version, CAPTCHA dependencies, JavaScript dependencies, app-only dependencies, and languages. The scorecard reports dead-link rate, whether any portal is undated, CAPTCHA, JS-only, or app-only, and the observed languages. A missing portal sidecar yields null friction flags rather than an inferred clean route.

## 8. Preregistration

Freeze predictions, scope, comparison groups, cell rule, and date before results are reviewed. State what would count as held, failed, mixed, or not tested. Amendments are dated, appended, and never rewrite the original freeze.

## 9. Reporting

Publish one scorecard per service and jurisdiction: identifier, jurisdiction, primary scenario, as-of date, six cell states and claim counts, stated count, login-stripped Unknown share, portal friction, audit file, benchmark version, and source. A jurisdiction table compares stated cells out of six while retaining the scorecard links and limitations.

## 10. Safety boundaries

- Do not submit live government or utility applications.
- Do not log in, use OTPs, pay, book appointments, upload documents, or query real case data.
- Do not call private, undocumented, reverse-engineered, or otherwise undocumented APIs.
- Do not collect, retain, or store account numbers, addresses, phone numbers, identity documents, login details, or other sensitive personal data.
- Do not evade authentication, CAPTCHAs, paywalls, rate limits, or other access controls.
- Do not present the ledger or site as official advice. Keep the disclaimer and `asOf` date visible.

## 11. Limitations to state in every publication

Desk research, no counter visited.

A structured, preregistered comparison, not a statistical study.

State the jurisdiction, as-of date, login boundary, archive outcome, and every unresolved limitation. Do not turn a private case surface, an unvisited office, or an absent public page into a positive finding.

## 12. Versioning and changes

This is version 0.1. A proposed change supplies its rationale, examples affected, compatibility effect, and a version increment. Changes to cell definitions, login classification, evidence grades, or scorecard fields require a preregistered comparison against the prior version; corrections to wording that do not change a rule are patch notes.
