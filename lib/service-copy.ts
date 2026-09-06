import serviceManifest from '../ledger/services.manifest.json' with { type: 'json' };

export type ServiceGuide = {
  terms: Array<{ term: string; definition: string }>;
  processSummary: string;
};

export const serviceGuides: Record<string, ServiceGuide> = {
  bescom: {
    terms: [
      { term: 'EPID', definition: 'Electronic Property Identification number used to identify a Bengaluru property.' },
      { term: 'e-Khata', definition: 'Bengaluru’s digital municipal property record.' },
      { term: 'Mutation', definition: 'The municipal update that records a change in property ownership.' },
      { term: 'NOC', definition: 'No Objection Certificate — a letter saying the named party does not object.' },
    ],
    processSummary: 'This service changes the name on an existing BESCOM electricity account after a sale, tenancy, inheritance, or similar change. The published route involves checking the municipal property record, using an authorised BESCOM name-change route, and keeping the request ID if submission succeeds; approval and EPID matching can still remain unclear.',
  },
  khata: {
    terms: [
      { term: 'Khata', definition: 'The municipal account that links a Bengaluru property to its owner and property-tax record.' },
      { term: 'e-Khata', definition: 'The digital version of that municipal property record.' },
      { term: 'Mutation', definition: 'The municipal update that records a sale, inheritance, or other ownership change.' },
      { term: 'EPID', definition: 'Electronic Property Identification number used to search for a property.' },
      { term: 'e-Aasthi', definition: 'The public municipal portal used for property searches, e-Khata and mutation information.' },
    ],
    processSummary: 'A khata transfer updates Bengaluru’s municipal property record after a sale or succession. The public route involves finding the property in e-Aasthi, reviewing deed and eKYC inputs, checking mutation and status screens, and, where shown, reaching the transfer-payment step. Seeing those screens is not proof that a transfer is complete.',
  },
  'property-tax': {
    terms: [
      { term: 'Mutation', definition: 'The municipal process for recording a change of property owner.' },
      { term: 'ARO', definition: 'Assistant Revenue Officer — the local revenue official named in correction and recovery routes.' },
      { term: 'Form 24', definition: 'The published order template used after a property transfer has been verified.' },
      { term: 'EC', definition: 'Encumbrance Certificate — a record of registered transactions affecting a property.' },
    ],
    processSummary: 'This service updates the name connected to a property-tax record after a sale or succession. Published material points to identifying the transfer type, assembling the listed sale or succession evidence, using the authorised mutation route, and allowing for notice before the register changes. The current form route and case-specific acceptance still need confirmation.',
  },
  'water-connection': {
    terms: [
      { term: 'BWSSB', definition: 'Bangalore Water Supply and Sewerage Board.' },
      { term: 'UGD', definition: 'Underground drainage, the sewer connection handled alongside water service.' },
      { term: 'RR number', definition: 'The service-account number created for a connection.' },
      { term: 'Demand note', definition: 'The board’s notice stating the amount to be paid before the next stage.' },
      { term: 'OTP', definition: 'One-time password sent to a mobile number for sign-in or verification.' },
    ],
    processSummary: 'A new BWSSB water or UGD connection is for a property that needs water or sewer service. Public material shows a mobile-OTP entry, application purchase, form and document stages, review and inspection, demand and payment, and a status lookup. No live application was created in this research.',
  },
  'birth-certificate': {
    terms: [
      { term: 'Registrar', definition: 'The official responsible for recording births in the area where the event occurred.' },
      { term: 'Delayed registration', definition: 'Registering a birth after the normal reporting period has passed.' },
      { term: 'Certified copy', definition: 'An official copy issued from the registered birth record.' },
      { term: 'Name inclusion', definition: 'Adding a child’s name to a birth record that was first registered without it.' },
    ],
    processSummary: 'A birth certificate is issued from a registered birth record. A family may need an initial certificate, a certified copy, name inclusion, correction, or delayed registration; the public record points to the correct Registrar, a record search, and a separate route for each of those needs. The available sources do not establish one complete live municipal flow.',
  },
  'water-account': {
    terms: [
      { term: 'BWSSB', definition: 'Bangalore Water Supply and Sewerage Board.' },
      { term: 'RR number', definition: 'The service-account number attached to an existing water connection.' },
      { term: 'Jaladhare', definition: 'BWSSB’s public online service entry.' },
      { term: 'OTP', definition: 'One-time password sent to a mobile number for sign-in or verification.' },
    ],
    processSummary: 'A BWSSB water-account transfer is for someone who needs an existing connection recorded in a new name. The public Jaladhare page can be inspected, but no unauthenticated name-change control was found; BWSSB must confirm the current route, documents, charges and outcome before any case data is sent.',
  },
  'new-electricity': {
    terms: [
      { term: 'BESCOM', definition: 'Bangalore Electricity Supply Company, the electricity distributor for Bengaluru.' },
      { term: 'JVS', definition: 'Janasnehi Vidhyuth Sevegalu, a BESCOM service route for eligible applications.' },
      { term: 'Load', definition: 'The amount of electricity capacity requested for the premises.' },
      { term: 'Tariff', definition: 'The billing category applied to the connection’s type of use.' },
      { term: 'Demand', definition: 'The utility’s payment request after it reviews the application.' },
    ],
    processSummary: 'A new BESCOM connection is for a property that does not yet have the required electricity supply. Public pages indicate choosing the applicable route, reviewing the blank application stages, checking eligibility and document leads, and then reaching demand, payment, tracking and supply. No case was submitted, so the exact checklist and outcome remain case-specific.',
  },
  'death-certificate': {
    terms: [
      { term: 'Registrar', definition: 'The official responsible for recording deaths in the area where the event occurred.' },
      { term: 'e-JanMa', definition: 'Karnataka’s public birth-and-death registration portal.' },
      { term: 'Delayed registration', definition: 'Registering a death after the normal reporting period has passed.' },
      { term: 'Additional copy', definition: 'Another official copy issued from an existing registered death record.' },
    ],
    processSummary: 'A death certificate is issued from a registered death record. A family may need first registration, an existing copy, a correction, an additional copy, or help with a delayed or missing record; the public route begins with the Birth & Death service entry, identifies the request type and Registrar, and uses e-JanMa tools where applicable. No case-specific result is inferred.',
  },
  lpg: {
    terms: [
      { term: 'OMC', definition: 'Oil Marketing Company — the company responsible for the LPG connection.' },
      { term: 'Distributor', definition: 'The local agency that holds the consumer record and supplies cylinders.' },
      { term: 'Subscription Voucher', definition: 'The original connection record referred to in transfer guidance.' },
      { term: 'TTV / CTA Out', definition: 'The transfer-out record issued when moving from one distributor area to another.' },
      { term: 'TSV / CTA In', definition: 'The receiving distributor’s transfer-in record for the new consumer account.' },
    ],
    processSummary: 'An LPG connection transfer updates distributor records when a household or address changes. The published material first distinguishes the transfer branch, then identifies the proof or voucher packet, transfer-out and transfer-in actions where needed, distributor verification, and the new or updated consumer record. Current fees, timing and approval remain unknown.',
  },
  marriage: {
    terms: [
      { term: 'HMA', definition: 'Hindu Marriage Act, one legal framework referenced for marriage registration.' },
      { term: 'SMA', definition: 'Special Marriage Act, which includes notice and solemnization routes.' },
      { term: 'SRO', definition: 'Sub-Registrar Office, the local registration office referenced by the public route.' },
      { term: 'Solemnization', definition: 'The legal ceremony that completes a marriage under the applicable route.' },
      { term: 'Kaveri 2.0', definition: 'Karnataka’s public registration-services portal.' },
    ],
    processSummary: 'Marriage registration creates an official marriage record and certificate through the applicable legal route. Public material first distinguishes HMA registration from the SMA notice and solemnization route, then points to Kaveri 2.0 and Registrar review before a certificate outcome. No login, booking, payment or submission was attempted.',
  },
  'trade-license': {
    terms: [
      { term: 'Trade licence', definition: 'Municipal permission to operate a covered business activity at a premises.' },
      { term: 'Renewal', definition: 'Extending an existing licence for another permitted period.' },
      { term: 'Jurisdiction', definition: 'The municipal authority and area responsible for the business location.' },
      { term: 'OTP', definition: 'One-time password used to enter or verify the online application route.' },
    ],
    processSummary: 'A trade licence is municipal permission to operate a covered business, and an applicant may need either a new licence or a renewal. Public material points to confirming the municipal category, opening the new or renewal route, preparing document leads, completing OTP and payment stages, and then municipal inspection and review before a licence result. No application was submitted.',
  },
  'building-plan': {
    terms: [
      { term: 'BPAS', definition: 'Building Plan Approval System, the public entry for plan-permission work.' },
      { term: 'DCR', definition: 'Development Control Regulations used when a plan is checked against planning rules.' },
      { term: 'NOC', definition: 'No Objection Certificate from another authority when a proposal requires one.' },
      { term: 'Sakala', definition: 'Karnataka’s time-bound public-service framework, named as one submission route.' },
      { term: 'Registered architect', definition: 'The licensed professional identified in the published application route.' },
    ],
    processSummary: 'Building plan approval is permission to build or alter a property under the responsible planning authority. Public material starts with confirming the authority and route, then points to an architect-led or manual route, plans and documents, scrutiny, inspection, fees and a sanction or licence result. No project-specific route or approval was tested.',
  },
  passport: {
    terms: [
      { term: 'Passport Seva', definition: 'The Ministry of External Affairs public passport service and guidance portal.' },
      { term: 'PSK', definition: 'Passport Seva Kendra, the service centre named for an appointment and document visit.' },
      { term: 'RPO', definition: 'Regional Passport Office, the office selected by residence and named for Bengaluru.' },
      { term: 'ARN', definition: 'Application Reference Number generated after a completed passport application is submitted.' },
      { term: 'Non-ECR', definition: 'A passport-status category for which the published adult normal-route table names supporting documentation when applicable.' },
    ],
    processSummary: 'A fresh adult ordinary-passport route starts with the fresh category and public document guidance, then moves through registration, an account-bound application, payment and an appointment before a PSK visit. Public material gives a Rs.2,500 fee, pre-verification dispatch timing and an ARN after submission, but booking and case outcomes remain account-bound. This desk research used public pages only; no login, submission, payment or personal data was used.',
  },
  'aadhaar-address-update': {
    terms: [
      { term: 'myAadhaar', definition: 'UIDAI’s portal named for the online address-update route.' },
      { term: 'Proof of address', definition: 'A current, verifiable document in the Aadhaar holder’s name showing an Indian address.' },
      { term: 'SRN', definition: 'Service Request Number shown after a successful online address-update submission.' },
      { term: 'Demographic update', definition: 'UIDAI’s update category that includes an address change.' },
      { term: 'Document update', definition: 'A separate UIDAI service for submitting proof documents in support of details already enrolled.' },
    ],
    processSummary: 'An Aadhaar holder using the online own-document route needs a registered mobile number and a current proof of address in that person’s name. Published material gives a ₹75 fee, up to 30 days, later UIDAI quality review, and an SRN, invoice and status route after submission. This desk research used public pages only; no login, submission, payment or personal data was used.',
  },
  'property-tax-payment': {
    terms: [
      { term: 'Tax demand', definition: 'The property-tax amount the public service says the portal displays before payment.' },
      { term: 'Payment gateway', definition: 'The integrated online payment service named in the municipal property-tax route.' },
      { term: 'Payment confirmation', definition: 'The real-time confirmation the service says it provides after payment.' },
      { term: 'Receipt', definition: 'The record the service says it generates after payment; the public print route asks for an application number.' },
      { term: 'Failed transaction', definition: 'A policy-described case where an amount is debited but the online transaction fails through network or technical error.' },
    ],
    processSummary: 'For a property owner within Bengaluru City Corporation limits, the public route says the portal displays a tax demand, uses an integrated payment gateway, then gives real-time confirmation and a receipt. The City Corporation-added service fee is zero beyond statutory tax, while any bank or gateway charge remains unspecified. This desk research used public pages only; no login, submission, payment or personal data was used.',
  },
  'sale-deed-registration': {
    terms: [
      { term: 'Kaveri 2.0', definition: 'Karnataka’s registration system named for sale-of-immovable-property document registration.' },
      { term: 'Sub-Registrar Office', definition: 'The registration office type operated by the Karnataka Registration and Stamps Department.' },
      { term: 'Registration Act', definition: 'The law whose section 17(1)(b) sets the published registration rule for qualifying property instruments.' },
      { term: 'Stamp fee', definition: 'A charge Kaveri documentation says the system can calculate automatically.' },
      { term: 'Bhoomi', definition: 'A Karnataka land-record system identified as integrated with Kaveri 2.0.' },
    ],
    processSummary: 'A Bengaluru residential sale deed is a property-registration transaction under the Registration and Stamps Department, with District Registrar and Sub-Registrar offices in the published structure. Kaveri documentation names sale registration, fee calculation and stage messages, but the current public checklist, amount, booking route and post-submission result remain unknown. This desk research used public pages only; no login, submission, payment or personal data was used.',
  },
  'occupancy-certificate': {
    terms: [
      { term: 'BPAS', definition: 'Building Plan Approval System, the public Greater Bengaluru Authority construction-permit portal.' },
      { term: 'e-Khata', definition: 'The municipal digital property record that BPAS says is mandatory for occupancy-certificate applications.' },
      { term: 'Schedule VIII', definition: 'The form the BBMP service sheet names for an occupancy-certificate request.' },
      { term: 'Compounding Fee', definition: 'The charge named in the service sheet when the published procedure issues a demand note, without an amount on that sheet.' },
      { term: 'As-built drawings', definition: 'Drawings of completed construction listed among occupancy-certificate enclosures.' },
    ],
    processSummary: 'A property owner with plan sanction can use the published occupancy-certificate route, which names Schedule VIII, Khata records, tax receipt, as-built drawings and photographs as enclosures. The service sheet describes online filing, inspection, verification, a demand note where applicable and certificate issue; BPAS also says e-Khata is mandatory. This desk research used public pages only; no login, submission, payment or personal data was used.',
  },
};

for (const service of serviceManifest.services.filter((service) => service.published)) {
  if (!serviceGuides[service.id]) throw new Error(`Published service ${service.id} is missing guide copy.`);
}
