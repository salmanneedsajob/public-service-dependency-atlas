import { readFile, writeFile } from 'node:fs/promises';
const read = (p) => readFile(p, 'utf8').then(JSON.parse);
const ledger = await read('ledger/khata.json');
const handoffs = await Promise.all(['official','workflow','citizen'].map((p)=>read(`research/handoffs/ind45-khata-${p}.json`)));
const sourceMap = new Map([
 ['source_ind45_eaasthi_home_live','source_ind32_eaasthi_citizen_home'],['source_ind45_eaasthi_login_live','source_ind32_eaasthi_citizen_login'],['source_ind45_ekhata_status_live','source_ind32_ekhata_status'],['source_ind45_pending_mutation_route_live','source_ind32_pending_mutation_report'],
]);
const byId=(xs,id)=>xs.find(x=>x.id===id); const union=(a=[],b=[])=>[...new Set([...a,...b])];
const sourceIds=new Set(ledger.sources.map(x=>x.id));
for(const h of handoffs)for(const raw of h.sources??[]){const id=sourceMap.get(raw.id)??raw.id;if(id===raw.id&&!sourceIds.has(id)){ledger.sources.push(structuredClone(raw));sourceIds.add(id)}}
const claims=new Set(ledger.claims.map(x=>x.id));
for(const h of handoffs)for(const raw of h.claims??[]){if(claims.has(raw.id))continue;const x=structuredClone(raw);x.sourceIds=[...new Set(x.sourceIds.map(id=>sourceMap.get(id)??id))];x.scenarioIds=x.scenarioIds.filter(id=>byId(ledger.scenarios,id));x.nodeIds=x.nodeIds.filter(id=>byId(ledger.nodes,id));ledger.claims.push(x);claims.add(x.id)}
for(const h of handoffs)for(const incoming of h.nodes??[]){const target=byId(ledger.nodes,incoming.id);if(!target)continue;for(const f of ['checks','failureSignals','recoveries']){const ids=new Set(target[f].map(x=>x.id));for(const x of incoming[f]??[])if(!ids.has(x.id)){target[f].push(structuredClone(x));ids.add(x.id)}}target.claimIds=union(target.claimIds,incoming.claimIds);target.researchedNoSourceFound=union(target.researchedNoSourceFound,incoming.researchedNoSourceFound)}
for(const h of handoffs)for(const raw of h.roadblocks??[]){const x=structuredClone(raw);x.nodeIds=x.nodeIds.filter(id=>byId(ledger.nodes,id));x.scenarioIds=x.scenarioIds.filter(id=>byId(ledger.scenarios,id));x.claimIds=x.claimIds.filter(id=>claims.has(id));if(x.nodeIds.length&&x.scenarioIds.length&&x.claimIds.length&&!byId(ledger.roadblocks,x.id))ledger.roadblocks.push(x)}
ledger.meta.title='Bengaluru e-Khata transfer evidence ledger';ledger.meta.asOf='2026-08-30';
await writeFile('ledger/khata.json',`${JSON.stringify(ledger,null,2)}\n`);console.log('Integrated IND-45 khata handoffs.');
