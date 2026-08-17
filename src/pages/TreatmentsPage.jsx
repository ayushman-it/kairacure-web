import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MedicalVideoBackdrop } from '../components/common/MedicalVideoBackdrop.jsx';

function getTreatmentDisplayTitle(treatment) {
  return treatment?.name || treatment?.title || 'Medical Treatment';
}

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

export function TreatmentsPage({ activeGroup, isLoading = false, money, setActiveGroup, selectedTreatment, setPage, setSelectedTreatment, treatments = [] }) {
  const groups = useMemo(() => {
    if (!treatments || treatments.length === 0) return ['All'];

    const uniqueGroups = new Set();
    treatments.forEach((item) => {
      const group = item.group || item.category || item.specialty;
      if (group && group.trim()) {
        uniqueGroups.add(group.trim());
      }
    });

    const sortedGroups = Array.from(uniqueGroups).sort();
    return ['All', ...sortedGroups];
  }, [treatments]);

  const items = activeGroup === 'All' ? treatments : treatments.filter((item) => {
    const itemGroup = item.group || item.category || item.specialty;
    return itemGroup === activeGroup;
  });

  const [visibleCount, setVisibleCount] = useState(8);
  const tabRowRef = useRef(null);
  const visibleItems = items.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(8);
  }, [activeGroup, treatments]);

  const scrollTreatmentTabs = (direction) => {
    tabRowRef.current?.scrollBy({ left: direction * 260, behavior: 'smooth' });
  };

  return (
    <section className="page-section treatments-section-redesigned" id="treatments">
      <MedicalVideoBackdrop />

      <div className="treatments-section-header">
        <h2>Find <span>Treatments</span></h2>
        <p>Find the right speciality and compare estimated starting packages.</p>
      </div>

      <div className="treatments-tabs-card">
        <div className="treatments-tabs-wrapper">
          <button
            aria-label="Previous treatment categories"
            className="tab-nav-arrow left"
            onClick={() => scrollTreatmentTabs(-1)}
            type="button"
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>

          <div className="treatments-tabs-container" ref={tabRowRef}>
            {groups.map((group) => (
              <button
                className={`treatment-tab ${activeGroup === group ? 'active' : ''}`}
                key={group}
                onClick={() => setActiveGroup(group)}
                type="button"
              >
                {group}
              </button>
            ))}
          </div>

          <button
            aria-label="Next treatment categories"
            className="tab-nav-arrow right"
            onClick={() => scrollTreatmentTabs(1)}
            type="button"
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="treatment-grid">
        {visibleItems.map((item) => {
          const displayTitle = getTreatmentDisplayTitle(item);

          return (
            <button
              className={selectedTreatment?.id === item.id ? 'treatment-card active' : 'treatment-card'}
              key={item.id || item.name}
              onClick={() => {
                setSelectedTreatment(item);
                setPage('treatment-detail');
              }}
              type="button"
              title={item.title || item.name}
            >
              <i className="treatment-card-icon" aria-hidden="true"><TreatmentVectorIcon treatment={item} /></i>
              <strong>{displayTitle}</strong>
              <small>{item.group || item.category || 'Medical'}</small>
            </button>
          );
        })}
      </div>
      {visibleCount < items.length && (
        <div className="load-more-row">
          <button onClick={() => setVisibleCount((count) => Math.min(count + 8, items.length))} type="button">
            Load more treatments
          </button>
          <span>{visibleItems.length} of {items.length}</span>
        </div>
      )}
    </section>
  );
}
