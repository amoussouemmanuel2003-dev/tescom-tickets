<template>
  <div class="min-h-screen bg-slate-100 lg:flex">
    <!-- Overlay mobile -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
      @click="mobileMenuOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
      class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-100 transition-transform duration-200 lg:static lg:translate-x-0"
    >
      <div class="flex h-16 items-center justify-between border-b border-slate-800 px-5">
        <router-link to="/dashboard" class="text-lg font-bold tracking-wide text-white">
          TESCOM-CI
          <span class="block text-[11px] font-normal text-blue-300">Support &amp; Assistance</span>
        </router-link>
        <button
          type="button"
          class="rounded p-1 text-slate-300 hover:bg-slate-800 lg:hidden"
          @click="mobileMenuOpen = false"
        >
          ✕
        </button>
      </div>

      <nav class="flex-1 space-y-1 px-3 py-4">
        <router-link
          v-for="item in visibleNavItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition"
          :class="isActive(item.to) ? 'bg-blue-900 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
          @click="mobileMenuOpen = false"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="border-t border-slate-800 p-4">
        <button
          type="button"
          class="w-full rounded-lg bg-slate-800 px-3 py-2 text-left text-sm font-medium text-red-300 transition hover:bg-red-900/40 hover:text-red-200"
          @click="handleLogout"
        >
          Se déconnecter
        </button>
      </div>
    </aside>

    <!-- Contenu principal -->
    <div class="flex flex-1 flex-col">
      <header class="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:hidden"
            @click="mobileMenuOpen = true"
          >
            Menu
          </button>
          <span class="text-sm font-semibold text-slate-700">
            {{ routeTitle }}
          </span>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-right">
            <p class="text-sm font-semibold text-slate-900">{{ authStore.fullName }}</p>
            <p class="text-xs text-slate-500">{{ formatRole(authStore.role) }}</p>
          </div>
          <router-link
            to="/profil"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-white"
            title="Mon profil"
          >
            {{ initials }}
          </router-link>
        </div>
      </header>

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { formatRole } from '../utils/formatters';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const navItems = [
  { label: 'Tableau de bord', to: '/dashboard', roles: ['admin', 'employe', 'technicien', 'client'] },
  { label: 'Tickets', to: '/tickets', roles: ['admin', 'employe', 'technicien', 'client'] },
  { label: 'Nouveau ticket', to: '/tickets/nouveau', roles: ['admin', 'employe', 'client'] },
  { label: 'Clients', to: '/clients', roles: ['admin', 'employe'] },
  { label: 'Utilisateurs', to: '/utilisateurs', roles: ['admin'] },
  { label: 'Mon profil', to: '/profil', roles: ['admin', 'employe', 'technicien', 'client'] },
];

const visibleNavItems = computed(() =>
  navItems.filter((item) => item.roles.includes(authStore.role))
);

const routeTitle = computed(() => route.meta?.title || 'TESCOM-CI');

const initials = computed(() => {
  const p = authStore.user?.prenom?.[0] || '';
  const n = authStore.user?.nom?.[0] || '';
  return (p + n).toUpperCase() || 'U';
});

const isActive = (path) => {
  if (path === '/tickets') {
    return route.path === '/tickets' || (route.path.startsWith('/tickets/') && route.path !== '/tickets/nouveau');
  }
  return route.path === path || route.path.startsWith(`${path}/`);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
