import React, { useState, useEffect } from 'react';
import { 
  Network, 
  GitBranch, 
  Layers, 
  Cpu, 
  RefreshCw, 
  Play, 
  Plus, 
  Trash2, 
  Search, 
  MoveRight, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import api from '../services/api';

export default function DataStructureLab() {
  const [activeTab, setActiveTab] = useState('tree'); // 'tree' | 'graph' | 'queue' | 'heap'
  const [data, setData] = useState({
    tree: [],
    graph: { vertices: [], edges: [], adjacencyList: {} },
    queue: { size: 0, isEmpty: true, messages: [] },
    heap: { size: 0, isEmpty: true, heap: [] }
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Form states
  const [treeForm, setTreeForm] = useState({ serverName: '', catName: '', serverId: '', chName: '', catId: '', chType: 'text', searchInput: '', moveChId: '', moveCatId: '' });
  const [graphForm, setGraphForm] = useState({ uId: '', uName: '', u1: '', u2: '', startBfs: '', startDfs: '' });
  const [queueForm, setQueueForm] = useState({ content: '', senderName: '' });
  const [heapForm, setHeapForm] = useState({ priority: '5', type: 'mention', content: '' });

  // Animation states
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [traversalResult, setTraversalResult] = useState(null);

  // Load all structures
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ds-lab/all');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load DS state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const executeAction = async (action, args = []) => {
    setLoading(true);
    setStatusMessage(`Executing C++ operation: ${action}...`);
    try {
      const res = await api.post('/ds-lab/execute', { action, args });
      setStatusMessage(`✅ ${action} executed successfully in C++ engine`);
      await loadData();
      return res.data;
    } catch (err) {
      setStatusMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- N-ARY TREE OPERATIONS ---
  const handleAddServer = async (e) => {
    e.preventDefault();
    if (!treeForm.serverName.trim()) return;
    await executeAction('tree_add_server', [treeForm.serverName.trim()]);
    setTreeForm(prev => ({ ...prev, serverName: '' }));
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!treeForm.serverId || !treeForm.catName.trim()) return;
    await executeAction('tree_add_category', [treeForm.serverId, treeForm.catName.trim()]);
    setTreeForm(prev => ({ ...prev, catName: '' }));
  };

  const handleAddChannel = async (e) => {
    e.preventDefault();
    if (!treeForm.catId || !treeForm.chName.trim()) return;
    await executeAction('tree_add_channel', [treeForm.catId, treeForm.chName.trim(), treeForm.chType]);
    setTreeForm(prev => ({ ...prev, chName: '' }));
  };

  const handleDeleteTreeNode = async (id) => {
    await executeAction('tree_delete_node', [id]);
  };

  const handleSearchTreeNode = async (e) => {
    e.preventDefault();
    if (!treeForm.searchInput.trim()) return;
    const res = await executeAction('tree_search', [treeForm.searchInput.trim()]);
    if (res?.data?.found) {
      setHighlightedNodes([res.data.id]);
      setStatusMessage(`Found node: ID ${res.data.id} (${res.data.name}, type: ${res.data.type})`);
    } else {
      setHighlightedNodes([]);
      setStatusMessage('Node not found in C++ N-ary Tree');
    }
  };

  const handleMoveChannel = async (e) => {
    e.preventDefault();
    if (!treeForm.moveChId || !treeForm.moveCatId) return;
    await executeAction('tree_move_channel', [treeForm.moveChId, treeForm.moveCatId]);
  };

  // --- GRAPH OPERATIONS ---
  const handleAddGraphUser = async (e) => {
    e.preventDefault();
    if (!graphForm.uId || !graphForm.uName.trim()) return;
    await executeAction('graph_add_user', [graphForm.uId, graphForm.uName.trim().toLowerCase()]);
    setGraphForm(prev => ({ ...prev, uId: '', uName: '' }));
  };

  const handleAddFriendship = async (e) => {
    e.preventDefault();
    if (!graphForm.u1 || !graphForm.u2) return;
    await executeAction('graph_add_friendship', [graphForm.u1, graphForm.u2]);
  };

  const handleRemoveFriendship = async (u1, u2) => {
    await executeAction('graph_remove_friendship', [u1, u2]);
  };

  const handleRunBfs = async (startId) => {
    const res = await executeAction('graph_bfs', [startId]);
    if (res?.data?.traversal) {
      setTraversalResult({ type: 'BFS', start: startId, order: res.data.traversal });
      animateTraversal(res.data.traversal);
    }
  };

  const handleRunDfs = async (startId) => {
    const res = await executeAction('graph_dfs', [startId]);
    if (res?.data?.traversal) {
      setTraversalResult({ type: 'DFS', start: startId, order: res.data.traversal });
      animateTraversal(res.data.traversal);
    }
  };

  const animateTraversal = (order) => {
    setHighlightedNodes([]);
    order.forEach((id, idx) => {
      setTimeout(() => {
        setHighlightedNodes(prev => [...prev, id]);
      }, idx * 600);
    });
  };

  // --- QUEUE OPERATIONS ---
  const handleEnqueue = async (e) => {
    e.preventDefault();
    if (!queueForm.content.trim()) return;
    const msgId = Date.now() % 100000;
    const timestamp = new Date().toLocaleTimeString();
    await executeAction('queue_enqueue', [
      msgId,
      1,
      100,
      queueForm.content.trim().replace(/"/g, "'"),
      timestamp,
      (queueForm.senderName.trim() || 'User').replace(/"/g, "'")
    ]);
    setQueueForm({ content: '', senderName: '' });
  };

  const handleDequeue = async () => {
    await executeAction('queue_dequeue');
  };

  // --- MAX HEAP OPERATIONS ---
  const handleInsertHeap = async (e) => {
    e.preventDefault();
    if (!heapForm.content.trim()) return;
    const id = Date.now() % 100000;
    const timestamp = new Date().toLocaleTimeString();
    await executeAction('heap_insert', [
      id,
      1,
      heapForm.priority,
      heapForm.type,
      heapForm.content.trim().replace(/"/g, "'"),
      timestamp
    ]);
    setHeapForm(prev => ({ ...prev, content: '' }));
  };

  const handleExtractMax = async () => {
    await executeAction('heap_extract_max');
  };

  // --- RENDER HELPERS ---
  const renderTreeNodes = (nodes) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {nodes.map(node => {
          const isHighlighted = highlightedNodes.includes(node.id);
          const typeColors = {
            server: '#5865f2',
            category: '#23a55a',
            text_channel: '#00b0f4',
            voice_channel: '#f0b232'
          };

          return (
            <div 
              key={node.id} 
              style={{
                marginLeft: node.parentId ? '24px' : '0',
                borderLeft: node.parentId ? '2px dashed rgba(255,255,255,0.15)' : 'none',
                paddingLeft: node.parentId ? '12px' : '0'
              }}
            >
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: isHighlighted ? 'rgba(88, 101, 242, 0.4)' : '#2b2d31',
                border: isHighlighted ? '2px solid #5865f2' : `1px solid ${typeColors[node.type]}40`,
                boxShadow: isHighlighted ? '0 0 12px rgba(88, 101, 242, 0.8)' : 'none',
                transition: 'all 0.2s'
              }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: `${typeColors[node.type]}25`,
                  color: typeColors[node.type]
                }}>
                  {node.type}
                </span>
                <span style={{ fontWeight: '600', color: '#f2f3f5', fontSize: '14px' }}>
                  {node.name}
                </span>
                <span style={{ fontSize: '11px', color: '#949ba4' }}>
                  (id: {node.id})
                </span>
                <button
                  onClick={() => handleDeleteTreeNode(node.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f23f43',
                    cursor: 'pointer',
                    padding: '2px',
                    marginLeft: '4px',
                    opacity: 0.7
                  }}
                  title="Delete node & subtree"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {node.children && node.children.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  {renderTreeNodes(node.children)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#1e1f22',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        height: '60px',
        padding: '0 24px',
        backgroundColor: '#2b2d31',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'rgba(240, 178, 50, 0.2)',
            color: '#f0b232',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cpu size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#f2f3f5' }}>
              ConnectHub C++ Data Structure Laboratory
            </h1>
            <p style={{ fontSize: '11px', color: '#949ba4' }}>
              Live interaction with native C++17 implementations: N-ary Tree, Graph, FIFO Queue, Max Heap
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh State
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        backgroundColor: '#232428',
        padding: '0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        gap: '8px'
      }}>
        {[
          { id: 'tree', label: '1. N-ary Tree (Hierarchy)', icon: <GitBranch size={16} /> },
          { id: 'graph', label: '2. Graph (Social Network & BFS/DFS)', icon: <Network size={16} /> },
          { id: 'queue', label: '3. Message Queue (FIFO)', icon: <Layers size={16} /> },
          { id: 'heap', label: '4. Max Heap (Priority Notifications)', icon: <Cpu size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setHighlightedNodes([]);
              setTraversalResult(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              color: activeTab === tab.id ? '#f2f3f5' : '#949ba4',
              borderBottom: activeTab === tab.id ? '2px solid #5865f2' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '700' : '500',
              fontSize: '14px',
              transition: 'all 0.15s'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status Bar */}
      {statusMessage && (
        <div style={{
          padding: '6px 24px',
          backgroundColor: '#111214',
          fontSize: '12px',
          color: '#00b0f4',
          fontFamily: 'monospace',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          {statusMessage}
        </div>
      )}

      {/* Tab Contents */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        
        {/* ========================================================== */}
        {/* TAB 1: N-ARY TREE                                          */}
        {/* ========================================================== */}
        {activeTab === 'tree' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
            {/* Visualizer Area */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f2f3f5' }}>
                  Server / Category / Channel Hierarchy Tree
                </h3>
                <span style={{ fontSize: '12px', color: '#949ba4' }}>
                  Roots: {data.tree.length}
                </span>
              </div>

              <div style={{
                backgroundColor: '#111214',
                padding: '20px',
                borderRadius: '8px',
                minHeight: '380px',
                overflowX: 'auto'
              }}>
                {data.tree.length === 0 ? (
                  <div style={{ color: '#949ba4', textAlign: 'center', padding: '40px' }}>
                    Tree is empty. Add a Server root node using the form on the right.
                  </div>
                ) : (
                  renderTreeNodes(data.tree)
                )}
              </div>

              {/* Complexity Banner */}
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: '6px',
                backgroundColor: 'rgba(88, 101, 242, 0.1)',
                border: '1px solid rgba(88, 101, 242, 0.3)',
                fontSize: '13px',
                color: '#dbdee1'
              }}>
                <div style={{ fontWeight: '700', color: '#5865f2', marginBottom: '4px' }}>
                  N-ary Tree Time & Space Complexity:
                </div>
                <div>• Insert Child: <strong>O(1)</strong> with known parent reference pointer</div>
                <div>• Delete Node: <strong>O(1)</strong> unlinking; <strong>O(k)</strong> where k = subtree size</div>
                <div>• Search by Name/ID: <strong>O(n)</strong> traversal across hierarchy</div>
                <div>• Move Channel: <strong>O(1)</strong> pointer reassignment between category siblings</div>
              </div>
            </div>

            {/* Controls Side Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Add Server */}
              <div className="glass-card" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f2f3f5', marginBottom: '10px' }}>
                  Add Server (Root Node)
                </h4>
                <form onSubmit={handleAddServer} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={treeForm.serverName}
                    onChange={(e) => setTreeForm(prev => ({ ...prev, serverName: e.target.value }))}
                    placeholder="Server name"
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Add
                  </button>
                </form>
              </div>

              {/* Add Category */}
              <div className="glass-card" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f2f3f5', marginBottom: '10px' }}>
                  Add Category
                </h4>
                <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="number"
                    value={treeForm.serverId}
                    onChange={(e) => setTreeForm(prev => ({ ...prev, serverId: e.target.value }))}
                    placeholder="Parent Server ID"
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                  />
                  <input
                    type="text"
                    value={treeForm.catName}
                    onChange={(e) => setTreeForm(prev => ({ ...prev, catName: e.target.value }))}
                    placeholder="Category name"
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Add Category
                  </button>
                </form>
              </div>

              {/* Add Channel */}
              <div className="glass-card" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f2f3f5', marginBottom: '10px' }}>
                  Add Channel
                </h4>
                <form onSubmit={handleAddChannel} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="number"
                    value={treeForm.catId}
                    onChange={(e) => setTreeForm(prev => ({ ...prev, catId: e.target.value }))}
                    placeholder="Parent Category ID"
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                  />
                  <input
                    type="text"
                    value={treeForm.chName}
                    onChange={(e) => setTreeForm(prev => ({ ...prev, chName: e.target.value }))}
                    placeholder="Channel name"
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                  />
                  <select
                    value={treeForm.chType}
                    onChange={(e) => setTreeForm(prev => ({ ...prev, chType: e.target.value }))}
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                  >
                    <option value="text">Text Channel</option>
                    <option value="voice">Voice Channel</option>
                  </select>
                  <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Add Channel
                  </button>
                </form>
              </div>

              {/* Search Node */}
              <div className="glass-card" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f2f3f5', marginBottom: '10px' }}>
                  Search Node (ID or Name)
                </h4>
                <form onSubmit={handleSearchTreeNode} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={treeForm.searchInput}
                    onChange={(e) => setTreeForm(prev => ({ ...prev, searchInput: e.target.value }))}
                    placeholder="Node ID or Name"
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                  />
                  <button type="submit" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                    <Search size={14} />
                  </button>
                </form>
              </div>

              {/* Move Channel */}
              <div className="glass-card" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f2f3f5', marginBottom: '10px' }}>
                  Move Channel
                </h4>
                <form onSubmit={handleMoveChannel} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="number"
                    value={treeForm.moveChId}
                    onChange={(e) => setTreeForm(prev => ({ ...prev, moveChId: e.target.value }))}
                    placeholder="Channel ID"
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                  />
                  <input
                    type="number"
                    value={treeForm.moveCatId}
                    onChange={(e) => setTreeForm(prev => ({ ...prev, moveCatId: e.target.value }))}
                    placeholder="New Category ID"
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                  />
                  <button type="submit" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Move Channel
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: GRAPH (SOCIAL RELATIONSHIPS & BFS/DFS)               */}
        {/* ========================================================== */}
        {activeTab === 'graph' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f2f3f5' }}>
                  Social Network Graph (Adjacency List)
                </h3>
                <div style={{ fontSize: '12px', color: '#949ba4' }}>
                  |V| = {data.graph.vertices?.length || 0} vertices, |E| = {data.graph.edges?.length || 0} edges
                </div>
              </div>

              {/* Graph canvas / interactive node map */}
              <div style={{
                backgroundColor: '#111214',
                borderRadius: '8px',
                height: '400px',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <svg style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                  {/* Draw edges */}
                  {(data.graph.edges || []).map((edge, idx) => {
                    const u1Index = data.graph.vertices.findIndex(v => v.id === edge.from);
                    const u2Index = data.graph.vertices.findIndex(v => v.id === edge.to);
                    if (u1Index === -1 || u2Index === -1) return null;

                    const total = data.graph.vertices.length;
                    const cx1 = 280 + 160 * Math.cos((u1Index / total) * 2 * Math.PI);
                    const cy1 = 200 + 140 * Math.sin((u1Index / total) * 2 * Math.PI);
                    const cx2 = 280 + 160 * Math.cos((u2Index / total) * 2 * Math.PI);
                    const cy2 = 200 + 140 * Math.sin((u2Index / total) * 2 * Math.PI);

                    return (
                      <line
                        key={idx}
                        x1={cx1}
                        y1={cy1}
                        x2={cx2}
                        y2={cy2}
                        stroke="#5865f2"
                        strokeWidth="2"
                        strokeOpacity="0.6"
                      />
                    );
                  })}

                  {/* Draw vertices */}
                  {(data.graph.vertices || []).map((vertex, idx) => {
                    const total = data.graph.vertices.length;
                    const cx = 280 + 160 * Math.cos((idx / total) * 2 * Math.PI);
                    const cy = 200 + 140 * Math.sin((idx / total) * 2 * Math.PI);
                    const isHighlighted = highlightedNodes.includes(vertex.id);

                    return (
                      <g key={vertex.id} style={{ cursor: 'pointer' }} onClick={() => handleRunBfs(vertex.id)}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isHighlighted ? 26 : 22}
                          fill={isHighlighted ? '#f0b232' : '#2b2d31'}
                          stroke={isHighlighted ? '#ffffff' : '#5865f2'}
                          strokeWidth={isHighlighted ? 3 : 2}
                          style={{ transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        />
                        <text
                          x={cx}
                          y={cy + 4}
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {vertex.username ? vertex.username.slice(0, 4) : vertex.id}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Traversal Result Card */}
              {traversalResult && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(240, 178, 50, 0.15)',
                  border: '1px solid rgba(240, 178, 50, 0.4)',
                  fontSize: '14px',
                  color: '#f0b232',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <strong>{traversalResult.type} Traversal Order:</strong>
                  <span>{traversalResult.order.join(' → ')}</span>
                </div>
              )}

              {/* Adjacency List display */}
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#b5bac1', marginBottom: '8px' }}>
                  C++ Adjacency List Representation:
                </h4>
                <div style={{
                  backgroundColor: '#111214',
                  padding: '12px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#00b0f4'
                }}>
                  {Object.entries(data.graph.adjacencyList || {}).map(([uId, neighbors]) => (
                    <div key={uId}>
                      User {uId} → [ {neighbors.join(', ')} ]
                    </div>
                  ))}
                </div>
              </div>

              {/* Complexity Banner */}
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: '6px',
                backgroundColor: 'rgba(88, 101, 242, 0.1)',
                border: '1px solid rgba(88, 101, 242, 0.3)',
                fontSize: '13px',
                color: '#dbdee1'
              }}>
                <div style={{ fontWeight: '700', color: '#5865f2', marginBottom: '4px' }}>
                  Graph Time & Space Complexity:
                </div>
                <div>• Add Vertex / Edge: <strong>O(1)</strong> average using hash map adjacency list</div>
                <div>• BFS (Breadth-First Search): <strong>O(V + E)</strong> time, <strong>O(V)</strong> space</div>
                <div>• DFS (Depth-First Search): <strong>O(V + E)</strong> time, <strong>O(V)</strong> space</div>
                <div>• Mutual Friends: <strong>O(deg(u) + deg(v))</strong> set intersection</div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Add User Vertex */}
              <div className="glass-card" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f2f3f5', marginBottom: '10px' }}>
                  Add User Vertex
                </h4>
                <form onSubmit={handleAddGraphUser} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="number"
                    value={graphForm.uId}
                    onChange={(e) => setGraphForm(prev => ({ ...prev, uId: e.target.value }))}
                    placeholder="User ID"
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                  />
                  <input
                    type="text"
                    value={graphForm.uName}
                    onChange={(e) => setGraphForm(prev => ({ ...prev, uName: e.target.value }))}
                    placeholder="Username"
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Add Vertex
                  </button>
                </form>
              </div>

              {/* Add Friendship Edge */}
              <div className="glass-card" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f2f3f5', marginBottom: '10px' }}>
                  Add Friendship Edge
                </h4>
                <form onSubmit={handleAddFriendship} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="number"
                    value={graphForm.u1}
                    onChange={(e) => setGraphForm(prev => ({ ...prev, u1: e.target.value }))}
                    placeholder="User 1 ID"
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                  />
                  <input
                    type="number"
                    value={graphForm.u2}
                    onChange={(e) => setGraphForm(prev => ({ ...prev, u2: e.target.value }))}
                    placeholder="User 2 ID"
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Connect Edge
                  </button>
                </form>
              </div>

              {/* Run BFS / DFS */}
              <div className="glass-card" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f2f3f5', marginBottom: '10px' }}>
                  Run Graph Traversals
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="number"
                    value={graphForm.startBfs}
                    onChange={(e) => setGraphForm(prev => ({ ...prev, startBfs: e.target.value }))}
                    placeholder="Start User ID"
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleRunBfs(graphForm.startBfs || 1)}
                      className="btn-primary"
                      style={{ flex: 1, padding: '8px', fontSize: '13px' }}
                    >
                      Run BFS
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRunDfs(graphForm.startBfs || 1)}
                      className="btn-secondary"
                      style={{ flex: 1, padding: '8px', fontSize: '13px' }}
                    >
                      Run DFS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: MESSAGE QUEUE (FIFO)                                */}
        {/* ========================================================== */}
        {activeTab === 'queue' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f2f3f5' }}>
                  FIFO Message Processing Queue
                </h3>
                <div style={{ fontSize: '12px', color: '#949ba4' }}>
                  Queue Size: {data.queue.size} | Empty: {data.queue.isEmpty ? 'Yes' : 'No'}
                </div>
              </div>

              {/* Horizontal Conveyor Display */}
              <div style={{
                backgroundColor: '#111214',
                borderRadius: '8px',
                padding: '24px',
                minHeight: '260px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                overflowX: 'auto',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                {data.queue.messages && data.queue.messages.length > 0 ? (
                  data.queue.messages.map((msg, idx) => {
                    const isFront = idx === 0;
                    const isRear = idx === data.queue.messages.length - 1;

                    return (
                      <div key={msg.messageId} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        {/* FRONT pointer */}
                        {isFront && (
                          <div style={{
                            position: 'absolute',
                            top: '-26px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: '#23a55a',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            ▼ FRONT
                          </div>
                        )}

                        {/* REAR pointer */}
                        {isRear && (
                          <div style={{
                            position: 'absolute',
                            bottom: '-26px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: '#00b0f4',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            ▲ REAR
                          </div>
                        )}

                        <div style={{
                          width: '180px',
                          padding: '14px',
                          borderRadius: '8px',
                          backgroundColor: isFront ? '#5865f2' : '#2b2d31',
                          border: isFront ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.1)',
                          boxShadow: isFront ? '0 0 16px rgba(88, 101, 242, 0.6)' : 'none',
                          color: '#fff',
                          flexShrink: 0,
                          transition: 'all 0.3s'
                        }}>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
                            #{msg.messageId} • {msg.senderName}
                          </div>
                          <div style={{ fontWeight: '600', fontSize: '14px', wordBreak: 'break-word' }}>
                            "{msg.content}"
                          </div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
                            {msg.timestamp}
                          </div>
                        </div>

                        {idx < data.queue.messages.length - 1 && (
                          <ArrowRight size={20} color="#4e5058" style={{ margin: '0 8px', flexShrink: 0 }} />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div style={{ color: '#949ba4', margin: 'auto', textAlign: 'center' }}>
                    Queue is currently empty. Enqueue a message to view FIFO ordering.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={handleDequeue}
                  disabled={data.queue.isEmpty}
                  className="btn-danger"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <MoveRight size={16} />
                  Dequeue (Process Message)
                </button>
              </div>

              {/* Complexity Banner */}
              <div style={{
                marginTop: '20px',
                padding: '12px 16px',
                borderRadius: '6px',
                backgroundColor: 'rgba(88, 101, 242, 0.1)',
                border: '1px solid rgba(88, 101, 242, 0.3)',
                fontSize: '13px',
                color: '#dbdee1'
              }}>
                <div style={{ fontWeight: '700', color: '#5865f2', marginBottom: '4px' }}>
                  Queue (FIFO) Time & Space Complexity:
                </div>
                <div>• Enqueue (insert at rear): <strong>O(1)</strong></div>
                <div>• Dequeue (remove from front): <strong>O(1)</strong></div>
                <div>• Peek (inspect front item): <strong>O(1)</strong></div>
                <div>• Guarantee: Strict First-In First-Out delivery order across concurrent clients</div>
              </div>
            </div>

            {/* Controls */}
            <div className="glass-card" style={{ padding: '16px', height: 'fit-content' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f2f3f5', marginBottom: '12px' }}>
                Enqueue Message
              </h4>
              <form onSubmit={handleEnqueue} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#b5bac1', marginBottom: '4px' }}>
                    Sender Name
                  </label>
                  <input
                    type="text"
                    value={queueForm.senderName}
                    onChange={(e) => setQueueForm(prev => ({ ...prev, senderName: e.target.value }))}
                    placeholder="e.g. Alice"
                    className="input-field"
                    style={{ fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#b5bac1', marginBottom: '4px' }}>
                    Message Content
                  </label>
                  <textarea
                    value={queueForm.content}
                    onChange={(e) => setQueueForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Type message to enqueue..."
                    rows={3}
                    className="input-field"
                    style={{ fontSize: '13px', resize: 'none' }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '8px' }}>
                  Enqueue Message
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: MAX HEAP (PRIORITY QUEUE)                           */}
        {/* ========================================================== */}
        {activeTab === 'heap' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f2f3f5' }}>
                  Binary Max Heap (Notification Priority Queue)
                </h3>
                <div style={{ fontSize: '12px', color: '#949ba4' }}>
                  Heap Size: {data.heap.size} | Root Priority: {data.heap.heap?.[0]?.priority || 'N/A'}
                </div>
              </div>

              {/* Tree View of Binary Heap */}
              <div style={{
                backgroundColor: '#111214',
                borderRadius: '8px',
                padding: '24px',
                minHeight: '280px',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                  {data.heap.heap && data.heap.heap.length > 0 ? (
                    [0, 1, 2, 3].map(level => {
                      const startIndex = Math.pow(2, level) - 1;
                      const endIndex = Math.min(Math.pow(2, level + 1) - 1, data.heap.heap.length);
                      if (startIndex >= data.heap.heap.length) return null;

                      const levelNodes = data.heap.heap.slice(startIndex, endIndex);

                      return (
                        <div key={level} style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                          {levelNodes.map(node => {
                            const isRoot = node.index === 0;
                            const priorityColors = {
                              5: '#f23f43',
                              4: '#f0b232',
                              3: '#5865f2',
                              2: '#00b0f4',
                              1: '#80848e'
                            };

                            return (
                              <div
                                key={node.id}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: '8px',
                                  backgroundColor: isRoot ? '#23a55a' : '#2b2d31',
                                  border: `2px solid ${priorityColors[node.priority]}`,
                                  boxShadow: isRoot ? '0 0 16px rgba(35, 165, 90, 0.6)' : 'none',
                                  color: '#fff',
                                  textAlign: 'center',
                                  minWidth: '110px'
                                }}
                              >
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
                                  idx [{node.index}] • {node.type}
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: '800', margin: '2px 0' }}>
                                  P{node.priority}
                                </div>
                                <div style={{ fontSize: '11px', color: '#dbdee1', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {node.content}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ color: '#949ba4', margin: 'auto' }}>
                      Max Heap is empty. Insert notifications with priorities 1 to 5.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={handleExtractMax}
                  disabled={data.heap.isEmpty}
                  className="btn-danger"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Trash2 size={16} />
                  Extract Maximum (Pop Highest Priority)
                </button>
              </div>

              {/* Array Representation */}
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#b5bac1', marginBottom: '8px' }}>
                  Sequential Array Representation (with Parent/Child Pointer Math):
                </h4>
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  padding: '8px',
                  backgroundColor: '#111214',
                  borderRadius: '6px'
                }}>
                  {(data.heap.heap || []).map(node => (
                    <div
                      key={node.index}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#2b2d31',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ fontSize: '10px', color: '#949ba4' }}>[{node.index}]</div>
                      <div style={{ fontWeight: '700', color: '#f0b232' }}>P{node.priority}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complexity Banner */}
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: '6px',
                backgroundColor: 'rgba(88, 101, 242, 0.1)',
                border: '1px solid rgba(88, 101, 242, 0.3)',
                fontSize: '13px',
                color: '#dbdee1'
              }}>
                <div style={{ fontWeight: '700', color: '#5865f2', marginBottom: '4px' }}>
                  Max Heap Time & Space Complexity:
                </div>
                <div>• Insert Element: <strong>O(log n)</strong> via Heapify-Up</div>
                <div>• Extract Maximum: <strong>O(log n)</strong> via Heapify-Down</div>
                <div>• Peek Maximum: <strong>O(1)</strong> root access</div>
                <div>• Build Heap from Array: <strong>O(n)</strong> Floyd's algorithm</div>
              </div>
            </div>

            {/* Controls */}
            <div className="glass-card" style={{ padding: '16px', height: 'fit-content' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f2f3f5', marginBottom: '12px' }}>
                Insert Notification
              </h4>
              <form onSubmit={handleInsertHeap} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#b5bac1', marginBottom: '4px' }}>
                    Priority Level (5 = Highest)
                  </label>
                  <select
                    value={heapForm.priority}
                    onChange={(e) => setHeapForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="input-field"
                    style={{ fontSize: '13px' }}
                  >
                    <option value="5">Priority 5: Direct Mention (@mention)</option>
                    <option value="4">Priority 4: Direct Message (DM)</option>
                    <option value="3">Priority 3: Friend Request</option>
                    <option value="2">Priority 2: Server Announcement</option>
                    <option value="1">Priority 1: General Update</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#b5bac1', marginBottom: '4px' }}>
                    Type
                  </label>
                  <input
                    type="text"
                    value={heapForm.type}
                    onChange={(e) => setHeapForm(prev => ({ ...prev, type: e.target.value }))}
                    placeholder="mention, dm, etc."
                    className="input-field"
                    style={{ fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#b5bac1', marginBottom: '4px' }}>
                    Notification Content
                  </label>
                  <input
                    type="text"
                    value={heapForm.content}
                    onChange={(e) => setHeapForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Notification message..."
                    className="input-field"
                    style={{ fontSize: '13px' }}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ padding: '8px' }}>
                  Insert into Max Heap
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
