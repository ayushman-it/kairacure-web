import React, { useState, useRef, useMemo } from 'react';
import { MedicalVideoBackdrop } from '../common/MedicalVideoBackdrop.jsx';

function buildAvailableDestinations(hospitals = []) {
  const cityCopy = {
    Chennai: 'High-volume cardiac, transplant, and multispeciality treatment programs.',
    Delhi: 'Complex treatment programs with large multispeciality care teams.',
    Gurgaon: 'NCR hospitals for complex surgery, recovery planning, and international patient support.',
    Mumbai: 'Advanced diagnostics, oncology, cardiac care, and executive health checkups.',
    Bangalore: 'Technology-led hospitals for eye care, orthopedics, fertility, and wellness.',
    Bengaluru: 'Technology-led hospitals for eye care, orthopedics, fertility, and wellness.',
  };
  const grouped = new Map();
  hospitals
    .filter((hospital) => hospital.country === 'India' && hospital.city)
    .forEach((hospital) => {
      const key = hospital.city.trim();
      const current = grouped.get(key) || {
        country: key,
        line: cityCopy[key] || `Available partner hospitals and medical care teams.`,
        hospitals: 0,
        doctors: 0,
      };
      current.hospitals += 1;
      grouped.set(key, current);
    });

  if (grouped.size === 0) {
    ['Delhi / NCR', 'Mumbai', 'Chennai', 'Bangalore'].forEach((city) => {
      grouped.set(city, { country: city, line: cityCopy[city] || 'Accredited partner hospitals and specialist care.', hospitals: 10, doctors: 50 });
    });
  }

  return Array.from(grouped.values()).sort((a, b) => a.country.localeCompare(b.country));
}

export function Destinations({ hospitals = [], isLoading = false, money, setPage, setSelectedCountry }) {
  const availableDestinations = useMemo(() => buildAvailableDestinations(hospitals), [hospitals]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      const newPosition = direction === 'left'
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(carouselRef.current.scrollWidth - carouselRef.current.clientWidth, scrollPosition + scrollAmount);

      carouselRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  return (
    <section className="page-section destination-section" id="destinations">
      <MedicalVideoBackdrop />
      <div className="section-heading">
        <div>
          <h2>Featured Destinations</h2>
          <p>Explore places known for expert doctors, partner hospitals, and comfortable recovery.</p>
        </div>
      </div>

      <div className="destination-carousel-wrapper">
        <button
          className="carousel-nav-btn carousel-prev"
          onClick={() => scroll('left')}
          disabled={scrollPosition === 0}
          type="button"
          aria-label="Previous destinations"
        >
          <i className="fa-solid fa-chevron-left" aria-hidden="true" />
        </button>

        <div className="destination-carousel" ref={carouselRef}>
          {availableDestinations.map((destination) => (
            <button
              className="destination-card-new"
              key={destination.country}
              onClick={() => {
                if (setSelectedCountry) setSelectedCountry(destination.country);
                setPage('partners');
              }}
              type="button"
            >
              <div className="destination-info">
                <strong>{destination.country}</strong>
                <p>{destination.line}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          className="carousel-nav-btn carousel-next"
          onClick={() => scroll('right')}
          type="button"
          aria-label="Next destinations"
        >
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
