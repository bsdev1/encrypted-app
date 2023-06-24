import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import router from './plugins/router';
import store from './plugins/store';
import mdi from 'mdi-vue/v2';
import * as icons from '@mdi/js';
import notifications from 'vue-notification';
import QRScanner from 'vue-qrcode-reader';
import filesize from 'filesize';
import { EXPIRE_TIMES, msToReadeableTime } from '@shared/constants';
import anchors from 'anchorme';
import sanitizeHTML from 'xss';

Vue.use(notifications).use(mdi, { icons }).use(QRScanner);

Vue.config.productionTip = false;
Vue.config.devtools = false;

Vue.prototype.$filesize = filesize;
Vue.prototype.$EXPIRE_TIMES = EXPIRE_TIMES;
Vue.prototype.$anchors = anchors;
Vue.prototype.$sanitizeHTML = sanitizeHTML;

const objHMS = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true,
});

const objDate = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'full',
});

Vue.prototype.$getNormalizedDate = (date) => {
  const dateObject = new Date(date);

  const dateString = objDate.format(dateObject);
  const dateHMS = objHMS.format(dateObject);

  return `${dateHMS}, ${dateString}`;
};

Vue.prototype.$isFirefox = () => {
  return (
    navigator.userAgent.indexOf('Firefox') != -1 &&
    !navigator.userAgent.includes('Seamonkey')
  );
};

Vue.prototype.$sayHello = () => {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  if (currentHour >= 5 && currentHour < 12) return 'Good Morning.';
  else if (currentHour >= 12 && currentHour < 18) return 'Good Afternoon.';
  else return 'Good Evening.';
};

Vue.prototype.$getExpireProgress = (startDate, endDate) => {
  const total = +new Date(endDate + 60000) - +new Date(startDate);
  const elaps = Date.now() - new Date(startDate);
  return Math.round((elaps / total) * 100);
};

Vue.prototype.$msToReadeableTime = msToReadeableTime;

new Vue({
  store,
  vuetify,
  router,
  render: (h) => h(App),
}).$mount('#app');
