import React, { useState, useRef } from 'react';

const DESTINATIONS_DATA = [
  {
    city: 'New Delhi / NCR',
    airport: 'DEL',
    airportName: 'Indira Gandhi Intl',
    hospitalsCount: '28+ Hospitals',
    specialty: 'Oncology, Organ Transplant & Cardiac',
    description: 'India’s premier medical capital with JCI-accredited super specialty centers.',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    rating: '4.9'
  },
  {
    city: 'Mumbai',
    airport: 'BOM',
    airportName: 'Chhatrapati Shivaji Intl',
    hospitalsCount: '22+ Hospitals',
    specialty: 'Advanced Cardiology, Neurosurgery & IVF',
    description: 'Financial hub renowned for pioneer transplant surgeons and executive care.',
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
    rating: '4.8'
  },
  {
    city: 'Bengaluru',
    airport: 'BLR',
    airportName: 'Kempegowda Intl',
    hospitalsCount: '19+ Hospitals',
    specialty: 'Robotic Surgery, Orthopedics & Eye Care',
    description: 'Tech-driven healthcare ecosystem with AI-guided robotic surgery centers.',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
    rating: '4.9'
  },
  {
    city: 'Chennai',
    airport: 'MAA',
    airportName: 'Chennai Intl',
    hospitalsCount: '20+ Hospitals',
    specialty: 'High-Volume Cardiac & Bone Marrow',
    description: 'Healthcare capital of South Asia with world-leading heart & kidney centers.',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    rating: '4.8'
  },
  {
    city: 'Hyderabad',
    airport: 'HYD',
    airportName: 'Rajiv Gandhi Intl',
    hospitalsCount: '15+ Hospitals',
    specialty: 'Gastroenterology, Liver & Urology',
    description: 'Global medical hub known for liver transplants and specialized GI surgery.',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    rating: '4.8'
  },
  {
    city: 'Kolkata',
    airport: 'CCU',
    airportName: 'Netaji Subhash Chandra Intl',
    hospitalsCount: '12+ Hospitals',
    specialty: 'Multispecialty & ENT Surgery',
    description: 'Trusted Eastern India medical destination with compassionate patient care.',
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80',
    rating: '4.7'
  }
];

export function Destinations({ hospitals = [], setPage, setSelectedCountry }) {
  const carouselRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 340;
      const newPos = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(carouselRef.current.scrollWidth - carouselRef.current.clientWidth, scrollPosition + scrollAmount);
      
      carouselRef.current.scrollTo({ left: newPos, behavior: 'smooth' });
      setScrollPosition(newPos);
    }
  };

  const handleSelectCity = (city) => {
    if (setSelectedCountry) setSelectedCountry(city);
    if (setPage) setPage('partners');
  };

  return (
    <section className="destination-section-v2" style={{ padding: '60px 16px', background: '#f8fafc' }}>
      <style>{`
        .destinations-card-container {
          max-width: 1380px;
          margin: 0 auto;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 24px;
          padding: 44px 48px;
          box-shadow: 0 10px 36px rgba(0, 102, 254, 0.05);
        }
        @media (max-width: 768px) {
          .destinations-card-container {
            padding: 28px 20px;
          }
        }
        .destinations-slider-track {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding-bottom: 12px;
          scrollbar-width: none;
        }
        .destinations-slider-track::-webkit-scrollbar {
          display: none;
        }
        .dest-card-v2 {
          min-width: 320px;
          max-width: 320px;
          height: 380px;
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          background: #0f172a;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          text-align: left;
        }
        .dest-card-v2:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 30px rgba(0, 102, 254, 0.2);
          border-color: #0d2f5d;
        }
        .dest-card-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .dest-card-v2:hover .dest-card-bg-img {
          transform: scale(1.08);
        }
        .dest-card-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.4) 55%, rgba(15, 23, 42, 0.1) 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
          color: #ffffff;
        }
        .dest-nav-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          color: #0d2f5d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .dest-nav-btn:hover:not(:disabled) {
          background: #0d2f5d;
          color: #ffffff;
          border-color: #0d2f5d;
          box-shadow: 0 4px 12px rgba(0, 102, 254, 0.3);
        }
        .dest-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>

      <div className="destinations-card-container">
        
        {/* Header Title & Slider Nav Buttons */}
        <div className="dest-header-flex-row" style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
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
              FEATURED MEDICAL DESTINATIONS
            </span>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Premier Healthcare Cities
            </h2>
            <p style={{ fontSize: '0.94rem', color: '#64748b', margin: 0, maxWidth: '680px', lineHeight: 1.5 }}>
              Explore top medical hubs known for JCI &amp; NABH accredited partner hospitals, specialist doctors, and seamless recovery stays.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="dest-nav-btn"
              onClick={() => handleScroll('left')}
              disabled={scrollPosition <= 0}
              type="button"
              aria-label="Previous Destinations"
            >
              <i className="bi bi-chevron-left" />
            </button>
            <button 
              className="dest-nav-btn"
              onClick={() => handleScroll('right')}
              type="button"
              aria-label="Next Destinations"
            >
              <i className="bi bi-chevron-right" />
            </button>
          </div>
        </div>

        {/* Horizontal Slider Track */}
        <div className="destinations-slider-track" ref={carouselRef}>
          {DESTINATIONS_DATA.map((dest) => (
            <div
              key={dest.city}
              className="dest-card-v2"
              onClick={() => handleSelectCity(dest.city)}
            >
              <img src={dest.image} alt={dest.city} className="dest-card-bg-img" />
              
              <div className="dest-card-gradient">
                {/* Top Clean Airport & Rating Badges (NO duplicate city tags) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(6px)', color: '#0d2f5d', fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ✈️ {dest.airport}
                  </span>
                  <span style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', color: '#f59e0b', fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>
                    ★ {dest.rating}
                  </span>
                </div>

                {/* Bottom Content */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ background: '#0066fe', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', display: 'inline-block' }}>
                      🏥 {dest.hospitalsCount}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                    {dest.city}
                  </h3>
                  
                  <span style={{ fontSize: '0.8rem', color: '#93c5fd', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    {dest.specialty}
                  </span>
                  
                  <p style={{ fontSize: '0.78rem', color: '#e2e8f0', margin: '0 0 12px', lineHeight: 1.38, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', opacity: 0.95 }}>
                    {dest.description}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                    <span>Explore Hospitals</span>
                    <i className="bi bi-arrow-right" style={{ color: '#60a5fa' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
