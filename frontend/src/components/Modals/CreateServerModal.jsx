import React, { useState } from 'react';
import { X, Server } from 'lucide-react';
import api from '../../services/api';

export default function CreateServerModal({ isOpen, onClose, onServerCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/servers', { name: name.trim(), description });
      onServerCreated(res.data.server);
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create server');
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
        width: '440px',
        maxWidth: '90vw',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 12px', textAlign: 'center', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#949ba4',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f2f3f5', marginBottom: '8px' }}>
            Customize your server
          </h2>
          <p style={{ color: '#949ba4', fontSize: '14px' }}>
            Give your new server a personality with a name and an optional description.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '12px 24px 24px' }}>
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: '#b5bac1',
              marginBottom: '8px'
            }}>
              Server Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Data Structures Study Club"
              className="input-field"
              required
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: '#b5bac1',
              marginBottom: '8px'
            }}>
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this server about?"
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
              style={{
                background: 'none',
                border: 'none',
                color: '#dbdee1',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Server'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
