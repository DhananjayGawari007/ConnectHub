import React, { useState } from 'react';
import { X, Hash, Volume2 } from 'lucide-react';
import api from '../../services/api';

export default function CreateChannelModal({ isOpen, onClose, serverId, categoryId, onChannelCreated }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.post(`/servers/${serverId}/channels`, {
        categoryId,
        name: name.toLowerCase().replace(/\s+/g, '-').trim(),
        type,
        topic
      });
      onChannelCreated(res.data.channel);
      setName('');
      setTopic('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        backgroundColor: '#313338',
        borderRadius: '12px',
        width: '460px',
        maxWidth: '90vw',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f2f3f5' }}>
            Create Channel
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#949ba4', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
          {error && (
            <div style={{
              backgroundColor: 'rgba(242, 63, 67, 0.15)',
              border: '1px solid rgba(242, 63, 67, 0.3)',
              color: '#f23f43',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {/* Channel Type Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: '#b5bac1',
              marginBottom: '8px'
            }}>
              Channel Type
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                onClick={() => setType('text')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  backgroundColor: type === 'text' ? 'rgba(255,255,255,0.08)' : '#2b2d31',
                  border: type === 'text' ? '1px solid #5865f2' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <Hash size={24} color="#949ba4" />
                <div>
                  <div style={{ color: '#f2f3f5', fontWeight: '600', fontSize: '15px' }}>Text</div>
                  <div style={{ color: '#949ba4', fontSize: '12px' }}>Post messages, images, and memes</div>
                </div>
              </div>

              <div
                onClick={() => setType('voice')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  backgroundColor: type === 'voice' ? 'rgba(255,255,255,0.08)' : '#2b2d31',
                  border: type === 'voice' ? '1px solid #5865f2' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={24} color="#949ba4" />
                <div>
                  <div style={{ color: '#f2f3f5', fontWeight: '600', fontSize: '15px' }}>Voice</div>
                  <div style={{ color: '#949ba4', fontSize: '12px' }}>Hang out together with voice and audio</div>
                </div>
              </div>
            </div>
          </div>

          {/* Channel Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: '#b5bac1',
              marginBottom: '8px'
            }}>
              Channel Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="new-channel"
              className="input-field"
              required
              autoFocus
            />
          </div>

          {/* Topic */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: '#b5bac1',
              marginBottom: '8px'
            }}>
              Channel Topic (Optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Let everyone know what this channel is for"
              className="input-field"
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#2b2d31',
            margin: '0 -24px -24px',
            padding: '16px 24px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#dbdee1', fontSize: '14px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
