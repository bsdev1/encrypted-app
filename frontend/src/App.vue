<template>
  <v-app>
    <notifications />
    <v-fade-transition>
      <router-view />
    </v-fade-transition>
  </v-app>
</template>

<script>
  import { mapActions, mapState } from 'vuex';

  export default {
    name: 'App',
    async created() {
      await this.getDashboard();
    },
    methods: {
      ...mapActions(['getDashboard'])
    },
    computed: {
      ...mapState(['path'])
    }
  }
</script>

<style lang="scss">
  body {
    margin: 0;
  }

  .auth-form {
    width: 500px;
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