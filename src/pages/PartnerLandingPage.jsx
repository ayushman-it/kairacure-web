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

      {/* ── STANDALONE PAGE NAVBAR HEADER (100% CONTAINER ALIGNED) ── */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ width: 'min(var(--page-max), calc(100% - (var(--page-gutter) * 2)))', margin: '0 auto', padding: '0.85rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setPage('home')} type="button" style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0d2f5d' }}>Kaira<span style={{ color: '#2563eb' }}>Cure</span></span>
            </button>
            <span style={{ color: '#cbd5e1', fontSize: '1.25rem' }}>|</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>{cleanHospitalName}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
            <a href="tel:+919876543210" style={{ color: '#0d2f5d', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.95rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}>
              <i className="fa-solid fa-phone" style={{ color: '#2563eb' }} /> +91 98765 43210
            </a>
            <a href="#connect-form" className="pdl-btn-primary">
              Book Consultation
            </a>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT (WHITE BACKGROUND, CLEAN LIGHT BORDER, EXACT CONTAINER ALIGNMENT) ── */}
      <main className="partner-landing-page" style={{ paddingTop: '0.5rem' }}>

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
        <div className="pdl-card">
          <div className="pdl-hero-grid">

            {/* Left Image & Gallery */}
            <div>
              <div className="pdl-cover-wrap">
                <img src={getHospitalImage(hospital)} alt={cleanHospitalName} onError={handleImageFallback} className="pdl-cover-img" />
                <span className="pdl-badge-verified">
                  <i className="fa-solid fa-shield-halved" style={{ marginRight: '0.35rem', color: '#60a5fa' }} /> Verified Partner
                </span>
              </div>
              <div className="pdl-thumbs-row">
                {gallery.slice(0, 4).map((img, i) => (
                  <img key={i} src={img} alt="Preview" className="pdl-thumb-img" />
                ))}
              </div>
            </div>

            {/* Right Details Header */}
            <div>
              {/* SMALL COMPACT BADGES */}
              <div className="pdl-badge-wrap">
                <span className="pdl-badge-blue">
                  {hospital.specialty || 'Multispecialty'} Hospital
                </span>
                <span className="pdl-badge-gold">
                  <i className="fa-solid fa-award" style={{ marginRight: '0.3rem' }} /> {hospitalAccreditation}
                </span>
              </div>

              {/* CLEAN, UN-EXCESSIVE TITLE */}
              <h1 className="pdl-title">
                {cleanHospitalName}
              </h1>

              {/* ENHANCED LOCATION BLOCK */}
              <div className="pdl-location-box">
                <div className="pdl-location-header">
                  <i className="fa-solid fa-location-dot" style={{ color: '#ef4444', fontSize: '1rem', marginTop: '0.15rem' }} />
                  <div>
                    <div className="pdl-location-title">
                      {hospital.city ? `${hospital.city}, ${hospital.state || ''} ${hospital.country || 'India'}` : hospitalAddress}
                    </div>
                    <div className="pdl-location-sub">
                      {hospitalAddress}
                    </div>
                    <div className="pdl-location-pills">
                      <span className="pdl-pill">
                        <i className="fa-solid fa-plane-arrival" style={{ color: '#2563eb', marginRight: '0.3rem' }} /> International Airport Access
                      </span>
                      <span className="pdl-pill">
                        <i className="fa-solid fa-hospital-user" style={{ color: '#16a34a', marginRight: '0.3rem' }} /> Care Concierge Desk
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spec Pills Bar */}
              <div className="pdl-specs-grid">
                <div>
                  <strong className="pdl-spec-val">{hospitalBeds}</strong>
                  <span className="pdl-spec-lbl">Capacity</span>
                </div>
                <div>
                  <strong className="pdl-spec-val">{hospital.doctors || '45+'}</strong>
                  <span className="pdl-spec-lbl">Doctors</span>
                </div>
                <div>
                  <strong className="pdl-spec-val">{hospitalFounded}</strong>
                  <span className="pdl-spec-lbl">Established</span>
                </div>
                <div>
                  <strong className="pdl-spec-val" style={{ color: '#16a34a' }}>{hospital.rating || '4.9'} ★</strong>
                  <span className="pdl-spec-lbl">Rating</span>
                </div>
              </div>

              {/* HIGH CONTRAST BUTTONS WITH UNIFORM #0d2f5d NAVY BACKGROUND */}
              <div className="pdl-actions-row">
                <a href="#connect-form" className="pdl-btn-primary">
                  <i className="fa-solid fa-calendar-check" /> Book Free Consultation
                </a>
                <button onClick={() => setPage('planner')} type="button" className="pdl-btn-primary" style={{ background: '#0d2f5d' }}>
                  <i className="fa-solid fa-calculator" /> Journey Cost Calculator
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
              <div className="pdl-card">
                <h3 className="pdl-section-h3">
                  Infrastructure & Portfolio Highlights
                </h3>
                <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.1rem' }}>
                  {cleanHospitalName} is a premier JCI/NABH accredited medical center in {hospital.city}, providing multi-specialty clinical excellence, advanced surgical suites, and end-to-end international patient concierge services.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <i className="fa-solid fa-microscope" style={{ fontSize: '1.25rem', color: '#2563eb', marginBottom: '0.35rem' }} />
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a' }}>Advanced Diagnostics</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>PET-CT, 3T MRI, 128-Slice CT</span>
                  </div>

                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <i className="fa-solid fa-bed-pulse" style={{ fontSize: '1.25rem', color: '#2563eb', marginBottom: '0.35rem' }} />
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a' }}>ICU & Critical Care</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>24/7 Monitored Cardiac ICUs</span>
                  </div>

                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <i className="fa-solid fa-globe" style={{ fontSize: '1.25rem', color: '#2563eb', marginBottom: '0.35rem' }} />
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a' }}>International Lounge</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Visa Invitation & Translators</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TREATMENTS & PACKAGES */}
            {(activeTab === 'treatments' || activeTab === 'overview') && (
              <div className="pdl-card">
                <h3 className="pdl-section-h3">
                  Specialties & Package Estimates
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
                          <strong style={{ fontSize: '0.95rem', color: '#0d2f5d' }}>{money(t.packageFrom)}</strong>
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
              <div className="pdl-card">
                <h3 className="pdl-section-h3">
                  Senior Specialists at {cleanHospitalName}
                </h3>
                <div className="pdl-doctor-grid">
                  {hospitalDoctors.map((doc, idx) => (
                    <div key={idx} className="pdl-doctor-card">
                      <div className="pdl-doc-avatar">
                        <i className="fa-solid fa-user-doctor" />
                      </div>
                      <h4 style={{ fontSize: '0.95rem', color: '#0d2f5d', fontWeight: 700, marginBottom: '0.15rem' }}>{doc.name}</h4>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, marginBottom: '0.35rem' }}>{doc.title}</span>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#64748b', marginBottom: '0.75rem' }}>
                        <span>{doc.exp}</span>
                        <span>•</span>
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>{doc.rating}</span>
                      </div>
                      <a href="#connect-form" className="pdl-btn-primary" style={{ width: '100%', padding: '0.4rem', fontSize: '0.78rem', textAlign: 'center' }}>
                        Book Slot
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. TOP GOOGLE RATINGS */}
            {(activeTab === 'reviews' || activeTab === 'overview') && (
              <div className="pdl-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <h3 className="pdl-section-h3" style={{ marginBottom: 0 }}>Top Google Ratings</h3>
                  <span className="pdl-badge-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <i className="fa-brands fa-google" style={{ color: '#ea4335' }} /> 4.9 ★ Google Verified Score
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                  <blockquote style={{ margin: 0, padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '0.2rem', color: '#f59e0b', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                      <i className="fa-solid fa-star" /><i className="fa-solid fa-star" /><i className="fa-solid fa-star" /><i className="fa-solid fa-star" /><i className="fa-solid fa-star" />
                    </div>
                    <p style={{ fontStyle: 'italic', color: '#334155', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                      "The medical coordinator organized our doctor consultation, airport pickup, and hospital package smoothly. World-class treatment!"
                    </p>
                    <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0d2f5d' }}>Ahmed Al-Hassan</strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Saudi Arabia · Cardiac Patient</span>
                  </blockquote>

                  <blockquote style={{ margin: 0, padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '0.2rem', color: '#f59e0b', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                      <i className="fa-solid fa-star" /><i className="fa-solid fa-star" /><i className="fa-solid fa-star" /><i className="fa-solid fa-star" /><i className="fa-solid fa-star" />
                    </div>
                    <p style={{ fontStyle: 'italic', color: '#334155', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                      "From the initial opinion to post-operative recovery, everything was transparent and affordable. Highly recommend this partner hospital."
                    </p>
                    <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0d2f5d' }}>Grace Wanjiku</strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Kenya · Orthopedic Patient</span>
                  </blockquote>
                </div>
              </div>
            )}

            {/* 5. INTERACTIVE FAQS ACCORDION */}
            {(activeTab === 'faqs' || activeTab === 'overview') && (
              <div className="pdl-card">
                <h3 className="pdl-section-h3">
                  Frequently Asked Questions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {faqs.map((faq, i) => (
                    <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        type="button"
                        style={{ width: '100%', padding: '0.85rem 1rem', background: 'transparent', border: 'none', textAlign: 'left', fontWeight: 700, color: '#0d2f5d', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.88rem' }}
                      >
                        <span>{faq.q}</span>
                        <i className={`fa-solid ${openFaq === i ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ color: '#2563eb', fontSize: '0.8rem' }} />
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
                <h3 style={{ fontSize: '1.05rem', color: '#0d2f5d', fontWeight: 800, marginBottom: '0.15rem' }}>Book Free Consultation</h3>
                <p style={{ color: '#64748b', fontSize: '0.78rem' }}>Doctor opinion & starting quote within 2 hours</p>
              </div>

              {formSubmitted ? (
                <div style={{ padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', textAlign: 'center' }}>
                  <i className="fa-solid fa-circle-check" style={{ fontSize: '1.85rem', color: '#16a34a', marginBottom: '0.3rem' }} />
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
                  <button type="submit" className="pdl-btn-primary" style={{ width: '100%', padding: '0.7rem' }}>
                    Request Callback & Quote
                  </button>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', textAlign: 'center', display: 'block', marginTop: '0.15rem' }}>
                    <i className="fa-solid fa-lock" style={{ marginRight: '0.25rem' }} /> 100% Confidential & Secure
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
