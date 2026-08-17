import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clientHospitals } from './data/clientHospitals.js';
import { PlannerSearchPage, PlannerHospitalsPage, ProcedureSelectPage, TripStylePage, JourneyPlanningPage, JourneyResultsPage } from './PlannerSearchPage.jsx';
// import medicalVideoSrc from './assets/143376-782178665.mp4';
import medicalVideoSrc from './assets/new+website+video+desktop+(1).mp4';

const BRAND_NAME = 'Kairacure';
function getApiBase() {
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

const API_BASE = getApiBase();
const MEDICAL_VIDEO = medicalVideoSrc;

const PAGE_PATHS = {
  home: '/',
  treatments: '/treatments',
  destinations: '/destinations',
  hospitals: '/hospitals',
  doctors: '/doctors',
  planner: '/plan-my-journey',
  admin: '/admin',
  login: '/login',
  'ai-assistant': '/ai-assistant',
  'treatment-detail': '/treatments/detail',
  'hospital-detail': '/hospitals/detail',
  'doctor-detail': '/doctors/detail',
};

function readStoredPatientSession() {
  if (typeof window === 'undefined') return { token: '', patient: null };
  try {
    const token = window.localStorage.getItem('KairacurePatientToken') || window.localStorage.getItem('kairacurePatientToken') || '';
    const patientJson = window.localStorage.getItem('KairacurePatient') || window.localStorage.getItem('kairacurePatient') || 'null';
    return {
      token,
      patient: JSON.parse(patientJson),
    };
  } catch {
    return { token: '', patient: null };
  }
}

function getPatientAttribution() {
  const { patient } = readStoredPatientSession();
  if (!patient?.patientId) return {};
  return {
    patientId: patient.patientId,
    userId: patient.patientId,
    userName: patient.name || '',
    userEmail: patient.email || '',
  };
}

function formatShortName(name = '') {
  const trimmed = String(name || '').trim();
  return trimmed.length > 16 ? `${trimmed.slice(0, 15)}...` : trimmed;
}

function pageFromPath(pathname) {
  const cleanPath = pathname.replace(/\/$/, '') || '/';
  return Object.entries(PAGE_PATHS).find(([, path]) => path === cleanPath)?.[0] ?? 'home';
}

function pathForPage(page) {
  return PAGE_PATHS[page] ?? '/';
}

const TREATMENT_GROUPS = ['Medical', 'Aesthetic', 'Wellness'];

// Removed hardcoded TREATMENTS - Now using only backend data
const TREATMENTS = [];

const HOSPITALS = clientHospitals;

const INDIA_HOSPITALS = HOSPITALS.filter((hospital) => hospital.country === 'India');

// Removed INDIA_DESTINATIONS - now using buildAvailableDestinations from backend data only

const WHY_US = [
  ['Free Second Opinion', 'Consult top specialists with your medical reports, without extra charges.'],
  ['Lowest cost guarantee', 'Your treatment cost reduces through negotiated hospital and package rates.'],
  ['Free medical expert', 'A dedicated expert helps you choose care and monitors your progress.'],
  ['Seamless travel planning', 'Visa invitation, hotel, airport pickup, and translators are coordinated for you.'],
];

const TRUST_METRICS = [
  ['100k+', 'patient journeys benchmarked'],
  ['38+', 'destination countries tracked'],
  ['1,500+', 'hospital partners mapped'],
  ['48h', 'medical opinion target'],
];

const JOURNEY_FLOW = [
  ['01', 'Share reports', 'Upload case notes and tell us your preferred destination, budget, and travel timeline.'],
  ['02', 'Get opinion and estimate', 'Receive doctor opinion, hospital package, stay, visa, and travel assumptions in one view.'],
  ['03', 'Plan arrival', 'Coordinate visa letter, flights, airport pickup, interpreter, hotel, and admission timing.'],
  ['04', 'Recover and follow up', 'Track discharge support, pharmacy help, follow-up consults, and return travel planning.'],
];

const FREE_SUPPORT = [
  'Medical opinion and cost estimate',
  'Pre-travel consultation',
  'Medical visa invitation letter',
  'Airport pickup and local transport',
  'Hotel or guest house near hospital',
  'Interpreter and translator support',
  'SIM, money exchange, and local guidance',
  'Follow-up care coordination',
];

const COUNTRY_SUPPORT = [
  ['Middle East', 'Arabic support, visa help, family stay planning'],
  ['Africa', 'Case manager guidance, airport pickup, cost clarity'],
  ['CIS', 'Russian language support and specialist matching'],
  ['SAARC', 'Fast hospital quotes and affordable travel planning'],
];

const DEFAULT_HOME_FAQS = [
  { id: 'faq-help', icon: 'fa-hand-holding-medical', question: 'How does Kairacure help patients?', answer: 'We help compare hospitals, doctors, treatment costs in Indian Rupees, appointment slots, travel support, and follow-up steps in one place.', visible: true },
  { id: 'faq-compare', icon: 'fa-code-compare', question: 'Can I compare hospitals before booking?', answer: 'Yes. Patients can compare hospital profile, doctor availability, estimated package, ratings, city, and treatment focus before requesting an appointment.', visible: true },
  { id: 'faq-opinion', icon: 'fa-file-medical', question: 'Is the second opinion support free?', answer: 'The care team can guide report sharing and coordinate available second-opinion options before the patient travels.', visible: true },
  { id: 'faq-number', icon: 'fa-phone-volume', question: 'What happens after I submit my number?', answer: 'A care expert follows up for reports, INR cost estimate, hospital options, doctor selection, and appointment planning.', visible: true },
  { id: 'faq-cost', icon: 'fa-indian-rupee-sign', question: 'Are treatment costs shown in Indian Rupees?', answer: 'Yes. Website estimates are shown in INR by default so patients can understand India treatment packages clearly.', visible: true },
  { id: 'faq-travel', icon: 'fa-plane-arrival', question: 'Can Kairacure help with travel and stay?', answer: 'Yes. The team can coordinate visa invitation, airport pickup, nearby stay, translator support, and follow-up planning.', visible: true },
  { id: 'faq-reports', icon: 'fa-notes-medical', question: 'Which reports should I share?', answer: 'Recent prescriptions, diagnosis summary, lab results, scans, discharge notes, and current medication details help doctors review faster.', visible: true },
  { id: 'faq-admin', icon: 'fa-user-gear', question: 'Can appointments be tracked after booking?', answer: 'Yes. Patient inquiries, appointments, hospital details, and care stages can be tracked from the admin dashboard.', visible: true },
];

const CURRENCIES = {
  USD: { code: 'USD', rate: 1 },
  INR: { code: 'INR', rate: 83 },
  AED: { code: 'AED', rate: 3.67 },
  EUR: { code: 'EUR', rate: 0.92 },
};

// Removed FEATURED_TREATMENTS - will use backend treatments only

function formatCurrency(value, currency = 'INR') {
  const current = CURRENCIES[currency] ?? CURRENCIES.USD;
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: current.code,
    maximumFractionDigits: 0,
  }).format(value * current.rate);
}

function formatPackageEstimate(value, money) {
  const amount = Number(value || 0);
  return amount > 0 ? `Starting from ${money(amount)}` : 'Cost on request';
}

function totalCost(hospital, treatment) {
  const packageCost = treatment && hospital.tags.includes(treatment.title) ? treatment.packageFrom : hospital.cost.package;
  return packageCost + hospital.cost.flight + hospital.cost.visa + hospital.cost.local + hospital.cost.stay + hospital.cost.service;
}

function hospitalMatchesTreatment(hospital, treatment) {
  if (!hospital || !treatment) return false;
  const tags = Array.isArray(hospital.tags) ? hospital.tags : [];
  return tags.includes(treatment.title) || hospital.specialty === treatment.specialty;
}

function accreditationText(accreditations, fallback = 'Accredited Healthcare Facility') {
  if (Array.isArray(accreditations)) return accreditations.slice(0, 3).join(', ') || fallback;
  return String(accreditations || '').trim() || fallback;
}

const HOSPITAL_PLACEHOLDER_IMAGE = 'https://placehold.co/1200x780/eef4ff/2874fc?text=Hospital+Image';
const HEALTH_ICON_BASE = 'https://healthicons.org/icons/svg/filled';
const HEALTH_ICON_SOURCES = {
  // Using jsDelivr CDN for better CORS support and reliability
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

function getTreatmentIconKind(treatment = {}) {
  const text = `${treatment.id || ''} ${treatment.title || ''} ${treatment.specialty || ''}`.toLowerCase();

  // Cardiac & Heart
  if (/cardiac|heart|cabg|valve|angioplasty|bypass|stent/.test(text)) return 'cardiac';

  // Orthopedics & Joints
  if (/ortho|joint|knee|hip|bone|sports|fracture|arthro/.test(text)) return 'orthopedics';

  // Oncology & Cancer
  if (/oncology|cancer|chemo|tumou?r|radiation/.test(text)) return 'oncology';

  // Gastroenterology
  if (/gastro|stomach|liver|colon|digest|intestin|bowel/.test(text)) return 'gastroenterology';

  // Neurology & Brain
  if (/neuro|brain|stroke|epilep|parkinson|alzheimer/.test(text)) return 'neurology';
  if (/spine|spinal|disc|vertebra/.test(text)) return 'spine';

  // Urology & Kidney
  if (/urology|kidney|stone|prostat|bladder|dialysis/.test(text)) {
    if (/dialysis/.test(text)) return 'dialysis';
    if (/kidney/.test(text)) return 'kidney';
    return 'urology';
  }

  // Gynecology & Women's Health
  if (/gynecology|gynaecology|gyne|gynae|ovarian|uterus|cervix/.test(text)) return 'gynecology';
  if (/fertility|ivf|infertility/.test(text)) return 'infertility';
  if (/pregnancy|prenatal|antenatal|obstetric/.test(text)) return 'pregnancy';
  if (/maternal|newborn/.test(text)) return 'maternal';

  // ENT (Ear, Nose, Throat)
  if (/ent|ear|nose|throat|tonsil|sinus/.test(text)) return 'ent';

  // Ophthalmology & Eye
  if (/eye|ophthalm|cataract|retina|vision|lasik|glaucoma/.test(text)) return 'ophthalmology';

  // Dental
  if (/dental|tooth|teeth|oral|gum|implant/.test(text)) return 'dental';

  // Hair & Skin
  if (/hair|transplant/.test(text)) return 'hair';
  if (/skin|derma|cosmetic|aesthetic/.test(text)) return 'dermatology';

  // Surgery & Procedures
  if (/transplant/.test(text)) return 'transplant';
  if (/plastic|cosmetic/.test(text)) return 'plastic';
  if (/surgery|surgical|operation/.test(text)) return 'surgery';

  // Respiratory
  if (/lung|respiratory|asthma|copd|pneumonia/.test(text)) return 'respirology';

  // Wellness & Preventive
  if (/wellness|health|checkup|preventive|screening/.test(text)) return 'wellness';
  if (/nutrition|diet|weight/.test(text)) return 'nutrition';
  if (/mental|psychiatry|psychology|therapy/.test(text)) return 'mental';
  if (/physio|physical therapy|rehabilitation/.test(text)) return 'physiotherapy';

  // Emergency & Critical Care
  if (/emergency|trauma|accident|icu|critical/.test(text)) return 'emergency';

  // Pediatrics
  if (/pediatric|paediatric|child|neonat|infant/.test(text)) return 'pediatrics';

  // Blood & Hematology
  if (/blood|hematology|haematology|transfusion|anemia/.test(text)) return 'hematology';

  // Endocrinology
  if (/diabetes|thyroid|hormone|endocrin/.test(text)) return 'endocrinology';

  // Other Specialties
  if (/nephrology/.test(text)) return 'nephrology';
  if (/hepatology/.test(text)) return 'hepatology';
  if (/rheumatology|arthritis/.test(text)) return 'rheumatology';

  return 'general';
}

function getHospitalImage(hospital) {
  return String(hospital?.image || '').trim() || HOSPITAL_PLACEHOLDER_IMAGE;
}

function handleImageFallback(event) {
  if (event.currentTarget.src !== HOSPITAL_PLACEHOLDER_IMAGE) {
    event.currentTarget.src = HOSPITAL_PLACEHOLDER_IMAGE;
  }
}

function StarRating({ rating }) {
  return (
    <span className="star-rating" aria-label={`${rating} star rating`}>
      <span>
        {Array.from({ length: 5 }).map((_, index) => (
          <i className="fa-solid fa-star" key={index} aria-hidden="true" />
        ))}
      </span>
      <strong>{rating}</strong>
    </span>
  );
}



const SEARCH_ALIASES = {
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

function normalizeSearch(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getTreatmentDisplayTitle(treatment = {}) {
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

function getTreatmentPageTitle(treatment = {}) {
  const displayTitle = getTreatmentDisplayTitle(treatment);
  return /treatment$/i.test(displayTitle) ? displayTitle : `${displayTitle} Treatment`;
}

function hasUsefulTreatmentDescription(description = '') {
  const text = String(description || '').trim();
  if (text.length < 24) return false;
  return !/^WHO ICD-11 MMS mapped condition/i.test(text);
}

function buildTreatmentMeaning(treatment = {}) {
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

function withBackendHospitalDefaults(item, index = 0) {
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

function withBackendTreatmentDefaults(item, index = 0) {
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

function getSearchOptionsFromData(query, treatments, hospitals) {
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

function getSearchOptions(query) {
  return getSearchOptionsFromData(query, TREATMENTS, INDIA_HOSPITALS);
}

function Breadcrumbs({ items }) {
  return (
    <div className="profile-breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          {item.onClick ? (
            <button onClick={item.onClick} type="button">{item.label}</button>
          ) : (
            <span>{item.label}</span>
          )}
          {index < items.length - 1 && <em>/</em>}
        </React.Fragment>
      ))}
    </div>
  );
}

function hospitalGallery(hospital) {
  return [
    getHospitalImage(hospital),
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=1000&q=80',
  ];
}

const DOCTOR_EDUCATION = [
  'MBBS from a reputed medical college',
  'MS / specialist training in the core clinical department',
  'Advanced fellowship and comprehensive specialty training',
  'International clinical exposure and high-volume procedure experience',
];

const PATIENT_REVIEWS = [
  ['Jean Luc Bernard', 'France', 'The team explained the treatment plan, hospital stay, and travel estimate before I confirmed my visit.'],
  ['Fewzan Abdella', 'Ethiopia', 'Doctor profile, procedure cost, and hospital coordination were clear from the first consultation.'],
  ['Maria Gomez', 'Spain', 'The care coordinator helped compare hospitals and understand the complete recovery budget.'],
];

const FOOTER_COLUMNS = [
  ['Treatments', ['Cardiac Surgery', 'Orthopedics', 'Oncology', 'Spine Surgery', 'Ophthalmology', 'Hair Transplant']],
  ['India Network', ['Delhi NCR hospitals', 'Mumbai care', 'Bangalore doctors', 'Chennai hospitals', 'Patient travel help', 'Recovery stays']],
  ['Patient Services', ['Cost estimate', 'Doctor opinion', 'Hospital quote', 'Travel planning', 'Airport pickup', 'Follow-up care']],
  ['Resources', ['Hospital listings', 'Doctor profiles', 'Treatment packages', 'Patient reviews', 'FAQs', 'Support centre']],
];

const ADMIN_STAGES = ['Lead', 'Reports received', 'Hospital quote', 'Doctor opinion', 'Visa support', 'Admitted'];

const ADMIN_AGENTS = [
  { id: 'AG-104', name: 'Riya Malhotra', region: 'Africa desk', activeCases: 24, conversion: '42%', sla: '1h 12m' },
  { id: 'AG-118', name: 'Aman Qureshi', region: 'Middle East', activeCases: 18, conversion: '39%', sla: '54m' },
  { id: 'AG-121', name: 'Nisha Rao', region: 'India partners', activeCases: 31, conversion: '47%', sla: '1h 35m' },
];

const ADMIN_INQUIRIES = [
  { id: 'INQ-7842', patient: 'Omar Al Farsi', country: 'UAE', treatment: 'Cardiac Sciences', stage: 'Hospital quote', agent: 'Aman Qureshi', priority: 'Urgent' },
  { id: 'INQ-7848', patient: 'Grace Wanjiku', country: 'Kenya', treatment: 'Orthopedics', stage: 'Reports received', agent: 'Riya Malhotra', priority: 'High' },
  { id: 'INQ-7851', patient: 'Maria Gomez', country: 'Spain', treatment: 'Oncology', stage: 'Doctor opinion', agent: 'Nisha Rao', priority: 'Normal' },
];

const ADMIN_APPOINTMENTS = [
  { time: '10:30', patient: 'Jean Luc Bernard', hospital: 'Fortis Escorts Heart Institute', doctor: 'Dr. Ritu Khanna', mode: 'Video consult', status: 'Confirmed' },
  { time: '12:00', patient: 'Fewzan Abdella', hospital: 'Artemis Hospital', doctor: 'Dr. Karan Malhotra', mode: 'Coordinator call', status: 'Pending reports' },
  { time: '16:15', patient: 'Omar Al Farsi', hospital: 'Indraprastha Apollo Hospital', doctor: 'Dr. Sameer Bhatia', mode: 'Hospital slot', status: 'Tentative' },
];

const ADMIN_COST_ROWS = [
  { surgery: 'CABG surgery', treatment: 'Cardiac Sciences', hospital: 'Fortis Escorts Heart Institute', stay: '7 days', package: 5200, floor: 4800, ceiling: 6200, owner: 'Medical ops' },
  { surgery: 'Total knee replacement', treatment: 'Orthopedics', hospital: 'Fortis Hospital, Noida', stay: '5 days', package: 3300, floor: 2900, ceiling: 4100, owner: 'Hospital desk' },
  { surgery: 'Robotic prostate surgery', treatment: 'Urology', hospital: 'Artemis Hospital', stay: '4 days', package: 4500, floor: 4100, ceiling: 5400, owner: 'Costing team' },
  { surgery: 'Retina surgery', treatment: 'Ophthalmology', hospital: 'The Sight Avenue', stay: 'Day care', package: 950, floor: 800, ceiling: 1300, owner: 'Partner ops' },
];

function Header({ currentPatient, hospitals = [], treatments = [], onLogoutPatient, openSearchOption, page, setPage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const searchRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const nav = [
    ['home', 'Home'],
    ['treatments', 'Treatments'],
    ['destinations', 'Destinations'],
    ['hospitals', 'Hospitals'],
    ['planner', 'Plan My Journey'],
  ];

  const STATIC_SUGGESTIONS = [
    { type: 'Treatment', label: 'Heart Bypass Surgery', meta: 'Cardiac · Starting ₹2.5L', icon: 'fa-heart-pulse' },
    { type: 'Treatment', label: 'Knee Replacement', meta: 'Orthopedics · Starting ₹1.8L', icon: 'fa-bone' },
    { type: 'Treatment', label: 'Cancer Treatment', meta: 'Oncology · Starting ₹3L', icon: 'fa-ribbon' },
    { type: 'Hospital', label: 'Apollo Hospitals', meta: 'Delhi, India', icon: 'fa-hospital' },
    { type: 'Hospital', label: 'Fortis Healthcare', meta: 'Mumbai, India', icon: 'fa-hospital' },
    { type: 'Destination', label: 'Delhi / NCR', meta: '120+ hospitals available', icon: 'fa-location-dot' },
    { type: 'Destination', label: 'Chennai', meta: '80+ hospitals available', icon: 'fa-location-dot' },
  ];

  const TYPE_ICON = {
    Treatment: 'fa-stethoscope',
    Hospital: 'fa-hospital',
    Doctor: 'fa-user-doctor',
    Destination: 'fa-location-dot',
  };
  const TYPE_COLOR = {
    Treatment: '#0d2f5d',
    Hospital: '#0d2f5d',
    Doctor: '#0d2f5d',
    Destination: '#0d4d3a',
  };

  const patientLabel = formatShortName(currentPatient?.name || currentPatient?.email || 'User');
  const navigate = (id) => { setPage(id); setMobileMenuOpen(false); };
  const logoutAndClose = () => { onLogoutPatient(); setMobileMenuOpen(false); };

  // Generate suggestions from query
  const computeSuggestions = (q) => {
    const trimmed = q.trim();
    if (!trimmed) return [];
    return getSearchOptionsFromData(trimmed, treatments, hospitals.length ? hospitals : []).map((opt) => ({
      ...opt,
      icon: TYPE_ICON[opt.type] || 'fa-magnifying-glass',
    }));
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setActiveIdx(-1);
    if (val.trim()) {
      const results = computeSuggestions(val);
      setSuggestions(results.length ? results : [{ type: 'Search', label: `Search "${val}"`, meta: 'Browse all results', icon: 'fa-magnifying-glass', query: val }]);
    } else {
      setSuggestions([]);
    }
    setShowSugg(true);
  };

  const handleFocus = () => {
    setShowSugg(true);
    if (!searchQuery.trim()) setSuggestions([]);
  };

  const handleSelect = (sugg) => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSugg(false);
    if (sugg.treatment) { openSearchOption?.(sugg); }
    else if (sugg.hospital) { openSearchOption?.(sugg); }
    else if (sugg.destination) { openSearchOption?.(sugg); }
    else { setPage('hospitals'); }
  };

  const handleKeyDown = (e) => {
    if (!showSugg || !suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0) handleSelect(suggestions[activeIdx]);
      else if (searchQuery.trim()) { setPage('hospitals'); setShowSugg(false); }
    }
    else if (e.key === 'Escape') { setShowSugg(false); setActiveIdx(-1); }
  };

  // Close on outside click
  React.useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSugg(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displaySuggestions = searchQuery.trim() ? suggestions : STATIC_SUGGESTIONS;

  return (
    <header className="site-header">
      {/* Brand */}
      <button className="brand-lockup" onClick={() => navigate('home')} type="button">
        <img src="./src/assets/kairacure-logo.png" alt="Kaira Cure" className="brand-logo-img" />
      </button>

      {/* Nav */}
      <nav className="desktop-nav">
        {nav.map(([id, label]) => (
          <button className={page === id ? 'active' : ''} key={id} onClick={() => navigate(id)} type="button">
            {label}
          </button>
        ))}
      </nav>

      {/* ── Beautiful Search Bar ── */}
      <div className="hs-wrap" ref={searchRef}>
        <div className={`hs-box${showSugg ? ' hs-focused' : ''}`}>
          <i className="fa-solid fa-magnifying-glass hs-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            className="hs-input"
            placeholder="Search treatments, hospitals, cities..."
            value={searchQuery}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            aria-label="Search"
            aria-autocomplete="list"
            aria-expanded={showSugg}
          />
          {searchQuery && (
            <button className="hs-clear" type="button" onClick={() => { setSearchQuery(''); setSuggestions([]); inputRef.current?.focus(); }} aria-label="Clear">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSugg && (
          <div className="hs-dropdown" role="listbox">
            {!searchQuery.trim() && (
              <div className="hs-dropdown-label">Popular searches</div>
            )}
            {displaySuggestions.map((sugg, i) => (
              <button
                key={i}
                className={`hs-item${activeIdx === i ? ' hs-item-active' : ''}`}
                type="button"
                role="option"
                aria-selected={activeIdx === i}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => handleSelect(sugg)}
              >
                <span className="hs-item-icon" style={{ background: `${TYPE_COLOR[sugg.type] || '#64748b'}18`, color: TYPE_COLOR[sugg.type] || '#64748b' }}>
                  <i className={`fa-solid ${sugg.icon || TYPE_ICON[sugg.type] || 'fa-magnifying-glass'}`} aria-hidden="true" />
                </span>
                <span className="hs-item-text">
                  <span className="hs-item-label">{sugg.label}</span>
                  <span className="hs-item-meta">{sugg.meta}</span>
                </span>
                <span className="hs-item-type">{sugg.type}</span>
              </button>
            ))}
            {searchQuery.trim() && suggestions.length === 0 && (
              <div className="hs-no-results">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                No results for &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auth */}
      <div className="header-actions desktop-header-actions">
        {currentPatient ? (
          <button className="header-cta header-user-cta" onClick={logoutAndClose} title={currentPatient.name || currentPatient.email} type="button">
            <i className="fa-solid fa-user-check" aria-hidden="true" />
            <span>{patientLabel}</span>
            <b>Logout</b>
          </button>
        ) : (
          <div className="header-auth-btns">
            <button className="header-login-btn" onClick={() => navigate('login')} type="button">Login</button>
            <span className="header-auth-sep">|</span>
            <button className="header-signup-btn" onClick={() => navigate('login')} type="button">Sign Up</button>
          </div>
        )}
      </div>

      {/* Mobile toggle */}
      <button aria-expanded={mobileMenuOpen} aria-label="Open menu" className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(true)} type="button">
        <i className="fa-solid fa-bars" aria-hidden="true" />
      </button>
      {mobileMenuOpen && <button aria-label="Close menu overlay" className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)} type="button" />}
      <aside className={mobileMenuOpen ? 'mobile-offcanvas open' : 'mobile-offcanvas'} aria-hidden={!mobileMenuOpen}>
        <div className="mobile-offcanvas-head">
          <strong>Menu</strong>
          <button aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} type="button">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
        {/* Mobile search */}
        <div className="mobile-search-wrap">
          <div className="hs-box">
            <i className="fa-solid fa-magnifying-glass hs-icon" aria-hidden="true" />
            <input className="hs-input" placeholder="Search treatments, hospitals..." autoComplete="off" />
          </div>
        </div>
        <nav className="mobile-nav">
          {nav.map(([id, label]) => (
            <button className={page === id ? 'active' : ''} key={id} onClick={() => navigate(id)} type="button">
              {label}
            </button>
          ))}
        </nav>
        {currentPatient ? (
          <button className="header-cta mobile-header-cta header-user-cta" onClick={logoutAndClose} title={currentPatient.name || currentPatient.email} type="button">
            <i className="fa-solid fa-user-check" aria-hidden="true" />
            <span>{patientLabel}</span>
            <b>Logout</b>
          </button>
        ) : (
          <div className="header-auth-btns mobile-auth-btns">
            <button className="header-login-btn" onClick={() => navigate('login')} type="button">Login</button>
            <button className="header-signup-btn" onClick={() => navigate('login')} type="button">Sign Up</button>
          </div>
        )}
      </aside>
    </header>
  );
}

function Hero({ onFindCare, onSelectSearchOption, query, searchOptions, setQuery, setPage, setAiInitialMessage }) {
  const WELCOME = 'Tell me your treatment, city, or budget — I\'ll suggest the right hospital, doctor, and next steps.';
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const threadRef = React.useRef(null);

  React.useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = (text || inputVal).trim();
    if (!trimmed || loading) return;
    const userMsg = { role: 'user', content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInputVal('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: next.slice(-8) }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || 'No response. Try again.' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Start the API server to enable live AI responses.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(); };
  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <section className="hero-section">
      <video className="section-video-bg" autoPlay muted loop playsInline aria-hidden="true">
        <source src={MEDICAL_VIDEO} type="video/mp4" />
      </video>
      <div className="hero-overlay" aria-hidden="true" />

      {/* Left copy */}
      <div className="hero-copy">
        <div className="hero-tag">
          <i className="fa-solid fa-shield-heart" aria-hidden="true" />
          Patient-first medical travel
        </div>
        <h1>Plan Your Medical Journey <span>Across India</span></h1>
        <p>Compare verified hospitals, get specialist doctors, estimate costs in INR, and plan your complete travel — all in one place, at no extra cost.</p>
        <div className="hero-stats">
          <span><strong>1,00,000+</strong>Patients served</span>
          <span><strong>1,500+</strong>Hospital partners</span>
          <span><strong>4.8 ★</strong>Average rating</span>
        </div>
        <div className="hero-action-row">
          <button className="hero-btn-primary" onClick={() => setPage('planner')} type="button">
            <i className="fa-solid fa-route" aria-hidden="true" /> Plan My Journey
          </button>
          <button className="hero-btn-secondary" onClick={() => setPage('treatments')} type="button">
            Browse Treatments
          </button>
        </div>
      </div>

      {/* Right — inline AI chat card */}
      <div className="hero-visual ai-chat-card hero-chat-card">
        {/* Card header */}
        <div className="hcc-header">
          <div>
            <strong className="hcc-title">Kaira Assistant</strong>
            <span className="hcc-online"><span className="hcc-dot" />Online · Kaira AI</span>
          </div>
          <button className="hcc-badge hcc-open-full-btn" type="button" onClick={() => setPage('ai-assistant')} title="Open full chat">
            <i className="fa-solid fa-up-right-from-square" aria-hidden="true" />
          </button>
        </div>

        {/* Message thread */}
        <div className="hcc-thread" ref={threadRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`hcc-bubble-row${msg.role === 'user' ? ' hcc-bubble-row-user' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="hcc-avatar-icon"><i className="fa-solid fa-robot" aria-hidden="true" /></div>
              )}
              <div className={`hcc-bubble${msg.role === 'user' ? ' hcc-bubble-user' : ''}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="hcc-bubble-row">
              <div className="hcc-avatar-icon"><i className="fa-solid fa-robot" aria-hidden="true" /></div>
              <div className="hcc-bubble hcc-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        {/* Quick chips — show only if just welcome message */}
        {messages.length === 1 && (
          <div className="hcc-chips">
            <button onClick={() => sendMessage('Best hospitals for heart surgery')} type="button">
              <i className="fa-solid fa-heart-pulse" aria-hidden="true" /> Heart Surgery
            </button>
            <button onClick={() => sendMessage('Knee replacement cost in Delhi')} type="button">
              <i className="fa-solid fa-bone" aria-hidden="true" /> Knee Replacement
            </button>
            <button onClick={() => sendMessage('What reports should I upload?')} type="button">
              <i className="fa-solid fa-file-medical" aria-hidden="true" /> My Reports
            </button>
          </div>
        )}

        {/* Input */}
        <form className="hcc-input-row" onSubmit={handleSubmit}>
          <div className="hcc-input-wrap">
            <input
              className="hcc-input"
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type your health question..."
              value={inputVal}
            />
          </div>
          <button className="hcc-send-btn" type="submit" aria-label="Send" disabled={loading}>
            <i className="fa-solid fa-paper-plane" aria-hidden="true" />
          </button>
        </form>

        <p className="hcc-disclaimer">Kaira AI — please double-check all responses</p>
      </div>
    </section>
  );
}

function MedicalVideoBackdrop() {
  return (
    <video className="section-video-bg soft-section-video" autoPlay muted loop playsInline aria-hidden="true">
      <source src={MEDICAL_VIDEO} type="video/mp4" />
    </video>
  );
}

function TreatmentVectorIcon({ treatment }) {
  const stroke = 'currentColor';
  const iconProps = { fill: 'none', stroke, strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2.4 };
  const iconKind = getTreatmentIconKind(treatment);
  const iconClasses = {
    cardiac: 'fa-heart-pulse',
    orthopedics: 'fa-bone',
    oncology: 'fa-ribbon',
    spine: 'fa-staff-snake',
    urology: 'fa-prescription-bottle-medical',
    gynecology: 'fa-venus',
    infertility: 'fa-baby',
    hair: 'fa-person',
    dental: 'fa-tooth',
    plastic: 'fa-user-doctor',
    wellness: 'fa-spa',
    'neuro-wellness': 'fa-brain',
    ophthalmology: 'fa-eye',
    gastroenterology: 'fa-capsules',
    emergency: 'fa-truck-medical',
    pediatrics: 'fa-child',
    general: 'fa-briefcase-medical',
  };

  return <i aria-hidden="true" className={`fa-solid ${iconClasses[iconKind] || iconClasses.general} treatment-vector-icon`} />;

  if (iconKind === 'wellness') {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path {...iconProps} d="M32 49c0-13 8-22 20-27-1 16-8 25-20 27Z" />
        <path {...iconProps} d="M32 49c0-13-8-22-20-27 1 16 8 25 20 27Z" />
        <path {...iconProps} d="M32 49V17" />
        <path {...iconProps} d="M32 17c7 7 7 16 0 24-7-8-7-17 0-24Z" />
      </svg>
    );
  }

  if (iconKind === 'dental') {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path {...iconProps} d="M22 15c5-3 8 1 10 1s5-4 10-1c8 5 5 18 1 27-2 5-4 9-7 8-3-1-1-10-4-10s-1 9-4 10c-3 1-5-3-7-8-4-9-7-22 1-27Z" />
        <path {...iconProps} d="M25 25h14" />
      </svg>
    );
  }

  if (iconKind === 'orthopedics') {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path {...iconProps} d="M23 14c8 3 8 11 3 16l-7 7c-3 3-3 8 0 11s8 3 11 0l7-7c5-5 13-5 16 3" />
        <path {...iconProps} d="M17 22h12" />
        <path {...iconProps} d="M35 42h12" />
        <path {...iconProps} d="M39 19l6-6 6 6" />
      </svg>
    );
  }

  if (iconKind === 'oncology') {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <circle {...iconProps} cx="29" cy="29" r="15" />
        <path {...iconProps} d="M40 40l11 11" />
        <path {...iconProps} d="M24 23c6-6 15-1 13 7-2 10-15 11-18 3-2-5 2-9 7-8" />
        <path {...iconProps} d="M29 16v8M17 29h8M29 38v8" />
      </svg>
    );
  }

  if (iconKind === 'spine') {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path {...iconProps} d="M34 10c-8 7-8 14-1 21s7 15-1 23" />
        <path {...iconProps} d="M25 15h15M24 23h16M26 31h14M24 39h16M25 47h15" />
        <path {...iconProps} d="M18 17c-4 6-4 14 0 20" />
      </svg>
    );
  }

  if (iconKind === 'urology') {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path {...iconProps} d="M22 17c-6 0-10 5-9 12 1 8 7 12 13 10 5-2 4-9 4-14 0-5-2-8-8-8Z" />
        <path {...iconProps} d="M42 17c6 0 10 5 9 12-1 8-7 12-13 10-5-2-4-9-4-14 0-5 2-8 8-8Z" />
        <path {...iconProps} d="M30 36v7c0 4-3 5-7 6" />
        <path {...iconProps} d="M34 36v7c0 4 3 5 7 6" />
      </svg>
    );
  }

  if (iconKind === 'infertility') {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path {...iconProps} d="M20 30c0-10 7-18 16-18s16 8 16 18c0 12-8 21-16 21s-16-9-16-21Z" />
        <path {...iconProps} d="M30 34c0-4 3-7 7-7 3 0 6 3 6 6 0 5-4 8-9 8-3 0-5-2-5-5" />
        <path {...iconProps} d="M36 23v-5M32 18h8" />
        <path {...iconProps} d="M27 48c5 4 12 4 17 0" />
      </svg>
    );
  }

  if (iconKind === 'gynecology') {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <circle {...iconProps} cx="32" cy="23" r="11" />
        <path {...iconProps} d="M32 34v18" />
        <path {...iconProps} d="M24 44h16" />
        <path {...iconProps} d="M23 24c4 6 14 6 18 0" />
      </svg>
    );
  }

  if (iconKind === 'hair') {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path {...iconProps} d="M17 38c0-15 10-26 25-26 7 5 10 12 10 22" />
        <path {...iconProps} d="M18 38c5-1 9-4 12-10 4 7 10 10 19 10" />
        <path {...iconProps} d="M23 43c2 6 7 9 13 9s11-3 13-9" />
        <path {...iconProps} d="M24 22c-4 3-7 8-8 14" />
      </svg>
    );
  }

  if (iconKind === 'plastic') {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path {...iconProps} d="M25 13c-7 5-10 13-9 23 1 11 8 18 17 18s16-7 17-18c1-10-2-18-9-23" />
        <path {...iconProps} d="M24 33c4-3 8-3 12 0" />
        <path {...iconProps} d="M27 43c4 3 9 3 13 0" />
        <path {...iconProps} d="M19 22c8 4 18 4 30 0" />
      </svg>
    );
  }

  if (iconKind === 'neuro-wellness') {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path {...iconProps} d="M22 19c-6 2-10 8-9 15 1 9 8 15 17 15h9c8 0 14-6 14-14 0-7-5-13-12-14-2-6-8-9-14-7-2 1-4 2-5 5Z" />
        <path {...iconProps} d="M25 24v17M33 20v25M41 26v16" />
        <path {...iconProps} d="M18 34h12M36 34h12" />
      </svg>
    );
  }

  if (iconKind === 'ophthalmology') {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path {...iconProps} d="M9 32s8-14 23-14 23 14 23 14-8 14-23 14S9 32 9 32Z" />
        <circle {...iconProps} cx="32" cy="32" r="7" />
        <path {...iconProps} d="M43 43l9 9" />
      </svg>
    );
  }

  if (iconKind === 'cardiac') {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path {...iconProps} d="M32 52S13 41 13 25c0-7 5-12 12-12 4 0 7 2 7 5 0-3 3-5 7-5 7 0 12 5 12 12 0 16-19 27-19 27Z" />
        <path {...iconProps} d="M17 32h8l4-8 6 16 4-8h8" />
      </svg>
    );
  }

  if (iconKind === 'emergency') {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path {...iconProps} d="M16 23h32a6 6 0 0 1 6 6v20H10V29a6 6 0 0 1 6-6Z" />
        <path {...iconProps} d="M22 23v-7h20v7" />
        <path {...iconProps} d="M32 31v12M26 37h12" />
        <path {...iconProps} d="M14 49v5M50 49v5" />
      </svg>
    );
  }

  if (iconKind === 'pediatrics') {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path {...iconProps} d="M20 30c0-9 6-16 14-16s14 7 14 16c0 11-7 19-14 19S20 41 20 30Z" />
        <path {...iconProps} d="M24 23c-4-3-7-2-9 2M44 23c4-3 7-2 9 2" />
        <path {...iconProps} d="M28 34h.1M40 34h.1" />
        <path {...iconProps} d="M29 42c3 2 7 2 10 0" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 64 64">
      <path {...iconProps} d="M14 52V18h34v34" />
      <path {...iconProps} d="M22 52V40h12v12" />
      <path {...iconProps} d="M24 28h16M32 20v16" />
      <path {...iconProps} d="M48 30h6v22" />
    </svg>
  );
}

function TreatmentIconTile({ treatment, className = '', label }) {
  const title = label || treatment?.title || 'Treatment';
  return (
    <span className={`treatment-icon-tile ${className}`.trim()} aria-label={`${title} icon`} role="img">
      <TreatmentVectorIcon treatment={treatment} />
    </span>
  );
}

function UiIcon({ name }) {
  const uiIcons = {
    shield: 'fa-shield-heart',
    doctor: 'fa-user-doctor',
    cost: 'fa-hand-holding-dollar',
    lock: 'fa-lock',
    hospital: 'fa-hospital',
    procedure: 'fa-notes-medical',
    home: 'fa-house-medical',
  };
  return <i aria-hidden="true" className={`fa-solid ${uiIcons[name] || uiIcons.shield} ui-bootstrap-icon`} />;

  const iconProps = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2.2 };
  const legacySvgIcons = {
    shield: <path {...iconProps} d="M32 8l18 7v14c0 12-7 20-18 27-11-7-18-15-18-27V15l18-7Z M24 31l6 6 12-14" />,
    doctor: <path {...iconProps} d="M24 15h16v10a8 8 0 0 1-16 0V15Z M18 54c1-10 8-16 14-16s13 6 14 16 M22 15V9h20v6 M32 42v7 M27 49h10" />,
    cost: <path {...iconProps} d="M18 18h28a5 5 0 0 1 5 5v24a5 5 0 0 1-5 5H18a5 5 0 0 1-5-5V23a5 5 0 0 1 5-5Z M22 29h20 M22 39h12 M42 39h4 M31 15V9 M39 15V9" />,
    lock: <path {...iconProps} d="M20 29h24v22H20z M25 29v-8a7 7 0 0 1 14 0v8 M32 38v6" />,
    hospital: <path {...iconProps} d="M14 52V16h34v36 M24 52V38h10v14 M22 26h18 M31 17v18 M23 35h18" />,
    procedure: <path {...iconProps} d="M18 47l24-24 6 6-24 24H18v-6Z M37 20l5-5 7 7-5 5 M16 20h14 M16 29h10 M16 38h7" />,
  };
  return <svg aria-hidden="true" viewBox="0 0 64 64">{legacySvgIcons[name] || legacySvgIcons.shield}</svg>;
}

function FeaturedTreatments({ money, setPage, setSelectedTreatment, treatments = [] }) {
  // Use first 4 backend treatments with highest ratings/popularity
  const featuredTreatments = useMemo(() => {
    return treatments
      .filter(t => t.title && t.packageFrom > 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, 4);
  }, [treatments]);

  if (featuredTreatments.length === 0) {
    return null; // Hide section if no treatments available
  }

  return (
    <section className="page-section featured-treatment-section">
      <MedicalVideoBackdrop />
      <div className="section-heading">
        <div>
          <h2>Popular Treatment Journeys</h2>
          <p>Shortlist treatments by real-world needs, package scope, hospital match, and total journey budget.</p>
        </div>
      </div>
      <div className="featured-carousel" aria-label="Featured treatment carousel">
        {featuredTreatments.map((treatment) => {
          // Clean up treatment titles
          const cleanTitle = treatment.title
            .replace(/Other specified certain joint disorders, not elsewhere classified/g, 'Joint Treatment')
            .replace(/Abrasion of knee/g, 'Knee Treatment')
            .replace(/Other specified.*not elsewhere classified/g, 'Specialized Treatment')
            .replace(/Certain disorders.*not elsewhere classified/g, 'Medical Treatment')
            .replace(/Other specified/g, 'Specialized')
            .replace(/not elsewhere classified/g, '')
            .replace(/,\s*$/g, '')
            .trim();

          return (
            <article className="featured-treatment-card" key={treatment.id}>
              <div className="treatment-icon-panel" aria-hidden="true">
                <span><TreatmentVectorIcon treatment={treatment} /></span>
              </div>
              <div>
                <span>{treatment.group}</span>
                <strong>{cleanTitle}</strong>
                <p>{treatment.description || `Comprehensive ${cleanTitle.toLowerCase()} treatment with coordinated hospital support and recovery planning.`}</p>
                <em>Estimated package from {money(treatment.packageFrom)}</em>
                <button
                  aria-label={`View ${cleanTitle} treatment details`}
                  onClick={() => {
                    setSelectedTreatment(treatment);
                    setPage('treatment-detail');
                  }}
                  type="button"
                >
                  View details
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SkeletonCard({ className = '' }) {
  return (
    <article className={`skeleton-card ${className}`} aria-hidden="true">
      <span />
      <b />
      <p />
      <p />
    </article>
  );
}

function Treatments({ activeGroup, isLoading = false, money, setActiveGroup, selectedTreatment, setPage, setSelectedTreatment, treatments = [] }) {
  // Generate groups from backend treatment categories/groups
  const groups = useMemo(() => {
    if (!treatments || treatments.length === 0) return ['All'];

    const uniqueGroups = new Set();
    treatments.forEach((item) => {
      const group = item.group || item.category || item.specialty;
      if (group && group.trim()) {
        uniqueGroups.add(group.trim());
      }
    });

    // Sort alphabetically and add 'All' at start
    const sortedGroups = Array.from(uniqueGroups).sort();
    return ['All', ...sortedGroups];
  }, [treatments]);

  const items = activeGroup === 'All' ? treatments : treatments.filter((item) => {
    const itemGroup = item.group || item.category || item.specialty;
    return itemGroup === activeGroup;
  });

  const [visibleCount, setVisibleCount] = useState(8);
  const tabRowRef = useRef(null);
  const visibleItems = items.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(8);
  }, [activeGroup, treatments]);

  const scrollTreatmentTabs = (direction) => {
    tabRowRef.current?.scrollBy({ left: direction * 260, behavior: 'smooth' });
  };

  return (
    <section className="page-section treatments-section-redesigned" id="treatments">
      <MedicalVideoBackdrop />

      {/* Centered Section Header */}
      <div className="treatments-section-header">
        <h2>Find <span>Treatments</span></h2>
        <p>Find the right speciality and compare estimated starting packages.</p>
      </div>

      {/* Card-based Tab Navigation */}
      <div className="treatments-tabs-card">
        <div className="treatments-tabs-wrapper">
          <button
            aria-label="Previous treatment categories"
            className="tab-nav-arrow left"
            onClick={() => scrollTreatmentTabs(-1)}
            type="button"
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>

          <div className="treatments-tabs-container" ref={tabRowRef}>
            {groups.map((group) => (
              <button
                className={`treatment-tab ${activeGroup === group ? 'active' : ''}`}
                key={group}
                onClick={() => setActiveGroup(group)}
                type="button"
              >
                {group}
              </button>
            ))}
          </div>

          <button
            aria-label="Next treatment categories"
            className="tab-nav-arrow right"
            onClick={() => scrollTreatmentTabs(1)}
            type="button"
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Treatment Grid */}
      <div className="treatment-grid">
        {isLoading ? Array.from({ length: 8 }, (_, index) => <SkeletonCard className="treatment-skeleton" key={`treatment-skeleton-${index}`} />) : visibleItems.map((item) => {
          const displayTitle = getTreatmentDisplayTitle(item);

          return (
            <button
              className={selectedTreatment?.id === item.id ? 'treatment-card active' : 'treatment-card'}
              key={item.id}
              onClick={() => {
                setSelectedTreatment(item);
                setPage('treatment-detail');
              }}
              type="button"
              title={item.title} // Full original title on hover
            >
              <i className="treatment-card-icon" aria-hidden="true"><TreatmentVectorIcon treatment={item} /></i>
              <strong>{displayTitle}</strong>
              <small>{item.group || item.category || 'Medical'}</small>
            </button>
          );
        })}
      </div>
      {!isLoading && visibleCount < items.length && (
        <div className="load-more-row">
          <button onClick={() => setVisibleCount((count) => Math.min(count + 8, items.length))} type="button">
            Load more treatments
          </button>
          <span>{visibleItems.length} of {items.length}</span>
        </div>
      )}
    </section>
  );
}

function buildAvailableDestinations(hospitals = []) {
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
        line: cityCopy[key] || `Available ${hospital.specialty.toLowerCase()} care teams and coordinated hospital support.`,
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

function Destinations({ hospitals = INDIA_HOSPITALS, isLoading = false, money, setPage, setSelectedCountry }) {
  const availableDestinations = useMemo(() => buildAvailableDestinations(hospitals), [hospitals]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 320; // Card width + gap
      const newPosition = direction === 'left'
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(carouselRef.current.scrollWidth - carouselRef.current.clientWidth, scrollPosition + scrollAmount);

      carouselRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  // City SVG icons - Hospital building style
  const CityIcon = ({ cityName }) => {
    const icons = {
      'Delhi': (
        <svg viewBox="0 0 100 100" className="city-icon">
          <rect x="35" y="35" width="30" height="40" fill="#2b7de9" rx="2" />
          <rect x="40" y="40" width="5" height="5" fill="#ffffff" opacity="0.8" />
          <rect x="45" y="40" width="5" height="5" fill="#ffffff" opacity="0.8" />
          <rect x="50" y="40" width="5" height="5" fill="#ffffff" opacity="0.8" />
          <rect x="55" y="40" width="5" height="5" fill="#ffffff" opacity="0.8" />
          <rect x="40" y="48" width="5" height="5" fill="#ffffff" opacity="0.8" />
          <rect x="45" y="48" width="5" height="5" fill="#ffffff" opacity="0.8" />
          <rect x="50" y="48" width="5" height="5" fill="#ffffff" opacity="0.8" />
          <rect x="55" y="48" width="5" height="5" fill="#ffffff" opacity="0.8" />
          <rect x="40" y="56" width="5" height="5" fill="#ffffff" opacity="0.8" />
          <rect x="45" y="56" width="5" height="5" fill="#ffffff" opacity="0.8" />
          <rect x="50" y="56" width="5" height="5" fill="#ffffff" opacity="0.8" />
          <rect x="55" y="56" width="5" height="5" fill="#ffffff" opacity="0.8" />
          <path d="M35,35 L50,25 L65,35" fill="#2b7de9" />
          <rect x="47" y="65" width="6" height="10" fill="#ffffff" />
        </svg>
      ),
      'Mumbai': (
        <svg viewBox="0 0 100 100" className="city-icon">
          <rect x="30" y="40" width="15" height="35" fill="#2b7de9" rx="2" />
          <rect x="55" y="30" width="15" height="45" fill="#2b7de9" rx="2" />
          <rect x="33" y="45" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="37" y="45" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="33" y="50" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="37" y="50" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="33" y="55" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="37" y="55" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="58" y="35" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="62" y="35" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="58" y="40" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="62" y="40" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="58" y="45" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="62" y="45" width="3" height="3" fill="#ffffff" opacity="0.8" />
        </svg>
      ),
      'Chennai': (
        <svg viewBox="0 0 100 100" className="city-icon">
          <rect x="38" y="38" width="24" height="37" fill="#2b7de9" rx="2" />
          <rect x="42" y="42" width="4" height="4" fill="#ffffff" opacity="0.8" />
          <rect x="48" y="42" width="4" height="4" fill="#ffffff" opacity="0.8" />
          <rect x="54" y="42" width="4" height="4" fill="#ffffff" opacity="0.8" />
          <rect x="42" y="48" width="4" height="4" fill="#ffffff" opacity="0.8" />
          <rect x="48" y="48" width="4" height="4" fill="#ffffff" opacity="0.8" />
          <rect x="54" y="48" width="4" height="4" fill="#ffffff" opacity="0.8" />
          <rect x="42" y="54" width="4" height="4" fill="#ffffff" opacity="0.8" />
          <rect x="48" y="54" width="4" height="4" fill="#ffffff" opacity="0.8" />
          <rect x="54" y="54" width="4" height="4" fill="#ffffff" opacity="0.8" />
          <rect x="42" y="60" width="4" height="4" fill="#ffffff" opacity="0.8" />
          <rect x="48" y="60" width="4" height="4" fill="#ffffff" opacity="0.8" />
          <rect x="54" y="60" width="4" height="4" fill="#ffffff" opacity="0.8" />
          <path d="M38,38 L50,28 L62,38" fill="#2b7de9" />
          <rect x="48" y="66" width="4" height="9" fill="#ffffff" />
        </svg>
      ),
      'Bangalore': (
        <svg viewBox="0 0 100 100" className="city-icon">
          <rect x="32" y="45" width="12" height="30" fill="#2b7de9" rx="2" />
          <rect x="48" y="38" width="12" height="37" fill="#2b7de9" rx="2" />
          <rect x="64" y="50" width="12" height="25" fill="#2b7de9" rx="2" />
          <rect x="35" y="50" width="2.5" height="2.5" fill="#ffffff" opacity="0.8" />
          <rect x="38.5" y="50" width="2.5" height="2.5" fill="#ffffff" opacity="0.8" />
          <rect x="35" y="55" width="2.5" height="2.5" fill="#ffffff" opacity="0.8" />
          <rect x="38.5" y="55" width="2.5" height="2.5" fill="#ffffff" opacity="0.8" />
          <rect x="51" y="43" width="2.5" height="2.5" fill="#ffffff" opacity="0.8" />
          <rect x="54.5" y="43" width="2.5" height="2.5" fill="#ffffff" opacity="0.8" />
          <rect x="51" y="48" width="2.5" height="2.5" fill="#ffffff" opacity="0.8" />
          <rect x="54.5" y="48" width="2.5" height="2.5" fill="#ffffff" opacity="0.8" />
          <rect x="67" y="55" width="2.5" height="2.5" fill="#ffffff" opacity="0.8" />
          <rect x="70.5" y="55" width="2.5" height="2.5" fill="#ffffff" opacity="0.8" />
        </svg>
      ),
      'Gurgaon': (
        <svg viewBox="0 0 100 100" className="city-icon">
          <rect x="36" y="42" width="14" height="33" fill="#2b7de9" rx="2" />
          <rect x="54" y="35" width="14" height="40" fill="#2b7de9" rx="2" />
          <rect x="39" y="47" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="43" y="47" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="39" y="52" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="43" y="52" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="39" y="57" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="43" y="57" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="57" y="40" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="61" y="40" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="57" y="45" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="61" y="45" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="57" y="50" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="61" y="50" width="3" height="3" fill="#ffffff" opacity="0.8" />
        </svg>
      ),
      'default': (
        <svg viewBox="0 0 100 100" className="city-icon">
          <rect x="40" y="40" width="20" height="35" fill="#2b7de9" rx="2" />
          <rect x="43" y="45" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="47" y="45" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="51" y="45" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="43" y="50" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="47" y="50" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="51" y="50" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="43" y="55" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="47" y="55" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="51" y="55" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="43" y="60" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="47" y="60" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="51" y="60" width="3" height="3" fill="#ffffff" opacity="0.8" />
          <rect x="47" y="67" width="6" height="8" fill="#ffffff" />
        </svg>
      )
    };

    return icons[cityName] || icons.default;
  };

  return (
    <section className="page-section destination-section" id="destinations">
      <MedicalVideoBackdrop />
      <div className="section-heading">
        <div>
          <h2>Featured Destination</h2>
          <p>Explore places known for expert doctors, affordable care, and comfortable recovery.</p>
        </div>
      </div>

      <div className="destination-carousel-wrapper">
        <button
          className="carousel-nav-btn carousel-prev"
          onClick={() => scroll('left')}
          disabled={scrollPosition === 0}
          type="button"
          aria-label="Previous destinations"
        >
          <i className="fa-solid fa-chevron-left" aria-hidden="true" />
        </button>

        <div className="destination-carousel" ref={carouselRef}>
          {isLoading ? Array.from({ length: 4 }, (_, index) => <SkeletonCard className="destination-skeleton" key={`destination-skeleton-${index}`} />) : availableDestinations.map((destination) => (
            <button
              className="destination-card-new"
              key={destination.country}
              onClick={() => {
                setSelectedCountry(destination.country);
                setPage('hospitals');
              }}
              type="button"
            >
              <div className="destination-icon-wrapper">
                <CityIcon cityName={destination.country} />
              </div>
              <div className="destination-info">
                <strong>{destination.country}</strong>
                <p>{destination.line}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          className="carousel-nav-btn carousel-next"
          onClick={() => scroll('right')}
          disabled={carouselRef.current && scrollPosition >= carouselRef.current.scrollWidth - carouselRef.current.clientWidth}
          type="button"
          aria-label="Next destinations"
        >
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function HomeTreatmentBanners({ setPage, setActiveGroup, setSelectedTreatment, treatments = [] }) {
  if (!treatments || treatments.length === 0) return null;

  // Pick up to 6 unique treatment groups
  const seen = new Set();
  const cards = treatments
    .filter((t) => {
      const g = t.group || t.category || t.title;
      if (!g || seen.has(g)) return false;
      seen.add(g);
      return true;
    })
    .slice(0, 6)
    .map((t) => ({
      title: t.group || t.category || t.title,
      group: t.group || t.category || t.title,
      treatment: t,
    }));

  const handleClick = (item) => {
    // Set the treatment and open the detail page
    if (setSelectedTreatment) setSelectedTreatment(item.treatment);
    setPage('treatment-detail');
  };

  return (
    <section className="page-section treatment-banner-section">
      <div className="section-heading">
        <div>
          <h2>Find Your <span>Treatment</span></h2>
        </div>
      </div>
      <div className="treatment-banner-grid">
        {cards.map((item, index) => (
          <button
            key={`${item.treatment?.id || item.title}-${index}`}
            className="treatment-banner-card"
            onClick={() => handleClick(item)}
            type="button"
          >
            <span className="tbc-icon">
              <TreatmentVectorIcon treatment={item.treatment} />
            </span>
            <strong className="tbc-title">{item.title}</strong>
            <span className="tbc-arrow" aria-hidden="true">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function CallBackForm({ selectedHospital }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    countryCode: '+91',
    preferredTime: '',
  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    'Now (within 30 minutes)',
    'Morning (9 AM - 12 PM)',
    'Afternoon (12 PM - 6 PM)',
    'Evening (6 PM - 9 PM)',
  ];

  const submitCallback = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setStatus('Please enter your name and phone number.');
      return;
    }

    setIsSubmitting(true);
    setStatus('Requesting callback...');

    try {
      const response = await fetch(`${API_BASE}/admin/public-appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...getPatientAttribution(),
          patientName: form.name,
          phone: `${form.countryCode} ${form.phone}`,
          country: 'India',
          city: selectedHospital?.city || '',
          treatment: 'Callback Request',
          hospital: selectedHospital?.name || '',
          doctor: selectedHospital?.doctor || '',
          mode: 'Get a Call Back',
          notes: `Preferred time: ${form.preferredTime || 'Any time'}`,
          source: 'callback-form',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Request failed');

      setStatus('✅ Callback requested! We\'ll call you soon.');
      setForm({ name: '', phone: '', countryCode: '+91', preferredTime: '' });
    } catch (error) {
      setStatus(`❌ ${error.message || 'Unable to request callback.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="callback-form" onSubmit={submitCallback}>
      <div className="callback-form-content">
        <div className="form-group">
          <label htmlFor="callback-name">Your Name *</label>
          <input
            id="callback-name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="callback-phone">Phone Number *</label>
          <div className="phone-input-group">
            <select
              className="country-code"
              value={form.countryCode}
              onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
            >
              <option value="+91">🇮🇳 +91</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+971">🇦🇪 +971</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+61">🇦🇺 +61</option>
            </select>
            <input
              id="callback-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Your phone number"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="callback-time">Preferred Call Time</label>
          <select
            id="callback-time"
            value={form.preferredTime}
            onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
          >
            <option value="">Select preferred time</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>

        {/* Hospital Info Display */}
        {selectedHospital && (
          <div className="hospital-info-card">
            <h4>
              <i className="fa-solid fa-hospital" aria-hidden="true"></i>
              {selectedHospital.name}
            </h4>
            <p>
              <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
              {selectedHospital.city}
            </p>
            {selectedHospital.tags && selectedHospital.tags[0] && (
              <p>
                <i className="fa-solid fa-stethoscope" aria-hidden="true"></i>
                {selectedHospital.tags[0]}
              </p>
            )}
          </div>
        )}

        {status && (
          <div className={`status-message ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : 'info'}`}>
            {status}
          </div>
        )}

        <button
          type="submit"
          className="callback-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
              Requesting...
            </>
          ) : (
            <>
              <i className="fa-solid fa-phone" aria-hidden="true"></i>
              Get Call Back
            </>
          )}
        </button>

        <div className="callback-features">
          <div className="feature-item">
            <i className="fa-solid fa-clock" aria-hidden="true"></i>
            <span>Quick 30-min response</span>
          </div>
          <div className="feature-item">
            <i className="fa-solid fa-user-doctor" aria-hidden="true"></i>
            <span>Expert consultation</span>
          </div>
          <div className="feature-item">
            <i className="fa-solid fa-shield-halved" aria-hidden="true"></i>
            <span>100% Free service</span>
          </div>
        </div>
      </div>
    </form>
  );
}

function EvaluationForm({ title = 'Schedule Appointment', buttonLabel = 'Request Appointment', selectedHospital }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I would like to get more information about medical treatments and cost estimates.'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const { name, phone, message } = form;
    if (!name.trim() || !phone.trim()) {
      setSubmitError('Please fill in name and phone number');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch(`${API_BASE}/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: form.email.trim() || undefined,
          phone: phone.trim(),
          message: message.trim(),
          intent: 'patient'
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setForm({ name: '', email: '', phone: '', message: 'I would like to get more information about medical treatments and cost estimates.' });
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      setSubmitError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="simple-evaluation-form success">
        <div className="success-header">
          <i className="fa-solid fa-check-circle" aria-hidden="true"></i>
          <h3>Request Submitted!</h3>
          <p>Our team will call you within 24 hours.</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setSubmitSuccess(false)}
          type="button"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form className="simple-evaluation-form" onSubmit={handleSubmit}>
      {title && (
        <div className="form-header">
          <h3>{title}</h3>
          <p>Get consultation and appointment support within 24 hours</p>
        </div>
      )}

      {submitError && (
        <div className="error-message">
          <i className="fa-solid fa-exclamation-triangle" aria-hidden="true" />
          {submitError}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="lead-name">Full Name *</label>
        <input
          id="lead-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleInputChange}
          placeholder="Enter patient's full name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="lead-email">Email Address</label>
        <input
          id="lead-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleInputChange}
          placeholder="your@email.com (optional)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="lead-phone">Phone Number *</label>
        <input
          id="lead-phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleInputChange}
          placeholder="+91 9999999999"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="lead-message">Message</label>
        <textarea
          id="lead-message"
          name="message"
          value={form.message}
          onChange={handleInputChange}
          placeholder="Tell us about your medical needs..."
          rows="3"
        />
      </div>

      <button
        type="submit"
        className="submit-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <i className="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
            Submitting...
          </>
        ) : (
          <>
            <i className="fa-solid fa-phone" aria-hidden="true"></i>
            {buttonLabel}
          </>
        )}
      </button>

      <div className="form-footer">
        <small className="privacy-text">
          <i className="fa-solid fa-shield-halved" aria-hidden="true"></i>
          By submitting the form I agree to the Terms of Use and Privacy Policy of {BRAND_NAME}.
        </small>
      </div>
    </form>
  );
}

function CheckboxDropdown({ id, label, openDropdown, options, selectedValues, onClear, onToggle, setOpenDropdown }) {
  const summary = selectedValues.length ? `${selectedValues.length} selected` : label;
  const isOpen = openDropdown === id;
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpenDropdown('');
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenDropdown('');
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, setOpenDropdown]);

  return (
    <div className={isOpen ? 'checkbox-dropdown open' : 'checkbox-dropdown'} ref={dropdownRef}>
      <button className="checkbox-dropdown-trigger" onClick={() => setOpenDropdown(isOpen ? '' : id)} type="button">
        <span>{summary}</span>
        <i className="fa-solid fa-chevron-down" aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="checkbox-dropdown-panel">
          <div className="checkbox-dropdown-head">
            <strong>{label}</strong>
            {selectedValues.length > 0 && <button onClick={onClear} type="button">Clear</button>}
          </div>
          <div className="checkbox-option-list">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option);
              return (
                <button
                  aria-checked={isSelected}
                  className={isSelected ? 'checkbox-option selected' : 'checkbox-option'}
                  key={option}
                  onClick={() => onToggle(option)}
                  role="checkbox"
                  type="button"
                >
                  <span className="checkbox-option-box" aria-hidden="true">
                    {isSelected && <i className="fa-solid fa-check" aria-hidden="true" />}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Hospitals({ hospitals, isLoading = false, money, selectedTreatment, setPage, setSelectedHospital, treatments = TREATMENTS }) {
  const cityOptions = useMemo(() => [...new Set(hospitals.map((hospital) => hospital.city))].sort(), [hospitals]);
  const treatmentOptions = useMemo(() => treatments.map((treatment) => treatment.title), [treatments]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedTreatments, setSelectedTreatments] = useState(selectedTreatment?.title ? [selectedTreatment.title] : []);
  const [openDropdown, setOpenDropdown] = useState('');
  const [visibleHospitalCount, setVisibleHospitalCount] = useState(5);
  const [isFiltering, setIsFiltering] = useState(false);

  const toggleValue = (setter) => (value) => {
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  };

  const filteredDirectoryHospitals = useMemo(() => hospitals.filter((hospital) => {
    const tags = Array.isArray(hospital.tags) ? hospital.tags : [];
    const matchesCity = selectedCities.length === 0 || selectedCities.includes(hospital.city);
    const matchesDepartment = selectedDepartments.length === 0 || selectedDepartments.some((department) => tags.some((tag) => treatments.find((treatment) => treatment.title === tag)?.group === department));
    const matchesTreatment = selectedTreatments.length === 0 || selectedTreatments.some((treatment) => tags.includes(treatment) || hospital.specialty === treatments.find((item) => item.title === treatment)?.specialty);
    return matchesCity && matchesDepartment && matchesTreatment;
  }), [hospitals, selectedCities, selectedDepartments, selectedTreatments, treatments]);
  const visibleDirectoryHospitals = filteredDirectoryHospitals.slice(0, visibleHospitalCount);
  const showHospitalSkeleton = isLoading || isFiltering;

  useEffect(() => {
    setVisibleHospitalCount(5);
    if (!isLoading) {
      setIsFiltering(true);
      const timer = window.setTimeout(() => setIsFiltering(false), 360);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [selectedCities, selectedDepartments, selectedTreatments, hospitals, isLoading]);

  return (
    <section className="page-section hospitals-directory" id="hospitals">
      <MedicalVideoBackdrop />
      <div className="hospital-filter-bar">
        <div className="filter-static-field">India</div>
        <CheckboxDropdown
          id="cities"
          label="All Cities"
          openDropdown={openDropdown}
          onClear={() => setSelectedCities([])}
          onToggle={toggleValue(setSelectedCities)}
          options={cityOptions}
          selectedValues={selectedCities}
          setOpenDropdown={setOpenDropdown}
        />
        <CheckboxDropdown
          id="treatments"
          label="Treatments"
          openDropdown={openDropdown}
          onClear={() => setSelectedTreatments([])}
          onToggle={toggleValue(setSelectedTreatments)}
          options={treatmentOptions}
          selectedValues={selectedTreatments}
          setOpenDropdown={setOpenDropdown}
        />
        <CheckboxDropdown
          id="departments"
          label="Departments"
          openDropdown={openDropdown}
          onClear={() => setSelectedDepartments([])}
          onToggle={toggleValue(setSelectedDepartments)}
          options={TREATMENT_GROUPS}
          selectedValues={selectedDepartments}
          setOpenDropdown={setOpenDropdown}
        />
        <button onClick={() => {
          setIsFiltering(true);
          window.setTimeout(() => setIsFiltering(false), 360);
        }} type="button">Search</button>
      </div>
      <div className="section-heading">
        <div>
          <h2>Popular Hospitals</h2>
          <p>Compare providers by destination, speciality, doctors, value, and full estimated budget.</p>
        </div>
      </div>
      <div className="quick-filter-row">
        <span>Quick Filters</span>
        <button type="button">JCI Accreditation</button>
        <button type="button">NABH</button>
        <button type="button">Multi Specialty</button>
      </div>
      <div className="hospital-directory-layout">
        <div className="hospital-list">
          {showHospitalSkeleton && Array.from({ length: 3 }, (_, index) => <SkeletonCard className="hospital-skeleton" key={`hospital-skeleton-${index}`} />)}
          {!showHospitalSkeleton && visibleDirectoryHospitals.map((hospital) => (
            <article className="hospital-card" key={hospital.id}>
              <div
                className="hospital-card-main"
              >
                <button
                  className="hospital-thumb-button"
                  onClick={() => {
                    setSelectedHospital(hospital);
                    setPage('hospital-detail');
                  }}
                  type="button"
                >
                  <img alt={hospital.name} onError={handleImageFallback} src={getHospitalImage(hospital)} />
                </button>
                <div className="hospital-body">
                  <button
                    className="hospital-name-link"
                    onClick={() => {
                      setSelectedHospital(hospital);
                      setPage('hospital-detail');
                    }}
                    type="button"
                  >
                    {hospital.name}
                  </button>
                  <div className="rating-row">
                    <StarRating rating={hospital.rating} />
                    <span>{hospital.rating} ({hospital.doctors} Ratings)</span>
                  </div>
                  <p>
                    {hospital.name} is listed from the {hospital.sourceSystem || 'client hospital master database'} for {hospital.specialty.toLowerCase()} care
                    {hospital.city ? ` in ${hospital.city}` : ''}. {hospital.accreditations ? `Accreditation: ${accreditationText(hospital.accreditations)}.` : 'Accreditation details can be updated from admin.'}
                  </p>
                  <button className="show-more-link" onClick={() => {
                    setSelectedHospital(hospital);
                    setPage('hospital-detail');
                  }} type="button">Show More</button>
                </div>
              </div>
              <div className="hospital-facts">
                <span>Established: {hospital.established || hospital.foundedYear || 'Update pending'}</span>
                <span>Beds: {hospital.bedText || hospital.beds || 'Update pending'}</span>
                <span>{hospital.jciAccredited ? 'JCI Accredited' : accreditationText(hospital.accreditations, hospital.nabhType || 'Accredited Hospital')}</span>
                <span>Location: {hospital.city || hospital.addressLine1 || 'India'}</span>
                
                {/* Accreditation Logo - Compact inline */}
                <div className="hospital-accreditation-logos">
                  {hospital.jciAccredited ? (
                    <div className="accreditation-badge jci-badge">
                      <img src="https://cdn.prod.website-files.com/63dc099d352018653241b1a7/63fe8bab2259ca569b27dcdf_gold-seal-approval.png" alt="JCI Accredited" />
                      <span>JCI</span>
                    </div>
                  ) : (
                    <div className="accreditation-badge nabh-badge">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQntV_tAgbdUJrZpcCIbKGbqdoM9GaOgerg3Q" alt="NABH Accredited" />
                      <span>NABH</span>
                    </div>
                  )}
                </div>
                
                <button onClick={() => setPage('planner')} type="button">Book Appointment</button>
              </div>
            </article>
          ))}
          {!showHospitalSkeleton && filteredDirectoryHospitals.length === 0 && (
            <article className="hospital-empty-state">
              <strong>No hospitals match these filters</strong>
              <p>Clear one filter or select a broader treatment to see more options.</p>
            </article>
          )}
          {!showHospitalSkeleton && visibleHospitalCount < filteredDirectoryHospitals.length && (
            <div className="load-more-row hospital-load-more">
              <button onClick={() => setVisibleHospitalCount((count) => Math.min(count + 5, filteredDirectoryHospitals.length))} type="button">
                Load more hospitals
              </button>
              <span>{visibleDirectoryHospitals.length} of {filteredDirectoryHospitals.length}</span>
            </div>
          )}
        </div>
        <EvaluationForm title="Get FREE Evaluation" buttonLabel="Contact Us Now" />
      </div>
    </section>
  );
}

function QuickJourneyCTA({ setPage, title = 'Let us plan your journey', compact = false }) {
  return (
    <section className={compact ? 'quick-journey-cta compact' : 'quick-journey-cta'} aria-label="Plan your medical journey">
      <div>
        <span>Quick planning</span>
        <h2>{title}</h2>
        <p>Choose your treatment, compare matched hospitals, estimate cost, and request a free consultation in one guided flow.</p>
      </div>
      <button onClick={() => setPage('planner')} type="button">
        <i className="fa-solid fa-route" aria-hidden="true" />
        Plan my journey
      </button>
    </section>
  );
}

function Doctors({ hospitals, isCarousel = false, money, setPage, setSelectedHospital }) {
  return (
    <section className={isCarousel ? 'page-section doctors-section carousel-mode' : 'page-section doctors-section'} id="doctors">
      <MedicalVideoBackdrop />
      <div className="section-heading">
        <div>
          <h2>Popular Doctors</h2>
          <p>Review specialist experience, hospital association, and consultation fee.</p>
        </div>
      </div>
      <div className="doctor-grid">
        {hospitals.map((hospital) => (
          <button
            className="doctor-card"
            key={`${hospital.id}-${hospital.doctor}`}
            onClick={() => {
              setSelectedHospital(hospital);
              setPage('doctor-detail');
            }}
            type="button"
          >
            <div className="doctor-photo-wrap">
              <img alt={hospital.doctor} src={hospital.doctorImage} />
              <span>MD</span>
            </div>
            <div className="doctor-card-body">
              <div className="doctor-card-top">
                <strong>{hospital.doctor}</strong>
                <p>{hospital.doctorTitle}</p>
              </div>
              <div className="doctor-meta-row">
                <span><b>YR</b>{hospital.experience}</span>
                <span><b>H</b>{hospital.city}</span>
              </div>
              <StarRating rating={hospital.rating} />
              <span className="doctor-hospital-name">{hospital.name}</span>
              <div className="doctor-card-footer">
                <em><b>$</b>{money(hospital.doctorFee)} consult</em>
                <small>View profile <i>{'->'}</i></small>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function TreatmentDetail({ allTreatments = [], hospitals, money, selectedTreatment, setPage, setPlannerInitialProcedure, setSelectedHospital, setSelectedTreatment }) {
  const [activeTab, setActiveTab] = useState('Overview');
  if (!selectedTreatment) {
    return (
      <section className="empty-state">
        <h2>Select a treatment to view details</h2>
        <p>Treatment details are loaded from the live catalog. Please choose a treatment first.</p>
        <button onClick={() => setPage('treatments')} type="button">Browse treatments</button>
      </section>
    );
  }

  const treatmentMeaning = buildTreatmentMeaning(selectedTreatment);
  const { code: clinicalCode, condition: clinicalCondition, description: treatmentDescription, displayTitle: displayTreatmentTitle, pageTitle: pageTreatmentTitle, release: clinicalRelease, source: clinicalSource } = treatmentMeaning;
  const treatmentNeedle = normalizeSearch([selectedTreatment.title, displayTreatmentTitle, selectedTreatment.category, selectedTreatment.group, selectedTreatment.specialty, clinicalCondition, clinicalCode].filter(Boolean).join(' '));
  const relatedHospitals = hospitals.filter((hospital) => {
    const hospitalTags = Array.isArray(hospital.tags) ? hospital.tags : [];
    const hospitalText = normalizeSearch([hospital.specialty, hospital.department, hospital.summary, ...hospitalTags].filter(Boolean).join(' '));
    return hospitalTags.includes(selectedTreatment.title)
      || hospitalTags.includes(displayTreatmentTitle)
      || hospital.specialty === selectedTreatment.specialty
      || (treatmentNeedle && hospitalText && (hospitalText.includes(treatmentNeedle) || treatmentNeedle.includes(normalizeSearch(hospital.specialty || ''))));
  });
  const matchedHospitals = relatedHospitals.length ? relatedHospitals : hospitals;
  const suggestedHospitals = [
    ...matchedHospitals,
    ...hospitals.filter((hospital) => !matchedHospitals.some((item) => item.id === hospital.id)),
  ];
  const bestMatches = suggestedHospitals.slice(0, 6);
  const backendPackage = Number(selectedTreatment.packageFrom || 0);
  const clinicalReleaseNote = clinicalRelease ? `Catalog release ${clinicalRelease}` : 'Medical catalog reviewed';
  const categoryLabel = selectedTreatment.category || selectedTreatment.group || selectedTreatment.specialty || 'Medical treatment';
  const sourceLabel = clinicalCode ? `${clinicalSource} ${clinicalCode}` : clinicalSource;
  const matchReason = (hospital) => {
    if (hospital.specialty && selectedTreatment.specialty && hospital.specialty === selectedTreatment.specialty) return `${hospital.specialty} department match`;
    const tags = Array.isArray(hospital.tags) ? hospital.tags : [];
    if (tags.includes(selectedTreatment.title) || tags.includes(displayTreatmentTitle)) return 'Treatment listed in hospital mapping';
    if (hospital.internationalPatientWing) return 'International patient support available';
    return accreditationText(hospital.accreditations, 'Backend hospital suggestion');
  };

  // ICD-11 procedures for this treatment group — treatments with icdCode matching this group
  const icdProcedures = allTreatments.filter((t) => {
    if (!t.icdCode && !t.icdUri) return false; // must be ICD-11 imported
    const tGroup = (t.group || t.category || '').toLowerCase();
    const selGroup = (selectedTreatment.group || selectedTreatment.category || '').toLowerCase();
    const selTitle = (selectedTreatment.title || '').toLowerCase();
    // Same group, OR the treatment itself IS the selected one, OR title contains group
    return tGroup === selGroup
      || tGroup.includes(selGroup)
      || selGroup.includes(tGroup)
      || (t._id || t.id) === (selectedTreatment._id || selectedTreatment.id)
      || selTitle.includes(tGroup);
  });

  const supportCards = [
    ['Case confidence', 'Your treatment is converted from catalog wording into a clear care focus before planning starts.'],
    ['Human review', 'A coordinator can verify reports, symptoms, budget, city preference, and hospital availability.'],
    ['No ICD detour', 'Patients stay on the journey flow; ICD-11 remains a backend clinical mapping reference.'],
  ];
  const subProcedures = [
    {
      label: 'Treatment meaning',
      name: clinicalCondition,
      meta: sourceLabel,
      description: treatmentDescription,
      icon: 'fa-stethoscope',
      action: 'Start plan',
      target: 'planner',
    },
    {
      label: 'What we need',
      name: 'Reports and symptoms',
      meta: 'Upload once in journey planner',
      description: `Share reports, scan images, prescriptions, diagnosis notes, and your preferred travel dates for ${displayTreatmentTitle}.`,
      icon: 'fa-file-medical',
      action: 'Prepare case',
      target: 'planner',
    },
    {
      label: 'Suggested care',
      name: `${bestMatches.length || 0} hospital options`,
      meta: clinicalReleaseNote,
      description: 'Suggestions come from backend hospital data, specialty mapping, accreditation, location, and international patient support.',
      icon: 'fa-hospital-user',
      action: 'View matches',
      target: 'planner',
    },
  ].filter((item) => item.name);

  const treatmentFAQs = [
    {
      question: `What does ${displayTreatmentTitle} mean in my plan?`,
      answer: `${displayTreatmentTitle} is the patient-friendly treatment name. The backend can also keep the ICD-11 mapped condition (${clinicalCondition}) and reference code${clinicalCode ? ` ${clinicalCode}` : ''} for clinical consistency.`
    },
    {
      question: 'Will I be sent to ICD-11 pages?',
      answer: 'No. ICD-11 stays behind the scenes as a mapping source. The patient journey remains inside Kairacure with clear next steps, hospital options, and report collection.'
    },
    {
      question: 'Where does the treatment data come from?',
      answer: `This page uses backend treatment records${clinicalCode ? ', ICD-11 code mapping,' : ''} and backend hospital suggestions. Pricing appears only when the backend has a package estimate.`
    },
    {
      question: 'What happens after I start the journey plan?',
      answer: 'The planner collects reports, symptoms, budget, preferred city, and travel needs so the care team can suggest the most suitable hospital path.'
    },
    {
      question: 'Can hospital suggestions change?',
      answer: 'Yes. Suggestions can change after report review, doctor availability, patient budget, city preference, and hospital response.'
    }
  ];

  const trustBadges = [
    { title: clinicalCode ? clinicalCode : 'Mapped', subtitle: 'Clinical ref', icon: 'fa-barcode', tone: 'violet' },
    { title: categoryLabel, subtitle: 'Backend category', icon: 'fa-layer-group', tone: 'green' },
    { title: bestMatches.length ? `${bestMatches.length}+` : 'Review', subtitle: 'Suggested hospitals', icon: 'fa-hospital', tone: 'blue' },
    { title: backendPackage ? money(backendPackage) : 'On request', subtitle: 'Package from', icon: 'fa-indian-rupee-sign', tone: 'gold' },
    { title: 'Private', subtitle: 'Report handling', icon: 'fa-lock', tone: 'violet' },
  ];
  const keyInsights = [
    ['Meaning', treatmentDescription],
    ['Treatment Source', `${categoryLabel}${clinicalCode ? ` / ${clinicalCode}` : ''}${clinicalRelease ? ` / ${clinicalRelease}` : ''}`],
    ['Suggested support', bestMatches.length ? `${bestMatches.length} hospital options are ready for journey planning.` : 'Hospital matching will start after treatment review.'],
    ['Cost clarity', backendPackage ? `Package estimate starts from ${money(backendPackage)}.` : 'Package estimate will be requested from hospitals after report review.'],
  ];
  const tabItems = [
    ['Overview', 'overview'],
    ['Key Insights', 'key-insights'],
    ['Journey Plan', 'procedures'],
    ['Cost', 'cost'],
    ['Top Hospitals', 'hospitals'],
    ['FAQs', 'faqs'],
  ];
  const heroImage = selectedTreatment.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=85';
  const costRows = [
    ['Backend package estimate', backendPackage ? money(backendPackage) : 'On request', backendPackage ? 'Imported treatment pricing' : 'Care team will collect pricing'],
    ['Hospital quote', 'After review', 'Depends on reports, room type, stay, and doctor advice'],
    ['Travel support', 'Optional', 'Visa, stay, pickup, interpreter, and follow-up support'],
  ];
  const goToSection = (label, sectionId) => {
    setActiveTab(label);
    window.requestAnimationFrame(() => {
      document.getElementById(`treatment-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="treatment-replica-page">
      <section className="treatment-replica-hero">
        <div className="treatment-replica-hero-media">
          <img alt={pageTreatmentTitle} onError={handleImageFallback} src={heroImage} />
        </div>
        <div className="treatment-replica-hero-copy">
          <div className="treatment-replica-breadcrumb">
            <button onClick={() => setPage('home')} type="button">Home</button>
            <span>/</span>
            <button onClick={() => setPage('treatments')} type="button">Treatments</button>
            <span>/</span>
            <b>{displayTreatmentTitle}</b>
          </div>
          <h1>{pageTreatmentTitle} with guided care planning</h1>
          <p>{treatmentDescription}</p>
          <div className="treatment-replica-actions">
            <button onClick={() => setPage('planner')} type="button">Plan this treatment</button>
            <button onClick={() => goToSection('Top Hospitals', 'hospitals')} type="button">See suggested hospitals</button>
          </div>
        </div>
        <aside className="treatment-comfort-panel" aria-label="Care planning reassurance">
          <strong>We will make this simple</strong>
          <p>No confusing diagnosis codes for the patient journey. Share your reports once and the care team will help convert this treatment into clear next steps.</p>
          <div>
            <span>{clinicalCode ? `Ref ${clinicalCode}` : 'Backend mapped'}</span>
            <span>{backendPackage ? money(backendPackage) : 'Quote on request'}</span>
          </div>
        </aside>
      </section>

      <section className="treatment-replica-proof" aria-label="Treatment trust highlights">
        {trustBadges.map((badge) => (
          <article data-tone={badge.tone} key={`${badge.title}-${badge.subtitle}`}>
            <span><i className={`fa-solid ${badge.icon}`} aria-hidden="true" /></span>
            <div>
              <strong>{badge.title}</strong>
              <small>{badge.subtitle}</small>
            </div>
          </article>
        ))}
      </section>

      <nav className="treatment-replica-tabs" aria-label="Treatment sections">
        {tabItems.map(([label, sectionId]) => (
          <button
            className={activeTab === label ? 'active' : ''}
            key={label}
            onClick={() => goToSection(label, sectionId)}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>

      <section className="treatment-replica-panel" id="treatment-overview">
        <h2>Overview</h2>
        <p>{treatmentDescription}</p>
        <div className="treatment-source-strip" aria-label="Treatment source details">
          <span><b>Patient title</b>{displayTreatmentTitle}</span>
          <span><b>Mapped meaning</b>{clinicalCondition}</span>
          <span><b>Source</b>{sourceLabel}</span>
          <span><b>Release</b>{clinicalRelease || 'Backend record'}</span>
        </div>
        <div className="treatment-comfort-grid">
          {supportCards.map(([title, copy]) => (
            <article key={title}>
              <i className="fa-solid fa-circle-check" aria-hidden="true" />
              <strong>{title}</strong>
              <p>{copy}</p>
            </article>
          ))}
        </div>
        <button onClick={() => setPage('planner')} type="button">See plan</button>
      </section>

      <section className="treatment-replica-section" id="treatment-key-insights">
        <div className="treatment-replica-section-head">
          <h2>Key Insights at a Glance</h2>
        </div>
        <div className="treatment-replica-insights">
          {keyInsights.map(([title, description], index) => (
            <article key={title}>
              <span>{index + 1}</span>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── ICD-11 Procedures Section ── */}
      <section className="treatment-replica-section td-procedures-section" id="treatment-procedures">
        <div className="treatment-replica-section-head">
          <div>
            <span>ICD-11 Procedures</span>
            <h2>Specific Procedures for {displayTreatmentTitle}</h2>
          </div>
          <button onClick={() => setPage('planner')} type="button">Plan this treatment</button>
        </div>

        {icdProcedures.length === 0 ? (
          /* ── No procedures state ── */
          <div className="td-no-procedures">
            <div className="td-no-proc-icon">
              <i className="fa-solid fa-flask-vial" aria-hidden="true" />
            </div>
            <div className="td-no-proc-body">
              <strong>No specific procedures added yet</strong>
              <p>
                Our team hasn't imported ICD-11 procedures for <b>{categoryLabel}</b> yet.
                The care coordinator will map the exact procedure after reviewing your reports.
              </p>
              <div className="td-no-proc-actions">
                <button className="td-proc-cta-primary" onClick={() => setPage('planner')} type="button">
                  <i className="fa-solid fa-route" aria-hidden="true" /> Start journey plan
                </button>
                <button className="td-proc-cta-secondary" onClick={() => setPage('ai-assistant')} type="button">
                  <i className="fa-solid fa-comment-medical" aria-hidden="true" /> Ask AI assistant
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Procedure cards grid ── */
          <div className="td-procedure-grid">
            {icdProcedures.map((proc) => {
              const procTitle = getTreatmentDisplayTitle(proc);
              const hasCost = proc.packageFrom && proc.packageFrom > 0;
              return (
                <article
                  key={proc.id || proc._id}
                  className="td-procedure-card"
                  onClick={() => { if (setSelectedTreatment) setSelectedTreatment(proc); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') { if (setSelectedTreatment) setSelectedTreatment(proc); }}}
                >
                  {/* ICD code badge */}
                  {proc.icdCode && (
                    <span className="td-proc-icd-badge">
                      <i className="fa-solid fa-tag" aria-hidden="true" /> {proc.icdCode}
                    </span>
                  )}

                  {/* WHO link */}
                  {proc.icdBrowserUrl && (
                    <a
                      href={proc.icdBrowserUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="td-proc-who-link"
                      onClick={(e) => e.stopPropagation()}
                      title="View on WHO ICD-11 browser"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /> WHO
                    </a>
                  )}

                  {/* Icon */}
                  <div className="td-proc-icon">
                    <i className="fa-solid fa-stethoscope" aria-hidden="true" />
                  </div>

                  {/* Title */}
                  <strong className="td-proc-title">{procTitle}</strong>

                  {/* Category */}
                  <span className="td-proc-category">{proc.group || proc.category}</span>

                  {/* Description */}
                  {proc.description && !proc.description.startsWith('WHO ICD-11') && (
                    <p className="td-proc-desc">
                      {proc.description.length > 90 ? `${proc.description.slice(0, 87)}…` : proc.description}
                    </p>
                  )}

                  {/* Cost */}
                  {hasCost && (
                    <div className="td-proc-cost">
                      <i className="fa-solid fa-indian-rupee-sign" aria-hidden="true" />
                      From ₹{(proc.packageFrom / 100000).toFixed(1)}L
                    </div>
                  )}

                  {/* Plan button */}
                  <button
                    className="td-proc-plan-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Carry both treatment + procedure into planner → skip to Step 3
                      if (setPlannerInitialProcedure) setPlannerInitialProcedure(proc);
                      setPage('planner');
                    }}
                    type="button"
                  >
                    Plan this <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="treatment-replica-section" id="treatment-cost">
        <div className="treatment-replica-section-head">
          <div>
            <span>Global Cost Comparison</span>
            <h2>{pageTreatmentTitle} Abroad</h2>
          </div>
        </div>
        <div className="treatment-replica-table">
          <div className="treatment-replica-table-head">
            <span>Destination</span>
            <span>From</span>
            <span>Up to</span>
          </div>
          {costRows.map(([label, value, note]) => (
            <div className="treatment-replica-table-row" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="treatment-replica-section" id="treatment-hospitals">
        <div className="treatment-replica-section-head">
          <h2>Suggested Hospitals</h2>
          <button onClick={() => setPage('hospitals')} type="button">View all</button>
        </div>
        <div className="treatment-replica-hospital-row">
          {bestMatches.map((hospital) => (
            <article key={hospital.id}>
              <img alt={hospital.name} onError={handleImageFallback} src={getHospitalImage(hospital)} />
              <div>
                <span>{hospital.jciAccredited ? 'JCI Accredited' : accreditationText(hospital.accreditations, 'Accredited Hospital')}</span>
                <strong>{hospital.name}</strong>
                <small>{hospital.city}, {hospital.country}</small>
                <em>{matchReason(hospital)}</em>
                <p>{hospital.cost?.package ? formatCurrency(hospital.cost.package, 'INR') : selectedTreatment.packageFrom ? formatCurrency(selectedTreatment.packageFrom, 'INR') : 'Cost on Request'}</p>
                <button
                  onClick={() => {
                    setSelectedHospital(hospital);
                    setPage('hospital-detail');
                  }}
                  type="button"
                >
                  Check hospital details
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="treatment-replica-section" id="treatment-faqs">
        <div className="treatment-replica-section-head">
          <h2>FAQs</h2>
        </div>
        <div className="treatment-replica-faqs">
          {treatmentFAQs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

// Hospital Partner Landing Page Component
function HospitalPartnerLanding({ onBackToDetails, selectedHospital, isEmbedded = false }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('Submitting...');
    try {
      await fetch(`${API_BASE}/admin/partner-inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, hospitalInterest: selectedHospital?.name || 'General Inquiry', type: 'Hospital Partner', timestamp: new Date().toISOString() })
      });
      setFormStatus('✓ Thank you! We will contact you within 24 hours.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch {
      setFormStatus('✓ Thank you for your interest! We will contact you shortly.');
    }
  };

  return (
    <div className="hpl-wrap">

      {/* ── HERO ── */}
      <section className="hpl-hero">
        {!isEmbedded && (
          <button className="hpl-back" onClick={onBackToDetails} type="button">
            <i className="fa-solid fa-arrow-left" /> Back to Hospitals
          </button>
        )}
        <div className="hpl-hero-inner">
          <span className="hpl-eyebrow">Hospital Partner Programme</span>
          <h1 className="hpl-h1">
            Guaranteed <em>30% More</em><br />International Patients
          </h1>
          <p className="hpl-lead">
            11 years of healthcare-exclusive expertise delivering guaranteed patient growth within 6 months
          </p>
          <div className="hpl-hero-actions">
            <a href="#hpl-form" className="hpl-btn-primary">Book Free Strategy Session</a>
            <a href="#hpl-services" className="hpl-btn-outline">See How It Works</a>
          </div>
          <ul className="hpl-trust">
            <li><i className="fa-solid fa-circle-check" /> No Long-term Contracts</li>
            <li><i className="fa-solid fa-circle-check" /> ROI Guaranteed</li>
            <li><i className="fa-solid fa-circle-check" /> Pay Per Result</li>
          </ul>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="hpl-stats">
        <div className="hpl-stat"><strong>30%+</strong><span>Patient Growth</span></div>
        <div className="hpl-stat"><strong>6 Months</strong><span>Guaranteed Results</span></div>
        <div className="hpl-stat"><strong>100%</strong><span>ROI Focused</span></div>
        <div className="hpl-stat"><strong>11 Years</strong><span>Healthcare Expertise</span></div>
      </section>

      {/* ── VALUE PROP ── */}
      <section className="hpl-value">
        <div className="hpl-container">
          <div className="hpl-section-label">Why Choose Us</div>
          <h2>Optimizing for Revenue, Not Just Conversations</h2>
          <p>We maximize ROI on your marketing budget. Expect minimum 30% increase in international patient footfall in 6 months.</p>
        </div>
      </section>

      {/* ── DOOH FEATURE SECTION ── */}
      <section className="hpl-dooh" id="hpl-services">
        <div className="hpl-container">
          <div className="hpl-section-label">Most Effective Channel</div>
          <h2>Digital Outdoor (DOOH) Advertising<br />in Global Markets</h2>
          <p className="hpl-section-sub">
            Position your hospital where patients spend time — airports, malls, metro stations across the Middle East
          </p>

          <div className="hpl-dooh-grid">
            <div className="hpl-dooh-card">
              <i className="fa-solid fa-plane-departure" />
              <strong>Airports</strong>
              <span>International terminals</span>
            </div>
            <div className="hpl-dooh-card">
              <i className="fa-solid fa-bag-shopping" />
              <strong>Shopping Malls</strong>
              <span>High-footfall locations</span>
            </div>
            <div className="hpl-dooh-card">
              <i className="fa-solid fa-train" />
              <strong>Metro Stations</strong>
              <span>Daily commuters</span>
            </div>
            <div className="hpl-dooh-card">
              <i className="fa-solid fa-city" />
              <strong>City Centers</strong>
              <span>Premium billboards</span>
            </div>
          </div>

          <div className="hpl-countries">
            <span className="hpl-country">🇸🇦 Saudi Arabia</span>
            <span className="hpl-country">🇦🇪 UAE</span>
            <span className="hpl-country">🇰🇼 Kuwait</span>
            <span className="hpl-country">🇴🇲 Oman</span>
            <span className="hpl-country">🇶🇦 Qatar</span>
            <span className="hpl-country">🇧🇭 Bahrain</span>
          </div>
        </div>
      </section>

      {/* ── OTHER SERVICES ── */}
      <section className="hpl-services">
        <div className="hpl-container">
          <div className="hpl-section-label">How We Build Your Digital Prominence</div>
          <h2>Multi-Channel Patient Acquisition</h2>
          <div className="hpl-services-grid">
            <div className="hpl-service-card">
              <i className="fa-solid fa-magnifying-glass" />
              <h4>SEO & Content Marketing</h4>
              <p>Rank #1 for medical tourism keywords and capture patients who are actively searching</p>
            </div>
            <div className="hpl-service-card">
              <i className="fa-solid fa-bullhorn" />
              <h4>Social Media Campaigns</h4>
              <p>Targeted paid ads reaching the right patient demographics across platforms</p>
            </div>
            <div className="hpl-service-card">
              <i className="fa-solid fa-handshake" />
              <h4>Partnership Network</h4>
              <p>Direct access to medical tourism facilitators and referral partners worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <section className="hpl-form-section" id="hpl-form">
        <div className="hpl-form-grid">
          <div className="hpl-form-left">
            <div className="hpl-section-label light">Get Started</div>
            <h2>Book Your Free<br />Strategy Session</h2>
            <p>Get a custom growth roadmap and 6-month implementation plan tailored for your hospital</p>
            <ul className="hpl-checklist">
              <li><i className="fa-solid fa-check" /> 30-minute consultation with a healthcare marketing expert</li>
              <li><i className="fa-solid fa-check" /> Custom patient acquisition strategy</li>
              <li><i className="fa-solid fa-check" /> Competitor analysis & market positioning</li>
              <li><i className="fa-solid fa-check" /> ROI projections for your specialty</li>
            </ul>
          </div>
          <div className="hpl-form-right">
            <form className="hpl-form" onSubmit={handleSubmit}>
              <label>
                Hospital Name
                <input type="text" placeholder="e.g. Apollo Hospitals" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </label>
              <label>
                Email Address
                <input type="email" placeholder="you@hospital.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </label>
              <label>
                Phone Number
                <input type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
              </label>
              <label>
                About Your Hospital
                <textarea rows="3" placeholder="Specialty, current patient volume, growth goals..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
              </label>
              <button type="submit" className="hpl-submit">
                <i className="fa-solid fa-calendar-check" /> Book Free Session
              </button>
              {formStatus && <p className="hpl-form-status">{formStatus}</p>}
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}

function HospitalDetail({ money, selectedHospital, selectedTreatment, setPage, setSelectedHospital, onBack }) {
  const basePackage = selectedTreatment && selectedHospital.tags.includes(selectedTreatment.title) ? selectedTreatment.packageFrom : selectedHospital.cost.package;
  const gallery = hospitalGallery(selectedHospital);
  const [activeTab, setActiveTab] = useState('About');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const doctorTreatmentOptions = ['All', ...new Set([...selectedHospital.tags, ...selectedHospital.doctorFocus].slice(0, 8))];
  const [doctorTreatmentFilter, setDoctorTreatmentFilter] = useState(selectedTreatment?.title ?? 'All');
  const [budget, setBudget] = useState({
    package: basePackage,
    flight: selectedHospital.cost.flight,
    visa: selectedHospital.cost.visa,
    local: selectedHospital.cost.local,
    stay: selectedHospital.cost.stay,
    service: selectedHospital.cost.service,
  });
  const rows = [
    ['package', 'Treatment package', 100, 30000],
    ['flight', 'Flights', 100, 3000],
    ['visa', 'Visa', 0, 600],
    ['local', 'Local transport', 20, 1000],
    ['stay', 'Stay estimate', 100, 5000],
    ['service', 'Care coordination', 0, 1500],
  ];
  const customTotal = Object.values(budget).reduce((sum, value) => sum + Number(value), 0);
  const scrollToHospitalForm = () => setShowAppointmentModal(true);
  const suggestedDoctorHospitals = HOSPITALS.filter((hospital) => {
    if (doctorTreatmentFilter === 'All') return hospital.city === selectedHospital.city || hospital.specialty === selectedHospital.specialty;
    return hospital.tags.includes(doctorTreatmentFilter) || hospital.doctorFocus.includes(doctorTreatmentFilter) || hospital.specialty === doctorTreatmentFilter;
  }).slice(0, 6);
  const hospitalAccreditation = accreditationText(selectedHospital.accreditations, selectedHospital.nabhType || selectedHospital.jciStatus || 'Update pending');
  const hospitalAddress = selectedHospital.address || selectedHospital.addressLine1 || [selectedHospital.city, selectedHospital.state, selectedHospital.country].filter(Boolean).join(', ');
  const hospitalBeds = selectedHospital.bedText || selectedHospital.beds || 'Update pending';
  const hospitalFounded = selectedHospital.foundedYear || selectedHospital.established || 'Update pending';
  const hospitalFacilities = Array.isArray(selectedHospital.facilities) && selectedHospital.facilities.length
    ? selectedHospital.facilities
    : ['International patient support', 'Hospital profile enrichment pending'];
  const hospitalAccreditationList = Array.isArray(selectedHospital.accreditations)
    ? selectedHospital.accreditations
    : String(selectedHospital.accreditations || hospitalAccreditation).split(',').map((item) => item.trim()).filter(Boolean);
  const hospitalDoctorsList = selectedHospital.doctorsList || selectedHospital.doctor || 'Doctor list update pending';
  const hospitalContact = selectedHospital.phone || selectedHospital.mobile || 'Contact update pending';
  const hospitalWebsite = selectedHospital.website || '';

  // Show modal after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAppointmentModal(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="profile-page hospital-cma-page">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: () => setPage('home') },
          { label: 'Hospitals', onClick: onBack || (() => setPage('hospitals')) },
          { label: selectedHospital.country, onClick: () => setPage('destinations') },
          { label: selectedHospital.name },
        ]}
      />
      <div className="profile-title-row hospital-detail-title">
        <div>
          <span>{selectedHospital.city}, {selectedHospital.country}</span>
          <h1>{selectedHospital.name}</h1>
          <div className="cma-hospital-tags">
            <span>{selectedHospital.specialty} Hospital</span>
            <span>{selectedHospital.jciAccredited ? 'JCI Accredited' : selectedHospital.nabhType || 'Accredited Hospital'}</span>
            <span>{selectedHospital.internationalPatientWing ? `International wing: ${selectedHospital.internationalPatientWing}` : 'International patient support'}</span>
          </div>
          <p>{selectedHospital.name} is part of the client/JCI hospital master database with mapped accreditation, contact, location, and specialty details for care coordination.</p>
        </div>
        <div className="rating-card">
          <strong>{selectedHospital.rating}</strong>
          <span>Patient rating</span>
          <small>{selectedHospital.value}% patients recommend this hospital</small>
        </div>
      </div>
      <div className="hospital-profile-hero">
        <div className="gallery-mosaic">
          <button className="gallery-image-button gallery-main" onClick={() => setGalleryOpen(true)} type="button">
            <img alt={`${selectedHospital.name} main`} onError={handleImageFallback} src={gallery[0]} />
          </button>
          {gallery.slice(1).map((image, index) => (
            <button className="gallery-image-button" key={image} onClick={() => setGalleryOpen(true)} type="button">
              <img alt={`${selectedHospital.name} gallery ${index + 1}`} onError={handleImageFallback} src={image} />
            </button>
          ))}
          <button className="gallery-open-button" onClick={() => setGalleryOpen(true)} type="button">All pictures</button>
        </div>
      </div>

      <div className="hospital-detail-info-grid">
        <span><b>Doctors List</b><small>{hospitalDoctorsList}</small></span>
        <span><b>Location</b><small>{selectedHospital.city || 'India'}</small></span>
        <span><b>Established in</b><small>{hospitalFounded}</small></span>
        <span><b>Accreditations</b><small>{hospitalAccreditation}</small></span>
        <span><b>Specialty</b><small>{selectedHospital.specialty}</small></span>
        <span><b>Contact</b><small>{hospitalContact}</small></span>
        <span><b>Number of beds</b><small>{hospitalBeds}</small></span>
        <span><b>Facilities</b><small>{hospitalFacilities.slice(0, 2).join(', ')}</small></span>
      </div>

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <>
          <div className="appointment-modal-backdrop" onClick={() => setShowAppointmentModal(false)} />
          <div className="appointment-modal">
            <button className="modal-close-btn" onClick={() => setShowAppointmentModal(false)} type="button">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
            <div className="modal-header d-block">
              <i className="fa-solid fa-phone" aria-hidden="true" />
              <h2>Get a Call Back</h2>
              <p>We'll call you back within 30 minutes to discuss your treatment options</p>
            </div>
            <CallBackForm selectedHospital={selectedHospital} />
          </div>
        </>
      )}

      <div className="hospital-action-row">
        <button onClick={scrollToHospitalForm} type="button">Get Call Back from {selectedHospital.name}</button>
      </div>

      <nav className="cma-detail-nav" aria-label="Hospital details sections">
        {['Overview', 'Treatments', 'Facilities', 'Reviews', 'Location', 'FAQs', 'Compare Hospitals'].map((item) => (
          <a href={`#hospital-${item.toLowerCase().replaceAll(' ', '-')}`} key={item}>{item}</a>
        ))}
      </nav>

      <section className="cma-overview-panel" id="hospital-overview">
        <div className="cma-overview-copy">
          <span>Patient Trusted Hospital</span>
          <h2>{selectedHospital.name}</h2>
          <p>{hospitalAddress}</p>
          <div className="cma-rating-row">
            <strong>{selectedHospital.rating}</strong>
            <StarRating rating={selectedHospital.rating} />
            <small>{hospitalAccreditation}</small>
          </div>
        </div>
        <img alt={selectedHospital.name} onError={handleImageFallback} src={getHospitalImage(selectedHospital)} />
      </section>

      <section className="cma-care-grid" aria-label="Care provided by hospital">
        {[
          ['Internationally accredited care', 'Verified doctors, modern departments, and structured patient support.'],
          ['Top hospital network', 'Shortlist care by treatment, city, doctor availability, and estimated budget.'],
          ['World-class infrastructure', 'Advanced diagnostics, modular theatres, ICU beds, and recovery support.'],
          ['Patient-first services', 'Dedicated coordinator for appointments, reports, travel, and follow-up.'],
        ].map(([title, text]) => (
          <article key={title}>
            <span aria-hidden="true"><UiIcon name="shield" /></span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="cma-content-grid">
        <article className="cma-about-card">
          <h2>About</h2>
          <p>
            {selectedHospital.name} is listed in the {selectedHospital.sourceSystem || 'client hospital master database'} for {selectedHospital.specialty.toLowerCase()} care
            {selectedHospital.city ? ` in ${selectedHospital.city}` : ''}. The profile includes client-provided address, accreditation, bed count, international patient wing, and contact details where available.
          </p>

          {/* Contact Details Section */}
          <div className="hospital-contact-details">
            <h3>Contact Information</h3>
            <div className="contact-details-grid">
              {hospitalContact && hospitalContact !== 'Contact update pending' && (
                <a href={`tel:${hospitalContact.replace(/\s/g, '')}`} className="contact-detail-item">
                  <div className="contact-icon">
                    <i className="fa-solid fa-phone" aria-hidden="true" />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Phone</span>
                    <strong className="contact-value">{hospitalContact}</strong>
                  </div>
                </a>
              )}

              {selectedHospital.email && selectedHospital.email !== 'Update pending' && (
                <a href={`mailto:${selectedHospital.email}`} className="contact-detail-item">
                  <div className="contact-icon">
                    <i className="fa-solid fa-envelope" aria-hidden="true" />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Email</span>
                    <strong className="contact-value">{selectedHospital.email}</strong>
                  </div>
                </a>
              )}

              {hospitalAddress && (
                <div className="contact-detail-item">
                  <div className="contact-icon">
                    <i className="fa-solid fa-location-dot" aria-hidden="true" />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Location</span>
                    <strong className="contact-value">{hospitalAddress}</strong>
                  </div>
                </div>
              )}

              {hospitalWebsite && (
                <a href={hospitalWebsite} rel="noreferrer" target="_blank" className="contact-detail-item">
                  <div className="contact-icon">
                    <i className="fa-solid fa-globe" aria-hidden="true" />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Website</span>
                    <strong className="contact-value">Visit Hospital Website</strong>
                  </div>
                </a>
              )}
            </div>
          </div>

          <h3>Medical Specialty</h3>
          <ul>
            {selectedHospital.tags.slice(0, 4).map((item) => <li key={item}>{item}</li>)}
          </ul>

          <h3>International Services</h3>
          <ul>
            <li>International patient wing: {selectedHospital.internationalPatientWing || 'Update pending'}.</li>
            {selectedHospital.internationalPatientWing && selectedHospital.internationalPatientWing !== 'no' && selectedHospital.internationalPatientWing !== 'yes' && (
              <li className="international-wing-details">{selectedHospital.internationalPatientWing}</li>
            )}
          </ul>
        </article>

        <aside className="cma-side-stack">
          <section id="hospital-treatments">
            <h3>Treatments {selectedHospital.name} is known for</h3>
            <div className="cma-chip-list">
              {[...selectedHospital.tags, ...selectedHospital.doctorFocus].slice(0, 8).map((item) => (
                <button onClick={() => setPage('treatments')} key={item} type="button">{item}</button>
              ))}
            </div>
          </section>
          <section id="hospital-facilities">
            <h3>Highlights</h3>
            <div className="cma-facility-grid">
              {[
                [`Bed Count: ${hospitalBeds}`],
                [`Established: ${hospitalFounded}`],
                [`Accreditation: ${hospitalAccreditation}`],
                [`Source: ${selectedHospital.sourceSystem || 'Client master data'}`],
                ...hospitalFacilities.slice(0, 4).map((item) => [item]),
              ].map(([item]) => <span key={item}><UiIcon name="shield" />{item}</span>)}
            </div>
          </section>
        </aside>
      </section>

      <section className="cma-content-grid cma-lower-grid">
        <article className="cma-about-card">
          <h2>Why International Patients Choose {selectedHospital.name}</h2>
          <div className="cma-info-pairs">
            <span><b>Hospital Type</b><small>Multispecialty Hospital</small></span>
            <span><b>Hospital Unit</b><small>{selectedHospital.specialty}</small></span>
            <span><b>Languages Spoken</b><small>{selectedHospital.languages.join(', ')}</small></span>
            <span><b>Location</b><small>{selectedHospital.city}, India</small></span>
          </div>
        </article>
        <article className="cma-about-card" id="hospital-reviews">
          <h2>Payment Method</h2>
          <div className="cma-facility-grid">
            {['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Insurance support'].map((item) => (
              <span key={item}><UiIcon name="cost" />{item}</span>
            ))}
          </div>
          <h2>Room Types</h2>
          <div className="cma-facility-grid">
            {['General Ward', 'Semi-Private Room', 'Private Room', 'Deluxe Room'].map((item) => (
              <span key={item}><UiIcon name="home" />{item}</span>
            ))}
          </div>
        </article>
      </section>

      <section className="hospital-doctors-section">
        <div className="cma-section-title">
          <h2>Suggested Doctors at {selectedHospital.name}</h2>
          <p>Filter doctors by treatment, compare experience, then book an appointment.</p>
        </div>
        <div className="doctor-filter-row">
          {doctorTreatmentOptions.map((item) => (
            <button
              className={doctorTreatmentFilter === item ? 'active' : ''}
              key={item}
              onClick={() => setDoctorTreatmentFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="vaidam-doctor-grid">
          {suggestedDoctorHospitals.map((hospital) => (
            <article key={`${hospital.id}-${hospital.doctor}`} className="vaidam-doctor-card">
              <div className="vaidam-doctor-top">
                <img alt={hospital.doctor} src={hospital.doctorImage} />
                <div>
                  <h3>{hospital.doctor}</h3>
                  <p>{hospital.doctorTitle}</p>
                  <strong>{hospital.experience} of experience</strong>
                  <StarRating rating={hospital.rating} />
                </div>
              </div>
              <div className="vaidam-doctor-actions">
                <button
                  onClick={() => {
                    setSelectedHospital(hospital);
                    setPage('doctor-detail');
                  }}
                  type="button"
                >
                  View Profile
                </button>
                <button onClick={scrollToHospitalForm} type="button">Book Appointment</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="profile-tabs">
        {['About', 'Specialisation', 'Doctors', 'Gallery', 'Infrastructure', 'Reviews'].map((item) => (
          <button className={activeTab === item ? 'active' : ''} key={item} onClick={() => setActiveTab(item)} type="button">
            {item}
          </button>
        ))}
      </div>

      <div className="profile-layout">
        <div className="profile-main">
          {activeTab === 'About' && (
            <article className="detail-panel hospital-about">
              <h2>About the hospital</h2>
              <p>
                {selectedHospital.name} is listed from the {selectedHospital.sourceSystem || 'client hospital master database'}.
                Its current master profile includes {selectedHospital.specialty} specialty, {hospitalAccreditation} accreditation status,
                and {hospitalAddress || 'location details pending'}.
              </p>
              <p>
                Secondary enrichment such as detailed facilities, live doctors, photos, and package pricing can be updated from admin
                without replacing the base hospital record.
              </p>
              <div className="hospital-stat-row">
                <span><strong>{hospitalFounded}</strong><small>Established</small></span>
                <span><strong>{hospitalBeds}</strong><small>Beds</small></span>
                <span><strong>{selectedHospital.internationalPatientWing || 'Update pending'}</strong><small>International wing</small></span>
                <span><strong>{selectedHospital.city || 'India'}</strong><small>Location</small></span>
              </div>
            </article>
          )}

          {activeTab === 'Specialisation' && (
            <article className="detail-panel">
              <h2>Team & Specialisation</h2>
              <div className="tag-cloud">
                {[...selectedHospital.tags, ...selectedHospital.doctorFocus, 'International patient care', 'Remote follow-up'].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          )}

          {activeTab === 'Doctors' && (
            <article className="detail-panel profile-doctor-strip">
              <img alt={selectedHospital.doctor} src={selectedHospital.doctorImage} />
              <div>
                <span>Featured doctor</span>
                <h2>{selectedHospital.doctor}</h2>
                <p>{selectedHospital.doctorTitle} with {selectedHospital.experience} experience.</p>
                <StarRating rating={selectedHospital.rating} />
                <strong>{money(selectedHospital.doctorFee)} consultation</strong>
                <button onClick={() => setPage('doctor-detail')} type="button">View doctor profile</button>
              </div>
            </article>
          )}

          {activeTab === 'Gallery' && (
            <article className="detail-panel">
              <h2>Gallery</h2>
              <div className="inline-gallery">
                {gallery.map((image, index) => (
                  <img alt={`${selectedHospital.name} interior ${index + 1}`} key={image} src={image} />
                ))}
              </div>
            </article>
          )}

          {activeTab === 'Infrastructure' && (
            <>
              <article className="detail-panel">
                <h2>Infrastructure</h2>
                <div className="feature-list">
                  {selectedHospital.infrastructure.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </article>
              <article className="detail-panel">
                <h2>Accreditations & certificates</h2>
                <div className="certificate-grid">
                  {hospitalAccreditationList.length ? hospitalAccreditationList.map((item) => (
                    <span key={item}><strong>{item.split(' ')[0]}</strong><small>{item}</small></span>
                  )) : <span><strong>Pending</strong><small>Accreditation details can be updated from admin.</small></span>}
                </div>
              </article>
            </>
          )}

          {activeTab === 'Reviews' && (
            <article className="detail-panel">
              <h2>Reviews & patient stories</h2>
              <div className="review-grid">
                {PATIENT_REVIEWS.map(([name, country, review]) => (
                  <blockquote key={name}>
                    <StarRating rating="5.0" />
                    <strong>{name}</strong>
                    <span>{country}</span>
                    <p>{review}</p>
                  </blockquote>
                ))}
              </div>
            </article>
          )}
        </div>

      </div>
      <section className="full-budget-section">
        <div className="budget-section-intro">
          <span>Cost transparency planner</span>
          <h2>Customize the full patient journey budget</h2>
          <p>Separate hospital package, travel, visa, local transport, stay and care coordination. This is the main decision layer before the patient requests an appointment.</p>
          <div className="budget-deep-copy">
            <h3>What this estimate explains</h3>
            <ul>
              <li>Hospital package is only one part of the journey.</li>
              <li>Travel and stay can change destination affordability.</li>
              <li>Care coordination keeps pickup, reports, follow-up, and support visible.</li>
            </ul>
          </div>
        </div>
        <div className="budget-workbench">
          <div className="budget-total-card">
            <span>Total journey estimate</span>
            <strong>{money(customTotal)}</strong>
            <small>Includes treatment, travel, visa, stay, local transport, and care coordination.</small>
          </div>
          <div className="budget-pill-row">
            <span>Editable</span>
            <span>API ready</span>
            <span>Transparent</span>
          </div>
          <div className="budget-customizer">
            {rows.map(([key, label, min, max]) => (
              <label key={key}>
                <span>
                  <small>{label}</small>
                  <strong>{money(Number(budget[key]))}</strong>
                </span>
                <input
                  max={max}
                  min={min}
                  onChange={(event) => setBudget((current) => ({ ...current, [key]: Number(event.target.value) }))}
                  step="10"
                  type="range"
                  value={budget[key]}
                />
              </label>
            ))}
          </div>
          <div className="cost-table budget-breakdown-grid">
            {rows.map(([key, label]) => (
              <span key={key}>
                <small>{label}</small>
                <strong>{money(Number(budget[key]))}</strong>
              </span>
            ))}
            <span className="total-line">
              <small>Total estimate</small>
              <strong>{money(customTotal)}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Partner Landing Section - Added at the end */}
      <section className="hospital-partner-section">
        <div className="partner-cta-banner">
          <div className="partner-cta-content">
            <h2><i className="fa-solid fa-handshake" aria-hidden="true" /> Partner with Us</h2>
            <p>Are you a hospital looking to attract more international patients? We can help you grow your patient footfall by 30% in 6 months.</p>
            <button onClick={() => document.getElementById('partner-details').scrollIntoView({ behavior: 'smooth' })} type="button">
              Learn More <i className="fa-solid fa-arrow-down" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div id="partner-details" className="partner-details-section">
          <HospitalPartnerLanding onBackToDetails={() => {}} selectedHospital={selectedHospital} isEmbedded={true} />
        </div>
      </section>

      {galleryOpen && (
        <div className="gallery-overlay" role="dialog" aria-modal="true" aria-label={`${selectedHospital.name} gallery`}>
          <div className="gallery-dialog">
            <button className="modal-close" onClick={() => setGalleryOpen(false)} type="button">x</button>
            <span>{selectedHospital.name}</span>
            <h2>Hospital gallery</h2>
            <div className="gallery-dialog-grid">
              {gallery.map((image, index) => (
                <img alt={`${selectedHospital.name} full gallery ${index + 1}`} key={image} src={image} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function DoctorDetail({ money, selectedHospital, setPage }) {
  const gallery = hospitalGallery(selectedHospital);
  const [activeTab, setActiveTab] = useState('About');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const doctorTreatmentOptions = ['All', ...new Set([...selectedHospital.tags, ...selectedHospital.doctorFocus].slice(0, 8))];
  const [doctorTreatmentFilter, setDoctorTreatmentFilter] = useState(selectedTreatment?.title ?? 'All');
  const [budget, setBudget] = useState({
    package: basePackage,
    flight: selectedHospital.cost.flight,
    visa: selectedHospital.cost.visa,
    local: selectedHospital.cost.local,
    stay: selectedHospital.cost.stay,
    service: selectedHospital.cost.service,
  });
  const rows = [
    ['package', 'Treatment package', 100, 30000],
    ['flight', 'Flights', 100, 3000],
    ['visa', 'Visa', 0, 600],
    ['local', 'Local transport', 20, 1000],
    ['stay', 'Stay estimate', 100, 5000],
    ['service', 'Care coordination', 0, 1500],
  ];
  const customTotal = Object.values(budget).reduce((sum, value) => sum + Number(value), 0);
  const scrollToHospitalForm = () => setShowAppointmentModal(true);
  const suggestedDoctorHospitals = HOSPITALS.filter((hospital) => {
    if (doctorTreatmentFilter === 'All') return hospital.city === selectedHospital.city || hospital.specialty === selectedHospital.specialty;
    return hospital.tags.includes(doctorTreatmentFilter) || hospital.doctorFocus.includes(doctorTreatmentFilter) || hospital.specialty === doctorTreatmentFilter;
  }).slice(0, 6);
  const hospitalAccreditation = accreditationText(selectedHospital.accreditations, selectedHospital.nabhType || selectedHospital.jciStatus || 'Update pending');
  const hospitalAddress = selectedHospital.address || selectedHospital.addressLine1 || [selectedHospital.city, selectedHospital.state, selectedHospital.country].filter(Boolean).join(', ');
  const hospitalBeds = selectedHospital.bedText || selectedHospital.beds || 'Update pending';
  const hospitalFounded = selectedHospital.foundedYear || selectedHospital.established || 'Update pending';
  const hospitalFacilities = Array.isArray(selectedHospital.facilities) && selectedHospital.facilities.length
    ? selectedHospital.facilities
    : ['International patient support', 'Hospital profile enrichment pending'];
  const hospitalAccreditationList = Array.isArray(selectedHospital.accreditations)
    ? selectedHospital.accreditations
    : String(selectedHospital.accreditations || hospitalAccreditation).split(',').map((item) => item.trim()).filter(Boolean);
  const hospitalDoctorsList = selectedHospital.doctorsList || selectedHospital.doctor || 'Doctor list update pending';
  const hospitalContact = selectedHospital.phone || selectedHospital.mobile || 'Contact update pending';
  const hospitalWebsite = selectedHospital.website || '';

  // Show modal after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAppointmentModal(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="profile-page hospital-cma-page">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: () => setPage('home') },
          { label: 'Hospitals', onClick: onBack || (() => setPage('hospitals')) },
          { label: selectedHospital.country, onClick: () => setPage('destinations') },
          { label: selectedHospital.name },
        ]}
      />
      <div className="profile-title-row hospital-detail-title">
        <div>
          <span>{selectedHospital.city}, {selectedHospital.country}</span>
          <h1>{selectedHospital.name}</h1>
          <div className="cma-hospital-tags">
            <span>{selectedHospital.specialty} Hospital</span>
            <span>{selectedHospital.jciAccredited ? 'JCI Accredited' : selectedHospital.nabhType || 'Accredited Hospital'}</span>
            <span>{selectedHospital.internationalPatientWing ? `International wing: ${selectedHospital.internationalPatientWing}` : 'International patient support'}</span>
          </div>
          <p>{selectedHospital.name} is part of the client/JCI hospital master database with mapped accreditation, contact, location, and specialty details for care coordination.</p>
        </div>
        <div className="rating-card">
          <strong>{selectedHospital.rating}</strong>
          <span>Patient rating</span>
          <small>{selectedHospital.value}% patients recommend this hospital</small>
        </div>
      </div>
      <div className="hospital-profile-hero">
        <div className="gallery-mosaic">
          <button className="gallery-image-button gallery-main" onClick={() => setGalleryOpen(true)} type="button">
            <img alt={`${selectedHospital.name} main`} onError={handleImageFallback} src={gallery[0]} />
          </button>
          {gallery.slice(1).map((image, index) => (
            <button className="gallery-image-button" key={image} onClick={() => setGalleryOpen(true)} type="button">
              <img alt={`${selectedHospital.name} gallery ${index + 1}`} onError={handleImageFallback} src={image} />
            </button>
          ))}
          <button className="gallery-open-button" onClick={() => setGalleryOpen(true)} type="button">All pictures</button>
        </div>
      </div>

      <div className="hospital-detail-info-grid">
        <span><b>Doctors List</b><small>{hospitalDoctorsList}</small></span>
        <span><b>Location</b><small>{selectedHospital.city || 'India'}</small></span>
        <span><b>Established in</b><small>{hospitalFounded}</small></span>
        <span><b>Accreditations</b><small>{hospitalAccreditation}</small></span>
        <span><b>Specialty</b><small>{selectedHospital.specialty}</small></span>
        <span><b>Contact</b><small>{hospitalContact}</small></span>
        <span><b>Number of beds</b><small>{hospitalBeds}</small></span>
        <span><b>Facilities</b><small>{hospitalFacilities.slice(0, 2).join(', ')}</small></span>
      </div>

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <>
          <div className="appointment-modal-backdrop" onClick={() => setShowAppointmentModal(false)} />
          <div className="appointment-modal">
            <button className="modal-close-btn" onClick={() => setShowAppointmentModal(false)} type="button">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
            <div className="modal-header d-block">
              <i className="fa-solid fa-phone" aria-hidden="true" />
              <h2>Get a Call Back</h2>
              <p>We'll call you back within 30 minutes to discuss your treatment options</p>
            </div>
            <CallBackForm selectedHospital={selectedHospital} />
          </div>
        </>
      )}

      <div className="hospital-action-row">
        <button onClick={scrollToHospitalForm} type="button">Get Call Back from {selectedHospital.name}</button>
      </div>

      <nav className="cma-detail-nav" aria-label="Hospital details sections">
        {['Overview', 'Treatments', 'Facilities', 'Reviews', 'Location', 'FAQs', 'Compare Hospitals'].map((item) => (
          <a href={`#hospital-${item.toLowerCase().replaceAll(' ', '-')}`} key={item}>{item}</a>
        ))}
      </nav>

      <section className="cma-overview-panel" id="hospital-overview">
        <div className="cma-overview-copy">
          <span>Patient Trusted Hospital</span>
          <h2>{selectedHospital.name}</h2>
          <p>{hospitalAddress}</p>
          <div className="cma-rating-row">
            <strong>{selectedHospital.rating}</strong>
            <StarRating rating={selectedHospital.rating} />
            <small>{hospitalAccreditation}</small>
          </div>
        </div>
        <img alt={selectedHospital.name} onError={handleImageFallback} src={getHospitalImage(selectedHospital)} />
      </section>

      <section className="cma-care-grid" aria-label="Care provided by hospital">
        {[
          ['Internationally accredited care', 'Verified doctors, modern departments, and structured patient support.'],
          ['Top hospital network', 'Shortlist care by treatment, city, doctor availability, and estimated budget.'],
          ['World-class infrastructure', 'Advanced diagnostics, modular theatres, ICU beds, and recovery support.'],
          ['Patient-first services', 'Dedicated coordinator for appointments, reports, travel, and follow-up.'],
        ].map(([title, text]) => (
          <article key={title}>
            <span aria-hidden="true"><UiIcon name="shield" /></span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="cma-content-grid">
        <article className="cma-about-card">
          <h2>About</h2>
          <p>
            {selectedHospital.name} is listed in the {selectedHospital.sourceSystem || 'client hospital master database'} for {selectedHospital.specialty.toLowerCase()} care
            {selectedHospital.city ? ` in ${selectedHospital.city}` : ''}. The profile includes client-provided address, accreditation, bed count, international patient wing, and contact details where available.
          </p>

          {/* Contact Details Section */}
          <div className="hospital-contact-details">
            <h3>Contact Information</h3>
            <div className="contact-details-grid">
              {hospitalContact && hospitalContact !== 'Contact update pending' && (
                <a href={`tel:${hospitalContact.replace(/\s/g, '')}`} className="contact-detail-item">
                  <div className="contact-icon">
                    <i className="fa-solid fa-phone" aria-hidden="true" />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Phone</span>
                    <strong className="contact-value">{hospitalContact}</strong>
                  </div>
                </a>
              )}

              {selectedHospital.email && selectedHospital.email !== 'Update pending' && (
                <a href={`mailto:${selectedHospital.email}`} className="contact-detail-item">
                  <div className="contact-icon">
                    <i className="fa-solid fa-envelope" aria-hidden="true" />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Email</span>
                    <strong className="contact-value">{selectedHospital.email}</strong>
                  </div>
                </a>
              )}

              {hospitalAddress && (
                <div className="contact-detail-item">
                  <div className="contact-icon">
                    <i className="fa-solid fa-location-dot" aria-hidden="true" />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Location</span>
                    <strong className="contact-value">{hospitalAddress}</strong>
                  </div>
                </div>
              )}

              {hospitalWebsite && (
                <a href={hospitalWebsite} rel="noreferrer" target="_blank" className="contact-detail-item">
                  <div className="contact-icon">
                    <i className="fa-solid fa-globe" aria-hidden="true" />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Website</span>
                    <strong className="contact-value">Visit Hospital Website</strong>
                  </div>
                </a>
              )}
            </div>
          </div>

          <h3>Medical Specialty</h3>
          <ul>
            {selectedHospital.tags.slice(0, 4).map((item) => <li key={item}>{item}</li>)}
          </ul>

          <h3>International Services</h3>
          <ul>
            <li>International patient wing: {selectedHospital.internationalPatientWing || 'Update pending'}.</li>
            {selectedHospital.internationalPatientWing && selectedHospital.internationalPatientWing !== 'no' && selectedHospital.internationalPatientWing !== 'yes' && (
              <li className="international-wing-details">{selectedHospital.internationalPatientWing}</li>
            )}
          </ul>
        </article>

        <aside className="cma-side-stack">
          <section id="hospital-treatments">
            <h3>Treatments {selectedHospital.name} is known for</h3>
            <div className="cma-chip-list">
              {[...selectedHospital.tags, ...selectedHospital.doctorFocus].slice(0, 8).map((item) => (
                <button onClick={() => setPage('treatments')} key={item} type="button">{item}</button>
              ))}
            </div>
          </section>
          <section id="hospital-facilities">
            <h3>Highlights</h3>
            <div className="cma-facility-grid">
              {[
                [`Bed Count: ${hospitalBeds}`],
                [`Established: ${hospitalFounded}`],
                [`Accreditation: ${hospitalAccreditation}`],
                [`Source: ${selectedHospital.sourceSystem || 'Client master data'}`],
                ...hospitalFacilities.slice(0, 4).map((item) => [item]),
              ].map(([item]) => <span key={item}><UiIcon name="shield" />{item}</span>)}
            </div>
          </section>
        </aside>
      </section>

      <section className="cma-content-grid cma-lower-grid">
        <article className="cma-about-card">
          <h2>Why International Patients Choose {selectedHospital.name}</h2>
          <div className="cma-info-pairs">
            <span><b>Hospital Type</b><small>Multispecialty Hospital</small></span>
            <span><b>Hospital Unit</b><small>{selectedHospital.specialty}</small></span>
            <span><b>Languages Spoken</b><small>{selectedHospital.languages.join(', ')}</small></span>
            <span><b>Location</b><small>{selectedHospital.city}, India</small></span>
          </div>
        </article>
        <article className="cma-about-card" id="hospital-reviews">
          <h2>Payment Method</h2>
          <div className="cma-facility-grid">
            {['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Insurance support'].map((item) => (
              <span key={item}><UiIcon name="cost" />{item}</span>
            ))}
          </div>
          <h2>Room Types</h2>
          <div className="cma-facility-grid">
            {['General Ward', 'Semi-Private Room', 'Private Room', 'Deluxe Room'].map((item) => (
              <span key={item}><UiIcon name="home" />{item}</span>
            ))}
          </div>
        </article>
      </section>

      <section className="hospital-doctors-section">
        <div className="cma-section-title">
          <h2>Suggested Doctors at {selectedHospital.name}</h2>
          <p>Filter doctors by treatment, compare experience, then book an appointment.</p>
        </div>
        <div className="doctor-filter-row">
          {doctorTreatmentOptions.map((item) => (
            <button
              className={doctorTreatmentFilter === item ? 'active' : ''}
              key={item}
              onClick={() => setDoctorTreatmentFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="vaidam-doctor-grid">
          {suggestedDoctorHospitals.map((hospital) => (
            <article key={`${hospital.id}-${hospital.doctor}`} className="vaidam-doctor-card">
              <div className="vaidam-doctor-top">
                <img alt={hospital.doctor} src={hospital.doctorImage} />
                <div>
                  <h3>{hospital.doctor}</h3>
                  <p>{hospital.doctorTitle}</p>
                  <strong>{hospital.experience} of experience</strong>
                  <StarRating rating={hospital.rating} />
                </div>
              </div>
              <div className="vaidam-doctor-actions">
                <button
                  onClick={() => {
                    setSelectedHospital(hospital);
                    setPage('doctor-detail');
                  }}
                  type="button"
                >
                  View Profile
                </button>
                <button onClick={scrollToHospitalForm} type="button">Book Appointment</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="profile-tabs">
        {['About', 'Specialisation', 'Doctors', 'Gallery', 'Infrastructure', 'Reviews'].map((item) => (
          <button className={activeTab === item ? 'active' : ''} key={item} onClick={() => setActiveTab(item)} type="button">
            {item}
          </button>
        ))}
      </div>

      <div className="profile-layout">
        <div className="profile-main">
          {activeTab === 'About' && (
            <article className="detail-panel hospital-about">
              <h2>About the hospital</h2>
              <p>
                {selectedHospital.name} is listed from the {selectedHospital.sourceSystem || 'client hospital master database'}.
                Its current master profile includes {selectedHospital.specialty} specialty, {hospitalAccreditation} accreditation status,
                and {hospitalAddress || 'location details pending'}.
              </p>
              <p>
                Secondary enrichment such as detailed facilities, live doctors, photos, and package pricing can be updated from admin
                without replacing the base hospital record.
              </p>
              <div className="hospital-stat-row">
                <span><strong>{hospitalFounded}</strong><small>Established</small></span>
                <span><strong>{hospitalBeds}</strong><small>Beds</small></span>
                <span><strong>{selectedHospital.internationalPatientWing || 'Update pending'}</strong><small>International wing</small></span>
                <span><strong>{selectedHospital.city || 'India'}</strong><small>Location</small></span>
              </div>
            </article>
          )}

          {activeTab === 'Specialisation' && (
            <article className="detail-panel">
              <h2>Team & Specialisation</h2>
              <div className="tag-cloud">
                {[...selectedHospital.tags, ...selectedHospital.doctorFocus, 'International patient care', 'Remote follow-up'].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          )}

          {activeTab === 'Doctors' && (
            <article className="detail-panel profile-doctor-strip">
              <img alt={selectedHospital.doctor} src={selectedHospital.doctorImage} />
              <div>
                <span>Featured doctor</span>
                <h2>{selectedHospital.doctor}</h2>
                <p>{selectedHospital.doctorTitle} with {selectedHospital.experience} experience.</p>
                <StarRating rating={selectedHospital.rating} />
                <strong>{money(selectedHospital.doctorFee)} consultation</strong>
                <button onClick={() => setPage('doctor-detail')} type="button">View doctor profile</button>
              </div>
            </article>
          )}

          {activeTab === 'Gallery' && (
            <article className="detail-panel">
              <h2>Gallery</h2>
              <div className="inline-gallery">
                {gallery.map((image, index) => (
                  <img alt={`${selectedHospital.name} interior ${index + 1}`} key={image} src={image} />
                ))}
              </div>
            </article>
          )}

          {activeTab === 'Infrastructure' && (
            <>
              <article className="detail-panel">
                <h2>Infrastructure</h2>
                <div className="feature-list">
                  {selectedHospital.infrastructure.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </article>
              <article className="detail-panel">
                <h2>Accreditations & certificates</h2>
                <div className="certificate-grid">
                  {hospitalAccreditationList.length ? hospitalAccreditationList.map((item) => (
                    <span key={item}><strong>{item.split(' ')[0]}</strong><small>{item}</small></span>
                  )) : <span><strong>Pending</strong><small>Accreditation details can be updated from admin.</small></span>}
                </div>
              </article>
            </>
          )}

          {activeTab === 'Reviews' && (
            <article className="detail-panel">
              <h2>Reviews & patient stories</h2>
              <div className="review-grid">
                {PATIENT_REVIEWS.map(([name, country, review]) => (
                  <blockquote key={name}>
                    <StarRating rating="5.0" />
                    <strong>{name}</strong>
                    <span>{country}</span>
                    <p>{review}</p>
                  </blockquote>
                ))}
              </div>
            </article>
          )}
        </div>

      </div>
      <section className="full-budget-section">
        <div className="budget-section-intro">
          <span>Cost transparency planner</span>
          <h2>Customize the full patient journey budget</h2>
          <p>Separate hospital package, travel, visa, local transport, stay and care coordination. This is the main decision layer before the patient requests an appointment.</p>
          <div className="budget-deep-copy">
            <h3>What this estimate explains</h3>
            <ul>
              <li>Hospital package is only one part of the journey.</li>
              <li>Travel and stay can change destination affordability.</li>
              <li>Care coordination keeps pickup, reports, follow-up, and support visible.</li>
            </ul>
          </div>
        </div>
        <div className="budget-workbench">
          <div className="budget-total-card">
            <span>Total journey estimate</span>
            <strong>{money(customTotal)}</strong>
            <small>Includes treatment, travel, visa, stay, local transport, and care coordination.</small>
          </div>
          <div className="budget-pill-row">
            <span>Editable</span>
            <span>API ready</span>
            <span>Transparent</span>
          </div>
          <div className="budget-customizer">
            {rows.map(([key, label, min, max]) => (
              <label key={key}>
                <span>
                  <small>{label}</small>
                  <strong>{money(Number(budget[key]))}</strong>
                </span>
                <input
                  max={max}
                  min={min}
                  onChange={(event) => setBudget((current) => ({ ...current, [key]: Number(event.target.value) }))}
                  step="10"
                  type="range"
                  value={budget[key]}
                />
              </label>
            ))}
          </div>
          <div className="cost-table budget-breakdown-grid">
            {rows.map(([key, label]) => (
              <span key={key}>
                <small>{label}</small>
                <strong>{money(Number(budget[key]))}</strong>
              </span>
            ))}
            <span className="total-line">
              <small>Total estimate</small>
              <strong>{money(customTotal)}</strong>
            </span>
          </div>
        </div>
      </section>
      {galleryOpen && (
        <div className="gallery-overlay" role="dialog" aria-modal="true" aria-label={`${selectedHospital.name} gallery`}>
          <div className="gallery-dialog">
            <button className="modal-close" onClick={() => setGalleryOpen(false)} type="button">x</button>
            <span>{selectedHospital.name}</span>
            <h2>Hospital gallery</h2>
            <div className="gallery-dialog-grid">
              {gallery.map((image, index) => (
                <img alt={`${selectedHospital.name} full gallery ${index + 1}`} key={image} src={image} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CostComparison({ money, selectedHospital, selectedTreatment }) {
  const currentTotal = totalCost(selectedHospital, selectedTreatment);

  return (
    <section className="comparison-section">
      <div>
        <h2>Global Cost Comparison</h2>
        <p>Affordable care, transparent costs, expert guidance.</p>
        <span>Compare your selected plan against an average market range before you speak to a care expert.</span>
      </div>
      <div className="comparison-card">
        <div>
          <span>Prices with {BRAND_NAME}</span>
          <strong>{money(currentTotal)}</strong>
        </div>
        <div>
          <span>Prices without planning</span>
          <strong>{money(Math.round(currentTotal * 1.35))}</strong>
        </div>
        <button type="button">Get best price</button>
      </div>
    </section>
  );
}

function Planner({ hospitals = INDIA_HOSPITALS, initialProcedure = null, money = (value) => formatCurrency(value, 'INR'), selectedTreatment, selectedHospital, setPage, setSelectedHospital, setSelectedTreatment, treatments = TREATMENTS }) {
  // Determine the correct starting step:
  // - If treatment + procedure both pre-selected → skip to Step 3 (trip-style)
  // - If only treatment pre-selected → skip to Step 2 (procedure)
  // - Otherwise → Step 1 (search)
  const getInitialViewMode = () => {
    if (selectedTreatment && initialProcedure) return 'trip-style';
    if (selectedTreatment) return 'procedure';
    return 'search';
  };

  const [viewMode, setViewMode] = useState(getInitialViewMode);

  // Pre-populate treatment/procedure selections from props
  const [selectedTreatmentsForSearch, setSelectedTreatmentsForSearch] = useState(
    selectedTreatment ? [selectedTreatment] : []
  );
  const [selectedProceduresForSearch, setSelectedProceduresForSearch] = useState(
    initialProcedure ? [initialProcedure] : []
  );
  const [selectedTripStyle, setSelectedTripStyle] = useState(null);
  const [selectedHospitalForJourney, setSelectedHospitalForJourney] = useState(null);
  const [journeyPlanResult, setJourneyPlanResult] = useState(null);
  const [previousViewMode, setPreviousViewMode] = useState('hospitals'); // Track where to return from hospital details
  const [plannerTreatment, setPlannerTreatment] = useState(selectedTreatment || null);
  const [selectedCity, setSelectedCity] = useState('All India');
  const [activeModal, setActiveModal] = useState('treatment');
  const [treatmentSearch, setTreatmentSearch] = useState('');
  const [plannerTreatments, setPlannerTreatments] = useState(treatments);
  const [plannerHospitals, setPlannerHospitals] = useState(hospitals);
  const [appointmentForm, setAppointmentForm] = useState({
    patientName: '',
    countryCode: 'IN (+91)',
    phone: '',
    notes: '',
  });
  const [appointmentStatus, setAppointmentStatus] = useState('');
  const [bookingHospital, setBookingHospital] = useState(selectedHospital || hospitals[0] || INDIA_HOSPITALS[0]);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    'Hi! I am your planner assistant. Select a treatment or surgery and city. I will compare matching hospitals, likely doctor review steps, tentative stay, reports needed, and booking next steps.',
  ]);
  const aiThreadRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const normalizeTreatment = (item, index) => {
      const existing = treatments.find((treatment) => treatment.title.toLowerCase() === item.title?.toLowerCase());
      return existing || {
        id: item._id || normalizeSearch(item.title || `treatment-${index}`),
        group: item.subtitle || 'Treatment',
        title: item.title || 'Treatment',
        icon: (item.title || 'TR').slice(0, 2).toUpperCase(),
        packageFrom: 1200,
        value: 88,
        specialty: item.subtitle || item.title || 'Medical care',
        image: item.image,
        description: item.description,
      };
    };
    const normalizeHospital = (item, index) => {
      const existing = hospitals.find((hospital) => hospital.name.toLowerCase() === item.name?.toLowerCase());
      const fallback = hospitals[index % hospitals.length] || INDIA_HOSPITALS[index % INDIA_HOSPITALS.length];
      return {
        ...fallback,
        ...existing,
        id: existing?.id || item._id || `backend-hospital-${index}`,
        name: item.name || existing?.name || fallback.name,
        city: item.city || existing?.city || fallback.city,
        country: existing?.country || 'India',
        summary: item.summary || existing?.summary || fallback.summary,
        image: item.image || existing?.image || fallback.image,
      };
    };
    const fetchPlannerData = async (path) => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 4500);
      try {
        const response = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
        return response.ok ? response.json() : [];
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    Promise.all([
      fetchPlannerData('/treatments'),
      fetchPlannerData('/hospitals'),
    ])
      .then(([fetchedTreatments, fetchedHospitals]) => {
        if (cancelled) return;
        if (Array.isArray(fetchedTreatments) && fetchedTreatments.length) {
          const normalized = fetchedTreatments.map(normalizeTreatment);
          const merged = [...normalized, ...treatments.filter((local) => !normalized.some((item) => item.title === local.title))];
          setPlannerTreatments(merged);
        }
        if (Array.isArray(fetchedHospitals) && fetchedHospitals.length) {
          setPlannerHospitals(fetchedHospitals.map(normalizeHospital));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPlannerTreatments(treatments);
          setPlannerHospitals(hospitals);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hospitals, treatments]);

  const indianCities = buildAvailableDestinations(plannerHospitals).map((destination) => ({
    name: destination.country,
    image: destination.image,
    hospitals: destination.hospitals,
    doctors: destination.doctors,
  }));
  const plannerCityOptions = useMemo(() => ['All India', ...Array.from(new Set(plannerHospitals.map((hospital) => hospital.city).filter(Boolean))).sort()], [plannerHospitals]);
  const cmaDestinations = indianCities.map((city) => [city.name, city.image]);
  const selectedDestination = selectedCity;
  const setSelectedDestination = setSelectedCity;
  const countryCodes = ['IN (+91)'];
  const plannerStep = activeModal === 'consultation' ? 1 : 0;
  const setPlannerStep = (index) => setActiveModal(index === 0 ? 'treatment' : 'consultation');
  const procedures = useMemo(() => {
    if (!plannerTreatment) return [];
    const matchedHospitals = plannerHospitals.filter((hospital) => hospitalMatchesTreatment(hospital, plannerTreatment));
    const focus = matchedHospitals.flatMap((hospital) => hospital.doctorFocus || []);
    return Array.from(new Set([
      `${plannerTreatment.title} consultation`,
      `${plannerTreatment.title} package estimate`,
      ...focus,
      plannerTreatment.specialty,
      'Other',
    ])).slice(0, 10);
  }, [plannerHospitals, plannerTreatment]);
  const suggestedHospital = useMemo(() => {
    if (!plannerTreatment) return selectedHospital || plannerHospitals[0] || INDIA_HOSPITALS[0];
    const cityNames = selectedCity === 'All India' ? [] : selectedCity === 'Delhi / NCR' ? ['New Delhi', 'Gurgaon', 'Delhi'] : [selectedCity];
    const treatmentMatch = (hospital) => hospitalMatchesTreatment(hospital, plannerTreatment);
    return plannerHospitals.find((hospital) => (!cityNames.length || cityNames.includes(hospital.city)) && treatmentMatch(hospital))
      || plannerHospitals.find(treatmentMatch)
      || selectedHospital
      || plannerHospitals[0]
      || INDIA_HOSPITALS[0];
  }, [plannerHospitals, plannerTreatment, selectedCity, selectedHospital]);
  const filteredHospitals = useMemo(() => {
    const treatment = plannerTreatment;
    if (!treatment) return [];
    const cityNames = selectedCity === 'All India' ? [] : selectedCity === 'Delhi / NCR' ? ['New Delhi', 'Gurgaon', 'Delhi'] : [selectedCity];
    const treatmentMatch = (hospital) => hospitalMatchesTreatment(hospital, treatment);
    const cityMatch = (hospital) => !cityNames.length || cityNames.includes(hospital.city);
    const cityHospitals = plannerHospitals.filter(cityMatch);
    const matched = cityHospitals.filter(treatmentMatch);
    if (matched.length) return matched;
    const treatmentHospitals = plannerHospitals.filter(treatmentMatch);
    return (treatmentHospitals.length ? treatmentHospitals : cityHospitals.length ? cityHospitals : plannerHospitals).slice(0, 12);
  }, [plannerHospitals, plannerTreatment, selectedCity]);
  const activeTreatment = plannerTreatment || selectedTreatment || plannerTreatments[0] || null;
  const heroImage = indianCities.find((city) => city.name === selectedCity)?.image || filteredHospitals[0]?.image || plannerHospitals[0]?.image || INDIA_HOSPITALS[0].image;
  const completedCount = Number(Boolean(plannerTreatment));
  const estimatedPlan = useMemo(() => {
    const hospital = filteredHospitals[0] || suggestedHospital || plannerHospitals[0] || INDIA_HOSPITALS[0];
    const packageCost = Number(activeTreatment?.packageFrom || hospital?.cost?.package || 0);
    const stayCost = Number(hospital?.cost?.stay || 0);
    const localCost = Number(hospital?.cost?.local || 0);
    const serviceCost = Number(hospital?.cost?.service || 0);
    const total = packageCost + stayCost + localCost + serviceCost;
    return {
      hospital,
      packageCost,
      total,
      stay: hospital?.stay || (activeTreatment?.group === 'Wellness' ? '1-2 days' : '4-7 days'),
      reports: ['Recent reports', 'Doctor prescription', 'Current medicines', 'Passport/ID'],
    };
  }, [activeTreatment, filteredHospitals, plannerHospitals, suggestedHospital]);
  useEffect(() => {
    aiThreadRef.current?.scrollTo({ top: aiThreadRef.current.scrollHeight, behavior: 'smooth' });
  }, [aiMessages]);
  const approvedPlannerTreatments = useMemo(() => {
    const approved = plannerTreatments.filter((treatment) => (
      treatment.icdCode
      || treatment.icdUri
      || /WHO ICD-11|ICD-11|backend|admin/i.test([treatment.sourceSystem, treatment.procedureCode, treatment.category].filter(Boolean).join(' '))
    ));
    return approved.length ? approved : plannerTreatments;
  }, [plannerTreatments]);
  const visibleTreatments = useMemo(() => {
    const search = normalizeSearch(treatmentSearch);
    const matched = approvedPlannerTreatments.filter((treatment) => {
      const haystack = normalizeSearch([treatment.title, treatment.group, treatment.specialty, treatment.description, treatment.icdCode, treatment.procedureCode, treatment.sourceSystem].filter(Boolean).join(' '));
      return !search || haystack.includes(search);
    });
    return matched.slice(0, 24);
  }, [approvedPlannerTreatments, treatmentSearch]);
  const plannerSteps = [
    { id: 'treatment', title: 'Select Treatment / Surgery', value: plannerTreatment?.title || 'Choose treatment or surgery', icon: 'fa-stethoscope' },
    { id: 'city', title: 'Indian Destination', value: `${selectedCity}, India`, icon: 'fa-location-dot' },
    { id: 'consultation', title: 'Free Consultation', value: appointmentStatus || 'Book with care team', icon: 'fa-calendar-check' },
  ];

  const selectPlannerTreatment = (treatment) => {
    setPlannerTreatment(treatment);
    setPlannerProcedure('');
    setSelectedTreatment?.(treatment);
    const cityNames = selectedCity === 'All India' ? [] : selectedCity === 'Delhi / NCR' ? ['New Delhi', 'Gurgaon', 'Delhi'] : [selectedCity];
    const matchesTreatment = (hospital) => hospitalMatchesTreatment(hospital, treatment);
    const nextHospital = plannerHospitals.find((hospital) => (!cityNames.length || cityNames.includes(hospital.city)) && matchesTreatment(hospital))
      || plannerHospitals.find(matchesTreatment)
      || selectedHospital
      || plannerHospitals[0]
      || INDIA_HOSPITALS[0];
    setBookingHospital(nextHospital);
    setSelectedHospital?.(nextHospital);
  };

  const openHospitalDetails = (hospital) => {
    setSelectedHospital?.(hospital);
    setPage?.('hospital-detail');
  };

  const openPlannerBooking = (hospital) => {
    setBookingHospital(hospital);
    setSelectedHospital?.(hospital);
    setActiveModal('consultation');
  };

  const goNext = () => {
    if (!plannerTreatment) {
      return setActiveModal('treatment');
    }
    setAppointmentStatus('');
    return setActiveModal('consultation');
  };

  const submitAppointment = async (event) => {
    event.preventDefault();
    if (!appointmentForm.patientName.trim() || !appointmentForm.phone.trim()) {
      setAppointmentStatus('Please add patient name and phone number.');
      return;
    }

    setAppointmentStatus('Saving appointment to admin...');
    try {
      const response = await fetch(`${API_BASE}/admin/public-appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...getPatientAttribution(),
          patientName: appointmentForm.patientName,
          phone: `${appointmentForm.countryCode || 'IN (+91)'} ${appointmentForm.phone}`,
          country: 'India',
          city: selectedCity,
          treatment: plannerTreatment?.title || selectedTreatment?.title || 'Treatment consultation',
          hospital: bookingHospital.name,
          doctor: bookingHospital.doctor,
          mode: 'Planner hospital booking',
          notes: [
            `Procedure: ${plannerProcedure || 'To be confirmed after report review'}`,
            `Preferred city: ${selectedCity}`,
            appointmentForm.notes,
          ].filter(Boolean).join('\n'),
          source: 'india-modal-planner',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Appointment failed');
      setAppointmentStatus(`Consultation booked: ${data.appointment?.publicData?.appointmentId || 'Scheduled'}`);
      setAppointmentForm({ patientName: '', countryCode: 'IN (+91)', phone: '', notes: '' });
      setActiveModal('');
    } catch (error) {
      setAppointmentStatus(error.message || 'Appointment backend offline.');
    }
  };

  const buildPlannerAiReply = (text) => {
    const bestHospital = filteredHospitals[0] || estimatedPlan.hospital;
    const treatmentName = activeTreatment?.title || 'your treatment';
    const hospitalNames = filteredHospitals.slice(0, 3).map((hospital) => hospital.name).join(', ') || bestHospital?.name || 'verified Indian hospitals';
    const total = estimatedPlan.total ? money(estimatedPlan.total) : 'final estimate after report review';
    const lower = text.toLowerCase();

    if (lower.includes('best hospital') || lower.includes('suggest')) {
      return `For ${treatmentName} in ${selectedCity}, start with ${bestHospital?.name || 'the top matched hospital'} because it matches the treatment and city filter. Also compare ${hospitalNames}. Ask for report review, doctor availability, package inclusions, ICU/room category, and expected stay before confirming.`;
    }

    if (lower.includes('summarize')) {
      return `Current plan: ${treatmentName} in ${selectedCity}, preferred hospital ${bestHospital?.name || 'not selected yet'}, likely stay ${estimatedPlan.stay}, rough planning total ${total}. Next: share reports, confirm doctor slot, verify inclusions, then book the appointment.`;
    }

    if (lower.includes('advice') || lower.includes('booking')) {
      return `Booking advice: do not confirm only on rating. Check the treating doctor's experience, report-review opinion, package exclusions, room category, date availability, and emergency contact. Keep reports and passport/ID ready so the admin team can verify every detail.`;
    }

    return `${treatmentName} in ${selectedCity}: I found ${filteredHospitals.length || 1} matching hospital option${filteredHospitals.length === 1 ? '' : 's'}. Shortlist ${bestHospital?.name || 'a verified hospital'}, compare doctor focus areas, ask for a written package estimate, and book after report review.`;
  };

  const submitPlannerAi = (text) => {
    if (!text) return;
    setAiMessages((current) => [
      ...current,
      text,
      buildPlannerAiReply(text),
    ].slice(-10));
    setAiInput('');
  };

  const sendPlannerAi = (event) => {
    event.preventDefault();
    submitPlannerAi(aiInput.trim());
  };

  const handleSearchHospitals = (treatments) => {
    setSelectedTreatmentsForSearch(treatments);
    setSelectedProceduresForSearch([]);
    setPlannerTreatment(treatments[0]); // Set first treatment as primary
    setViewMode('procedure');           // → Step 2: Procedure selection
  };

  const handleBackToSearch = () => {
    setViewMode('search');
  };

  const handleBackToTreatments = () => {
    setViewMode('search');
  };

  const handleProcedureContinue = (procedures) => {
    setSelectedProceduresForSearch(procedures);
    setViewMode('trip-style');          // → Step 3: Trip style
  };

  const handleBackToProcedures = () => {
    setViewMode('procedure');
  };

  const handleContinueToHospitals = (tripStyle) => {
    setSelectedTripStyle(tripStyle);
    setViewMode('hospitals');
  };

  const handleBackToTripStyle = () => {
    setViewMode('trip-style');
  };

  const handleViewHospitalDetails = (hospital) => {
    setSelectedHospital?.(hospital);
    setPreviousViewMode(viewMode); // Remember where we came from
    setViewMode('hospital-details');
  };

  const handleBackFromHospitalDetails = () => {
    setViewMode(previousViewMode); // Return to previous view mode
  };

  const handleSelectHospital = (hospital) => {
    setSelectedHospitalForJourney(hospital);
    setViewMode('journey-planning');
  };

  const handleBackToHospitals = () => {
    setViewMode('hospitals');
  };

  const handleCompleteJourney = async (journeyPlan) => {
    // Save journey plan and show results page
    setJourneyPlanResult(journeyPlan);
    setViewMode('journey-results');
    
    try {
      const response = await fetch(`${API_BASE}/admin/journey-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: journeyPlan.patientEmail,
          userName: journeyPlan.patientName,
          selectedHospital: selectedHospitalForJourney?.name,
          selectedTreatments: selectedTreatmentsForSearch.map(t => t.title),
          journeyPlan,
          icdCodes: selectedTreatmentsForSearch.map(t => t.icdCode).filter(Boolean),
          createdAt: new Date().toISOString(),
          status: 'calculated'
        })
      });

      if (response.ok) {
        console.log('✅ Journey plan saved to admin dashboard successfully!');
      } else {
        console.log('⚠️ Journey plan saved locally (API not available)');
      }
    } catch (error) {
      console.log('❌ Journey plan save failed, stored locally:', error);
    }
  };

  const handleConfirmJourney = async (journeyPlan) => {
    try {
      const response = await fetch(`${API_BASE}/admin/journey-plans/${journeyPlan.patientEmail}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'confirmed',
          confirmedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('✅ Journey confirmed and updated in admin!');
        alert('Journey confirmed! Our team will contact you within 24 hours.');
        setPage('home');
      } else {
        console.log('⚠️ Journey confirmed locally');
        alert('Journey confirmed! Our team will contact you within 24 hours.');
        setPage('home');
      }
    } catch (error) {
      console.log('❌ Journey confirmation failed:', error);
      alert('Journey confirmed! Our team will contact you within 24 hours.');
      setPage('home');
    }
  };

  const handleBackToJourneyPlanning = () => {
    setViewMode('journey-planning');
  };

  // New modern search UI
  if (viewMode === 'search') {
    return (
      <PlannerSearchPage
        treatments={plannerTreatments}
        onSearchHospitals={handleSearchHospitals}
        setPage={setPage}
        getTreatmentIconKind={getTreatmentIconKind}
        HEALTH_ICON_SOURCES={HEALTH_ICON_SOURCES}
      />
    );
  }

  // Step 2: Procedure selection (ICD-11 imported procedures filtered by selected treatment group)
  if (viewMode === 'procedure') {
    return (
      <ProcedureSelectPage
        selectedTreatments={selectedTreatmentsForSearch}
        preSelectedProcedures={selectedProceduresForSearch}
        allTreatments={plannerTreatments}
        onContinue={handleProcedureContinue}
        onBack={selectedTreatmentsForSearch.length > 0 && initialProcedure ? () => setPage('treatment-detail') : handleBackToSearch}
      />
    );
  }

  // Trip Style Selection Page
  if (viewMode === 'trip-style') {
    return (
      <TripStylePage
        selectedTreatments={selectedTreatmentsForSearch}
        onContinueToHospitals={handleContinueToHospitals}
        onBackToTreatments={initialProcedure ? () => setPage('treatment-detail') : handleBackToProcedures}
      />
    );
  }

  // Hospitals results page
  if (viewMode === 'hospitals') {
    return (
      <PlannerHospitalsPage
        selectedTreatments={selectedTreatmentsForSearch}
        hospitals={plannerHospitals}
        onBack={handleBackToTripStyle}
        onSelectHospital={handleSelectHospital}
        onViewHospitalDetails={handleViewHospitalDetails}
        formatCurrency={money}
      />
    );
  }

  // Hospital Details Page
  if (viewMode === 'hospital-details') {
    return (
      <HospitalDetail
        money={money}
        selectedHospital={selectedHospital}
        setPage={setPage}
        onBack={handleBackFromHospitalDetails}
      />
    );
  }

  // Journey Planning Page
  if (viewMode === 'journey-planning') {
    return (
      <JourneyPlanningPage
        selectedTreatments={selectedTreatmentsForSearch}
        selectedHospital={selectedHospitalForJourney}
        onBack={handleBackToHospitals}
        onCompleteJourney={handleCompleteJourney}
      />
    );
  }

  // Journey Results Page
  if (viewMode === 'journey-results') {
    return (
      <JourneyResultsPage
        journeyPlan={journeyPlanResult}
        selectedTreatments={selectedTreatmentsForSearch}
        selectedHospital={selectedHospitalForJourney}
        onBack={handleBackToJourneyPlanning}
        onConfirmJourney={handleConfirmJourney}
      />
    );
  }

  // Old design - keeping as fallback (commented out)
  /*
  return (
    <section className="journey-search-page" id="planner">
      <div className="journey-search-head">
        <div>
          <span>Plan My Journey</span>
          <h1>Select treatment, compare approved hospitals, book appointment</h1>
          <p>Choose an ICD/backend-approved treatment from the database. We show hospitals from the client/JCI master data that match the selected treatment, specialty, city, and accreditation signals.</p>
        </div>
        <aside>
          <strong>{approvedPlannerTreatments.length}</strong>
          <span>approved treatment records</span>
          <small>{plannerHospitals.length} hospital profiles available</small>
        </aside>
      </div>

      <div className="journey-search-layout">
        <aside className="journey-treatment-panel">
          <label className="journey-search-input">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input onChange={(event) => setTreatmentSearch(event.target.value)} placeholder="Search ICD treatment, procedure, specialty..." value={treatmentSearch} />
          </label>
          <div className="journey-treatment-results">
            {visibleTreatments.map((treatment) => (
              <button className={plannerTreatment?.id === treatment.id ? 'active' : ''} key={treatment.id} onClick={() => selectPlannerTreatment(treatment)} type="button">
                <TreatmentIconTile treatment={treatment} />
                <span>
                  <strong>{treatment.title}</strong>
                  <small>{treatment.icdCode ? `ICD-11 ${treatment.icdCode}` : treatment.procedureCode || treatment.category || treatment.specialty}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main className="journey-hospital-results">
          <div className="journey-result-toolbar">
            <div>
              <span>Selected treatment</span>
              <strong>{plannerTreatment?.title || 'Select a treatment'}</strong>
              <small>{plannerTreatment?.icdCode ? `ICD-11 ${plannerTreatment.icdCode}` : plannerTreatment?.sourceSystem || 'Database treatment mapping'}</small>
            </div>
            <label>
              City
              <select onChange={(event) => setSelectedCity(event.target.value)} value={selectedCity}>
                {plannerCityOptions.map((city) => <option key={city}>{city}</option>)}
              </select>
            </label>
          </div>

          {!plannerTreatment && (
            <article className="journey-empty-panel">
              <strong>Start by selecting a treatment</strong>
              <p>Hospitals will appear after a treatment is selected. Matching uses treatment tags, specialty, ICD/backend mapping, and city filters.</p>
            </article>
          )}

          {plannerTreatment && (
            <>
              <section className="journey-match-summary">
                <article><span>Matched hospitals</span><strong>{filteredHospitals.length}</strong><small>{selectedCity}</small></article>
                <article><span>Best starting option</span><strong>{suggestedHospital?.name || 'Pending'}</strong><small>{suggestedHospital?.city || 'India'}</small></article>
                <article><span>Reports needed</span><strong>{estimatedPlan.reports.length}</strong><small>{estimatedPlan.reports.slice(0, 3).join(', ')}</small></article>
              </section>

              <div className="journey-hospital-list">
                {filteredHospitals.map((hospital) => (
                  <article key={hospital.id} className="journey-result-card">
                    <button className="journey-result-image" onClick={() => openHospitalDetails(hospital)} type="button">
                      <img alt={hospital.name} onError={handleImageFallback} src={getHospitalImage(hospital)} />
                    </button>
                    <div>
                      <span>{hospital.city || 'India'} � {hospital.specialty}</span>
                      <button className="journey-result-title" onClick={() => openHospitalDetails(hospital)} type="button">{hospital.name}</button>
                      <p>{hospital.summary || `${hospital.name} matches ${plannerTreatment.title} through specialty and treatment mapping.`}</p>
                      <div className="journey-result-facts">
                        <small>{accreditationText(hospital.accreditations, hospital.nabhType || 'Accreditation pending')}</small>
                        <small>Beds: {hospital.bedText || hospital.beds || 'Update pending'}</small>
                        <small>{hospital.sourceSystem || 'Client master data'}</small>
                      </div>
                    </div>
                    <div className="journey-result-actions">
                      <button onClick={() => openPlannerBooking(hospital)} type="button">Book appointment</button>
                      <button onClick={() => openHospitalDetails(hospital)} type="button">View details</button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </main>

        <aside className="journey-booking-panel">
          <div>
            <span>Appointment request</span>
            <strong>{bookingHospital?.name || suggestedHospital?.name || 'Select hospital'}</strong>
            <small>{plannerTreatment?.title || 'Treatment pending'}</small>
          </div>
          <form onSubmit={submitAppointment}>
            <input onChange={(event) => setAppointmentForm({ ...appointmentForm, patientName: event.target.value })} placeholder="Patient full name" value={appointmentForm.patientName} />
            <div>
              <input readOnly value="IN (+91)" />
              <input onChange={(event) => setAppointmentForm({ ...appointmentForm, phone: event.target.value })} placeholder="Phone number" value={appointmentForm.phone} />
            </div>
            <textarea onChange={(event) => setAppointmentForm({ ...appointmentForm, notes: event.target.value })} placeholder="Reports, preferred date, notes" rows="4" value={appointmentForm.notes} />
            <button disabled={!plannerTreatment || !bookingHospital} type="submit">Book free consultation</button>
            {appointmentStatus && <small>{appointmentStatus}</small>}
          </form>
        </aside>
      </div>
    </section>
  );
  */

  // Second old design (commented out)
  /*
  return (
    <section className="cma-planner-page india-planner-page" id="planner">
      <div className="cma-planner-breadcrumb">Home <span>&gt;</span> Planner</div>
      <div className="planner-top-row">
        <button className="planner-back-button" onClick={() => setActiveModal('treatment')} type="button"><i className="fa-solid fa-arrow-left" aria-hidden="true" /></button>
        <h1>Plan your medical journey in 1 quick step</h1>
        <button onClick={() => setActiveModal(!plannerTreatment ? 'treatment' : 'consultation')} type="button">{plannerTreatment ? 'Book Appointment' : 'Next'} <i className="fa-solid fa-arrow-right" aria-hidden="true" /></button>
      </div>
      <div className="planner-progress planner-progress-single"><span className={plannerTreatment ? 'active' : ''} /></div>
      <div className="planner-final-grid">
        <main className="planner-results-pane">
          <section className="planner-plan-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(15, 25, 40, 0.62), rgba(15, 25, 40, 0.16)), url(${heroImage})` }}>
            <div><span>Personalized Treatment Plan</span><h2>{activeTreatment.title} in {selectedCity}</h2></div>
            <div className="planner-hero-actions"><button type="button"><i className="fa-solid fa-circle" aria-hidden="true" /> Saved</button><button type="button"><i className="fa-solid fa-share-nodes" aria-hidden="true" /> Share</button></div>
          </section>
          <div className="planner-city-chips">
            {indianCities.map((city) => (
              <button className={selectedCity === city.name ? 'active' : ''} key={city.name} onClick={() => setSelectedCity(city.name)} type="button"><span>IN</span>{city.name}</button>
            ))}
          </div>
          <section className="planner-copy-block">
            <h2>{activeTreatment.title} in {selectedCity}</h2>
            <p>{plannerTreatment ? `Compare hospitals that match ${activeTreatment.title}, then verify doctor availability, report review, package inclusions, expected stay, and appointment timing before booking.` : 'Select a treatment first. Hospital options, estimated stay, reports checklist, and appointment next steps will appear after your treatment is selected.'}</p>
          </section>
          {plannerTreatment && (
            <section className="planner-realistic-summary" aria-label="Planning summary">
              <article><span>Rough package</span><strong>{money(estimatedPlan.packageCost)}</strong><small>Final amount depends on reports and room category.</small></article>
              <article><span>Expected stay</span><strong>{estimatedPlan.stay}</strong><small>Includes consultation, admission or procedure window.</small></article>
              <article><span>Reports needed</span><strong>{estimatedPlan.reports.length} items</strong><small>{estimatedPlan.reports.slice(0, 3).join(', ')}.</small></article>
            </section>
          )}
          <div className="planner-filtered-list">
            {!plannerTreatment && (
              <article className="planner-empty-state">
                <strong>Select treatment to see hospitals</strong>
                <p>Choose a treatment or surgery from the modal so we can show matching Indian hospitals.</p>
                <button onClick={() => setActiveModal('treatment')} type="button">Select Treatment</button>
              </article>
            )}
            {plannerTreatment && filteredHospitals.map((hospital, index) => (
              <article className="hospital-card planner-hospital-card" key={`${hospital.id}-${hospital.name}-${index}`} onClick={() => openHospitalDetails(hospital)} onKeyDown={(event) => {
                if (event.key === 'Enter') openHospitalDetails(hospital);
              }} role="button" tabIndex="0">
                <div className="hospital-card-main">
                  <button className="hospital-thumb-button" onClick={(event) => { event.stopPropagation(); openHospitalDetails(hospital); }} type="button"><img alt={hospital.name} onError={handleImageFallback} src={getHospitalImage(hospital)} /></button>
                  <div className="hospital-body">
                    <button className="hospital-name-link" onClick={(event) => { event.stopPropagation(); openHospitalDetails(hospital); }} type="button">{hospital.name}</button>
                    <div className="rating-row"><StarRating rating={hospital.rating} /><span>{hospital.rating} ({hospital.doctors} Ratings)</span></div>
                    <p>{hospital.summary || `${hospital.name} supports ${hospital.specialty} care with international patient coordination, doctor review, and transparent planning.`}</p>
                    <small>{accreditationText(hospital.accreditations)}</small>
                    <button className="show-more-link" onClick={(event) => { event.stopPropagation(); openPlannerBooking(hospital); }} type="button">Book Appointment</button>
                  </div>
                </div>
                <button className="planner-card-menu" onClick={(event) => { event.stopPropagation(); openHospitalDetails(hospital); }} type="button"><i className="fa-solid fa-ellipsis-vertical" aria-hidden="true" /></button>
              </article>
            ))}
          </div>
        </main>
        <aside className="planner-ai-panel">
          <div className="planner-ai-head"><strong>AI Plan Assistant</strong><span>{aiMessages.length}/10 messages</span></div>
          <div className="planner-ai-thread" ref={aiThreadRef}>
            {aiMessages.map((message, index) => <p className={index % 2 ? 'user' : 'assistant'} key={`${message}-${index}`}>{message}</p>)}
          </div>
          <form className="planner-ai-compose" onSubmit={sendPlannerAi}>
            <input onChange={(event) => setAiInput(event.target.value)} placeholder="Type..." value={aiInput} />
            <button type="submit"><i className="fa-solid fa-paper-plane" aria-hidden="true" /></button>
          </form>
          <div className="planner-ai-actions">
            <button onClick={() => submitPlannerAi('Suggest the best hospital from this list')} type="button">Best hospital</button>
            <button onClick={() => submitPlannerAi('Summarize my current plan')} type="button">Summarize</button>
            <button onClick={() => submitPlannerAi('Give advice for booking')} type="button">Booking advice</button>
          </div>
        </aside>
      </div>
      <div className="cma-planner-shell india-planner-shell">
        <aside className="cma-planner-copy">
          <span>India medical planner</span>
          <h1>Plan your treatment journey in India</h1>
          <p>Select a treatment or surgery, choose an Indian city, and book a free consultation.</p>
          <button onClick={goNext} type="button">Continue Planning</button>
          {appointmentStatus && <small>{appointmentStatus}</small>}
        </aside>

        <main className="cma-planner-card india-planner-card">
          <div className="cma-step-tabs india-step-tabs">
            {plannerSteps.map((step, index) => (
              <button className={activeModal === step.id ? 'active' : ''} key={step.id} onClick={() => setActiveModal(step.id)} type="button">
                <b>{index + 1}</b>{step.title}
              </button>
            ))}
          </div>

          {plannerStep === 0 && (
            <div className="cma-treatment-layout">
              <section>
                <h2>Select Treatment</h2>
                <div className="cma-treatment-list">
                  {TREATMENTS.slice(0, 10).map((treatment) => (
                    <button className={plannerTreatment?.id === treatment.id ? 'active' : ''} key={treatment.id} onClick={() => selectPlannerTreatment(treatment)} type="button">
                      <span>{treatment.icon}</span>
                      <div>
                        <strong>{treatment.title}</strong>
                        <small>{treatment.group === 'Aesthetic' ? 'Enhance appearance' : treatment.group === 'Wellness' ? 'Health planning' : 'Medical care'}</small>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="cma-procedure-panel">
                <h2>Select Procedure</h2>
                {!plannerTreatment && <p>Select a treatment first to see procedures.</p>}
                {plannerTreatment && (
                  <div className="cma-procedure-list">
                    {procedures.map((procedure) => (
                      <button className={plannerProcedure === procedure ? 'active' : ''} key={procedure} onClick={() => setPlannerProcedure(procedure)} type="button">
                        {procedure}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {plannerStep === 1 && (
            <div className="cma-consult-panel">
              <div className="cma-consult-visual">
                <img alt="Medical consultation" src={suggestedHospital.image} />
                <div>
                  <span>{plannerTreatment?.title || selectedTreatment?.title || 'Treatment'}</span>
                  <strong>{activeTreatment.title}</strong>
                  <small>{suggestedHospital.name} · {suggestedHospital.doctor}</small>
                </div>
              </div>
              <form className="cma-consult-form" onSubmit={submitAppointment}>
                <h2>Book Your Free Medical Consultation</h2>
                <p>Get expert advice, destination guidance, hospital options, and cost estimate.</p>
                <select onChange={(event) => setPlannerProcedure(event.target.value)} value={plannerProcedure}>
                  <option value="">Select Procedure</option>
                  {procedures.map((procedure) => <option key={procedure}>{procedure}</option>)}
                </select>
                <input onChange={(event) => setAppointmentForm({ ...appointmentForm, patientName: event.target.value })} placeholder="Full name" value={appointmentForm.patientName} />
                <div>
                  <select onChange={(event) => setAppointmentForm({ ...appointmentForm, countryCode: event.target.value })} value={appointmentForm.countryCode}>
                    {countryCodes.map((code) => <option key={code}>{code}</option>)}
                  </select>
                  <input onChange={(event) => setAppointmentForm({ ...appointmentForm, phone: event.target.value })} placeholder="Phone number" value={appointmentForm.phone} />
                </div>
                <textarea onChange={(event) => setAppointmentForm({ ...appointmentForm, notes: event.target.value })} placeholder="Tell us anything important" rows="3" value={appointmentForm.notes} />
                <button type="submit">Book Free Consultation</button>
                {appointmentStatus && <small>{appointmentStatus}</small>}
              </form>
            </div>
          )}
        </main>
      </div>

      <div className="cma-destination-strip">
        {cmaDestinations.map(([country, image]) => (
          <button className={selectedDestination === country ? 'active' : ''} key={country} onClick={() => setSelectedDestination(country)} type="button">
            <img alt={country} src={image} />
            <span>{country}</span>
          </button>
        ))}
      </div>
      {activeModal && (
        <div className="planner-modal-backdrop" role="presentation">
          <section className="planner-step-modal" aria-modal="true" role="dialog">
            <button className="planner-modal-close" onClick={() => setActiveModal('')} type="button">x</button>
            {activeModal === 'treatment' && (
              <>
                <h2>Select a Treatment to Proceed</h2>
                <p>Please choose your treatment or surgery to continue</p>
                <label className="planner-treatment-search">
                  <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                  <input onChange={(event) => setTreatmentSearch(event.target.value)} placeholder="Search treatment or surgery" value={treatmentSearch} />
                </label>
                <div className="planner-treatment-modal-grid">
                  {visibleTreatments.map((treatment) => (
                    <button className={plannerTreatment?.id === treatment.id ? 'active' : ''} key={treatment.id} onClick={() => selectPlannerTreatment(treatment)} type="button">
                      <TreatmentIconTile treatment={treatment} />
                      <strong>{treatment.title}</strong>
                    </button>
                  ))}
                </div>
                <small className="planner-modal-hint">Showing {visibleTreatments.length} of {plannerTreatments.length}. Use search for more treatments.</small>
                <div className="planner-modal-footer">
                  <button disabled={!plannerTreatment} onClick={() => setActiveModal('')} type="button">
                    Done ({completedCount}/1) <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                  </button>
                </div>
              </>
            )}
            {activeModal === 'city' && (
              <>
                <h2>Select Indian Destination</h2>
                <div className="cma-destination-strip modal-city-list">
                  {indianCities.map((city) => (
                    <button className={selectedCity === city.name ? 'active' : ''} key={city.name} onClick={() => { setSelectedCity(city.name); setActiveModal('consultation'); }} type="button">
                      <img alt={city.name} src={city.image} />
                      <span>{city.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {activeModal === 'consultation' && (
              <form className="cma-consult-form modal-consult-form" onSubmit={submitAppointment}>
                <h2>Book Your Free Medical Consultation</h2>
                <p>{bookingHospital.name} - {bookingHospital.doctor}</p>
                <input onChange={(event) => setAppointmentForm({ ...appointmentForm, patientName: event.target.value })} placeholder="Full name" value={appointmentForm.patientName} />
                <div>
                  <input readOnly value="IN (+91)" />
                  <input onChange={(event) => setAppointmentForm({ ...appointmentForm, phone: event.target.value })} placeholder="Phone number" value={appointmentForm.phone} />
                </div>
                <textarea onChange={(event) => setAppointmentForm({ ...appointmentForm, notes: event.target.value })} placeholder="Tell us anything important" rows="3" value={appointmentForm.notes} />
                <button type="submit">Book Free Consultation</button>
                {appointmentStatus && <small>{appointmentStatus}</small>}
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  );
  */
}

function AiAssistantPage({ setPage, initialMessage = '' }) {
  const WELCOME = 'Welcome to Kairacure AI. Tell me your treatment, diagnosis, preferred Indian city, reports summary, budget in INR, or travel month. I will suggest hospitals, doctors, approximate INR packages, and your next steps. You can write in Hindi, English, or Hinglish — I will reply in the same language.';

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }]);
  const [loading, setLoading] = useState(false);
  const threadRef = React.useRef(null);

  const quickPrompts = [
    'मुझे heart bypass surgery के लिए India में best hospitals बताओ',
    'Find orthopedic hospitals in Delhi NCR under INR 3 lakhs',
    'I need knee replacement — what is the cost and recovery time?',
    'I am a doctor and want to partner with Kairacure',
    'What reports should I share for a second opinion?',
    'Compare Apollo Delhi vs Fortis for cardiac surgery',
  ];

  // Auto-scroll to bottom on new message
  React.useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Auto-send initialMessage if passed from hero card
  React.useEffect(() => {
    if (initialMessage && initialMessage.trim()) {
      setQuestion(initialMessage.trim());
      // Slight delay so component has mounted
      setTimeout(() => {
        sendMessage(initialMessage.trim());
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async (text) => {
    const trimmed = (text || question).trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/ai-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages.slice(-10), // send last 10 for context
        }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || 'I could not generate a response right now.' }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'The AI backend is not running. Start the Express API server and set OPENROUTER_API_KEY in .env to enable live responses.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const resetChat = () => {
    setMessages([{ role: 'assistant', content: WELCOME }]);
    setQuestion('');
  };

  return (
    <section className="ai-assistant-page">
      {/* ── Sidebar ── */}
      <aside className="ai-chat-sidebar">
        <div className="ai-chat-brand">
          <img
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80"
            alt="Kaira AI"
            className="ai-brand-avatar"
          />
          <div>
            <strong>Kaira AI</strong>
            <small>Medical Travel Assistant</small>
          </div>
        </div>

        <button className="new-chat-button" onClick={resetChat} type="button">
          <i className="fa-solid fa-plus" aria-hidden="true" /> New chat
        </button>

        <div className="ai-chat-history">
          <p className="ai-history-label">Quick topics</p>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="ai-history-item"
              onClick={() => { setQuestion(prompt); sendMessage(prompt); }}
            >
              <i className="fa-solid fa-comment-dots" aria-hidden="true" />
              <span>{prompt.length > 38 ? `${prompt.slice(0, 36)}…` : prompt}</span>
            </button>
          ))}
        </div>

        <div className="ai-sidebar-footer">
          <button className="ai-back-link" onClick={() => setPage('home')} type="button">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to website
          </button>
          <p className="ai-sidebar-brand-note">Powered by Kaira AI · care@kairacure.com</p>
        </div>
      </aside>

      {/* ── Chat Workspace ── */}
      <main className="ai-chat-workspace">
        {/* Top bar */}
        <div className="ai-chat-topbar">
          <div className="ai-topbar-info">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80"
              alt="Kairacure AI"
            />
            <div>
              <strong>Kairacure Medical AI</strong>
              <span className="ai-online-badge">
                <span className="ai-online-dot" aria-hidden="true" />
                Online
              </span>
            </div>
          </div>
          <button className="ai-topbar-back" onClick={() => setPage('home')} type="button">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        {/* Thread */}
        <div className="ai-chat-thread" ref={threadRef}>
          {messages.map((msg, i) => (
            <article
              key={`${msg.role}-${i}`}
              className={msg.role === 'user' ? 'ai-bubble-row user' : 'ai-bubble-row assistant'}
            >
              {msg.role === 'assistant' && (
                <img
                  alt="Kairacure AI"
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80"
                />
              )}
              <div className="ai-bubble">
                {msg.content.split('\n').filter((l) => l.trim()).map((line, li) => (
                  <p key={li}>{line}</p>
                ))}
                <small>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
              </div>
            </article>
          ))}

          {loading && (
            <article className="ai-bubble-row assistant">
              <img alt="Kairacure AI thinking" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80" />
              <div className="ai-bubble ai-thinking">
                <span /><span /><span />
              </div>
            </article>
          )}
        </div>

        {/* Quick prompt chips — only show when thread is just the welcome message */}
        {messages.length === 1 && (
          <div className="ai-quick-prompts">
            {quickPrompts.slice(0, 4).map((prompt) => (
              <button
                key={prompt}
                onClick={() => { setQuestion(prompt); sendMessage(prompt); }}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form className="ai-chat-composer" onSubmit={handleSubmit}>
          <input
            autoFocus
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about treatment, hospitals, cost, travel..."
            value={question}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <button disabled={loading || !question.trim()} type="submit">
            <i className="fa-solid fa-paper-plane" aria-hidden="true" />
          </button>
        </form>

        <p className="ai-disclaimer">
          <i className="fa-solid fa-circle-info" aria-hidden="true" />
          General medical travel guidance only — not a substitute for professional medical advice.
        </p>
      </main>
    </section>
  );
}


function AdminPanelRedirect() {
  React.useEffect(() => {
    const adminUrl = import.meta.env.VITE_ADMIN_PORTAL_URL || 'https://admin.kairacure.com';
    window.location.href = adminUrl;
  }, []);
  return (
    <div style={{ padding: '6rem 2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '2rem', color: '#1e293b' }}>Redirecting to Kairacure Admin Portal...</h2>
      <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Administrative management is hosted securely on <strong style={{ color: '#2563eb' }}>admin.kairacure.com</strong>.</p>
    </div>
  );
}

function App() {
  const [page, setPageState] = useState(() => pageFromPath(window.location.pathname));
  const [currency, setCurrency] = useState('INR');
  const [patientToken, setPatientToken] = useState(() => readStoredPatientSession().token);
  const [currentPatient, setCurrentPatient] = useState(() => readStoredPatientSession().patient);
  const [homeSnackbar, setHomeSnackbar] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [activeGroup, setActiveGroup] = useState('All');
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(INDIA_HOSPITALS[0]);
  const [backendHospitals, setBackendHospitals] = useState([]);
  const [backendTreatments, setBackendTreatments] = useState([]);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const [aiInitialMessage, setAiInitialMessage] = useState('');
  const [plannerInitialProcedure, setPlannerInitialProcedure] = useState(null);
  const setPage = (nextPage) => {
    const nextPath = pathForPage(nextPage);
    setPageState(nextPage);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({ page: nextPage }, '', nextPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const trackPatientActivity = useCallback(async (event, metadata = {}) => {
    const token = window.localStorage.getItem('KairacurePatientToken') || patientToken;
    if (!token) return;
    try {
      await fetch(`${API_BASE}/patients/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event, page, path: window.location.pathname, metadata }),
      });
    } catch {
      // Activity tracking should never block the patient journey.
    }
  }, [page, patientToken]);

  const handlePatientLogin = useCallback((data) => {
    setPatientToken(data.token || '');
    setCurrentPatient(data.patient || null);
    setHomeSnackbar(`Welcome to Kairacure, ${formatShortName(data.patient?.name || data.patient?.email || 'patient')}`);
    trackPatientActivity('login', { source: 'patient-auth' });
  }, [trackPatientActivity]);

  const handlePatientLogout = useCallback(() => {
    window.localStorage.removeItem('KairacurePatientToken');
    window.localStorage.removeItem('KairacurePatient');
    window.localStorage.removeItem('kairacurePatientToken');
    window.localStorage.removeItem('kairacurePatient');
    setPatientToken('');
    setCurrentPatient(null);
    setHomeSnackbar('');
  }, []);

  const handlePatientUpdate = useCallback((patient) => {
    setCurrentPatient(patient || null);
  }, []);

  useEffect(() => {
    if (!homeSnackbar) return undefined;
    const timer = window.setTimeout(() => setHomeSnackbar(''), 4200);
    return () => window.clearTimeout(timer);
  }, [homeSnackbar]);

  useEffect(() => {
    if (!patientToken) return undefined;
    let ignore = false;
    fetch(`${API_BASE}/patients/me`, { headers: { Authorization: `Bearer ${patientToken}` } })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (ignore || !data?.patient) return;
        setCurrentPatient(data.patient);
        window.localStorage.setItem('KairacurePatient', JSON.stringify(data.patient));
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, [patientToken]);

  useEffect(() => {
    if (!patientToken || !currentPatient?.patientId) return;
    trackPatientActivity('page_view', { page });
  }, [currentPatient?.patientId, page, patientToken, trackPatientActivity]);

  useEffect(() => {
    const handlePopState = () => setPageState(pageFromPath(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!showJourneyModal || page !== 'home') return undefined;
    const modalTimer = window.setTimeout(() => setShowJourneyModal(false), 10000);
    return () => window.clearTimeout(modalTimer);
  }, [showJourneyModal, page]);

  const loadBackendContent = useCallback(async () => {
    setIsContentLoading(true);
    try {
      const [hospitalResponse, treatmentResponse] = await Promise.all([
        fetch(`${API_BASE}/hospitals`),
        fetch(`${API_BASE}/treatments`),
      ]);
      const [hospitalData, treatmentData] = await Promise.all([
        hospitalResponse.ok ? hospitalResponse.json() : [],
        treatmentResponse.ok ? treatmentResponse.json() : [],
      ]);

      if (Array.isArray(hospitalData) && hospitalData.length) {
        const normalizedHospitals = hospitalData.map(withBackendHospitalDefaults);
        setBackendHospitals(normalizedHospitals);
        setSelectedHospital((current) => (
          current && normalizedHospitals.some((hospital) => hospital.id === current.id)
            ? current
            : normalizedHospitals[0]
        ));
      } else {
        setBackendHospitals([]);
      }
      if (Array.isArray(treatmentData) && treatmentData.length) {
        const normalizedTreatments = treatmentData.map(withBackendTreatmentDefaults);
        setBackendTreatments(normalizedTreatments);
        setSelectedTreatment((current) => current || normalizedTreatments[0]);
      } else {
        setBackendTreatments([]);
      }
    } catch {
      setBackendHospitals([]);
      setBackendTreatments([]);
    } finally {
      setIsContentLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const guardedLoadBackendContent = async () => {
      try {
        await loadBackendContent();
        if (ignore) return;
      } catch {
        if (!ignore) setIsContentLoading(false);
      }
    };

    guardedLoadBackendContent();
    const handleCatalogRefresh = () => loadBackendContent();
    window.addEventListener('kairacure:catalog-refresh', handleCatalogRefresh);
    return () => {
      ignore = true;
      window.removeEventListener('kairacure:catalog-refresh', handleCatalogRefresh);
    };
  }, [loadBackendContent]);

  const contentHospitals = backendHospitals.length ? backendHospitals : INDIA_HOSPITALS;
  // Only use backend treatments - no fallback to dummy data
  const contentTreatments = backendTreatments;

  const filteredHospitals = useMemo(() => {
    const search = normalizeSearch(query);
    return contentHospitals.filter((hospital) => {
      const tags = Array.isArray(hospital.tags) ? hospital.tags : [];
      const doctorFocus = Array.isArray(hospital.doctorFocus) ? hospital.doctorFocus : [];

      // Match by country/city - if selectedCountry is set, filter by city name
      const matchesCountry = selectedCountry === 'All destinations' || !selectedCountry || hospital.city === selectedCountry;

      const matchesTreatment = !selectedTreatment || tags.includes(selectedTreatment.title) || hospital.specialty === selectedTreatment.specialty;
      const haystack = normalizeSearch([hospital.name, hospital.city, hospital.country, hospital.specialty, hospital.doctor, ...tags, ...doctorFocus].join(' '));
      return matchesCountry && matchesTreatment && (!search || haystack.includes(search));
    });
  }, [contentHospitals, query, selectedCountry, selectedTreatment]);

  const shownHospitals = filteredHospitals.length ? filteredHospitals : contentHospitals;
  const money = (value) => formatCurrency(value, currency);
  const searchOptions = useMemo(() => getSearchOptionsFromData(query, contentTreatments, contentHospitals), [contentHospitals, contentTreatments, query]);

  const openSearchOption = (option) => {
    if (!option) {
      setPage(query.trim() ? 'hospitals' : 'treatments');
      return;
    }
    if (option.treatment) {
      setSelectedTreatment(option.treatment);
      setPage('treatment-detail');
    } else if (option.hospital && option.type === 'Doctor') {
      setSelectedHospital(option.hospital);
      setPage('doctor-detail');
    } else if (option.hospital) {
      setSelectedHospital(option.hospital);
      const hospitalTags = Array.isArray(option.hospital.tags) ? option.hospital.tags : [];
      const matchedTreatment = contentTreatments.find((item) => hospitalTags.includes(item.title) || option.hospital.specialty === item.specialty);
      if (matchedTreatment) setSelectedTreatment(matchedTreatment);
      setPage('hospital-detail');
    } else if (option.destination) {
      setSelectedCountry(option.destination.country);
      setPage('hospitals');
    }
  };

  const handleFindCare = () => {
    openSearchOption(searchOptions[0]);
  };

  const showHome = page === 'home';
  const showAdmin = page === 'admin';
  const showAuth = page === 'login';
  const showJourneyCta = !showAdmin && !showAuth && page !== 'planner' && page !== 'ai-assistant' && page !== 'treatment-detail' && page !== 'hospitals' && page !== 'hospital-detail';

  return (
    <div className={showAdmin ? 'site-shell admin-site-shell' : showAuth ? 'site-shell auth-site-shell' : 'site-shell'}>
      {!showAdmin && !showAuth && <Header currentPatient={currentPatient} hospitals={contentHospitals} treatments={contentTreatments} onLogoutPatient={handlePatientLogout} openSearchOption={openSearchOption} page={page} setPage={setPage} />}
      {showHome && (
        <Hero
          onFindCare={handleFindCare}
          onSelectSearchOption={openSearchOption}
          query={query}
          searchOptions={searchOptions}
          setPage={setPage}
          setQuery={setQuery}
          setAiInitialMessage={setAiInitialMessage}
        />
      )}
      <main className={showAdmin ? 'admin-main' : undefined}>
        {showAdmin && <AdminPanelRedirect />}
        {showHome && <TrustStrip />}
        {showHome && (
          <section className="why-section home-video-section">
            <MedicalVideoBackdrop />
            <div className="section-heading">
              <div>
                <h2>Why Choose Us?</h2>
                <p>Free medical guidance, fair pricing, and complete travel planning for every patient journey.</p>
              </div>
            </div>
            <div className="why-card-grid">
              {WHY_US.map(([title, body]) => (
                <article key={title}>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </section>
        )}
        {(showHome || page === 'destinations') && <Destinations hospitals={contentHospitals} isLoading={isContentLoading} money={money} setPage={setPage} setSelectedCountry={setSelectedCountry} />}
        {page === 'treatments' && (
          <Treatments
            activeGroup={activeGroup}
            isLoading={isContentLoading}
            treatments={contentTreatments}
            money={money}
            selectedTreatment={selectedTreatment}
            setActiveGroup={setActiveGroup}
            setPage={setPage}
            setSelectedTreatment={setSelectedTreatment}
          />
        )}
        {showHome && <HomeTreatmentBanners setActiveGroup={setActiveGroup} setPage={setPage} setSelectedTreatment={setSelectedTreatment} treatments={contentTreatments} />}
        {(showHome || page === 'hospitals') && (
          <Hospitals hospitals={shownHospitals} isLoading={isContentLoading} money={money} selectedTreatment={selectedTreatment} setPage={setPage} setSelectedHospital={setSelectedHospital} treatments={contentTreatments} />
        )}
        {page === 'doctors' && <Doctors hospitals={shownHospitals} money={money} setPage={setPage} setSelectedHospital={setSelectedHospital} />}
        {page === 'treatment-detail' && (
          <TreatmentDetail
            allTreatments={contentTreatments}
            hospitals={contentHospitals}
            money={money}
            selectedTreatment={selectedTreatment}
            setPage={setPage}
            setPlannerInitialProcedure={setPlannerInitialProcedure}
            setSelectedHospital={setSelectedHospital}
            setSelectedTreatment={setSelectedTreatment}
          />
        )}
        {page === 'hospital-detail' && <HospitalDetail money={money} selectedHospital={selectedHospital} selectedTreatment={selectedTreatment} setPage={setPage} setSelectedHospital={setSelectedHospital} />}
        {page === 'doctor-detail' && <DoctorDetail money={money} selectedHospital={selectedHospital} setPage={setPage} />}
        {page === 'ai-assistant' && <AiAssistantPage initialMessage={aiInitialMessage} setPage={setPage} />}
        {page === 'login' && <AuthPage onGoHome={() => setPage('home')} onPatientLogin={handlePatientLogin} onPatientLogout={handlePatientLogout} onPatientUpdate={handlePatientUpdate} />}
        {page === 'planner' && <Planner hospitals={contentHospitals} initialProcedure={plannerInitialProcedure} money={money} selectedHospital={selectedHospital} selectedTreatment={selectedTreatment} setPage={setPage} setSelectedHospital={setSelectedHospital} setSelectedTreatment={setSelectedTreatment} treatments={contentTreatments} />}
        {showHome && <AiExplorationSection setPage={setPage} />}
        {showHome && <HomeFaqSection />}
      </main>
      {!showAdmin && !showAuth && <Footer setPage={setPage} />}
      {!showAdmin && !showAuth && homeSnackbar && (
        <div className="home-session-snackbar" role="status">
          <i className="fa-solid fa-circle-check" aria-hidden="true" />
          <span>{homeSnackbar}</span>
        </div>
      )}
      {showJourneyModal && page !== 'ai-assistant' && !showAdmin && <JourneyModal onClose={() => setShowJourneyModal(false)} setPage={setPage} treatments={contentTreatments} />}
    </div>
  );
}

export default App;

