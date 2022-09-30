<template>
  <div>
    <div class="loader d-flex flex-column" v-if="loading">
      <h3>Loading...</h3>
      <v-progress-circular class="mt-8" size="70" width="5" indeterminate></v-progress-circular>
    </div>
    <div class="mx-auto mt-7 mb-6 px-6 pb-6" v-else-if="user" id="dashboard">
      <div class="user__info d-flex">
        <div class="my-auto mr-7">Hello, <b>{{ user.username }}</b>! &nbsp; {{ date }}</div>
        <v-btn class="ml-auto" id="logout__btn" @click="logout">Log Out</v-btn>
      </div>
      <div class="mt-4">
        <div class="d-flex" v-if="loadingMessages">
          <v-progress-circular indeterminate></v-progress-circular>
          <div class="ml-5 my-auto">Loading Messages...</div>
        </div>
        <div v-else>
          <Messages v-if="messages.length" :key="updateMessages" :messages="messages" />
          <div class="mt-6" v-else>
            No Messages
          </div>
          <v-slide-y-transition>
            <v-alert class="alert_error mt-6 mb-5" type="error" color="red" v-if="error">{{ error }}</v-alert>
          </v-slide-y-transition>
          <form @submit.prevent="sendMessage" class="d-flex mt-5 send_message_form">
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
              <div id="files__text"><mdicon name="arrow-left-drop-circle" class="mr-1" /> Select Your Files</div>
            </div>
            <div id="message__input">
              <v-text-field :disabled="sendingMessage" v-model="message" ref="messageInput" label="Message" solo placeholder="Type In Your Message" hide-details></v-text-field>
            </div>
            <v-btn type="submit" class="send__message__btn ml-3 my-auto" :loading="sendingMessage"><mdicon name="send" size="15" class="mr-2" /> Send</v-btn>
          </form>
          <div class="drop__files my-5 px-4 py-6" @drop.prevent="({ dataTransfer }) => fileDrop(dataTransfer)" @dragover="fileDragOver"><mdicon name="file-multiple" size="15" class="mr-2" /> Drag & Drop Files Here</div>
          <div class="text-caption" v-if="progress">Uploading <b>{{ currentUpload }}</b>...</div>
          <div class="mt-4" style="width: 300px; border-radius: 100px; background: #202020">
            <div :class="progress ? 'pa-2 px-4 progress' : 'progress'" :style="`width: ${progress}%; transition: 0.3s ease; border-radius: 100px; background: #303030;`"><b v-if="progress">{{ progress }}%</b></div>
          </div>
          <Files :files="files" class="my-4" />
          <div class="mb-3">
            <v-btn class="paste__clipboard__btn" :disabled="sendingMessage" @click="pasteFromClipboard" small><mdicon name="content-paste" size="15" class="mr-2" /> Paste Clipboard</v-btn>
            <v-btn class="generate__key__btn ml-3" :disabled="sendingMessage" @click="generateNewKey" v-if="!keyFieldDisabled" small><mdicon name="key" size="15" class="mr-2" /> Generate New Key</v-btn>
          </div>
          <div class="key__flex d-flex">
            <v-text-field required @input="keyChange" :disabled="sendingMessage || keyFieldDisabled" v-model="key" label="Your Key" solo placeholder="Type In Your Key" hide-details></v-text-field>
            <v-btn class="copy__key__btn ml-3" height="48" width="100" @click="copyToClipboard"><mdicon name="content-copy" size="15" class="mr-2" /> Copy</v-btn>
          </div>
          <div class="text-caption mt-3">Hide it away from other people or share with someone you trust | want to share messages with.<br />(If you decide to use your own custom key: entering a weak, repeatable or not random key may compromise your data)</div>
          <v-checkbox
            hide-details
            class="mt-3 mb-5"
            @change="changeCheckbox"
            v-model="keyFieldDisabled"
            :label="`${keyFieldDisabled ? 'Enable Key Field' : 'Disable Key Field'}`"
          ></v-checkbox>
          <div v-if="qrCode" class="mb-5">
            <span class="text-caption grey--text">Your Key In QR Code</span>
            <div class="mt-2" style="width: 148px; height: 148px; position: relative;">
              <img alt="" :src="qrCode" id="img__qr__code" />
              <div style="background: white; padding: 7px 10px 0 10px; border-radius: 100px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                  width="20" height="25" viewBox="0 0 601 601">
                    <path d="M68.443,565.926c6.316,0,12.491-1.148,18.357-3.402c2.408-0.928,4.915-1.439,7.06-1.439c1.444,0,3.394,0.23,4.483,1.32
                      l29.587,29.584c5.955,5.951,13.868,9.23,22.283,9.23s16.328-3.275,22.283-9.23l27.255-27.256
                      c5.961-5.945,9.248-13.865,9.248-22.287c0-8.42-3.29-16.336-9.257-22.291l-29.575-29.574c-1.462-1.463-1.466-3.848-0.003-5.312
                      l4.691-4.703c0.899-0.902,1.925-1.094,2.625-1.094s1.723,0.191,2.619,1.09l29.612,29.652c5.958,5.957,13.874,9.238,22.289,9.238
                      s16.331-3.281,22.283-9.236l27.255-27.252c12.207-12.326,12.207-32.314,0.043-44.596l-29.63-29.631
                      c-0.906-0.902-1.096-1.938-1.096-2.645c0-0.705,0.19-1.736,1.096-2.643l118.106-118.125c1.57-1.567,4.793-2.623,8.018-2.623
                      c1.678,0,3.309,0.282,4.594,0.79c17.467,6.916,35.842,10.422,54.611,10.422c38.994,0,75.656-15.162,103.236-42.693
                      c57.344-57.427,57.34-150.775,0.006-208.107C512.719,15.312,475.754,0,436.432,0c-39.32,0-76.285,15.309-104.088,43.112
                      c-41.231,41.228-53.894,103.159-32.266,157.777c1.573,3.972,0.683,10.104-1.83,12.619L32.531,479.281
                      c-9.565,9.555-14.835,22.311-14.835,35.912s5.272,26.355,14.841,35.916C42.087,560.66,54.841,565.926,68.443,565.926z
                      M390.866,147.162c0-12.207,4.725-23.651,13.299-32.228c8.613-8.611,20.07-13.357,32.268-13.357
                      c12.195,0,23.654,4.743,32.268,13.357c8.578,8.577,13.299,20.021,13.299,32.228c0,12.206-4.725,23.651-13.299,32.228
                      c-8.602,8.571-20.064,13.302-32.268,13.302s-23.666-4.728-32.279-13.314C395.588,170.815,390.866,159.371,390.866,147.162z"/>
                </svg>
              </div>
            </div>
            <div v-if="showScanner">
              <qrcode-stream class="qr__video" @decode="onDecode" @init="onScannerInit">
                <v-btn v-if="!scannerLoading" @click="showScanner = false" class="scan__qr__btn ma-3" small><mdicon name="close" size="15" class="mr-2" /> Close Scanner</v-btn>
              </qrcode-stream>
            </div>
            <v-btn v-else :loading="scannerLoading" :disabled="sendingMessage" @click="showScanner = true" class="scan__qr__btn mt-3" small><mdicon name="camera" size="15" class="mr-2" /> Scan QR Code Instead</v-btn>
          </div>
          <div v-else>
            Loading QR...
          </div>
          <!-- <div class="d-flex flex-column">
            <v-btn :class="`${!keyFieldDisabled ? 'mt-3' : 'mb-3'}`" v-if="key && messages.length">Prune Messages For That Key</v-btn>
            <v-btn :class="`${!keyFieldDisabled ? 'mt-3' : ''}`" v-if="allMessages.length">Prune Messages For All Keys</v-btn>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import router from '@/plugins/router';
  import moment from 'moment';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import Messages from '@/components/Messages.vue';
  import Files from './Files.vue';
  import qrcode from 'qrcode';
  import { request, encrypt, decrypt, appendBuffer } from '@/plugins/utils';

  export default {
    name: 'Dashboard',
    components: { Messages, Files },
    data: () => ({
      date: null,
      message: null,
      error: null,
      qrCode: null,
      currentUpload: null,
      key: localStorage.getItem('key'),
      loadingMessages: false,
      sendingMessage: false,
      updateMessages: false,
      scannerLoading: false,
      showScanner: false,
      keyFieldDisabled: localStorage.getItem('keyFieldDisabled') == 'true',
      allMessages: [],
      progress: 0,
    }),
    async created() {
      let { user, pathFrom, key } = this;
      if(!user && (pathFrom == 'Login' || pathFrom == 'Register')) return router.push('/login');
      if(!key || key.length < 43) {
        const AES_KEY = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
        const newKey = await crypto.subtle.exportKey('jwk', AES_KEY);
        this.key = newKey.k;
        key = newKey.k;
        localStorage.setItem('key', newKey.k);
      }
      this.date = moment().locale(navigator.language).format('dddd, MMMM Do YYYY, h:mm:ss A');
      setInterval(() => this.date = moment().locale(navigator.language).format('dddd, MMMM Do YYYY, h:mm:ss A'), 1000);
      this.loadingMessages = true;
      await this.setQR(key);
      if(this.loading) this.setLoading(false);
      const messages = await this.handleGetMessages();
      this.loadingMessages = false;
      await new Promise(resolve => {
        this.allMessages = messages;
        this.setMessages(messages.map(message => ({ ...message, content: decrypt(message.content, key), fileDescriptions: message.fileDescriptions.map(({ name, children }, id) => ({ id, name: decrypt(name, key), children: children.map(item => ({ ...item, size: decrypt(item.size, key), type: decrypt(item.type, key), name: decrypt(item.name, key) })) })) })).filter(({ content }) => content));
        resolve();
      });
      let messagesElement = document.querySelector('#messages');
      messagesElement?.scrollTo({ top: messagesElement.scrollHeight, behavior: 'smooth' });

      const { socket } = this;

      socket.on('newMessage', async newMessage => {
        const { key } = this;
        const decryptedContent = decrypt(newMessage.content, key);
        if(decryptedContent && key) {
          this.error = null;
          let { fileDescriptions, filesCount } = newMessage;
          
          if(fileDescriptions.length) fileDescriptions = fileDescriptions.map(({ name, children }, id) => ({ id, name: decrypt(name, key), children: children.map(item => ({ ...item, size: decrypt(item.size, key), type: decrypt(item.type, key), name: decrypt(item.name, key) })) }));

          const message = {
            ...newMessage,
            filesCount,
            content: decryptedContent,
            files: [],
            fileDescriptions,
            edited: false
          };

          this.setTempDecryptedFiles([]);

          await new Promise(resolve => {
            this.setMessages([...this.messages, message]);
            this.allMessages.push(newMessage);
            resolve();
          });
          
          const lastMessage = [...document.querySelectorAll('.message')].pop();
          const lastMessageHeight = parseFloat(getComputedStyle(lastMessage).height.split('px')[0]);
          messagesElement = document.querySelector('#messages');
          const { scrollHeight, scrollTop, clientHeight } = messagesElement;
          if(this.allMessages.length > 8) return messagesElement.scrollTo({ top: scrollHeight, behavior: 'smooth' });
          if(scrollHeight - (scrollTop + lastMessageHeight) == clientHeight) messagesElement.scrollTo({ top: scrollHeight, behavior: 'smooth' });
          return;
        }
        this.allMessages.push(newMessage);
      });

      socket.on('editedMessage', async ({ id, newContent }) => {
        const { key } = this;

        await new Promise(resolve => {
          this.setMessages(this.messages.map(message => message.id == id ? ({ ...message, content: decrypt(newContent, key), edited: true }) : message));
          this.updateMessages = !this.updateMessages;
          resolve();
        });

        messagesElement = document.querySelector('#messages');
        messagesElement?.scrollTo({ top: messagesElement.scrollHeight });
      });

      socket.on('removeMessage', id => {
        this.setMessages(this.messages.filter(message => message.id != id));
      });
    },
    methods: {
      async sendMessage() {
        let { message, key, files } = this;
        if(!message?.trim()) return this.error = 'Message cannot be empty!';
        if(!key) return this.error = 'Key cannot be empty!';
        if(key.length < 43) return this.error = 'Key must be 43 length or more!';
        this.error = null;
        this.sendingMessage = true;
        const { data: { success } } = await request.get('/');
        if(success == false) return this.logOut();

        message = encrypt(message, key);

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

        const CHUNK_SIZE = 1024 * 512, encryptedFiles = [];
        let chunks = [], children = [], treeItems = [];

        const appendChildrens = (folderType, { name, type, size, uuid }) => {
          children.push({ name, type, size, uuid });
          if(!treeItems.find(item => item.name == folderType)) treeItems = [...treeItems, { name: folderType, children }];
          else treeItems = treeItems.map(item => item.name == folderType ? ({ ...item, children: [...item.children, { uuid, size, name, type }] }) : item);
        }

        const uuids = await new Promise(resolve => {
          this.socket.emit('createFilesUpload', files.length, uuids => resolve(uuids));
        });
        
        for(let i = 0; i < files.length; i++) {
          let offset = 0, progress = [], fileUUID = uuids[i];

          const file = files[i];

          let { name, type, size } = file;

          this.currentUpload = name;

          const fileName = encrypt(name, key);
          const fileType = encrypt(type, key);
          size = encrypt(size, key);

          const fileContents = new Uint8Array(await file.arrayBuffer());
          const chunksLength = fileContents.length / CHUNK_SIZE;

          for(let i = 0; i < chunksLength; i++) {
            const sequenceNumber = offset / CHUNK_SIZE;
            const chunk = fileContents.slice(offset, i + 1 == chunksLength.toFixed(0) ? fileContents.length : offset + CHUNK_SIZE);
            const iv = crypto.getRandomValues(new Uint8Array(12));
            let encryptedChunk = await crypto.subtle.encrypt(
              {
                name: 'AES-GCM',
                iv
              },
              importedKey,
              chunk,
            );
            const percentage = fileContents.length < CHUNK_SIZE ? 100 : ((sequenceNumber / chunksLength.toFixed(0)) * 100).toFixed(0);
            if(!progress.includes(percentage)) {
              progress.push(percentage);
              this.progress = percentage;
            }
            encryptedChunk = appendBuffer(iv, encryptedChunk);
            await new Promise(resolve => {
              this.socket.emit('uploadChunk', { fileUUID, percentage, encryptedChunk }, () => resolve());
            });
            chunks.push(encryptedChunk);
            offset += CHUNK_SIZE;
          }

          progress = [];
          this.progress = 0;

          const FIXED_CHUNK_SIZE = CHUNK_SIZE + 28;

          const duplicatedChunkLengths = chunks.map(chunk => chunk.length).filter(chunk => chunk == FIXED_CHUNK_SIZE).length;
          let chunkLengths = chunks.map(chunk => chunk.length).filter(chunk => chunk != FIXED_CHUNK_SIZE);

          chunkLengths = [`${FIXED_CHUNK_SIZE}-${duplicatedChunkLengths}`].concat(chunkLengths);

          encryptedFiles.push({ uuid: fileUUID, fileName, fileType, chunks: chunkLengths });
          chunks = [];

          const obj = { name, type, size, uuid: fileUUID };
          if(type == 'text/plain') appendChildrens('TXT', obj);
          else if(type.startsWith('image')) appendChildrens('PICS', obj);
          else if(type.startsWith('video')) appendChildrens('VIDEOS', obj);
          else if(type.startsWith('audio')) appendChildrens('SOUNDS', obj);
          else if(type.startsWith('application/x-msdownload')) appendChildrens('EXECUTABLES', obj);
          else appendChildrens('OTHER', obj);
          children = [];
          this.setFiles(this.files.slice(1, this.files.length));
        }

        this.currentUpload = null;

        const fileDescriptions = treeItems.map(({ name, children }) => ({ name: encrypt(name, key), children: children.map(item => ({ ...item, type: encrypt(item.type, key), name: encrypt(item.name, key) })) }));

        const newMessage = await this.handleSendMessage({ message, files: encryptedFiles, fileDescriptions });

        this.message = null;
        this.sendingMessage = false;
        
        files = files.map((file, i) => {
          const { name, type } = file;
          const { uuid } = encryptedFiles[i];
          return { src: URL.createObjectURL(new File([file], name, { type })), name, uuid, type, notFetched: true };
        });

        const msg = { ...newMessage, files, edited: false, fileDescriptions: treeItems.map((treeItem, id) => ({ id, ...treeItem, children: treeItem.children.map(item => ({ ...item, size: decrypt(item.size, key) })) })), content: decrypt(newMessage.content, key) };

        await new Promise(resolve => {
          this.setMessages([...this.messages, msg]);
          this.allMessages.push(newMessage);
          resolve();
        });

        const messages = document.querySelector('#messages');
        if(messages) messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });

        this.focus('messageInput');
      },
      focus(ref) {
        this.$refs[ref].$refs.input.focus();
      },
      async pasteFromClipboard() {
        const clipboard = await navigator.clipboard.readText();
        if(!clipboard?.trim()) return this.$notify({
          text: 'Your clipboard is empty.',
          type: 'error'
        });
        if(clipboard.length < 43) return this.$notify({
          text: 'Key must be 43 characters long!',
          type: 'error'
        });
        if(clipboard == this.key) return this.$notify({
          text: 'Key inserted from clipboard.',
          type: 'success'
        });
        try {
          await crypto.subtle.importKey(
            'jwk',
            {
              kty: 'oct',
              k: clipboard,
              alg: 'A256GCM',
              ext: true,
            },
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
          );
        } catch {
          return this.$notify({
            text: 'Invalid AES key!',
            type: 'error'
          });
        }
        this.key = clipboard;
        await this.setQR(clipboard);
        this.keyChange();
        return this.$notify({
          text: 'Key inserted from clipboard.',
          type: 'success'
        });
      },
      async onScannerInit(promise) {
        try {
          this.scannerLoading = true;
          await promise;
          this.scannerLoading = false;
        } catch (e) {
          const name = e?.name;
          if (name == 'NotAllowedError') this.$notify({ text: 'Camera access permission denied!', type: 'error' });
          else if (name == 'NotFoundError') this.$notify({ text: 'No suitable camera device installed!', type: 'error' });
          else if (name == 'NotSupportedError') this.$notify({ text: 'Page is not served over HTTPS nor localhost!', type: 'error' });
          else if (name == 'NotReadableError') this.$notify({ text: 'Your camera might be already in use!', type: 'error' });
          else if (name == 'OverconstrainedError') this.$notify({ text: 'You requested the front camera although there is none!', type: 'error' });
          else if (name == 'StreamApiNotSupportedError') this.$notify({ text: 'Your browser seems to be lacking features!', type: 'error' });
          else this.$notify({ text: 'Unknown camera error!', type: 'error' });
          this.showScanner = false;
        } finally {
          this.scannerLoading = false;
        }
      },
      async onDecode(decodedKey) {
        if(this.key == decodedKey) {
          this.$notify({
            text: 'QR Code key is same as your current key.',
            type: 'info'
          });
          return this.showScanner = false;
        }
        this.showScanner = false;
        this.key = decodedKey;
        await this.setQR(decodedKey);
        this.keyChange();
        this.$notify({
          text: 'Successfully inserted the key.',
          type: 'success'
        });
      },
      fileDrop({ items, files }) {
        if(!items) files = [...files];
        else files = [...items].filter(item => item.kind == 'file').map(file => file.getAsFile());
        this.setFiles(files);
      },
      fileDragOver(e) {
        e.preventDefault();
      },
      async keyChange() {
        const { key } = this;
        if(!key) return this.error = 'Key cannot be empty!';
        if(key.length < 43) return this.error = 'Key must be 43 length or more!';

        this.error = null;

        const previousKey = localStorage.getItem('key');

        localStorage.setItem('key', key);

        let tempMessages = [];

        await new Promise(async resolve => {
          for(const message of this.allMessages) {
            let { content, fileDescriptions } = message;
            content = decrypt(content, key);

            if(content) {
              fileDescriptions = fileDescriptions.map(({ name, children }, id) => ({ id, name: decrypt(name, key), children: children.map(item => ({ ...item, size: decrypt(item.size, key), type: decrypt(item.type, key), name: decrypt(item.name, key) })) }));

              const obj = { ...message, content, files: [], fileDescriptions };
              
              tempMessages.push(obj);
            }
          }
          this.setMessages(tempMessages);
          tempMessages = [];
          resolve();
        });

        const messages = document.querySelector('#messages');
        if(messages) messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
      },
      changeCheckbox() {
        localStorage.setItem('keyFieldDisabled', this.keyFieldDisabled);
      },
      async setQR(data) {
        this.qrCode = null;
        const qr = await qrcode.toDataURL(data, { margin: 2, width: 148 });
        this.qrCode = qr;
      },
      async generateNewKey() {
        const { data: { success } } = await request.get('/');
        if(success == false) return this.logOut();
        const AES_KEY = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
        const { k } = await crypto.subtle.exportKey('jwk', AES_KEY);
        this.key = k;
        await this.setQR(k);
        this.keyChange();
        this.copyToClipboard();
      },
      async copyToClipboard() {
        await navigator.clipboard.writeText(this.key);
        this.$notify({
          text: 'Copied your key to the clipboard.',
          type: 'success'
        });
      },
      async logout() {
        await this.handleLogout();
      },
      ...mapActions(['handleGetMessages', 'handleSendMessage', 'handleLogout', 'logOut']),
      ...mapMutations(['setFiles', 'setTempDecryptedFiles', 'setMessages', 'setLoading'])
    },
    computed: {
      ...mapState(['user', 'socket', 'files', 'tempDecryptedFiles', 'messages', 'pathFrom', 'loading']),
      files: {
        get() {
          return this.$store.state.files;
        },
        set(files) {
          this.$store.commit('setFiles', files);
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  #dashboard {
    width: 1000px;
  }

  .alert_error {
    color: #FFF !important;
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
    width: 270px;
    text-align: center;
    max-width: 100%;
  }

  .paste__clipboard__btn, .copy__key__btn, .generate__key__btn, .scan__qr__btn {
    max-width: 100%;
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

  @media screen and (max-width: 445px) {
    .paste__clipboard__btn, .generate__key__btn {
      width: 100%;
    }
    .generate__key__btn {
      margin: 12px 0 0 0 !important;
    }
  }

  @media screen and (max-width: 340px) {
    #outer__files__input {
      display: flex;
    }
    .send_message_form, #files__text {
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
  }

  @media screen and (max-width: 265px) {
    .paste__clipboard__btn, .copy__key__btn, .generate__key__btn, .scan__qr__btn {
      font-size: 5vw;
    }
    .generate__key__btn {
      font-size: 4.5vw;
    }
    .scan__qr__btn {
      font-size: 4vw;
    }
    .copy__key__btn {
      margin-top: 20px;
      margin-left: 0 !important;
      width: 100% !important;
    }
    .key__flex {
      display: block !important;
    }
  }
</style>