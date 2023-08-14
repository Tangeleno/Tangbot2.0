//KonvaStage.vue
<script lang="ts" setup>
import {nextTick, onBeforeUnmount, onMounted, reactive, ref} from 'vue';
import Konva from "konva";
import KonvaNode from "./KonvaNode.vue"; // Import the KonvaNode component

const props = defineProps({
  containerRef: {
    type: Object,
    required: true
  },
  nodes: {
    type: Object,
    required: true
  },
  nodeWidth: Number,
  nodeHeight: Number
});

const emit = defineEmits(['nodeIntersection']);

const configKonva = reactive({
  width: 200,  // default values, will be updated
  height: 200  // default values, will be updated
});

const stageRef = ref(null);
const isShapeDragging = ref(false);
const currentScale = ref(1);
let isDragging = false;
let lastPos = {x: 0, y: 0};

const handleWheel = (event: WheelEvent) => {
  event.preventDefault();

  if (!stageRef.value) return;

  const stage = stageRef.value.getStage();

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

  const stage = stageRef.value.getStage();

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
  props.containerRef.style.cursor = 'grab';
};

const onShapeMouseOver = () => {
  props.containerRef.style.cursor = 'pointer';
};

const handleNodeDragEnd = (draggedNode) => {
  // Check for intersections with other nodes
  const intersectingNode = checkForNodeIntersections(draggedNode);

  console.log('Checked for intersecting nodes, received', intersectingNode)
  if (intersectingNode) {
    emit('nodeIntersection', {draggedNodeId:draggedNode.id(), intersectingNodeId:intersectingNode.id()});
  }
};

const checkForNodeIntersections = (draggedNode) => {
  let intersectingShape = null;
  const stage = stageRef.value.getStage();
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
  props.containerRef.style.cursor = isShapeDragging.value ? 'grabbing' : 'grab';
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
  props.containerRef.style.cursor = 'grabbing';
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

onMounted(() => {
  nextTick(() => {
    updateStageSize();
    props.containerRef.addEventListener('wheel', handleWheel);
  });
  window.addEventListener('resize', updateStageSize);

});
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateStageSize);
  props.containerRef.removeEventListener('wheel', handleWheel);
});
</script>

<template>
  <v-stage ref="stageRef" :config="configKonva" @mousedown="startDrag" @mouseleave="endDrag"
           @mousemove="doDrag"
           @mouseup="endDrag">
    <v-layer>
      <konva-node
          :node="nodes"
          :nodeHeight="nodeHeight"
          :nodeWidth="nodeWidth"
          @mouseout="onShapeMouseOut"
          @mouseover="onShapeMouseOver"
          @nodeDragEnd="handleNodeDragEnd"
          @update:isShapeDragging="handleShapeDrag"/>
    </v-layer>
  </v-stage>
</template>

<style scoped>
.v-stage {
  cursor: grab;
}
</style>