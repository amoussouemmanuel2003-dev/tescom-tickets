<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p class="text-sm text-slate-500">
          Vue d'ensemble des tickets d'assistance ({{ formatRole(authStore.role) }})
        </p>
      </div>

      <router-link
        v-if="!authStore.isTechnicien"
        to="/tickets/nouveau"
        class="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
      >
        + Nouveau ticket
      </router-link>
    </div>

    <AlertMessage :message="errorMessage" type="error" />

    <div v-if="loading" class="rounded-xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
      Chargement des statistiques...
    </div>

    <template v-else-if="stats">
      <!-- Cartes principales -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total des tickets" :value="stats.total_tickets" tone="blue" />
        <StatCard title="Tickets ouverts" :value="stats.tickets_ouverts" tone="amber" />
        <StatCard title="Tickets résolus" :value="stats.tickets_resolus" tone="green" />
        <StatCard title="Tickets clôturés" :value="stats.tickets_clotures" tone="slate" />
      </div>

      <!-- Répartition par statut & priorité -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 class="text-base font-semibold text-slate-900">Tickets par statut</h2>
          <div class="mt-4 space-y-2.5">
            <div
              v-for="(count, statut) in stats.par_statut"
              :key="statut"
              class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
            >
              <StatusBadge :statut="statut" />
              <span class="text-sm font-bold text-slate-800">{{ count }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 class="text-base font-semibold text-slate-900">Tickets par priorité</h2>
          <div class="mt-4 space-y-2.5">
            <div
              v-for="(count, priorite) in stats.par_priorite"
              :key="priorite"
              class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
            >
              <PriorityBadge :priorite="priorite" />
              <span class="text-sm font-bold text-slate-800">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Derniers tickets -->
      <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 class="text-base font-semibold text-slate-900">Derniers tickets</h2>
          <router-link to="/tickets" class="text-sm font-semibold text-blue-900 hover:underline">
            Voir tous les tickets →
          </router-link>
        </div>

        <div v-if="stats.derniers_tickets.length === 0" class="p-6 text-center text-sm text-slate-500">
          Aucun ticket disponible pour le moment.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th class="px-4 py-3">Référence</th>
                <th class="px-4 py-3">Titre</th>
                <th class="px-4 py-3">Client</th>
                <th class="px-4 py-3">Priorité</th>
                <th class="px-4 py-3">Statut</th>
                <th class="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-for="t in stats.derniers_tickets" :key="t.id" class="hover:bg-slate-50">
                <td class="px-4 py-3 font-semibold text-blue-900">
                  <router-link :to="`/tickets/${t.id}`" class="hover:underline">
                    {{ t.reference }}
                  </router-link>
                </td>
                <td class="px-4 py-3 font-medium text-slate-800">{{ t.titre }}</td>
                <td class="px-4 py-3 text-slate-600">{{ t.nom_client }}</td>
                <td class="px-4 py-3"><PriorityBadge :priorite="t.priorite" /></td>
                <td class="px-4 py-3"><StatusBadge :statut="t.statut" /></td>
                <td class="px-4 py-3 text-slate-500">{{ formatDate(t.date_creation) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import dashboardService from '../services/dashboardService';
import { extractApiError } from '../services/api';
import { useAuthStore } from '../stores/auth';
import { formatDate, formatRole } from '../utils/formatters';
import StatCard from '../components/StatCard.vue';
import StatusBadge from '../components/StatusBadge.vue';
import PriorityBadge from '../components/PriorityBadge.vue';
import AlertMessage from '../components/AlertMessage.vue';

const authStore = useAuthStore();
const stats = ref(null);
const loading = ref(true);
const errorMessage = ref('');

onMounted(async () => {
  try {
    const res = await dashboardService.getStats();
    stats.value = res.data;
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Impossible de charger les statistiques.');
  } finally {
    loading.value = false;
  }
});
</script>
