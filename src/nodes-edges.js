import { jsonData } from "./payload/sample-data";

const nodeWidth = 172;
const nodeHeight = 36;
function generateGroupId(dataNode) {
    return `${dataNode.Scenario}`;
  }
  
  function generateNodeId(dataNode) {
    return `${dataNode.BusinessProcess}+${dataNode.Scenario}+${dataNode.Role}`;
  }
  
    function generatePrevNodeId(dataNode) {
        if (dataNode.BusinessProcess_Prev && dataNode.Scenario_Prev && dataNode.Role_Prev) {
            return `${dataNode.BusinessProcess_Prev}+${dataNode.Scenario_Prev}+${dataNode.Role_Prev}`;
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
     const scenarioGroups = Object.groupBy(jsonData, ({ Scenario }) => Scenario);
    
     Object.keys(scenarioGroups).forEach((key, index) => {
        const newGroup = {
            id: key,
            data: { label: key },
            children: [],
            style: {
                width: 500,
                height: 700,
            },
            position:{}
            // layoutOptions: {
            //   'partitioning.partition': index,
            // },
          };

          scenarioGroups[key].forEach(element => {
            const nodeId = generateNodeId(element);
            const prevNodeId = generatePrevNodeId(element);
            const newNode = {
                id: nodeId,
                data: { label: element.Role },
                position:{},
                // style: {
                //   width: nodeWidth,
                //   height: nodeHeight,
                // },
                parentNode: key,
                backgroundColor: '#E74C3C',
              };
            if (newGroup.children.findIndex(x => x.id === nodeId) === -1) {
              newGroup.children.push(newNode);
            }
              //nodes.push(newNode);

              if (prevNodeId != "--") {
                const edgeId = `${nodeId}-${prevNodeId}`;
                const edgeLabel = `to the ${element.Role}`;
                const edge = {
                  id: edgeId,
                  sources: [prevNodeId],
                  targets: [nodeId],
                  label: edgeLabel,
                  type: "smoothstep",
                };
        
                edges.push(edge);
              }
          });
          
         nodes.push(newGroup);
         if (index + 1 !== Object.keys(scenarioGroups).length) {
             edges.push({
                 id: `${Object.keys(scenarioGroups)[index]}-${Object.keys(scenarioGroups)[index + 1]}`,
                 sources: [Object.keys(scenarioGroups)[index]],
                 targets: [Object.keys(scenarioGroups)[index + 1]],
                 label: ``,
                 type: "smoothstep",
             })
         }
      });
    }
    return {
      initialNodes: nodes,
      initialEdges: edges,
    };
  }

  export const initialNodes = constructInitialNodes().initialNodes;
  export const initialEdges = constructInitialNodes().initialEdges;
