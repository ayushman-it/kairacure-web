import React, { useState } from 'react';
import { API_BASE } from '../data/constants.js';

const MEDICAL_SPECIALTIES = [
  'Cardiology & Heart Surgery',
  'Oncology & Cancer Care',
  'Orthopedics & Joint Replacement',
  'Organ Transplant (Liver & Kidney)',
  'Neurosurgery & Spine Care',
  'IVF & Fertility Treatment',
  'Gastroenterology & Urology',
  'Multispecialty Healthcare'
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

export function HospitalPartnerLandingPage({ onBackToDetails, selectedHospital, isEmbedded = false }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '', specialty: 'Cardiology & Heart Surgery' });
  const [formStatus, setFormStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('Submitting partnership application...');
    try {
      await fetch(`${API_BASE}/admin/partner-inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hospitalInterest: selectedHospital?.name || 'KairaCure Partner Network',
          type: 'Hospital Partner Referral Program',
          timestamp: new Date().toISOString()
        })
      });
      setFormStatus('Partnership application submitted! Our KairaCure hospital alliance team will contact you within 24 hours.');
      setFormData({ name: '', email: '', phone: '', message: '', specialty: 'Cardiology & Heart Surgery' });
    } catch {
      setFormStatus('Thank you for your interest! Our alliance team will reach out to you shortly.');
    }
  };

  return (
    <div className="hpl-wrap" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '40px', fontFamily: "'Noto Sans', sans-serif" }}>
      <style>{`
        .hpl-hero-v2 {
          background: linear-gradient(135deg, #0d2f5d 0%, #0046b8 100%);
          color: #ffffff;
          padding: 44px 16px 50px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .hpl-container-v2 {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .hpl-form-card-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 28px;
          align-items: center;
        }
        @media (max-width: 768px) {
          .hpl-hero-v2 {
            padding: 30px 14px 36px;
          }
          .hpl-form-card-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            padding: 20px 14px !important;
          }
        }
        .hpl-card-v2 {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px 16px;
          box-shadow: 0 2px 10px rgba(0, 102, 254, 0.04);
          transition: all 0.2s ease;
        }
        .hpl-card-v2:hover {
          border-color: #0d2f5d;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0, 102, 254, 0.1);
        }
        .hpl-btn-primary-v2 {
          background: #0d2f5d !important;
          color: #ffffff !important;
          padding: 8px 18px !important;
          border-radius: 8px !important;
          font-weight: 700 !important;
          font-size: 0.82rem !important;
          text-decoration: none !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          box-shadow: 0 3px 10px rgba(0, 102, 254, 0.25) !important;
          border: none !important;
          cursor: pointer !important;
          height: 38px !important;
          transition: all 0.2s ease !important;
        }
        .hpl-btn-primary-v2:hover {
          background: #0052cc !important;
        }
        .hpl-btn-outline-v2 {
          background: rgba(255, 255, 255, 0.12) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
          padding: 8px 18px !important;
          border-radius: 8px !important;
          font-weight: 700 !important;
          font-size: 0.82rem !important;
          text-decoration: none !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          height: 38px !important;
          transition: all 0.2s ease !important;
        }
        .hpl-btn-outline-v2:hover {
          background: rgba(255, 255, 255, 0.25) !important;
          border-color: #ffffff !important;
        }
      `}</style>

      {/* ── HERO HEADER ── */}
      <section className="hpl-hero-v2">
        {!isEmbedded && onBackToDetails && (
          <button 
            onClick={onBackToDetails} 
            type="button" 
            style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <i className="bi bi-arrow-left" /> Back to Partners
          </button>
        )}

        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <span 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}
          >
            <i className="bi bi-hospital-fill" /> KAIRACURE GLOBAL HOSPITAL ALLIANCE PROGRAM
          </span>

          <h1 style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.2rem)', fontWeight: 800, lineHeight: 1.25, marginBottom: '12px', letterSpacing: '-0.01em' }}>
            Empower Your Hospital with Verified International Patient Referrals
          </h1>

          <p style={{ fontSize: '0.85rem', color: '#e0f2fe', maxWidth: '680px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            Join KairaCure&apos;s accredited medical partner network. Receive pre-screened patient cases, streamlined report transfers, and end-to-end travel assistance for international patients.
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '22px' }}>
            <a href="#hpl-form" className="hpl-btn-primary-v2" style={{ background: '#ffffff', color: '#0d2f5d' }}>
              <i className="bi bi-person-plus-fill" />
              <span>Become a Partner Hospital</span>
            </a>
            <a href="#hpl-benefits" className="hpl-btn-outline-v2">
              <i className="bi bi-shield-check" />
              <span>Explore Partnership Benefits</span>
            </a>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.78rem', color: '#dbeafe', fontWeight: 600 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><i className="bi bi-check2-circle" /> Zero Setup Fee</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><i className="bi bi-check2-circle" /> 100% Pre-Screened Case Intake</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><i className="bi bi-check2-circle" /> 24/7 Care Desk Coordination</span>
          </div>
        </div>
      </section>

      {/* ── 4 METRICS BAR ── */}
      <section style={{ padding: '20px 16px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="hpl-container-v2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', textAlign: 'center' }}>
          <div className="hpl-card-v2" style={{ padding: '14px' }}>
            <strong style={{ display: 'block', fontSize: '1.5rem', color: '#0d2f5d', fontWeight: 800, marginBottom: '2px' }}>120+</strong>
            <span style={{ color: '#475569', fontSize: '0.78rem', fontWeight: 600 }}>Partner Hospitals Enrolled</span>
          </div>
          <div className="hpl-card-v2" style={{ padding: '14px' }}>
            <strong style={{ display: 'block', fontSize: '1.5rem', color: '#0d2f5d', fontWeight: 800, marginBottom: '2px' }}>48 Hours</strong>
            <span style={{ color: '#475569', fontSize: '0.78rem', fontWeight: 600 }}>Fast-Track Case Opinion Target</span>
          </div>
          <div className="hpl-card-v2" style={{ padding: '14px' }}>
            <strong style={{ display: 'block', fontSize: '1.5rem', color: '#0d2f5d', fontWeight: 800, marginBottom: '2px' }}>100%</strong>
            <span style={{ color: '#475569', fontSize: '0.78rem', fontWeight: 600 }}>Verified Pre-Screened Reports</span>
          </div>
          <div className="hpl-card-v2" style={{ padding: '14px' }}>
            <strong style={{ display: 'block', fontSize: '1.5rem', color: '#0d2f5d', fontWeight: 800, marginBottom: '2px' }}>24/7</strong>
            <span style={{ color: '#475569', fontSize: '0.78rem', fontWeight: 600 }}>Dedicated Patient Care Concierge</span>
          </div>
        </div>
      </section>

      {/* ── PARTNERSHIP BENEFITS SECTION ── */}
      <section id="hpl-benefits" style={{ padding: '40px 16px', background: '#ffffff' }}>
        <div className="hpl-container-v2" style={{ textAlign: 'center' }}>
          <span style={{ color: '#0d2f5d', fontWeight: 800, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
            KAIRACURE ALLIANCE ADVANTAGE
          </span>
          <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.8rem)', color: '#0f172a', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.01em' }}>
            Comprehensive Support for Partner Healthcare Providers
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.84rem', maxWidth: '680px', margin: '0 auto 28px', lineHeight: 1.5 }}>
            We connect top JCI &amp; NABH accredited hospitals directly with overseas medical seekers, handling pre-travel report reviews, visa invitations, and travel concierge.
          </p>

          {/* 4 Feature Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            <div className="hpl-card-v2" style={{ textAlign: 'center' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f0f7ff', color: '#0d2f5d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', margin: '0 auto 10px' }}>
                <i className="bi bi-globe-americas" />
              </div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a', marginBottom: '2px', fontWeight: 700 }}>Global Patient Inflows</strong>
              <span style={{ color: '#64748b', fontSize: '0.76rem' }}>Direct medical referral intake from Middle East, Africa &amp; SAARC</span>
            </div>

            <div className="hpl-card-v2" style={{ textAlign: 'center' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', margin: '0 auto 10px' }}>
                <i className="bi bi-file-earmark-medical-fill" />
              </div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a', marginBottom: '2px', fontWeight: 700 }}>Structured Case Files</strong>
              <span style={{ color: '#64748b', fontSize: '0.76rem' }}>Organized medical histories, DICOM MRI scans &amp; report summaries</span>
            </div>

            <div className="hpl-card-v2" style={{ textAlign: 'center' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', margin: '0 auto 10px' }}>
                <i className="bi bi-airplane-fill" />
              </div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a', marginBottom: '2px', fontWeight: 700 }}>Travel &amp; Logistics Managed</strong>
              <span style={{ color: '#64748b', fontSize: '0.76rem' }}>Visa letters, airport pickup, hotel stay &amp; translators handled by KairaCure</span>
            </div>

            <div className="hpl-card-v2" style={{ textAlign: 'center' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', margin: '0 auto 10px' }}>
                <i className="bi bi-speedometer2" />
              </div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a', marginBottom: '2px', fontWeight: 700 }}>Partner Portal Access</strong>
              <span style={{ color: '#64748b', fontSize: '0.76rem' }}>Real-time lead tracking, estimate approvals &amp; admission scheduling</span>
            </div>
          </div>

          {/* Hospital Hubs Row */}
          <div style={{ marginBottom: '12px' }}>
            <span style={{ color: '#475569', fontWeight: 700, fontSize: '0.78rem', display: 'block', marginBottom: '8px' }}>
              KAIRACURE PARTNER HOSPITAL DESTINATION HUBS:
            </span>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {HOSPITAL_HUBS.map((city) => (
                <span key={city} style={{ padding: '5px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '20px', fontWeight: 700, fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <i className="bi bi-building-check" style={{ color: '#16a34a', fontSize: '0.78rem' }} />
                  <span>{city}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PARTNER FORM SECTION ── */}
      <section id="hpl-form" style={{ padding: '40px 16px', background: '#f8fafc' }}>
        <div className="hpl-container-v2 hpl-form-card-grid" style={{ background: '#ffffff', border: '1.5px solid #0d2f5d', borderRadius: '16px', padding: '28px 24px', boxShadow: '0 8px 24px rgba(0, 102, 254, 0.06)' }}>
          
          <div>
            <span style={{ color: '#0d2f5d', fontWeight: 800, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              JOIN KAIRACURE ALLIANCE
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
              Apply for Hospital Partnership
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '18px' }}>
              Empower your medical center with KairaCure&apos;s global patient referral ecosystem. Submit your details to speak with our hospital alliance team.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>
                <i className="bi bi-check-circle-fill" style={{ color: '#0d2f5d', fontSize: '0.95rem' }} />
                <span>Zero registration fee for accredited healthcare providers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>
                <i className="bi bi-check-circle-fill" style={{ color: '#0d2f5d', fontSize: '0.95rem' }} />
                <span>Dedicated international case desk &amp; report translation</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>
                <i className="bi bi-check-circle-fill" style={{ color: '#0d2f5d', fontSize: '0.95rem' }} />
                <span>Direct patient intake &amp; package quote presentation</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '20px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>Hospital / Healthcare Center Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Fortis Healthcare / Apollo Hospitals" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>Official Email Address *</label>
                <input 
                  type="email" 
                  placeholder="partners@hospital.com" 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>Phone / WhatsApp Contact *</label>
                <input 
                  type="tel" 
                  placeholder="+91 98765 43210" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>Primary Specialty Focus</label>
                <select 
                  value={formData.specialty} 
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} 
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                >
                  {MEDICAL_SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>Message / Requirements</label>
                <textarea 
                  rows="2" 
                  placeholder="Tell us about your hospital facilities and bed capacity..." 
                  value={formData.message} 
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>

              {formStatus && (
                <div style={{ color: formStatus.includes('submitted') || formStatus.includes('Thank you') ? '#16a34a' : '#0d2f5d', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <i className="bi bi-check-circle-fill" />
                  <span>{formStatus}</span>
                </div>
              )}

              <button className="hpl-btn-primary-v2" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}>
                <i className="bi bi-person-plus-fill" />
                <span>Submit Partnership Application</span>
              </button>
            </form>
          </div>

        </div>
      </section>

    </div>
  );
}
