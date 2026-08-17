import React from 'react';

export function HomeReviews() {
  return (
    <section className="page-section home-reviews">
      <MedicalVideoBackdrop />
      <div className="section-heading">
        <div>
          <h2>Patients trust the journey</h2>
          <p>Ratings and reviews focused on doctor clarity, hospital response, and complete budget transparency.</p>
        </div>
        <StarRating rating="4.9" />
      </div>
      <div className="review-grid">
        {PATIENT_REVIEWS.map(([name, country, review]) => (
          <blockquote key={name}>
            <StarRating rating="5.0" />
            <strong>{name}</strong>
            <span>{country}</span>
            <p>{review}</p>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
