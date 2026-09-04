import { execFile } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const ledgerDirectory = join(projectRoot, 'ledger');
const handoffDirectory = join(projectRoot, 'research', 'handoffs');
const researchDirectory = join(projectRoot, 'research');
const reportPath = join(projectRoot, 'public', 'data', 'report.json');
const expectationTagsPath = join(projectRoot, 'report', 'expectation-tags.json');
const manifestPath = join(projectRoot, 'ledger', 'services.manifest.json');

const statuses = ['verified', 'partial', 'contested', 'unknown'];
const grades = ['A', 'B', 'C', 'D', 'E', 'F', 'Unknown'];
const expectationColumns = ['cost', 'documents', 'eligibility', 'time', 'owner', 'after-submission'];

const servicesManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const reportServices = servicesManifest.services.filter((service) => service.reportIncluded);
if (!reportServices.length) throw new Error('Services manifest has no reportIncluded services.');
const reportTitle = `Field notes from ${reportServices.length} services`;
const serviceNames = Object.fromEntries(reportServices.map((service) => [service.reportServiceId ?? service.id, service.title]));
const serviceHrefs = Object.fromEntries(reportServices.map((service) => [service.reportServiceId ?? service.id, service.href]));

const expectationRules = {
  cost: [
    /\bfees?\b/i,
    /\bcosts?\b/i,
    /\bcharges?\b/i,
    /\bpayments?\b/i,
    /\bpay(?:able|ment|ing|s|ed)?\b/i,
    /\bamounts?\b/i,
    /\bdeposits?\b/i,
    /\btariffs?\b/i,
    /\brefunds?\b/i,
    /\brupees?\b|₹/i,
  ],
  documents: [
    /\bdocuments?\b/i,
    /\battachments?\b/i,
    /\buploads?\b/i,
    /\b(?:identity|address|age|ownership|occupancy) proofs?\b/i,
    /\bsale deeds?\b|\bregistered deeds?\b/i,
    /\baffidavits?\b/i,
    /\bno[- ]objection certificates?\b|\bNOCs?\b/i,
    /\bconsent letters?\b/i,
    /\bphotographs?\b|\bphotos?\b/i,
    /\bAadhaar\b/i,
    /\bchecklists?\b/i,
  ],
  eligibility: [
    /\beligib(?:le|ility)\b/i,
    /\bapplicab(?:le|ility)\b/i,
    /\bqualif(?:y|ies|ied|ication|ications)\b/i,
    /\bwho (?:can|may|must) apply\b/i,
    /\bapplicant (?:must|may|can|is required|requirements?)\b/i,
    /\b(?:residence|residency|jurisdiction) requirements?\b/i,
    /\bservice areas?\b/i,
    /\bexemptions?\b/i,
    /\broute (?:applies|applicability|depends|branch)\b/i,
    /\b(?:same[- ]area|same[- ]town|out[- ]of[- ]town|outside[- ]town|within[- ]city)\b/i,
    /\b(?:title[- ]holder|occupier|tenant|consumer|successor) (?:may|can|must|is eligible|eligibility)\b/i,
  ],
  time: [
    /\bprocessing (?:time|period|timeline)\b/i,
    /\bturnaround (?:time|period)\b/i,
    /\bservice[- ]level (?:time|target|agreement)\b|\bSLA\b/i,
    /\bSakala\b/i,
    /\bdeadlines?\b/i,
    /\btime limits?\b|\btimelines?\b/i,
    /\bwithin \d+(?:\s*[–-]\s*\d+)?\s+(?:working\s+|calendar\s+)?(?:hours?|days?|weeks?|months?)\b/i,
    /\b\d+(?:\s*[–-]\s*\d+)?[- ]day (?:period|target|window|timeline)\b/i,
  ],
  owner: [
    /\bwho (?:decides|reviews|approves|sanctions|resolves)\b/i,
    /\bdecision[- ]makers?\b/i,
    /\bcompetent authorit(?:y|ies)\b/i,
    /\bdesignated officers?\b/i,
    /\b(?:chief |sub-?)?registrars?\b/i,
    /\bcommissioners?\b/i,
    /\b(?:assistant )?revenue officers?\b|\bAROs?\b/i,
    /\b(?:reviewed|approved|sanctioned|decided|verified) by\b/i,
    /\bpending[- ]with[- ]whom\b/i,
    /\bresponsible (?:agency|authority|department|office|officer)\b/i,
  ],
  'after-submission': [
    /\bafter (?:an? )?submission\b|\bpost[- ]submission\b/i,
    /\bapplication (?:numbers?|IDs?|status|tracking)\b/i,
    /\brequest (?:numbers?|IDs?|status|tracking)\b/i,
    /\bstatus (?:page|screen|route|lookup|tracking|tracker|updates?|remarks?)\b/i,
    /\btrack(?:ing|er|s|ed)?\b/i,
    /\backnowledg(?:e)?ments?\b/i,
    /\breceipts?\b/i,
    /\b(?:approval|rejection|return|review|inspection|decision|outcome) (?:status|result|notice|message|stage|process|handling)\b/i,
    /\b(?:certificate|licen[cs]e|order) (?:is |was |will be )?(?:issued|downloadable|available|delivered)\b/i,
    /\bgrievance|\bcomplaints?\b/i,
  ],
};

const expectationValueRules = {
  cost: [
    /(?:₹|Rs\.?|INR)\s*\d+(?:[,.]\d+)*/i,
    /\b\d+(?:[,.]\d+)*\s*(?:rupees?|INR)\b/i,
    /\b(?:fees?|charges?|costs?|deposits?|amounts?)\s*(?:is|are|of|at|:|=)?\s*(?:₹|Rs\.?|INR)?\s*\d+(?:[,.]\d+)*/i,
    /\b(?:published|official|current)?\s*(?:fees?|charges?|tariff) schedules?\b/i,
    /\bschedules? of (?:fees?|charges?)\b/i,
  ],
  time: [
    /\b\d+(?:\s*[–-]\s*\d+)?\s+(?:working\s+|calendar\s+)?(?:hours?|days?|weeks?|months?)\b/i,
    /\bpublished (?:service )?(?:timeline|time limit|processing period|Sakala target)\b/i,
  ],
  owner: [
    /\bAssistant Revenue Officers?\b/i,
    /\bMarriage Officers?\b/i,
    /\bSub[- ]Registrars?\b/i,
    /\b(?:Chief )?Registrars?(?: of Births and Deaths)?\b/i,
    /\bCommissioners?\b/i,
    /\b(?:Medical|Health|Revenue|Town Planning) Officers?\b/i,
    /\b(?:Assistant |Executive |Assistant Executive )?Engineers?\b/i,
    /\b(?:AROs?|SROs?)\b/i,
    /\bBBMP Revenue Department\b/i,
    /\bBBMP Health Department\b/i,
    /\bBESCOM (?:subdivision|office|officer)\b/i,
    /\bBWSSB (?:subdivision|office|officer)\b/i,
  ],
  'after-submission': [
    /\b(?:receives?|returns?|generates?|issues?|provides?|shows?|displays?|exposes?)\b[^.;]{0,80}\b(?:acknowledg(?:e)?ment|application number|request ID|receipt|status|certificate|licen[cs]e|rejection reason|rejection message)\b/i,
    /\b(?:acknowledg(?:e)?ment|application number|request ID|receipt|certificate|licen[cs]e)\b[^.;]{0,60}\b(?:issued|generated|received|downloadable|available|delivered|sent)\b/i,
    /\bstatus (?:page|screen|view|tracker|lookup)\b[^.;]{0,80}\b(?:shows?|displays?|exposes?|lists?|returns?|accepts?)\b/i,
    /\b(?:certificate|licen[cs]e|order) (?:is |was |will be )?(?:issued|downloadable|available|delivered)\b/i,
    /\b(?:rejection|return) (?:reason|message|notice|SMS)\b/i,
  ],
};

const documentListCuePatterns = [
  /\b(?:requires?|required|lists?|includes?|documents? (?:are|include))\b/i,
  /\bmust (?:submit|provide|upload|produce|attach)\b/i,
  /\bshould (?:submit|provide|upload|produce|attach)\b/i,
];

const concreteDocumentPatterns = [
  /\bAadhaar(?: card)?\b/i,
  /\bPAN(?: card)?\b/i,
  /\b(?:identity|address|age|ownership|occupancy) proofs?\b/i,
  /\b(?:sale|gift|partition|release|registered) deeds?\b/i,
  /\b(?:birth|death|marriage) certificates?\b/i,
  /\bno[- ]objection certificates?\b|\bNOCs?\b/i,
  /\baffidavits?\b/i,
  /\bconsent letters?\b/i,
  /\b(?:rent|rental|lease) agreements?\b/i,
  /\belectricity bills?\b/i,
  /\bproperty[- ]tax (?:receipts?|applications?|records?)\b/i,
  /\bencumbrance certificates?\b/i,
  /\bkhata (?:certificate|extract|record|document)s?\b/i,
  /\bphotographs?\b|\bphotos?\b/i,
  /\bsite plans?\b|\bground plans?\b|\belevations?\b|\bdrawings?\b/i,
  /\bKYC (?:form|documents?|proofs?)\b/i,
];

const eligibilityValuePatterns = [
  /\b(?:is|are) eligible\b/i,
  /\b(?:may|can) apply\b/i,
  /\bwho (?:can|may|must) apply\b/i,
  /\bapplicant must (?:be|have|hold|reside|own|occupy|provide)\b/i,
  /\bonly (?:an? |the )?(?:owner|occupier|resident|applicant|consumer|person|tenant|successor|title[- ]holder)[^.;]{0,60}\b(?:may|can|must|is eligible|are eligible)\b/i,
  /\b(?:same[- ]area|same[- ]town|out[- ]of[- ]town|outside[- ]town|within[- ]city)\b/i,
  /\b(?:route|branch) (?:applies|is required|is available) (?:if|when|to|for)\b/i,
  /\b(?:exempt|exemption applies|subject to an? exemption)\b/i,
  /\bif [^.;]{0,100}\b(?:route|branch) (?:applies|is required|is available)\b/i,
  /\b(?:ward number|service area)[^.;]{0,80}\bdetermines? (?:the )?(?:route|routing)\b/i,
];

const ownerDesignationPatterns = expectationValueRules.owner;
const ownerJurisdictionPatterns = [
  /\bjurisdiction\b/i,
  /\b(?:zone|ward|local area|service area|sub[- ]?division|district)\b/i,
  /\bwhere (?:the )?(?:birth|death|event|property|premises|marriage) (?:occurred|is located|was registered)\b/i,
  /\b(?:concerned|respective) (?:office|officer|registrar|ARO|SRO|sub[- ]?division)\b/i,
  /\bappointed for (?:the|that) (?:area|jurisdiction)\b/i,
];
const ownerContactRoutePatterns = [
  /\b(?:contact|call|email|telephone|phone|visit|approach)\b/i,
  /\b(?:apply|submit|file|report|appeal|give|directed?) (?:at|before|to|with)\b/i,
  /\bFind Your ARO\b/i,
  /\bcontact details?\b|\bbusiness hours?\b|\boffice address\b/i,
];
const ownerOfficeListCuePatterns = [
  /\b(?:office|offices|SRO|sub[- ]registrar offices?) list\b/i,
  /\blists? (?:the )?(?:offices|SROs|sub[- ]registrar offices?)\b/i,
];
const bengaluruOfficeNamePattern = /\b(?:Kengeri|Banasawadi|Ganganagar|Indiranagar|Shivajinagar|Yeshwanthpura)\b/i;

const requiredReviewDecisions = {
  owner: {
    marriage: 'stated',
    'death-certificate': 'stated',
    'birth-certificate': 'mentioned',
    khata: 'mentioned',
    'property-tax': 'mentioned',
    'trade-license': 'mentioned',
  },
  cost: {
    'bescom-name-transfer': {
      state: 'mentioned',
      claimId: 'claim_ind38_kerc_title_transfer_standard',
      note: '₹200 per day is a penalty on the utility for delay, not a citizen fee',
    },
    'water-connection': {
      state: 'stated',
      claimId: 'claim_ind40_water_faq_older_purchase',
      note: 'Rs 100 is the application fee from an older FAQ route; connection cost not stated',
    },
    khata: {
      state: 'stated',
      claimId: 'claim_ind32_bbmp_faq_transfer_fee',
      note: '',
    },
  },
};

// These are cell-level decisions made in the prior review pass. They are
// deliberately separate from claim reviewState: a human can have reviewed a
// cell even when the resulting state is mentioned or absent.
const requiredCellReviews = {
  marriage: { owner: 'Human decision: marriage owner remains stated.' },
  'death-certificate': { owner: 'Human decision: death-certificate owner remains stated.' },
  'birth-certificate': { owner: 'Human decision: birth-certificate owner is mentioned.' },
  khata: {
    cost: 'Human decision: e-Khata transfer cost remains stated.',
    owner: 'Human decision: e-Khata owner is mentioned.',
  },
  'property-tax': { owner: 'Human decision: property-tax owner is mentioned.' },
  'trade-license': { owner: 'Human decision: trade-licence owner is mentioned.' },
  'bescom-name-transfer': { cost: '₹200 per day is a penalty on the utility for delay, not a citizen fee.' },
  'water-connection': { cost: 'Rs 100 is the application fee from an older FAQ route; connection cost not stated.' },
};

const conditionalDocumentPattern = /\b(?:may|might|as applicable|where applicable|conditional|for example|such as|including but not limited to)\b/i;
const boundaryLanguagePattern = /\b(?:unknown|unclear|unresolved|unobserved|not (?:known|shown|published|specified|verified|established|observed|determined|available)|no public|does not(?:\s+\w+){0,3}\s+(?:show|state|say|publish|specify|establish|verify|confirm|determine|expose)|cannot(?:\s+\w+){0,3}\s+(?:tell|confirm|determine|establish|verify)|was not (?:observed|verified|tested|performed)|remains? unknown)\b/i;
const historicalLanguagePattern = /\b(?:historic|historical|legacy|older|outdated|dated|former|current applicability (?:is )?not established)\b/i;

const loginTermPattern = /\b(?:log(?:ged)?[- ]?in|login|sign[- ]?in|OTP|authenticat\w*|credentials?|password|CAPTCHA|user\s*ID)\b/i;
const loginRule = [
  'An Unknown claim means evidenceGrade === "Unknown".',
  'An Unknown claim is login-related when its claim text or any linked node.requiredState matches login, log in, sign-in, OTP, authenticat*, credential, password, CAPTCHA, or user ID.',
  'It is also login-related when every resolved source linked to the claim matches one of those terms in source.title plus source.notes.',
  'A roadblock is login-related only when roadblock.title plus roadblock.symptom matches the same terms.',
  'No account-related synonym without an explicit authentication term is matched.',
].join(' ');

const recurringPhraseRules = [
  {
    id: 'before-real-case-begins',
    canonical: 'before a real case begins',
    patterns: [
      /\bbefore a real case begins\b/gi,
      /\bstops? before (?:an? )?(?:authenticated|live|real|case-specific)[^.!?;]{0,50}(?:case|application|submission|transaction|project creation)\b/gi,
      /\bdid not (?:proceed|continue) (?:into|to) (?:an? )?(?:live|real)[^.!?;]{0,30}(?:case|application|submission|transaction)\b/gi,
      /\bno (?:case|application|submission|transaction) (?:is|was) (?:created|started|made|opened|begun)\b/gi,
    ],
  },
  {
    id: 'no-public-way-to-confirm',
    canonical: 'no public way to confirm',
    patterns: [
      /\bno public way to confirm\b/gi,
      /\bno public (?:way|route|method|means|source|evidence|documentation|information|page|tool|control)[^.!?;]{0,80}\b(?:confirm|verify|determine|establish)\w*\b/gi,
      /\b(?:cannot|can't) be (?:publicly )?(?:confirmed|verified|determined)\b/gi,
    ],
  },
  {
    id: 'cannot-tell-accepted',
    canonical: 'cannot tell what will be accepted',
    patterns: [
      /\bcannot tell what will be accepted\b/gi,
      /\b(?:cannot|can't|does not|do not|did not|fails? to)[^.!?;]{0,80}\b(?:tell|show|state|establish|verify|confirm|prove|determine)[^.!?;]{0,80}\baccept\w*\b/gi,
      /\baccept(?:ance|ed|able)?[^.!?;]{0,50}\b(?:unknown|unverified|unobserved|not established|not verified)\b/gi,
    ],
  },
  {
    id: 'who-owns-fix',
    canonical: 'who owns the fix',
    patterns: [
      /\bwho owns the fix\b/gi,
      /\b(?:who|which (?:agency|office|officer|authority))[^.!?;]{0,70}\b(?:owns?|fix(?:es)?|resolves?|decides?|reviews?|approves?)\b/gi,
      /\b(?:review|decision|recovery|correction) owner[^.!?;]{0,40}\b(?:unknown|unclear|unpublished|not (?:known|shown|identified))\b/gi,
      /\bpending[- ]with[- ]whom\b/gi,
    ],
  },
  {
    id: 'stops-at-authentication',
    canonical: 'stops at the authentication',
    patterns: [
      /\bstops at the authentication\b/gi,
      /\bstops? (?:at|before)[^.!?;]{0,60}\b(?:authentication|authenticated|login|sign[- ]?in|OTP|credentials?)\b/gi,
    ],
  },
  {
    id: 'not-live-application',
    canonical: 'not a live application',
    patterns: [
      /\bnot a live application\b/gi,
      /\bnot (?:a |an )?(?:current )?(?:live|real)[^.!?;]{0,20}\b(?:application|case|submission|transaction)(?:\s+(?:result|outcome|observation|receipt))?\b/gi,
      /\bnot (?:evidence|proof) of (?:a |an )?(?:live|real|completed)[^.!?;]{0,30}\b(?:application|case|submission|transaction|outcome)\b/gi,
    ],
  },
];

function countBy(items, key) {
  const counts = {};
  for (const item of items) {
    const value = typeof key === 'function' ? key(item) : item[key];
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

function gradeStatusMatrix(claims) {
  return Object.fromEntries(grades.map((grade) => {
    const gradeClaims = claims.filter((claim) => claim.evidenceGrade === grade);
    return [grade, {
      ...Object.fromEntries(statuses.map((status) => [status, gradeClaims.filter((claim) => claim.status === status).length])),
      total: gradeClaims.length,
    }];
  }));
}

function sortedUnique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null))].sort((a, b) => a.localeCompare(b));
}

function matchTerms(text, pattern) {
  const matches = text.match(new RegExp(pattern.source, `${pattern.flags.replace('g', '')}g`)) ?? [];
  return sortedUnique(matches.map((match) => match.toLowerCase()));
}

function matchRuleSet(text, patterns) {
  return sortedUnique(patterns.flatMap((pattern) => matchTerms(text, pattern)));
}

function matchActionableValueSignals(text, patterns) {
  const candidates = patterns.flatMap((pattern) => [...text.matchAll(new RegExp(pattern.source, `${pattern.flags.replace('g', '')}g`))]
    .map((match) => {
      const precedingBoundary = Math.max(text.lastIndexOf('.', match.index - 1), text.lastIndexOf(';', match.index - 1));
      const followingPeriod = text.indexOf('.', match.index + match[0].length);
      const followingSemicolon = text.indexOf(';', match.index + match[0].length);
      const followingBoundaries = [followingPeriod, followingSemicolon].filter((index) => index >= 0);
      const followingBoundary = followingBoundaries.length ? Math.min(...followingBoundaries) : text.length;
      const clause = text.slice(precedingBoundary + 1, followingBoundary);
      return {
        text: match[0].toLowerCase(),
        negatedOrUnknown: boundaryLanguagePattern.test(clause),
      };
    }));
  return {
    actionable: sortedUnique(candidates.filter((candidate) => !candidate.negatedOrUnknown).map((candidate) => candidate.text)),
    negated: sortedUnique(candidates.filter((candidate) => candidate.negatedOrUnknown).map((candidate) => candidate.text)),
  };
}

function proposeExpectationState(column, text) {
  let valueSignals = [];
  let candidateSignals = [];
  const reviewReasons = [];

  if (column === 'documents') {
    const listCues = matchRuleSet(text, documentListCuePatterns);
    const concreteDocuments = matchRuleSet(text, concreteDocumentPatterns);
    candidateSignals = [...concreteDocuments];
    if (concreteDocuments.length >= 2 || (concreteDocuments.length >= 1 && listCues.length >= 1)) {
      valueSignals = sortedUnique([...listCues, ...concreteDocuments]);
    }
    if (valueSignals.length && conditionalDocumentPattern.test(text)) {
      reviewReasons.push('The document list uses conditional or non-exhaustive language.');
    }
  } else if (column === 'eligibility') {
    const signals = matchActionableValueSignals(text, eligibilityValuePatterns);
    valueSignals = signals.actionable;
    candidateSignals = signals.negated;
    if (signals.negated.length) reviewReasons.push('A possible eligibility value signal appears only in a negated or unresolved clause.');
  } else if (column === 'owner') {
    const designations = matchRuleSet(text, ownerDesignationPatterns);
    const jurisdictions = matchRuleSet(text, ownerJurisdictionPatterns);
    const contactRoutes = matchRuleSet(text, ownerContactRoutePatterns);
    const officeListCues = matchRuleSet(text, ownerOfficeListCuePatterns);
    const officeNames = matchTerms(text, bengaluruOfficeNamePattern);
    candidateSignals = sortedUnique([...designations, ...jurisdictions, ...contactRoutes, ...officeListCues, ...officeNames]);
    const hasRoutableDesignation = designations.length > 0 && (jurisdictions.length > 0 || contactRoutes.length > 0);
    const hasSpecificOfficeList = officeListCues.length > 0 && officeNames.length >= 2;
    if (hasRoutableDesignation || hasSpecificOfficeList) {
      valueSignals = candidateSignals;
    } else if (designations.length) {
      reviewReasons.push('A designation is named without a jurisdiction rule, specific-office list, or contact route for that role.');
    }
  } else {
    const signals = matchActionableValueSignals(text, expectationValueRules[column]);
    valueSignals = signals.actionable;
    candidateSignals = signals.negated;
    if (signals.negated.length) reviewReasons.push('A possible value signal appears only in a negated or unresolved clause.');
  }

  const state = valueSignals.length ? 'stated' : 'mentioned';
  if (boundaryLanguagePattern.test(text)) {
    reviewReasons.push('The claim contains negative, unresolved, or public-boundary language that may limit whether its value is actionable.');
  }
  if (historicalLanguagePattern.test(text)) {
    reviewReasons.push('The claim labels some evidence as historic, legacy, older, former, or dated; current actionability needs review.');
  }
  if (column === 'eligibility' && valueSignals.some((signal) => signal.startsWith('if '))) {
    reviewReasons.push('Eligibility was inferred from an if-clause rather than a direct eligibility statement.');
  }

  return {
    state,
    valueSignals,
    candidateSignals,
    reviewReasons,
  };
}

function applyRequiredReviewDecisions(sidecar) {
  for (const [serviceId, requiredState] of Object.entries(requiredReviewDecisions.owner)) {
    const service = sidecar.services[serviceId];
    for (const entry of Object.values(service?.claims ?? {})) {
      if (!Object.hasOwn(entry.proposedState, 'owner') && !Object.hasOwn(entry.reviewState, 'owner')) continue;
      entry.reviewState.owner = requiredState === 'mentioned' ? 'mentioned' : entry.proposedState.owner;
      entry.manualOverridePreserved = entry.manualOverridePreserved || entry.reviewState.owner !== entry.proposedState.owner;
    }
    if (requiredState === 'stated') {
      const ownerEntries = Object.values(service?.claims ?? {}).filter((entry) => Object.hasOwn(entry.reviewState, 'owner'));
      if (!ownerEntries.some((entry) => entry.reviewState.owner === 'stated')) {
        throw new Error(`Required owner review for ${serviceId} is stated, but the tightened proposal found no routable owner claim.`);
      }
    }
  }

  for (const [serviceId, decision] of Object.entries(requiredReviewDecisions.cost)) {
    const service = sidecar.services[serviceId];
    const costEntries = Object.entries(service?.claims ?? {}).filter(([, entry]) =>
      Object.hasOwn(entry.proposedState, 'cost') || Object.hasOwn(entry.reviewState, 'cost'));
    if (!costEntries.length) throw new Error(`Required cost review for ${serviceId} found no cost claims.`);

    for (const [claimId, entry] of costEntries) {
      if (decision.state === 'mentioned') entry.reviewState.cost = 'mentioned';
      if (decision.state === 'stated' && claimId !== decision.claimId && entry.reviewState.cost === 'stated') entry.reviewState.cost = 'mentioned';
      entry.manualOverridePreserved = entry.manualOverridePreserved || entry.reviewState.cost !== entry.proposedState.cost;
    }

    const selected = service.claims[decision.claimId];
    if (!selected) throw new Error(`Required cost review claim ${serviceId}/${decision.claimId} was not found.`);
    selected.reviewState.cost = decision.state;
    selected.reviewNote = decision.note;
    selected.manualOverridePreserved = selected.manualOverridePreserved || selected.reviewState.cost !== selected.proposedState.cost || Boolean(decision.note);
  }

  sidecar.cellReviews = sidecar.cellReviews ?? {};
  for (const [serviceId, columns] of Object.entries(requiredCellReviews)) {
    sidecar.cellReviews[serviceId] = sidecar.cellReviews[serviceId] ?? {};
    for (const [column, reviewNote] of Object.entries(columns)) {
      sidecar.cellReviews[serviceId][column] = { reviewState: 'reviewed', reviewNote };
    }
  }

  return sidecar;
}

function expectationProposal(claim) {
  const proposedColumns = [];
  const matches = {};
  const proposedState = {};
  const proposalDetails = {};
  for (const column of expectationColumns) {
    const terms = matchRuleSet(claim.text, expectationRules[column]);
    if (terms.length) {
      proposedColumns.push(column);
      matches[column] = terms;
      proposalDetails[column] = proposeExpectationState(column, claim.text);
      proposedState[column] = proposalDetails[column].state;
    }
  }

  const ambiguityReasons = [];
  if (proposedColumns.length > 1) {
    const reason = 'Multiple expectation columns matched; the claim may be compound or a keyword may be incidental.';
    ambiguityReasons.push(reason);
    for (const column of proposedColumns) proposalDetails[column].reviewReasons.push(reason);
  }
  ambiguityReasons.push(...proposedColumns.flatMap((column) => proposalDetails[column].reviewReasons));

  return {
    proposedColumns,
    proposedState,
    proposalDetails,
    matches,
    ambiguityReasons: sortedUnique(ambiguityReasons),
  };
}

function sameStringArray(left = [], right = []) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

async function readExistingExpectationTags() {
  try {
    return JSON.parse(await readFile(expectationTagsPath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function validateReviewedColumns(columns, serviceId, claimId) {
  if (!Array.isArray(columns) || columns.some((column) => !expectationColumns.includes(column))) {
    throw new Error(`Invalid reviewed columns for ${serviceId}/${claimId} in ${relative(projectRoot, expectationTagsPath)}.`);
  }
  return sortedUnique(columns);
}

function validateStateMap(value, serviceId, claimId, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid ${field} for ${serviceId}/${claimId} in ${relative(projectRoot, expectationTagsPath)}.`);
  }
  const invalidEntry = Object.entries(value).find(([column, state]) =>
    !expectationColumns.includes(column) || !['stated', 'mentioned', 'absent'].includes(state));
  if (invalidEntry) {
    throw new Error(`Invalid ${field} entry ${invalidEntry.join('=')} for ${serviceId}/${claimId} in ${relative(projectRoot, expectationTagsPath)}.`);
  }
  return Object.fromEntries(expectationColumns.filter((column) => Object.hasOwn(value, column)).map((column) => [column, value[column]]));
}

function sameStateMap(left = {}, right = {}) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function buildExpectationSidecar(ledgers, previous) {
  const services = {};
  const orphanedClaims = [];

  for (const ledger of ledgers) {
    const claims = {};
    const previousClaims = previous?.services?.[ledger.serviceId]?.claims ?? {};
    const eligibleClaims = ledger.data.claims.filter((claim) =>
      ['A', 'B', 'C'].includes(claim.evidenceGrade) && ['verified', 'partial'].includes(claim.status));

    for (const claim of eligibleClaims) {
      const proposal = expectationProposal(claim);
      const prior = previousClaims[claim.id];
      let reviewState = proposal.proposedState;
      let hadManualOverride = false;

      if (prior?.reviewState) {
        const priorReviewState = validateStateMap(prior.reviewState, ledger.serviceId, claim.id, 'reviewState');
        const priorProposedState = validateStateMap(prior.proposedState ?? {}, ledger.serviceId, claim.id, 'proposedState');
        hadManualOverride = !sameStateMap(priorReviewState, priorProposedState);
        if (hadManualOverride) reviewState = priorReviewState;
      } else if (prior?.columns) {
        const priorColumns = validateReviewedColumns(prior.columns, ledger.serviceId, claim.id);
        const priorProposedColumns = validateReviewedColumns(prior.proposedColumns ?? [], ledger.serviceId, claim.id);
        hadManualOverride = !sameStringArray(priorColumns, priorProposedColumns);
        if (hadManualOverride) {
          reviewState = Object.fromEntries(priorColumns.map((column) => [column, proposal.proposedState[column] ?? 'mentioned']));
        }
      }

      claims[claim.id] = {
        text: claim.text,
        evidenceGrade: claim.evidenceGrade,
        status: claim.status,
        proposedColumns: proposal.proposedColumns,
        proposedState: proposal.proposedState,
        reviewState,
        reviewNote: prior?.reviewNote ?? '',
        keywordMatches: proposal.matches,
        proposalDetails: proposal.proposalDetails,
        ambiguityReasons: proposal.ambiguityReasons,
        manualOverridePreserved: hadManualOverride,
      };
    }

    for (const [claimId, entry] of Object.entries(previousClaims)) {
      if (!claims[claimId]) orphanedClaims.push({ serviceId: ledger.serviceId, claimId, entry });
    }

    services[ledger.serviceId] = {
      service: ledger.service,
      ledgerFile: ledger.filename,
      claims,
    };
  }

  return {
    schemaVersion: '2.1.0',
    description: `Reviewable expectation tags for ${reportTitle}. proposedColumns and proposedState are generated. Edit reviewState and reviewNote; the grid reads only reviewState. cellReviews records human review of a service-expectation cell. A reviewState that differs from the preceding proposedState is preserved on rerun.`,
    columns: expectationColumns,
    states: ['stated', 'mentioned', 'absent'],
    rule: {
      eligibleEvidenceGrades: ['A', 'B', 'C'],
      eligibleStatuses: ['verified', 'partial'],
      classifiedField: 'claim.text',
      keywordPatterns: Object.fromEntries(expectationColumns.map((column) => [column, expectationRules[column].map((pattern) => pattern.source)])),
      valuePatterns: {
        cost: expectationValueRules.cost.map((pattern) => pattern.source),
        documents: {
          listCues: documentListCuePatterns.map((pattern) => pattern.source),
          concreteDocuments: concreteDocumentPatterns.map((pattern) => pattern.source),
          rule: 'Stated when two or more concrete document types appear, or one concrete document appears with a requirement/list cue.',
        },
        eligibility: eligibilityValuePatterns.map((pattern) => pattern.source),
        time: expectationValueRules.time.map((pattern) => pattern.source),
        owner: {
          designations: ownerDesignationPatterns.map((pattern) => pattern.source),
          jurisdictionRules: ownerJurisdictionPatterns.map((pattern) => pattern.source),
          contactRoutes: ownerContactRoutePatterns.map((pattern) => pattern.source),
          officeListCues: ownerOfficeListCuePatterns.map((pattern) => pattern.source),
          specificOfficeNames: bengaluruOfficeNamePattern.source,
          rule: 'Stated only for a list of specific offices, a designation with a jurisdiction rule, or a contact route for that role. A statutory designation alone is mentioned.',
        },
        'after-submission': expectationValueRules['after-submission'].map((pattern) => pattern.source),
      },
      boundaryLanguagePattern: boundaryLanguagePattern.source,
      stateRule: 'A keyword match proposes mentioned unless a column-specific value signal proposes stated. No keyword match implies absent. Boundary language and compound matches record review reasons without silently changing the proposed state.',
      reviewRule: 'The grid is derived only from reviewState. Missing or explicit absent review states do not support a cell.',
      requiredReviewDecisions,
    },
    services,
    cellReviews: previous?.cellReviews ?? {},
    orphanedClaims,
  };
}

const staleRouteLanguagePattern = /\b(?:older|legacy|superseded|outdated|former)\b|\bhistoric(?:al)?\s+(?:route|workflow|process|FAQ|guidance)\b|\bdated\s+(?:BPAS\s+)?workflow\b/i;

function claimStaleness(claim, sourcesById) {
  if (staleRouteLanguagePattern.test(claim.text)) {
    return { stale: true, reason: 'The supporting claim describes its route or workflow as older, legacy, historic, dated, or superseded.' };
  }
  const sources = claim.sourceIds.map((sourceId) => sourcesById.get(sourceId)).filter(Boolean);
  const publicationYears = sources.map((source) => {
    const match = String(source.publishedAt ?? '').match(/\b((?:19|20)\d{2})\b/u);
    return match ? Number(match[1]) : null;
  });
  if (sources.length > 0 && publicationYears.every((year) => year !== null) && Math.max(...publicationYears) < 2024) {
    return { stale: true, reason: `The supporting claim's newest dated source is from ${Math.max(...publicationYears)}, before 2024.` };
  }
  return { stale: false, reason: null };
}

function deriveExpectationGrid(ledgers, sidecar) {
  const grid = [];
  const ambiguities = [];
  const proposedStatedClaims = [];
  const statedCellJustifications = [];
  const countsByColumn = Object.fromEntries(expectationColumns.map((column) => [column, { stated: 0, mentioned: 0, absent: 0 }]));
  const gradeStrength = new Map([['A', 3], ['B', 2], ['C', 1]]);

  for (const ledger of ledgers) {
    const claimsById = new Map(ledger.data.claims.map((claim) => [claim.id, claim]));
    const sourcesById = new Map(ledger.data.sources.map((source) => [source.id, source]));
    const reviewedClaims = sidecar.services?.[ledger.serviceId]?.claims ?? {};
    const cells = {};

    for (const column of expectationColumns) {
      const eligibleReviewedEntries = Object.entries(reviewedClaims)
        .filter(([claimId]) => {
          const claim = claimsById.get(claimId);
          return claim
            && ['A', 'B', 'C'].includes(claim.evidenceGrade)
            && ['verified', 'partial'].includes(claim.status);
        });
      const supportingClaimIds = {
        stated: eligibleReviewedEntries.filter(([, entry]) => entry.reviewState?.[column] === 'stated').map(([claimId]) => claimId).sort(),
        mentioned: eligibleReviewedEntries.filter(([, entry]) => entry.reviewState?.[column] === 'mentioned').map(([claimId]) => claimId).sort(),
      };
      const state = supportingClaimIds.stated.length ? 'stated' : supportingClaimIds.mentioned.length ? 'mentioned' : 'absent';
      countsByColumn[column][state] += 1;

      const statedGrades = supportingClaimIds.stated.map((claimId) => claimsById.get(claimId).evidenceGrade);
      const strongestEvidenceGradeBehindStated = statedGrades.sort((left, right) => gradeStrength.get(right) - gradeStrength.get(left))[0] ?? null;
      const proposedSupportingClaimIds = {
        stated: eligibleReviewedEntries.filter(([, entry]) => entry.proposedState?.[column] === 'stated').map(([claimId]) => claimId).sort(),
        mentioned: eligibleReviewedEntries.filter(([, entry]) => entry.proposedState?.[column] === 'mentioned').map(([claimId]) => claimId).sort(),
      };
      const proposedState = proposedSupportingClaimIds.stated.length ? 'stated' : proposedSupportingClaimIds.mentioned.length ? 'mentioned' : 'absent';
      const proposalReviewClaims = eligibleReviewedEntries.flatMap(([claimId, entry]) => {
        const reasons = entry.proposalDetails?.[column]?.reviewReasons ?? [];
        return reasons.length ? [{ claimId, text: entry.text, proposedState: entry.proposedState?.[column] ?? 'absent', reasons }] : [];
      });
      const proposalReviewReasons = sortedUnique(proposalReviewClaims.flatMap((entry) => entry.reasons));
      const cellReview = sidecar.cellReviews?.[ledger.serviceId]?.[column];
      const reviewed = cellReview?.reviewState === 'reviewed' || cellReview?.reviewed === true;
      const reviewNote = cellReview?.reviewNote ?? (reviewed
        ? 'Human review recorded for this cell.'
        : 'No human review decision is recorded for this cell.');
      const statedStaleness = supportingClaimIds.stated.map((claimId) => ({
        claimId,
        ...claimStaleness(claimsById.get(claimId), sourcesById),
      }));
      const stale = state === 'stated' && statedStaleness.length > 0 && statedStaleness.every((entry) => entry.stale);
      const staleReason = stale
        ? sortedUnique(statedStaleness.map((entry) => entry.reason)).join(' ')
        : null;

      cells[column] = {
        state,
        supportingClaimIds,
        strongestEvidenceGradeBehindStated,
        proposedState,
        proposedSupportingClaimIds,
        reviewed,
        unreviewed: !reviewed,
        reviewNote,
        proposalNeedsReview: proposalReviewClaims.length > 0,
        proposalReviewDetails: proposalReviewClaims,
        stale,
        staleReason,
      };

      if (proposalReviewClaims.length) {
        ambiguities.push({
          serviceId: ledger.serviceId,
          service: ledger.service,
          column,
          proposedState,
          claimIds: proposalReviewClaims.map((entry) => entry.claimId),
          reasons: proposalReviewReasons,
        });
      }

      for (const claimId of proposedSupportingClaimIds.stated) {
        const entry = reviewedClaims[claimId];
        const claim = claimsById.get(claimId);
        proposedStatedClaims.push({
          serviceId: ledger.serviceId,
          service: ledger.service,
          column,
          claimId,
          text: claim.text,
          evidenceGrade: claim.evidenceGrade,
          status: claim.status,
          proposalNeedsReview: (entry.proposalDetails?.[column]?.reviewReasons ?? []).length > 0,
          reviewReasons: entry.proposalDetails?.[column]?.reviewReasons ?? [],
        });
      }

      for (const claimId of supportingClaimIds.stated) {
        const claim = claimsById.get(claimId);
        statedCellJustifications.push({
          serviceId: ledger.serviceId,
          service: ledger.service,
          column,
          claimId,
          text: claim.text,
          evidenceGrade: claim.evidenceGrade,
          status: claim.status,
          stale: claimStaleness(claim, sourcesById).stale,
          reviewed,
          needsReview: (reviewedClaims[claimId].proposalDetails?.[column]?.reviewReasons ?? []).length > 0,
        });
      }
    }

    const stateCounts = countBy(expectationColumns.map((column) => ({ state: cells[column].state })), 'state');
    grid.push({
      serviceId: ledger.serviceId,
      service: ledger.service,
      href: serviceHrefs[ledger.serviceId],
      ledgerFile: ledger.filename,
      cells,
      stateCounts: {
        stated: stateCounts.stated ?? 0,
        mentioned: stateCounts.mentioned ?? 0,
        absent: stateCounts.absent ?? 0,
      },
    });
  }

  return { columns: expectationColumns, states: ['stated', 'mentioned', 'absent'], services: grid, countsByColumn, proposedStatedClaims, statedCellJustifications, ambiguities };
}

function classifyLoginRelated(ledgers) {
  const unknownClaims = [];
  const roadblocks = [];
  const ambiguities = [];

  for (const ledger of ledgers) {
    const nodesById = new Map(ledger.data.nodes.map((node) => [node.id, node]));
    const sourcesById = new Map(ledger.data.sources.map((source) => [source.id, source]));

    for (const claim of ledger.data.claims.filter((candidate) => candidate.evidenceGrade === 'Unknown')) {
      const matchedBy = [];
      const terms = [];
      const directTerms = matchTerms(claim.text, loginTermPattern);
      if (directTerms.length) {
        matchedBy.push('claim.text');
        terms.push(...directTerms);
      }

      for (const nodeId of claim.nodeIds) {
        const node = nodesById.get(nodeId);
        if (!node) continue;
        const nodeTerms = matchTerms(node.requiredState, loginTermPattern);
        if (nodeTerms.length) {
          matchedBy.push(`node.requiredState:${nodeId}`);
          terms.push(...nodeTerms);
        }
      }

      const resolvedSources = claim.sourceIds.map((sourceId) => sourcesById.get(sourceId)).filter(Boolean);
      const sourceMatches = resolvedSources.map((source) => {
        const text = `${source.title} ${source.notes ?? ''}`;
        return { source, terms: matchTerms(text, loginTermPattern) };
      });
      if (resolvedSources.length && sourceMatches.every((match) => match.terms.length)) {
        matchedBy.push('all-linked-sources');
        terms.push(...sourceMatches.flatMap((match) => match.terms));
      }

      if (matchedBy.length) {
        const item = {
          kind: 'unknown-claim',
          serviceId: ledger.serviceId,
          service: ledger.service,
          ledgerFile: ledger.filename,
          id: claim.id,
          text: claim.text,
          matchedBy: sortedUnique(matchedBy),
          matchedTerms: sortedUnique(terms),
        };
        unknownClaims.push(item);
        if (!matchedBy.includes('claim.text')) {
          ambiguities.push({ ...item, reason: 'The claim was classified through linked context rather than its own text.' });
        }
      }
    }

    for (const roadblock of ledger.data.roadblocks) {
      const classifiedText = `${roadblock.title}. ${roadblock.symptom}`;
      const terms = matchTerms(classifiedText, loginTermPattern);
      if (!terms.length) continue;
      roadblocks.push({
        kind: 'roadblock',
        serviceId: ledger.serviceId,
        service: ledger.service,
        ledgerFile: ledger.filename,
        id: roadblock.id,
        text: classifiedText,
        matchedBy: ['roadblock.title+roadblock.symptom'],
        matchedTerms: terms,
        category: roadblock.category,
      });
    }
  }

  const allClaims = ledgers.flatMap((ledger) => ledger.data.claims);
  const allRoadblocks = ledgers.flatMap((ledger) => ledger.data.roadblocks);
  const claimKeys = new Set(unknownClaims.map((item) => `${item.serviceId}:${item.id}`));
  const roadblockKeys = new Set(roadblocks.map((item) => `${item.serviceId}:${item.id}`));
  const strippedClaims = ledgers.flatMap((ledger) => ledger.data.claims
    .filter((claim) => !claimKeys.has(`${ledger.serviceId}:${claim.id}`)));
  const strippedRoadblocks = ledgers.flatMap((ledger) => ledger.data.roadblocks
    .filter((roadblock) => !roadblockKeys.has(`${ledger.serviceId}:${roadblock.id}`)));
  const fullUnknownCount = allClaims.filter((claim) => claim.evidenceGrade === 'Unknown').length;

  return {
    rule: loginRule,
    comparison: {
      claims: {
        fullCount: allClaims.length,
        loginStrippedCount: strippedClaims.length,
        fullByGradeAndStatus: gradeStatusMatrix(allClaims),
        loginStrippedByGradeAndStatus: gradeStatusMatrix(strippedClaims),
      },
      unknownClaims: {
        fullCount: fullUnknownCount,
        loginRelatedCount: unknownClaims.length,
        loginStrippedCount: fullUnknownCount - unknownClaims.length,
      },
      roadblocks: {
        fullCount: allRoadblocks.length,
        loginRelatedCount: roadblocks.length,
        loginStrippedCount: strippedRoadblocks.length,
        fullByCategory: countBy(allRoadblocks, 'category'),
        loginStrippedByCategory: countBy(strippedRoadblocks, 'category'),
      },
    },
    items: [...unknownClaims, ...roadblocks].sort((a, b) =>
      a.service.localeCompare(b.service) || a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id)),
    ambiguities,
  };
}

async function researchWindow() {
  const { stdout } = await execFileAsync('git', [
    'log',
    '--format=%ad',
    '--date=short',
    '--',
    'ledger',
    'research/handoffs',
    'research/audit',
    'research/audits',
  ], { cwd: projectRoot });
  const dates = stdout.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean).sort();
  if (!dates.length) throw new Error('Git log returned no dates for ledger and research inputs.');
  return {
    start: dates[0],
    end: dates.at(-1),
    commitCount: dates.length,
    derivation: 'Minimum and maximum author dates from git log for ledger/, research/handoffs/, research/audit/, and research/audits/.',
  };
}

function buildTotals(ledgers, window) {
  const allClaims = ledgers.flatMap((ledger) => ledger.data.claims);
  const allSources = ledgers.flatMap((ledger) => ledger.data.sources);
  const allScenarios = ledgers.flatMap((ledger) => ledger.data.scenarios);
  const allNodes = ledgers.flatMap((ledger) => ledger.data.nodes.map((node) => ({ ...node, serviceId: ledger.serviceId, service: ledger.service })));
  const allRoadblocks = ledgers.flatMap((ledger) => ledger.data.roadblocks);
  const allJourneySteps = ledgers.flatMap((ledger) => ledger.data.journeys.flatMap((journey) => journey.steps));
  const emptyNodeDetails = allNodes.map((node) => ({
    serviceId: node.serviceId,
    service: node.service,
    nodeId: node.id,
    nodeLabel: node.label,
    emptyFields: ['checks', 'failureSignals', 'recoveries'].filter((field) => node[field].length === 0),
  })).filter((node) => node.emptyFields.length);

  return {
    services: ledgers.length,
    byService: ledgers.map((ledger) => ({
      serviceId: ledger.serviceId,
      service: ledger.service,
      href: serviceHrefs[ledger.serviceId],
      claimsByGrade: Object.fromEntries(grades.map((grade) => [grade, ledger.data.claims.filter((claim) => claim.evidenceGrade === grade).length])),
      claimTotal: ledger.data.claims.length,
    })),
    claims: {
      total: allClaims.length,
      byGrade: countBy(allClaims, 'evidenceGrade'),
      byStatus: countBy(allClaims, 'status'),
      byGradeAndStatus: gradeStatusMatrix(allClaims),
    },
    sources: {
      total: allSources.length,
      byType: countBy(allSources, 'type'),
      distinctUrls: new Set(allSources.map((source) => source.url)).size,
    },
    scenarios: {
      total: allScenarios.length,
      byStatus: countBy(allScenarios, 'status'),
    },
    journeySteps: {
      total: allJourneySteps.length,
      byStatus: countBy(allJourneySteps, 'status'),
    },
    nodesWithEmptyDetails: {
      totalNodes: allNodes.length,
      anyEmpty: emptyNodeDetails.length,
      allThreeEmpty: emptyNodeDetails.filter((node) => node.emptyFields.length === 3).length,
      byField: Object.fromEntries(['checks', 'failureSignals', 'recoveries'].map((field) => [
        field,
        emptyNodeDetails.filter((node) => node.emptyFields.includes(field)).length,
      ])),
      items: emptyNodeDetails,
    },
    roadblocks: {
      total: allRoadblocks.length,
      byCategory: countBy(allRoadblocks, 'category'),
    },
    researchWindow: window,
  };
}

function collectPublicErrors(ledgers) {
  const errors = [];
  for (const ledger of ledgers) {
    const claimsById = new Map(ledger.data.claims.map((claim) => [claim.id, claim]));
    const sourcesById = new Map(ledger.data.sources.map((source) => [source.id, source]));
    for (const node of ledger.data.nodes) {
      for (const field of ['checks', 'failureSignals', 'recoveries']) {
        for (const detail of node[field]) {
          if (typeof detail.actualError !== 'string') continue;
          const embeddedUrls = detail.actualError.match(/https?:\/\/[^\s)]+/gu)?.map((url) => url.replace(/[.,;]+$/u, '')) ?? [];
          const claimSourceUrls = detail.claimIds.flatMap((claimId) => {
            const claim = claimsById.get(claimId);
            return claim?.sourceIds.map((sourceId) => sourcesById.get(sourceId)?.url).filter(Boolean) ?? [];
          });
          const urls = sortedUnique([detail.url, ...embeddedUrls, ...claimSourceUrls]);
          const url = detail.url ?? embeddedUrls[0] ?? (urls.length === 1 ? urls[0] : null);
          errors.push({
            serviceId: ledger.serviceId,
            service: ledger.service,
            ledgerFile: ledger.filename,
            nodeId: node.id,
            nodeLabel: node.label,
            detailField: field,
            detailId: detail.id,
            actualError: detail.actualError,
            url,
            urls,
            urlResolution: detail.url
              ? 'detail.url'
              : embeddedUrls.length
                ? 'URL embedded in actualError'
                : urls.length === 1
                  ? 'sole URL from supporting claim sources'
                  : 'multiple supporting claim-source URLs; no single URL inferred',
          });
        }
      }
    }
  }
  return errors;
}

function inferHandoffService(filename) {
  const value = filename.toLowerCase();
  const rules = [
    ['bescom-name-transfer', /bescom/u],
    ['birth-certificate', /birth/u],
    ['building-plan', /building[-_]plan/u],
    ['death-certificate', /death/u],
    ['khata', /khata/u],
    ['lpg', /lpg/u],
    ['marriage', /marriage/u],
    ['new-electricity', /new[-_]electricity/u],
    ['property-tax', /property/u],
    ['trade-license', /trade[-_]licen[cs]e/u],
    ['water-account', /water[-_]account/u],
    ['water-connection', /water/u],
  ];
  return rules.find(([, pattern]) => pattern.test(value))?.[0] ?? null;
}

function findDocumentationShelves(value, path = []) {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap((entry, index) => findDocumentationShelves(entry, [...path, index]));
  const shelves = [];
  for (const [key, child] of Object.entries(value)) {
    if (key === 'documentationShelf' && Array.isArray(child)) shelves.push({ path: [...path, key].join('.'), entries: child });
    else shelves.push(...findDocumentationShelves(child, [...path, key]));
  }
  return shelves;
}

function normalizedUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    parsed.hostname = parsed.hostname.toLowerCase();
    if (parsed.pathname.length > 1) parsed.pathname = parsed.pathname.replace(/\/+$/u, '');
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

async function collectDocumentationShelf(ledgers) {
  const files = (await readdir(handoffDirectory)).filter((file) => file.endsWith('.json')).sort();
  const byService = new Map(ledgers.map((ledger) => [ledger.serviceId, []]));
  const ambiguities = [];
  let sourceEntryCount = 0;

  for (const filename of files) {
    const data = JSON.parse(await readFile(join(handoffDirectory, filename), 'utf8'));
    const shelves = findDocumentationShelves(data);
    if (!shelves.length) continue;
    const serviceId = inferHandoffService(filename);
    if (!serviceId || !byService.has(serviceId)) {
      ambiguities.push({ area: 'documentation-shelf', handoffFile: filename, reason: 'Could not infer a published service from the handoff filename.' });
      continue;
    }
    for (const shelf of shelves) {
      for (const entry of shelf.entries) {
        sourceEntryCount += 1;
        const missingFields = ['title', 'url', 'whatItCovers', 'whereItStops'].filter((field) => typeof entry[field] !== 'string' || !entry[field].trim());
        if (missingFields.length) {
          ambiguities.push({ area: 'documentation-shelf', handoffFile: filename, shelfPath: shelf.path, reason: `Missing fields: ${missingFields.join(', ')}` });
        }
        byService.get(serviceId).push({
          title: entry.title ?? null,
          url: entry.url ?? null,
          whatItCovers: entry.whatItCovers ?? null,
          whereItStops: entry.whereItStops ?? null,
          handoffFile: filename,
          shelfPath: shelf.path,
        });
      }
    }
  }

  const groups = ledgers.map((ledger) => {
    const entries = byService.get(ledger.serviceId);
    const deduped = new Map();
    for (const entry of entries) {
      const key = entry.url ? normalizedUrl(entry.url) : `missing-url:${entry.handoffFile}:${entry.shelfPath}:${entry.title}`;
      const bucket = deduped.get(key) ?? [];
      bucket.push(entry);
      deduped.set(key, bucket);
    }
    const documentation = [...deduped.entries()].map(([urlKey, variants]) => {
      const first = variants[0];
      const uniqueVariants = [];
      const seen = new Set();
      for (const variant of variants) {
        const signature = JSON.stringify([variant.title, variant.whatItCovers, variant.whereItStops]);
        if (!seen.has(signature)) {
          seen.add(signature);
          uniqueVariants.push({
            title: variant.title,
            whatItCovers: variant.whatItCovers,
            whereItStops: variant.whereItStops,
            handoffFiles: sortedUnique(variants.filter((candidate) =>
              candidate.title === variant.title
              && candidate.whatItCovers === variant.whatItCovers
              && candidate.whereItStops === variant.whereItStops).map((candidate) => candidate.handoffFile)),
          });
        }
      }
      if (uniqueVariants.length > 1) {
        ambiguities.push({
          area: 'documentation-shelf',
          serviceId: ledger.serviceId,
          url: first.url,
          reason: 'The same normalized URL has differing shelf descriptions; all variants are retained.',
        });
      }
      return {
        title: first.title,
        url: first.url,
        normalizedUrl: urlKey,
        whatItCovers: first.whatItCovers,
        whereItStops: first.whereItStops,
        sourceEntryCount: variants.length,
        handoffFiles: sortedUnique(variants.map((variant) => variant.handoffFile)),
        variants: uniqueVariants,
      };
    }).sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
    return {
      serviceId: ledger.serviceId,
      service: ledger.service,
      sourceEntryCount: entries.length,
      deduplicatedEntryCount: documentation.length,
      entries: documentation,
    };
  });

  return {
    deduplicationRule: 'Within each service, parse the URL, lowercase the hostname, remove the fragment and a non-root trailing slash, and retain the query string. Divergent descriptions remain in variants.',
    sourceEntryCount,
    deduplicatedEntryCount: groups.reduce((total, group) => total + group.deduplicatedEntryCount, 0),
    groups,
    ambiguities,
  };
}

function cleanMarkdownParagraph(text) {
  return text
    .replace(/^\s*(?:[-*+] |\d+[.)]\s+)/u, '')
    .replace(/\*\*/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

function paragraphAfter(lines, startIndex) {
  let index = startIndex;
  while (index < lines.length && (!lines[index].trim() || /^#{1,6}\s/u.test(lines[index]))) index += 1;
  const paragraph = [];
  while (index < lines.length && lines[index].trim() && !/^#{1,6}\s/u.test(lines[index])) {
    paragraph.push(lines[index].trim());
    index += 1;
  }
  return cleanMarkdownParagraph(paragraph.join(' '));
}

function extractAuditExcerpt(markdown) {
  const lines = markdown.split(/\r?\n/u);
  const strongIndex = lines.findIndex((line) => /^\*\*(?:Ship decision|Verdict|Result)\b/iu.test(line.trim()));
  if (strongIndex >= 0) {
    const raw = paragraphAfter(lines, strongIndex);
    return {
      heading: 'Inline ' + (lines[strongIndex].match(/^\*\*([^:*+.]+|[^*]+?)(?::|\.|\*\*)/u)?.[1]?.trim() ?? 'decision'),
      excerpt: raw.replace(/^(?:Ship decision|Verdict|Result)\s*[:.]?\s*/iu, ''),
      extractionMethod: 'inline-decision-label',
      ambiguous: false,
    };
  }

  const headingPreferences = [
    [/^ship decision$/iu, 100],
    [/^verdict(?::|$)/iu, 90],
    [/^(?:scope and )?result$/iu, 80],
    [/^material findings$/iu, 70],
    [/^findings requiring/iu, 65],
    [/^required corrections/iu, 60],
    [/^contract reconciliation$/iu, 50],
    [/^findings$/iu, 40],
  ];
  const headings = lines.map((line, index) => {
    const match = line.match(/^##\s+(.+)$/u);
    if (!match) return null;
    const title = match[1].trim();
    const score = headingPreferences.find(([pattern]) => pattern.test(title))?.[1] ?? 0;
    return { index, title, score };
  }).filter(Boolean).filter((heading) => heading.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  if (headings.length) {
    const selected = headings[0];
    return {
      heading: selected.title,
      excerpt: paragraphAfter(lines, selected.index + 1),
      extractionMethod: selected.score === 100 ? 'exact-ship-decision-heading' : 'equivalent-heading',
      ambiguous: false,
    };
  }

  const titleIndex = lines.findIndex((line) => /^#\s+/u.test(line));
  return {
    heading: null,
    excerpt: paragraphAfter(lines, titleIndex + 1),
    extractionMethod: 'fallback-first-paragraph-after-title',
    ambiguous: true,
  };
}

async function collectAuditExcerpts() {
  const directoryEntries = await readdir(researchDirectory, { withFileTypes: true });
  const auditDirectories = directoryEntries.filter((entry) => entry.isDirectory() && entry.name.startsWith('audit')).map((entry) => entry.name).sort();
  const excerpts = [];
  for (const directory of auditDirectories) {
    const directoryPath = join(researchDirectory, directory);
    const files = (await readdir(directoryPath)).filter((file) => file.endsWith('.md')).sort();
    for (const filename of files) {
      const file = join(directoryPath, filename);
      excerpts.push({ file: relative(projectRoot, file), ...extractAuditExcerpt(await readFile(file, 'utf8')) });
    }
  }
  return excerpts;
}

function walkStrings(value, path = []) {
  if (typeof value === 'string') return [{ path: path.join('.'), text: value }];
  if (Array.isArray(value)) return value.flatMap((entry, index) => walkStrings(entry, [...path, index]));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, child]) => walkStrings(child, [...path, key]));
  return [];
}

function nonOverlappingMatches(text, patterns) {
  const candidates = patterns.flatMap((pattern) => [...text.matchAll(new RegExp(pattern.source, pattern.flags))]
    .map((match) => ({ start: match.index, end: match.index + match[0].length, text: match[0] })));
  candidates.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
  const selected = [];
  for (const candidate of candidates) {
    if (!selected.some((match) => candidate.start < match.end && candidate.end > match.start)) selected.push(candidate);
  }
  return selected.sort((a, b) => a.start - b.start);
}

function collectRecurringPhrases(ledgers) {
  const strings = ledgers.flatMap((ledger) => walkStrings(ledger.data).map((entry) => ({ ...entry, ledger })));
  return recurringPhraseRules.map((rule) => {
    const occurrences = [];
    const variants = new Map();
    let exactCount = 0;
    const exactPattern = new RegExp(rule.canonical.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'gi');
    for (const entry of strings) {
      exactCount += [...entry.text.matchAll(exactPattern)].length;
      for (const match of nonOverlappingMatches(entry.text, rule.patterns)) {
        const normalized = match.text.toLowerCase().replace(/\s+/gu, ' ').trim();
        variants.set(normalized, (variants.get(normalized) ?? 0) + 1);
        occurrences.push({
          serviceId: entry.ledger.serviceId,
          service: entry.ledger.service,
          ledgerFile: entry.ledger.filename,
          path: entry.path,
          matchedText: match.text,
        });
      }
    }
    return {
      id: rule.id,
      canonical: rule.canonical,
      count: occurrences.length,
      exactCount,
      closeVariantCount: occurrences.length - exactCount,
      patterns: rule.patterns.map((pattern) => pattern.source),
      variants: [...variants.entries()].map(([text, count]) => ({ text, count })).sort((a, b) => b.count - a.count || a.text.localeCompare(b.text)),
      occurrences,
    };
  });
}

function truncate(value, maximum = 100) {
  const text = String(value ?? '').replace(/\s+/gu, ' ');
  return text.length <= maximum ? text : `${text.slice(0, maximum - 1)}…`;
}

function printTable(headers, rows) {
  const values = [headers, ...rows].map((row) => row.map((value) => String(value ?? '').replace(/\|/gu, '\\|').replace(/\s+/gu, ' ')));
  const widths = headers.map((_, column) => Math.max(...values.map((row) => row[column]?.length ?? 0)));
  const line = (row) => `| ${row.map((value, column) => value.padEnd(widths[column])).join(' | ')} |`;
  console.log(line(values[0]));
  console.log(`| ${widths.map((width) => '-'.repeat(width)).join(' | ')} |`);
  for (const row of values.slice(1)) console.log(line(row));
}

function printSummary(report) {
  console.log('\n1. Totals');
  printTable(['Metric', 'Breakdown'], [
    ['Services', report.totals.services],
    ['Claims by grade', JSON.stringify(report.totals.claims.byGrade)],
    ['Claims by status', JSON.stringify(report.totals.claims.byStatus)],
    ['Sources by type', JSON.stringify(report.totals.sources.byType)],
    ['Distinct URLs', report.totals.sources.distinctUrls],
    ['Scenarios by status', JSON.stringify(report.totals.scenarios.byStatus)],
    ['Journey steps by status', JSON.stringify(report.totals.journeySteps.byStatus)],
    ['Nodes with empty details', JSON.stringify({ ...report.totals.nodesWithEmptyDetails.byField, any: report.totals.nodesWithEmptyDetails.anyEmpty, allThree: report.totals.nodesWithEmptyDetails.allThreeEmpty })],
    ['Roadblocks by category', JSON.stringify(report.totals.roadblocks.byCategory)],
    ['Research window', `${report.totals.researchWindow.start} to ${report.totals.researchWindow.end} (${report.totals.researchWindow.commitCount} commits)`],
  ]);

  console.log('\nClaims by grade and status');
  printTable(['Grade', ...statuses, 'total'], grades.map((grade) => [grade, ...statuses.map((status) => report.totals.claims.byGradeAndStatus[grade][status]), report.totals.claims.byGradeAndStatus[grade].total]));

  console.log('\n2. Login classification');
  printTable(['Population', 'Full', 'Login-related', 'Login-stripped'], [
    ['Unknown claims', report.loginClassification.comparison.unknownClaims.fullCount, report.loginClassification.comparison.unknownClaims.loginRelatedCount, report.loginClassification.comparison.unknownClaims.loginStrippedCount],
    ['All claims', report.loginClassification.comparison.claims.fullCount, report.loginClassification.comparison.unknownClaims.loginRelatedCount, report.loginClassification.comparison.claims.loginStrippedCount],
    ['Roadblocks', report.loginClassification.comparison.roadblocks.fullCount, report.loginClassification.comparison.roadblocks.loginRelatedCount, report.loginClassification.comparison.roadblocks.loginStrippedCount],
  ]);
  console.log(`Rule: ${report.loginClassification.rule}`);
  const loginClassifiedClaims = report.loginClassification.items.filter((item) => item.kind === 'unknown-claim');
  console.log(`\nLogin-classified Unknown claims (${loginClassifiedClaims.length})`);
  printTable(['Service', 'ID', 'Text', 'Matched by'], loginClassifiedClaims.map((item) => [item.service, item.id, truncate(item.text, 110), item.matchedBy.join(', ')]));

  console.log('\n3. Expectations grid');
  printTable(['Service', ...expectationColumns], report.expectations.services.map((service) => [
    service.service,
    ...expectationColumns.map((column) => {
      const cell = service.cells[column];
      const supportCount = cell.supportingClaimIds.stated.length + cell.supportingClaimIds.mentioned.length;
      return `${cell.state}${supportCount ? ` (${supportCount})` : ''}${cell.stale ? ' stale' : ''}${cell.unreviewed ? ' unreviewed' : ''}`;
    }),
  ]));
  console.log('\nExpectation states by column');
  printTable(['Column', 'Stated', 'Mentioned', 'Absent'], expectationColumns.map((column) => [
    column,
    report.expectations.countsByColumn[column].stated,
    report.expectations.countsByColumn[column].mentioned,
    report.expectations.countsByColumn[column].absent,
  ]));
  console.log('\nStated-cell justifications (reviewed state)');
  printTable(['Service', 'Column', 'Grade', 'Claim ID', 'Stale', 'Human-reviewed', 'Claim text'], report.expectations.statedCellJustifications.map((entry) => [
    entry.service,
    entry.column,
    entry.evidenceGrade,
    entry.claimId,
    entry.stale ? 'yes' : 'no',
    entry.reviewed ? 'yes' : 'no',
    truncate(entry.text, 200),
  ]));
  console.log('\nExpectation proposals requiring review');
  printTable(['Service', 'Column', 'Proposed state', 'Claim IDs', 'Reasons'], report.expectations.ambiguities.map((entry) => [
    entry.service,
    entry.column,
    entry.proposedState,
    entry.claimIds.join(', '),
    truncate(entry.reasons.join(' '), 180),
  ]));
  const reviewedCells = report.expectations.services.flatMap((service) => expectationColumns.map((column) => service.cells[column])).filter((cell) => cell.reviewed).length;
  console.log(`Human-reviewed cells: ${reviewedCells} of ${report.expectations.services.length * expectationColumns.length}. Proposal review notes: ${report.expectations.ambiguities.length}. Sidecar: ${relative(projectRoot, expectationTagsPath)}.`);

  console.log('\n4. Public error catalogue');
  printTable(['Service', 'Node', 'Actual error', 'URL'], report.publicErrors.map((error) => [error.service, error.nodeId, truncate(error.actualError, 100), error.url ?? `[${error.urls.length} candidate URLs]`]));

  console.log('\n5. Documentation shelf');
  printTable(['Service', 'Raw entries', 'Deduplicated URLs'], report.documentationShelf.groups.map((group) => [group.service, group.sourceEntryCount, group.deduplicatedEntryCount]));

  console.log('\n6. Auditor excerpts');
  printTable(['File', 'Heading', 'Excerpt'], report.auditorExcerpts.map((excerpt) => [excerpt.file, excerpt.heading ?? '(fallback)', truncate(excerpt.excerpt, 140)]));

  console.log('\n7. Recurring phrases');
  printTable(['Phrase family', 'Exact', 'Close variants', 'Total'], report.recurringPhrases.map((phrase) => [phrase.canonical, phrase.exactCount, phrase.closeVariantCount, phrase.count]));

  console.log('\nClassification ambiguities');
  printTable(['Area', 'Count', 'Disposition'], [
    ['Login', report.loginClassification.ambiguities.length, 'Listed in report.json; indirect linked-context matches retained for review.'],
    ['Expectations', report.expectations.ambiguities.length, 'Listed in report.json and expectation-tags.json; editable reviewState values drive the grid.'],
    ['Documentation shelf', report.documentationShelf.ambiguities.length, 'All differing URL-description variants retained.'],
    ['Audits', report.auditorExcerpts.filter((excerpt) => excerpt.ambiguous).length, 'Fallback extraction is labelled.'],
    ['Public error URLs', report.publicErrors.filter((error) => !error.url).length, 'All candidate URLs retained; no single URL invented.'],
  ]);
  console.log(`\nWrote ${relative(projectRoot, reportPath)} and ${relative(projectRoot, expectationTagsPath)}.`);
}

const ledgers = [];
for (const serviceManifest of reportServices) {
  const filename = serviceManifest.ledgerFile;
  const data = JSON.parse(await readFile(join(ledgerDirectory, filename), 'utf8'));
  if (data.meta?.dataKind !== 'research') throw new Error(`Manifest report service ${serviceManifest.id} does not point to a research ledger.`);
  const serviceId = serviceManifest.reportServiceId ?? serviceManifest.id;
  ledgers.push({ filename, serviceId, service: serviceNames[serviceId], data });
}
if (ledgers.length !== reportServices.length) throw new Error(`Expected ${reportServices.length} report ledgers from the manifest; found ${ledgers.length}.`);

const window = await researchWindow();
const existingExpectationTags = await readExistingExpectationTags();
const expectationSidecar = applyRequiredReviewDecisions(buildExpectationSidecar(ledgers, existingExpectationTags));
await mkdir(dirname(expectationTagsPath), { recursive: true });
await writeFile(expectationTagsPath, `${JSON.stringify(expectationSidecar, null, 2)}\n`);
const reviewedExpectationTags = JSON.parse(await readFile(expectationTagsPath, 'utf8'));

const documentationShelf = await collectDocumentationShelf(ledgers);
const auditorExcerpts = await collectAuditExcerpts();
const loginClassification = classifyLoginRelated(ledgers);
const expectations = deriveExpectationGrid(ledgers, reviewedExpectationTags);
const publicErrors = collectPublicErrors(ledgers);
const recurringPhrases = collectRecurringPhrases(ledgers);

const report = {
  meta: {
    title: `${reportTitle} — derived figures`,
    generatedBy: 'scripts/report-figures.mjs',
    ledgerFiles: ledgers.map((ledger) => `ledger/${ledger.filename}`),
    handoffGlob: 'research/handoffs/*.json',
    auditGlob: 'research/audit*/*.md',
    expectationTagsFile: relative(projectRoot, expectationTagsPath),
  },
  totals: buildTotals(ledgers, window),
  loginClassification,
  expectations,
  publicErrors,
  documentationShelf,
  auditorExcerpts,
  recurringPhrases,
};

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
printSummary(report);
