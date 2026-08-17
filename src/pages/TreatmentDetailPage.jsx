import React from 'react';

export function TreatmentDetailPage({ allTreatments = [], hospitals = [], money, selectedTreatment, setPage, setPlannerInitialProcedure, setSelectedHospital, setSelectedTreatment }) {
  const treatmentName = selectedTreatment?.name || selectedTreatment?.title || 'Medical Treatment';
  const groupName = selectedTreatment?.group || selectedTreatment?.category || 'Specialist Care';

  return (
    <section className="page-section treatment-detail-page">
      <div className="section-heading">
        <h2>{treatmentName}</h2>
        <p>{groupName} · Comprehensive Treatment & Travel Package</p>
      </div>
      <div style={{ padding: '2rem', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <p>Get estimated package details, top recommended surgeons, and accredited partner hospital options.</p>
        <button onClick={() => setPage('planner')} type="button" style={{ padding: '0.75rem 1.5rem', background: '#0d2f5d', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
          Plan Journey For This Treatment
        </button>
      </div>
    </section>
  );
}
