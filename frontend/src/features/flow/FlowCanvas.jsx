import React from 'react';
import { ReactFlow, Controls, Background } from '@xyflow/react';

export default function FlowCanvas({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect, 
  nodeTypes, 
  onInit, 
  isMobile 
}) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
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
  );
}
