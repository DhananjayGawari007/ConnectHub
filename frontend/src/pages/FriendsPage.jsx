import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Check, X, MessageSquare, Trash2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ServerRail from '../components/Navigation/ServerRail';
import UserFooter from '../components/Navigation/UserFooter';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function FriendsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('online'); // 'online' | 'all' | 'pending' | 'add' | 'suggestions'
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState({ incoming: [], outgoing: [] });
  const [suggestions, setSuggestions] = useState([]);
  const [targetUsername, setTargetUsername] = useState('');
  const [requestStatus, setRequestStatus] = useState('');
  const [servers, setServers] = useState([]);

  const loadFriendsData = async () => {
    try {
      const [fRes, pRes, sRes, srvRes] = await Promise.all([
        api.get('/friends'),
        api.get('/friends/requests'),
        api.get('/friends/graph/suggestions'),
        api.get('/servers')
      ]);
      setFriends(fRes.data.friends || []);
      setPending(pRes.data || { incoming: [], outgoing: [] });
      setSuggestions(sRes.data?.suggestions || []);
      setServers(srvRes.data.servers || []);
    } catch (e) {
      console.error('Failed to load friends:', e);
    }
  };

  useEffect(() => {
    loadFriendsData();
  }, []);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!targetUsername.trim()) return;

    try {
      await api.post('/friends/request', { targetUsername: targetUsername.trim() });
      setRequestStatus('Friend request sent successfully!');
      setTargetUsername('');
      loadFriendsData();
    } catch (err) {
      setRequestStatus(`Error: ${err.response?.data?.message || 'Failed to send request'}`);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await api.put(`/friends/request/${requestId}/accept`);
      loadFriendsData();
    } catch (e) {}
  };

  const handleReject = async (requestId) => {
    try {
      await api.put(`/friends/request/${requestId}/reject`);
      loadFriendsData();
    } catch (e) {}
  };

  const handleRemoveFriend = async (friendId) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      try {
        await api.delete(`/friends/${friendId}`);
        loadFriendsData();
      } catch (e) {}
    }
  };

  const onlineFriends = friends.filter(f => f.status === 'online');

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ServerRail servers={servers} onSelectServer={(id) => navigate(`/channels/${id}`)} />

      {/* DMs / Friends Navigation Sidebar */}
      <div style={{
        width: '240px',
        backgroundColor: '#2b2d31',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(0,0,0,0.2)'
      }}>
        <div style={{
          height: '48px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgba(0,0,0,0.2)',
          fontWeight: '700',
          fontSize: '15px',
          color: '#f2f3f5'
        }}>
          Direct Messages
        </div>

        <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          <button
            onClick={() => setActiveTab('online')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#f2f3f5',
              cursor: 'pointer',
              fontWeight: '600',
              marginBottom: '16px'
            }}
          >
            <Users size={20} />
            Friends
          </button>

          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: '#949ba4',
            padding: '4px 8px',
            marginBottom: '4px'
          }}>
            Direct Messages
          </div>

          {friends.map(f => (
            <div
              key={f.id}
              onClick={() => navigate(`/channels/@me/${f.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#949ba4',
                fontSize: '14px',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = '#dbdee1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#949ba4';
              }}
            >
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#5865f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '13px'
                }}>
                  {f.username.slice(0, 2).toUpperCase()}
                </div>
                <span className={`status-badge status-${f.status || 'offline'}`} style={{ position: 'absolute', bottom: '-1px', right: '-1px' }} />
              </div>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {f.displayName || f.username}
              </span>
            </div>
          ))}
        </div>

        <UserFooter />
      </div>

      {/* Main Friends Area */}
      <div style={{ flex: 1, backgroundColor: '#313338', display: 'flex', flexDirection: 'column' }}>
        {/* Top Navbar */}
        <div style={{
          height: '48px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '1px solid rgba(0,0,0,0.2)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#80848e', fontWeight: '600', marginRight: '8px' }}>
            <Users size={20} />
            <span style={{ color: '#f2f3f5' }}>Friends</span>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.08)' }} />

          {['online', 'all', 'pending', 'suggestions', 'add'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: tab === 'add' ? '#23a55a' : activeTab === tab ? 'rgba(255,255,255,0.1)' : 'none',
                border: 'none',
                color: tab === 'add' ? '#ffffff' : activeTab === tab ? '#ffffff' : '#b5bac1',
                padding: '4px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'add' ? 'Add Friend' : tab}
              {tab === 'pending' && pending.incoming.length > 0 && (
                <span style={{
                  marginLeft: '6px',
                  backgroundColor: '#f23f43',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '1px 6px',
                  fontSize: '11px'
                }}>
                  {pending.incoming.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {/* ADD FRIEND TAB */}
          {activeTab === 'add' && (
            <div style={{ maxWidth: '560px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f2f3f5', marginBottom: '8px' }}>
                ADD FRIEND
              </h2>
              <p style={{ fontSize: '14px', color: '#949ba4', marginBottom: '16px' }}>
                You can add friends with their ConnectHub username.
              </p>

              <form onSubmit={handleSendRequest} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  placeholder="Enter a username"
                  className="input-field"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  Send Friend Request
                </button>
              </form>

              {requestStatus && (
                <div style={{
                  marginTop: '12px',
                  fontSize: '13px',
                  color: requestStatus.startsWith('Error') ? '#f23f43' : '#23a55a'
                }}>
                  {requestStatus}
                </div>
              )}
            </div>
          )}

          {/* ONLINE / ALL TAB */}
          {(activeTab === 'online' || activeTab === 'all') && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#949ba4', marginBottom: '16px' }}>
                {activeTab === 'online' ? `Online — ${onlineFriends.length}` : `All Friends — ${friends.length}`}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(activeTab === 'online' ? onlineFriends : friends).map(f => (
                  <div
                    key={f.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#5865f2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: '600'
                        }}>
                          {f.username.slice(0, 2).toUpperCase()}
                        </div>
                        <span className={`status-badge status-${f.status || 'offline'}`} style={{ position: 'absolute', bottom: '-1px', right: '-1px' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#f2f3f5' }}>{f.displayName || f.username}</div>
                        <div style={{ fontSize: '12px', color: '#949ba4' }}>@{f.username}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => navigate(`/channels/@me/${f.id}`)}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                      >
                        <MessageSquare size={14} />
                        Message
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(f.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f23f43',
                          cursor: 'pointer',
                          padding: '6px'
                        }}
                        title="Remove Friend"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PENDING TAB */}
          {activeTab === 'pending' && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#949ba4', marginBottom: '16px' }}>
                Incoming Requests — {pending.incoming.length}
              </div>

              {pending.incoming.map(req => (
                <div
                  key={req.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#5865f2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: '600'
                    }}>
                      {req.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#f2f3f5' }}>{req.display_name || req.username}</div>
                      <div style={{ fontSize: '12px', color: '#949ba4' }}>Incoming Friend Request</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleAccept(req.id)}
                      style={{
                        backgroundColor: '#23a55a',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Accept"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      style={{
                        backgroundColor: '#f23f43',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Ignore"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUGGESTIONS TAB */}
          {activeTab === 'suggestions' && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#b5bac1', marginBottom: '8px' }}>
                People You May Know
              </div>
              <p style={{ color: '#949ba4', fontSize: '14px', marginBottom: '16px' }}>
                Suggested connections based on mutual friends and shared communities.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {suggestions.map(userId => (
                  <div
                    key={userId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#5865f2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: '700'
                      }}>
                        U{userId}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#f2f3f5' }}>User #{userId}</div>
                        <div style={{ fontSize: '12px', color: '#949ba4' }}>Shared mutual friends</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
