import React, { useCallback } from "react";
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Controls,
  Panel,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import dagre from "dagre";
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';
import "reactflow/dist/style.css";

import { jsonData } from "./payload/sample-data";

function generateGroupId(dataNode) {
  return `${dataNode.Scenario}`;
}

function generateNodeId1(dataNode) {
  return `${dataNode.BusinessProcess}+${dataNode.Scenario}+${dataNode.Role}`;
}

function generatePrevNodeId(dataNode) {
  return `${dataNode.BusinessProcess_Prev}+${dataNode.Scenario_Prev}+${dataNode.Role_Prev}`;
}

function getBgColor(state) {
  switch (state) {
    case 'Completed':
      return 'green';
      break;
    case 'InProgress':
      return 'yellow';
      break;
    default:
      return 'red';
  }
}

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

function constructInitialNodes() {
  const nodes = [];
  const edges = [];
  if (jsonData) {
    jsonData.map((n) => {
      const groupId = generateGroupId(n);
      const nodeId = generateNodeId1(n);
      const prevNodeId = generatePrevNodeId(n);
      if (nodes.findIndex(x => x.id == groupId) == -1) {
        const newGroup = {
          id: groupId,
          data: { label: n.Scenario },
          draggable: false,
          className: 'light nodrag',
          type: "output",
          style: {
            width: 700,
            height: 900,
          },
        };
        nodes.push(newGroup);
      }

      const newNode = {
        id: nodeId,
        data: { label: n.Role },
        draggable: false,
        style: { backgroundColor: getBgColor(n.State) },
        className: 'nodrag'
        //parentNode: n.Scenario,
        // expandParent : true,
        //extent: 'parent' 
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

  nodes.forEach((node) => {
    if (node.type === 'output') {
      let startX = Number.MAX_VALUE;
      let startY = Number.MAX_VALUE;
      let endX = 0;
      let endY = 0;
      let children = getChildNodes(nodes, node.id);
      children.forEach(element => {
        const nodeWithPosition = dagreGraph.node(element.id)
        if (startX > nodeWithPosition.x) {
          startX = nodeWithPosition.x;
        }

        if (startY > nodeWithPosition.y) {
          startY = nodeWithPosition.y;
        }

        if (endX < nodeWithPosition.x) {
          endX = nodeWithPosition.x;
        }

        if (endY < nodeWithPosition.y) {
          endY = nodeWithPosition.y;
        }
      });

      node.position = {
        x: startX - 50,//50 buffer,
        y: 0, //startY,
      };

      node.style = {
        width: endX + 172 - startX + 50,//50 buffer
        height: endY + 36 - startY > 500 ? endY + 36 - startY : 500, //500 for min height
        backgroundColor: 'rgba(255, 255, 255, 0)',
      }
    }

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
          { ...params },
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
    <div class="container">
      <div class="progressbar">
      <ProgressIndicator label="Progress Example" description="" percentComplete={0.5} barHeight={8} />
      </div>
      <div class="reactflow">
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
          <Controls />
          {/* <Panel position="top-right">
          <button onClick={() => onLayout('TB')}>vertical layout</button>
          <button onClick={() => onLayout('LR')}>horizontal layout</button>
        </Panel> */}
        </ReactFlow>
      </div>
    </div>
  );
};

export default AppFlow;
