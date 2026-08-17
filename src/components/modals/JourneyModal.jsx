import React from 'react';

export function JourneyModal({ onClose, setPage, treatments = [] }) {
  const displayTreatments = treatments.slice(0, 6);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Quick medical journey planner">
      <div className="journey-modal">
        <button className="modal-close" onClick={onClose} type="button">x</button>
        <span>Plan smarter</span>
        <h2>Build a quick medical travel estimate</h2>
        <p>Select a treatment, compare partners and doctors, then see a demo budget for package, flights, visa, stay, pickup and care support.</p>
        <div className="modal-steps">
          <span>Choose treatment</span>
          <span>Compare partners</span>
          <span>Estimate total cost</span>
        </div>
        <button
          className="modal-primary"
          onClick={() => {
            onClose();
            setPage('planner');
          }}
          type="button"
        >
          Quick plan my medical journey
        </button>
      </div>
    </div>
  );
}
