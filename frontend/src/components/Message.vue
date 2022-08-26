<template>
  <div class="message pr-4 py-2">
    <div>by <b>{{ author.username }}</b> - {{ ago(createdAt) }}</div>
    {{ content }}<br>
    <div class="d-flex flex-wrap mt-2" v-if="files.length">
      <div v-for="({ src, name, type }, i) of files" :key="i">
        <img :class="i + 1 > 1 ? 'ml-4 mb-3' : 'mb-3'" v-if="type.startsWith('image')" :src="src" style="max-width: 100%" height="150" />
        <video class="ml-3 mb-3" v-else-if="type.startsWith('video')" controls style="max-width: 100%;" height="200">
          <source :src="src" />
        </video>
        <div class="ml-6 mb-3" v-else>
          <a :href="src" target="_blank">{{ name }}</a>
        </div>
      </div>
    </div>
    <div class="mt-2" v-else>
      <div class="text-caption grey--text mb-1" v-for="({ fileName, fileType, fileSize }, i) of fileDescriptions" :key="i">
        {{ fileName }} ({{ fileType }}, {{ filesize(fileSize) }}) 
      </div>
      <v-btn class="my-2" v-if="filesCount" :loading="fetchingFiles" @click="showFiles(id)">Show&nbsp;<b v-if="filesCount > 1">{{ filesCount }} Files</b><span v-else>File</span>&nbsp;({{ filesize(totalSize) }})</v-btn>
    </div>
  </div>
</template>

<script>
  import { format } from 'timeago.js';
  import { mapActions } from 'vuex';
  import filesize from 'filesize';

  export default {
    name: 'Message',
    props: { message: Object },
    data() {
      return {
        ...this.message,
        fetchingFiles: false,
      }
    },
    methods: {
      filesize,
      ago: date => format(date),
      async showFiles(messageId) {
        this.fetchingFiles = true;
        const key = localStorage.getItem('key');
        const importedKey = await crypto.subtle.importKey(
          'jwk',
          {
            kty: 'oct',
            k: key,
            alg: 'A256GCM',
            ext: true,
          },
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );
        const files = await this.handleShowFiles({ messageId, importedKey, key });
        this.fetchingFiles = false;
        this.files = files;
      },
      ...mapActions(['handleShowFiles'])
    },
    computed: {
      totalSize() {
        return this.fileDescriptions.reduce((p, { fileSize }) => p + fileSize, 0);
      }
    }
  }
</script>