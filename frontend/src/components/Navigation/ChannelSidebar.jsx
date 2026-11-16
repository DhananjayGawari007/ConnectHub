import React, { useState } from 'react';
import { Hash, Volume2, Plus, ChevronDown, ChevronRight, Settings, Trash2, PhoneOff, Radio } from 'lucide-react';
import UserFooter from './UserFooter';

export default function ChannelSidebar({
  server,
  categories = [],
  activeChannelId,
  onSelectChannel,
  onOpenCreateChannelModal,
  onOpenCreateCategoryModal,
  onDeleteChannel
}) {
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [connectedVoiceChannel, setConnectedVoiceChannel] = useState(null);

  const toggleCategory = (catId) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const handleChannelClick = (ch) => {
    if (ch.type === 'voice') {
      setConnectedVoiceChannel(ch);
    }
    onSelectChannel(ch);
  };

  return (
    <div style={{
      width: '240px',
      backgroundColor: '#2b2d31',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      borderRight: '1px solid rgba(0,0,0,0.2)'
    }}>
      {/* Server Header */}
      <div style={{
        height: '48px',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.2)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        fontWeight: '700',
        fontSize: '15px',
        color: '#f2f3f5',
        cursor: 'pointer',
        transition: 'background 0.15s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {server ? server.name : 'Select a Server'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {server && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCreateCategoryModal && onOpenCreateCategoryModal();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#949ba4',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Create Category"
            >
              <Plus size={16} />
            </button>
          )}
          <ChevronDown size={18} color="#949ba4" />
        </div>
      </div>

      {/* Channels & Categories List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {categories.map((cat) => {
          const isCollapsed = !!collapsedCategories[cat.id];
          return (
            <div key={cat.id}>
              {/* Category Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 6px',
                cursor: 'pointer',
                color: '#949ba4'
              }}>
                <div 
                  onClick={() => toggleCategory(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase'
                  }}
                >
                  {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  <span>{cat.name}</span>
                </div>

                <button
                  onClick={() => onOpenCreateChannelModal(cat.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#949ba4',
                    cursor: 'pointer',
                    padding: '2px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Create Channel"
                  onMouseEnter={(e) => e.currentTarget.style.color = '#dbdee1'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#949ba4'}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Channels list under category */}
              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                  {(cat.channels || []).map((ch) => {
                    const isActive = activeChannelId === ch.id;
                    const isVoiceConnected = connectedVoiceChannel?.id === ch.id;

                    return (
                      <div key={ch.id}>
                        <div
                          onClick={() => handleChannelClick(ch)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                            color: isActive ? '#f2f3f5' : '#949ba4',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            fontSize: '14px',
                            fontWeight: isActive ? '600' : '500'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                              e.currentTarget.style.color = '#dbdee1';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#949ba4';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            {ch.type === 'voice' ? (
                              <Volume2 size={18} color={isVoiceConnected ? '#23a55a' : '#949ba4'} />
                            ) : (
                              <Hash size={18} color="#949ba4" />
                            )}
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {ch.name}
                            </span>
                          </div>

                          {onDeleteChannel && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete channel #${ch.name}?`)) {
                                  onDeleteChannel(ch.id);
                                }
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#949ba4',
                                cursor: 'pointer',
                                padding: '2px',
                                opacity: 0.5
                              }}
                              title="Delete Channel"
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Voice Status Box (If connected to a voice channel) */}
      {connectedVoiceChannel && (
        <div style={{
          backgroundColor: '#232428',
          padding: '10px 12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#23a55a', fontSize: '13px', fontWeight: '700' }}>
              <Radio size={14} className="animate-pulse" />
              Voice Connected
            </div>
            <div style={{ fontSize: '11px', color: '#949ba4' }}>
              {connectedVoiceChannel.name} / RTC Connected
            </div>
          </div>
          <button
            onClick={() => setConnectedVoiceChannel(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#f23f43',
              cursor: 'pointer',
              padding: '6px'
            }}
            title="Disconnect Voice"
          >
            <PhoneOff size={16} />
          </button>
        </div>
      )}

      {/* User Footer at Bottom Left */}
      <UserFooter />
    </div>
  );
}
