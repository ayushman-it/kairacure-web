import React, { useState } from 'react';
import { API_BASE, getPatientAttribution } from '../../data/constants.js';

export function CallBackForm({ selectedHospital }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    countryCode: '+91',
    preferredTime: '',
  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    'Now (within 30 minutes)',
    'Morning (9 AM - 12 PM)',
    'Afternoon (12 PM - 6 PM)',
    'Evening (6 PM - 9 PM)',
  ];

  const submitCallback = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setStatus('Please enter your name and phone number.');
      return;
    }

    setIsSubmitting(true);
    setStatus('Requesting callback...');

    try {
      const response = await fetch(`${API_BASE}/admin/public-appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...getPatientAttribution(),
          patientName: form.name,
          phone: `${form.countryCode} ${form.phone}`,
          country: 'India',
          city: selectedHospital?.city || '',
          treatment: 'Callback Request',
          hospital: selectedHospital?.name || '',
          doctor: selectedHospital?.doctor || '',
          mode: 'Get a Call Back',
          notes: `Preferred time: ${form.preferredTime || 'Any time'}`,
          source: 'callback-form',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Request failed');

      setStatus('✅ Callback requested! We\'ll call you soon.');
      setForm({ name: '', phone: '', countryCode: '+91', preferredTime: '' });
    } catch (error) {
      setStatus(`❌ ${error.message || 'Unable to request callback.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="callback-form" onSubmit={submitCallback}>
      <div className="callback-form-content">
        <div className="form-group">
          <label htmlFor="callback-name">Your Name *</label>
          <input
            id="callback-name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="callback-phone">Phone Number *</label>
          <div className="phone-input-group">
            <select
              className="country-code"
              value={form.countryCode}
              onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
            >
              <option value="+91">🇮🇳 +91</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+971">🇦🇪 +971</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+61">🇦🇺 +61</option>
            </select>
            <input
              id="callback-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Your phone number"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="callback-time">Preferred Call Time</label>
          <select
            id="callback-time"
            value={form.preferredTime}
            onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
          >
            <option value="">Select preferred time</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>

        {selectedHospital && (
          <div className="hospital-info-card">
            <h4>
              <i className="fa-solid fa-hospital" aria-hidden="true" />
              {selectedHospital.name}
            </h4>
            <p>
              <i className="fa-solid fa-location-dot" aria-hidden="true" />
              {selectedHospital.city}
            </p>
          </div>
        )}

        {status && (
          <div className={`status-message ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : 'info'}`}>
            {status}
          </div>
        )}

        <button
          type="submit"
          className="callback-submit-btn"
          disabled={isSubmitting}
          style={{
            background: '#0d2f5d',
            backgroundColor: '#0d2f5d',
            backgroundImage: 'none',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            boxShadow: '0 4px 14px rgba(13, 47, 93, 0.3)'
          }}
        >
          {isSubmitting ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
              Requesting...
            </>
          ) : (
            <>
              <i className="fa-solid fa-phone" aria-hidden="true" />
              Get Call Back
            </>
          )}
        </button>
      </div>
    </form>
  );
}
