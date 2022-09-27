import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import router from './plugins/router';
import store from './plugins/store';
import mdi from 'mdi-vue/v2';
import * as icons from '@mdi/js';
import notifications from 'vue-notification';
import QRScanner from 'vue-qrcode-reader';

Vue.use(notifications)
  .use(mdi, { icons })
  .use(QRScanner);

new Vue({
  store,
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app');