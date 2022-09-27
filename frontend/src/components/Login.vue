<template>
  <div>
    <div class="loader d-flex flex-column" v-if="loading">
      <h3>Loading...</h3>
      <v-progress-circular class="mt-8" size="70" width="5" indeterminate></v-progress-circular>
    </div>
    <form v-else-if="!user" class="mx-auto auth-form px-5" @submit.prevent="login">
      <h2 class="mb-5 mt-8">Log In</h2>
      <v-slide-y-transition>
        <v-alert class="alert_error mb-5" type="error" color="red" v-if="error">{{ error }}</v-alert>
      </v-slide-y-transition>
      <v-slide-y-transition>
        <v-alert class="mb-5" type="success" v-if="newUser">Hello, <b>{{ newUser }}</b>! You can log in now.</v-alert>
      </v-slide-y-transition>
      <v-text-field v-model="username" label="Username" solo placeholder="Type In Your Username"></v-text-field>
      <v-text-field v-model="password" label="Password" solo hide-details type="password" placeholder="Type In Your Password"></v-text-field>
      <hcaptcha @verify="verifyCaptcha" @reset="this.token = null" class="mt-5 mb-3" :sitekey="sitekey"></hcaptcha>
      <div class="d-flex">
        <v-btn rounded type="submit" :loading="loggingIn">Log In</v-btn>
        <router-link class="ml-auto text-decoration-none" :to="loggingIn ? '' : '/register'"><v-btn rounded>Register</v-btn></router-link>
      </div>
    </form>
  </div>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import router from '../plugins/router';
  import hcaptcha from '@hcaptcha/vue-hcaptcha';
  import { request } from '@/plugins/utils';

  export default {
    name: 'Login',
    components: { hcaptcha },
    data: () => ({
      sitekey: process.env.VUE_APP_SITE_KEY,
      username: null,
      password: null,
      error: null,
      token: null,
      loggingIn: false,
    }),
    async created() {
      if(this.user) {
        const { data: { user } } = await request.get('/');
        if(user) return router.push('/');
        this.setUser(null);
        this.setSocket(null);
      }
      this.setLoading(false);
    },
    methods: {
      async login() {
        this.setNewUser(null);
        const { username, password, token, handleLogin } = this;
        if(!username?.trim() || !password?.trim()) return this.error = 'Fill in all fields!';
        if(!token?.trim()) return this.error = 'Captcha cannot be empty!';
        this.loggingIn = true;
        const { errorMessage } = await handleLogin({ username, password, token });
        this.loggingIn = false;
        this.error = errorMessage;
      },
      verifyCaptcha(token) {
        this.token = token;
        this.error = null;
      },
      ...mapActions(['handleLogin']),
      ...mapMutations(['setNewUser', 'setLoading', 'setUser', 'setSocket'])
    },
    computed: {
      ...mapState(['newUser', 'user', 'loading'])
    }
  }
</script>

<style lang="scss">
  .alert_error {
    color: #FFF !important;
  }
</style>
