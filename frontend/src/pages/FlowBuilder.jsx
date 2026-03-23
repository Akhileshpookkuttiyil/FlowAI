import React, { useState, useCallback, useMemo } from 'react';
import { Play, Save } from 'lucide-react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api } from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import InputNode from '../features/flow/InputNode';
import OutputNode from '../features/flow/OutputNode';

const initialEdges = [{ id: 'e1-2', source: 'input', target: 'output', animated: true }];

export default function FlowBuilder() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModelsList] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [failedModels, setFailedModels] = useState(new Set());

  const nodeTypes = useMemo(() => ({ inputNode: InputNode, outputNode: OutputNode }), []);

  const initialNodes = useMemo(() => [
    {
      id: 'input',
      type: 'inputNode',
      position: { x: 50, y: 150 },
      data: { value: '', onChange: () => { } },
    },
    {
      id: 'output',
      type: 'outputNode',
      position: { x: 450, y: 150 },
      data: { value: '', isLoading: false },
    },
  ], []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get('/models');
        setModelsList(res.data.data || []);
      } catch (err) {
        console.error("Models fetch failed", err);
      }
    };
    fetchModels();
  }, []);

  const handlePromptChange = useCallback((value) => {
    setPrompt(value);
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'input'
          ? { ...node, data: { ...node.data, value } }
          : node
      )
    );
  }, [setNodes]);

  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'input'
          ? { ...node, data: { ...node.data, onChange: handlePromptChange } }
          : node
      )
    );
  }, [handlePromptChange, setNodes]);

  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'output'
          ? { ...node, data: { ...node.data, value: response, isLoading: isLoading } }
          : node
      )
    );
  }, [response, isLoading, setNodes]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleRunFlow = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first!', { style: { fontSize: '14px' } });
      return;
    }
    const currentModel = selectedModel || null;
    setIsLoading(true);
    setResponse('');
    try {
      const res = await api.post('/ask-ai', {
        prompt,
        modelId: currentModel
      });
      setResponse(res.data.data);
    } catch (error) {
      if (currentModel) {
        setFailedModels((prev) => new Set([...prev, currentModel]));
      }
      setResponse('Error: ' + (error.response?.data?.message || 'Failed to fetch AI response.'));
      toast.error(error.response?.data?.message || 'Failed to fetch AI response.', { style: { fontSize: '14px' } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!prompt || !response || response === 'Loading...' || response.startsWith('Error:')) {
      toast.error('Nothing valid to save!', { style: { fontSize: '14px' } });
      return;
    }
    try {
      await api.post('/save', { prompt, response });
      toast.success('Saved successfully to MongoDB!', { style: { fontSize: '14px' } });
    } catch (error) {
      toast.error('Failed to save to database.', { style: { fontSize: '14px' } });
    }
  };

  const canSave = response && !isLoading && !response.startsWith('Error:') && response !== 'Loading...';

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="app-header" style={{ padding: '12px 32px', background: '#ffffff', color: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', zIndex: 10, flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <img src="/logo.png" alt="FlowAI logo" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600', letterSpacing: '-0.02em' }}>FlowAI</h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#fff',
              color: '#374151',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            <option value="">Auto Select (Free Models)</option>
            {models.map((m) => (
              <option key={m.id} value={m.id} disabled={failedModels.has(m.id)}>
                {m.name || m.id} {failedModels.has(m.id) ? '(unavailable)' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={handleRunFlow}
            disabled={isLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', background: isLoading ? '#f3f4f6' : '#111827', color: isLoading ? '#9ca3af' : '#ffffff', border: '1px solid', borderColor: isLoading ? '#e5e7eb' : '#111827', borderRadius: '6px', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease' }}
          >
            <Play size={14} />
            {isLoading ? 'Executing...' : 'Run Flow'}
          </button>

          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', background: '#ffffff', color: !canSave ? '#9ca3af' : '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: !canSave ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
          >
            <Save size={14} />
            Save Record
          </button>
        </div>
      </header>
      <main style={{ flex: 1, position: 'relative', background: '#f9fafb' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#e5e7eb" gap={20} size={1.5} />
          <Controls style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: 'none', borderRadius: '6px' }} />
        </ReactFlow>
      </main>

      <style>{`
        @media (max-width: 640px) {
          .app-header {
            padding: 12px 16px !important;
            flex-direction: column;
            align-items: flex-start !important;
          }
          .app-header > div {
            width: 100%;
            justify-content: flex-start;
          }
          select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
