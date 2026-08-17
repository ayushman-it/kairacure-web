import React from 'react';

export function StarRating({ rating }) {
  return (
    <span className="star-rating" aria-label={`${rating} star rating`}>
      <span>
        {Array.from({ length: 5 }).map((_, index) => (
          <i className="fa-solid fa-star" key={index} aria-hidden="true" />
        ))}
      </span>
      <strong>{rating}</strong>
    </span>
  );
}
