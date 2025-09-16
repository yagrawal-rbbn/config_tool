import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const PortNode = ({ id, data, isConnectable }) => {
  return (
    <div 
      style={{ 
        width: data.width, 
        height: data.height,
        transform: 'translate3d(0,0,0)', // Hardware acceleration
        willChange: 'transform' // Hint to browser about animations
      }}
    >
      <div className="node-label">{data.label}</div>
      <Handle 
        type="source" 
        position={Position.Right} 
        isConnectable={isConnectable} 
        id={`${id}-source`} 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable} 
        id={`${id}-target`} 
      />
    </div>
  );
};

export default memo(PortNode);