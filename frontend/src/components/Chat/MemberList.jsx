import React from 'react';
import { Crown, Shield, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MemberList({ members = [], currentUserId }) {
  const navigate = useNavigate();

  const onlineMembers = members.filter(m => m.status === 'online');
  const offlineMembers = members.filter(m => m.status !== 'online');

  const renderMember = (m) => {
    const isOwner = m.role === 'owner';
    const isAdmin = m.role === 'admin';
    const isSelf = m.id === currentUserId;

    return (
      <div
        key={m.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 8px',
          borderRadius: '4px',
          cursor: isSelf ? 'default' : 'pointer',
          transition: 'background 0.15s'
        }}
        onMouseEnter={(e) => {
          if (!isSelf) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
        }}
        onMouseLeave={(e) => {
          if (!isSelf) e.currentTarget.style.backgroundColor = 'transparent';
        }}
        onClick={() => {
          if (!isSelf) navigate(`/channels/@me/${m.id}`);
        }}
        title={isSelf ? 'You' : `Click to DM @${m.username}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              {(m.display_name || m.username || 'U').slice(0, 2).toUpperCase()}
            </div>
            <span
              className={`status-badge status-${m.status || 'offline'}`}
              style={{ position: 'absolute', bottom: '-1px', right: '-1px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: m.status === 'online' ? '#dbdee1' : '#949ba4'
              }}>
                {m.nickname || m.display_name || m.username}
              </span>
              {isOwner && <Crown size={14} color="#f0b232" title="Server Owner" />}
              {isAdmin && !isOwner && <Shield size={14} color="#5865f2" title="Admin" />}
            </div>
            {m.nickname && (
              <span style={{ fontSize: '11px', color: '#949ba4' }}>@{m.username}</span>
            )}
          </div>
        </div>

        {!isSelf && (
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#949ba4',
              cursor: 'pointer',
              padding: '4px',
              opacity: 0.7
            }}
            title={`Message ${m.username}`}
          >
            <MessageSquare size={14} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{
      width: '240px',
      backgroundColor: '#2b2d31',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 8px',
      gap: '16px',
      overflowY: 'auto',
      flexShrink: 0
    }}>
      {/* Online section */}
      <div>
        <div style={{
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          color: '#949ba4',
          marginBottom: '8px',
          paddingLeft: '8px'
        }}>
          Online — {onlineMembers.length}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {onlineMembers.map(renderMember)}
        </div>
      </div>

      {/* Offline section */}
      {offlineMembers.length > 0 && (
        <div>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            color: '#949ba4',
            marginBottom: '8px',
            paddingLeft: '8px'
          }}>
            Offline — {offlineMembers.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {offlineMembers.map(renderMember)}
          </div>
        </div>
      )}
    </div>
  );
}
