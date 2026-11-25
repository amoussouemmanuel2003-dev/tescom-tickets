<template>
  <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="text-lg font-semibold text-slate-900">Échanges et messages</h2>

    <div v-if="messages.length === 0" class="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
      Aucun message pour ce ticket pour le moment.
    </div>

    <div v-else class="mt-4 space-y-3">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="msg.interne ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'"
        class="rounded-lg border p-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-slate-900">
              {{ msg.auteur_prenom }} {{ msg.auteur_nom }}
            </span>
            <span class="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
              {{ formatRole(msg.auteur_role) }}
            </span>
            <span
              v-if="msg.interne"
              class="rounded bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900"
            >
              Note interne
            </span>
          </div>
          <span class="text-xs text-slate-500">{{ formatDate(msg.created_at) }}</span>
        </div>
        <p class="mt-2 whitespace-pre-line text-sm text-slate-700">{{ msg.contenu }}</p>
      </div>
    </div>

    <form v-if="!isClosed" class="mt-6 space-y-3 border-t border-slate-200 pt-4" @submit.prevent="submitMessage">
      <AlertMessage :message="errorMsg" type="error" />

      <div>
        <label for="message-contenu" class="block text-sm font-medium text-slate-700">
          Nouveau message
        </label>
        <textarea
          id="message-contenu"
          v-model="contenu"
          rows="3"
          required
          placeholder="Saisissez votre réponse ou précision..."
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
        ></textarea>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <label v-if="canPostInternal" class="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            v-model="interne"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          <span>Message interne (invisible pour le client)</span>
        </label>
        <span v-else class="text-xs text-slate-500">Message visible par l'équipe d'assistance.</span>

        <button
          type="submit"
          :disabled="submitting"
          class="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
        >
          {{ submitting ? 'Envoi...' : 'Envoyer le message' }}
        </button>
      </div>
    </form>

    <p v-else class="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
      Ce ticket est clôturé : l'ajout de nouveaux messages est désactivé.
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AlertMessage from './AlertMessage.vue';
import { formatDate, formatRole } from '../utils/formatters';

const props = defineProps({
  messages: { type: Array, default: () => [] },
  canPostInternal: { type: Boolean, default: false },
  isClosed: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
});

const emit = defineEmits(['submit']);

const contenu = ref('');
const interne = ref(false);
const errorMsg = ref('');

const submitMessage = () => {
  errorMsg.value = '';
  if (!contenu.value.trim()) {
    errorMsg.value = 'Le message ne peut pas être vide.';
    return;
  }
  emit('submit', { contenu: contenu.value.trim(), interne: props.canPostInternal ? interne.value : false }, () => {
    contenu.value = '';
    interne.value = false;
  });
};
</script>
