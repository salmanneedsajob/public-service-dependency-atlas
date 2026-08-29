# Minimal research protocol

Every agent writes findings into the shared ledger contract in `schema.json`. Prefer a small number of precise claims over narrative summaries.

## Evidence grades

| Grade | Use when the claim is supported by |
| --- | --- |
| A | A binding law, regulation, commission order, or gazette notification |
| B | A current official procedure, form, service portal, circular, or agency page, including direct current observation of a public official interface |
| C | Official but indirect, incomplete, archived, or potentially outdated material |
| D | Reputable secondary reporting or professional guidance with attributable sources |
| E | Genuine citizen accounts, public forum posts, or citizen-provided screenshots and first-person evidence |
| F | An uncorroborated assertion retained only because it identifies something worth checking |
| Unknown | No usable source yet; the uncertainty itself matters to the journey |

Grades describe source strength, not whether a claim is convenient or likely. Keep `basis` separate: `observation` records what a source or interface directly shows; `inference` records a conclusion; `mixed` must explain the boundary in `notes`.

## Agent roles

### Official-source agent

Find primary law, regulation, official pages, forms, circulars, portals, and help text. Create `sources` and atomic `claims`; connect claims to relevant nodes and scenarios. Record the exact access date and jurisdiction. Do not infer a working end-to-end journey merely because individual requirements are published.

### Public-workflow agent

Trace what an unauthenticated member of the public can see across official interfaces. Record steps, system handoffs, visible error text, prerequisites, and recovery routes. Grade direct current observation of a public official interface **B**, not E; reserve E for genuine citizen accounts. Never submit a live application or bypass access controls. Mark anything that requires login or cannot be checked as `unknown`.

For each node field (`checks`, `failureSignals`, `recoveries`) that is empty after this pass, add that field name to the node's optional `researchedNoSourceFound` array **only** when the pass actually searched the relevant public route and found no public source. The omitted marker means `not yet researched`; it is a gap in our work, not evidence of a government documentation gap. Never infer the marker from an empty array, a login boundary, or another agent's notes.

### Citizen-evidence agent

Collect public first-person accounts only to expose failure modes, undocumented dependencies, terminology, and possible recovery paths. Remove personal details, grade these claims E or F as appropriate, and never treat one account as a universal rule. Link contradictions instead of resolving them by intuition.

### Auditor agent

Check atomicity, source linkage, dates, jurisdiction, scenario tags, reference integrity, evidence grade, observation-versus-inference, and contradiction links. Split compound claims. Downgrade or mark `contested` when evidence does not support the wording. Preserve unknowns.

For every `researchedNoSourceFound` marker, verify that the public-workflow evidence records an actual search of that field's relevant public route. Remove a marker that rests only on assumption, a login boundary, or an unsearched route. Empty fields without this marker must remain visibly `not yet researched` in the renderer.

## Merge rules

1. Reuse a record ID once published; change content, not identity.
2. One claim should assert one checkable thing.
3. Every non-`Unknown` claim needs at least one source. The source supplies the link and access date.
4. Tag every claim to at least one scenario and, where applicable, one dependency node.
5. Do not overwrite a conflicting claim. Add both and cross-link them with `contradictsClaimIds`; mark their status `contested` until audited.
6. Put procedural sequence in `journeys`, reusable system relationships in `edges`, and user-visible blockers in `roadblocks`.
7. Describe documentation quality in plain language. Do not invent a score or rubric during this sprint.
8. Use ISO dates (`YYYY-MM-DD`) and Bengaluru/Karnataka-specific jurisdiction text.

## Safety boundaries

- Do not submit live government or utility applications.
- Do not call private, undocumented, or reverse-engineered APIs.
- Do not collect or store account numbers, addresses, phone numbers, identity documents, login details, or other sensitive personal data.
- Do not evade authentication, CAPTCHAs, paywalls, or rate limits.
- Do not present the ledger or site as official advice. Keep the disclaimer and `asOf` date visible.
