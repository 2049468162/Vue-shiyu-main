<template>
  <div class="stepper-container">
    <div class="stepper-wrapper glass-effect p-8 rounded-3xl">
      <!-- 步骤指示器 -->
      <div class="step-indicators mb-8">
        <div class="flex items-center justify-center">
          <template v-for="step in totalSteps" :key="step">
            <div
              @click="() => goToStep(step)"
              :class="[
                'step-circle',
                {
                  'step-active': currentStep === step,
                  'step-completed': currentStep > step,
                  'step-inactive': currentStep < step
                }
              ]"
            >
              <el-icon v-if="currentStep > step" class="text-xl">
                <Check />
              </el-icon>
              <div v-else-if="currentStep === step" class="active-dot" />
              <span v-else class="text-sm">{{ step }}</span>
            </div>

            <div
              v-if="step < totalSteps"
              class="step-line"
              :class="{ 'step-line-active': currentStep > step }"
            />
          </template>
        </div>
      </div>

      <!-- 步骤内容 -->
      <div class="step-content-wrapper">
        <transition :name="transitionName" mode="out-in">
          <div :key="currentStep" class="step-content">
            <slot :name="`step${currentStep}`" />
          </div>
        </transition>
      </div>

      <!-- 操作按钮 -->
      <div class="step-footer mt-8">
        <div class="flex" :class="currentStep === 1 ? 'justify-end' : 'justify-between'">
          <Magnet v-if="currentStep > 1">
            <el-button
              @click="prevStep"
              size="large"
              class="magnet-button"
            >
              上一步
            </el-button>
          </Magnet>
          <Magnet v-if="currentStep < totalSteps">
            <el-button
              @click="nextStep"
              :disabled="!canProceed"
              type="primary"
              size="large"
              class="px-8 magnet-button"
            >
              下一步
            </el-button>
          </Magnet>
          <Magnet v-else>
            <el-button
              @click="complete"
              :disabled="!canProceed"
              type="primary"
              size="large"
              class="px-8 magnet-button neon-glow"
            >
              完成设置
            </el-button>
          </Magnet>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Check } from '@element-plus/icons-vue'
import Magnet from './Magnet.vue'

interface StepperProps {
  totalSteps: number
  canProceed?: boolean
}

const props = withDefaults(defineProps<StepperProps>(), {
  canProceed: true
})

const emit = defineEmits<{
  (e: 'complete'): void
  (e: 'stepChange', step: number): void
}>()

const currentStep = ref(1)
const transitionName = ref('slide-left')

const nextStep = () => {
  if (currentStep.value < props.totalSteps) {
    transitionName.value = 'slide-left'
    currentStep.value++
    emit('stepChange', currentStep.value)
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    transitionName.value = 'slide-right'
    currentStep.value--
    emit('stepChange', currentStep.value)
  }
}

const goToStep = (step: number) => {
  if (step < currentStep.value) {
    transitionName.value = step < currentStep.value ? 'slide-right' : 'slide-left'
    currentStep.value = step
    emit('stepChange', currentStep.value)
  }
}

const complete = () => {
  emit('complete')
}
</script>

<style scoped>
.stepper-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.stepper-wrapper {
  background: rgba(255, 255, 255, 0.03);
}

/* 步骤指示器 */
.step-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.step-inactive {
  background: rgba(255, 255, 255, 0.1);
  color: #666;
}

.step-active {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 0 20px rgba(0, 112, 243, 0.5);
  transform: scale(1.1);
}

.step-completed {
  background: var(--color-primary);
  color: white;
}

.step-completed:hover {
  transform: scale(1.05);
}

.active-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
}

.step-line {
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 12px;
  border-radius: 2px;
  transition: all 0.5s ease;
}

.step-line-active {
  background: var(--color-primary);
}

/* 步骤内容 */
.step-content-wrapper {
  min-height: 450px;
  position: relative;
}

.step-content {
  width: 100%;
}

/* 左滑动画 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.4s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

/* 右滑动画 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s ease;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

.magnet-button {
  cursor: pointer;
}

.neon-glow {
  box-shadow: 0 0 20px rgba(0, 112, 243, 0.6), 0 0 40px rgba(0, 112, 243, 0.3);
}
</style>
