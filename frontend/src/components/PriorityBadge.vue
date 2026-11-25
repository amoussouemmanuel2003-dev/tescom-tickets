<template>
  <span
    :class="badgeClass"
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
  >
    {{ formatPriorite(priorite) }}
  </span>
</template>

<script setup>
import { computed } from 'vue';
import { formatPriorite } from '../utils/formatters';

const props = defineProps({
  priorite: {
    type: String,
    required: true,
  },
});

const PRIORITY_STYLES = {
  faible: 'bg-slate-100 text-slate-700',
  moyenne: 'bg-blue-100 text-blue-800',
  haute: 'bg-amber-100 text-amber-800',
  urgente: 'bg-red-100 text-red-800',
};

const badgeClass = computed(
  () => PRIORITY_STYLES[props.priorite] || 'bg-slate-100 text-slate-700'
);
</script>
