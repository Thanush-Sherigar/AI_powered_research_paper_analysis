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
    const [viewMode, setViewMode] = useState('graph'); // 'graph' | 'mindmap'
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cache data to avoid refetching on toggle
    const [graphDataCache, setGraphDataCache] = useState(null);
    const [mindMapDataCache, setMindMapDataCache] = useState(null);

    useEffect(() => {
        if (viewMode === 'graph' && !graphDataCache) {
            loadGraph();
        } else if (viewMode === 'mindmap' && !mindMapDataCache) {
            loadMindMap();
        } else {
            // Restore from cache when switching views if available
            restoreFromCache();
        }
    }, [viewMode, paperId]);

    const restoreFromCache = useCallback(() => {
        if (viewMode === 'graph' && graphDataCache) {
            setNodes(graphDataCache.nodes);
            setEdges(graphDataCache.edges);
        } else if (viewMode === 'mindmap' && mindMapDataCache) {
            setNodes(mindMapDataCache.nodes);
            setEdges(mindMapDataCache.edges);
        }
    }, [viewMode, graphDataCache, mindMapDataCache, setNodes, setEdges]);

    const loadGraph = async (forceRegenerate = false) => {
        setLoading(true);
        setError(null);
        try {
            const response = await analysisAPI.getConceptGraph(paperId);
            const graphData = response.data.graph;

            if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
                setError('No concepts found in this paper.');
                return;
            }

            // Transform for Graph View (Force/Random layout initially)
            const flowNodes = graphData.nodes.map((node, index) => ({
                id: node.id || `node-${index}`,
                data: { label: node.label },
                position: { x: Math.random() * 500, y: Math.random() * 500 },
                type: 'defualt',
                style: nodeTypes[node.type]?.style || nodeTypes.concept.style,
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

            // Simple Grid Layout for Graph
            flowNodes.forEach((node, i) => {
                node.position = {
                    x: (i % 5) * 250 + 50,
                    y: Math.floor(i / 5) * 150 + 50,
                };
            });

            setNodes(flowNodes);
            setEdges(flowEdges);
            setGraphDataCache({ nodes: flowNodes, edges: flowEdges });
        } catch (err) {
            console.error('Failed to load graph:', err);
            setError('Failed to load concept graph.');
        } finally {
            setLoading(false);
        }
    };

    const loadMindMap = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await analysisAPI.getMindMap(paperId);
            const mindMap = response.data.mindMap;

            if (!mindMap || !mindMap.root) {
                setError('Failed to generate mind map structure.');
                return;
            }

            // Transform hierarchical JSON to ReactFlow nodes/edges with Tree Layout
            const { nodes: treeNodes, edges: treeEdges } = getTreeLayout(mindMap);

            setNodes(treeNodes);
            setEdges(treeEdges);
            setMindMapDataCache({ nodes: treeNodes, edges: treeEdges });
        } catch (err) {
            console.error('Failed to load mind map:', err);
            setError('Failed to load mind map.');
        } finally {
            setLoading(false);
        }
    };

    // Recursive Tree Layout Algorithm
    const getTreeLayout = (data) => {
        const nodes = [];
        const edges = [];
        let globalY = 0;

        // Traverse to build nodes and calculate positions
        const traverse = (node, depth, parentId) => {
            const nodeId = `mm-${depth}-${nodes.length}`;

            // Basic horizontal tree layout: x based on depth, y incremented
            // This is a simplified approach; proper tree algos are complex
            const x = depth * 300;
            // Center y based on children would be better, but simple list for now
            const y = globalY * 80;
            globalY++;

            nodes.push({
                id: nodeId,
                data: { label: node.name || node.root }, // 'root' property for top level, 'name' for others
                position: { x, y },
                style: {
                    background: depth === 0 ? '#2563eb' : (depth === 1 ? '#10b981' : '#f59e0b'),
                    color: 'white',
                    border: '1px solid #ffffff55',
                    borderRadius: '8px',
                    padding: '10px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    width: 200,
                },
                type: 'default',
            });

            if (parentId) {
                edges.push({
                    id: `e-${parentId}-${nodeId}`,
                    source: parentId,
                    target: nodeId,
                    type: 'bezier',
                    animated: false,
                    style: { stroke: '#94a3b8', strokeWidth: 2 },
                });
            }

            if (node.children && Array.isArray(node.children)) {
                node.children.forEach(child => traverse(child, depth + 1, nodeId));
            }
        };

        // Root is special case
        traverse({ root: data.root, children: data.children }, 0, null);

        // Post-processing: Center parents vertically relative to children
        // (Skipped for complexity, using simple vertical list layout)

        return { nodes, edges };
    };

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return (
        <div className="w-full flex flex-col h-[700px] bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden relative">
            {/* View Toggle */}
            <div className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-md rounded-lg p-1 flex">
                <button
                    onClick={() => setViewMode('graph')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'graph'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                >
                    Network Graph
                </button>
                <button
                    onClick={() => setViewMode('mindmap')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'mindmap'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                >
                    Mind Map
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                    <p className="text-red-400 mb-4 bg-red-900/20 px-4 py-2 rounded border border-red-500/30">{error}</p>
                    <button
                        onClick={() => viewMode === 'graph' ? loadGraph(true) : loadMindMap()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-blue-400 font-medium">
                        {viewMode === 'graph' ? 'Analyzing relationships...' : 'Structuring mind map...'}
                    </p>
                </div>
            )}

            <div style={{ width: '100%', height: '100%' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    attributionPosition="bottom-right"
                    minZoom={0.1}
                >
                    <Controls />
                    <Background color="#aaa" gap={16} />
                </ReactFlow>
            </div>

            {/* Legend (Only for Graph) */}
            {viewMode === 'graph' && (
                <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur p-3 rounded-lg border border-white/10 text-xs text-gray-300 shadow-xl">
                    <div className="font-bold mb-2 text-white">Legend</div>
                    <div className="flex items-center mb-1"><div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div> Concept</div>
                    <div className="flex items-center mb-1"><div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div> Method</div>
                    <div className="flex items-center mb-1"><div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div> Dataset</div>
                    <div className="flex items-center mb-1"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> Metric</div>
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div> Model</div>
                </div>
            )}
        </div>
    );
}
