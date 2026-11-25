<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Créer un ticket d'assistance</h1>
        <p class="text-sm text-slate-500">Le ticket sera créé au statut Nouveau avec une référence automatique.</p>
      </div>
      <router-link to="/tickets" class="text-sm font-semibold text-blue-900 hover:underline">
        ← Retour
      </router-link>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <AlertMessage :message="errorMessage" type="error" />

        <div v-if="authStore.isStaff">
          <label for="ticket-client" class="block text-sm font-medium text-slate-700">
            Client concerné *
          </label>
          <select
            id="ticket-client"
            v-model="form.client_id"
            required
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
          >
            <option value="" disabled>Sélectionnez un client</option>
            <option v-for="c in clients" :key="c.id" :value="c.id">
              {{ c.nom_client }}{{ c.nom_contact ? ` (${c.nom_contact})` : '' }}
            </option>
          </select>
        </div>

        <div>
          <label for="ticket-titre" class="block text-sm font-medium text-slate-700">Titre *</label>
          <input
            id="ticket-titre"
            v-model="form.titre"
            type="text"
            required
            maxlength="200"
            placeholder="Ex : Panne de connexion fibre optique"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="ticket-type" class="block text-sm font-medium text-slate-700">
              Type de demande *
            </label>
            <select
              id="ticket-type"
              v-model="form.type_demande"
              required
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
            >
              <option v-for="t in TYPES_LIST" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>

          <div>
            <label for="ticket-priorite" class="block text-sm font-medium text-slate-700">
              Priorité *
            </label>
            <select
              id="ticket-priorite"
              v-model="form.priorite"
              required
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
            >
              <option v-for="p in PRIORITES_LIST" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
          </div>
        </div>

        <div>
          <label for="ticket-desc" class="block text-sm font-medium text-slate-700">
            Description détaillée *
          </label>
          <textarea
            id="ticket-desc"
            v-model="form.description"
            rows="5"
            required
            placeholder="Décrivez précisément le problème ou la demande..."
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
          ></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <router-link
            to="/tickets"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </router-link>
          <button
            type="submit"
            :disabled="submitting"
            class="rounded-lg bg-blue-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
          >
            {{ submitting ? 'Création...' : 'Créer le ticket' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import ticketService from '../services/ticketService';
import clientService from '../services/clientService';
import { extractApiError } from '../services/api';
import { TYPES_LIST, PRIORITES_LIST } from '../utils/formatters';
import AlertMessage from '../components/AlertMessage.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const clients = ref([]);
const submitting = ref(false);
const errorMessage = ref('');

const form = reactive({
  client_id: route.query.client_id ? Number(route.query.client_id) : '',
  titre: '',
  type_demande: 'incident',
  priorite: 'moyenne',
  description: '',
});

onMounted(async () => {
  if (authStore.isStaff) {
    try {
      const res = await clientService.getAll();
      clients.value = res.data;
    } catch (err) {
      errorMessage.value = extractApiError(err, 'Impossible de charger la liste des clients.');
    }
  }
});

const handleSubmit = async () => {
  submitting.value = true;
  errorMessage.value = '';
  try {
    const payload = {
      titre: form.titre,
      type_demande: form.type_demande,
      priorite: form.priorite,
      description: form.description,
    };
    if (authStore.isStaff) {
      payload.client_id = Number(form.client_id);
    }
    const res = await ticketService.create(payload);
    router.push(`/tickets/${res.data.id}`);
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Impossible de créer le ticket.');
  } finally {
    submitting.value = false;
  }
};
</script>
