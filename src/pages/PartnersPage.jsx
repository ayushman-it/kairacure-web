import React, { useState, useMemo, useEffect } from 'react';
import { MedicalVideoBackdrop } from '../components/common/MedicalVideoBackdrop.jsx';
import { SkeletonCard } from '../components/common/SkeletonCard.jsx';
import { StarRating } from '../components/common/StarRating.jsx';
import { EvaluationForm } from '../components/hospitals/EvaluationForm.jsx';
import {
  TREATMENTS,
  TREATMENT_GROUPS,
  accreditationText,
  handleImageFallback,
  getHospitalImage
} from '../data/constants.js';

function CheckboxDropdown({ id, label, openDropdown, options, selectedValues, onClear, onToggle, setOpenDropdown }) {
  const isOpen = openDropdown === id;
  return (
    <div className={`checkbox-dropdown-wrap${isOpen ? ' open' : ''}`}>
      <button className="dropdown-trigger-btn" onClick={() => setOpenDropdown(isOpen ? '' : id)} type="button">
        <span>{selectedValues.length ? `${label} (${selectedValues.length})` : label}</span>
        <i className="fa-solid fa-chevron-down" aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="dropdown-menu-panel">
          <div className="dropdown-menu-header">
            <strong>{label}</strong>
            {selectedValues.length > 0 && <button onClick={onClear} type="button">Clear</button>}
          </div>
          <div className="dropdown-options-list">
            {options.map((opt) => (
              <label key={opt} className="dropdown-option-item">
                <input type="checkbox" checked={selectedValues.includes(opt)} onChange={() => onToggle(opt)} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PartnersPage({ hospitals, isLoading = false, money, selectedTreatment, setPage, setSelectedHospital, treatments = TREATMENTS }) {
  const cityOptions = useMemo(() => [...new Set(hospitals.map((hospital) => hospital.city))].sort(), [hospitals]);
  const treatmentOptions = useMemo(() => treatments.map((treatment) => treatment.title || treatment.name), [treatments]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedTreatments, setSelectedTreatments] = useState(selectedTreatment?.title ? [selectedTreatment.title] : []);
  const [openDropdown, setOpenDropdown] = useState('');
  const [visibleHospitalCount, setVisibleHospitalCount] = useState(5);
  const [isFiltering, setIsFiltering] = useState(false);

  const toggleValue = (setter) => (value) => {
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  };

  const filteredDirectoryHospitals = useMemo(() => hospitals.filter((hospital) => {
    const tags = Array.isArray(hospital.tags) ? hospital.tags : [];
    const matchesCity = selectedCities.length === 0 || selectedCities.includes(hospital.city);
    const matchesDepartment = selectedDepartments.length === 0 || selectedDepartments.some((department) => tags.some((tag) => treatments.find((treatment) => (treatment.title || treatment.name) === tag)?.group === department));
    const matchesTreatment = selectedTreatments.length === 0 || selectedTreatments.some((treatment) => tags.includes(treatment) || hospital.specialty === treatments.find((item) => (item.title || item.name) === treatment)?.specialty);
    return matchesCity && matchesDepartment && matchesTreatment;
  }), [hospitals, selectedCities, selectedDepartments, selectedTreatments, treatments]);
  const visibleDirectoryHospitals = filteredDirectoryHospitals.slice(0, visibleHospitalCount);
  const showHospitalSkeleton = isLoading || isFiltering;

  useEffect(() => {
    setVisibleHospitalCount(5);
    if (!isLoading) {
      setIsFiltering(true);
      const timer = window.setTimeout(() => setIsFiltering(false), 360);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [selectedCities, selectedDepartments, selectedTreatments, hospitals, isLoading]);

  return (
    <section className="page-section hospitals-directory" id="partners">
      <MedicalVideoBackdrop />
      <div className="hospital-filter-bar">
        <div className="filter-static-field">India</div>
        <CheckboxDropdown
          id="cities"
          label="All Cities"
          openDropdown={openDropdown}
          onClear={() => setSelectedCities([])}
          onToggle={toggleValue(setSelectedCities)}
          options={cityOptions}
          selectedValues={selectedCities}
          setOpenDropdown={setOpenDropdown}
        />
        <CheckboxDropdown
          id="treatments"
          label="Treatments"
          openDropdown={openDropdown}
          onClear={() => setSelectedTreatments([])}
          onToggle={toggleValue(setSelectedTreatments)}
          options={treatmentOptions}
          selectedValues={selectedTreatments}
          setOpenDropdown={setOpenDropdown}
        />
        <CheckboxDropdown
          id="departments"
          label="Departments"
          openDropdown={openDropdown}
          onClear={() => setSelectedDepartments([])}
          onToggle={toggleValue(setSelectedDepartments)}
          options={TREATMENT_GROUPS}
          selectedValues={selectedDepartments}
          setOpenDropdown={setOpenDropdown}
        />
        <button onClick={() => {
          setIsFiltering(true);
          window.setTimeout(() => setIsFiltering(false), 360);
        }} type="button">Search</button>
      </div>

      <div className="section-heading">
        <div>
          <h2>Popular Partners & Hospitals</h2>
          <p>Compare providers by destination, speciality, doctors, value, and full estimated budget.</p>
        </div>
      </div>

      <div className="quick-filter-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <span>Quick Filters</span>
        <button type="button">JCI Accreditation</button>
        <button type="button">NABH</button>
        <button type="button">Multi Specialty</button>
        <button
          type="button"
          onClick={() => setPage('partner-growth')}
          style={{ background: '#2563eb', color: '#ffffff', fontWeight: 700, marginLeft: 'auto', borderRadius: '8px', padding: '0.5rem 1rem', border: 'none', cursor: 'pointer' }}
        >
          <i className="fa-solid fa-bullhorn" aria-hidden="true" style={{ marginRight: '0.4rem' }} /> Hospital Partner Growth & DOOH Ads
        </button>
      </div>

      <div className="hospital-directory-layout">
        <div className="hospital-list">
          {showHospitalSkeleton && Array.from({ length: 3 }, (_, index) => <SkeletonCard className="hospital-skeleton" key={`hospital-skeleton-${index}`} />)}
          {!showHospitalSkeleton && visibleDirectoryHospitals.map((hospital) => (
            <article className="hospital-card" key={hospital.id}>
              <div className="hospital-card-main">
                <button
                  className="hospital-thumb-button"
                  onClick={() => {
                    setSelectedHospital(hospital);
                    setPage('partner-detail');
                  }}
                  type="button"
                >
                  <img alt={hospital.name} onError={handleImageFallback} src={getHospitalImage(hospital)} />
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
                  <div className="rating-row">
                    <StarRating rating={hospital.rating} />
                    <span>{hospital.rating} ({hospital.doctors} Ratings)</span>
                  </div>
                  <p>
                    {hospital.name} is listed from the {hospital.sourceSystem || 'client hospital master database'} for {hospital.specialty?.toLowerCase() || 'specialist'} care
                    {hospital.city ? ` in ${hospital.city}` : ''}. {hospital.accreditations ? `Accreditation: ${accreditationText(hospital.accreditations)}.` : 'Accreditation details can be updated from admin.'}
                  </p>
                  <button className="show-more-link" onClick={() => {
                    setSelectedHospital(hospital);
                    setPage('partner-detail');
                  }} type="button">Show More</button>
                </div>
              </div>
              <div className="hospital-facts">
                <span>Established: {hospital.established || hospital.foundedYear || 'Update pending'}</span>
                <span>Beds: {hospital.bedText || hospital.beds || 'Update pending'}</span>
                <span>{hospital.jciAccredited ? 'JCI Accredited' : accreditationText(hospital.accreditations, hospital.nabhType || 'Accredited Hospital')}</span>
                <span>Location: {hospital.city || hospital.addressLine1 || 'India'}</span>

                <div className="hospital-accreditation-logos">
                  {hospital.jciAccredited ? (
                    <div className="accreditation-badge jci-badge">
                      <img src="https://cdn.prod.website-files.com/63dc099d352018653241b1a7/63fe8bab2259ca569b27dcdf_gold-seal-approval.png" alt="JCI Accredited" />
                      <span>JCI</span>
                    </div>
                  ) : (
                    <div className="accreditation-badge nabh-badge">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQntV_tAgbdUJrZpcCIbKGbqdoM9GaOgerg3Q" alt="NABH Accredited" />
                      <span>NABH</span>
                    </div>
                  )}
                </div>

                <button onClick={() => setPage('planner')} type="button">Book Appointment</button>
              </div>
            </article>
          ))}

          {filteredDirectoryHospitals.length > visibleHospitalCount && (
            <button className="directory-load-more" onClick={() => setVisibleHospitalCount((prev) => prev + 5)} type="button">
              Load More Partners
            </button>
          )}
        </div>

        <div className="hospital-form-side">
          <EvaluationForm selectedHospital={hospitals[0]} title="Quick Consultation" />
        </div>
      </div>
    </section>
  );
}
