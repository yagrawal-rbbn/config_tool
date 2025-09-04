import React from 'react';

const onDragStart = (event, nodeType) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h3>Draggable Items</h3>
      <div className="draggable-node" onDragStart={(event) => onDragStart(event, 'ne')} draggable>
        Network Element
      </div>
      <div className="draggable-node" onDragStart={(event) => onDragStart(event, 'card')} draggable>
        Card
      </div>
      <div className="draggable-node" onDragStart={(event) => onDragStart(event, 'port')} draggable>
        Port
      </div>
    </aside>
  );
};

export default Sidebar;
