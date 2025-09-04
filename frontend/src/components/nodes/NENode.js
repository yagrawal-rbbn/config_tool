import React, { memo } from 'react';

const NENode = ({ data }) => {
  return (
    <div className="react-flow__node-ne">
      <div className="node-header">{data.label}</div>
      {/* This node does not render its children directly */}
      {/* React Flow will render the child nodes based on the parentNode property */}
    </div>
  );
};

export default memo(NENode);
