import React, { useState, useRef, useEffect } from 'react';
import medicalVideoSrc from '../../assets/new+website+video+desktop+(1).mp4';
import { API_BASE, MEDICAL_VIDEO } from '../../data/constants.js';

function renderFormattedAiMessage(text = '', isUser = false) {
  if (isUser) {
    return <span style={{ whiteSpace: 'pre-wrap', color: '#ffffff' }}>{text}</span>;
  }

  let processed = String(text || '');
  processed = processed.replace(/([^\n])\s+-\s+([A-Z0-9])/g, '$1\n- $2');

  const lines = processed.split('\n').map((l) => l.trim()).filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {lines.map((line, idx) => {
        const cleanLine = line.replace(/^#{1,6}\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim();
        const isBullet = /^[-•*]\s+/.test(cleanLine) || /^\d+[\.\)]\s+/.test(cleanLine);

        if (isBullet) {
          const bulletText = cleanLine.replace(/^[-•*]\s+/, '').replace(/^\d+[\.\)]\s+/, '');
          const isHospitalHeader = /Accreditation|Hospital|Speciality|Center|Clinic|Institute|Care/i.test(bulletText) && !bulletText.toLowerCase().includes('cost');

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'flex-start',
                margin: '2px 0',
                padding: isHospitalHeader ? '4px 8px' : '0',
                background: isHospitalHeader ? 'rgba(0, 102, 254, 0.04)' : 'transparent',
                borderRadius: '6px',
                borderLeft: isHospitalHeader ? '2.5px solid #0d2f5d' : 'none'
              }}
            >
              <span style={{ color: '#0d2f5d', fontWeight: 800, fontSize: '0.8rem', lineHeight: '1.4' }}>•</span>
              <span style={{ fontSize: '0.8rem', color: '#1e293b', lineHeight: '1.45', fontWeight: isHospitalHeader ? 700 : 500 }}>
                {bulletText}
              </span>
            </div>
          );
        }

        return (
          <p key={idx} style={{ margin: '2px 0', fontSize: '0.82rem', color: '#0f172a', lineHeight: '1.45' }}>
            {cleanLine}
          </p>
        );
      })}
    </div>
  );
}

export function Hero({ onFindCare, onSelectSearchOption, query, searchOptions, setQuery, setPage, setAiInitialMessage }) {
  const WELCOME = 'Tell me your treatment, city, or budget — I\'ll suggest the right hospital, doctor, and next steps.';
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const threadRef = React.useRef(null);

  React.useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = (text || inputVal).trim();
    if (!trimmed || loading) return;
    const userMsg = { role: 'user', content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInputVal('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: next.slice(-8) }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || 'No response. Try again.' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Start the API server to enable live AI responses.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(); };
  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <section className="hero-section">
      <video className="section-video-bg" autoPlay muted loop playsInline aria-hidden="true">
        <source src={MEDICAL_VIDEO} type="video/mp4" />
      </video>
      <div className="hero-overlay" aria-hidden="true" />

      {/* Left copy */}
      <div className="hero-copy">
        <div className="hero-tag">
          <i className="fa-solid fa-shield-heart" aria-hidden="true" />
          Patient-first medical travel
        </div>
        <h1>Plan Your Medical Journey <span>Across India</span></h1>
        <p>Compare verified hospitals, get specialist doctors, estimate costs in INR, and plan your complete travel — all in one place, at no extra cost.</p>
        <div className="hero-stats">
          <span><strong>1,00,000+</strong>Patients served</span>
          <span><strong>1,500+</strong>Hospital partners</span>
          <span><strong>4.8 ★</strong>Average rating</span>
        </div>
        <div className="hero-action-row">
          <button className="hero-btn-primary" onClick={() => setPage('planner')} type="button" style={{ background: '#0d2f5d', backgroundColor: '#0d2f5d', backgroundImage: 'none', borderColor: '#0d2f5d', color: '#ffffff', boxShadow: '0 4px 18px rgba(13, 47, 93, 0.4)' }}>
            <i className="fa-solid fa-route" aria-hidden="true" /> Plan My Journey
          </button>
          <button className="hero-btn-secondary" onClick={() => setPage('treatments')} type="button" style={{ background: '#0d2f5d', backgroundColor: '#0d2f5d', backgroundImage: 'none', borderColor: '#0d2f5d', color: '#ffffff', boxShadow: '0 4px 18px rgba(13, 47, 93, 0.4)' }}>
            Browse Treatments
          </button>
        </div>
      </div>

      {/* Right — inline AI chat card */}
      <div className="hero-visual ai-chat-card hero-chat-card">
        {/* Card header */}
        <div className="hcc-header" style={{ background: '#0d2f5d', backgroundColor: '#0d2f5d' }}>
          <div className="hcc-header-info">
            <strong className="hcc-title">
              <i className="fa-solid fa-robot" style={{ color: '#ffffff', marginRight: '6px' }} />
              Kaira AI Assistant
            </strong>
            <span className="hcc-online-text">
              <span className="hcc-dot" />
              Online · Kaira AI Care
            </span>
          </div>
          <button className="hcc-open-full-btn" type="button" onClick={() => setPage('ai-assistant')} title="Open full chat">
            <i className="fa-solid fa-up-right-from-square" aria-hidden="true" />
          </button>
        </div>

        {/* Message thread */}
        <div className="hcc-thread" ref={threadRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`hcc-bubble-row${msg.role === 'user' ? ' hcc-bubble-row-user' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="hcc-avatar-icon"><i className="fa-solid fa-robot" aria-hidden="true" /></div>
              )}
              <div className={`hcc-bubble${msg.role === 'user' ? ' hcc-bubble-user' : ''}`} style={msg.role === 'user' ? { background: '#0d2f5d', backgroundColor: '#0d2f5d' } : {}}>
                {renderFormattedAiMessage(msg.content, msg.role === 'user')}
              </div>
            </div>
          ))}
          {loading && (
            <div className="hcc-bubble-row">
              <div className="hcc-avatar-icon"><i className="fa-solid fa-robot" aria-hidden="true" /></div>
              <div className="hcc-bubble hcc-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form className="hcc-input-row" onSubmit={handleSubmit}>
          <div className="hcc-input-wrap">
            <input
              className="hcc-input"
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type your health question..."
              value={inputVal}
            />
          </div>
          <button className="hcc-send-btn" type="submit" aria-label="Send" disabled={loading} style={{ background: '#0d2f5d', backgroundColor: '#0d2f5d', backgroundImage: 'none', color: '#ffffff' }}>
            <i className="fa-solid fa-paper-plane" aria-hidden="true" style={{ color: '#ffffff' }} />
          </button>
        </form>
      </div>
    </section>
  );
}

