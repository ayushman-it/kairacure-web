import React from 'react';
import { MedicalVideoBackdrop } from '../components/common/MedicalVideoBackdrop.jsx';
import { StarRating } from '../components/common/StarRating.jsx';

export function DoctorsPage({ hospitals, isCarousel = false, money, setPage, setSelectedHospital }) {
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
            key={`${hospital.id}-${hospital.doctor}`}
            onClick={() => {
              setSelectedHospital(hospital);
              setPage('doctor-detail');
            }}
            type="button"
          >
            <div className="doctor-photo-wrap">
              <img alt={hospital.doctor} src={hospital.doctorImage} />
              <span>MD</span>
            </div>
            <div className="doctor-card-body">
              <div className="doctor-card-top">
                <strong>{hospital.doctor}</strong>
                <p>{hospital.doctorTitle}</p>
              </div>
              <div className="doctor-meta-row">
                <span><b>YR</b>{hospital.experience}</span>
                <span><b>H</b>{hospital.city}</span>
              </div>
              <StarRating rating={hospital.rating} />
              <span className="doctor-hospital-name">{hospital.name}</span>
              <div className="doctor-card-footer">
                <em><b>$</b>{money(hospital.doctorFee)} consult</em>
                <small>View profile <i>{'->'}</i></small>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

