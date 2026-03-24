import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { motion } from 'framer-motion';
import { api } from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import InputNode from '../features/flow/InputNode';
import OutputNode from '../features/flow/OutputNode';
import CustomModelSelector from '../features/flow/CustomModelSelector';

const initialEdges = [{ id: 'e1-2', source: 'input', target: 'output', animated: true }];

function FlowContent() {
  const MotionButton = motion.button;
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
      position: { x: 200, y: 220 },
      data: { value: '', onChange: () => { } },
    },
    {
      id: 'output',
      type: 'outputNode',
      position: { x: 750, y: 220 },
      data: { value: '', isLoading: false },
    },
  ], []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
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
        node.id === 'input' ? { ...node, data: { ...node.data, value } } : node
      )
    );
  }, [setNodes]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'input' ? { ...node, data: { ...node.data, onChange: handlePromptChange } } : node
      )
    );
  }, [handlePromptChange, setNodes]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'output' ? { ...node, data: { ...node.data, value: response, isLoading: isLoading } } : node
      )
    );
  }, [response, isLoading, setNodes]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleRunFlow = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first!', {
        style: { fontSize: '13px', borderRadius: '10px', background: '#333', color: '#fff' }
      });
      return;
    }
    const currentModel = selectedModel || null;
    setIsLoading(true);
    setResponse('');
    try {
      const res = await api.post('/ask-ai', { prompt, modelId: currentModel });
      setResponse(res.data.data);
      toast.success('Response generated successfully!');
    } catch (error) {
      if (currentModel) setFailedModels((prev) => new Set([...prev, currentModel]));
      setResponse('Error: ' + (error.response?.data?.message || 'Failed to fetch AI response.'));
      toast.error(error.response?.data?.message || 'Failed to fetch AI response.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!prompt || !response || response === 'Loading...' || response.startsWith('Error:')) {
      toast.error('Nothing valid to save!');
      return;
    }
    try {
      await api.post('/save', { prompt, response });
      toast.success('Saved to History!');
    } catch {
      toast.error('Failed to save to database.');
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
          <div className="model-selector-wrap" style={{ minWidth: '200px' }}>
            <CustomModelSelector
              models={models}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              failedModels={failedModels}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <MotionButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRunFlow}
              disabled={isLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', background: isLoading ? '#f1f5f9' : '#111827', color: isLoading ? '#94a3b8' : '#ffffff', border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              <Play size={14} fill="currentColor" />
              {isLoading ? 'Executing...' : 'Run Flow'}
            </MotionButton>

            <MotionButton
              whileHover={{ scale: 1.05, background: '#f8fafc' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={!canSave}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', background: '#ffffff', color: !canSave ? '#94a3b8' : '#334155', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: !canSave ? 'not-allowed' : 'pointer' }}
            >
              <Save size={14} />
              Save Record
            </MotionButton>
          </div>
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
          .model-selector-wrap {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default function FlowBuilder() {
  return <FlowContent />;
}
