import React, { memo } from 'react';

const NENode = ({ data }) => {
  return (
    <div style={{ width: data.width, height: data.height }}>
      <div className="node-label">{data.label}</div>
    </div>
  );
};

export default memo(NENode);
