<template>
  <form v-if="!user" class="mx-auto" @submit.prevent="login">
    <h2 class="mb-5 mt-8">Log In</h2>
    <v-slide-y-transition>
      <v-alert class="alert_error mb-5" type="error" color="red" v-if="error">{{ error }}</v-alert>
    </v-slide-y-transition>
    <v-slide-y-transition>
      <v-alert class="mb-5" type="success" v-if="newUser">Hello, <b>{{ newUser }}</b>! You can log in now.</v-alert>
    </v-slide-y-transition>
    <v-text-field v-model="username" label="Username" solo placeholder="Type In Your Username"></v-text-field>
    <v-text-field v-model="password" label="Password" solo type="password" placeholder="Type In Your Password"></v-text-field>
    <div class="d-flex">
      <v-btn rounded type="submit" :loading="loading">Log In</v-btn>
      <router-link class="ml-auto text-decoration-none" :to="loading ? '' : '/register'"><v-btn rounded>Register</v-btn></router-link>
    </div>
  </form>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import router from '../plugins/router';

  export default {
    name: 'Login',
    data: () => ({
      username: null,
      password: null,
      error: null,
      loading: false,
    }),
    created() {
      if(this.user) return router.push('/');
    },
    methods: {
      async login() {
        this.setNewUser(null);
        const { username, password, handleLogin } = this;
        if(!username?.trim() || !password?.trim()) return this.error = 'Fill in all fields!';
        this.loading = true;
        const { errorMessage } = await handleLogin({ username, password });
        this.loading = false;
        this.error = errorMessage;
      },
      ...mapActions(['handleLogin']),
      ...mapMutations(['setNewUser'])
    },
    computed: {
      ...mapState(['newUser', 'user'])
    }
  }
</script>

<style lang="scss">
  .alert_error {
    color: #FFF !important;
  }
</style>
