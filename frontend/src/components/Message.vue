<template>
  <div class="message pr-4 py-2">
    <div>by <b>{{ author.username }}</b> - {{ ago(createdAt) }}</div>
    {{ content }}<br>
    <div class="mt-2">
      <div v-if="tempDecryptedFiles.length && currentMessage == id && percentage < 100">{{ percentage }}%</div>
      <v-treeview item-key="id" :items="fileDescriptions" open-on-click rounded>
        <template v-slot:label="{ item: { size, name, type, uuid } }">
          <div v-if="name && uuid">
            <div :class="((file(uuid) && currentMessage == id) || isFetchedFiles) && type.startsWith('image') ? 'pt-3' : ''">
              {{ name }} ({{ type ? type : 'No Type' }}, {{ filesize(size) }})
              <a target="_blank" class="ml-2" :href="fileSrc(uuid)" v-if="(file(uuid) && currentMessage == id) || isFetchedFiles">
                Download
              </a>
              <div v-if="((file(uuid) && currentMessage == id) || isFetchedFiles) && type.startsWith('image')">
                <img class="pa-4 ml-5" v-if="type.startsWith('image')" :src="fileSrc(uuid)" style="max-width: 100%" height="150" />
              </div>
            </div>
          </div>
          <div v-else>
            {{ name }}
          </div>
        </template>
        <template v-slot:prepend="{ item: { type, uuid }, open }">
          <mdicon v-if="!type && !uuid" :name="open ? 'folder-open' : 'folder'" />
          <mdicon :name="type.startsWith('image') ? 'file-image' : type.startsWith('audio') ? 'file-music' : type.startsWith('video') ? 'file-video' : type ? filesTypes[type] : 'file-question'" v-else>
            {{ filesTypes[type] }}
          </mdicon>
        </template>
      </v-treeview>
      <v-btn class="my-2" v-if="filesCount && currentMessage != id && !isFetchedFiles" :loading="fetchingFiles" @click="showFiles(id)">Fetch&nbsp;File(s), {{ filesize(totalSize) }}</v-btn>
    </div>
  </div>
</template>

<script>
  import { format } from 'timeago.js';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import filesize from 'filesize';

  export default {
    name: 'Message',
    props: { message: Object },
    data() {
      return {
        ...this.message,
        fetchingFiles: false,
        filesTypes: {
          'text/html': 'language-html5',
          'text/javascript': 'nodejs',
          'application/json': 'code-json',
          'application/pdf': 'file-pdf',
          'text/plain': 'file-document-outline',
          'application/x-msdownload': 'file-download',
          'application/vnd.ms-excel': 'file-excel'
        }
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
        this.setTempDecryptedFiles([]);
      },
      ...mapMutations(['setTempDecryptedFiles']),
      ...mapActions(['handleShowFiles'])
    },
    computed: {
      ...mapState(['tempDecryptedFiles', 'currentMessage', 'treeItems']),
      totalSize() {
        let size = 0;
        this.fileDescriptions.forEach(({ children }) => children.forEach(child => size += child.size));
        return size;
      },
      percentage() {
        return ((this.tempDecryptedFiles.length / this.filesCount) * 100).toFixed(0);
      },
      fileSrc() {
        return function(uuid) {
          return this.isFetchedFiles ? this.files.find(file => file.uuid == uuid).src : (this.files.length ? this.files : this.tempDecryptedFiles).find(file => file.uuid == uuid).src;
        }
      },
      file() {
        return function(uuid) {
          return (this.files.length ? this.files : this.tempDecryptedFiles).find(file => file.uuid == uuid);
        }
      },
      isFetchedFiles() {
        return this.files.map(({ notFetched }) => notFetched).includes(true);
      }
    }
  }
</script>