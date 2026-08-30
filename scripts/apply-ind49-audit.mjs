import { readFile, writeFile } from 'node:fs/promises';
const ledger = JSON.parse(await readFile('ledger/lpg.json', 'utf8'));
const by=(items,id)=>items.find(x=>x.id===id); const unique=(items)=>[...new Set(items)];
ledger.roadblocks=ledger.roadblocks.filter(x=>x.id!=='roadblock_audit_lpg');
for(const id of ['node_lpg_w_transfer_out','node_lpg_w_transfer_in','node_lpg_w_update','node_lpg_w_outcome']) { const node=by(ledger.nodes,id); if(node) delete node.researchedNoSourceFound; }
const form=by(ledger.claims,'claim_ind49_bpcl_form_types'); if(form){form.evidenceGrade='B';form.status='verified';form.notes=`${form.notes??''} This is a Bharatgas form observation, not a universal or government requirement.`.trim();}
for(const id of ['claim_ind49_pib_omc_digital_services','claim_ind49_pib_registered_login','claim_ind49_pib_withdrawal_window']) {const c=by(ledger.claims,id);if(c){c.evidenceGrade='C';c.status='partial';c.notes=`${c.notes??''} Dated government communication about OMC services, not a current Bengaluru transaction rule.`.trim();}}
const duplicateSource='source_ind49_lpg_bharatgas_portability', canonical='source_ind49_bpcl_portability';
for(const claim of ledger.claims) claim.sourceIds=unique(claim.sourceIds.map(id=>id===duplicateSource?canonical:id));
ledger.sources=ledger.sources.filter(s=>s.id!==duplicateSource);
const citizenScenario={id:'scenario_lpg_citizen_reported',label:'Historical citizen LPG reports',summary:'Route- and carrier-unknown first-person reports. They are not current provider workflow evidence.',tags:['lpg','citizen-evidence','historical'],pathNodeIds:['node_lpg_w_route','node_lpg_w_outcome'],status:'partial'};
if(!by(ledger.scenarios,citizenScenario.id))ledger.scenarios.push(citizenScenario);
for(const claim of ledger.claims.filter(c=>c.id.startsWith('claim_ind49_lpg_')&&c.id.includes('_reported_'))) {claim.scenarioIds=['scenario_lpg_citizen_reported'];claim.status='partial';}
for(const roadblock of ledger.roadblocks.filter(b=>b.id.startsWith('roadblock_ind49_lpg_reported_')))roadblock.scenarioIds=['scenario_lpg_citizen_reported'];
for(const roadblock of ledger.roadblocks){roadblock.ownerAgencyIds=unique(roadblock.ownerAgencyIds??[]);roadblock.scenarioIds=unique(roadblock.scenarioIds??[]);}
for(const journey of ledger.journeys){journey.documentationQualityNotes=unique([...(journey.documentationQualityNotes??[]),'This entry records provider-specific OMC guidance, not a shared government LPG-transfer procedure.','Provider, service area, documents, eligibility, fees, live transaction and outcome remain unknown for a Bengaluru case.','Carrier-specific portability and transfer terms are not interchangeable; public pages did not establish a single end-to-end journey.']);}
ledger.meta.asOf='2026-08-31';await writeFile('ledger/lpg.json',`${JSON.stringify(ledger,null,2)}\n`);console.log('Applied IND-49 audit.');
