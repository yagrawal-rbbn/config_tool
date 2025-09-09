import React, { memo } from 'react';

const CardNode = ({ data }) => {
  return (
    <div style={{ width: data.width, height: data.height, pointerEvents: 'none' }}>
      <div className="node-label" style={{ pointerEvents: 'auto' }}>{data.label}</div>
    </div>
  );
};

export default memo(CardNode);
