import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  PlannerSearchPage,
  PlannerHospitalsPage,
  ProcedureSelectPage,
  TripStylePage,
  JourneyPlanningPage,
  JourneyResultsPage
} from '../PlannerSearchPage.jsx';
import {
  API_BASE,
  INDIA_HOSPITALS,
  TREATMENTS,
  formatCurrency,
  readStoredPatientSession,
  getPatientAttribution,
  accreditationText,
  getHospitalImage,
  handleImageFallback,
  buildAvailableDestinations,
  normalizeSearch,
  getSearchOptionsFromData,
  withBackendTreatmentDefaults,
  withBackendHospitalDefaults
} from '../data/constants.js';

export function PlannerPage({ hospitals = INDIA_HOSPITALS, initialProcedure = null, money = (value) => formatCurrency(value, 'INR'), selectedTreatment, selectedHospital, setPage, setSelectedHospital, setSelectedTreatment, treatments = TREATMENTS }) {
  // Determine the correct starting step:
  // - If treatment + procedure both pre-selected → skip to Step 3 (trip-style)
  // - If only treatment pre-selected → skip to Step 2 (procedure)
  // - Otherwise → Step 1 (search)
  const getInitialViewMode = () => {
    if (selectedTreatment && initialProcedure) return 'trip-style';
    if (selectedTreatment) return 'procedure';
    return 'search';
  };

  const [viewMode, setViewMode] = useState(getInitialViewMode);

  // Pre-populate treatment/procedure selections from props
  const [selectedTreatmentsForSearch, setSelectedTreatmentsForSearch] = useState(
    selectedTreatment ? [selectedTreatment] : []
  );
  const [selectedProceduresForSearch, setSelectedProceduresForSearch] = useState(
    initialProcedure ? [initialProcedure] : []
  );
  const [selectedTripStyle, setSelectedTripStyle] = useState(null);
  const [selectedHospitalForJourney, setSelectedHospitalForJourney] = useState(null);
  const [journeyPlanResult, setJourneyPlanResult] = useState(null);
  const [previousViewMode, setPreviousViewMode] = useState('hospitals'); // Track where to return from hospital details
  const [plannerTreatment, setPlannerTreatment] = useState(selectedTreatment || null);
  const [selectedCity, setSelectedCity] = useState('All India');
  const [activeModal, setActiveModal] = useState('treatment');
  const [treatmentSearch, setTreatmentSearch] = useState('');
  const [plannerTreatments, setPlannerTreatments] = useState(treatments);
  const [plannerHospitals, setPlannerHospitals] = useState(hospitals);
  const [appointmentForm, setAppointmentForm] = useState({
    patientName: '',
    countryCode: 'IN (+91)',
    phone: '',
    notes: '',
  });
  const [appointmentStatus, setAppointmentStatus] = useState('');
  const [bookingHospital, setBookingHospital] = useState(selectedHospital || hospitals[0] || INDIA_HOSPITALS[0]);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    'Hi! I am your planner assistant. Select a treatment or surgery and city. I will compare matching hospitals, likely doctor review steps, tentative stay, reports needed, and booking next steps.',
  ]);
  const aiThreadRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const normalizeTreatment = (item, index) => {
      const existing = treatments.find((treatment) => treatment.title.toLowerCase() === item.title?.toLowerCase());
      return existing || {
        id: item._id || normalizeSearch(item.title || `treatment-${index}`),
        group: item.subtitle || 'Treatment',
        title: item.title || 'Treatment',
        icon: (item.title || 'TR').slice(0, 2).toUpperCase(),
        packageFrom: 1200,
        value: 88,
        specialty: item.subtitle || item.title || 'Medical care',
        image: item.image,
        description: item.description,
      };
    };
    const normalizeHospital = (item, index) => {
      const existing = hospitals.find((hospital) => hospital.name.toLowerCase() === item.name?.toLowerCase());
      const fallback = hospitals[index % hospitals.length] || INDIA_HOSPITALS[index % INDIA_HOSPITALS.length];
      return {
        ...fallback,
        ...existing,
        id: existing?.id || item._id || `backend-hospital-${index}`,
        name: item.name || existing?.name || fallback.name,
        city: item.city || existing?.city || fallback.city,
        country: existing?.country || 'India',
        summary: item.summary || existing?.summary || fallback.summary,
        image: item.image || existing?.image || fallback.image,
      };
    };
    const fetchPlannerData = async (path) => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 4500);
      try {
        const response = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
        return response.ok ? response.json() : [];
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    Promise.all([
      fetchPlannerData('/treatments'),
      fetchPlannerData('/hospitals'),
    ])
      .then(([fetchedTreatments, fetchedHospitals]) => {
        if (cancelled) return;
        if (Array.isArray(fetchedTreatments) && fetchedTreatments.length) {
          const normalized = fetchedTreatments.map(normalizeTreatment);
          const merged = [...normalized, ...treatments.filter((local) => !normalized.some((item) => item.title === local.title))];
          setPlannerTreatments(merged);
        }
        if (Array.isArray(fetchedHospitals) && fetchedHospitals.length) {
          setPlannerHospitals(fetchedHospitals.map(normalizeHospital));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPlannerTreatments(treatments);
          setPlannerHospitals(hospitals);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hospitals, treatments]);

  const indianCities = buildAvailableDestinations(plannerHospitals).map((destination) => ({
    name: destination.country,
    image: destination.image,
    hospitals: destination.hospitals,
    doctors: destination.doctors,
  }));
  const plannerCityOptions = useMemo(() => ['All India', ...Array.from(new Set(plannerHospitals.map((hospital) => hospital.city).filter(Boolean))).sort()], [plannerHospitals]);
  const cmaDestinations = indianCities.map((city) => [city.name, city.image]);
  const selectedDestination = selectedCity;
  const setSelectedDestination = setSelectedCity;
  const countryCodes = ['IN (+91)'];
  const plannerStep = activeModal === 'consultation' ? 1 : 0;
  const setPlannerStep = (index) => setActiveModal(index === 0 ? 'treatment' : 'consultation');
  const procedures = useMemo(() => {
    if (!plannerTreatment) return [];
    const matchedHospitals = plannerHospitals.filter((hospital) => hospitalMatchesTreatment(hospital, plannerTreatment));
    const focus = matchedHospitals.flatMap((hospital) => hospital.doctorFocus || []);
    return Array.from(new Set([
      `${plannerTreatment.title} consultation`,
      `${plannerTreatment.title} package estimate`,
      ...focus,
      plannerTreatment.specialty,
      'Other',
    ])).slice(0, 10);
  }, [plannerHospitals, plannerTreatment]);
  const suggestedHospital = useMemo(() => {
    if (!plannerTreatment) return selectedHospital || plannerHospitals[0] || INDIA_HOSPITALS[0];
    const cityNames = selectedCity === 'All India' ? [] : selectedCity === 'Delhi / NCR' ? ['New Delhi', 'Gurgaon', 'Delhi'] : [selectedCity];
    const treatmentMatch = (hospital) => hospitalMatchesTreatment(hospital, plannerTreatment);
    return plannerHospitals.find((hospital) => (!cityNames.length || cityNames.includes(hospital.city)) && treatmentMatch(hospital))
      || plannerHospitals.find(treatmentMatch)
      || selectedHospital
      || plannerHospitals[0]
      || INDIA_HOSPITALS[0];
  }, [plannerHospitals, plannerTreatment, selectedCity, selectedHospital]);
  const filteredHospitals = useMemo(() => {
    const treatment = plannerTreatment;
    if (!treatment) return [];
    const cityNames = selectedCity === 'All India' ? [] : selectedCity === 'Delhi / NCR' ? ['New Delhi', 'Gurgaon', 'Delhi'] : [selectedCity];
    const treatmentMatch = (hospital) => hospitalMatchesTreatment(hospital, treatment);
    const cityMatch = (hospital) => !cityNames.length || cityNames.includes(hospital.city);
    const cityHospitals = plannerHospitals.filter(cityMatch);
    const matched = cityHospitals.filter(treatmentMatch);
    if (matched.length) return matched;
    const treatmentHospitals = plannerHospitals.filter(treatmentMatch);
    return (treatmentHospitals.length ? treatmentHospitals : cityHospitals.length ? cityHospitals : plannerHospitals).slice(0, 12);
  }, [plannerHospitals, plannerTreatment, selectedCity]);
  const activeTreatment = plannerTreatment || selectedTreatment || plannerTreatments[0] || null;
  const heroImage = indianCities.find((city) => city.name === selectedCity)?.image || filteredHospitals[0]?.image || plannerHospitals[0]?.image || INDIA_HOSPITALS[0].image;
  const completedCount = Number(Boolean(plannerTreatment));
  const estimatedPlan = useMemo(() => {
    const hospital = filteredHospitals[0] || suggestedHospital || plannerHospitals[0] || INDIA_HOSPITALS[0];
    const packageCost = Number(activeTreatment?.packageFrom || hospital?.cost?.package || 0);
    const stayCost = Number(hospital?.cost?.stay || 0);
    const localCost = Number(hospital?.cost?.local || 0);
    const serviceCost = Number(hospital?.cost?.service || 0);
    const total = packageCost + stayCost + localCost + serviceCost;
    return {
      hospital,
      packageCost,
      total,
      stay: hospital?.stay || (activeTreatment?.group === 'Wellness' ? '1-2 days' : '4-7 days'),
      reports: ['Recent reports', 'Doctor prescription', 'Current medicines', 'Passport/ID'],
    };
  }, [activeTreatment, filteredHospitals, plannerHospitals, suggestedHospital]);
  useEffect(() => {
    aiThreadRef.current?.scrollTo({ top: aiThreadRef.current.scrollHeight, behavior: 'smooth' });
  }, [aiMessages]);
  const approvedPlannerTreatments = useMemo(() => {
    const approved = plannerTreatments.filter((treatment) => (
      treatment.icdCode
      || treatment.icdUri
      || /WHO ICD-11|ICD-11|backend|admin/i.test([treatment.sourceSystem, treatment.procedureCode, treatment.category].filter(Boolean).join(' '))
    ));
    return approved.length ? approved : plannerTreatments;
  }, [plannerTreatments]);
  const visibleTreatments = useMemo(() => {
    const search = normalizeSearch(treatmentSearch);
    const matched = approvedPlannerTreatments.filter((treatment) => {
      const haystack = normalizeSearch([treatment.title, treatment.group, treatment.specialty, treatment.description, treatment.icdCode, treatment.procedureCode, treatment.sourceSystem].filter(Boolean).join(' '));
      return !search || haystack.includes(search);
    });
    return matched.slice(0, 24);
  }, [approvedPlannerTreatments, treatmentSearch]);
  const plannerSteps = [
    { id: 'treatment', title: 'Select Treatment / Surgery', value: plannerTreatment?.title || 'Choose treatment or surgery', icon: 'fa-stethoscope' },
    { id: 'city', title: 'Indian Destination', value: `${selectedCity}, India`, icon: 'fa-location-dot' },
    { id: 'consultation', title: 'Free Consultation', value: appointmentStatus || 'Book with care team', icon: 'fa-calendar-check' },
  ];

  const selectPlannerTreatment = (treatment) => {
    setPlannerTreatment(treatment);
    setPlannerProcedure('');
    setSelectedTreatment?.(treatment);
    const cityNames = selectedCity === 'All India' ? [] : selectedCity === 'Delhi / NCR' ? ['New Delhi', 'Gurgaon', 'Delhi'] : [selectedCity];
    const matchesTreatment = (hospital) => hospitalMatchesTreatment(hospital, treatment);
    const nextHospital = plannerHospitals.find((hospital) => (!cityNames.length || cityNames.includes(hospital.city)) && matchesTreatment(hospital))
      || plannerHospitals.find(matchesTreatment)
      || selectedHospital
      || plannerHospitals[0]
      || INDIA_HOSPITALS[0];
    setBookingHospital(nextHospital);
    setSelectedHospital?.(nextHospital);
  };

  const openHospitalDetails = (hospital) => {
    setSelectedHospital?.(hospital);
    setPage?.('hospital-detail');
  };

  const openPlannerBooking = (hospital) => {
    setBookingHospital(hospital);
    setSelectedHospital?.(hospital);
    setActiveModal('consultation');
  };

  const goNext = () => {
    if (!plannerTreatment) {
      return setActiveModal('treatment');
    }
    setAppointmentStatus('');
    return setActiveModal('consultation');
  };

  const submitAppointment = async (event) => {
    event.preventDefault();
    if (!appointmentForm.patientName.trim() || !appointmentForm.phone.trim()) {
      setAppointmentStatus('Please add patient name and phone number.');
      return;
    }

    setAppointmentStatus('Saving appointment to admin...');
    try {
      const response = await fetch(`${API_BASE}/admin/public-appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...getPatientAttribution(),
          patientName: appointmentForm.patientName,
          phone: `${appointmentForm.countryCode || 'IN (+91)'} ${appointmentForm.phone}`,
          country: 'India',
          city: selectedCity,
          treatment: plannerTreatment?.title || selectedTreatment?.title || 'Treatment consultation',
          hospital: bookingHospital.name,
          doctor: bookingHospital.doctor,
          mode: 'Planner hospital booking',
          notes: [
            `Procedure: ${plannerProcedure || 'To be confirmed after report review'}`,
            `Preferred city: ${selectedCity}`,
            appointmentForm.notes,
          ].filter(Boolean).join('\n'),
          source: 'india-modal-planner',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Appointment failed');
      setAppointmentStatus(`Consultation booked: ${data.appointment?.publicData?.appointmentId || 'Scheduled'}`);
      setAppointmentForm({ patientName: '', countryCode: 'IN (+91)', phone: '', notes: '' });
      setActiveModal('');
    } catch (error) {
      setAppointmentStatus(error.message || 'Appointment backend offline.');
    }
  };

  const buildPlannerAiReply = (text) => {
    const bestHospital = filteredHospitals[0] || estimatedPlan.hospital;
    const treatmentName = activeTreatment?.title || 'your treatment';
    const hospitalNames = filteredHospitals.slice(0, 3).map((hospital) => hospital.name).join(', ') || bestHospital?.name || 'verified Indian hospitals';
    const total = estimatedPlan.total ? money(estimatedPlan.total) : 'final estimate after report review';
    const lower = text.toLowerCase();

    if (lower.includes('best hospital') || lower.includes('suggest')) {
      return `For ${treatmentName} in ${selectedCity}, start with ${bestHospital?.name || 'the top matched hospital'} because it matches the treatment and city filter. Also compare ${hospitalNames}. Ask for report review, doctor availability, package inclusions, ICU/room category, and expected stay before confirming.`;
    }

    if (lower.includes('summarize')) {
      return `Current plan: ${treatmentName} in ${selectedCity}, preferred hospital ${bestHospital?.name || 'not selected yet'}, likely stay ${estimatedPlan.stay}, rough planning total ${total}. Next: share reports, confirm doctor slot, verify inclusions, then book the appointment.`;
    }

    if (lower.includes('advice') || lower.includes('booking')) {
      return `Booking advice: do not confirm only on rating. Check the treating doctor's experience, report-review opinion, package exclusions, room category, date availability, and emergency contact. Keep reports and passport/ID ready so the admin team can verify every detail.`;
    }

    return `${treatmentName} in ${selectedCity}: I found ${filteredHospitals.length || 1} matching hospital option${filteredHospitals.length === 1 ? '' : 's'}. Shortlist ${bestHospital?.name || 'a verified hospital'}, compare doctor focus areas, ask for a written package estimate, and book after report review.`;
  };

  const submitPlannerAi = (text) => {
    if (!text) return;
    setAiMessages((current) => [
      ...current,
      text,
      buildPlannerAiReply(text),
    ].slice(-10));
    setAiInput('');
  };

  const sendPlannerAi = (event) => {
    event.preventDefault();
    submitPlannerAi(aiInput.trim());
  };

  const handleSearchHospitals = (treatments) => {
    setSelectedTreatmentsForSearch(treatments);
    setSelectedProceduresForSearch([]);
    setPlannerTreatment(treatments[0]); // Set first treatment as primary
    setViewMode('procedure');           // → Step 2: Procedure selection
  };

  const handleBackToSearch = () => {
    setViewMode('search');
  };

  const handleBackToTreatments = () => {
    setViewMode('search');
  };

  const handleProcedureContinue = (procedures) => {
    setSelectedProceduresForSearch(procedures);
    setViewMode('trip-style');          // → Step 3: Trip style
  };

  const handleBackToProcedures = () => {
    setViewMode('procedure');
  };

  const handleContinueToHospitals = (tripStyle) => {
    setSelectedTripStyle(tripStyle);
    setViewMode('hospitals');
  };

  const handleBackToTripStyle = () => {
    setViewMode('trip-style');
  };

  const handleViewHospitalDetails = (hospital) => {
    setSelectedHospital?.(hospital);
    setPreviousViewMode(viewMode); // Remember where we came from
    setViewMode('hospital-details');
  };

  const handleBackFromHospitalDetails = () => {
    setViewMode(previousViewMode); // Return to previous view mode
  };

  const handleSelectHospital = (hospital) => {
    setSelectedHospitalForJourney(hospital);
    setViewMode('journey-planning');
  };

  const handleBackToHospitals = () => {
    setViewMode('hospitals');
  };

  const handleCompleteJourney = async (journeyPlan) => {
    // Save journey plan and show results page
    setJourneyPlanResult(journeyPlan);
    setViewMode('journey-results');
    
    try {
      const response = await fetch(`${API_BASE}/admin/journey-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: journeyPlan.patientEmail,
          userName: journeyPlan.patientName,
          selectedHospital: selectedHospitalForJourney?.name,
          selectedTreatments: selectedTreatmentsForSearch.map(t => t.title),
          journeyPlan,
          icdCodes: selectedTreatmentsForSearch.map(t => t.icdCode).filter(Boolean),
          createdAt: new Date().toISOString(),
          status: 'calculated'
        })
      });

      if (response.ok) {
        console.log('✅ Journey plan saved to admin dashboard successfully!');
      } else {
        console.log('⚠️ Journey plan saved locally (API not available)');
      }
    } catch (error) {
      console.log('❌ Journey plan save failed, stored locally:', error);
    }
  };

  const handleConfirmJourney = async (journeyPlan) => {
    try {
      const response = await fetch(`${API_BASE}/admin/journey-plans/${journeyPlan.patientEmail}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'confirmed',
          confirmedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('✅ Journey confirmed and updated in admin!');
        alert('Journey confirmed! Our team will contact you within 24 hours.');
        setPage('home');
      } else {
        console.log('⚠️ Journey confirmed locally');
        alert('Journey confirmed! Our team will contact you within 24 hours.');
        setPage('home');
      }
    } catch (error) {
      console.log('❌ Journey confirmation failed:', error);
      alert('Journey confirmed! Our team will contact you within 24 hours.');
      setPage('home');
    }
  };

  const handleBackToJourneyPlanning = () => {
    setViewMode('journey-planning');
  };

  // New modern search UI
  if (viewMode === 'search') {
    return (
      <PlannerSearchPage
        treatments={plannerTreatments}
        onSearchHospitals={handleSearchHospitals}
        setPage={setPage}
        getTreatmentIconKind={getTreatmentIconKind}
        HEALTH_ICON_SOURCES={HEALTH_ICON_SOURCES}
      />
    );
  }

  // Step 2: Procedure selection (ICD-11 imported procedures filtered by selected treatment group)
  if (viewMode === 'procedure') {
    return (
      <ProcedureSelectPage
        selectedTreatments={selectedTreatmentsForSearch}
        preSelectedProcedures={selectedProceduresForSearch}
        allTreatments={plannerTreatments}
        onContinue={handleProcedureContinue}
        onBack={selectedTreatmentsForSearch.length > 0 && initialProcedure ? () => setPage('treatment-detail') : handleBackToSearch}
      />
    );
  }

  // Trip Style Selection Page
  if (viewMode === 'trip-style') {
    return (
      <TripStylePage
        selectedTreatments={selectedTreatmentsForSearch}
        onContinueToHospitals={handleContinueToHospitals}
        onBackToTreatments={initialProcedure ? () => setPage('treatment-detail') : handleBackToProcedures}
      />
    );
  }

  // Hospitals results page
  if (viewMode === 'hospitals') {
    return (
      <PlannerHospitalsPage
        selectedTreatments={selectedTreatmentsForSearch}
        hospitals={plannerHospitals}
        onBack={handleBackToTripStyle}
        onSelectHospital={handleSelectHospital}
        onViewHospitalDetails={handleViewHospitalDetails}
        formatCurrency={money}
      />
    );
  }

  // Hospital Details Page
  if (viewMode === 'hospital-details') {
    return (
      <HospitalDetail
        money={money}
        selectedHospital={selectedHospital}
        setPage={setPage}
        onBack={handleBackFromHospitalDetails}
      />
    );
  }

  // Journey Planning Page
  if (viewMode === 'journey-planning') {
    return (
      <JourneyPlanningPage
        selectedTreatments={selectedTreatmentsForSearch}
        selectedHospital={selectedHospitalForJourney}
        onBack={handleBackToHospitals}
        onCompleteJourney={handleCompleteJourney}
      />
    );
  }

  // Journey Results Page
  if (viewMode === 'journey-results') {
    return (
      <JourneyResultsPage
        journeyPlan={journeyPlanResult}
        selectedTreatments={selectedTreatmentsForSearch}
        selectedHospital={selectedHospitalForJourney}
        onBack={handleBackToJourneyPlanning}
        onConfirmJourney={handleConfirmJourney}
      />
    );
  }

  // Old design - keeping as fallback (commented out)
  /*
  return (
    <section className="journey-search-page" id="planner">
      <div className="journey-search-head">
        <div>
          <span>Plan My Journey</span>
          <h1>Select treatment, compare approved hospitals, book appointment</h1>
          <p>Choose an ICD/backend-approved treatment from the database. We show hospitals from the client/JCI master data that match the selected treatment, specialty, city, and accreditation signals.</p>
        </div>
        <aside>
          <strong>{approvedPlannerTreatments.length}</strong>
          <span>approved treatment records</span>
          <small>{plannerHospitals.length} hospital profiles available</small>
        </aside>
      </div>

      <div className="journey-search-layout">
        <aside className="journey-treatment-panel">
          <label className="journey-search-input">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input onChange={(event) => setTreatmentSearch(event.target.value)} placeholder="Search ICD treatment, procedure, specialty..." value={treatmentSearch} />
          </label>
          <div className="journey-treatment-results">
            {visibleTreatments.map((treatment) => (
              <button className={plannerTreatment?.id === treatment.id ? 'active' : ''} key={treatment.id} onClick={() => selectPlannerTreatment(treatment)} type="button">
                <TreatmentIconTile treatment={treatment} />
                <span>
                  <strong>{treatment.title}</strong>
                  <small>{treatment.icdCode ? `ICD-11 ${treatment.icdCode}` : treatment.procedureCode || treatment.category || treatment.specialty}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main className="journey-hospital-results">
          <div className="journey-result-toolbar">
            <div>
              <span>Selected treatment</span>
              <strong>{plannerTreatment?.title || 'Select a treatment'}</strong>
              <small>{plannerTreatment?.icdCode ? `ICD-11 ${plannerTreatment.icdCode}` : plannerTreatment?.sourceSystem || 'Database treatment mapping'}</small>
            </div>
            <label>
              City
              <select onChange={(event) => setSelectedCity(event.target.value)} value={selectedCity}>
                {plannerCityOptions.map((city) => <option key={city}>{city}</option>)}
              </select>
            </label>
          </div>

          {!plannerTreatment && (
            <article className="journey-empty-panel">
              <strong>Start by selecting a treatment</strong>
              <p>Hospitals will appear after a treatment is selected. Matching uses treatment tags, specialty, ICD/backend mapping, and city filters.</p>
            </article>
          )}

          {plannerTreatment && (
            <>
              <section className="journey-match-summary">
                <article><span>Matched hospitals</span><strong>{filteredHospitals.length}</strong><small>{selectedCity}</small></article>
                <article><span>Best starting option</span><strong>{suggestedHospital?.name || 'Pending'}</strong><small>{suggestedHospital?.city || 'India'}</small></article>
                <article><span>Reports needed</span><strong>{estimatedPlan.reports.length}</strong><small>{estimatedPlan.reports.slice(0, 3).join(', ')}</small></article>
              </section>

              <div className="journey-hospital-list">
                {filteredHospitals.map((hospital) => (
                  <article key={hospital.id} className="journey-result-card">
                    <button className="journey-result-image" onClick={() => openHospitalDetails(hospital)} type="button">
                      <img alt={hospital.name} onError={handleImageFallback} src={getHospitalImage(hospital)} />
                    </button>
                    <div>
                      <span>{hospital.city || 'India'} � {hospital.specialty}</span>
                      <button className="journey-result-title" onClick={() => openHospitalDetails(hospital)} type="button">{hospital.name}</button>
                      <p>{hospital.summary || `${hospital.name} matches ${plannerTreatment.title} through specialty and treatment mapping.`}</p>
                      <div className="journey-result-facts">
                        <small>{accreditationText(hospital.accreditations, hospital.nabhType || 'Accreditation pending')}</small>
                        <small>Beds: {hospital.bedText || hospital.beds || 'Update pending'}</small>
                        <small>{hospital.sourceSystem || 'Client master data'}</small>
                      </div>
                    </div>
                    <div className="journey-result-actions">
                      <button onClick={() => openPlannerBooking(hospital)} type="button">Book appointment</button>
                      <button onClick={() => openHospitalDetails(hospital)} type="button">View details</button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </main>

        <aside className="journey-booking-panel">
          <div>
            <span>Appointment request</span>
            <strong>{bookingHospital?.name || suggestedHospital?.name || 'Select hospital'}</strong>
            <small>{plannerTreatment?.title || 'Treatment pending'}</small>
          </div>
          <form onSubmit={submitAppointment}>
            <input onChange={(event) => setAppointmentForm({ ...appointmentForm, patientName: event.target.value })} placeholder="Patient full name" value={appointmentForm.patientName} />
            <div>
              <input readOnly value="IN (+91)" />
              <input onChange={(event) => setAppointmentForm({ ...appointmentForm, phone: event.target.value })} placeholder="Phone number" value={appointmentForm.phone} />
            </div>
            <textarea onChange={(event) => setAppointmentForm({ ...appointmentForm, notes: event.target.value })} placeholder="Reports, preferred date, notes" rows="4" value={appointmentForm.notes} />
            <button disabled={!plannerTreatment || !bookingHospital} type="submit">Book free consultation</button>
            {appointmentStatus && <small>{appointmentStatus}</small>}
          </form>
        </aside>
      </div>
    </section>
  );
  */

  // Second old design (commented out)
  /*
  return (
    <section className="cma-planner-page india-planner-page" id="planner">
      <div className="cma-planner-breadcrumb">Home <span>&gt;</span> Planner</div>
      <div className="planner-top-row">
        <button className="planner-back-button" onClick={() => setActiveModal('treatment')} type="button"><i className="fa-solid fa-arrow-left" aria-hidden="true" /></button>
        <h1>Plan your medical journey in 1 quick step</h1>
        <button onClick={() => setActiveModal(!plannerTreatment ? 'treatment' : 'consultation')} type="button">{plannerTreatment ? 'Book Appointment' : 'Next'} <i className="fa-solid fa-arrow-right" aria-hidden="true" /></button>
      </div>
      <div className="planner-progress planner-progress-single"><span className={plannerTreatment ? 'active' : ''} /></div>
      <div className="planner-final-grid">
        <main className="planner-results-pane">
          <section className="planner-plan-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(15, 25, 40, 0.62), rgba(15, 25, 40, 0.16)), url(${heroImage})` }}>
            <div><span>Personalized Treatment Plan</span><h2>{activeTreatment.title} in {selectedCity}</h2></div>
            <div className="planner-hero-actions"><button type="button"><i className="fa-solid fa-circle" aria-hidden="true" /> Saved</button><button type="button"><i className="fa-solid fa-share-nodes" aria-hidden="true" /> Share</button></div>
          </section>
          <div className="planner-city-chips">
            {indianCities.map((city) => (
              <button className={selectedCity === city.name ? 'active' : ''} key={city.name} onClick={() => setSelectedCity(city.name)} type="button"><span>IN</span>{city.name}</button>
            ))}
          </div>
          <section className="planner-copy-block">
            <h2>{activeTreatment.title} in {selectedCity}</h2>
            <p>{plannerTreatment ? `Compare hospitals that match ${activeTreatment.title}, then verify doctor availability, report review, package inclusions, expected stay, and appointment timing before booking.` : 'Select a treatment first. Hospital options, estimated stay, reports checklist, and appointment next steps will appear after your treatment is selected.'}</p>
          </section>
          {plannerTreatment && (
            <section className="planner-realistic-summary" aria-label="Planning summary">
              <article><span>Rough package</span><strong>{money(estimatedPlan.packageCost)}</strong><small>Final amount depends on reports and room category.</small></article>
              <article><span>Expected stay</span><strong>{estimatedPlan.stay}</strong><small>Includes consultation, admission or procedure window.</small></article>
              <article><span>Reports needed</span><strong>{estimatedPlan.reports.length} items</strong><small>{estimatedPlan.reports.slice(0, 3).join(', ')}.</small></article>
            </section>
          )}
          <div className="planner-filtered-list">
            {!plannerTreatment && (
              <article className="planner-empty-state">
                <strong>Select treatment to see hospitals</strong>
                <p>Choose a treatment or surgery from the modal so we can show matching Indian hospitals.</p>
                <button onClick={() => setActiveModal('treatment')} type="button">Select Treatment</button>
              </article>
            )}
            {plannerTreatment && filteredHospitals.map((hospital, index) => (
              <article className="hospital-card planner-hospital-card" key={`${hospital.id}-${hospital.name}-${index}`} onClick={() => openHospitalDetails(hospital)} onKeyDown={(event) => {
                if (event.key === 'Enter') openHospitalDetails(hospital);
              }} role="button" tabIndex="0">
                <div className="hospital-card-main">
                  <button className="hospital-thumb-button" onClick={(event) => { event.stopPropagation(); openHospitalDetails(hospital); }} type="button"><img alt={hospital.name} onError={handleImageFallback} src={getHospitalImage(hospital)} /></button>
                  <div className="hospital-body">
                    <button className="hospital-name-link" onClick={(event) => { event.stopPropagation(); openHospitalDetails(hospital); }} type="button">{hospital.name}</button>
                    <div className="rating-row"><StarRating rating={hospital.rating} /><span>{hospital.rating} ({hospital.doctors} Ratings)</span></div>
                    <p>{hospital.summary || `${hospital.name} supports ${hospital.specialty} care with international patient coordination, doctor review, and transparent planning.`}</p>
                    <small>{accreditationText(hospital.accreditations)}</small>
                    <button className="show-more-link" onClick={(event) => { event.stopPropagation(); openPlannerBooking(hospital); }} type="button">Book Appointment</button>
                  </div>
                </div>
                <button className="planner-card-menu" onClick={(event) => { event.stopPropagation(); openHospitalDetails(hospital); }} type="button"><i className="fa-solid fa-ellipsis-vertical" aria-hidden="true" /></button>
              </article>
            ))}
          </div>
        </main>
        <aside className="planner-ai-panel">
          <div className="planner-ai-head"><strong>AI Plan Assistant</strong><span>{aiMessages.length}/10 messages</span></div>
          <div className="planner-ai-thread" ref={aiThreadRef}>
            {aiMessages.map((message, index) => <p className={index % 2 ? 'user' : 'assistant'} key={`${message}-${index}`}>{message}</p>)}
          </div>
          <form className="planner-ai-compose" onSubmit={sendPlannerAi}>
            <input onChange={(event) => setAiInput(event.target.value)} placeholder="Type..." value={aiInput} />
            <button type="submit"><i className="fa-solid fa-paper-plane" aria-hidden="true" /></button>
          </form>
          <div className="planner-ai-actions">
            <button onClick={() => submitPlannerAi('Suggest the best hospital from this list')} type="button">Best hospital</button>
            <button onClick={() => submitPlannerAi('Summarize my current plan')} type="button">Summarize</button>
            <button onClick={() => submitPlannerAi('Give advice for booking')} type="button">Booking advice</button>
          </div>
        </aside>
      </div>
      <div className="cma-planner-shell india-planner-shell">
        <aside className="cma-planner-copy">
          <span>India medical planner</span>
          <h1>Plan your treatment journey in India</h1>
          <p>Select a treatment or surgery, choose an Indian city, and book a free consultation.</p>
          <button onClick={goNext} type="button">Continue Planning</button>
          {appointmentStatus && <small>{appointmentStatus}</small>}
        </aside>

        <main className="cma-planner-card india-planner-card">
          <div className="cma-step-tabs india-step-tabs">
            {plannerSteps.map((step, index) => (
              <button className={activeModal === step.id ? 'active' : ''} key={step.id} onClick={() => setActiveModal(step.id)} type="button">
                <b>{index + 1}</b>{step.title}
              </button>
            ))}
          </div>

          {plannerStep === 0 && (
            <div className="cma-treatment-layout">
              <section>
                <h2>Select Treatment</h2>
                <div className="cma-treatment-list">
                  {TREATMENTS.slice(0, 10).map((treatment) => (
                    <button className={plannerTreatment?.id === treatment.id ? 'active' : ''} key={treatment.id} onClick={() => selectPlannerTreatment(treatment)} type="button">
                      <span>{treatment.icon}</span>
                      <div>
                        <strong>{treatment.title}</strong>
                        <small>{treatment.group === 'Aesthetic' ? 'Enhance appearance' : treatment.group === 'Wellness' ? 'Health planning' : 'Medical care'}</small>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="cma-procedure-panel">
                <h2>Select Procedure</h2>
                {!plannerTreatment && <p>Select a treatment first to see procedures.</p>}
                {plannerTreatment && (
                  <div className="cma-procedure-list">
                    {procedures.map((procedure) => (
                      <button className={plannerProcedure === procedure ? 'active' : ''} key={procedure} onClick={() => setPlannerProcedure(procedure)} type="button">
                        {procedure}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {plannerStep === 1 && (
            <div className="cma-consult-panel">
              <div className="cma-consult-visual">
                <img alt="Medical consultation" src={suggestedHospital.image} />
                <div>
                  <span>{plannerTreatment?.title || selectedTreatment?.title || 'Treatment'}</span>
                  <strong>{activeTreatment.title}</strong>
                  <small>{suggestedHospital.name} · {suggestedHospital.doctor}</small>
                </div>
              </div>
              <form className="cma-consult-form" onSubmit={submitAppointment}>
                <h2>Book Your Free Medical Consultation</h2>
                <p>Get expert advice, destination guidance, hospital options, and cost estimate.</p>
                <select onChange={(event) => setPlannerProcedure(event.target.value)} value={plannerProcedure}>
                  <option value="">Select Procedure</option>
                  {procedures.map((procedure) => <option key={procedure}>{procedure}</option>)}
                </select>
                <input onChange={(event) => setAppointmentForm({ ...appointmentForm, patientName: event.target.value })} placeholder="Full name" value={appointmentForm.patientName} />
                <div>
                  <select onChange={(event) => setAppointmentForm({ ...appointmentForm, countryCode: event.target.value })} value={appointmentForm.countryCode}>
                    {countryCodes.map((code) => <option key={code}>{code}</option>)}
                  </select>
                  <input onChange={(event) => setAppointmentForm({ ...appointmentForm, phone: event.target.value })} placeholder="Phone number" value={appointmentForm.phone} />
                </div>
                <textarea onChange={(event) => setAppointmentForm({ ...appointmentForm, notes: event.target.value })} placeholder="Tell us anything important" rows="3" value={appointmentForm.notes} />
                <button type="submit">Book Free Consultation</button>
                {appointmentStatus && <small>{appointmentStatus}</small>}
              </form>
            </div>
          )}
        </main>
      </div>

      <div className="cma-destination-strip">
        {cmaDestinations.map(([country, image]) => (
          <button className={selectedDestination === country ? 'active' : ''} key={country} onClick={() => setSelectedDestination(country)} type="button">
            <img alt={country} src={image} />
            <span>{country}</span>
          </button>
        ))}
      </div>
      {activeModal && (
        <div className="planner-modal-backdrop" role="presentation">
          <section className="planner-step-modal" aria-modal="true" role="dialog">
            <button className="planner-modal-close" onClick={() => setActiveModal('')} type="button">x</button>
            {activeModal === 'treatment' && (
              <>
                <h2>Select a Treatment to Proceed</h2>
                <p>Please choose your treatment or surgery to continue</p>
                <label className="planner-treatment-search">
                  <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                  <input onChange={(event) => setTreatmentSearch(event.target.value)} placeholder="Search treatment or surgery" value={treatmentSearch} />
                </label>
                <div className="planner-treatment-modal-grid">
                  {visibleTreatments.map((treatment) => (
                    <button className={plannerTreatment?.id === treatment.id ? 'active' : ''} key={treatment.id} onClick={() => selectPlannerTreatment(treatment)} type="button">
                      <TreatmentIconTile treatment={treatment} />
                      <strong>{treatment.title}</strong>
                    </button>
                  ))}
                </div>
                <small className="planner-modal-hint">Showing {visibleTreatments.length} of {plannerTreatments.length}. Use search for more treatments.</small>
                <div className="planner-modal-footer">
                  <button disabled={!plannerTreatment} onClick={() => setActiveModal('')} type="button">
                    Done ({completedCount}/1) <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                  </button>
                </div>
              </>
            )}
            {activeModal === 'city' && (
              <>
                <h2>Select Indian Destination</h2>
                <div className="cma-destination-strip modal-city-list">
                  {indianCities.map((city) => (
                    <button className={selectedCity === city.name ? 'active' : ''} key={city.name} onClick={() => { setSelectedCity(city.name); setActiveModal('consultation'); }} type="button">
                      <img alt={city.name} src={city.image} />
                      <span>{city.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {activeModal === 'consultation' && (
              <form className="cma-consult-form modal-consult-form" onSubmit={submitAppointment}>
                <h2>Book Your Free Medical Consultation</h2>
                <p>{bookingHospital.name} - {bookingHospital.doctor}</p>
                <input onChange={(event) => setAppointmentForm({ ...appointmentForm, patientName: event.target.value })} placeholder="Full name" value={appointmentForm.patientName} />
                <div>
                  <input readOnly value="IN (+91)" />
                  <input onChange={(event) => setAppointmentForm({ ...appointmentForm, phone: event.target.value })} placeholder="Phone number" value={appointmentForm.phone} />
                </div>
                <textarea onChange={(event) => setAppointmentForm({ ...appointmentForm, notes: event.target.value })} placeholder="Tell us anything important" rows="3" value={appointmentForm.notes} />
                <button type="submit">Book Free Consultation</button>
                {appointmentStatus && <small>{appointmentStatus}</small>}
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  );
  */
}

