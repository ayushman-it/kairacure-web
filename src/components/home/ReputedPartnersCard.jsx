import React, { useMemo } from 'react';

const FALLBACK_REPUTED_PARTNERS = [
  {
    name: 'Apollo Hospitals',
    location: 'Delhi / NCR & Pan-India',
    accreditation: 'JCI & NABH',
    specialties: 'Oncology, Organ Transplant & Cardiac',
    badgeColor: '#0066fe',
  },
  {
    name: 'Fortis Healthcare',
    location: 'Mumbai, NCR & Bengaluru',
    accreditation: 'JCI Accredited',
    specialties: 'Robotic Surgery & Orthopedics',
    badgeColor: '#059669',
  },
  {
    name: 'Max Super Speciality',
    location: 'Delhi / NCR & North India',
    accreditation: 'NABH Accredited',
    specialties: 'Liver Transplant & Neurosurgery',
    badgeColor: '#0284c7',
  },
  {
    name: 'Manipal Hospitals',
    location: 'Bengaluru & South India',
    accreditation: 'JCI & NABH',
    specialties: 'Cardiology & Bone Marrow',
    badgeColor: '#d97706',
  },
];

export function ReputedPartnersCard({ setPage, setSelectedHospital, hospitals = [] }) {
  const displayPartners = useMemo(() => {
    if (Array.isArray(hospitals) && hospitals.length > 0) {
      return hospitals.slice(0, 4).map((h, i) => {
        const colors = ['#0066fe', '#059669', '#0284c7', '#d97706'];
        const acc = Array.isArray(h.accreditations) && h.accreditations.length > 0
          ? h.accreditations.join(' & ')
          : (h.accreditation || 'JCI & NABH');
        return {
          name: h.name,
          location: h.city || h.location || 'Pan-India',
          accreditation: acc,
          specialties: h.centerOfExcellence || h.specialties || h.category || 'Multi-Specialty & Organ Transplant',
          badgeColor: colors[i % colors.length],
          rawItem: h,
        };
      });
    }
    return FALLBACK_REPUTED_PARTNERS;
  }, [hospitals]);

  const handleCardClick = (e, partner) => {
    e.stopPropagation();
    if (partner.rawItem && setSelectedHospital) {
      setSelectedHospital(partner.rawItem);
      setPage('partner-detail', partner.rawItem);
    } else {
      setPage('partners');
    }
  };

  return (
    <section className="rpc-section" style={{ padding: '36px 16px', background: '#f8fafc', fontFamily: "'Noto Sans', sans-serif" }}>
      <div className="rpc-container" style={{ maxWidth: '1180px', margin: '0 auto' }}>
        
        {/* Real Human-Designed Clean Card Shell */}
        <div
          onClick={() => setPage('partners')}
          className="rpc-human-card"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '28px 24px',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {/* Top Title Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 800, color: '#0066fe', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                <i className="bi bi-building-check" style={{ fontSize: '0.9rem' }} />
                <span>ACCREDITED HEALTHCARE NETWORK</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.3rem, 2.2vw, 1.65rem)', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                Our Reputed Partner Hospitals
              </h2>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setPage('partners'); }}
              type="button"
              className="rpc-human-btn"
              style={{
                background: '#0066fe',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '38px',
                boxShadow: '0 2px 8px rgba(0, 102, 254, 0.2)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>View All {hospitals.length > 0 ? hospitals.length : 120}+ Partner Hospitals</span>
              <i className="bi bi-arrow-right" />
            </button>
          </div>

          {/* Partner Hospitals Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {displayPartners.map((hosp, idx) => (
              <div
                key={idx}
                onClick={(e) => handleCardClick(e, hosp)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 800 }}>{hosp.name}</strong>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: hosp.badgeColor, background: '#ffffff', padding: '2px 8px', borderRadius: '12px', border: `1px solid ${hosp.badgeColor}` }}>
                      {hosp.accreditation.split(' ')[0]}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="bi bi-geo-alt-fill" style={{ color: '#0066fe', fontSize: '0.78rem' }} />
                    <span>{hosp.location}</span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600, lineHeight: 1.4 }}>
                    <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Center of Excellence:</span>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {hosp.specialties}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#0066fe', fontWeight: 700 }}>
                  <span>Verified Medical Partner</span>
                  <i className="bi bi-chevron-right" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Trust Note */}
          <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '10px 14px', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#1e3a8a', fontWeight: 600 }}>
              <i className="bi bi-check-circle-fill" style={{ color: '#0066fe', fontSize: '0.95rem' }} />
              <span>Looking for a specific doctor or hospital package? Get free doctor opinions &amp; negotiated estimates.</span>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0066fe', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Explore Hospital Directory <i className="bi bi-arrow-right" />
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
