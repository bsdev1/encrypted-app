<template>
  <form v-if="!user" class="mx-auto auth-form px-5" @submit.prevent="register">
    <h2 class="mb-5 mt-8">Register</h2>
    <transition-group name="register_errors_transition">
      <v-alert
        v-for="error of errors"
        :key="error"
        class="alert_error mb-5"
        type="error"
        color="red"
      >
        {{ error }}
      </v-alert>
    </transition-group>
    <v-text-field
      v-model="username"
      label="Username"
      solo
      placeholder="Type In Your Username"
    ></v-text-field>
    <v-text-field
      v-model="password"
      label="Password"
      solo
      type="password"
      placeholder="Type In Your Password"
    ></v-text-field>
    <v-text-field
      v-model="confirmPassword"
      label="Confirm Password"
      type="password"
      hide-details
      solo
      placeholder="Confirm Your Password"
    ></v-text-field>
    <hcaptcha
      class="mt-5 mb-3"
      :sitekey="sitekey"
      @verify="verifyCaptcha"
      @reset="token = null"
    ></hcaptcha>
    <div class="d-flex">
      <v-btn rounded type="submit" :loading="registering">Register</v-btn>
      <router-link
        class="ml-auto text-decoration-none"
        :to="registering ? '' : '/login'"
      >
        <v-btn rounded>Back To Login</v-btn>
      </router-link>
    </div>
  </form>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import hcaptcha from '@hcaptcha/vue-hcaptcha';
import { waitForCaptcha } from '@/utils';

export default {
  name: 'Register',
  components: { hcaptcha },
  metaInfo: {
    title: 'LockGuard – Register',
  },
  data: () => ({
    username: null,
    password: null,
    confirmPassword: null,
    token: null,
    errors: [],
    registering: false,
    loadingCaptcha: true,
  }),
  computed: mapState(['user', 'loading', 'sitekey']),
  async created() {
    await waitForCaptcha();

    const { setNewUser, setLoading } = this;

    setNewUser(null);
    setLoading(false);
  },
  methods: {
    async register() {
      const { username, password, confirmPassword, token, handleRegister } =
        this;
      if (!username?.trim() || !password?.trim())
        return (this.errors = ['Fill in all fields!']);

      if (!token?.trim()) return (this.errors = ['Captcha cannot be empty!']);

      if (password != confirmPassword)
        return (this.errors = ['Passwords are not matching!']);

      this.registering = true;
      const { errors } = await handleRegister({ username, password, token });
      this.registering = false;

      this.errors = errors;
    },
    verifyCaptcha(token) {
      this.token = token;
      this.errors = this.errors.filter((error) => !error.includes('Captcha'));
    },
    ...mapActions(['handleRegister']),
    ...mapMutations(['setNewUser', 'setLoading']),
  },
};
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
  color: #fff !important;
}
</style>
