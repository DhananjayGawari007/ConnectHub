import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!emailOrUsername.trim() || !password) return;

    setLoading(true);
    setError('');

    try {
      await login(emailOrUsername.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (username) => {
    setEmailOrUsername(username);
    setPassword('password123');
    setLoading(true);
    setError('');
    try {
      await login(username, 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111214',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '400px',
        height: '400px',
        backgroundColor: 'rgba(88, 101, 242, 0.12)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '460px',
        maxWidth: '100%',
        backgroundColor: '#313338',
        borderRadius: '12px',
        padding: '36px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        position: 'relative',
        zIndex: 10,
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {/* Logo & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            backgroundColor: '#5865f2',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            boxShadow: '0 0 24px rgba(88, 101, 242, 0.5)'
          }}>
            <MessageSquare size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f2f3f5', marginBottom: '6px' }}>
            Welcome back!
          </h2>
          <p style={{ color: '#949ba4', fontSize: '14px' }}>
            We're excited to see you again!
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(242, 63, 67, 0.15)',
            border: '1px solid rgba(242, 63, 67, 0.4)',
            color: '#f23f43',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: '#b5bac1',
              marginBottom: '6px'
            }}>
              Email or Username
            </label>
            <input
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="Enter your username or email"
              className="input-field"
              required
              autoFocus
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: '#b5bac1',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '15px' }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Instant Demo Accounts (1-Click Login) */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', color: '#949ba4', marginBottom: '10px', textAlign: 'center', fontWeight: '600' }}>
            Instant 1-Click Demo Login:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {[
              { name: 'alice', label: 'Alice' },
              { name: 'bob', label: 'Bob' },
              { name: 'charlie', label: 'Charlie' },
              { name: 'diana', label: 'Diana' },
              { name: 'eve', label: 'Eve' }
            ].map(item => (
              <button
                key={item.name}
                type="button"
                onClick={() => handleQuickLogin(item.name)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#f2f3f5',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5865f2';
                  e.currentTarget.style.borderColor = '#5865f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                @{item.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#949ba4' }}>
          Need an account?{' '}
          <Link to="/register" style={{ color: '#00b0f4', textDecoration: 'none', fontWeight: '600' }}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
