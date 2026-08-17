import React from 'react';

export function PartnerDetailPage({ money, selectedHospital, setPage }) {
  if (!selectedHospital) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Partner Hospital Not Found</h2>
        <button onClick={() => setPage('partners')} type="button">Back to Partners</button>
      </div>
    );
  }

  return (
    <section className="page-section partner-detail-page">
      <div className="section-heading">
        <h2>{selectedHospital.name}</h2>
        <p>{selectedHospital.city ? `${selectedHospital.city}, India` : 'India'} · Accredited Partner</p>
      </div>
      <div className="hospital-detail-card" style={{ padding: '2rem', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <p>Comprehensive medical care and specialized surgical programs.</p>
        <button onClick={() => setPage('planner')} type="button" style={{ padding: '0.75rem 1.5rem', background: '#0d2f5d', color: '#fff', borderRadius: '8px', border: 'none' }}>
          Book Consultation
        </button>
      </div>
    </section>
  );
}
