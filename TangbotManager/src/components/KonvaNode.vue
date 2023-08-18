<template>
  <!-- Group as a container for each node -->
  <v-group :id="node.id" :x="node.x" :y="node.y" draggable="true" @dragend="onDragEnd" @dragstart="onDragStart"
           @mouseout="handleMouseEvent('mouseout')" @mouseover="handleMouseEvent('mouseover')">
    <!-- Render based on the type of node -->
    <v-rect v-if="isComposite" :fill="'#672767'" :height="nodeHeight" :stroke="'black'" :strokeWidth="2"
            :width="nodeWidth"/>
    <v-ellipse v-if="isDecorator" :fill="'#864718'" :radius="{x: nodeWidth/2, y: nodeHeight/2}" :stroke="'black'"
               :strokeWidth="2"
               :x="nodeWidth / 2"
               :y="nodeHeight / 2"/>
    <v-line v-if="isAction"
            :closed="true" :fill="'#002277'"
            :points="[0, nodeHeight/2, nodeWidth/2, 0, nodeWidth, nodeHeight/2, nodeWidth/2, nodeHeight]"
            :stroke="'black'" :strokeWidth="2"/>

    <!-- Render the node's name on the shape -->
    <v-text :fill="'#f7f7f7'" :fillAfterStrokeEnabled="true" :fontSize="16" :height="nodeHeight"
            :stroke="'#010101'" :strokeWidth="1" :text="node.name" :width="nodeWidth" align="center"
            verticalAlign="middle"/>
  </v-group>
</template>

<script lang="ts" setup>
import {computed, PropType} from 'vue';
import {NodeDetails, TreeNode} from "../types/TreeNode.ts";

const props = defineProps({
  node: {
    type: Object as PropType<TreeNode>,
    required: true
  },
  nodeWidth: Number,
  nodeHeight: Number
});
const emit = defineEmits(['update:isShapeDragging', 'mouseout', 'mouseover', 'nodeDragEnd']);

const nodeDetail = computed(() => NodeDetails[props.node!.type]);
const isAction = computed(() => !nodeDetail.value.canHaveChildren);
const isComposite = computed(() => nodeDetail.value.canHaveChildren && !nodeDetail.value.isDecorator);
const isDecorator = computed(() => nodeDetail.value.isDecorator);

const onDragStart = () => {
  // Inform the parent (KonvaStage) that a shape is being dragged
  emit('update:isShapeDragging', true);
};

const onDragEnd = (event) => {
  const group = event.currentTarget;
  // Update the node's x and y based on the new position
  props.node!.x = group.x();
  props.node!.y = group.y();

  // Inform the parent (KonvaStage) that the shape dragging has ended
  emit('update:isShapeDragging', false);

  // Emit the node details
  emit('nodeDragEnd', group);
};

const handleMouseEvent = (event) => {
  emit(event);
};
</script>
