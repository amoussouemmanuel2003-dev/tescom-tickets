<template>
  <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="text-lg font-semibold text-slate-900">Historique des actions</h2>

    <div v-if="historique.length === 0" class="mt-4 text-sm text-slate-500">
      Aucun événement enregistré.
    </div>

    <ol v-else class="mt-4 space-y-4 border-l-2 border-slate-200 pl-4">
      <li v-for="item in historique" :key="item.id" class="relative">
        <span class="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-900"></span>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-sm font-semibold text-slate-900">{{ actionLabel(item.action) }}</span>
          <span class="text-xs text-slate-500">{{ formatDate(item.created_at) }}</span>
        </div>

        <p class="mt-1 text-xs text-slate-600">
          Par <strong>{{ item.auteur_prenom }} {{ item.auteur_nom }}</strong> ({{ formatRole(item.auteur_role) }})
        </p>

        <p v-if="item.ancien_statut || item.nouveau_statut" class="mt-1 text-xs text-slate-700">
          Statut :
          <span v-if="item.ancien_statut">{{ item.ancien_statut }} → </span>
          <strong>{{ item.nouveau_statut }}</strong>
        </p>

        <p v-if="item.nouveau_technicien_id" class="mt-1 text-xs text-slate-700">
          Technicien :
          <span v-if="item.ancien_technicien_id">
            {{ item.ancien_technicien_prenom }} {{ item.ancien_technicien_nom }} →
          </span>
          <strong>{{ item.nouveau_technicien_prenom }} {{ item.nouveau_technicien_nom }}</strong>
        </p>

        <p v-if="item.commentaire" class="mt-1 rounded bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
          {{ item.commentaire }}
        </p>
      </li>
    </ol>
  </div>
</template>

<script setup>
import { formatDate, formatRole } from '../utils/formatters';

defineProps({
  historique: { type: Array, default: () => [] },
});

const ACTION_LABELS = {
  creation: 'Création du ticket',
  affectation: 'Affectation / Réaffectation',
  changement_statut: 'Changement de statut',
};

const actionLabel = (action) => ACTION_LABELS[action] || action;
</script>
