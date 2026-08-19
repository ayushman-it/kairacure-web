import React, { useState } from 'react';
import { Footer } from '../components/common/Footer.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import {
  API_BASE,
  accreditationText,
  getHospitalImage,
  handleImageFallback,
  hospitalGallery,
  HOSPITALS,
  formatHospitalDisplayName
} from '../data/constants.js';

export function PartnerLandingPage({ money, selectedHospital, selectedTreatment, setPage, setSelectedHospital, onBack }) {
  const hospital = selectedHospital || HOSPITALS[0];
  const gallery = hospitalGallery(hospital);
  const cleanHospitalName = formatHospitalDisplayName(hospital.name);

  // INTERACTIVE GALLERY STATE: Default to first gallery image or main hospital image
  const [activeImg, setActiveImg] = useState(() => gallery[0] || getHospitalImage(hospital));

  // Doctors Check: ONLY show if database has real doctors
  const hasRealDoctors = (Array.isArray(hospital.doctorsList) && hospital.doctorsList.length > 0) || Boolean(hospital.doctor);
  const hospitalDoctors = Array.isArray(hospital.doctorsList) && hospital.doctorsList.length
    ? hospital.doctorsList
    : hospital.doctor
      ? [{ name: hospital.doctor, title: hospital.doctorTitle || `Specialist at ${cleanHospitalName}`, exp: 'Senior Specialist', rating: '4.9 ★' }]
      : [];

  const [activeTab, setActiveTab] = useState('overview');
  const [openFaq, setOpenFaq] = useState(0);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '', treatment: hospital.specialty || 'General', notes: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          hospital: cleanHospitalName,
          source: 'standalone-partner-landing'
        })
      });
      setFormSubmitted(true);
    } catch {
      setFormSubmitted(true);
    }
  };

  const hospitalAccreditation = accreditationText(hospital.accreditations, hospital.nabhType || hospital.jciStatus || 'NABH Accredited');
  const hospitalAddress = hospital.address || hospital.addressLine1 || [hospital.city, hospital.state, hospital.country].filter(Boolean).join(', ') || 'India';
  const hospitalBeds = hospital.bedText || hospital.beds || '500+ Beds';
  const hospitalFounded = hospital.established || hospital.foundedYear || 'Est. 2008';

  const hospitalTreatments = Array.isArray(hospital.tags) && hospital.tags.length
    ? hospital.tags.map((t, idx) => ({ id: `ht-${idx}`, title: t, packageFrom: 120000 + (idx * 25000), specialty: hospital.specialty }))
    : [
        { id: 'ht-1', title: `${hospital.specialty || 'Cardiology'} Surgery & Care`, packageFrom: 180000, specialty: hospital.specialty },
        { id: 'ht-2', title: 'Specialist Consultation & Surgery', packageFrom: 120000, specialty: hospital.specialty },
        { id: 'ht-3', title: 'Diagnostic & ICU Package', packageFrom: 75000, specialty: hospital.specialty }
      ];

  const faqs = [
    { q: `How do I book an appointment with a doctor at ${cleanHospitalName}?`, a: `Submit your consultation request using the form on this page. Our care coordinator will confirm doctor availability within 2 hours.` },
    { q: `Does ${cleanHospitalName} issue medical visa invitation letters (VIL)?`, a: `Yes. Once your case is evaluated by senior specialists, ${cleanHospitalName} issues official Visa Invitation Letters for patient and attendant visas.` },
    { q: `What international patient services are provided?`, a: `Services include complimentary airport transfers, language interpreters (Arabic, Russian, French), guest house stay arrangements, and 24/7 dedicated case managers.` }
  ];

  return (
    <div className="partner-standalone-shell" style={{ background: '#ffffff', minHeight: '100vh', color: '#0f172a', fontFamily: "'Noto Sans', sans-serif" }}>

      {/* ── MAIN CONTENT (WHITE BACKGROUND, CLEAN LIGHT BORDER, EXACT CONTAINER ALIGNMENT) ── */}
      <main className="partner-landing-page" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0.75rem 12px 3rem', boxSizing: 'border-box', overflowX: 'hidden' }}>

        {/* BREADCRUMBS WITH LOW TOP MARGIN */}
        <div style={{ marginBottom: '0.5rem' }}>
          <Breadcrumbs
            items={[
              { label: 'Home', onClick: () => setPage('home') },
              { label: 'Partners', onClick: onBack || (() => setPage('partners')) },
              { label: hospital.country || 'India', onClick: () => setPage('destinations') },
              { label: cleanHospitalName },
            ]}
          />
        </div>

        {/* HERO CARD (WHITE BACKGROUND, CLEAN LIGHT BORDER) */}
        <div className="pdl-card" style={{ borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '1rem', boxShadow: '0 2px 10px rgba(0,102,254,0.05)', overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          <div className="pdl-hero-grid" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>

            {/* Left Image & Interactive Gallery */}
            <div style={{ minWidth: 0 }}>
              <div className="pdl-cover-wrap" style={{ height: '230px', position: 'relative', borderRadius: '10px', overflow: 'hidden' }}>
                <img src={activeImg} alt={cleanHospitalName} onError={handleImageFallback} className="pdl-cover-img" />
                <span className="pdl-badge-verified">
                  <i className="bi bi-shield-check" style={{ marginRight: '0.35rem', color: '#38bdf8' }} /> Verified Partner
                </span>
              </div>

              {/* INTERACTIVE GALLERY THUMBNAILS */}
              <div className="pdl-thumbs-row" style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto', maxWidth: '100%', flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                {gallery.slice(0, 5).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Preview ${i + 1}`}
                    onClick={() => setActiveImg(img)}
                    className={`pdl-thumb-img${activeImg === img ? ' active' : ''}`}
                    style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0', flexShrink: 0 }}
                    onError={handleImageFallback}
                  />
                ))}
              </div>
            </div>

            {/* Right Details Header */}
            <div style={{ minWidth: 0 }}>
              {/* UPGRADED MODERN PILL BADGES */}
              <div className="pdl-badge-wrap" style={{ marginBottom: '8px' }}>
                <span className="pdl-badge-blue">
                  <i className="bi bi-hospital-fill" style={{ marginRight: '4px' }} /> {hospital.specialty || 'Multispecialty'} Hospital
                </span>
                <span className="pdl-badge-gold">
                  <i className="bi bi-award-fill" style={{ marginRight: '0.3rem', color: '#f59e0b' }} /> {hospitalAccreditation}
                </span>
              </div>

              {/* CLEAN TITLE */}
              <h1 className="pdl-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem', letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
                {cleanHospitalName}
              </h1>

              {/* ENHANCED LOCATION BLOCK */}
              <div className="pdl-location-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
                <div className="pdl-location-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', minWidth: 0 }}>
                  <i className="bi bi-geo-alt-fill" style={{ color: '#ef4444', fontSize: '1rem', marginTop: '0.15rem', flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="pdl-location-title" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {hospital.city ? `${hospital.city}, ${hospital.state || ''} ${hospital.country || 'India'}` : hospitalAddress}
                    </div>
                    <div className="pdl-location-sub" style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.4rem', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {hospitalAddress}
                    </div>
                    <div className="pdl-location-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span className="pdl-pill" style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#0066fe', fontSize: '0.74rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center' }}>
                        <i className="bi bi-airplane-fill" style={{ color: '#0066fe', marginRight: '0.3rem' }} /> International Airport Access
                      </span>
                      <span className="pdl-pill" style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#16a34a', fontSize: '0.74rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center' }}>
                        <i className="bi bi-person-badge-fill" style={{ color: '#16a34a', marginRight: '0.3rem' }} /> Care Concierge Desk
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spec Pills Bar */}
              <div className="pdl-specs-grid">
                <div>
                  <strong className="pdl-spec-val" style={{ color: '#0f172a' }}>{hospitalBeds}</strong>
                  <span className="pdl-spec-lbl">Capacity</span>
                </div>
                <div>
                  <strong className="pdl-spec-val" style={{ color: '#0f172a' }}>{hospital.doctors || '45+'}</strong>
                  <span className="pdl-spec-lbl">Doctors</span>
                </div>
                <div>
                  <strong className="pdl-spec-val" style={{ color: '#0f172a' }}>{hospitalFounded}</strong>
                  <span className="pdl-spec-lbl">Established</span>
                </div>
                <div>
                  <strong className="pdl-spec-val" style={{ color: '#16a34a' }}>{hospital.rating || '4.9'} ★</strong>
                  <span className="pdl-spec-lbl">Rating</span>
                </div>
              </div>

              {/* COMPACT & ELEGANT ACTION BUTTONS */}
              <div className="pdl-actions-row" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '0.65rem', width: '100%', maxWidth: '100%', boxSizing: 'border-box', marginTop: '1rem', height: 'auto', alignSelf: 'flex-start' }}>
                <a href="#connect-form" className="pdl-btn-primary" style={{ height: '42px', minHeight: '42px', maxHeight: '42px', padding: '0 1rem', fontSize: '0.85rem', boxSizing: 'border-box', margin: 0, justifyContent: 'center', flex: '1 1 180px' }}>
                  <i className="bi bi-calendar-check-fill" style={{ marginRight: '0.35rem' }} /> Book Free Consultation
                </a>
                <button onClick={() => setPage('planner')} type="button" className="pdl-btn-outline" style={{ height: '42px', minHeight: '42px', maxHeight: '42px', padding: '0 1rem', fontSize: '0.85rem', boxSizing: 'border-box', margin: 0, justifyContent: 'center', flex: '1 1 180px' }}>
                  <i className="bi bi-calculator-fill" style={{ marginRight: '0.35rem' }} /> Journey Cost Calculator
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="pdl-nav-tabs">
          {[
            ['overview', 'Overview & Technology'],
            ['treatments', 'Specialties & Packages'],
            ...(hasRealDoctors ? [['doctors', 'Senior Specialists']] : []),
            ['reviews', 'Top Google Ratings'],
            ['faqs', 'FAQs'],
          ].map(([tabKey, tabLabel]) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              className={`pdl-tab-btn${activeTab === tabKey ? ' active' : ''}`}
            >
              {tabLabel}
            </button>
          ))}
        </div>

        {/* MAIN LAYOUT GRID: LEFT PANELS + RIGHT CONNECT FORM */}
        <div className="pdl-main-grid">

          {/* LEFT MAIN PANELS */}
          <div>

            {/* 1. OVERVIEW & PORTFOLIO */}
            {(activeTab === 'overview' || activeTab === 'all') && (
              <div className="pdl-card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '1rem' }}>
                <h3 className="pdl-section-h3" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                  Infrastructure &amp; Portfolio Highlights
                </h3>
                <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.1rem' }}>
                  {cleanHospitalName} is a premier JCI/NABH accredited medical center in {hospital.city}, providing multi-specialty clinical excellence, advanced surgical suites, and end-to-end international patient concierge services.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <i className="bi bi-search" style={{ fontSize: '1.25rem', color: '#0066fe', marginBottom: '0.35rem', display: 'block' }} />
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a' }}>Advanced Diagnostics</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>PET-CT, 3T MRI, 128-Slice CT</span>
                  </div>

                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <i className="bi bi-activity" style={{ fontSize: '1.25rem', color: '#0066fe', marginBottom: '0.35rem', display: 'block' }} />
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a' }}>ICU &amp; Critical Care</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>24/7 Monitored Cardiac ICUs</span>
                  </div>

                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <i className="bi bi-globe" style={{ fontSize: '1.25rem', color: '#0066fe', marginBottom: '0.35rem', display: 'block' }} />
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a' }}>International Lounge</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Visa Invitation &amp; Translators</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TREATMENTS & PACKAGES */}
            {(activeTab === 'treatments' || activeTab === 'overview') && (
              <div className="pdl-card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '1rem' }}>
                <h3 className="pdl-section-h3" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                  Specialties &amp; Package Estimates
                </h3>
                <div className="pdl-treatment-grid">
                  {hospitalTreatments.map((t, idx) => (
                    <div key={idx} className="pdl-treatment-card">
                      <div>
                        <span className="pdl-badge-blue" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>{t.specialty || 'Specialty'}</span>
                        <h4 style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700, marginTop: '0.15rem', marginBottom: '0.3rem' }}>{t.title}</h4>
                        <p style={{ fontSize: '0.78rem', color: '#64748b' }}>In-patient package covering surgery, stay, and post-op care.</p>
                      </div>
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Starts from</span>
                          <strong style={{ fontSize: '0.95rem', color: '#0066fe' }}>{money(t.packageFrom)}</strong>
                        </div>
                        <a href="#connect-form" className="pdl-btn-enquire">
                          Enquire
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. SENIOR SPECIALISTS (ONLY RENDERED IF REAL DOCTORS EXIST IN DATABASE) */}
            {hasRealDoctors && (activeTab === 'doctors' || activeTab === 'overview') && (
              <div className="pdl-card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '1rem' }}>
                <h3 className="pdl-section-h3" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                  Senior Specialists at {cleanHospitalName}
                </h3>
                <div className="pdl-doctor-grid">
                  {hospitalDoctors.map((doc, idx) => (
                    <div key={idx} className="pdl-doctor-card">
                      <div className="pdl-doc-avatar" style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f0f7ff', color: '#0066fe', display: 'grid', placeItems: 'center', margin: '0 auto 0.5rem', fontSize: '1.35rem' }}>
                        <i className="bi bi-person-badge-fill" />
                      </div>
                      <h4 style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.15rem' }}>{doc.name}</h4>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: '#0066fe', fontWeight: 600, marginBottom: '0.35rem' }}>{doc.title}</span>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#64748b', marginBottom: '0.75rem' }}>
                        <span>{doc.exp}</span>
                        <span>•</span>
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>{doc.rating}</span>
                      </div>
                      <a href="#connect-form" className="pdl-btn-outline" style={{ width: '100%', padding: '0.4rem', fontSize: '0.78rem', textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                        Book Slot
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. TOP GOOGLE RATINGS */}
            {(activeTab === 'reviews' || activeTab === 'overview') && (
              <div className="pdl-card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 className="pdl-section-h3" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Top Google Ratings</h3>
                  <span className="pdl-badge-gold" style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <i className="bi bi-google" style={{ color: '#ea4335' }} /> 4.9 ★ Google Verified Score
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                  <blockquote style={{ margin: 0, padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '0.2rem', color: '#f59e0b', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                      <i className="bi bi-star-fill" /><i className="bi bi-star-fill" /><i className="bi bi-star-fill" /><i className="bi bi-star-fill" /><i className="bi bi-star-fill" />
                    </div>
                    <p style={{ fontStyle: 'italic', color: '#334155', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                      "The medical coordinator organized our doctor consultation, airport pickup, and hospital package smoothly. World-class treatment!"
                    </p>
                    <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0f172a' }}>Ahmed Al-Hassan</strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Saudi Arabia · Cardiac Patient</span>
                  </blockquote>

                  <blockquote style={{ margin: 0, padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '0.2rem', color: '#f59e0b', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                      <i className="bi bi-star-fill" /><i className="bi bi-star-fill" /><i className="bi bi-star-fill" /><i className="bi bi-star-fill" /><i className="bi bi-star-fill" />
                    </div>
                    <p style={{ fontStyle: 'italic', color: '#334155', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                      "From the initial opinion to post-operative recovery, everything was transparent and affordable. Highly recommend this partner hospital."
                    </p>
                    <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0f172a' }}>Grace Wanjiku</strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Kenya · Orthopedic Patient</span>
                  </blockquote>
                </div>
              </div>
            )}

            {/* 5. INTERACTIVE FAQS ACCORDION */}
            {(activeTab === 'faqs' || activeTab === 'overview') && (
              <div className="pdl-card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '1rem' }}>
                <h3 className="pdl-section-h3" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                  Frequently Asked Questions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {faqs.map((faq, i) => (
                    <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        type="button"
                        style={{ width: '100%', padding: '0.85rem 1rem', background: 'transparent', border: 'none', textAlign: 'left', fontWeight: 700, color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.88rem' }}
                      >
                        <span>{faq.q}</span>
                        <i className={`bi ${openFaq === i ? 'bi-chevron-up' : 'bi-chevron-down'}`} style={{ color: '#0066fe', fontSize: '0.8rem' }} />
                      </button>
                      {openFaq === i && (
                        <div style={{ padding: '0 1rem 0.85rem', color: '#475569', fontSize: '0.82rem', lineHeight: 1.5, borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem' }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT STICKY CONNECT FORM */}
          <div id="connect-form">
            <div className="pdl-form-card">
              <div style={{ marginBottom: '0.85rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.15rem' }}>Book Free Consultation</h3>
                <p style={{ color: '#64748b', fontSize: '0.78rem' }}>Doctor opinion &amp; starting quote within 2 hours</p>
              </div>

              {formSubmitted ? (
                <div style={{ padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', textAlign: 'center' }}>
                  <i className="bi bi-check-circle-fill" style={{ fontSize: '1.85rem', color: '#16a34a', marginBottom: '0.3rem', display: 'block' }} />
                  <h4 style={{ color: '#14532d', fontSize: '0.95rem', fontWeight: 700 }}>Request Received!</h4>
                  <p style={{ color: '#166534', fontSize: '0.78rem', marginTop: '0.15rem' }}>Our medical coordinator will call you back shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '0.15rem' }}>Patient Full Name *</label>
                    <input type="text" required placeholder="Enter full name" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} className="pdl-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '0.15rem' }}>Phone / WhatsApp Number *</label>
                    <input type="tel" required placeholder="+91 99999 99999" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} className="pdl-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '0.15rem' }}>Email Address</label>
                    <input type="email" placeholder="patient@example.com" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} className="pdl-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '0.15rem' }}>Medical Issue / Specialty</label>
                    <input type="text" placeholder="e.g. IVF, Knee replacement..." value={leadForm.treatment} onChange={(e) => setLeadForm({ ...leadForm, treatment: e.target.value })} className="pdl-input" />
                  </div>
                  <button type="submit" className="pdl-form-submit">
                    Request Callback &amp; Quote
                  </button>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', textAlign: 'center', display: 'block', marginTop: '0.15rem' }}>
                    <i className="bi bi-lock-fill" style={{ marginRight: '0.25rem' }} /> 100% Confidential &amp; Secure
                  </span>
                </form>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* ── REUSABLE FOOTER ── */}
      <Footer setPage={setPage} />

    </div>
  );
}
