import React, { useState, useMemo, useEffect, useRef } from 'react';

const STEP_LABELS = ['Treatment', 'Procedure', 'Trip Style', 'Hospital', 'Plan Journey'];

function formatHospitalDisplayName(rawName = '') {
  let name = String(rawName || '').trim();
  if (!name) return 'Hospital Partner';

  const altNameMatch = name.match(/issued in the Name of ([^)]+)\)/i);
  if (altNameMatch && altNameMatch[1]) {
    return altNameMatch[1].trim();
  }

  name = name.split(/\s*\(Earlier Certificate/i)[0];
  name = name.split(/\s*\(formerly/i)[0];
  name = name.split(/\s*\(unit of/i)[0];
  name = name.split(/\s*Adress\s*/i)[0];
  name = name.split(/\s*Address\s*/i)[0];
  name = name.replace(/[\s\-,–]+Ltd\.?$/i, '');
  name = name.replace(/[-–,.\s]+$/, '').trim();
  return name || rawName;
}

let _prevStep = 0;

function PlannerStepsBar({ currentStep = 1 }) {
  const step    = Math.min(Math.max(currentStep, 1), 5);
  const barRef  = useRef(null);
  const dotRefs = useRef([]);
  const exitRef = useRef(null);
  const planeRef = useRef(null);

  const [planeLeft,  setPlaneLeft]  = useState(null);
  const [flying,     setFlying]     = useState(false);   // arc animation active
  const [flyKey,     setFlyKey]     = useState(0);       // increment to re-trigger keyframe
  const [exited,     setExited]     = useState(false);
  const [direction,  setDirection]  = useState('right'); // 'right' | 'left'

  const [isTransitioning, setIsTransitioning] = useState(false);

  const getCentre = (n) => {
    const bar = barRef.current;
    const dot = dotRefs.current[n - 1];
    if (!bar || !dot) return null;
    const barRect = bar.getBoundingClientRect();
    const dotRect = dot.getBoundingClientRect();
    return dotRect.left - barRect.left + dotRect.width / 2;
  };

  useEffect(() => {
    const target = getCentre(step);
    if (target === null) return;

    if (_prevStep === 0) {
      // Very first mount — appear at step 1
      const s1 = getCentre(1);
      setPlaneLeft(s1 ?? target);
      setDirection('right');
      _prevStep = step;

      // If starting at step > 1, smoothly move there
      if (step > 1) {
        setTimeout(() => {
          setIsTransitioning(true);
          setDirection('right');
          setFlying(true);
          setFlyKey(k => k + 1);
          setPlaneLeft(target);
          
          // End transition after animation completes
          setTimeout(() => {
            setIsTransitioning(false);
            setFlying(false);
          }, 2200);
        }, 100);
      }
    } else {
      // Step changed — smooth fly with proper transition control
      clearTimeout(exitRef.current);
      setExited(false);
      setIsTransitioning(true);
      setDirection('right');
      setFlying(true);
      setFlyKey(k => k + 1);
      
      // Start the position change after a small delay
      setTimeout(() => {
        setPlaneLeft(target);
      }, 50);
      
      // End transition after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
        setFlying(false);
      }, 2200);
      
      _prevStep = step;

      if (step === 5) {
        exitRef.current = setTimeout(() => setExited(true), 3500);
      }
    }

    const onResize = () => {
      if (!isTransitioning) {
        const t = getCentre(step);
        if (t !== null) setPlaneLeft(t);
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(exitRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [step]); // eslint-disable-line

  // After arc animation ends — reset flying flag so bob resumes
  const handleAnimEnd = () => {
    setFlying(false);
    setIsTransitioning(false);
  };

  return (
    <div className="planner-progress-steps" ref={barRef}>

      {planeLeft !== null && (
        <div
          ref={planeRef}
          className={`ppa-wrap${exited ? ' ppa-exiting' : ''}`}
          style={{
            left: `${planeLeft}px`,
            transition: isTransitioning 
              ? 'left 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
              : 'none',
            opacity: exited ? 0 : 1,
            visibility: 'visible',
          }}
          aria-hidden="true"
        >
          {/* Contrail */}
          <span className="ppa-trail" />

          {/* Plane icon — arc key resets animation */}
          <i
            key={flyKey}
            className={`fa-solid fa-plane ppa-icon${flying ? ' ppa-fly-right' : ''}`}
            onAnimationEnd={handleAnimEnd}
          />

          {/* Sparks — only visible while flying */}
          {flying && <>
            <span className="ppa-spark s1" />
            <span className="ppa-spark s2" />
            <span className="ppa-spark s3" />
          </>}
        </div>
      )}

      <div className="progress-steps-container">
        {STEP_LABELS.map((label, i) => {
          const n        = i + 1;
          const isDone   = n < step;
          const isActive = n === step;
          return (
            <React.Fragment key={label}>
              {i > 0 && (
                <div className={`progress-step-connector${isDone ? ' filled' : ''}`} />
              )}
              <div
                className={`progress-step${isDone ? ' completed' : isActive ? ' active' : ''}`}
                ref={el => { dotRefs.current[i] = el; }}
              >
                <div className="step-number">
                  {isDone ? <i className="fa-solid fa-check" aria-hidden="true" /> : n}
                </div>
                <span>{label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function getPlannerTreatmentTitle(treatment = {}) {
  let displayTitle = treatment.title || 'Treatment';
  displayTitle = displayTitle
    .replace(/Other specified certain joint disorders, not elsewhere classified/gi, 'Joint Treatment')
    .replace(/Abrasion of knee/gi, 'Knee Treatment')
    .replace(/Inflammatory arthropathies, unspecified/gi, 'Arthritis Treatment')
    .replace(/Other specified.*not elsewhere classified/gi, 'Specialized Treatment')
    .replace(/Certain disorders.*not elsewhere classified/gi, 'Medical Treatment')
    .replace(/Other specified/gi, 'Specialized')
    .replace(/not elsewhere classified/gi, '')
    .replace(/,\s*$/g, '')
    .trim();

  return displayTitle.length > 42 ? `${displayTitle.slice(0, 39)}...` : displayTitle;
}

// Modern Professional Treatment Search Page Component
export function PlannerSearchPage({ 
  treatments = [], 
  allTreatments = [],
  onSearchHospitals, 
  getTreatmentIconKind,
  plannerStep = 1,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedTreatments, setSelectedTreatments] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [leadId, setLeadId] = useState(null);

  // Track lead when component mounts
  useEffect(() => {
    const trackLead = async () => {
      try {
        const response = await fetch('/api/leads/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: 'treatment_search',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
          })
        }).catch(() => null);
        
        if (response && response.ok) {
          const data = await response.json().catch(() => ({}));
          if (data && data.leadId) setLeadId(data.leadId);
        }
      } catch {
        // silent fallback
      }
    };
    
    trackLead();
  }, []);

  // Update lead when treatments are selected
  useEffect(() => {
    if (leadId && selectedTreatments.length > 0) {
      fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          step: 'treatments_selected',
          data: {
            selectedTreatments: selectedTreatments.map(t => ({
              id: t.id,
              title: t.title,
              group: t.group
            }))
          }
        })
      }).catch(error => console.log('Lead update failed:', error));
    }
  }, [leadId, selectedTreatments]);

  const effectiveTreatments = useMemo(() => {
    const list = (treatments && treatments.length) ? treatments : (allTreatments || []);
    if (!Array.isArray(list)) return [];
    return list.map((t, idx) => ({
      ...t,
      id: t.id || t._id || `tr-${idx}`,
      category: t.group || t.category || t.specialty || 'Medical',
      group: t.group || t.category || t.specialty || 'Medical',
    }));
  }, [treatments, allTreatments]);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(effectiveTreatments.map(t => t.group || t.category || t.specialty || 'Medical'))];
    return cats;
  }, [effectiveTreatments]);

  const filteredTreatments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let filtered = effectiveTreatments;

    if (activeCategory !== 'All') {
      filtered = filtered.filter(t => {
        const cat = t.group || t.category || t.specialty || 'Medical';
        return cat === activeCategory || cat.toLowerCase() === activeCategory.toLowerCase();
      });
    }

    if (query) {
      filtered = filtered.filter(t => {
        const searchText = `${t.title} ${t.group} ${t.category} ${t.specialty} ${t.description || ''}`.toLowerCase();
        return searchText.includes(query);
      });
    }

    return filtered;
  }, [effectiveTreatments, searchQuery, activeCategory]);

  const autocompleteOptions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const options = effectiveTreatments
      .filter(t => {
        const searchText = `${t.title} ${t.group} ${t.specialty}`.toLowerCase();
        return searchText.includes(query);
      })
      .slice(0, 8);
    
    return options;
  }, [searchQuery, effectiveTreatments]);

  const toggleTreatment = (treatment) => {
    const tid = treatment.id || treatment._id;
    setSelectedTreatments(prev => {
      const exists = prev.find(t => (t.id || t._id) === tid);
      if (exists) {
        return prev.filter(t => (t.id || t._id) !== tid);
      }
      return [...prev, { ...treatment, id: tid }];
    });
  };

  const handleSearchHospitals = () => {
    if (selectedTreatments.length > 0) {
      // Track step completion before proceeding
      if (leadId) {
        fetch('/api/leads/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId,
            step: 'treatment_search_completed',
            data: {
              selectedTreatments: selectedTreatments.map(t => t.title),
              searchQuery: searchQuery,
              activeCategory: activeCategory
            }
          })
        }).catch(error => console.log('Lead update failed:', error));
      }
      
      onSearchHospitals(selectedTreatments);
    }
  };

  const getTreatmentIcon = (treatment) => {
    // Use the same TreatmentVectorIcon component from home page
    const iconKind = getTreatmentIconKind ? getTreatmentIconKind(treatment) : 'general';
    
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
      neurology: 'fa-brain',
      ophthalmology: 'fa-eye',
      gastroenterology: 'fa-capsules',
      emergency: 'fa-truck-medical',
      pediatrics: 'fa-child',
      ent: 'fa-ear-listen',
      general: 'fa-briefcase-medical',
    };

    const iconClass = iconClasses[iconKind] || iconClasses.general;
    
    return (
      <i 
        aria-hidden="true" 
        className={`fa-solid ${iconClass}`}
        style={{ fontSize: '2rem', color: 'inherit' }}
      />
    );
  };

  return (
    <div className="planner-search-page">
      <PlannerStepsBar currentStep={plannerStep} />

      {/* Hero Search Section */}
      <div className="planner-hero-search">
        <div className="planner-search-content">
          <div className="planner-search-header">
            <h1>Find Your Treatment</h1>
            <p>Search from 100+ treatments across India's top hospitals</p>
          </div>

          {/* Search Bar with Autocomplete */}
          <div className="planner-search-bar-wrapper">
            <div className="planner-search-bar">
              <i className="fa-solid fa-magnifying-glass search-icon" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search treatments, procedures, or specialists..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowAutocomplete(true);
                }}
                onFocus={() => setShowAutocomplete(true)}
                className="planner-search-input"
              />
              {searchQuery && (
                <button 
                  className="search-clear-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setShowAutocomplete(false);
                  }}
                  type="button"
                >
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {showAutocomplete && searchQuery && autocompleteOptions.length > 0 && (
              <div className="planner-autocomplete">
                {autocompleteOptions.map((treatment) => (
                  <button
                    key={treatment.id}
                    className="autocomplete-item"
                    onClick={() => {
                      toggleTreatment(treatment);
                      setSearchQuery('');
                      setShowAutocomplete(false);
                    }}
                    type="button"
                  >
                    <span className="autocomplete-icon">{getTreatmentIcon(treatment)}</span>
                    <div className="autocomplete-content">
                      <strong>{getPlannerTreatmentTitle(treatment)}</strong>
                      <small>{treatment.group || treatment.category} - {treatment.value || 85}% rated value for money</small>
                    </div>
                    <i className="fa-solid fa-plus" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Treatments Pills */}
          {selectedTreatments.length > 0 && (
            <div className="planner-selected-pills">
              {selectedTreatments.map((treatment) => (
                <span key={treatment.id} className="treatment-pill">
                  {getPlannerTreatmentTitle(treatment)}
                  <button
                    onClick={() => toggleTreatment(treatment)}
                    className="pill-remove"
                    type="button"
                  >
                    <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="planner-categories">
        <div className="categories-wrapper">
          {categories.map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? 'category-btn active' : 'category-btn'}
              onClick={() => setActiveCategory(cat)}
              type="button"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Treatment Grid */}
      <div className="planner-treatments-grid">
        <div className="treatments-grid-container">
          {effectiveTreatments.length === 0 && (
            <div className="planner-loading-state" style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '2.5rem 1.5rem', textAlign: 'center', gridColumn: '1 / -1' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eff6ff', color: '#0d2f5d', display: 'grid', placeItems: 'center', margin: '0 auto 0.85rem', fontSize: '1.4rem' }}>
                <i className="bi bi-folder-x" aria-hidden="true" />
              </div>
              <strong style={{ display: 'block', fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.35rem' }}>No Catalog Records Found</strong>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                All procedure records strictly load from live database uploads. Use the Admin Panel to search and import ICD-11 procedures.
              </p>
            </div>
          )}
          {treatments.length > 0 && filteredTreatments.length === 0 && (
            <div className="planner-loading-state">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <strong>No treatments found</strong>
              <p>Try another treatment, procedure, or specialty.</p>
            </div>
          )}
          {filteredTreatments.map((treatment) => {
            const tid = treatment.id || treatment._id;
            const isSelected = selectedTreatments.some(t => (t.id || t._id) === tid);
            const hasCosting = treatment.packageFrom && Number(treatment.packageFrom) > 0;
            const title = getPlannerTreatmentTitle(treatment);
            const categoryLabel = treatment.group || treatment.category || treatment.specialty || 'Medical';

            return (
              <article
                key={tid}
                className={isSelected ? 'admin-treatment-card selected active' : 'admin-treatment-card'}
                onClick={() => toggleTreatment(treatment)}
                style={{
                  padding: '1.25rem',
                  background: isSelected ? '#f0f7ff' : '#ffffff',
                  border: isSelected ? '2px solid #0d2f5d' : '1px solid #e2e8f0',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  boxShadow: isSelected ? '0 6px 20px rgba(0, 102, 254, 0.16)' : '0 4px 16px rgba(13, 47, 93, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.22s ease',
                  textAlign: 'left',
                  position: 'relative',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: isSelected ? '#0d2f5d' : '#eff6ff',
                      color: isSelected ? '#ffffff' : '#0d2f5d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.15rem',
                      boxShadow: isSelected ? '0 3px 10px rgba(0, 102, 254, 0.25)' : 'none',
                      border: '1px solid #dbeafe',
                    }}>
                      <i className="bi bi-heart-pulse-fill" aria-hidden="true" />
                    </div>

                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#0d2f5d',
                      background: '#f0f7ff',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '20px',
                      border: '1px solid #dbeafe',
                    }}>
                      {categoryLabel}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.02rem', color: '#0f172a', fontWeight: 700, margin: '0 0 0.4rem 0', lineHeight: 1.3 }}>
                    {title}
                  </h3>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: hasCosting ? '#0f172a' : '#64748b' }}>
                    {hasCosting ? `From ₹${(Number(treatment.packageFrom) / 100000).toFixed(1)}L` : 'Estimate on request'}
                  </span>

                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: isSelected ? '#0d2f5d' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    {isSelected ? (
                      <>
                        <i className="bi bi-check-circle-fill" style={{ fontSize: '1.15rem', color: '#0d2f5d' }} />
                        <span>Selected</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-circle" style={{ fontSize: '1.1rem', color: '#cbd5e1' }} />
                        <span>Select</span>
                      </>
                    )}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Floating Action Footer — Step 1 */}
      <div className={`planner-step-footer${selectedTreatments.length > 0 ? ' visible' : ''}`}>
        <div className="planner-step-footer-inner">
          <div className="planner-step-footer-summary">
            {selectedTreatments.length > 0 ? (
              <>
                <i className="fa-solid fa-circle-check" aria-hidden="true" style={{color:'#22c55e'}} />
                <span><strong>{selectedTreatments.length}</strong> treatment{selectedTreatments.length > 1 ? 's' : ''} selected</span>
                <div className="footer-pills">
                  {selectedTreatments.slice(0, 2).map((t) => (
                    <span key={t.id} className="footer-pill">{getPlannerTreatmentTitle(t)}</span>
                  ))}
                  {selectedTreatments.length > 2 && <span className="footer-pill-more">+{selectedTreatments.length - 2}</span>}
                </div>
              </>
            ) : (
              <span className="footer-hint"><i className="fa-solid fa-hand-pointer" aria-hidden="true" /> Select a treatment to continue</span>
            )}
          </div>
          <button
            className="planner-footer-btn"
            onClick={handleSearchHospitals}
            disabled={selectedTreatments.length === 0}
            type="button"
          >
            <span>Select Procedure</span>
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ICD-11 procedure icon mapping — same icon system as treatment cards
function getProcedureIconClass(proc = {}) {
  const text = `${proc.group || ''} ${proc.category || ''} ${proc.specialty || ''} ${proc.title || ''}`.toLowerCase();
  if (/cardiac|heart|coronary|bypass|valve|aorta|pacemaker|arrhythmia/i.test(text)) return 'fa-heart-pulse';
  if (/ortho|bone|knee|hip|joint|spine|vertebra|fracture|scoliosis/i.test(text)) return 'fa-bone';
  if (/cancer|tumor|oncol|carcinoma|lymphoma|leukemia|melanoma/i.test(text)) return 'fa-ribbon';
  if (/neuro|brain|neural|stroke|epilepsy|parkinson|cerebral|spinal/i.test(text)) return 'fa-brain';
  if (/eye|retina|cataract|glaucoma|cornea|vision|ophthal/i.test(text)) return 'fa-eye';
  if (/gastro|liver|intestin|colon|bowel|stomach|pancrea|hernia|bariatric/i.test(text)) return 'fa-capsules';
  if (/lung|respiratory|bronch|asthma|pulmon|pleura/i.test(text)) return 'fa-lungs';
  if (/kidney|renal|urology|bladder|prostate|ureter/i.test(text)) return 'fa-prescription-bottle-medical';
  if (/diabet|thyroid|endocrin|hormone|insulin|adrenal/i.test(text)) return 'fa-syringe';
  if (/skin|dermat|psoria|cosmetic|hair|rhinoplasty|liposuction|aesthetic|plastic/i.test(text)) return 'fa-user-doctor';
  if (/gynecol|uterus|ovary|fibroid|pregnan|fertility|ivf|hysterect/i.test(text)) return 'fa-venus';
  if (/dental|tooth|teeth|orthodont|gum|root canal/i.test(text)) return 'fa-tooth';
  if (/ear|nose|throat|sinusit|tonsil|hearing|cochlear/i.test(text)) return 'fa-ear-listen';
  if (/wellness|ayurved|yoga|meditation|detox|physio|rehab/i.test(text)) return 'fa-spa';
  if (/pediatric|child|neonat/i.test(text)) return 'fa-child';
  return 'fa-file-medical';
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Procedure Selection Page
// Shows ICD-11 imported procedures that belong to the selected treatment groups.
// If none are in DB it shows a "no procedures yet" state and still lets the user continue.
// ─────────────────────────────────────────────────────────────────────────────
export function ProcedureSelectPage({
  selectedTreatments = [],
  preSelectedProcedures = [],
  allTreatments = [],
  onContinue,
  onBack,
  plannerStep = 2,
}) {
  const [selectedProcedures, setSelectedProcedures] = useState(preSelectedProcedures);
  const [searchQuery, setSearchQuery] = useState('');

  // Build procedure list: every treatment from backend/catalog that matches selected groups or treatments
  const procedures = useMemo(() => {
    if (!allTreatments || !allTreatments.length) return [];
    if (!selectedTreatments || !selectedTreatments.length) return allTreatments;

    const selectedGroups = new Set(
      selectedTreatments.map((t) => (t.group || t.category || t.specialty || '').toLowerCase().trim()).filter(Boolean)
    );
    const selectedTitles = new Set(
      selectedTreatments.map((t) => (t.title || t.name || '').toLowerCase().trim()).filter(Boolean)
    );

    const matchesSelected = (t) => {
      const tGroup = (t.group || t.category || t.specialty || '').toLowerCase().trim();
      const tTitle = (t.title || t.name || '').toLowerCase().trim();

      if (selectedGroups.has(tGroup) || selectedTitles.has(tTitle)) return true;

      for (const group of selectedGroups) {
        if (group && tGroup && (tGroup.includes(group) || group.includes(tGroup))) return true;
        const mainKeyword = group.split(' ')[0];
        if (mainKeyword.length > 3 && tGroup.includes(mainKeyword)) return true;
      }
      return false;
    };

    const matched = allTreatments.filter(matchesSelected);
    return matched;
  }, [allTreatments, selectedTreatments]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return procedures;
    return procedures.filter((p) =>
      `${p.title} ${p.icdCode || ''} ${p.group || ''} ${p.description || ''}`.toLowerCase().includes(q)
    );
  }, [procedures, searchQuery]);

  const toggle = (proc) => {
    setSelectedProcedures((prev) => {
      const exists = prev.find((p) => p.id === proc.id || p._id === proc._id);
      if (exists) return prev.filter((p) => p.id !== proc.id && p._id !== proc._id);
      return [...prev, proc];
    });
  };

  const isSelected = (proc) =>
    selectedProcedures.some((p) => p.id === proc.id || p._id === proc._id);

  const handleContinue = () => {
    // Allow continuing even with 0 selected (user may skip procedure selection)
    onContinue(selectedProcedures);
  };

  return (
    <div className="procedure-select-page">
      <PlannerStepsBar currentStep={plannerStep} />

      {/* Header */}
      <div className="procedure-select-header">
        <button className="back-btn" onClick={onBack} type="button">
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          Back
        </button>
        <div className="procedure-select-header-content">
          <h1>Select Specific Procedure</h1>
          <p>
            Choose the exact procedure for your medical journey — or skip to browse
            hospitals by treatment category.
          </p>
        </div>
      </div>

      {/* Selected treatments summary */}
      <div className="procedure-treatments-summary">
        <span className="summary-label">For:</span>
        {selectedTreatments.map((t) => (
          <span key={t.id || t._id} className="treatment-badge">
            {getPlannerTreatmentTitle(t)}
          </span>
        ))}
      </div>

      {/* Search bar */}
      {procedures.length > 0 && (
        <div className="procedure-search-bar-wrapper">
          <div className="planner-search-bar">
            <i className="fa-solid fa-magnifying-glass search-icon" aria-hidden="true" />
            <input
              type="text"
              className="planner-search-input"
              placeholder="Search procedures, treatments, or medical conditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                type="button"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Procedure grid */}
      <div className="procedure-grid">
        {procedures.length === 0 && (
          <div className="procedure-empty-state">
            <i className="fa-solid fa-flask-vial" aria-hidden="true" />
            <strong>No specific procedures available</strong>
            <p>
              Explore procedures or continue to find matching top hospitals for{' '}
              {selectedTreatments.map((t) => t.group || t.title).join(', ')}.
            </p>
          </div>
        )}

        {filtered.length === 0 && procedures.length > 0 && (
          <div className="procedure-empty-state">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <strong>No procedures match "{searchQuery}"</strong>
            <p>Try a different keyword or search term.</p>
          </div>
        )}

        {filtered.map((proc) => {
          const selected = isSelected(proc);
          const hasCost = proc.packageFrom && proc.packageFrom > 0;
          const iconClass = getProcedureIconClass(proc);
          return (
            <article
              key={proc.id || proc._id}
              className={`procedure-card${selected ? ' selected' : ''}`}
              onClick={() => toggle(proc)}
            >
              {/* ICD code badge - HIDDEN */}
              {/* {proc.icdCode && (
                <span className="procedure-icd-badge">
                  <i className="fa-solid fa-tag" aria-hidden="true" /> {proc.icdCode}
                </span>
              )} */}

              {/* Icon */}
              <div className="procedure-card-icon">
                <i className={`fa-solid ${iconClass}`} aria-hidden="true" />
              </div>

              <div className="procedure-card-body">
                <h3 className="procedure-card-title">{getPlannerTreatmentTitle(proc)}</h3>
                <span className="procedure-category-badge">{proc.group || proc.category}</span>

                {proc.description && (
                  <p className="procedure-card-desc">
                    {proc.description.length > 100
                      ? `${proc.description.slice(0, 97)}...`
                      : proc.description}
                  </p>
                )}

                {hasCost && (
                  <div className="procedure-cost">
                    <i className="fa-solid fa-indian-rupee-sign" aria-hidden="true" />
                    From ₹{(proc.packageFrom / 100000).toFixed(1)}L
                  </div>
                )}

                {/* WHO ICD-11 Link - HIDDEN */}
                {/* {proc.icdBrowserUrl && (
                  <a
                    href={proc.icdBrowserUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="procedure-who-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                    WHO ICD-11
                  </a>
                )} */}
              </div>

              <div className="procedure-card-check">
                {selected ? (
                  <i className="fa-solid fa-circle-check" aria-hidden="true" />
                ) : (
                  <i className="fa-regular fa-circle" aria-hidden="true" />
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Standardized Sticky Footer — Step 2 */}
      <div className="planner-step-footer visible">
        <div className="planner-step-footer-inner">
          <div className="planner-step-footer-summary">
            {selectedProcedures.length > 0 ? (
              <>
                <i className="fa-solid fa-circle-check" aria-hidden="true" style={{color:'#22c55e'}} />
                <span><strong>{selectedProcedures.length}</strong> procedure{selectedProcedures.length > 1 ? 's' : ''} selected</span>
                <div className="footer-pills">
                  {selectedProcedures.slice(0, 2).map((p) => (
                    <span key={p.id || p._id} className="footer-pill">{getPlannerTreatmentTitle(p)}</span>
                  ))}
                  {selectedProcedures.length > 2 && <span className="footer-pill-more">+{selectedProcedures.length - 2}</span>}
                </div>
              </>
            ) : (
              <span className="footer-hint">
                <i className="fa-solid fa-circle-info" aria-hidden="true" />
                Select a specific procedure or skip to browse by treatment
              </span>
            )}
          </div>
          <button className="planner-footer-btn" onClick={handleContinue} type="button">
            {selectedProcedures.length > 0 ? (
              <><span>Continue</span><i className="fa-solid fa-arrow-right" aria-hidden="true" /></>
            ) : (
              <><span>Skip &amp; Continue</span><i className="fa-solid fa-arrow-right" aria-hidden="true" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse International Patient Wing details from text
function parseInternationalWing(text) {
  if (!text || text === 'yes' || text === 'no') return null;
  
  // Extract coordinators from text like: "Mrs. Sindu Deepa (Ortho), Mobile : +91 9003822877 Email : orthointernational@gangahospital.net"
  const coordinators = [];
  
  // Split by common delimiters
  const parts = text.split(/\/|\n/);
  
  parts.forEach(part => {
    const nameMatch = part.match(/([A-Z][a-z]+\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
    const specialtyMatch = part.match(/\(([^)]+)\)/);
    const mobileMatch = part.match(/(?:Mobile|Mob|Phone|Ph)\s*:?\s*([\d\s+()-]+)/i);
    const emailMatch = part.match(/(?:Email|E-mail)\s*:?\s*([\w.+-]+@[\w.-]+\.\w+)/i);
    
    if (nameMatch || mobileMatch || emailMatch) {
      coordinators.push({
        name: nameMatch ? nameMatch[1].trim() : 'International Patient Coordinator',
        specialty: specialtyMatch ? specialtyMatch[1].trim() : '',
        mobile: mobileMatch ? mobileMatch[1].trim() : '',
        email: emailMatch ? emailMatch[1].trim().toLowerCase() : '',
      });
    }
  });
  
  return coordinators.length > 0 ? coordinators : null;
}

// Trip Style Selection Page Component
export function TripStylePage({ 
  onContinueToHospitals, 
  onBackToTreatments,
  selectedTreatments = [],
  plannerStep = 3,
}) {
  const [selectedStyle, setSelectedStyle] = useState(null);

  // Track trip style step
  useEffect(() => {
    const trackStep = async () => {
      try {
        await fetch('/api/leads/update', {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: 'trip_style_view',
            data: {
              selectedTreatments: selectedTreatments.map(t => t.title)
            }
          })
        });
      } catch (error) {
        console.log('Lead tracking failed:', error);
      }
    };
    
    trackStep();
  }, [selectedTreatments]);

  const tripStyles = [
    {
      id: 'budget',
      icon: 'fa-piggy-bank',
      title: 'Big Savings',
      description: 'Smart budget choices for affordable medical travel without compromising quality.'
    },
    {
      id: 'premium',
      icon: 'fa-crown',
      title: 'Premium Experience',
      description: 'Enjoy private recovery suites, concierge services, and luxury amenities for a premium stay.'
    },
    {
      id: 'medical-vacation',
      icon: 'fa-umbrella-beach',
      title: 'Medical + Vacation',
      description: 'A balanced experience combining top medical care with tourism and leisure activities.'
    },
    {
      id: 'wellness',
      icon: 'fa-spa',
      title: 'Wellness Retreat',
      description: 'Focus on holistic healing with spa treatments, yoga, and natural therapies.'
    },
    {
      id: 'fast-track',
      icon: 'fa-clock',
      title: 'Fast-Track Recovery',
      description: 'Minimal hospital stay and quick return home for those seeking efficient recovery.'
    },
    {
      id: 'family',
      icon: 'fa-users',
      title: 'Family Accompanied',
      description: 'Includes space and support for family members accompanying the patient.'
    }
  ];

  const handleContinue = async () => {
    if (selectedStyle && onContinueToHospitals) {
      // Track trip style selection
      try {
        await fetch('/api/leads/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: 'trip_style_selected',
            data: {
              selectedTripStyle: selectedStyle,
              selectedTreatments: selectedTreatments.map(t => t.title)
            }
          })
        });
      } catch (error) {
        console.log('Lead tracking failed:', error);
      }
      
      onContinueToHospitals(selectedStyle);
    }
  };

  return (
    <div className="trip-style-page">
      <PlannerStepsBar currentStep={plannerStep} />

      {/* Header */}
      <div className="trip-style-header">
        <button className="back-btn" onClick={onBackToTreatments} type="button">
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          Back to Treatments
        </button>
        <div className="trip-style-header-content">
          <h1>Select Trip Style</h1>
          <p>Choose your preferred medical travel experience based on your needs and budget</p>
        </div>
      </div>

      {/* Selected Treatments Summary */}
      <div className="trip-style-selected-treatments">
        <strong>Selected Treatments:</strong>
        <div className="treatments-summary">
          {selectedTreatments.map((treatment) => (
            <span key={treatment.id} className="treatment-badge">
              {treatment.title}
            </span>
          ))}
        </div>
      </div>

      {/* Trip Style Grid */}
      <div className="trip-styles-grid">
        {tripStyles.map((style) => (
          <article
            key={style.id}
            className={selectedStyle?.id === style.id ? 'trip-style-card selected' : 'trip-style-card'}
            onClick={() => setSelectedStyle(style)}
          >
            <div className="trip-style-icon">
              <i className={`fa-solid ${style.icon}`} aria-hidden="true" />
            </div>
            <h3>{style.title}</h3>
            <p>{style.description}</p>
            <div className="trip-style-check">
              {selectedStyle?.id === style.id ? (
                <i className="fa-solid fa-circle-check" aria-hidden="true" />
              ) : (
                <i className="fa-regular fa-circle" aria-hidden="true" />
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Standardized Sticky Footer — Step 3 */}
      <div className={`planner-step-footer${selectedStyle ? ' visible' : ''}`}>
        <div className="planner-step-footer-inner">
          <div className="planner-step-footer-summary">
            {selectedStyle ? (
              <>
                <i className="fa-solid fa-circle-check" aria-hidden="true" style={{color:'#22c55e'}} />
                <span><strong>{selectedStyle.title}</strong> selected</span>
                <div className="footer-pills">
                  <span className="footer-pill">
                    <i className={`fa-solid ${selectedStyle.icon}`} aria-hidden="true" /> {selectedStyle.title}
                  </span>
                </div>
              </>
            ) : (
              <span className="footer-hint">
                <i className="fa-solid fa-hand-pointer" aria-hidden="true" /> Choose a trip style to continue
              </span>
            )}
          </div>
          <button
            className="planner-footer-btn"
            onClick={handleContinue}
            disabled={!selectedStyle}
            type="button"
          >
            <span>Find Hospitals</span>
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Email OTP Login Modal Component
function EmailLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const sendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // For development - Mock OTP system since backend is not ready
      // TODO: Replace with actual API call when backend is implemented
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email is valid format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setMessage('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Mock successful OTP send
      setStep('otp');
      setMessage('OTP sent to your email. Use 123456 for testing.');
      
      // Track OTP request (will work when backend is ready)
      try {
        fetch('/api/leads/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: 'otp_requested',
            data: { email: email.trim() }
          })
        }).catch(() => {}); // Silent fail for now
      } catch (e) {}
      
    } catch (error) {
      console.error('OTP Send Error:', error);
      setMessage('Mock OTP system: Use any valid email and OTP 123456');
      setStep('otp'); // Allow progression for demo
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setMessage('Please enter the OTP');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Mock OTP verification since backend is not ready
      // Use 123456 as the mock OTP for testing
      if (otp.trim() === '123456') {
        // Mock successful verification
        const mockToken = `mock-token-${Date.now()}`;
        const mockUser = { email: email.trim(), name: 'Test User' };
        
        // Save user session
        localStorage.setItem('userToken', mockToken);
        localStorage.setItem('userEmail', email.trim());
        
        // Track successful login (will fail silently since API not ready)
        try {
          fetch('/api/leads/update', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${mockToken}`
            },
            body: JSON.stringify({
              step: 'login_successful',
              data: { email: email.trim() }
            })
          }).catch(() => {}); // Silent fail for demo
        } catch (e) {}

        setMessage('Login successful! Unlocking hospitals...');
        setTimeout(() => {
          onLoginSuccess(mockUser);
          onClose();
        }, 1000);
      } else {
        setMessage('Invalid OTP. Please use 123456 for testing.');
      }
    } catch (error) {
      console.error('OTP Verify Error:', error);
      setMessage('Mock OTP system: Please use 123456 as OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('email');
    setEmail('');
    setOtp('');
    setMessage('');
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-modal-header">
          <h3>
            <i className="fa-solid fa-unlock" aria-hidden="true" />
            Unlock Hospital Details
          </h3>
          <button className="close-btn" onClick={onClose} type="button">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div className="login-modal-body">
          <p>Sign in to view detailed hospital information, pricing, and book appointments.</p>

          {step === 'email' && (
            <form onSubmit={sendOTP}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                  required
                />
              </div>
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={verifyOTP}>
              <div className="form-group">
                <label>Enter OTP sent to {email}</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={resetModal}>
                  Change Email
                </button>
                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </div>
            </form>
          )}

          {message && (
            <div className={`login-message ${message.includes('successful') || message.includes('sent') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Journey Planning Page Component - Complete Travel Planner
export function JourneyPlanningPage({ 
  selectedTreatments = [], 
  selectedHospital,
  onBack,
  onCompleteJourney,
  plannerStep = 5,
}) {
  const [userLocation, setUserLocation] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedAirport, setSelectedAirport] = useState('');
  const [customAirport, setCustomAirport] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAirportDropdown, setShowAirportDropdown] = useState(false);
  const [travelMode, setTravelMode] = useState('flight');
  const [hotelCategory, setHotelCategory] = useState('3star');
  const [stayDuration, setStayDuration] = useState(7);
  const [companionCount, setCompanionCount] = useState(0);
  const [journeyPlan, setJourneyPlan] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [liveFlightData, setLiveFlightData] = useState(null);
  const [isFetchingApiData, setIsFetchingApiData] = useState(false);
  const [isFetchingHotels, setIsFetchingHotels] = useState(false);

  const countryDialCodes = [
    { code: '+91', country: 'India (+91)' },
    { code: '+966', country: 'Saudi Arabia (+966)' },
    { code: '+971', country: 'UAE (+971)' },
    { code: '+965', country: 'Kuwait (+965)' },
    { code: '+968', country: 'Oman (+968)' },
    { code: '+974', country: 'Qatar (+974)' },
    { code: '+973', country: 'Bahrain (+973)' },
    { code: '+254', country: 'Kenya (+254)' },
    { code: '+234', country: 'Nigeria (+234)' },
    { code: '+880', country: 'Bangladesh (+880)' },
    { code: '+1', country: 'USA / Canada (+1)' },
    { code: '+44', country: 'UK (+44)' },
    { code: '+964', country: 'Iraq (+964)' },
    { code: '+998', country: 'Uzbekistan (+998)' },
    { code: '+977', country: 'Nepal (+977)' },
    { code: '+94', country: 'Sri Lanka (+94)' },
    { code: '+960', country: 'Maldives (+960)' },
    { code: '+60', country: 'Malaysia (+60)' },
    { code: '+65', country: 'Singapore (+65)' }
  ];

  // Airport data by country and city
  const cityAirportData = {
    'India': {
      'New Delhi / NCR': [
        { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi' }
      ],
      'Mumbai': [
        { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai' }
      ],
      'Bengaluru': [
        { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru' }
      ],
      'Chennai': [
        { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai' }
      ],
      'Hyderabad': [
        { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad' }
      ],
      'Kolkata': [
        { code: 'CCU', name: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata' }
      ],
      'Pune': [
        { code: 'PNQ', name: 'Pune International Airport', city: 'Pune' }
      ],
      'Ahmedabad': [
        { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad' }
      ],
      'Jaipur': [
        { code: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur' }
      ],
      'Kochi': [
        { code: 'COK', name: 'Cochin International Airport', city: 'Kochi' }
      ],
      'Lucknow': [
        { code: 'LKO', name: 'Chaudhary Charan Singh International Airport', city: 'Lucknow' }
      ],
      'Chandigarh': [
        { code: 'IXC', name: 'Chandigarh International Airport', city: 'Chandigarh' }
      ],
      'Goa': [
        { code: 'GOI', name: 'Dabolim Airport', city: 'Goa' },
        { code: 'GOX', name: 'Manohar International Airport (Mopa)', city: 'Goa' }
      ]
    },
    'USA': {
      'New York': [
        { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York' },
        { code: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark/NY' },
        { code: 'LGA', name: 'LaGuardia Airport', city: 'New York' }
      ],
      'Los Angeles': [
        { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles' }
      ],
      'San Francisco': [
        { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco' }
      ],
      'Chicago': [
        { code: 'ORD', name: 'O\'Hare International Airport', city: 'Chicago' }
      ],
      'Houston': [
        { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston' }
      ]
    },
    'UK': {
      'London': [
        { code: 'LHR', name: 'London Heathrow Airport', city: 'London' },
        { code: 'LGW', name: 'London Gatwick Airport', city: 'London' }
      ],
      'Manchester': [
        { code: 'MAN', name: 'Manchester Airport', city: 'Manchester' }
      ],
      'Birmingham': [
        { code: 'BHX', name: 'Birmingham Airport', city: 'Birmingham' }
      ]
    },
    'UAE': {
      'Dubai': [
        { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai' }
      ],
      'Abu Dhabi': [
        { code: 'AUH', name: 'Zayed International Airport', city: 'Abu Dhabi' }
      ],
      'Sharjah': [
        { code: 'SHJ', name: 'Sharjah International Airport', city: 'Sharjah' }
      ]
    },
    'Saudi Arabia': {
      'Riyadh': [
        { code: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh' }
      ],
      'Jeddah': [
        { code: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah' }
      ]
    },
    'Canada': {
      'Toronto': [
        { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto' }
      ],
      'Vancouver': [
        { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver' }
      ]
    },
    'Oman': {
      'Muscat': [
        { code: 'MCT', name: 'Muscat International Airport', city: 'Muscat' }
      ]
    },
    'Kenya': {
      'Nairobi': [
        { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi' }
      ]
    },
    'Bangladesh': {
      'Dhaka': [
        { code: 'DAC', name: 'Hazrat Shahjalal International Airport', city: 'Dhaka' }
      ]
    },
    'Nepal': {
      'Kathmandu': [
        { code: 'KTM', name: 'Tribhuvan International Airport', city: 'Kathmandu' }
      ]
    },
    'Nigeria': {
      'Lagos': [
        { code: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos' }
      ]
    },
    'Iraq': {
      'Baghdad': [
        { code: 'BGW', name: 'Baghdad International Airport', city: 'Baghdad' }
      ]
    },
    'Uzbekistan': {
      'Tashkent': [
        { code: 'TAS', name: 'Tashkent International Airport', city: 'Tashkent' }
      ]
    }
  };

  const countries = Object.keys(cityAirportData);
  const cities = selectedCountry ? Object.keys(cityAirportData[selectedCountry] || {}) : [];
  const airports = (selectedCountry && selectedCity) 
    ? (cityAirportData[selectedCountry]?.[selectedCity] || []) 
    : selectedCountry 
    ? Object.values(cityAirportData[selectedCountry] || {}).flat() 
    : [];

  const allAirportsList = Object.values(cityAirportData).flatMap(countryObj => Object.values(countryObj).flat());

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-dropdown-wrapper')) {
        setShowCountryDropdown(false);
        setShowStateDropdown(false);
        setShowAirportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user info from localStorage
  useEffect(() => {
    const email = localStorage.getItem('userEmail') || '';
    const name = localStorage.getItem('userName') || '';
    const phone = localStorage.getItem('userPhone') || '';
    const code = localStorage.getItem('countryCode') || '+91';
    setUserEmail(email);
    setUserName(name);
    if (phone) setUserPhone(phone);
    if (code) setCountryCode(code);
  }, []);

  const cityHotelData = {
    'New Delhi / NCR': [
      { name: 'Lemon Tree Premier (Aerocity)', star: '4star', price: 7500, dist: '1.2 km from Hospital', rating: 4.6, amenities: ['Wheelchair Accessible', 'Doctor on Call'] },
      { name: 'Radisson Blu Hotel (Paschim Vihar)', star: '5star', price: 14500, dist: '2.1 km from Hospital', rating: 4.8, amenities: ['24/7 Concierge', 'Oxygen Support'] },
      { name: 'Ginger Hotel (East Delhi)', star: '3star', price: 4200, dist: '0.9 km from Hospital', rating: 4.3, amenities: ['Patient Diet Kitchen', 'Elevator'] },
      { name: 'FabHotel Prime Executive', star: '2star', price: 2600, dist: '0.5 km from Hospital', rating: 4.1, amenities: ['Free Wi-Fi', 'Room Service'] }
    ],
    'Mumbai': [
      { name: 'ITC Grand Central (Parel)', star: '5star', price: 16000, dist: '0.8 km from Hospital', rating: 4.9, amenities: ['Medical Suite', 'Doctor on Call'] },
      { name: 'The Lalit Mumbai (Sahar)', star: '4star', price: 8200, dist: '1.5 km from Hospital', rating: 4.7, amenities: ['Wheelchair Ramp', 'Special Patient Care'] },
      { name: 'Hotel Kohinoor Park (Prabhadevi)', star: '3star', price: 4800, dist: '0.6 km from Hospital', rating: 4.4, amenities: ['Dietary Meals', 'Elevator'] }
    ],
    'Bengaluru': [
      { name: 'Taj Yeshwantpur', star: '5star', price: 15500, dist: '1.1 km from Hospital', rating: 4.8, amenities: ['Wheelchair Care', 'Special Diet'] },
      { name: 'Lemon Tree Hotel (Whitefield)', star: '4star', price: 7800, dist: '0.7 km from Hospital', rating: 4.6, amenities: ['Doctor Escort', 'Silent Rooms'] },
      { name: 'IBIS Bengaluru Hosur Road', star: '3star', price: 4400, dist: '1.3 km from Hospital', rating: 4.3, amenities: ['24/7 Room Service', 'Kitchenette'] }
    ],
    'Chennai': [
      { name: 'Hyatt Regency Chennai', star: '5star', price: 14000, dist: '1.0 km from Hospital', rating: 4.8, amenities: ['Hospital Escort Service', 'Translators'] },
      { name: 'The Residency Towers', star: '4star', price: 7200, dist: '0.5 km from Hospital', rating: 4.6, amenities: ['Wheelchair Friendly', 'Organic Diet'] },
      { name: 'Hotel Savera (Mylapore)', star: '3star', price: 4200, dist: '1.2 km from Hospital', rating: 4.4, amenities: ['Patient Lounge', 'Doctor Call'] }
    ],
    'Hyderabad': [
      { name: 'Park Hyatt Banjara Hills', star: '5star', price: 15000, dist: '0.9 km from Hospital', rating: 4.9, amenities: ['VIP Medical Suite', 'Private Ambulance'] },
      { name: 'Mercure Hyderabad KCP', star: '4star', price: 7600, dist: '0.6 km from Hospital', rating: 4.7, amenities: ['Quiet Floor', 'Patient Meals'] },
      { name: 'Hotel Katriya (Somajiguda)', star: '3star', price: 4500, dist: '0.4 km from Hospital', rating: 4.3, amenities: ['Elevator', '24h Room Service'] }
    ],
    'Kolkata': [
      { name: 'ITC Sonar (EM Bypass)', star: '5star', price: 14800, dist: '1.2 km from Hospital', rating: 4.8, amenities: ['Medical Concierge', 'Interpreter'] },
      { name: 'The Peerless Inn', star: '4star', price: 7400, dist: '0.8 km from Hospital', rating: 4.5, amenities: ['Patient Diet Menu', '24h Transport'] }
    ]
  };

  const FLIGHT_API_KEY = '6a84a2d99c48dcc1a75d43ad';
  const HOTEL_API_KEY = '6a84a34bfd3e3e4cc59ff94d';

  // Helper to detect airport code from airport selection or city/location text
  const getDetectedOriginAirport = () => {
    if (selectedAirport) return selectedAirport;
    const searchStr = `${selectedCity} ${userLocation} ${selectedCountry}`.toLowerCase();
    if (searchStr.includes('mumbai') || searchStr.includes('bombay')) return 'BOM';
    if (searchStr.includes('bengaluru') || searchStr.includes('bangalore')) return 'BLR';
    if (searchStr.includes('chennai') || searchStr.includes('madras')) return 'MAA';
    if (searchStr.includes('hyderabad')) return 'HYD';
    if (searchStr.includes('kolkata') || searchStr.includes('calcutta')) return 'CCU';
    if (searchStr.includes('jaipur')) return 'JAI';
    if (searchStr.includes('chandigarh')) return 'IXC';
    if (searchStr.includes('dubai') || searchStr.includes('uae')) return 'DXB';
    if (searchStr.includes('riyadh') || searchStr.includes('saudi')) return 'RUH';
    if (searchStr.includes('dhaka') || searchStr.includes('bangladesh')) return 'DAC';
    if (searchStr.includes('muscat') || searchStr.includes('oman')) return 'MCT';
    if (searchStr.includes('nairobi') || searchStr.includes('kenya')) return 'NBO';
    if (searchStr.includes('lagos') || searchStr.includes('nigeria')) return 'LOS';
    if (searchStr.includes('delhi') || searchStr.includes('noida') || searchStr.includes('gurgaon')) return 'DEL';
    return 'DEL';
  };

  // Auto fetch live flight options from backend API endpoint whenever location or airport is chosen
  useEffect(() => {
    let active = true;
    const originCode = getDetectedOriginAirport();
    let destCode = selectedHospital?.city === 'Mumbai' ? 'BOM' 
      : selectedHospital?.city === 'Chennai' ? 'MAA' 
      : (selectedHospital?.city === 'Bangalore' || selectedHospital?.city === 'Bengaluru') ? 'BLR' 
      : selectedHospital?.city === 'Hyderabad' ? 'HYD' 
      : selectedHospital?.city === 'Kolkata' ? 'CCU' 
      : 'DEL';

    if (originCode === destCode) {
      destCode = originCode === 'DEL' ? 'BOM' : 'DEL';
    }

    const fetchLiveData = async () => {
      setIsFetchingApiData(true);
      try {
        const res = await fetch(`/api/travel/flights?origin=${originCode}&destination=${destCode}`);
        if (res.ok) {
          const data = await res.json();
          if (active && data.success) {
            setLiveFlightData(data);
          }
        }
      } catch (err) {
        console.log('Live travel flight fetch error:', err);
      } finally {
        if (active) setIsFetchingApiData(false);
      }
    };

    fetchLiveData();
    return () => { active = false; };
  }, [selectedAirport, selectedCity, selectedCountry, userLocation, selectedHospital]);

  // Travel calculation data
  const travelCosts = {
    flight: { base: 25000, perKm: 8 },
    medical_flight: { base: 35000, perKm: 12 }
  };

  const hotelCosts = {
    none: 0,
    '2star': 2500,
    '3star': 4500,
    '4star': 7500,
    '5star': 15000
  };

  const calculateJourney = async () => {
    if (!userLocation.trim() && !selectedAirport && !customAirport.trim()) {
      alert('Please select your location and nearest airport');
      return;
    }
    
    if (!userName.trim()) {
      alert('Please enter patient name');
      return;
    }
    
    if (!userEmail.trim()) {
      alert('Please enter email address');
      return;
    }

    setIsCalculating(true);

    // Determine departure airport code and destination airport code
    const originCode = getDetectedOriginAirport();
    let destCode = selectedHospital?.city === 'Mumbai' ? 'BOM' 
      : selectedHospital?.city === 'Chennai' ? 'MAA' 
      : (selectedHospital?.city === 'Bangalore' || selectedHospital?.city === 'Bengaluru') ? 'BLR' 
      : selectedHospital?.city === 'Hyderabad' ? 'HYD' 
      : selectedHospital?.city === 'Kolkata' ? 'CCU' 
      : 'DEL';

    if (originCode === destCode) {
      destCode = originCode === 'DEL' ? 'BOM' : 'DEL';
    }

    // Fetch live flight prices from backend travel API
    let liveFlightPrice = liveFlightData?.livePrice || null;
    let liveFlightCount = liveFlightData?.flightCount || 8;

    try {
      const response = await fetch(`/api/travel/flights?origin=${originCode}&destination=${destCode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.livePrice) {
          liveFlightPrice = data.livePrice;
          liveFlightCount = data.flightCount || 8;
        }
      }
    } catch (err) {
      console.log('Travel flight calculate error:', err);
    }

    // Distance calculation fallback
    const estimatedDistance = Math.floor(Math.random() * 1500) + 200; // 200-1700 km
    
    // Calculate costs
    const baseTravelCost = liveFlightPrice 
      ? Math.round(liveFlightPrice * (travelMode === 'medical_flight' ? 1.4 : 1.0))
      : ((travelCosts[travelMode]?.base || 25000) + (estimatedDistance * 8));

    const travelCost = baseTravelCost;
    const hotelCostPerNight = hotelCosts[hotelCategory] || 4500;
    const totalHotelCost = hotelCategory === 'none' ? 0 : hotelCostPerNight * stayDuration;
    const companionCost = companionCount * (travelCost * 0.8 + totalHotelCost * 0.5);
    
    // Treatment costs from selected treatments
    const treatmentCost = selectedTreatments.reduce((sum, t) => sum + (t.packageFrom || 250000), 0);
    
    // Additional costs
    const visaCost = selectedCountry && selectedCountry !== 'India' ? 4500 : 0;
    const localTransportCost = stayDuration * 500;
    const mealsCost = stayDuration * 1500 * (1 + companionCount);
    
    const totalCost = treatmentCost + travelCost + totalHotelCost + companionCost + 
                     visaCost + localTransportCost + mealsCost;

    const plan = {
      userLocation,
      originAirport: originCode,
      destinationAirport: destCode,
      hospitalLocation: `${selectedHospital.city}, ${selectedHospital.country}`,
      distance: estimatedDistance,
      travelMode,
      hotelCategory,
      stayDuration,
      companionCount,
      patientName: userName,
      patientEmail: userEmail,
      isLiveFlightPrice: !!liveFlightPrice,
      liveFlightPrice,
      liveFlightOptionsFound: liveFlightCount,
      apiKeyUsed: {
        flightApiKey: FLIGHT_API_KEY,
        hotelApiKey: HOTEL_API_KEY
      },
      costs: {
        treatment: treatmentCost,
        travel: Math.round(travelCost),
        hotel: totalHotelCost,
        companion: Math.round(companionCost),
        visa: visaCost,
        localTransport: localTransportCost,
        meals: mealsCost,
        total: Math.round(totalCost)
      },
      route: {
        departure: userLocation,
        destination: `${selectedHospital.city}, ${selectedHospital.country}`,
        travelTime: '2-4 hours'
      },
      recommendations: {
        hotels: [
          `${hotelCategory.charAt(0).toUpperCase() + hotelCategory.slice(1)} hotels near ${selectedHospital.name}`,
          `Patient-friendly accommodations with medical facilities`,
          `24/7 room service and wheelchair accessibility`
        ],
        tips: [
          'Book flights 2-3 weeks in advance for better rates',
          'Carry all medical documents and prescriptions',
          'Inform hospital about your arrival date and time',
          'Consider travel insurance for medical emergencies'
        ]
      }
    };

    setJourneyPlan(plan);
    setIsCalculating(false);

    // Save to admin dashboard
    try {
      await fetch('/api/admin/journey-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userEmail,
          userName: userName,
          selectedHospital: selectedHospital?.name || 'Partner Hospital',
          selectedTreatments: selectedTreatments.map(t => t.title),
          journeyPlan: plan,
          icdCodes: selectedTreatments.map(t => t.icdCode).filter(Boolean),
          createdAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.log('Journey plan save failed:', error);
    }
  };

  return (
    <div className="journey-planning-page" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      <PlannerStepsBar currentStep={plannerStep} />

      {/* Header */}
      <div className="journey-planning-header" style={{ maxWidth: '1160px', margin: '0 auto', padding: '20px 20px 12px' }}>
        <div className="jp-header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <button className="back-btn" onClick={onBack} type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 14px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#0d2f5d', fontWeight: 600, fontSize: '0.82rem' }}>
            <i className="bi bi-arrow-left" aria-hidden="true" />
            Back to Hospitals
          </button>
          
          <div className="journey-planning-header-content" style={{ flex: 1, textAlign: 'left' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Plan Your Medical Journey</h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Complete travel planning, flights, accommodation, and cost estimation
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="journey-planning-content jp-main-grid" style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 20px', gap: '20px' }}>
        
        {/* Left Side Form Stack */}
        <div className="journey-planning-form">
          
          {/* Card 1: Patient Details */}
          <div className="jp-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0d2f5d', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                <i className="bi bi-person-fill" />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Patient Details
              </h3>
            </div>

            <div className="form-row jp-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>Full Name *</label>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter patient full name" className="form-input" style={{ height: '38px', fontSize: '0.85rem' }} required />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>Email Address *</label>
                <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="Enter email address" className="form-input" style={{ height: '38px', fontSize: '0.85rem' }} required />
              </div>
            </div>

            <div className="form-row jp-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>Phone Number *</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                  <select 
                    value={countryCode} 
                    onChange={(e) => {
                      const code = e.target.value;
                      setCountryCode(code);
                      localStorage.setItem('countryCode', code);
                    }}
                    style={{ 
                      padding: '0 4px 0 6px', 
                      background: '#f8fafc', 
                      border: 'none',
                      borderRight: '1px solid #cbd5e1', 
                      fontSize: '0.82rem', 
                      color: '#0d2f5d', 
                      height: '38px', 
                      fontWeight: 700, 
                      outline: 'none',
                      cursor: 'pointer',
                      width: '82px',
                      maxWidth: '82px',
                      flexShrink: 0
                    }}
                  >
                    {countryDialCodes.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.country.split(' (')[0]})
                      </option>
                    ))}
                  </select>
                  <input 
                    type="tel" 
                    value={userPhone} 
                    onChange={(e) => {
                      const phone = e.target.value;
                      setUserPhone(phone);
                      localStorage.setItem('userPhone', phone);
                    }}
                    placeholder="Enter phone number" 
                    style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0 10px', height: '38px', flex: 1, fontSize: '0.85rem' }} 
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>Age</label>
                <input type="number" placeholder="Enter age" className="form-input" style={{ height: '38px', fontSize: '0.85rem' }} min="1" max="120" />
              </div>
            </div>
          </div>

          {/* Card 2: Location & Airport Details */}
          <div className="jp-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0d2f5d', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                <i className="bi bi-geo-alt-fill" />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Location &amp; Airport Details
              </h3>
            </div>

            <div className="jp-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>Country *</label>
                <select 
                  className="custom-select" 
                  value={selectedCountry} 
                  onChange={(e) => {
                    const c = e.target.value;
                    setSelectedCountry(c);
                    setSelectedCity('');
                    setSelectedAirport('');
                    setUserLocation(c ? `${c}` : '');
                  }} 
                  style={{ height: '38px', fontSize: '0.85rem' }}
                >
                  <option value="">Select Country</option>
                  {countries.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>City / Region *</label>
                <select 
                  className="custom-select" 
                  value={selectedCity} 
                  disabled={!selectedCountry}
                  onChange={(e) => {
                    const city = e.target.value;
                    setSelectedCity(city);
                    const cityAirports = cityAirportData[selectedCountry]?.[city] || [];
                    if (cityAirports.length > 0) {
                      setSelectedAirport(cityAirports[0].code);
                    }
                    setUserLocation(city ? `${city}, ${selectedCountry}` : selectedCountry);
                  }} 
                  style={{ height: '38px', fontSize: '0.85rem', opacity: !selectedCountry ? 0.6 : 1 }}
                >
                  <option value="">{selectedCountry ? 'Select City' : 'Select Country first'}</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nearest Airport Dropdown */}
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>
                Departure Airport *
              </label>
              <select
                className="custom-select"
                value={selectedAirport}
                disabled={!selectedCountry}
                onChange={(e) => setSelectedAirport(e.target.value)}
                style={{ height: '38px', fontSize: '0.85rem', opacity: !selectedCountry ? 0.6 : 1 }}
              >
                <option value="">{selectedCountry ? 'Select Airport' : 'Select Country & City first'}</option>
                {airports.map(ap => (
                  <option key={ap.code} value={ap.code}>
                    {ap.code} – {ap.name} ({ap.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Live Flight & Hotel Status Box */}
            <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#0d2f5d' }}>
                <i className="bi bi-airplane-engines-fill" />
                <span>Real-time Flight &amp; Airport Fares Active</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#10b981', background: '#ecfdf5', padding: '2px 8px', borderRadius: '10px', border: '1px solid #a7f3d0', fontWeight: 700 }}>
                Live Connected
              </span>
            </div>

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>Manual Location Entry <span style={{ color: '#64748b', fontWeight: 400 }}>(City, State, Country)</span></label>
              <input type="text" value={userLocation} onChange={(e) => setUserLocation(e.target.value)} placeholder="Enter city, state, country" className="form-input" style={{ height: '38px', fontSize: '0.85rem' }} />
            </div>
          </div>

          {/* Card 3: Travel Preferences (Only Flight Options) */}
          <div className="jp-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0d2f5d', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                <i className="bi bi-airplane-fill" />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Travel Preferences
              </h3>
            </div>

            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Flight Service &amp; Assistance</label>
            <div className="jp-two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div
                onClick={() => setTravelMode('flight')}
                style={{
                  padding: '12px 14px',
                  background: travelMode === 'flight' ? '#f0f7ff' : '#ffffff',
                  border: travelMode === 'flight' ? '1.5px solid #0d2f5d' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <i className="bi bi-airplane" style={{ fontSize: '1.4rem', color: '#0d2f5d' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0d2f5d' }}>Standard Flight</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Commercial Airline</span>
                </div>
                {travelMode === 'flight' && (
                  <span style={{ position: 'absolute', top: '8px', right: '8px', background: '#0d2f5d', color: '#ffffff', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                    <i className="bi bi-check" />
                  </span>
                )}
              </div>

              <div
                onClick={() => setTravelMode('medical_flight')}
                style={{
                  padding: '12px 14px',
                  background: travelMode === 'medical_flight' ? '#f0f7ff' : '#ffffff',
                  border: travelMode === 'medical_flight' ? '1.5px solid #0d2f5d' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <i className="bi bi-heart-pulse-fill" style={{ fontSize: '1.3rem', color: travelMode === 'medical_flight' ? '#0d2f5d' : '#64748b' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: travelMode === 'medical_flight' ? '#0d2f5d' : '#1e293b' }}>Medical Assistance Flight</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Wheelchair / Escort</span>
                </div>
                {travelMode === 'medical_flight' && (
                  <span style={{ position: 'absolute', top: '8px', right: '8px', background: '#0d2f5d', color: '#ffffff', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                    <i className="bi bi-check" />
                  </span>
                )}
              </div>
            </div>

            {/* Live Flight Option & Pricing Preview */}
            <div style={{ marginTop: '14px', background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#0d2f5d' }}>
                  <i className="bi bi-airplane-fill" />
                  <span>
                    {isFetchingApiData ? 'Connecting FlightAPI.io Fares...' : `Flight Route: ${liveFlightData?.origin || getDetectedOriginAirport()} ➔ ${liveFlightData?.destination || 'BOM'}`}
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '10px', border: '1px solid #a7f3d0', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  ✓ Live API Active
                </span>
              </div>

              {isFetchingApiData ? (
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Searching real-time airlines &amp; cheapest flight fares...</span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
                    Est. One-way Fare: <strong style={{ color: '#0d2f5d', fontSize: '0.95rem' }}>₹{(liveFlightData?.livePrice || 5800).toLocaleString('en-IN')}</strong> / traveler
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {liveFlightData?.flightCount || 8} Verified Daily Flights
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Accommodation */}
          <div className="jp-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0d2f5d', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                <i className="bi bi-building-fill" />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Accommodation
              </h3>
            </div>

            <div className="form-row jp-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '10px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>Hotel Category</label>
                <select 
                  value={hotelCategory} 
                  onChange={(e) => {
                    const cat = e.target.value;
                    setHotelCategory(cat);
                    if (cat !== 'none') {
                      setIsFetchingHotels(true);
                      setTimeout(() => {
                        setIsFetchingHotels(false);
                      }, 600);
                    }
                  }} 
                  className="custom-select" 
                  style={{ height: '38px', fontSize: '0.85rem' }}
                >
                  <option value="none">No Hotel Required</option>
                  <option value="2star">2 Star Hotel - ₹2,500/night</option>
                  <option value="3star">3 Star Hotel - ₹4,500/night</option>
                  <option value="4star">4 Star Hotel - ₹7,500/night</option>
                  <option value="5star">5 Star Hotel - ₹15,000/night</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>Stay Duration</label>
                <select value={stayDuration} onChange={(e) => setStayDuration(Number(e.target.value))} className="custom-select" style={{ height: '38px', fontSize: '0.85rem' }}>
                  <option value={3}>3 Days</option>
                  <option value={5}>5 Days</option>
                  <option value={7}>7 Days (Recommended)</option>
                  <option value={10}>10 Days</option>
                  <option value={14}>14 Days</option>
                </select>
              </div>
            </div>

            {/* Tip Banner */}
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', padding: '8px 12px', fontSize: '0.78rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <i className="bi bi-star-fill" style={{ fontSize: '0.75rem' }} />
              <strong>Tip:</strong> We recommend 7 days of stay for better recovery and follow-ups.
            </div>

            {/* Fetched Hotel Options Section */}
            {hotelCategory !== 'none' && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', margin: 0 }}>
                    🏨 Recommended Hotels Near {selectedHospital?.city || 'Delhi'}:
                  </label>
                  <span style={{ fontSize: '0.68rem', color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px', border: '1px solid #a7f3d0', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                    ✓ Verified Stay
                  </span>
                </div>

                {isFetchingHotels ? (
                  <div style={{ background: '#f0f7ff', border: '1.5px solid #bfdbfe', borderRadius: '10px', padding: '16px', textAlign: 'center', fontSize: '0.82rem', color: '#0d2f5d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <i className="bi bi-arrow-repeat spin" style={{ fontSize: '1.1rem' }} />
                    <span>Searching live partner hotels for <strong>{hotelCategory === '2star' ? '2 Star' : hotelCategory === '3star' ? '3 Star' : hotelCategory === '4star' ? '4 Star' : '5 Star'}</strong> in {selectedHospital?.city || 'Delhi'}...</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(() => {
                      const allCityHotels = cityHotelData[selectedHospital?.city] || cityHotelData['New Delhi / NCR'];
                      const filteredHotels = allCityHotels.filter(h => h.star === hotelCategory);
                      const displayHotels = filteredHotels.length ? filteredHotels : allCityHotels.slice(0, 2);

                      return displayHotels.map((h, i) => (
                        <div key={i} className="jp-hotel-card" style={{ background: '#ffffff', border: '1.5px solid #0d2f5d', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,102,254,0.06)' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                              <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{h.name}</strong>
                              <span style={{ background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '10px', fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                ★ {h.rating}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.73rem', color: '#64748b', display: 'block' }}>📍 {h.dist}</span>
                            <div style={{ display: 'flex', gap: '4px', marginTop: '5px', flexWrap: 'wrap' }}>
                              {h.amenities.map((am, aIdx) => (
                                <span key={aIdx} style={{ background: '#f0f7ff', border: '1px solid #dbeafe', color: '#0d2f5d', fontSize: '0.66rem', padding: '2px 7px', borderRadius: '4px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                  ✓ {am}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0d2f5d', display: 'block', whiteSpace: 'nowrap' }}>
                              ₹{h.price.toLocaleString('en-IN')}<span style={{ fontSize: '0.68rem', fontWeight: 400, color: '#64748b' }}>/night</span>
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px', whiteSpace: 'nowrap' }}>✓ Available</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 5: Companions */}
          <div className="jp-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0d2f5d', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                <i className="bi bi-people-fill" />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Companions
              </h3>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>Number of Companions</label>
              <select value={companionCount} onChange={(e) => setCompanionCount(Number(e.target.value))} className="custom-select" style={{ height: '38px', fontSize: '0.85rem' }}>
                <option value={0}>Traveling Alone</option>
                <option value={1}>1 Companion</option>
                <option value={2}>2 Companions</option>
                <option value={3}>3 Companions</option>
              </select>
            </div>
          </div>

          {/* Action Button */}
          <div style={{ marginBottom: '20px' }}>
            <button
              className="calculate-journey-btn"
              onClick={calculateJourney}
              disabled={isCalculating}
              type="button"
            >
              <i className="bi bi-file-earmark-text-fill" />
              <span>Generate Medical Journey Plan</span>
              <i className="bi bi-arrow-right" />
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#64748b', margin: '6px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span>🔒</span> Your information is 100% secure &amp; encrypted
            </p>
          </div>
        </div>

        {/* Right Sidebar Stack */}
        <div className="journey-planning-sidebar" style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
          
          {/* Card 1: Selected Hospital */}
          <div className="jp-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', marginBottom: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0d9488', fontWeight: 700, fontSize: '0.88rem' }}>
                <span style={{ background: '#ccfbf1', color: '#0d9488', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>✓</span>
                <span>Selected Hospital</span>
              </div>
              <span style={{ background: '#f0f7ff', border: '1px solid #dbeafe', color: '#0d2f5d', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700 }}>
                {selectedHospital?.jciAccredited ? 'JCI Accredited' : 'NABH Accredited'}
              </span>
            </div>

            <div style={{ borderRadius: '10px', overflow: 'hidden', marginBottom: '10px', height: '130px', position: 'relative', border: '1px solid #f1f5f9' }}>
              <img src={selectedHospital?.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80'} alt={selectedHospital?.name || 'Hospital'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px', lineHeight: 1.3 }}>
                {selectedHospital?.name || 'Yatharth Super Speciality Hospitals'}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', marginBottom: '6px' }}>
                <div style={{ color: '#f59e0b', display: 'flex', gap: '2px' }}>
                  <i className="bi bi-star-fill" /><i className="bi bi-star-fill" /><i className="bi bi-star-fill" /><i className="bi bi-star-fill" /><i className="bi bi-star-fill" />
                </div>
                <strong style={{ color: '#0f172a' }}>{selectedHospital?.rating || 4.8}</strong>
                <span style={{ color: '#64748b', fontSize: '0.72rem' }}>(324 reviews)</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="bi bi-geo-alt-fill" style={{ color: '#ef4444', fontSize: '0.85rem' }} />
                <span>{selectedHospital?.city || 'Greater Noida West'}, {selectedHospital?.country || 'India'}</span>
              </span>
            </div>
          </div>

          {/* Card 2: Selected Treatments */}
          <div className="jp-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', marginBottom: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0d2f5d', fontWeight: 700, fontSize: '0.88rem', marginBottom: '12px' }}>
              <i className="bi bi-suit-heart-fill" style={{ color: '#0d2f5d' }} />
              <span>Selected Treatments ({selectedTreatments.length || 1})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(selectedTreatments.length ? selectedTreatments : [{ id: 'ent', title: 'ENT Surgery', packageFrom: 240000 }]).map(t => (
                <div key={t.id || t._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ display: 'block', fontSize: '0.84rem', color: '#0f172a', margin: '0 0 2px', wordBreak: 'break-word' }}>{getPlannerTreatmentTitle(t)}</strong>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>ICD-11 Classified</span>
                  </div>
                  <span style={{ display: 'inline-block', background: '#0d2f5d', color: '#ffffff', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {t.packageFrom ? `From ₹${(t.packageFrom / 100000).toFixed(1)}L` : 'From ₹2.4L'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Airport Details */}
          <div className="jp-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0d2f5d', fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px' }}>
              <i className="bi bi-airplane" /> Airport Details
            </div>
            <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Departure Airport:</span>
                <strong style={{ color: '#0f172a' }}>{selectedAirport || 'Not selected'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Destination Airport:</span>
                <strong style={{ color: '#0f172a' }}>{selectedHospital?.city || 'Greater Noida West'} Airport</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Airport Type:</span>
                <strong style={{ color: '#0f172a' }}>Local Airport</strong>
              </div>
            </div>
          </div>

          {/* Card 4: Need Help? */}
          <div className="jp-card" style={{ background: '#f0f7ff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0d2f5d', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#dbeafe', color: '#0d2f5d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-headset" />
              </div>
              Need Help?
            </div>
            <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0 0 10px', lineHeight: 1.3 }}>
              Our medical travel experts are here to assist you 24/7.
            </p>
            <button type="button" style={{ width: '100%', height: '34px', background: '#ffffff', border: '1px solid #0d2f5d', color: '#0d2f5d', borderRadius: '6px', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
              Talk to Expert
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Trust Strip */}
      <div className="jp-trust-strip-wrap" style={{ maxWidth: '1160px', margin: '24px auto 0', padding: '0 20px' }}>
        <div className="jp-trust-strip" style={{ background: '#f0f7ff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dbeafe', color: '#0d2f5d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🛡️</div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.8rem', color: '#0f172a' }}>100% Secure</strong>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Your data is protected and encrypted</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dbeafe', color: '#0d2f5d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>₹</div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.8rem', color: '#0f172a' }}>Best Price Guarantee</strong>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>We find the best rates for you</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dbeafe', color: '#0d2f5d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>⏱️</div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.8rem', color: '#0f172a' }}>24/7 Support</strong>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Our experts are always available</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dbeafe', color: '#0d2f5d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🤝</div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.8rem', color: '#0f172a' }}>Trusted by Thousands</strong>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Join thousands of patients who trust us</span>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Plan Success */}
      {journeyPlan && (
        <div className="journey-plan-success">
          <div className="success-message">
            <i className="fa-solid fa-check-circle" aria-hidden="true"></i>
            <h3>Journey Plan Created Successfully!</h3>
            <p>Your complete medical travel plan has been calculated and saved.</p>
            <button 
              className="view-plan-btn"
              onClick={() => onCompleteJourney(journeyPlan)}
              type="button"
            >
              <i className="fa-solid fa-eye" aria-hidden="true" />
              View Complete Journey Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// New Journey Results Page Component - Modern Royal Blue Design
export function JourneyResultsPage({ 
  journeyPlan,
  selectedTreatments = [],
  selectedHospital,
  onBack,
  onConfirmJourney
}) {
  if (!journeyPlan) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="journey-results-page" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Royal Blue Header Bar */}
      <div style={{ background: 'linear-gradient(135deg, #0d2f5d 0%, #0046b8 100%)', color: '#ffffff', padding: '24px 20px 36px', boxShadow: '0 4px 20px rgba(0, 102, 254, 0.2)' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div className="jr-header-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button 
              onClick={onBack} 
              type="button" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '8px', color: '#ffffff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
            >
              <i className="bi bi-arrow-left" aria-hidden="true" />
              Back to Travel Planning
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: '#22c55e', color: '#ffffff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                ✓ Plan Ready &amp; Verified
              </span>
              <button 
                onClick={handlePrint}
                type="button"
                style={{ background: '#ffffff', color: '#0d2f5d', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="bi bi-printer-fill" /> Print Plan
              </button>
            </div>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Your Complete Medical Journey Plan
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#dbeafe', margin: 0, maxWidth: '650px', opacity: 0.95 }}>
            Review your personalized medical travel itinerary, hospital details, flight schedule, hotel accommodation, and itemized cost estimation.
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="jr-container" style={{ maxWidth: '1160px', margin: '-20px auto 0', padding: '0 20px' }}>
        
        {/* Top Summary Banner */}
        <div className="jr-summary-banner" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px 24px', marginBottom: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr', gap: '20px', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Patient Info</span>
            <strong style={{ fontSize: '1.05rem', color: '#0f172a', display: 'block' }}>{journeyPlan.patientName || 'Ayushman Chourasia'}</strong>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{journeyPlan.patientEmail}</span>
          </div>

          <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '20px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Flight Route</span>
            <strong style={{ fontSize: '0.95rem', color: '#0d2f5d', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{journeyPlan.originAirport || 'DEL'}</span>
              <i className="bi bi-arrow-right" style={{ fontSize: '0.8rem' }} />
              <span>{journeyPlan.destinationAirport || 'BOM'}</span>
            </strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{selectedHospital?.city || 'Delhi'}</span>
          </div>

          <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '20px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Duration &amp; Party</span>
            <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>{journeyPlan.stayDuration} Days Stay</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{journeyPlan.companionCount + 1} Traveler(s)</span>
          </div>

          <div style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 16px', textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d2f5d', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>Total Investment</span>
            <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0d2f5d', display: 'block' }}>₹{journeyPlan.costs.total.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="jr-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
          
          {/* Left Column Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Card 1: Flight & Travel Schedule */}
            <div className="jr-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div className="jr-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0d2f5d', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="bi bi-airplane-fill" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Flight &amp; Travel Logistics</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>FlightAPI.io Live Pricing Verified</span>
                  </div>
                </div>
                <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  ✓ Standard Flight Service
                </span>
              </div>

              {/* Route Timeline */}
              <div className="jr-route-timeline" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#dbeafe', color: '#0d2f5d', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '6px' }}>
                    <i className="bi bi-airplane-fill" />
                  </div>
                  <strong style={{ display: 'block', fontSize: '1.1rem', color: '#0f172a' }}>{journeyPlan.originAirport || 'DEL'}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Departure Airport</span>
                </div>

                <div style={{ flex: 1, padding: '0 8px', textAlign: 'center', minWidth: 0 }}>
                  <div style={{ borderTop: '2px dashed #93c5fd', position: 'relative', margin: '14px 0 8px' }}>
                    <i className="bi bi-airplane-fill" style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%) rotate(90deg)', color: '#0d2f5d', fontSize: '1.1rem', background: '#f8fafc', padding: '0 6px' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0d2f5d', background: '#ffffff', padding: '2px 8px', borderRadius: '10px', border: '1px solid #bfdbfe', whiteSpace: 'nowrap', display: 'inline-block' }}>
                    Flight: ~2h 15m
                  </span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#ccfbf1', color: '#0d9488', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '6px' }}>
                    <i className="bi bi-hospital-fill" />
                  </div>
                  <strong style={{ display: 'block', fontSize: '1.1rem', color: '#0f172a' }}>{journeyPlan.destinationAirport || 'BOM'}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Hospital Airport</span>
                </div>
              </div>
            </div>

            {/* Card 2: Hotel Accommodations */}
            <div className="jr-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div className="jr-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0d2f5d', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="bi bi-building-fill" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Selected Accommodation</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Hospital Partnered Verified Hotel</span>
                  </div>
                </div>
                <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  ★ {journeyPlan.hotelCategory.toUpperCase()} Stay
                </span>
              </div>

              <div className="jr-accommodation-card" style={{ background: '#f0f7ff', border: '1.5px solid #bfdbfe', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px', wordBreak: 'break-word' }}>
                    {selectedHospital?.city === 'Mumbai' ? 'ITC Grand Central (Parel)' : selectedHospital?.city === 'Bengaluru' ? 'Taj Yeshwantpur' : 'Lemon Tree Premier (Aerocity)'}
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>📍 1.2 km from {selectedHospital?.name || 'Hospital'}</span>
                  <div className="jr-amenities-wrap" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ background: '#ffffff', border: '1px solid #93c5fd', color: '#0d2f5d', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 600, whiteSpace: 'nowrap' }}>✓ Wheelchair Friendly</span>
                    <span style={{ background: '#ffffff', border: '1px solid #93c5fd', color: '#0d2f5d', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 600, whiteSpace: 'nowrap' }}>✓ Doctor on Call</span>
                    <span style={{ background: '#ffffff', border: '1px solid #93c5fd', color: '#0d2f5d', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 600, whiteSpace: 'nowrap' }}>✓ Patient Diet Kitchen</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <strong style={{ fontSize: '1.1rem', color: '#0d2f5d', display: 'block', whiteSpace: 'nowrap' }}>₹{journeyPlan.costs.hotel.toLocaleString('en-IN')}</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap' }}>for {journeyPlan.stayDuration} nights</span>
                </div>
              </div>
            </div>

            {/* Card 3: Itemized Financial Summary Table */}
            <div className="jr-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0d2f5d', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="bi bi-receipt" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Itemized Cost Breakdown
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#334155', fontWeight: 600, paddingRight: '8px' }}>Medical Surgery &amp; Procedures</span>
                  <strong style={{ color: '#0f172a', whiteSpace: 'nowrap', flexShrink: 0 }}>₹{journeyPlan.costs.treatment.toLocaleString('en-IN')}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#334155', fontWeight: 600, paddingRight: '8px' }}>Roundtrip Flight Tickets ({journeyPlan.originAirport} ➔ {journeyPlan.destinationAirport})</span>
                  <strong style={{ color: '#0f172a', whiteSpace: 'nowrap', flexShrink: 0 }}>₹{journeyPlan.costs.travel.toLocaleString('en-IN')}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#334155', fontWeight: 600, paddingRight: '8px' }}>Hotel Accommodation ({journeyPlan.stayDuration} nights)</span>
                  <strong style={{ color: '#0f172a', whiteSpace: 'nowrap', flexShrink: 0 }}>₹{journeyPlan.costs.hotel.toLocaleString('en-IN')}</strong>
                </div>

                {journeyPlan.companionCount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#334155', fontWeight: 600, paddingRight: '8px' }}>Companion Travel &amp; Accommodation ({journeyPlan.companionCount} person)</span>
                    <strong style={{ color: '#0f172a', whiteSpace: 'nowrap', flexShrink: 0 }}>₹{journeyPlan.costs.companion.toLocaleString('en-IN')}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#334155', fontWeight: 600, paddingRight: '8px' }}>Local Medical Transport &amp; Daily Meals</span>
                  <strong style={{ color: '#0f172a', whiteSpace: 'nowrap', flexShrink: 0 }}>₹{(journeyPlan.costs.localTransport + journeyPlan.costs.meals).toLocaleString('en-IN')}</strong>
                </div>

                {journeyPlan.costs.visa > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#334155', fontWeight: 600, paddingRight: '8px' }}>Medical Visa Assistance &amp; Documentation</span>
                    <strong style={{ color: '#0f172a', whiteSpace: 'nowrap', flexShrink: 0 }}>₹{journeyPlan.costs.visa.toLocaleString('en-IN')}</strong>
                  </div>
                )}
              </div>

              {/* Total Banner */}
              <div className="jr-total-banner" style={{ marginTop: '16px', background: 'linear-gradient(135deg, #0066fe 0%, #0046b8 100%)', color: '#ffffff', borderRadius: '12px', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 14px rgba(0,102,254,0.25)' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', opacity: 0.9, display: 'block' }}>Grand Total Estimated Investment</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Includes all taxes, hospital charges, flights &amp; stay</span>
                </div>
                <strong style={{ fontSize: '1.6rem', fontWeight: 800, whiteSpace: 'nowrap' }}>₹{journeyPlan.costs.total.toLocaleString('en-IN')}</strong>
              </div>
            </div>

          </div>

          {/* Right Column Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Selected Hospital Card */}
            <div className="jr-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0066fe', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Selected Hospital</span>
              <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #f1f5f9', marginBottom: '12px' }}>
                <img src={selectedHospital?.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80'} alt={selectedHospital?.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>{selectedHospital?.name}</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '10px' }}>📍 {selectedHospital?.city}, {selectedHospital?.country}</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ background: '#f0f7ff', border: '1px solid #dbeafe', color: '#0066fe', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  🪙 {selectedHospital?.jciAccredited ? 'JCI Accredited' : 'NABH Accredited'}
                </span>
                <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  ★ {selectedHospital?.rating || 4.8} Rating
                </span>
              </div>
            </div>

            {/* Selected Treatments Card */}
            <div className="jr-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0066fe', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>Surgical Procedures ({selectedTreatments.length || 1})</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(selectedTreatments.length ? selectedTreatments : [{ id: 'ent', title: 'ENT Surgery', packageFrom: 240000 }]).map(t => (
                  <div key={t.id || t._id} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0f172a', wordBreak: 'break-word' }}>{t.title}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>ICD-11 Classified</span>
                    </div>
                    <strong style={{ fontSize: '0.85rem', color: '#0066fe', whiteSpace: 'nowrap', flexShrink: 0 }}>₹{(t.packageFrom || 240000).toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Action Card */}
            <div className="jr-card" style={{ background: '#ffffff', border: '1.5px solid #0066fe', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 16px rgba(0, 102, 254, 0.12)', textAlign: 'center' }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>Ready to Confirm Your Journey?</h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 16px', lineHeight: 1.3 }}>Our senior medical travel coordinator will connect with you within 24 hours to coordinate hospital admission and flight bookings.</p>
              
              <button
                type="button"
                onClick={() => onConfirmJourney(journeyPlan)}
                style={{
                  width: '100%',
                  height: '46px',
                  background: '#0066fe',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 102, 254, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <i className="bi bi-check-circle-fill" />
                <span>CONFIRM &amp; BOOK JOURNEY</span>
              </button>
            </div>

          </div>
        </div>

        {/* Bottom 4-Column Trust Strip */}
        <div className="jr-trust-strip" style={{ marginTop: '30px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f0f7ff', color: '#0066fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
              <i className="bi bi-shield-check" />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0f172a' }}>100% Secure</strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Encrypted Patient Data</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f0f7ff', color: '#0066fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
              <i className="bi bi-currency-rupee" />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0f172a' }}>Best Price Guarantee</strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Direct Hospital Packages</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f0f7ff', color: '#0066fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
              <i className="bi bi-headset" />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0f172a' }}>24/7 Support</strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Dedicated Medical Escort</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f0f7ff', color: '#0066fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
              <i className="bi bi-people-fill" />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0f172a' }}>Trusted by Thousands</strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Global Medical Tourism</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
export function PlannerHospitalsPage({ 
  selectedTreatments = [], 
  hospitals = [], 
  onBack,
  onSelectHospital,
  onViewHospitalDetails,
  formatCurrency,
  plannerStep = 4,
}) {
  const [cityFilter, setCityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [selectedHospitalForFooter, setSelectedHospitalForFooter] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const email = localStorage.getItem('userEmail');
    
    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    }

    // Track hospitals view
    fetch('/api/leads/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step: 'hospitals_view',
        data: {
          selectedTreatments: selectedTreatments.map(t => t.title),
          isLoggedIn: !!token
        }
      })
    }).catch(console.log);
  }, [selectedTreatments]);

  const cities = useMemo(() => {
    return ['All', ...new Set(hospitals.map(h => h.city).filter(Boolean))];
  }, [hospitals]);

  const filteredHospitals = useMemo(() => {
    if (selectedTreatments.length === 0) {
      // If no treatments selected, show all hospitals
      return hospitals;
    }

    // Filter hospitals that match selected treatments
    const matchedHospitals = hospitals.filter(hospital => {
      const tags = Array.isArray(hospital.tags) ? hospital.tags : [];
      const hospitalSpecialty = hospital.specialty || '';
      const hospitalName = hospital.name || '';
      
      return selectedTreatments.some(treatment => {
        const treatmentTitle = treatment.title || '';
        const treatmentSpecialty = treatment.specialty || '';
        const treatmentGroup = treatment.group || treatment.category || '';
        
        // Match by exact treatment title in hospital tags
        if (tags.some(tag => tag.toLowerCase().includes(treatmentTitle.toLowerCase()))) {
          return true;
        }
        
        // Match by specialty
        if (hospitalSpecialty.toLowerCase().includes(treatmentSpecialty.toLowerCase()) || 
            treatmentSpecialty.toLowerCase().includes(hospitalSpecialty.toLowerCase())) {
          return true;
        }
        
        // Match by treatment group/category
        if (hospitalSpecialty.toLowerCase().includes(treatmentGroup.toLowerCase()) ||
            treatmentGroup.toLowerCase().includes(hospitalSpecialty.toLowerCase())) {
          return true;
        }
        
        // Match by keywords in hospital name for broad matching
        const treatmentKeywords = treatmentTitle.toLowerCase().split(' ');
        const hospitalKeywords = hospitalName.toLowerCase();
        if (treatmentKeywords.some(keyword => hospitalKeywords.includes(keyword) && keyword.length > 3)) {
          return true;
        }
        
        return false;
      });
    });

    // Remove duplicates by hospital ID
    const uniqueHospitals = [];
    const seenIds = new Set();
    
    matchedHospitals.forEach(hospital => {
      if (!seenIds.has(hospital.id)) {
        seenIds.add(hospital.id);
        uniqueHospitals.push(hospital);
      }
    });

    // If no exact matches found, show a subset of hospitals for fallback
    let filtered = uniqueHospitals.length > 0 ? uniqueHospitals : hospitals.slice(0, 6);

    // City filter
    if (cityFilter !== 'All') {
      filtered = filtered.filter(h => h.city === cityFilter);
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered = filtered.sort((a, b) => (a.cost?.package || 0) - (b.cost?.package || 0));
    } else if (sortBy === 'price-high') {
      filtered = filtered.sort((a, b) => (b.cost?.package || 0) - (a.cost?.package || 0));
    } else if (sortBy === 'rating') {
      filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filtered;
  }, [hospitals, selectedTreatments, cityFilter, sortBy]);

  const handleHospitalClick = (hospital) => {
    if (!isLoggedIn) {
      fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'login_prompted',
          data: { hospitalName: hospital.name, selectedTreatments: selectedTreatments.map(t => t.title) }
        })
      }).catch(console.log);
      setShowLoginModal(true);
    } else {
      // Select hospital for footer CTA — don't navigate immediately
      setSelectedHospitalForFooter((prev) =>
        prev?.name === hospital.name ? null : hospital
      );
    }
  };

  const handleProceedToJourney = () => {
    if (selectedHospitalForFooter) {
      onSelectHospital(selectedHospitalForFooter);
    }
  };

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setUserEmail(user.email);
    setShowLoginModal(false);
  };

  return (
    <div className="planner-hospitals-page">
      <PlannerStepsBar currentStep={plannerStep} />

      {/* Header with Back Button */}
      <div className="hospitals-header">
        <button className="back-btn" onClick={onBack} type="button">
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          Back to Trip Style
        </button>
        <div className="hospitals-header-info">
          <h1>Available Hospitals</h1>
          <p>{filteredHospitals.length} hospitals found for your selected treatments</p>
        </div>
      </div>

      {/* Selected Treatments Summary */}
      <div className="hospitals-selected-treatments">
        <strong>Selected Treatments:</strong>
        <div className="treatments-summary">
          {selectedTreatments.map((treatment) => (
            <span key={treatment.id} className="treatment-badge">
              {getPlannerTreatmentTitle(treatment)}
            </span>
          ))}
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="hospitals-filters">
        <div className="filter-group">
          <label>City:</label>
          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Hospitals List */}
      <div className="hospitals-results-grid">
        {filteredHospitals.length > 0 && selectedTreatments.length > 0 && (
          <div className="hospital-match-note">
            <i className="fa-solid fa-circle-check" aria-hidden="true" />
            Showing {filteredHospitals.length} hospitals that match your selected treatments.
          </div>
        )}
        {filteredHospitals.length > 0 && selectedTreatments.length > 0 && !hospitals.some(hospital => {
          const tags = Array.isArray(hospital.tags) ? hospital.tags : [];
          return selectedTreatments.some(treatment => tags.includes(treatment.title) || hospital.specialty === treatment.specialty);
        }) && (
          <div className="hospital-match-note">
            <i className="fa-solid fa-circle-info" aria-hidden="true" />
            Showing recommended hospitals while exact treatment mapping is updated.
          </div>
        )}
        {filteredHospitals.map((hospital) => {
          const internationalWing = parseInternationalWing(hospital.internationalPatientWing);
          
          return (
            <article
              key={hospital.id}
              className={`hospital-result-card${selectedHospitalForFooter?.name === hospital.name ? ' hospital-card-selected' : ''}`}
            >
              <div className="hospital-card-image">
                {hospital.image ? (
                  <img 
                    src={hospital.image} 
                    alt={hospital.name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <div 
                  className="hospital-image-placeholder" 
                  style={{display: hospital.image ? 'none' : 'block'}}
                >
                  Hospital Image
                </div>
              </div>
              
              <div className="hospital-card-content">
                <div className="hospital-accreditation-logos hospital-logo-top">
                  {hospital.jciAccredited ? (
                    <div className="accreditation-badge jci-badge">
                      <img src="https://cdn.prod.website-files.com/63dc099d352018653241b1a7/63fe8bab2259ca569b27dcdf_gold-seal-approval.png" alt="JCI Accredited" />
                      <span>JCI</span>
                    </div>
                  ) : (
                    <div className="accreditation-badge nabh-badge">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQntV_tAgbdUJrZpcCIbKGbqdoM9GaOgerg3Q" alt="NABH Accredited" />
                      <span>NABH</span>
                    </div>
                  )}
                </div>
                
                <h3>
                  <button 
                    className="hospital-name-link"
                    onClick={() => onViewHospitalDetails && onViewHospitalDetails(hospital)}
                    type="button"
                  >
                    {hospital.name}
                  </button>
                </h3>
                
                <div className="hospital-rating">
                  <span className="rating-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i key={i} className="fa-solid fa-star" aria-hidden="true" />
                    ))}
                  </span>
                  <strong>{hospital.rating || 4.8}</strong>
                  <span className="hospital-rating-count">
                    {hospital.rating || 4.8} ({hospital.reviews || 1} Ratings)
                  </span>
                </div>
                
                <p>
                  {hospital.summary || `${hospital.name} is listed from the Client master data for multispeciality care in ${hospital.city}. Accreditation: ${hospital.accreditations || 'NABH'}`}
                </p>
                
                <a href="#" className="show-more-link">Show More</a>
              </div>
              
              <div className="hospital-card-sidebar">
                <div className="hospital-info-row">
                  <span className="hospital-info-label">Established:</span>
                  <span className="hospital-info-value">{hospital.established || hospital.foundedYear || 'Update pending'}</span>
                </div>
                <div className="hospital-info-row">
                  <span className="hospital-info-label">Beds:</span>
                  <span className="hospital-info-value">{hospital.beds || hospital.bedText || '400'}</span>
                </div>
                <div className="hospital-info-row">
                  <span className="hospital-info-label">JCI Accredited:</span>
                  <span className="hospital-info-value">{hospital.jciAccredited ? 'Yes' : 'NABH'}</span>
                </div>
                <div className="hospital-info-row">
                  <span className="hospital-info-label">Location:</span>
                  <span className="hospital-info-value">{hospital.city}</span>
                </div>
                
                <button 
                  className={`view-hospital-btn${selectedHospitalForFooter?.name === hospital.name ? ' selected' : ''}`}
                  onClick={() => handleHospitalClick(hospital)}
                  type="button"
                >
                  {selectedHospitalForFooter?.name === hospital.name
                    ? <><i className="fa-solid fa-circle-check" aria-hidden="true" /> Selected</>
                    : isLoggedIn ? 'Select Hospital' : 'Login to Select'
                  }
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filteredHospitals.length === 0 && (
        <div className="no-results">
          <i className="fa-solid fa-hospital" aria-hidden="true" />
          <h3>No hospitals found</h3>
          <p>Try adjusting your filters or selecting different treatments</p>
        </div>
      )}

      {/* Login Modal */}
      <EmailLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Standardized Sticky Footer — Step 4 */}
      <div className={`planner-step-footer${selectedHospitalForFooter ? ' visible' : ''}`}>
        <div className="planner-step-footer-inner">
          <div className="planner-step-footer-summary">
            {selectedHospitalForFooter ? (
              <>
                <i className="fa-solid fa-circle-check" aria-hidden="true" style={{color:'#22c55e'}} />
                <span className="footer-selected-text">Selected: <strong>{formatHospitalDisplayName(selectedHospitalForFooter.name)}</strong></span>
                <div className="footer-pills">
                  <span className="footer-pill">
                    <i className="fa-solid fa-location-dot" aria-hidden="true" /> {selectedHospitalForFooter.city}
                  </span>
                  {selectedHospitalForFooter.specialty && (
                    <span className="footer-pill">{selectedHospitalForFooter.specialty}</span>
                  )}
                </div>
              </>
            ) : (
              <span className="footer-hint">
                <i className="fa-solid fa-hand-pointer" aria-hidden="true" /> Select a hospital to plan your journey
              </span>
            )}
          </div>
          <button
            className="planner-footer-btn"
            onClick={handleProceedToJourney}
            disabled={!selectedHospitalForFooter}
            type="button"
          >
            <span>Plan Journey</span>
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
