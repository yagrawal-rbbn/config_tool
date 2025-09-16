export const transformToBackendPayload = (nodes, edges) => {
    const network_elements = nodes
        .filter(n => n.type === 'ne')
        .map(neNode => ({
            ...neNode.data,
            cards: nodes
                .filter(c => c.type === 'card' && c.parentNode === neNode.id)
                .map(cardNode => ({
                    ...cardNode.data,
                    ports: nodes
                        .filter(p => p.type === 'port' && p.parentNode === cardNode.id)
                        .map(portNode => {
                            const port_no = parseInt(portNode.data.port_no, 10);
                            return {...portNode.data, port_no: isNaN(port_no) ? 0 : port_no};
                        })
                }))
        }));

    const connections = edges.map(edge => {
        const sourcePortNode = nodes.find(n => n.id === edge.source);
        const targetPortNode = nodes.find(n => n.id === edge.target);

        if (!sourcePortNode || !targetPortNode) return null;

        const sourceCardNode = nodes.find(n => n.id === sourcePortNode.parentNode);
        const targetCardNode = nodes.find(n => n.id === targetPortNode.parentNode);

        if (!sourceCardNode || !targetCardNode) return null;

        const sourceNeNode = nodes.find(n => n.id === sourceCardNode.parentNode);
        const targetNeNode = nodes.find(n => n.id === targetCardNode.parentNode);

        if (!sourceNeNode || !targetNeNode) return null;

        return {
            id: edge.id,
            source: {
                ne: sourceNeNode.id,
                card: sourceCardNode.id,
                port: sourcePortNode.id
            },
            destination: {
                ne: targetNeNode.id,
                card: targetCardNode.id,
                port: targetPortNode.id
            },
            is_internal: edge.data?.is_internal || false,
            is_bidirectional: edge.data?.is_bidirectional ?? true,
            is_dd: edge.data?.is_dd || false,
        };
    }).filter(c => c !== null);

    return { network_elements, connections };
};

export const generateConfiguration = async (nodes, edges) => {
    const payload = transformToBackendPayload(nodes, edges);

    try {
        const response = await fetch('/api/generate-config', { // Assuming the backend is on the same host
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Configuration generated successfully:', result);
        return result.config;
    } catch (error) {
        console.error('Failed to generate configuration:', error);
        alert(`Failed to generate configuration: ${error.message}`);
        return null;
    }
};

