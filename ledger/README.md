# BESCOM evidence ledger v1

This directory is the shared contract between research and the static site.

- `schema.json` defines the JSON structure consumed by the site.
- `example.json` is a valid, deliberately unknown-heavy fixture covering the six v1 scenarios.
- `demo.synthetic.json` is a richer, clearly synthetic renderer fixture. It exercises every evidence grade and uncertainty state, contradictions, roadblocks, and journeys without adding invented facts to the canonical research example.
- `AGENT_PROTOCOL.md` defines evidence grades, research roles, merge rules, and safety boundaries.

## Contract decisions

- IDs are stable, lowercase, and prefixed by record type (`scenario_`, `claim_`, `node_`, and so on).
- Research uncertainty is data. `unknown`, `partial`, and `contested` must be rendered, not converted to empty strings or omitted UI.
- Claims carry the evidence badge. A non-`Unknown` claim must reference at least one source; source records hold the URL and access date.
- Nodes and edges form the dependency graph. Scenarios select and order a path through that graph.
- Roadblocks are classified only as `documentation`, `process`, or `infrastructure` for v1.
- Journey records preserve the researched workflow, failures, recovery paths, and prose documentation-quality notes.

The schema deliberately does not contain a documentation-quality score, dependency-burden score, user accounts, submissions, or backend concerns.

## Renderer expectations

The site should load one ledger document and render:

1. the scenario picker from `scenarios`;
2. the dependency chain from `nodes`, `edges`, and each scenario's `pathNodeIds`;
3. node details from `requiredState`, `checks`, `failureSignals`, and `recoveries`;
4. evidence badges by resolving `claimIds` to `claims`, then `sourceIds` to `sources`;
5. the roadblock register from `roadblocks`;
6. visible uncertainty from every record's `status` and each claim's `evidenceGrade`.

JSON is canonical for v1. YAML may be authored later only if it compiles to this exact shape before the site reads it.

The site build accepts either JSON or YAML through `LEDGER_PATH`, validates it against `schema.json`, and writes a generated browser-ready JSON copy. Never promote `demo.synthetic.json` to a research ledger: every claim and source in it is an interface-testing placeholder.
