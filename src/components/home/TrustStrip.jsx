import React from 'react';

export function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Trust and accreditation highlights">
      <MedicalVideoBackdrop />
      {TRUST_METRICS.map(([metric, label]) => (
        <article key={metric}>
          <strong>{metric}</strong>
          <span>{label}</span>
        </article>
      ))}
      <div className="trust-badges">
        {['ISO process', 'NABH/JCI network', 'IATA travel desk', 'Google review ready'].map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}
