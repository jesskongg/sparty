<template>
  <b-container>
    <h5>Welcome to {{room.name}}
      (<font-awesome-icon icon="lock" />)
    </h5>
    <search-bar placeholder="search song"/>
  </b-container>
</template>

<script>
  // @ is an alias to /src
  import SearchBar from '@/components/SearchBar'
  import {HTTP} from '@/http-common'

  export default {
    name: 'RoomDetail',
    props: ['id'],
    data: function() {
      return { room: {}, errors: [] }
    },
    components: {
      SearchBar
    },
    created: function() {
      // get rooms from API
      HTTP.get('room/' + this.id)
      .then(res => {
        this.room = res.data;
      })
      .catch(err => {
        this.errors.push(err);
      })
    }
  }
</script>

<style scoped>
  .card-deck {
    justify-content: center;
  }

  .container {
    margin-top: 15px;
    text-align: center;
  }
</style>
