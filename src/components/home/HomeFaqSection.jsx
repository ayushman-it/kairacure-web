import React from 'react';

const DEFAULT_FAQS = [
  { question: 'How do I choose the best partner hospital for my treatment?', answer: 'Our medical coordinators match your specific diagnosis with NABH/JCI accredited partner hospitals and specialist surgeons.' },
  { question: 'Are there any hidden costs in treatment estimations?', answer: 'No. We provide transparent starting estimates covering hospital package, stay, and care support with no hidden charges.' },
  { question: 'Do you assist with medical visa invitations and airport pickup?', answer: 'Yes. Kairacure provides full complimentary support for medical visa invitation letters, airport pickup, and dedicated case managers.' },
];

export function HomeFaqSection() {
  return (
    <section className="home-faq-section" aria-label="Kairacure platform frequently asked questions">
      <div className="section-heading">
        <div>
          <h2>Kairacure FAQs</h2>
          <p>Quick answers about partner hospitals, doctors, treatment cost, appointments, and medical travel support.</p>
        </div>
      </div>
      <div className="home-faq-grid">
        {DEFAULT_FAQS.map((faq, index) => (
          <details key={index}>
            <summary><i className="fa-solid fa-circle-question" aria-hidden="true" /> {faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
