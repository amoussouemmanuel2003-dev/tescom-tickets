<template>
  <div
    v-if="message"
    :class="containerClass"
    class="flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm"
    role="alert"
  >
    <span>{{ message }}</span>
    <button
      v-if="dismissible"
      type="button"
      class="font-bold opacity-70 hover:opacity-100"
      @click="$emit('close')"
    >
      ×
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: { type: String, default: 'error' },
  message: { type: String, default: '' },
  dismissible: { type: Boolean, default: false },
});

defineEmits(['close']);

const STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

const containerClass = computed(() => STYLES[props.type] || STYLES.error);
</script>
