import React, { useState, useEffect, useMemo } from 'react';
import { MedicalVideoBackdrop } from '../components/common/MedicalVideoBackdrop.jsx';
import { StarRating } from '../components/common/StarRating.jsx';
import { CallBackForm } from '../components/hospitals/CallBackForm.jsx';
import { EvaluationForm } from '../components/hospitals/EvaluationForm.jsx';
import { API_BASE, accreditationText, getHospitalImage, handleImageFallback } from '../data/constants.js';

export function TreatmentDetailPage({ allTreatments = [], hospitals, money, selectedTreatment, setPage, setPlannerInitialProcedure, setSelectedHospital, setSelectedTreatment }) {
  const [activeTab, setActiveTab] = useState('Overview');
  if (!selectedTreatment) {
    return (
      <section className="empty-state">
        <h2>Select a treatment to view details</h2>
        <p>Treatment details are loaded from the live catalog. Please choose a treatment first.</p>
        <button onClick={() => setPage('treatments')} type="button">Browse treatments</button>
      </section>
    );
  }

  const treatmentMeaning = buildTreatmentMeaning(selectedTreatment);
  const { code: clinicalCode, condition: clinicalCondition, description: treatmentDescription, displayTitle: displayTreatmentTitle, pageTitle: pageTreatmentTitle, release: clinicalRelease, source: clinicalSource } = treatmentMeaning;
  const treatmentNeedle = normalizeSearch([selectedTreatment.title, displayTreatmentTitle, selectedTreatment.category, selectedTreatment.group, selectedTreatment.specialty, clinicalCondition, clinicalCode].filter(Boolean).join(' '));
  const relatedHospitals = hospitals.filter((hospital) => {
    const hospitalTags = Array.isArray(hospital.tags) ? hospital.tags : [];
    const hospitalText = normalizeSearch([hospital.specialty, hospital.department, hospital.summary, ...hospitalTags].filter(Boolean).join(' '));
    return hospitalTags.includes(selectedTreatment.title)
      || hospitalTags.includes(displayTreatmentTitle)
      || hospital.specialty === selectedTreatment.specialty
      || (treatmentNeedle && hospitalText && (hospitalText.includes(treatmentNeedle) || treatmentNeedle.includes(normalizeSearch(hospital.specialty || ''))));
  });
  const matchedHospitals = relatedHospitals.length ? relatedHospitals : hospitals;
  const suggestedHospitals = [
    ...matchedHospitals,
    ...hospitals.filter((hospital) => !matchedHospitals.some((item) => item.id === hospital.id)),
  ];
  const bestMatches = suggestedHospitals.slice(0, 6);
  const backendPackage = Number(selectedTreatment.packageFrom || 0);
  const clinicalReleaseNote = clinicalRelease ? `Catalog release ${clinicalRelease}` : 'Medical catalog reviewed';
  const categoryLabel = selectedTreatment.category || selectedTreatment.group || selectedTreatment.specialty || 'Medical treatment';
  const sourceLabel = clinicalCode ? `${clinicalSource} ${clinicalCode}` : clinicalSource;
  const matchReason = (hospital) => {
    if (hospital.specialty && selectedTreatment.specialty && hospital.specialty === selectedTreatment.specialty) return `${hospital.specialty} department match`;
    const tags = Array.isArray(hospital.tags) ? hospital.tags : [];
    if (tags.includes(selectedTreatment.title) || tags.includes(displayTreatmentTitle)) return 'Treatment listed in hospital mapping';
    if (hospital.internationalPatientWing) return 'International patient support available';
    return accreditationText(hospital.accreditations, 'Backend hospital suggestion');
  };

  // ICD-11 procedures for this treatment group — treatments with icdCode matching this group
  const icdProcedures = allTreatments.filter((t) => {
    if (!t.icdCode && !t.icdUri) return false; // must be ICD-11 imported
    const tGroup = (t.group || t.category || '').toLowerCase();
    const selGroup = (selectedTreatment.group || selectedTreatment.category || '').toLowerCase();
    const selTitle = (selectedTreatment.title || '').toLowerCase();
    // Same group, OR the treatment itself IS the selected one, OR title contains group
    return tGroup === selGroup
      || tGroup.includes(selGroup)
      || selGroup.includes(tGroup)
      || (t._id || t.id) === (selectedTreatment._id || selectedTreatment.id)
      || selTitle.includes(tGroup);
  });

  const supportCards = [
    ['Case confidence', 'Your treatment is converted from catalog wording into a clear care focus before planning starts.'],
    ['Human review', 'A coordinator can verify reports, symptoms, budget, city preference, and hospital availability.'],
    ['No ICD detour', 'Patients stay on the journey flow; ICD-11 remains a backend clinical mapping reference.'],
  ];
  const subProcedures = [
    {
      label: 'Treatment meaning',
      name: clinicalCondition,
      meta: sourceLabel,
      description: treatmentDescription,
      icon: 'fa-stethoscope',
      action: 'Start plan',
      target: 'planner',
    },
    {
      label: 'What we need',
      name: 'Reports and symptoms',
      meta: 'Upload once in journey planner',
      description: `Share reports, scan images, prescriptions, diagnosis notes, and your preferred travel dates for ${displayTreatmentTitle}.`,
      icon: 'fa-file-medical',
      action: 'Prepare case',
      target: 'planner',
    },
    {
      label: 'Suggested care',
      name: `${bestMatches.length || 0} hospital options`,
      meta: clinicalReleaseNote,
      description: 'Suggestions come from backend hospital data, specialty mapping, accreditation, location, and international patient support.',
      icon: 'fa-hospital-user',
      action: 'View matches',
      target: 'planner',
    },
  ].filter((item) => item.name);

  const treatmentFAQs = [
    {
      question: `What does ${displayTreatmentTitle} mean in my plan?`,
      answer: `${displayTreatmentTitle} is the patient-friendly treatment name. The backend can also keep the ICD-11 mapped condition (${clinicalCondition}) and reference code${clinicalCode ? ` ${clinicalCode}` : ''} for clinical consistency.`
    },
    {
      question: 'Will I be sent to ICD-11 pages?',
      answer: 'No. ICD-11 stays behind the scenes as a mapping source. The patient journey remains inside Kairacure with clear next steps, hospital options, and report collection.'
    },
    {
      question: 'Where does the treatment data come from?',
      answer: `This page uses backend treatment records${clinicalCode ? ', ICD-11 code mapping,' : ''} and backend hospital suggestions. Pricing appears only when the backend has a package estimate.`
    },
    {
      question: 'What happens after I start the journey plan?',
      answer: 'The planner collects reports, symptoms, budget, preferred city, and travel needs so the care team can suggest the most suitable hospital path.'
    },
    {
      question: 'Can hospital suggestions change?',
      answer: 'Yes. Suggestions can change after report review, doctor availability, patient budget, city preference, and hospital response.'
    }
  ];

  const trustBadges = [
    { title: clinicalCode ? clinicalCode : 'Mapped', subtitle: 'Clinical ref', icon: 'fa-barcode', tone: 'violet' },
    { title: categoryLabel, subtitle: 'Backend category', icon: 'fa-layer-group', tone: 'green' },
    { title: bestMatches.length ? `${bestMatches.length}+` : 'Review', subtitle: 'Suggested hospitals', icon: 'fa-hospital', tone: 'blue' },
    { title: backendPackage ? money(backendPackage) : 'On request', subtitle: 'Package from', icon: 'fa-indian-rupee-sign', tone: 'gold' },
    { title: 'Private', subtitle: 'Report handling', icon: 'fa-lock', tone: 'violet' },
  ];
  const keyInsights = [
    ['Meaning', treatmentDescription],
    ['Treatment Source', `${categoryLabel}${clinicalCode ? ` / ${clinicalCode}` : ''}${clinicalRelease ? ` / ${clinicalRelease}` : ''}`],
    ['Suggested support', bestMatches.length ? `${bestMatches.length} hospital options are ready for journey planning.` : 'Hospital matching will start after treatment review.'],
    ['Cost clarity', backendPackage ? `Package estimate starts from ${money(backendPackage)}.` : 'Package estimate will be requested from hospitals after report review.'],
  ];
  const tabItems = [
    ['Overview', 'overview'],
    ['Key Insights', 'key-insights'],
    ['Journey Plan', 'procedures'],
    ['Cost', 'cost'],
    ['Top Hospitals', 'hospitals'],
    ['FAQs', 'faqs'],
  ];
  const heroImage = selectedTreatment.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=85';
  const costRows = [
    ['Backend package estimate', backendPackage ? money(backendPackage) : 'On request', backendPackage ? 'Imported treatment pricing' : 'Care team will collect pricing'],
    ['Hospital quote', 'After review', 'Depends on reports, room type, stay, and doctor advice'],
    ['Travel support', 'Optional', 'Visa, stay, pickup, interpreter, and follow-up support'],
  ];
  const goToSection = (label, sectionId) => {
    setActiveTab(label);
    window.requestAnimationFrame(() => {
      document.getElementById(`treatment-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="treatment-replica-page">
      <section className="treatment-replica-hero">
        <div className="treatment-replica-hero-media">
          <img alt={pageTreatmentTitle} onError={handleImageFallback} src={heroImage} />
        </div>
        <div className="treatment-replica-hero-copy">
          <div className="treatment-replica-breadcrumb">
            <button onClick={() => setPage('home')} type="button">Home</button>
            <span>/</span>
            <button onClick={() => setPage('treatments')} type="button">Treatments</button>
            <span>/</span>
            <b>{displayTreatmentTitle}</b>
          </div>
          <h1>{pageTreatmentTitle} with guided care planning</h1>
          <p>{treatmentDescription}</p>
          <div className="treatment-replica-actions">
            <button onClick={() => setPage('planner')} type="button">Plan this treatment</button>
            <button onClick={() => goToSection('Top Hospitals', 'hospitals')} type="button">See suggested hospitals</button>
          </div>
        </div>
        <aside className="treatment-comfort-panel" aria-label="Care planning reassurance">
          <strong>We will make this simple</strong>
          <p>No confusing diagnosis codes for the patient journey. Share your reports once and the care team will help convert this treatment into clear next steps.</p>
          <div>
            <span>{clinicalCode ? `Ref ${clinicalCode}` : 'Backend mapped'}</span>
            <span>{backendPackage ? money(backendPackage) : 'Quote on request'}</span>
          </div>
        </aside>
      </section>

      <section className="treatment-replica-proof" aria-label="Treatment trust highlights">
        {trustBadges.map((badge) => (
          <article data-tone={badge.tone} key={`${badge.title}-${badge.subtitle}`}>
            <span><i className={`fa-solid ${badge.icon}`} aria-hidden="true" /></span>
            <div>
              <strong>{badge.title}</strong>
              <small>{badge.subtitle}</small>
            </div>
          </article>
        ))}
      </section>

      <nav className="treatment-replica-tabs" aria-label="Treatment sections">
        {tabItems.map(([label, sectionId]) => (
          <button
            className={activeTab === label ? 'active' : ''}
            key={label}
            onClick={() => goToSection(label, sectionId)}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>

      <section className="treatment-replica-panel" id="treatment-overview">
        <h2>Overview</h2>
        <p>{treatmentDescription}</p>
        <div className="treatment-source-strip" aria-label="Treatment source details">
          <span><b>Patient title</b>{displayTreatmentTitle}</span>
          <span><b>Mapped meaning</b>{clinicalCondition}</span>
          <span><b>Source</b>{sourceLabel}</span>
          <span><b>Release</b>{clinicalRelease || 'Backend record'}</span>
        </div>
        <div className="treatment-comfort-grid">
          {supportCards.map(([title, copy]) => (
            <article key={title}>
              <i className="fa-solid fa-circle-check" aria-hidden="true" />
              <strong>{title}</strong>
              <p>{copy}</p>
            </article>
          ))}
        </div>
        <button onClick={() => setPage('planner')} type="button">See plan</button>
      </section>

      <section className="treatment-replica-section" id="treatment-key-insights">
        <div className="treatment-replica-section-head">
          <h2>Key Insights at a Glance</h2>
        </div>
        <div className="treatment-replica-insights">
          {keyInsights.map(([title, description], index) => (
            <article key={title}>
              <span>{index + 1}</span>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── ICD-11 Procedures Section ── */}
      <section className="treatment-replica-section td-procedures-section" id="treatment-procedures">
        <div className="treatment-replica-section-head">
          <div>
            <span>ICD-11 Procedures</span>
            <h2>Specific Procedures for {displayTreatmentTitle}</h2>
          </div>
          <button onClick={() => setPage('planner')} type="button">Plan this treatment</button>
        </div>

        {icdProcedures.length === 0 ? (
          /* ── No procedures state ── */
          <div className="td-no-procedures">
            <div className="td-no-proc-icon">
              <i className="fa-solid fa-flask-vial" aria-hidden="true" />
            </div>
            <div className="td-no-proc-body">
              <strong>No specific procedures added yet</strong>
              <p>
                Our team hasn't imported ICD-11 procedures for <b>{categoryLabel}</b> yet.
                The care coordinator will map the exact procedure after reviewing your reports.
              </p>
              <div className="td-no-proc-actions">
                <button className="td-proc-cta-primary" onClick={() => setPage('planner')} type="button">
                  <i className="fa-solid fa-route" aria-hidden="true" /> Start journey plan
                </button>
                <button className="td-proc-cta-secondary" onClick={() => setPage('ai-assistant')} type="button">
                  <i className="fa-solid fa-comment-medical" aria-hidden="true" /> Ask AI assistant
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Procedure cards grid ── */
          <div className="td-procedure-grid">
            {icdProcedures.map((proc) => {
              const procTitle = getTreatmentDisplayTitle(proc);
              const hasCost = proc.packageFrom && proc.packageFrom > 0;
              return (
                <article
                  key={proc.id || proc._id}
                  className="td-procedure-card"
                  onClick={() => { if (setSelectedTreatment) setSelectedTreatment(proc); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') { if (setSelectedTreatment) setSelectedTreatment(proc); }}}
                >
                  {/* ICD code badge */}
                  {proc.icdCode && (
                    <span className="td-proc-icd-badge">
                      <i className="fa-solid fa-tag" aria-hidden="true" /> {proc.icdCode}
                    </span>
                  )}

                  {/* WHO link */}
                  {proc.icdBrowserUrl && (
                    <a
                      href={proc.icdBrowserUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="td-proc-who-link"
                      onClick={(e) => e.stopPropagation()}
                      title="View on WHO ICD-11 browser"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /> WHO
                    </a>
                  )}

                  {/* Icon */}
                  <div className="td-proc-icon">
                    <i className="fa-solid fa-stethoscope" aria-hidden="true" />
                  </div>

                  {/* Title */}
                  <strong className="td-proc-title">{procTitle}</strong>

                  {/* Category */}
                  <span className="td-proc-category">{proc.group || proc.category}</span>

                  {/* Description */}
                  {proc.description && !proc.description.startsWith('WHO ICD-11') && (
                    <p className="td-proc-desc">
                      {proc.description.length > 90 ? `${proc.description.slice(0, 87)}…` : proc.description}
                    </p>
                  )}

                  {/* Cost */}
                  {hasCost && (
                    <div className="td-proc-cost">
                      <i className="fa-solid fa-indian-rupee-sign" aria-hidden="true" />
                      From ₹{(proc.packageFrom / 100000).toFixed(1)}L
                    </div>
                  )}

                  {/* Plan button */}
                  <button
                    className="td-proc-plan-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Carry both treatment + procedure into planner → skip to Step 3
                      if (setPlannerInitialProcedure) setPlannerInitialProcedure(proc);
                      setPage('planner');
                    }}
                    type="button"
                  >
                    Plan this <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="treatment-replica-section" id="treatment-cost">
        <div className="treatment-replica-section-head">
          <div>
            <span>Global Cost Comparison</span>
            <h2>{pageTreatmentTitle} Abroad</h2>
          </div>
        </div>
        <div className="treatment-replica-table">
          <div className="treatment-replica-table-head">
            <span>Destination</span>
            <span>From</span>
            <span>Up to</span>
          </div>
          {costRows.map(([label, value, note]) => (
            <div className="treatment-replica-table-row" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="treatment-replica-section" id="treatment-hospitals">
        <div className="treatment-replica-section-head">
          <h2>Suggested Hospitals</h2>
          <button onClick={() => setPage('hospitals')} type="button">View all</button>
        </div>
        <div className="treatment-replica-hospital-row">
          {bestMatches.map((hospital) => (
            <article key={hospital.id}>
              <img alt={hospital.name} onError={handleImageFallback} src={getHospitalImage(hospital)} />
              <div>
                <span>{hospital.jciAccredited ? 'JCI Accredited' : accreditationText(hospital.accreditations, 'Accredited Hospital')}</span>
                <strong>{hospital.name}</strong>
                <small>{hospital.city}, {hospital.country}</small>
                <em>{matchReason(hospital)}</em>
                <p>{hospital.cost?.package ? formatCurrency(hospital.cost.package, 'INR') : selectedTreatment.packageFrom ? formatCurrency(selectedTreatment.packageFrom, 'INR') : 'Cost on Request'}</p>
                <button
                  onClick={() => {
                    setSelectedHospital(hospital);
                    setPage('partner-detail');
                  }}
                  type="button"
                >
                  Check hospital details
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="treatment-replica-section" id="treatment-faqs">
        <div className="treatment-replica-section-head">
          <h2>FAQs</h2>
        </div>
        <div className="treatment-replica-faqs">
          {treatmentFAQs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

// Hospital Partner Landing Page Component
