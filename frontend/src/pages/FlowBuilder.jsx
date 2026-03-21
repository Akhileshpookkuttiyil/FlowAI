import React, { useState, useCallback, useMemo } from 'react';
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

  const nodeTypes = useMemo(() => ({ inputNode: InputNode, outputNode: OutputNode }), []);

  // FIX 1: Wrap initialNodes in useMemo so it's only created once,
  // keeping the onChange reference stable across renders.
  const initialNodes = useMemo(() => [
    {
      id: 'input',
      type: 'inputNode',
      position: { x: 50, y: 150 },
      data: { value: '', onChange: () => {} },
    },
    {
      id: 'output',
      type: 'outputNode',
      position: { x: 450, y: 150 },
      data: { value: '' },
    },
  ], []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // FIX 2: Use a stable useCallback for onChange so it never goes stale
  // even as prompt state updates.
  const handlePromptChange = useCallback((value) => {
    setPrompt(value);
    // FIX 3: Update node data correctly — always return a NEW object
    // so React Flow detects the change and re-renders the node.
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'input'
          ? { ...node, data: { ...node.data, value } }
          : node
      )
    );
  }, [setNodes]);

  // Inject the stable callback into the input node once on mount
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'input'
          ? { ...node, data: { ...node.data, onChange: handlePromptChange } }
          : node
      )
    );
  }, [handlePromptChange, setNodes]);

  // Sync response text into the output node correctly (new object reference)
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'output'
          ? { ...node, data: { ...node.data, value: response } }
          : node
      )
    );
  }, [response, setNodes]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleRunFlow = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first!', { style: { fontSize: '14px' } });
      return;
    }
    setIsLoading(true);
    setResponse('Loading...');
    try {
      const res = await api.post('/ask-ai', { prompt });
      setResponse(res.data.data);
      toast.success('AI generated response!', { style: { fontSize: '14px' } });
    } catch (error) {
      console.error(error);
      setResponse('Error generating response.');
      toast.error('Failed to fetch AI response.', { style: { fontSize: '14px' } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!prompt || !response || response === 'Loading...' || response === 'Error generating response.') {
      toast.error('Nothing valid to save!', { style: { fontSize: '14px' } });
      return;
    }
    try {
      await api.post('/save', { prompt, response });
      toast.success('Saved successfully to MongoDB!', { style: { fontSize: '14px' } });
    } catch (error) {
      console.error(error);
      toast.error('Failed to save to database.', { style: { fontSize: '14px' } });
    }
  };

  const canSave = response && !isLoading && response !== 'Error generating response.' && response !== 'Loading...';

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ padding: '16px 32px', background: '#ffffff', color: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600', letterSpacing: '-0.02em' }}>FlowAI Builder</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleRunFlow}
            disabled={isLoading}
            style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '500', background: isLoading ? '#f3f4f6' : '#111827', color: isLoading ? '#9ca3af' : '#ffffff', border: '1px solid', borderColor: isLoading ? '#e5e7eb' : '#111827', borderRadius: '6px', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease' }}
          >
            {isLoading ? 'Executing...' : 'Run Flow'}
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '500', background: '#ffffff', color: !canSave ? '#9ca3af' : '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: !canSave ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
          >
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
    </div>
  );
}
