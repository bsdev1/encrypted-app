<template>
  <div v-if="user" id="dashboard" class="mx-auto mt-7 mb-6 px-6 pb-6">
    <div class="user__info d-flex">
      <div class="my-auto mr-7">
        Hello,
        <b class="mr-1">{{ user.username }}!</b>
        {{ date }}
      </div>
      <v-btn
        id="logout__btn"
        class="ml-auto"
        :loading="loggingOut"
        @click="logout"
      >
        Log Out
      </v-btn>
    </div>
    <h2 class="mt-4">{{ $sayHello() }}</h2>
    <div class="messages__expire__date d-flex align-center mt-2">
      <v-checkbox
        v-model="messagesExpirationEnabled"
        :label="
          messagesExpirationEnabled
            ? 'Disable Message Expiration'
            : 'Enable Message Expiration'
        "
        @change="updateExpirationEnabled"
      ></v-checkbox>
      <div>
        <v-select
          v-model="selected"
          hide-details
          :disabled="messagesExpirationEnabled == false"
          class="expire__date__select ml-6"
          :items="$EXPIRE_TIMES"
          label="Select"
          outlined
          @change="updateExpiration"
        ></v-select>
      </div>
    </div>
    <div class="text-caption grey--text mt-2 mb-2">
      Note: Enabling this option makes messages automatically remove after
      certain amount of time (it can be 1 minute off).
    </div>
    <v-divider class="mt-4 mb-6"></v-divider>
    <v-btn v-if="messages.length" small @click="exportChat">
      <mdicon name="export-variant" size="15" class="export-messages-icon" />
      Export Messages
    </v-btn>
    <div class="mt-4">
      <div v-if="loadingMessages" class="d-flex">
        <v-progress-circular indeterminate></v-progress-circular>
        <div class="ml-5 my-auto">Loading Messages...</div>
      </div>
      <template v-else>
        <Messages v-if="messages.length" />
        <div v-else>No Messages Yet... Be First!</div>
        <v-slide-y-transition>
          <v-alert
            v-if="sendMessageError"
            class="alert_error mt-6 mb-5"
            type="error"
            color="red"
          >
            {{ sendMessageError }}
          </v-alert>
        </v-slide-y-transition>
        <form
          class="d-flex mt-5 send_message_form"
          @submit.prevent="sendMessage"
        >
          <div id="outer__files__input">
            <v-file-input
              v-model="files"
              hide-details
              width="30"
              hide-input
              solo
              multiple
              style="flex: 0"
            />
            <div id="files__text">
              <mdicon name="arrow-left-drop-circle" class="mr-1" />
              Select Your Files
            </div>
          </div>
          <div id="message__input">
            <v-text-field
              ref="messageInput"
              v-model="message"
              :disabled="sendingMessage"
              label="Message"
              solo
              placeholder="Type In Your Message"
              hide-details
            ></v-text-field>
          </div>
          <v-btn
            type="submit"
            class="send__message__btn ml-3 my-auto"
            :loading="sendingMessage"
          >
            <mdicon name="send" size="15" class="mr-2" />
            Send
          </v-btn>
        </form>
        <div
          class="drop__files my-5 px-4 py-6"
          @drop.prevent="({ dataTransfer }) => fileDrop(dataTransfer)"
          @dragover="fileDragOver"
        >
          <mdicon name="file-multiple" size="15" class="mr-2" />
          Drag & Drop Files Here
        </div>
        <div v-if="progress" class="text-caption">
          Uploading
          <b>{{ currentUpload }}</b>
          ...
        </div>
        <div
          class="mt-4"
          style="width: 300px; border-radius: 100px; background: #202020"
        >
          <div
            :class="progress ? 'pa-2 px-4 progress' : 'progress'"
            :style="`width: ${progress}%; transition: 0.3s ease; border-radius: 100px; background: #303030;`"
          >
            <b v-if="progress">{{ progress }}%</b>
          </div>
        </div>
        <Files :files="files" class="my-4" />
        <div
          class="key-options text-caption mt-3 grey--text d-flex align-center flex-wrap"
        >
          Your encryption key (keep it safe)
          <v-btn
            small
            class="encryption__key__visibility font-weight-bold"
            :class="{
              'light-green darken-1': showEncryptionKey,
              'red accent-3': !showEncryptionKey,
            }"
            @click="showEncryptionKey = showEncryptionKey ? false : true"
          >
            <mdicon
              :name="showEncryptionKey ? 'eye-off' : 'eye'"
              size="15"
              class="hide-show-icon"
            />
            {{ showEncryptionKey ? 'hide key' : 'show key' }}
          </v-btn>
          <v-btn
            v-if="$isFirefox() == false"
            small
            class="paste__clipboard__btn light-green darken-1 font-weight-bold"
            @click="pasteKeyFromClipboard"
          >
            <mdicon
              name="content-paste"
              size="15"
              class="paste-content-icon mr-2"
            />
            Paste Key
          </v-btn>
          <v-btn
            class="copy__key__btn font-weight-bold light-blue darken-2"
            small
            @click="copyToClipboard"
          >
            <mdicon name="content-copy" size="15" class="mr-2" />
            Copy Key
          </v-btn>
        </div>
        <div class="key__box my-2 mb-4">
          <v-text-field
            ref="encryptionKeyInput"
            readonly
            :disabled="$isFirefox() == false"
            placeholder="Paste Encryption Key"
            :label="showEncryptionKey ? key : `${key.slice(0, -15)}...`"
            solo
            hide-details
          ></v-text-field>
          <div v-if="$isFirefox()" class="text-caption grey--text mt-2">
            Note: to change the key, click on above input and paste encryption
            key
          </div>
        </div>
        <div v-if="qrCode" class="mb-5">
          <span class="text-caption grey--text">Your Key In QR Code</span>
          <div
            class="mt-2"
            style="width: 148px; height: 148px; position: relative"
          >
            <img id="img__qr__code" alt="" :src="qrCode" />
            <div class="qr__key__icon">
              <img src="@/assets/key.svg" />
            </div>
          </div>
          <div v-if="showScanner">
            <qrcode-stream
              class="qr__video"
              @decode="onDecode"
              @init="onScannerInit"
            >
              <v-btn
                v-if="!scannerLoading"
                class="scan__qr__btn ma-3"
                small
                @click="showScanner = false"
              >
                <mdicon name="close" size="15" class="mr-2" />
                Close Scanner
              </v-btn>
            </qrcode-stream>
          </div>
          <v-btn
            v-else
            :loading="scannerLoading"
            :disabled="sendingMessage"
            class="scan__qr__btn mt-3"
            small
            @click="showScanner = true"
          >
            <mdicon name="camera" size="15" class="mr-2" />
            Scan QR Code Instead
          </v-btn>
        </div>
        <div v-else>Loading QR...</div>

        <ConfirmNukeDialog @nuked-messages="allMessages = []" />
        <ConfirmNukeKeyDialog />

        <v-btn
          v-if="key && messages.length"
          class="mb-3 nuke-btn"
          @click="() => setNukeKeyDialogOpen(true)"
        >
          Nuke Messages For Current Key
        </v-btn>
        <v-btn
          v-if="allMessages.length"
          class="nuke-btn"
          @click="() => setNukeDialogOpen(true)"
        >
          Nuke Messages For All Keys
        </v-btn>
      </template>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import Messages from '@/components/Messages.vue';
import Files from './Files.vue';
import qrcode from 'qrcode';
import {
  MAXIMUM_CHUNK_SIZE,
  CHUNK_SIZE,
  INITIALIZATION_VECTOR,
  MESSAGES_PAGINATION_NUMBER,
  convertToMs,
} from '@shared/constants';
import { request, encrypt, decrypt, appendBuffer } from '@/plugins/utils';
import { scrollToBottom, importKey } from '@/utils';
import ConfirmNukeDialog from '@/components/ConfirmNukeDialog.vue';
import ConfirmNukeKeyDialog from '@/components/ConfirmNukeKeyDialog.vue';

export default {
  name: 'Dashboard',
  metaInfo: {
    title: 'LockGuard – Dashboard',
  },
  components: { Messages, Files, ConfirmNukeDialog, ConfirmNukeKeyDialog },
  data: () => ({
    date: null,
    message: null,
    qrCode: null,
    currentUpload: null,
    key: localStorage.getItem('key') ?? '',
    messagesExpirationEnabled:
      localStorage.getItem('expirationEnabled') == 'false'
        ? false
        : localStorage.getItem('expirationEnabled') == 'true'
        ? true
        : false,
    loadingMessages: false,
    sendingMessage: false,
    showEncryptionKey: false,
    scannerLoading: false,
    loggingOut: false,
    showScanner: false,
    keyFieldDisabled: localStorage.getItem('keyFieldDisabled') == 'true',
    allMessages: [],
    progress: 0,
  }),
  computed: {
    ...mapState([
      'selectedTime',
      'sendMessageError',
      'allowRequestMessages',
      'loadingNewMessages',
      'user',
      'socket',
      'currentPage',
      'files',
      'tempDecryptedFiles',
      'messages',
      'loading',
      'privateKey',
    ]),
    files: {
      get() {
        return this.$store.state.files;
      },
      set(files) {
        this.$store.commit('setFiles', files);
      },
    },
    selected: {
      get() {
        return this.selectedTime;
      },
      set(value) {
        this.setSelectedTime(value);
      },
    },
  },
  async created() {
    let {
      allowRequestMessages,
      setAllowRequestMessages,
      socket,
      key,
      setLoading,
      loading,
      setQR,
      handleGetMessages,
      getDateInterval,
      setTempDecryptedFiles,
      setSendMessageError,
      setMessages,
      setCurrentPage,
      setGlobalError,
    } = this;

    if (!allowRequestMessages) {
      setLoading(false);
      return setAllowRequestMessages(true);
    }

    this.loadingMessages = true;

    const {
      messages,
      messagesCount: allMessagesLength,
      unauthorized,
    } = await handleGetMessages();

    if (!messages || unauthorized) return (this.loadingMessages = false);

    if (!key || key.length < 43) {
      const AES_KEY = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      const newKey = await crypto.subtle.exportKey('jwk', AES_KEY);
      this.key = newKey.k;
      key = newKey.k;

      localStorage.setItem('key', newKey.k);
    }

    getDateInterval();

    await setQR(key);

    this.loadingMessages = false;

    await new Promise((resolve) => {
      this.allMessages = messages;

      setMessages(
        messages
          .map((message) => ({
            ...message,
            content: message.content ? decrypt(message.content, key) : '',
            fileDescriptions: message.fileDescriptions.map(
              ({ name, children }, id) => ({
                id,
                name: decrypt(name, key),
                children: children.map((file) => ({
                  ...file,
                  size: decrypt(file.size, key),
                  type: decrypt(file.type, key),
                  name: decrypt(file.name, key),
                })),
              })
            ),
          }))
          .filter(
            ({ content, fileDescriptions }) =>
              content != null &&
              fileDescriptions.filter(
                (fileDescription) => fileDescription.name != null
              ).length
          )
      );

      resolve();
    });

    if (loading) setLoading(false);

    let messagesElement = await scrollToBottom();

    addEventListener('paste', async (e) => {
      if (e.target.closest('.key__box')) {
        const key = (e.clipboardData || window.clipboardData).getData('text');

        try {
          await importKey(key);

          if (this.key == key) {
            return this.$notify({
              text: 'Pasted key is the same as your current key.',
              type: 'info',
            });
          }

          this.key = key;

          this.keyChange();
          this.$notify({
            text: 'Successfully inserted the key.',
            type: 'success',
          });
        } catch (e) {
          this.$notify({
            type: 'error',
            text:
              e?.message.includes('JWK') ||
              e?.message.includes(
                'Data provided to an operation does not meet requirements'
              )
                ? 'Key is invalid!'
                : `Pasting failed: ${e?.message ? e.message : 'Unknown error'}`,
          });
        } finally {
          await this.$nextTick();

          this.$refs.encryptionKeyInput.$el.querySelector('input').blur();
        }
      }
    });

    let firstMessage = document.querySelectorAll('.message')[0];

    const topObserver = new IntersectionObserver(async ([entry]) => {
      if (messages.length == 0) return;

      if (entry.isIntersecting && !this.loadingNewMessages) {
        this.setLoadingNewMessages(true);

        messagesElement.scrollTo({ top: 0, behavior: 'smooth' });

        const nextPage = this.currentPage + 1;

        const { isLastPagination, messages, unauthorized } =
          await handleGetMessages(nextPage);

        if (messages.length == 0 || unauthorized) {
          this.setLoadingNewMessages(false);
          return topObserver.disconnect();
        }

        const messagesCount = await new Promise((resolve) => {
          this.allMessages = messages;

          const decryptedMessages = messages
            .map((message) => ({
              ...message,
              content: decrypt(message.content, key),
              fileDescriptions: message.fileDescriptions.map(
                ({ name, children }, id) => ({
                  id,
                  name: decrypt(name, key),
                  children: children.map((file) => ({
                    ...file,
                    size: decrypt(file.size, key),
                    type: decrypt(file.type, key),
                    name: decrypt(file.name, key),
                  })),
                })
              ),
            }))
            .filter(({ content }) => content);

          setMessages([...decryptedMessages, ...this.messages]);

          resolve(decryptedMessages.length);
        });

        await this.$nextTick();

        const middleMessage =
          document.querySelectorAll('.message')[messagesCount];

        await new Promise((resolve) => {
          const messagesElement = document.querySelector('#messages');

          const childPosition =
            middleMessage.offsetTop - messagesElement.offsetTop;

          const middle =
            childPosition -
            messagesElement.offsetHeight / 2 +
            middleMessage.offsetHeight / 2;

          messagesElement.scrollTo({
            top: middle,
          });

          resolve();
        });

        const currentFirstMessage = document.querySelectorAll('.message')[0];

        topObserver.disconnect();

        if (!isLastPagination) {
          topObserver.observe(currentFirstMessage);

          firstMessage.removeAttribute('data-next');

          firstMessage = document.querySelectorAll('.message')[0];

          firstMessage.setAttribute('data-next', nextPage + 1);
        } else {
          firstMessage.removeAttribute('data-next');
        }

        setCurrentPage(nextPage);

        this.setLoadingNewMessages(false);
      }
    });

    if (firstMessage && allMessagesLength > MESSAGES_PAGINATION_NUMBER) {
      firstMessage.setAttribute('data-next', this.currentPage + 1);
      topObserver.observe(firstMessage);
    }

    socket?.on('disconnect', () => {
      setGlobalError(`Disconnected`);
    });

    socket?.io.on('reconnect_attempt', (attemptNumber) => {
      setGlobalError(`Reconnection attempt (${attemptNumber})`);
    });

    socket?.io.on('reconnect', () => {
      setGlobalError(null);
    });

    addEventListener('offline', () => {
      setGlobalError('You seem to be offline 🤔');
    });

    addEventListener('online', () => {
      setGlobalError(null);
    });

    socket?.on('newMessage', async (newMessage) => {
      const { key } = this;

      const decryptedContent = decrypt(newMessage.content, key);

      if (decryptedContent && key) {
        setSendMessageError(null);
        let { fileDescriptions, filesCount } = newMessage;

        if (fileDescriptions.length)
          fileDescriptions = fileDescriptions.map(({ name, children }, id) => ({
            id,
            name: decrypt(name, key),
            children: children.map((item) => ({
              ...item,
              size: decrypt(item.size, key),
              type: decrypt(item.type, key),
              name: decrypt(item.name, key),
            })),
          }));

        const message = {
          ...newMessage,
          filesCount,
          content: decryptedContent,
          expiration: newMessage.expiration,
          files: [],
          fileDescriptions,
          edited: false,
        };

        setTempDecryptedFiles([]);

        await new Promise((resolve) => {
          setMessages([...this.messages, message]);
          this.allMessages.push(newMessage);
          resolve();
        });

        const lastMessage = [...document.querySelectorAll('.message')].pop();
        const lastMessageHeight = parseFloat(
          getComputedStyle(lastMessage).height.split('px')[0]
        );

        messagesElement = document.querySelector('#messages');

        const { scrollHeight, scrollTop, clientHeight } = messagesElement;

        if (this.allMessages.length > 8)
          return messagesElement.scrollTo({
            top: scrollHeight,
            behavior: 'smooth',
          });

        if (scrollHeight - (scrollTop + lastMessageHeight) == clientHeight)
          messagesElement.scrollTo({ top: scrollHeight, behavior: 'smooth' });

        return;
      }

      this.allMessages.push(newMessage);
    });

    socket?.on('allMessagesNuked', () => {
      setMessages([]);
    });

    socket?.on('editedMessage', async ({ id, newContent }) => {
      const { key } = this;

      const message = this.messages.find((message) => message.id == id);

      this.$set(message, 'content', decrypt(newContent, key));
      this.$set(message, 'edited', true);

      this.updateMessage();
    });

    socket?.on('removeMessage', (id) => {
      setMessages(this.messages.filter((message) => message.id != id));
    });
  },
  methods: {
    updateExpiration() {
      localStorage.setItem('selectedExpirationTime', this.selected);
    },
    updateExpirationEnabled() {
      localStorage.setItem('expirationEnabled', this.messagesExpirationEnabled);
      localStorage.setItem('selectedExpirationTime', this.selected);
    },
    async exportChat() {
      const { key, handleExportChat } = this;

      await handleExportChat(key);
    },
    async sendMessage() {
      let { message, key, files, logOut, setSendMessageError } = this;
      if (!message?.trim() && !files.length)
        return setSendMessageError('Message cannot be empty!');

      if (!key) return setSendMessageError('Key cannot be empty!');
      if (key.length < 43)
        return setSendMessageError('Key must be 43 length or more!');

      setSendMessageError(null);
      this.sendingMessage = true;

      try {
        const {
          data: { success },
        } = await request.get('/');

        if (success == false) return logOut();

        message = message ? encrypt(message, key) : null;

        const importedKey = await importKey();

        const encryptedFiles = [];

        let chunks = [],
          children = [],
          treeItems = [];

        const appendChildren = (folderType, { name, type, size, uuid }) => {
          children.push({ name, type, size, uuid });

          const subfolderFound = treeItems.find(
            (item) => item.name == folderType
          );

          if (!subfolderFound) treeItems.push({ name: folderType, children });
          else {
            treeItems = treeItems.map((item) =>
              item.name == folderType
                ? {
                    ...item,
                    children: [...item.children, { uuid, size, name, type }],
                  }
                : item
            );
          }
        };

        if (files.length) {
          const uuids = await new Promise((resolve) => {
            this.socket?.emit('createFilesUpload', files.length, (uuids) =>
              resolve(uuids)
            );
          });

          for (let i = 0; i < files.length; i++) {
            let offset = 0,
              progress = [],
              fileUUID = uuids[i];

            const file = files[i];

            let { name, type, size } = file;

            this.currentUpload = name;

            const fileName = encrypt(name, key);
            const fileType = encrypt(type, key);
            size = encrypt(size, key);

            const fileContents = new Uint8Array(await file.arrayBuffer());
            const chunksLength = fileContents.length / CHUNK_SIZE;

            for (let i = 0; i < chunksLength; i++) {
              const sequenceNumber = offset / CHUNK_SIZE;

              const chunk = fileContents.slice(
                offset,
                i + 1 == chunksLength.toFixed(0)
                  ? fileContents.length
                  : offset + CHUNK_SIZE
              );

              const iv = crypto.getRandomValues(
                new Uint8Array(INITIALIZATION_VECTOR)
              );

              let encryptedChunk = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                importedKey,
                chunk
              );

              const percentage =
                fileContents.length < CHUNK_SIZE
                  ? 100
                  : ((sequenceNumber / chunksLength.toFixed(0)) * 100).toFixed(
                      0
                    );

              if (!progress.includes(percentage)) {
                progress.push(percentage);
                this.progress = percentage;
              }

              encryptedChunk = appendBuffer(iv, encryptedChunk);

              await new Promise((resolve) => {
                this.socket?.emit(
                  'uploadChunk',
                  { fileUUID, percentage, encryptedChunk },
                  () => resolve()
                );
              });

              chunks.push(encryptedChunk);
              offset += CHUNK_SIZE;
            }

            progress = [];
            this.progress = 0;

            const duplicatedChunkLengths = chunks
              .map((chunk) => chunk.length)
              .filter((chunk) => chunk == MAXIMUM_CHUNK_SIZE).length;

            let chunkLengths = chunks
              .map((chunk) => chunk.length)
              .filter((chunk) => chunk != MAXIMUM_CHUNK_SIZE);

            chunkLengths = [
              `${MAXIMUM_CHUNK_SIZE}-${duplicatedChunkLengths}`,
            ].concat(chunkLengths);

            encryptedFiles.push({
              uuid: fileUUID,
              fileName,
              fileType,
              chunks: chunkLengths,
            });

            chunks = [];

            const obj = { name, type, size, uuid: fileUUID };

            const archiveTypes = [
              'application/vnd.rar',
              'application/x-rar-compressed',
              'application/octet-stream',
              'application/zip',
              'application/octet-stream',
              'application/x-zip-compressed',
              'multipart/x-zip',
              'application/x-gzip',
            ];

            if (type == 'text/plain') appendChildren('TXT', obj);
            else if (type.endsWith('gif')) appendChildren('GIFS', obj);
            else if (type.startsWith('image')) appendChildren('PICS', obj);
            else if (type.startsWith('video')) appendChildren('VIDEO', obj);
            else if (type.startsWith('audio')) appendChildren('AUDIO', obj);
            else if (archiveTypes.includes(type))
              appendChildren('ARCHIVES', obj);
            else if (type.startsWith('application/x-msdownload'))
              appendChildren('EXECUTABLES', obj);
            else appendChildren('OTHER', obj);
            children = [];
            this.setFiles(this.files.slice(1, this.files.length));
          }

          this.currentUpload = null;
        }

        const fileDescriptions = treeItems.map(({ name, children }) => ({
          name: encrypt(name, key),
          children: children.map((item) => ({
            ...item,
            type: encrypt(item.type, key),
            name: encrypt(item.name, key),
          })),
        }));

        const data = {
          message,
          files: encryptedFiles,
          fileDescriptions,
        };

        if (this.messagesExpirationEnabled) data.expire = this.selected;

        const newMessage = await this.handleSendMessage(data);

        this.message = null;
        this.sendingMessage = false;

        files = files.map((file, i) => {
          const { name, type } = file;
          const { uuid } = encryptedFiles[i];
          return {
            src: URL.createObjectURL(new File([file], name, { type })),
            name,
            uuid,
            type,
            notFetched: true,
          };
        });

        const msg = {
          ...newMessage,
          files,
          edited: false,
          fileDescriptions: treeItems.map((treeItem, id) => ({
            id,
            ...treeItem,
            children: treeItem.children.map((item) => ({
              ...item,
              size: decrypt(item.size, key),
            })),
          })),
          content: decrypt(newMessage.content, key),
        };

        if (this.messagesExpirationEnabled)
          msg.expiration = convertToMs(this.selected);

        await new Promise((resolve) => {
          this.setMessages([...this.messages, msg]);
          this.allMessages.push(newMessage);
          resolve();
        });

        const messages = document.querySelector('#messages');

        if (messages)
          messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });

        this.focus('messageInput');
      } catch {
        this.$notify({
          text: 'Internal server error',
          type: 'error',
        });
      }
    },
    getDateInterval() {
      this.date = this.$getNormalizedDate(new Date());

      setTimeout(() => this.getDateInterval(), 1000);
    },
    focus(ref) {
      this.$refs[ref].$refs.input.focus();
    },
    async onScannerInit(promise) {
      try {
        this.scannerLoading = true;
        await promise;
        this.scannerLoading = false;
      } catch (e) {
        const name = e?.name;

        switch (name) {
          case 'NotAllowedError':
            this.$notify({
              text: 'Camera access permission denied!',
              type: 'error',
            });
            break;
          case 'NotFoundError':
            this.$notify({
              text: 'No suitable camera device installed!',
              type: 'error',
            });
            break;
          case 'NotSupportedError':
            this.$notify({
              text: 'Page is not served over HTTPS nor localhost!',
              type: 'error',
            });
            break;
          case 'NotReadableError':
            this.$notify({
              text: 'Your camera might be already in use!',
              type: 'error',
            });
            break;
          case 'OverconstrainedError':
            this.$notify({
              text: 'You requested the front camera although there is none!',
              type: 'error',
            });
            break;
          case 'StreamApiNotSupportedError':
            this.$notify({
              text: 'Your browser seems to be lacking features!',
              type: 'error',
            });
            break;
          default:
            this.$notify({ text: 'Unknown camera error!', type: 'error' });
            break;
        }
        this.showScanner = false;
      } finally {
        this.scannerLoading = false;
      }
    },
    async onDecode(decodedKey) {
      if (this.key == decodedKey) {
        this.$notify({
          text: 'QR Code key is the same as your current key.',
          type: 'info',
        });
        return (this.showScanner = false);
      }

      this.showScanner = false;
      this.key = decodedKey;

      await this.setQR(decodedKey);

      this.keyChange();
      this.$notify({
        text: 'Successfully inserted the key.',
        type: 'success',
      });
    },
    fileDrop({ items, files }) {
      if (!items) files = [...files];
      else {
        files = [...items]
          .filter((item) => item.kind == 'file')
          .map((file) => file.getAsFile());
      }

      this.setFiles(files);
    },
    fileDragOver(e) {
      e.preventDefault();
    },
    async keyChange() {
      const { key, setMessages, allMessages, setSendMessageError } = this;

      if (!key) return setSendMessageError('Key cannot be empty!');
      if (key.length < 43)
        return setSendMessageError('Key must be 43 length or more!');

      setSendMessageError(null);

      localStorage.setItem('key', key);

      let tempMessages = [];

      await new Promise(async (resolve) => {
        for (const message of allMessages) {
          let { content, fileDescriptions } = message;
          content = content == null ? null : decrypt(content, key);

          fileDescriptions = fileDescriptions
            .map(({ name, children }, id) => ({
              id,
              name: decrypt(name, key),
              children: children.map((item) => ({
                ...item,
                size: decrypt(item.size, key),
                type: decrypt(item.type, key),
                name: decrypt(item.name, key),
              })),
            }))
            .filter((fileDescription) => fileDescription.name != null);

          if ((content == null && fileDescriptions.length) || content) {
            const obj = { ...message, content, files: [], fileDescriptions };
            tempMessages.push(obj);
          }
        }

        setMessages(tempMessages);
        resolve();
      });

      tempMessages = [];

      await scrollToBottom();
    },
    async setQR(data) {
      this.qrCode = null;
      const qr = await qrcode.toDataURL(data, { margin: 2, width: 148 });
      this.qrCode = qr;
    },
    async pasteKeyFromClipboard() {
      try {
        const text = await navigator.clipboard.readText();

        await importKey(text);

        if (this.key == text) {
          return this.$notify({
            text: 'Pasted key is the same as your current key.',
            type: 'info',
          });
        }

        this.key = text;

        this.keyChange();
        this.$notify({
          text: 'Successfully inserted the key.',
          type: 'success',
        });
      } catch (e) {
        this.$notify({
          type: 'error',
          text: e?.message.includes('JWK')
            ? 'Key is invalid!'
            : `Pasting failed: ${e?.message ? e.message : 'Unknown error'}`,
        });
      }
    },
    async copyToClipboard() {
      await navigator.clipboard.writeText(this.key);

      this.$notify({
        text: 'Copied your key to the clipboard.',
        type: 'success',
      });
    },
    async logout() {
      this.loggingOut = true;
      await this.handleLogout();
      this.loggingOut = false;
    },
    ...mapActions([
      'handleExportChat',
      'handleGetMessages',
      'handleSendMessage',
      'handleLogout',
      'logOut',
    ]),
    ...mapMutations([
      'setGlobalError',
      'setSelectedTime',
      'setSendMessageError',
      'setNukeKeyDialogOpen',
      'setNukeDialogOpen',
      'setAllowRequestMessages',
      'setLoadingNewMessages',
      'updateMessage',
      'setObserver',
      'setCurrentPage',
      'setFiles',
      'setTempDecryptedFiles',
      'setMessages',
      'setLoading',
      'setPrivateKey',
    ]),
  },
};
</script>

<style lang="scss" scoped>
#dashboard {
  width: 1000px;
}

.alert_error {
  color: #fff !important;
}

.send_message_form {
  width: initial;
}

#files__text {
  display: none;
}

#img__qr__code {
  user-select: none;
  -webkit-user-drag: none;
  width: 148px;
  height: 148px;
  border-radius: 3px;
}

#message__input {
  width: 100%;
}
.send__message__btn {
  height: 48px !important;
  width: 100px !important;
}

.qr__video {
  position: fixed;
  inset: 0;
  z-index: 9999;
  transition: 0.3s ease;
  width: 100vw;
  height: 100vh;
}

.drop__files {
  background-image: linear-gradient(to left, #303030, #202020);
  border-radius: 10px;
  font-weight: bold;
  cursor: default;
  user-select: none;
  width: 270px;
  text-align: center;
  max-width: 100%;
}

.paste__clipboard__btn,
.copy__key__btn,
.scan__qr__btn {
  max-width: 100%;
}

.qr__key__icon {
  background: white;
  padding: 7px 10px 0 10px;
  border-radius: 100px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.encryption__key__visibility {
  cursor: pointer;
}

@media screen and (max-width: 1024px) {
  #dashboard {
    width: 100%;
  }
}

@media screen and (max-width: 700px) {
  .user__info {
    display: block !important;
  }
  #logout__btn {
    margin-top: 16px;
  }
}

@media screen and (max-width: 340px) {
  #outer__files__input {
    display: flex;
  }

  .send_message_form,
  #files__text {
    display: block !important;
  }

  #files__text {
    margin: 12px 0 0 5px;
    font-size: 14px;
    font-weight: bold;
  }

  #message__input {
    margin: 20px 0 !important;
  }
  .send__message__btn {
    max-width: 100%;
    font-size: 5vw;
    width: 100% !important;
    margin-left: 0 !important;
  }

  .paste__clipboard__btn,
  .encryption__key__visibility,
  .copy__key__btn,
  .scan__qr__btn {
    font-size: 4vw;
  }

  .copy__key__btn,
  .paste__clipboard__btn,
  .encryption__key__visibility {
    margin-left: 0 !important;
    width: 100% !important;
  }
}

.export-messages-icon {
  margin: -2px 10px 0 -2px !important;
}

.hide-show-icon {
  margin: -2px 8px 0 -2px !important;
}

.paste-content-icon {
  margin-left: -2px;
}

.key-options {
  gap: 10px;
}

.expire__date__select {
  user-select: none;

  &::v-deep(.v-input__control) {
    width: 120px;
  }

  &::v-deep(input) {
    cursor: pointer !important;
  }
}

.v-input--checkbox {
  &::v-deep(.v-input__control) {
    flex-grow: initial;
    width: initial;
  }
}

.nuke-btn {
  width: 100%;
}
</style>
