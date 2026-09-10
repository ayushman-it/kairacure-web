import React, { useState, useEffect } from 'react';
import { getTreatmentIconKind, HEALTH_ICON_SOURCES, HEALTH_ICON_CDN_FALLBACKS } from '../../data/constants.js';

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

export function TreatmentVectorIcon({ treatment, size = 20, style, filter }) {
  const iconKind = getTreatmentIconKind(treatment);
  const localIconUrl = HEALTH_ICON_SOURCES[iconKind] || HEALTH_ICON_SOURCES.general;
  const cdnIconUrl = HEALTH_ICON_CDN_FALLBACKS?.[iconKind] || HEALTH_ICON_CDN_FALLBACKS?.general;

  const [currentSrc, setCurrentSrc] = useState(localIconUrl);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(localIconUrl);
    setImgFailed(false);
  }, [localIconUrl]);

  const fallbackClasses = {
    hip: 'fa-bone',
    knee: 'fa-joint',
    ligament: 'fa-bandage',
    abrasion: 'fa-file-medical',
    rheumatology: 'fa-hand-dots',
    spine: 'fa-staff-snake',
    orthopedics: 'fa-bone',

    cardiac_valve: 'fa-heart-circle-check',
    cardiac_bypass: 'fa-heart-pulse',
    cardiac_stent: 'fa-heart-circle-bolt',
    cardiac: 'fa-heart-pulse',

    oncology: 'fa-ribbon',
    hepatology: 'fa-shield-virus',
    gastroenterology: 'fa-notes-medical',
    nephrology: 'fa-droplet',
    urology: 'fa-droplet',
    neurology: 'fa-brain',
    gynecology_uterus: 'fa-person-breastfeeding',
    gynecology: 'fa-venus',
    infertility: 'fa-baby',
    ent_ear: 'fa-ear-listen',
    ent: 'fa-head-side-virus',
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

  const handleError = () => {
    if (currentSrc === localIconUrl && cdnIconUrl && cdnIconUrl !== localIconUrl) {
      setCurrentSrc(cdnIconUrl);
    } else {
      setImgFailed(true);
    }
  };

  const defaultFilter = 'invert(20%) sepia(75%) saturate(2200%) hue-rotate(200deg) brightness(90%) contrast(100%)';

  if (!imgFailed && currentSrc) {
    return (
      <img
        src={currentSrc}
        alt={treatment?.title || treatment?.name || 'Medical Icon'}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          filter: filter !== undefined ? filter : defaultFilter,
          opacity: 0.9,
          display: 'inline-block',
          verticalAlign: 'middle',
          ...style
        }}
        onError={handleError}
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
