<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
        <p class="text-sm text-slate-500">Administration des comptes, rôles et activations.</p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
        @click="openCreateForm"
      >
        + Nouvel utilisateur
      </button>
    </div>

    <AlertMessage :message="feedback" type="success" dismissible @close="feedback = ''" />
    <AlertMessage :message="errorMessage" type="error" dismissible @close="errorMessage = ''" />

    <!-- Filtres -->
    <div class="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
      <input
        v-model="filters.search"
        type="text"
        placeholder="Rechercher par nom ou email..."
        class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
        @input="loadUsers"
      />
      <select
        v-model="filters.role"
        class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
        @change="loadUsers"
      >
        <option value="">Tous les rôles</option>
        <option value="admin">Administrateur</option>
        <option value="employe">Employé</option>
        <option value="technicien">Technicien</option>
        <option value="client">Client</option>
      </select>
      <select
        v-model="filters.actif"
        class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
        @change="loadUsers"
      >
        <option value="">Tous les statuts</option>
        <option value="true">Actifs uniquement</option>
        <option value="false">Désactivés uniquement</option>
      </select>
    </div>

    <!-- Formulaire création / édition -->
    <div v-if="showForm" class="rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900">
          {{ editingUserId ? 'Modifier l\'utilisateur' : 'Créer un utilisateur' }}
        </h2>
        <button type="button" class="text-sm text-slate-500 hover:text-slate-700" @click="closeForm">
          Annuler
        </button>
      </div>

      <form class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="submitForm">
        <div>
          <label class="block text-sm font-medium text-slate-700">Prénom *</label>
          <input
            v-model="form.prenom"
            type="text"
            required
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Nom *</label>
          <input
            v-model="form.nom"
            type="text"
            required
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Email *</label>
          <input
            v-model="form.email"
            type="email"
            required
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
        <div>
          <label class="block text-sm font-medium text-slate-700">Rôle *</label>
          <select
            v-model="form.role"
            required
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="employe">Employé</option>
            <option value="technicien">Technicien</option>
            <option value="admin">Administrateur</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">
            Mot de passe {{ editingUserId ? '(laisser vide si inchangé)' : '*' }}
          </label>
          <input
            v-model="form.mot_de_passe"
            type="password"
            :required="!editingUserId"
            minlength="8"
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
            {{ saving ? 'Enregistrement...' : editingUserId ? 'Mettre à jour' : 'Créer' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Tableau utilisateurs -->
    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div v-if="loading" class="p-6 text-center text-sm text-slate-500">Chargement...</div>
      <div v-else-if="users.length === 0" class="p-6 text-center text-sm text-slate-500">
        Aucun utilisateur trouvé.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th class="px-4 py-3">Nom complet</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Téléphone</th>
              <th class="px-4 py-3">Rôle</th>
              <th class="px-4 py-3">Statut</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="u in users" :key="u.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 font-medium text-slate-900">{{ u.prenom }} {{ u.nom }}</td>
              <td class="px-4 py-3 text-slate-600">{{ u.email }}</td>
              <td class="px-4 py-3 text-slate-600">{{ u.telephone || '—' }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {{ formatRole(u.role) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  :class="u.actif ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                  class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                >
                  {{ u.actif ? 'Actif' : 'Désactivé' }}
                </span>
              </td>
              <td class="space-x-2 px-4 py-3 text-right">
                <button
                  type="button"
                  class="text-xs font-semibold text-blue-900 hover:underline"
                  @click="openEditForm(u)"
                >
                  Modifier
                </button>
                <button
                  v-if="u.id !== authStore.user?.id"
                  type="button"
                  :class="u.actif ? 'text-red-700' : 'text-emerald-700'"
                  class="text-xs font-semibold hover:underline"
                  @click="toggleStatus(u)"
                >
                  {{ u.actif ? 'Désactiver' : 'Activer' }}
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
import userService from '../services/userService';
import { extractApiError } from '../services/api';
import { useAuthStore } from '../stores/auth';
import { formatRole } from '../utils/formatters';
import AlertMessage from '../components/AlertMessage.vue';

const authStore = useAuthStore();
const users = ref([]);
const loading = ref(true);
const saving = ref(false);
const showForm = ref(false);
const editingUserId = ref(null);
const feedback = ref('');
const errorMessage = ref('');

const filters = reactive({
  search: '',
  role: '',
  actif: '',
});

const form = reactive({
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  role: 'employe',
  mot_de_passe: '',
});

const loadUsers = async () => {
  loading.value = true;
  try {
    const res = await userService.getAll(filters);
    users.value = res.data;
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Impossible de charger les utilisateurs.');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.prenom = '';
  form.nom = '';
  form.email = '';
  form.telephone = '';
  form.role = 'employe';
  form.mot_de_passe = '';
};

const openCreateForm = () => {
  editingUserId.value = null;
  resetForm();
  showForm.value = true;
};

const openEditForm = (user) => {
  editingUserId.value = user.id;
  form.prenom = user.prenom;
  form.nom = user.nom;
  form.email = user.email;
  form.telephone = user.telephone || '';
  form.role = user.role;
  form.mot_de_passe = '';
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingUserId.value = null;
};

const submitForm = async () => {
  saving.value = true;
  errorMessage.value = '';
  feedback.value = '';
  try {
    if (editingUserId.value) {
      const res = await userService.update(editingUserId.value, form);
      feedback.value = res.message;
    } else {
      const res = await userService.create(form);
      feedback.value = res.message;
    }
    closeForm();
    await loadUsers();
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Erreur lors de l\'enregistrement.');
  } finally {
    saving.value = false;
  }
};

const toggleStatus = async (user) => {
  errorMessage.value = '';
  feedback.value = '';
  try {
    const res = await userService.updateStatus(user.id, !user.actif);
    feedback.value = res.message;
    await loadUsers();
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Impossible de modifier le statut.');
  }
};

onMounted(loadUsers);
</script>
