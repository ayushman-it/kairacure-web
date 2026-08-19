import React from 'react';

const METRICS_DATA = [
  {
    icon: 'bi bi-heart-pulse-fill',
    iconBg: '#f0f7ff',
    iconColor: '#0066fe',
    number: '100k+',
    label: 'Patient Journeys Benchmarked',
    subTag: '✓ 99.4% Care Satisfaction'
  },
  {
    icon: 'bi bi-globe-americas',
    iconBg: '#ecfdf5',
    iconColor: '#10b981',
    number: '38+',
    label: 'Destination Countries Tracked',
    subTag: '✓ Global Network'
  },
  {
    icon: 'bi bi-hospital-fill',
    iconBg: '#fffbeb',
    iconColor: '#f59e0b',
    number: '1,500+',
    label: 'Accredited Hospital Partners',
    subTag: '✓ JCI & NABH Certified'
  },
  {
    icon: 'bi bi-clock-history',
    iconBg: '#f5f3ff',
    iconColor: '#8b5cf6',
    number: '48h',
    label: 'Medical Opinion SLA Target',
    subTag: '✓ Rapid Specialist Review'
  }
];

const ACCREDITATIONS = [
  { label: 'ISO 9001:2015 Process', icon: 'bi bi-shield-check' },
  { label: 'JCI & NABH Partner Network', icon: 'bi bi-award-fill' },
  { label: 'IATA Travel Desk Coordinated', icon: 'bi bi-airplane-fill' },
  { label: '★ 4.9 Google Patient Rating', icon: 'bi bi-star-fill' }
];

export function TrustStrip() {
  return (
    <section className="trust-strip-v2" aria-label="Platform trust metrics and accreditation highlights" style={{ padding: '36px 16px', background: '#f8fafc' }}>
      <style>{`
        .trust-banner-card {
          max-width: 1380px;
          margin: 0 auto;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 24px;
          padding: 36px 44px;
          box-shadow: 0 10px 36px rgba(0, 102, 254, 0.05);
        }
        @media (max-width: 768px) {
          .trust-banner-card {
            padding: 24px 20px;
          }
        }
        .trust-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          padding-bottom: 28px;
          margin-bottom: 24px;
          border-bottom: 1px solid #f1f5f9;
        }
        @media (max-width: 992px) {
          .trust-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 576px) {
          .trust-metrics-grid {
            grid-template-columns: 1fr;
          }
        }
        .trust-metric-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 12px;
          border-radius: 14px;
          transition: all 0.2s ease;
        }
        .trust-metric-item:hover {
          background: #f8fafc;
          transform: translateY(-2px);
        }
        .trust-badge-pill {
          background: #f0f7ff;
          border: 1px solid #dbeafe;
          color: #0066fe;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
        }
        .trust-badge-pill:hover {
          background: #0066fe;
          color: #ffffff;
          border-color: #0066fe;
          box-shadow: 0 4px 12px rgba(0, 102, 254, 0.2);
        }
      `}</style>

      <div className="trust-banner-card">
        
        {/* Top 4 Metrics Grid */}
        <div className="trust-metrics-grid">
          {METRICS_DATA.map((item, index) => (
            <div key={index} className="trust-metric-item">
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: item.iconBg,
                  color: item.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0
                }}
              >
                <i className={item.icon} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: '2px', letterSpacing: '-0.02em' }}>
                  {item.number}
                </strong>
                <span style={{ display: 'block', fontSize: '0.84rem', color: '#475569', fontWeight: 600, marginBottom: '4px' }}>
                  {item.label}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#0066fe', fontWeight: 700, background: '#f0f7ff', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                  {item.subTag}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Accreditations Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            GLOBAL CLINICAL ACCREDITATIONS:
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {ACCREDITATIONS.map((badge, idx) => (
              <div key={idx} className="trust-badge-pill">
                <i className={badge.icon} />
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
