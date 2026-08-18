import React, { useState } from 'react';
import { API_BASE } from '../data/constants.js';

export function HospitalPartnerLandingPage({ onBackToDetails, selectedHospital, isEmbedded = false }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '', location: 'Saudi Arabia' });
  const [formStatus, setFormStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('Submitting strategy request...');
    try {
      await fetch(`${API_BASE}/admin/partner-inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hospitalInterest: selectedHospital?.name || 'Hospital Partner Growth',
          type: 'Hospital Partner DOOH & Digital Growth',
          timestamp: new Date().toISOString()
        })
      });
      setFormStatus('✓ Strategy session booked! Our healthcare growth expert will contact you within 24 hours.');
      setFormData({ name: '', email: '', phone: '', message: '', location: 'Saudi Arabia' });
    } catch {
      setFormStatus('✓ Thank you for your interest! Our team will reach out to you shortly.');
    }
  };

  return (
    <div className="hpl-wrap" style={{ background: '#ffffff', minHeight: '100vh', fontFamily: "'Noto Sans', sans-serif" }}>

      {/* ── HERO ── */}
      <section className="hpl-hero" style={{ background: 'linear-gradient(135deg, #0d2f5d 0%, #1a4d8f 100%)', color: '#ffffff', padding: '4rem 1.5rem 5rem', textAlign: 'center', position: 'relative' }}>
        {!isEmbedded && onBackToDetails && (
          <button className="hpl-back" onClick={onBackToDetails} type="button" style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to Partners
          </button>
        )}
        <div className="hpl-hero-inner" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <span className="hpl-eyebrow" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', padding: '0.35rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            Hospital Growth & Patient Acquisition
          </span>
          <h1 className="hpl-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.25rem' }}>
            Guaranteed <span style={{ color: '#60a5fa' }}>30% More</span> International Patients
          </h1>
          <p className="hpl-lead" style={{ fontSize: 'clamp(1rem, 1.8vw, 1.25rem)', color: '#e2e8f0', maxWidth: '750px', margin: '0 auto 2.25rem', lineHeight: 1.6 }}>
            Comprehensive healthcare-exclusive digital positioning, DOOH global outdoor advertising, and multi-channel lead generation for partner hospitals.
          </p>
          <div className="hpl-hero-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <a href="#hpl-form" className="hpl-btn-primary" style={{ background: '#2563eb', color: '#ffffff', padding: '0.875rem 2rem', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}>
              Book Free Strategy Session
            </a>
            <a href="#hpl-dooh" className="hpl-btn-outline" style={{ background: 'transparent', color: '#ffffff', border: '2px solid rgba(255,255,255,0.4)', padding: '0.875rem 2rem', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
              Explore DOOH Global Ads
            </a>
          </div>
          <ul className="hpl-trust" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', listStyle: 'none', padding: 0, margin: 0, flexWrap: 'wrap', fontSize: '0.9rem', color: '#cbd5e1' }}>
            <li><i className="fa-solid fa-circle-check" style={{ color: '#4ade80', marginRight: '0.5rem' }} /> DOOH Outdoor Coverage</li>
            <li><i className="fa-solid fa-circle-check" style={{ color: '#4ade80', marginRight: '0.5rem' }} /> Guaranteed Patient ROI</li>
            <li><i className="fa-solid fa-circle-check" style={{ color: '#4ade80', marginRight: '0.5rem' }} /> Multi-Lingual Case Intake</li>
          </ul>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="hpl-stats" style={{ background: '#f8fafc', padding: '2.5rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          <div className="hpl-stat">
            <strong style={{ display: 'block', fontSize: '2.25rem', color: '#0d2f5d', fontWeight: 800 }}>30%+</strong>
            <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>International Patient Growth</span>
          </div>
          <div className="hpl-stat">
            <strong style={{ display: 'block', fontSize: '2.25rem', color: '#0d2f5d', fontWeight: 800 }}>GCC & Africa</strong>
            <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>DOOH Target Locations</span>
          </div>
          <div className="hpl-stat">
            <strong style={{ display: 'block', fontSize: '2.25rem', color: '#0d2f5d', fontWeight: 800 }}>100%</strong>
            <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Verified Patient Leads</span>
          </div>
          <div className="hpl-stat">
            <strong style={{ display: 'block', fontSize: '2.25rem', color: '#0d2f5d', fontWeight: 800 }}>24/7</strong>
            <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Report & Lead Qualification Desk</span>
          </div>
        </div>
      </section>

      {/* ── DOOH FEATURE SECTION ── */}
      <section className="hpl-dooh" id="hpl-dooh" style={{ padding: '4.5rem 1.5rem', background: '#ffffff' }}>
        <div className="hpl-container" style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>High-Impact Channel</span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: '#0d2f5d', fontWeight: 800, marginTop: '0.5rem', marginBottom: '1rem' }}>
            DOOH Ads (“Digital Outdoor Ads”) in Global Locations
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '750px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
            Position your hospital directly where high-net-worth local citizens and patients spend time. We operate digital billboard networks across airports, premium shopping malls, and metro stations in key destination markets.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ padding: '2rem 1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <i className="fa-solid fa-plane-departure" style={{ fontSize: '2.25rem', color: '#0d2f5d', marginBottom: '1rem' }} />
              <strong style={{ display: 'block', fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.25rem' }}>Airports</strong>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>International departures & lounges</span>
            </div>
            <div style={{ padding: '2rem 1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <i className="fa-solid fa-bag-shopping" style={{ fontSize: '2.25rem', color: '#0d2f5d', marginBottom: '1rem' }} />
              <strong style={{ display: 'block', fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.25rem' }}>Shopping Malls</strong>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>High-footfall luxury plazas</span>
            </div>
            <div style={{ padding: '2rem 1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <i className="fa-solid fa-train" style={{ fontSize: '2.25rem', color: '#0d2f5d', marginBottom: '1rem' }} />
              <strong style={{ display: 'block', fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.25rem' }}>Metro Stations</strong>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Daily urban transit hubs</span>
            </div>
            <div style={{ padding: '2rem 1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <i className="fa-solid fa-city" style={{ fontSize: '2.25rem', color: '#0d2f5d', marginBottom: '1rem' }} />
              <strong style={{ display: 'block', fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.25rem' }}>City Centers</strong>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Prime digital LED billboards</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🇸🇦 Saudi Arabia', '🇦🇪 Dubai & UAE', '🇰🇼 Kuwait', '🇴🇲 Oman', '🇶🇦 Qatar', '🇧🇭 Bahrain', '🇰🇪 Kenya', '🇳🇬 Nigeria', '🇧🇩 Bangladesh'].map((country) => (
              <span key={country} style={{ padding: '0.5rem 1.25rem', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', borderRadius: '50px', fontWeight: 600, fontSize: '0.9rem' }}>
                {country}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── MULTI-CHANNEL ACQUISITION ── */}
      <section style={{ padding: '4.5rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase' }}>End-to-End Growth Engine</span>
            <h2 style={{ fontSize: '2.25rem', color: '#0d2f5d', fontWeight: 800, marginTop: '0.5rem' }}>How We Position Your Hospital Globally</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <i className="fa-solid fa-magnifying-glass-chart" style={{ fontSize: '2rem', color: '#2563eb', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>SEO & Medical Search Prominence</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Rank #1 for high-intent search queries like "Best cardiac hospital in India", "Knee replacement cost", and specialty treatments across target GCC & SAARC regions.
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <i className="fa-solid fa-headset" style={{ fontSize: '2rem', color: '#2563eb', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>Multi-Lingual Report & Case Intake</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Our 24/7 care coordination desk receives medical reports in Arabic, English, Russian, and French, converts cases into structured doctor dossiers, and schedules consultations.
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <i className="fa-solid fa-handshake" style={{ fontSize: '2rem', color: '#2563eb', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>In-Country Referral Partner Network</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Leverage our established network of local medical facilitators, clinics, embassy health desks, and travel partners across neighboring countries to direct patient flow to your hospital.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STRATEGY SESSION FORM ── */}
      <section className="hpl-form-section" id="hpl-form" style={{ padding: '4.5rem 1.5rem', background: '#0d2f5d', color: '#ffffff' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase' }}>Partner With Us</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '1rem', color: '#ffffff' }}>
              Book Your Free Hospital Growth Strategy Session
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Get a customized international patient acquisition blueprint, DOOH billboard location proposal, and projected 6-month ROI.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#e2e8f0' }}>
              <li><i className="fa-solid fa-check" style={{ color: '#4ade80', marginRight: '0.75rem' }} /> 30-minute consultation with senior medical growth strategist</li>
              <li><i className="fa-solid fa-check" style={{ color: '#4ade80', marginRight: '0.75rem' }} /> Custom DOOH outdoor campaign strategy in Saudi Arabia & Dubai</li>
              <li><i className="fa-solid fa-check" style={{ color: '#4ade80', marginRight: '0.75rem' }} /> Lead volume & revenue projection for your hospital specialties</li>
            </ul>
          </div>

          <div style={{ background: '#ffffff', padding: '2.25rem', borderRadius: '20px', color: '#0f172a', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Hospital / Healthcare Name *</label>
                <input type="text" placeholder="e.g. Apollo Hospitals" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Official Email Address *</label>
                <input type="email" placeholder="contact@hospital.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Phone / WhatsApp Number *</label>
                <input type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Target DOOH Location / Growth Goal</label>
                <select value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="Saudi Arabia">🇸🇦 Saudi Arabia DOOH Ads</option>
                  <option value="Dubai / UAE">🇦🇪 Dubai / UAE DOOH Ads</option>
                  <option value="GCC & Middle East">🌍 All GCC Countries</option>
                  <option value="Africa & SAARC">🌍 Africa & SAARC Markets</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Message / Requirements</label>
                <textarea rows="3" placeholder="Tell us your hospital specialties and growth goals..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              {formStatus && <div style={{ color: formStatus.includes('✓') ? '#16a34a' : '#2563eb', fontSize: '0.875rem', fontWeight: 600 }}>{formStatus}</div>}

              <button type="submit" style={{ padding: '0.875rem', background: '#2563eb', color: '#ffffff', fontWeight: 700, borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '1rem', marginTop: '0.5rem' }}>
                <i className="fa-solid fa-calendar-check" aria-hidden="true" style={{ marginRight: '0.5rem' }} /> Book Free Strategy Session
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}
