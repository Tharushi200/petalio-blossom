import React from 'react';
import {
  Users,
  Flower2,
  UserCheck,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Clock,
  Layers,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2
} from 'lucide-react';

const ICON_MAP = {
  Users,
  Flower2,
  UserCheck,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Clock,
  Layers,
  AlertTriangle,
  CheckCircle2
};

export default function StatCard({
  title,
  value,
  change,
  isPositive = true,
  subtext,
  icon,
  onClick
}) {
  let IconComponent = typeof icon === 'string' ? ICON_MAP[icon] || Flower2 : icon || Flower2;

  const getTrendClass = () => {
    if (isPositive === true) return 'positive';
    if (isPositive === false) return 'negative';
    return 'neutral';
  };

  return (
    <div className="stat-card" onClick={onClick} role={onClick ? 'button' : undefined}>
      <div className="stat-card-top">
        <span className="stat-card-label">{title}</span>
        <div className="stat-card-icon-wrap">
          <IconComponent size={20} />
        </div>
      </div>

      <div>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-footer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
          {change && (
            <span className={`stat-trend ${getTrendClass()}`} style={{ flexShrink: 0 }}>
              {isPositive === true && <ArrowUpRight size={13} />}
              {isPositive === false && <ArrowDownRight size={13} />}
              {change}
            </span>
          )}
          {subtext && <span style={{ color: 'var(--pb-text-muted)', fontSize: '0.78rem' }}>{subtext}</span>}
        </div>
      </div>
    </div>
  );
}

