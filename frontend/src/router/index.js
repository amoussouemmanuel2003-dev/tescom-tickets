import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AuthLayout from '../layouts/AuthLayout.vue';
import MainLayout from '../layouts/MainLayout.vue';

import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue';
import TicketsListView from '../views/TicketsListView.vue';
import TicketCreateView from '../views/TicketCreateView.vue';
import TicketDetailView from '../views/TicketDetailView.vue';
import ClientsListView from '../views/ClientsListView.vue';
import ClientDetailView from '../views/ClientDetailView.vue';
import UsersListView from '../views/UsersListView.vue';
import ProfileView from '../views/ProfileView.vue';

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: LoginView,
        meta: { guestOnly: true, title: 'Connexion' },
      },
      {
        path: 'register',
        name: 'register',
        component: RegisterView,
        meta: { title: 'Inscription client' },
      },
    ],
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: {
          requiresAuth: true,
          roles: ['admin', 'employe', 'technicien', 'client'],
          title: 'Tableau de bord',
        },
      },
      {
        path: 'tickets',
        name: 'tickets',
        component: TicketsListView,
        meta: {
          requiresAuth: true,
          roles: ['admin', 'employe', 'technicien', 'client'],
          title: 'Liste des tickets',
        },
      },
      {
        path: 'tickets/nouveau',
        name: 'ticket-create',
        component: TicketCreateView,
        meta: {
          requiresAuth: true,
          roles: ['admin', 'employe', 'client'],
          title: 'Créer un ticket',
        },
      },
      {
        path: 'tickets/:id',
        name: 'ticket-detail',
        component: TicketDetailView,
        meta: {
          requiresAuth: true,
          roles: ['admin', 'employe', 'technicien', 'client'],
          title: 'Détail du ticket',
        },
      },
      {
        path: 'clients',
        name: 'clients',
        component: ClientsListView,
        meta: {
          requiresAuth: true,
          roles: ['admin', 'employe'],
          title: 'Gestion des clients',
        },
      },
      {
        path: 'clients/:id',
        name: 'client-detail',
        component: ClientDetailView,
        meta: {
          requiresAuth: true,
          roles: ['admin', 'employe'],
          title: 'Détail du client',
        },
      },
      {
        path: 'utilisateurs',
        name: 'users',
        component: UsersListView,
        meta: {
          requiresAuth: true,
          roles: ['admin'],
          title: 'Gestion des utilisateurs',
        },
      },
      {
        path: 'profil',
        name: 'profile',
        component: ProfileView,
        meta: {
          requiresAuth: true,
          roles: ['admin', 'employe', 'technicien', 'client'],
          title: 'Mon profil',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (authStore.token && !authStore.initialized) {
    await authStore.fetchMe();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'dashboard' };
  }

  if (to.meta.roles && !to.meta.roles.includes(authStore.role)) {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;
