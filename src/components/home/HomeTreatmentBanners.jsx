import React, { useMemo } from 'react';

const BASE_SPECIALTIES = [
  {
    key: 'orthopedics',
    title: 'Orthopedics',
    defaultSubtitle: 'Joint Replacement & Spine',
    iconClass: 'bi bi-person-fill-gear',
    iconBg: '#eff6ff',
    iconColor: '#0066fe',
    defaultCount: '120+ Procedures',
    defaultPrice: 'From ₹1.8L'
  },
  {
    key: 'cardiac',
    title: 'Cardiac Surgery',
    defaultSubtitle: 'CABG, Valve & Angioplasty',
    iconClass: 'bi bi-heart-pulse-fill',
    iconBg: '#fef2f2',
    iconColor: '#ef4444',
    defaultCount: '95+ Procedures',
    defaultPrice: 'From ₹2.4L'
  },
  {
    key: 'gastroenterology',
    title: 'Gastroenterology',
    defaultSubtitle: 'GI Surgery & Endoscopy',
    iconClass: 'bi bi-stethoscope',
    iconBg: '#ecfdf5',
    iconColor: '#10b981',
    defaultCount: '80+ Procedures',
    defaultPrice: 'From ₹1.2L'
  },
  {
    key: 'urology',
    title: 'Urology',
    defaultSubtitle: 'Kidney Stone & Prostate',
    iconClass: 'bi bi-shield-plus',
    iconBg: '#f0f9ff',
    iconColor: '#0284c7',
    defaultCount: '75+ Procedures',
    defaultPrice: 'From ₹95k'
  },
  {
    key: 'infertility',
    title: 'Infertility & IVF',
    defaultSubtitle: 'IVF, IUI & Fertility Care',
    iconClass: 'bi bi-heart-fill',
    iconBg: '#fdf2f8',
    iconColor: '#ec4899',
    defaultCount: '50+ Procedures',
    defaultPrice: 'From ₹1.5L'
  },
  {
    key: 'ent',
    title: 'Ear, Nose, Throat',
    defaultSubtitle: 'ENT Surgery & Sinus',
    iconClass: 'bi bi-person-badge',
    iconBg: '#f5f3ff',
    iconColor: '#8b5cf6',
    defaultCount: '65+ Procedures',
    defaultPrice: 'From ₹65k'
  },
  {
    key: 'oncology',
    title: 'Oncology Care',
    defaultSubtitle: 'Chemo, Tumor & Onco Surgery',
    iconClass: 'bi bi-award-fill',
    iconBg: '#fffbeb',
    iconColor: '#f59e0b',
    defaultCount: '110+ Procedures',
    defaultPrice: 'From ₹2.8L'
  },
  {
    key: 'neuro',
    title: 'Spine & Neuro',
    defaultSubtitle: 'Brain & Disc Surgery',
    iconClass: 'bi bi-cpu-fill',
    iconBg: '#ecfeff',
    iconColor: '#06b6d4',
    defaultCount: '85+ Procedures',
    defaultPrice: 'From ₹2.2L'
  }
];

export function HomeTreatmentBanners({ setPage, setActiveGroup, setSelectedTreatment, treatments = [] }) {
  // Compute dynamic starting prices, procedure counts, and subtitles live from database treatments array
  const dynamicSpecialties = useMemo(() => {
    return BASE_SPECIALTIES.map((base) => {
      const matched = treatments.filter((t) => {
        const cat = (t.category || t.group || t.title || '').toLowerCase();
        const key = base.key.toLowerCase();
        const title = base.title.toLowerCase();
        return (
          cat.includes(key) ||
          title.includes(cat) ||
          (key === 'cardiac' && (cat.includes('heart') || cat.includes('cabg'))) ||
          (key === 'neuro' && (cat.includes('brain') || cat.includes('spine'))) ||
          (key === 'orthopedics' && (cat.includes('joint') || cat.includes('knee'))) ||
          (key === 'infertility' && cat.includes('ivf'))
        );
      });

      let startingPrice = base.defaultPrice;
      if (matched.length > 0) {
        const costs = matched
          .map((t) => Number(t.costInr || t.startingPriceInr || t.priceInr || t.cost || 0))
          .filter((c) => c > 0);
        if (costs.length > 0) {
          const minCost = Math.min(...costs);
          if (minCost >= 100000) {
            startingPrice = `From ₹${(minCost / 100000).toFixed(1)}L`;
          } else if (minCost >= 1000) {
            startingPrice = `From ₹${Math.round(minCost / 1000)}k`;
          } else {
            startingPrice = `From ₹${minCost.toLocaleString('en-IN')}`;
          }
        }
      }

      const countText = matched.length > 0 ? `${matched.length}+ Procedures` : base.defaultCount;

      let subtitle = base.defaultSubtitle;
      if (matched.length > 0) {
        const titles = matched.map((t) => t.title || t.name).filter(Boolean).slice(0, 2);
        if (titles.length > 0) {
          subtitle = titles.join(' & ');
        }
      }

      return {
        ...base,
        startingPrice,
        count: countText,
        subtitle
      };
    });
  }, [treatments]);

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
    <section className="home-treatment-banners-v2" style={{ padding: '40px 16px', background: '#f8fafc', fontFamily: "'Noto Sans', sans-serif" }}>
      <style>{`
        .treatment-card-container {
          max-width: 1240px;
          margin: 0 auto;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 20px;
          padding: 36px 32px;
          box-shadow: 0 8px 30px rgba(0, 102, 254, 0.05);
        }
        @media (max-width: 768px) {
          .treatment-card-container {
            padding: 16px 12px !important;
            border-radius: 16px !important;
          }
          .treatment-specialty-grid {
            gap: 10px !important;
            margin-bottom: 20px !important;
          }
          .specialty-interactive-card {
            padding: 14px 12px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
        }
        .treatment-specialty-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
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
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 14px;
          display: flex;
          align-items: center;
          gap: 14px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          width: 100%;
          box-sizing: border-box;
        }
        .specialty-interactive-card:hover {
          border-color: #0066fe;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 102, 254, 0.12);
        }
        .specialty-arrow-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
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
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <span 
              style={{
                display: 'inline-block',
                background: '#f0f7ff',
                color: '#0066fe',
                border: '1px solid #bfdbfe',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}
            >
              EXPLORE MEDICAL SPECIALTIES
            </span>
            <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.8rem)', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              Find Your Treatment
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, maxWidth: '680px', lineHeight: 1.5 }}>
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
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '38px',
              boxShadow: '0 3px 10px rgba(0, 102, 254, 0.22)'
            }}
          >
            <i className="bi bi-grid-fill" style={{ color: '#ffffff' }} />
            <span>View All Surgeries</span>
          </button>
        </div>

        {/* 8 Specialty Cards Grid */}
        <div className="treatment-specialty-grid">
          {dynamicSpecialties.map((item) => (
            <button
              key={item.key}
              type="button"
              className="specialty-interactive-card"
              onClick={() => handleClick(item)}
            >
              {/* Icon Badge */}
              <div 
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: item.iconBg,
                  color: item.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  flexShrink: 0
                }}
              >
                <i className={item.iconClass} />
              </div>

              {/* Text Info */}
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0f172a', marginBottom: '2px', fontWeight: 800 }}>
                  {item.title}
                </strong>
                <span style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', marginBottom: '4px' }}>
                  {item.subtitle}
                </span>
                <span 
                  style={{
                    background: '#f0f7ff',
                    color: '#0066fe',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
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
            borderRadius: '14px',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            boxShadow: '0 4px 18px rgba(0, 102, 254, 0.18)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.18)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
              <i className="bi bi-stethoscope" />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.96rem', fontWeight: 800, color: '#ffffff' }}>Can't find your specific surgical procedure?</strong>
              <span style={{ fontSize: '0.8rem', color: '#e0f2fe', opacity: 0.95 }}>Search our complete clinical directory of 250+ surgical treatments and ICD-11 procedures.</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPage && setPage('planner')}
            style={{
              background: '#ffffff',
              color: '#0066fe',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '38px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
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
