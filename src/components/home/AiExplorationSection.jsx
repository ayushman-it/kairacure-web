import React, { useState } from 'react';

export function AiExplorationSection({ setPage }) {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 8) {
      alert('Please enter a valid mobile number.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <section className="ai-exploration-section-v2" style={{ padding: '64px 20px', background: '#f8fafc' }}>
      <style>{`
        .ai-care-desk-card {
          max-width: 1160px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 44px 48px;
          box-shadow: 0 12px 40px rgba(0, 102, 254, 0.06);
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 48px;
          align-items: center;
        }
        @media (max-width: 992px) {
          .ai-care-desk-card {
            grid-template-columns: 1fr;
            padding: 28px 24px;
            gap: 32px;
          }
        }
        .ai-care-btn-primary {
          background: #0066fe !important;
          color: #ffffff !important;
          border: none !important;
          padding: 10px 22px !important;
          border-radius: 10px !important;
          font-size: 0.85rem !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px !important;
          box-shadow: 0 4px 14px rgba(0, 102, 254, 0.25) !important;
          transition: all 0.2s ease !important;
          height: 42px !important;
          min-height: 42px !important;
        }
        .ai-care-btn-primary:hover {
          background: #0052cc !important;
          transform: translateY(-1px);
        }
        .ai-care-input-group {
          display: flex;
          gap: 10px;
          max-width: 480px;
          margin-top: 8px;
        }
        @media (max-width: 576px) {
          .ai-care-input-group {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="ai-care-desk-card">
        {/* Left Column: Premium Doctor Showcase Card */}
        <div style={{ position: 'relative' }}>
          <div 
            style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              border: '4px solid #ffffff'
            }}
          >
            <img
              alt="Kairacure Senior Medical Care Specialist"
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=90"
              style={{
                width: '100%',
                height: '430px',
                objectFit: 'cover',
                objectPosition: 'center top',
                display: 'block'
              }}
            />
            {/* Dark Gradient Overlay */}
            <div 
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0) 100%)',
                padding: '28px 20px 20px',
                color: '#ffffff'
              }}
            >
              <strong style={{ display: 'block', fontSize: '1.1rem', fontWeight: 700 }}>Dr. Ananya Sharma</strong>
              <span style={{ fontSize: '0.82rem', color: '#93c5fd', fontWeight: 600 }}>Lead Medical Care Coordinator (Kairacure Desk)</span>
            </div>

            {/* Top Floating Pill */}
            <div 
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#0066fe',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              24/7 Verified Care Desk
            </div>
          </div>

          {/* Floating Rating Badge */}
          <div 
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '-16px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '10px 16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 3
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#f0f7ff', color: '#0066fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              <i className="bi bi-star-fill" />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a' }}>★ 4.9 Superb Fit</strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>10,000+ Patient Cases Guided</span>
            </div>
          </div>
        </div>

        {/* Right Column: Features & Callbacks */}
        <div>
          {/* Header Badge & Title */}
          <div style={{ marginBottom: '28px' }}>
            <span 
              style={{
                display: 'inline-block',
                background: '#f0f7ff',
                color: '#0066fe',
                border: '1px solid #bfdbfe',
                padding: '4px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}
            >
              CARE SUPPORT &amp; MEDICAL DESK
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Plan Your Medical Journey
            </h2>
            <p style={{ fontSize: '0.94rem', color: '#64748b', margin: 0, lineHeight: 1.5, maxWidth: '620px' }}>
              Connect directly with our senior care desk to compare accredited hospital packages, arrange doctor second opinions, and organize seamless travel &amp; stay.
            </p>
          </div>

          {/* 3 Features Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* Feature 1 */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#f0f7ff',
                  border: '1px solid #dbeafe',
                  color: '#0066fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0
                }}
              >
                <i className="bi bi-hospital" />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 3px' }}>
                  Compare Hospital Options &amp; Doctor Availability
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                  Evaluate surgical packages across JCI &amp; NABH accredited partner hospitals, doctor availability, and priority appointment booking.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#f0f7ff',
                  border: '1px solid #dbeafe',
                  color: '#0066fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0
                }}
              >
                <i className="bi bi-person-badge" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 3px' }}>
                  Second Opinion &amp; Specialist Case Review
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 10px', lineHeight: 1.45 }}>
                  Share your clinical reports to receive a complimentary second opinion and recommended line of treatment from hospital specialists.
                </p>
                <button
                  type="button"
                  className="ai-care-btn-primary"
                  onClick={() => setPage && setPage('ai-assistant')}
                >
                  <i className="bi bi-chat-dots-fill" />
                  <span>Talk to Care Expert</span>
                </button>
              </div>
            </div>

            {/* Feature 3 */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#f0f7ff',
                  border: '1px solid #dbeafe',
                  color: '#0066fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0
                }}
              >
                <i className="bi bi-airplane-engines" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 3px' }}>
                  Coordinated Travel, Visa &amp; Hotel Stay
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 12px', lineHeight: 1.45 }}>
                  End-to-end flight booking, verified medical partner hotel accommodation, visa invitation letters, and dedicated airport escort.
                </p>

                {/* Mobile Callback Form */}
                {submitted ? (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '10px', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="bi bi-check-circle-fill" style={{ fontSize: '1.1rem' }} />
                    <span>Request Received! A Kairacure medical coordinator will call you shortly on <strong>+91 {phone}</strong>.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="ai-care-input-group">
                    <div style={{ position: 'relative', flex: 1 }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>🇮🇳 +91</span>
                      <input
                        type="tel"
                        placeholder="Enter 10-digit Mobile*"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          height: '42px',
                          paddingLeft: '72px',
                          paddingRight: '12px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.85rem',
                          outline: 'none',
                          color: '#0f172a',
                          background: '#ffffff'
                        }}
                      />
                    </div>
                    <button type="submit" className="ai-care-btn-primary">
                      <i className="bi bi-telephone-outbound-fill" />
                      <span>Request Callback</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
