<template>
  <b-navbar toggleable="md" type="dark" variant="info">

    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

    <b-navbar-brand href="/">Sparty</b-navbar-brand>

    <b-collapse is-nav id="nav_collapse">

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item href="/">Home</b-nav-item>
        <b-nav-item href="/about">Help</b-nav-item>
        <b-nav-item v-on:click="login">Login</b-nav-item>
      </b-navbar-nav>

    </b-collapse>
  </b-navbar>
</template>

<script>
export default {
  name: 'navigation',
  props: {
  },
  methods: {
    login() {
      window.authCallback = function(jwt) {
        window.localStorage.setItem('token', jwt);
      }
      OpenPopupCenter('http://localhost:3000/api/auth/login', "authentication", 600, 800);
    }
  }
}

function OpenPopupCenter(pageURL, title, w, h) {
  var left = (screen.width - w) / 2;
  var top = (screen.height - h) / 4;
  window.open(pageURL, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
