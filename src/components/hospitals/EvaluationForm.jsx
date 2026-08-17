import React, { useState } from 'react';
import { API_BASE, BRAND_NAME } from '../../data/constants.js';

export function EvaluationForm({ title = 'Schedule Appointment', buttonLabel = 'Request Appointment', selectedHospital }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I would like to get more information about medical treatments and cost estimates.'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const { name, phone, message } = form;
    if (!name.trim() || !phone.trim()) {
      setSubmitError('Please fill in name and phone number');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch(`${API_BASE}/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: form.email.trim() || undefined,
          phone: phone.trim(),
          message: message.trim(),
          intent: 'patient'
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setForm({ name: '', email: '', phone: '', message: 'I would like to get more information about medical treatments and cost estimates.' });
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        throw new Error('Failed to submit form');
      }
    } catch {
      setSubmitError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="simple-evaluation-form success">
        <div className="success-header">
          <i className="fa-solid fa-check-circle" aria-hidden="true" />
          <h3>Request Submitted!</h3>
          <p>Our team will call you within 24 hours.</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setSubmitSuccess(false)}
          type="button"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form className="simple-evaluation-form" onSubmit={handleSubmit}>
      {title && (
        <div className="form-header">
          <h3>{title}</h3>
          <p>Get consultation and appointment support within 24 hours</p>
        </div>
      )}

      {submitError && (
        <div className="error-message">
          <i className="fa-solid fa-exclamation-triangle" aria-hidden="true" />
          {submitError}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="lead-name">Full Name *</label>
        <input
          id="lead-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleInputChange}
          placeholder="Enter patient's full name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="lead-email">Email Address</label>
        <input
          id="lead-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleInputChange}
          placeholder="your@email.com (optional)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="lead-phone">Phone Number *</label>
        <input
          id="lead-phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleInputChange}
          placeholder="+91 9999999999"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="lead-message">Message</label>
        <textarea
          id="lead-message"
          name="message"
          value={form.message}
          onChange={handleInputChange}
          placeholder="Tell us about your medical needs..."
          rows="3"
        />
      </div>

      <button
        type="submit"
        className="submit-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
            Submitting...
          </>
        ) : (
          <>
            <i className="fa-solid fa-phone" aria-hidden="true" />
            {buttonLabel}
          </>
        )}
      </button>
    </form>
  );
}
