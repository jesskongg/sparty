<template>
  <div id="app">
    <div id="nav">
      <navigation />
    </div>
    <router-view/>
  </div>
</template>

<script>
  import Navigation from '@/components/Nav.vue'

  export default {
    name: 'App',
    components: {
      Navigation
    }
  }
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
