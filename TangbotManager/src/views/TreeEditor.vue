//TreeEditor.vue
<script lang="ts" setup>
import KonvaStage from "@/components/KonvaStage.vue";
import TextMenu from "@/components/TextMenu.vue";
import TextMenuItem from "@/components/TextMenuItem.vue";
import {onMounted, ref} from 'vue';
import {nodeStore} from '@/stores';

const containerRef = ref<HTMLDivElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const handleNodeIntersection = ({draggedNodeId, intersectingNodeId}) => {
  let canPlaceResults = nodeStore.canPlaceNode(intersectingNodeId, draggedNodeId)
  if (!canPlaceResults.canPlace)
    return;
  if (canPlaceResults.shouldConfirm) {
    //TODO: display confirmation dialog
  }
  nodeStore.placeNode(intersectingNodeId, draggedNodeId)
};

function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      const content = reader.result;
      nodeStore.loadTree(content.toString());
    }
    reader.readAsText(file);
  }
}

function loadJsonClicked() {
  fileInput.value?.click();
}

onMounted(() => {
  const nodeData = {
    node1: {
      type: "SequenceNode",
      id: "node1",
      name: "Node A",
      parentId: null,
      childrenIds: ["node2", "node6", "node7"]
    },
    node2: {
      type: "SelectNode",
      id: "node2",
      name: "attack",
      parentId: "node1",
      childrenIds: ["node14", "node4", "node5"]
    },
    node14: {
      type: "InvertNode",
      id: "node14",
      name: "SpitInverter",
      parentId: "node2",
      childrenIds: ["node3"]
    },
    node3: {
      type: "ActionNode",
      id: "node3",
      name: "Spit",
      parentId: "node14",
      childrenIds: []
    },
    node4: {
      type: "ActionNode",
      id: "node4",
      name: "Kick",
      parentId: "node2",
      childrenIds: []
    },
    node5: {
      type: "ActionNode",
      id: "node5",
      name: "Punch",
      parentId: "node2",
      childrenIds: []
    },
    node6: {
      type: "ActionNode",
      id: "node6",
      name: "bite",
      parentId: "node1",
      childrenIds: []
    },
    node7: {
      type: "SequenceNode",
      id: "node7",
      name: "defend",
      parentId: "node1",
      childrenIds: ["node8", "node9", "node10"]
    },
    node8: {
      type: "ActionNode",
      id: "node8",
      name: "Parry",
      parentId: "node7",
      childrenIds: []
    },
    node9: {
      type: "ActionNode",
      id: "node9",
      name: "Riposte",
      parentId: "node7",
      childrenIds: []
    },
    node10: {
      type: "SequenceNode",
      id: "node10",
      name: "Shield",
      parentId: "node7",
      childrenIds: ["node12", "node13", "node11"]
    }, node12: {
      type: "ActionNode",
      id: "node12",
      name: "Hold Up Shield",
      parentId: "node10",
      childrenIds: []
    },
    node11: {
      type: "ActionNode",
      id: "node11",
      name: "Grab Shield",
      parentId: "node10",
      childrenIds: []
    },

    node13: {
      type: "ActionNode",
      id: "node13",
      name: "Deflect Attack",
      parentId: "node10",
      childrenIds: []
    }
  }
  const simpleNode = {
    node10: {
      type: "SequenceNode",
      id: "node10",
      name: "Shield",
      childrenIds: ["node12", "node11", "node13"]
    },
    node11: {
      type: "ActionNode",
      id: "node11",
      name: "Grab Shield",
      parentId: "node10",
      childrenIds: []
    },
    node12: {
      type: "ActionNode",
      id: "node12",
      name: "Hold Up Shield",
      parentId: "node10",
      childrenIds: []
    },
    node13: {
      type: "ActionNode",
      id: "node13",
      name: "Deflect Attack",
      parentId: "node10",
      childrenIds: []
    }
  }
  const jsonString = JSON.stringify(nodeData);
  nodeStore.loadTree(jsonString);
  nodeStore.setupLayoutWatchers();
})

</script>

<template>
  <input ref="fileInput" accept="application/JSON" style="display: none" type="file" @change="handleFileChange"/>
  <div class="container">
    <div class="toolbar">
      <text-menu>
        <text-menu-item>
          File
          <template #children>
            <text-menu-item action="save">Save
              <fa-icon icon="fa-solid fa-floppy-disk"></fa-icon>
            </text-menu-item>
            <text-menu-item action="Load" @item-clicked="loadJsonClicked">
              Load Json
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
          :containerRef="containerRef!"
          @nodeIntersection="handleNodeIntersection"/>
    </div>
    <div class="editor"></div>
  </div>
</template>

<style scoped>
.canvas {
  background-color: var(--canvas-bg-color);
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