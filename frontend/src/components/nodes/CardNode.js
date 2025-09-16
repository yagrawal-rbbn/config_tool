import React, { memo } from 'react';

const CardNode = ({ data }) => {
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
    </div>
  );
};

export default memo(CardNode);