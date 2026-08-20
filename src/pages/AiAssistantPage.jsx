import React, { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../data/constants.js';

const WELCOME = 'Welcome to Kairacure AI. Tell me your treatment, diagnosis, preferred Indian city, reports summary, budget in INR, or travel month. I will suggest hospitals, doctors, approximate INR packages, and your next steps. You can write in Hindi, English, or Hinglish — I will reply in the same language.';

export function AiAssistantPage({ setPage, initialMessage }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }]);
  const [loading, setLoading] = useState(false);
  const threadRef = useRef(null);

  const quickPrompts = [
    'मुझे heart bypass surgery के लिए India में best hospitals बताओ',
    'Find orthopedic hospitals in Delhi NCR under INR 3 lakhs',
    'I need knee replacement — what is the cost and recovery time?',
    'I am a doctor and want to partner with Kairacure',
    'What reports should I share for a second opinion?',
    'Compare Apollo Delhi vs Fortis for cardiac surgery',
  ];

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Auto-send initialMessage if passed from hero card
  useEffect(() => {
    if (initialMessage && initialMessage.trim()) {
      setQuestion(initialMessage.trim());
      setTimeout(() => {
        sendMessage(initialMessage.trim());
      }, 300);
    }
  }, []);

  const sendMessage = async (text) => {
    const trimmed = (text || question).trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/ai-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages.slice(-10),
        }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || 'I could not generate a response right now.' }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'The AI backend is currently offline. Please ensure the Express server is running.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const resetChat = () => {
    setMessages([{ role: 'assistant', content: WELCOME }]);
    setQuestion('');
  };

  return (
    <section className="ai-assistant-page">
      {/* ── Sidebar ── */}
      <aside className="ai-chat-sidebar">
        <div className="ai-chat-brand">
          <img
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80"
            alt="Kaira AI"
            className="ai-brand-avatar"
          />
          <div>
            <strong>Kaira AI</strong>
            <small>Medical Travel Assistant</small>
          </div>
        </div>

        <button className="new-chat-button" onClick={resetChat} type="button">
          <i className="fa-solid fa-plus" aria-hidden="true" /> New chat
        </button>

        <div className="ai-chat-history">
          <p className="ai-history-label">Quick topics</p>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="ai-history-item"
              onClick={() => { setQuestion(prompt); sendMessage(prompt); }}
            >
              <i className="fa-solid fa-comment-dots" aria-hidden="true" />
              <span>{prompt.length > 38 ? `${prompt.slice(0, 36)}…` : prompt}</span>
            </button>
          ))}
        </div>

        <div className="ai-sidebar-footer">
          <button className="ai-back-link" onClick={() => setPage('home')} type="button">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to website
          </button>
          <p className="ai-sidebar-brand-note">Powered by Kaira AI · care@kairacure.com</p>
        </div>
      </aside>

      {/* ── Chat Workspace ── */}
      <main className="ai-chat-workspace">
        {/* Top bar */}
        <div className="ai-chat-topbar">
          <div className="ai-topbar-info">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80"
              alt="Kairacure AI"
            />
            <div>
              <strong>Kairacure Medical AI</strong>
              <span className="ai-online-badge">
                <span className="ai-online-dot" aria-hidden="true" />
                Online
              </span>
            </div>
          </div>
          <button className="ai-topbar-back" onClick={() => setPage('home')} type="button">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        {/* Thread */}
        <div className="ai-chat-thread" ref={threadRef}>
          {messages.map((msg, i) => (
            <article
              key={`${msg.role}-${i}`}
              className={msg.role === 'user' ? 'ai-bubble-row user' : 'ai-bubble-row assistant'}
            >
              {msg.role === 'assistant' && (
                <img
                  alt="Kairacure AI"
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80"
                />
              )}
              <div className="ai-bubble">
                {msg.role === 'user' ? (
                  <span style={{ whiteSpace: 'pre-wrap', color: '#ffffff' }}>{msg.content}</span>
                ) : (
                  (() => {
                    let processed = String(msg.content || '');
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
                                  gap: '8px',
                                  alignItems: 'flex-start',
                                  margin: '3px 0',
                                  padding: isHospitalHeader ? '6px 10px' : '0',
                                  background: isHospitalHeader ? 'rgba(0, 102, 254, 0.05)' : 'transparent',
                                  borderRadius: '8px',
                                  borderLeft: isHospitalHeader ? '3px solid #0066fe' : 'none'
                                }}
                              >
                                <span style={{ color: '#0066fe', fontWeight: 800, fontSize: '0.9rem', lineHeight: '1.4' }}>•</span>
                                <span style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: '1.5', fontWeight: isHospitalHeader ? 700 : 500 }}>
                                  {bulletText}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <p key={idx} style={{ margin: '3px 0', fontSize: '0.88rem', color: '#0f172a', lineHeight: '1.5' }}>
                              {cleanLine}
                            </p>
                          );
                        })}
                      </div>
                    );
                  })()
                )}
                <small>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
              </div>
            </article>
          ))}

          {loading && (
            <article className="ai-bubble-row assistant">
              <img alt="Kairacure AI thinking" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80" />
              <div className="ai-bubble ai-thinking">
                <span /><span /><span />
              </div>
            </article>
          )}
        </div>

        {/* Quick prompt chips — only show when thread is just the welcome message */}
        {messages.length === 1 && (
          <div className="ai-quick-prompts">
            {quickPrompts.slice(0, 4).map((prompt) => (
              <button
                key={prompt}
                onClick={() => { setQuestion(prompt); sendMessage(prompt); }}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form className="ai-chat-composer" onSubmit={handleSubmit}>
          <input
            autoFocus
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about treatment, hospitals, cost, travel..."
            value={question}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <button disabled={loading || !question.trim()} type="submit">
            <i className="fa-solid fa-paper-plane" aria-hidden="true" />
          </button>
        </form>

        <p className="ai-disclaimer">
          <i className="fa-solid fa-circle-info" aria-hidden="true" />
          General medical travel guidance only — not a substitute for professional medical advice.
        </p>
      </main>
    </section>
  );
}
