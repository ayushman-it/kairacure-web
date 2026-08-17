import React, { useState, useMemo, useEffect } from 'react';
import { MedicalVideoBackdrop } from '../components/common/MedicalVideoBackdrop.jsx';

function accreditationText(value, fallback = 'Accredited Hospital') {
  if (Array.isArray(value) && value.length > 0) return value.join(', ');
  if (typeof value === 'string' && value.trim()) return value;
  return fallback;
}

export function PartnersPage({ hospitals = [], isLoading = false, money, selectedTreatment, setPage, setSelectedHospital }) {
  const [visibleCount, setVisibleCount] = useState(6);
  const visibleHospitals = hospitals.slice(0, visibleCount);

  return (
    <section className="page-section hospitals-directory" id="partners">
      <MedicalVideoBackdrop />
      <div className="section-heading">
        <div>
          <h2>Our <span>Partners</span></h2>
          <p>Explore accredited partner hospitals, specialist clinics, and healthcare institutions.</p>
        </div>
      </div>

      <div className="hospital-directory-layout">
        <div className="hospital-list">
          {visibleHospitals.map((hospital) => (
            <article className="hospital-card" key={hospital.id || hospital.name}>
              <div className="hospital-card-main">
                <button
                  className="hospital-thumb-button"
                  onClick={() => {
                    setSelectedHospital(hospital);
                    setPage('partner-detail');
                  }}
                  type="button"
                >
                  <img alt={hospital.name} src={hospital.image || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80'} />
                </button>
                <div className="hospital-body">
                  <button
                    className="hospital-name-link"
                    onClick={() => {
                      setSelectedHospital(hospital);
                      setPage('partner-detail');
                    }}
                    type="button"
                  >
                    {hospital.name}
                  </button>
                  <p>
                    {hospital.name} is a premier healthcare partner specializing in {hospital.specialty?.toLowerCase() || 'multispeciality'} care
                    {hospital.city ? ` in ${hospital.city}` : ''}.
                  </p>
                  <button className="show-more-link" onClick={() => {
                    setSelectedHospital(hospital);
                    setPage('partner-detail');
                  }} type="button">View Partner Details</button>
                </div>
              </div>
              <div className="hospital-facts">
                <span>Location: {hospital.city || 'India'}</span>
                <span>Speciality: {hospital.specialty || 'Multispeciality'}</span>
                <button onClick={() => setPage('planner')} type="button">Book Appointment</button>
              </div>
            </article>
          ))}
          {visibleCount < hospitals.length && (
            <div className="load-more-row hospital-load-more">
              <button onClick={() => setVisibleCount((count) => Math.min(count + 6, hospitals.length))} type="button">
                Load more partners
              </button>
              <span>{visibleHospitals.length} of {hospitals.length}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
