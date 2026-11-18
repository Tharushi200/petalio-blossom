import React from 'react';

export default function PageHeader({ title, subtitle, badge, actions, children }) {
  return (
    <div className="page-header">
      <div className="page-title-group">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1>{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      {(actions || children) && (
        <div className="page-actions">{actions || children}</div>
      )}
    </div>
  );
}

