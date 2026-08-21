import React, { useState } from 'react';
import { API_BASE } from '../data/constants';
import {
  PlannerSearchPage,
  ProcedureSelectPage,
  TripStylePage,
  PlannerHospitalsPage,
  JourneyPlanningPage,
  JourneyResultsPage,
} from '../PlannerSearchPage.jsx';

export function PlannerPage({
  allTreatments,
  treatments,
  hospitals,
  money,
  selectedHospital,
  selectedTreatment,
  setPage,
  setSelectedHospital,
  setSelectedTreatment,
  initialProcedure,
}) {
  const list = (treatments && treatments.length) ? treatments : (allTreatments || []);
  const [currentStep, setCurrentStep] = useState(1);
  const [pickedTreatments, setPickedTreatments] = useState(selectedTreatment ? [selectedTreatment] : []);
  const [pickedHospital, setPickedHospital] = useState(selectedHospital || null);
  const [createdJourneyPlan, setCreatedJourneyPlan] = useState(null);

  // Step 1 -> Step 2
  const handleSearchHospitals = (selected) => {
    setPickedTreatments(selected);
    if (selected && selected.length > 0 && setSelectedTreatment) {
      setSelectedTreatment(selected[0]);
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 -> Step 3
  const handleContinueProcedures = (selectedProcs) => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3 -> Step 4
  const handleContinueStyle = (styleData) => {
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 4 -> Step 5
  const handleSelectHospital = (hosp) => {
    setPickedHospital(hosp);
    if (setSelectedHospital) setSelectedHospital(hosp);
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 5 -> Step 6
  const handleCompleteJourney = (plan) => {
    setCreatedJourneyPlan(plan);
    setCurrentStep(6);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="planner-page-wrapper">
      {currentStep === 1 && (
        <PlannerSearchPage
          treatments={list}
          allTreatments={list}
          hospitals={hospitals || []}
          money={money}
          selectedHospital={selectedHospital}
          selectedTreatment={selectedTreatment}
          setPage={setPage}
          setSelectedHospital={setSelectedHospital}
          setSelectedTreatment={setSelectedTreatment}
          preSelectedProcedures={initialProcedure ? [initialProcedure] : []}
          onSearchHospitals={handleSearchHospitals}
          plannerStep={1}
        />
      )}

      {currentStep === 2 && (
        <ProcedureSelectPage
          selectedTreatments={pickedTreatments}
          preSelectedProcedures={initialProcedure ? [initialProcedure] : []}
          allTreatments={list}
          onContinue={handleContinueProcedures}
          onBack={() => { setCurrentStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          plannerStep={2}
        />
      )}

      {currentStep === 3 && (
        <TripStylePage
          selectedTreatments={pickedTreatments}
          onContinueToHospitals={handleContinueStyle}
          onBackToTreatments={() => { setCurrentStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          plannerStep={3}
        />
      )}

      {currentStep === 4 && (
        <PlannerHospitalsPage
          selectedTreatments={pickedTreatments}
          hospitals={hospitals || []}
          onBack={() => { setCurrentStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          onSelectHospital={handleSelectHospital}
          onViewHospitalDetails={(hosp) => {
            if (setSelectedHospital) setSelectedHospital(hosp);
            setPage('partner-detail');
          }}
          formatCurrency={(val) => `₹${val.toLocaleString()}`}
          plannerStep={4}
        />
      )}

      {currentStep === 5 && (
        <JourneyPlanningPage
          selectedTreatments={pickedTreatments}
          selectedHospital={pickedHospital}
          onBack={() => { setCurrentStep(4); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          onCompleteJourney={handleCompleteJourney}
          plannerStep={5}
        />
      )}

      {currentStep === 6 && (
        <JourneyResultsPage
          journeyPlan={createdJourneyPlan}
          selectedTreatments={pickedTreatments}
          selectedHospital={pickedHospital}
          onBack={() => { setCurrentStep(5); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          onConfirmJourney={async (plan) => {
            const currentPlan = plan || createdJourneyPlan;
            try {
              // 1. Post/Save confirmed journey plan to Admin API
              await fetch(`${API_BASE}/admin/journey-plans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: currentPlan?.patientEmail || localStorage.getItem('userEmail') || 'patient@kairacure.com',
                  userName: currentPlan?.patientName || localStorage.getItem('userName') || 'Patient',
                  selectedHospital: pickedHospital?.name || currentPlan?.hospitalLocation || '',
                  selectedTreatments: pickedTreatments.map(t => t.title),
                  journeyPlan: currentPlan,
                  status: 'confirmed',
                  createdAt: new Date().toISOString()
                })
              });

              // 2. Patch status if user email exists
              if (currentPlan?.patientEmail) {
                await fetch(`/api/admin/journey-plans/${encodeURIComponent(currentPlan.patientEmail)}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    status: 'confirmed',
                    confirmedAt: new Date().toISOString()
                  })
                });
              }
            } catch (err) {
              console.log('Error saving confirmed plan to admin:', err);
            }
            alert('🎉 Journey plan confirmed and stored directly in Admin Dashboard! Our Kairacure care team will contact you shortly.');
            if (setPage) setPage('home');
          }}
        />
      )}
    </div>
  );
}
