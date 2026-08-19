import React from 'react';

function getTreatmentIconKind(treatment) {
  const name = String(treatment?.name || treatment?.title || treatment?.group || '').toLowerCase();
  if (/heart|cardiac|cabg|valve/i.test(name)) return 'cardiac';
  if (/knee|hip|ortho|bone|joint/i.test(name)) return 'orthopedics';
  if (/cancer|chemo|onco|tumor/i.test(name)) return 'oncology';
  if (/spine|back/i.test(name)) return 'spine';
  if (/urology|kidney|renal/i.test(name)) return 'urology';
  if (/dental|tooth|teeth/i.test(name)) return 'dental';
  if (/hair|fue|dhi/i.test(name)) return 'hair';
  if (/eye|lasik|cataract/i.test(name)) return 'ophthalmology';
  return 'general';
}

function TreatmentVectorIcon({ treatment }) {
  const iconKind = getTreatmentIconKind(treatment);
  const iconClasses = {
    cardiac: 'fa-heart-pulse',
    orthopedics: 'fa-bone',
    oncology: 'fa-ribbon',
    spine: 'fa-staff-snake',
    urology: 'fa-prescription-bottle-medical',
    dental: 'fa-tooth',
    hair: 'fa-person',
    ophthalmology: 'fa-eye',
    general: 'fa-briefcase-medical',
  };
  return <i aria-hidden="true" className={`fa-solid ${iconClasses[iconKind] || iconClasses.general} treatment-vector-icon`} />;
}

export function HomeTreatmentBanners({ setPage, setActiveGroup, setSelectedTreatment, treatments = [] }) {
  if (!treatments || treatments.length === 0) return null;

  const seen = new Set();
  const cards = treatments
    .filter((t) => {
      const g = t.group || t.category || t.title;
      if (!g || seen.has(g)) return false;
      seen.add(g);
      return true;
    })
    .slice(0, 6)
    .map((t) => ({
      title: t.group || t.category || t.title,
      group: t.group || t.category || t.title,
      treatment: t,
    }));

  const handleClick = (item) => {
    if (setSelectedTreatment) setSelectedTreatment(item.treatment);
    setPage('treatment-detail');
  };

  return (
    <section className="page-section treatment-banner-section">
      <div className="section-heading">
        <div>
          <h2>Find Your <span>Treatment</span></h2>
        </div>
      </div>
      <div className="treatment-banner-grid">
        {cards.map((item, index) => (
          <button
            key={`${item.treatment?.id || item.title}-${index}`}
            className="treatment-banner-card"
            onClick={() => handleClick(item)}
            type="button"
          >
            <span className="tbc-icon">
              <TreatmentVectorIcon treatment={item.treatment} />
            </span>
            <strong className="tbc-title">{item.title}</strong>
            <span className="tbc-arrow" aria-hidden="true">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
