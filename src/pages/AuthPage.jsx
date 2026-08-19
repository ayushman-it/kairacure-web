import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE, formatShortName } from '../data/constants.js';

export function AuthPage({ onPatientLogin, onPatientLogout, onPatientUpdate, onGoHome }) {
  const [mode, setMode] = useState('login');
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
    email: 'patient@Kairacure.com',
    phone: '',
    password: '',
    newPassword: '',
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
  const [editingPatientEntry, setEditingPatientEntry] = useState(null);
  const [patientEntryDraft, setPatientEntryDraft] = useState('');
  const [patientDashboardNotice, setPatientDashboardNotice] = useState('');

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

  const patientPurpose = mode === 'signup' ? 'register' : mode === 'forgot' ? 'forgot-password' : 'login';

  const switchPatientMode = (nextMode) => {
    setMode(nextMode);
    setOtpSent(false);
    setStatus('');
    setForm((current) => ({ ...current, otp: '', password: '', newPassword: '' }));
  };

  const generatePatientPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    const required = ['M', 'e', '7', '#'];
    const bytes = new Uint32Array(14);
    const shuffleBytes = new Uint32Array(required.length + bytes.length);
    window.crypto.getRandomValues(bytes);
    window.crypto.getRandomValues(shuffleBytes);
    const generatedChars = [...required, ...Array.from(bytes, (byte) => chars[byte % chars.length])];
    for (let index = generatedChars.length - 1; index > 0; index -= 1) {
      const swapIndex = shuffleBytes[index] % (index + 1);
      [generatedChars[index], generatedChars[swapIndex]] = [generatedChars[swapIndex], generatedChars[index]];
    }
    const generated = generatedChars.join('');
    setForm((current) => ({ ...current, password: generated }));
    setStatus('Strong password generated. Keep it safe before continuing.');
  };

  const handlePatientPasswordAuth = async (event) => {
    event.preventDefault();
    setStatus(mode === 'signup' ? 'Creating patient account...' : 'Checking password...');
    try {
      const endpoint = mode === 'signup' ? 'register' : 'login';
      const response = await fetch(`${API_BASE}/patients/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Password authentication failed');
      if (!data.token) throw new Error('Patient session was not returned');
      savePatientSession(data);
    } catch (error) {
      setStatus(error.message === 'Failed to fetch' ? 'Patient API unavailable. Start the backend server and try again.' : error.message);
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
        body: JSON.stringify({ ...form, role, purpose: patientPurpose }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'OTP request failed');
      setOtpSent(true);
      setStatus('OTP sent. Check your email inbox.');
      showAuthSnackbar('OTP sent to your email.', 'success');
    } catch (error) {
      const message = error.message === 'Failed to fetch' ? 'Patient API unavailable. Start the backend server and try again.' : error.message;
      setStatus(message);
      showAuthSnackbar(message, 'error');
    }
  };

  const verifyPatientOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(String(form.otp || '').trim())) {
      setStatus('');
      showAuthSnackbar('Please enter the 6 digit OTP.', 'error');
      return;
    }
    setStatus(mode === 'forgot' ? 'Resetting password...' : 'Verifying OTP...');
    showAuthSnackbar(mode === 'forgot' ? 'Resetting password...' : 'Verifying OTP...', 'info');
    try {
      const response = await fetch(`${API_BASE}/patients/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role, purpose: patientPurpose }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'OTP verification failed');
      if (mode === 'forgot') {
        setStatus('Password reset successfully. You can login with OTP anytime.');
        showAuthSnackbar('Password reset. Login with email OTP.', 'success');
        setOtpSent(false);
        setMode('login');
        setForm((current) => ({ ...current, otp: '', newPassword: '' }));
        return;
      }
      if (!data.token) throw new Error('Patient session was not returned');
      savePatientSession(data);
    } catch (error) {
      const message = error.message === 'Failed to fetch' ? 'Patient API unavailable. Start the backend server and try again.' : error.message;
      setStatus(message);
      showAuthSnackbar(message, 'error');
    }
  };

  const logoutPatient = () => {
    window.localStorage.removeItem('KairacurePatientToken');
    window.localStorage.removeItem('KairacurePatient');
    setPatientToken('');
    setPatient(null);
    setPatientDashboardTab('overview');
    setPatientEntryOverrides({});
    setHiddenPatientEntries([]);
    setEditingPatientEntry(null);
    setPatientEntryDraft('');
    setPatientDashboardNotice('');
    onPatientLogout?.();
    setStatus('');
  };

  if (patient) {
    const dashboard = patient.dashboard || {};
    const tasks = Array.isArray(dashboard.tasks) ? dashboard.tasks : [];
    const estimates = Array.isArray(dashboard.estimates) ? dashboard.estimates : [];
    const messages = Array.isArray(dashboard.messages) ? dashboard.messages : [];
    const completedTasks = tasks.filter((task) => /complete|done|shared|scheduled|confirmed/i.test(task.status || '')).length;
    const pendingTasks = Math.max(tasks.length - completedTasks, 0);
    const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
    const estimateTotal = estimates.reduce((sum, estimate) => sum + (Number(estimate.amount) || 0), 0);
    const baseRegisteredEntries = [
      { key: 'patientId', icon: 'fa-id-card-clip', label: 'Patient ID', value: patient.patientId, locked: true },
      { key: 'email', icon: 'fa-envelope', label: 'Registered email', value: patient.email },
      { key: 'phone', icon: 'fa-phone', label: 'Phone', value: patient.phone || 'Not added' },
      { key: 'role', icon: 'fa-user-group', label: 'Role', value: patient.role || 'Patient' },
      { key: 'treatmentInterest', icon: 'fa-stethoscope', label: 'Treatment interest', value: patient.treatmentInterest || 'Not selected' },
      { key: 'supportNeed', icon: 'fa-hand-holding-medical', label: 'Support need', value: patient.supportNeed || 'Not selected' },
      { key: 'country', icon: 'fa-location-dot', label: 'Country', value: patient.country || 'Not added' },
      { key: 'createdAt', icon: 'fa-calendar-check', label: 'Registered on', value: patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('en-IN') : 'Not available', locked: true },
    ];
    const registeredEntries = baseRegisteredEntries
      .map((entry) => ({ ...entry, value: patientEntryOverrides[entry.key] ?? entry.value }))
      .filter((entry) => !hiddenPatientEntries.includes(entry.key));
    const visibleEntryCount = registeredEntries.filter((entry) => entry.value && !String(entry.value).startsWith('Not')).length;
    const paymentHistory = (Array.isArray(dashboard.payments) && dashboard.payments.length ? dashboard.payments : estimates.map((estimate, index) => ({
      id: `estimate-${index}`,
      label: estimate.label || `Estimate ${index + 1}`,
      amount: estimate.amount,
      currency: estimate.currency || 'INR',
      status: index === 0 ? 'Awaiting approval' : 'Estimate shared',
      date: patient.updatedAt || patient.createdAt,
    })));
    const careHistory = [
      { icon: 'fa-user-plus', label: 'Profile created', meta: patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('en-IN') : 'Recently', detail: patient.supportNeed || 'Patient entry received' },
      { icon: 'fa-clipboard-list', label: dashboard.stage || 'Coordinator review', meta: patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString('en-IN') : 'In progress', detail: dashboard.nextStep || 'Care team is reviewing details' },
      ...tasks.slice(0, 4).map((task) => ({ icon: 'fa-list-check', label: task.label, meta: task.status || 'Pending', detail: 'Care task' })),
    ];
    const patientMenus = [
      ['overview', 'Overview', 'fa-house-medical'],
      ['entries', 'Entries', 'fa-pen-to-square'],
      ['payments', 'Payments', 'fa-credit-card'],
      ['history', 'History', 'fa-clock-rotate-left'],
      ['messages', 'Messages', 'fa-message'],
    ];
    const beginEditPatientEntry = (entry) => {
      setEditingPatientEntry(entry);
      setPatientEntryDraft(String(entry.value || ''));
      setPatientDashboardNotice('');
    };
    const savePatientEntry = () => {
      if (!editingPatientEntry) return;
      const nextValue = patientEntryDraft.trim() || 'Not added';
      const updatedKey = editingPatientEntry.key;
      setPatientEntryOverrides((current) => {
        const next = { ...current, [updatedKey]: nextValue };
        window.localStorage.setItem('KairacurePatientEntryOverrides', JSON.stringify(next));
        return next;
      });
      setPatient((current) => {
        if (!current) return current;
        const next = { ...current, [updatedKey]: nextValue };
        window.localStorage.setItem('KairacurePatient', JSON.stringify(next));
        onPatientUpdate?.(next);
        return next;
      });
      setEditingPatientEntry(null);
      setPatientEntryDraft('');
      setPatientDashboardNotice('Saving entry to admin...');
      fetch(`${API_BASE}/patients/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientToken}` },
        body: JSON.stringify({
          fields: { [updatedKey]: nextValue },
          page: 'patient-dashboard',
          path: window.location.pathname,
        }),
      })
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Profile sync failed'))))
        .then((data) => {
          if (!data?.patient) return;
          setPatient(data.patient);
          window.localStorage.setItem('KairacurePatient', JSON.stringify(data.patient));
          onPatientUpdate?.(data.patient);
          setPatientDashboardNotice('Entry updated and saved in admin.');
        })
        .catch(() => setPatientDashboardNotice('Entry updated locally. Backend sync pending.'));
    };
    const deletePatientEntry = (entry) => {
      if (entry.locked) return;
      setHiddenPatientEntries((current) => {
        const next = current.includes(entry.key) ? current : [...current, entry.key];
        window.localStorage.setItem('KairacureHiddenPatientEntries', JSON.stringify(next));
        return next;
      });
      setPatientDashboardNotice(`${entry.label} hidden from your entries.`);
    };

    return (
      <section className="patient-dashboard-page">
        <header className="patient-dashboard-hero">
          <div>
            <span><i className="fa-solid fa-user-shield" aria-hidden="true" /> Patient dashboard</span>
            <h1>Hi, {patient.name}</h1>
            <p>{dashboard.nextStep || 'Your care request is being reviewed by the Kairacure team.'}</p>
            <div className="patient-status-strip">
              <b>{patient.status || 'Active'}</b>
              <small>{dashboard.stage || 'Profile created'}</small>
            </div>
          </div>
          <button className="patient-logout-button" onClick={logoutPatient} type="button"><i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" /> Logout</button>
        </header>

        <nav className="patient-mobile-menu" aria-label="Patient dashboard menu">
          {patientMenus.map(([key, label, icon]) => (
            <button className={patientDashboardTab === key ? 'active' : ''} key={key} onClick={() => setPatientDashboardTab(key)} type="button">
              <i className={`fa-solid ${icon}`} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {patientDashboardNotice && <div className="patient-dashboard-notice"><i className="fa-solid fa-circle-check" aria-hidden="true" /> {patientDashboardNotice}</div>}

        {patientDashboardTab === 'overview' && (
          <>
            <div className="patient-dashboard-grid patient-analytics-grid">
              <article>
                <i className="fa-solid fa-chart-simple" aria-hidden="true" />
                <span>Task progress</span>
                <strong>{completionRate}%</strong>
                <small>{completedTasks} completed, {pendingTasks} pending</small>
              </article>
              <article>
                <i className="fa-solid fa-folder-open" aria-hidden="true" />
                <span>Care entries</span>
                <strong>{visibleEntryCount}</strong>
                <small>Visible profile fields</small>
              </article>
              <article>
                <i className="fa-solid fa-wallet" aria-hidden="true" />
                <span>Estimate total</span>
                <strong>{estimates[0]?.currency || 'INR'} {estimateTotal || 0}</strong>
                <small>{estimates.length ? `${estimates.length} estimate entries` : 'No estimate shared yet'}</small>
              </article>
            </div>
            <div className="patient-dashboard-actions">
              <button onClick={() => setPatientDashboardTab('entries')} type="button"><i className="fa-solid fa-pen-to-square" aria-hidden="true" /> Manage entries</button>
              <button onClick={() => setPatientDashboardTab('payments')} type="button"><i className="fa-solid fa-credit-card" aria-hidden="true" /> Track payments</button>
              <button onClick={() => setPatientDashboardTab('history')} type="button"><i className="fa-solid fa-clock-rotate-left" aria-hidden="true" /> View history</button>
            </div>
          </>
        )}

        {patientDashboardTab === 'entries' && (
          <section className="patient-entry-panel patient-dashboard-section">
            <div>
              <span><i className="fa-solid fa-pen-to-square" aria-hidden="true" /> Registered entries</span>
              <h2>Your submitted patient details</h2>
            </div>
            <div className="patient-entry-grid">
              {registeredEntries.map((entry) => (
                <article key={entry.key}>
                  <i className={`fa-solid ${entry.icon}`} aria-hidden="true" />
                  <span>{entry.label}</span>
                  <strong>{entry.value}</strong>
                  <div className="patient-entry-actions">
                    <button disabled={entry.locked} onClick={() => beginEditPatientEntry(entry)} type="button"><i className="fa-solid fa-pen" aria-hidden="true" /> Edit</button>
                    <button disabled={entry.locked} onClick={() => deletePatientEntry(entry)} type="button"><i className="fa-solid fa-trash" aria-hidden="true" /> Delete</button>
                  </div>
                </article>
              ))}
            </div>
            {editingPatientEntry && (
              <div className="patient-entry-editor">
                <label>{editingPatientEntry.label}<input autoFocus onChange={(event) => setPatientEntryDraft(event.target.value)} value={patientEntryDraft} /></label>
                <div>
                  <button onClick={savePatientEntry} type="button">Save</button>
                  <button onClick={() => setEditingPatientEntry(null)} type="button">Cancel</button>
                </div>
              </div>
            )}
          </section>
        )}

        {patientDashboardTab === 'payments' && (
          <section className="patient-dashboard-section patient-payment-panel">
            <div className="patient-section-head">
              <span><i className="fa-solid fa-credit-card" aria-hidden="true" /> Payment tracker</span>
              <h2>Estimates and payment history</h2>
            </div>
            <div className="patient-payment-summary">
              <article><span>Total estimate</span><strong>{estimates[0]?.currency || 'INR'} {estimateTotal || 0}</strong></article>
              <article><span>Entries</span><strong>{paymentHistory.length}</strong></article>
              <article><span>Status</span><strong>{paymentHistory[0]?.status || 'No payment due'}</strong></article>
            </div>
            <div className="patient-timeline-list">
              {paymentHistory.length ? paymentHistory.map((payment) => (
                <article key={payment.id || payment.label}>
                  <i className="fa-solid fa-receipt" aria-hidden="true" />
                  <div><strong>{payment.label}</strong><span>{payment.status || 'Shared'}{payment.date ? ` - ${new Date(payment.date).toLocaleDateString('en-IN')}` : ''}</span></div>
                  <b>{payment.currency || 'INR'} {payment.amount || 0}</b>
                </article>
              )) : <p>No payments or estimates have been added yet.</p>}
            </div>
          </section>
        )}

        {patientDashboardTab === 'history' && (
          <section className="patient-dashboard-section">
            <div className="patient-section-head">
              <span><i className="fa-solid fa-clock-rotate-left" aria-hidden="true" /> Care history</span>
              <h2>Your activity timeline</h2>
            </div>
            <div className="patient-timeline-list">
              {careHistory.map((item) => (
                <article key={`${item.label}-${item.meta}`}>
                  <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                  <div><strong>{item.label}</strong><span>{item.detail}</span></div>
                  <b>{item.meta}</b>
                </article>
              ))}
            </div>
          </section>
        )}

        {patientDashboardTab === 'messages' && (
          <div className="patient-dashboard-columns patient-dashboard-section">
            <section>
              <h2>Care Tasks</h2>
              {tasks.length ? tasks.map((task) => <div key={task.label}><span>{task.label}</span><strong>{task.status}</strong></div>) : <p>No tasks yet.</p>}
            </section>
            <section>
              <h2>Estimates</h2>
              {estimates.length ? estimates.map((estimate) => <div key={estimate.label}><span>{estimate.label}</span><strong>{estimate.currency} {estimate.amount}</strong></div>) : <p>Estimates will appear after report review.</p>}
            </section>
            <section>
              <h2>Messages</h2>
              {messages.length ? messages.map((message) => <div key={`${message.from}-${message.text}`}><span>{message.from}</span><strong>{message.text}</strong></div>) : <p>No messages yet.</p>}
            </section>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="admin-login-page patient-login-page">
      <div className="admin-login-shell patient-login-shell">
        <aside className="admin-login-visual patient-login-visual">
          <div className="patient-login-photo" aria-hidden="true">
            <img alt="" src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&q=86" />
          </div>
        </aside>
        <form className="admin-login-card patient-login-card" onSubmit={mode !== 'forgot' && patientAuthMethod === 'password' ? handlePatientPasswordAuth : otpSent ? verifyPatientOtp : requestPatientOtp}>
          <h1>{mode === 'signup' ? 'Create patient account' : mode === 'forgot' ? 'Reset with email OTP' : 'Login with email OTP'}</h1>
          <div className="auth-toggle patient-auth-toggle">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => switchPatientMode('login')} type="button">Login</button>
            <button className={mode === 'signup' ? 'active' : ''} onClick={() => switchPatientMode('signup')} type="button">Sign up</button>
            <button className={mode === 'forgot' ? 'active' : ''} onClick={() => switchPatientMode('forgot')} type="button">Forgot</button>
          </div>
          {mode !== 'forgot' && (
            <div className="patient-auth-method-toggle" aria-label="Patient authentication method">
              <button className={patientAuthMethod === 'otp' ? 'active' : ''} onClick={() => { setPatientAuthMethod('otp'); setOtpSent(false); setStatus(''); }} type="button">
                <i className="fa-solid fa-envelope-circle-check" aria-hidden="true" /> Email OTP
              </button>
              <button className={patientAuthMethod === 'password' ? 'active' : ''} onClick={() => { setPatientAuthMethod('password'); setOtpSent(false); setStatus(''); }} type="button">
                <i className="fa-solid fa-key" aria-hidden="true" /> Password
              </button>
            </div>
          )}
          {mode === 'signup' && (
            <div className="patient-type-grid">
              {['Patient', 'Family member', 'Medical coordinator'].map((item) => (
                <button className={role === item ? 'active' : ''} key={item} onClick={() => setRole(item)} type="button">
                  <strong>{item}</strong>
                </button>
              ))}
            </div>
          )}
          {mode === 'signup' && <label>Full name<input onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Patient full name" value={form.name} /></label>}
          <label>Email<input onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="patient@email.com" type="email" value={form.email} /></label>
          {mode !== 'forgot' && patientAuthMethod === 'password' && (
            <label className="patient-password-field">Password<div className="patient-password-control"><input autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={mode === 'signup' ? 'Minimum 8 characters' : 'Enter password'} type="text" value={form.password} />{mode === 'signup' && <button onClick={generatePatientPassword} type="button"><i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" /> Generate</button>}</div></label>
          )}
          {mode === 'signup' && <label>Phone<input onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+91..." value={form.phone} /></label>}
          {mode === 'signup' && (
            <>
              <label>Treatment<select onChange={(event) => setForm({ ...form, treatmentInterest: event.target.value })} value={form.treatmentInterest}>
                {TREATMENTS.map((item) => (
                  <option key={item.id}>{item.title}</option>
                ))}
              </select></label>
              <label>Support need<select onChange={(event) => setForm({ ...form, supportNeed: event.target.value })} value={form.supportNeed}>
                <option>Budget planning</option>
                <option>Doctor second opinion</option>
                <option>Hospital shortlisting</option>
                <option>Travel and stay support</option>
              </select></label>
              <label>Country<input onChange={(event) => setForm({ ...form, country: event.target.value })} placeholder="Country" value={form.country} /></label>
              <label>Care notes<textarea onChange={(event) => setForm({ ...form, symptoms: event.target.value })} placeholder="Brief symptoms or care notes" rows="3" value={form.symptoms} /></label>
            </>
          )}
          {(patientAuthMethod === 'otp' || mode === 'forgot') && otpSent && <label>OTP<input inputMode="numeric" maxLength="6" onChange={(event) => setForm({ ...form, otp: event.target.value.replace(/\D/g, '') })} placeholder="6 digit OTP" value={form.otp} /></label>}
          {mode === 'forgot' && otpSent && <label>New password<input onChange={(event) => setForm({ ...form, newPassword: event.target.value })} placeholder="Minimum 8 characters" type="password" value={form.newPassword} /></label>}
          <button type="submit">{mode !== 'forgot' && patientAuthMethod === 'password' ? (mode === 'signup' ? 'Create Account' : 'Login with Password') : otpSent ? (mode === 'forgot' ? 'Reset Password' : 'Verify & Continue') : 'Send Email OTP'}</button>
          {(patientAuthMethod === 'otp' || mode === 'forgot') && otpSent && <button className="patient-link-button" onClick={requestPatientOtp} type="button">Resend OTP</button>}
        </form>
      </div>
      {authSnackbar.message && (
        <div className={`patient-auth-snackbar ${authSnackbar.type}`} role="status" aria-live="polite">
          <i className={`fa-solid ${authSnackbar.type === 'success' ? 'fa-circle-check' : authSnackbar.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info'}`} aria-hidden="true" />
          <span>{authSnackbar.message}</span>
        </div>
      )}
    </section>
  );
}

