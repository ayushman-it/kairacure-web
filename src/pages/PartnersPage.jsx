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

export function PartnersPage({ hospitals, isLoading = false, money, selectedTreatment, setPage, setSelectedHospital, treatments = TREATMENTS }) {
  const cityOptions = useMemo(() => [...new Set(hospitals.map((hospital) => hospital.city))].sort(), [hospitals]);
  const treatmentOptions = useMemo(() => treatments.map((treatment) => treatment.title || treatment.name), [treatments]);
  
  // DEFAULT FILTERS: NOTHING PRE-SELECTED!
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedTreatmentFilter, setSelectedTreatmentFilter] = useState('All');
  const [quickFilter, setQuickFilter] = useState('all'); // 'all', 'jci', 'nabh', 'multispecialty'
  const [visibleHospitalCount, setVisibleHospitalCount] = useState(5);
  const [isFiltering, setIsFiltering] = useState(false);

  const filteredDirectoryHospitals = useMemo(() => hospitals.filter((hospital) => {
    const tags = Array.isArray(hospital.tags) ? hospital.tags : [];
    
    // Country Filter
    const matchesCountry = selectedCountry === 'All' || (hospital.country && hospital.country.toLowerCase() === selectedCountry.toLowerCase());
    
    // City Filter
    const matchesCity = selectedCity === 'All' || hospital.city === selectedCity;
    
    // Department Filter
    const matchesDepartment = selectedDepartment === 'All' || tags.some((tag) => treatments.find((treatment) => (treatment.title || treatment.name) === tag)?.group === selectedDepartment);
    
    // Treatment Filter
    const matchesTreatment = selectedTreatmentFilter === 'All' || tags.includes(selectedTreatmentFilter) || hospital.specialty === selectedTreatmentFilter;
    
    // Quick Filter Pill
    let matchesQuick = true;
    if (quickFilter === 'jci') {
      matchesQuick = hospital.jciAccredited === true;
    } else if (quickFilter === 'nabh') {
      matchesQuick = !hospital.jciAccredited && (hospital.accreditations || '').toLowerCase().includes('nabh');
    } else if (quickFilter === 'multispecialty') {
      matchesQuick = (hospital.specialty || '').toLowerCase().includes('multi') || tags.length > 2;
    }

    return matchesCountry && matchesCity && matchesDepartment && matchesTreatment && matchesQuick;
  }), [hospitals, selectedCountry, selectedCity, selectedDepartment, selectedTreatmentFilter, quickFilter, treatments]);

  const visibleDirectoryHospitals = filteredDirectoryHospitals.slice(0, visibleHospitalCount);
  const showHospitalSkeleton = isLoading || isFiltering;

  const handleResetAllFilters = () => {
    setSelectedCountry('All');
    setSelectedCity('All');
    setSelectedDepartment('All');
    setSelectedTreatmentFilter('All');
    setQuickFilter('all');
  };

  useEffect(() => {
    setVisibleHospitalCount(5);
    if (!isLoading) {
      setIsFiltering(true);
      const timer = window.setTimeout(() => setIsFiltering(false), 300);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [selectedCountry, selectedCity, selectedDepartment, selectedTreatmentFilter, quickFilter, hospitals, isLoading]);

  return (
    <section className="page-section hospitals-directory" id="partners" style={{ padding: '24px 16px 80px', background: '#f8fafc' }}>
      <MedicalVideoBackdrop />
      <style>{`
        .partner-filter-container-v2 {
          max-width: 1380px;
          margin: 0 auto 24px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px 20px;
          box-shadow: 0 4px 20px rgba(0, 102, 254, 0.05);
          display: grid;
          grid-template-columns: repeat(4, 1fr) 130px;
          gap: 12px;
          align-items: center;
          position: relative;
          z-index: 10;
        }
        @media (max-width: 992px) {
          .partner-filter-container-v2 {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 576px) {
          .partner-filter-container-v2 {
            grid-template-columns: 1fr;
          }
        }
        .partner-select-control {
          height: 44px;
          padding: 0 36px 0 14px;
          background: #ffffff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E") no-repeat right 14px center;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          font-size: 0.86rem;
          font-weight: 600;
          color: #0f172a;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          transition: all 0.15s ease;
          width: 100%;
        }
        .partner-select-control.has-value {
          border-color: #0066fe;
          color: #0066fe;
          background-color: #f0f7ff;
        }
        .partner-select-control:focus {
          border-color: #0066fe;
          box-shadow: 0 0 0 3px rgba(0, 102, 254, 0.12);
        }
        .partner-search-btn-v2 {
          height: 44px !important;
          background: #0066fe !important;
          color: #ffffff !important;
          border: none !important;
          border-radius: 10px !important;
          font-weight: 700 !important;
          font-size: 0.9rem !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          box-shadow: 0 4px 14px rgba(0, 102, 254, 0.25) !important;
          transition: all 0.2s ease !important;
          width: 100% !important;
        }
        .partner-search-btn-v2:hover {
          background: #0052cc !important;
        }
        .partner-quick-pill-v2 {
          padding: 7px 18px;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          transition: all 0.15s ease;
        }
        .partner-quick-pill-v2.active {
          background: #0066fe;
          color: #ffffff;
          border-color: #0066fe;
          box-shadow: 0 2px 8px rgba(0, 102, 254, 0.25);
        }
        .hospital-card-v2-wide {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 22px;
          margin-bottom: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          display: grid;
          grid-template-columns: 220px 1fr 200px;
          gap: 24px;
          align-items: center;
          transition: all 0.2s ease;
        }
        .hospital-card-v2-wide:hover {
          border-color: #bfdbfe;
          box-shadow: 0 8px 28px rgba(0, 102, 254, 0.08);
        }
        @media (max-width: 992px) {
          .hospital-card-v2-wide {
            grid-template-columns: 1fr;
          }
        }
        .partners-main-grid {
          max-width: 1380px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 24px;
        }
        @media (max-width: 992px) {
          .partners-main-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Top Filter Bar (Expanded to 1380px) */}
      <div className="partner-filter-container-v2">
        {/* Country Filter */}
        <select 
          value={selectedCountry} 
          onChange={(e) => setSelectedCountry(e.target.value)}
          className={`partner-select-control ${selectedCountry !== 'All' ? 'has-value' : ''}`}
        >
          <option value="All">All Countries</option>
          <option value="India">India</option>
          <option value="UAE">UAE</option>
          <option value="Thailand">Thailand</option>
          <option value="Turkey">Turkey</option>
        </select>

        {/* City Filter */}
        <select 
          value={selectedCity} 
          onChange={(e) => setSelectedCity(e.target.value)}
          className={`partner-select-control ${selectedCity !== 'All' ? 'has-value' : ''}`}
        >
          <option value="All">All Cities</option>
          {cityOptions.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        {/* Treatments Filter */}
        <select 
          value={selectedTreatmentFilter} 
          onChange={(e) => setSelectedTreatmentFilter(e.target.value)}
          className={`partner-select-control ${selectedTreatmentFilter !== 'All' ? 'has-value' : ''}`}
        >
          <option value="All">All Treatments</option>
          {treatmentOptions.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Departments Filter */}
        <select 
          value={selectedDepartment} 
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className={`partner-select-control ${selectedDepartment !== 'All' ? 'has-value' : ''}`}
        >
          <option value="All">All Departments</option>
          {TREATMENT_GROUPS.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        {/* Search Button */}
        <button 
          className="partner-search-btn-v2"
          onClick={() => {
            setIsFiltering(true);
            window.setTimeout(() => setIsFiltering(false), 300);
          }} 
          type="button"
        >
          <i className="bi bi-search" />
          <span>Search</span>
        </button>
      </div>

      {/* Section Title & Clear Action */}
      <div style={{ maxWidth: '1380px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Popular Partners &amp; Hospitals
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Compare providers by destination, speciality, doctors, value, and full estimated budget.
          </p>
        </div>

        {(selectedCity !== 'All' || selectedDepartment !== 'All' || selectedTreatmentFilter !== 'All' || quickFilter !== 'all' || selectedCountry !== 'All') && (
          <button
            onClick={handleResetAllFilters}
            type="button"
            style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <i className="bi bi-x-circle-fill" /> Reset All Filters
          </button>
        )}
      </div>

      {/* Quick Filters Row */}
      <div style={{ maxWidth: '1380px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quick Filters:</span>
        <button 
          type="button" 
          className={`partner-quick-pill-v2 ${quickFilter === 'all' ? 'active' : ''}`}
          onClick={() => setQuickFilter('all')}
        >
          All Hospitals
        </button>
        <button 
          type="button" 
          className={`partner-quick-pill-v2 ${quickFilter === 'jci' ? 'active' : ''}`}
          onClick={() => setQuickFilter('jci')}
        >
          JCI Accredited
        </button>
        <button 
          type="button" 
          className={`partner-quick-pill-v2 ${quickFilter === 'nabh' ? 'active' : ''}`}
          onClick={() => setQuickFilter('nabh')}
        >
          NABH Accredited
        </button>
        <button 
          type="button" 
          className={`partner-quick-pill-v2 ${quickFilter === 'multispecialty' ? 'active' : ''}`}
          onClick={() => setQuickFilter('multispecialty')}
        >
          Multi Specialty
        </button>

        {/* Uniform Royal Blue Button (NO Black background!) */}
        <button
          type="button"
          onClick={() => setPage('partner-growth')}
          style={{ background: '#0066fe', color: '#ffffff', fontWeight: 700, marginLeft: 'auto', borderRadius: '10px', padding: '8px 18px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(0,102,254,0.22)' }}
        >
          <i className="bi bi-broadcast-pin" style={{ color: '#ffffff' }} /> Hospital Partner Growth &amp; DOOH Ads
        </button>
      </div>

      {/* Main Content Layout (Expanded to 1380px) */}
      <div className="partners-main-grid">
        
        {/* Hospitals Directory List */}
        <div>
          {showHospitalSkeleton && Array.from({ length: 3 }, (_, index) => <SkeletonCard className="hospital-skeleton" key={`hospital-skeleton-${index}`} />)}
          
          {!showHospitalSkeleton && filteredDirectoryHospitals.length === 0 && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
              <i className="bi bi-hospital" style={{ fontSize: '2.8rem', color: '#94a3b8', display: 'block', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>No Hospitals Match Your Filter Criteria</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 18px' }}>Try resetting your filter selections to browse our full network of accredited partner hospitals.</p>
              <button onClick={handleResetAllFilters} className="partner-search-btn-v2" style={{ margin: '0 auto', width: 'auto', padding: '0 24px' }}>
                Reset Filters
              </button>
            </div>
          )}

          {!showHospitalSkeleton && visibleDirectoryHospitals.map((hospital) => (
            <article className="hospital-card-v2-wide" key={hospital.id}>
              
              {/* Thumbnail Image Box */}
              <div 
                onClick={() => {
                  setSelectedHospital(hospital);
                  setPage('partner-detail');
                }}
                style={{ cursor: 'pointer', position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '145px', border: '1px solid #f1f5f9' }}
              >
                <img 
                  alt={hospital.name} 
                  onError={handleImageFallback} 
                  src={getHospitalImage(hospital)} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', color: '#ffffff', padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>
                  {hospital.jciAccredited ? 'JCI Gold Seal' : 'NABH'}
                </span>
              </div>

              {/* Main Info Section */}
              <div>
                <h3 
                  onClick={() => {
                    setSelectedHospital(hospital);
                    setPage('partner-detail');
                  }}
                  style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px', cursor: 'pointer', transition: 'color 0.15s ease' }}
                >
                  {hospital.name}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <StarRating rating={hospital.rating} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{hospital.rating || 4.8}</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>({hospital.doctors || 324} Ratings)</span>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 10px', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {hospital.name} is listed from the client hospital master database for {hospital.specialty?.toLowerCase() || 'specialist'} care in {hospital.city || 'India'}.
                </p>

                <span 
                  onClick={() => {
                    setSelectedHospital(hospital);
                    setPage('partner-detail');
                  }}
                  style={{ fontSize: '0.8rem', color: '#0066fe', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  View Hospital Profile &amp; Doctors →
                </span>
              </div>

              {/* Specs & Action Column */}
              <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>
                  Est: <strong style={{ color: '#0f172a' }}>{hospital.established || hospital.foundedYear || '2012'}</strong>
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>
                  Beds: <strong style={{ color: '#0f172a' }}>{hospital.bedText || hospital.beds || '400+'}</strong>
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>
                  Location: <strong style={{ color: '#0f172a' }}>{hospital.city || 'Delhi'}</strong>
                </span>

                <button 
                  onClick={() => {
                    setSelectedHospital(hospital);
                    setPage('planner');
                  }} 
                  type="button" 
                  style={{
                    height: '42px',
                    width: '100%',
                    background: '#0066fe',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(0, 102, 254, 0.22)'
                  }}
                >
                  <i className="bi bi-calendar-check-fill" />
                  <span>Book Appointment</span>
                </button>
              </div>

            </article>
          ))}

          {filteredDirectoryHospitals.length > visibleHospitalCount && (
            <div style={{ textAlign: 'center', margin: '28px 0' }}>
              <button 
                onClick={() => setVisibleHospitalCount((prev) => prev + 5)} 
                type="button"
                style={{ background: '#ffffff', border: '1.5px solid #0066fe', color: '#0066fe', padding: '12px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(0,102,254,0.08)' }}
              >
                <span>Load More Partner Hospitals</span>
                <i className="bi bi-chevron-down" />
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar Consultation Form */}
        <div>
          <div style={{ background: '#ffffff', border: '1.5px solid #0066fe', borderRadius: '18px', padding: '22px', boxShadow: '0 4px 20px rgba(0, 102, 254, 0.08)', position: 'sticky', top: '90px' }}>
            <EvaluationForm selectedHospital={hospitals[0]} title="Quick Consultation" />
          </div>
        </div>

      </div>
    </section>
  );
}
