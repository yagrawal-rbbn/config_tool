import React, { useState, useRef, useCallback } from 'react';
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
import { generateConfiguration } from './api';

import './App.css';
import './components/nodes/node-styles.css';

let id = 0;
const getId = (type) => `${type}_${id++}`;

const nodeTypes = {
  ne: NENode,
  card: CardNode,
  port: PortNode,
};

const App = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [connectionSource, setConnectionSource] = useState(null);
  const [generatedConfig, setGeneratedConfig] = useState('');

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      const newNodeId = getId(type);
      let newNode;

      switch (type) {
        case 'ne':
          newNode = {
            id: newNodeId,
            type,
            position,
            data: { id: newNodeId, label: `Network Element ${id}`, NE_IP: '', role: '' },
          };
          break;
        case 'card':
          newNode = {
            id: newNodeId,
            type,
            position,
            data: { id: newNodeId, label: `Card ${id}`, card_name: '', slot_no: '', service_card: false },
            extent: 'parent',
          };
          break;
        case 'port':
           newNode = {
            id: newNodeId,
            type,
            position,
            data: { id: newNodeId, label: `Port ${id}`, port_no: '', port_type: '', if_index: '' },
            extent: 'parent',
          };
          break;
        default:
          return;
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((event, node) => {
    const findNode = (id) => nodes.find(n => n.id === id);
    const element = findNode(node.id);
    
    if(!element) return;

    let selectedType = element.type;
    
    setSelectedElement({
        id: element.id,
        type: selectedType,
        data: element.data
    });
  }, [nodes]);

  const onPortClick = (event, portNode) => {
    event.stopPropagation();

    if (!connectionSource) {
        setConnectionSource(portNode);
        setNodes(nds => nds.map(n => ({...n, data: {...n.data, isSelected: n.id === portNode.id}})));
    } else {
        if (connectionSource.id !== portNode.id) {
            const newEdge = {
                id: `edge-${connectionSource.id}-${portNode.id}`,
                source: connectionSource.parentNode,
                target: portNode.parentNode,
                sourceHandle: connectionSource.id,
                targetHandle: portNode.id,
            };
            setEdges(eds => addEdge(newEdge, eds));
        }
        setConnectionSource(null);
        setNodes(nds => nds.map(n => ({...n, data: {...n.data, isSelected: false}})));
    }
  };

  const updateNodeConfig = (nodeId, field, value) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const newData = { ...node.data, [field]: value };
          // Also update label if it's a primary field
          if (field === 'card_name' || field === 'port_no') {
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

  return (
    <div className="app">
      <ReactFlowProvider>
        <Sidebar />
        <div className="canvas-container" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>
        <ConfigPanel selectedElement={selectedElement} updateNodeConfig={updateNodeConfig} />
        <button onClick={handleGenerateConfig} className="save-btn">Generate Configuration</button>
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