<template>
  <v-dialog v-model="open" width="500" overlay-color="#202020">
    <v-card style="background-color: #101010; border-radius: 10px">
      <v-card-title class="text-h5">Confirm</v-card-title>

      <v-card-text>
        Are you sure you want to delete all messages for current encryption key?
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="py-3">
        <v-spacer></v-spacer>
        <v-btn class="red accent-3" text small @click="open = false">
          Cancel
        </v-btn>
        <v-btn
          class="light-green darken-1"
          text
          :loading="nukingMessages"
          small
          @click="nukeCurrentKeyMessages"
        >
          Yes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { defineComponent } from 'vue';
import { mapActions, mapMutations, mapState } from 'vuex';

export default defineComponent({
  name: 'ConfirmNukeDialog',
  data: () => ({
    nukingMessages: false,
  }),
  computed: {
    open: {
      get() {
        return this.nukeKeyDialogOpen;
      },
      set(value) {
        this.setNukeKeyDialogOpen(value);
      },
    },
    ...mapState(['nukeKeyDialogOpen']),
  },
  methods: {
    async nukeCurrentKeyMessages() {
      const { handleNukeCurrentKeyMessages } = this;

      this.nukingMessages = true;

      await handleNukeCurrentKeyMessages();

      this.nukingMessages = false;
    },
    ...mapMutations(['setNukeKeyDialogOpen']),
    ...mapActions(['handleNukeCurrentKeyMessages']),
  },
});
</script>
