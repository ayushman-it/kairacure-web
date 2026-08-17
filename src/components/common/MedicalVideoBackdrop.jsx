import React from 'react';
import medicalVideoSrc from '../../assets/new+website+video+desktop+(1).mp4';

const MEDICAL_VIDEO = medicalVideoSrc;

export function MedicalVideoBackdrop() {
  return (
    <video className="section-video-bg soft-section-video" autoPlay muted loop playsInline aria-hidden="true">
      <source src={MEDICAL_VIDEO} type="video/mp4" />
    </video>
  );
}
