import path from 'node:path';
import { runApplyAuditCli } from '../benchmark/scripts/apply-audit.mjs';

await runApplyAuditCli(process.argv.slice(2), {
  defaultSidecarPath(type, ledgerPath) {
    const service = path.basename(ledgerPath, '.json');
    return `ledger/${type === 'expectation' ? 'expectations' : 'portals'}/${service}.json`;
  },
});
