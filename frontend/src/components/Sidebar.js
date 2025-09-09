import React from 'react';

const Sidebar = ({ drawingMode, setDrawingMode }) => {
  return (
    <aside className="sidebar">
      <h3>Components</h3>
      <div 
        className={`selectable-node ${drawingMode === 'ne' ? 'selected' : ''}`} 
        onClick={() => setDrawingMode('ne')}
      >
        Network Element
      </div>
      <div 
        className={`selectable-node ${drawingMode === 'card' ? 'selected' : ''}`} 
        onClick={() => setDrawingMode('card')}
      >
        Card
      </div>
      <div 
        className={`selectable-node ${drawingMode === 'port' ? 'selected' : ''}`} 
        onClick={() => setDrawingMode('port')}
      >
        Port
      </div>
    </aside>
  );
};

export default Sidebar;
