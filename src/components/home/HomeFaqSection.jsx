import React, { useState } from 'react';

const FAQS_DATA = [
  {
    category: 'hospital',
    question: 'How do I choose the best partner hospital for my treatment?',
    answer: 'Our medical desk evaluates your clinical diagnosis against 100+ JCI & NABH accredited partner hospitals. We match surgeon expertise, hospital success rates, bed availability, and patient budget to recommend the top 3 hospital options for your specific procedure.',
    badge: 'Hospital Selection'
  },
  {
    category: 'cost',
    question: 'Are there any hidden costs or extra charges in treatment estimations?',
    answer: 'No, absolutely none. Kairacure provides direct, transparent estimates that include the full hospital package, surgeon fees, OT charges, nursing, and room stay. Flight fares and medical hotel accommodations are calculated upfront in your journey planner with zero surprise charges.',
    badge: 'Price Guarantee'
  },
  {
    category: 'travel',
    question: 'Do you assist with medical visa invitation letters and airport pickup?',
    answer: 'Yes, 100% complimentary support. We coordinate with your selected partner hospital to issue official Medical Visa Invitation Letters (VIL) for the patient and attendants. Upon arrival, a dedicated Kairacure escort provides private airport pickup and transport to your hotel/hospital.',
    badge: 'Travel & Visa Desk'
  },
  {
    category: 'second-opinion',
    question: 'Can I get a free second opinion from senior specialists before traveling?',
    answer: 'Yes! You can upload your medical reports, MRI, CT scans, or doctor prescriptions. Our team shares them with senior department heads at top partner hospitals to provide a comprehensive second opinion and recommended line of treatment within 24-48 hours.',
    badge: 'Doctor Review'
  },
  {
    category: 'hotel',
    question: 'How are hotel accommodations and stay length managed during recovery?',
    answer: 'We partner with verified medical-friendly hotels located within 1-3 km of your hospital. These hotels feature wheelchair accessibility, doctor on call, patient diet kitchens, and elevator access. Your stay duration is customized based on post-operative recovery guidelines.',
    badge: 'Accommodation'
  },
  {
    category: 'support',
    question: 'What support is available if I require language interpretation or emergency help?',
    answer: 'Every patient is paired with a dedicated 24/7 Kairacure Care Manager fluent in English, Hindi, Arabic, Bengali, and French. Your care manager accompanies you during hospital consultations, translates clinical instructions, and manages emergency logistics round the clock.',
    badge: '24/7 Care Desk'
  }
];

export function HomeFaqSection() {
  const [openIndex, setOpenIndex] = useState(0); // Open 1st FAQ by default
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFaqs = FAQS_DATA.filter(faq => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'hospital') return faq.category === 'hospital' || faq.category === 'second-opinion';
    if (activeCategory === 'cost') return faq.category === 'cost';
    if (activeCategory === 'travel') return faq.category === 'travel' || faq.category === 'hotel';
    return true;
  });

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="home-faq-section-v2" style={{ padding: '60px 16px', background: '#f8fafc' }}>
      <style>{`
        .faq-container-card {
          max-width: 1380px;
          margin: 0 auto;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 24px;
          padding: 44px 48px;
          box-shadow: 0 10px 36px rgba(0, 102, 254, 0.05);
        }
        @media (max-width: 768px) {
          .faq-container-card {
            padding: 28px 20px;
          }
        }
        .faq-tab-btn {
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          transition: all 0.15s ease;
        }
        .faq-tab-btn.active {
          background: #0d2f5d;
          color: #ffffff;
          border-color: #0d2f5d;
          box-shadow: 0 2px 10px rgba(0, 102, 254, 0.25);
        }
        .faq-item-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          margin-bottom: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        .faq-item-card.is-open {
          border-color: #0d2f5d;
          box-shadow: 0 4px 20px rgba(0, 102, 254, 0.08);
        }
        .faq-question-btn {
          width: 100%;
          padding: 18px 22px;
          background: none;
          border: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          cursor: pointer;
          text-align: left;
          font-size: 1.02rem;
          font-weight: 700;
          color: #0f172a;
        }
        .faq-question-btn:hover {
          color: #0d2f5d;
        }
        .faq-answer-panel {
          padding: 0 22px 20px 60px;
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.6;
        }
        @media (max-width: 576px) {
          .faq-answer-panel {
            padding: 0 16px 16px 16px;
          }
        }
      `}</style>

      <div className="faq-container-card">
        
        {/* Header Badge & Title */}
        <div style={{ textAlignment: 'left', marginBottom: '32px' }}>
          <span 
            style={{
              display: 'inline-block',
              background: '#f0f7ff',
              color: '#0d2f5d',
              border: '1px solid #bfdbfe',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}
          >
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Kairacure FAQs &amp; Help Desk
          </h2>
          <p style={{ fontSize: '0.94rem', color: '#64748b', margin: 0, maxWidth: '720px', lineHeight: 1.5 }}>
            Quick answers about partner hospital accreditation, doctor second opinions, surgical package estimates, and international travel coordination.
          </p>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <button 
            type="button" 
            className={`faq-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Questions ({FAQS_DATA.length})
          </button>
          <button 
            type="button" 
            className={`faq-tab-btn ${activeCategory === 'hospital' ? 'active' : ''}`}
            onClick={() => setActiveCategory('hospital')}
          >
            Hospitals &amp; Doctors
          </button>
          <button 
            type="button" 
            className={`faq-tab-btn ${activeCategory === 'cost' ? 'active' : ''}`}
            onClick={() => setActiveCategory('cost')}
          >
            Costs &amp; Estimations
          </button>
          <button 
            type="button" 
            className={`faq-tab-btn ${activeCategory === 'travel' ? 'active' : ''}`}
            onClick={() => setActiveCategory('travel')}
          >
            Travel, Visa &amp; Hotel
          </button>
        </div>

        {/* FAQ Accordion List */}
        <div style={{ marginBottom: '32px' }}>
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className={`faq-item-card ${isOpen ? 'is-open' : ''}`}>
                <button 
                  type="button" 
                  className="faq-question-btn"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="faq-q-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isOpen ? '#0d2f5d' : '#f0f7ff',
                        color: isOpen ? '#ffffff' : '#0d2f5d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        flexShrink: 0,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <i className="bi bi-question-lg" />
                    </div>
                    <span style={{ fontSize: '0.96rem', lineHeight: 1.35 }}>{faq.question}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span 
                      className="faq-badge-tag"
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        display: 'inline-block'
                      }}
                    >
                      {faq.badge}
                    </span>
                    <i 
                      className="bi bi-chevron-down" 
                      style={{
                        fontSize: '1rem',
                        color: isOpen ? '#0d2f5d' : '#64748b',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }} 
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="faq-answer-panel">
                    <p style={{ margin: '0 0 12px' }}>{faq.answer}</p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        ✓ Verified Kairacure Guarantee
                      </span>
                      <span style={{ background: '#f0f7ff', border: '1px solid #dbeafe', color: '#0066fe', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        ✓ 24/7 Desk Assistance
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Footer Card */}
        <div 
          className="faq-still-questions-banner"
          style={{
            background: '#f0f7ff',
            border: '1.5px solid #bfdbfe',
            borderRadius: '16px',
            padding: '24px 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#0066fe', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
              <i className="bi bi-headset" />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '1.02rem', color: '#0f172a', marginBottom: '2px' }}>
                Still have questions about your medical journey?
              </strong>
              <span style={{ fontSize: '0.84rem', color: '#64748b', display: 'block', lineHeight: 1.4 }}>
                Our medical coordinators are available 24/7 to provide personalized guidance.
              </span>
            </div>
          </div>

          <div className="faq-still-questions-btn-wrap" style={{ display: 'flex', gap: '10px' }}>
            <a 
              href="https://wa.me/919999999999" 
              target="_blank" 
              rel="noreferrer"
              style={{
                background: '#22c55e',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)'
              }}
            >
              <i className="bi bi-whatsapp" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
