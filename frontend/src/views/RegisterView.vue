<template>
  <div>
    <h2 class="text-xl font-bold text-slate-900">Inscription client</h2>
    <p class="mt-1 text-sm text-slate-500">Créez votre compte pour soumettre et suivre vos tickets.</p>

    <form class="mt-5 space-y-3.5" @submit.prevent="handleSubmit">
      <AlertMessage :message="errorMessage" type="error" />

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label for="reg-prenom" class="block text-sm font-medium text-slate-700">Prénom *</label>
          <input
            id="reg-prenom"
            v-model="form.prenom"
            type="text"
            required
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
          />
        </div>
        <div>
          <label for="reg-nom" class="block text-sm font-medium text-slate-700">Nom *</label>
          <input
            id="reg-nom"
            v-model="form.nom"
            type="text"
            required
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
          />
        </div>
      </div>

      <div>
        <label for="reg-client" class="block text-sm font-medium text-slate-700">
          Nom de l'entreprise ou du client
        </label>
        <input
          id="reg-client"
          v-model="form.nom_client"
          type="text"
          placeholder="Laisser vide pour utiliser votre nom"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
        />
      </div>

      <div>
        <label for="reg-email" class="block text-sm font-medium text-slate-700">Email *</label>
        <input
          id="reg-email"
          v-model="form.email"
          type="email"
          required
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
        />
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label for="reg-tel" class="block text-sm font-medium text-slate-700">Téléphone</label>
          <input
            id="reg-tel"
            v-model="form.telephone"
            type="text"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
          />
        </div>
        <div>
          <label for="reg-adresse" class="block text-sm font-medium text-slate-700">Adresse</label>
          <input
            id="reg-adresse"
            v-model="form.adresse"
            type="text"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
          />
        </div>
      </div>

      <div>
        <label for="reg-password" class="block text-sm font-medium text-slate-700">
          Mot de passe (min. 8 caractères) *
        </label>
        <input
          id="reg-password"
          v-model="form.mot_de_passe"
          type="password"
          minlength="8"
          required
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
        />
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
      >
        {{ loading ? 'Création du compte...' : 'S\'inscrire' }}
      </button>
    </form>

    <p class="mt-5 text-center text-sm text-slate-600">
      Déjà inscrit ?
      <router-link to="/login" class="font-semibold text-blue-900 hover:underline">
        Se connecter
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { extractApiError } from '../services/api';
import AlertMessage from '../components/AlertMessage.vue';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  prenom: '',
  nom: '',
  nom_client: '',
  email: '',
  telephone: '',
  adresse: '',
  mot_de_passe: '',
});

const loading = ref(false);
const errorMessage = ref('');

const handleSubmit = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    await authStore.register(form);
    router.push('/dashboard');
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Erreur lors de l\'inscription.');
  } finally {
    loading.value = false;
  }
};
</script>
