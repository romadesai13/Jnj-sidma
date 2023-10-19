import { jsonData } from "./payload/sample-data";

function generateNodeId(dataNode) {
  return `${dataNode.BusinessProcess}+${dataNode.Scenario}+${dataNode.Role}`;
}

function generatePrevNodeId(dataNode) {
  if (dataNode.BusinessProcess_Prev && dataNode.Scenario_Prev && dataNode.Reole_Prev) {
    return `${dataNode.BusinessProcess_Prev}+${dataNode.Scenario_Prev}+${dataNode.Reole_Prev}`;
  } else { return '--' }
}

function getBgColor(state) {
  switch (state) {
    case 'Completed':
      return '#50C878';
      break;
    case 'InProgress':
      return 'yellow';
      break;
    default:
      return '#E74C3C';
  }
}


function constructInitialNodes() {
  const nodes = [];
  const edges = [];
  if (jsonData) {
    const scenarioGroups = Object.groupBy(jsonData, ({ Scenario }) => Scenario);

    Object.keys(scenarioGroups).forEach((key, index) => {
      const newGroup = {
        id: key,
        data: { label: key },
        type: 'output',
        position: {},
        layoutOptions: {
          'partitioning.partition': index,
        },
        draggable: false,
        nodeType: 'Parent'
      };
      if (nodes.findIndex(x => x.id === key) === -1) {
        nodes.push(newGroup);
      }
      scenarioGroups[key].forEach(element => {
        const nodeId = generateNodeId(element);
        const prevNodeId = generatePrevNodeId(element);
        const newNode = {
          id: nodeId,
          data: { label: element.Role },
          position: {},
          layoutOptions: {
            'partitioning.partition': index,
          },
          draggable: false,
          style: { backgroundColor: getBgColor(element.State) },
          nodeType: 'Child'
        };
        if (nodes.findIndex(x => x.id === nodeId) === -1) {
          nodes.push(newNode);
        }

        if (prevNodeId != "--") {
          const edgeId = `${nodeId}-${prevNodeId}`;
          const edgeLabel = `to the ${element.Role}`;
          const edge = {
            id: edgeId,
            source: prevNodeId,
            target: nodeId,
            label: edgeLabel,
            type: "smoothstep",
          };

          edges.push(edge);
        }
      });
    });

    const progressBarGreenNode = {
      id: 'progressBarGreen',
      //data: { label: percentComplete + '%' },
      draggable: false,
      className: 'pb',
      type: 'default',
      position: {
        x: 0,//minX,
        y: 0,//minY + 50
      },
      nodeType: 'progressBarGreen'
    };
    nodes.push(progressBarGreenNode);
  
    const progressBarRedNode = {
      id: 'progressBarRed',
      //data: { label: 100 - percentComplete + '%' },
      draggable: false,
      className: 'pb',
      type: 'default',
      position: {
        x: 50,//minX + (frameWidth * percentComplete)/100,
        y: 50//minY + 50
      },
      nodeType: 'progressBarRed'
    };
    nodes.push(progressBarRedNode)
  }
  return {
    initialNodes: nodes,
    initialEdges: edges,
  };
}

export const initialNodes = constructInitialNodes().initialNodes;
export const initialEdges = constructInitialNodes().initialEdges;
