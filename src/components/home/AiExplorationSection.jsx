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
            <p>Compare treatment options, partner hospital fit, doctor availability, and appointment planning.</p>
          </article>
          <article>
            <div>
              <p>Share reports and get second-opinion next steps from the right partner hospital team.</p>
              <button onClick={() => setPage('ai-assistant')} type="button">Talk to Care Expert</button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
