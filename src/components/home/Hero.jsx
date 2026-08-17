import React, { useState, useRef, useEffect } from 'react';
import medicalVideoSrc from '../../assets/new+website+video+desktop+(1).mp4';
import { API_BASE, MEDICAL_VIDEO } from '../../data/constants.js';

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
          <button className="hero-btn-primary" onClick={() => setPage('planner')} type="button">
            <i className="fa-solid fa-route" aria-hidden="true" /> Plan My Journey
          </button>
          <button className="hero-btn-secondary" onClick={() => setPage('treatments')} type="button">
            Browse Treatments
          </button>
        </div>
      </div>

      {/* Right — inline AI chat card */}
      <div className="hero-visual ai-chat-card hero-chat-card">
        {/* Card header */}
        <div className="hcc-header">
          <div>
            <strong className="hcc-title">Kaira Assistant</strong>
            <span className="hcc-online"><span className="hcc-dot" />Online · Kaira AI</span>
          </div>
          <button className="hcc-badge hcc-open-full-btn" type="button" onClick={() => setPage('ai-assistant')} title="Open full chat">
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
              <div className={`hcc-bubble${msg.role === 'user' ? ' hcc-bubble-user' : ''}`}>
                {msg.content}
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

        {/* Quick chips — show only if just welcome message */}
        {messages.length === 1 && (
          <div className="hcc-chips">
            <button onClick={() => sendMessage('Best hospitals for heart surgery')} type="button">
              <i className="fa-solid fa-heart-pulse" aria-hidden="true" /> Heart Surgery
            </button>
            <button onClick={() => sendMessage('Knee replacement cost in Delhi')} type="button">
              <i className="fa-solid fa-bone" aria-hidden="true" /> Knee Replacement
            </button>
            <button onClick={() => sendMessage('What reports should I upload?')} type="button">
              <i className="fa-solid fa-file-medical" aria-hidden="true" /> My Reports
            </button>
          </div>
        )}

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
          <button className="hcc-send-btn" type="submit" aria-label="Send" disabled={loading}>
            <i className="fa-solid fa-paper-plane" aria-hidden="true" />
          </button>
        </form>

        <p className="hcc-disclaimer">Kaira AI — please double-check all responses</p>
      </div>
    </section>
  );
}

