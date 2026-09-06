# Public Service Legibility Benchmark v0.1

Run this on your city to measure whether a public-service route tells a citizen what to expect before a case begins. The output is one scorecard per service and jurisdiction: stated cells out of six.

## Grid-only path

A grid-only ledger carries `meta`, one primary `scenario` with an empty `pathNodeIds`, `sources`, and `claims`; `agencies`, `nodes`, `edges`, `roadblocks`, and `journeys` are present as schema-required empty arrays. It carries no portal records or workflow graph records. A jurisdictions manifest entry may include `lintWaivers`, an array of `{ recordId, check, reason }`; the validator gives these the same meaning as pre-audit handoff waivers, and each reason must name why the claim is atomic in substance when a lint result is waived.

1. Choose a city, a service, and one primary scenario using `templates/service-scoping.md`. Keep the same trigger, applicant type, and route class when comparing cities.
2. Freeze a short preregistration with `templates/preregistration.md`: the services, predictions, cell definitions, login rule, and date.
3. Run one official-source pass on public pages only. Do not log in, enter case data, pay, submit, or use an API.
4. Write the six expectation cells in an expectations sidecar. Use `stated` only for an actionable public value; record searched routes for `mentioned` and `absent`.
5. Run a light independent audit of those six cells. Apply its structured corrections, and state anything not applied as a limitation.
6. Generate a scorecard:

   ```sh
   node benchmark/scripts/score.mjs ledger.json expectations.json --jurisdiction "Example City, Example Country"
   ```

7. Publish a table of the six cells, stated count, login-stripped Unknown share, source mode, and limitations. Say that this is desk research, no counter visited, and a preregistered comparison.

## Deep-ledger path

Use this path for a pilot site or disputed service. Follow [PROTOCOL.md](PROTOCOL.md): isolated official-source, public-workflow, and citizen-evidence passes; integration; a fresh audit; authored expectations; portal records; and the corrections contract. Then run `scripts/score.mjs` with the portal sidecar to include friction signals.

## Package map

- `SPEC.md` — the public standard.
- `PROTOCOL.md` — binding collection and audit rules.
- `schemas/` — ledger, sidecar, manifest, corrections, and scorecard contracts.
- `scripts/` — Node-only lint, correction applier, and score tool.
- `templates/` — scoping, preregistration, and work-item comments.

Text and templates are CC BY 4.0; scripts are MIT. See [LICENSE](LICENSE).
