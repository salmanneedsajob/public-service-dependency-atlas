# Fresh isolated audit — occupancy-certificate

**Audited:** 2026-09-06  
**Input boundary:** `ledger/occupancy-certificate.json`, its expectations and portal sidecars, the manifest entry, `ledger/schema.json`, and Research protocol v2 (including section 13) only. No handoffs, prior audits, comments, history, or external research were used.

## Verdict

**Not ready for done.** The primary scenario is correctly declared and present, and the official claims are generally atomic, linked to sources, dated, jurisdiction-scoped, and scenario-tagged. The record nevertheless has blocking quarantine, schema, portal-evidence, archive, and expectation-authoring defects. The attached correction set contains **52** corrections; it is intentionally limited to changes supportable by the audited records.

## Primary scenario and references

The manifest and expectations sidecar agree on `scenario_occupancy_certificate_sanctioned_residential`; it is the sole primary scenario, is present in the ledger, and all non-citizen claims relevant to this service are tagged to it. The e-Khata dependency edge has valid existing endpoint and claim references. No dangling source, claim, node, edge, or expectation claim reference was found in the supplied inputs.

The two represented branch scenarios are supported solely by citizen claims. Under section 2, unencountered branches must not be represented, and section 12 requires that citizen material be quarantined instead. The corrections delete both branch scenario records, add the required `scenario_citizen_reported`, detach the three citizen claims from the main public-route node, and move them into that quarantine scenario.

## Claims, grades, basis, and contradictions

The non-citizen claims each assert a discrete proposition. Their Grade B assignments match the recorded official guidance or portal sources, and their `observation` bases are phrased as what those sources display. The two e-Khata claims duplicate the same mandatory-prerequisite proposition; the older duplicate is removed rather than presented as independent corroboration.

The citizen claims correctly preserve uncertainty in their wording and use Grade E, but their current `citizen_reported` status is not a `recordStatus` allowed by `ledger/schema.json`, and their primary/branch scenario and node links breach the section 12 quarantine rule. The corrections use schema-valid `contested` status and the dedicated quarantine scenario; they do not elevate any citizen account to an official rule. No supported direct contradiction was found: the 7-working-day conditional BPAS statement can coexist with the service-sheet maximum of 30 working days. The expectation note must distinguish their scope rather than imply a conflict.

## Sources, dates, jurisdiction, and archive records

All recorded `accessedAt` values are ISO dates. The service sheet explicitly records an undated-source limitation and archive failures; the newer manual records its publication date and Wayback snapshot; the current BPAS notice records its archive failure; and the two citizen sources document an archival retrieval limitation.

Eight older portal-observation source records have no archive snapshot or documented archival outcome, and have no publication-date/visible-date limitation. The correction set adds only an explicit audit limitation; it does **not** claim an archive attempt occurred or failed. These sources cannot pass the archive-snapshot rule until the missing provenance is independently supplied. The schema has no source-level `jurisdiction` field. Although claim jurisdictions are populated, the source records cannot themselves carry the protocol-required jurisdiction as a structured field; this remains a schema/contract limitation, not an invented source value.

Several of those older sources use `publisher: "occupancy-certificate"` rather than an agency name. The portal sidecar gives agency naming for the observed portal, but that does not repair source-level publisher provenance. This must be repaired from source evidence, not guessed by the auditor.

## Expectations (section 8)

All six cells are present for the primary scenario and their states are substantively supportable:

- `cost` is correctly `mentioned`: compounding fee is named with no amount.
- `documents` and `eligibility` are correctly `stated` by actionable official claims.
- `time` is `stated`, but must cite both the 30-working-day maximum and the conditional 7-working-day post-application statement, with a scope note.
- `owner` is `stated` because the Town Planning Section/Additional Director designation is actionable.
- `after-submission` is `stated` because the published process identifies a demand note to the party and the authenticated manual/FAQ identify a status and certificate surface.

Every authored note is blank, contrary to section 9: stated cells need an actionable-value note, and the mentioned cost cell needs a search note. The corrections supply those notes without changing the supported cell states.

## Portal and route observations

Three portal records and five route observations exist, with service/scenario IDs, URLs, redirects, link counts, authentication statements, public surfaces, and limitations. The public/authenticated boundary, CAPTCHA state, JavaScript state, and per-route evidence IDs are blank for every route despite being required by section 10. The correction set links each route to its cited source, makes the supported public/case boundary explicit, records CAPTCHA only where already observed, and calls unassessed JavaScript `unknown` rather than guessing. The legacy route’s `finalStatus: 200` contradicts its own `ERR_CONNECTION_REFUSED` observation and `finalUrl: null`; it is corrected to null.

The dead legacy portal keeps a limitation explaining the unavailable surface; no agency naming, languages, or version can be inferred from it. Its blank values are an unresolved observation limitation, not evidence of a functioning portal.

## Nodes, edges, route gaps, and archive limitations

The primary path’s e-Khata node has a supported check. The public-route node has empty checks, failures, and recoveries, but it does not assert `researchedNoSourceFound`; therefore it remains visibly not-yet-researched rather than falsely claiming a public-route search. No invalid `researchedNoSourceFound` marker exists. The edge is supported. No roadblocks or journeys exist, so there are no roadblock/journey reference errors to correct.

After applying the correction set, the service still has these blocking limitations: missing source-level jurisdiction representation, unverified agency publisher fields on older portal sources, missing archival provenance for eight such sources, unobserved JavaScript behavior, inaccessible legacy portal metadata, and no evidence that the corrections have been applied/validated. These are not filled with inference.

## Correction application

Apply `ind77-occupancy-certificate-corrections.json` atomically. It uses section 13 record type, record ID, exact field path, old/new values, reason, and support for every proposed edit. True record additions/deletions use `null` on the absent side. No ledger, sidecar, script, or handoff was modified by this audit.
