<template>
  <div>
    <v-btn v-if="files.length > 1" small class="mb-3" @click="setFiles([])">Clear All</v-btn>
    <div class="d-flex" v-for="({ name, size }, i) of files" :key="i">
      <v-chip
        class="mt-2"
        color="deep-purple accent-4"
        dark
        label
        small
      >
        {{ name }} ({{ filesize(size) }})
      </v-chip>
      <div class="mt-2 ml-2" @click="removeFile(i)"><mdicon width="20" height="20" name="close" /></div>
    </div>
    <div v-if="files.length" class="text-caption grey--text mt-3">
      {{ files.length }} {{ files.length == 1 ? 'File' : 'Files' }} ({{ filesize(totalSize) }} in total)
    </div>
  </div>
</template>

<script>
  import filesize from 'filesize';
  import { mapMutations, mapState } from 'vuex';

  export default {
    name: 'FileInput',
    methods: {
      filesize,
      removeFile(i) {
        this.setFiles(this.files.filter((_, index) => index != i));
      },
      ...mapMutations(['setFiles'])
    },
    computed: {
      ...mapState(['files']),
      totalSize(state) {
        return state.files.reduce((p, { size }) => p + size, 0);
      }
    }
  }
</script>