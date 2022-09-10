<template>
  <v-app>
    <notifications />
    <v-fade-transition>
      <router-view />
    </v-fade-transition>
  </v-app>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';

  export default {
    name: 'App',
    data: () => ({
      fetching: false,
    }),
    async created() {
      await this.getDashboard();
    },
    methods: {
      ...mapActions(['getDashboard']),
      ...mapMutations(['setLoading'])
    },
    computed: {
      ...mapState(['path', 'loading'])
    }
  }
</script>

<style lang="scss">
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  .auth-form {
    width: 500px;
  }

  .loader {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .fade-transition {
    &-leave-active {
      position: absolute;
      inset: 0;
    }

    &-enter-active, &-leave, &-leave-to {
      transition: 0.4s ease-in-out;
    }

    &-enter, &-leave-to {
      opacity: 0;
    }
  }

  @media screen and (max-width: 520px) {
    .auth-form { width: 100%; }
  }
</style>