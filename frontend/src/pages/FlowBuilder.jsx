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
import { getApiErrorMessage } from '../utils/api';
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
      data: {},
    },
    {
      id: 'output',
      type: 'outputNode',
      position: { x: 700, y: 0 },
      data: {},
    },
  ], []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get('/models');
        setModelsList(res.data.response || []);
      } catch (err) {
        const message = getApiErrorMessage(err, 'Failed to load available models.');
        console.error('Models fetch failed', err);
        toast.error(message);
      }
    };
    fetchModels();
  }, []);

  const handlePromptChange = useCallback((value) => {
    setPrompt(value);
  }, []);

  const flowNodes = useMemo(
    () =>
      nodes.map((node) => {
        if (node.id === 'input') {
          return {
            ...node,
            data: {
              ...node.data,
              value: prompt,
              onChange: handlePromptChange,
            },
          };
        }

        if (node.id === 'output') {
          return {
            ...node,
            data: {
              ...node.data,
              value: response,
              isLoading,
            },
          };
        }

        return node;
      }),
    [nodes, prompt, response, isLoading, handlePromptChange]
  );

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
      toast.error('Please enter a prompt first!');
      return;
    }
    const currentModel = selectedModel || null;
    setIsLoading(true);
    setResponse('');
    try {
      const res = await api.post('/ask-ai', { prompt, modelId: currentModel });
      setResponse(res.data.response);
      toast.success('Response generated successfully!');
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to fetch AI response.');
      if (currentModel) setFailedModels((prev) => new Set([...prev, currentModel]));
      setResponse(`Error: ${message}`);
      toast.error(message);
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
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save to database.'));
    }
  };

  const canSave = Boolean(response && !isLoading && !response.startsWith('Error:') && response !== 'Loading...');

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <img className="app-brand__logo" src="/logo.png" alt="FlowAI logo" />
          <div>
            <h1 className="app-brand__title">FlowAI</h1>
            <p className="app-brand__subtitle">Visual AI workflow studio</p>
          </div>
        </div>

        <div className="app-toolbar">
          <CustomModelSelector
            models={models}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            failedModels={failedModels}
          />

          <div className="app-toolbar-divider" />

          <div className="app-toolbar-group">
            <MotionButton
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onClick={handleRunFlow}
              disabled={isLoading}
              className="app-control app-button app-button--primary"
              type="button"
            >
              <Play size={16} />
              {isLoading ? 'Executing...' : 'Run Flow'}
            </MotionButton>

            <MotionButton
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onClick={handleSave}
              disabled={!canSave}
              className="app-control app-button app-button--secondary"
              type="button"
            >
              <Save size={16} />
              Save Record
            </MotionButton>
          </div>
        </div>
      </header>

      <main className="app-main">
        <ReactFlow
          nodes={flowNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={onInit}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background color="#cbd5e1" gap={24} size={1} variant="dots" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </main>
    </div>
  );
}

export default function FlowBuilder() {
  return <FlowContent />;
}
