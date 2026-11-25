<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Mon profil</h1>
      <p class="text-sm text-slate-500">Consultez et mettez à jour vos informations personnelles.</p>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <AlertMessage :message="successMessage" type="success" dismissible @close="successMessage = ''" />
        <AlertMessage :message="errorMessage" type="error" />

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="prof-prenom" class="block text-sm font-medium text-slate-700">Prénom *</label>
            <input
              id="prof-prenom"
              v-model="form.prenom"
              type="text"
              required
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
            />
          </div>
          <div>
            <label for="prof-nom" class="block text-sm font-medium text-slate-700">Nom *</label>
            <input
              id="prof-nom"
              v-model="form.nom"
              type="text"
              required
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-slate-700">Email</label>
            <input
              :value="authStore.user?.email"
              type="email"
              disabled
              class="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Rôle</label>
            <input
              :value="formatRole(authStore.role)"
              type="text"
              disabled
              class="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
            />
          </div>
        </div>

        <div>
          <label for="prof-tel" class="block text-sm font-medium text-slate-700">Téléphone</label>
          <input
            id="prof-tel"
            v-model="form.telephone"
            type="text"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
          />
        </div>

        <div class="border-t border-slate-200 pt-4">
          <h2 class="text-sm font-semibold text-slate-900">Changer de mot de passe (optionnel)</h2>
          <div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="prof-old-pw" class="block text-sm font-medium text-slate-700">
                Ancien mot de passe
              </label>
              <input
                id="prof-old-pw"
                v-model="form.ancien_mot_de_passe"
                type="password"
                class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
              />
            </div>
            <div>
              <label for="prof-new-pw" class="block text-sm font-medium text-slate-700">
                Nouveau mot de passe
              </label>
              <input
                id="prof-new-pw"
                v-model="form.nouveau_mot_de_passe"
                type="password"
                minlength="8"
                class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="saving"
            class="rounded-lg bg-blue-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
          >
            {{ saving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { extractApiError } from '../services/api';
import { formatRole } from '../utils/formatters';
import AlertMessage from '../components/AlertMessage.vue';

const authStore = useAuthStore();

const form = reactive({
  prenom: authStore.user?.prenom || '',
  nom: authStore.user?.nom || '',
  telephone: authStore.user?.telephone || '',
  ancien_mot_de_passe: '',
  nouveau_mot_de_passe: '',
});

const saving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const handleSubmit = async () => {
  saving.value = true;
  successMessage.value = '';
  errorMessage.value = '';
  try {
    await authStore.updateProfile({
      prenom: form.prenom,
      nom: form.nom,
      telephone: form.telephone,
      ancien_mot_de_passe: form.ancien_mot_de_passe || undefined,
      nouveau_mot_de_passe: form.nouveau_mot_de_passe || undefined,
    });
    form.ancien_mot_de_passe = '';
    form.nouveau_mot_de_passe = '';
    successMessage.value = 'Profil mis à jour avec succès.';
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Erreur lors de la mise à jour du profil.');
  } finally {
    saving.value = false;
  }
};
</script>
