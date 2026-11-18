import React from 'react';

export default function StatusBadge({ status, label, showDot = true, className = '' }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  let variant = 'info';
  let displayLabel = label || status;

  switch (normalized) {
    case 'APPROVED':
    case 'ACTIVE':
    case 'COMPLETED':
    case 'DELIVERED':
    case 'CONFIRMED':
    case 'SUCCESS':
      variant = 'success';
      break;

    case 'PENDING':
    case 'PROCESSING':
    case 'IN_TRANSIT':
    case 'PENDING_DISPATCH':
    case 'WARNING':
    case 'MEDIUM':
      variant = 'warning';
      break;

    case 'REJECTED':
    case 'CANCELLED':
    case 'DANGER':
    case 'HIGH':
    case 'URGENT':
      variant = 'danger';
      break;

    case 'HARVESTING':
    case 'GROWER_ACCEPTED':
    case 'ON_ROUTE':
    case 'INFO':
      variant = 'info';
      break;

    case 'ADMIN':
    case 'BUSINESS_OFFICER':
    case 'ORCHID':
      variant = 'purple';
      break;

    default:
      variant = 'info';
      break;
  }

  // Format display label nicely if needed
  if (!label) {
    displayLabel = normalized
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <span className={`badge badge-${variant} ${className}`.trim()}>
      {showDot && <span className="badge-dot" />}
      <span>{displayLabel}</span>
    </span>
  );
}

