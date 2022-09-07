import Vue from 'vue';
import Router from 'vue-router';
import store from './store';

Vue.use(Router);

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

router.beforeEach((to, from, next) => {
  store.commit('setLoading', true);
  store.commit('setPath', to.name);
  store.commit('setPathFrom', from.name);
  next();
});

export default router;