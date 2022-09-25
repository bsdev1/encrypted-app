<template>
  <div class="mt-3" v-if="currentEditedMessage == id">
    <v-slide-y-transition>
      <v-alert type="error" v-if="editMessageError" color="red" dense>{{ editMessageError }}</v-alert>
    </v-slide-y-transition>
    <form class="d-flex" @submit.prevent="finishEditMessage(id)">
      <v-text-field height="40" v-model="editMessageContent" label="Edit Message" solo placeholder="Type In Your Edit Message" hide-details dense></v-text-field>
      <v-btn type="submit" class="finish__edit__btn ml-4"><mdicon name="check" /></v-btn>
    </form>
  </div>
  <div v-else>
    {{ messageContent }}
  </div>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import cryptoJS from 'crypto-js';

  function encrypt(data, encryptKey) {
    return cryptoJS.AES.encrypt(JSON.stringify(data), encryptKey).toString();
  }

  export default {
    name: 'MessageContent',
    props: {
      id: String,
      content: String
    },
    data() {
      return {
        messageContent: this.content,
        editMessageError: null,
        editMessageContent: this.content
      }
    },
    methods: {
      async finishEditMessage(id) {
        let { editMessageContent, messageContent, messages, handleEditMessage, setCurrentEditedMessage, setMessages } = this;
        if(editMessageContent == messageContent) {
          this.editMessageError = null;
          setCurrentEditedMessage(null);
          return this.messageContent = editMessageContent;
        }
        if(!editMessageContent?.trim()) return this.editMessageError = 'Edit message cannot be empty.';
        const encryptKey = localStorage.getItem('key');
        const { error } = await handleEditMessage({ id, editMessageContent: encrypt(editMessageContent, encryptKey) });
        if(error) return this.editMessageError = error;
        setCurrentEditedMessage(null);
        this.messageContent = editMessageContent;
        this.editActive = false;
        this.editMessageError = null;
        setMessages(messages.map(message => message.id == id ? ({ ...message, edited: true }) : message));
        this.$emit('changeEdit');
        this.$notify({
          text: 'Successfully edited a message.',
          type: 'success'
        });
        this.socket.emit('editedMessage', { id, newContent: encrypt(editMessageContent, encryptKey) });
      },
      ...mapActions(['handleEditMessage']),
      ...mapMutations(['setCurrentEditedMessage', 'setMessages']),
    },
    computed: {
      ...mapState(['currentEditedMessage', 'messages', 'socket'])
    }
  }
</script>

<style scoped>
  .finish__edit__btn {
    border-radius: 100px;
    padding-left: 12px !important;
    height: 40px !important;
  }
</style>