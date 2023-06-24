import Vue from 'vue';
import Router from 'vue-router';
import store from './store';
import VueMeta from 'vue-meta';
import { request } from './utils';

Vue.use(Router).use(VueMeta);

const route = (name, path, param) => ({
  name,
  path,
  component: () => import(`@/components/${name}`),
  props: ({ params }) => {
    const userId = params[param];
    if (userId) return { userId };
  },
});

const routes = [
  route('Dashboard', '/'),
  route('Login', '/login'),
  route('Register', '/register'),
  { path: '*', redirect: { name: 'Dashboard' } },
];

const router = new Router({
  routes,
  mode: 'history',
});

router.beforeEach(async ({ name: toName }, { name: fromName }, next) => {
  store.commit('setLoading', true);

  if (!store.state.allowApiRequest) {
    console.log(`%c Prevent unnecessary request `, 'background-color: green');
    store.commit('setAllowApiRequest', true);
    return next();
  }

  if (!store.state.user && toName == 'Dashboard' && fromName == 'Login') {
    console.log(
      `%c To ${toName} from ${fromName} - local user doesn't exist `,
      'background-color: green'
    );
    store.commit('setLoading', false);
    return next('/login');
  }

  if (
    fromName == 'Dashboard' &&
    (toName == 'Login' || toName == 'Register') &&
    store.state.user
  ) {
    console.log(
      `%c From ${fromName} to ${toName} - local user exists `,
      'background-color: green'
    );
    store.commit('setLoading', false);
    return next('/');
  }

  if (
    !store.state.user &&
    fromName == 'Dashboard' &&
    (toName == 'Login' || toName == 'Register')
  ) {
    console.log(
      `%c From ${fromName} to ${toName} - local user doesn't exist `,
      'background-color: green'
    );
    return next();
  }

  if (
    !store.state.user &&
    ((fromName == 'Login' && toName == 'Register') ||
      (fromName == 'Register' && toName == 'Login'))
  ) {
    console.log(
      `%c From ${fromName} to ${toName} - local user doesn't exist `,
      'background-color: green'
    );
    return next();
  }

  try {
    const {
      data: { user, success },
    } = await request.get('/');

    store.commit('setLoading', true);

    if (toName == 'Dashboard' && user && !store.state.user) {
      console.log(
        `%c To ${toName} - api user authenticated - local user doesn't exist `,
        'background-color: green'
      );
      store.dispatch('initSocket', user);
      return next();
    }

    if (success == false && toName == 'Dashboard') {
      console.log(
        `%c To ${toName} - user not authenticated `,
        'background-color: green'
      );
      store.commit('setAllowApiRequest', false);
      return next('/login');
    }

    if ((toName == 'Login' || toName == 'Register') && user) {
      console.log(
        `%c To ${toName} - user authenticated`,
        'background-color: green'
      );
      if (!store.state.user) store.dispatch('initSocket', user);
      store.commit('setAllowApiRequest', false);
      return next('/');
    }

    if (!store.state.user && toName == 'Dashboard') {
      console.log(
        `%c To ${toName} - local user doesn't exist`,
        'background-color: green'
      );
      return next('/login');
    }

    next();
  } catch {
    store.commit('setLoading', false);
    store.commit('setGlobalError', 'Internal server error');
  }
});

export default router;
