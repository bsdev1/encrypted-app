import Vue from 'vue';
import Router from 'vue-router';
import store from './store';
import VueMeta from 'vue-meta';

Vue.use(Router)
  .use(VueMeta);

const route = (name, path) => ({
  name,
  path,
  component: () => import(`@/components/${name}`)
});

const routes = [
  route('Dashboard', '/'),
  route('Login', '/login'),
  route('Register', '/register'),
  { path: '*', redirect: { name: 'Dashboard' } }
];

const router = new Router({
  routes,
  mode: 'history'
});

router.beforeEach(({ name: toName }, { name: fromName }, next) => {
  store.commit('setLoading', true);
  store.commit('setPath', toName);
  store.commit('setPathFrom', fromName);
  next();
});

export default router;