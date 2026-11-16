import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Plus, Compass, Bell } from 'lucide-react';

export default function ServerRail({ servers = [], activeServerId, onSelectServer, onOpenCreateModal }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isDMsActive = location.pathname.startsWith('/channels/@me') || location.pathname === '/dashboard';
  const isNotificationsActive = location.pathname === '/notifications';

  return (
    <div style={{
      width: '72px',
      backgroundColor: '#1e1f22',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px 0',
      gap: '8px',
      flexShrink: 0,
      zIndex: 20,
      borderRight: '1px solid rgba(0,0,0,0.2)'
    }}>
      {/* Home / Direct Messages Button */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {isDMsActive && (
          <div style={{
            position: 'absolute',
            left: '-12px',
            width: '4px',
            height: '40px',
            backgroundColor: '#ffffff',
            borderRadius: '0 4px 4px 0'
          }} />
        )}
        <button
          onClick={() => navigate('/channels/@me')}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: isDMsActive ? '16px' : '24px',
            backgroundColor: isDMsActive ? '#5865f2' : '#313338',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: isDMsActive ? '0 4px 12px rgba(88, 101, 242, 0.4)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (!isDMsActive) {
              e.currentTarget.style.borderRadius = '16px';
              e.currentTarget.style.backgroundColor = '#5865f2';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDMsActive) {
              e.currentTarget.style.borderRadius = '24px';
              e.currentTarget.style.backgroundColor = '#313338';
            }
          }}
          title="Direct Messages"
        >
          <MessageSquare size={24} />
        </button>
      </div>

      {/* Separator */}
      <div style={{
        width: '32px',
        height: '2px',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        margin: '4px 0',
        borderRadius: '1px'
      }} />

      {/* Server List */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {servers.map((s) => {
          const isActive = activeServerId === s.id;
          return (
            <div key={s.id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: '-12px',
                  width: '4px',
                  height: '40px',
                  backgroundColor: '#ffffff',
                  borderRadius: '0 4px 4px 0'
                }} />
              )}
              <button
                onClick={() => onSelectServer(s.id)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: isActive ? '16px' : '24px',
                  backgroundColor: isActive ? '#5865f2' : '#313338',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '15px',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive ? '0 4px 12px rgba(88, 101, 242, 0.4)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderRadius = '16px';
                    e.currentTarget.style.backgroundColor = '#5865f2';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderRadius = '24px';
                    e.currentTarget.style.backgroundColor = '#313338';
                  }
                }}
                title={s.name}
              >
                {s.name ? s.name.slice(0, 2).toUpperCase() : 'S'}
              </button>
            </div>
          );
        })}

        {/* Add Server Button */}
        <button
          onClick={onOpenCreateModal}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '24px',
            backgroundColor: '#313338',
            color: '#23a55a',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderRadius = '16px';
            e.currentTarget.style.backgroundColor = '#23a55a';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderRadius = '24px';
            e.currentTarget.style.backgroundColor = '#313338';
            e.currentTarget.style.color = '#23a55a';
          }}
          title="Create a Server"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* Notifications Button at Bottom */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '8px',
        borderTop: '1px solid rgba(255,255,255,0.08)'
      }}>
        <button
          onClick={() => navigate('/notifications')}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: isNotificationsActive ? '16px' : '24px',
            backgroundColor: isNotificationsActive ? '#5865f2' : '#313338',
            color: '#dbdee1',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: isNotificationsActive ? '0 4px 12px rgba(88, 101, 242, 0.4)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (!isNotificationsActive) {
              e.currentTarget.style.borderRadius = '16px';
              e.currentTarget.style.backgroundColor = '#5865f2';
              e.currentTarget.style.color = '#ffffff';
            }
          }}
          onMouseLeave={(e) => {
            if (!isNotificationsActive) {
              e.currentTarget.style.borderRadius = '24px';
              e.currentTarget.style.backgroundColor = '#313338';
              e.currentTarget.style.color = '#dbdee1';
            }
          }}
          title="Notifications"
        >
          <Bell size={20} />
        </button>
      </div>
    </div>
  );
}
