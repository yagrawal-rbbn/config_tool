import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const PortNode = ({ data, isConnectable }) => {
  const isSelected = data.isSelected ? 'port-source-selected' : '';

  return (
    <div className={`react-flow__node-port ${isSelected}`}>
        <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
        <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
        <div>{data.label}</div>
    </div>
  );
};

export default memo(PortNode);
