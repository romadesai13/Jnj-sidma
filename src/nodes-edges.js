const position = { x: 0, y: 0 };

export const initialNodes = [
  {
    id: 'X',
    type: 'group',
    data: { label: null },
    position,
  },
  {
    id: '1',
    type: 'input',
    data: { label: 'input' },
    position,
    parentNode: 'X',
  },
  {
    id: '2',
    data: { label: 'node 2' },
    position,
    parentNode: 'X',
  },
  {
    id: '2a',
    data: { label: 'node 2a' },
    position,

  },
  {
    id: '2b',
    data: { label: 'node 2b' },
    position,
  },
  {
    id: '2c',
    data: { label: 'node 2c' },
    position,
  },
  {
    id: '3',
    data: { label: 'node 3' },
    position,
    parentNode: 'X',
  },
];

export const initialEdges = [
  { id: 'e12', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e13', source: '1', target: '3', type: 'smoothstep' },
  { id: 'e22a', source: '2', target: '2a', type: 'smoothstep' },
  { id: 'e22b', source: '2', target: '2b', type: 'smoothstep' },
  { id: 'e22c', source: '2', target: '2c', type: 'smoothstep' },
 
];
