<template>
  <v-app>
    <notifications class="mt-2 ml-1" position="top left" ignore-duplicates />
    <v-slide-y-transition>
      <div
        v-if="globalError"
        class="global-error d-flex align-center justify-center text-h5"
      >
        {{ globalError }}
      </div>
    </v-slide-y-transition>
    <v-slide-y-transition>
      <div v-if="loading" class="loader d-flex flex-column">
        <h3>Loading...</h3>
        <v-progress-circular
          class="mt-8"
          size="70"
          width="5"
          indeterminate
        ></v-progress-circular>
      </div>
    </v-slide-y-transition>
    <v-fade-transition>
      <router-view />
    </v-fade-transition>
  </v-app>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'App',
  computed: mapState(['globalError', 'loading']),
};
</script>

<style lang="scss">
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.vue-notification {
  border-radius: 5px;
}

.auth-form {
  width: 700px;
}

.loader,
.global-error {
  width: 100%;
  display: flex;
  justify-content: center;
  position: fixed;
  inset: 0;
  align-items: center;
  height: 100vh;
  background-color: #101010;
  z-index: 9999;
}

.fade-transition {
  &-leave-active {
    position: absolute;
    inset: 0;
  }

  &-enter-active,
  &-leave,
  &-leave-to {
    transition: 0.4s ease-in-out;
  }

  &-enter,
  &-leave-to {
    opacity: 0;
  }
}

@media screen and (max-width: 720px) {
  .auth-form {
    width: 100%;
  }
}

.v-menu__content:has(> .v-select-list) {
  text-align: center;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 12px;
  }

  &::-webkit-scrollbar-track {
    background: #222222;
  }

  &::-webkit-scrollbar-thumb {
    background: #151515;
  }
}
</style>
