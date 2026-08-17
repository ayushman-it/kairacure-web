import React from 'react';

export function Breadcrumbs({ items = [] }) {
  return (
    <div className="profile-breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          {item.onClick ? (
            <button onClick={item.onClick} type="button">{item.label}</button>
          ) : (
            <span>{item.label}</span>
          )}
          {index < items.length - 1 && <em>/</em>}
        </React.Fragment>
      ))}
    </div>
  );
}
