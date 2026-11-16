import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ServerRail from '../components/Navigation/ServerRail';
import ChannelSidebar from '../components/Navigation/ChannelSidebar';
import ChatArea from '../components/Chat/ChatArea';
import MemberList from '../components/Chat/MemberList';
import CreateServerModal from '../components/Modals/CreateServerModal';
import CreateChannelModal from '../components/Modals/CreateChannelModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { serverId: urlServerId, channelId: urlChannelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [servers, setServers] = useState([]);
  const [activeServer, setActiveServer] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [members, setMembers] = useState([]);
  
  // Responsive sidebar toggles
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMemberListOpen, setIsMemberListOpen] = useState(window.innerWidth > 1024);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState(null);

  // Auto-hide member list on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth <= 1024) {
        setIsMemberListOpen(false);
      } else {
        setIsMemberListOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadServers = async () => {
    try {
      const res = await api.get('/servers');
      setServers(res.data.servers || []);
      if (res.data.servers?.length > 0 && !urlServerId) {
        handleSelectServer(res.data.servers[0].id);
      }
    } catch (err) {
      console.error('Fetch servers error:', err);
    }
  };

  useEffect(() => {
    loadServers();
  }, []);

  const handleSelectServer = async (serverId) => {
    try {
      const [hierRes, memRes] = await Promise.all([
        api.get(`/servers/${serverId}/hierarchy`),
        api.get(`/servers/${serverId}/members`)
      ]);

      setActiveServer(hierRes.data.server);
      setCategories(hierRes.data.hierarchy || []);
      setMembers(memRes.data.members || []);

      let firstCh = null;
      for (const cat of hierRes.data.hierarchy || []) {
        if (cat.channels && cat.channels.length > 0) {
          firstCh = cat.channels[0];
          break;
        }
      }
      setActiveChannel(firstCh);
      if (firstCh) {
        navigate(`/channels/${serverId}/${firstCh.id}`, { replace: true });
      }
    } catch (err) {
      console.error('Select server error:', err);
    }
  };

  useEffect(() => {
    if (urlServerId) {
      handleSelectServer(urlServerId);
    }
  }, [urlServerId]);

  const handleOpenCreateChannel = (catId) => {
    setTargetCategoryId(catId);
    setIsChannelModalOpen(true);
  };

  const handleChannelCreated = (newChannel) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === newChannel.categoryId) {
        return { ...cat, channels: [...(cat.channels || []), newChannel] };
      }
      return cat;
    }));
    setActiveChannel(newChannel);
    navigate(`/channels/${activeServer.id}/${newChannel.id}`);
  };

  const handleDeleteChannel = async (chId) => {
    try {
      await api.delete(`/servers/channels/${chId}`);
      setCategories(prev => prev.map(cat => ({
        ...cat,
        channels: (cat.channels || []).filter(c => c.id !== chId)
      })));
      if (activeChannel?.id === chId) {
        setActiveChannel(null);
      }
    } catch (e) {
      console.error('Delete channel error:', e);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && windowWidth <= 768 && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 40
          }}
        />
      )}

      {/* 1. Left Navigation (Server Rail + Channel Sidebar) - Rendered ONLY ONCE */}
      <div
        style={{
          display: (isMobileSidebarOpen || windowWidth > 768) ? 'flex' : 'none',
          height: '100vh',
          zIndex: 45,
          flexShrink: 0,
          position: windowWidth <= 768 ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          boxShadow: windowWidth <= 768 ? '4px 0 24px rgba(0,0,0,0.8)' : 'none'
        }}
      >
        <ServerRail
          servers={servers}
          activeServerId={activeServer?.id}
          onSelectServer={(id) => {
            handleSelectServer(id);
          }}
          onOpenCreateModal={() => setIsServerModalOpen(true)}
        />

        <ChannelSidebar
          server={activeServer}
          categories={categories}
          activeChannelId={activeChannel?.id}
          onSelectChannel={(ch) => {
            setActiveChannel(ch);
            navigate(`/channels/${activeServer.id}/${ch.id}`);
            if (windowWidth <= 768) setIsMobileSidebarOpen(false);
          }}
          onOpenCreateChannelModal={handleOpenCreateChannel}
          onDeleteChannel={handleDeleteChannel}
        />
      </div>

      {/* 2. Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', minWidth: 0 }}>
        {/* Mobile Hamburger Header (Visible only on <= 768px) */}
        {windowWidth <= 768 && (
          <div style={{
            display: 'flex',
            height: '48px',
            backgroundColor: '#2b2d31',
            padding: '0 16px',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0,0,0,0.2)',
            flexShrink: 0
          }}>
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#f2f3f5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span style={{ fontWeight: '700', fontSize: '15px', color: '#f2f3f5' }}>
              {activeServer ? activeServer.name : 'ConnectHub'}
            </span>
            <div style={{ width: '24px' }} />
          </div>
        )}

        <ChatArea
          channel={activeChannel}
          isMemberListOpen={isMemberListOpen}
          toggleMemberList={() => setIsMemberListOpen(!isMemberListOpen)}
        />
      </div>

      {/* 3. Right Member List Sidebar (Togglable) */}
      {isMemberListOpen && (
        <MemberList
          members={members}
          currentUserId={user?.id}
        />
      )}

      {/* Modals */}
      <CreateServerModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        onServerCreated={(newServer) => {
          setServers(prev => [newServer, ...prev]);
          handleSelectServer(newServer.id);
        }}
      />

      <CreateChannelModal
        isOpen={isChannelModalOpen}
        onClose={() => setIsChannelModalOpen(false)}
        serverId={activeServer?.id}
        categoryId={targetCategoryId}
        onChannelCreated={handleChannelCreated}
      />
    </div>
  );
}
