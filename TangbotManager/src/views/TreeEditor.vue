//TreeEditor.vue
<script lang="ts" setup>
import KonvaStage from "@/components/KonvaStage.vue";
import TextMenu from "@/components/TextMenu.vue";
import TextMenuItem from "@/components/TextMenuItem.vue";
import {nextTick, onMounted, ref} from 'vue';
import {nodeStore} from '@/stores';
import TreeNodeEditor from "@/components/TreeNodeEditor.vue";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";

const containerRef = ref<HTMLDivElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const confirmDialogRef = ref<ConfirmationDialog | null>(null);
const konvaStageRef = ref<KonvaStage | null>(null)
const handleNodeIntersection = ({draggedNodeId, intersectingNodeId}) => {
  let canPlaceResults = nodeStore.canPlaceNode(intersectingNodeId, draggedNodeId)
  if (!canPlaceResults.canPlace)
    return;
  if (canPlaceResults.shouldConfirm) {
    //TODO: display confirmation dialog
    message.value = canPlaceResults.message;
  }
  nodeStore.placeNode(intersectingNodeId, draggedNodeId)
  konvaStageRef.value.redrawStage()
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
    "rootNode": {
      "type": "SelectNode",
      "id": "rootNode",
      "name": "Select",
      "childrenIds": ["node1", "node2", "node10", "node11", "node12", "node13"]
    },
    "node1": {
      "type": "SequenceNode",
      "id": "node1",
      "name": "Sequence",
      "parentId": "rootNode",
      "childrenIds": ["node3", "node4", "node5"]
    },
    "node2": {
      "type": "ParallelNode",
      "id": "node2",
      "name": "Parallel",
      "parentId": "rootNode",
      "childrenIds": ["node6", "node7", "node8"]
    },
    "node3": {
      "type": "InvertNode",
      "id": "node3",
      "name": "Invert",
      "parentId": "node1",
      "childrenIds": ["node14"]
    },
    "node4": {
      "type": "RetryNode",
      "id": "node4",
      "name": "Retry",
      "parentId": "node1",
      "childrenIds": ["node15"]
    },
    "node5": {
      "type": "RepeatNode",
      "id": "node5",
      "name": "Repeat",
      "parentId": "node1",
      "childrenIds": ["node16"]
    },
    "node6": {
      "type": "WaitNode",
      "id": "node6",
      "name": "Wait",
      "parentId": "node2",
      "childrenIds": []
    },
    "node7": {
      "type": "RandomSelector",
      "id": "node7",
      "name": "RandomSelector",
      "parentId": "node2",
      "childrenIds": ["node17", "node18"]
    },
    "node8": {
      "type": "ActionNode",
      "id": "node8",
      "name": "Action",
      "parentId": "node2",
      "childrenIds": []
    },
    "node10": {
      "type": "LoopNode",
      "id": "node10",
      "name": "Loop",
      "parentId": "rootNode",
      "childrenIds": ["node19"]
    },
    "node11": {
      "type": "FailerNode",
      "id": "node11",
      "name": "Failer",
      "parentId": "rootNode",
      "childrenIds": []
    },
    "node12": {
      "type": "SucceederNode",
      "id": "node12",
      "name": "Succeeder",
      "parentId": "rootNode",
      "childrenIds": []
    },
    "node13": {
      "type": "ActionNode",
      "id": "node13",
      "name": "Action",
      "parentId": "rootNode",
      "childrenIds": []
    },
    "node14": {
      "type": "ActionNode",
      "id": "node14",
      "name": "Action",
      "parentId": "node3",
      "childrenIds": []
    },
    "node15": {
      "type": "ActionNode",
      "id": "node15",
      "name": "Action",
      "parentId": "node4",
      "childrenIds": []
    },
    "node16": {
      "type": "ActionNode",
      "id": "node16",
      "name": "Action",
      "parentId": "node5",
      "childrenIds": []
    },
    "node17": {
      "type": "ActionNode",
      "id": "node17",
      "name": "Action",
      "parentId": "node7",
      "childrenIds": []
    },
    "node18": {
      "type": "ActionNode",
      "id": "node18",
      "name": "Action",
      "parentId": "node7",
      "childrenIds": []
    },
    "node19": {
      "type": "ActionNode",
      "id": "node19",
      "name": "Action",
      "parentId": "node10",
      "childrenIds": []
    }
  }
  nextTick(() => {
    const jsonString = JSON.stringify(simpleNode);
    nodeStore.loadTree(jsonString);
    nodeStore.setupLayoutWatchers();
    konvaStageRef.value.centerAndZoomStage();
    confirmDialogRef.value.show();
  });
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
        <text-menu-item action="displayHelp">Help Is really really long text</text-menu-item>
      </text-menu>
    </div>
    <div ref="containerRef" class="canvas">
      <konva-stage
          ref="konvaStageRef"
          :containerRef="containerRef!"
          @nodeIntersection="handleNodeIntersection"/>
    </div>
    <div class="editor">
      <tree-node-editor/>
    </div>
  </div>
  <confirmation-dialog ref="confirmDialogRef">
    <template #heading>This is the title</template>
    <p>This is a really long message</p>
    <p><span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur autem consequatur consequuntur delectus dolorum ducimus, eos excepturi expedita fugiat iste libero mollitia nobis quam quod, repellat rerum ullam vero vitae!</span><span>Animi debitis, deserunt distinctio dolores eos ipsam ipsum magnam magni maxime, nemo perferendis perspiciatis placeat quis, rem sint ullam voluptatem? Culpa impedit, ipsam minus nemo odio officiis? Aperiam, error vel?</span><span>Ad consequuntur culpa doloremque eos hic ipsa magni minima non optio quisquam? Aliquam, autem corporis debitis, dolores dolorum error ex, facilis fugit incidunt ipsum libero magnam odio quae repudiandae tenetur.</span><span>Atque cum dicta, ducimus esse eum incidunt maiores, molestiae mollitia nisi, non nostrum perferendis quae qui quidem quis saepe voluptas? Cum debitis ea, expedita qui reiciendis sapiente sed tenetur unde?</span><span>Animi autem consectetur dolore exercitationem, fugit, ipsa ipsum nobis odit perferendis placeat, quidem saepe sapiente sequi sit suscipit! Aperiam asperiores harum minima molestias quia quod sequi sunt tempore ut vero.</span><span>Accusantium aliquid animi assumenda aut consequatur dicta dolorum ea et ex exercitationem, expedita fuga hic incidunt iure labore, molestiae molestias mollitia necessitatibus neque odit perferendis placeat possimus quis, sapiente veniam?</span><span>Debitis dolores ea explicabo maiores nostrum, possimus quae similique sit tempore unde ut veritatis, voluptatibus! Aut debitis libero officiis quas veniam! Ad asperiores aspernatur atque consequatur magnam possimus quod saepe?</span><span>Ad adipisci atque cupiditate deleniti dolor dolorem dolorum enim error explicabo harum laboriosam nostrum perspiciatis quae quidem quis quo repellat sed soluta sunt tempora totam, ut veniam voluptas. Recusandae, repudiandae!</span><span>Accusamus dignissimos earum, iste libero molestiae provident ratione voluptatem. A ad commodi cum cumque dolores, expedita facere modi obcaecati possimus quae quam quia quidem quos totam ullam, velit vitae voluptatum!</span><span>Assumenda consectetur distinctio doloremque eligendi et in, laborum libero molestiae odit perferendis, placeat quae quas quis quos saepe sed sequi voluptatum? Corporis dolorem error expedita nulla perferendis veritatis, vitae voluptates!</span><span>Ab ad adipisci commodi cupiditate dolore doloremque ea eaque earum ex explicabo facilis id, illo ipsam iure laborum non, odio officia pariatur quam quos sed similique, sint tempora unde voluptatum.</span><span>Ab accusantium atque distinctio dolorem dolores eum harum magni mollitia pariatur quas, reprehenderit tenetur. Atque ducimus libero mollitia nam nobis quo reprehenderit suscipit velit! Necessitatibus nobis repellendus sequi voluptatibus voluptatum!</span><span>Accusantium adipisci animi asperiores at commodi cum dolor dolore, earum exercitationem facilis fugiat ipsam laborum, magni mollitia nesciunt numquam obcaecati officia perferendis perspiciatis repellat sed sint soluta tenetur vel voluptas.</span><span>Aspernatur assumenda, corporis dignissimos distinctio inventore itaque magni maxime nam obcaecati quasi quibusdam quo recusandae rem tempora temporibus totam voluptatibus. Ad aspernatur illum incidunt minus molestiae praesentium quaerat velit voluptatem?</span><span>Ad assumenda culpa deleniti dolorem doloremque dolorum est facere illo impedit magnam nihil optio pariatur, quibusdam quis ratione recusandae veritatis, voluptatum. Aspernatur aut, deleniti iste odit quas recusandae reprehenderit voluptate!</span><span>Accusantium architecto magnam minima, similique tempora vitae. A asperiores assumenda dolore enim ex exercitationem inventore laudantium modi nulla perferendis perspiciatis praesentium, quae quia, quidem quos repellat reprehenderit similique voluptas voluptatum.</span><span>Animi cupiditate dolore dolorum earum esse et fuga, maiores necessitatibus neque nostrum, obcaecati porro sequi sit veniam, vero. Aspernatur assumenda beatae doloribus eveniet explicabo id ipsum numquam omnis, rerum saepe.</span><span>Accusantium ad beatae consectetur corporis cupiditate eaque incidunt laborum minus, quas quibusdam quisquam quo, reiciendis similique sit ullam voluptatem voluptates. Beatae eligendi eos itaque laboriosam officia quae qui saepe unde!</span><span>Accusantium aliquid, consequuntur cum dolor dolorem fuga fugiat fugit hic illo labore molestiae molestias, nemo nostrum quae quidem quos reprehenderit. At atque eligendi libero molestias, quas quis suscipit voluptate? Consequuntur.</span><span>Adipisci asperiores atque consequuntur corporis enim esse fugiat ipsa, obcaecati quasi voluptatum. Consequuntur deleniti ea eaque earum impedit in, ipsum maxime molestias officiis perspiciatis, quas quod reprehenderit sed unde, voluptatum?</span><span>Aperiam autem, dolore impedit, in nostrum perferendis quaerat quam quas qui quisquam quo ratione rem ut. Accusamus aperiam asperiores assumenda blanditiis dicta dignissimos exercitationem, labore, saepe ullam, unde veniam voluptate?</span><span>Accusamus accusantium at atque autem commodi debitis delectus dicta, dignissimos doloribus eaque enim et, harum ipsam laudantium maxime nobis obcaecati, omnis praesentium quibusdam rem reprehenderit saepe sint veniam voluptate voluptates.</span><span>Accusamus beatae consectetur delectus eum ipsam laboriosam nulla quasi quis ratione, voluptates? Assumenda deserunt dicta ea esse, eveniet ipsam ipsum, iste iure minima nulla provident quos rem rerum, saepe sapiente.</span><span>Aliquam amet aperiam aspernatur at consequuntur dignissimos eaque earum, enim error fuga id impedit iure, laboriosam laudantium magni minima modi natus placeat qui quibusdam quis rem sunt temporibus velit voluptatem!</span><span>Ab alias aut beatae consectetur consequatur cumque deleniti doloribus facilis hic impedit ipsa ipsum itaque iure magni minima minus natus necessitatibus neque non odio odit, quod rem repudiandae sapiente, tenetur?</span><span>Itaque iure modi, nobis quaerat quis quisquam rerum sequi soluta, unde ut vitae voluptatum. Animi aspernatur beatae maiores! Aperiam cumque eos eum quasi rerum tenetur veritatis. Ea laborum nesciunt reiciendis.</span><span>Aliquid asperiores dignissimos dolores esse minus nostrum, obcaecati, officiis pariatur, placeat possimus quidem quos reiciendis similique soluta sunt totam vero. Aperiam dicta mollitia, nam pariatur placeat repellendus sunt suscipit ut!</span><span>Animi, consequatur, enim ex id minus nam porro reprehenderit sit temporibus voluptas voluptatem voluptatibus! Ab, consequatur cum eos harum in, necessitatibus nisi pariatur provident quidem, tempore vel voluptate. Ex, suscipit.</span><span>Ab aspernatur assumenda blanditiis consectetur cumque, delectus deserunt doloremque eos illo labore laudantium magni maxime, neque nesciunt nihil non officia officiis perferendis quas quidem rerum suscipit voluptate. Cupiditate, facere nihil!</span><span>Earum nemo nisi numquam, repellendus similique voluptate! Ad aliquid explicabo fugit perspiciatis repellat. Alias aliquid architecto beatae dolor exercitationem, ipsa maiores nihil nostrum nulla placeat quo quos repellat ut, voluptatum.</span><span>Accusamus aperiam atque delectus dicta dignissimos ea eaque eum explicabo fugiat labore maiores, minima perspiciatis placeat quisquam repellat sint soluta voluptatem. Accusamus animi magni nesciunt porro ratione tenetur unde, ut.</span><span>Ab aut cupiditate eius impedit, laborum optio porro quae quidem ratione repellendus unde voluptate voluptatem voluptatum. A aspernatur, aut autem dolor dolores enim excepturi explicabo ipsa libero quidem ratione ut.</span><span>Accusamus aperiam earum est harum impedit iste mollitia possimus quos tempore veritatis. Aspernatur corporis debitis deserunt eligendi eos est incidunt ipsa, nam neque quas, recusandae tenetur unde veritatis voluptas, voluptatem!</span><span>Dolorem, incidunt minima mollitia qui quisquam repudiandae sapiente vero? Distinctio eaque natus quidem reiciendis voluptates? Amet, animi consequuntur, cumque iusto laboriosam, maiores natus nesciunt placeat possimus quaerat sint tempora velit?</span><span>Beatae culpa debitis nemo quod tempore. A aliquam amet aperiam autem corporis cupiditate debitis error eum ex facilis laborum magni modi perferendis qui quis rem rerum sapiente sed soluta, veritatis.</span><span>Dolore expedita ipsam praesentium! Doloremque enim porro saepe. Aliquid amet, atque autem, doloribus, eaque fugiat ipsum maiores non nostrum obcaecati quo tempora ullam. Itaque maxime nam ut. A, consequatur debitis.</span><span>A assumenda eveniet in nam nobis! Est explicabo illum rem velit voluptate. Ex fugit incidunt reprehenderit voluptatem? Aliquam at atque, cumque debitis impedit modi odio quis rerum tempore unde, vel.</span><span>Accusamus at eius facere fugiat illo incidunt ipsum necessitatibus nostrum tenetur. Aliquid consequatur hic maxime odio possimus quasi totam veritatis. Alias aspernatur beatae consequatur distinctio, maiores non officiis quas sit.</span><span>Cum dolor dolorem doloribus ea eligendi in nam quod, rem sapiente tempora unde vel voluptate. Accusantium, aut autem corporis eum excepturi explicabo facere, fugit illum natus neque, quaerat repellendus soluta.</span><span>Aliquam aut itaque officiis placeat reiciendis sunt ut. Facilis, molestiae vero? Aperiam dolorem expedita necessitatibus nihil vel. Esse harum illum itaque magnam modi necessitatibus. Aperiam aut in pariatur placeat tenetur.</span><span>Fugit libero neque, obcaecati porro quis sequi sit? Accusamus ad aut corporis dicta distinctio dolorem error explicabo fugit in laborum necessitatibus porro praesentium quaerat sapiente sint soluta, ut! Neque, perspiciatis!</span><span>Adipisci aperiam asperiores consequatur, culpa distinctio doloremque ducimus earum eligendi et eveniet fugit incidunt inventore ipsam libero maxime quasi quia quidem quis rerum sequi soluta sunt, tempore temporibus tenetur velit.</span><span>Accusamus cupiditate dolor error explicabo magni nihil non officia omnis, optio perspiciatis, provident sunt? Blanditiis doloremque error mollitia nam nemo odio, similique! Autem debitis deserunt, expedita explicabo nostrum pariatur vitae.</span><span>Accusantium, at expedita itaque minima mollitia non numquam perspiciatis quibusdam, repudiandae sint suscipit ullam, vero voluptates! Consequatur debitis delectus ducimus facilis fugiat modi omnis rerum tenetur? Aliquam commodi inventore labore.</span><span>Accusamus aliquam beatae debitis deleniti ea eaque eius esse eveniet fuga ipsum laborum, magni nesciunt nihil omnis praesentium quas quia quidem, quis reiciendis repellat repudiandae saepe suscipit tempore veniam, veritatis.</span><span>A ab, aperiam consequuntur dignissimos ipsa magni maiores officia quaerat soluta veniam? Dolorem, iste quia? Aspernatur assumenda culpa explicabo, ipsa iste labore laudantium magni minima odit officiis quasi quisquam tempora!</span><span>Ab cum ex iusto libero nam necessitatibus sint voluptates. Blanditiis corporis cupiditate distinctio dolore eligendi eum facere impedit in ipsa libero maiores molestiae natus, placeat sequi sint ut vero voluptatum!</span><span>Architecto cum est ipsam iure laudantium odio qui? Aperiam corporis debitis earum eos error laudantium magni minus neque, numquam odit, porro, quas quos reprehenderit saepe soluta tempora totam ut voluptatibus!</span><span>Architecto consequuntur mollitia nam vitae. Aspernatur beatae, dicta esse et eum, eveniet fugiat libero nulla optio perspiciatis provident quia quis repellendus veniam voluptates! Deserunt, neque, sint. Deserunt minima reiciendis sit.</span><span>Accusamus consequuntur dicta dolores ea hic id iusto laborum laudantium, magnam nam neque nesciunt nulla numquam obcaecati odit quae quas quidem quisquam sint totam vel veniam voluptatibus voluptatum! In, sapiente?</span>
    </p>
    <template #buttons>
      <div>
        <button data-action="Ok">Ok</button>
      </div>
      <div>
        <button class="right" data-action="Ok">1</button>
        <button data-action="Ok">2</button>
      </div>
      <div>
        <button data-action="Ok">3</button>
      </div>


    </template>
  </confirmation-dialog>
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