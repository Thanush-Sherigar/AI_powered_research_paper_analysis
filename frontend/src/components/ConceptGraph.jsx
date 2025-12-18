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
        <div className="w-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Navigation Bar */}
            <div className="flex items-center border-b border-gray-200 bg-gray-50">
                <button
                    onClick={() => setViewMode('graph')}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${viewMode === 'graph'
                        ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Network Graph
                    </div>
                </button>
                <button
                    onClick={() => setViewMode('mindmap')}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${viewMode === 'mindmap'
                        ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                        </svg>
                        Mind Map
                    </div>
                </button>
            </div>

            {/* Graph Container */}
            <div className="w-full h-[700px] bg-slate-900/50 relative">
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
        </div>
    );
}
