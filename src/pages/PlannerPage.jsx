import React, { useState } from 'react';

export function PlannerPage({ hospitals = [], initialProcedure = null, money, selectedTreatment, selectedHospital, setPage, setSelectedHospital, setSelectedTreatment, treatments = [] }) {
  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState('All Cities');

  return (
    <section className="page-section planner-page" style={{ padding: '3rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="section-heading" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.25rem', color: '#0d2f5d' }}>Plan Your <span>Medical Journey</span></h2>
        <p style={{ color: '#64748b' }}>Select procedure, preferred partner hospital, and travel preferences for instant estimation.</p>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 14px rgba(13,47,93,0.06)' }}>
        <h3 style={{ color: '#0d2f5d', marginBottom: '1rem' }}>Step {step}: Select Procedure &amp; Location</h3>
        <p style={{ color: '#475569', marginBottom: '1.5rem' }}>Our medical coordinators assist with free opinions, visa invitations, and airport transfers.</p>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setPage('partners')} type="button" style={{ padding: '0.75rem 1.5rem', background: '#0d2f5d', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
            Browse Partners
          </button>
          <button onClick={() => setPage('ai-assistant')} type="button" style={{ padding: '0.75rem 1.5rem', background: '#eff6ff', color: '#0d2f5d', borderRadius: '8px', border: '1px solid #dbeafe', cursor: 'pointer' }}>
            Ask AI Assistant
          </button>
        </div>
      </div>
    </section>
  );
}
