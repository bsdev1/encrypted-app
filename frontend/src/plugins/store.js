import Vue from 'vue';
import Vuex from 'vuex';
import io from 'socket.io-client';
import axios from 'axios';
import router from './router';
import cryptoJS from 'crypto-js';
const request = axios.create({
  baseURL: `${process.env.VUE_APP_BACKEND}/api`,
  withCredentials: true
});

const fileRequest = axios.create({
  baseURL: process.env.VUE_APP_BACKEND,
  withCredentials: true
});

Vue.use(Vuex);

function decrypt(data, decryptKey) {
  try {
    const dataBytes = cryptoJS.AES.decrypt(data.toString(), decryptKey);
    const decryptedData = dataBytes.toString(cryptoJS.enc.Utf8);
    if(decryptedData) return JSON.parse(decryptedData);
  } catch {
    return null;
  }
}

function concatArrayBuffers(bufs) {
  let offset = 0, bytes = 0;
  bufs.map(buf => {
    bytes += buf.byteLength;
    return buf;
  });

  var buffer = new ArrayBuffer(bytes);
  var store = new Uint8Array(buffer);

  bufs.forEach(buf => {
    store.set(new Uint8Array(buf.buffer || buf, buf.byteOffset), offset);
    offset += buf.byteLength;
  });

  return buffer;
}

const store = new Vuex.Store({
  state: {
    user: null,
    newUser: null,
    socket: null,
    path: null,
    currentMessage: null,
    currentFetchedFile: null,
    currentMultiple: null,
    files: [],
    tempDecryptedFiles: [],
    messages: [],
    fetchingFiles: {
      type: null,
      running: false
    },
    currentDownload: {
      messageId: null,
      percentage: 0
    },
    loading: false,
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
    setPath(state, path) {
      state.path = path;
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
    setCurrentMultiple(state, currentMultiple) {
      state.currentMultiple = currentMultiple;
    },
    setLoading(state, loading) {
      state.loading = loading;
    }
  },
  actions: {
    async initSocket({ commit }, user) {
      const socket = io(process.env.VUE_APP_BACKEND, { withCredentials: true, autoConnect: false });

      commit('setUser', user);
      commit('setSocket', socket);
      
      socket.on('connect', () => {
        console.log('connected');
        commit('setLoading', false);
        socket.emit('connectUser');
      });
      
      socket.on('disconnect', () => {
        console.log('disconnected');
        socket.connect();
      });
      
      socket.connect();

      if('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });
          if (registration.installing) {
            console.log('Service worker installing');
          } else if (registration.waiting) {
            console.log('Service worker installed');
          } else if (registration.active) {
            console.log('Service worker active');
          }
        } catch (error) {
          console.error(`Registration failed with ${error}`);
        }
      }
    },
    async getDashboard({ state, commit, dispatch }) {
      const { data: { user, success } } = await request.get('/');
      if(success == false && state.path != 'Login' && state.path != 'Register') {
        router.push('/login');
        commit('setSocket', null);
        return commit('setUser', null);
      }
      if(user && !state.user) {
        dispatch('initSocket', user);
        if(state.path == 'Login' || state.path == 'Register') return router.push('/');
      }
    },
    async handleLogin({ state, dispatch }, { username, password }) {
      const { data: { errorMessage, user } } = await request.post('/login', { username, password });
      if(errorMessage) return { errorMessage };
      if(!state.user) {
        await dispatch('initSocket', user);
        router.push('/');
      }
      return {};
    },
    async handleLogout({ dispatch }) {
      await request.delete('/logout');
      dispatch('logout');
    },
    logout({ state, commit }) {
      commit('setUser', null);
      state.socket.disconnect();
      commit('setSocket', null);
      router.push('/login');
    },
    async handleRegister({ commit }, { username, password }) {
      const { data: { errors, newUser } } = await request.post('/register', { username, password });
      if(errors) return { errors };
      commit('setNewUser', newUser);
      router.push('/login');
      return {};
    },
    async handleGetMessages() {
      const { data: { messages, success } } = await request.get('/messages');
      if(success == false) return dispatch('logout');
      return messages.map(message => ({ ...message, files: [] }));
    },
    async handleFetchFiles({ state, commit, dispatch }, { messageId, importedKey, key }) {
      let { data: { files, success } } = await request.get(`/getFiles/${messageId}`);
      if(success == false) return dispatch('logout');

      if(!files.length) return [];

      files = files.filter(file => file.uuid != state.currentFetchedFile);

      commit('setCurrentMessage', messageId);

      let chunks = [], percentages = [];

      await new Promise(async resolve => {
        state.socket.on('chunk', async ({ iv, encrypted, percentage, messageId, finished, fileName, fileType, uuid }) => {
          if(!finished) {
            if(!percentages.includes(percentage)) {
              percentages.push(percentage);
              if(state.currentDownload.messageId != messageId) commit('setCurrentDownloadMessage', messageId);
              commit('setCurrentDownloadPercentage', percentage);
            }
            if(state.setCurrentMultiple != uuid) commit('setCurrentMultiple', uuid);
            return chunks.push({ iv, encrypted });
          }
          const name = decrypt(fileName, key);
          const type = decrypt(fileType, key);
          if(chunks.length) {
            let decryptedChunks = [];
            for(const { iv, encrypted } of chunks) {
              const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, importedKey, encrypted);
              decryptedChunks.push(decrypted);
            }
            chunks = [];
            percentages = [];
            const file = new File([concatArrayBuffers(decryptedChunks)], name, { type });
            const src = URL.createObjectURL(file);
            commit('setTempDecryptedFiles', [...state.tempDecryptedFiles, { uuid, src, name, type, fileSize: file.size }]);
            if(state.tempDecryptedFiles.length == files.length) {
              commit('setCurrentDownloadPercentage', 0);
              resolve();
            }
          } else {
            chunks = [];
            percentages = [];
            const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, importedKey, encrypted);
            const file = new File([decrypted], name, { type });
            const src = URL.createObjectURL(file);
            commit('setTempDecryptedFiles', [...state.tempDecryptedFiles, { uuid, src, name, type, fileSize: file.size }]);
            if(state.tempDecryptedFiles.length == files.length) {
              commit('setCurrentDownloadPercentage', 0);
              resolve();
            }
          }
        });
  
        for(const { uuid } of files) {
          await new Promise(secondResolve => {
            state.socket.emit('getChunks', uuid, error => {
              if(error == 404) files = files.filter(file => file.uuid != uuid);
              if(files.length) return secondResolve();
              resolve();
              secondResolve();
            });
          });
        }
      });
    
      state.socket.off('chunk');
      return state.tempDecryptedFiles;
    },
    async handleFetchFile({ state, commit }, { messageId, uuid, importedKey, key }) {
      const { data: { success } } = await request.get('/');
      if(success == false) return dispatch('logout');
      commit('setCurrentMessage', messageId);
      commit('setCurrentFetchedFile', uuid);

      let chunks = [], percentages = [];

      await new Promise(resolve => {
        state.socket.on('chunk', async ({ iv, encrypted, percentage, messageId, finished, fileName, fileType, uuid }) => {
          if(!finished) {
            if(!percentages.includes(percentage)) {
              percentages.push(percentage);
              if(state.currentDownload.messageId != messageId) commit('setCurrentDownloadMessage', messageId);
              commit('setCurrentDownloadPercentage', percentage);
            }
            return chunks.push({ iv, encrypted, percentage });
          }
          const name = decrypt(fileName, key);
          const type = decrypt(fileType, key);
          if(chunks.length) {
            let decryptedChunks = [];
            for(const { iv, encrypted } of chunks) {
              const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, importedKey, encrypted);
              decryptedChunks.push(decrypted);
            }
            const file = new File([concatArrayBuffers(decryptedChunks)], name, { type });
            const src = URL.createObjectURL(file);
            commit('setTempDecryptedFiles', [...state.tempDecryptedFiles, { uuid, src, name, type, fileSize: file.size }]);
            commit('setCurrentDownloadPercentage', 0);
            chunks = [];
            percentages = [];
            resolve();
          } else {
            const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, importedKey, encrypted);
            const file = new File([decrypted], name, { type });
            const src = URL.createObjectURL(file);
            commit('setTempDecryptedFiles', [...state.tempDecryptedFiles, { uuid, src, name, type, fileSize: file.size }]);
            commit('setCurrentDownloadPercentage', 0);
            chunks = [];
            percentages = [];
            resolve();
          }
        });
        
        state.socket.emit('getChunks', uuid, error => {
          if(error == 404) {
            commit('setCurrentMessage', null);
            commit('setCurrentFetchedFile', null);
            return resolve();
          }
        });
      });

      state.socket.off('chunk');
      return state.tempDecryptedFiles;
    },
    async handleSendMessage({ state }, { message, files, fileDescriptions }) {
      const { data: { success } } = await request.get('/');
      if(success == false) return dispatch('logout');
      const newMessage = await new Promise(async resolve => {
        state.socket.emit('newMessage', { message, files, fileDescriptions }, newMessage => resolve(newMessage));
      });
      return newMessage;
    }
  },
  getters: {

  }
});

export default store;