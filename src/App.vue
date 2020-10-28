<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'

import { Getter as G, Action as A } from 'vuex-class'
import { RootA, RootG, DocsS, AuthS } from '@/types/'

import TheSnackbar from '@/components/TheSnackbar.vue'
import TheLoader from '@/components/TheLoader.vue'
import Spinner from '@/components/Spinner.vue'
import WelcomeScreen from '@/components/WelcomeScreen.vue'
import _ from 'lodash'
import { Sortable, MultiDrag } from 'sortablejs'
import { config } from '@/utils/config'
import { Routes } from './router'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

interface RecaptchaInstance {
  hideBadge: () => {}
}

@Component({
  components: {
    Spinner,
    WelcomeScreen,
    TheSnackbar,
    TheLoader
  }
})
export default class App extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(RootG.isLoading) isLoading: boolean
  @A(RootA.initApp) initApp: () => null

  @G(...DocsS.records) documents: Docs.Record[]
  @A(...DocsS.setCurrentPath) setCurrentPath: Docs.SetCurrentPathA

  @G(...AuthS.isLogged) isLogged: boolean
  @G(...AuthS.isNoauth) isNoauth: boolean
  @G(...AuthS.isWelcomeScreen) isWelcomeScreen: boolean

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  appName = config.appName
  isAppInit = false

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  // true if current page is Overview
  // ! TODO: delete this?
  get isOverview() {
    return this.$route.name === Routes.overview.name
  }

  get isAuthRequired() {
    // const isAuthRequired = to.meta.auth //* Wrong, parent route metas are not propagating to children
    return !!this.$route.matched.some((route) => route.meta.auth)
  }

  get layout() {
    const defaultLayout = 'default'
    return _.capitalize(this.$route.meta.layout || defaultLayout) + 'Layout'
  }

  get showWelcomeScreen() {
    return !this.isLoading && this.documents.length <= 1 && this.isWelcomeScreen
  }

  get isSpinner() {
    return this.isLoading || (!this.isLogged && this.isAuthRequired)
  }

  // * === === === === === === === === === ===
  // * Watchers 👀 👀 👀 👀 👀 👀 👀 👀 👀 👀

  // Do app initialization flow, once all data has been fetched
  @Watch('isLoading')
  checkIfAppReady(isLoading: boolean) {
    if (this.isAppInit || isLoading) {
      return
    }

    this.isAppInit = true

    // If path query is set - go to folder
    const path = this.$route.query.path as string
    if (path) {
      this.setCurrentPath(path)
    }
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  mounted() {
    this.initApp()
    Sortable.mount(new MultiDrag())
  }
}
</script>

<template>
  <v-app class="restrict-width" style="background:white">
    <vue-headful :title="`${appName} - ${$text.DocumentsStorage}`" />

    <!-- PROGRESSBAR -->
    <TheLoader />

    <!-- SNACKBAR: display msgs -->
    <TheSnackbar />

    <!-- FULLSCREEN PAGES -->
    <Spinner v-if="isSpinner" :fullscreen="true" />

    <!-- WELCOME SCREEN -->
    <template v-if="!isLoading && !isNoauth && isLogged">
      <WelcomeScreen v-if="showWelcomeScreen" />
    </template>

    <component :is="layout" />
  </v-app>
</template>

<style lang="scss">
html {
  // Commented out for purpose of fixing scrollbar on drawers
  font-family: 'Open Sans', sans-serif !important;

  body {
    min-width: 350px;
  }
}

// ReCaptcha badge - should stay on top of dialog backdrops
.grecaptcha-badge {
  z-index: 1000;
}

.v-card.v-card--outlined {
  border: none !important;
}

.restrict-width {
  min-width: 350px;
}

// t__fade: transitioning loader, fade in/out
.t__fade {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.5s;
  }
  &-enter,
  &-leave-to {
    opacity: 0;
  }
}

.t__fade-spinner {
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

@media (max-width: 600px) {
  .mobile-no-padding {
    padding: 0;
  }
}

h1 {
  color: gray;
  font-size: 2.45em;
  margin-bottom: 2rem;
  font-weight: 500;
}

// Printing page - remove header/footer
@page {
  margin: 0;
}

@media print {
  .no-print,
  .no-print * {
    display: none !important;
  }

  .print-no-padding {
    padding: 0 !important;
  }

  .print-show {
    display: block !important;
  }

  .print-small {
    transform: scale(0.5);
    transform-origin: top left;
  }

  @page {
    size: auto;
    margin: 0 10mm 0 10mm;
  }
}

// Transition for switching dialogs to fullscreen
.dialog-right-transition {
  &-enter,
  &-leave-to {
    transform: translateX(100%);
  }
}
</style>
