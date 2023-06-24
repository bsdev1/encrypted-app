<template>
  <form v-if="!user" class="mx-auto auth-form px-5" @submit.prevent="login">
    <h2 class="mb-5 mt-8">Log In</h2>
    <v-slide-y-transition>
      <v-alert v-if="error" class="alert_error mb-5" type="error" color="red">
        {{ error }}
      </v-alert>
    </v-slide-y-transition>
    <v-slide-y-transition>
      <v-alert v-if="newUser" class="mb-5" type="success">
        Hello,
        <b>{{ newUser }}</b>
        ! You can log in now.
      </v-alert>
    </v-slide-y-transition>
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
      hide-details
      type="password"
      placeholder="Type In Your Password"
    ></v-text-field>
    <hcaptcha
      class="mt-5 mb-3"
      :sitekey="sitekey"
      @verify="verifyCaptcha"
      @reset="token = null"
    ></hcaptcha>
    <div class="d-flex">
      <v-btn rounded type="submit" :loading="loggingIn">Log In</v-btn>
      <router-link
        class="ml-auto text-decoration-none"
        :to="loggingIn ? '' : '/register'"
      >
        <v-btn rounded>Register</v-btn>
      </router-link>
    </div>
  </form>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import hcaptcha from '@hcaptcha/vue-hcaptcha';
import { waitForCaptcha } from '@/utils';

export default {
  name: 'Login',
  components: { hcaptcha },
  data: () => ({
    username: null,
    password: null,
    error: null,
    token: null,
    loggingIn: false,
  }),
  computed: mapState(['newUser', 'user', 'loading', 'sitekey']),
  async created() {
    const { setLoading } = this;

    await waitForCaptcha();

    setLoading(false);
  },
  methods: {
    async login() {
      const { username, password, setNewUser, token, handleLogin } = this;

      setNewUser(null);

      if (!username?.trim() || !password?.trim())
        return (this.error = 'Fill in all fields!');
      if (!token?.trim()) return (this.error = 'Captcha cannot be empty!');

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
    ...mapMutations(['setNewUser', 'setLoading', 'setUser', 'setSocket']),
  },
};
</script>

<style lang="scss">
.alert_error {
  color: #fff !important;
}
</style>
