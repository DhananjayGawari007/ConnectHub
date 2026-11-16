import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Calendar,
  Edit3,
  Check,
  Save,
  Sparkles,
  Crown,
  Users,
  Server,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ServerRail from '../components/Navigation/ServerRail';
import api from '../services/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [servers, setServers] = useState([]);

  // Editable fields
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [status, setStatus] = useState(user?.status || 'online');
  const [customStatus, setCustomStatus] = useState(user?.customStatus || '');
  const [bannerColor, setBannerColor] = useState('#5865f2');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api.get('/servers').then(res => setServers(res.data.servers || []));
    api.get('/auth/me').then(res => {
      if (res.data?.user) {
        setDisplayName(res.data.user.displayName || res.data.user.display_name || '');
        setBio(res.data.user.bio || '');
        setStatus(res.data.user.status || 'online');
        setCustomStatus(res.data.user.customStatus || '');
      }
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await api.put('/auth/profile', {
        displayName,
        bio,
        status,
        customStatus
      });

      if (res.data?.user) {
        setUser(prev => ({
          ...prev,
          ...res.data.user,
          displayName: res.data.user.display_name || res.data.user.displayName
        }));
        localStorage.setItem('connecthub_user', JSON.stringify({
          ...user,
          ...res.data.user,
          displayName: res.data.user.display_name || res.data.user.displayName
        }));
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { id: 'online', label: 'Online', color: '#23a55a' },
    { id: 'idle', label: 'Idle', color: '#f0b232' },
    { id: 'dnd', label: 'Do Not Disturb', color: '#f23f43' },
    { id: 'offline', label: 'Invisible', color: '#80848e' }
  ];

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ServerRail servers={servers} onSelectServer={(id) => navigate(`/channels/${id}`)} />

      <div style={{
        flex: 1,
        backgroundColor: '#313338',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Navbar */}
        <div style={{
          height: '48px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0,0,0,0.2)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: '#dbdee1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>

        {/* Profile Content */}
        <div style={{ flex: 1, padding: '32px 20px', maxWidth: '840px', margin: '0 auto', width: '100%' }}>
          <form onSubmit={handleSave}>
            {/* Discord Style Profile Card */}
            <div className="glass-card" style={{
              overflow: 'hidden',
              marginBottom: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {/* Banner with Color Controls */}
              <div style={{
                height: '140px',
                backgroundColor: bannerColor,
                position: 'relative',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'flex-start',
                padding: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 8px',
                  borderRadius: '20px'
                }}>
                  {['#5865f2', '#eb459e', '#57f287', '#fee75c', '#ed4245', '#1e1f22'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBannerColor(color)}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: bannerColor === color ? '2px solid #ffffff' : 'none',
                        cursor: 'pointer'
                      }}
                      title="Set Banner Color"
                    />
                  ))}
                </div>
              </div>

              {/* Avatar & Badges Header */}
              <div style={{ padding: '0 24px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-48px', marginBottom: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: '92px',
                      height: '92px',
                      borderRadius: '50%',
                      backgroundColor: '#2b2d31',
                      border: '6px solid #2b2d31',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '34px',
                      fontWeight: '800',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                      {(displayName || user?.username || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <span
                      className={`status-badge status-${status}`}
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        width: '18px',
                        height: '18px',
                        border: '3px solid #2b2d31'
                      }}
                    />
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingBottom: '8px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(240, 178, 50, 0.15)',
                      border: '1px solid rgba(240, 178, 50, 0.3)',
                      color: '#f0b232',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      <Crown size={12} /> Server Owner
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(88, 101, 242, 0.15)',
                      border: '1px solid rgba(88, 101, 242, 0.3)',
                      color: '#5865f2',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      <Sparkles size={12} /> Early Supporter
                    </div>
                  </div>
                </div>

                {/* Name & Custom Status */}
                <div style={{ marginBottom: '20px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f2f3f5' }}>
                    {displayName || user?.username}
                  </h1>
                  <div style={{ color: '#949ba4', fontSize: '14px', marginBottom: '8px' }}>
                    @{user?.username}
                  </div>
                  {customStatus && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      color: '#dbdee1',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      padding: '4px 10px',
                      borderRadius: '12px'
                    }}>
                      <Activity size={14} color="#00b0f4" />
                      {customStatus}
                    </div>
                  )}
                </div>

                {/* Stats Bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                  padding: '16px 0',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(88,101,242,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5865f2' }}>
                      <Server size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#f2f3f5' }}>
                        {user?.serverCount || servers.length || 1}
                      </div>
                      <div style={{ fontSize: '11px', color: '#949ba4', textTransform: 'uppercase' }}>Servers</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(35,165,90,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#23a55a' }}>
                      <Users size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#f2f3f5' }}>
                        {user?.friendCount || 5}
                      </div>
                      <div style={{ fontSize: '11px', color: '#949ba4', textTransform: 'uppercase' }}>Friends</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(0,176,244,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00b0f4' }}>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#f2f3f5' }}>
                        Member
                      </div>
                      <div style={{ fontSize: '11px', color: '#949ba4', textTransform: 'uppercase' }}>Since 2024</div>
                    </div>
                  </div>
                </div>

                {/* Edit Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#b5bac1', marginBottom: '6px' }}>
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your display name"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#b5bac1', marginBottom: '6px' }}>
                        Status Mode
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="input-field"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.id} value={opt.id}>
                            ● {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#b5bac1', marginBottom: '6px' }}>
                      Custom Status Activity Text
                    </label>
                    <input
                      type="text"
                      value={customStatus}
                      onChange={(e) => setCustomStatus(e.target.value)}
                      placeholder="e.g. ☕ Working on a new project, 🎮 Playing games"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#b5bac1', marginBottom: '6px' }}>
                      About Me (Bio)
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell the community about yourself..."
                      rows={3}
                      className="input-field"
                      style={{ resize: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    {saveSuccess && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#23a55a', fontSize: '14px', fontWeight: '600' }}>
                        <Check size={18} /> Profile updated successfully!
                      </div>
                    )}
                    <div style={{ marginLeft: 'auto' }}>
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary"
                        style={{ padding: '10px 24px', fontSize: '14px' }}
                      >
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
