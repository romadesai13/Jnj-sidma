import React, { useCallback } from "react";
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Panel,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import dagre from "dagre";

import "reactflow/dist/style.css";

import { jsonData } from "./payload/sample-data";

function generateGroupId(dataNode) {
  return `${dataNode.Scenario}`;
}

function generateNodeId1(dataNode) {
  return `${dataNode.BusinessProcess}-${dataNode.Scenario}-${dataNode.Role}`;
}

function generatePrevNodeId(dataNode) {
  return `${dataNode.BusinessProcess_Prev}-${dataNode.Scenario_Prev}-${dataNode.Role_Prev}`;
}

function constructInitialNodes() {
  const nodes = [];
  const edges = [];
  let initX = 0;
  let initY = 0;
  let xOffset = 400;
  let yOffset = 400;
  if (jsonData) {
    jsonData.map((n) => {
      const groupId = generateGroupId(n);
      const nodeId = generateNodeId1(n);
      const prevNodeId = generatePrevNodeId(n);
      console.log(nodes, groupId, !nodes.some(x => x.id === groupId))
      if(!nodes.includes(x=> x.id == groupId)) {
        console.log('Hi', initX, initY)
        const newGroup = {
          id: groupId,
          type: 'group',
          data: { label: n.Scenario },
          position: { x: initX, y: initY },
          style: {
            width: '33%',
            height: '100%',
          },
        };
        nodes.push(newGroup);
        initX+=xOffset;
        initY+=yOffset;
      }

      const newNode = {
        id: nodeId,
        data: { label: n.Role },
        parentNode: n.Scenario 
      };

      if (prevNodeId == "--") {
        newNode.type = "input";
      }
      nodes.push(newNode);

      if (prevNodeId != "--") {
        const edgeId = `${nodeId}-${prevNodeId}`;
        const edgeLabel = `to the ${n.Role}`;
        const edge = {
          id: edgeId,
          source: prevNodeId,
          target: nodeId,
          label: edgeLabel,
          type: "step",
        };

        edges.push(edge);
      }
    });
  }
  console.log("initialnodes: ", nodes, "initial edged", edges);
  return {
    initialNodes: nodes,
    initialEdges: edges,
  };
}

const { initialNodes, initialEdges } = constructInitialNodes();

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes, edges, direction = "LR") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? "left" : "top";
    node.sourcePosition = isHorizontal ? "right" : "bottom";

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x, //- nodeWidth / 2,
      y: nodeWithPosition.y, //- nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  initialNodes,
  initialEdges
);

const AppFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds
        )
      ),
    []
  );
  const onLayout = useCallback(
    (direction) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
    >
        <Background variant="dots" gap={12} size={1} />
      {/* <Panel position="top-right">
        <button onClick={() => onLayout('TB')}>vertical layout</button>
        <button onClick={() => onLayout('LR')}>horizontal layout</button>
      </Panel> */}
    </ReactFlow>
  );
};

export default AppFlow;
