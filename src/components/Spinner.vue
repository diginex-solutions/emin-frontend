<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({ components: {} })
export default class Spinner extends Vue {
  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Boolean) fullscreen: boolean
}
</script>

<template>
  <transition name="spinner__transition">
    <div
      class="spinner"
      :class="{
        fullscreen: fullscreen
      }"
    >
      <v-progress-circular
        :size="fullscreen ? 70 : 20"
        :width="fullscreen ? 7 : 2"
        indeterminate
        color="primary"
      />
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.spinner {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;

  width: 100%;
  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;

    background: white;
    z-index: 10001;

    justify-content: center;
    align-items: center;
    display: flex;
  }

  &__transition {
    &-enter-active,
    &-leave-active {
      transition: opacity 0.5s;
    }
    &-enter {
      opacity: 0;
    }
    &-leave-to {
      // transition delay is used so it won't fade out before previous view fades out
      transition-delay: 0.5s;
      opacity: 0;
    }
  }
}
</style>
