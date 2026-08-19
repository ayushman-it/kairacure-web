import React, { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../data/constants.js';

export function AiAssistantPage({ setPage, initialMessage = '' }) {
  const WELCOME = 'Welcome to Kairacure AI. Tell me your treatment, diagnosis, preferred Indian city, reports summary, budget in INR, or travel month. I will suggest hospitals, doctors, approximate INR packages, and your next steps. You can write in Hindi, English, or Hinglish — I will reply in the same language.';

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }]);
  const [loading, setLoading] = useState(false);
  const threadRef = React.useRef(null);

  const quickPrompts = [
    'मुझे heart bypass surgery के लिए India में best hospitals बताओ',
    'Find orthopedic hospitals in Delhi NCR under INR 3 lakhs',
    'I need knee replacement — what is the cost and recovery time?',
    'I am a doctor and want to partner with Kairacure',
    'What reports should I share for a second opinion?',
    'Compare Apollo Delhi vs Fortis for cardiac surgery',
  ];

  // Auto-scroll to bottom on new message
  React.useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Auto-send initialMessage if passed from hero card
  React.useEffect(() => {
    if (initialMessage && initialMessage.trim()) {
      setQuestion(initialMessage.trim());
      // Slight delay so component has mounted
      setTimeout(() => {
        sendMessage(initialMessage.trim());
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          history: nextMessages.slice(-10), // send last 10 for context
        }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || 'I could not generate a response right now.' }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'The AI backend is not running. Start the Express API server and set OPENROUTER_API_KEY in .env to enable live responses.',
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
                {msg.content.split('\n').filter((l) => l.trim()).map((line, li) => (
                  <p key={li}>{line}</p>
                ))}
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

