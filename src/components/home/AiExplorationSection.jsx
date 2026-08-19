import React, { useState } from 'react';

export function AiExplorationSection({ setPage }) {
  const [phone, setPhone] = useState('');

  return (
    <section className="ai-exploration-section">
      <div className="ai-exploration-doctor">
        <img
          alt="Kairacure doctor assistant"
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=90"
        />
      </div>
      <div className="ai-exploration-content">
        <span>Care support</span>
        <h2>Plan Your Medical Journey</h2>
        <div className="ai-exploration-list">
          <article>
            <div className="explore-icon">
              <i className="fa-solid fa-notes-medical" aria-hidden="true" style={{ fontSize: '1.75rem', color: '#12b8aa' }} />
            </div>
            <p>Compare treatment options, partner hospital fit, doctor availability, and appointment planning.</p>
          </article>

          <article>
            <div className="explore-icon">
              <i className="fa-solid fa-user-doctor" aria-hidden="true" style={{ fontSize: '1.75rem', color: '#12b8aa' }} />
            </div>
            <div>
              <p>Share reports and get second-opinion next steps from the right partner hospital team.</p>
              <button onClick={() => setPage('ai-assistant')} type="button">Talk to Care Expert</button>
            </div>
          </article>

          <article>
            <div className="explore-icon">
              <i className="fa-solid fa-plane-departure" aria-hidden="true" style={{ fontSize: '1.75rem', color: '#12b8aa' }} />
            </div>
            <div>
              <p>Plan travel, budget, stay, and follow-up with one coordinated medical travel desk.</p>
              <form onSubmit={(e) => e.preventDefault()} style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="tel"
                  placeholder="Enter Mobile*"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#0d2f5d', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Notify me</button>
              </form>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
