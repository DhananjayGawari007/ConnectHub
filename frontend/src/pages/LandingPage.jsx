import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Shield, Zap, Sparkles, ArrowRight, Volume2, Users, Hash, Headphones } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111214',
      color: '#f2f3f5',
      overflowY: 'auto'
    }}>
      {/* Navigation Bar */}
      <nav style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: '#5865f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(88, 101, 242, 0.5)'
          }}>
            <MessageSquare size={22} color="#ffffff" />
          </div>
          <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em' }}>
            CONNECT<span style={{ color: '#5865f2' }}>HUB</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '15px' }}
            >
              Open ConnectHub
              <ArrowRight size={16} />
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary"
                style={{ padding: '8px 18px', fontSize: '14px' }}
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: '14px' }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1100px',
        margin: '60px auto 40px',
        padding: '0 20px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '20px',
          backgroundColor: 'rgba(88, 101, 242, 0.15)',
          border: '1px solid rgba(88, 101, 242, 0.3)',
          color: '#5865f2',
          fontSize: '13px',
          fontWeight: '700',
          marginBottom: '24px'
        }}>
          <Sparkles size={16} />
          THE MODERN PLACE TO TALK & HANG OUT
        </div>

        <h1 style={{
          fontSize: '60px',
          fontWeight: '900',
          letterSpacing: '-0.03em',
          lineHeight: '1.1',
          marginBottom: '24px'
        }}>
          Imagine a place... <br />
          <span style={{ color: '#5865f2' }}>where you belong.</span>
        </h1>

        <p style={{
          fontSize: '19px',
          color: '#949ba4',
          maxWidth: '720px',
          margin: '0 auto 36px',
          lineHeight: '1.6'
        }}>
          ConnectHub makes it easy to talk every day and hang out more often.
          Create your own community server, hop into crystal-clear voice rooms, and stay connected with real-time text chat and friends.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/register')}
            className="btn-primary"
            style={{ padding: '16px 36px', fontSize: '16px', borderRadius: '28px' }}
          >
            Launch in Your Browser
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section style={{
        maxWidth: '1100px',
        margin: '80px auto',
        padding: '0 20px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Feature 1 */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(88, 101, 242, 0.2)',
              color: '#5865f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}>
              <Hash size={26} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '10px' }}>
              Organized Channels
            </h3>
            <p style={{ fontSize: '14px', color: '#949ba4', lineHeight: '1.6' }}>
              Keep discussions neat with customizable categories, topic channels, and member role permissions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(35, 165, 90, 0.2)',
              color: '#23a55a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}>
              <Volume2 size={26} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '10px' }}>
              Instant Voice Channels
            </h3>
            <p style={{ fontSize: '14px', color: '#949ba4', lineHeight: '1.6' }}>
              Drop in when you're free. Friends in your server can see you're around and jump right in to talk without having to call.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 176, 244, 0.2)',
              color: '#00b0f4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}>
              <Users size={26} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '10px' }}>
              Stay Close with Friends
            </h3>
            <p style={{ fontSize: '14px', color: '#949ba4', lineHeight: '1.6' }}>
              Direct messages, friend requests, mutual friend discovery, and presence indicators let you see who's online and active.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '36px 20px',
        textAlign: 'center',
        color: '#949ba4',
        fontSize: '14px'
      }}>
        <div>ConnectHub • Designed for Seamless Communication</div>
      </footer>
    </div>
  );
}
