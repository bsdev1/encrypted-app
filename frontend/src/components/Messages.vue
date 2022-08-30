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
    props: { messages: Array },
    components: { Message }
  }
</script>

<style>
  #messages {
    height: 600px;
    overflow-y: scroll;
  }
</style>