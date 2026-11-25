<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Tickets d'assistance</h1>
        <p class="text-sm text-slate-500">Suivi et traitement des demandes d'assistance.</p>
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

    <!-- Filtres -->
    <div class="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
      <input
        v-model="filters.search"
        type="text"
        placeholder="Rechercher par référence ou titre..."
        class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
        @input="loadTickets"
      />

      <select
        v-model="filters.statut"
        class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
        @change="loadTickets"
      >
        <option value="">Tous les statuts</option>
        <option v-for="s in STATUTS_LIST" :key="s" :value="s">{{ s }}</option>
      </select>

      <select
        v-model="filters.priorite"
        class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
        @change="loadTickets"
      >
        <option value="">Toutes les priorités</option>
        <option v-for="p in PRIORITES_LIST" :key="p.value" :value="p.value">{{ p.label }}</option>
      </select>

      <select
        v-model="filters.type_demande"
        class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
        @change="loadTickets"
      >
        <option value="">Tous les types</option>
        <option v-for="t in TYPES_LIST" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
    </div>

    <!-- Tableau tickets -->
    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div v-if="loading" class="p-6 text-center text-sm text-slate-500">Chargement des tickets...</div>
      <div v-else-if="tickets.length === 0" class="p-6 text-center text-sm text-slate-500">
        Aucun ticket ne correspond à vos critères.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th class="px-4 py-3">Référence</th>
              <th class="px-4 py-3">Titre</th>
              <th class="px-4 py-3">Client</th>
              <th class="px-4 py-3">Type</th>
              <th class="px-4 py-3">Priorité</th>
              <th class="px-4 py-3">Statut</th>
              <th class="px-4 py-3">Technicien</th>
              <th class="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="t in tickets" :key="t.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 font-semibold text-blue-900">
                <router-link :to="`/tickets/${t.id}`" class="hover:underline">
                  {{ t.reference }}
                </router-link>
              </td>
              <td class="px-4 py-3 font-medium text-slate-900">
                <router-link :to="`/tickets/${t.id}`" class="hover:text-blue-900">
                  {{ t.titre }}
                </router-link>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ t.nom_client }}</td>
              <td class="px-4 py-3 text-slate-600">{{ formatType(t.type_demande) }}</td>
              <td class="px-4 py-3"><PriorityBadge :priorite="t.priorite" /></td>
              <td class="px-4 py-3"><StatusBadge :statut="t.statut" /></td>
              <td class="px-4 py-3 text-slate-600">
                {{ t.technicien_nom ? `${t.technicien_prenom} ${t.technicien_nom}` : 'Non affecté' }}
              </td>
              <td class="px-4 py-3 text-slate-500">{{ formatDate(t.date_creation) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import ticketService from '../services/ticketService';
import { extractApiError } from '../services/api';
import { useAuthStore } from '../stores/auth';
import {
  STATUTS_LIST,
  PRIORITES_LIST,
  TYPES_LIST,
  formatDate,
  formatType,
} from '../utils/formatters';
import StatusBadge from '../components/StatusBadge.vue';
import PriorityBadge from '../components/PriorityBadge.vue';
import AlertMessage from '../components/AlertMessage.vue';

const authStore = useAuthStore();
const tickets = ref([]);
const loading = ref(true);
const errorMessage = ref('');

const filters = reactive({
  search: '',
  statut: '',
  priorite: '',
  type_demande: '',
});

const loadTickets = async () => {
  loading.value = true;
  try {
    const res = await ticketService.getAll(filters);
    tickets.value = res.data;
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Impossible de charger les tickets.');
  } finally {
    loading.value = false;
  }
};

onMounted(loadTickets);
</script>
