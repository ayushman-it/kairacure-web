import React, { useState, useEffect, useRef } from 'react';

const getApiBase = () => import.meta.env.VITE_API_BASE_URL || '/api';

export function AiAssistantPage({ setPage, initialMessage = '' }) {
  const WELCOME = 'Welcome to Kairacure AI. Tell me your treatment, diagnosis, preferred Indian city, reports summary, budget in INR, or travel month. I will suggest hospitals, doctors, approximate INR packages, and your next steps.';

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }]);
  const [loading, setLoading] = useState(false);
  const threadRef = useRef(null);

  const quickPrompts = [
    'Find cardiac hospitals in Delhi NCR under INR 3 lakhs',
    'I need knee replacement — what is the cost and recovery time?',
    'What reports should I share for a second opinion?',
    'Compare partner hospitals for orthopedic surgery',
  ];

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = (text || question).trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch(`${getApiBase()}/ai-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || 'Thank you for reaching out. Our medical coordinator will contact you shortly.' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Our AI Assistant is currently processing. You can also request a call back directly from our care team.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section ai-assistant-page" style={{ maxWidth: '900px', margin: '2rem auto', padding: '1.5rem' }}>
      <div className="section-heading" style={{ textAlign: 'center' }}>
        <h2>Kairacure <span>AI Medical Assistant</span></h2>
        <p>Instant answers on treatments, estimated package costs, partner hospitals, and visa requirements.</p>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 14px rgba(13,47,93,0.06)' }}>
        <div ref={threadRef} style={{ height: '420px', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '1rem', borderRadius: '12px', background: m.role === 'user' ? '#0d2f5d' : '#f1f5f9', color: m.role === 'user' ? '#fff' : '#0f172a' }}>
              {m.content}
            </div>
          ))}
          {loading && <div style={{ color: '#64748b', fontStyle: 'italic' }}>AI is thinking...</div>}
        </div>

        <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            {quickPrompts.map((p, i) => (
              <button key={i} onClick={() => sendMessage(p)} type="button" style={{ padding: '0.4rem 0.8rem', fontSize: '0.825rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '20px', cursor: 'pointer' }}>
                {p}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about treatments, costs, partner hospitals..."
              style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
            <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#0d2f5d', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
