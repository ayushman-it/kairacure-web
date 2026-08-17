import React from 'react';
import { MedicalVideoBackdrop } from '../components/common/MedicalVideoBackdrop.jsx';

export function DoctorsPage({ hospitals = [], isCarousel = false, money, setPage, setSelectedHospital }) {
  return (
    <section className={isCarousel ? 'page-section doctors-section carousel-mode' : 'page-section doctors-section'} id="doctors">
      <MedicalVideoBackdrop />
      <div className="section-heading">
        <div>
          <h2>Popular Doctors</h2>
          <p>Review specialist experience, hospital association, and consultation fee.</p>
        </div>
      </div>
      <div className="doctor-grid">
        {hospitals.map((hospital) => (
          <button
            className="doctor-card"
            key={`${hospital.id}-${hospital.doctor || hospital.name}`}
            onClick={() => {
              if (setSelectedHospital) setSelectedHospital(hospital);
              setPage('doctor-detail');
            }}
            type="button"
          >
            <div className="doctor-photo-wrap">
              <img alt={hospital.doctor || 'Doctor'} src={hospital.doctorImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'} />
              <span>MD</span>
            </div>
            <div className="doctor-card-body">
              <div className="doctor-card-top">
                <strong>{hospital.doctor || 'Dr. Specialist'}</strong>
                <p>{hospital.doctorTitle || 'Senior Consultant'}</p>
              </div>
              <div className="doctor-meta-row">
                <span><b>YR</b> {hospital.experience || '15+ Years'}</span>
                <span><b>H</b> {hospital.city || 'India'}</span>
              </div>
              <span className="doctor-hospital-name">{hospital.name}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
