<template>
  <div>
    <div class="loader d-flex flex-column" v-if="loading">
      <h3>Loading...</h3>
      <v-progress-circular class="mt-8" size="70" width="5" indeterminate></v-progress-circular>
    </div>
    <form v-else-if="!user" class="mx-auto auth-form px-5" @submit.prevent="register">
      <h2 class="mb-5 mt-8">Register</h2>
      <transition-group name="register_errors_transition">
        <v-alert v-for="error of errors" :key="error" class="alert_error mb-5" type="error" color="red">{{ error }}</v-alert>
      </transition-group>
      <v-text-field v-model="username" label="Username" solo placeholder="Type In Your Username"></v-text-field>
      <v-text-field v-model="password" label="Password" solo type="password" placeholder="Type In Your Password"></v-text-field>
      <v-text-field v-model="confirmPassword" label="Confirm Password" type="password" solo placeholder="Confirm Your Password"></v-text-field>
      <div class="d-flex">
        <v-btn rounded type="submit" :loading="registering">Register</v-btn>
        <router-link class="ml-auto text-decoration-none" :to="registering ? '' : '/login'"><v-btn rounded>Back To Log In</v-btn></router-link>
      </div>
    </form>
  </div>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import router from '../plugins/router';

  export default {
    name: 'Register',
    data: () => ({
      username: null,
      password: null,
      confirmPassword: null,
      errors: [],
      registering: false,
    }),
    async created() {
      this.setNewUser(null);
      if(this.user) return router.push('/');
      this.setLoading(false);
    },
    methods: {
      async register() {
        const { username, password, confirmPassword, handleRegister } = this;
        if(!username?.trim() || !password?.trim()) return this.errors = ['Fill in all fields!'];
        if(password != confirmPassword) return this.errors = ['Passwords are not matching!'];
        this.registering = true;
        const { errors } = await handleRegister({ username, password });
        this.registering = false;
        this.errors = errors;
        localStorage.setItem('keyFieldDisabled', 'true');
        localStorage.setItem('key', null);
      },
      ...mapActions(['handleRegister']),
      ...mapMutations(['setNewUser', 'setLoading'])
    },
    computed: {
      ...mapState(['user', 'loading'])
    }
  }
</script>

<style lang="scss">
  .register_errors_transition-enter-active,
  .register_errors_transition-leave-active {
    transition: 0.4s ease;
  }
  .register_errors_transition-enter-from,
  .register_errors_transition-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }

  .alert_error {
    color: #FFF !important;
  }
</style>
