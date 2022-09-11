<template>
  <div class="message pr-4 py-2">
    <div>by <b>{{ author.username }}</b> - {{ ago(createdAt) }}</div>
    {{ content }}<br>
    <div class="mt-2">
      <v-treeview :items="fileDescriptions" open-on-click rounded>
        <template class="file__label" v-slot:label="{ item: { size, name, type, uuid } }">
          <div v-if="name && uuid">
            <div :class="showable(type) && fileSrc(uuid) ? 'pa-4' : 'pa-4'" style="cursor: default; user-select: text;">
              <div class="text-caption d-flex flex-column">
                <div>
                  <span class="file__info">
                    Type: {{ type ? type : 'No Type' }}
                    <div class="file__tooltip">{{ type ? type : 'No Type' }}</div>
                  </span>
                </div>
                <div>
                  <span class="file__info">
                    Name: {{ name }}
                    <div class="file__tooltip">{{ name }}</div>
                  </span>
                </div>
                <div>
                  <span class="file__info">
                    File Size: {{ filesize(size) }}
                    <div class="file__tooltip">{{ filesize(size) }}</div>
                  </span>
                </div>
              </div>
              <span v-if="fileSrc(uuid)">
                <a target="_blank" :download="file(uuid).name" class="font-weight-bold text-decoration-none d-block mt-2" :href="fileSrc(uuid).src" v-if="file(uuid) || isFetchedFiles">
                  <v-btn small>Download File</v-btn>
                </a>
                <div v-if="showable(type)">
                  <img alt="" class="mt-5" v-if="type.startsWith('image')" :src="fileSrc(uuid).src" style="max-width: 100%" height="150" />
                  <video class="mt-5" v-if="type.startsWith('video')" style="max-width: 100%" height="300" controls>
                    <source :src="fileSrc(uuid).src" />
                  </video>
                  <audio class="mt-5" v-if="type.startsWith('audio')" controls style="max-width: 100%">
                    <source :src="fileSrc(uuid).src" :type="type" />
                  </audio>
                </div>
              </span>
              <div v-else>
                <div class="text-caption mt-1" v-if="currentFetchedFile == uuid || currentMultiple == uuid">{{ currentDownload.percentage < 100 ? currentDownload.percentage : 100 }}%</div>
                <v-btn small class="d-block mt-2" @click="fetchFile(uuid, id)" :disabled="fetchingFiles.running">{{ currentFetchedFile == uuid ? 'Fetching File...' : currentMultiple == uuid ? '' : 'Fetch File' }}<span v-if="currentMultiple == uuid">Fetching File...</span></v-btn>
              </div>
            </div>
          </div>
          <div v-else>
            {{ name }}
          </div>
        </template>
        <template v-slot:prepend="{ item: { type, uuid }, open }">
          <div :class="type && type != 'folder-open' ? 'ml-5' : ''">
            <mdicon v-if="!type && !uuid" :name="open ? 'folder-open' : 'folder'" />
            <mdicon :name="type.startsWith('image') ? 'file-image' : type.startsWith('audio') ? 'file-music' : type.startsWith('video') ? 'file-video' : type ? filesTypes[type] : 'file-question'" v-else />
          </div>
        </template>
      </v-treeview>
      <v-btn class="my-2" v-if="currentMessageFiles(id) < filesCount && filesCount && !isFetchedFiles" :disabled="fetchingFiles.running" @click="fetchFiles(id)">{{ fetchingFiles.running && fetchingFiles.type == 'multiple' ? 'Fetching Files' : 'Fetch' }} File(s), {{ filesize(totalSize) }}</v-btn>
    </div>
  </div>
</template>

<script>
  import { format } from 'timeago.js';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import filesize from 'filesize';
  import axios from 'axios';

  const request = axios.create({
    baseURL: `${process.env.VUE_APP_BACKEND}/api`,
    withCredentials: true
  });

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
        this.setFetchingFiles({ type: 'multiple', running: true });
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
        this.setFetchingFiles({ type: 'multiple', running: false });
        files = files.map(file => ({ ...file, messageId }));
        this.files = [...this.files, ...files];
        this.setTempDecryptedFiles([]);
      },
      async fetchFile(uuid, messageId) {
        const { data: { success } } = await request.get('/');
        if(success == false) return this.logOut();
        this.setFetchingFiles({ type: 'single', running: true });
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
        this.setFetchingFiles({ type: 'single', running: false });
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
      ...mapActions(['handleFetchFiles', 'handleFetchFile', 'logOut'])
    },
    computed: {
      ...mapState(['tempDecryptedFiles', 'currentMessage', 'fetchingFiles', 'currentFetchedFile', 'messages', 'currentDownload', 'currentMultiple']),
      totalSize() {
        let size = 0;
        this.fileDescriptions.forEach(({ children }) => children.forEach(child => size += child.size));
        return size;
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

<style scoped>
  .v-treeview ::v-deep(.v-treeview-node__root), .v-treeview ::v-deep(.v-treeview-node__prepend) {
    cursor: default;
  }

  .mdi.mdi-folder, .mdi.mdi-folder-open {
    cursor: pointer;
    margin: 0 5px;
  }

  .mdi.mdi-file-question {
    margin-left: 20px;
  }

  .v-treeview ::v-deep(.v-treeview-node__level) {
    display: none;
  }

  .v-treeview ::v-deep(.v-treeview-node__children) {
    margin-left: 50px;
    position: relative;
  }

  .file__info:hover .file__tooltip {
    translate: 0 0;
    visibility: visible;
    opacity: 1;
  }

  .file__tooltip {
    position: absolute;
    translate: 0 -25px;
    visibility: hidden;
    opacity: 0;
    padding: 3px 10px;
    transition: 0.4s ease;
    background: #404040;
    border-radius: 5px;
    z-index: 99999;
  }
</style>