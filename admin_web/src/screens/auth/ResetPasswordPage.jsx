import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Flower2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Validate that link has required params
  const isValidLink = token && email;

  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '#e5e7eb' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
      { level: 1, label: 'Too Weak', color: '#EF4444' },
      { level: 2, label: 'Weak', color: '#F97316' },
      { level: 3, label: 'Good', color: '#EAB308' },
      { level: 4, label: 'Strong', color: '#22C55E' },
    ];
    return map[score - 1] || { level: 0, label: '', color: '#e5e7eb' };
  };

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3500);
      } else {
        setError(data.message || 'Reset failed. The link may have expired.');
      }
    } catch {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
        padding: '1.5rem',
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif"
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(190, 24, 93, 0.12)',
          overflow: 'hidden',
          border: '1px solid #f0e0e8'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #be185d, #831843)',
            padding: '28px 32px',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
            <Flower2 size={22} color="#fff" />
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.01em' }}>
              Petalio Blossom
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.82rem' }}>
            Highland Floriculture Management System
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '32px' }}>
          {/* Invalid link state */}
          {!isValidLink ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: '#FEE2E2', color: '#DC2626',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <AlertCircle size={26} />
              </div>
              <h2 style={{ color: '#831843', fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Invalid Reset Link
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.84rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                This password reset link is invalid or has expired.<br />
                Please request a new one from the login page.
              </p>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: '#be185d', color: '#fff',
                  padding: '10px 24px', borderRadius: '8px',
                  textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem'
                }}
              >
                <ArrowLeft size={15} /> Back to Login
              </Link>
            </div>
          ) : success ? (
            /* Success state */
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: '#DCFCE7', color: '#16A34A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <CheckCircle2 size={30} />
              </div>
              <h2 style={{ color: '#831843', fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Password Reset Successful!
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.84rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                Your password has been updated successfully.
              </p>
              <p style={{ color: '#be185d', fontSize: '0.8rem', fontWeight: 600 }}>
                Redirecting to login page...
              </p>
              <div style={{
                marginTop: '1.25rem',
                height: '4px',
                background: '#f0e0e8',
                borderRadius: '99px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #be185d, #f43f5e)',
                  borderRadius: '99px',
                  animation: 'progress 3.5s linear forwards'
                }} />
              </div>
            </div>
          ) : (
            /* Reset form */
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#831843', fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px' }}>
                  Set New Password
                </h2>
                <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>
                  Resetting password for <strong style={{ color: '#be185d' }}>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* New Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#831843', marginBottom: '5px' }}>
                    New Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={15}
                      style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#be185d' }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      style={{
                        width: '100%',
                        padding: '0.6rem 2.4rem 0.6rem 2.1rem',
                        borderRadius: '9px',
                        border: '1.5px solid #f0e0e8',
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        color: '#3b0f2a'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: '10px', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#be185d', padding: 0
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Password Strength Bar */}
                  {password && (
                    <div style={{ marginTop: '7px' }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '3px' }}>
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1, height: '3px', borderRadius: '99px',
                              background: i <= strength.level ? strength.color : '#e5e7eb',
                              transition: 'background 0.2s'
                            }}
                          />
                        ))}
                      </div>
                      {strength.label && (
                        <span style={{ fontSize: '0.72rem', color: strength.color, fontWeight: 600 }}>
                          {strength.label}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#831843', marginBottom: '5px' }}>
                    Confirm New Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={15}
                      style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#be185d' }}
                    />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                      style={{
                        width: '100%',
                        padding: '0.6rem 2.4rem 0.6rem 2.1rem',
                        borderRadius: '9px',
                        border: `1.5px solid ${confirmPassword && confirmPassword !== password ? '#EF4444' : '#f0e0e8'}`,
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        color: '#3b0f2a'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        position: 'absolute', right: '10px', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#be185d', padding: 0
                      }}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p style={{ color: '#EF4444', fontSize: '0.74rem', marginTop: '4px', fontWeight: 600 }}>
                      Passwords do not match
                    </p>
                  )}
                  {confirmPassword && confirmPassword === password && (
                    <p style={{ color: '#16A34A', fontSize: '0.74rem', marginTop: '4px', fontWeight: 600 }}>
                      ✓ Passwords match
                    </p>
                  )}
                </div>

                {/* Password hints */}
                <div style={{
                  background: '#fdf2f8',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '0.76rem',
                  color: '#6b7280',
                  lineHeight: 1.7
                }}>
                  <strong style={{ color: '#831843', display: 'block', marginBottom: '2px' }}>Password must have:</strong>
                  <span style={{ color: password.length >= 8 ? '#16A34A' : '#9ca3af' }}>
                    {password.length >= 8 ? '✓' : '○'} At least 8 characters
                  </span><br />
                  <span style={{ color: /[A-Z]/.test(password) ? '#16A34A' : '#9ca3af' }}>
                    {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                  </span><br />
                  <span style={{ color: /[0-9]/.test(password) ? '#16A34A' : '#9ca3af' }}>
                    {/[0-9]/.test(password) ? '✓' : '○'} One number
                  </span>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    padding: '0.65rem 0.9rem',
                    background: '#FEE2E2', borderRadius: '8px',
                    color: '#DC2626', fontSize: '0.82rem',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    <AlertCircle size={15} />
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: loading ? '#f0e0e8' : 'linear-gradient(135deg, #be185d, #9d174d)',
                    color: loading ? '#be185d' : '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    marginTop: '4px'
                  }}
                >
                  {loading ? '⏳ Resetting...' : '🔑 Reset Password'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <Link
                    to="/login"
                    style={{
                      color: '#be185d', fontSize: '0.82rem', fontWeight: 600,
                      textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    <ArrowLeft size={13} /> Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
