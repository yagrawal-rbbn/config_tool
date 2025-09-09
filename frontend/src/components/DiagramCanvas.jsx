import React, { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
} from 'reactflow';

import 'reactflow/dist/style.css';
import './DiagramCanvas.css';
import PropertiesPanel from './PropertiesPanel';
import CustomNode from './CustomNode';

const initialNodes = [];
const initialEdges = [];

function DiagramCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDrawingNE, setIsDrawingNE] = useState(false);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onNodeClick = useCallback((event, node) => {
    console.log('onNodeClick triggered for node:', node);
    setSelectedNode(node);
  }, []);

  const nodeTypes = {
    custom: CustomNode,
  };

  const onPaneClick = useCallback((event) => {
    if (!isDrawingNE) return;

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNodeId = `ne_${nodes.length + 1}`;
    const newNode = {
      id: newNodeId,
      position,
      data: { label: `Network Element ${nodes.length + 1}` },
      type: 'custom',
    };

    setNodes((nds) => nds.concat(newNode));
    setIsDrawingNE(false);
  }, [isDrawingNE, nodes, setNodes, screenToFlowPosition]);

  console.log('DiagramCanvas rendering. PropertiesPanel should be included.'); // Debug log

  return (
    <div
      className={`reactflow-wrapper ${isDrawingNE ? 'drawing-mode' : ''}`}
      style={{ width: '100%', height: '100vh' }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsDrawingNE(!isDrawingNE);
          setSelectedNode(null);
        }}
        style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}
      >
        {isDrawingNE ? 'Exit Drawing Mode' : 'Draw Network Element'}
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      {/* Persistent PropertiesPanel - always rendered */}
      <PropertiesPanel
        nodes={nodes}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        // Aggressive inline style to force visibility
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '300px',
          height: 'auto', // Ensure it takes content height
          background: 'red', // Make it obviously visible
          border: '5px solid blue',
          padding: '20px',
          zIndex: '99999', // Extremely high z-index
          display: 'block', // Ensure it's not display:none
          visibility: 'visible', // Ensure it's not visibility:hidden
        }}
      />
    </div>
  );
}

export default DiagramCanvas;