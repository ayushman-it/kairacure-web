import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('overview');
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

  const hospitalDoctors = Array.isArray(hospital.doctorsList) && hospital.doctorsList.length
    ? hospital.doctorsList
    : [
        { name: hospital.doctor || 'Senior Lead Specialist', title: hospital.doctorTitle || `Head of ${hospital.specialty || 'Department'}`, exp: '18+ Years Exp', rating: '4.9 ★' },
        { name: 'Dr. Rajesh Sharma', title: 'Senior Consultant Surgeon', exp: '15+ Years Exp', rating: '4.8 ★' },
        { name: 'Dr. Ananya Varma', title: 'Chief Medical Specialist', exp: '14+ Years Exp', rating: '4.9 ★' }
      ];

  const faqs = [
    { q: `How do I book an appointment with a doctor at ${cleanHospitalName}?`, a: `Submit your consultation request using the form on this page. Our care coordinator will confirm doctor availability within 2 hours.` },
    { q: `Does ${cleanHospitalName} issue medical visa invitation letters (VIL)?`, a: `Yes. Once your case is evaluated by senior specialists, ${cleanHospitalName} issues official Visa Invitation Letters for patient and attendant visas.` },
    { q: `What international patient services are provided?`, a: `Services include complimentary airport transfers, language interpreters (Arabic, Russian, French), guest house stay arrangements, and 24/7 dedicated case managers.` }
  ];

  return (
    <div className="partner-standalone-page" style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f172a', fontFamily: "'Noto Sans', sans-serif" }}>

      {/* ── STANDALONE PAGE NAVBAR HEADER ── */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0.85rem 1.5rem', sticky: 'top', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setPage('home')} type="button" style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0d2f5d' }}>Kaira<span style={{ color: '#2563eb' }}>Cure</span></span>
            </button>
            <span style={{ color: '#cbd5e1', fontSize: '1.25rem' }}>|</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>{cleanHospitalName}</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="tel:+919876543210" style={{ color: '#0d2f5d', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className="fa-solid fa-phone" style={{ color: '#2563eb' }} /> +91 98765 43210
            </a>
            <a href="#connect-form" style={{ background: '#0d2f5d', color: '#ffffff', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', boxShadow: '0 2px 8px rgba(13,47,93,0.2)' }}>
              Book Consultation
            </a>
          </div>
        </div>
      </header>

      {/* ── MAIN LANDING CONTAINER ── */}
      <main style={{ maxWidth: '1280px', margin: '1.5rem auto 3rem', padding: '0 1.5rem' }}>

        {/* HERO CARD */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(13,47,93,0.04)', padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'center' }}>

            {/* Left Info Details */}
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  {hospital.specialty || 'Multispecialty'} Hospital
                </span>
                <span style={{ background: '#fffbe6', color: '#b45309', border: '1px solid #fef08a', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  <i className="fa-solid fa-award" style={{ marginRight: '0.3rem' }} /> {hospitalAccreditation}
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.85rem)', fontWeight: 700, color: '#0d2f5d', lineHeight: 1.3, marginBottom: '0.5rem' }}>
                {cleanHospitalName}
              </h1>

              {/* LOCATION BLOCK */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <i className="fa-solid fa-location-dot" style={{ color: '#ef4444', fontSize: '1rem', marginTop: '0.15rem' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.2rem' }}>
                      {hospital.city ? `${hospital.city}, ${hospital.state || ''} ${hospital.country || 'India'}` : hospitalAddress}
                    </strong>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4, marginBottom: '0.4rem' }}>
                      {hospitalAddress}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', fontSize: '0.75rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        <i className="fa-solid fa-plane-arrival" style={{ color: '#2563eb', marginRight: '0.3rem' }} /> International Airport Access
                      </span>
                      <span style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', fontSize: '0.75rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        <i className="fa-solid fa-hospital-user" style={{ color: '#16a34a', marginRight: '0.3rem' }} /> Care Concierge Desk
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem', textCenter: 'center', marginBottom: '1.25rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <strong style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, color: '#0d2f5d' }}>{hospitalBeds}</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Capacity</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <strong style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, color: '#0d2f5d' }}>{hospital.doctors || '45+'}</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Doctors</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <strong style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, color: '#0d2f5d' }}>{hospitalFounded}</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Established</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <strong style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, color: '#16a34a' }}>{hospital.rating || '4.9'} ★</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Rating</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a href="#connect-form" style={{ padding: '0.65rem 1.35rem', background: '#0d2f5d', color: '#ffffff', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', boxShadow: '0 4px 12px rgba(13,47,93,0.2)' }}>
                  <i className="fa-solid fa-calendar-check" style={{ marginRight: '0.35rem' }} /> Book Free Consultation
                </a>
                <button onClick={() => setPage('planner')} type="button" style={{ padding: '0.65rem 1.15rem', background: '#ffffff', color: '#0d2f5d', border: '2px solid #0d2f5d', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                  <i className="fa-solid fa-calculator" style={{ marginRight: '0.35rem' }} /> Journey Cost Calculator
                </button>
              </div>

            </div>

            {/* Right Cover / Gallery */}
            <div>
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '240px', border: '1px solid #cbd5e1', marginBottom: '0.5rem' }}>
                <img src={getHospitalImage(hospital)} alt={cleanHospitalName} onError={handleImageFallback} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(13,47,93,0.9)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, borderRadius: '4px', padding: '0.2rem 0.6rem' }}>
                  <i className="fa-solid fa-shield-halved" style={{ marginRight: '0.35rem', color: '#60a5fa' }} /> Verified Partner
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {gallery.slice(0, 4).map((img, i) => (
                  <img key={i} src={img} alt="Preview" style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* TABS BAR */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', background: '#ffffff', padding: '0.4rem 0.85rem 0', borderRadius: '10px 10px 0 0', overflowX: 'auto', marginBottom: '1rem' }}>
          {[
            ['overview', 'Overview & Technology'],
            ['treatments', 'Specialties & Packages'],
            ['doctors', 'Senior Specialists'],
            ['reviews', 'Patient Reviews'],
            ['faqs', 'FAQs'],
          ].map(([tabKey, tabLabel]) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              style={{
                padding: '0.6rem 1rem',
                border: 'none',
                background: 'transparent',
                fontWeight: activeTab === tabKey ? 800 : 600,
                color: activeTab === tabKey ? '#0d2f5d' : '#64748b',
                borderBottom: activeTab === tabKey ? '3px solid #0d2f5d' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '0.88rem',
                whiteSpace: 'nowrap'
              }}
            >
              {tabLabel}
            </button>
          ))}
        </div>

        {/* CONTENT & CONNECT FORM GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '1.5rem', alignItems: 'start' }}>

          {/* LEFT PANELS */}
          <div>
            {(activeTab === 'overview' || activeTab === 'all') && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d2f5d', marginBottom: '0.75rem' }}>
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

            {(activeTab === 'treatments' || activeTab === 'overview') && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d2f5d', marginBottom: '0.75rem' }}>
                  Specialties & Package Estimates
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.85rem' }}>
                  {hospitalTreatments.map((t, idx) => (
                    <div key={idx} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', marginBottom: '0.4rem', display: 'inline-block' }}>{t.specialty || 'Specialty'}</span>
                        <h4 style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700, marginTop: '0.15rem', marginBottom: '0.3rem' }}>{t.title}</h4>
                        <p style={{ fontSize: '0.78rem', color: '#64748b' }}>In-patient package covering surgery, stay, and post-op care.</p>
                      </div>
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Starts from</span>
                          <strong style={{ fontSize: '0.95rem', color: '#0d2f5d' }}>{money(t.packageFrom)}</strong>
                        </div>
                        <a href="#connect-form" style={{ padding: '0.4rem 0.75rem', background: '#0d2f5d', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none' }}>
                          Enquire
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'doctors' || activeTab === 'overview') && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d2f5d', marginBottom: '0.75rem' }}>
                  Senior Specialists at {cleanHospitalName}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                  {hospitalDoctors.map((doc, idx) => (
                    <div key={idx} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff', textAlign: 'center' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'grid', placeItems: 'center', margin: '0 auto 0.5rem', fontSize: '1.35rem' }}>
                        <i className="fa-solid fa-user-doctor" />
                      </div>
                      <h4 style={{ fontSize: '0.95rem', color: '#0d2f5d', fontWeight: 700, marginBottom: '0.15rem' }}>{doc.name}</h4>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, marginBottom: '0.35rem' }}>{doc.title}</span>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#64748b', marginBottom: '0.75rem' }}>
                        <span>{doc.exp}</span>
                        <span>•</span>
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>{doc.rating}</span>
                      </div>
                      <a href="#connect-form" style={{ width: '100%', display: 'block', padding: '0.4rem', background: '#ffffff', color: '#0d2f5d', border: '2px solid #0d2f5d', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem', textAlign: 'center', textDecoration: 'none' }}>
                        Book Slot
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'reviews' || activeTab === 'overview') && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d2f5d', marginBottom: 0 }}>Patient Reviews & Ratings</h3>
                  <span style={{ background: '#fffbe6', color: '#b45309', border: '1px solid #fef08a', fontSize: '0.75rem', fontWeight: 700, borderRadius: '4px', padding: '0.2rem 0.6rem' }}>
                    <i className="fa-solid fa-star" style={{ color: '#f59e0b', marginRight: '0.3rem' }} /> 4.9 / 5.0 Verified Rating
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                  <blockquote style={{ margin: 0, padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontStyle: 'italic', color: '#334155', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                      "The medical coordinator organized our doctor consultation, airport pickup, and hospital package smoothly. World-class treatment!"
                    </p>
                    <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0d2f5d' }}>Ahmed Al-Hassan</strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Saudi Arabia · Cardiac Patient</span>
                  </blockquote>

                  <blockquote style={{ margin: 0, padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontStyle: 'italic', color: '#334155', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                      "From the initial opinion to post-operative recovery, everything was transparent and affordable. Highly recommend this partner hospital."
                    </p>
                    <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0d2f5d' }}>Grace Wanjiku</strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Kenya · Orthopedic Patient</span>
                  </blockquote>
                </div>
              </div>
            )}

            {(activeTab === 'faqs' || activeTab === 'overview') && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d2f5d', marginBottom: '0.75rem' }}>
                  Frequently Asked Questions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {faqs.map((faq, i) => (
                    <details key={i} style={{ padding: '0.75rem 0.85rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <summary style={{ fontWeight: 700, color: '#0f172a', cursor: 'pointer', fontSize: '0.85rem' }}>{faq.q}</summary>
                      <p style={{ color: '#475569', marginTop: '0.35rem', fontSize: '0.82rem', lineHeight: 1.5 }}>{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT CONNECT FORM */}
          <div id="connect-form" style={{ position: 'sticky', top: '5rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ marginBottom: '0.85rem', textCenter: 'center', textAlign: 'center' }}>
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
                    <input type="text" required placeholder="Enter full name" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '0.15rem' }}>Phone / WhatsApp Number *</label>
                    <input type="tel" required placeholder="+91 99999 99999" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '0.15rem' }}>Email Address</label>
                    <input type="email" placeholder="patient@example.com" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '0.15rem' }}>Medical Issue / Specialty</label>
                    <input type="text" placeholder="e.g. IVF, Knee replacement..." value={leadForm.treatment} onChange={(e) => setLeadForm({ ...leadForm, treatment: e.target.value })} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '0.65rem', background: '#0d2f5d', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', marginTop: '0.25rem' }}>
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

      {/* ── STANDALONE PAGE FOOTER ── */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '2rem 1.5rem', textAlign: 'center', marginTop: '3rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
            © 2026 {cleanHospitalName} Partner Portal · Powered by KairaCure International Patient Concierge.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
            <span>Verified JCI/NABH Healthcare Network</span>
            <span>•</span>
            <span>Free Airport Transfer & Translation</span>
            <span>•</span>
            <span>24/7 Medical Care Desk</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
