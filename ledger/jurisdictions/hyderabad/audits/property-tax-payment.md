# Audit — Hyderabad property-tax payment

- **Service:** `property-tax-payment`
- **Jurisdiction:** Hyderabad, Telangana, India
- **Primary scenario:** `scenario_property_tax_payment_known_sas_pid`
- **Audit date:** 2026-09-06
- **Benchmark version:** 0.1
- **Mode:** grid-only (no nodes, edges, roadblocks, journeys; no portal sidecar). Their absence is not raised as a finding.

---

## Findings

### 1. Compound list claim — `claim_hyderabad_ptax_payment_modes`

**Severity:** correction

**Required:** Section 1 requires that one claim asserts one checkable thing. Section 8's pre-audit lint, item 1, flags compound or list claims, and an unwaived lint finding blocks audit. Section 13 empowers the auditor to split compound claims and merge duplicates.

**Observed:** The claim asserts five payment channels in one record — bill collectors' handheld machines integrated with a central server, 72 Mee-Seva centres, citizen service centres in all 30 circles and the head office, online or NEFT and RTGS, and 537 branches of 8 banks. Four independently falsifiable counts (72, 30, 537, 8) sit inside a single record, so no reader can tell which count the record's `verified` status attaches to. No waiver is visible in the audit's permitted inputs. The ledger itself already treats one of the five as separately checkable — `claim_hyderabad_ptax_thirty_circles`, drawn from the same source — so the intended granularity is one channel per claim.

**Correction:** Delete the compound record; add four atomic claims (`claim_hyderabad_ptax_payment_mode_handheld`, `..._meeseva`, `..._online_neft_rtgs`, `..._banks`), each on `source_hyderabad_ptax_ghmc_page` at the same grade, basis and status; and carry the fifth channel on the existing `claim_hyderabad_ptax_thirty_circles` by amending its text. No new evidence is introduced: every split record rests on the same observed page text as the record it comes from.

### 2. Partial duplication — `claim_hyderabad_ptax_thirty_circles`

**Severity:** note

**Required:** Section 1 tells the integrator to reuse a published record ID and change content, not identity; section 13 lets the auditor merge duplicates.

**Observed:** The citizen-service-centre channel was asserted twice from the same source at two granularities — inside `claim_hyderabad_ptax_payment_modes` as a payment channel, and in `claim_hyderabad_ptax_thirty_circles` as a structural fact. Finding 1 resolves this by amending the existing record's text to carry both, rather than minting a fifth new claim that would re-duplicate it. The record's identity is preserved, so `owner`'s citation of it stays valid and the amended text still supports the 30-circle structure that cell relies on.

### 3. `documents` cell overstated — expectation `property-tax-payment`, `/cells/documents`

**Severity:** correction

**Required:** Section 8 defines `documents` as `stated` when the evidence gives an actionable document list or names a concrete document with a requirement to submit, provide, upload, produce or attach it; `mentioned` when documents are referred to without telling the citizen what is required; and `absent` when the reviewed evidence does not touch the topic.

**Observed:** The cell is `mentioned` on `claim_hyderabad_ptax_ptin_or_mobile_required`. What that claim records is a portal form asking for a property tax identification number or a registered mobile number. An identifier is a data field, not a document, and the form makes no reference to documents at all — the cell's own note concedes this in terms ("rather than a document to submit, provide, upload, produce or attach"). A `mentioned` state requires the topic to be *named*; here it is not named on any route reviewed for this scenario. The real document lists the corporation publishes — sale deed, link documents, sanction plan, occupancy certificate — belong to new assessment and mutation, both excluded by the scenario summary, and the cell correctly declines to count them. The reviewed evidence therefore does not touch the documents topic for this scenario, which is the definition of `absent`. The limitation is already carried by `claim_hyderabad_ptax_documents_for_payment_unknown`, an `Unknown` claim, which under section 8 records a limitation and cannot supply a positive cell value.

**Correction:** `/cells/documents/state` to `absent`; `/cells/documents/claimIds` to `[]`, since no claim touches the topic and a topic-only citation would misrepresent the identifier field as document evidence; `/cells/documents/note` rewritten so the note does not assert a state the cell no longer holds. The four searched routes and the search note are retained, as section 9 requires for an `absent` cell.

### 4. `cost` cell accepted at `mentioned` — expectation `property-tax-payment`, `/cells/cost`

**Severity:** note

**Required:** Section 8: `cost` is `stated` when the evidence gives an amount a citizen pays or an actionable fee schedule; a fee described only as prescribed, or a payment step without an amount, is `mentioned`; `absent` when the evidence does not touch the topic.

**Observed:** Tested in both directions and the cell holds.

Against `absent`: the 2008 notification does touch the cost topic even though it excludes this scenario's category. It is a property-tax rate document, and its statement that there is no revision of property tax on residential buildings is itself a statement about residential property tax. More decisively, `claim_hyderabad_ptax_assessment_method_named` records that the procedure for determining annual rental value and assessing the tax is laid down in named statutory provisions and proceeds by territorial zones and construction classification. That is a fee described only as prescribed — section 8's own example of `mentioned`, not of a topic untouched. The public payment route is a payment step without a published amount, which points the same way.

Against `stated`: no reviewed route gives a residential rate, slab, zone value or amount. The rate notification's schedule is expressly for non-residential buildings, so a residential owner cannot apply it. `mentioned` is correct.

Both cited claims are Grade C and `verified`, so they may support `mentioned`. Grade C is admissible for a positive cell state under section 8, and both C gradings are correct under section 4 (official but indirect and visibly outdated material, with the date and limitation stated on the source and on the claim). Neither of the two `Unknown` claims bearing on cost is cited here, which is correct.

### 5. `time` cell accepted at `mentioned` — expectation `property-tax-payment`, `/cells/time`

**Severity:** note

**Required:** Section 8: `time` is `stated` when the evidence gives an actionable duration, deadline, processing period or service-level target; a reference to timing, delay, sequence or processing without a figure or usable time rule is `mentioned`.

**Observed:** Tested in both directions and the cell holds.

Against `absent`: naming an annual demand notice does touch the timing topic. `claim_hyderabad_ptax_no_manual_transactions` records the corporation stating that the issue of annual demand notices is computerised; "annual" is a reference to the cycle on which the liability reaches the owner. That is a reference to timing and sequence without a figure, which section 8 places at `mentioned`.

Against `stated`: the only date on any payment surface is the receipt route's scope cutoff of 1 April 2016, recorded in `claim_hyderabad_ptax_public_receipt_route`. That is a historical eligibility boundary on downloading a receipt, not a duration, deadline, processing period or service-level target for the act this scenario covers. No due date, penalty date or rebate deadline appears on any reviewed route, and `claim_hyderabad_ptax_due_date_unknown` records that as an `Unknown` limitation, correctly not cited in the cell. `mentioned` is correct. The "one stage only" note requirement does not arise, since no figure is being carried as a stated value.

### 6. `owner` cell accepted at `stated` — expectation `property-tax-payment`, `/cells/owner`

**Severity:** note

**Required:** Section 8: `owner` is `stated` when the evidence lets a citizen identify the office, officer or operational role that holds or decides the case, including a specific office list, a designation tied to a jurisdiction rule, or a contact route for that role; a statutory designation or general agency name alone is `mentioned`. `stated` requires a Grade A, B or C claim. Section 4 admits visibly outdated official material at Grade C provided the date and the limitation are stated.

**Observed:** Tested in both directions and the cell holds, on both questions put to it.

On whether Grade C material twelve years past its own revision date can carry the cell: yes. Section 8 admits Grade C for `stated` without qualification, and section 4 sets the condition for using outdated official material — state the date and the limitation — which this ledger meets four times over: `source_hyderabad_ptax_citizen_charter` records the 10 May 2013 preparation date as `publishedAt` and the 13 May 2014 revision date on the document's face; `claim_hyderabad_ptax_circle_office_dc` repeats the limitation in its notes; the cell note repeats it; and the `meta.disclaimer` repeats it. The staleness is priced into the grade, which is where the protocol puts it. There is no age cutoff that voids an otherwise correctly graded and correctly limited C claim, and inventing one would be the auditor legislating.

On whether the current page's 30-circle confirmation is enough on its own: no, and the ledger does not claim it is. `claim_hyderabad_ptax_thirty_circles` establishes that the circle structure described by the 2013 charter still stands and that each circle has a service counter, but on its own it names a structure, not the role that holds the case — alone it would sit at `mentioned`. What carries the cell is the charter claim, which supplies exactly what the definition asks for: a designation, Deputy Commissioner, tied to a jurisdiction rule, the circle in which the property falls. `claim_hyderabad_ptax_zone_and_circle_maps` (Grade B) closes the jurisdiction rule by giving the citizen a published route from a property's location to its circle. The cell therefore depends on the C claim, and the cell note says so in terms. That disclosure is what makes the `stated` state honest rather than flattering.

`claim_hyderabad_ptax_head_office_contacts` is supporting, not load-bearing: a head office address, helpline and switchboard is a route to the agency, not to the deciding role, and the claim itself records that at least one row of the officers table showed a placeholder rather than a name. On its own it would be `mentioned`. Nothing in the cell rests on it alone.

### 7. `after-submission` cell accepted at `stated` — expectation `property-tax-payment`, `/cells/after-submission`

**Severity:** note

**Required:** Section 8: `after-submission` is `stated` only when the evidence identifies something the citizen sees after submitting — a status page, tracker, acknowledgement, receipt, rejection reason or downloadable result. Steps at or before submission, including payment itself, are not after-submission evidence. Section 16 forbids paying or querying real case data.

**Observed:** The cell holds. `claim_hyderabad_ptax_public_receipt_route` (Grade B, `verified`, direct observation of a public interface) identifies a published Property Tax Payment Receipts route reachable without login that takes a property tax identification number or a registered mobile number and produces a downloadable receipt. A receipt is named in the definition, and the route sits strictly after payment, so the section 8 exclusion for steps at or before submission does not bite.

The route was read and not exercised. That is required by section 16, since exercising it would mean entering a real property identifier and retrieving real case data, and it does not defeat the cell: the definition asks the evidence to *identify* a visible post-submission surface, and the surface, its input fields, its action and its own scope notice were all directly observed. The claim is correctly confined to that, stating expressly that nothing is asserted about what the route returns.

On whether the 1 April 2016 scope limit undercuts the cell: it does not, though it narrows it, and the narrowing is properly recorded. This scenario is the current year's tax paid by the municipal payment route, online portal first — a payment falling squarely inside the covered window, so for the scenario's primary route the receipt surface applies. The limit excludes counter payments and pre-2016 online payments, and the scenario admits a counter or bank route as its secondary path; for an owner on that path no receipt route is named. That is a genuine coverage gap, and the cell note states it in full rather than smoothing it over. A scope limit that leaves the primary route covered and is disclosed on the claim and in the cell note is a limitation on the cell, not a defeater of it.

### 8. `eligibility` cell accepted at `stated` — expectation `property-tax-payment`, `/cells/eligibility`

**Severity:** note

**Required:** Section 8: `eligibility` is `stated` when the evidence gives a rule that decides who qualifies or which route applies.

**Observed:** The cell holds. `claim_hyderabad_ptax_ptin_or_mobile_required` gives a usable entry rule that decides which route an owner takes — a property tax identification number, or the mobile number registered against the property, with a published Know Your PTI Number route for an owner holding neither. The channel evidence gives the actionable set of routes by which the tax may be paid. Both are Grade B and `verified`.

Finding 1 changes the records the cell cites without changing its state: `/cells/eligibility/claimIds` is rewritten to name the four split channel claims plus the amended `claim_hyderabad_ptax_thirty_circles`, in place of the deleted compound record. The cell's note remains accurate against the split records and is left unchanged.

### 9. `Unknown` claims correctly quarantined from the grid — three records

**Severity:** note

**Required:** Section 8: only `verified` or `partial` claims may support `stated` or `mentioned`; a boundary statement or `Unknown` claim records a limitation, not a positive cell value. Section 4 admits an `Unknown` grade where the uncertainty itself matters to the journey. Section 7 requires a source for every non-`Unknown` claim.

**Observed:** Correct throughout. `claim_hyderabad_ptax_residential_amount_unknown`, `claim_hyderabad_ptax_due_date_unknown` and `claim_hyderabad_ptax_documents_for_payment_unknown` each carry grade `Unknown`, status `unknown`, empty `sourceIds` and basis `inference`, and none is cited by any expectation cell. Basis `inference` is right under section 5: each records a conclusion drawn from the absence of a value across reviewed routes, not something a page directly shows. Each states in its notes that it is not login-related, which matters because section 8's lint item 6 guards against overclaiming across an authentication boundary and these are not such cases — the payment route is public, and what stops it being exercised is the section 16 safety boundary, not authentication. That also explains correctly why no boundary claim appears in this ledger. Every claim carrying a non-`Unknown` grade cites at least one source, satisfying section 7.

### 10. Evidence grades check clean against the section 4 table

**Severity:** note

**Required:** Section 4 grade table; section 8 lint items 3 and 4 (Grade B on secondary sources; Grade C on observed current official forms).

**Observed:** The four Grade B claims all rest on current official service pages or on direct current observation of a public official interface, which section 4 places at B and section 1's public-workflow rule confirms should be B and not E. No secondary source is graded B; there are no secondary or citizen sources in the ledger at all, so no quarantine question arises. The two Grade C claims rest on visibly outdated official material — the 2008 notification, eighteen years old at the access date and itself only a gist reciting a gazette notification, which is indirect and incomplete as well as old; and the 2013 charter. Neither C sits on an observed current official form, so lint item 4 is not tripped. Both C sources record the date and the limitation as section 4 requires.

### 11. Archive snapshots recorded but not captured at access time — all six sources

**Severity:** note

**Required:** Section 11 asks for an archive snapshot captured at access time, with the snapshot URL recorded on the source; section 14 requires a Wayback snapshot or a documented archival failure.

**Observed:** Every source records a Wayback snapshot URL with its date, and every source states plainly that the snapshot is pre-existing and that no new capture was pushed from this run. That is a documented deviation rather than a silent one, and section 14 is satisfied by the presence of a snapshot. Two gaps are worth stating rather than correcting. The snapshot for `source_hyderabad_ptax_rate_notification_2008` dates from 2019-06-14, seven years before the access date, so it evidences that URL's earlier content and not the state observed on 2026-09-06; the underlying document is a fixed 2008 PDF, which limits the practical exposure. The four remaining snapshots run from four to five months before the access date. No correction is proposed: the auditor cannot capture snapshots and must not invent evidence to complete a record. The schema forbids additional properties on a source, so recording snapshots in `notes` is the only available placement and is not a defect.

### 12. Source date quality — two portal sources

**Severity:** note

**Required:** Section 8 lint item 5: missing `publishedAt` without a visible-date note, or a stale or undated source without a stated limitation.

**Observed:** `source_hyderabad_ptax_payment_portal` and `source_hyderabad_ptax_receipt_route` carry no `publishedAt`, and their visible-date evidence is a copyright year of 2026 rather than an explicit last-updated date. That is a visible date recorded from the page and is accepted as satisfying the note requirement, though it is weaker than the treatment given to `source_hyderabad_ptax_ghmc_page` and `source_hyderabad_ptax_key_contacts`, which both state in terms that the page shows no visible last-updated date. Both dated sources carry `publishedAt` and a stated limitation. No duplicate source URL and access-date pair exists; the two portal sources sit at different URLs.

### 13. Citation gate — portal root URL accepted as a specific page

**Severity:** note

**Required:** Section 7: citations must resolve to specific pages; a department homepage is a general-site reference and claims resting on it are Grade C, never presented as a specific source.

**Observed:** `source_hyderabad_ptax_payment_portal` cites the root of the online payments portal, `https://onlinepayments.ghmc.gov.in/`. This is not the department homepage — that would be `ghmc.gov.in` — but the landing page of a service portal, which section 4 places at Grade B in its own right, and the two claims resting on it describe what that page itself displays: the property tax payment form's input requirements and the linked zone, circle and ward maps. The citation resolves to the specific page observed, so the gate is green. All other citations point at specific service pages or documents. Every claim's `sourceIds` and every cell's `claimIds` resolve to existing records; every source is used by at least one claim; jurisdiction strings on all claims match `meta.jurisdiction`; all dates are ISO and consistent with `asOf`; and every claim is tagged to the manifest-declared primary scenario, which is the ledger's only scenario.

### 14. Scenario identifier and label use different terms for the same identifier

**Severity:** note

**Required:** Section 2 forbids scenario aliases and fixes branch and scenario IDs for stability.

**Observed:** The scenario ID says `known_sas_pid` while the label, summary, `meta.title` and every claim say PTIN or property tax identification number. These name the same identifier. This is not an alias in the section 2 sense — the ledger uses exactly one scenario ID throughout and it matches the manifest — and the ID is manifest-declared, so it must not be changed for cosmetic consistency. Recorded for transparency only; no correction.

### 15. Grid-only scope confirmed

**Severity:** note

**Observed:** `nodes`, `edges`, `roadblocks` and `journeys` are all empty and `pathNodeIds` is empty, consistent with the manifest's `grid-only` mode and with the `meta.disclaimer`. There are consequently no `researchedNoSourceFound` markers to verify against public-route searches under section 6, no edge `claimId` integrity to check, and no portal or route observations to check under section 10. The ledger is schema-valid against `benchmark/schemas/ledger.json`: all nine top-level keys are present, `meta` carries exactly its six required fields, every ID matches the required pattern, and the `Unknown`-grade claims are the only ones with empty `sourceIds`, which the schema's conditional permits.

---

## Verdict

Accepted cell states after corrections: **cost `mentioned`; documents `absent`; eligibility `stated`; time `mentioned`; owner `stated`; after-submission `stated`.**

**Stated count: 3 of 6.**

One cell state is changed from the sidecar as filed (`documents`, `mentioned` to `absent`); the stated count is unaffected by that change. Corrections proposed: 10 — one record deletion, four record additions, one claim text amendment, and four expectation-sidecar field changes.
