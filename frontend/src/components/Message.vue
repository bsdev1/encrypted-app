<template>
  <div class="message pr-4 py-2">
    <div>by <b>{{ author.username }}</b> - {{ ago(createdAt) }}</div>
    {{ content }}<br>
    <div class="mt-2">
      <div v-if="tempDecryptedFiles.length && currentMessage == id && percentage < 100">{{ percentage }}%</div>
      <v-treeview :items="fileDescriptions" open-on-click rounded>
        <template v-slot:label="{ item: { size, name, type, uuid } }">
          <div v-if="name && uuid">
            <div :class="showable(type) && fileSrc(uuid) ? 'pt-3' : 'pa-3'">
              {{ name }} ({{ type ? type : 'No Type' }}, {{ filesize(size) }})
              {{ tempDecryptedFiles.find(file => file.uuid == uuid) }}
              <span v-if="fileSrc(uuid)">
                <div>
                  <a target="_blank" class="font-weight-bold" :href="fileSrc(uuid).src" v-if="file(uuid) || isFetchedFiles">
                    Download
                  </a>
                </div>
                <div v-if="showable(type)">
                  <img class="pa-4 ml-5" v-if="type.startsWith('image')" :src="fileSrc(uuid).src" style="max-width: 100%" height="150" />
                  <video class="pa-4 ml-5" v-if="type.startsWith('video')" style="max-width: 100%" height="300" controls>
                    <source :src="fileSrc(uuid).src" />
                  </video>
                  <audio class="ma-4 ml-5" v-if="type.startsWith('audio')" controls style="max-width: 100%">
                    <source :src="fileSrc(uuid).src" :type="type" />
                  </audio>
                </div>
              </span>
              <div class="font-weight-bold" @click="fetchFile(uuid, id)" v-else>Fetch File</div>
            </div>
          </div>
          <div v-else>
            {{ name }}
          </div>
        </template>
        <template v-slot:prepend="{ item: { type, uuid }, open }">
          <mdicon v-if="!type && !uuid" :name="open ? 'folder-open' : 'folder'" />
          <mdicon :name="type.startsWith('image') ? 'file-image' : type.startsWith('audio') ? 'file-music' : type.startsWith('video') ? 'file-video' : type ? filesTypes[type] : 'file-question'" v-else />
        </template>
      </v-treeview>
      <v-btn class="my-2" v-if="currentMessageFiles(id) < filesCount && filesCount && !isFetchedFiles" :disabled="fetchingFiles" @click="fetchFiles(id)">Fetch&nbsp;File(s), {{ filesize(totalSize) }}</v-btn>
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
        filesTypes: {
          'text/html': 'language-html5',
          'text/javascript': 'nodejs',
          'application/json': 'code-json',
          'application/pdf': 'file-pdf',
          'text/plain': 'file-document-outline',
          'application/x-msdownload': 'file-download',
          'application/vnd.ms-excel': 'file-excel',
          'application/x-zip-compressed': 'folder-zip',
        },
        allowedShowTypes: ['image', 'video', 'audio']
      }
    },
    methods: {
      filesize,
      ago: date => format(date),
      async fetchFiles(messageId) {
        this.setFetchingFiles(true);
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
        let files = await this.handleFetchFiles({ messageId, importedKey, key });
        this.setFetchingFiles(false);
        files = files.map(file => ({ ...file, messageId }));
        this.files = [...this.files, ...files];
        this.setTempDecryptedFiles([]);
      },
      async fetchFile(uuid, messageId) {
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
        const [file] = await this.handleFetchFile({ messageId, uuid, importedKey, key });
        if(file) this.files.push({ ...file, messageId });
        this.setTempDecryptedFiles([]);
      },
      isAllowedType(type) {
        return this.allowedShowTypes.filter(allowedType => type.startsWith(allowedType)).length;
      },
      showable(type) {
        const { isAllowedType } = this;
        return isAllowedType(type);
      },
      file(uuid) {
        return (this.files.length ? this.files : this.tempDecryptedFiles).find(file => file.uuid == uuid);
      },
      ...mapMutations(['setTempDecryptedFiles', 'setFetchingFiles', 'setMessages']),
      ...mapActions(['handleFetchFiles', 'handleFetchFile'])
    },
    computed: {
      ...mapState(['tempDecryptedFiles', 'currentMessage', 'fetchingFiles', 'currentFetchedFile', 'messages']),
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
          return this.isFetchedFiles ? this.files.find(file => file.uuid == uuid) : (this.files.length ? this.files : this.tempDecryptedFiles).find(file => file.uuid == uuid);
        }
      },
      currentMessageFiles() {
        return function(id) {
          return this.files.filter(({ messageId }) => messageId == id).length;
        }
      },
      isFetchedFiles() {
        return this.files.length && this.files.map(({ notFetched }) => notFetched).includes(true);
      }
    }
  }
</script>