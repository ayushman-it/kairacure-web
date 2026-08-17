import React, { useMemo } from 'react';
import { MedicalVideoBackdrop } from '../common/MedicalVideoBackdrop.jsx';

export function FeaturedTreatments({ money, setPage, setSelectedTreatment, treatments = [] }) {
  const featured = useMemo(() => {
    return treatments.slice(0, 4);
  }, [treatments]);

  if (featured.length === 0) return null;

  return (
    <section className="page-section featured-treatment-section">
      <MedicalVideoBackdrop />
      <div className="section-heading">
        <div>
          <h2>Popular Treatment Journeys</h2>
          <p>Shortlist treatments by real-world needs, package scope, partner match, and total budget.</p>
        </div>
      </div>
      <div className="featured-carousel" aria-label="Featured treatment carousel">
        {featured.map((t, idx) => (
          <article className="featured-treatment-card" key={t.id || idx}>
            <div>
              <span>{t.group || 'Specialty'}</span>
              <strong>{t.name || t.title || 'Treatment'}</strong>
              <p>Comprehensive treatment with coordinated partner hospital support.</p>
              <button
                onClick={() => {
                  if (setSelectedTreatment) setSelectedTreatment(t);
                  setPage('treatment-detail');
                }}
                type="button"
              >
                View details
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
