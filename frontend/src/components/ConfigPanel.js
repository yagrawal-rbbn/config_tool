import React from 'react';

const ConfigPanel = ({ selectedElement, updateNodeConfig, deleteNode, updateEdgeConfig }) => {
  if (!selectedElement) {
    return null;
  }

  const { type, data, id } = selectedElement;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    updateNodeConfig(id, name, newValue);
  };

  const handleDelete = () => {
    if (selectedElement) {
      deleteNode(selectedElement.id);
    }
  };

  const handleEdgeChange = (e) => {
    const { name, value } = e.target;
    const isBidirectional = value === 'bidirectional';
    updateEdgeConfig(id, 'is_bidirectional', isBidirectional);
  };

  const handleIsDDChange = (e) => {
    updateEdgeConfig(id, 'is_dd', e.target.checked);
  };

  const renderNEConfig = () => (
    <>
      <h4>Network Element Config</h4>
      <label>NE IP</label>
      <input name="NE_IP" value={data.NE_IP || ''} onChange={handleChange} />
      <label>Role</label>
      <select name="role" value={data.role || ''} onChange={handleChange}>
        <option value="">Select Role</option>
        <option value="head">Head</option>
        <option value="transit">Transit</option>
        <option value="tail">Tail</option>
      </select>
    </>
  );

  const renderCardConfig = () => (
    <>
      <h4>Card Config</h4>
      <label>Card Name</label>
      <input name="card_name" value={data.card_name || ''} onChange={handleChange} />
      <label>Slot No</label>
      <input name="slot_no" value={data.slot_no || ''} onChange={handleChange} />
      <label className="checkbox-label">
        <input name="service_card" type="checkbox" checked={data.service_card || false} onChange={handleChange} />
        Service Card
      </label>
    </>
  );

  const renderPortConfig = () => (
    <>
      <h4>Port Config</h4>
      <label>Port No</label>
      <input name="port_no" type="number" value={data.port_no || ''} onChange={handleChange} />
      <label>Port Type</label>
      <input name="port_type" value={data.port_type || ''} onChange={handleChange} />
      <label>IF Index</label>
      <input name="if_index" value={data.if_index || ''} onChange={handleChange} />
    </>
  );

  const renderEdgeConfig = () => (
    <>
      <h4>Link Configuration</h4>
      <label>Direction</label>
      <select name="direction" value={data.is_bidirectional ? 'bidirectional' : 'unidirectional'} onChange={handleEdgeChange}>
        <option value="bidirectional">Bidirectional</option>
        <option value="unidirectional">Unidirectional</option>
      </select>
      <p>Type: {data.is_internal ? 'Internal' : 'External'}</p>
      {!data.is_internal && (
        <label className="checkbox-label">
          <input name="is_dd" type="checkbox" checked={data.is_dd || false} onChange={handleIsDDChange} />
          Degree-Degree
        </label>
      )}
    </>
  );

  return (
    <div className="config-panel panel">
      {type === 'ne' && renderNEConfig()}
      {type === 'card' && renderCardConfig()}
      {type === 'port' && renderPortConfig()}
      {type === 'edge' && renderEdgeConfig()}
      {selectedElement && (
        <button onClick={handleDelete} className="delete-btn">
          Delete Component
        </button>
      )}
    </div>
  );
};

export default ConfigPanel;