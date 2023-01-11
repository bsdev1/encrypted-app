<template>
  <div id="messages">
    <div v-for="message of messages" :key="message.id">
      <Message :message="message" />
    </div>
  </div>
</template>

<script>
import Message from '@/components/Message.vue';

export default {
  name: 'Messages',
  components: { Message },
  props: { messages: Array },
};
</script>

<style lang="scss">
#messages {
  height: 600px;
  overflow-y: scroll;
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
