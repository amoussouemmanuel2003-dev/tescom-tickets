<template>
  <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <p class="text-sm font-medium text-slate-500">{{ title }}</p>
    <p :class="valueClass" class="mt-2 text-3xl font-bold">{{ value }}</p>
    <p v-if="subtitle" class="mt-1 text-xs text-slate-400">{{ subtitle }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [Number, String], required: true },
  subtitle: { type: String, default: '' },
  tone: { type: String, default: 'default' },
});

const TONE_MAP = {
  default: 'text-slate-900',
  blue: 'text-blue-900',
  amber: 'text-amber-600',
  green: 'text-emerald-600',
  slate: 'text-slate-600',
};

const valueClass = computed(() => TONE_MAP[props.tone] || TONE_MAP.default);
</script>
