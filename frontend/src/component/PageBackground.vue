<script setup lang="ts">
import Aurora from "./Aurora/Aurora.vue";

interface Props {
  intensity?: number;
  opacity?: number;
}

withDefaults(defineProps<Props>(), {
  intensity: 0.3,
  opacity: 20, // percentage for tailwind class
});
</script>

<template>
  <div
    class="aurora-container fixed inset-0 w-full h-full pointer-events-none"
    aria-hidden="true"
  >
    <Aurora
      :color-stops="['#d20f39', '#df8e1d', '#40a02b']"
      :amplitude="0.5"
      :blend="0.5"
      :speed="0.2"
      :intensity="intensity"
      :class="['w-full h-full', `opacity-${opacity}`]"
    />
  </div>
</template>
