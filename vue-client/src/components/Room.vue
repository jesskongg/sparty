<template>
  <b-card tag="article" style="min-width: 20rem; max-width: 20rem">
    <b-card-img class="img-top" :src="avatar" @click="enter_room"></b-card-img>
    <b-card-body>
      <a :href="url">
        <h6>
          {{name}}
          <span v-if="!this.public">(<font-awesome-icon icon="lock" />)</span>
        </h6>
      </a>
      <p class="card-text">
        {{description}}
      </p>
      <b-form v-if="show_key_input">
        <b-form-input placeholder="enter key" required v-model="key"></b-form-input>
        <b-button variant="primary" @click="get_key">Enter Room</b-button>
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import {HTTP} from '@/http-common'

export default {
  name: 'room',
  data: function() {
    return { show_key_input: false, key: ''}
  },
  props: ['avatar', 'description', 'name', 'id', 'public'],
  computed: {
    url: function() {
      return "/room/" + this.id;
    },
  },
  methods: {
    enter_room: function() {
      if (this.public) window.location.href = this.url;
      else {
        this.show_key_input = !this.show_key_input;
      }
    },
    get_key: function() {
      HTTP.get('room/' + this.id, {params: { room_key: this.key }})
      .then(res => {
        window.localStorage.setItem(this.id, res.data.key);
        window.location.href = this.url;
      })
      .catch(err => {
        
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .card-img {
    height: 15rem;
    object-fit: cover;
  }

  .card-img:hover {
    transform: scale(1.05);
    transition-duration: 0.5s;
    cursor: pointer;
  }

  .card-title {
    font-size: 1.1rem;
  }

  .card-body {
    text-align: center;
  }

  article {
    border: none;
  }

  a:link {
    text-decoration: none;
  }
</style>
