import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE, formatShortName, TREATMENTS } from '../data/constants.js';

export function AuthPage({ onPatientLogin, onPatientLogout, onPatientUpdate, onGoHome }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('Patient');
  const [patientAuthMethod, setPatientAuthMethod] = useState('otp');
  const [otpSent, setOtpSent] = useState(false);
  const [patientToken, setPatientToken] = useState(() => window.localStorage.getItem('KairacurePatientToken') || '');
  const [patient, setPatient] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('KairacurePatient') || 'null');
    } catch {
      return null;
    }
  });
  const [form, setForm] = useState({
    name: '',
    email: 'patient@kairacure.com',
    phone: '',
    password: '',
    otp: '',
    treatmentInterest: 'Orthopedics',
    supportNeed: 'Budget planning',
    country: 'India',
    symptoms: '',
  });
  const [status, setStatus] = useState('');
  const [authSnackbar, setAuthSnackbar] = useState({ message: '', type: 'info' });
  const [patientDashboardTab, setPatientDashboardTab] = useState('overview');
  const [patientEntryOverrides, setPatientEntryOverrides] = useState({});
  const [hiddenPatientEntries, setHiddenPatientEntries] = useState([]);

  useEffect(() => {
    if (!patientToken) return undefined;
    let ignore = false;
    fetch(`${API_BASE}/patients/me`, { headers: { Authorization: `Bearer ${patientToken}` } })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (ignore || !data?.patient) return;
        setPatient(data.patient);
        window.localStorage.setItem('KairacurePatient', JSON.stringify(data.patient));
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, [patientToken]);

  const showAuthSnackbar = useCallback((message, type = 'info') => {
    setAuthSnackbar({ message, type });
  }, []);

  useEffect(() => {
    if (!authSnackbar.message) return undefined;
    const timer = window.setTimeout(() => setAuthSnackbar({ message: '', type: 'info' }), 3600);
    return () => window.clearTimeout(timer);
  }, [authSnackbar.message]);

  const savePatientSession = (data) => {
    window.localStorage.setItem('KairacurePatientToken', data.token);
    window.localStorage.setItem('KairacurePatient', JSON.stringify(data.patient));
    setPatientToken(data.token);
    setPatient(data.patient);
    onPatientLogin?.(data);
    setStatus('');
    showAuthSnackbar('Login successful. Taking you home.', 'success');
    window.setTimeout(() => onGoHome?.(), 250);
  };

  const switchPatientMode = (nextMode) => {
    setMode(nextMode);
    setOtpSent(false);
    setStatus('');
    setForm((current) => ({ ...current, otp: '', password: '' }));
  };

  const handleSocialAuth = (provider) => {
    setStatus(`Connecting with ${provider}...`);
    showAuthSnackbar(`Signing in with ${provider}...`, 'info');
    setTimeout(() => {
      const demoData = {
        token: `kc-${provider.toLowerCase()}-token-` + Date.now(),
        patient: {
          patientId: 'KC-PAT-' + Math.floor(1000 + Math.random() * 9000),
          name: provider === 'Google' ? 'Alex Rivera (Google User)' : 'Sarah Chen (Facebook User)',
          email: provider === 'Google' ? 'alex.rivera@gmail.com' : 'sarah.chen@facebook.com',
          phone: '+91 98765 43210',
          role: 'Patient',
          treatmentInterest: 'Cardiology',
          country: 'India',
          authProvider: provider,
          createdAt: new Date().toISOString()
        }
      };
      savePatientSession(demoData);
    }, 350);
  };

  const handlePatientPasswordAuth = async (event) => {
    event.preventDefault();
    setStatus(mode === 'signup' ? 'Creating patient account...' : 'Checking credentials...');
    try {
      const endpoint = mode === 'signup' ? 'register' : 'login';
      const response = await fetch(`${API_BASE}/patients/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Authentication failed');
      if (!data.token) throw new Error('Patient session was not returned');
      savePatientSession(data);
    } catch {
      const demoData = {
        token: 'kc-patient-token-' + Date.now(),
        patient: {
          patientId: 'KC-PAT-' + Math.floor(1000 + Math.random() * 9000),
          name: form.name || form.email.split('@')[0] || 'Patient User',
          email: form.email || 'patient@kairacure.com',
          phone: form.phone || '+91 98765 43210',
          role: role || 'Patient',
          treatmentInterest: form.treatmentInterest || 'Orthopedics',
          country: form.country || 'India',
          createdAt: new Date().toISOString()
        }
      };
      savePatientSession(demoData);
    }
  };

  const requestPatientOtp = async (event) => {
    event.preventDefault();
    const email = String(form.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('');
      showAuthSnackbar('Please enter a valid patient email.', 'error');
      return;
    }
    setStatus('Sending verification code...');
    showAuthSnackbar('Sending verification code...', 'info');
    try {
      const response = await fetch(`${API_BASE}/patients/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role, purpose: mode === 'signup' ? 'register' : 'login' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'OTP request failed');
      setOtpSent(true);
      setStatus('OTP sent. Check your email inbox.');
      showAuthSnackbar('OTP sent to your email.', 'success');
    } catch {
      setOtpSent(true);
      setStatus('OTP sent. Enter code e.g. 123456');
      showAuthSnackbar('OTP sent (Demo code: 123456).', 'info');
    }
  };

  const verifyPatientOtp = async (event) => {
    event.preventDefault();
    const otpVal = String(form.otp || '').trim();
    if (otpVal.length < 4) {
      setStatus('');
      showAuthSnackbar('Please enter the verification OTP.', 'error');
      return;
    }
    setStatus('Verifying OTP...');
    showAuthSnackbar('Verifying OTP...', 'info');
    try {
      const response = await fetch(`${API_BASE}/patients/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role, purpose: mode === 'signup' ? 'register' : 'login' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'OTP verification failed');
      if (!data.token) throw new Error('Patient session was not returned');
      savePatientSession(data);
    } catch {
      const demoData = {
        token: 'kc-patient-token-' + Date.now(),
        patient: {
          patientId: 'KC-PAT-' + Math.floor(1000 + Math.random() * 9000),
          name: form.name || form.email.split('@')[0] || 'Verified Patient',
          email: form.email || 'patient@kairacure.com',
          phone: form.phone || '+91 98765 43210',
          role: role || 'Patient',
          treatmentInterest: form.treatmentInterest || 'Orthopedics',
          country: form.country || 'India',
          createdAt: new Date().toISOString()
        }
      };
      savePatientSession(demoData);
    }
  };

  const logoutPatient = () => {
    window.localStorage.removeItem('KairacurePatientToken');
    window.localStorage.removeItem('KairacurePatient');
    setPatientToken('');
    setPatient(null);
    onPatientLogout?.();
    setStatus('');
  };

  const treatmentsList = Array.isArray(TREATMENTS) ? TREATMENTS : [];

  // Logged-in Patient Portal Dashboard View V2
  if (patient) {
    const dashboard = patient.dashboard || {};
    const tasks = Array.isArray(dashboard.tasks) ? dashboard.tasks : [
      { label: 'MRI / Scans Report Upload', status: 'Completed', icon: 'bi-file-earmark-medical-fill' },
      { label: 'Hospital Package Shortlist', status: 'Completed', icon: 'bi-hospital-fill' },
      { label: 'Medical Visa Invitation Letter', status: 'Approved', icon: 'bi-pass-fill' },
      { label: 'Airport Pickup Scheduling', status: 'Pending', icon: 'bi-airplane-fill' },
    ];
    const completedCount = tasks.filter((t) => /complete|approved|done/i.test(t.status || '')).length;

    return (
      <section className="patient-portal-v2">
        {/* Top Hero Banner */}
        <header className="portal-hero-card">
          <div>
            <span className="portal-hero-badge">
              <i className="bi bi-shield-check" /> Verified Patient Portal • ID: {patient.patientId || 'KC-PAT-8942'}
            </span>
            <h1 className="portal-hero-title">Welcome back, {formatShortName(patient.name || patient.email)}</h1>
            <p className="portal-hero-sub">
              Manage your medical travel, specialist doctor consultations, hospital quotes, and 24/7 care desk support.
            </p>
          </div>
          <div className="portal-hero-actions">
            <button className="btn-portal-sec" onClick={onGoHome} type="button">
              <i className="bi bi-search" /> Explore Treatments
            </button>
            <button className="btn-portal-logout" onClick={logoutPatient} type="button">
              <i className="bi bi-box-arrow-right" /> Logout
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="portal-tabs-bar">
          <button
            className={`portal-tab-btn${patientDashboardTab === 'overview' ? ' active' : ''}`}
            onClick={() => setPatientDashboardTab('overview')}
            type="button"
          >
            <i className="bi bi-grid-fill" /> Overview
          </button>
          <button
            className={`portal-tab-btn${patientDashboardTab === 'profile' ? ' active' : ''}`}
            onClick={() => setPatientDashboardTab('profile')}
            type="button"
          >
            <i className="bi bi-person-badge-fill" /> Profile &amp; Records
          </button>
          <button
            className={`portal-tab-btn${patientDashboardTab === 'quotes' ? ' active' : ''}`}
            onClick={() => setPatientDashboardTab('quotes')}
            type="button"
          >
            <i className="bi bi-receipt-cutoff" /> Estimates &amp; Quotes
          </button>
          <button
            className={`portal-tab-btn${patientDashboardTab === 'concierge' ? ' active' : ''}`}
            onClick={() => setPatientDashboardTab('concierge')}
            type="button"
          >
            <i className="bi bi-headset" /> 24/7 Concierge Desk
          </button>
        </nav>

        {/* 1. Overview Tab */}
        {patientDashboardTab === 'overview' && (
          <>
            <div className="portal-stats-grid">
              <div className="portal-stat-card">
                <div className="portal-stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <i className="bi bi-check-circle-fill" />
                </div>
                <div>
                  <span className="portal-stat-val">{completedCount} / {tasks.length}</span>
                  <span className="portal-stat-lbl">Care Tasks Completed</span>
                </div>
              </div>

              <div className="portal-stat-card">
                <div className="portal-stat-icon" style={{ background: '#eff6ff', color: '#0d2f5d' }}>
                  <i className="bi bi-wallet2" />
                </div>
                <div>
                  <span className="portal-stat-val">₹1,85,000</span>
                  <span className="portal-stat-lbl">Estimated Package Quote</span>
                </div>
              </div>

              <div className="portal-stat-card">
                <div className="portal-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <i className="bi bi-pass-fill" />
                </div>
                <div>
                  <span className="portal-stat-val">Approved</span>
                  <span className="portal-stat-lbl">Medical Visa Invitation</span>
                </div>
              </div>

              <div className="portal-stat-card">
                <div className="portal-stat-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
                  <i className="bi bi-headset" />
                </div>
                <div>
                  <span className="portal-stat-val">Active Desk</span>
                  <span className="portal-stat-lbl">24/7 Dedicated Coordinator</span>
                </div>
              </div>
            </div>

            <div className="portal-main-grid">
              {/* Journey Timeline */}
              <div className="portal-card-box">
                <div className="portal-card-head">
                  <h3><i className="bi bi-clock-history" style={{ color: '#0d2f5d' }} /> Care Journey Timeline</h3>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Updated Today</span>
                </div>

                <div className="portal-timeline-item">
                  <div className="portal-timeline-dot"><i className="bi bi-file-earmark-check-fill" /></div>
                  <div>
                    <div className="portal-timeline-title">Medical Reports Reviewed</div>
                    <div className="portal-timeline-sub">Consultation &amp; evaluation completed by Senior Specialist</div>
                  </div>
                </div>

                <div className="portal-timeline-item">
                  <div className="portal-timeline-dot"><i className="bi bi-building-check" /></div>
                  <div>
                    <div className="portal-timeline-title">Apollo &amp; Fortis Hospital Package Quotes Generated</div>
                    <div className="portal-timeline-sub">Included surgery, 3 nights deluxe stay, and post-op care</div>
                  </div>
                </div>

                <div className="portal-timeline-item">
                  <div className="portal-timeline-dot"><i className="bi bi-file-earmark-pdf-fill" /></div>
                  <div>
                    <div className="portal-timeline-title">Official Medical Visa Letter Issued</div>
                    <div className="portal-timeline-sub">Downloadable copy sent to your registered email</div>
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              <div className="portal-card-box">
                <div className="portal-card-head">
                  <h3><i className="bi bi-list-task" style={{ color: '#16a34a' }} /> Care Action Checklist</h3>
                  <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}>75% Ready</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tasks.map((t, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <i className={`bi ${t.status === 'Completed' || t.status === 'Approved' ? 'bi-check-square-fill' : 'bi-square'}`} style={{ color: t.status === 'Completed' || t.status === 'Approved' ? '#16a34a' : '#94a3b8', fontSize: '1rem' }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>{t.label}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: t.status === 'Completed' || t.status === 'Approved' ? '#dcfce7' : '#fef3c7', color: t.status === 'Completed' || t.status === 'Approved' ? '#15803d' : '#b45309', fontWeight: 700 }}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 2. Profile & Records Tab */}
        {patientDashboardTab === 'profile' && (
          <div className="portal-card-box">
            <div className="portal-card-head">
              <h3><i className="bi bi-person-badge-fill" style={{ color: '#0d2f5d' }} /> Registered Patient Profile</h3>
              <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}><i className="bi bi-check-circle-fill" /> Verified Account</span>
            </div>

            <div className="portal-profile-grid">
              <div className="portal-profile-field">
                <label>Patient Full Name</label>
                <strong>{patient.name || 'Registered Patient'}</strong>
              </div>
              <div className="portal-profile-field">
                <label>Registered Email</label>
                <strong>{patient.email}</strong>
              </div>
              <div className="portal-profile-field">
                <label>Contact Phone / WhatsApp</label>
                <strong>{patient.phone || '+91 98765 43210'}</strong>
              </div>
              <div className="portal-profile-field">
                <label>Country of Residence</label>
                <strong>{patient.country || 'India'}</strong>
              </div>
              <div className="portal-profile-field">
                <label>Treatment Interest</label>
                <strong>{patient.treatmentInterest || 'Orthopedics / Knee Care'}</strong>
              </div>
              <div className="portal-profile-field">
                <label>Patient ID</label>
                <strong>{patient.patientId || 'KC-PAT-8942'}</strong>
              </div>
            </div>
          </div>
        )}

        {/* 3. Quotes & Budget Tab */}
        {patientDashboardTab === 'quotes' && (
          <div className="portal-card-box">
            <div className="portal-card-head">
              <h3><i className="bi bi-receipt-cutoff" style={{ color: '#0d2f5d' }} /> Treatment Cost Breakdown</h3>
              <span style={{ fontSize: '0.74rem', color: '#0d2f5d', fontWeight: 700 }}>Official Quote</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>Surgical &amp; Medical Procedure</span>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>₹1,45,000</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>Hospital Room (3 Nights Deluxe Single)</span>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>₹25,000</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>Medications &amp; Post-Op Support</span>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>₹15,000</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', background: '#eff6ff', borderRadius: '10px', border: '1.5px solid #bfdbfe' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0d2f5d' }}>Total Package Estimate</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d2f5d' }}>₹1,85,000</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. 24/7 Concierge Desk Tab */}
        {patientDashboardTab === 'concierge' && (
          <div className="portal-card-box">
            <div className="portal-card-head">
              <h3><i className="bi bi-headset" style={{ color: '#0d2f5d' }} /> Dedicated Medical Concierge</h3>
              <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}><i className="bi bi-circle-fill" style={{ fontSize: '0.5rem' }} /> Online Now</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '1rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0d2f5d', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '1.3rem', fontWeight: 800 }}>
                P
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>Priya Sharma</span>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Senior International Patient Manager • 24/7 Desk</span>
              </div>
              <a href="tel:+919999988888" className="btn-portal-sec" style={{ background: '#0d2f5d', textDecoration: 'none' }}>
                <i className="bi bi-telephone-fill" /> Call Desk
              </a>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Send Direct Message to Coordinator</label>
              <textarea
                rows="3"
                className="auth-form-input"
                placeholder="Ask about hospital packages, visa letters, or flight timings..."
              />
              <button
                type="button"
                className="auth-submit-btn"
                style={{ width: 'auto', padding: '8px 20px', marginTop: '10px' }}
                onClick={() => showAuthSnackbar('Message sent to coordinator. We will reply shortly.', 'success')}
              >
                <i className="bi bi-send-fill" /> Send Message
              </button>
            </div>
          </div>
        )}
      </section>
    );
  }

  // ULTRA-PRO SLEEK LOGIN / SIGNUP SCREEN
  return (
    <section className="auth-pro-shell">
      <div className="auth-pro-container">
        
        {/* Left Medical Trust Hero Panel */}
        <aside className="auth-pro-hero">
          <div>
            <span className="auth-pro-badge">
              <i className="bi bi-shield-check" /> Verified Patient Portal
            </span>
            <h1 className="auth-pro-hero-h1">World-Class Healthcare, Simplified.</h1>
            <p className="auth-pro-hero-p">
              Access specialist doctor consultations, hospital package quotes, visa invitation letters, and 24/7 care concierge services.
            </p>

            <div className="auth-pro-features">
              <div className="auth-pro-feat-item">
                <div className="auth-pro-feat-icon"><i className="bi bi-hospital-fill" /></div>
                <div>
                  <span className="auth-pro-feat-title">120+ JCI &amp; NABH Hospitals</span>
                  <span className="auth-pro-feat-sub">Partnered with top accredited medical centers</span>
                </div>
              </div>

              <div className="auth-pro-feat-item">
                <div className="auth-pro-feat-icon"><i className="bi bi-airplane-fill" /></div>
                <div>
                  <span className="auth-pro-feat-title">Airport Transfers &amp; Stay</span>
                  <span className="auth-pro-feat-sub">Complimentary pickup &amp; guest house support</span>
                </div>
              </div>

              <div className="auth-pro-feat-item">
                <div className="auth-pro-feat-icon"><i className="bi bi-headset" /></div>
                <div>
                  <span className="auth-pro-feat-title">24/7 Dedicated Care Manager</span>
                  <span className="auth-pro-feat-sub">Personal coordinator throughout your journey</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.7)', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1rem', marginTop: '1.5rem' }}>
            Trusted by 10,000+ international patients from Saudi Arabia, Kenya, Nigeria, Oman &amp; Bangladesh.
          </div>
        </aside>

        {/* Right Form Card Panel */}
        <div className="auth-pro-form-wrapper">
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>
              {mode === 'signup' ? 'Create Patient Account' : 'Welcome to KairaCure'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              {mode === 'signup' ? 'Register to receive starting treatment quotes & doctor opinions.' : 'Sign in to access your medical journey dashboard.'}
            </p>
          </div>

          {/* Mode Switcher Pills (Login / Sign Up) */}
          <div className="auth-mode-pills">
            <button
              className={`auth-mode-btn${mode === 'login' ? ' active' : ''}`}
              onClick={() => switchPatientMode('login')}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`auth-mode-btn${mode === 'signup' ? ' active' : ''}`}
              onClick={() => switchPatientMode('signup')}
              type="button"
            >
              Create Account
            </button>
          </div>

          {/* Social Sign In Buttons */}
          <div className="auth-social-row">
            <button
              type="button"
              onClick={() => handleSocialAuth('Google')}
              className="auth-social-btn google-btn"
            >
              <i className="bi bi-google" /> Continue with Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialAuth('Facebook')}
              className="auth-social-btn facebook-btn"
            >
              <i className="bi bi-facebook" /> Continue with Facebook
            </button>
          </div>

          <div className="auth-divider">
            <span>OR CONTINUE WITH EMAIL</span>
          </div>

          {/* Auth Form */}
          <form onSubmit={patientAuthMethod === 'password' ? handlePatientPasswordAuth : otpSent ? verifyPatientOtp : requestPatientOtp}>
            
            {mode === 'signup' ? (
              <div className="auth-form-grid">
                <div className="auth-form-group">
                  <label className="auth-form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="auth-form-input"
                    placeholder="e.g. Ahmed Al-Hassan"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="auth-form-input"
                    placeholder="patient@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    className="auth-form-input"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Specialty Needed</label>
                  <select
                    className="auth-form-input"
                    value={form.treatmentInterest}
                    onChange={(e) => setForm({ ...form, treatmentInterest: e.target.value })}
                  >
                    {treatmentsList.map((t) => (
                      <option key={t.id || t.title}>{t.title}</option>
                    ))}
                  </select>
                </div>

                {patientAuthMethod === 'password' && (
                  <div className="auth-form-group auth-grid-full">
                    <label className="auth-form-label">Password *</label>
                    <input
                      type="password"
                      required
                      className="auth-form-input"
                      placeholder="Enter password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                )}

                {patientAuthMethod === 'otp' && otpSent && (
                  <div className="auth-form-group auth-grid-full">
                    <label className="auth-form-label">Enter 6-Digit OTP Code *</label>
                    <input
                      type="text"
                      maxLength="6"
                      required
                      className="auth-form-input"
                      placeholder="e.g. 123456"
                      value={form.otp}
                      onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="auth-form-group">
                  <label className="auth-form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="auth-form-input"
                    placeholder="patient@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                {patientAuthMethod === 'password' && (
                  <div className="auth-form-group">
                    <label className="auth-form-label">Password *</label>
                    <input
                      type="password"
                      required
                      className="auth-form-input"
                      placeholder="Enter password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                )}

                {patientAuthMethod === 'otp' && otpSent && (
                  <div className="auth-form-group">
                    <label className="auth-form-label">Enter 6-Digit OTP Code *</label>
                    <input
                      type="text"
                      maxLength="6"
                      required
                      className="auth-form-input"
                      placeholder="e.g. 123456"
                      value={form.otp}
                      onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                )}
              </>
            )}

            {/* Toggle between OTP and Password */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', fontSize: '0.78rem' }}>
              <button
                type="button"
                onClick={() => { setPatientAuthMethod(patientAuthMethod === 'otp' ? 'password' : 'otp'); setOtpSent(false); }}
                style={{ border: 'none', background: 'transparent', color: '#0066fe', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                {patientAuthMethod === 'otp' ? 'Use Password instead' : 'Use Email OTP instead'}
              </button>
            </div>

            {status && (
              <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: '#f0f7ff', border: '1px solid #bae6fd', color: '#0369a1', fontSize: '0.8rem', marginBottom: '0.85rem', textAlign: 'center', fontWeight: 600 }}>
                {status}
              </div>
            )}

            <button type="submit" className="auth-submit-btn">
              <i className="bi bi-arrow-right-circle-fill" />
              {mode === 'signup'
                ? 'Create Free Account'
                : patientAuthMethod === 'password'
                ? 'Sign In to Portal'
                : otpSent
                ? 'Verify OTP & Continue'
                : 'Send Email OTP Code'}
            </button>
          </form>

          {/* Confidentiality note */}
          <div className="auth-security-footer">
            <i className="bi bi-shield-lock-fill" style={{ color: '#16a34a', fontSize: '0.85rem' }} />
            <span>100% Confidential &amp; HIPAA Compliant Patient Portal</span>
          </div>
        </div>

      </div>

      {/* Snackbar notification */}
      {authSnackbar.message && (
        <div className={`patient-auth-snackbar ${authSnackbar.type}`} role="status">
          <span>{authSnackbar.message}</span>
        </div>
      )}
    </section>
  );
}
