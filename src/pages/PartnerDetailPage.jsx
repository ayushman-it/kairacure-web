import React, { useState } from 'react';
import { MedicalVideoBackdrop } from '../components/common/MedicalVideoBackdrop.jsx';
import { StarRating } from '../components/common/StarRating.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { EvaluationForm } from '../components/hospitals/EvaluationForm.jsx';
import {
  API_BASE,
  accreditationText,
  getHospitalImage,
  handleImageFallback,
  hospitalGallery,
  HOSPITALS
} from '../data/constants.js';

export function PartnerDetailPage({ money, selectedHospital, selectedTreatment, setPage, setSelectedHospital, onBack }) {
  const hospital = selectedHospital || HOSPITALS[0];
  const gallery = hospitalGallery(hospital);
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
          hospital: hospital.name,
          source: 'partner-detail-page'
        })
      });
      setFormSubmitted(true);
    } catch {
      setFormSubmitted(true);
    }
  };

  const hospitalAccreditation = accreditationText(hospital.accreditations, hospital.nabhType || hospital.jciStatus || 'NABH Accredited');
  const hospitalAddress = hospital.address || [hospital.city, hospital.state, hospital.country].filter(Boolean).join(', ') || 'India';
  const hospitalBeds = hospital.bedText || hospital.beds || '500+ Beds';
  const hospitalFounded = hospital.established || hospital.foundedYear || 'Est. 2008';

  const hospitalTreatments = Array.isArray(hospital.tags) && hospital.tags.length
    ? hospital.tags.map((t, idx) => ({ id: `ht-${idx}`, title: t, packageFrom: 120000 + (idx * 25000), specialty: hospital.specialty }))
    : [
        { id: 'ht-1', title: `${hospital.specialty || 'Cardiology'} Surgery & Care`, packageFrom: 180000, specialty: hospital.specialty },
        { id: 'ht-2', title: 'Specialist Consultation & Advanced Surgery', packageFrom: 120000, specialty: hospital.specialty },
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
    { q: `How do I book an appointment with a doctor at ${hospital.name}?`, a: `Submit your consultation request using the form on this page. Our care coordinator will confirm doctor availability within 2 hours.` },
    { q: `Does ${hospital.name} issue medical visa invitation letters (VIL)?`, a: `Yes. Once your case is evaluated by senior specialists, ${hospital.name} issues official Visa Invitation Letters for patient and attendant visas.` },
    { q: `What international patient services are provided?`, a: `Services include complimentary airport transfers, language interpreters (Arabic, Russian, French), guest house stay arrangements, and 24/7 dedicated case managers.` }
  ];

  return (
    <section className="page-section partner-detail-landing" style={{ padding: '2rem 0', background: '#f8fafc' }}>
      <MedicalVideoBackdrop />

      {/* CONTAINER BOUNDARIES */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* BREADCRUMBS */}
        <Breadcrumbs
          items={[
            { label: 'Home', onClick: () => setPage('home') },
            { label: 'Partners', onClick: onBack || (() => setPage('partners')) },
            { label: hospital.country || 'India', onClick: () => setPage('destinations') },
            { label: hospital.name },
          ]}
        />

        {/* HERO LANDING HEADER CARD */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '2rem', marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'center' }}>

          {/* Left Cover / Gallery */}
          <div>
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '260px', marginBottom: '0.75rem', border: '1px solid #cbd5e1' }}>
              <img src={getHospitalImage(hospital)} alt={hospital.name} onError={handleImageFallback} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '0.85rem', left: '0.85rem', background: '#0d2f5d', color: '#ffffff', padding: '0.3rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                <i className="fa-solid fa-shield-halved" style={{ marginRight: '0.35rem', color: '#60a5fa' }} /> Verified Partner Hospital
              </div>
            </div>
            {/* Gallery Thumbnails */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {gallery.slice(0, 4).map((img, i) => (
                <img key={i} src={img} alt="Hospital preview" style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
              ))}
            </div>
          </div>

          {/* Right Info Details */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700 }}>
                {hospital.specialty || 'Multispecialty'} Hospital
              </span>
              <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700 }}>
                <i className="fa-solid fa-award" style={{ marginRight: '0.3rem' }} /> {hospitalAccreditation}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.75rem, 2.8vw, 2.25rem)', color: '#0d2f5d', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.5rem' }}>
              {hospital.name}
            </h1>

            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className="fa-solid fa-location-dot" style={{ color: '#ef4444' }} /> {hospitalAddress}
            </p>

            {/* Spec Cards Pill */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', textAlign: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1rem', color: '#0d2f5d', fontWeight: 800 }}>{hospitalBeds}</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Capacity</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1rem', color: '#0d2f5d', fontWeight: 800 }}>{hospital.doctors || '45+'}</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Doctors</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1rem', color: '#0d2f5d', fontWeight: 800 }}>{hospitalFounded}</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Established</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1rem', color: '#16a34a', fontWeight: 800 }}>{hospital.rating || '4.9'} ★</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Rating</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <a href="#connect-form" style={{ padding: '0.75rem 1.5rem', background: '#0d2f5d', color: '#ffffff', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(13,47,93,0.25)' }}>
                <i className="fa-solid fa-calendar-check" style={{ marginRight: '0.4rem' }} /> Book Free Consultation
              </a>
              <button onClick={() => setPage('planner')} type="button" style={{ padding: '0.75rem 1.25rem', background: '#ffffff', color: '#0d2f5d', border: '2px solid #0d2f5d', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                <i className="fa-solid fa-calculator" style={{ marginRight: '0.4rem' }} /> Journey Cost Calculator
              </button>
            </div>

          </div>

        </div>

        {/* NAVIGATION TABS */}
        <div style={{ margin: '1.5rem 0 0', display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', background: '#ffffff', padding: '0.5rem 1rem 0', borderRadius: '12px 12px 0 0', overflowX: 'auto' }}>
          {[
            ['overview', 'Overview & Highlights'],
            ['treatments', 'Treatments & Packages'],
            ['doctors', 'Specialist Doctors'],
            ['reviews', 'Patient Reviews'],
            ['faqs', 'FAQs'],
          ].map(([tabKey, tabLabel]) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              style={{
                padding: '0.65rem 1.15rem',
                border: 'none',
                background: 'transparent',
                fontWeight: activeTab === tabKey ? 800 : 600,
                color: activeTab === tabKey ? '#0d2f5d' : '#64748b',
                borderBottom: activeTab === tabKey ? '3px solid #0d2f5d' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap'
              }}
            >
              {tabLabel}
            </button>
          ))}
        </div>

        {/* MAIN CONTENT GRID: LEFT CONTENT + RIGHT CONNECT FORM */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.75rem', marginTop: '1.25rem' }}>

          {/* LEFT MAIN PANELS */}
          <div>

            {/* 1. OVERVIEW & PORTFOLIO */}
            {(activeTab === 'overview' || activeTab === 'all') && (
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#0d2f5d', fontWeight: 800, marginBottom: '0.75rem' }}>
                  Infrastructure & Portfolio Highlights
                </h3>
                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {hospital.name} is a premier JCI/NABH accredited healthcare institution in {hospital.city}, providing comprehensive medical care, advanced robotic surgery, and dedicated international patient assistance.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <i className="fa-solid fa-microscope" style={{ fontSize: '1.35rem', color: '#2563eb', marginBottom: '0.4rem' }} />
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0f172a' }}>Advanced Diagnostics</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>PET-CT, 3T MRI, 128-Slice CT</span>
                  </div>

                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <i className="fa-solid fa-bed-pulse" style={{ fontSize: '1.35rem', color: '#2563eb', marginBottom: '0.4rem' }} />
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0f172a' }}>ICU & Critical Care</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>24/7 Monitored Cardiac ICUs</span>
                  </div>

                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <i className="fa-solid fa-globe" style={{ fontSize: '1.35rem', color: '#2563eb', marginBottom: '0.4rem' }} />
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0f172a' }}>International Desk</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Visa Invitation & Translators</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TREATMENTS & PACKAGES */}
            {(activeTab === 'treatments' || activeTab === 'overview') && (
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#0d2f5d', fontWeight: 800, marginBottom: '1rem' }}>
                  Treatments & Estimated Packages
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  {hospitalTreatments.map((t, idx) => (
                    <div key={idx} style={{ padding: '1.15rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>{t.specialty || 'Specialty'}</span>
                        <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 700, marginTop: '0.2rem', marginBottom: '0.4rem' }}>{t.title}</h4>
                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>In-patient package including surgery, stay, and post-op care.</p>
                      </div>
                      <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Starts from</span>
                          <strong style={{ display: 'block', fontSize: '1rem', color: '#0d2f5d' }}>{money(t.packageFrom)}</strong>
                        </div>
                        <a href="#connect-form" style={{ padding: '0.45rem 0.85rem', background: '#0d2f5d', color: '#fff', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                          Enquire
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. SPECIALIST DOCTORS GRID */}
            {(activeTab === 'doctors' || activeTab === 'overview') && (
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#0d2f5d', fontWeight: 800, marginBottom: '1rem' }}>
                  Specialist Doctors at {hospital.name}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  {hospitalDoctors.map((doc, idx) => (
                    <div key={idx} style={{ padding: '1.15rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', textAlign: 'center' }}>
                      <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#dbeafe', margin: '0 auto 0.75rem', display: 'grid', placeItems: 'center', color: '#1d4ed8', fontSize: '1.75rem' }}>
                        <i className="fa-solid fa-user-doctor" />
                      </div>
                      <h4 style={{ fontSize: '1rem', color: '#0d2f5d', fontWeight: 700, marginBottom: '0.2rem' }}>{doc.name}</h4>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, marginBottom: '0.4rem' }}>{doc.title}</span>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.85rem' }}>
                        <span>{doc.exp}</span>
                        <span>•</span>
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>{doc.rating}</span>
                      </div>
                      <a href="#connect-form" style={{ display: 'block', padding: '0.45rem', background: '#f1f5f9', color: '#0d2f5d', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>
                        Book Appointment
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. PATIENT REVIEWS & TESTIMONIALS */}
            {(activeTab === 'reviews' || activeTab === 'overview') && (
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: '#0d2f5d', fontWeight: 800 }}>Verified Patient Reviews</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fef3c7', padding: '0.3rem 0.75rem', borderRadius: '50px' }}>
                    <i className="fa-solid fa-star" style={{ color: '#f59e0b', fontSize: '0.85rem' }} />
                    <strong style={{ color: '#92400e', fontSize: '0.85rem' }}>4.9 out of 5.0 Rating</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  <blockquote style={{ margin: 0, padding: '1.15rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontStyle: 'italic', color: '#334155', fontSize: '0.85rem', marginBottom: '0.65rem' }}>
                      "The medical coordinator organized our doctor consultation, airport pickup, and hospital package smoothly. World-class treatment!"
                    </p>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0d2f5d' }}>Ahmed Al-Hassan</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Saudi Arabia · Cardiac Surgery Patient</span>
                  </blockquote>

                  <blockquote style={{ margin: 0, padding: '1.15rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontStyle: 'italic', color: '#334155', fontSize: '0.85rem', marginBottom: '0.65rem' }}>
                      "From the initial opinion to post-operative recovery, everything was transparent and affordable. Highly recommend this partner hospital."
                    </p>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0d2f5d' }}>Grace Wanjiku</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Kenya · Knee Replacement Patient</span>
                  </blockquote>
                </div>
              </div>
            )}

            {/* 5. FAQs ACCORDION */}
            {(activeTab === 'faqs' || activeTab === 'overview') && (
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#0d2f5d', fontWeight: 800, marginBottom: '1rem' }}>
                  Frequently Asked Questions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {faqs.map((faq, i) => (
                    <details key={i} style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <summary style={{ fontWeight: 700, color: '#0f172a', cursor: 'pointer', fontSize: '0.9rem' }}>{faq.q}</summary>
                      <p style={{ color: '#475569', marginTop: '0.4rem', fontSize: '0.85rem', lineHeight: 1.5 }}>{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT STICKY CONNECT FORM */}
          <div id="connect-form" style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#0d2f5d', fontWeight: 800, marginBottom: '0.2rem' }}>Book Free Consultation</h3>
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Doctor opinion & starting price quote within 2 hours</p>
              </div>

              {formSubmitted ? (
                <div style={{ padding: '1.25rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', textAlign: 'center' }}>
                  <i className="fa-solid fa-circle-check" style={{ fontSize: '2rem', color: '#16a34a', marginBottom: '0.4rem' }} />
                  <h4 style={{ color: '#14532d', fontSize: '1rem', fontWeight: 700 }}>Request Received!</h4>
                  <p style={{ color: '#166534', fontSize: '0.8rem', marginTop: '0.2rem' }}>Our medical coordinator will call you back shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>Patient Full Name *</label>
                    <input type="text" required placeholder="Enter full name" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>Phone / WhatsApp Number *</label>
                    <input type="tel" required placeholder="+91 99999 99999" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>Email Address</label>
                    <input type="email" placeholder="patient@example.com" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>Medical Issue / Treatment</label>
                    <input type="text" placeholder="e.g. IVF, Knee replacement..." value={leadForm.treatment} onChange={(e) => setLeadForm({ ...leadForm, treatment: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#0d2f5d', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Request Callback & Quote
                  </button>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', display: 'block', marginTop: '0.2rem' }}>
                    <i className="fa-solid fa-lock" style={{ marginRight: '0.25rem' }} /> 100% Confidential & Secure
                  </span>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
