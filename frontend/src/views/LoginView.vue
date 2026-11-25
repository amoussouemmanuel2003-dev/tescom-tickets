<template>
  <div>
    <h2 class="text-xl font-bold text-slate-900">Connexion</h2>
    <p class="mt-1 text-sm text-slate-500">Accédez à votre espace d'assistance TESCOM-CI.</p>

    <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
      <AlertMessage :message="errorMessage" type="error" />

      <div>
        <label for="login-email" class="block text-sm font-medium text-slate-700">Email</label>
        <input
          id="login-email"
          v-model="form.email"
          type="email"
          required
          autocomplete="email"
          placeholder="exemple@tescom-ci.com"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
        />
      </div>

      <div>
        <label for="login-password" class="block text-sm font-medium text-slate-700">
          Mot de passe
        </label>
        <input
          id="login-password"
          v-model="form.mot_de_passe"
          type="password"
          required
          autocomplete="current-password"
          placeholder="••••••••"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
        />
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
      >
        {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-600">
      Nouveau client ?
      <router-link to="/register" class="font-semibold text-blue-900 hover:underline">
        Créer un compte client
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
  email: '',
  mot_de_passe: '',
});

const loading = ref(false);
const errorMessage = ref('');

const handleSubmit = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    await authStore.login(form);
    router.push('/dashboard');
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Identifiants invalides.');
  } finally {
    loading.value = false;
  }
};
</script>
