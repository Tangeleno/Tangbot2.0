<script lang="ts" setup>
import {nodeStore} from "@/stores";
import {NodeType, TreeNode} from "@/types/TreeNode.ts";

const selectedNode = nodeStore.selectedNode as TreeNode
</script>

<template>
  <template v-if="nodeStore.selectedNode">
    <label>
      Name
      <input v-model="nodeStore.selectedNode.name" name="name" type="text">
    </label>
    
    <label>Node Type
      <select id="typeSelector" v-model="nodeStore.selectedNode.type" name="type">
        <option v-for="type in NodeType" :value="type">{{ type }}</option>
      </select>
    </label>
    
  </template>
</template>

<style scoped>
input, select {
}
label{
  display: flex;
  flex-direction: column;
  font-size: 1.25em;
}
.editor{
  display: flex;
}
</style>