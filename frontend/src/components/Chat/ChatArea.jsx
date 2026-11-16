import React, { useState, useEffect, useRef } from 'react';
import { Hash, Volume2, Send, Smile, Paperclip, Edit2, Trash2, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import api from '../../services/api';

export default function ChatArea({ channel, toggleMemberList, isMemberListOpen }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch channel messages
  useEffect(() => {
    if (!channel) return;

    api.get(`/messages/channel/${channel.id}`)
      .then(res => {
        setMessages(res.data.messages || []);
      })
      .catch(err => console.error('Fetch messages error:', err));

    const socket = getSocket();
    if (!socket) return;

    socket.emit('join_channel', channel.id);

    // Listen for new messages
    const handleNewMessage = (msg) => {
      if (msg.channel_id === channel.id) {
        setMessages(prev => [...prev, msg]);
      }
    };

    // Listen for typing indicators
    const handleUserTyping = (data) => {
      if (data.channelId === channel.id && data.userId !== user?.id) {
        setTypingUsers(prev => new Set([...prev, data.username]));
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.channelId === channel.id) {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.delete(data.username);
          return next;
        });
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.emit('leave_channel', channel.id);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [channel?.id, user?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    const socket = getSocket();
    if (!socket || !channel) return;

    socket.emit('typing_start', { channelId: channel.id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { channelId: channel.id });
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !channel) return;

    const socket = getSocket();
    const content = inputText.trim();
    setInputText('');

    if (socket) {
      socket.emit('send_message', { channelId: channel.id, content }, (res) => {
        if (!res?.success) {
          console.warn('Socket message failed, falling back to HTTP');
          api.post(`/messages/channel/${channel.id}`, { content });
        }
      });
      socket.emit('typing_stop', { channelId: channel.id });
    } else {
      // Fallback
      api.post(`/messages/channel/${channel.id}`, { content })
        .then(res => setMessages(prev => [...prev, res.data.message]));
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  if (!channel) {
    return (
      <div style={{
        flex: 1,
        backgroundColor: '#313338',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#949ba4',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <Hash size={48} color="#4e5058" />
        <h3 style={{ color: '#f2f3f5' }}>No channel selected</h3>
        <p>Pick a text or voice channel from the left sidebar to start chatting</p>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#313338',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Channel Bar */}
      <div style={{
        height: '48px',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.2)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {channel.type === 'voice' ? (
            <Volume2 size={24} color="#949ba4" />
          ) : (
            <Hash size={24} color="#949ba4" />
          )}
          <span style={{ fontWeight: '700', fontSize: '16px', color: '#f2f3f5' }}>
            {channel.name}
          </span>
          {channel.topic && (
            <>
              <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
              <span style={{ fontSize: '13px', color: '#949ba4' }}>{channel.topic}</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleMemberList}
            style={{
              background: 'none',
              border: 'none',
              color: isMemberListOpen ? '#f2f3f5' : '#b5bac1',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Member List"
          >
            <Users size={20} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Welcome message */}
        <div style={{ margin: '16px 0 24px', padding: '0 8px' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: '#404249',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <Hash size={40} color="#f2f3f5" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#f2f3f5', marginBottom: '8px' }}>
            Welcome to #{channel.name}!
          </h2>
          <p style={{ color: '#949ba4', fontSize: '14px' }}>
            This is the start of the #{channel.name} channel. Welcome to the conversation!
          </p>
        </div>

        {/* Message items */}
        {messages.map((m) => {
          const isOwn = m.sender_id === user?.id;
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: '16px',
                padding: '4px 8px',
                borderRadius: '4px',
                position: 'relative',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {/* Avatar */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#5865f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: '600',
                fontSize: '15px',
                flexShrink: 0
              }}>
                {(m.display_name || m.username || 'U').slice(0, 2).toUpperCase()}
              </div>

              {/* Message Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontWeight: '600', fontSize: '15px', color: '#f2f3f5' }}>
                    {m.display_name || m.username}
                  </span>
                  <span style={{ fontSize: '11px', color: '#949ba4' }}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{
                  color: '#dbdee1',
                  fontSize: '14px',
                  marginTop: '4px',
                  lineHeight: '1.4',
                  wordBreak: 'break-word'
                }}>
                  {m.content}
                </div>
              </div>

              {/* Action buttons (Delete own message) */}
              {isOwn && (
                <div style={{
                  position: 'absolute',
                  right: '8px',
                  top: '4px',
                  display: 'flex',
                  gap: '4px',
                  backgroundColor: '#2b2d31',
                  borderRadius: '4px',
                  padding: '2px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <button
                    onClick={() => handleDeleteMessage(m.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f23f43',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Delete Message"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator Bar */}
      {typingUsers.size > 0 && (
        <div style={{ padding: '0 16px', fontSize: '12px', color: '#949ba4', fontStyle: 'italic' }}>
          {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Input Form Bar */}
      <div style={{ padding: '0 16px 20px' }}>
        <form
          onSubmit={handleSendMessage}
          style={{
            backgroundColor: '#383a40',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            padding: '4px 12px',
            gap: '8px'
          }}
        >
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: '#b5bac1', cursor: 'pointer', padding: '6px' }}
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={`Message #${channel.name}`}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#dbdee1',
              fontSize: '15px',
              padding: '8px 0'
            }}
          />

          <button
            type="button"
            style={{ background: 'none', border: 'none', color: '#b5bac1', cursor: 'pointer', padding: '6px' }}
            title="Insert emoji"
          >
            <Smile size={20} />
          </button>

          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              background: 'none',
              border: 'none',
              color: inputText.trim() ? '#5865f2' : '#4e5058',
              cursor: inputText.trim() ? 'pointer' : 'default',
              padding: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Send"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
