import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) return;

    setLoading(true);
    setError('');

    try {
      await register(username.trim(), email.trim(), password, displayName.trim() || username.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
      padding: '20px'
    }}>
      <div style={{
        width: '460px',
        maxWidth: '100%',
        backgroundColor: '#313338',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: '#5865f2',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: '0 0 20px rgba(88, 101, 242, 0.4)'
          }}>
            <MessageSquare size={26} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f2f3f5', marginBottom: '6px' }}>
            Create an account
          </h2>
          <p style={{ color: '#949ba4', fontSize: '14px' }}>
            Join ConnectHub and connect with your communities today!
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(242, 63, 67, 0.15)',
            border: '1px solid rgba(242, 63, 67, 0.3)',
            color: '#f23f43',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#b5bac1', marginBottom: '6px' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. john_doe"
              className="input-field"
              required
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#b5bac1', marginBottom: '6px' }}>
              Display Name (Optional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. John Doe"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#b5bac1', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="input-field"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#b5bac1', marginBottom: '6px' }}>
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
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
          >
            {loading ? 'Creating account...' : 'Continue'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#949ba4' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#00b0f4', textDecoration: 'none', fontWeight: '600' }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
