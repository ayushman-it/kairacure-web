import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MedicalVideoBackdrop } from '../components/common/MedicalVideoBackdrop.jsx';
import { SkeletonCard } from '../components/common/SkeletonCard.jsx';
import { getTreatmentIconKind } from '../data/constants.js';

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

function getTreatmentDisplayTitle(item) {
  return item?.title || item?.name || 'Treatment';
}

export function TreatmentsPage({ activeGroup, isLoading = false, money, setActiveGroup, selectedTreatment, setPage, setSelectedTreatment, treatments = [] }) {
  // Generate groups from backend treatment categories/groups
  const groups = useMemo(() => {
    if (!treatments || treatments.length === 0) return ['All'];

    const uniqueGroups = new Set();
    treatments.forEach((item) => {
      const group = item.group || item.category || item.specialty;
      if (group && group.trim()) {
        uniqueGroups.add(group.trim());
      }
    });

    // Sort alphabetically and add 'All' at start
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
    <section className="page-section kc-treatments-page-v2" id="treatments-directory-page">
      <MedicalVideoBackdrop />

      {/* Centered Section Header */}
      <div className="kc-treatments-header-v2">
        <h2>Find <span>Treatments</span></h2>
        <p>Find the right speciality and compare estimated starting packages.</p>
      </div>

      {/* Card-based Tab Navigation */}
      <div className="kc-treatments-tabs-card-v2">
        <div className="kc-treatments-tabs-wrapper-v2">
          <button
            aria-label="Previous treatment categories"
            className="kc-tab-arrow-v2"
            onClick={() => scrollTreatmentTabs(-1)}
            type="button"
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>

          <div className="kc-treatments-tabs-container-v2" ref={tabRowRef}>
            {groups.map((group) => (
              <button
                className={`kc-treatment-tab-v2 ${activeGroup === group ? 'active' : ''}`}
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
            className="kc-tab-arrow-v2"
            onClick={() => scrollTreatmentTabs(1)}
            type="button"
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Treatment Grid */}
      <div className="kc-treatments-grid-v2">
        {isLoading ? Array.from({ length: 8 }, (_, index) => <SkeletonCard className="treatment-skeleton" key={`treatment-skeleton-${index}`} />) : visibleItems.map((item) => {
          const displayTitle = getTreatmentDisplayTitle(item);

          return (
            <div
              className={`kc-treatment-card-v2 ${selectedTreatment?.id === item.id ? 'active' : ''}`}
              key={item.id || item._id}
              onClick={() => {
                setSelectedTreatment(item);
                setPage('treatment-detail');
              }}
            >
              <div>
                <div className="kc-card-top-row">
                  <div className="kc-treatment-icon-box-v2">
                    <TreatmentVectorIcon treatment={item} />
                  </div>
                  <span className="kc-treatment-tag-v2">
                    {item.group || item.category || item.specialty || 'Medical'}
                  </span>
                </div>

                <h3 className="kc-treatment-title-v2">
                  {displayTitle}
                </h3>
              </div>

              <div className="kc-treatment-footer-v2">
                <span className="kc-treatment-price-v2">
                  {item.packageFrom ? `From ₹${(item.packageFrom / 100000).toFixed(1)}L` : 'Estimate on request'}
                </span>
                <span className="kc-treatment-btn-v2">
                  Details <i className="bi bi-arrow-right-short" style={{ fontSize: '1.1rem' }} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {!isLoading && visibleCount < items.length && (
        <div className="kc-load-more-row-v2">
          <button className="kc-load-more-btn-v2" onClick={() => setVisibleCount((count) => Math.min(count + 8, items.length))} type="button">
            Load more treatments
          </button>
          <span className="kc-load-more-count-v2">{visibleItems.length} of {items.length}</span>
        </div>
      )}
    </section>
  );
}
