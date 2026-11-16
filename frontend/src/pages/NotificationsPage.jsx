import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, ArrowLeft, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ServerRail from '../components/Navigation/ServerRail';
import api from '../services/api';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [nRes, sRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/servers')
      ]);
      setNotifications(nRes.data.notifications || []);
      setServers(sRes.data.servers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (e) {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (e) {}
  };

  const priorityBadges = {
    5: { label: 'Mention', color: '#f23f43' },
    4: { label: 'Direct Message', color: '#f0b232' },
    3: { label: 'Friend Request', color: '#5865f2' },
    2: { label: 'Announcement', color: '#00b0f4' },
    1: { label: 'Update', color: '#80848e' }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ServerRail servers={servers} onSelectServer={(id) => navigate(`/channels/${id}`)} />

      <div style={{ flex: 1, backgroundColor: '#313338', display: 'flex', flexDirection: 'column' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ background: 'none', border: 'none', color: '#949ba4', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <ArrowLeft size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '15px', color: '#f2f3f5' }}>
              <Bell size={18} color="#5865f2" />
              Notifications
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleMarkAllAsRead}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#949ba4' }}>
              <Bell size={48} color="#4e5058" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: '#f2f3f5', marginBottom: '6px' }}>No new notifications</h3>
              <p style={{ fontSize: '14px' }}>You're all caught up with your servers and messages!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.map(n => {
                const badge = priorityBadges[n.priority] || priorityBadges[1];
                return (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '8px',
                      backgroundColor: n.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(88, 101, 242, 0.08)',
                      border: `1px solid ${n.is_read ? 'rgba(255,255,255,0.06)' : 'rgba(88, 101, 242, 0.3)'}`,
                      transition: 'all 0.15s'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: badge.color,
                          backgroundColor: `${badge.color}20`,
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {badge.label}
                        </span>
                        <span style={{ fontSize: '11px', color: '#949ba4' }}>
                          {new Date(n.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ color: '#dbdee1', fontSize: '14px', fontWeight: n.is_read ? '400' : '600' }}>
                        {n.content}
                      </div>
                    </div>

                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#23a55a',
                          cursor: 'pointer',
                          padding: '6px'
                        }}
                        title="Mark as read"
                      >
                        <Check size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
