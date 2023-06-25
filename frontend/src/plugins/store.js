import Vue from 'vue';
import Vuex from 'vuex';
import io from 'socket.io-client';
import router from './router';
import { request, decrypt, concatArrayBuffers } from '@/plugins/utils';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    user: null,
    newUser: null,
    socket: null,
    currentMessage: null,
    currentFetchedFile: null,
    currentEditedMessageId: null,
    currentPage: null,
    globalError: null,
    sendMessageError: null,
    loading: false,
    messageUpdate: false,
    loadingNewMessages: false,
    allowRequestMessages: true,
    nukeDialogOpen: false,
    nukeKeyDialogOpen: false,
    allowApiRequest: true,
    selectedTime: localStorage.getItem('selectedExpirationTime') ?? '3h',
    currentParentDownloadPercent: 0,
    sitekey: process.env.VUE_APP_SITE_KEY,
    files: [],
    tempDecryptedFiles: [],
    messages: [],
    fetchingFiles: {
      type: null,
      running: false,
    },
    currentDownload: {
      messageId: null,
      percentage: 0,
    },
  },
  mutations: {
    setNewUser(state, newUser) {
      state.newUser = newUser;
    },
    setUser(state, user) {
      state.user = user;
    },
    setSocket(state, socket) {
      state.socket = socket;
    },
    setFiles(state, files) {
      state.files = files;
    },
    setTempDecryptedFiles(state, tempDecryptedFiles) {
      state.tempDecryptedFiles = tempDecryptedFiles;
    },
    setCurrentMessage(state, currentMessage) {
      state.currentMessage = currentMessage;
    },
    setFetchingFiles(state, obj) {
      state.fetchingFiles = obj;
    },
    setCurrentFetchedFile(state, currentFetchedFile) {
      state.currentFetchedFile = currentFetchedFile;
    },
    setMessages(state, messages) {
      state.messages = messages;
    },
    setCurrentDownloadMessage(state, messageId) {
      state.currentDownload.messageId = messageId;
    },
    setCurrentDownloadPercentage(state, percentage) {
      state.currentDownload.percentage = percentage;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
    setCurrentEditedMessageId(state, id) {
      state.currentEditedMessageId = id;
    },
    setPrivateKey(state, privateKey) {
      state.privateKey = privateKey;
    },
    setGlobalError(state, globalError) {
      state.globalError = globalError;
    },
    setCurrentPage(state, currentPage) {
      state.currentPage = currentPage;
    },
    updateMessage(state) {
      state.messageUpdate = !state.messageUpdate;
    },
    setLoadingNewMessages(state, loadingNewMessages) {
      state.loadingNewMessages = loadingNewMessages;
    },
    setCurrentParentDownloadPercent(state, percent) {
      state.currentParentDownloadPercent = percent;
    },
    setAllowRequestMessages(state, allowRequestMessages) {
      state.allowRequestMessages = allowRequestMessages;
    },
    setAllowApiRequest(state, allowApiRequest) {
      state.allowApiRequest = allowApiRequest;
    },
    setNukeDialogOpen(state, nukeDialogOpen) {
      state.nukeDialogOpen = nukeDialogOpen;
    },
    setNukeKeyDialogOpen(state, nukeKeyDialogOpen) {
      state.nukeKeyDialogOpen = nukeKeyDialogOpen;
    },
    setSendMessageError(state, sendMessageError) {
      state.sendMessageError = sendMessageError;
    },
    setSelectedTime(state, selectedTime) {
      state.selectedTime = selectedTime;
    },
  },
  actions: {
    async initSocket({ commit }, user) {
      const socket = io(process.env.VUE_APP_BACKEND, {
        withCredentials: true,
        autoConnect: false,
      });

      commit('setSocket', socket);
      commit('setUser', user);

      socket.on('connect', async () => {
        socket.emit('join', () => {
          console.log('Connection established.');
        });
      });

      socket.on('disconnect', () => {
        console.log('disconnected');

        if (this.user) socket.connect();
      });

      socket.io.on('reconnect_attempt', (attempt) => {
        console.log(attempt);
      });

      socket.on('connect_error', (err) => {
        console.log(err);
      });

      socket.connect();
    },
    async handleNukeCurrentKeyMessages() {},
    async handleNukeAllMessages({ state, dispatch, commit }) {
      const {
        data: { success },
      } = await request.delete('/messages/nuke');

      if (success == false) return dispatch('logOut');

      state.socket.emit('nukeAllMessages', () => {
        Vue.notify({
          text: 'Successfully nuked all messages.',
          type: 'success',
        });

        commit('setMessages', []);
        commit('setNukeDialogOpen', false);
      });
    },
    async handleLogin(
      { state, commit, dispatch },
      { username, password, token }
    ) {
      const {
        data: { errorMessage, user },
      } = await request.post('/login', { username, password, token });

      if (errorMessage) return { errorMessage };

      commit('setAllowApiRequest', false);

      if (!state.user) {
        await dispatch('initSocket', user);
        router.push('/');
      }

      return {};
    },
    async handleLogout({ dispatch }) {
      await request.delete('/logout');
      dispatch('logOut');
    },
    logOut({ state, commit }) {
      if (!state.user) return router.push('/login');

      commit('setUser', null);
      commit('setCurrentFetchedFile', null);

      state.socket.disconnect();
      commit('setSocket', null);

      router.push('/login');

      return { unauthorized: true };
    },
    async handleRegister({ commit }, { username, password, token }) {
      const {
        data: { errors, newUser },
      } = await request.post('/register', {
        username,
        password,
        token,
      });

      if (errors) return { errors };

      commit('setNewUser', newUser);
      router.push('/login');

      return {};
    },
    async handleGetMessages({ commit, dispatch }, page = 1) {
      commit('setCurrentPage', page);

      const {
        data: { isLastPagination, messages, messagesCount, success },
      } = await request.get(`/messages?page=${page}`);

      if (success == false) return dispatch('logOut');

      return {
        isLastPagination,
        messagesCount,
        messages: messages.map((message) => ({ ...message, files: [] })),
      };
    },
    async handleFetchFiles(
      { state, commit, dispatch },
      { messageId, importedKey }
    ) {
      const key = localStorage.getItem('key');

      let percent = 0;
      let total = 0;

      const message = state.messages.find((message) => message.id == messageId);

      const messageFilesIds = message.files.map((file) => file.uuid);

      const children = message.fileDescriptions
        .map((fileDescription) => fileDescription.children)
        .flat()
        .filter((child) => !messageFilesIds.includes(child.uuid));

      commit('setCurrentFetchedFile', children[0].uuid);

      let {
        data: { files, success },
      } = await request.get(`/getFiles/${messageId}`);

      if (success == false) return dispatch('logOut');

      if (!files.length) {
        Vue.notify({
          text: 'File(s) not found!',
          type: 'error',
        });

        return [];
      }

      files = files.filter((file) => !messageFilesIds.includes(file.uuid));

      commit('setCurrentMessage', messageId);

      let percentages = [],
        decryptedChunks = [];

      await new Promise(async (resolve) => {
        state.socket.on(
          'chunk',
          async ({
            iv,
            encrypted,
            percentage,
            messageId,
            finished,
            fileName,
            fileType,
            uuid,
          }) => {
            const decrypted = await crypto.subtle.decrypt(
              { name: 'AES-GCM', iv },
              importedKey,
              encrypted
            );

            decryptedChunks.push(decrypted);
            state.socket.emit('done', uuid);

            if (!finished) {
              if (!percentages.includes(percentage)) {
                percentages.push(percentage);
                if (state.currentDownload.messageId != messageId)
                  commit('setCurrentDownloadMessage', messageId);

                if (percentage > 0) {
                  total += percentage - percent;

                  const totalPercent = (
                    (total / (100 * files.length)) *
                    100
                  ).toFixed();

                  commit('setCurrentParentDownloadPercent', totalPercent);
                }

                commit('setCurrentDownloadPercentage', percentage);

                percent = percentage;
              }

              if (state.currentFetchedFile != uuid)
                commit('setCurrentFetchedFile', uuid);

              return;
            }

            total += 100 - percent;

            const totalPercent = (
              (total / (100 * files.length)) *
              100
            ).toFixed();

            commit('setCurrentParentDownloadPercent', totalPercent);

            percentages = [];

            const name = decrypt(fileName, key);
            const type = decrypt(fileType, key);
            const file = new File([concatArrayBuffers(decryptedChunks)], name, {
              type,
            });

            const src = URL.createObjectURL(file);

            commit('setTempDecryptedFiles', [
              ...state.tempDecryptedFiles,
              { uuid, src, name, type, fileSize: file.size },
            ]);

            decryptedChunks = [];

            if (state.tempDecryptedFiles.length == files.length) {
              commit('setCurrentDownloadPercentage', 0);
              resolve();
            }
          }
        );

        for (const { uuid } of files) {
          await new Promise((secondResolve) => {
            state.socket.emit('getChunks', uuid, async (error) => {
              if (error == 404) {
                commit('setFetchingFiles', false);

                dispatch('handleFileNotFound', { messageId, uuid });

                files = files.filter((file) => file.uuid != uuid);
              }

              if (files.length) return secondResolve();

              resolve();
              secondResolve();
            });
          });
        }
      });

      commit('setCurrentFetchedFile', null);

      state.socket.off('chunk');

      return { files: state.tempDecryptedFiles };
    },
    async handleFetchFile(
      { state, commit, dispatch },
      { messageId, uuid, importedKey }
    ) {
      const key = localStorage.getItem('key');

      commit('setCurrentMessage', messageId);

      let percentages = [],
        decryptedChunks = [];

      await new Promise((resolve) => {
        state.socket.on(
          'chunk',
          async ({
            iv,
            encrypted,
            percentage,
            messageId,
            finished,
            fileName,
            fileType,
            uuid,
          }) => {
            const decrypted = await crypto.subtle.decrypt(
              { name: 'AES-GCM', iv },
              importedKey,
              encrypted
            );

            decryptedChunks.push(decrypted);
            state.socket.emit('done', uuid);

            if (!finished) {
              if (!percentages.includes(percentage)) {
                percentages.push(percentage);
                if (state.currentDownload.messageId != messageId)
                  commit('setCurrentDownloadMessage', messageId);
                commit('setCurrentDownloadPercentage', percentage);
              }
              return;
            }

            const name = decrypt(fileName, key);
            const type = decrypt(fileType, key);
            const file = new File([concatArrayBuffers(decryptedChunks)], name, {
              type,
            });
            const src = URL.createObjectURL(file);

            commit('setTempDecryptedFiles', [
              ...state.tempDecryptedFiles,
              { uuid, src, name, type, fileSize: file.size },
            ]);

            commit('setCurrentDownloadPercentage', 0);

            percentages = [];
            decryptedChunks = [];

            resolve();
          }
        );

        state.socket.emit('getChunks', uuid, (error) => {
          if (error == 404) {
            dispatch('handleFileNotFound', { messageId, uuid });

            commit('setCurrentMessage', null);
            commit('setCurrentFetchedFile', null);

            return resolve();
          }
        });
      });

      commit('setCurrentFetchedFile', null);

      state.socket.off('chunk');
      return state.tempDecryptedFiles;
    },
    handleFileNotFound({ state }, { messageId, uuid }) {
      const message = state.messages.find((message) => message.id == messageId);

      const children = message.fileDescriptions
        .map((fileDescription) => fileDescription.children)
        .flat();

      const childFile = children.find((child) => child.uuid == uuid);

      Vue.set(childFile, 'notFound', true);

      Vue.notify({
        text: 'File(s) not found!',
        type: 'error',
      });
    },
    async handleExportChat({ dispatch }, key) {
      const {
        data: { messages, success },
      } = await request.get('/messages?page=all');

      if (success == false) return dispatch('logOut');

      let html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width,initial-scale=1.0" />
          <title>Exported Messages</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              color: #FFF;
              background-color: #151515;
              font-family: Arial;
            }

            h2 {
              text-align: center;
              margin: 20px 0;
            }

            #messages {
              padding: 15px;
              overflow-y: auto;
              max-height: 90vh;
              width: 80vw;
              margin: auto;
            }

            .message {
              background-color: #252525;
              padding: 12px;
              border-radius: 5px;
              margin-bottom: 10px;
            }

            .content {
              margin-top: 2px;
              font-size: 15px;
            }

            a {
              color: #2196f3;
            }
          </style>
        </head>
        <body>
          <h2 id="totalMessages"></h2>
          <div id="messages">
      `;

      for (let { content, createdAt } of messages) {
        content = decrypt(content, key);

        if (content) {
          const message = `<div class="message">
            <div class="date">${createdAt}</div>
            <div class="content">${Vue.prototype.$sanitizeHTML(
              Vue.prototype.$anchors({
                input: content,
                options: { attributes: { target: '_blank' } },
              })
            )}</div>
          </div>`;

          html += message;
        }
      }

      html += `</div>
          <script>
            const getNormalizedDate = (date) => {
              const dateObject = new Date(date);
            
              const fullDate = new Intl.DateTimeFormat(undefined, {
                dateStyle: 'full',
              }).format(dateObject);
            
              const dateHMS = new Intl.DateTimeFormat(undefined, {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true,
              }).format(dateObject);
            
              return dateHMS + ', ' + fullDate;
            };

            messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" });
            totalMessages.innerText = 'Total Messages (${
              document.querySelectorAll('.message').length
            })';

            const dates = document.querySelectorAll('.date');

            for(const date of dates) {
              date.innerText = getNormalizedDate(date.innerText);
            }
          </script>
        </body>
      </html>`;

      const result = new Blob([html], { type: 'text/html' });

      const blobUrl = URL.createObjectURL(result);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'messages.html';
      document.body.append(link);
      link.click();
      link.remove();
    },
    async handleSendMessage(
      { state },
      { message, files, fileDescriptions, expire }
    ) {
      const newMessage = await new Promise(async (resolve) => {
        state.socket.emit(
          'newMessage',
          { message, edited: false, files, fileDescriptions, expire },
          (newMessage) => resolve(newMessage)
        );
      });

      return newMessage;
    },
    async handleEditMessage({ dispatch }, { id, editMessageContent }) {
      const {
        data: { error, success },
      } = await request.patch(`/editMessage/${id}`, { editMessageContent });

      if (success == false) return dispatch('logOut');

      return { error };
    },
    async handleRemoveMessage({ commit, dispatch }, id) {
      commit('setSendMessageError', null);

      const {
        data: { error, success },
      } = await request.delete(`/removeMessage/${id}`);

      if (success == false) return dispatch('logOut');

      return { error };
    },
  },
  getters: {},
});

export default store;
