<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Gestion des clients</h1>
        <p class="text-sm text-slate-500">Fiches clients TESCOM-CI (avec ou sans compte utilisateur).</p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
        @click="openCreateForm"
      >
        + Nouveau client
      </button>
    </div>

    <AlertMessage :message="feedback" type="success" dismissible @close="feedback = ''" />
    <AlertMessage :message="errorMessage" type="error" dismissible @close="errorMessage = ''" />

    <!-- Recherche -->
    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher par nom, contact, email ou téléphone..."
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none sm:max-w-md"
        @input="loadClients"
      />
    </div>

    <!-- Formulaire création / modification -->
    <div v-if="showForm" class="rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900">
          {{ editingClientId ? 'Modifier la fiche client' : 'Nouvelle fiche client' }}
        </h2>
        <button type="button" class="text-sm text-slate-500 hover:text-slate-700" @click="closeForm">
          Annuler
        </button>
      </div>

      <form class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="submitForm">
        <div>
          <label class="block text-sm font-medium text-slate-700">Nom du client / Entreprise *</label>
          <input
            v-model="form.nom_client"
            type="text"
            required
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Nom du contact</label>
          <input
            v-model="form.nom_contact"
            type="text"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Téléphone</label>
          <input
            v-model="form.telephone"
            type="text"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-slate-700">Adresse</label>
          <input
            v-model="form.adresse"
            type="text"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div class="flex justify-end gap-3 sm:col-span-2">
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="closeForm"
          >
            Fermer
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {{ saving ? 'Enregistrement...' : editingClientId ? 'Mettre à jour' : 'Créer le client' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Tableau clients -->
    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div v-if="loading" class="p-6 text-center text-sm text-slate-500">Chargement...</div>
      <div v-else-if="clients.length === 0" class="p-6 text-center text-sm text-slate-500">
        Aucun client enregistré.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th class="px-4 py-3">Client</th>
              <th class="px-4 py-3">Contact</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Téléphone</th>
              <th class="px-4 py-3">Tickets</th>
              <th class="px-4 py-3">Compte utilisateur</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="c in clients" :key="c.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 font-semibold text-blue-900">
                <router-link :to="`/clients/${c.id}`" class="hover:underline">
                  {{ c.nom_client }}
                </router-link>
              </td>
              <td class="px-4 py-3 text-slate-700">{{ c.nom_contact || '—' }}</td>
              <td class="px-4 py-3 text-slate-600">{{ c.email || '—' }}</td>
              <td class="px-4 py-3 text-slate-600">{{ c.telephone || '—' }}</td>
              <td class="px-4 py-3 font-semibold text-slate-800">{{ c.nombre_tickets }}</td>
              <td class="px-4 py-3">
                <span
                  v-if="!c.a_un_compte"
                  class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                >
                  Sans compte
                </span>
                <span
                  v-else
                  :class="c.compte_actif ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                  class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                >
                  {{ c.compte_actif ? 'Compte actif' : 'Compte désactivé' }}
                </span>
              </td>
              <td class="space-x-2 px-4 py-3 text-right">
                <router-link
                  :to="`/clients/${c.id}`"
                  class="text-xs font-semibold text-slate-700 hover:underline"
                >
                  Détails
                </router-link>
                <button
                  type="button"
                  class="text-xs font-semibold text-blue-900 hover:underline"
                  @click="openEditForm(c)"
                >
                  Modifier
                </button>
                <button
                  v-if="c.a_un_compte"
                  type="button"
                  :class="c.compte_actif ? 'text-red-700' : 'text-emerald-700'"
                  class="text-xs font-semibold hover:underline"
                  @click="toggleAccountStatus(c)"
                >
                  {{ c.compte_actif ? 'Désactiver compte' : 'Activer compte' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import clientService from '../services/clientService';
import { extractApiError } from '../services/api';
import AlertMessage from '../components/AlertMessage.vue';

const clients = ref([]);
const search = ref('');
const loading = ref(true);
const saving = ref(false);
const showForm = ref(false);
const editingClientId = ref(null);
const feedback = ref('');
const errorMessage = ref('');

const form = reactive({
  nom_client: '',
  nom_contact: '',
  email: '',
  telephone: '',
  adresse: '',
});

const loadClients = async () => {
  loading.value = true;
  try {
    const res = await clientService.getAll({ search: search.value });
    clients.value = res.data;
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Impossible de charger les clients.');
  } finally {
    loading.value = false;
  }
};

const openCreateForm = () => {
  editingClientId.value = null;
  form.nom_client = '';
  form.nom_contact = '';
  form.email = '';
  form.telephone = '';
  form.adresse = '';
  showForm.value = true;
};

const openEditForm = (client) => {
  editingClientId.value = client.id;
  form.nom_client = client.nom_client;
  form.nom_contact = client.nom_contact || '';
  form.email = client.email || '';
  form.telephone = client.telephone || '';
  form.adresse = client.adresse || '';
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingClientId.value = null;
};

const submitForm = async () => {
  saving.value = true;
  feedback.value = '';
  errorMessage.value = '';
  try {
    if (editingClientId.value) {
      const res = await clientService.update(editingClientId.value, form);
      feedback.value = res.message;
    } else {
      const res = await clientService.create(form);
      feedback.value = res.message;
    }
    closeForm();
    await loadClients();
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Erreur lors de l\'enregistrement du client.');
  } finally {
    saving.value = false;
  }
};

const toggleAccountStatus = async (client) => {
  feedback.value = '';
  errorMessage.value = '';
  try {
    const res = await clientService.updateStatus(client.id, !client.compte_actif);
    feedback.value = res.message;
    await loadClients();
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Impossible de modifier le statut du compte.');
  }
};

onMounted(loadClients);
</script>
