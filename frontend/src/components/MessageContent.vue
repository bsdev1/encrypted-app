<template>
  <div v-if="currentEditedMessage == id" class="mt-3">
    <v-slide-y-transition>
      <v-alert v-if="editMessageError" type="error" color="red" dense>
        {{ editMessageError }}
      </v-alert>
    </v-slide-y-transition>
    <form class="d-flex" @submit.prevent="finishEditMessage(id)">
      <v-text-field
        v-model="editMessageContent"
        height="40"
        label="Edit Message"
        solo
        placeholder="Type In Your Edit Message"
        hide-details
        dense
      ></v-text-field>
      <v-btn
        type="submit"
        :loading="applyingChanges"
        class="finish__edit__btn ml-4"
      >
        <mdicon name="check" />
      </v-btn>
    </form>
  </div>
  <div v-else class="message__content">
    {{ messageContent }}
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import { encrypt } from '@/plugins/utils';

export default {
  name: 'MessageContent',
  props: {
    id: String,
    content: String,
  },
  emits: ['change-edit'],
  data() {
    return {
      messageContent: this.content,
      editMessageContent: this.content,
      editMessageError: null,
      applyingChanges: false,
    };
  },
  computed: mapState(['currentEditedMessage', 'messages', 'socket']),
  methods: {
    async finishEditMessage(id) {
      let {
        editMessageContent,
        messageContent,
        messages,
        handleEditMessage,
        setCurrentEditedMessage,
        setMessages,
      } = this;

      if (editMessageContent == messageContent) {
        this.editMessageError = null;
        setCurrentEditedMessage(null);
        return (this.messageContent = editMessageContent);
      }

      if (!editMessageContent?.trim())
        return (this.editMessageError = 'Edit message cannot be empty.');

      const encryptKey = localStorage.getItem('key');

      this.applyingChanges = true;
      const { error } = await handleEditMessage({
        id,
        editMessageContent: encrypt(editMessageContent, encryptKey),
      });
      this.applyingChanges = false;

      if (error) return (this.editMessageError = error);

      setCurrentEditedMessage(null);

      this.messageContent = editMessageContent;
      this.editActive = false;
      this.editMessageError = null;

      setMessages(
        messages.map((message) =>
          message.id == id ? { ...message, edited: true } : message
        )
      );

      this.$emit('change-edit');

      this.$notify({
        text: 'Successfully edited a message.',
        type: 'success',
      });

      this.socket.emit('editedMessage', {
        id,
        newContent: encrypt(editMessageContent, encryptKey),
      });
    },
    ...mapActions(['handleEditMessage']),
    ...mapMutations(['setCurrentEditedMessage', 'setMessages']),
  },
};
</script>

<style scoped>
.finish__edit__btn {
  border-radius: 100px;
  padding-left: 12px !important;
  height: 40px !important;
}

.message__content {
  word-break: break-all;
}
</style>
