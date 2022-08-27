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

const store = new Vuex.Store({
  state: {
    user: null,
    newUser: null,
    socket: null,
    path: null,
    files: [],
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
    }
  },
  actions: {
    initSocket({ commit }, user) {
      const socket = io(process.env.VUE_APP_BACKEND, { withCredentials: true });
      commit('setUser', user);
      commit('setSocket', socket);
      socket.emit('connectUser');
    },
    async getDashboard({ state, commit, dispatch }) {
      const { data: { user, success } } = await request.get('/');
      if(success == false && state.path != 'Register' && state.path != 'Login') {
        router.push('/login');
        commit('setSocket', null);
        return commit('setUser', null);
      }
      if(success && !state.user) dispatch('initSocket', user);
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
    async handleLogout({ state, commit }) {
      await request.delete('/logout');
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
      const { data: { messages } } = await request.get('/messages');
      return messages.map(message => ({ ...message, files: [] }));
    },
    async handleShowFiles({ state }, { messageId, importedKey, key }) {
      const { data: files } = await request.get(`/getFiles/${messageId}`);
      const decryptedFiles = [];
      for(let file of files) {
        let { encrypted_content, iv, fileName, fileType } = file;
        const name = decrypt(fileName, key);
        const type = decrypt(fileType, key);
        encrypted_content = new Uint8Array(encrypted_content.data);
        iv = new Uint8Array(iv.data);
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, importedKey, encrypted_content);
        decryptedFiles.push({ src: URL.createObjectURL(new File([decrypted], name, { type })), name, type });
      }
      return decryptedFiles;
    },
    async handleSendMessage({ state }, { message, files }) {
      const newMessage = await new Promise(async resolve => {
        state.socket.emit('newMessage', { message, files }, newMessage => resolve(newMessage));
      });
      return newMessage;
    }
  },
  getters: {

  }
});

export default store;