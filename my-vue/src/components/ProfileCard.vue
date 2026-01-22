<!--
	Profile Card Component
	Adapted from https://vue-bits.dev/ui/
-->

<template>
  <div ref="wrapRef" :class="`pc-card-wrapper ${className}`.trim()" :style="cardStyle">
    <section ref="cardRef" class="pc-card">
      <div class="pc-inside">
        <div class="pc-shine" />
        <div class="pc-glare" />

        <div class="pc-content pc-avatar-content">
          <img
            class="avatar"
            :src="avatarUrl"
            :alt="`${name || 'User'} avatar`"
            loading="lazy"
            @error="handleAvatarError"
          />

          <div v-if="showUserInfo" class="pc-user-info">
            <div class="pc-user-details">
              <div class="pc-mini-avatar">
                <img
                  :src="miniAvatarUrl || avatarUrl"
                  :alt="`${name || 'User'} mini avatar`"
                  loading="lazy"
                  @error="handleMiniAvatarError"
                />
              </div>

              <div class="pc-user-text">
                <div class="pc-handle">@{{ handle }}</div>
                <div class="pc-status">{{ status }}</div>
              </div>
            </div>

            <button
              class="pc-contact-btn"
              @click="handleContactClick"
              style="pointer-events: auto"
              type="button"
              :aria-label="`Contact ${name || 'user'}`"
            >
              {{ contactText }}
            </button>
          </div>
        </div>

        <div class="pc-content">
          <div class="pc-details">
            <h3>{{ name }}</h3>
            <p>{{ title }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, useTemplateRef } from 'vue';

interface Props {
  avatarUrl?: string;
  behindGradient?: string;
  innerGradient?: string;
  showBehindGradient?: boolean;
  className?: string;
  enableTilt?: boolean;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  showUserInfo?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  avatarUrl: '',
  behindGradient: undefined,
  innerGradient: undefined,
  showBehindGradient: true,
  className: '',
  enableTilt: true,
  miniAvatarUrl: undefined,
  name: '用户',
  title: '新朋友',
  handle: 'user',
  status: '在线',
  contactText: '添加好友',
  showUserInfo: true
});

const emit = defineEmits<{
  contactClick: [];
}>();

const wrapRef = useTemplateRef<HTMLDivElement>('wrapRef');
const cardRef = useTemplateRef<HTMLElement>('cardRef');

// 主题色渐变 - 蓝紫色系
const DEFAULT_BEHIND_GRADIENT =
  'radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(217,100%,90%,var(--card-opacity)) 4%,hsla(217,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(217,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(217,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#0070f3c4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#0070f3ff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#0070f3ff 0%,#9c40ffff 40%,#9c40ffff 60%,#0070f3ff 100%)';

const DEFAULT_INNER_GRADIENT = 'linear-gradient(145deg,#0a0e278c 0%,#0070f344 100%)';

const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1500,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60
} as const;

const clamp = (value: number, min = 0, max = 100): number => Math.min(Math.max(value, min), max);
const round = (value: number, precision = 3): number => parseFloat(value.toFixed(precision));
const adjust = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number =>
  round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin));
const easeInOutCubic = (x: number): number => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

let rafId: number | null = null;

const updateCardTransform = (offsetX: number, offsetY: number, card: HTMLElement, wrap: HTMLElement) => {
  const width = card.clientWidth;
  const height = card.clientHeight;
  const percentX = clamp((100 / width) * offsetX);
  const percentY = clamp((100 / height) * offsetY);
  const centerX = percentX - 50;
  const centerY = percentY - 50;

  const properties = {
    '--pointer-x': `${percentX}%`,
    '--pointer-y': `${percentY}%`,
    '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
    '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
    '--pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
    '--pointer-from-top': `${percentY / 100}`,
    '--pointer-from-left': `${percentX / 100}`,
    '--rotate-x': `${round(-(centerX / 5))}deg`,
    '--rotate-y': `${round(centerY / 4)}deg`
  };

  Object.entries(properties).forEach(([property, value]) => {
    wrap.style.setProperty(property, value);
  });
};

const createSmoothAnimation = (duration: number, startX: number, startY: number, card: HTMLElement, wrap: HTMLElement) => {
  const startTime = performance.now();
  const targetX = wrap.clientWidth / 2;
  const targetY = wrap.clientHeight / 2;

  const animationLoop = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = clamp(elapsed / duration);
    const easedProgress = easeInOutCubic(progress);
    const currentX = adjust(easedProgress, 0, 1, startX, targetX);
    const currentY = adjust(easedProgress, 0, 1, startY, targetY);

    updateCardTransform(currentX, currentY, card, wrap);

    if (progress < 1) {
      rafId = requestAnimationFrame(animationLoop);
    }
  };

  rafId = requestAnimationFrame(animationLoop);
};

const cancelAnimation = () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

const handlePointerMove = (event: PointerEvent) => {
  const card = cardRef.value;
  const wrap = wrapRef.value;
  if (!card || !wrap || !props.enableTilt) return;
  const rect = card.getBoundingClientRect();
  updateCardTransform(event.clientX - rect.left, event.clientY - rect.top, card, wrap);
};

const handlePointerEnter = () => {
  const card = cardRef.value;
  const wrap = wrapRef.value;
  if (!card || !wrap || !props.enableTilt) return;
  cancelAnimation();
  wrap.classList.add('active');
  card.classList.add('active');
};

const handlePointerLeave = (event: PointerEvent) => {
  const card = cardRef.value;
  const wrap = wrapRef.value;
  if (!card || !wrap || !props.enableTilt) return;
  createSmoothAnimation(ANIMATION_CONFIG.SMOOTH_DURATION, event.offsetX, event.offsetY, card, wrap);
  wrap.classList.remove('active');
  card.classList.remove('active');
};

const cardStyle = computed(() => ({
  '--behind-gradient': props.showBehindGradient ? (props.behindGradient ?? DEFAULT_BEHIND_GRADIENT) : 'none',
  '--inner-gradient': props.innerGradient ?? DEFAULT_INNER_GRADIENT
}));

const handleContactClick = () => {
  emit('contactClick');
};

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = 'none';
};

const handleMiniAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.opacity = '0.5';
  target.src = props.avatarUrl;
};

onMounted(() => {
  if (!props.enableTilt) return;
  const card = cardRef.value;
  const wrap = wrapRef.value;
  if (!card || !wrap) return;

  card.addEventListener('pointerenter', handlePointerEnter);
  card.addEventListener('pointermove', handlePointerMove);
  card.addEventListener('pointerleave', handlePointerLeave);

  const initialX = wrap.clientWidth - ANIMATION_CONFIG.INITIAL_X_OFFSET;
  const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;
  updateCardTransform(initialX, initialY, card, wrap);
  createSmoothAnimation(ANIMATION_CONFIG.INITIAL_DURATION, initialX, initialY, card, wrap);
});

onUnmounted(() => {
  const card = cardRef.value;
  if (card) {
    card.removeEventListener('pointerenter', handlePointerEnter);
    card.removeEventListener('pointermove', handlePointerMove);
    card.removeEventListener('pointerleave', handlePointerLeave);
  }
  cancelAnimation();
});
</script>

<style scoped>
.pc-card-wrapper {
  --pointer-x: 50%;
  --pointer-y: 50%;
  --pointer-from-center: 0;
  --pointer-from-top: 0.5;
  --pointer-from-left: 0.5;
  --card-opacity: 0;
  --rotate-x: 0deg;
  --rotate-y: 0deg;
  --background-x: 50%;
  --background-y: 50%;
  --behind-gradient: none;
  --inner-gradient: none;
  --card-radius: 20px;
  perspective: 500px;
  transform: translate3d(0, 0, 0.1px);
  position: relative;
  touch-action: none;
}

.pc-card-wrapper::before {
  content: '';
  position: absolute;
  inset: -10px;
  background: inherit;
  background-position: inherit;
  border-radius: inherit;
  transition: all 0.5s ease;
  filter: contrast(2) saturate(2) blur(36px);
  transform: scale(0.8) translate3d(0, 0, 0.1px);
  background-size: 100% 100%;
  background-image: var(--behind-gradient);
}

.pc-card-wrapper:hover,
.pc-card-wrapper.active {
  --card-opacity: 1;
}

.pc-card-wrapper:hover::before,
.pc-card-wrapper.active::before {
  filter: contrast(1) saturate(2) blur(40px) opacity(1);
  transform: scale(0.9) translate3d(0, 0, 0.1px);
}

.pc-card {
  height: 400px;
  width: 280px;
  display: grid;
  border-radius: var(--card-radius);
  position: relative;
  background-blend-mode: color-dodge, normal, normal, normal;
  box-shadow: rgba(0, 0, 0, 0.8) calc((var(--pointer-from-left) * 10px) - 3px)
    calc((var(--pointer-from-top) * 20px) - 6px) 20px -5px;
  transition: transform 1s ease;
  transform: translate3d(0, 0, 0.1px) rotateX(0deg) rotateY(0deg);
  background-size: 100% 100%;
  background-image:
    radial-gradient(
      farthest-side circle at var(--pointer-x) var(--pointer-y),
      hsla(217, 100%, 90%, var(--card-opacity)) 4%,
      hsla(217, 50%, 80%, calc(var(--card-opacity) * 0.75)) 10%,
      hsla(217, 25%, 70%, calc(var(--card-opacity) * 0.5)) 50%,
      hsla(217, 0%, 60%, 0) 100%
    ),
    radial-gradient(35% 52% at 55% 20%, #0070f3c4 0%, #073aff00 100%),
    radial-gradient(100% 100% at 50% 50%, #0070f3ff 1%, #073aff00 76%),
    conic-gradient(from 124deg at 50% 50%, #0070f3ff 0%, #9c40ffff 40%, #9c40ffff 60%, #0070f3ff 100%);
  overflow: hidden;
}

.pc-card:hover,
.pc-card.active {
  transition: none;
  transform: translate3d(0, 0, 0.1px) rotateX(var(--rotate-y)) rotateY(var(--rotate-x));
}

.pc-card * {
  display: grid;
  grid-area: 1/-1;
  border-radius: var(--card-radius);
  transform: translate3d(0, 0, 0.1px);
  pointer-events: none;
}

.pc-inside {
  inset: 1px;
  position: absolute;
  background-image: var(--inner-gradient);
  background-color: rgba(10, 14, 39, 0.9);
  transform: translate3d(0, 0, 0.01px);
}

.pc-shine {
  transform: translate3d(0, 0, 1px);
  overflow: hidden;
  z-index: 3;
  opacity: 0.3;
}

.pc-glare {
  transform: translate3d(0, 0, 1.1px);
  overflow: hidden;
  background-image: radial-gradient(
    farthest-corner circle at var(--pointer-x) var(--pointer-y),
    hsl(217, 25%, 80%) 12%,
    hsla(207, 40%, 30%, 0.8) 90%
  );
  mix-blend-mode: overlay;
  filter: brightness(0.8) contrast(1.2);
  z-index: 4;
}

.pc-avatar-content {
  mix-blend-mode: screen;
  overflow: hidden;
}

.pc-avatar-content .avatar {
  width: 100%;
  position: absolute;
  left: 50%;
  transform: translateX(-50%) scale(1);
  bottom: 2px;
  opacity: calc(1.75 - var(--pointer-from-center));
}

.pc-user-info {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 112, 243, 0.1);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(0, 112, 243, 0.2);
  border-radius: 15px;
  padding: 12px 14px;
  pointer-events: auto;
}

.pc-user-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pc-mini-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(0, 112, 243, 0.3);
  flex-shrink: 0;
}

.pc-mini-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pc-user-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pc-handle {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1;
}

.pc-status {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1;
}

.pc-contact-btn {
  border: 1px solid rgba(0, 112, 243, 0.4);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  background: rgba(0, 112, 243, 0.2);
}

.pc-contact-btn:hover {
  border-color: rgba(0, 112, 243, 0.6);
  background: rgba(0, 112, 243, 0.3);
  transform: translateY(-1px);
}

.pc-content {
  max-height: 100%;
  overflow: hidden;
  text-align: center;
  position: relative;
  transform: translate3d(
    calc(var(--pointer-from-left) * -6px + 3px),
    calc(var(--pointer-from-top) * -6px + 3px),
    0.1px
  ) !important;
  z-index: 5;
  mix-blend-mode: luminosity;
}

.pc-details {
  width: 100%;
  position: absolute;
  top: 2em;
  display: flex;
  flex-direction: column;
}

.pc-details h3 {
  font-weight: 700;
  margin: 0;
  font-size: 2em;
  background-image: linear-gradient(to bottom, #fff, #60a5fa);
  background-size: 1em 1.5em;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
}

.pc-details p {
  font-weight: 600;
  position: relative;
  top: -8px;
  white-space: nowrap;
  font-size: 14px;
  margin: 0 auto;
  width: min-content;
  background-image: linear-gradient(to bottom, #fff, #9c40ff);
  background-size: 1em 1.5em;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
}
</style>

