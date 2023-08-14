<script lang="ts" setup>
import navigationBar from "./components/NavigationBar.vue";
</script>

<template>
  <main class="container">
    <navigation-bar img="https://place-hold.it/100x50"></navigation-bar>
    <div class="content">
      <router-view></router-view>
    </div>
  </main>
</template>

<style scoped>

</style>
