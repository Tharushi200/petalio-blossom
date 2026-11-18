import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Flower2,
  Shield,
  Briefcase,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Active role tab: 'BUSINESS_OFFICER' or 'ADMIN'
  const [selectedRole, setSelectedRole] = useState('BUSINESS_OFFICER');

  const [email, setEmail] = useState('officer@petalio.lk');
  const [password, setPassword] = useState('Officer@123');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // If already authenticated, redirect immediately based on role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/officer/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Handle switching between the two actors
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setAuthError(null);
    setErrors({});
    if (role === 'ADMIN') {
      setEmail('admin@petalio.lk');
      setPassword('Admin@123');
    } else {
      setEmail('officer@petalio.lk');
      setPassword('Officer@123');
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!validate()) return;

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      if (result.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/officer/dashboard');
      }
    } else {
      setAuthError(result.error);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setShowForgotModal(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'var(--pb-blush)'
      }}
      className="login-container-root"
    >
      {/* ====================================================================
          LEFT SIDE: Highland Floriculture Farm Visual (50% Width)
          ==================================================================== */}
      <div
        style={{
          flex: '1 1 50%',
          position: 'relative',
          backgroundImage: "url('/dashboard_hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3.5rem',
          color: 'var(--pb-surface)',
          overflow: 'hidden'
        }}
        className="login-visual-pane"
      >
        {/* Soft elegant gradient overlay ensuring text legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(59, 15, 42, 0.38) 0%, rgba(59, 15, 42, 0.82) 100%)',
            pointerEvents: 'none'
          }}
        />

        {/* Editorial Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '480px' }}>
          <h2
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              fontFamily: 'var(--pb-font-heading)',
              color: 'var(--pb-surface)',
              lineHeight: 1.18,
              letterSpacing: '-0.02em',
              marginBottom: '1rem'
            }}
          >
            Cultivating Highland Excellence, Managing Every Stem.
          </h2>
          <p
            style={{
              fontSize: '0.98rem',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 1.65,
              margin: 0
            }}
          >
            Centralized operations connecting Nuwara Eliya and Welimada growers with fresh flower inventory management and wholesale fulfillment.
          </p>
        </div>
      </div>

      {/* ====================================================================
          RIGHT SIDE: Minimal Clean Login Form (50% Width)
          ==================================================================== */}
      <div
        style={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2.5rem 2rem',
          boxSizing: 'border-box'
        }}
        className="login-form-pane"
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Top Back Button */}
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--pb-surface)',
              border: '1px solid var(--pb-border)',
              padding: '0.45rem 0.95rem',
              borderRadius: 'var(--pb-radius-sm)',
              color: 'var(--pb-text)',
              fontSize: '0.84rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: 'var(--pb-shadow)',
              marginBottom: '1.5rem',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>

          {/* Top Logo & System Title */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <img
                src="/logo.png"
                alt="Petalio Blossom Logo"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  objectFit: 'cover'
                }}
              />
              <h3
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--pb-plum)',
                  lineHeight: 1.1,
                  margin: 0
                }}
              >
                Petalio Blossom
              </h3>
            </div>

            <h1
              style={{
                fontSize: '1.85rem',
                fontWeight: 600,
                fontFamily: 'var(--pb-font-heading)',
                color: 'var(--pb-text)',
                margin: '0.75rem 0 0.35rem 0',
                letterSpacing: '-0.02em'
              }}
            >
              Welcome Back
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--pb-text-muted)', margin: 0 }}>
              Select your role to access your operations dashboard.
            </p>
          </div>

          {/* Actor Role Tabs (Figma style segmented toggle) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.4rem',
              background: 'var(--pb-tint)',
              padding: '4px',
              borderRadius: 'var(--pb-radius-md)',
              marginBottom: '1.5rem'
            }}
          >
            <button
              type="button"
              onClick={() => handleRoleChange('BUSINESS_OFFICER')}
              style={{
                border: 'none',
                padding: '0.6rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                background: selectedRole === 'BUSINESS_OFFICER' ? 'var(--pb-surface)' : 'transparent',
                color: selectedRole === 'BUSINESS_OFFICER' ? 'var(--pb-rose)' : 'var(--pb-text-body)',
                boxShadow: selectedRole === 'BUSINESS_OFFICER' ? 'var(--pb-shadow)' : 'none'
              }}
            >
              <Briefcase size={15} />
              <span>Business Officer</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('ADMIN')}
              style={{
                border: 'none',
                padding: '0.6rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                background: selectedRole === 'ADMIN' ? 'var(--pb-surface)' : 'transparent',
                color: selectedRole === 'ADMIN' ? 'var(--pb-plum)' : 'var(--pb-text-body)',
                boxShadow: selectedRole === 'ADMIN' ? 'var(--pb-shadow)' : 'none'
              }}
            >
              <Shield size={15} />
              <span>System Admin</span>
            </button>
          </div>

          {/* Error Message */}
          {authError && (
            <div
              style={{
                padding: '0.75rem 0.95rem',
                borderRadius: 'var(--pb-radius-sm)',
                background: 'var(--pb-danger-tint)',
                border: '1px solid var(--pb-danger-tint)',
                color: 'var(--pb-danger)',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Corporate Email Address"
              type="email"
              name="email"
              placeholder={selectedRole === 'ADMIN' ? 'admin@petalio.lk' : 'officer@petalio.lk'}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              icon={Mail}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              icon={Lock}
              error={errors.password}
              required
            />

            {/* Remember & Forgot Password */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                fontSize: '0.82rem'
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  color: 'var(--pb-text-body)',
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    accentColor: 'var(--pb-rose)',
                    width: '15px',
                    height: '15px',
                    cursor: 'pointer'
                  }}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--pb-rose)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  padding: 0
                }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              style={{ width: '100%', borderRadius: 'var(--pb-petal-sm)' }}
              icon={ArrowRight}
              iconPosition="right"
            >
              {selectedRole === 'ADMIN' ? 'Sign In as System Admin' : 'Sign In as Business Officer'}
            </Button>
          </form>
        </div>
      </div>

      {/* ====================================================================
          Forgot Password Modal
          ==================================================================== */}
      {showForgotModal && (
        <div className="modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Password Reset Assistance</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowForgotModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {forgotSuccess ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'var(--pb-leaf-tint)',
                      color: 'var(--pb-leaf)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.75rem auto'
                    }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 style={{ color: 'var(--pb-plum)', marginBottom: '0.35rem' }}>
                    Reset Link Dispatched
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--pb-text-body)' }}>
                    Instructions have been sent to <strong>{forgotEmail}</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit}>
                  <p
                    style={{
                      fontSize: '0.84rem',
                      color: 'var(--pb-text-body)',
                      marginBottom: '1.25rem'
                    }}
                  >
                    Enter your authorized corporate email to receive a password recovery link.
                  </p>

                  <Input
                    label="Corporate Email"
                    type="email"
                    placeholder="e.g. officer@petalio.lk or admin@petalio.lk"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    icon={Mail}
                    required
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.25rem' }}>
                    <Button variant="outline" size="sm" onClick={() => setShowForgotModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm">
                      Send Link
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
