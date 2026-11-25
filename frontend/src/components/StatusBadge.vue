<template>
  <span
    :class="badgeClass"
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
  >
    {{ statut }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  statut: {
    type: String,
    required: true,
  },
});

const STATUS_STYLES = {
  Nouveau: 'bg-sky-100 text-sky-800',
  Assigné: 'bg-indigo-100 text-indigo-800',
  'En cours': 'bg-amber-100 text-amber-800',
  'En attente client': 'bg-orange-100 text-orange-800',
  Résolu: 'bg-emerald-100 text-emerald-800',
  Clôturé: 'bg-slate-200 text-slate-700',
};

const badgeClass = computed(
  () => STATUS_STYLES[props.statut] || 'bg-slate-100 text-slate-700'
);
</script>
