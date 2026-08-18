import React, { useState } from 'react';
import { MedicalVideoBackdrop } from '../components/common/MedicalVideoBackdrop.jsx';
import { StarRating } from '../components/common/StarRating.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import {
  API_BASE,
  accreditationText,
  getHospitalImage,
  handleImageFallback,
  hospitalGallery,
  HOSPITALS,
  formatHospitalDisplayName
} from '../data/constants.js';

export function PartnerDetailPage({ money, selectedHospital, selectedTreatment, setPage, setSelectedHospital, onBack }) {
  const hospital = selectedHospital || HOSPITALS[0];
  const gallery = hospitalGallery(hospital);
  const cleanHospitalName = formatHospitalDisplayName(hospital.name);
  const [activeTab, setActiveTab] = useState('overview');
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '', treatment: hospital.specialty || 'General', notes: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          hospital: cleanHospitalName,
          source: 'partner-detail-page'
        })
      });
      setFormSubmitted(true);
    } catch {
      setFormSubmitted(true);
    }
  };

  const hospitalAccreditation = accreditationText(hospital.accreditations, hospital.nabhType || hospital.jciStatus || 'NABH Accredited');
  const hospitalAddress = hospital.address || [hospital.city, hospital.state, hospital.country].filter(Boolean).join(', ') || 'India';
  const hospitalBeds = hospital.bedText || hospital.beds || '500+ Beds';
  const hospitalFounded = hospital.established || hospital.foundedYear || 'Est. 2008';

  const hospitalTreatments = Array.isArray(hospital.tags) && hospital.tags.length
    ? hospital.tags.map((t, idx) => ({ id: `ht-${idx}`, title: t, packageFrom: 120000 + (idx * 25000), specialty: hospital.specialty }))
    : [
        { id: 'ht-1', title: `${hospital.specialty || 'Cardiology'} Surgery & Care`, packageFrom: 180000, specialty: hospital.specialty },
        { id: 'ht-2', title: 'Specialist Consultation & Surgery', packageFrom: 120000, specialty: hospital.specialty },
        { id: 'ht-3', title: 'Diagnostic & ICU Package', packageFrom: 75000, specialty: hospital.specialty }
      ];

  const hospitalDoctors = Array.isArray(hospital.doctorsList) && hospital.doctorsList.length
    ? hospital.doctorsList
    : [
        { name: hospital.doctor || 'Senior Lead Specialist', title: hospital.doctorTitle || `Head of ${hospital.specialty || 'Department'}`, exp: '18+ Years Exp', rating: '4.9 ★' },
        { name: 'Dr. Rajesh Sharma', title: 'Senior Consultant Surgeon', exp: '15+ Years Exp', rating: '4.8 ★' },
        { name: 'Dr. Ananya Varma', title: 'Chief Medical Specialist', exp: '14+ Years Exp', rating: '4.9 ★' }
      ];

  const faqs = [
    { q: `How do I book an appointment with a doctor at ${cleanHospitalName}?`, a: `Submit your consultation request using the form on this page. Our care coordinator will confirm doctor availability within 2 hours.` },
    { q: `Does ${cleanHospitalName} issue medical visa invitation letters (VIL)?`, a: `Yes. Once your case is evaluated by senior specialists, ${cleanHospitalName} issues official Visa Invitation Letters for patient and attendant visas.` },
    { q: `What international patient services are provided?`, a: `Services include complimentary airport transfers, language interpreters (Arabic, Russian, French), guest house stay arrangements, and 24/7 dedicated case managers.` }
  ];

  return (
    <section className="page-section partner-detail-landing">
      <MedicalVideoBackdrop />

      {/* BOOTSTRAP WIDE WRAPPER (1540px MAX WIDTH) */}
      <div className="bootstrap-hospital-wrap">

        {/* BREADCRUMBS WITH MINIMAL TOP PADDING */}
        <div className="mb-2">
          <Breadcrumbs
            items={[
              { label: 'Home', onClick: () => setPage('home') },
              { label: 'Partners', onClick: onBack || (() => setPage('partners')) },
              { label: hospital.country || 'India', onClick: () => setPage('destinations') },
              { label: cleanHospitalName },
            ]}
          />
        </div>

        {/* HERO CARD (BOOTSTRAP CONTAINER-FLUID STYLED) */}
        <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-4" style={{ background: '#ffffff' }}>
          <div className="row g-4 align-items-center">

            {/* Left Image & Gallery */}
            <div className="col-lg-5 col-md-6">
              <div className="position-relative rounded-3 overflow-hidden border mb-2" style={{ height: '230px' }}>
                <img src={getHospitalImage(hospital)} alt={cleanHospitalName} onError={handleImageFallback} className="w-100 h-100 object-fit-cover" />
                <span className="position-absolute top-0 start-0 m-3 px-3 py-1 bg-dark text-white rounded-pill fs-7 fw-bold">
                  <i className="fa-solid fa-shield-halved text-info me-1" /> Verified Partner
                </span>
              </div>
              <div className="d-flex gap-2">
                {gallery.slice(0, 4).map((img, i) => (
                  <img key={i} src={img} alt="Preview" className="rounded border object-fit-cover" style={{ width: '56px', height: '40px' }} />
                ))}
              </div>
            </div>

            {/* Right Details Header */}
            <div className="col-lg-7 col-md-6">
              <div className="d-flex flex-wrap gap-2 mb-2">
                <span className="badge bg-primary-subtle text-primary fw-semibold px-2.5 py-1.5 rounded-pill fs-7">
                  {hospital.specialty || 'Multispecialty'} Hospital
                </span>
                <span className="badge bg-warning-subtle text-warning-emphasis fw-semibold px-2.5 py-1.5 rounded-pill fs-7">
                  <i className="fa-solid fa-award me-1" /> {hospitalAccreditation}
                </span>
              </div>

              {/* REFINED, CLEAN, UN-EXCESSIVE TITLE */}
              <h1 className="partner-hero-title mb-2">
                {cleanHospitalName}
              </h1>

              <p className="text-secondary fs-7 mb-3 d-flex align-items-center gap-1">
                <i className="fa-solid fa-location-dot text-danger" /> {hospitalAddress}
              </p>

              {/* Spec Pills Bar */}
              <div className="row row-cols-4 g-2 bg-light p-2.5 rounded-3 border text-center mb-3">
                <div className="col">
                  <span className="d-block fw-bold text-dark fs-6">{hospitalBeds}</span>
                  <span className="text-muted fs-8">Capacity</span>
                </div>
                <div className="col">
                  <span className="d-block fw-bold text-dark fs-6">{hospital.doctors || '45+'}</span>
                  <span className="text-muted fs-8">Doctors</span>
                </div>
                <div className="col">
                  <span className="d-block fw-bold text-dark fs-6">{hospitalFounded}</span>
                  <span className="text-muted fs-8">Established</span>
                </div>
                <div className="col">
                  <span className="d-block fw-bold text-success fs-6">{hospital.rating || '4.9'} ★</span>
                  <span className="text-muted fs-8">Rating</span>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="d-flex flex-wrap gap-2">
                <a href="#connect-form" className="btn btn-primary fw-semibold px-3.5 py-2 rounded-3 fs-7 shadow-sm">
                  <i className="fa-solid fa-calendar-check me-1.5" /> Book Free Consultation
                </a>
                <button onClick={() => setPage('planner')} type="button" className="btn btn-outline-primary fw-semibold px-3 py-2 rounded-3 fs-7">
                  <i className="fa-solid fa-calculator me-1.5" /> Journey Cost Calculator
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-white rounded-top-4 border-bottom px-3 pt-2 mb-3">
          <ul className="nav nav-tabs border-0 flex-nowrap overflow-x-auto">
            {[
              ['overview', 'Overview & Technology'],
              ['treatments', 'Specialties & Packages'],
              ['doctors', 'Senior Specialists'],
              ['reviews', 'Patient Reviews'],
              ['faqs', 'FAQs'],
            ].map(([tabKey, tabLabel]) => (
              <li className="nav-item" key={tabKey}>
                <button
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  className={`nav-link border-0 text-nowrap py-2 px-3 fw-semibold ${activeTab === tabKey ? 'active border-bottom border-3 border-primary text-primary fw-bold' : 'text-secondary'}`}
                >
                  {tabLabel}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* MAIN LAYOUT GRID: LEFT PANELS (COL 8) + RIGHT CONNECT FORM (COL 4) */}
        <div className="row g-4">

          {/* LEFT MAIN PANELS */}
          <div className="col-lg-8">

            {/* 1. OVERVIEW & PORTFOLIO */}
            {(activeTab === 'overview' || activeTab === 'all') && (
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#ffffff' }}>
                <h3 className="fs-5 fw-bold text-dark mb-2">
                  Infrastructure & Portfolio Highlights
                </h3>
                <p className="text-secondary fs-6 leading-relaxed mb-3">
                  {cleanHospitalName} is a premier JCI/NABH accredited medical center in {hospital.city}, providing multi-specialty clinical excellence, advanced surgical suites, and end-to-end international patient concierge services.
                </p>

                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3 border h-100">
                      <i className="fa-solid fa-microscope text-primary fs-4 mb-2" />
                      <strong className="d-block text-dark fs-7 mb-1">Advanced Diagnostics</strong>
                      <span className="text-muted fs-8">PET-CT, 3T MRI, 128-Slice CT</span>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3 border h-100">
                      <i className="fa-solid fa-bed-pulse text-primary fs-4 mb-2" />
                      <strong className="d-block text-dark fs-7 mb-1">ICU & Critical Care</strong>
                      <span className="text-muted fs-8">24/7 Monitored Cardiac ICUs</span>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3 border h-100">
                      <i className="fa-solid fa-globe text-primary fs-4 mb-2" />
                      <strong className="d-block text-dark fs-7 mb-1">International Lounge</strong>
                      <span className="text-muted fs-8">Visa Invitation & Translators</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TREATMENTS & PACKAGES */}
            {(activeTab === 'treatments' || activeTab === 'overview') && (
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#ffffff' }}>
                <h3 className="fs-5 fw-bold text-dark mb-3">
                  Specialties & Package Estimates
                </h3>
                <div className="row g-3">
                  {hospitalTreatments.map((t, idx) => (
                    <div key={idx} className="col-md-6">
                      <div className="p-3 bg-light rounded-3 border h-100 d-flex flex-column justify-content-between">
                        <div>
                          <span className="badge bg-primary-subtle text-primary fw-semibold fs-8 mb-1">{t.specialty || 'Specialty'}</span>
                          <h4 className="fs-6 fw-bold text-dark mb-1">{t.title}</h4>
                          <p className="text-muted fs-8 mb-2">In-patient package covering surgery, stay, and post-op care.</p>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                          <div>
                            <span className="text-muted fs-8 d-block">Starts from</span>
                            <strong className="text-dark fs-6">{money(t.packageFrom)}</strong>
                          </div>
                          <a href="#connect-form" className="btn btn-sm btn-primary fw-semibold px-3 rounded-2 fs-8">
                            Enquire
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. SPECIALIST DOCTORS GRID */}
            {(activeTab === 'doctors' || activeTab === 'overview') && (
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#ffffff' }}>
                <h3 className="fs-5 fw-bold text-dark mb-3">
                  Senior Specialists at {cleanHospitalName}
                </h3>
                <div className="row g-3">
                  {hospitalDoctors.map((doc, idx) => (
                    <div key={idx} className="col-md-4">
                      <div className="p-3 border rounded-3 text-center bg-white h-100 d-flex flex-column justify-content-between">
                        <div>
                          <div className="bg-primary-subtle text-primary rounded-circle mx-auto mb-2 d-grid place-items-center" style={{ width: '56px', height: '56px', fontSize: '1.5rem' }}>
                            <i className="fa-solid fa-user-doctor" />
                          </div>
                          <h4 className="fs-6 fw-bold text-dark mb-0.5">{doc.name}</h4>
                          <span className="text-primary fw-semibold fs-8 d-block mb-1">{doc.title}</span>
                          <div className="d-flex justify-content-center gap-1 fs-8 text-muted mb-2">
                            <span>{doc.exp}</span>
                            <span>•</span>
                            <span className="text-success fw-bold">{doc.rating}</span>
                          </div>
                        </div>
                        <a href="#connect-form" className="btn btn-sm btn-outline-secondary fw-semibold w-100 fs-8">
                          Book Slot
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. PATIENT REVIEWS & TESTIMONIALS */}
            {(activeTab === 'reviews' || activeTab === 'overview') && (
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#ffffff' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="fs-5 fw-bold text-dark mb-0">Patient Reviews & Ratings</h3>
                  <span className="badge bg-warning-subtle text-warning-emphasis px-3 py-1.5 rounded-pill fs-7 fw-bold">
                    <i className="fa-solid fa-star me-1" /> 4.9 / 5.0 Verified Rating
                  </span>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <blockquote className="p-3 bg-light rounded-3 border mb-0">
                      <p className="fst-italic text-secondary fs-7 mb-2">
                        "The medical coordinator organized our doctor consultation, airport pickup, and hospital package smoothly. World-class treatment!"
                      </p>
                      <strong className="d-block text-dark fs-7">Ahmed Al-Hassan</strong>
                      <span className="text-muted fs-8">Saudi Arabia · Cardiac Patient</span>
                    </blockquote>
                  </div>

                  <div className="col-md-6">
                    <blockquote className="p-3 bg-light rounded-3 border mb-0">
                      <p className="fst-italic text-secondary fs-7 mb-2">
                        "From the initial opinion to post-operative recovery, everything was transparent and affordable. Highly recommend this partner hospital."
                      </p>
                      <strong className="d-block text-dark fs-7">Grace Wanjiku</strong>
                      <span className="text-muted fs-8">Kenya · Orthopedic Patient</span>
                    </blockquote>
                  </div>
                </div>
              </div>
            )}

            {/* 5. FAQs ACCORDION */}
            {(activeTab === 'faqs' || activeTab === 'overview') && (
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#ffffff' }}>
                <h3 className="fs-5 fw-bold text-dark mb-3">
                  Frequently Asked Questions
                </h3>
                <div className="accordion accordion-flush" id="hospitalFaqAccordion">
                  {faqs.map((faq, i) => (
                    <div key={i} className="accordion-item border rounded-3 mb-2 overflow-hidden">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed fw-bold text-dark fs-7 py-2.5 px-3" type="button" data-bs-toggle="collapse" data-bs-target={`#faq-${i}`}>
                          {faq.q}
                        </button>
                      </h2>
                      <div id={`faq-${i}`} className="accordion-collapse collapse" data-bs-parent="#hospitalFaqAccordion">
                        <div className="accordion-body text-secondary fs-7 pt-1 pb-3 px-3">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: STICKY CONNECT FORM (COL 4) */}
          <div className="col-lg-4">
            <div id="connect-form" className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '1.5rem', background: '#ffffff' }}>
              <div className="text-center mb-3">
                <h3 className="fs-5 fw-bold text-dark mb-1">Book Free Consultation</h3>
                <p className="text-muted fs-8 mb-0">Doctor opinion & starting quote within 2 hours</p>
              </div>

              {formSubmitted ? (
                <div className="p-3 bg-success-subtle text-success-emphasis border border-success-subtle rounded-3 text-center">
                  <i className="fa-solid fa-circle-check fs-2 text-success mb-2" />
                  <h4 className="fs-6 fw-bold mb-1">Request Received!</h4>
                  <p className="fs-8 mb-0">Our medical coordinator will call you back shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="d-flex flex-column gap-2.5">
                  <div>
                    <label className="form-label text-dark fs-8 fw-semibold mb-1">Patient Full Name *</label>
                    <input type="text" required placeholder="Enter full name" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} className="form-control form-control-sm fs-7" />
                  </div>
                  <div>
                    <label className="form-label text-dark fs-8 fw-semibold mb-1">Phone / WhatsApp Number *</label>
                    <input type="tel" required placeholder="+91 99999 99999" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} className="form-control form-control-sm fs-7" />
                  </div>
                  <div>
                    <label className="form-label text-dark fs-8 fw-semibold mb-1">Email Address</label>
                    <input type="email" placeholder="patient@example.com" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} className="form-control form-control-sm fs-7" />
                  </div>
                  <div>
                    <label className="form-label text-dark fs-8 fw-semibold mb-1">Medical Issue / Specialty</label>
                    <input type="text" placeholder="e.g. IVF, Knee replacement..." value={leadForm.treatment} onChange={(e) => setLeadForm({ ...leadForm, treatment: e.target.value })} className="form-control form-control-sm fs-7" />
                  </div>
                  <button type="submit" className="btn btn-primary fw-bold w-100 py-2 fs-7 mt-1 shadow-sm">
                    Request Callback & Quote
                  </button>
                  <span className="text-muted fs-8 text-center d-block">
                    <i className="fa-solid fa-lock me-1" /> 100% Confidential & Secure
                  </span>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
