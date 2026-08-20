import React from 'react';

const SPECIALTIES_DATA = [
  {
    key: 'orthopedics',
    title: 'Orthopedics',
    subtitle: 'Joint Replacement & Spine',
    iconClass: 'fa-solid fa-bone',
    iconBg: '#eff6ff',
    iconColor: '#0066fe',
    count: '120+ Procedures',
    startingPrice: 'From ₹1.8L'
  },
  {
    key: 'cardiac',
    title: 'Cardiac Surgery',
    subtitle: 'CABG, Valve & Angioplasty',
    iconClass: 'fa-solid fa-heart-pulse',
    iconBg: '#fef2f2',
    iconColor: '#ef4444',
    count: '95+ Procedures',
    startingPrice: 'From ₹2.4L'
  },
  {
    key: 'gastroenterology',
    title: 'Gastroenterology',
    subtitle: 'GI Surgery & Endoscopy',
    iconClass: 'fa-solid fa-stethoscope',
    iconBg: '#ecfdf5',
    iconColor: '#10b981',
    count: '80+ Procedures',
    startingPrice: 'From ₹1.2L'
  },
  {
    key: 'urology',
    title: 'Urology',
    subtitle: 'Kidney Stone & Prostate',
    iconClass: 'fa-solid fa-hand-holding-medical',
    iconBg: '#f0f9ff',
    iconColor: '#0284c7',
    count: '75+ Procedures',
    startingPrice: 'From ₹95k'
  },
  {
    key: 'infertility',
    title: 'Infertility & IVF',
    subtitle: 'IVF, IUI & Fertility Care',
    iconClass: 'fa-solid fa-baby',
    iconBg: '#fdf2f8',
    iconColor: '#ec4899',
    count: '50+ Procedures',
    startingPrice: 'From ₹1.5L'
  },
  {
    key: 'ent',
    title: 'Ear, Nose, Throat',
    subtitle: 'ENT Surgery & Sinus',
    iconClass: 'fa-solid fa-head-side-cough',
    iconBg: '#f5f3ff',
    iconColor: '#8b5cf6',
    count: '65+ Procedures',
    startingPrice: 'From ₹65k'
  },
  {
    key: 'oncology',
    title: 'Oncology Care',
    subtitle: 'Chemo, Tumor & Onco Surgery',
    iconClass: 'fa-solid fa-ribbon',
    iconBg: '#fffbeb',
    iconColor: '#f59e0b',
    count: '110+ Procedures',
    startingPrice: 'From ₹2.8L'
  },
  {
    key: 'neuro',
    title: 'Spine & Neuro',
    subtitle: 'Brain & Disc Surgery',
    iconClass: 'fa-solid fa-brain',
    iconBg: '#ecfeff',
    iconColor: '#06b6d4',
    count: '85+ Procedures',
    startingPrice: 'From ₹2.2L'
  }
];

export function HomeTreatmentBanners({ setPage, setActiveGroup, setSelectedTreatment, treatments = [] }) {

  const handleClick = (item) => {
    const matchedTreatment = treatments.find((t) => {
      const g = (t.group || t.category || t.title || '').toLowerCase();
      return g.includes(item.key) || item.title.toLowerCase().includes(g);
    });

    if (matchedTreatment && setSelectedTreatment) {
      setSelectedTreatment(matchedTreatment);
      setPage('treatment-detail');
    } else {
      if (setPage) setPage('planner');
    }
  };

  return (
    <section className="home-treatment-banners-v2" style={{ padding: '60px 16px', background: '#f8fafc' }}>
      <style>{`
        .treatment-card-container {
          max-width: 1380px;
          margin: 0 auto;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 24px;
          padding: 44px 48px;
          box-shadow: 0 10px 36px rgba(0, 102, 254, 0.05);
        }
        @media (max-width: 768px) {
          .treatment-card-container {
            padding: 28px 20px;
          }
        }
        .treatment-specialty-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }
        @media (max-width: 1100px) {
          .treatment-specialty-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 576px) {
          .treatment-specialty-grid {
            grid-template-columns: 1fr;
          }
        }
        .specialty-interactive-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 22px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .specialty-interactive-card:hover {
          border-color: #0066fe;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 102, 254, 0.12);
        }
        .specialty-arrow-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          margin-left: auto;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .specialty-interactive-card:hover .specialty-arrow-btn {
          background: #0066fe;
          color: #ffffff;
          transform: translateX(3px);
        }
      `}</style>

      <div className="treatment-card-container">
        
        {/* Header Badge & Title */}
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span 
              style={{
                display: 'inline-block',
                background: '#f0f7ff',
                color: '#0066fe',
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
              EXPLORE MEDICAL SPECIALTIES
            </span>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Find Your Treatment
            </h2>
            <p style={{ fontSize: '0.94rem', color: '#64748b', margin: 0, maxWidth: '680px', lineHeight: 1.5 }}>
              Browse surgical procedures by medical specialty, compare accredited hospital packages, starting prices, and top surgeon availability.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPage && setPage('planner')}
            style={{
              background: '#0066fe',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(0, 102, 254, 0.22)'
            }}
          >
            <i className="bi bi-grid-fill" style={{ color: '#ffffff' }} />
            <span>View All Surgeries</span>
          </button>
        </div>

        {/* 8 Specialty Cards Grid */}
        <div className="treatment-specialty-grid">
          {SPECIALTIES_DATA.map((item) => (
            <button
              key={item.key}
              type="button"
              className="specialty-interactive-card"
              onClick={() => handleClick(item)}
            >
              {/* Icon Badge */}
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: item.iconBg,
                  color: item.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.35rem',
                  flexShrink: 0
                }}
              >
                <i className={item.iconClass} />
              </div>

              {/* Text Info */}
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '0.98rem', color: '#0f172a', marginBottom: '2px', fontWeight: 700 }}>
                  {item.title}
                </strong>
                <span style={{ display: 'block', fontSize: '0.76rem', color: '#64748b', marginBottom: '6px' }}>
                  {item.subtitle}
                </span>
                <span 
                  style={{
                    background: '#f0f7ff',
                    color: '#0066fe',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    display: 'inline-block'
                  }}
                >
                  {item.startingPrice}
                </span>
              </div>

              {/* Action Arrow */}
              <div className="specialty-arrow-btn">
                <i className="bi bi-arrow-right" />
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Banner */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #0066fe 0%, #0046b8 100%)',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 20px rgba(0, 102, 254, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '1.6rem' }}>🩺</span>
            <div>
              <strong style={{ display: 'block', fontSize: '1rem', fontWeight: 700 }}>Can't find your specific surgical procedure?</strong>
              <span style={{ fontSize: '0.82rem', color: '#dbeafe', opacity: 0.95 }}>Search our complete clinical directory of 250+ surgical treatments and ICD-11 procedures.</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPage && setPage('planner')}
            style={{
              background: '#ffffff',
              color: '#0066fe',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <span>Search Treatment Directory</span>
            <i className="bi bi-arrow-right" />
          </button>
        </div>

      </div>
    </section>
  );
}
