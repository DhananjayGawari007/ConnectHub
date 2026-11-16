import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Volume2, Moon, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ServerRail from '../components/Navigation/ServerRail';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [servers, setServers] = useState([]);
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ServerRail servers={servers} onSelectServer={(id) => navigate(`/channels/${id}`)} />

      <div style={{ flex: 1, backgroundColor: '#313338', display: 'flex' }}>
        {/* Settings Navigation Sidebar */}
        <div style={{
          width: '240px',
          backgroundColor: '#2b2d31',
          padding: '40px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          borderRight: '1px solid rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#949ba4', marginBottom: '8px', paddingLeft: '8px' }}>
            User Settings
          </div>
          <button
            onClick={() => setActiveTab('account')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '4px',
              backgroundColor: activeTab === 'account' ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: activeTab === 'account' ? '#f2f3f5' : '#b5bac1',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <User size={16} /> My Account
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '4px',
              backgroundColor: activeTab === 'appearance' ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: activeTab === 'appearance' ? '#f2f3f5' : '#b5bac1',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <Moon size={16} /> Appearance
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '4px',
              backgroundColor: activeTab === 'voice' ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: activeTab === 'voice' ? '#f2f3f5' : '#b5bac1',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <Volume2 size={16} /> Voice & Audio
          </button>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '20px', paddingTop: '16px' }}>
            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: '#f23f43',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </div>

        {/* Settings Body */}
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#2b2d31',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#dbdee1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div style={{ maxWidth: '600px' }}>
            {activeTab === 'account' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f2f3f5', marginBottom: '20px' }}>
                  My Account
                </h2>

                <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#b5bac1', textTransform: 'uppercase', fontWeight: '700' }}>Username</div>
                      <div style={{ fontSize: '15px', color: '#f2f3f5', fontWeight: '600', marginTop: '2px' }}>{user?.username}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#b5bac1', textTransform: 'uppercase', fontWeight: '700' }}>Display Name</div>
                      <div style={{ fontSize: '15px', color: '#f2f3f5', fontWeight: '600', marginTop: '2px' }}>{user?.displayName || user?.username}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#b5bac1', textTransform: 'uppercase', fontWeight: '700' }}>Email</div>
                      <div style={{ fontSize: '15px', color: '#f2f3f5', fontWeight: '600', marginTop: '2px' }}>{user?.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f2f3f5', marginBottom: '20px' }}>
                  Appearance
                </h2>
                <div className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#f2f3f5', marginBottom: '6px' }}>Theme</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{
                        padding: '12px 20px',
                        borderRadius: '8px',
                        backgroundColor: '#1e1f22',
                        border: '2px solid #5865f2',
                        color: '#f2f3f5',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        Dark (Default)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'voice' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f2f3f5', marginBottom: '20px' }}>
                  Voice & Video Settings
                </h2>
                <div className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#b5bac1', marginBottom: '6px' }}>
                      Input Device
                    </label>
                    <select className="input-field" defaultValue="default">
                      <option value="default">Default Microphone</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#b5bac1', marginBottom: '6px' }}>
                      Output Device
                    </label>
                    <select className="input-field" defaultValue="default">
                      <option value="default">Default Headphones / Speakers</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
