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
            nodeType: 'Parent',
            style: {
                width: 500,
                height: 700,
              },
              level: "cluster",
            // layoutOptions: {
            //   'partitioning.partition': index,
            // },
          };

          scenarioGroups[key].forEach(element => {
            const nodeId = generateNodeId(element);
            const prevNodeId = generatePrevNodeId(element);
            const newNode = {
                id: nodeId,
                level: "leaf",
                labels: [{"text":element.Role}],
                data: { label: element.Role },
                nodeType: 'Child',
                width: nodeWidth,
                height: nodeHeight,
                parentNode: key,
                style:{},
                extent: 'parent',
                backgroundColor: '#E74C3C',
                
              };
              newGroup.children.push(newNode);
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
    console.log(nodes, edges)
    return {
      initialNodes: nodes,
      initialEdges: edges,
    };
  }

  export const initialNodes = [
    {
        id:"analytics1",
        level: "cluster",
        name: "analytics1",
        children: [
            {
                id:"animate1",
                level: "leaf",
                height: 30,
                width: 30,
                parent: 1,
                labels: [{"text":"a"}]
            },
            {
                id:"animate2",
                level: "leaf",
                height: 30,
                width: 30,
                parent: 1,
                labels: [{"text":"b"}]
            },
            {
                id:"animate3",
                level: "leaf",
                height: 30,
                width: 30,
                parent: 1,
                labels: [{"text":"c"}]
            }
        ]
    },
    {
        id:"analytics2",
        level: "cluster",
        name: "analytics2",
        children: [
            {
                id:"animate6",
                level: "leaf",
                height: 30,
                width: 30,
                parent: 1,
                labels: [{"text":"f"}]
            },
            {
                id:"animate8",
                level: "leaf",
                height: 30,
                width: 30,
                parent: 1,
                "labels": [{"text":"h"}]
            }
        ]
    },
    {id: "n1", width: 30, height: 30, labels: [{text:"d"}]}
  ];//constructInitialNodes().initialNodes;
  export const initialEdges = [
    {id: "e1", sources: ["animate2"], targets: ["n1"]},
    {id: "e2", sources: ["animate3"], targets: ["n1"]},
    {id: "e3", sources: ["animate1"], targets: ["n1"]},
    {id: "e4", sources: ["n1"], targets: ["animate8"]},
    {id: "e5", sources: ["n1"], targets: ["animate6"]},
  ];//constructInitialNodes().initialEdges;
  const position = { x: 0, y: 0 };

// export const initialNodes = [
//   {
//     id: 'X',
//     type: 'group',
//     data: { label: null },
//     position,
//   },
//   {
//     id: '1',
//     type: 'input',
//     data: { label: 'input' },
//     position,
//     parentNode: 'X',
//   },
//   {
//     id: '2',
//     data: { label: 'node 2' },
//     position,
//     parentNode: 'X',
//   },
//   {
//     id: '2a',
//     data: { label: 'node 2a' },
//     position,

//   },
//   {
//     id: '2b',
//     data: { label: 'node 2b' },
//     position,
//   },
//   {
//     id: '2c',
//     data: { label: 'node 2c' },
//     position,
//   },
//   {
//     id: '3',
//     data: { label: 'node 3' },
//     position,
//     parentNode: 'X',
//   },
// ];

// export const initialEdges = [
//   { id: 'e12', source: '1', target: '2', type: 'smoothstep' },
//   { id: 'e13', source: '1', target: '3', type: 'smoothstep' },
//   { id: 'e22a', source: '2', target: '2a', type: 'smoothstep' },
//   { id: 'e22b', source: '2', target: '2b', type: 'smoothstep' },
//   { id: 'e22c', source: '2', target: '2c', type: 'smoothstep' },
 
// ];
