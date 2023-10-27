import { initialNodes, initialEdges } from './nodes-edges.js';
import ELK from 'elkjs/lib/elk.bundled.js';
import React, { useCallback, useLayoutEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Controls,
  Background,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from 'reactflow';
import { jsonData } from "./payload/sample-data";
import 'reactflow/dist/style.css';

const elk = new ELK({
  workerUrl: './elk-worker.min.js'
});

// Elk has a *huge* amount of options to configure. To see everything you can
// tweak check out:
//
// - https://www.eclipse.org/elk/reference/algorithms.html
// - https://www.eclipse.org/elk/reference/options.html
const elkOptions = {
  'considerModelOrder.strategy': 'NODES_AND_EDGES',
  'elk.algorithm': 'layered',
  'elk.partitioning.activate': 'true',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100.0',
  'elk.spacing.nodeNode': '80',
  'elk.core.options.Alignment': 'BOTTOM'
};

function getChildNodes(dataNodes, groupId) {
  let children = [];
  dataNodes.forEach(node => {
    const idParts = node.id.split("+");
    if (idParts && idParts.length > 2 && idParts[1] == groupId) {
      children.push(node);
    }
  });

  return children;
}

const updateParentNodes = (nodes, edges) => {
  let minX = Number.MAX_VALUE, minY = Number.MAX_VALUE;
  let maxX = 0, maxY = 0;
  nodes.forEach((node) => {
    if (node.nodeType === 'Parent') {
      let startX = Number.MAX_VALUE;
      let startY = Number.MAX_VALUE;
      let endX = 0;
      let endY = 0;
      let children = getChildNodes(nodes, node.id);
      children.forEach(element => {
        if (startX > element.x) {
          startX = element.x;
        }

        if (startY > element.y) {
          startY = element.y;
        }

        if (endX < element.x) {
          endX = element.x;
        }

        if (endY < element.y) {
          endY = element.y;
        }
      });

      node.x = startX - 50;//50 buffer,
      node.y = -50; //startY,

      node.style = {
        width: endX + 150 - startX + 100,//80 buffer = elk.layered.spacing.nodeNodeBetweenLayers
        height: endY + 100 > 700 ? endY + 100 : 700, //700 for min height
        backgroundColor: 'rgba(255, 255, 255, 0)',
      }

      minX = node.x < minX ? node.x : minX; //start of first parent node
      minY = node.y < minY ? node.y : minY; //start of first parent node
      maxX = node.x + node.style.width > maxX ? node.x + node.style.width : maxX; //start of last node + width, to get fill width progress bar
      maxY = node.y + node.style.height > maxY ? node.y + node.style.height : maxY;//not needed, because fixed height
    }

    return node;
  });

  let completed = jsonData.filter(x => x.State == 'Completed');
  let child = nodes.filter(x => x.nodeType == "Child");
  const total = [...new Set(child.map(item => item.id))];
  
  let percentComplete = Math.round(completed.length / total.length * 100);

  let frameWidth = maxX - minX;
  let green = nodes.find(x => x.nodeType === 'progressBarGreen');
  if (green) {
    green.data = { label: percentComplete + '%' };
    green.style = {
      width: (frameWidth * percentComplete) / 100,
      height: 50,
      backgroundColor: '#50C878',
    };
    green.x = minX;
    green.y = minY - 50;
  };

  let red = nodes.find(x => x.nodeType === 'progressBarRed');
  if (red) {
    console.log('red');
    red.data = { label: 100 - percentComplete + '%' };
    red.style = {
      width: maxX - (minX + (frameWidth * percentComplete) / 100),
      height: 50,
      backgroundColor: '#E74C3C',
    };
    red.x = minX + (frameWidth * percentComplete) / 100;
    red.y = minY - 50
  }
  return { nodes, edges };
};

const getLayoutedElements = (nodes, edges, options = {}) => {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  const graph = {
    id: 'root',
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,
      // Adjust the target and source handle positions based on the layout
      // direction.
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',

      // Hardcode a width and height for elk to use when layouting.
      width: 150,
      height: 50,
    })),
    edges: edges,
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => {
      //make node update
      const nodes = layoutedGraph.children;
      updateParentNodes(nodes, edges)

      return ({
        nodes: layoutedGraph.children.map((node) => ({
          ...node,
          // React Flow expects a position property on the node instead of `x`
          // and `y` fields.
          position: { x: node.x, y: node.y },
        })),

        edges: layoutedGraph.edges,
      })
    })
    .catch(console.error);
};

function LayoutFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
  const onLayout = useCallback(
    ({ direction, useInitialNodes = false }) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
      const ns = useInitialNodes ? initialNodes : nodes;
      const es = useInitialNodes ? initialEdges : edges;

      getLayoutedElements(ns, es, opts).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        window.requestAnimationFrame(() => fitView());
      });
    },
    [nodes, edges]
  );

  // Calculate the initial layout on mount.
  useLayoutEffect(() => {
    onLayout({ direction: 'RIGHT', useInitialNodes: true });
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onConnect={onConnect}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
    >
      <Background variant="dots" gap={12} size={1} />
      <Controls />
    </ReactFlow>
  );
}

export default () => (
  <ReactFlowProvider>
    <LayoutFlow />
  </ReactFlowProvider>
);
