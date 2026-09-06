import { runLintCli } from '../benchmark/scripts/pre-audit-lint.mjs';

await runLintCli(process.argv.slice(2), { defaultManifestPath: 'ledger/services.manifest.json' });
