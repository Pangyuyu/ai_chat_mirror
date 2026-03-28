<template>
  <div class="app-container">
    <Header />
    <MainContent />
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import MainContent from './components/MainContent.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}
</style>
