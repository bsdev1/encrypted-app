<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="message__content pr-7">
    <div>
      by
      <b>{{ username }}</b>
      -
      {{ $getNormalizedDate(createdAt) }}
      <div v-if="edited" class="text-caption grey--text ml-2 d-inline pb-1">
        (edited)
      </div>
    </div>
    <div v-if="currentEditedMessageId == id" class="mt-3">
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

    <div
      v-else
      class="message__content"
      v-html="
        $sanitizeHTML(
          $anchors({
            input: content,
            options: { attributes: { target: '_blank' } },
          })
        )
      "
    ></div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import { encrypt } from '@/plugins/utils';

export default {
  name: 'MessageContent',
  props: {
    id: String,
    username: String,
    createdAt: String,
  },
  data() {
    return {
      content: '',
      editMessageContent: '',
      edited: false,
      editMessageError: null,
      applyingChanges: false,
    };
  },
  computed: mapState(['currentEditedMessageId', 'messages', 'socket']),
  created() {
    const message = this.messages.find((message) => message.id == this.id);

    if (message) {
      const { content, edited } = message;

      this.editMessageContent = content;
      this.content = content;
      this.edited = edited;
    }
  },
  methods: {
    async finishEditMessage(id) {
      let {
        editMessageContent,
        handleEditMessage,
        content,
        setCurrentEditedMessageId,
        setSendMessageError,
        socket,
      } = this;

      setSendMessageError(null);

      if (editMessageContent == content) {
        this.editMessageError = null;
        setCurrentEditedMessageId(null);
        return (this.content = editMessageContent);
      }

      if (!editMessageContent?.trim())
        return (this.editMessageError = 'Edit message cannot be empty.');

      const encryptKey = localStorage.getItem('key');

      this.applyingChanges = true;

      const { error, unauthorized } = await handleEditMessage({
        id,
        editMessageContent: encrypt(editMessageContent, encryptKey),
      });

      this.applyingChanges = false;

      if (unauthorized) return;

      if (error) return (this.editMessageError = error);

      setCurrentEditedMessageId(null);

      this.content = editMessageContent;
      this.editActive = false;
      this.editMessageError = null;

      this.edited = true;

      this.$notify({
        text: 'Successfully edited a message.',
        type: 'success',
      });

      socket.emit('editedMessage', {
        id,
        newContent: encrypt(editMessageContent, encryptKey),
      });
    },
    ...mapActions(['handleEditMessage']),
    ...mapMutations(['setCurrentEditedMessageId', 'setSendMessageError']),
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
