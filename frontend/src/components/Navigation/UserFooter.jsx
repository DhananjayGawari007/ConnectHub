import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mic, MicOff, Headphones, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserFooter() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [micMuted, setMicMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);

  if (!user) return null;

  return (
    <div style={{
      backgroundColor: '#232428',
      padding: '8px 10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTop: '1px solid rgba(255,255,255,0.06)'
    }}>
      {/* User Info */}
      <div 
        onClick={() => navigate('/profile')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          padding: '4px 6px',
          borderRadius: '4px',
          transition: 'background 0.15s',
          maxWidth: '120px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        title="View Profile"
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
            fontWeight: '600',
            fontSize: '13px',
            color: '#fff'
          }}>
            {user.username ? user.username.slice(0, 2).toUpperCase() : 'U'}
          </div>
          <span 
            className={`status-badge status-${user.status || 'online'}`}
            style={{
              position: 'absolute',
              bottom: '-1px',
              right: '-1px',
              border: '2px solid #232428'
            }}
          />
        </div>

        <div style={{ overflow: 'hidden' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#f2f3f5',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {user.displayName || user.username}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#949ba4',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            @{user.username}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <button
          onClick={() => setMicMuted(!micMuted)}
          style={{
            background: 'none',
            border: 'none',
            color: micMuted ? '#f23f43' : '#b5bac1',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title={micMuted ? "Unmute" : "Mute"}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {micMuted ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <button
          onClick={() => setDeafened(!deafened)}
          style={{
            background: 'none',
            border: 'none',
            color: deafened ? '#f23f43' : '#b5bac1',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title={deafened ? "Undeafen" : "Deafen"}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Headphones size={16} />
        </button>

        <button
          onClick={() => navigate('/settings')}
          style={{
            background: 'none',
            border: 'none',
            color: '#b5bac1',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="User Settings"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Settings size={16} />
        </button>

        <button
          onClick={logout}
          style={{
            background: 'none',
            border: 'none',
            color: '#f23f43',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Log Out"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(242,63,67,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
