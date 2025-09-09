import React from 'react';
import { Handle, Position } from 'reactflow';
import './CustomNode.css';

function CustomNode({ data, id }) { // Removed onNodeIdClick prop
  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Top} />
      <div>
        <strong>{data.label}</strong>
        <br />
        <span className="node-id">ID: {id}</span> {/* Removed onClick */}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default CustomNode;