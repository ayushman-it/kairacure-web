import React from 'react';
import { getTreatmentIconKind } from '../../data/constants.js';

export function UiIcon({ name }) {
  const uiIcons = {
    shield: 'fa-shield-heart',
    doctor: 'fa-user-doctor',
    cost: 'fa-hand-holding-dollar',
    lock: 'fa-lock',
    hospital: 'fa-hospital',
    procedure: 'fa-notes-medical',
    home: 'fa-house-medical',
  };
  return <i aria-hidden="true" className={`fa-solid ${uiIcons[name] || uiIcons.shield} ui-bootstrap-icon`} />;
}

export function TreatmentVectorIcon({ treatment }) {
  const iconKind = getTreatmentIconKind(treatment);
  const iconClasses = {
    cardiac: 'fa-heart-pulse',
    orthopedics: 'fa-bone',
    oncology: 'fa-ribbon',
    spine: 'fa-staff-snake',
    urology: 'fa-prescription-bottle-medical',
    gynecology: 'fa-venus',
    infertility: 'fa-baby',
    hair: 'fa-person',
    dental: 'fa-tooth',
    plastic: 'fa-user-doctor',
    wellness: 'fa-spa',
    'neuro-wellness': 'fa-brain',
    ophthalmology: 'fa-eye',
    gastroenterology: 'fa-capsules',
    emergency: 'fa-truck-medical',
    pediatrics: 'fa-child',
    general: 'fa-briefcase-medical',
  };
  return <i aria-hidden="true" className={`fa-solid ${iconClasses[iconKind] || iconClasses.general} treatment-vector-icon`} />;
}

export function TreatmentIconTile({ treatment, className = '', label }) {
  const title = label || treatment?.title || 'Treatment';
  return (
    <span className={`treatment-icon-tile ${className}`.trim()} aria-label={`${title} icon`} role="img">
      <TreatmentVectorIcon treatment={treatment} />
    </span>
  );
}
