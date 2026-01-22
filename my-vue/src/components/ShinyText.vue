<!--
	Shiny Text Animation Component
	Adapted from https://vue-bits.dev/ui/
-->

<script setup lang="ts">
import { computed } from 'vue';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  baseColor?: string;
  shineColor?: string;
}

const props = withDefaults(defineProps<ShinyTextProps>(), {
  text: '',
  disabled: false,
  speed: 5,
  className: '',
  baseColor: 'rgba(96, 165, 250, 0.6)',
  shineColor: 'rgba(255, 255, 255, 0.9)'
});

const animationDuration = computed(() => `${props.speed}s`);
</script>

<template>
  <div
    :class="`bg-clip-text inline-block ${!props.disabled ? 'animate-shine' : ''} ${props.className}`"
    :style="{
      color: props.baseColor,
      backgroundImage: `linear-gradient(120deg, ${props.baseColor} 40%, ${props.shineColor} 50%, ${props.baseColor} 60%)`,
      backgroundSize: '200% 100%',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      animationDuration: animationDuration
    }"
  >
    {{ props.text }}
  </div>
</template>

<style scoped>
@keyframes shine {
  0% {
    background-position: 100%;
  }
  100% {
    background-position: -100%;
  }
}

.animate-shine {
  animation: shine 5s linear infinite;
}
</style>

