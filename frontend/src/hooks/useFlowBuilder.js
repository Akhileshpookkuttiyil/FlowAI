import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import { useAuth, useUser } from '@clerk/clerk-react';
import * as aiService from '../services/ai.service';
import * as emailService from '../services/email.service';
import { getApiErrorMessage } from '../utils/api';
import { toast } from 'react-hot-toast';

const MOBILE_BREAKPOINT = 768;
const MODEL_FETCH_MAX_ATTEMPTS = 4;
const MODEL_FETCH_RETRY_DELAY_MS = 1500;

export function useFlowBuilder(getViewportSize, getResponsiveNodeLayout, initialEdges) {
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [emailData, setEmailData] = useState({ to: '', subject: 'AI Response from FlowAI' });
  const [isEmailSending, setIsEmailSending] = useState(false);

  const [models, setModelsList] = useState([]);
  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [failedModels, setFailedModels] = useState(new Set());
  const [viewportSize, setViewportSize] = useState(getViewportSize);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const flowContainerRef = useRef(null);
  const isFetchingModelsRef = useRef(false);
  const shouldRetryModelsRef = useRef(true);
  const hasInitialSelectionRef = useRef(false);
  const reactFlowInstanceRef = useRef(null);

  const isMobile = viewportSize.width < MOBILE_BREAKPOINT;

  const initialNodes = useMemo(() => {
    const initialViewport = getViewportSize();
    const initialIsMobile = initialViewport.width < MOBILE_BREAKPOINT;
    const initialLayout = getResponsiveNodeLayout({
      width: initialViewport.width,
      height: initialViewport.height,
      isMobile: initialIsMobile,
    });

    return [
      { id: 'input', type: 'inputNode', position: initialLayout.input, data: {} },
      { id: 'output', type: 'outputNode', position: initialLayout.output, data: {} },
    ];
  }, [getViewportSize, getResponsiveNodeLayout]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const addEmailNode = useCallback(() => {
    if (!isSignedIn) {
      toast.error('Please sign in to use Email actions.');
      return;
    }

    if (nodes.find(n => n.id === 'email')) {
      toast.error('Email node already exists on the canvas.');
      return;
    }

    const { width, height } = viewportSize;
    const position = { x: width / 2 - 150, y: height / 2 - 100 };

    const newNode = {
      id: 'email',
      type: 'emailNode',
      position,
      data: {},
    };

    setNodes((nds) => nds.concat(newNode));
    toast.success('Email action added!');
  }, [isSignedIn, nodes, viewportSize, setNodes]);

  const fetchModels = useCallback(async ({ showErrorToast = true, retryUntilLoaded = false, clearFailures = false } = {}) => {
    if (isFetchingModelsRef.current) return;
    isFetchingModelsRef.current = true;
    setIsModelsLoading(true);

    if (clearFailures) setFailedModels(new Set());

    try {
      let loadedModels = [];
      let lastError = null;
      for (let attempt = 1; attempt <= MODEL_FETCH_MAX_ATTEMPTS; attempt += 1) {
        try {
          const response = await aiService.fetchAvailableModels();
          loadedModels = response;
          if (loadedModels.length > 0 || !retryUntilLoaded || !shouldRetryModelsRef.current) break;
        } catch (err) {
          lastError = err;
          if (!retryUntilLoaded || attempt === MODEL_FETCH_MAX_ATTEMPTS || !shouldRetryModelsRef.current) throw err;
        }
        if (attempt < MODEL_FETCH_MAX_ATTEMPTS && shouldRetryModelsRef.current) {
          await new Promise((resolve) => setTimeout(resolve, MODEL_FETCH_RETRY_DELAY_MS));
        }
      }
      if (loadedModels.length === 0 && lastError) throw lastError;
      setModelsList(loadedModels);
      
      if (loadedModels.length > 0 && !selectedModel && !hasInitialSelectionRef.current) {
        const hasFreeRouter = loadedModels.find(m => m.id === 'openrouter/free');
        if (hasFreeRouter) {
          setSelectedModel('openrouter/free');
        } else {
          setSelectedModel(loadedModels[0].id);
        }
        hasInitialSelectionRef.current = true;
      }
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to load available models.');
      if (showErrorToast) toast.error(message);
    } finally {
      isFetchingModelsRef.current = false;
      setIsModelsLoading(false);
    }
  }, [selectedModel]);

  useEffect(() => {
    fetchModels({ retryUntilLoaded: true });
    return () => { shouldRetryModelsRef.current = false; };
  }, [fetchModels]);

  useEffect(() => {
    const element = flowContainerRef.current;
    if (!element) return undefined;
    let frameId = null;
    const measure = () => {
      const next = { width: element.clientWidth || 0, height: element.clientHeight || 0 };
      setViewportSize((current) => (current.width === next.width && current.height === next.height ? current : next));
    };
    measure();
    const observer = new ResizeObserver(() => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measure);
    });
    observer.observe(element);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  const handlePromptChange = useCallback((value) => {
    setPrompt(value);
    if (error) setError(null);
  }, [error]);

  const handleEmailDataChange = useCallback((field, value) => {
    if (field === 'value') {
      setResponse(value);
      return;
    }
    setEmailData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSendEmail = useCallback(async () => {
    if (!emailData.to || !response) {
      toast.error('Recipient and message content are required!');
      return;
    }

    setIsEmailSending(true);
    try {
      const emailResult = await emailService.sendEmail({
        to: emailData.to,
        subject: emailData.subject,
        message: response
      });
      toast.success(emailResult?.message || 'Email sent successfully!');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to send email.'));
    } finally {
      setIsEmailSending(false);
    }
  }, [emailData.to, emailData.subject, response]);

  const onInit = useCallback((instance) => { reactFlowInstanceRef.current = instance; }, []);

  const handleNodesChange = useCallback((changes) => {
    if (!isMobile) {
      onNodesChange(changes);
      return;
    }
    onNodesChange(changes.filter((change) => change.type !== 'position'));
  }, [isMobile, onNodesChange]);

  const handleRunFlow = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first!');
      return;
    }
    
    setIsLoading(true);
    setResponse('');
    setError(null);

    const initialModel = selectedModel || null;
    
    try {
      const token = await getToken();
      
      try {
        await aiService.askAI(prompt, initialModel, (chunk) => {
          setResponse((prev) => prev + chunk);
        }, token);
      } catch (err) {
        if (initialModel) {
          const modelName = initialModel.split('/').pop() || initialModel;
          toast.error(`${modelName} is currently unavailable. Falling back to Auto Select...`, {
            icon: '🔄',
            duration: 4000
          });
          
          setFailedModels((prev) => new Set([...prev, initialModel]));
          hasInitialSelectionRef.current = true;
          setSelectedModel('');

          setResponse('');
          await aiService.askAI(prompt, null, (chunk) => {
            setResponse((prev) => prev + chunk);
          }, token);
        } else {
          throw err;
        }
      }

      if (models.length === 0) fetchModels({ showErrorToast: false, retryUntilLoaded: true });
      toast.success('Response generated successfully!');
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to fetch AI response.');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to save your work.');
      return;
    }
    if (!prompt || !response || isLoading || error) {
      toast.error('Nothing valid to save!');
      return;
    }
    try {
      await aiService.saveResponse(prompt, response);
      toast.success('Saved to History!');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save to database.'));
    }
  };

  const handleLoadRecord = useCallback((record) => {
    setPrompt(record.prompt || '');
    setResponse(record.response || '');
    setError(null);
    toast.success('Record loaded from history!');
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const responsiveLayout = useMemo(
    () => getResponsiveNodeLayout({ width: viewportSize.width, height: viewportSize.height, isMobile }),
    [isMobile, viewportSize.height, viewportSize.width, getResponsiveNodeLayout]
  );

  const flowNodes = useMemo(
    () => {
      const isEmailConnected = edges.some(edge => 
        (edge.source === 'output' && edge.target === 'email') || 
        (edge.source === 'email' && edge.target === 'output')
      );

      return nodes.map((node) => {
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
              isLoading,
              error: error ? true : false,
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
              error: error,
              orientation,
            },
          };
        }

        if (node.id === 'email') {
          return {
            ...node,
            position,
            data: {
              ...node.data,
              value: isEmailConnected ? response : '',
              to: emailData.to,
              subject: emailData.subject,
              onEmailDataChange: handleEmailDataChange,
              onSend: handleSendEmail,
              isSending: isEmailSending,
              isSignedIn,
              isConnected: isEmailConnected,
              orientation,
            }
          };
        }

        return {
          ...node,
          position,
        };
      });
    },
    [nodes, edges, prompt, response, isLoading, error, emailData, isEmailSending, isSignedIn, handlePromptChange, handleEmailDataChange, handleSendEmail, isMobile, responsiveLayout]
  );

  return {
    prompt,
    response,
    isLoading,
    error,
    isSignedIn,
    models,
    isModelsLoading,
    selectedModel,
    setSelectedModel,
    failedModels,
    viewportSize,
    isHistoryOpen,
    setIsHistoryOpen,
    flowContainerRef,
    isMobile,
    nodes: flowNodes,
    edges,
    onNodesChange: handleNodesChange,
    onEdgesChange,
    onConnect,
    onInit,
    fetchModels,
    handlePromptChange,
    handleRunFlow,
    handleSave,
    handleLoadRecord,
    addEmailNode,
    canSave: Boolean(isSignedIn && response && !isLoading && !error)
  };
}
