import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Flower2, ArrowLeft, Sparkles, Layers } from 'lucide-react';
import Button from './Button';
import PageHeader from './PageHeader';

export default function PlaceholderPage({ title, description, moduleCode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const isAdmin = currentPath.startsWith('/admin');

  // Derive human-readable title from path if not provided
  const derivedTitle =
    title ||
    currentPath
      .split('/')
      .pop()
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div>
      <PageHeader
        title={derivedTitle}
        subtitle={`System module for ${isAdmin ? 'Admin Governance' : 'Business Officer Operations'}`}
        actions={
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/officer/dashboard')}
          >
            Back to Dashboard
          </Button>
        }
      />

      <div
        className="royal-card"
        style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          maxWidth: '700px',
          margin: '2rem auto'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--color-lavender-pink)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 4px 16px rgba(118, 81, 143, 0.15)'
          }}
        >
          <Flower2 size={32} />
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            background: 'var(--color-lavender-pink)',
            padding: '0.2rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.75rem'
          }}
        >
          <Sparkles size={12} />
          Phase 2 Implementation Module
        </span>

        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--color-deep-plum)',
            marginBottom: '0.75rem'
          }}
        >
          {derivedTitle} Module
        </h2>

        <p
          style={{
            fontSize: '0.92rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2rem',
            maxWidth: '520px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
          {description ||
            `The ${derivedTitle} workspace is configured within the Petalio Blossom architecture. Per project development roadmap, this module screen is scheduled for dedicated implementation in the next iteration.`}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem' }}>
          <Button
            variant="primary"
            onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/officer/dashboard')}
          >
            Return to Main Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

