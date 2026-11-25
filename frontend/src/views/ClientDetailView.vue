<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <router-link to="/clients" class="text-sm font-semibold text-blue-900 hover:underline">
        ← Retour à la liste des clients
      </router-link>
    </div>

    <AlertMessage :message="feedback" type="success" dismissible @close="feedback = ''" />
    <AlertMessage :message="errorMessage" type="error" />

    <div v-if="loading" class="rounded-xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
      Chargement de la fiche client...
    </div>

    <template v-else-if="client">
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">{{ client.nom_client }}</h1>
            <p class="mt-1 text-sm text-slate-500">Créé le {{ formatDate(client.created_at) }}</p>
          </div>

          <div class="flex items-center gap-3">
            <span
              v-if="!client.a_un_compte"
              class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              Sans compte utilisateur
            </span>
            <template v-else>
              <span
                :class="client.compte_actif ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                class="rounded-full px-3 py-1 text-xs font-semibold"
              >
                {{ client.compte_actif ? 'Compte utilisateur actif' : 'Compte utilisateur désactivé' }}
              </span>
              <button
                type="button"
                :class="client.compte_actif ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'"
                class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                @click="toggleStatus"
              >
                {{ client.compte_actif ? 'Désactiver le compte' : 'Activer le compte' }}
              </button>
            </template>
          </div>
        </div>

        <dl class="mt-6 grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt class="text-xs font-medium uppercase text-slate-500">Contact</dt>
            <dd class="mt-1 text-sm font-medium text-slate-900">{{ client.nom_contact || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase text-slate-500">Email</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ client.email || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase text-slate-500">Téléphone</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ client.telephone || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase text-slate-500">Adresse</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ client.adresse || '—' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Tickets du client -->
      <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 class="text-base font-semibold text-slate-900">
            Tickets du client ({{ client.tickets.length }})
          </h2>
          <router-link
            :to="{ path: '/tickets/nouveau', query: { client_id: client.id } }"
            class="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
          >
            + Créer un ticket pour ce client
          </router-link>
        </div>

        <div v-if="client.tickets.length === 0" class="p-6 text-center text-sm text-slate-500">
          Aucun ticket pour ce client.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th class="px-4 py-3">Référence</th>
                <th class="px-4 py-3">Titre</th>
                <th class="px-4 py-3">Type</th>
                <th class="px-4 py-3">Priorité</th>
                <th class="px-4 py-3">Statut</th>
                <th class="px-4 py-3">Technicien</th>
                <th class="px-4 py-3">Créé le</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-for="t in client.tickets" :key="t.id" class="hover:bg-slate-50">
                <td class="px-4 py-3 font-semibold text-blue-900">
                  <router-link :to="`/tickets/${t.id}`" class="hover:underline">
                    {{ t.reference }}
                  </router-link>
                </td>
                <td class="px-4 py-3 font-medium text-slate-800">{{ t.titre }}</td>
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
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import clientService from '../services/clientService';
import { extractApiError } from '../services/api';
import { formatDate, formatType } from '../utils/formatters';
import AlertMessage from '../components/AlertMessage.vue';
import StatusBadge from '../components/StatusBadge.vue';
import PriorityBadge from '../components/PriorityBadge.vue';

const route = useRoute();
const client = ref(null);
const loading = ref(true);
const feedback = ref('');
const errorMessage = ref('');

const loadClient = async () => {
  loading.value = true;
  try {
    const res = await clientService.getById(route.params.id);
    client.value = res.data;
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Client introuvable.');
  } finally {
    loading.value = false;
  }
};

const toggleStatus = async () => {
  feedback.value = '';
  errorMessage.value = '';
  try {
    const res = await clientService.updateStatus(client.value.id, !client.value.compte_actif);
    feedback.value = res.message;
    await loadClient();
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Erreur lors du changement de statut.');
  }
};

onMounted(loadClient);
</script>
