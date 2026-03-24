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

const initialEdges = [
  {
    id: 'e1-2',
    source: 'input',
    target: 'output',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 }
  }
];

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
      position: { x: 0, y: 50 },
      data: { value: '', onChange: () => { } },
    },
    {
      id: 'output',
      type: 'outputNode',
      position: { x: 700, y: 0 },
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
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const onInit = useCallback((instance) => {
    const initialNodes = instance.getNodes();
    const rfContainer = document.querySelector('.react-flow');
    if (!rfContainer || initialNodes.length === 0) return;

    const container = rfContainer.getBoundingClientRect();
    const { x: vX, y: vY, zoom } = instance.getViewport();

    // 1. Compute bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    initialNodes.forEach((node) => {
      const { x, y } = node.position;
      // Using known constants instead of measurement for stability during Init
      const w = 340;
      const h = 250;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });

    const nodesCenterX = (minX + maxX) / 2;
    const nodesCenterY = (minY + maxY) / 2;

    // 2. Viewport center in canvas space
    const viewportCenterX = (container.width / 2 - vX) / zoom;
    const viewportCenterY = (container.height / 2 - vY) / zoom;

    // 3. Offset
    const offsetX = viewportCenterX - nodesCenterX;
    const offsetY = viewportCenterY - nodesCenterY;

    // 4. Update positions once
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        position: {
          x: node.position.x + offsetX,
          y: node.position.y + offsetY,
        },
      }))
    );
  }, [setNodes]);

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
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc', overflow: 'hidden' }}>
      <header style={{
        padding: '12px 32px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <img src="/logo.png" alt="FlowAI logo" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600', letterSpacing: '-0.02em', color: '#111827' }}>FlowAI</h1>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <CustomModelSelector
            models={models}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            failedModels={failedModels}
          />

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

      <main style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={onInit}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background color="#cbd5e1" gap={24} size={1} variant="dots" />
          <Controls showInteractive={false} style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff' }} />
        </ReactFlow>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .react-flow__controls-button { background: #fff !important; transition: all 0.2s ease; }
        .react-flow__controls-button:hover { background: #f8fafc !important; }
        .react-flow__attribution { display: none; }
        @media (max-width: 950px) {
          header { flex-direction: column; gap: 16px; padding: 16px !important; }
          header > div { width: 100%; justify-content: space-between; }
        }
      `}</style>
    </div>
  );
}

export default function FlowBuilder() {
  return <FlowContent />;
}
