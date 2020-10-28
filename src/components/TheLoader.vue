<script lang="ts">
/*

  Loader component for displaying progressbar.

  Usage:

  1. apply in nuxt.config.js
  loading: "@/components/Loader.vue",

  2. to trigger manually (eg axios request)

  // 1. map the action
  @Action("loaderActiveSet")
  loaderActiveSet: void;

  // 2. dispatch action and set state to true
  this.loaderActiveSet(true);

*/

import { Vue, Component, Watch } from 'vue-property-decorator'
import { Getter as G } from 'vuex-class'
import { RootG } from '@/types/'

const CONFIG_MIN_DURATION = 1000

@Component({})
export default class TheLoader extends Vue {
  // hooking into vuex - used to manually trigger loader
  @G(RootG.isPageLoading) loaderActiveGet: boolean

  loading = false

  // startTime: used to keep track of how long loader has been active
  startTime: Date | null = null

  // onActivate: to manually trigger this loader component - set vuex state `loaderActive` to true
  @Watch('loaderActiveGet')
  onActivate(isActive: boolean) {
    if (!isActive) {
      return
    }

    this.start()

    // disable loader after 1s
    setTimeout(() => this.finish(), 1010)
  }

  // start: start animation, save starting time
  start() {
    if (!this.startTime) {
      this.startTime = new Date()
    }

    this.loading = true
  }

  // finish: stop animation, ensuring that it lasts at least amount defined in CONFIG_MIN_DURATION
  finish() {
    if (!this.startTime) {
      return
    }
    const endTime: Date = new Date()
    const timeDiff = endTime.valueOf() - this.startTime.valueOf() // in ms
    this.startTime = null

    if (timeDiff < CONFIG_MIN_DURATION) {
      setTimeout(() => {
        this.loading = false
      }, CONFIG_MIN_DURATION - timeDiff)
    } else {
      this.loading = false
    }
  }
}
</script>

<template>
  <transition name="t__fade">
    <div v-if="loading" id="loader-wrapper">
      <v-progress-linear id="loader" :indeterminate="true" color="accent" />
    </div>
  </transition>
</template>

<style scoped lang="scss">
#loader-wrapper {
  width: 100%;
  position: fixed;
  z-index: 10000;
  pointer-events: none;

  #loader {
    margin: 0;
  }
}

// t__fade: transitioning loader, fade in/out
.t__fade {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.5s;
  }
  &-enter, &-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
}
</style>
