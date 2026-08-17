import React, { useState } from 'react';

const getApiBase = () => import.meta.env.VITE_API_BASE_URL || '/api';

export function AuthPage({ onPatientLogin, onPatientLogout, onPatientUpdate, onGoHome }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Processing...');
    try {
      const endpoint = mode === 'login' ? '/patients/login' : '/patients/register';
      const payload = mode === 'login' ? { email, password } : { name, email, password };

      const res = await fetch(`${getApiBase()}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      if (data.token && data.patient) {
        window.localStorage.setItem('KairacurePatientToken', data.token);
        window.localStorage.setItem('KairacurePatient', JSON.stringify(data.patient));
        onPatientLogin?.(data);
        onGoHome?.();
      } else {
        setStatus('Registered successfully! Please login.');
        setMode('login');
      }
    } catch (err) {
      setStatus(err.message || 'Authentication error');
    }
  };

  return (
    <section className="page-section auth-page" style={{ maxWidth: '480px', margin: '4rem auto', padding: '2rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(13,47,93,0.06)' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#0d2f5d', marginBottom: '0.5rem' }}>{mode === 'login' ? 'Patient Sign In' : 'Patient Registration'}</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Access your treatment plans, quotes, and medical records securely.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mode === 'register' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter full name" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>
        )}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="patient@example.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
        </div>

        {status && <div style={{ color: status.includes('success') ? '#16a34a' : '#dc2626', fontSize: '0.875rem' }}>{status}</div>}

        <button type="submit" style={{ padding: '0.75rem', background: '#0d2f5d', color: '#fff', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>
          {mode === 'login' ? 'Sign In' : 'Create Patient Account'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
        {mode === 'login' ? (
          <span>Don't have an account? <button onClick={() => setMode('register')} type="button" style={{ color: '#0d2f5d', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Register</button></span>
        ) : (
          <span>Already registered? <button onClick={() => setMode('login')} type="button" style={{ color: '#0d2f5d', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Sign In</button></span>
        )}
      </div>
    </section>
  );
}
