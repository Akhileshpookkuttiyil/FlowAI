import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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

const MOBILE_BREAKPOINT = 768;
const DESKTOP_NODE_WIDTH = 340;
const MOBILE_NODE_WIDTH = 280;
const NODE_HEIGHT = 188;
const DESKTOP_MIN_GAP = 120;
const DESKTOP_MAX_GAP = 320;
const DESKTOP_GAP_RATIO = 0.16;
const DESKTOP_PADDING = 24;
const DESKTOP_OFFSET_X = 42;
const DESKTOP_OFFSET_Y = 18;
const DESKTOP_OUTPUT_EXTRA_X = 220;
const DESKTOP_OUTPUT_Y_OFFSET = -40;
const MOBILE_SIDE_PADDING = 16;
const MOBILE_TOP_PADDING = 24;
const MOBILE_X_OFFSET = 44;
const MOBILE_NODE_HEIGHT = 188;
const MOBILE_STACK_GAP = 44;

const initialEdges = [
  {
    id: 'e1-2',
    source: 'input',
    target: 'output',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 }
  }
];

const getViewportSize = () => {
  if (typeof window === 'undefined') {
    return { width: 1280, height: 720 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getResponsiveNodeLayout = ({ width, height, isMobile }) => {
  const safeWidth = Math.max(width, 0);
  const safeHeight = Math.max(height, 0);

  if (isMobile) {
    const baseInputX = Math.max((safeWidth - MOBILE_NODE_WIDTH) / 2, MOBILE_SIDE_PADDING);
    const maxMobileX = Math.max(safeWidth - MOBILE_NODE_WIDTH - MOBILE_SIDE_PADDING, MOBILE_SIDE_PADDING);
    const inputX = clamp(baseInputX + MOBILE_X_OFFSET, MOBILE_SIDE_PADDING, maxMobileX);
    const inputY = MOBILE_TOP_PADDING;

    return {
      input: { x: inputX, y: inputY },
      output: { x: inputX, y: inputY + MOBILE_NODE_HEIGHT + MOBILE_STACK_GAP },
    };
  }

  const gap = clamp(safeWidth * DESKTOP_GAP_RATIO, DESKTOP_MIN_GAP, DESKTOP_MAX_GAP);
  const totalWidth = DESKTOP_NODE_WIDTH * 2 + gap;
  const startX = Math.max((safeWidth - totalWidth) / 2 + DESKTOP_OFFSET_X, DESKTOP_PADDING);
  const centeredY = Math.max((safeHeight - NODE_HEIGHT) / 2 + DESKTOP_OFFSET_Y, DESKTOP_PADDING);

  return {
    input: { x: startX, y: centeredY },
    output: {
      x: startX + DESKTOP_NODE_WIDTH + gap + DESKTOP_OUTPUT_EXTRA_X,
      y: centeredY + DESKTOP_OUTPUT_Y_OFFSET,
    },
  };
};

function FlowContent() {
  const MODEL_FETCH_MAX_ATTEMPTS = 4;
  const MODEL_FETCH_RETRY_DELAY_MS = 1500;
  const MotionButton = motion.button;
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModelsList] = useState([]);
  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [failedModels, setFailedModels] = useState(new Set());
  const [viewportSize, setViewportSize] = useState(getViewportSize);
  const flowContainerRef = useRef(null);
  const isFetchingModelsRef = useRef(false);
  const shouldRetryModelsRef = useRef(true);
  const reactFlowInstanceRef = useRef(null);
  const pendingViewportFrameRef = useRef(null);
  const lastMobileViewportKeyRef = useRef('');
  const isMobile = viewportSize.width < MOBILE_BREAKPOINT;

  const nodeTypes = useMemo(() => ({ inputNode: InputNode, outputNode: OutputNode }), []);

  const initialNodes = useMemo(() => {
    const initialViewport = getViewportSize();
    const initialIsMobile = initialViewport.width < MOBILE_BREAKPOINT;
    const initialLayout = getResponsiveNodeLayout({
      width: initialViewport.width,
      height: initialViewport.height,
      isMobile: initialIsMobile,
    });

    return [
      {
        id: 'input',
        type: 'inputNode',
        position: initialLayout.input,
        data: {},
      },
      {
        id: 'output',
        type: 'outputNode',
        position: initialLayout.output,
        data: {},
      },
    ];
  }, []);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const fetchModels = useCallback(async ({ showErrorToast = true, retryUntilLoaded = false } = {}) => {
    if (isFetchingModelsRef.current) {
      return;
    }

    isFetchingModelsRef.current = true;
    setIsModelsLoading(true);

    try {
      let loadedModels = [];
      let lastError = null;

      for (let attempt = 1; attempt <= MODEL_FETCH_MAX_ATTEMPTS; attempt += 1) {
        try {
          const res = await api.get('/models');
          loadedModels = res.data.response || [];

          if (loadedModels.length > 0 || !retryUntilLoaded || !shouldRetryModelsRef.current) {
            break;
          }
        } catch (err) {
          lastError = err;

          if (!retryUntilLoaded || attempt === MODEL_FETCH_MAX_ATTEMPTS || !shouldRetryModelsRef.current) {
            throw err;
          }
        }

        if (attempt < MODEL_FETCH_MAX_ATTEMPTS && shouldRetryModelsRef.current) {
          await new Promise((resolve) => setTimeout(resolve, MODEL_FETCH_RETRY_DELAY_MS));
        }
      }

      if (loadedModels.length === 0 && lastError) {
        throw lastError;
      }

      setModelsList(loadedModels);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to load available models.');
      console.error('Models fetch failed', err);

      if (showErrorToast) {
        toast.error(message);
      }
    } finally {
      isFetchingModelsRef.current = false;
      setIsModelsLoading(false);
    }
  }, [MODEL_FETCH_MAX_ATTEMPTS, MODEL_FETCH_RETRY_DELAY_MS]);

  useEffect(() => {
    fetchModels({ retryUntilLoaded: true });

    return () => {
      shouldRetryModelsRef.current = false;
    };
  }, [fetchModels]);

  useEffect(() => {
    const element = flowContainerRef.current;

    if (!element) {
      return undefined;
    }

    let frameId = null;

    const measure = () => {
      const next = {
        width: element.clientWidth || 0,
        height: element.clientHeight || 0,
      };

      setViewportSize((current) => {
        if (current.width === next.width && current.height === next.height) {
          return current;
        }

        return next;
      });
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      const handleResize = () => {
        if (frameId) {
          cancelAnimationFrame(frameId);
        }

        frameId = requestAnimationFrame(measure);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        if (frameId) {
          cancelAnimationFrame(frameId);
        }

        window.removeEventListener('resize', handleResize);
      };
    }

    const observer = new ResizeObserver(() => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(measure);
    });

    observer.observe(element);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      observer.disconnect();
    };
  }, []);

  useEffect(() => () => {
    if (pendingViewportFrameRef.current) {
      cancelAnimationFrame(pendingViewportFrameRef.current);
    }
  }, []);

  const handlePromptChange = useCallback((value) => {
    setPrompt(value);
  }, []);

  const responsiveLayout = useMemo(
    () => getResponsiveNodeLayout({ width: viewportSize.width, height: viewportSize.height, isMobile }),
    [isMobile, viewportSize.height, viewportSize.width]
  );

  const flowNodes = useMemo(
    () =>
      nodes.map((node) => {
        const position = isMobile && responsiveLayout[node.id] ? responsiveLayout[node.id] : node.position;
        const orientation = isMobile ? 'vertical' : 'horizontal';

        if (node.id === 'input') {
          return {
            ...node,
            position,
            data: {
              ...node.data,
              value: prompt,
              onChange: handlePromptChange,
              orientation,
            },
          };
        }

        if (node.id === 'output') {
          return {
            ...node,
            position,
            data: {
              ...node.data,
              value: response,
              isLoading,
              orientation,
            },
          };
        }

        return {
          ...node,
          position,
        };
      }),
    [nodes, prompt, response, isLoading, handlePromptChange, isMobile, responsiveLayout]
  );

  const mobileViewportNodesKey = useMemo(
    () => flowNodes.map((node) => `${node.id}:${node.position.x}:${node.position.y}`).join('|'),
    [flowNodes]
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const handleNodesChange = useCallback(
    (changes) => {
      if (!isMobile) {
        onNodesChange(changes);
        return;
      }

      onNodesChange(changes.filter((change) => change.type !== 'position'));
    },
    [isMobile, onNodesChange]
  );

  const scheduleMobileFitView = useCallback((instance, viewportKey) => {
    if (lastMobileViewportKeyRef.current === viewportKey) {
      return;
    }

    lastMobileViewportKeyRef.current = viewportKey;

    if (pendingViewportFrameRef.current) {
      cancelAnimationFrame(pendingViewportFrameRef.current);
    }

    pendingViewportFrameRef.current = requestAnimationFrame(() => {
      pendingViewportFrameRef.current = requestAnimationFrame(() => {
        // Guard against stale instances during rapid viewport/layout updates.
        if (reactFlowInstanceRef.current !== instance) {
          pendingViewportFrameRef.current = null;
          return;
        }

        try {
          instance.fitView({
            padding: 0.25,
            duration: 300,
          });
        } catch (error) {
          console.error('fitView failed', error);
        }

        pendingViewportFrameRef.current = null;
      });
    });
  }, []);

  const onInit = useCallback((instance) => {
    reactFlowInstanceRef.current = instance;
  }, []);

  useEffect(() => {
    if (!isMobile) {
      lastMobileViewportKeyRef.current = '';

      if (pendingViewportFrameRef.current) {
        cancelAnimationFrame(pendingViewportFrameRef.current);
        pendingViewportFrameRef.current = null;
      }

      return;
    }

    const instance = reactFlowInstanceRef.current;

    if (!instance || !mobileViewportNodesKey) {
      return;
    }

    const viewportKey = [
      'mobile',
      viewportSize.width,
      viewportSize.height,
      mobileViewportNodesKey,
      isLoading ? 'loading' : 'idle',
      response.length,
    ].join('::');

    scheduleMobileFitView(instance, viewportKey);
  }, [
    isLoading,
    isMobile,
    mobileViewportNodesKey,
    response.length,
    scheduleMobileFitView,
    viewportSize.height,
    viewportSize.width,
  ]);

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

      if (models.length === 0) {
        fetchModels({ showErrorToast: false, retryUntilLoaded: true });
      }

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
            isModelsLoading={isModelsLoading}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            failedModels={failedModels}
            onRefreshModels={fetchModels}
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

      <main className="app-main" ref={flowContainerRef}>
        <ReactFlow
          nodes={flowNodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={onInit}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          minZoom={isMobile ? 0.7 : undefined}
          maxZoom={isMobile ? 1.5 : undefined}
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
