import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import ServerRail from '../components/Navigation/ServerRail';
import UserFooter from '../components/Navigation/UserFooter';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';

export default function DirectMessagesPage() {
  const { otherUserId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [servers, setServers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.get('/servers').then(res => setServers(res.data.servers || []));
  }, []);

  useEffect(() => {
    if (!otherUserId) return;

    // Fetch conversation
    api.get(`/messages/direct/${otherUserId}`)
      .then(res => {
        setMessages(res.data.messages || []);
      })
      .catch(e => console.error(e));

    // Listen on socket
    const socket = getSocket();
    if (!socket) return;

    const handleDm = (dm) => {
      if (
        (dm.sender_id === parseInt(otherUserId) && dm.receiver_id === user?.id) ||
        (dm.sender_id === user?.id && dm.receiver_id === parseInt(otherUserId))
      ) {
        setMessages(prev => [...prev, dm]);
      }
    };

    socket.on('new_direct_message', handleDm);
    return () => {
      socket.off('new_direct_message', handleDm);
    };
  }, [otherUserId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const socket = getSocket();
    const content = inputText.trim();
    setInputText('');

    if (socket) {
      socket.emit('send_direct_message', { receiverId: otherUserId, content });
    } else {
      api.post(`/messages/direct/${otherUserId}`, { content })
        .then(res => setMessages(prev => [...prev, res.data.message]));
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ServerRail servers={servers} onSelectServer={(id) => navigate(`/channels/${id}`)} />

      {/* Main DM Chat Container */}
      <div style={{ flex: 1, backgroundColor: '#313338', display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <div style={{
          height: '48px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid rgba(0,0,0,0.2)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
        }}>
          <button
            onClick={() => navigate('/channels/@me')}
            style={{ background: 'none', border: 'none', color: '#949ba4', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ fontWeight: '700', fontSize: '15px', color: '#f2f3f5', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="#949ba4" />
            Direct Message with User #{otherUserId}
          </div>
        </div>

        {/* Message History */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map(m => {
            const isSelf = m.sender_id === user?.id;
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: isSelf ? '#23a55a' : '#5865f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  color: '#fff',
                  flexShrink: 0
                }}>
                  {(m.display_name || m.username || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#f2f3f5' }}>
                      {m.display_name || m.username || `User #${m.sender_id}`}
                    </span>
                    <span style={{ fontSize: '11px', color: '#949ba4' }}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ color: '#dbdee1', fontSize: '14px', marginTop: '4px' }}>
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '0 20px 20px' }}>
          <form
            onSubmit={handleSend}
            style={{
              backgroundColor: '#383a40',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              padding: '6px 12px',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Send a direct message..."
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#dbdee1',
                fontSize: '14px'
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              style={{
                background: 'none',
                border: 'none',
                color: inputText.trim() ? '#5865f2' : '#4e5058',
                cursor: inputText.trim() ? 'pointer' : 'default',
                padding: '4px'
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
