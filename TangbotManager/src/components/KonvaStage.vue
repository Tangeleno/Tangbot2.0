//KonvaStage.vue
<script lang="ts" setup>
import {nextTick, onBeforeUnmount, onMounted, PropType, reactive, ref} from 'vue';
import Konva from "konva";
import KonvaNode from "@/components/KonvaNode.vue"; // Import the KonvaNode component
import {nodeStore} from '@/stores';
import {NodeType, TreeNode} from "@/types/TreeNode.ts";

const props = defineProps({
  containerRef: {
    type: Object as PropType<HTMLDivElement>,
    required: true
  }
});

const emit = defineEmits(['nodeIntersection']);

const configKonva = reactive({
  width: 200,  // default values, will be updated
  height: 200  // default values, will be updated
});

const stageRef = ref<Konva.Stage | null>(null);
const isShapeDragging = ref(false);
const currentScale = ref(1);
let isDragging = false;
let lastPos = {x: 0, y: 0};

const handleWheel = (event: WheelEvent) => {
  event.preventDefault();

  if (!stageRef.value) return;
  const stage = (stageRef.value as any).getStage() as Konva.Stage;
  // Zoom in or out based on the deltaY value of the wheel event
  // Smaller deltaY values indicate zooming in and vice versa
  const scaleBy = 1.05;
  const newScale = event.deltaY > 0 ? currentScale.value / scaleBy : currentScale.value * scaleBy;

  // Apply the new scale factor to the stage
  stage.scale({x: newScale, y: newScale});
  stage.draw();

  // Update the current scale
  currentScale.value = newScale;
};
const doDrag = (event: Konva.KonvaEventObject<MouseEvent>) => {
  if (!isDragging || !stageRef.value) return;

  const deltaX = event.evt.clientX - lastPos.x;
  const deltaY = event.evt.clientY - lastPos.y;

  const stage = (stageRef.value as any).getStage() as Konva.Stage;

  stage.x(stage.x() + deltaX);
  stage.y(stage.y() + deltaY);
  stage.batchDraw();

  lastPos = {
    x: event.evt.clientX,
    y: event.evt.clientY
  };
};
const endDrag = () => {
  isDragging = false;
  props.containerRef!.style.cursor = 'grab';
};

const onShapeMouseOver = () => {
  props.containerRef!.style.cursor = 'pointer';
};

const handleNodeDragEnd = (draggedNode) => {
  // Check for intersections with other nodes
  const intersectingNode = checkForNodeIntersections(draggedNode);

  console.log('Checked for intersecting nodes, received', intersectingNode)
  if (intersectingNode) {
    emit('nodeIntersection', {draggedNodeId: draggedNode.id(), intersectingNodeId: intersectingNode.id()});
  }
};

const checkForNodeIntersections = (draggedNode) => {
  let intersectingShape = null;
  const stage = (stageRef.value as any).getStage() as Konva.Stage;
  toggleChildListening(draggedNode, false);
  // Check the four corners of the draggedNode for intersections
  const corners = [
    {x: draggedNode.getClientRect().x, y: draggedNode.getClientRect().y},
    {x: draggedNode.getClientRect().x + draggedNode.getClientRect().width, y: draggedNode.getClientRect().y},
    {x: draggedNode.getClientRect().x, y: draggedNode.getClientRect().y + draggedNode.getClientRect().height},
    {
      x: draggedNode.getClientRect().x + draggedNode.getClientRect().width,
      y: draggedNode.getClientRect().y + draggedNode.getClientRect().height
    }
  ];

  for (const corner of corners) {
    intersectingShape = stage.getIntersection(corner);
    if (intersectingShape && intersectingShape !== draggedNode) {
      break
    }
  }
  toggleChildListening(draggedNode, true);
  //traverse up the intersected shape until we find our group node
  while (intersectingShape && intersectingShape.parent && intersectingShape.getType() !== 'Group') {
    intersectingShape = intersectingShape.parent;
  }
  return intersectingShape;
};

const onShapeMouseOut = () => {
  props.containerRef!.style.cursor = isShapeDragging.value ? 'grabbing' : 'grab';
};

const handleShapeDrag = (status) => {
  isShapeDragging.value = status;
};

const toggleChildListening = (node, status) => {
  node.children.forEach(child => {
    child.listening(status);
  });
  node.getLayer().drawHit();
};

const startDrag = (event: Konva.KonvaEventObject<MouseEvent>) => {
  if (isShapeDragging.value) return; // Prevent stage dragging if a shape is being dragged

  isDragging = true;
  props.containerRef!.style.cursor = 'grabbing';
  lastPos = {
    x: event.evt.clientX,
    y: event.evt.clientY
  };
};

const updateStageSize = () => {
  if (props.containerRef) {
    configKonva.width = props.containerRef.offsetWidth;
    configKonva.height = props.containerRef.offsetHeight;
  }
};

const centerAndZoomStage = () => {
  if (!stageRef.value || !nodeStore.nodes) return;
  const stage = stageRef.value.getStage();

  // 1. Determine the bounding box of your tree
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of Object.values(nodeStore.nodes)) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + nodeStore.nodeWidth);
    maxY = Math.max(maxY, node.y + nodeStore.nodeHeight);
  }

  // 2. Determine the center of the bounding box
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // 3. Determine the scaling factor
  const treeWidth = maxX - minX;
  const treeHeight = maxY - minY;
  const scaleX = configKonva.width / treeWidth;
  const scaleY = configKonva.height / treeHeight;
  const scale = Math.min(scaleX, scaleY);

  // 4. Apply the transformation
  stage.position({ x: -centerX * scale + configKonva.width / 2, y: -centerY * scale + configKonva.height / 2 });
  stage.scale({ x: scale, y: scale });
  stage.draw();
};

const handleNodeClick = (nodeId) => {
  nodeStore.selectNode(nodeId);
};

const generateBezierPathForNode = (node:TreeNode) => {
  if (!node.parentId) return "";  // Return empty if there's no parent

  const parentNode = nodeStore.nodes[node.parentId];
  let start, end, _;
  

  // Determine the start point based on the parent node's type
  switch(parentNode.type) {
    case NodeType.Select:
    case NodeType.RandomSelector:
      [start, _] = parallelogramStartEndPoints(parentNode, 0.15);
      break;

    case NodeType.Sequence:
      [start, _] = parallelogramStartEndPoints(parentNode, -0.15);
      break;

    case NodeType.Parallel:
    case NodeType.Action:
    case NodeType.Wait:
      [start, _] = rectangleStartEndPoints(parentNode);
      break;

    case NodeType.Invert:
    case NodeType.Loop:
      [start, _] = triangleStartEndPoints(parentNode);
      break;

    case NodeType.Retry:
    case NodeType.Repeat:
      [start, _] = sideTriangleStartEndPoints(parentNode);
      break;

    case NodeType.Failer:
    case NodeType.Succeeder:
      [start, _] = ellipseStartEndPoints(parentNode);
      break;
  }

  // Determine the end point based on the current node's type
  switch(node.type) {
    case NodeType.Select:
    case NodeType.RandomSelector:
      [_, end] = parallelogramStartEndPoints(node, 0.15);
      break;

    case NodeType.Sequence:
      [_, end] = parallelogramStartEndPoints(node, -0.15);
      break;

    case NodeType.Parallel:
      [_, end] = rectangleStartEndPoints(node);
      break;

    case NodeType.Invert:
    case NodeType.Loop:
      [_, end] = triangleStartEndPoints(node);
      break;

    case NodeType.Retry:
    case NodeType.Repeat:
      [_, end] = sideTriangleStartEndPoints(node);
      break;

    case NodeType.Failer:
    case NodeType.Succeeder:
    case NodeType.Action:
    case NodeType.Wait:
      [_, end] = ellipseStartEndPoints(node);
      break;
  }

  // Generate the SVG path command for the Bezier curve
  const horizontalOffset = 30;  // Adjust as needed
  return generateCubicBezierPath(start, end, horizontalOffset);
}
function generateCubicBezierPath(start, end, horizontalOffset) {
  // Calculate the mid-point
  const mid = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2
  };

  // Control points for the first curve
  const cp1 = {
    x: start.x + horizontalOffset,
    y: start.y
  };
  const cp2 = {
    x: mid.x - horizontalOffset,
    y: start.y
  };

  // Control points for the second curve
  const cp3 = {
    x: mid.x + horizontalOffset,
    y: end.y
  };
  const cp4 = {
    x: end.x - horizontalOffset,
    y: end.y
  };

  return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${mid.x} ${mid.y} C ${cp3.x} ${cp3.y} ${cp4.x} ${cp4.y} ${end.x} ${end.y}`;
}
function rectangleStartEndPoints(node) {
  const start = {x: node.x + nodeStore.nodeWidth, y: node.y + nodeStore.nodeHeight / 2};
  const end = {x: node.x, y: node.y + nodeStore.nodeHeight / 2};
  return [start, end];
}

function triangleStartEndPoints(node) {
  const halfWidth = nodeStore.nodeWidth / 2;
  const commonY = node.y + (nodeStore.nodeHeight / 2);

  const startXAdjustment = halfWidth * 1.50;
  const endXAdjustment = node.x + halfWidth * 0.5;

  return [
    { x: node.x + startXAdjustment, y: commonY },
    { x: endXAdjustment, y: commonY }
  ];
}

function sideTriangleStartEndPoints(node) {
  const commonY = node.y + (nodeStore.nodeHeight / 2);


  return [
    { x: node.x+nodeStore.nodeWidth, y: commonY },
    { x: node.x, y: commonY }
  ];
}

function parallelogramStartEndPoints(node, sX) {
  // Skew adjustment based on the height of the parallelogram and sX
  const skewAdjustment = nodeStore.nodeHeight * sX / 2;  // Half the adjustment for the midpoint

  // Midpoint on the y-axis
  const commonY = node.y + nodeStore.nodeHeight / 2;

  return [
    { x: node.x + nodeStore.nodeWidth + skewAdjustment, y: commonY },  // Start point on the right edge
    { x: node.x + skewAdjustment, y: commonY }  // End point on the left edge
  ];
}

function ellipseStartEndPoints(node) {
  const halfHeight = nodeStore.nodeHeight / 2;

  return [
    { x: node.x + nodeStore.nodeWidth, y: node.y - halfHeight },  // Start point on the right side
    { x: node.x, y: node.y + halfHeight }  // End point on the left side
  ];
}

onMounted(() => {
  nextTick(() => {
    updateStageSize();
    
    if (stageRef.value) {
      centerAndZoomStage();
    }
    props.containerRef!.addEventListener('wheel', handleWheel);
  });
  window.addEventListener('resize', updateStageSize);

});
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateStageSize);
  props.containerRef!.removeEventListener('wheel', handleWheel);
});

defineExpose({centerAndZoomStage})

</script>

<template>
  <v-stage ref="stageRef" :config="configKonva" class="v-stage" @mousedown="startDrag" @mouseleave="endDrag"
           @mousemove="doDrag"
           @mouseup="endDrag">
    <v-layer>
      <template v-for="(node, key, index) in nodeStore.nodes" :key="node.id">
        <konva-node
            :node="node"
            :nodeHeight="nodeStore.nodeHeight"
            :nodeWidth="nodeStore.nodeWidth"
            :selected="node.id ==nodeStore.selectedNodeId"
            @mouseout="onShapeMouseOut"
            @mouseover="onShapeMouseOver"
            @nodeClick="handleNodeClick"
            @nodeDragEnd="handleNodeDragEnd"
            @update:isShapeDragging="handleShapeDrag"/>
        <v-path v-if="node.parentId" :data="generateBezierPathForNode(node)" stroke="gray"></v-path>
      </template>
    </v-layer>
  </v-stage>
</template>

<style scoped>
.v-stage {
  cursor: grab;
}
</style>