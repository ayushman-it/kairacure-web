import React, { useState, useEffect } from 'react';
import { MedicalVideoBackdrop } from '../components/common/MedicalVideoBackdrop.jsx';
import { StarRating } from '../components/common/StarRating.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { CallBackForm } from '../components/hospitals/CallBackForm.jsx';
import { EvaluationForm } from '../components/hospitals/EvaluationForm.jsx';
import {
  API_BASE,
  readStoredPatientSession,
  getPatientAttribution,
  hospitalGallery,
  HOSPITALS,
  accreditationText,
  getHospitalImage,
  handleImageFallback
} from '../data/constants.js';

export function DoctorDetailPage({ money, selectedHospital, selectedTreatment, setPage }) {
  const basePackage = selectedTreatment && selectedHospital?.tags?.includes(selectedTreatment.title) ? selectedTreatment.packageFrom : selectedHospital?.cost?.package || 0;
  const gallery = hospitalGallery(selectedHospital);
  const [activeTab, setActiveTab] = useState('About');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const doctorTreatmentOptions = ['All', ...new Set([...selectedHospital.tags, ...selectedHospital.doctorFocus].slice(0, 8))];
  const [doctorTreatmentFilter, setDoctorTreatmentFilter] = useState(selectedTreatment?.title ?? 'All');
  const [budget, setBudget] = useState({
    package: basePackage,
    flight: selectedHospital.cost.flight,
    visa: selectedHospital.cost.visa,
    local: selectedHospital.cost.local,
    stay: selectedHospital.cost.stay,
    service: selectedHospital.cost.service,
  });
  const rows = [
    ['package', 'Treatment package', 100, 30000],
    ['flight', 'Flights', 100, 3000],
    ['visa', 'Visa', 0, 600],
    ['local', 'Local transport', 20, 1000],
    ['stay', 'Stay estimate', 100, 5000],
    ['service', 'Care coordination', 0, 1500],
  ];
  const customTotal = Object.values(budget).reduce((sum, value) => sum + Number(value), 0);
  const scrollToHospitalForm = () => setShowAppointmentModal(true);
  const suggestedDoctorHospitals = HOSPITALS.filter((hospital) => {
    if (doctorTreatmentFilter === 'All') return hospital.city === selectedHospital.city || hospital.specialty === selectedHospital.specialty;
    return hospital.tags.includes(doctorTreatmentFilter) || hospital.doctorFocus.includes(doctorTreatmentFilter) || hospital.specialty === doctorTreatmentFilter;
  }).slice(0, 6);
  const hospitalAccreditation = accreditationText(selectedHospital.accreditations, selectedHospital.nabhType || selectedHospital.jciStatus || 'Update pending');
  const hospitalAddress = selectedHospital.address || selectedHospital.addressLine1 || [selectedHospital.city, selectedHospital.state, selectedHospital.country].filter(Boolean).join(', ');
  const hospitalBeds = selectedHospital.bedText || selectedHospital.beds || 'Update pending';
  const hospitalFounded = selectedHospital.foundedYear || selectedHospital.established || 'Update pending';
  const hospitalFacilities = Array.isArray(selectedHospital.facilities) && selectedHospital.facilities.length
    ? selectedHospital.facilities
    : ['International patient support', 'Hospital profile enrichment pending'];
  const hospitalAccreditationList = Array.isArray(selectedHospital.accreditations)
    ? selectedHospital.accreditations
    : String(selectedHospital.accreditations || hospitalAccreditation).split(',').map((item) => item.trim()).filter(Boolean);
  const hospitalDoctorsList = selectedHospital.doctorsList || selectedHospital.doctor || 'Doctor list update pending';
  const hospitalContact = selectedHospital.phone || selectedHospital.mobile || 'Contact update pending';
  const hospitalWebsite = selectedHospital.website || '';

  // Show modal after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAppointmentModal(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="profile-page hospital-cma-page">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: () => setPage('home') },
          { label: 'Hospitals', onClick: onBack || (() => setPage('hospitals')) },
          { label: selectedHospital.country, onClick: () => setPage('destinations') },
          { label: selectedHospital.name },
        ]}
      />
      <div className="profile-title-row hospital-detail-title">
        <div>
          <span>{selectedHospital.city}, {selectedHospital.country}</span>
          <h1>{selectedHospital.name}</h1>
          <div className="cma-hospital-tags">
            <span>{selectedHospital.specialty} Hospital</span>
            <span>{selectedHospital.jciAccredited ? 'JCI Accredited' : selectedHospital.nabhType || 'Accredited Hospital'}</span>
            <span>{selectedHospital.internationalPatientWing ? `International wing: ${selectedHospital.internationalPatientWing}` : 'International patient support'}</span>
          </div>
          <p>{selectedHospital.name} is part of the client/JCI hospital master database with mapped accreditation, contact, location, and specialty details for care coordination.</p>
        </div>
        <div className="rating-card">
          <strong>{selectedHospital.rating}</strong>
          <span>Patient rating</span>
          <small>{selectedHospital.value}% patients recommend this hospital</small>
        </div>
      </div>
      <div className="hospital-profile-hero">
        <div className="gallery-mosaic">
          <button className="gallery-image-button gallery-main" onClick={() => setGalleryOpen(true)} type="button">
            <img alt={`${selectedHospital.name} main`} onError={handleImageFallback} src={gallery[0]} />
          </button>
          {gallery.slice(1).map((image, index) => (
            <button className="gallery-image-button" key={image} onClick={() => setGalleryOpen(true)} type="button">
              <img alt={`${selectedHospital.name} gallery ${index + 1}`} onError={handleImageFallback} src={image} />
            </button>
          ))}
          <button className="gallery-open-button" onClick={() => setGalleryOpen(true)} type="button">All pictures</button>
        </div>
      </div>

      <div className="hospital-detail-info-grid">
        <span><b>Doctors List</b><small>{hospitalDoctorsList}</small></span>
        <span><b>Location</b><small>{selectedHospital.city || 'India'}</small></span>
        <span><b>Established in</b><small>{hospitalFounded}</small></span>
        <span><b>Accreditations</b><small>{hospitalAccreditation}</small></span>
        <span><b>Specialty</b><small>{selectedHospital.specialty}</small></span>
        <span><b>Contact</b><small>{hospitalContact}</small></span>
        <span><b>Number of beds</b><small>{hospitalBeds}</small></span>
        <span><b>Facilities</b><small>{hospitalFacilities.slice(0, 2).join(', ')}</small></span>
      </div>

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <>
          <div className="appointment-modal-backdrop" onClick={() => setShowAppointmentModal(false)} />
          <div className="appointment-modal">
            <button className="modal-close-btn" onClick={() => setShowAppointmentModal(false)} type="button">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
            <div className="modal-header d-block">
              <i className="fa-solid fa-phone" aria-hidden="true" />
              <h2>Get a Call Back</h2>
              <p>We'll call you back within 30 minutes to discuss your treatment options</p>
            </div>
            <CallBackForm selectedHospital={selectedHospital} />
          </div>
        </>
      )}

      <div className="hospital-action-row">
        <button onClick={scrollToHospitalForm} type="button">Get Call Back from {selectedHospital.name}</button>
      </div>

      <nav className="cma-detail-nav" aria-label="Hospital details sections">
        {['Overview', 'Treatments', 'Facilities', 'Reviews', 'Location', 'FAQs', 'Compare Hospitals'].map((item) => (
          <a href={`#hospital-${item.toLowerCase().replaceAll(' ', '-')}`} key={item}>{item}</a>
        ))}
      </nav>

      <section className="cma-overview-panel" id="hospital-overview">
        <div className="cma-overview-copy">
          <span>Patient Trusted Hospital</span>
          <h2>{selectedHospital.name}</h2>
          <p>{hospitalAddress}</p>
          <div className="cma-rating-row">
            <strong>{selectedHospital.rating}</strong>
            <StarRating rating={selectedHospital.rating} />
            <small>{hospitalAccreditation}</small>
          </div>
        </div>
        <img alt={selectedHospital.name} onError={handleImageFallback} src={getHospitalImage(selectedHospital)} />
      </section>

      <section className="cma-care-grid" aria-label="Care provided by hospital">
        {[
          ['Internationally accredited care', 'Verified doctors, modern departments, and structured patient support.'],
          ['Top hospital network', 'Shortlist care by treatment, city, doctor availability, and estimated budget.'],
          ['World-class infrastructure', 'Advanced diagnostics, modular theatres, ICU beds, and recovery support.'],
          ['Patient-first services', 'Dedicated coordinator for appointments, reports, travel, and follow-up.'],
        ].map(([title, text]) => (
          <article key={title}>
            <span aria-hidden="true"><UiIcon name="shield" /></span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="cma-content-grid">
        <article className="cma-about-card">
          <h2>About</h2>
          <p>
            {selectedHospital.name} is listed in the {selectedHospital.sourceSystem || 'client hospital master database'} for {selectedHospital.specialty.toLowerCase()} care
            {selectedHospital.city ? ` in ${selectedHospital.city}` : ''}. The profile includes client-provided address, accreditation, bed count, international patient wing, and contact details where available.
          </p>

          {/* Contact Details Section */}
          <div className="hospital-contact-details">
            <h3>Contact Information</h3>
            <div className="contact-details-grid">
              {hospitalContact && hospitalContact !== 'Contact update pending' && (
                <a href={`tel:${hospitalContact.replace(/\s/g, '')}`} className="contact-detail-item">
                  <div className="contact-icon">
                    <i className="fa-solid fa-phone" aria-hidden="true" />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Phone</span>
                    <strong className="contact-value">{hospitalContact}</strong>
                  </div>
                </a>
              )}

              {selectedHospital.email && selectedHospital.email !== 'Update pending' && (
                <a href={`mailto:${selectedHospital.email}`} className="contact-detail-item">
                  <div className="contact-icon">
                    <i className="fa-solid fa-envelope" aria-hidden="true" />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Email</span>
                    <strong className="contact-value">{selectedHospital.email}</strong>
                  </div>
                </a>
              )}

              {hospitalAddress && (
                <div className="contact-detail-item">
                  <div className="contact-icon">
                    <i className="fa-solid fa-location-dot" aria-hidden="true" />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Location</span>
                    <strong className="contact-value">{hospitalAddress}</strong>
                  </div>
                </div>
              )}

              {hospitalWebsite && (
                <a href={hospitalWebsite} rel="noreferrer" target="_blank" className="contact-detail-item">
                  <div className="contact-icon">
                    <i className="fa-solid fa-globe" aria-hidden="true" />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Website</span>
                    <strong className="contact-value">Visit Hospital Website</strong>
                  </div>
                </a>
              )}
            </div>
          </div>

          <h3>Medical Specialty</h3>
          <ul>
            {selectedHospital.tags.slice(0, 4).map((item) => <li key={item}>{item}</li>)}
          </ul>

          <h3>International Services</h3>
          <ul>
            <li>International patient wing: {selectedHospital.internationalPatientWing || 'Update pending'}.</li>
            {selectedHospital.internationalPatientWing && selectedHospital.internationalPatientWing !== 'no' && selectedHospital.internationalPatientWing !== 'yes' && (
              <li className="international-wing-details">{selectedHospital.internationalPatientWing}</li>
            )}
          </ul>
        </article>

        <aside className="cma-side-stack">
          <section id="hospital-treatments">
            <h3>Treatments {selectedHospital.name} is known for</h3>
            <div className="cma-chip-list">
              {[...selectedHospital.tags, ...selectedHospital.doctorFocus].slice(0, 8).map((item) => (
                <button onClick={() => setPage('treatments')} key={item} type="button">{item}</button>
              ))}
            </div>
          </section>
          <section id="hospital-facilities">
            <h3>Highlights</h3>
            <div className="cma-facility-grid">
              {[
                [`Bed Count: ${hospitalBeds}`],
                [`Established: ${hospitalFounded}`],
                [`Accreditation: ${hospitalAccreditation}`],
                [`Source: ${selectedHospital.sourceSystem || 'Client master data'}`],
                ...hospitalFacilities.slice(0, 4).map((item) => [item]),
              ].map(([item]) => <span key={item}><UiIcon name="shield" />{item}</span>)}
            </div>
          </section>
        </aside>
      </section>

      <section className="cma-content-grid cma-lower-grid">
        <article className="cma-about-card">
          <h2>Why International Patients Choose {selectedHospital.name}</h2>
          <div className="cma-info-pairs">
            <span><b>Hospital Type</b><small>Multispecialty Hospital</small></span>
            <span><b>Hospital Unit</b><small>{selectedHospital.specialty}</small></span>
            <span><b>Languages Spoken</b><small>{selectedHospital.languages.join(', ')}</small></span>
            <span><b>Location</b><small>{selectedHospital.city}, India</small></span>
          </div>
        </article>
        <article className="cma-about-card" id="hospital-reviews">
          <h2>Payment Method</h2>
          <div className="cma-facility-grid">
            {['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Insurance support'].map((item) => (
              <span key={item}><UiIcon name="cost" />{item}</span>
            ))}
          </div>
          <h2>Room Types</h2>
          <div className="cma-facility-grid">
            {['General Ward', 'Semi-Private Room', 'Private Room', 'Deluxe Room'].map((item) => (
              <span key={item}><UiIcon name="home" />{item}</span>
            ))}
          </div>
        </article>
      </section>

      <section className="hospital-doctors-section">
        <div className="cma-section-title">
          <h2>Suggested Doctors at {selectedHospital.name}</h2>
          <p>Filter doctors by treatment, compare experience, then book an appointment.</p>
        </div>
        <div className="doctor-filter-row">
          {doctorTreatmentOptions.map((item) => (
            <button
              className={doctorTreatmentFilter === item ? 'active' : ''}
              key={item}
              onClick={() => setDoctorTreatmentFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="vaidam-doctor-grid">
          {suggestedDoctorHospitals.map((hospital) => (
            <article key={`${hospital.id}-${hospital.doctor}`} className="vaidam-doctor-card">
              <div className="vaidam-doctor-top">
                <img alt={hospital.doctor} src={hospital.doctorImage} />
                <div>
                  <h3>{hospital.doctor}</h3>
                  <p>{hospital.doctorTitle}</p>
                  <strong>{hospital.experience} of experience</strong>
                  <StarRating rating={hospital.rating} />
                </div>
              </div>
              <div className="vaidam-doctor-actions">
                <button
                  onClick={() => {
                    setSelectedHospital(hospital);
                    setPage('doctor-detail');
                  }}
                  type="button"
                >
                  View Profile
                </button>
                <button onClick={scrollToHospitalForm} type="button">Book Appointment</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="profile-tabs">
        {['About', 'Specialisation', 'Doctors', 'Gallery', 'Infrastructure', 'Reviews'].map((item) => (
          <button className={activeTab === item ? 'active' : ''} key={item} onClick={() => setActiveTab(item)} type="button">
            {item}
          </button>
        ))}
      </div>

      <div className="profile-layout">
        <div className="profile-main">
          {activeTab === 'About' && (
            <article className="detail-panel hospital-about">
              <h2>About the hospital</h2>
              <p>
                {selectedHospital.name} is listed from the {selectedHospital.sourceSystem || 'client hospital master database'}.
                Its current master profile includes {selectedHospital.specialty} specialty, {hospitalAccreditation} accreditation status,
                and {hospitalAddress || 'location details pending'}.
              </p>
              <p>
                Secondary enrichment such as detailed facilities, live doctors, photos, and package pricing can be updated from admin
                without replacing the base hospital record.
              </p>
              <div className="hospital-stat-row">
                <span><strong>{hospitalFounded}</strong><small>Established</small></span>
                <span><strong>{hospitalBeds}</strong><small>Beds</small></span>
                <span><strong>{selectedHospital.internationalPatientWing || 'Update pending'}</strong><small>International wing</small></span>
                <span><strong>{selectedHospital.city || 'India'}</strong><small>Location</small></span>
              </div>
            </article>
          )}

          {activeTab === 'Specialisation' && (
            <article className="detail-panel">
              <h2>Team & Specialisation</h2>
              <div className="tag-cloud">
                {[...selectedHospital.tags, ...selectedHospital.doctorFocus, 'International patient care', 'Remote follow-up'].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          )}

          {activeTab === 'Doctors' && (
            <article className="detail-panel profile-doctor-strip">
              <img alt={selectedHospital.doctor} src={selectedHospital.doctorImage} />
              <div>
                <span>Featured doctor</span>
                <h2>{selectedHospital.doctor}</h2>
                <p>{selectedHospital.doctorTitle} with {selectedHospital.experience} experience.</p>
                <StarRating rating={selectedHospital.rating} />
                <strong>{money(selectedHospital.doctorFee)} consultation</strong>
                <button onClick={() => setPage('doctor-detail')} type="button">View doctor profile</button>
              </div>
            </article>
          )}

          {activeTab === 'Gallery' && (
            <article className="detail-panel">
              <h2>Gallery</h2>
              <div className="inline-gallery">
                {gallery.map((image, index) => (
                  <img alt={`${selectedHospital.name} interior ${index + 1}`} key={image} src={image} />
                ))}
              </div>
            </article>
          )}

          {activeTab === 'Infrastructure' && (
            <>
              <article className="detail-panel">
                <h2>Infrastructure</h2>
                <div className="feature-list">
                  {selectedHospital.infrastructure.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </article>
              <article className="detail-panel">
                <h2>Accreditations & certificates</h2>
                <div className="certificate-grid">
                  {hospitalAccreditationList.length ? hospitalAccreditationList.map((item) => (
                    <span key={item}><strong>{item.split(' ')[0]}</strong><small>{item}</small></span>
                  )) : <span><strong>Pending</strong><small>Accreditation details can be updated from admin.</small></span>}
                </div>
              </article>
            </>
          )}

          {activeTab === 'Reviews' && (
            <article className="detail-panel">
              <h2>Reviews & patient stories</h2>
              <div className="review-grid">
                {PATIENT_REVIEWS.map(([name, country, review]) => (
                  <blockquote key={name}>
                    <StarRating rating="5.0" />
                    <strong>{name}</strong>
                    <span>{country}</span>
                    <p>{review}</p>
                  </blockquote>
                ))}
              </div>
            </article>
          )}
        </div>

      </div>
      <section className="full-budget-section">
        <div className="budget-section-intro">
          <span>Cost transparency planner</span>
          <h2>Customize the full patient journey budget</h2>
          <p>Separate hospital package, travel, visa, local transport, stay and care coordination. This is the main decision layer before the patient requests an appointment.</p>
          <div className="budget-deep-copy">
            <h3>What this estimate explains</h3>
            <ul>
              <li>Hospital package is only one part of the journey.</li>
              <li>Travel and stay can change destination affordability.</li>
              <li>Care coordination keeps pickup, reports, follow-up, and support visible.</li>
            </ul>
          </div>
        </div>
        <div className="budget-workbench">
          <div className="budget-total-card">
            <span>Total journey estimate</span>
            <strong>{money(customTotal)}</strong>
            <small>Includes treatment, travel, visa, stay, local transport, and care coordination.</small>
          </div>
          <div className="budget-pill-row">
            <span>Editable</span>
            <span>API ready</span>
            <span>Transparent</span>
          </div>
          <div className="budget-customizer">
            {rows.map(([key, label, min, max]) => (
              <label key={key}>
                <span>
                  <small>{label}</small>
                  <strong>{money(Number(budget[key]))}</strong>
                </span>
                <input
                  max={max}
                  min={min}
                  onChange={(event) => setBudget((current) => ({ ...current, [key]: Number(event.target.value) }))}
                  step="10"
                  type="range"
                  value={budget[key]}
                />
              </label>
            ))}
          </div>
          <div className="cost-table budget-breakdown-grid">
            {rows.map(([key, label]) => (
              <span key={key}>
                <small>{label}</small>
                <strong>{money(Number(budget[key]))}</strong>
              </span>
            ))}
            <span className="total-line">
              <small>Total estimate</small>
              <strong>{money(customTotal)}</strong>
            </span>
          </div>
        </div>
      </section>
      {galleryOpen && (
        <div className="gallery-overlay" role="dialog" aria-modal="true" aria-label={`${selectedHospital.name} gallery`}>
          <div className="gallery-dialog">
            <button className="modal-close" onClick={() => setGalleryOpen(false)} type="button">x</button>
            <span>{selectedHospital.name}</span>
            <h2>Hospital gallery</h2>
            <div className="gallery-dialog-grid">
              {gallery.map((image, index) => (
                <img alt={`${selectedHospital.name} full gallery ${index + 1}`} key={image} src={image} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

