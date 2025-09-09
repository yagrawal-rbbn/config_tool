const transformToBackendPayload = (nodes, edges) => {
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
                        .map(portNode => ({...portNode.data, port_no: parseInt(portNode.data.port_no, 10)}))
                }))
        }));

    const connections = edges.map(edge => {
        const sourceNE = nodes.find(n => n.id === edge.source);
        const targetNE = nodes.find(n => n.id === edge.target);

        if (!sourceNE || !targetNE) return null;

        let sourceCardId = null;
        let targetCardId = null;

        // Find the source card
        const sourceNeElement = network_elements.find(ne => ne.id === edge.source);
        if (sourceNeElement) {
            for (const card of sourceNeElement.cards) {
                if (card.ports.some(p => p.id === edge.sourceHandle)) {
                    sourceCardId = card.id;
                    break;
                }
            }
        }

        // Find the target card
        const targetNeElement = network_elements.find(ne => ne.id === edge.target);
        if (targetNeElement) {
            for (const card of targetNeElement.cards) {
                if (card.ports.some(p => p.id === edge.targetHandle)) {
                    targetCardId = card.id;
                    break;
                }
            }
        }

        if (!sourceCardId || !targetCardId) return null;

        return {
            id: edge.id,
            source: {
                ne: edge.source,
                card: sourceCardId,
                port: edge.sourceHandle
            },
            destination: {
                ne: edge.target,
                card: targetCardId,
                port: edge.targetHandle
            },
            is_internal: edge.data?.is_internal || false,
            is_bidirectional: edge.data?.is_bidirectional || true,
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

