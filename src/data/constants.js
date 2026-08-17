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
export const TREATMENTS = [];
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
