import React from 'react';

export function DoctorDetailPage({ money, selectedHospital, setPage }) {
  const doctorName = selectedHospital?.doctor || 'Dr. Medical Specialist';
  const doctorTitle = selectedHospital?.doctorTitle || 'Senior Consultant';
  const hospitalName = selectedHospital?.name || 'Partner Hospital';

  return (
    <section className="page-section doctor-detail-page">
      <div className="section-heading">
        <h2>{doctorName}</h2>
        <p>{doctorTitle} · {hospitalName}</p>
      </div>
      <div className="doctor-detail-card" style={{ padding: '2rem', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <p>Specialist medical practitioner with extensive surgical and clinical experience.</p>
        <button onClick={() => setPage('planner')} type="button" style={{ padding: '0.75rem 1.5rem', background: '#0d2f5d', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
          Schedule Consultation
        </button>
      </div>
    </section>
  );
}
