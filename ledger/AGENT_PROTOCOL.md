# Research protocol v2

**Version:** 2
**Date:** 2026-09-04

Every agent writes findings into the shared ledger contract in `schema.json`. Prefer a small number of precise claims over narrative summaries. This protocol supersedes v1 for Wave 2 and retains the Phase 2 rules for existing ledgers unless a rule below expressly changes them.

## 1. Research roles and the binding workflow

One service per Linear issue and one service per Codex run. Do not batch. The reference standard is `ledger/khata.json`: every node there carries populated `checks`, `failureSignals`, and `recoveries` with sourced claims. Most other ledgers have these fields empty, which is the gap this work closes.

For each service, the binding workflow is: official-source pass, public-workflow pass, citizen-evidence pass, integration, then one audit in a separate fresh run. Passes write isolated handoffs. The audit receives only the integrated ledger, `ledger/schema.json`, this protocol, and the audit-corrections contract; it does not receive researchers' reasoning or prior pass handoffs. No Wave 2 research may start until its blocking pre-flight issue is Done.

### Official-source agent

Find primary law, regulation, official pages, forms, circulars, portals, and help text. Create `sources` and atomic `claims`; connect claims to relevant nodes and scenarios. Record the exact access date and jurisdiction. Do not infer a working end-to-end journey merely because individual requirements are published.

### Public-workflow agent

Trace what an unauthenticated member of the public can see across official interfaces. Record steps, system handoffs, visible error text, prerequisites, and recovery routes. Grade direct current observation of a public official interface **B**, not E; reserve E for genuine citizen accounts. Never submit a live application or bypass access controls. Mark anything that requires login or cannot be checked as `unknown`.

### Citizen-evidence agent

Collect public first-person accounts only to expose failure modes, undocumented dependencies, terminology, and possible recovery paths. Remove personal details, grade these claims E or F as appropriate, and never treat one account as a universal rule. Link contradictions instead of resolving them by intuition.

### Integrator

Merge isolated handoffs without changing record identity. Reuse a record ID once published; change content, not identity. Put procedural sequence in `journeys`, reusable system relationships in `edges`, and user-visible blockers in `roadblocks`. Do not overwrite conflicting claims: retain both, cross-link them with `contradictsClaimIds`, and mark them `contested` until audited.

### Auditor

Check atomicity, source linkage, dates, jurisdiction, scenario tags, reference integrity, evidence grade, observation-versus-inference, contradiction links, portal records, expectation cells, archive records, and the rules below. Split compound claims. Downgrade or mark `contested` when evidence does not support the wording. Preserve unknowns. Its evidence verdict is final for what ships.

The derived Mapped status remains a diagnostic: it is reached only when every node on the default scenario path has at least one `checks`, `failureSignals`, and `recoveries` entry, no node is `unknown`, and every edge has a supporting `claimId`. Do not edit status by hand. It is informational, never a research goal and never a substitute for this protocol's definition of done.

## 2. Scenario policy

Every Wave 2 ledger has exactly one manifest-declared `primaryScenarioId`. The six-cell expectation grid scores that scenario only. Branch IDs are predeclared in the service issue to keep identifiers stable, but a branch is recorded in the ledger only if a pass encounters it. Done is evaluated on the primary scenario alone; an unencountered branch neither blocks completion nor is represented as evidence.

Do not introduce Wave 2 scenario aliases. Do not add node kinds or roadblock categories unless a probe proves that the current schema cannot represent the service. Tag every claim to at least one scenario and, where applicable, one dependency node.

## 3. Explicit zero counts as stated

An explicit zero requirement is a stated value, not an absence and not a not-applicable state. For example, `free`, `no upload required`, `no fee`, or `no additional eligibility requirement` must be recorded as `stated` when the applicable evidence states it. The expectation grid has no not-applicable state.

## 4. Evidence-grade table

| Grade | Use when the claim is supported by |
| --- | --- |
| A | A binding law, regulation, commission order, or gazette notification |
| B | A current official procedure, form, service portal, circular, or agency page, including direct current observation of a public official interface |
| C | Official but indirect, incomplete, archived, or potentially outdated material |
| D | Reputable secondary reporting or professional guidance with attributable sources |
| E | Genuine citizen accounts, public forum posts, or citizen-provided screenshots and first-person evidence |
| F | An uncorroborated assertion retained only because it identifies something worth checking |
| Unknown | No usable source yet; the uncertainty itself matters to the journey |

Grades describe source strength, not whether a claim is convenient or likely.

## 5. Basis rule

Keep `basis` separate from grade. `observation` records what a source or interface directly shows; `inference` records a conclusion drawn from it; and `mixed` must explain the boundary in `notes`. A source grade does not turn an inference into an observation.

## 6. Edge policy and `researchedNoSourceFound`

An edge may exist when any evidence supports it, with its status reflecting the strongest evidence held. Remove an edge only when no evidence of any grade supports it.

For each node field (`checks`, `failureSignals`, `recoveries`) that remains empty after the public-workflow pass, add that field name to the node's optional `researchedNoSourceFound` array **only** when that pass actually searched the field's relevant public route and found no public source. Record the searched route or URL and the search note. The omitted marker means `not yet researched`; it is a gap in our work, not evidence of a government documentation gap. Never infer the marker from an empty array, a login boundary, or another agent's notes.

The auditor verifies every `researchedNoSourceFound` marker against public-workflow evidence. Remove a marker that rests only on assumption, a login boundary, or an unsearched route. Empty fields without this marker must remain visibly `not yet researched` in the renderer.

## 7. Citation gate

Every non-`Unknown` claim needs at least one source. A source supplies the direct link, exact access date, and jurisdiction. Citations must resolve to specific pages: a department homepage is a `General-site reference`, and claims resting on it are Grade C, never presented as a specific source. Do not replace a dead specific page with a homepage.

Use ISO dates (`YYYY-MM-DD`) and Bengaluru/Karnataka-specific jurisdiction text. The citation gate is green only when these requirements, source links, claim-source references, scenario tags, and required limitations are present and valid.

## 8. Expectations block written by the official pass

The official-source pass writes a human-authored expectations block for the `primaryScenarioId`. It covers exactly these six cells: `cost`, `documents`, `eligibility`, `time`, `owner`, and `afterSubmission`.

For a `stated` cell, write its state, `claimIds`, and an actionable-value note. For a `mentioned` or `absent` cell, write its state, searched route IDs or URLs, optional topic-only `claimIds`, and a search note. A regex or other automated extraction may cross-check the block but cannot replace it. Explicit zero values follow section 3.

## 9. Portal record written by the public-workflow pass

The public-workflow pass writes one portal record per portal, not one conclusion per host. Each portal record contains: `portalId`, `host`, observation timestamp, service owner, portal operator, agency naming shown, languages, visible version or last-updated date, and evidence source IDs.

Each portal record contains nested `routeObservations`. Every route observation contains: `routeId`; service and scenario IDs; entry and final URLs; redirects; checked and dead-link counts; authentication prerequisites; the boundary between public procedure and case data; CAPTCHA, JavaScript, or app dependencies; public guidance, tracking, error, and recovery surfaces; evidence IDs; and limitations. Login- or case-data-bound surfaces remain unknown rather than inferred.

## 10. Archive-snapshot rule

At access time, capture a Wayback snapshot for every public source used. Record the snapshot URL with the source. If capture fails, record the access date, the failure, and a limitation. Archive failure does not permit a substitute homepage or an unsupported claim.

## 11. Citizen-evidence quarantine

Citizen evidence is quarantined to `citizen_reported`. It may expose a failure mode, undocumented dependency, terminology, or possible recovery path, but cannot establish an official rule. Redact all personal data. Cross-link a citizen contradiction to other evidence only when the account establishes the same route and a comparable period; otherwise keep it quarantined and do not resolve it by intuition.

## 12. Structured audit corrections and auditor isolation

The audit produces markdown findings and a corrections JSON document. Each correction object contains:

```json
{
  "recordType": "claim",
  "recordId": "claim_example",
  "fieldPath": "/status",
  "old": "stated",
  "new": "contested",
  "reason": "The cited source does not support the stronger wording.",
  "support": {
    "sourceIds": ["source_example"],
    "auditNote": "Short evidence rationale."
  }
}
```

Use `null` for a true addition or deletion. The generic application step validates `recordType`, `recordId`, exact field path, and old value; applies the complete correction set atomically; rejects drift; and emits unapplied corrections as stated limitations. Corrections must state `recordType`, `recordId`, exact field path, `old`, `new`, `reason`, and source or audit support.

The audit is isolated: one fresh audit run per service, with only the integrated ledger, schema, this protocol, and corrections contract. It must not receive researcher reasoning or pass handoffs. The auditor may split compound claims, merge duplicates, remove false contradiction links, and downgrade unsupported claims. It may not invent evidence to make a record complete.

## 13. Definition of done

A service is done when the primary scenario is fixed and present; the integrated ledger is schema-valid; six authored expectation cells are present; stated cells cite claim IDs and mentioned/absent cells record searched routes; public sources include visible agency naming, access date, and a Wayback snapshot or documented archival failure; required portal route records exist; every `researchedNoSourceFound` is backed by a recorded search; lint is clean or waived; a fresh audit has completed and structured corrections are applied; unapplied corrections are stated limitations; validation is green; and the service finish comment is posted.

Branch IDs are declared for stability but are recorded only when encountered. Done depends on the primary scenario alone. Derived Mapped status is informational only, never a completion target.

## 14. Start and finish comment formats

Post this start comment before a service run:

```text
Service: <service name>
Primary scenario: <primaryScenarioId>
Predeclared branch IDs: <branch IDs>
As of: <YYYY-MM-DD>
Assigned pass: <official-source | public-workflow | citizen-evidence | integration | audit>
Seeds: <public URLs>
Safety boundary: <service-specific boundary>
Handoff path: <path>
```

Post this finish comment when the service is complete:

```text
Primary scenario: <primaryScenarioId>; encountered branches: <IDs or none>
Evidence counts: sources by grade; claims by status; nodes; edges; roadblocks; journeys
Expectations: cost <claim IDs or searched routes>; documents <...>; eligibility <...>; time <...>; owner <...>; afterSubmission <...>
Portal records written: <portal IDs>; route observations: <route IDs>
Audit: <file>; corrections proposed/applied/unapplied: <counts and IDs>
Validation: <results>; derived-status change: <informational before/after>
Unresolved limitations: <explicit list or none>
```

## 15. Safety boundaries

- Do not submit live government or utility applications.
- Do not log in, use OTPs, pay, book appointments, upload documents, or query real case data.
- Do not call private, undocumented, reverse-engineered, or otherwise undocumented APIs.
- Do not collect, retain, or store account numbers, addresses, phone numbers, identity documents, login details, or other sensitive personal data.
- Do not evade authentication, CAPTCHAs, paywalls, rate limits, or other access controls.
- Do not present the ledger or site as official advice. Keep the disclaimer and `asOf` date visible.

## Changes from v1

- Adds the binding per-service workflow, audit isolation, and primary-scenario-only completion rule.
- Adds explicit-zero, expectation-block, portal-record, and archive-snapshot requirements.
- Clarifies source-specific citation requirements, citizen-evidence quarantine, and route-backed `researchedNoSourceFound` markers.
- Adds the structured audit-corrections contract plus required start and finish comments.
- Preserves Phase 2 evidence grades, basis distinctions, edge policy, safety limits, and derived-status calculation while making derived status informational.
