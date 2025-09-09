import React, { useEffect } from 'react'; // Import useEffect
import './PropertiesPanel.css';

function PropertiesPanel({ nodes, selectedNode, setSelectedNode }) {
  useEffect(() => {
    console.log('PropertiesPanel mounted/rendered. Selected Node:', selectedNode);
    console.log('All Nodes:', nodes);
  }, [selectedNode, nodes]); // Log on mount and when props change

  const handleSelectChange = (event) => {
    const nodeId = event.target.value;
    const node = nodes.find(n => n.id === nodeId);
    setSelectedNode(node);
  };

  return (
    <div className="properties-panel">
      <h3>Component Properties</h3>
      <select onChange={handleSelectChange} value={selectedNode ? selectedNode.id : ''}>
        <option value="">-- Select a Component --</option>
        {nodes.map((node) => (
          <option key={node.id} value={node.id}>
            {node.data.label} (ID: {node.id})
          </option>
        ))}
      </select>

      {selectedNode ? (
        <div>
          <h4>Selected: {selectedNode.data.label} (ID: {selectedNode.id})</h4>
          {/* Add more detailed configuration options here */}
          <p>This is a placeholder for configuration settings for {selectedNode.data.label}.</p>
        </div>
      ) : (
        <p>Select a component from the dropdown or by clicking on it on the canvas.</p>
      )}
    </div>
  );
}

export default PropertiesPanel;