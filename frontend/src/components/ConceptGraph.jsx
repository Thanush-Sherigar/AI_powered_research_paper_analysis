import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { analysisAPI } from '../services/api';

const nodeTypes = {
    concept: { style: { background: '#3b82f6', color: 'white', border: '1px solid #2563eb', borderRadius: '8px', padding: '10px' } },
    method: { style: { background: '#10b981', color: 'white', border: '1px solid #059669', borderRadius: '8px', padding: '10px' } },
    dataset: { style: { background: '#f59e0b', color: 'white', border: '1px solid #d97706', borderRadius: '8px', padding: '10px' } },
    metric: { style: { background: '#ef4444', color: 'white', border: '1px solid #dc2626', borderRadius: '8px', padding: '10px' } },
    model: { style: { background: '#8b5cf6', color: 'white', border: '1px solid #7c3aed', borderRadius: '8px', padding: '10px' } },
};

export default function ConceptGraph({ paperId }) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadGraph();
    }, [paperId]);

    const loadGraph = async (forceRegenerate = false) => {
        setLoading(true);
        setError(null);
        try {
            const url = forceRegenerate
                ? `/papers/${paperId}/concept-graph?regenerate=true`
                : `/papers/${paperId}/concept-graph`;
            const response = await analysisAPI.getConceptGraph(paperId);
            const graphData = response.data.graph;

            // Check if graph has valid data
            if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
                setError('No concepts found in this paper. The paper might be too short or the analysis failed.');
                setNodes([]);
                setEdges([]);
                return;
            }

            // Transform API data to ReactFlow format
            const flowNodes = graphData.nodes.map((node, index) => ({
                id: node.id || `node-${index}`,
                data: { label: node.label },
                position: { x: Math.random() * 500, y: Math.random() * 500 }, // Random position initially
                type: 'default', // Use default for simplicity, or custom if defined
                style: nodeTypes[node.type]?.style || {},
            }));

            const flowEdges = graphData.edges.map((edge, index) => ({
                id: `edge-${index}`,
                source: edge.source,
                target: edge.target,
                label: edge.relationship,
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed },
                animated: true,
            }));

            // Simple auto-layout (very basic)
            // In a real app, use dagre or elkjs for proper layout
            flowNodes.forEach((node, i) => {
                node.position = {
                    x: (i % 5) * 200 + 50,
                    y: Math.floor(i / 5) * 150 + 50,
                };
            });

            setNodes(flowNodes);
            setEdges(flowEdges);
        } catch (err) {
            console.error('Failed to load concept graph:', err);
            setError('Failed to generate concept graph. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] bg-white/5 rounded-xl border border-white/10">
                <div className="spinner mb-4"></div>
                <p className="text-gray-400">Extracting concepts and relationships...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] bg-white/5 rounded-xl border border-white/10">
                <p className="text-red-400 mb-4">{error}</p>
                <button onClick={() => loadGraph(true)} className="btn-gradient">Regenerate Graph</button>
            </div>
        );
    }

    if (nodes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] bg-white/5 rounded-xl border border-white/10">
                <p className="text-gray-400 mb-4">No concepts found in this paper.</p>
                <button onClick={() => loadGraph(true)} className="btn-gradient">Generate Concept Graph</button>
            </div>
        );
    }

    return (
        <div className="w-full h-[600px] bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
            <div style={{ width: '100%', height: '600px' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    attributionPosition="bottom-right"
                >
                    <Controls />
                    <Background color="#aaa" gap={16} />
                </ReactFlow>
            </div>
            <div className="absolute bottom-4 left-4 bg-slate-800 p-3 rounded-lg border border-white/10 text-xs text-gray-300">
                <div className="font-bold mb-2">Legend</div>
                <div className="flex items-center mb-1"><div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div> Concept</div>
                <div className="flex items-center mb-1"><div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div> Method</div>
                <div className="flex items-center mb-1"><div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div> Dataset</div>
                <div className="flex items-center mb-1"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> Metric</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div> Model</div>
            </div>
        </div>
    );
}
