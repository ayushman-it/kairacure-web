import React from 'react';
import { clientHospitals } from './clientHospitals.js';
import medicalVideoSrc from '../assets/new+website+video+desktop+(1).mp4';

export const BRAND_NAME = 'Kairacure';
export function getApiBase() {
  const configuredBase = import.meta.env.VITE_API_BASE_URL || '/api';
  if (typeof window === 'undefined') return configuredBase;
  const host = window.location.hostname;
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const configuredUrl = String(configuredBase);
  if (!isLocalHost && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/api/i.test(configuredUrl)) {
    return '/api';
  }
  return configuredBase;
}

export const API_BASE = getApiBase();
export const MEDICAL_VIDEO = medicalVideoSrc;

export const PAGE_PATHS = {
  home: '/',
  treatments: '/treatments',
  destinations: '/destinations',
  partners: '/partners',
  doctors: '/doctors',
  planner: '/plan-my-journey',
  admin: '/admin',
  login: '/login',
  'ai-assistant': '/ai-assistant',
  'treatment-detail': '/treatments/detail',
  'partner-detail': '/partners/detail',
  'doctor-detail': '/doctors/detail',
};

export function readStoredPatientSession() {
  if (typeof window === 'undefined') return { token: '', patient: null };
  try {
    const token = window.localStorage.getItem('KairacurePatientToken') || window.localStorage.getItem('kairacurePatientToken') || '';
    const patientJson = window.localStorage.getItem('KairacurePatient') || window.localStorage.getItem('kairacurePatient') || 'null';
    return { token, patient: JSON.parse(patientJson) };
  } catch {
    return { token: '', patient: null };
  }
}

export function getPatientAttribution() {
  const { patient } = readStoredPatientSession();
  if (!patient?.patientId) return {};
  return {
    patientId: patient.patientId,
    userId: patient.patientId,
    userName: patient.name || '',
    userEmail: patient.email || '',
  };
}

export function formatShortName(name = '') {
  const trimmed = String(name || '').trim();
  return trimmed.length > 16 ? `${trimmed.slice(0, 15)}...` : trimmed;
}

export function pageFromPath(pathname) {
  const cleanPath = pathname.replace(/\/$/, '') || '/';
  if (cleanPath === '/hospitals') return 'partners';
  if (cleanPath === '/hospitals/detail') return 'partner-detail';
  return Object.entries(PAGE_PATHS).find(([, path]) => path === cleanPath)?.[0] ?? 'home';
}

export function pathForPage(page) {
  return PAGE_PATHS[page] ?? '/';
}

export const TREATMENT_GROUPS = ['Medical', 'Aesthetic', 'Wellness'];

export const DEFAULT_TREATMENTS = [
  { id: 't-cabg', title: 'Heart Bypass Surgery (CABG)', group: 'Medical', specialty: 'Cardiology', packageFrom: 250000, value: 95, description: 'Coronary artery bypass grafting surgery for severe heart blockages with post-op cardiac ICU care.' },
  { id: 't-knee', title: 'Total Knee Replacement', group: 'Medical', specialty: 'Orthopedics', packageFrom: 180000, value: 92, description: 'Minimally invasive total knee replacement surgery with ceramic/metal implants and rehabilitation.' },
  { id: 't-chemo', title: 'Chemotherapy & Targeted Oncology Care', group: 'Medical', specialty: 'Oncology', packageFrom: 150000, value: 90, description: 'Targeted immunotherapy, radiation planning, and chemotherapy under senior oncologists.' },
  { id: 't-spine', title: 'Lumbar Spine Discectomy & Fusion', group: 'Medical', specialty: 'Spine Surgery', packageFrom: 220000, value: 88, description: 'Decompression and spinal fusion surgery for chronic back pain, herniated discs, and nerve compression.' },
  { id: 't-urology', title: 'Robotic Prostate Surgery & Kidney Stone RIRSL', group: 'Medical', specialty: 'Urology', packageFrom: 160000, value: 87, description: 'Laser stone removal and DaVinci robotic prostatectomy surgery.' },
  { id: 't-ivf', title: 'IVF & Fertility Treatment Package', group: 'Wellness', specialty: 'Fertility', packageFrom: 140000, value: 91, description: 'Advanced IVF cycle with ICSI, embryo freezing, and blastocyst culture support.' },
  { id: 't-lasik', title: 'Femto-LASIK Eye Surgery', group: 'Aesthetic', specialty: 'Ophthalmology', packageFrom: 65000, value: 94, description: 'Blade-free 100% laser vision correction for myopia, hyperopia, and astigmatism.' },
  { id: 't-hair', title: 'FUE Hair Transplant (3500 Grafts)', group: 'Aesthetic', specialty: 'Cosmetic', packageFrom: 75000, value: 93, description: 'High-density painless FUE hair restoration with PRP growth factor therapy.' },
];

export const TREATMENTS = DEFAULT_TREATMENTS;
export const HOSPITALS = clientHospitals;
export const INDIA_HOSPITALS = HOSPITALS.filter((hospital) => hospital.country === 'India');

export const WHY_US = [
  ['Free Second Opinion', 'Consult top specialists with your medical reports, without extra charges.'],
  ['Lowest cost guarantee', 'Your treatment cost reduces through negotiated hospital and package rates.'],
  ['Free medical expert', 'A dedicated expert helps you choose care and monitors your progress.'],
  ['Seamless travel planning', 'Visa invitation, hotel, airport pickup, and translators are coordinated for you.'],
];

export const TRUST_METRICS = [
  ['100k+', 'patient journeys benchmarked'],
  ['38+', 'destination countries tracked'],
  ['1,500+', 'partner hospitals mapped'],
  ['48h', 'medical opinion target'],
];

export const JOURNEY_FLOW = [
  ['01', 'Share reports', 'Upload case notes and tell us your preferred destination, budget, and travel timeline.'],
  ['02', 'Get opinion and estimate', 'Receive doctor opinion, hospital package, stay, visa, and travel assumptions in one view.'],
  ['03', 'Plan arrival', 'Coordinate visa letter, flights, airport pickup, interpreter, hotel, and admission timing.'],
  ['04', 'Recover and follow up', 'Track discharge support, pharmacy help, follow-up consults, and return travel planning.'],
];

export const FREE_SUPPORT = [
  'Medical opinion and cost estimate',
  'Pre-travel consultation',
  'Medical visa invitation letter',
  'Airport pickup and local transport',
  'Hotel or guest house near hospital',
  'Interpreter and translator support',
  'SIM, money exchange, and local guidance',
  'Follow-up care coordination',
];

export const COUNTRY_SUPPORT = [
  ['Middle East', 'Arabic support, visa help, family stay planning'],
  ['Africa', 'Case manager guidance, airport pickup, cost clarity'],
  ['CIS', 'Russian language support and specialist matching'],
  ['SAARC', 'Fast hospital quotes and affordable travel planning'],
];

export const DEFAULT_HOME_FAQS = [
  { id: 'faq-help', icon: 'fa-hand-holding-medical', question: 'How does Kairacure help patients?', answer: 'We help compare partner hospitals, doctors, treatment costs in Indian Rupees, appointment slots, travel support, and follow-up steps in one place.', visible: true },
  { id: 'faq-compare', icon: 'fa-code-compare', question: 'Can I compare partner hospitals before booking?', answer: 'Yes. Patients can compare hospital profile, doctor availability, estimated package, ratings, city, and treatment focus before requesting an appointment.', visible: true },
  { id: 'faq-opinion', icon: 'fa-file-medical', question: 'Is the second opinion support free?', answer: 'The care team can guide report sharing and coordinate available second-opinion options before the patient travels.', visible: true },
  { id: 'faq-number', icon: 'fa-phone-volume', question: 'What happens after I submit my number?', answer: 'A care expert follows up for reports, INR cost estimate, hospital options, doctor selection, and appointment planning.', visible: true },
  { id: 'faq-cost', icon: 'fa-indian-rupee-sign', question: 'Are treatment costs shown in Indian Rupees?', answer: 'Yes. Website estimates are shown in INR by default so patients can understand India treatment packages clearly.', visible: true },
  { id: 'faq-travel', icon: 'fa-plane-arrival', question: 'Can Kairacure help with travel and stay?', answer: 'Yes. The team can coordinate visa invitation, airport pickup, nearby stay, translator support, and follow-up planning.', visible: true },
];

export const CURRENCIES = {
  USD: { code: 'USD', rate: 1 },
  INR: { code: 'INR', rate: 83 },
  AED: { code: 'AED', rate: 3.67 },
  EUR: { code: 'EUR', rate: 0.92 },
};

export function formatCurrency(value, currency = 'INR') {
  const current = CURRENCIES[currency] ?? CURRENCIES.USD;
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: current.code,
    maximumFractionDigits: 0,
  }).format(value * current.rate);
}

export function formatPackageEstimate(value, money) {
  const amount = Number(value || 0);
  return amount > 0 ? `Starting from ${money(amount)}` : 'Cost on request';
}

export function totalCost(hospital, treatment) {
  const packageCost = treatment && hospital.tags.includes(treatment.title) ? treatment.packageFrom : hospital.cost.package;
  return packageCost + hospital.cost.flight + hospital.cost.visa + hospital.cost.local + hospital.cost.stay + hospital.cost.service;
}

export function hospitalMatchesTreatment(hospital, treatment) {
  if (!hospital || !treatment) return false;
  const tags = Array.isArray(hospital.tags) ? hospital.tags : [];
  return tags.includes(treatment.title) || hospital.specialty === treatment.specialty;
}

export function accreditationText(accreditations, fallback = 'Accredited Healthcare Facility') {
  if (Array.isArray(accreditations)) return accreditations.slice(0, 3).join(', ') || fallback;
  return String(accreditations || '').trim() || fallback;
}

export const HOSPITAL_PLACEHOLDER_IMAGE = 'https://placehold.co/1200x780/eef4ff/2874fc?text=Hospital+Image';
export const HEALTH_ICON_BASE = 'https://healthicons.org/icons/svg/filled';
export const HEALTH_ICON_SOURCES = {
  cardiac: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/cardiology.svg',
  orthopedics: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/orthopaedics.svg',
  oncology: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/oncology.svg',
  urology: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/urology.svg',
  gynecology: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/gynecology.svg',
  ophthalmology: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/opthalmology.svg',
  gastroenterology: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/gastroenterology.svg',
  emergency: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/accident-and_emergency.svg',
  pediatrics: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/pediatrics.svg',
  nephrology: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/nephrology.svg',
  neurology: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/people/neurosurgery.svg',
  ent: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/ear-nose-and-throat.svg',
  dermatology: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/conditions/skin-cancer.svg',
  respirology: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/respirology.svg',
  rheumatology: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/rheumatology.svg',
  endocrinology: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/endocrinology.svg',
  hematology: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/hematology.svg',
  hepatology: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/hepatology.svg',
  spine: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/body/spine.svg',
  dental: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/body/tooth.svg',
  hair: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/body/head.svg',
  infertility: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/body/female-reproductive_system.svg',
  wellness: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/gym.svg',
  plastic: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/surgical-department.svg',
  general: 'https://cdn.jsdelivr.net/npm/healthicons@0.1.0/public/icons/svg/outline/specialties/outpatient.svg',
};

export function getTreatmentIconKind(treatment = {}) {
  const text = `${treatment.id || ''} ${treatment.title || ''} ${treatment.specialty || ''}`.toLowerCase();
  if (/cardiac|heart|cabg|valve|angioplasty|bypass|stent/.test(text)) return 'cardiac';
  if (/ortho|joint|knee|hip|bone|sports|fracture|arthro/.test(text)) return 'orthopedics';
  if (/oncology|cancer|chemo|tumou?r|radiation/.test(text)) return 'oncology';
  if (/gastro|stomach|liver|colon|digest|intestin|bowel/.test(text)) return 'gastroenterology';
  if (/neuro|brain|stroke|epilep|parkinson|alzheimer/.test(text)) return 'neurology';
  if (/spine|spinal|disc|vertebra/.test(text)) return 'spine';
  if (/urology|kidney|stone|prostat|bladder|dialysis/.test(text)) return 'urology';
  if (/gynecology|gynaecology|gyne|gynae|ovarian|uterus|cervix/.test(text)) return 'gynecology';
  if (/fertility|ivf|infertility/.test(text)) return 'infertility';
  if (/ent|ear|nose|throat|tonsil|sinus/.test(text)) return 'ent';
  if (/eye|ophthalm|cataract|retina|vision|lasik|glaucoma/.test(text)) return 'ophthalmology';
  if (/dental|tooth|teeth|oral|gum|implant/.test(text)) return 'dental';
  if (/hair|transplant/.test(text)) return 'hair';
  if (/skin|derma|cosmetic|aesthetic/.test(text)) return 'dermatology';
  return 'general';
}

export function getHospitalImage(hospital) {
  return String(hospital?.image || '').trim() || HOSPITAL_PLACEHOLDER_IMAGE;
}

export function handleImageFallback(event) {
  if (event.currentTarget.src !== HOSPITAL_PLACEHOLDER_IMAGE) {
    event.currentTarget.src = HOSPITAL_PLACEHOLDER_IMAGE;
  }
}

export function buildAvailableDestinations(hospitals = []) {
  const cityCopy = {
    Chennai: 'High-volume cardiac, transplant, and multispeciality treatment programs.',
    Delhi: 'Complex treatment programs with large multispeciality care teams.',
    Gurgaon: 'NCR hospitals for complex surgery, recovery planning, and international patient support.',
    Mumbai: 'Advanced diagnostics, oncology, cardiac care, and executive health checkups.',
    Bangalore: 'Technology-led hospitals for eye care, orthopedics, fertility, and wellness.',
    Bengaluru: 'Technology-led hospitals for eye care, orthopedics, fertility, and wellness.',
  };
  const grouped = new Map();
  hospitals
    .filter((hospital) => hospital.country === 'India' && hospital.city)
    .forEach((hospital) => {
      const key = hospital.city.trim();
      const current = grouped.get(key) || {
        country: key,
        line: cityCopy[key] || `Available ${hospital.specialty?.toLowerCase() || 'specialist'} care teams and coordinated hospital support.`,
        packageFrom: Number.POSITIVE_INFINITY,
        hospitals: 0,
        doctors: 0,
        image: hospital.image,
      };
      current.hospitals += 1;
      current.doctors += Number(hospital.doctors) || 0;
      current.packageFrom = Math.min(current.packageFrom, Number(hospital.cost?.package) || Number.POSITIVE_INFINITY);
      if (!current.image && hospital.image) current.image = hospital.image;
      grouped.set(key, current);
    });
  return Array.from(grouped.values())
    .map((destination) => ({
      ...destination,
      packageFrom: Number.isFinite(destination.packageFrom) ? destination.packageFrom : 0,
      doctors: destination.doctors || destination.hospitals,
      image: destination.image || HOSPITAL_PLACEHOLDER_IMAGE,
    }))
    .sort((a, b) => a.country.localeCompare(b.country));
}



export const SEARCH_ALIASES = {
  cardiac: ['cariac', 'heart', 'cardiology', 'bypass', 'cabg', 'angioplasty'],
  orthopedics: ['ortho', 'bone', 'joint', 'knee', 'hip', 'arthritis'],
  oncology: ['cancer', 'tumor', 'chemo', 'radiation'],
  spine: ['back pain', 'disc', 'spinal', 'neck pain'],
  urology: ['kidney', 'stone', 'prostate', 'urine'],
  infertility: ['ivf', 'fertility', 'pregnancy'],
  hair: ['hair loss', 'baldness', 'graft'],
  dental: ['teeth', 'implant', 'smile'],
  plastic: ['cosmetic', 'aesthetic', 'rhinoplasty'],
  ophthalmology: ['eye', 'cataract', 'lasik', 'retina'],
};

export function normalizeSearch(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function getTreatmentDisplayTitle(treatment = {}) {
  let displayTitle = treatment.title || 'Treatment';
  displayTitle = displayTitle
    .replace(/Other specified certain joint disorders, not elsewhere classified/gi, 'Joint Treatment')
    .replace(/Abrasion of knee/gi, 'Knee Treatment')
    .replace(/Other specified.*not elsewhere classified/gi, 'Specialized Treatment')
    .replace(/Certain disorders.*not elsewhere classified/gi, 'Medical Treatment')
    .replace(/Inflammatory arthropathies, unspecified/gi, 'Arthritis Treatment')
    .replace(/Other specified/gi, 'Specialized')
    .replace(/not elsewhere classified/gi, '')
    .replace(/,\s*$/g, '')
    .trim();

  return displayTitle.length > 42 ? `${displayTitle.slice(0, 39)}...` : displayTitle;
}

export function getTreatmentPageTitle(treatment = {}) {
  const displayTitle = getTreatmentDisplayTitle(treatment);
  return /treatment$/i.test(displayTitle) ? displayTitle : `${displayTitle} Treatment`;
}

export function hasUsefulTreatmentDescription(description = '') {
  const text = String(description || '').trim();
  if (text.length < 24) return false;
  return !/^WHO ICD-11 MMS mapped condition/i.test(text);
}

export function buildTreatmentMeaning(treatment = {}) {
  const displayTitle = getTreatmentDisplayTitle(treatment);
  const pageTitle = getTreatmentPageTitle(treatment);
  const rawCondition = treatment.icdMatchedText || treatment.icdTitle || treatment.title || displayTitle;
  const condition = getTreatmentDisplayTitle({ title: rawCondition });
  const code = treatment.icdCode || treatment.procedureCode || treatment.code || '';
  const source = treatment.sourceSystem || (code ? 'ICD-11 medical catalog' : 'Treatment catalog');
  const release = treatment.sourceRelease || '';
  const backendDescription = String(treatment.description || '').trim();
  const description = hasUsefulTreatmentDescription(backendDescription)
    ? backendDescription
    : `${pageTitle} is mapped as ${condition}. Kairacure uses this treatment mapping to understand the patient case, prepare the report checklist, shortlist suitable hospitals, and build a practical journey plan.`;

  return {
    code,
    condition,
    description,
    displayTitle,
    pageTitle,
    release,
    source,
  };
}

export function withBackendHospitalDefaults(item, index = 0) {
  const fallback = INDIA_HOSPITALS[index % INDIA_HOSPITALS.length] || INDIA_HOSPITALS[0];
  const tags = Array.isArray(item.tags) && item.tags.length
    ? item.tags
    : String(item.treatments || item.specialty || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  const packageFrom = Number(item.packageFrom || item.cost?.package || fallback.cost.package || 0);

  return {
    ...fallback,
    ...item,
    id: item._id || item.id || `backend-hospital-${index + 1}`,
    name: item.name || fallback.name,
    city: item.city || fallback.city,
    country: item.country || 'India',
    specialty: item.specialty || tags[0] || fallback.specialty,
    tags: tags.length ? tags : fallback.tags,
    image: item.image || '',
    galleryImages: item.galleryImages || fallback.galleryImages || [],
    patientReviews: item.patientReviews || fallback.patientReviews || [],
    doctor: item.doctor || fallback.doctor,
    doctorTitle: item.doctorTitle || fallback.doctorTitle,
    doctorImage: item.doctorImage || item.profileImage || fallback.doctorImage,
    doctorFocus: Array.isArray(item.doctorFocus) ? item.doctorFocus : fallback.doctorFocus || [],
    accreditations: item.accreditations || fallback.accreditations || [],
    rating: Number(item.rating || fallback.rating || 4.8),
    summary: item.summary || fallback.summary,
    cost: {
      ...fallback.cost,
      ...(item.cost || {}),
      package: packageFrom || fallback.cost.package,
    },
  };
}

export function withBackendTreatmentDefaults(item, index = 0) {
  // Use backend data only - no fallback to dummy treatments
  const title = item.title || item.icdTitle || `Treatment ${index + 1}`;
  return {
    ...item,
    id: item._id || item.id || normalizeSearch(title).replace(/\s+/g, '-') || `backend-treatment-${index + 1}`,
    title,
    group: item.group || item.category || item.specialty || item.subtitle || 'Medical',
    specialty: item.specialty || item.category || item.group || item.subtitle || 'General',
    category: item.category || item.group || item.specialty || 'Medical',
    procedureCode: item.procedureCode || item.icdCode || item.code || '',
    icdCode: item.icdCode || item.procedureCode || item.code || '',
    icdUri: item.icdUri || '',
    icdEntityId: item.icdEntityId || '',
    icdBrowserUrl: item.icdBrowserUrl || '',
    sourceSystem: item.sourceSystem || '',
    packageFrom: Number(item.packageFrom || 0),
    image: item.image || '',
    description: item.description || '',
    value: Number(item.value || 85),
  };
}

export function getSearchOptionsFromData(query, treatments, hospitals) {
  const search = normalizeSearch(query);
  if (!search) return [];

  const options = [];
  treatments.forEach((treatment) => {
    const aliases = SEARCH_ALIASES[treatment.id] ?? [];
    const haystack = normalizeSearch([treatment.title, treatment.group, treatment.specialty, treatment.category, treatment.procedureCode, treatment.icdCode, treatment.sourceSystem, ...aliases].join(' '));
    if (haystack.includes(search) || aliases.some((alias) => normalizeSearch(alias).includes(search))) {
      options.push({ type: 'Treatment', label: treatment.title, meta: treatment.icdCode ? `ICD-11 ${treatment.icdCode} - ${treatment.group}` : `${treatment.group} package estimate`, treatment });
    }
  });

  hospitals.forEach((hospital) => {
    const tags = Array.isArray(hospital.tags) ? hospital.tags : [];
    const doctorFocus = Array.isArray(hospital.doctorFocus) ? hospital.doctorFocus : [];
    const haystack = normalizeSearch([hospital.name, hospital.city, hospital.country, hospital.specialty, hospital.doctor, ...tags, ...doctorFocus].join(' '));
    if (haystack.includes(search)) {
      options.push({ type: 'Hospital', label: hospital.name, meta: `${hospital.city}, ${hospital.country}`, hospital });
      options.push({ type: 'Doctor', label: hospital.doctor, meta: `${hospital.doctorTitle} - ${hospital.name}`, hospital });
    }
  });

  buildAvailableDestinations(hospitals).forEach((destination) => {
    if (normalizeSearch(destination.country).includes(search)) {
      options.push({ type: 'Destination', label: destination.country, meta: `${destination.hospitals} hospitals, ${destination.doctors} doctors`, destination });
    }
  });

  return options.slice(0, 8);
}

export function getSearchOptions(query) {
  return getSearchOptionsFromData(query, TREATMENTS, INDIA_HOSPITALS);
}

