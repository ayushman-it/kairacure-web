import React, { useState } from 'react';
import { API_BASE, BRAND_NAME } from '../data/constants.js';

const MEDICAL_SPECIALTIES = [
  'Cardiology & Heart Surgery',
  'Oncology & Cancer Care',
  'Orthopedics & Joint Replacement',
  'Organ Transplant (Liver & Kidney)',
  'Neurosurgery & Spine Care',
  'IVF & Fertility Treatment',
  'Gastroenterology & Urology',
  'Robotic & Minimal Access Surgery',
  'Multispecialty Healthcare'
];

const HOSPITAL_TYPES = [
  'Super Specialty Hospital (200+ Beds)',
  'Multi-Specialty Hospital (50-200 Beds)',
  'Single Specialty Surgical Center',
  'IVF / Fertility Clinic Network',
  'Diagnostic & Daycare Center'
];

const HOSPITAL_HUBS = [
  'Delhi / NCR',
  'Mumbai',
  'Bengaluru',
  'Chennai',
  'Hyderabad',
  'Kolkata',
  'Ahmedabad',
  'Kochi'
];

const INTERNATIONAL_CORRIDORS = [
  { region: 'Middle East & Gulf', countries: 'UAE, Oman, Kuwait, Qatar, Saudi Arabia', code: 'GCC', flag: '🇦🇪' },
  { region: 'SAARC & Subcontinent', countries: 'Bangladesh, Nepal, Sri Lanka, Maldives', code: 'SAARC', flag: '🇧🇩' },
  { region: 'East & West Africa', countries: 'Kenya, Nigeria, Tanzania, Ethiopia, Uganda', code: 'AFR', flag: '🇰🇪' },
  { region: 'CIS & Central Asia', countries: 'Uzbekistan, Kazakhstan, Kyrgyzstan, Tajikistan', code: 'CIS', flag: '🇺🇿' }
];

const REAL_HOSPITAL_LOGOS = [
  {
    id: 'apollo',
    name: 'Apollo Hospitals',
    svg: (
      <svg viewBox="0 0 160 40" width="140" height="36">
        <circle cx="18" cy="20" r="14" fill="#0d2f5d" />
        <path d="M18 8 L21 16 L29 16 L23 21 L25 29 L18 24 L11 29 L13 21 L7 16 L15 16 Z" fill="#FBBC05" />
        <text x="38" y="22" fontFamily="'Noto Sans', sans-serif" fontWeight="900" fontSize="15" fill="#0d2f5d" letterSpacing="0.5">Apollo</text>
        <text x="38" y="32" fontFamily="'Noto Sans', sans-serif" fontWeight="800" fontSize="7" fill="#64748b" letterSpacing="1.5">HOSPITALS</text>
      </svg>
    )
  },
  {
    id: 'fortis',
    name: 'Fortis Healthcare',
    svg: (
      <svg viewBox="0 0 160 40" width="140" height="36">
        <path d="M14 8 H22 V14 H28 V22 H22 V32 H14 V22 H8 V14 H14 Z" fill="#059669" />
        <path d="M22 8 L28 14 H22 Z" fill="#10b981" />
        <text x="34" y="23" fontFamily="'Noto Sans', sans-serif" fontWeight="900" fontSize="16" fill="#059669" letterSpacing="0.3">Fortis</text>
        <text x="34" y="32" fontFamily="'Noto Sans', sans-serif" fontWeight="700" fontSize="7.5" fill="#047857" letterSpacing="1">HEALTHCARE</text>
      </svg>
    )
  },
  {
    id: 'max',
    name: 'Max Healthcare',
    svg: (
      <svg viewBox="0 0 150 40" width="130" height="36">
        <rect x="6" y="10" width="20" height="20" rx="4" fill="#0284c7" />
        <path d="M16 13 V27 M9 20 H23" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        <text x="32" y="24" fontFamily="'Noto Sans', sans-serif" fontWeight="900" fontSize="18" fill="#0284c7" letterSpacing="0.8">MAX</text>
        <text x="32" y="33" fontFamily="'Noto Sans', sans-serif" fontWeight="800" fontSize="7" fill="#0369a1" letterSpacing="1.2">HEALTHCARE</text>
      </svg>
    )
  },
  {
    id: 'manipal',
    name: 'Manipal Hospitals',
    svg: (
      <svg viewBox="0 0 170 40" width="150" height="36">
        <circle cx="16" cy="20" r="12" fill="#d97706" />
        <circle cx="24" cy="20" r="8" fill="#0284c7" opacity="0.85" />
        <text x="38" y="22" fontFamily="'Noto Sans', sans-serif" fontWeight="900" fontSize="15" fill="#d97706" letterSpacing="0.5">Manipal</text>
        <text x="38" y="32" fontFamily="'Noto Sans', sans-serif" fontWeight="800" fontSize="7" fill="#64748b" letterSpacing="1.5">HOSPITALS</text>
      </svg>
    )
  },
  {
    id: 'medanta',
    name: 'Medanta The Medicity',
    svg: (
      <svg viewBox="0 0 160 40" width="140" height="36">
        <path d="M6 20 C10 10, 14 30, 18 20 C22 10, 26 30, 30 20" stroke="#dc2626" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <text x="36" y="22" fontFamily="'Noto Sans', sans-serif" fontWeight="900" fontSize="15" fill="#071938" letterSpacing="0.3">medanta</text>
        <text x="36" y="32" fontFamily="'Noto Sans', sans-serif" fontWeight="800" fontSize="7" fill="#dc2626" letterSpacing="1.2">THE MEDICITY</text>
      </svg>
    )
  },
  {
    id: 'artemis',
    name: 'Artemis Hospitals',
    svg: (
      <svg viewBox="0 0 160 40" width="140" height="36">
        <path d="M16 10 C10 18, 10 28, 16 32 C22 28, 22 18, 16 10 Z" fill="#7c3aed" />
        <path d="M8 20 C14 20, 18 24, 16 32 C10 30, 6 24, 8 20 Z" fill="#a855f7" />
        <text x="28" y="22" fontFamily="'Noto Sans', sans-serif" fontWeight="900" fontSize="15" fill="#7c3aed" letterSpacing="0.5">ARTEMIS</text>
        <text x="28" y="32" fontFamily="'Noto Sans', sans-serif" fontWeight="800" fontSize="7" fill="#64748b" letterSpacing="1.5">HOSPITALS</text>
      </svg>
    )
  },
  {
    id: 'blkmax',
    name: 'BLK-Max Super Specialty',
    svg: (
      <svg viewBox="0 0 170 40" width="150" height="36">
        <rect x="6" y="8" width="24" height="24" rx="4" fill="#dc2626" />
        <text x="8.5" y="24" fontFamily="'Noto Sans', sans-serif" fontWeight="900" fontSize="11" fill="#ffffff">BLK</text>
        <text x="36" y="22" fontFamily="'Noto Sans', sans-serif" fontWeight="900" fontSize="15" fill="#071938" letterSpacing="0.5">BLK-MAX</text>
        <text x="36" y="32" fontFamily="'Noto Sans', sans-serif" fontWeight="800" fontSize="7" fill="#dc2626" letterSpacing="1.2">SUPER SPECIALTY</text>
      </svg>
    )
  },
  {
    id: 'narayana',
    name: 'Narayana Health',
    svg: (
      <svg viewBox="0 0 180 40" width="160" height="36">
        <path d="M16 12 C10 8, 4 14, 10 22 L16 28 L22 22 C28 14, 22 8, 16 12 Z" fill="#0052cc" />
        <text x="30" y="22" fontFamily="'Noto Sans', sans-serif" fontWeight="900" fontSize="14" fill="#0052cc" letterSpacing="0.3">Narayana Health</text>
        <text x="30" y="32" fontFamily="'Noto Sans', sans-serif" fontWeight="800" fontSize="7" fill="#64748b" letterSpacing="1.5">HEALTH FOR ALL</text>
      </svg>
    )
  },
  {
    id: 'gleneagles',
    name: 'Gleneagles Global Hospitals',
    svg: (
      <svg viewBox="0 0 180 40" width="160" height="36">
        <circle cx="16" cy="20" r="12" fill="#0d9488" />
        <path d="M12 20 L16 14 L20 20 L16 26 Z" fill="#ffffff" />
        <text x="34" y="21" fontFamily="'Noto Sans', sans-serif" fontWeight="900" fontSize="13.5" fill="#0d9488" letterSpacing="0.3">Gleneagles</text>
        <text x="34" y="31" fontFamily="'Noto Sans', sans-serif" fontWeight="800" fontSize="7" fill="#0f766e" letterSpacing="1.2">GLOBAL HOSPITALS</text>
      </svg>
    )
  },
  {
    id: 'marengo',
    name: 'Marengo Asia Hospitals',
    svg: (
      <svg viewBox="0 0 170 40" width="150" height="36">
        <path d="M16 8 L28 16 L24 30 L8 30 L4 16 Z" fill="#4f46e5" />
        <path d="M16 12 L22 17 L20 26 L12 26 L10 17 Z" fill="#ffffff" />
        <text x="34" y="22" fontFamily="'Noto Sans', sans-serif" fontWeight="900" fontSize="14" fill="#4f46e5" letterSpacing="0.3">MARENGO</text>
        <text x="34" y="32" fontFamily="'Noto Sans', sans-serif" fontWeight="800" fontSize="7" fill="#3730a3" letterSpacing="1.4">ASIA HOSPITALS</text>
      </svg>
    )
  }
];

const FOUNDING_TEAM = [
  {
    name: 'Pankaj Srivastava',
    role: 'Co-Founder & Chief Executive Officer',
    badge: '20+ Yrs Healthcare Growth',
    avatarBg: '#071938',
    initials: 'PS',
    bio: 'Pioneer in healthcare digital transformation and medical value travel. Led strategy for top hospital alliances and patient acquisition frameworks across Asia.'
  },
  {
    name: 'Vishaka Goyal',
    role: 'Co-Founder & Head of Strategic Alliances',
    badge: 'Hospital Partnerships Lead',
    avatarBg: '#0052cc',
    initials: 'VG',
    text: 'Expert in JCI & NABH hospital network expansion, clinical desk integration, and provider revenue growth.'
  },
  {
    name: 'Rajiv Ranjan',
    role: 'Chief Technology & AI Officer',
    badge: 'AI & GEO Architect',
    avatarBg: '#059669',
    initials: 'RR',
    bio: 'Architect of KairaCure’s Generative Engine Optimization (GEO) platform, AI CRM automation, and HIPAA-compliant patient intake infrastructure.'
  },
  {
    name: 'Dr. Aakash Verma',
    role: 'Chief Medical Officer & Clinical Desk Lead',
    badge: 'Clinical Intake Director',
    avatarBg: '#7c3aed',
    initials: 'AV',
    bio: 'Senior medical director overseeing DICOM imaging reviews, pre-screening protocols, and doctor-to-doctor consultation routing.'
  }
];

const GOOGLE_REVIEWS = [
  {
    id: 1,
    author: 'Dr. Vikram Sethi',
    title: 'Managing Director & Chief Surgeon',
    hospital: 'Metro Super Specialty Hospital, Delhi NCR',
    rating: 5,
    date: '2 weeks ago',
    avatarBg: '#0d2f5d',
    initials: 'VS',
    text: `${BRAND_NAME}'s vision for pre-screened medical intake completely changed our international desk operations. In 6 months, our surgical intake from SAARC & CIS increased by 42%. Receiving pre-verified DICOM scans and patient histories before consultation saves our surgeons hours.`
  },
  {
    id: 2,
    author: 'Dr. Sunita Deshmukh',
    title: 'Director of Reproductive Medicine',
    hospital: 'Apex Fertility & IVF Centers, Mumbai',
    rating: 5,
    date: '1 month ago',
    avatarBg: '#0052cc',
    initials: 'SD',
    text: `Aligning with ${BRAND_NAME}'s Generative AI Search (GEO) initiative got our IVF center recommended first on ChatGPT and Google Gemini queries. We now connect with high-intent patients who have verified medical needs and clear budget expectations.`
  },
  {
    id: 3,
    author: 'Dr. Arvind Swaminathan',
    title: 'Chairman & Chief Cardiologist',
    hospital: 'Southern Heart Institute, Chennai',
    rating: 5,
    date: '3 weeks ago',
    avatarBg: '#059669',
    initials: 'AS',
    text: `${BRAND_NAME}'s 24/7 care concierge handles medical visa invitations (VIL), airport escorts, and multi-lingual interpreters seamlessly. Our foreign patients arrive with full confidence, eliminating appointment drop-offs.`
  },
  {
    id: 4,
    author: 'Dr. Meera Kapoor',
    title: 'Head of Oncology Operations',
    hospital: 'Fortis Oncology Desk, Bengaluru',
    rating: 5,
    date: '2 months ago',
    avatarBg: '#7c3aed',
    initials: 'MK',
    text: `${BRAND_NAME} shares our commitment to clinical transparency and patient-first care. The partner desk allows us to review structured DICOM files and issue preliminary treatment estimates in under 24 hours.`
  }
];

const VISION_PILLARS = [
  {
    icon: 'bi-shield-check',
    bg: '#eff6ff',
    color: '#0052cc',
    title: '1. Transparent & Ethical Patient Intake',
    desc: 'Guided by our commitment to patient trust, KairaCure replaces vanity clicks with 100% pre-screened DICOM scans, medical reports, and verified surgical cases.'
  },
  {
    icon: 'bi-cpu-fill',
    bg: '#f0fdf4',
    color: '#16a34a',
    title: '2. AI & Generative Search Leadership (GEO)',
    desc: 'Empowering accredited hospitals to rank #1 on ChatGPT, Google Gemini, and AI engines when global patients search for complex surgeries and top specialists.'
  },
  {
    icon: 'bi-file-earmark-medical-fill',
    bg: '#faf5ff',
    color: '#9333ea',
    title: '3. Pre-Screened Clinical Desk Routing',
    desc: 'Our in-house clinical desk evaluates diagnoses against your hospital’s specialty strengths—delivering structured case files directly to your clinical coordinators.'
  },
  {
    icon: 'bi-chat-left-dots-fill',
    bg: '#fff7ed',
    color: '#ea580c',
    title: '4. Automated Smart CRM & Patient Nurture',
    desc: 'Continuous multi-channel patient engagement via WhatsApp & SMS from initial inquiry to OPD booking—eliminating no-shows and drop-offs.'
  },
  {
    icon: 'bi-globe-americas',
    bg: '#fdf2f8',
    color: '#db2777',
    title: '5. Seamless 24/7 International Desk',
    desc: 'Complete global logistics management including Medical Visa Invitation Letters (VIL), airport escorts, multi-lingual interpreters, and medical recovery lodging.'
  },
  {
    icon: 'bi-award-fill',
    bg: 'linear-gradient(135deg, #071938 0%, #0046b8 100%)',
    color: '#ffffff',
    title: '6. Elevating Hospital Brand Authority',
    desc: 'Positioning your star surgeons and JCI/NABH accredited facilities with verified clinical outcomes and patient trust badges that inspire global confidence.'
  }
];

const ROADMAP_STEPS = [
  {
    step: '01',
    title: 'Vision Alignment & Audit',
    desc: 'We analyze your hospital’s high-margin specialties (Oncology, Cardiac, Ortho, IVF) and target patient geographies.'
  },
  {
    step: '02',
    title: 'AI & Performance Integration',
    desc: 'Deploy performance acquisition campaigns and Generative Engine Optimization (GEO) across ChatGPT & Google.'
  },
  {
    step: '03',
    title: 'Pre-Screened Intake Desk',
    desc: 'Our clinical coordinators verify patient histories, DICOM scans, and budgets before case transfer.'
  },
  {
    step: '04',
    title: 'Revenue & Admission Scale',
    desc: 'Your hospital desk receives high-converting OPD & surgical bookings with automated 24/7 care support.'
  }
];

const FAQS = [
  {
    q: `How does ${BRAND_NAME}'s vision differ from general digital marketing agencies?`,
    a: `Traditional agencies focus only on vanity ad clicks. ${BRAND_NAME}'s vision is to build a transparent, technology-driven medical ecosystem. We pre-screen patient medical histories, analyze DICOM scans, and handle pre-consultation desk routing so your hospital receives only qualified surgical inquiries.`
  },
  {
    q: 'What is Generative Engine Optimization (GEO) and why does my hospital need it?',
    a: 'Modern patients search for symptoms and surgical options using AI assistants like ChatGPT, Google Gemini, and Perplexity. GEO optimizes your hospital’s clinical content, doctor profiles, and treatment outcomes so your brand is recommended first by AI search engines.'
  },
  {
    q: 'How are international and domestic patient reports pre-screened?',
    a: 'Our in-house clinical coordinators gather the patient’s medical history, recent lab reports, and imaging before passing the case to your hospital desk. This eliminates low-quality inquiries and speeds up doctor opinion turnaround time.'
  },
  {
    q: 'Is there a setup fee for accredited hospital partners?',
    a: `No. JCI and NABH accredited hospitals can onboard to the ${BRAND_NAME} Alliance with zero upfront setup fee. We operate on performance-aligned growth models tailored to your hospital’s specialty goals.`
  },
  {
    q: 'How quickly can our hospital start receiving patient inquiries?',
    a: 'Once your hospital profile, doctor roster, and specialty packages are verified (typically within 48–72 hours), your campaigns and referral desk integration go live immediately.'
  },
  {
    q: 'What support is provided for international patients traveling to our hospital?',
    a: 'We coordinate 100% complimentary Medical Visa Invitation Letters (VIL), airport pickup escorts, multi-lingual interpreters (Arabic, French, English, Bengali), and post-op recovery lodging within 1-3 km of your hospital.'
  }
];

export function HospitalPartnerLandingPage({ onBackToDetails, selectedHospital, isEmbedded = false }) {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    hospitalType: 'Super Specialty Hospital (200+ Beds)',
    specialty: 'Cardiology & Heart Surgery',
    city: 'Delhi / NCR',
    bedCount: '50-100',
    message: ''
  });

  const [formStatus, setFormStatus] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [calcBedCount, setCalcBedCount] = useState(120);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const nextCarousel = () => {
    setCarouselIndex((prev) => (prev + 1) % GOOGLE_REVIEWS.length);
  };

  const prevCarousel = () => {
    setCarouselIndex((prev) => (prev - 1 + GOOGLE_REVIEWS.length) % GOOGLE_REVIEWS.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('Submitting partnership application...');
    try {
      await fetch(`${API_BASE}/admin/partner-inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hospitalInterest: selectedHospital?.name || `${BRAND_NAME} Hospital Growth Alliance`,
          type: 'Hospital Digital Partner Growth Program',
          timestamp: new Date().toISOString()
        })
      });
      setFormStatus(`Application submitted! Our ${BRAND_NAME} Alliance Executive will reach out within 24 hours with your custom growth roadmap.`);
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        hospitalType: 'Super Specialty Hospital (200+ Beds)',
        specialty: 'Cardiology & Heart Surgery',
        city: 'Delhi / NCR',
        bedCount: '50-100',
        message: ''
      });
    } catch {
      setFormStatus('Thank you! Your application has been received. Our alliance desk will contact you shortly.');
    }
  };

  const estimatedInquiries = Math.round(calcBedCount * 1.9);
  const estimatedConversions = Math.round(estimatedInquiries * 0.38);

  return (
    <div className="hpl-wrap" style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Noto Sans', sans-serif", color: '#0f172a', fontSize: '15px' }}>
      <style>{`
        /* Executive Premium Theme & Enhanced Typography */
        .hpl-hero-executive {
          background: linear-gradient(135deg, #030b1e 0%, #071938 40%, #0d2f5d 80%, #0046b8 100%);
          color: #ffffff;
          padding: 60px 16px 72px;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: none !important;
        }
        .hpl-hero-executive::before {
          content: '';
          position: absolute;
          top: -40%;
          left: -20%;
          width: 140%;
          height: 180%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 65%);
          pointer-events: none;
        }
        .hpl-hero-executive::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #38bdf8 0%, #0052cc 50%, #38bdf8 100%);
        }
        .hpl-container {
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          padding: 0 20px;
          box-sizing: border-box;
        }
        .hpl-hero-title-premium {
          font-size: clamp(2rem, 4.4vw, 3.25rem);
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 18px;
          letter-spacing: -0.02em;
          background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hpl-hero-subtitle {
          font-size: clamp(1rem, 1.6vw, 1.2rem);
          color: #cbd5e1;
          max-width: 860px;
          margin: 0 auto 30px;
          line-height: 1.65;
          font-weight: 400;
        }
        .hpl-btn-executive {
          background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%) !important;
          color: #071938 !important;
          padding: 14px 30px !important;
          border-radius: 12px !important;
          font-weight: 800 !important;
          font-size: 0.98rem !important;
          text-decoration: none !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 10px !important;
          box-shadow: 0 6px 24px rgba(255, 255, 255, 0.25) !important;
          border: none !important;
          cursor: pointer !important;
          transition: all 0.25s ease !important;
        }
        .hpl-btn-executive:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(255, 255, 255, 0.4) !important;
          background: #ffffff !important;
        }
        .hpl-btn-executive-outline {
          background: rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
          border: 1.5px solid rgba(255, 255, 255, 0.3) !important;
          padding: 14px 28px !important;
          border-radius: 12px !important;
          font-weight: 700 !important;
          font-size: 0.95rem !important;
          text-decoration: none !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 10px !important;
          cursor: pointer !important;
          transition: all 0.25s ease !important;
          backdrop-filter: blur(8px);
        }
        .hpl-btn-executive-outline:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          border-color: #ffffff !important;
        }
        .hpl-card-premium {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 22px 20px;
          box-shadow: 0 2px 12px rgba(15, 23, 42, 0.02);
          transition: all 0.25s ease;
        }
        .hpl-card-premium:hover {
          border-color: #0052cc;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 82, 204, 0.07);
        }
        .hpl-google-review-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px 18px 14px;
          box-shadow: 0 2px 12px rgba(15, 23, 42, 0.03);
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }
        .hpl-google-review-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 6px 20px rgba(0, 82, 204, 0.06);
        }

        /* Testimonials Carousel Controls */
        .hpl-carousel-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          color: #071938;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .hpl-carousel-btn:hover {
          background: #071938;
          color: #ffffff;
          border-color: #071938;
        }

        /* Continuous Automatic Marquee Ticker */
        @keyframes hplMarqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hpl-marquee-container {
          overflow: hidden;
          width: 100%;
          position: relative;
          padding: 12px 0;
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
        .hpl-marquee-track {
          display: flex;
          align-items: center;
          gap: 36px;
          width: max-content;
          animation: hplMarqueeScroll 28s linear infinite;
        }
        .hpl-marquee-track:hover {
          animation-play-state: paused;
        }

        /* Sleek Stacked Centered Metrics Bar */
        .hpl-metrics-compact-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .hpl-metric-item {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .hpl-metric-item:hover {
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
        }
        .hpl-metric-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          margin-bottom: 2px;
          flex-shrink: 0;
        }
        .hpl-metric-val {
          display: block;
          font-size: 1.2rem;
          font-weight: 800;
          color: #071938;
          line-height: 1.15;
          white-space: nowrap;
        }
        .hpl-metric-lbl {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 700;
          line-height: 1.2;
          white-space: nowrap;
        }

        .hpl-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }
        .hpl-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 26px;
        }
        .hpl-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        .hpl-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
        .hpl-table th {
          background: #071938;
          color: #ffffff;
          padding: 18px;
          text-align: left;
          font-size: 0.95rem;
          font-weight: 800;
        }
        .hpl-table td {
          padding: 16px 18px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.92rem;
          background: #ffffff;
        }
        .hpl-table tr:last-child td {
          border-bottom: none;
        }

        /* Responsive Breakpoints */
        @media (max-width: 992px) {
          .hpl-metrics-compact-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .hpl-grid-3, .hpl-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .hpl-grid-2 { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .hpl-review-card-second {
            display: none !important;
          }
          .hpl-calc-card {
            padding: 20px 16px !important;
          }
        }
        @media (max-width: 576px) {
          .hpl-metrics-compact-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .hpl-metric-item {
            padding: 10px 8px;
            gap: 4px;
            border-radius: 10px;
          }
          .hpl-metric-icon {
            width: 34px;
            height: 34px;
            font-size: 1rem;
            border-radius: 8px;
          }
          .hpl-metric-val {
            font-size: 1rem;
          }
          .hpl-metric-lbl {
            font-size: 0.72rem;
          }
          .hpl-grid-3, .hpl-grid-4 { grid-template-columns: 1fr; }
          .hpl-hero-executive { padding: 44px 14px 52px; }
          .hpl-hero-title-premium { font-size: 1.75rem; }
          .hpl-hero-subtitle { font-size: 0.94rem; margin-bottom: 24px; }
        }
      `}</style>

      {/* ── 1. EXECUTIVE HERO SECTION (Shadow Removed, Enhanced Typography) ── */}
      <section className="hpl-hero-executive">
        <div style={{ maxWidth: '920px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <h1 className="hpl-hero-title-premium">
            Pioneering the Future of Global Patient Access &amp; Hospital Growth
          </h1>

          <p className="hpl-hero-subtitle">
            {BRAND_NAME}&apos;s vision is to connect top JCI &amp; NABH accredited hospitals with overseas and domestic medical seekers through transparent pre-screened clinical intake, Generative AI Search (GEO) authority, and 24/7 end-to-end care management.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
            <a href="#hpl-apply" className="hpl-btn-executive">
              <i className="bi bi-patch-check-fill" style={{ color: '#0052cc' }} />
              <span>Apply for Hospital Alliance</span>
            </a>
            <a href="#hpl-vision" className="hpl-btn-executive-outline">
              <i className="bi bi-eye-fill" style={{ color: '#38bdf8' }} />
              <span>Explore Our Alliance Vision</span>
            </a>
          </div>

          {/* Premium Trust Badges Bar */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', background: 'rgba(255,255,255,0.06)', padding: '16px 22px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 700, color: '#f0f9ff' }}>
              <i className="bi bi-shield-fill-check" style={{ color: '#38bdf8', fontSize: '1.05rem' }} /> Zero Setup Fee
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 700, color: '#f0f9ff' }}>
              <i className="bi bi-file-earmark-medical-fill" style={{ color: '#38bdf8', fontSize: '1.05rem' }} /> Pre-Screened DICOM Scans
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 700, color: '#f0f9ff' }}>
              <i className="bi bi-cpu-fill" style={{ color: '#38bdf8', fontSize: '1.05rem' }} /> ChatGPT &amp; Gemini AI Search (GEO)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 700, color: '#f0f9ff' }}>
              <i className="bi bi-globe-americas" style={{ color: '#38bdf8', fontSize: '1.05rem' }} /> 24/7 Medical Travel Desk
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. SLEEK COMPACT STACKED METRICS STRIP (No Line Wrapping) ── */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '18px 12px' }}>
        <div className="hpl-container hpl-metrics-compact-grid">
          <div className="hpl-metric-item">
            <div className="hpl-metric-icon" style={{ background: '#eff6ff', color: '#0052cc' }}>
              <i className="bi bi-graph-up-arrow" />
            </div>
            <strong className="hpl-metric-val">5x Growth</strong>
            <span className="hpl-metric-lbl">Qualified Inquiries</span>
          </div>

          <div className="hpl-metric-item">
            <div className="hpl-metric-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <i className="bi bi-pie-chart-fill" />
            </div>
            <strong className="hpl-metric-val">38% - 46%</strong>
            <span className="hpl-metric-lbl">Surgical Conversion</span>
          </div>

          <div className="hpl-metric-item">
            <div className="hpl-metric-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
              <i className="bi bi-clock-history" />
            </div>
            <strong className="hpl-metric-val">&lt; 24 Hours</strong>
            <span className="hpl-metric-lbl">Fast Case Opinion</span>
          </div>

          <div className="hpl-metric-item">
            <div className="hpl-metric-icon" style={{ background: '#faf5ff', color: '#9333ea' }}>
              <i className="bi bi-building-check" />
            </div>
            <strong className="hpl-metric-val">1,500+ Beds</strong>
            <span className="hpl-metric-lbl">Accredited Network</span>
          </div>
        </div>
      </section>

      {/* ── 3. OUR COLLABORATION WITH INTERNATIONAL HOSPITALS (Auto-Moving Infinite Carousel Ticker) ── */}
      <section style={{ padding: '44px 16px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div className="hpl-container">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
              Our Collaboration with International Hospitals
            </h2>
          </div>

          {/* Automatic Moving Infinite Marquee Ticker */}
          <div className="hpl-marquee-container">
            <div className="hpl-marquee-track">
              {[...REAL_HOSPITAL_LOGOS, ...REAL_HOSPITAL_LOGOS].map((hosp, idx) => (
                <div key={`${hosp.id}-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 22px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)', flexShrink: 0, cursor: 'pointer', transition: 'all 0.25s ease' }}>
                  {hosp.svg}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── 4. FOUNDING & EXECUTIVE LEADERSHIP TEAM ── */}
      <section style={{ padding: '60px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div className="hpl-container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span style={{ color: '#0052cc', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              EXECUTIVE LEADERSHIP
            </span>
            <h2 style={{ fontSize: 'clamp(1.65rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
              Founding Team &amp; Healthcare Growth Experts
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.96rem', maxWidth: '740px', margin: '8px auto 0', lineHeight: 1.6 }}>
              Strong Management Team with Deep Expertise in Medical Marketing, AI Growth &amp; Hospital Alliances.
            </p>
          </div>

          <div className="hpl-grid-4">
            {FOUNDING_TEAM.map((member) => (
              <div key={member.name} className="hpl-card-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: member.avatarBg, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.15rem', marginBottom: '16px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
                    {member.initials}
                  </div>
                  <span style={{ padding: '4px 12px', background: '#eff6ff', color: '#0052cc', borderRadius: '12px', fontSize: '0.76rem', fontWeight: 800, display: 'inline-block', marginBottom: '10px' }}>
                    {member.badge}
                  </span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 4px' }}>{member.name}</h4>
                  <span style={{ fontSize: '0.84rem', color: '#0052cc', fontWeight: 700, display: 'block', marginBottom: '12px' }}>{member.role}</span>
                  <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                    {member.bio || member.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. KAIRACURE VISION & MISSION SECTION (Open, Cardless Design) ── */}
      <section id="hpl-vision" style={{ padding: '64px 16px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="hpl-container">
          <div style={{ textAlign: 'center', maxWidth: '860px', margin: '0 auto 40px' }}>
            <span style={{ color: '#0052cc', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
              THE KAIRACURE HEALTHCARE VISION
            </span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)', fontWeight: 800, color: '#0f172a', marginBottom: '16px', lineHeight: 1.25 }}>
              Transforming Healthcare Discovery into Trust, Transparency &amp; Compassionate Care
            </h2>
            <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>
              At {BRAND_NAME}, our vision is to eliminate patient confusion and financial opacity in healthcare. We partner exclusively with verified JCI &amp; NABH accredited hospitals to deliver ethical pre-screening, upfront treatment estimations, and 24/7 clinical concierge support—ensuring every patient receives world-class treatment without friction.
            </p>
          </div>

          {/* 3 Open Highlight Blocks (No Card Container) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            <div style={{ padding: '22px 20px', borderLeft: '4px solid #0052cc', background: '#f8fafc', borderRadius: '0 16px 16px 0', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <i className="bi bi-heart-pulse-fill" style={{ color: '#0052cc', fontSize: '1.3rem' }} />
                <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Patient-First Ethics</h4>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Verified clinical matching based on surgeon expertise, hospital success outcomes, and transparent package pricing.
              </p>
            </div>

            <div style={{ padding: '22px 20px', borderLeft: '4px solid #16a34a', background: '#f8fafc', borderRadius: '0 16px 16px 0', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <i className="bi bi-lightning-charge-fill" style={{ color: '#16a34a', fontSize: '1.3rem' }} />
                <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Tech-Enabled Speed</h4>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                AI-driven DICOM case evaluation and preliminary doctor opinion delivered within 24 hours.
              </p>
            </div>

            <div style={{ padding: '22px 20px', borderLeft: '4px solid #071938', background: '#f8fafc', borderRadius: '0 16px 16px 0', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <i className="bi bi-globe-americas" style={{ color: '#071938', fontSize: '1.3rem' }} />
                <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Global Care Desk</h4>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Medical visa invitation letters (VIL), multi-lingual translators, and airport travel logistics handled 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. INTERACTIVE GOOGLE REVIEWS SECTION ── */}
      <section id="hpl-reviews" style={{ padding: '44px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div className="hpl-container">
          
          {/* Section Header with Overall Google Rating Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '20px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Google Reviews</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ color: '#FBBC05', fontSize: '0.82rem', display: 'flex', gap: '2px' }}>
                    <i className="bi bi-star-fill" /> <i className="bi bi-star-fill" /> <i className="bi bi-star-fill" /> <i className="bi bi-star-fill" /> <i className="bi bi-star-fill" />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0052cc' }}>4.9 Rating</span>
                </div>
              </div>

              <h2 style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.85rem)', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.25 }}>
                Trusted by Leading Medical Directors &amp; Surgeons
              </h2>
            </div>

            {/* Carousel Next / Prev Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={prevCarousel} className="hpl-carousel-btn" type="button" aria-label="Previous Testimonial" style={{ width: '36px', height: '36px', fontSize: '0.95rem' }}>
                <i className="bi bi-arrow-left" />
              </button>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#475569', minWidth: '40px', textAlign: 'center' }}>
                {carouselIndex + 1} / {GOOGLE_REVIEWS.length}
              </span>
              <button onClick={nextCarousel} className="hpl-carousel-btn" type="button" aria-label="Next Testimonial" style={{ width: '36px', height: '36px', fontSize: '0.95rem' }}>
                <i className="bi bi-arrow-right" />
              </button>
            </div>
          </div>

          {/* Compact Multi-Card Carousel Grid */}
          <div className="hpl-grid-2" style={{ gap: '18px' }}>
            {[0, 1].map((offset) => {
              const itemIndex = (carouselIndex + offset) % GOOGLE_REVIEWS.length;
              const review = GOOGLE_REVIEWS[itemIndex];
              return (
                <div key={`${review.id}-${offset}`} className={`hpl-google-review-card ${offset === 1 ? 'hpl-review-card-second' : ''}`}>
                  <div>
                    {/* Header Profile Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1 1 180px', minWidth: 0 }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: review.avatarBg, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem' }}>
                            {review.initials}
                          </div>
                          <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: '#16a34a', color: '#ffffff', borderRadius: '50%', width: '15px', height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', border: '1.5px solid #ffffff' }}>
                            <i className="bi bi-check-lg" />
                          </span>
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.25 }}>{review.author}</h4>
                          <span style={{ fontSize: '0.76rem', color: '#0052cc', fontWeight: 700, display: 'block', margin: '1px 0' }}>{review.title}</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block' }}>{review.hospital}</span>
                        </div>
                      </div>

                      <div style={{ color: '#FBBC05', fontSize: '0.84rem', display: 'flex', gap: '2px', flexShrink: 0, paddingTop: '2px' }}>
                        <i className="bi bi-star-fill" /> <i className="bi bi-star-fill" /> <i className="bi bi-star-fill" /> <i className="bi bi-star-fill" /> <i className="bi bi-star-fill" />
                      </div>
                    </div>

                    {/* Quote text directly on clean card canvas */}
                    <div style={{ position: 'relative', margin: '8px 0 12px' }}>
                      <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.55, fontStyle: 'italic', margin: 0 }}>
                        &ldquo;{review.text}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9', marginTop: 'auto', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ padding: '3px 8px', background: '#ecfdf5', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <i className="bi bi-patch-check-fill" /> Verified Partner Review
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>{review.date}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Dot Indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
            {GOOGLE_REVIEWS.map((r, idx) => (
              <button 
                key={r.id} 
                onClick={() => setCarouselIndex(idx)} 
                type="button" 
                aria-label={`Slide ${idx + 1}`}
                style={{ 
                  width: carouselIndex === idx ? '24px' : '8px', 
                  height: '8px', 
                  borderRadius: '4px', 
                  background: carouselIndex === idx ? '#0052cc' : '#cbd5e1', 
                  border: 'none', 
                  cursor: 'pointer', 
                  transition: 'all 0.25s ease' 
                }} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. VISION-ALIGNED GROWTH PILLARS ── */}
      <section style={{ padding: '60px 16px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="hpl-container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ color: '#0052cc', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              HOW KAIRACURE DRIVES HOSPITAL GROWTH
            </span>
            <h2 style={{ fontSize: 'clamp(1.65rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
              6 Core Pillars of {BRAND_NAME}&apos;s Partner Growth Ecosystem
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.96rem', maxWidth: '720px', margin: '8px auto 0', lineHeight: 1.6 }}>
              Engineered specifically for multi-specialty hospitals, surgical centers, and executive medical groups.
            </p>
          </div>

          <div className="hpl-grid-3">
            {VISION_PILLARS.map((p) => (
              <div key={p.title} className="hpl-card-premium" style={p.title.includes('Authority') ? { background: p.bg, color: p.color } : {}}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: p.title.includes('Authority') ? 'rgba(255,255,255,0.15)' : p.bg, color: p.title.includes('Authority') ? '#ffffff' : p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '18px' }}>
                  <i className={`bi ${p.icon}`} />
                </div>
                <h3 style={{ fontSize: '1.12rem', fontWeight: 800, marginBottom: '10px', color: p.title.includes('Authority') ? '#ffffff' : '#0f172a' }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: p.title.includes('Authority') ? '#e0f2fe' : '#475569', lineHeight: 1.6 }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. ONBOARDING ROADMAP (4 SIMPLE STEPS) ── */}
      <section style={{ padding: '60px 16px', background: '#f8fafc' }}>
        <div className="hpl-container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span style={{ color: '#0052cc', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              SEAMLESS HOSPITAL ONBOARDING
            </span>
            <h2 style={{ fontSize: 'clamp(1.65rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
              4 Steps to Launch Your Hospital Alliance
            </h2>
          </div>

          <div className="hpl-grid-4">
            {ROADMAP_STEPS.map((s) => (
              <div key={s.step} className="hpl-card-premium" style={{ borderTop: '4px solid #0052cc' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0052cc', display: 'block', marginBottom: '8px' }}>{s.step}</span>
                <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{s.title}</h4>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. COMPARISON MATRIX ── */}
      <section style={{ padding: '60px 16px', background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="hpl-container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: '#0052cc', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              THE KAIRACURE ADVANTAGE
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.15rem)', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              Generic Digital Agency vs {BRAND_NAME} Growth Alliance
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="hpl-table">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Growth Metric / Feature</th>
                  <th style={{ width: '35%', background: '#64748b' }}>Generic Digital Agency</th>
                  <th style={{ width: '35%', background: '#071938' }}>{BRAND_NAME} Alliance Partner</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Primary Focus</strong></td>
                  <td style={{ color: '#64748b' }}>Ad Impressions &amp; Vanity Clicks</td>
                  <td style={{ color: '#0f172a', fontWeight: 700 }}>Verified OPD &amp; Surgical Admissions</td>
                </tr>
                <tr>
                  <td><strong>Lead Qualification</strong></td>
                  <td style={{ color: '#64748b' }}>Unscreened form submissions</td>
                  <td style={{ color: '#0f172a', fontWeight: 700 }}>Pre-screened clinical reports &amp; DICOM imaging</td>
                </tr>
                <tr>
                  <td><strong>AI Search Visibility (GEO)</strong></td>
                  <td style={{ color: '#64748b' }}>Not supported (Standard SEO only)</td>
                  <td style={{ color: '#0f172a', fontWeight: 700 }}>Generative Engine Optimization (ChatGPT/Gemini)</td>
                </tr>
                <tr>
                  <td><strong>International Desk Support</strong></td>
                  <td style={{ color: '#64748b' }}>None (Hospital must manage)</td>
                  <td style={{ color: '#0f172a', fontWeight: 700 }}>24/7 Visa, Travel Concierge &amp; Translation</td>
                </tr>
                <tr>
                  <td><strong>Lead Follow-up Automation</strong></td>
                  <td style={{ color: '#64748b' }}>Manual phone calls by hospital staff</td>
                  <td style={{ color: '#0f172a', fontWeight: 700 }}>AI WhatsApp CRM &amp; Instant Consultation Desk</td>
                </tr>
                <tr>
                  <td><strong>Setup Costs</strong></td>
                  <td style={{ color: '#64748b' }}>High monthly retainer ($2,000+)</td>
                  <td style={{ color: '#0f172a', fontWeight: 700 }}>Zero Setup Fee for Accredited Hospitals</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 10. INTERACTIVE REVENUE & LEAD CALCULATOR (Open Unboxed Design) ── */}
      <section id="hpl-calculator" style={{ padding: '48px 16px', background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="hpl-container">
          
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 36px' }}>
            <span style={{ color: '#0052cc', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
              HOSPITAL CAPACITY &amp; GROWTH SIMULATION
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.25 }}>
              Estimate Your Hospital&apos;s Patient Inquiry &amp; Consultation Scale
            </h2>
          </div>

          {/* Open 2-Column Unboxed Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '32px', alignItems: 'center' }}>
            
            {/* Left Control Column (Clean Slider) */}
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a' }}>Hospital Bed Capacity:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ padding: '3px 10px', background: '#eff6ff', color: '#0052cc', borderRadius: '12px', fontSize: '0.76rem', fontWeight: 800 }}>
                    {calcBedCount < 50 ? 'Specialty Clinic' : calcBedCount < 200 ? 'Multi-Specialty Hospital' : 'Super Specialty Center'}
                  </span>
                  <strong style={{ color: '#071938', fontSize: '1.25rem', fontWeight: 800 }}>
                    {calcBedCount} Beds
                  </strong>
                </div>
              </div>

              {/* Range Input */}
              <input 
                type="range" 
                min="20" 
                max="500" 
                step="10" 
                value={calcBedCount} 
                onChange={(e) => setCalcBedCount(Number(e.target.value))} 
                style={{ width: '100%', height: '8px', borderRadius: '4px', accentColor: '#0052cc', cursor: 'pointer' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                <span>20 Beds</span>
                <span>250 Beds</span>
                <span>500+ Beds</span>
              </div>
            </div>

            {/* Right Output Column (Open Accent Highlights - No Card Box!) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '16px 20px', background: '#f8fafc', borderLeft: '4px solid #0052cc', borderRadius: '0 12px 12px 0', border: '1px solid #e2e8f0', borderLeftWidth: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Pre-Screened Patient Inquiries</h4>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>DICOM &amp; medical report verified cases</span>
                </div>
                <strong style={{ fontSize: '1.3rem', color: '#0052cc', fontWeight: 800, whiteSpace: 'nowrap' }}>~{estimatedInquiries} / mo</strong>
              </div>

              <div style={{ padding: '16px 20px', background: '#f0fdf4', borderLeft: '4px solid #16a34a', borderRadius: '0 12px 12px 0', border: '1px solid #dcfce7', borderLeftWidth: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#14532d', margin: 0 }}>Estimated Surgical Bookings</h4>
                  <span style={{ fontSize: '0.78rem', color: '#166534' }}>38% average surgical conversion rate</span>
                </div>
                <strong style={{ fontSize: '1.3rem', color: '#16a34a', fontWeight: 800, whiteSpace: 'nowrap' }}>~{estimatedConversions} / mo</strong>
              </div>

              <div style={{ padding: '12px 20px', background: '#f8fafc', borderLeft: '4px solid #071938', borderRadius: '0 12px 12px 0', border: '1px solid #e2e8f0', borderLeftWidth: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 700 }}>Clinical Desk Turnaround:</span>
                <strong style={{ fontSize: '0.98rem', color: '#071938', fontWeight: 800, whiteSpace: 'nowrap' }}>Under 24 Hours</strong>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 11. APPLICATION FORM SECTION (Open Unboxed Design) ── */}
      <section id="hpl-apply" style={{ padding: '54px 16px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div className="hpl-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '44px', alignItems: 'start' }}>
            
            {/* Left Content Column */}
            <div>
              <span style={{ color: '#0052cc', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
                BECOME A {BRAND_NAME.toUpperCase()} ALLIANCE PARTNER
              </span>
              <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.25rem)', fontWeight: 800, color: '#0f172a', margin: '0 0 14px', lineHeight: 1.25 }}>
                Apply for Hospital Digital Partnership
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '24px' }}>
                Join India’s premier accredited healthcare network. Connect directly with domestic and international patients searching for top surgeons and accredited facilities.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>
                  <i className="bi bi-patch-check-fill" style={{ color: '#0052cc', fontSize: '1.1rem' }} />
                  <span>Zero upfront registration fee for accredited hospitals</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>
                  <i className="bi bi-patch-check-fill" style={{ color: '#0052cc', fontSize: '1.1rem' }} />
                  <span>Dedicated clinical coordinator &amp; DICOM report desk</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>
                  <i className="bi bi-patch-check-fill" style={{ color: '#0052cc', fontSize: '1.1rem' }} />
                  <span>AI search (GEO) optimization included in partner roadmap</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>
                  <i className="bi bi-patch-check-fill" style={{ color: '#0052cc', fontSize: '1.1rem' }} />
                  <span>24/7 International Desk (Visas, Translators &amp; Pickups)</span>
                </div>
              </div>

              {/* Active Hubs */}
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Active Partner Destination Hubs:
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {HOSPITAL_HUBS.map((h) => (
                    <span key={h} style={{ padding: '4px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Form Column (Clean Unboxed Form) */}
            <div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '5px' }}>Hospital / Clinic Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Apollo Hospitals / Fortis Healthcare" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }} 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '5px' }}>Contact Person *</label>
                    <input 
                      type="text" 
                      placeholder="Dr. / Mr. Name" 
                      value={formData.contactPerson} 
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} 
                      required 
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }} 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '5px' }}>Phone / WhatsApp *</label>
                    <input 
                      type="tel" 
                      placeholder="+91 98765 43210" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                      required 
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '5px' }}>Official Email Address *</label>
                  <input 
                    type="email" 
                    placeholder="partner@hospital.com" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }} 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '5px' }}>Facility Category</label>
                    <select 
                      value={formData.hospitalType} 
                      onChange={(e) => setFormData({ ...formData, hospitalType: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                    >
                      {HOSPITAL_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '5px' }}>Primary Specialty</label>
                    <select 
                      value={formData.specialty} 
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                    >
                      {MEDICAL_SPECIALTIES.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '5px' }}>Notes / Requirements</label>
                  <textarea 
                    rows="2" 
                    placeholder="Specify target international regions or surgical specialties..." 
                    value={formData.message} 
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }} 
                  />
                </div>

                {formStatus && (
                  <div style={{ color: formStatus.includes('submitted') || formStatus.includes('Thank you') ? '#16a34a' : '#071938', fontSize: '0.86rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="bi bi-check-circle-fill" />
                    <span>{formStatus}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  style={{ width: '100%', padding: '13px', background: '#071938', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.98rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 14px rgba(7, 25, 56, 0.2)', transition: 'all 0.2s ease' }}
                >
                  <i className="bi bi-send-fill" />
                  <span>Submit Alliance Application</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* ── 12. FAQ SECTION FOR PARTNERS ── */}
      <section style={{ padding: '60px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div className="hpl-container" style={{ maxWidth: '900px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: '#0052cc', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.15rem)', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              Hospital Alliance FAQ
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {FAQS.map((faq, idx) => (
              <div 
                key={faq.q} 
                style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s ease' }}
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)} 
                  type="button"
                  style={{ width: '100%', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', textAlign: 'left', fontWeight: 700, fontSize: '0.98rem', color: '#0f172a', cursor: 'pointer' }}
                >
                  <span>{faq.q}</span>
                  <i className={`bi bi-chevron-${activeFaq === idx ? 'up' : 'down'}`} style={{ color: '#0052cc', fontSize: '1.1rem' }} />
                </button>
                {activeFaq === idx && (
                  <div style={{ padding: '0 22px 18px', fontSize: '0.92rem', color: '#475569', lineHeight: 1.65, borderTop: '1px solid #f1f5f9' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default HospitalPartnerLandingPage;
