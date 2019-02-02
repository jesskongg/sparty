<template>
  <b-container fluid>
    <b-row class="justify-content-md-center">
      <b-col md="8" lg="6" sm="12">
        <b-input-group>
          <b-form-input :placeholder="placeholder"></b-form-input>
        </b-input-group>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: 'search-bar',
  props: ['placeholder'],
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
