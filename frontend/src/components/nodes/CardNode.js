import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const CardNode = ({ data, isConnectable }) => {
  return (
    <div className="react-flow__node-card">
      <div className="node-header">{data.label}</div>
      {/* This node does not render its children directly */}
      {/* React Flow will render the child nodes based on the parentNode property */}
    </div>
  );
};

export default memo(CardNode);
