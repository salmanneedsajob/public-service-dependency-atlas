# Audit — Mumbai birth certificate (copy of a registered birth)

- **Service:** `birth-certificate`
- **Jurisdiction:** Mumbai, Maharashtra, India
- **Primary scenario:** `scenario_ind32_birth_copy_workflow`
- **Audit date:** 2026-09-06
- **Benchmark version:** 0.1
- **Mode:** grid-only (no nodes, edges, roadblocks, journeys or portal sidecar; their absence is not a finding)
- **Inputs:** integrated ledger, expectations sidecar, `benchmark/schemas/ledger.json`, `benchmark/PROTOCOL.md`, `benchmark/schemas/corrections.json`, the manifest entry. Nothing else was read; no source was re-opened.

---

## Findings

### F1 — correction — `claim_mumbai_birth_ward_list_published` — compound claim

**Protocol requires:** section 1, "one claim asserts one checkable thing"; section 8 pre-audit lint item 1 flags compound or list claims; section 13 permits the auditor to split them.

**Observed:** the claim text joins two independently checkable facts with "and": that BMC publishes a ward list naming its twenty-four wards, and that the same page rendered a portal runtime error with an exception ID on the access date. These are a publication fact and a failure observation; one can hold while the other does not. The claim is cited by no expectation cell, so the split is mechanically safe.

**Correction issued:** `/text` narrowed to the publication fact, and a new atomic claim `claim_mumbai_birth_ward_list_runtime_error` added for the runtime error. Both facts are already recorded verbatim in `source_mumbai_birth_ward_list.notes`, so no evidence is created by the split. The new claim keeps grade B, which is what section 1 and the section 4 table prescribe for direct current observation of a public official interface.

### F2 — correction — `source_mumbai_birth_ph_faq` — snapshot URL does not resolve

**Protocol requires:** section 11, "Record the snapshot URL with the source"; section 14 requires a Wayback snapshot or a documented archival failure for every public source.

**Observed:** the notes record the snapshot as `https://web.archive.org/web/20240616125010/ for this file`. The URL is truncated after the timestamp and carries no target, so it does not resolve to the snapshot the note asserts was found.

**Correction issued:** `/notes` rewritten so the recorded snapshot URL is the resolvable Wayback form of the timestamp already recorded plus this source's own URL. This is a change of expression, not of evidence: no new snapshot, date or finding is asserted.

### F3 — correction — `source_mumbai_birth_portal_apply_faq` — snapshot URL does not resolve

**Protocol requires:** section 11, as above.

**Observed:** the same truncation, `https://web.archive.org/web/20220307174225/ for this route`.

**Correction issued:** as in F2.

### F4 — correction — all five sources — no archive snapshot captured at access time (no mechanical correction available)

**Protocol requires:** section 11, "At access time, capture an archive snapshot for every public source used… If capture fails, record the access date, the failure, and a limitation."

**Observed:** every source records "no new capture was pushed from this run" and leans on a pre-existing snapshot. Two of those snapshots cannot evidence what this run observed:

- `source_mumbai_birth_ward_list` — the page's own footer gives a last-updated date of 2026-04-16, but the recorded snapshot is 2022-08-05, four years older than the content observed; the portal runtime error observed on 2026-09-06 is archived nowhere.
- `source_mumbai_birth_quicklink_error` — the recorded snapshot is 2025-12-28, so the HTTP 403 observed on 2026-09-06, which is the run's single strongest legibility finding, rests on an unarchived observation.

The ledger states the fact of no new capture but does not record it as an archival failure with a limitation, and `meta.disclaimer` does not carry it. **No structured correction is issued** because the section 13 pointer contract has no `recordType` for `meta`, and rewriting five source notes would not put the limitation where a reader of the disclaimer would find it. Per section 13 this is emitted as a stated limitation: *the run captured no archive snapshot at access time, and the observed 403 and portal runtime error are not archived.* It does not affect any cell state, because no cell rests on either observation.

### F5 — note — `claim_mumbai_birth_fee_post_2016_six_rupees` / `claim_mumbai_birth_fee_pre_2016_first_copy_free` — the fee bands are not exhaustive at their boundary

**Protocol requires:** section 8, `cost` is `stated` when the evidence gives an amount a citizen pays or an actionable fee schedule.

**Observed:** as recorded, one band is "events occurring after 1 January 2016" and the other "events occurring before 31 December 2015". Read literally, births on 31 December 2015 and on 1 January 2016 fall in neither band. This is a two-day edge case in the published schedule, not a defect in the ledger's reading of it, and it does not defeat `stated`: for every other event date the schedule gives an amount the citizen can select by a fact they already know. No correction.

### F6 — note — `cost` cell — grade C and undated currency, accepted

**Protocol requires:** section 8, "`stated` means a Grade A, B, or C claim gives a value a citizen can act on"; section 3, an explicit zero is a stated value.

**Observed:** the whole schedule rests on `source_mumbai_birth_ph_faq`, undated on its face and dated 2018 only by file metadata, correctly graded C with the limitation stated. Grade C is expressly admitted by the `stated` definition, so undatedness is not a downgrade trigger — it is the condition grade C exists to describe. The free first copy to relatives is correctly recorded as a stated value under section 3, not as an absence. The currency doubt is carried where section 8 requires it, in `claim_mumbai_birth_current_fee_currency_unknown` (grade Unknown, status `unknown`, basis `inference`, no sources), which is **not** cited in the cell — the rule that an `Unknown` claim records only a limitation is respected. The live application FAQ's silence on amount is recorded separately in `claim_mumbai_birth_fee_topic_without_amount`, also correctly kept out of the cell. `cost` = **stated** upheld.

### F7 — note — `claim_mumbai_birth_fee_pre_2016_non_relative` — atomicity strain, not split

**Observed:** the claim carries two rates (Rs. 20 plus Rs. 2 search charges for a first copy; Rs. 30 per further copy). This is a list, but it is one published schedule row for one applicant class, that class is outside the scoped applicant (the scenario's parent is a relative), and no cell value turns on either figure. Splitting would add records without adding checkability. No correction.

### F8 — note — `claim_mumbai_birth_obtain_at_ward_cfc` — bundles a route rule and opening hours, cited in two cells

**Observed:** the claim asserts where the certificate is obtained, on what precondition, and the counter hours; it is cited by both `time` and `owner`. It is compound in the same weak sense as F7 — one FAQ answer — and both cell notes state precisely which half they rely on (`owner` on the ward-office route, `time` on the hours), so the citation remains traceable without a split. No correction.

### F9 — note — `claim_mumbai_birth_issued_by_registrar_of_place` — the consequence clause reads as derived

**Protocol requires:** section 5, `inference` records a conclusion drawn from a source; a source grade does not turn an inference into an observation.

**Observed:** the text runs "…issued by the Registrar of the local government institution of the place where the event occurred, **so** a certificate cannot be obtained in Mumbai for an event that happened outside Mumbai." The connective reads like a derivation, which would make the basis `mixed` rather than `observation`. The claim expressly attributes both halves to the FAQ, and the section 12 input boundary forbids me re-opening the source to settle it, so I will not downgrade a basis on the strength of a connective. Recorded as a limitation for the next revision. No correction.

### F10 — note — `claim_mumbai_birth_apply_at_cfc_or_online` — applicant class in the quoted proviso

**Observed:** the FAQ's proviso is "provided the applicant's birth is already registered with BMC", i.e. phrased for a person applying for their own certificate, while the primary scenario is a parent applying for a child's. The substantive rule — the birth must already be registered with BMC — is indifferent to which of the two applies, and the fee schedule addresses "relatives", which covers a parent. The ledger's note that the proviso "matches this scenario's trigger" is slightly stronger than the quoted wording, but the eligibility value survives. No correction.

### F11 — note — `documents` cell — the second limb of the section 8 definition tested, `mentioned` upheld

**Protocol requires:** section 8, `documents` is `stated` when the evidence gives an actionable document list **or** names a concrete document with a requirement to submit, provide, upload, produce or attach it.

**Observed:** `claim_mumbai_birth_documents_unnamed` does name one thing with a requirement to submit it — "the duly signed application form" — and `claim_mumbai_birth_form_download_route` gives a route to obtain that form. On the letter of the second limb this is arguable. I uphold `mentioned`: the application form is the instrument of the application itself, not a document the citizen must produce in support of it, and reading the limb to cover it would make the cell `stated` for essentially every application-based service and drain it of discriminating power. Every reviewed route otherwise says "required documents", "necessary documents" or "the prescribed format" and names nothing. The unreadable scanned form is correctly recorded as a limit on this run's reach rather than as a finding about the form. Four searched routes are recorded as section 9 requires. `documents` = **mentioned** upheld.

### F12 — note — `time` cell — tested upward, `mentioned` upheld

**Protocol requires:** section 8, `time` is `stated` when the evidence gives an actionable duration, deadline, processing period or service-level target.

**Observed:** the two candidate figures are counter hours (8 a.m. to 8 p.m. on working days) and the delivery answer ("within the days stipulated by the Department of Posts"). The second states no number at all. The first is a figure, but it is none of the four things the `stated` limb enumerates: it tells the citizen when the counter is open, not how long the service takes. Having a figure is necessary under the `mentioned` limb, not sufficient under the `stated` limb. I decline to correct this cell upward. The cell note already says exactly this, and records the Citizen Charter route as searched without a service-standards table. `time` = **mentioned** upheld.

### F13 — note — `owner` cell — `stated` upheld on the jurisdiction-rule limb

**Protocol requires:** section 8, `owner` is `stated` when the evidence lets a citizen identify the office, officer or operational role that holds or decides the case, **including a specific office list, a designation tied to a jurisdiction rule, or a contact route for that role**; a statutory designation or general agency name **alone** is `mentioned`.

**Observed:** the definition is disjunctive, and this cell satisfies its second limb squarely. "Registrar of the local government institution of the place where the event occurred" is a designation bound to a jurisdiction rule, not a bare statutory title; `claim_mumbai_birth_registered_in_concerned_ward` fixes the holding office as the ward office of the area of the event; `claim_mumbai_birth_obtain_at_ward_cfc` fixes the counter within it. The designation is therefore not "alone". That no individual officer is named and no contact route is published does not defeat the cell, because the definition does not require them once the jurisdiction limb is met — and the cell note states that gap honestly rather than papering over it. The note is also right to keep `claim_mumbai_birth_faq_signed_by_eho` out of the cell: the Executive Health Officer signs the guidance and is not shown to decide an application. I record, without correcting, that the cell note's assertion about the ward list resting on `claim_mumbai_birth_ward_list_published` is uncited; section 9 requires `claimIds` for the cell's actionable value, which the four cited claims supply, and the ward-list reference is a limitation sentence rather than the value. `owner` = **stated** upheld.

### F14 — note — `after-submission` cell — `stated` upheld on a single claim, counter route only

**Protocol requires:** section 8, `after-submission` is `stated` only when the evidence identifies something the citizen sees after submitting — status page, tracker, acknowledgement, **receipt**, rejection reason or downloadable result; a step at or before submission, including payment, document presentation and the act of submission, does not count.

**Observed:** `claim_mumbai_birth_cfc_issues_certificate_and_receipt` splits cleanly across that line. Its first half — the agent collects fees and documents — is excluded submission-side matter. Its second half, "as a final step prints and issues the certificates and a fee receipt to the applicant", is a receipt and a result handed over after the act of submission, and "receipt" is enumerated in the definition, so a fee receipt cannot simultaneously be disqualified as payment. Single-claim support is not a defect: the definition sets a content test, not a corroboration count, and the claim is grade B and `verified`, both of which section 8 admits. The cell note's two deliberate exclusions are correctly reasoned — a payment transaction id is a submission-time artefact, and the applicant's own printable form is not an acknowledgement from the corporation. The evidence covers the counter route only; the online surface is behind login and the corporation's own entry point to it returned HTTP 403, so the counter route is the operative one for this scenario, which scopes itself "online where offered and counter route otherwise". `after-submission` = **stated** upheld.

### F15 — note — `after-submission` cell note asserts two surfaces no claim records

**Observed:** the note excludes "the transaction id generated on online payment" and "the printable version of the form that appears after submission". Neither surface appears in any claim, so a reader cannot check that either exists or that the exclusion was correctly reasoned. The exclusions are conservative — both would have pushed toward, not away from, `stated` — so the cell state is unaffected. No correction; recorded so the next revision can carry these as claims or drop them from the note.

### F16 — note — `source_mumbai_birth_quicklink_error` — no `publishedAt`, no explicit visible-date note

**Protocol requires:** section 8 lint item 5, source-date quality: missing `publishedAt` without a visible-date note.

**Observed:** the record has no `publishedAt` and its notes do not say in terms that the page shows no date. The record is a timestamped direct observation of an error response, which by nature carries no publication date, and `accessedAt` fixes its currency. Read strictly this is a lint hit; read against its purpose it is satisfied. Below the threshold for a correction.

### F17 — note — checks that came back clean

- **Schema.** Valid against `benchmark/schemas/ledger.json`: every `id` matches the required pattern; `meta` carries all six required keys and no others; `scenarios` is non-empty; the one claim graded `Unknown` (`claim_mumbai_birth_current_fee_currency_unknown`) is the only one with an empty `sourceIds`, which the conditional in the claim definition permits.
- **Reference integrity.** Every `sourceIds` entry resolves to a source in this ledger; every `scenarioIds` entry is `scenario_ind32_birth_copy_workflow`; every one of the twelve claim IDs cited across the six expectation cells resolves to a claim. `nodeIds`, `contradictsClaimIds` and `pathNodeIds` are empty throughout, consistent with grid-only mode.
- **Citation gate, section 7.** Every non-`Unknown` claim carries at least one source. No citation rests on a homepage or general-site reference: the five sources are a departmental FAQ PDF, a service page, an application FAQ route, a specific quick-link route and the ward list. The dead quick link is recorded as observed rather than replaced by a homepage, exactly as section 7 requires.
- **Dates and jurisdiction.** All dates are ISO. `meta.asOf`, every `accessedAt` and the audit date agree at 2026-09-06; no date is in the future of it; `publishedAt` precedes `accessedAt` wherever present. Every source and every claim carries jurisdiction text specific to Mumbai, Maharashtra, India, and every source records agency naming as displayed on the access date.
- **Grades against the section 4 table.** Grade B is used only for live official interfaces and direct current observation, never for secondary material; grade C is used for the undated FAQ PDF and the visibly outdated 2016 page, in both cases with the date and limitation stated; grade `Unknown` is used once, for a claim that exists because the uncertainty matters.
- **Login boundary, lint item 6.** `claim_mumbai_birth_online_surface_behind_login` is `partial`, basis `mixed` with the boundary explained in `notes` as section 5 demands, and is cited by no cell — the rule that a boundary statement records a limitation and not a positive cell value is respected. No other claim asserts anything about what lies past the login, and no cell value depends on the unentered portal surface.
- **Contradictions.** No contradiction link is missing. `claim_mumbai_birth_current_fee_currency_unknown` and `claim_mumbai_birth_fee_topic_without_amount` sit alongside the fee claims without conflicting with them: doubt about currency and silence about amount can both be true while the FAQ states Rs. 6. Adding a `contradictsClaimIds` link here would misrepresent the evidence, so none is proposed.
- **Excluded routes.** No cell is scored from delayed registration, name inclusion, correction, out-of-city or hospital-side registration evidence. `claim_mumbai_birth_issued_by_registrar_of_place` touches the out-of-city boundary, but the value it supplies to `eligibility` and `owner` is the in-scope half — that a Mumbai event is served by the Mumbai registrar. `claim_mumbai_birth_registered_in_concerned_ward` is a record-location rule, not a registration procedure step.
- **Section 9 form.** Both `mentioned` cells record searched routes; the four `stated` cells cite claim IDs with actionable-value notes. Empty `searchedRoutes` on a `stated` cell is permitted, so `cost`, `eligibility`, `owner` and `after-submission` are not faulted for it.

---

## Verdict

Accepted cell states: **cost = stated; documents = mentioned; eligibility = stated; time = mentioned; owner = stated; after-submission = stated. Stated count: 4 of 6.**

Corrections proposed: 4 (one claim text narrowed, one claim added by split, two source archive URLs made resolvable). Blocking findings: none. Stated limitation carried forward under F4: no archive snapshot was captured at access time, so the observed HTTP 403 and the ward-list portal runtime error are unarchived; and under F9, the derived-sounding consequence clause in `claim_mumbai_birth_issued_by_registrar_of_place` was not re-verified against its source within the section 12 input boundary.
