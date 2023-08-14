//KonvaNode.vue
<script lang="ts" setup>
import {computed, defineProps, PropType, ref} from 'vue';
import {NodeDetails,TreeNode} from "../types/TreeNode.ts";

const props = defineProps({
  node: {
    type: Object as PropType<TreeNode>,
    required: true
  },
  nodeWidth: Number,
  nodeHeight: Number
});
const headerHeight = computed(() => props.nodeHeight * 0.2);
const bodyHeight = computed(() => props.nodeHeight - headerHeight.value);
const emit = defineEmits(['update:isShapeDragging', 'mouseout', 'mouseover', 'nodeDragEnd']);

const onDragStart = (event) => {
  // Inform the parent (KonvaStage) that a shape is being dragged
  emit('update:isShapeDragging', true);
};

const onDragEnd = (event) => {
  const group = event.currentTarget;
  // Update the node's x and y based on the new position
  props.node.x = group.x();
  props.node.y = group.y();

  // Inform the parent (KonvaStage) that the shape dragging has ended
  emit('update:isShapeDragging', false);

  // Emit the node details
  emit('nodeDragEnd', group);
};
const handleMouseEvent = (event) => {
  emit(event);
};
const onNodeDragEnd = (node) => {
  emit('nodeDragEnd', node);
};
</script>

<template>
  <!-- Group as a container for each node -->
  <v-group :id="node.id" :x="node.x" :y="node.y" draggable="true" @dragend="onDragEnd" @dragstart="onDragStart"
           @mouseout="handleMouseEvent('mouseout')" @mouseover="handleMouseEvent('mouseover')">
    <!-- Render the heading (top part of the node) -->
    <v-rect :fill="'blue'" :height="headerHeight" :width="nodeWidth"></v-rect>
    <!-- Render the node's name on the heading -->
    <v-text :height="headerHeight" :text="node.name" :width="nodeWidth" align="center" verticalAlign="middle"/>
    <!-- Render the main body (bottom part of the node) -->
    <v-rect :fill="'red'" :height="bodyHeight" :width="nodeWidth" :y="nodeHeight * 0.2"></v-rect>
  </v-group>

  <!-- Recursive render of children nodes -->
  <template v-if="node.children">
    <template v-for="child in node.children">
      <!-- Draw line between parent and child -->
      <v-line :points="[node.x + nodeWidth / 2, node.y + nodeHeight, child.x + nodeWidth / 2, child.y]" stroke="black"/>

      <!-- Render child node -->
      <konva-node :node="child" :nodeHeight="nodeHeight" :nodeWidth="nodeWidth" @mouseout="handleMouseEvent('mouseout')"
                  @mouseover="handleMouseEvent('mouseover')" @nodeDragEnd="onNodeDragEnd"/>
    </template>
  </template>
</template>
