# Why is my BESCOM transfer blocked?

A static, single-page renderer for BESCOM transfer evidence ledgers using schema v1.0.0. The interface is driven entirely by ledger data: scenarios select dependency paths; nodes expose checks, failure signals, and recoveries; claims resolve to evidence grades and sources; roadblocks and journeys are rendered without hard-coded case logic.

The default data file is `ledger/demo.synthetic.json`. It is deliberately richer than the canonical unknown-heavy example and is clearly synthetic: it exists to exercise every UI state, not to make claims about BESCOM. Do not publish it as guidance and do not replace `ledger/example.json` with it.

## Run locally

```sh
npm install
npm run dev
```

## Choose a ledger

JSON is canonical. Set `LEDGER_PATH` to any JSON, YAML, or YML document that satisfies `ledger/schema.json`; the prepare step validates and compiles it to the exact JSON shape used by the browser.

```sh
LEDGER_PATH=ledger/example.json npm run dev
LEDGER_PATH=/absolute/path/to/research-ledger.yaml npm run build
```

Swapping the ledger requires no renderer change. Invalid documents fail before the site starts or builds.

## Verify and deploy

```sh
npm test
npm run lint
npm run typecheck
npm run build
```

`npm run build` produces the Cloudflare Worker-compatible `dist` artifact consumed by the one-step Sites publishing workflow. The repository contains no backend, account system, live submissions, or private API calls.

For a connected Cloudflare account, `npm run deploy` performs the build and Worker deployment in one command. It is intentionally not run by the test suite.

Set `NEXT_PUBLIC_SITE_ORIGIN` to the trusted production origin during a hosted build so social-preview metadata resolves `public/og.png` to the deployed site. Local builds intentionally use `http://localhost:3000`.
