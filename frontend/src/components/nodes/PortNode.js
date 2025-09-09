import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const PortNode = ({ data, isConnectable }) => {
  return (
    <div style={{ width: data.width, height: data.height }}>
      <div className="node-label">{data.label}</div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
    </div>
  );
};

export default memo(PortNode);
