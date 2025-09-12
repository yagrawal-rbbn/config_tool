import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Sidebar from './components/Sidebar';
import ConfigPanel from './components/ConfigPanel';
import NENode from './components/nodes/NENode';
import CardNode from './components/nodes/CardNode';
import PortNode from './components/nodes/PortNode';
import { generateConfiguration, transformToBackendPayload } from './api';

import './App.css';
import './components/nodes/node-styles.css';

const nodeTypes = {
  ne: NENode,
  card: CardNode,
  port: PortNode,
};

const App = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(JSON.parse(localStorage.getItem('diagram-nodes')) || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(JSON.parse(localStorage.getItem('diagram-edges')) || []);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [generatedConfig, setGeneratedConfig] = useState('');
  
  
  const [drawingMode, setDrawingMode] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    localStorage.setItem('diagram-nodes', JSON.stringify(nodes));
    localStorage.setItem('diagram-edges', JSON.stringify(edges));
  }, [nodes, edges]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        setDrawingMode(null);
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    // Initialize IDs from localStorage
    const loadedNodes = JSON.parse(localStorage.getItem('diagram-nodes')) || [];
    if (loadedNodes.length > 0) {
      const initialIds = { ne: 0, card: 0, port: 0 };
      loadedNodes.forEach(node => {
        const parts = node.id.split('_');
        if (parts.length === 2) {
          const [type, number] = parts;
          if (type in initialIds) {
            const num = parseInt(number, 10);
            if (!isNaN(num) && num > initialIds[type]) {
              initialIds[type] = num;
            }
          }
        }
      });
      ids.current = initialIds;
    }
  }, []); // Run only once on mount

  const ids = useRef({ ne: 0, card: 0, port: 0 });
  const getId = (type) => {
    ids.current[type] = (ids.current[type] || 0) + 1;
    return `${type}_${ids.current[type]}`;
  };

  const onConnect = useCallback((params) => {
    setEdges((eds) => {
      const isSourceInvolved = eds.some(edge => edge.source === params.source || edge.target === params.source);
      const isTargetInvolved = eds.some(edge => edge.source === params.target || edge.target === params.target);

      if (isSourceInvolved || isTargetInvolved) {
        alert("A port can only be connected to one other port.");
        return eds;
      }

      const sourcePortNode = nodes.find(n => n.id === params.source);
      const targetPortNode = nodes.find(n => n.id === params.target);

      if (!sourcePortNode || !targetPortNode) {
        return eds; // Should not happen
      }

      const sourceCardNode = nodes.find(n => n.id === sourcePortNode.parentNode);
      const targetCardNode = nodes.find(n => n.id === targetPortNode.parentNode);

      if (!sourceCardNode || !targetCardNode) {
        return eds; // Should not happen
      }

      const sourceNeNode = nodes.find(n => n.id === sourceCardNode.parentNode);
      const targetNeNode = nodes.find(n => n.id === targetCardNode.parentNode);

      const isInternal = sourceNeNode && targetNeNode && sourceNeNode.id === targetNeNode.id;

      const newEdge = {
        ...params,
        data: {
          is_internal: isInternal,
          is_bidirectional: true // Default to bidirectional
        }
      };

      return addEdge(newEdge, eds);
    });
  }, [nodes, setEdges]);

  const onNodeClick = useCallback((event, node) => {
    const findNode = (id) => nodes.find(n => n.id === id);
    const element = findNode(node.id);
    
    if(!element) return;

    setSelectedElement({
        id: element.id,
        type: element.type,
        data: element.data
    });
  }, [nodes]);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedElement({
        id: edge.id,
        type: 'edge',
        data: edge.data || {}
    });
  }, []);

  const deleteNode = (nodeId) => {
    const nodesToDelete = new Set();
    const queue = [nodeId];
    
    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!nodesToDelete.has(currentId)) {
        nodesToDelete.add(currentId);
        nodes.forEach(node => {
          if (node.parentNode === currentId) {
            queue.push(node.id);
          }
        });
      }
    }

    setNodes((nds) => nds.filter((node) => !nodesToDelete.has(node.id)));
    setEdges((eds) => eds.filter((edge) => !nodesToDelete.has(edge.source) && !nodesToDelete.has(edge.target)));
    setSelectedElement(null);
  };

  const updateEdgeConfig = (edgeId, field, value) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return { ...edge, data: { ...edge.data, [field]: value } };
        }
        return edge;
      })
    );
    if (selectedElement && selectedElement.id === edgeId) {
        setSelectedElement(prev => ({...prev, data: {...prev.data, [field]: value}}));
    }
  };

  const updateNodeConfig = (nodeId, field, value) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const newData = { ...node.data, [field]: value };
          if (field === 'NE_IP' || field === 'card_name' || field === 'port_no') {
              newData.label = `${value}`;
          }
          return { ...node, data: newData };
        }
        return node;
      })
    );
    if (selectedElement && selectedElement.id === nodeId) {
        setSelectedElement(prev => ({...prev, data: {...prev.data, [field]: value}}));
    }
  };
  
  const handleGenerateConfig = async () => {
      const config = await generateConfiguration(nodes, edges);
      if (config) {
        setGeneratedConfig(config);
      }
  };

  const handleClearDiagram = () => {
    localStorage.removeItem('diagram-nodes');
    localStorage.removeItem('diagram-edges');
    setNodes([]);
    setEdges([]);
    ids.current = { ne: 0, card: 0, port: 0 };
  };

  const onMouseDown = (event) => {
    if (!drawingMode || !reactFlowInstance) return;
    event.preventDefault();
    
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    setIsDrawing(true);
    setStartPos(position);
    setPreview({ x: position.x, y: position.y, width: 0, height: 0 });
  };

  const onMouseMove = (event) => {
    if (!isDrawing) return;
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const width = Math.abs(position.x - startPos.x);
    const height = Math.abs(position.y - startPos.y);
    const newX = Math.min(position.x, startPos.x);
    const newY = Math.min(position.y, startPos.y);

    setPreview({ x: newX, y: newY, width, height });
  };

  const onMouseUp = (event) => {
    if (!isDrawing || !preview || preview.width === 0 || preview.height === 0) {
      setIsDrawing(false);
      setPreview(null);
      return;
    }
    event.preventDefault();

    const projectedPosition = reactFlowInstance.project({
        x: preview.x,
        y: preview.y,
    });

    const { x, y, width, height } = { ...preview, ...projectedPosition };
    const newNodeId = getId(drawingMode);
    let newNode;
    let parentNode = null;

    const currentNodes = reactFlowInstance.getNodes();

    if (drawingMode === 'card') {
      parentNode = currentNodes.find(n => 
        n.type === 'ne' &&
        x >= n.position.x &&
        y >= n.position.y &&
        x + width <= n.position.x + n.data.width &&
        y + height <= n.position.y + n.data.height
      );
      if (!parentNode) {
        alert('Cards can only be placed inside Network Elements.');
        setIsDrawing(false);
        setPreview(null);
        return;
      }
    } else if (drawingMode === 'port') {
      parentNode = currentNodes.find(n =>
        n.type === 'card' &&
        n.positionAbsolute &&
        x >= n.positionAbsolute.x &&
        y >= n.positionAbsolute.y &&
        x + width <= n.positionAbsolute.x + n.data.width &&
        y + height <= n.positionAbsolute.y + n.data.height
      );
      if (!parentNode) {
        alert('Ports can only be placed inside Cards.');
        setIsDrawing(false);
        setPreview(null);
        return;
      }
    }

    const position = {
      x: parentNode ? x - (parentNode.positionAbsolute ? parentNode.positionAbsolute.x : parentNode.position.x) : x,
      y: parentNode ? y - (parentNode.positionAbsolute ? parentNode.positionAbsolute.y : parentNode.position.y) : y,
    };

    const data = {
      id: newNodeId,
      label: newNodeId,
      width,
      height,
    };

    switch (drawingMode) {
      case 'ne':
        data.NE_IP = '';
        data.role = '';
        break;
      case 'card':
        data.card_name = '';
        data.slot_no = '';
        data.service_card = false;
        break;
      case 'port':
        data.port_no = '';
        data.port_type = '';
        data.if_index = '';
        break;
      default:
        break;
    }

    newNode = {
      id: newNodeId,
      type: drawingMode,
      position,
      data,
      parentNode: parentNode ? parentNode.id : undefined,
      extent: parentNode ? 'parent' : undefined,
    };

    setNodes((nds) => nds.concat(newNode));
    setIsDrawing(false);
    setPreview(null);
  };

  return (
    <div className="app">
      <ReactFlowProvider>
        <Sidebar drawingMode={drawingMode} setDrawingMode={setDrawingMode} />
        <div 
          className="canvas-container" 
          ref={reactFlowWrapper}
        >
          {drawingMode && (
            <div
              className="drawing-overlay"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
            >
              {preview && (
                <div
                  className="preview-node"
                  style={{
                    position: 'absolute',
                    left: preview.x,
                    top: preview.y,
                    width: preview.width,
                    height: preview.height,
                    border: '1px dashed #000',
                  }}
                />
              )}
            </div>
          )}
          {drawingMode && (
            <div className="drawing-prompt">
              Drawing mode active. Press Esc to cancel.
            </div>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            fitView
            panOnDrag={!drawingMode}
            zoomOnScroll={!drawingMode}
            panOnScroll={false}
            nodesDraggable={!drawingMode}
            style={{ pointerEvents: drawingMode ? 'none' : 'auto' }}
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>
        <ConfigPanel selectedElement={selectedElement} updateNodeConfig={updateNodeConfig} deleteNode={deleteNode} updateEdgeConfig={updateEdgeConfig} />
        <button onClick={handleGenerateConfig} className="save-btn">Generate Configuration</button>
        <button onClick={handleClearDiagram} className="clear-btn">Clear Diagram</button>
        {generatedConfig && (
            <div className="generated-config">
                <h2>Generated Configuration</h2>
                <pre>{generatedConfig}</pre>
            </div>
        )}
        
      </ReactFlowProvider>
    </div>
  );
};

export default App;