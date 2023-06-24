<template>
  <div id="messages">
    <div
      v-if="loadingNewMessages"
      class="d-flex justify-center align-center my-3"
    >
      <div class="font-weight-bold mr-3">Loading...</div>
      <v-progress-circular
        indeterminate
        size="20"
        width="2"
      ></v-progress-circular>
    </div>

    <Message v-for="message of messages" :key="message.id" :message="message" />
  </div>
</template>

<script>
import Message from '@/components/Message.vue';
import { mapState } from 'vuex';

export default {
  name: 'Messages',
  components: { Message },
  computed: mapState(['messages', 'loadingNewMessages']),
};
</script>

<style lang="scss">
#messages {
  height: 600px;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 12px;
  }

  &::-webkit-scrollbar-track {
    border-radius: 10px;
    background: #303030;
  }

  &::-webkit-scrollbar-thumb {
    background: #222222;
    border-radius: 10px;
  }
}
</style>
