import React, { useState, useMemo } from 'react';
import { API_BASE } from '../../data/constants.js';

const COUNTRY_CODES = [
  { code: '+91', country: 'India 🇮🇳' },
  { code: '+971', country: 'UAE 🇦🇪' },
  { code: '+966', country: 'Saudi Arabia 🇸🇦' },
  { code: '+968', country: 'Oman 🇴🇲' },
  { code: '+254', country: 'Kenya 🇰🇪' },
  { code: '+255', country: 'Tanzania 🇹ℤ' },
  { code: '+256', country: 'Uganda 🇺🇬' },
  { code: '+234', country: 'Nigeria 🇳🇬' },
  { code: '+880', country: 'Bangladesh 🇧🇩' },
  { code: '+977', country: 'Nepal 🇳🇵' },
  { code: '+94', country: 'Sri Lanka 🇱🇰' },
  { code: '+1', country: 'USA / Canada 🇺🇸' },
  { code: '+44', country: 'UK 🇬🇧' },
];

const MULTISPECIALTY_DEPARTMENTS = [
  'Cardiology & Heart Surgery',
  'Orthopedics & Joint Replacement',
  'Oncology & Cancer Care',
  'Organ Transplant (Liver / Kidney)',
  'Neurosurgery & Spine Care',
  'Gastroenterology & Hepatology',
  'IVF & Fertility Care',
  'Urology & Nephrology',
  'ENT & Head / Neck Surgery',
  'Cosmetic & Plastic Surgery',
  'General Consultation'
];

function isGenericSpecialty(spec = '') {
  const s = String(spec).toLowerCase().trim();
  return (
    !s ||
    s.includes('multispecial') ||
    s.includes('super specialty') ||
    s.includes('superspecial') ||
    s === 'hospital' ||
    s === 'multi specialty'
  );
}

function extractHospitalSpecialties(hospital) {
  const list = new Set();

  if (hospital?.specialty && typeof hospital.specialty === 'string') {
    const mainSpec = hospital.specialty.trim();
    if (!isGenericSpecialty(mainSpec)) {
      list.add(mainSpec);
    }
  }

  if (Array.isArray(hospital?.tags)) {
    hospital.tags.forEach((tag) => {
      if (typeof tag === 'string' && tag.trim() && !isGenericSpecialty(tag)) {
        list.add(tag.trim());
      }
    });
  }

  if (typeof hospital?.treatments === 'string') {
    hospital.treatments.split(',').forEach((t) => {
      if (t.trim() && !isGenericSpecialty(t)) list.add(t.trim());
    });
  } else if (Array.isArray(hospital?.treatments)) {
    hospital.treatments.forEach((t) => {
      const val = typeof t === 'string' ? t : t?.name || t?.title;
      if (val && val.trim() && !isGenericSpecialty(val)) list.add(val.trim());
    });
  }

  if (Array.isArray(hospital?.doctorsList)) {
    hospital.doctorsList.forEach((doc) => {
      if (doc?.specialty && typeof doc.specialty === 'string' && !isGenericSpecialty(doc.specialty)) {
        list.add(doc.specialty.trim());
      }
      if (doc?.department && typeof doc.department === 'string' && !isGenericSpecialty(doc.department)) {
        list.add(doc.department.trim());
      }
    });
  }

  const result = Array.from(list).filter(Boolean);

  if (result.length > 0) {
    if (!result.includes('General Consultation')) {
      result.push('General Consultation');
    }
    return result;
  }

  return MULTISPECIALTY_DEPARTMENTS;
}

export function BookAppointmentModal({ hospital, onClose, onSuccessNavigate }) {
  const hospitalName = hospital?.name || 'Selected Hospital';
  
  const specialtiesList = useMemo(() => extractHospitalSpecialties(hospital), [hospital]);

  const [formData, setFormData] = useState(() => ({
    name: '',
    countryCode: '+91',
    phone: '',
    email: '',
    specialty: specialtiesList[0] || 'General Consultation'
  }));

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setError('Please provide Name, Phone, and Email.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const fullPhone = `${formData.countryCode} ${formData.phone.trim()}`;
      const payload = {
        name: formData.name.trim(),
        phone: fullPhone,
        email: formData.email.trim(),
        specialty: formData.specialty,
        hospitalInterest: hospitalName,
        type: 'Hospital Appointment Lead',
        intent: 'appointment_booking',
        source: 'website_book_appointment_modal',
        timestamp: new Date().toISOString()
      };

      await fetch(`${API_BASE}/admin/partner-inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setSubmitted(true);
      setLoading(false);

      setTimeout(() => {
        onClose();
        if (onSuccessNavigate) {
          onSuccessNavigate(hospital);
        }
      }, 1000);

    } catch {
      setSubmitted(true);
      setLoading(false);
      setTimeout(() => {
        onClose();
        if (onSuccessNavigate) {
          onSuccessNavigate(hospital);
        }
      }, 1000);
    }
  };

  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '12px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '430px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          fontFamily: "'Noto Sans', sans-serif",
          boxSizing: 'border-box',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Compact Header */}
        <div style={{ background: '#0d2f5d', padding: '16px 20px', color: '#ffffff', position: 'relative' }}>
          <button 
            onClick={onClose} 
            type="button"
            aria-label="Close"
            style={{ 
              position: 'absolute', 
              top: '14px', 
              right: '14px', 
              background: 'rgba(255, 255, 255, 0.15)', 
              border: 'none', 
              color: '#ffffff', 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              cursor: 'pointer', 
              display: 'grid', 
              placeItems: 'center', 
              fontSize: '1rem',
              lineHeight: 1
            }}
          >
            ✕
          </button>
          
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
            {hospitalName}
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
            Book Doctor Appointment
          </h2>
        </div>

        {/* Compact Form Body (NO PARAGRAPHS) */}
        <div style={{ padding: '18px 20px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div style={{ width: '48px', height: '48px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '1.5rem', margin: '0 auto 10px' }}>
                ✓
              </div>
              <strong style={{ fontSize: '1.1rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                Request Submitted!
              </strong>
              <span style={{ fontSize: '0.82rem', color: '#0d2f5d', fontWeight: 700 }}>
                Redirecting to Doctor List...
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                  Full Name *
                </label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', height: '38px', padding: '0 10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Phone with Country Code */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                  Phone / WhatsApp *
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select 
                    name="countryCode" 
                    value={formData.countryCode} 
                    onChange={handleChange}
                    style={{ width: '120px', height: '38px', padding: '0 6px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.78rem', background: '#f8fafc', fontWeight: 600, outline: 'none' }}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} {c.country.split(' ')[0]}</option>
                    ))}
                  </select>
                  <input 
                    type="tel" 
                    name="phone"
                    placeholder="Mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    style={{ flex: 1, height: '38px', padding: '0 10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                  Email Address *
                </label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', height: '38px', padding: '0 10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Dynamic Specialty Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                  Select Department / Specialty
                </label>
                <select 
                  name="specialty" 
                  value={formData.specialty} 
                  onChange={handleChange}
                  style={{ width: '100%', height: '38px', padding: '0 10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.82rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                >
                  {specialtiesList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                style={{
                  height: '42px',
                  background: '#0d2f5d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(13, 47, 93, 0.25)',
                  marginTop: '4px'
                }}
              >
                {loading ? 'Submitting...' : 'Submit & Select Doctor →'}
              </button>

              {/* Minimal Trust Badges */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                <span>🔒 Confidential</span>
                <span>• Free Second Opinion</span>
                <span>• Zero Fee</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
