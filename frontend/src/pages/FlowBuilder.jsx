import React, { useMemo } from 'react';
import '@xyflow/react/dist/style.css';

import InputNode from '../features/flow/InputNode';
import OutputNode from '../features/flow/OutputNode';
import EmailNode from '../features/flow/EmailNode';
import HistorySidebar from '../features/history/HistorySidebar';
import FlowToolbar from '../features/flow/FlowToolbar';
import FlowCanvas from '../features/flow/FlowCanvas';
import FlowSidebar from '../features/flow/FlowSidebar';
import { useFlowBuilder } from '../hooks/useFlowBuilder';

const MOBILE_BREAKPOINT = 768;
const DESKTOP_NODE_WIDTH = 340;
const MOBILE_NODE_WIDTH = 280;
const NODE_HEIGHT = 188;
const EMAIL_NODE_HEIGHT = 320;
const DESKTOP_MIN_GAP = 120;
const DESKTOP_MAX_GAP = 320;
const DESKTOP_GAP_RATIO = 0.16;
const DESKTOP_PADDING = 80;
const DESKTOP_OFFSET_X = 120;
const DESKTOP_OFFSET_Y = 18;
const DESKTOP_OUTPUT_EXTRA_X = 220;
const DESKTOP_OUTPUT_Y_OFFSET = -40;
const DESKTOP_EMAIL_EXTRA_X = 420;
const DESKTOP_EMAIL_Y_OFFSET = 20;

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
  return { width: window.innerWidth, height: window.innerHeight };
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
      email: { x: inputX, y: inputY + MOBILE_NODE_HEIGHT * 2 + MOBILE_STACK_GAP * 2 },
    };
  }

  const gap = clamp(safeWidth * DESKTOP_GAP_RATIO, DESKTOP_MIN_GAP, DESKTOP_MAX_GAP);
  const totalWidth = DESKTOP_NODE_WIDTH * 3 + gap * 2;
  const startX = Math.max((safeWidth - totalWidth) / 2 + DESKTOP_OFFSET_X, DESKTOP_PADDING);
  const centeredY = Math.max((safeHeight - NODE_HEIGHT) / 2 + DESKTOP_OFFSET_Y, DESKTOP_PADDING);

  return {
    input: { x: startX, y: centeredY },
    output: {
      x: startX + DESKTOP_NODE_WIDTH + gap + DESKTOP_OUTPUT_EXTRA_X,
      y: centeredY + DESKTOP_OUTPUT_Y_OFFSET,
    },
    email: {
      x: startX + (DESKTOP_NODE_WIDTH + gap) * 2 + DESKTOP_EMAIL_EXTRA_X,
      y: centeredY + DESKTOP_EMAIL_Y_OFFSET,
    }
  };
};

function FlowContent() {
  const nodeTypes = useMemo(() => ({ 
    inputNode: InputNode, 
    outputNode: OutputNode,
    emailNode: EmailNode
  }), []);

  const {
    models,
    isModelsLoading,
    selectedModel,
    setSelectedModel,
    failedModels,
    fetchModels,
    handleRunFlow,
    handleSave,
    setIsHistoryOpen,
    isLoading,
    canSave,
    isSignedIn,
    flowContainerRef,
    addEmailNode,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onInit,
    isMobile,
    isHistoryOpen,
    handleLoadRecord,
  } = useFlowBuilder(getViewportSize, getResponsiveNodeLayout, initialEdges);

  return (
    <div className="app-shell">
      <FlowToolbar
        models={models}
        isModelsLoading={isModelsLoading}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        failedModels={failedModels}
        fetchModels={fetchModels}
        handleRunFlow={handleRunFlow}
        handleSave={handleSave}
        setIsHistoryOpen={setIsHistoryOpen}
        isLoading={isLoading}
        canSave={canSave}
        isSignedIn={isSignedIn}
      />

      <main className="app-main" ref={flowContainerRef}>
        <FlowSidebar 
          isSignedIn={isSignedIn} 
          onAddEmailNode={addEmailNode} 
        />

        <FlowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={onInit}
          isMobile={isMobile}
        />

        <HistorySidebar 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)}
          onLoadRecord={handleLoadRecord}
        />
      </main>
    </div>
  );
}

export default function FlowBuilder() {
  return <FlowContent />;
}
