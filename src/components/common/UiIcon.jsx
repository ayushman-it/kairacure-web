import React, { useState } from 'react';
import { getTreatmentIconKind, HEALTH_ICON_SOURCES } from '../../data/constants.js';

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

export function TreatmentVectorIcon({ treatment, size = 26 }) {
  const iconKind = getTreatmentIconKind(treatment);
  const healthIconUrl = HEALTH_ICON_SOURCES[iconKind] || HEALTH_ICON_SOURCES.general;
  const [imgError, setImgError] = useState(false);

  const fallbackClasses = {
    cardiac: 'fa-heart-pulse',
    orthopedics: 'fa-bone',
    oncology: 'fa-ribbon',
    gastroenterology: 'fa-notes-medical',
    neurology: 'fa-brain',
    spine: 'fa-staff-snake',
    urology: 'fa-droplet',
    gynecology: 'fa-venus',
    infertility: 'fa-baby',
    ent: 'fa-ear-listen',
    hair: 'fa-user-doctor',
    dental: 'fa-tooth',
    plastic: 'fa-user-doctor',
    wellness: 'fa-spa',
    dermatology: 'fa-hand-dots',
    ophthalmology: 'fa-eye',
    emergency: 'fa-truck-medical',
    pediatrics: 'fa-child',
    general: 'fa-hospital-user',
  };

  if (!imgError && healthIconUrl) {
    return (
      <img
        src={healthIconUrl}
        alt={treatment?.title || treatment?.name || 'Medical Icon'}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          filter: 'invert(16%) sepia(85%) saturate(2800%) hue-rotate(205deg) brightness(85%) contrast(100%)',
          display: 'inline-block',
          verticalAlign: 'middle',
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  return <i aria-hidden="true" className={`fa-solid ${fallbackClasses[iconKind] || fallbackClasses.general} treatment-vector-icon`} />;
}

export function TreatmentIconTile({ treatment, className = '', label }) {
  const title = label || treatment?.title || 'Treatment';
  return (
    <span className={`treatment-icon-tile ${className}`.trim()} aria-label={`${title} icon`} role="img">
      <TreatmentVectorIcon treatment={treatment} />
    </span>
  );
}
