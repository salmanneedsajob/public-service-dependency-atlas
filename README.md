# Public Service Dependency Atlas

A Bengaluru-first, evidence-led atlas of the undocumented handoffs between public services. Government services are digitized as separate departments, while citizens experience connected life events. When the links are undocumented, the citizen becomes the integration layer; this project makes those links, and the gaps around them, legible.

Each entry is a static route rendered entirely from its own JSON evidence ledger. It shows published documentation alongside reported roadblocks, source dates, evidence grades, explicit Unknowns, contradictions, and stated audit limitations. It is independent research, never official guidance.

## What the atlas shows

Each service entry keeps its unanswered questions in a visible “What nobody has documented” section. These are specific missing procedures or handoffs that prevent a public-service journey from being understandable. The landing page shows a small set of examples and links directly to the relevant entry.

## Method

The ledger schema is the data contract: [`ledger/schema.json`](ledger/schema.json). The research protocol is [`ledger/AGENT_PROTOCOL.md`](ledger/AGENT_PROTOCOL.md).

For each service, the project uses three evidence-collection passes:

- official sources and public forms/portals;
- unauthenticated public-workflow observation;
- redacted first-person citizen evidence.

A separate audit pass checks atomicity, citations, dates, grades, references, contradictions, and unknowns. Each service has one audit; remaining findings are preserved as visible stated limitations rather than silently edited away. A dependency edge may be officially documented, partially evidenced, or reported by citizens but undocumented; it is only removed when no evidence supports it.

## Map a service

1. Start with a bounded Bengaluru journey and its real-life trigger.
2. Add only sourced, dated claims to a service ledger; use `Unknown` where the public record stops.
3. Keep incompatible accounts as cross-linked contradictions rather than choosing a winner.
4. Run the schema checks and one independent audit.
5. Publish the route as Mapped or Partially mapped, with its documentation shelf and limitations visible.
6. Keep the unanswered questions visible when the public record does not establish a procedure or recovery route.

Do not submit applications, authenticate to government systems, collect personal data, or imply that a public form completes an end-to-end journey.

## Develop and verify

```sh
npm install
npm run dev
npm test
npm run lint
npm run typecheck
npm run build
```

`npm test` validates the synthetic fixture and research ledger and checks every external citation in published ledger files. `npm run prepare:ledger` validates every service ledger and generates the browser-readable files in `public/data`.

## Deploy

The project is deployed as the standalone Vercel project `bescom-atlas`:

```sh
npm run deploy
```

The deployed atlas is [bescom-atlas.vercel.app](https://bescom-atlas.vercel.app). Verify routes anonymously with `curl` after deployment. No backend, account system, live submission, or private API is part of this repository.
