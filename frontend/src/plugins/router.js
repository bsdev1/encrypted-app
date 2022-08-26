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
]

const router = new Router({
  routes,
  mode: 'history'
});

router.beforeEach((to, from, next) => {
  store.commit('setPath', to.name);
  next();
});

export default router;