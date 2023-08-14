//TreeEditor.vue
<script lang="ts" setup>
import KonvaStage from "../components/KonvaStage.vue";
import TextMenu from "../components/TextMenu.vue";
import TextMenuItem from "../components/TextMenuItem.vue";
import {NodeDetails, NodeType, TreeNode} from "../types/TreeNode.ts";
import {reactive, ref, watch} from 'vue';
import * as d3 from 'd3';

const nodeMap = reactive({});
const nodes = reactive({
  type: NodeType.Sequence,
  id: 'node1',
  name: 'Node A',
  children: [
    {
      type: NodeType.Select,
      id: 'node2',
      name: 'attack',
      width: 100,
      height: 200,
      fill: 'red',
      children: [
        {
          type: NodeType.Action,
          id: 'node3',
          name: 'Spit'
        },
        {
          type: NodeType.Action,
          id: 'node4',
          name: 'Kick'
        },
        {
          type: NodeType.Action,
          id: 'node5',
          name: 'Punch'
        }
      ]
    },
    {
      type: NodeType.Action,
      id: 'node6',
      name: 'bite'
    },
    {
      type:NodeType.Sequence,
      id:'node7',
      name:'defend',
      children:[
        {
          type: NodeType.Action,
          id: 'node8',
          name: 'Parry'
        },
        {
          type: NodeType.Action,
          id: 'node9',
          name: 'Riposte'
        },
        {
          type: NodeType.Sequence,
          id: 'node10',
          name: 'Shield',
          children:[
            {
              type: NodeType.Action,
              id: 'node11',
              name: 'Grab Shield'
            },
            {
              type: NodeType.Action,
              id: 'node12',
              name: 'Hold Up Shield'
            },
            {
              type: NodeType.Action,
              id: 'node13',
              name: 'Deflect Attack'
            }
          ]
        }
      ]
    }
  ]
} as TreeNode);


const containerRef = ref(null);
const nodeWidth = ref(200);  // default values, adjust as needed
const nodeHeight = ref(100);  // default values, adjust as needed
const horizontalNodeSpacing = ref(50);
const verticalNodeSpacing = ref(25);


function addToNodeMap(node: TreeNode) {
  nodeMap[node.id] = node;
  if (node.children) {
    node.children.forEach(addToNodeMap);
  }
}

addToNodeMap(nodes);

const handleNodeIntersection = ({draggedNodeId, intersectingNodeId}) => {
  // Check node type rules
  let possibleParent = nodeMap[intersectingNodeId];

  //if the node is our root node, don't let it be placed as a child, who knows what that would do
  if (draggedNodeId === nodes.id) {
    return;
  }

  if (possibleParent && NodeDetails[possibleParent.type].canHaveChildren) {
    
    let currentParentNode = findParentNode(nodes, draggedNodeId);
    let draggedNode = nodeMap[draggedNodeId];

    if (currentParentNode) {
      const childIndex = currentParentNode.children.findIndex(child => child.id === draggedNodeId);
      if (childIndex !== -1) {
        currentParentNode.children.splice(childIndex, 1);
      }
    }
    possibleParent.children.push(draggedNode);
    recomputeSubtreeLayout(possibleParent)
  }

  function findParentNode(node, childId) {
    if (!node.children) return null;

    // Check if the current node is the parent of the child with the given childId
    const childIndex = node.children.findIndex(child => child.id === childId);
    if (childIndex !== -1) return node;

    // If the current node isn't the parent, search its children recursively
    for (const child of node.children) {
      const potentialParent = findParentNode(child, childId);
      if (potentialParent) return potentialParent;
    }

    return null; // If no parent is found
  }

  function recomputeSubtreeLayout(node) {

    // Compute the subtree layout using D3
    const root = d3.hierarchy(node);
    const treeLayout = d3.tree().nodeSize([nodeWidth.value + horizontalNodeSpacing.value, nodeHeight.value + verticalNodeSpacing.value]); // Adjust nodeSize as needed
    treeLayout(root);
    
    for (let child of root.children) {
      applyOffset(child, node.x,node.y);
    }
  }

  function applyOffset(node, dx, dy) {
    node.data.x = dx+node.x;
    node.data.y = dy+node.y;
    for (let child of node.children || []) {
      applyOffset(child, dx, dy);
    }
  }
};


function layoutTree() {
  const root = d3.hierarchy(nodes);
// Define the tree layout
  const treeLayout = d3.tree().nodeSize([nodeWidth.value + horizontalNodeSpacing.value, nodeHeight.value + verticalNodeSpacing.value]); // Adjust nodeSize as needed

// Compute the layout
  treeLayout(root);

// Function to merge the computed positions back into the original data
  function mergePositions(node) {
    node.data.x = node.x;
    node.data.y = node.y;

    if (node.children) {
      node.children.forEach(mergePositions);
    }
  }

// Merge the positions
  mergePositions(root);
}

layoutTree();

watch(nodeWidth, layoutTree);
watch(nodeHeight, layoutTree);
</script>

<template>
  <div class="container">
    <div class="toolbar">
      <text-menu>
        <text-menu-item>
          File
          <template #children>
            <text-menu-item action="save">Save
              <fa-icon icon="fa-solid fa-floppy-disk"></fa-icon>
            </text-menu-item>
          </template>
        </text-menu-item>
        <text-menu-item>
          Edit
          <template #children>
            <text-menu-item>Name
              <template #children>
                <text-menu-item>Case
                  <template #children>
                    <text-menu-item action="changeToUpper">Upper</text-menu-item>
                    <text-menu-item action="changeToLower">Lower</text-menu-item>
                  </template>
                </text-menu-item>

              </template>
            </text-menu-item>
            <text-menu-item>
              Change Shape
              <template #children>
                <text-menu-item action="changeToCircle">Circle</text-menu-item>
                <text-menu-item action="changeToSquare">Square</text-menu-item>
              </template>
            </text-menu-item>
          </template>
        </text-menu-item>
        <text-menu-item action="displayHelp">Help</text-menu-item>
      </text-menu>
    </div>
    <div ref="containerRef" class="canvas">
      <konva-stage
          :containerRef="containerRef"
          :nodeHeight="nodeHeight"
          :nodeWidth="nodeWidth"
          :nodes="nodes"
          @nodeIntersection="handleNodeIntersection"/>
    </div>
    <div class="editor"></div>
  </div>
</template>

<style scoped>
.canvas {
  grid-area: canvas;
  height: 100%;
}

.editor {
  grid-area: editor;
  height: 100%;
}

.toolbar {
  grid-area: toolbar;
  background-color: var(--menu-bg-color);
  /* Add any other styles for the new row here */
}

.container {
  display: grid;
  grid-template-areas:
        "toolbar toolbar toolbar toolbar editor"
        "canvas canvas canvas canvas editor";
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr; /* 5 columns */
  grid-template-rows: auto 1fr; /* 10% for the new row's height, 90% for the canvas */
  height: 100%
}
</style>