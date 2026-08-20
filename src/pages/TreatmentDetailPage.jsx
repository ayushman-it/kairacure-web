import React, { useState } from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import {
  API_BASE,
  accreditationText,
  getHospitalImage,
  handleImageFallback,
  buildTreatmentMeaning,
  normalizeSearch,
  getTreatmentDisplayTitle,
  getTreatmentPageTitle
} from '../data/constants.js';

export function TreatmentDetailPage({ allTreatments = [], hospitals = [], money, selectedTreatment, setPage, setPlannerInitialProcedure, setSelectedHospital, setSelectedTreatment }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [openFaq, setOpenFaq] = useState(0);
  const [aiReply, setAiReply] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleAskAi = async (promptText) => {
    setAiLoading(true);
    setAiReply('');
    try {
      const response = await fetch(`${API_BASE}/ai-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          history: [{ role: 'user', content: `Asking about ${selectedTreatment?.title || 'treatment'}` }],
        }),
      });
      const data = await response.json();
      setAiReply(data.reply || 'AI guidance is available. Please consult our care team.');
    } catch {
      setAiReply('AI server offline. Please submit an inquiry or contact care@kairacure.com');
    } finally {
      setAiLoading(false);
    }
  };

  const activeTreatment = selectedTreatment || (allTreatments && allTreatments.length ? allTreatments[0] : null);

  if (!activeTreatment) {
    return (
      <section className="empty-state" style={{ padding: '3rem 1rem', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '2rem auto', maxWidth: '600px' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#0d2f5d', fontWeight: 800 }}>Select a treatment to view details</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.5rem 0 1.25rem' }}>Treatment details are loaded from the live catalog. Please choose a treatment first.</p>
        <button onClick={() => setPage('treatments')} type="button" className="pdl-btn-primary">Browse treatments</button>
      </section>
    );
  }

  const treatmentMeaning = buildTreatmentMeaning(activeTreatment);
  const { code: clinicalCode, condition: clinicalCondition, description: treatmentDescription, displayTitle: displayTreatmentTitle, pageTitle: pageTreatmentTitle } = treatmentMeaning;

  const treatmentNeedle = normalizeSearch([activeTreatment.title, displayTreatmentTitle, activeTreatment.category, activeTreatment.group, activeTreatment.specialty, clinicalCondition, clinicalCode].filter(Boolean).join(' '));
  const relatedHospitals = (hospitals || []).filter((hospital) => {
    const hospitalTags = Array.isArray(hospital.tags) ? hospital.tags : [];
    const hospitalText = normalizeSearch([hospital.specialty, hospital.department, hospital.summary, ...hospitalTags].filter(Boolean).join(' '));
    return hospitalTags.includes(activeTreatment.title)
      || hospitalTags.includes(displayTreatmentTitle)
      || hospital.specialty === activeTreatment.specialty
      || (treatmentNeedle && hospitalText && (hospitalText.includes(treatmentNeedle) || treatmentNeedle.includes(normalizeSearch(hospital.specialty || ''))));
  });
  const matchedHospitals = relatedHospitals.length ? relatedHospitals : (hospitals || []);
  const suggestedHospitals = [
    ...matchedHospitals,
    ...(hospitals || []).filter((hospital) => !matchedHospitals.some((item) => item.id === hospital.id)),
  ];
  const bestMatches = suggestedHospitals.slice(0, 6);
  const backendPackage = Number(activeTreatment.packageFrom || 0);
  const categoryLabel = activeTreatment.category || activeTreatment.group || activeTreatment.specialty || 'Medical treatment';
  const sourceLabel = 'Verified Treatment Package';

  // Medical procedures created by Admin for this treatment group
  const icdProcedures = allTreatments.filter((t) => {
    const isProcedureRecord = !!(t.adminRecordId || t.procedureCode || t.icdCode || t.icdUri || t.sourceSystem);
    if (!isProcedureRecord) return false;

    const tGroup = (t.group || t.category || t.specialty || '').toLowerCase();
    const selGroup = (activeTreatment.group || activeTreatment.category || activeTreatment.specialty || '').toLowerCase();
    const selTitle = (activeTreatment.title || '').toLowerCase();
    return (
      (tGroup && selGroup && (tGroup === selGroup || tGroup.includes(selGroup) || selGroup.includes(tGroup))) ||
      (selTitle && tGroup && selTitle.includes(tGroup))
    );
  });

  const treatmentFAQs = [
    {
      q: `What does ${displayTreatmentTitle} include in the Kairacure medical care package?`,
      a: `${displayTreatmentTitle} includes pre-admission specialist consultations, diagnostic evaluations, surgical/procedure package estimates, hospital stay management in partner rooms, post-operative care coordination, and dedicated 24/7 patient desk support.`
    },
    {
      q: `How do I receive an exact cost estimate & chief surgeon opinion for ${displayTreatmentTitle}?`,
      a: `Submit your medical reports using the Journey Planner. Our care team shares your case directly with chief surgeons at JCI/NABH accredited hospitals and sends an itemized cost estimate within 24 hours.`
    },
    {
      q: `Can Kairacure assist with Medical Visa (VIL), airport transfer, and stay?`,
      a: `Yes. We issue official hospital Visa Invitation Letters (VIL) for priority medical visas, arrange 24/7 private airport pickups, and provide verified patient-friendly partner hotel options near the hospital.`
    },
    {
      q: `What is the expected hospital stay & recovery period for ${displayTreatmentTitle}?`,
      a: `Hospital stay generally ranges from 3 to 7 days depending on procedure complexity and surgeon recommendation, followed by 3-5 days of outpatient checkups before fit-to-fly certification.`
    },
    {
      q: `Are hospital payments made directly, and is health insurance supported?`,
      a: `All medical package payments are made directly at the hospital billing counter upon arrival. We also assist with international health insurance pre-authorizations and cashless claim documentation.`
    }
  ];

  const heroImage = activeTreatment.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=85';

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#0f172a' }}>

      {/* MAIN CONTENT CONTAINER */}
      <main className="treatment-detail-container" style={{ width: '100%', maxWidth: '1200px', padding: '1rem clamp(16px, 4vw, 40px) 3rem', margin: '0 auto', boxSizing: 'border-box' }}>

        {/* BREADCRUMBS */}
        <div style={{ marginBottom: '0.65rem' }}>
          <Breadcrumbs
            items={[
              { label: 'Home', onClick: () => setPage('home') },
              { label: 'Treatments', onClick: () => setPage('treatments') },
              { label: categoryLabel, onClick: () => setPage('treatments') },
              { label: displayTreatmentTitle },
            ]}
          />
        </div>

        {/* HERO CARD */}
        <div className="pdl-card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '1rem', boxShadow: '0 2px 10px rgba(0,102,254,0.06)' }}>
          <div className="pdl-hero-grid">

            {/* Left Cover Image */}
            <div className="pdl-cover-wrap" style={{ height: '230px', position: 'relative', borderRadius: '10px', overflow: 'hidden' }}>
              <img src={heroImage} alt={pageTreatmentTitle} onError={handleImageFallback} className="pdl-cover-img" />
              <span className="pdl-badge-verified">
                <i className="bi bi-shield-check" style={{ color: '#38bdf8' }} /> Verified Care Package
              </span>
            </div>

            {/* Right Details Header */}
            <div>
              {/* MODERN PILL BADGES */}
              <div className="pdl-badge-wrap" style={{ marginBottom: '8px' }}>
                <span className="pdl-badge-blue">
                  <i className="bi bi-stethoscope" /> {categoryLabel}
                </span>
                {clinicalCode && (
                  <span className="pdl-badge-gold">
                    <i className="bi bi-file-earmark-medical" /> Clinical Code: {clinicalCode}
                  </span>
                )}
              </div>

              {/* TITLE */}
              <h1 className="pdl-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
                {pageTreatmentTitle}
              </h1>

              {/* CLINICAL OVERVIEW */}
              <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '0.85rem' }}>
                {treatmentDescription}
              </p>

              {/* SPEC PILLS BAR */}
              <div className="pdl-specs-grid" style={{ marginBottom: '1rem' }}>
                <div>
                  <strong className="pdl-spec-val" style={{ color: '#0d2f5d' }}>{backendPackage ? money(backendPackage) : 'On Request'}</strong>
                  <span className="pdl-spec-lbl">Est. Package</span>
                </div>
                <div>
                  <strong className="pdl-spec-val">{clinicalCode || 'Mapped'}</strong>
                  <span className="pdl-spec-lbl">Catalog Ref</span>
                </div>
                <div>
                  <strong className="pdl-spec-val">{bestMatches.length || '5+'}</strong>
                  <span className="pdl-spec-lbl">Matched Hospitals</span>
                </div>
                <div>
                  <strong className="pdl-spec-val" style={{ color: '#16a34a' }}>4.9 ★</strong>
                  <span className="pdl-spec-lbl">Patient Rating</span>
                </div>
              </div>

              {/* ROYAL BLUE ACTION BUTTONS */}
              <div className="pdl-actions-row">
                <button onClick={() => setPage('planner')} type="button" className="pdl-btn-primary">
                  <i className="bi bi-calendar-check-fill" /> Plan Journey for this Treatment
                </button>
                <button onClick={() => setPage('planner')} type="button" className="pdl-btn-outline">
                  <i className="bi bi-calculator-fill" /> Journey Cost Calculator
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="pdl-nav-tabs" style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1rem', background: '#ffffff' }}>
          {[
            ['overview', 'Overview & Meaning'],
            ['procedures', `Medical Procedures (${icdProcedures.length})`],
            ['hospitals', `Suggested Hospitals (${bestMatches.length})`],
            ['faqs', 'FAQs'],
          ].map(([tabKey, tabLabel]) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              className={`pdl-tab-btn${activeTab === tabKey ? ' active' : ''}`}
            >
              {tabLabel}
            </button>
          ))}
        </div>

        {/* TAB PANELS CONTENT */}
        <div>

          {/* 1. OVERVIEW & CLINICAL MEANING */}
          {(activeTab === 'overview' || activeTab === 'all') && (
            <div className="pdl-card" style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '1rem' }}>
              <h3 className="pdl-section-h3" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d2f5d', marginBottom: '0.65rem' }}>
                Treatment Overview & Care Highlights
              </h3>
              <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                {treatmentDescription}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <i className="fa-solid fa-stethoscope" style={{ fontSize: '1.25rem', color: '#2563eb', marginBottom: '0.35rem' }} />
                  <strong style={{ display: 'block', fontSize: '0.88rem', color: '#0f172a' }}>Clinical Focus</strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{clinicalCondition} ({sourceLabel})</span>
                </div>

                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <i className="fa-solid fa-hospital" style={{ fontSize: '1.25rem', color: '#2563eb', marginBottom: '0.35rem' }} />
                  <strong style={{ display: 'block', fontSize: '0.88rem', color: '#0f172a' }}>Hospital Care Teams</strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{bestMatches.length} JCI/NABH hospitals available</span>
                </div>

                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <i className="fa-solid fa-calculator" style={{ fontSize: '1.25rem', color: '#2563eb', marginBottom: '0.35rem' }} />
                  <strong style={{ display: 'block', fontSize: '0.88rem', color: '#0f172a' }}>Package Estimate</strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{backendPackage ? money(backendPackage) : 'On Request'} starting rate</span>
                </div>
              </div>
            </div>
          )}

          {/* AI MEDICAL GUIDANCE ASSISTANT WIDGET */}
          <div className="pdl-card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1.5px solid #bfdbfe', background: 'linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%)', marginBottom: '1.25rem', boxShadow: '0 2px 10px rgba(0, 102, 254, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d2f5d 0%, #0052cc 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 3px 10px rgba(0, 102, 254, 0.3)', flexShrink: 0 }}>
                <i className="bi bi-robot" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Ask Kairacure AI Expert</h3>
                <span style={{ fontSize: '0.8rem', color: '#0d2f5d', fontWeight: 600 }}>Instant medical guidance for {pageTreatmentTitle}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {[
                { label: 'Required Medical Reports', query: `What reports are needed for ${pageTreatmentTitle}?`, icon: 'bi-file-earmark-medical-fill' },
                { label: 'Recovery Time & Stay', query: `What is the recovery time & stay for ${pageTreatmentTitle}?`, icon: 'bi-clock-history' },
                { label: 'Questions for Doctor', query: `What questions should I ask the doctor regarding ${pageTreatmentTitle}?`, icon: 'bi-chat-left-dots-fill' },
                { label: 'Estimated Package Cost', query: `Get estimated INR cost range in Delhi/NCR for ${pageTreatmentTitle}`, icon: 'bi-currency-rupee' }
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleAskAi(chip.query)}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #bfdbfe',
                    borderRadius: '20px',
                    padding: '0.4rem 0.9rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#0d2f5d',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(0, 102, 254, 0.06)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <i className={`bi ${chip.icon}`} style={{ color: '#0d2f5d', fontSize: '0.85rem' }} />
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {aiLoading && (
              <div style={{ padding: '0.85rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #bfdbfe', color: '#0d2f5d', fontSize: '0.85rem', fontWeight: 600 }}>
                <i className="bi bi-arrow-repeat spin" style={{ marginRight: '0.5rem' }} /> Consulting Kairacure AI Expert for {pageTreatmentTitle}...
              </div>
            )}

            {aiReply && !aiLoading && (
              <div style={{ padding: '1rem', background: '#ffffff', borderRadius: '10px', border: '1.5px solid #93c5fd', boxShadow: '0 2px 8px rgba(0, 102, 254, 0.08)' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#16a34a' }} /> AI Guidance Response
                </div>
                {aiReply.split('\n').filter((l) => l.trim()).map((line, idx) => (
                  <p key={idx} style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, margin: '0.3rem 0' }}>{line}</p>
                ))}
                <div style={{ marginTop: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <small style={{ color: '#64748b', fontSize: '0.75rem' }}>Educational guidance only · Consult a qualified specialist</small>
                  <button onClick={() => setPage('ai-assistant')} type="button" style={{ border: 'none', background: 'transparent', color: '#0d2f5d', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                    Open Full AI Chat →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. SPECIFIC PROCEDURES GRID */}
          {(activeTab === 'procedures' || activeTab === 'overview') && (
            <div className="pdl-card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '1rem', boxShadow: '0 2px 10px rgba(0,102,254,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '8px' }}>
                <h3 className="pdl-section-h3" style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Procedures &amp; Surgical Options
                </h3>
                <span className="pdl-badge-blue" style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', color: '#0d2f5d', fontSize: '0.74rem', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
                  <i className="bi bi-list-check" style={{ marginRight: '4px' }} /> {icdProcedures.length} Procedures
                </span>
              </div>

              {icdProcedures.length === 0 ? (
                <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <i className="fa-solid fa-notes-medical" style={{ fontSize: '1.75rem', color: '#94a3b8', marginBottom: '0.4rem' }} />
                  <h4 style={{ color: '#0d2f5d', fontSize: '0.95rem', fontWeight: 700 }}>No procedures added for {displayTreatmentTitle} yet</h4>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                    Specific procedures created by the admin in ICD mapping will appear here. You can plan a custom journey plan anytime.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1rem' }}>
                  {icdProcedures.map((proc) => {
                    const procTitle = getTreatmentDisplayTitle(proc);
                    const hasPrice = proc.packageFrom && proc.packageFrom > 0;

                    return (
                      <div
                        key={proc.id || proc._id}
                        style={{
                          padding: '1.2rem',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          justify: 'space-between',
                          boxShadow: '0 4px 16px rgba(13, 47, 93, 0.04)',
                          transition: 'all 0.2s ease',
                        }}
                        className="pdl-proc-card"
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #0d2f5d 0%, #0052cc 100%)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1rem',
                              boxShadow: '0 3px 8px rgba(0, 102, 254, 0.25)',
                              flexShrink: 0,
                            }}>
                              <i className="bi bi-heart-pulse-fill" aria-hidden="true" />
                            </div>
                            <h4 style={{ fontSize: '0.96rem', color: '#0f172a', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                              {procTitle}
                            </h4>
                          </div>

                          <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem' }}>
                            {proc.description && !proc.description.includes('mapped from backend') && !proc.description.includes('backend-managed') && !proc.description.startsWith('WHO ICD-11') 
                              ? (proc.description.length > 100 ? proc.description.slice(0, 97) + '...' : proc.description)
                              : 'Comprehensive medical package with specialist consultation, diagnostic evaluations, and hospital stay support.'}
                          </p>
                        </div>

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ minWidth: 0, flexShrink: 1 }}>
                            <span style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                              Starting From
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: hasPrice ? '#0d2f5d' : '#64748b', whiteSpace: 'nowrap', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {hasPrice ? money(proc.packageFrom) : 'Quote on request'}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              if (setPlannerInitialProcedure) setPlannerInitialProcedure(proc);
                              setPage('planner');
                            }}
                            type="button"
                            style={{
                              background: 'linear-gradient(135deg, #0d2f5d 0%, #0052cc 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.4rem 0.85rem',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              height: '34px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 3px 10px rgba(0, 102, 254, 0.25)',
                              transition: 'all 0.2s ease',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}
                          >
                            Plan Procedure <i className="bi bi-arrow-right-short" aria-hidden="true" style={{ fontSize: '1.1rem' }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. SUGGESTED HOSPITALS */}
          {(activeTab === 'hospitals' || activeTab === 'overview') && (
            <div className="pdl-card" style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <h3 className="pdl-section-h3" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d2f5d', marginBottom: 0 }}>
                  Suggested Hospitals for {displayTreatmentTitle}
                </h3>
                <button onClick={() => setPage('partners')} type="button" style={{ border: 'none', background: 'transparent', color: '#2563eb', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                  View All Partners →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1rem' }}>
                {bestMatches.map((hosp) => (
                  <div
                    key={hosp.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      background: '#ffffff',
                      boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ height: '150px', overflow: 'hidden', position: 'relative' }}>
                        <img src={getHospitalImage(hosp)} alt={hosp.name} onError={handleImageFallback} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span className="pdl-badge-verified" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', top: '0.5rem', left: '0.5rem' }}>
                          <i className="fa-solid fa-award" style={{ marginRight: '0.25rem', color: '#fbbf24' }} />
                          {hosp.jciAccredited ? 'JCI Accredited' : accreditationText(hosp.accreditations, 'Accredited')}
                        </span>
                      </div>
                      <div style={{ padding: '0.9rem 0.9rem 0.5rem' }}>
                        <h4 style={{ fontSize: '0.92rem', color: '#0d2f5d', fontWeight: 700, lineHeight: 1.35, marginBottom: '0.35rem', minHeight: '2.5em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{hosp.name}</h4>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <i className="fa-solid fa-location-dot" style={{ color: '#ef4444' }} /> {hosp.city}, {hosp.country}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Footer with Text Link */}
                    <div style={{ borderTop: '1px solid #f1f5f9', padding: '0.75rem 0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b' }}>Starts from</span>
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0d2f5d' }}>
                          {hosp.cost?.package ? money(hosp.cost.package) : activeTreatment.packageFrom ? money(activeTreatment.packageFrom) : 'Cost on Request'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (setSelectedHospital) setSelectedHospital(hosp);
                          setPage('partner-detail');
                        }}
                        type="button"
                        style={{ border: 'none', background: 'transparent', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: 0 }}
                      >
                        View Details <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.75rem' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. INTERACTIVE FAQS */}
          {(activeTab === 'faqs' || activeTab === 'overview') && (
            <div className="pdl-card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,102,254,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f0f7ff', color: '#0d2f5d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                  <i className="bi bi-question-circle-fill" />
                </div>
                <h3 className="pdl-section-h3" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Frequently Asked Questions
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {treatmentFAQs.map((faq, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div 
                      key={i} 
                      style={{ 
                        background: isOpen ? '#f0f7ff' : '#ffffff', 
                        border: isOpen ? '1.5px solid #0d2f5d' : '1px solid #e2e8f0', 
                        borderRadius: '10px', 
                        overflow: 'hidden',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        type="button"
                        style={{ 
                          width: '100%', 
                          padding: '0.9rem 1.1rem', 
                          background: 'transparent', 
                          border: 'none', 
                          textAlign: 'left', 
                          fontWeight: 700, 
                          color: isOpen ? '#0d2f5d' : '#0f172a', 
                          display: 'flex', 
                          justify: 'space-between', 
                          alignItems: 'center', 
                          cursor: 'pointer', 
                          fontSize: '0.9rem',
                          gap: '10px'
                        }}
                      >
                        <span style={{ flex: 1 }}>{faq.q}</span>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isOpen ? '#0d2f5d' : '#f1f5f9', color: isOpen ? '#ffffff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>
                          <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
                        </div>
                      </button>
                      {isOpen && (
                        <div style={{ padding: '0 1.1rem 1rem', color: '#475569', fontSize: '0.85rem', lineHeight: 1.6, borderTop: '1px dashed #bfdbfe', paddingTop: '0.75rem' }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
