import React, { useState } from 'react';
import logoImg from '../../assets/kairacure-logo.png';
import { formatShortName } from '../../data/constants.js';

export function Header({ currentPatient, hospitals = [], treatments = [], onLogoutPatient, page, setPage, setSelectedHospital, setSelectedTreatment }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const searchRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const nav = [
    ['home', 'Home'],
    ['treatments', 'Treatments'],
    ['destinations', 'Destinations'],
    ['partners', 'Hospitals'],
    ['planner', 'Plan My Journey'],
    ['partner-growth', 'Partner with us'],
  ];

  const TYPE_ICON = {
    Treatment: 'fa-stethoscope',
    Hospital: 'fa-hospital',
    Doctor: 'fa-user-doctor',
    Destination: 'fa-location-dot',
  };
  const TYPE_COLOR = {
    Treatment: '#0d2f5d',
    Hospital: '#0d2f5d',
    Doctor: '#0d2f5d',
    Destination: '#0d4d3a',
  };

  const patientLabel = formatShortName(currentPatient?.name || currentPatient?.email || 'User');
  const navigate = (id) => { setPage(id); setMobileMenuOpen(false); };
  const logoutAndClose = () => { onLogoutPatient(); setMobileMenuOpen(false); };

  const staticSuggestions = React.useMemo(() => {
    const list = [];
    if (Array.isArray(treatments) && treatments.length > 0) {
      treatments.slice(0, 3).forEach((t) => {
        list.push({
          type: 'Treatment',
          label: t.title || t.name,
          meta: `${t.category || t.group || 'Specialty'} · Starting ₹${t.costInr ? (t.costInr / 100000).toFixed(1) + 'L' : '1.5L'}`,
          icon: 'fa-stethoscope',
          rawItem: t,
          actionType: 'treatment'
        });
      });
    } else {
      list.push(
        { type: 'Treatment', label: 'Heart Bypass Surgery', meta: 'Cardiac · Starting ₹2.5L', icon: 'fa-heart-pulse', actionType: 'treatment' },
        { type: 'Treatment', label: 'Knee Replacement', meta: 'Orthopedics · Starting ₹1.8L', icon: 'fa-bone', actionType: 'treatment' },
        { type: 'Treatment', label: 'Cancer Treatment', meta: 'Oncology · Starting ₹3L', icon: 'fa-ribbon', actionType: 'treatment' }
      );
    }

    if (Array.isArray(hospitals) && hospitals.length > 0) {
      hospitals.slice(0, 3).forEach((h) => {
        list.push({
          type: 'Hospital',
          label: h.name,
          meta: `${h.city || 'India'} · ${h.specialty || 'Accredited Hospital'}`,
          icon: 'fa-hospital',
          rawItem: h,
          actionType: 'hospital'
        });
      });
    } else {
      list.push(
        { type: 'Hospital', label: 'Apollo Hospitals', meta: 'Delhi, India', icon: 'fa-hospital', actionType: 'hospital' },
        { type: 'Hospital', label: 'Fortis Healthcare', meta: 'Mumbai, India', icon: 'fa-hospital', actionType: 'hospital' }
      );
    }

    list.push(
      { type: 'Destination', label: 'Delhi / NCR', meta: '120+ accredited hospitals', icon: 'fa-location-dot', actionType: 'destination' },
      { type: 'Destination', label: 'Chennai', meta: '80+ accredited hospitals', icon: 'fa-location-dot', actionType: 'destination' }
    );

    return list;
  }, [treatments, hospitals]);

  const handleChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setActiveIdx(-1);
    setShowSugg(true);

    if (!val.trim()) {
      setSuggestions([]);
      return;
    }

    const q = val.toLowerCase().trim();
    const results = [];

    // Search Treatments
    if (Array.isArray(treatments)) {
      treatments.forEach((t) => {
        const name = t.title || t.name || '';
        const cat = t.category || t.group || '';
        if (name.toLowerCase().includes(q) || cat.toLowerCase().includes(q)) {
          results.push({
            type: 'Treatment',
            label: name,
            meta: `${cat || 'Specialty'} · Starting ₹${t.costInr ? (t.costInr / 100000).toFixed(1) + 'L' : '1.5L'}`,
            icon: 'fa-stethoscope',
            rawItem: t,
            actionType: 'treatment'
          });
        }
      });
    }

    // Search Hospitals
    if (Array.isArray(hospitals)) {
      hospitals.forEach((h) => {
        const name = h.name || '';
        const city = h.city || h.location || '';
        const spec = h.specialty || '';
        if (name.toLowerCase().includes(q) || city.toLowerCase().includes(q) || spec.toLowerCase().includes(q)) {
          results.push({
            type: 'Hospital',
            label: name,
            meta: `${city || 'India'} · ${spec || 'Accredited Hospital'}`,
            icon: 'fa-hospital',
            rawItem: h,
            actionType: 'hospital'
          });
        }
      });
    }

    // Search Destinations
    const cities = ['Delhi / NCR', 'Mumbai', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata', 'Kochi', 'Ahmedabad'];
    cities.forEach((c) => {
      if (c.toLowerCase().includes(q)) {
        results.push({
          type: 'Destination',
          label: c,
          meta: 'Top Accredited Hospitals Available',
          icon: 'fa-location-dot',
          cityName: c,
          actionType: 'destination'
        });
      }
    });

    setSuggestions(results.slice(0, 8));
  };

  const handleFocus = () => {
    setShowSugg(true);
  };

  const handleSelect = (sugg) => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSugg(false);

    if (sugg.actionType === 'treatment' || sugg.type === 'Treatment') {
      if (setSelectedTreatment && sugg.rawItem) {
        setSelectedTreatment(sugg.rawItem);
      }
      setPage('treatment-detail');
    } else if (sugg.actionType === 'hospital' || sugg.type === 'Hospital') {
      if (setSelectedHospital && sugg.rawItem) {
        setSelectedHospital(sugg.rawItem);
      }
      setPage('partner-detail');
    } else if (sugg.actionType === 'destination' || sugg.type === 'Destination') {
      setPage('partners');
    } else {
      setPage('treatments');
    }
  };

  const handleKeyDown = (e) => {
    if (!showSugg) return;
    if (e.key === 'Escape') { setShowSugg(false); setActiveIdx(-1); }
    if (e.key === 'Enter') {
      const activeList = searchQuery.trim() ? suggestions : staticSuggestions;
      if (activeIdx >= 0 && activeIdx < activeList.length) {
        handleSelect(activeList[activeIdx]);
      } else if (activeList.length > 0) {
        handleSelect(activeList[0]);
      }
    }
  };

  React.useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSugg(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displaySuggestions = searchQuery.trim() ? suggestions : staticSuggestions;

  return (
    <header className="site-header">
      {/* Brand Logo */}
      <button className="brand-lockup" onClick={() => navigate('home')} type="button" style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <img src={logoImg} alt="Kaira Cure" className="brand-logo-img" style={{ height: '52px', width: 'auto', objectFit: 'contain', maxHeight: '52px' }} />
      </button>

      {/* Nav */}
      <nav className="desktop-nav">
        {nav.map(([id, label]) => (
          <button className={page === id ? 'active' : ''} key={id} onClick={() => navigate(id)} type="button">
            {label}
          </button>
        ))}
      </nav>

      {/* Search Bar */}
      <div className="hs-wrap" ref={searchRef}>
        <div className={`hs-box${showSugg ? ' hs-focused' : ''}`}>
          <i className="fa-solid fa-magnifying-glass hs-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            className="hs-input"
            placeholder="Search treatments, hospitals, cities..."
            value={searchQuery}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            aria-label="Search"
          />
          {searchQuery && (
            <button className="hs-clear" type="button" onClick={() => { setSearchQuery(''); setSuggestions([]); inputRef.current?.focus(); }} aria-label="Clear">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSugg && (
          <div className="hs-dropdown" role="listbox">
            {!searchQuery.trim() && (
              <div className="hs-dropdown-label">Popular searches</div>
            )}
            {displaySuggestions.map((sugg, i) => (
              <button
                key={i}
                className={`hs-item${activeIdx === i ? ' hs-item-active' : ''}`}
                type="button"
                role="option"
                onClick={() => handleSelect(sugg)}
              >
                <span className="hs-item-icon" style={{ background: `${TYPE_COLOR[sugg.type] || '#64748b'}18`, color: TYPE_COLOR[sugg.type] || '#64748b' }}>
                  <i className={`fa-solid ${sugg.icon || TYPE_ICON[sugg.type] || 'fa-magnifying-glass'}`} aria-hidden="true" />
                </span>
                <span className="hs-item-text">
                  <span className="hs-item-label">{sugg.label}</span>
                  <span className="hs-item-meta">{sugg.meta}</span>
                </span>
                <span className="hs-item-type">{sugg.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Auth */}
      <div className="header-actions desktop-header-actions">
        {currentPatient ? (
          <button className="header-cta header-user-cta" onClick={logoutAndClose} title={currentPatient.name || currentPatient.email} type="button">
            <i className="fa-solid fa-user-check" aria-hidden="true" />
            <span>{patientLabel}</span>
            <b>Logout</b>
          </button>
        ) : (
          <div className="header-auth-btns">
            <button className="header-login-btn" onClick={() => navigate('login')} type="button">Login</button>
            <span className="header-auth-sep">|</span>
            <button className="header-signup-btn" onClick={() => navigate('login')} type="button">Sign Up</button>
          </div>
        )}
      </div>

      {/* Mobile toggle */}
      <button aria-expanded={mobileMenuOpen} aria-label="Open menu" className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(true)} type="button">
        <i className="fa-solid fa-bars" aria-hidden="true" />
      </button>
      {mobileMenuOpen && <button aria-label="Close menu overlay" className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)} type="button" />}
      {/* Mobile Menu Offcanvas Drawer */}
      <aside className={mobileMenuOpen ? 'mobile-offcanvas open' : 'mobile-offcanvas'} aria-hidden={!mobileMenuOpen}>
        {/* Header */}
        <div className="mobile-offcanvas-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logoImg} alt="KairaCure" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <button aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} type="button" className="mobile-offcanvas-close-btn">
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </div>

        {/* Patient Status / Auth Profile Card */}
        <div className="mobile-side-profile-card">
          {currentPatient ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0d2f5d', color: '#ffffff', display: 'grid', placeItems: 'center', fontSize: '1.1rem' }}>
                  <i className="bi bi-person-fill" />
                </div>
                <div>
                  <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block', fontWeight: 800 }}>{patientLabel}</strong>
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <i className="bi bi-check-circle-fill" /> Active Session
                  </span>
                </div>
              </div>
              <button onClick={logoutAndClose} type="button" style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="bi bi-box-arrow-right" /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button className="mobile-side-auth-btn primary" onClick={() => navigate('login')} type="button">
                <i className="bi bi-person-fill" /> Sign In
              </button>
              <button className="mobile-side-auth-btn secondary" onClick={() => navigate('login')} type="button">
                <i className="bi bi-person-plus-fill" /> Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Nav Links List */}
        <nav className="mobile-nav">
          <button className={page === 'home' ? 'active' : ''} onClick={() => navigate('home')} type="button">
            <i className="bi bi-house-door-fill nav-icon" /> <span>Home</span>
          </button>
          <button className={page === 'treatments' ? 'active' : ''} onClick={() => navigate('treatments')} type="button">
            <i className="bi bi-stethoscope nav-icon" /> <span>Treatments Catalog</span>
          </button>
          <button className={page === 'destinations' ? 'active' : ''} onClick={() => navigate('destinations')} type="button">
            <i className="bi bi-geo-alt-fill nav-icon" /> <span>Medical Destinations</span>
          </button>
          <button className={page === 'partners' ? 'active' : ''} onClick={() => navigate('partners')} type="button">
            <i className="bi bi-building-check nav-icon" /> <span>Hospitals</span>
          </button>
          <button className={page === 'planner' ? 'active' : ''} onClick={() => navigate('planner')} type="button">
            <i className="bi bi-compass-fill nav-icon" /> <span>Plan My Journey</span>
          </button>
          <button className={page === 'partner-growth' ? 'active' : ''} onClick={() => navigate('partner-growth')} type="button">
            <i className="bi bi-hospital-fill nav-icon" style={{ color: '#0d2f5d' }} /> <span>Partner with us</span>
          </button>
          <button className={page === 'ai-assistant' ? 'active' : ''} onClick={() => navigate('ai-assistant')} type="button">
            <i className="bi bi-robot nav-icon" style={{ color: '#0d2f5d' }} /> <span>Kaira AI Concierge</span>
          </button>
        </nav>

        {/* Bottom Contact & Care Desk */}
        <div className="mobile-side-footer">
          <a href="tel:+919876543210" className="mobile-side-call-btn">
            <i className="bi bi-telephone-fill" />
            <span>24/7 Medical Care Desk</span>
          </a>
          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textAlign: 'center', marginTop: '8px' }}>
            Email: care@kairacure.com
          </span>
        </div>
      </aside>
    </header>
  );
}
