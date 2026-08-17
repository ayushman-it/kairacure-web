import React from 'react';

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`skeleton-card-placeholder ${className}`}>
      <div className="skeleton-line title" />
      <div className="skeleton-line subtitle" />
      <div className="skeleton-line paragraph" />
    </div>
  );
}
