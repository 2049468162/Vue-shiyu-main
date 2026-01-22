<!--
	Split Text Animation Component
	Free alternative implementation without GSAP SplitText
-->

<template>
  <p
    ref="textRef"
    :class="`split-parent overflow-hidden inline-block whitespace-normal ${className}`"
    :style="{
      textAlign,
      wordWrap: 'break-word'
    }"
  >
    <span
      v-for="(char, index) in characters"
      :key="index"
      :style="getCharStyle(index)"
      class="split-char inline-block"
    >
      {{ char === ' ' ? '\u00A0' : char }}
    </span>
  </p>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick, useTemplateRef } from 'vue';

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

const props = withDefaults(defineProps<SplitTextProps>(), {
  className: '',
  delay: 50,
  duration: 600,
  threshold: 0.1,
  rootMargin: '0px',
  textAlign: 'center'
});

const textRef = useTemplateRef<HTMLParagraphElement>('textRef');
const inView = ref(false);

const characters = computed(() => props.text.split(''));

const getCharStyle = (index: number) => {
  if (!inView.value) {
    return {
      opacity: 0,
      transform: 'translateY(40px)',
      display: 'inline-block'
    };
  }
  
  return {
    opacity: 1,
    transform: 'translateY(0)',
    transition: `all ${props.duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${index * props.delay}ms`,
    display: 'inline-block'
  };
};

let observer: IntersectionObserver | null = null;

const setupObserver = () => {
  if (!textRef.value) return;

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        inView.value = true;
        observer?.unobserve(textRef.value as Element);
      }
    },
    {
      threshold: props.threshold,
      rootMargin: props.rootMargin
    }
  );

  observer.observe(textRef.value);
};

onMounted(() => {
  nextTick(() => {
    setupObserver();
  });
});

onUnmounted(() => {
  observer?.disconnect();
});

watch([() => props.text], () => {
  inView.value = false;
  observer?.disconnect();
  nextTick(() => {
    setupObserver();
  });
});
</script>

<style scoped>
.split-char {
  will-change: transform, opacity;
}
</style>

