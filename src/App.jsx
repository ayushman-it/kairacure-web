import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './styles/theme.css';
import { clientHospitals } from './data/clientHospitals.js';

// Common Components
import { Header } from './components/common/Header.jsx';
import { Footer } from './components/common/Footer.jsx';
import { MedicalVideoBackdrop } from './components/common/MedicalVideoBackdrop.jsx';

// Home Sections
import { Hero } from './components/home/Hero.jsx';
import { TrustStrip } from './components/home/TrustStrip.jsx';
import { FeaturedTreatments } from './components/home/FeaturedTreatments.jsx';
import { Destinations } from './components/home/Destinations.jsx';
import { HomeTreatmentBanners } from './components/home/HomeTreatmentBanners.jsx';
import { AiExplorationSection } from './components/home/AiExplorationSection.jsx';
import { HomeFaqSection } from './components/home/HomeFaqSection.jsx';

// Pages
import { TreatmentsPage } from './pages/TreatmentsPage.jsx';
import { TreatmentDetailPage } from './pages/TreatmentDetailPage.jsx';
import { PartnersPage } from './pages/PartnersPage.jsx';
import { PartnerDetailPage } from './pages/PartnerDetailPage.jsx';
import { PartnerLandingPage } from './pages/PartnerLandingPage.jsx';
import { HospitalPartnerLandingPage } from './pages/HospitalPartnerLandingPage.jsx';
import { DoctorsPage } from './pages/DoctorsPage.jsx';
import { DoctorDetailPage } from './pages/DoctorDetailPage.jsx';
import { PlannerPage } from './pages/PlannerPage.jsx';
import { AiAssistantPage } from './pages/AiAssistantPage.jsx';
import { AuthPage } from './pages/AuthPage.jsx';

// Modals
import { JourneyModal } from './components/modals/JourneyModal.jsx';

import { DEFAULT_TREATMENTS, withBackendTreatmentDefaults, withBackendHospitalDefaults, formatHospitalDisplayName, pageFromPath, pathForPage } from './data/constants.js';

const BRAND_NAME = 'Kairacure';

function getApiBase() {
  const configuredBase = import.meta.env.VITE_API_BASE_URL || '/api';
  if (typeof window === 'undefined') return configuredBase;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  return configuredBase;
}

const API_BASE = getApiBase();

function AdminPanelRedirect() {
  useEffect(() => {
    window.location.replace('https://kairacure-admin.onrender.com');
  }, []);
  return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: '2rem' }}>
      <div>
        <h2>Redirecting to Kairacure Admin Console...</h2>
        <p>If you are not redirected automatically, <a href="https://kairacure-admin.onrender.com">click here</a>.</p>
      </div>
    </div>
  );
}

const INDIA_HOSPITALS = clientHospitals || [];
const TREATMENTS = DEFAULT_TREATMENTS;

function App() {
  const [page, setPageState] = useState(() => pageFromPath(window.location.pathname));
  const [currency] = useState('INR');
  const [patientToken, setPatientToken] = useState(() => readStoredPatientSession().token);
  const [currentPatient, setCurrentPatient] = useState(() => readStoredPatientSession().patient);
  const [homeSnackbar, setHomeSnackbar] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [activeGroup, setActiveGroup] = useState('All');
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(INDIA_HOSPITALS[0] || null);
  const [backendHospitals, setBackendHospitals] = useState([]);
  const [backendTreatments, setBackendTreatments] = useState([]);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const [aiInitialMessage, setAiInitialMessage] = useState('');
  const [plannerInitialProcedure, setPlannerInitialProcedure] = useState(null);

  useEffect(() => {
    let ignore = false;
    const fetchContent = async () => {
      setIsContentLoading(true);
      try {
        const [hRes, tRes] = await Promise.all([
          fetch(`${API_BASE}/hospitals`),
          fetch(`${API_BASE}/treatments`),
        ]);
        const [hData, tData] = await Promise.all([
          hRes.ok ? hRes.json() : [],
          tRes.ok ? tRes.json() : [],
        ]);
        if (!ignore) {
          if (Array.isArray(hData) && hData.length) {
            setBackendHospitals(hData.map(withBackendHospitalDefaults));
          }
          if (Array.isArray(tData) && tData.length) {
            setBackendTreatments(tData.map(withBackendTreatmentDefaults));
          }
        }
      } catch {
      } finally {
        if (!ignore) setIsContentLoading(false);
      }
    };
    fetchContent();
    return () => { ignore = true; };
  }, []);

  // Helper to extract hospital slug or ID from URL
  const resolveHospitalFromUrl = useCallback((hospitalsList) => {
    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const queryId = params.get('id') || params.get('hospital');
    const pathSlug = pathname.startsWith('/partner/') ? pathname.replace(/^\/partner\//, '') : null;
    const target = queryId || pathSlug;

    if (!target) return null;

    return hospitalsList.find((h) => {
      const cleanName = formatHospitalDisplayName(h.name);
      const nameSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const rawSlug = h.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      return String(h.id) === target || nameSlug === target.toLowerCase() || rawSlug === target.toLowerCase();
    }) || null;
  }, []);

  // Sync selectedHospital from URL on data load
  useEffect(() => {
    const allHospitals = backendHospitals.length ? backendHospitals : INDIA_HOSPITALS;
    const found = resolveHospitalFromUrl(allHospitals);
    if (found) {
      setSelectedHospital(found);
    }
  }, [backendHospitals, resolveHospitalFromUrl]);

  // Sync selectedHospital on browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const currentPage = pageFromPath(window.location.pathname);
      setPageState(currentPage);
      const allHospitals = backendHospitals.length ? backendHospitals : INDIA_HOSPITALS;
      const found = resolveHospitalFromUrl(allHospitals);
      if (found) setSelectedHospital(found);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [backendHospitals, resolveHospitalFromUrl]);

  const setPage = (nextPage, targetHospital) => {
    const activeHospital = targetHospital || selectedHospital;
    let nextPath = pathForPage(nextPage);
    if (nextPage === 'partner-detail' && activeHospital) {
      const cleanName = formatHospitalDisplayName(activeHospital.name);
      const hospSlug = encodeURIComponent(cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) || activeHospital.id;
      nextPath = `/partner/${hospSlug}`;
    }
    setPageState(nextPage);
    if (window.location.pathname + window.location.search !== nextPath) {
      window.history.pushState({ page: nextPage }, '', nextPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePatientLogin = useCallback((data) => {
    setPatientToken(data.token || '');
    setCurrentPatient(data.patient || null);
    setHomeSnackbar(`Welcome to Kairacure, ${formatShortName(data.patient?.name || data.patient?.email || 'patient')}`);
  }, []);

  const handlePatientLogout = useCallback(() => {
    window.localStorage.removeItem('KairacurePatientToken');
    window.localStorage.removeItem('KairacurePatient');
    setPatientToken('');
    setCurrentPatient(null);
    setHomeSnackbar('');
  }, []);

  const money = (amount) => {
    if (typeof amount !== 'number') return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const showHome = page === 'home';
  const showAdmin = page === 'admin';
  const showAuth = page === 'login';

  const contentHospitals = backendHospitals.length ? backendHospitals : INDIA_HOSPITALS;
  const contentTreatments = backendTreatments.length ? backendTreatments : TREATMENTS;

  return (
    <div className="site-shell">
      {!showAdmin && page !== 'partner-detail' && (
        <Header
          currentPatient={currentPatient}
          hospitals={contentHospitals}
          treatments={contentTreatments}
          onLogoutPatient={handlePatientLogout}
          page={page}
          setPage={setPage}
        />
      )}

      {showHome && (
        <Hero
          onFindCare={() => setPage('partners')}
          query={query}
          setPage={setPage}
          setQuery={setQuery}
          setAiInitialMessage={setAiInitialMessage}
        />
      )}

      <main className={showAdmin ? 'admin-main' : undefined}>
        {showAdmin && <AdminPanelRedirect />}
        {showHome && <TrustStrip />}
        {(showHome || page === 'destinations') && (
          <Destinations hospitals={contentHospitals} isLoading={isContentLoading} money={money} setPage={setPage} setSelectedCountry={setSelectedCountry} />
        )}

        {page === 'treatments' && (
          <TreatmentsPage
            activeGroup={activeGroup}
            isLoading={isContentLoading}
            treatments={contentTreatments}
            money={money}
            selectedTreatment={selectedTreatment}
            setActiveGroup={setActiveGroup}
            setPage={setPage}
            setSelectedTreatment={setSelectedTreatment}
          />
        )}

        {showHome && <HomeTreatmentBanners setActiveGroup={setActiveGroup} setPage={setPage} setSelectedTreatment={setSelectedTreatment} treatments={contentTreatments} />}

        {(showHome || page === 'partners') && (
          <PartnersPage
            hospitals={contentHospitals}
            isLoading={isContentLoading}
            money={money}
            selectedTreatment={selectedTreatment}
            setPage={setPage}
            setSelectedHospital={setSelectedHospital}
            treatments={contentTreatments}
          />
        )}

        {page === 'doctors' && <DoctorsPage hospitals={contentHospitals} money={money} setPage={setPage} setSelectedHospital={setSelectedHospital} />}

        {page === 'treatment-detail' && (
          <TreatmentDetailPage
            allTreatments={contentTreatments}
            hospitals={contentHospitals}
            money={money}
            selectedTreatment={selectedTreatment}
            setPage={setPage}
            setPlannerInitialProcedure={setPlannerInitialProcedure}
            setSelectedHospital={setSelectedHospital}
            setSelectedTreatment={setSelectedTreatment}
          />
        )}

        {page === 'partner-detail' && (
          <PartnerLandingPage money={money} selectedHospital={selectedHospital} selectedTreatment={selectedTreatment} setPage={setPage} setSelectedHospital={setSelectedHospital} />
        )}

        {page === 'partner-growth' && (
          <HospitalPartnerLandingPage onBackToDetails={() => setPage('partners')} selectedHospital={selectedHospital} />
        )}

        {page === 'doctor-detail' && <DoctorDetailPage money={money} selectedHospital={selectedHospital} setPage={setPage} />}
        {page === 'ai-assistant' && <AiAssistantPage initialMessage={aiInitialMessage} setPage={setPage} />}
        {page === 'login' && <AuthPage onGoHome={() => setPage('home')} onPatientLogin={handlePatientLogin} onPatientLogout={handlePatientLogout} />}
        {page === 'planner' && (
          <PlannerPage
            hospitals={contentHospitals}
            initialProcedure={plannerInitialProcedure}
            money={money}
            selectedHospital={selectedHospital}
            selectedTreatment={selectedTreatment}
            setPage={setPage}
            setSelectedHospital={setSelectedHospital}
            setSelectedTreatment={setSelectedTreatment}
            treatments={contentTreatments}
          />
        )}

        {showHome && <AiExplorationSection setPage={setPage} />}
        {showHome && <HomeFaqSection />}
      </main>

      {!showAdmin && !showAuth && page !== 'partner-detail' && <Footer setPage={setPage} />}
      {showJourneyModal && page !== 'ai-assistant' && !showAdmin && <JourneyModal onClose={() => setShowJourneyModal(false)} setPage={setPage} treatments={contentTreatments} />}
    </div>
  );
}

export default App;
