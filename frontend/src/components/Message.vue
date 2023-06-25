<template>
  <div class="message pr-4 py-2 pb-4" :data-id="id">
    <div class="message__flex d-flex">
      <div
        v-if="interval"
        class="expiration__progress__wrapper mr-4"
        :class="{ 'mt-2': !content }"
      >
        <div style="position: relative">
          <mdicon name="clock-outline" size="18" />
          <v-progress-circular
            :key="updateExpiration"
            class="expiration__progress"
            size="24"
            :value="expireProgress"
          >
            <v-icon>mdi-folder</v-icon>
          </v-progress-circular>
        </div>
        <div class="expiration__tooltip">
          Auto-Destruction in about
          {{ $msToReadeableTime(expiration) }}
        </div>
      </div>

      <MessageContent
        :id="id"
        :key="messageUpdate"
        :username="author.username"
        :created-at="createdAt"
      />

      <div class="message__options ml-auto d-flex">
        <v-btn
          v-if="content"
          class="message__btn__copy"
          title="Copy Message"
          small
          @click="copyMessage(content)"
        >
          <mdicon name="content-copy" />
        </v-btn>
        <v-btn
          v-if="content"
          :disabled="applyingChanges"
          class="message__btn__edit ml-2"
          title="Edit Message"
          small
          @click="editMessage(id)"
        >
          <mdicon name="pencil" />
        </v-btn>
        <v-btn
          :loading="applyingChanges"
          class="message__btn__delete ml-2"
          title="Delete Message"
          small
          @click="removeMessage(id)"
        >
          <mdicon name="close" />
        </v-btn>
      </div>
    </div>
    <div class="message__files">
      <v-fade-transition>
        <v-progress-linear
          v-if="
            currentMessage == id &&
            currentParentDownloadPercent > 0 &&
            currentParentDownloadPercent < 100
          "
          :value="currentParentDownloadPercent"
          color="cyan"
          class="mt-3 mb-4"
        ></v-progress-linear>
      </v-fade-transition>
      <v-treeview :items="fileDescriptions" open-on-click rounded>
        <template
          #label="{ item: { size, name, type, uuid, notFound } }"
          class="file__label"
        >
          <div v-if="name && uuid">
            <div
              :class="showable(type) && fileSrc(uuid) ? 'pa-4' : 'pa-4'"
              style="cursor: default; user-select: text"
            >
              <div class="text-caption d-flex flex-column">
                <div v-if="notFound" class="red--text font-weight-bold mb-1">
                  File not found
                </div>
                <div>
                  <span class="file__info">
                    <span
                      :class="{
                        'text-decoration-line-through grey--text lighten-1':
                          notFound,
                      }"
                    >
                      Type: {{ type ? type : 'Unknown Type' }}
                    </span>
                    <div class="file__tooltip">
                      {{ type ? type : 'Unknown Type' }}
                    </div>
                  </span>
                </div>
                <div>
                  <span class="file__info">
                    <span
                      :class="{
                        'text-decoration-line-through grey--text lighten-1':
                          notFound,
                      }"
                    >
                      Name: {{ name }}
                    </span>
                    <div class="file__tooltip">{{ name }}</div>
                  </span>
                </div>
                <div>
                  <span class="file__info">
                    <span
                      :class="{
                        'text-decoration-line-through grey--text lighten-1':
                          notFound,
                      }"
                    >
                      File Size: {{ $filesize(size) }}
                    </span>
                    <div class="file__tooltip">{{ $filesize(size) }}</div>
                  </span>
                </div>
              </div>
              <span v-if="fileSrc(uuid)">
                <v-btn
                  v-if="file(uuid) || isFetchedFiles"
                  small
                  class="d-block mt-2 pa-0"
                >
                  <a
                    target="_blank"
                    style="height: 28px"
                    class="d-flex align-center px-3 text-decoration-none white--text"
                    :download="file(uuid).name"
                    :href="fileSrc(uuid).src"
                  >
                    Download File
                  </a>
                </v-btn>
                <div v-if="showable(type)">
                  <img
                    v-if="type.startsWith('image')"
                    alt=""
                    class="mt-5"
                    :src="fileSrc(uuid).src"
                    style="max-width: 100%"
                    height="150"
                  />
                  <video
                    v-if="type.startsWith('video')"
                    class="mt-5"
                    style="max-width: 100%"
                    height="300"
                    controls
                  >
                    <source :src="fileSrc(uuid).src" />
                  </video>
                  <audio
                    v-if="type.startsWith('audio')"
                    class="mt-5"
                    controls
                    style="max-width: 100%"
                  >
                    <source :src="fileSrc(uuid).src" :type="type" />
                  </audio>
                </div>
              </span>
              <div v-else>
                <div
                  v-if="currentFetchedFile == uuid && size > chunkSize"
                  class="text-caption mt-1"
                >
                  {{ currentDownload.percentage }}%
                </div>
                <v-btn
                  small
                  class="d-block mt-2"
                  :disabled="
                    fetchingFiles.running ||
                    notFound ||
                    (currentFetchedFile && currentFetchedFile != uuid) ||
                    currentFetchedFile == uuid
                  "
                  @click="fetchFile(uuid, id)"
                >
                  {{
                    currentFetchedFile == uuid
                      ? 'Fetching File...'
                      : 'Fetch File'
                  }}
                </v-btn>
              </div>
            </div>
          </div>
          <div v-else>
            <span v-if="currentFetchedFileParent == name">
              Downloading from
            </span>
            {{ name }}
            <template v-if="currentFetchedFileParent == name">...</template>
          </div>
        </template>
        <template #prepend="{ item: { type, uuid }, open }">
          <div
            :class="{
              'ml-3 mt-5': uuid != null && type != 'folder-open',
            }"
          >
            <mdicon
              v-if="!type && !uuid"
              :name="open ? 'folder-open' : 'folder'"
            />
            <mdicon
              v-else
              :name="
                type.startsWith('image')
                  ? 'file-image'
                  : type.startsWith('audio')
                  ? 'file-music'
                  : type.startsWith('video')
                  ? 'file-video'
                  : type
                  ? filesTypes[type] != null
                    ? filesTypes[type]
                    : 'file-question'
                  : 'file-question'
              "
            />
          </div>
        </template>
      </v-treeview>
      <v-btn
        v-if="
          currentMessageFiles(id) < filesCount - filesNotFoundCount &&
          filesCount - filesNotFoundCount &&
          !isFetchedFiles
        "
        class="fetch__files__btn my-2 mt-3"
        :disabled="fetchingFiles.running || currentFetchedFile != null"
        @click="fetchFiles(id)"
      >
        <mdicon name="download" class="ml-n1 mr-2" />
        {{
          fetchingFiles.running && fetchingFiles.type == 'multiple'
            ? 'Fetching'
            : 'Fetch'
        }}
        File(s), {{ $filesize(totalSize) }}
      </v-btn>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import MessageContent from './MessageContent.vue';
import { request } from '@/plugins/utils';
import { MAXIMUM_CHUNK_SIZE } from '@shared/constants';
import { importKey } from '@/utils';

export default {
  name: 'Message',
  components: { MessageContent },
  props: { message: Object },
  data() {
    return {
      ...this.message,
      language: navigator.language,
      applyingChanges: false,
      updateExpiration: 0,
      interval: null,
      expireProgress: 0,
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
      allowedShowTypes: ['image', 'video', 'audio'],
      chunkSize: MAXIMUM_CHUNK_SIZE,
    };
  },
  computed: {
    totalSize() {
      let size = 0;

      this.fileDescriptions.forEach(({ children }) =>
        children.forEach((child) => (size += child.size))
      );

      return size;
    },
    fileSrc() {
      return function (uuid) {
        return this.isFetchedFiles
          ? this.files.find((file) => file.uuid == uuid)
          : (this.files.length ? this.files : this.tempDecryptedFiles).find(
              (file) => file.uuid == uuid
            );
      };
    },
    currentMessageFiles() {
      return function (id) {
        return this.files.filter(({ messageId }) => messageId == id).length;
      };
    },
    isFetchedFiles() {
      return (
        this.files.length &&
        this.files.map(({ notFetched }) => notFetched).includes(true)
      );
    },
    filesNotFoundCount() {
      return this.fileDescriptions
        .map((fileDescription) =>
          fileDescription.children.filter((child) => child.notFound)
        )
        .flat(2).length;
    },
    currentFetchedFileParent() {
      const { fileDescriptions, currentFetchedFile } = this;

      const currentDownloadFileParent = fileDescriptions.find(
        (fileDescription) =>
          fileDescription.children.find(
            (child) => child.uuid == currentFetchedFile
          )
      );

      return currentDownloadFileParent?.name;
    },
    downloadedByParent() {
      return function (name) {
        const { files, fileDescriptions } = this;

        const filesIdsInCategory = fileDescriptions
          .filter((fileDescription) => fileDescription.name == name)
          .map((fileDescription) =>
            fileDescription.children.map((child) => child.uuid)
          )
          .flat();

        return files.filter((file) => filesIdsInCategory.includes(file.uuid))
          .length;
      };
    },
    ...mapState([
      'selectedTime',
      'currentParentDownloadPercent',
      'loadingNewMessages',
      'messageUpdate',
      'tempDecryptedFiles',
      'currentMessage',
      'fetchingFiles',
      'currentFetchedFile',
      'messages',
      'socket',
      'currentDownload',
      'currentEditedMessageId',
    ]),
  },
  created() {
    if (this.expiration) this.startUpdateExpirationInterval();
  },
  methods: {
    startUpdateExpirationInterval() {
      const {
        createdAt,
        expiration,
        setMessages,
        $getExpireProgress,
        messages,
        id,
      } = this;

      const progress = $getExpireProgress(
        createdAt,
        new Date(createdAt).getTime() + expiration
      );

      this.expireProgress = progress;
      this.updateExpiration = this.updateExpiration == 0 ? 1 : 0;

      if (this.expireProgress >= 100) {
        clearTimeout(this.interval);
        return setMessages(messages.filter((message) => message.id != id));
      }

      this.interval = setTimeout(() => {
        this.startUpdateExpirationInterval();
      }, 1000);
    },
    async fetchFiles(messageId) {
      const { setFetchingFiles, setTempDecryptedFiles, handleFetchFiles } =
        this;

      setFetchingFiles({ type: 'multiple', running: true });

      const importedKey = await importKey();

      let { files, unauthorized } = await handleFetchFiles({
        messageId,
        importedKey,
      });

      setFetchingFiles({ type: 'multiple', running: false });

      if (unauthorized) return;

      files = files.map((file) => ({ ...file, messageId }));
      this.files = [...this.files, ...files];

      setTempDecryptedFiles([]);
    },
    async fetchFile(uuid, messageId) {
      const {
        logOut,
        setFetchingFiles,
        setTempDecryptedFiles,
        handleFetchFile,
        setCurrentFetchedFile,
      } = this;

      setCurrentFetchedFile(uuid);

      const {
        data: { success },
      } = await request.get('/');

      if (success == false) return logOut();

      setFetchingFiles({ type: 'single', running: true });

      const importedKey = await importKey();

      const [file] = await handleFetchFile({
        messageId,
        uuid,
        importedKey,
      });

      if (file) this.files.push({ ...file, messageId });

      setFetchingFiles({ type: 'single', running: false });
      setTempDecryptedFiles([]);
    },
    isAllowedType(type) {
      return this.allowedShowTypes.filter((allowedType) =>
        type.startsWith(allowedType)
      ).length;
    },
    showable(type) {
      const { isAllowedType } = this;
      return isAllowedType(type);
    },
    file(uuid) {
      const { files, tempDecryptedFiles } = this;

      return (files.length ? files : tempDecryptedFiles).find(
        (file) => file.uuid == uuid
      );
    },
    editMessage(id) {
      const {
        currentEditedMessageId,
        setCurrentEditedMessageId,
        setSendMessageError,
      } = this;

      setSendMessageError(null);

      if (currentEditedMessageId == id) return setCurrentEditedMessageId(null);
      setCurrentEditedMessageId(id);
    },
    async copyMessage(content) {
      try {
        await navigator.clipboard.writeText(content);

        this.$notify({
          text: 'Successfully copied a message!',
          type: 'success',
        });
      } catch (e) {
        this.$notify({
          text: 'Something went wrong while copying a message!',
          type: 'error',
        });
      }
    },
    async removeMessage(id) {
      const {
        handleRemoveMessage,
        messages,
        setMessages,
        $notify,
        socket,
        loadingNewMessages,
        setLoadingNewMessages,
      } = this;

      const messageElement = [...document.querySelectorAll('.message')].find(
        (message) => message.getAttribute('data-id') == id
      );

      if (messageElement.getAttribute('data-next') || loadingNewMessages)
        return setLoadingNewMessages(false);

      this.applyingChanges = true;

      const { error, unauthorized } = await handleRemoveMessage(id);

      this.applyingChanges = false;

      if (unauthorized) return;

      setMessages(messages.filter((message) => message.id != id));

      if (error) {
        return $notify({
          text: error,
          type: 'error',
        });
      }

      $notify({
        text: 'Successfully removed a message.',
        type: 'success',
      });

      socket.emit('removeMessage', id);
    },
    ...mapMutations([
      'setSendMessageError',
      'setCurrentFetchedFile',
      'setLoadingNewMessages',
      'setTempDecryptedFiles',
      'setFetchingFiles',
      'setMessages',
      'setCurrentEditedMessageId',
    ]),
    ...mapActions([
      'handleFetchFiles',
      'handleFetchFile',
      'logOut',
      'handleRemoveMessage',
    ]),
  },
};
</script>

<style lang="scss" scoped>
.fade-transition {
  &-leave-active {
    position: absolute;
    z-index: -9999;
  }
}

.v-treeview {
  &::v-deep(.v-treeview-node__root),
  &::v-deep(.v-treeview-node__prepend) {
    cursor: default;
    margin-bottom: auto;
  }

  &::v-deep(.v-treeview-node__label) {
    white-space: initial !important;
  }

  &::v-deep(.v-treeview-node__level) {
    display: none;
  }

  &::v-deep(.v-treeview-node__children) {
    margin-left: 50px;
    position: relative;
  }
}

.message__btn {
  &__delete,
  &__edit,
  &__copy {
    border-radius: 100px;
    padding-left: 12px !important;
    height: 40px !important;
  }
}

.mdi {
  &.mdi-folder,
  &.mdi-folder-open {
    cursor: pointer;
    margin: 0 5px;
  }
}

.file {
  &__info:hover &__tooltip {
    translate: 0 0;
    visibility: visible;
    opacity: 1;
  }

  &__tooltip {
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
}

@media screen and (max-width: 700px) {
  .message {
    &__flex {
      display: block !important;
    }
    &__content {
      padding-right: 0 !important;
    }
    &__options,
    &__files {
      margin-top: 16px !important;
    }
  }

  .expiration__progress__wrapper {
    margin-bottom: 12px;
  }
}

@media screen and (max-width: 500px) {
  .v-treeview ::v-deep(.v-treeview-node__children) {
    margin-left: 0;
  }
}

@media screen and (max-width: 340px) {
  .v-treeview ::v-deep(.v-treeview-node__prepend) {
    display: none;
  }
  .fetch__files__btn {
    max-width: 100% !important;
    font-size: 3.5vw !important;
  }
}

.expiration__progress__wrapper {
  position: relative;
  height: 25px;
}

.expiration__progress__wrapper:hover .expiration__tooltip {
  opacity: 1;
  visibility: visible;
}

.expiration__progress {
  color: rgb(173, 173, 173);
  left: 0;
  position: absolute;
  top: 1px;
}

.mdi-clock-outline {
  margin-left: 3px;
  color: #5c5b5b;
}

.expiration__tooltip {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  position: absolute;
  font-size: 13px;
  background-color: #303030;
  border-radius: 10px;
  top: 30px;
  width: 120px;
  padding: 10px;
  z-index: 9999;
}
</style>
