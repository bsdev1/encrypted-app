<template>
  <v-dialog v-model="open" width="500" overlay-color="#202020">
    <v-card style="background-color: #101010; border-radius: 10px">
      <v-card-title class="text-h5">Confirm</v-card-title>

      <v-card-text>Are you sure you want to delete all messages?</v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="py-3">
        <v-spacer></v-spacer>
        <v-btn class="red accent-3" text small @click="open = false">
          Cancel
        </v-btn>
        <v-btn
          class="light-green darken-1"
          :loading="nukingMessages"
          text
          small
          @click="nukeAllMessages"
        >
          Yes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { defineComponent } from 'vue';
import { mapMutations, mapState, mapActions } from 'vuex';

export default defineComponent({
  name: 'ConfirmNukeDialog',
  emits: ['nuked-messages'],
  data: () => ({
    nukingMessages: false,
  }),
  computed: {
    open: {
      get() {
        return this.nukeDialogOpen;
      },
      set(value) {
        this.setNukeDialogOpen(value);
      },
    },
    ...mapState(['nukeDialogOpen']),
  },
  methods: {
    async nukeAllMessages() {
      const { handleNukeAllMessages } = this;

      this.nukingMessages = true;

      await handleNukeAllMessages();

      this.$emit('nuked-messages');

      this.nukingMessages = false;
    },
    ...mapMutations(['setNukeDialogOpen']),
    ...mapActions(['handleNukeAllMessages']),
  },
});
</script>
