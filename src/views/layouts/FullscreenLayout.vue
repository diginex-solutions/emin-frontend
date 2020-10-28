<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({})
export default class FullscreenLayout extends Vue {}
</script>

<template>
  <!-- PAGE LAYOUT -->
  <v-content>
    <v-container fill-height fluid class="mobile-no-padding">
      <v-layout row wrap>
        <v-flex xs12 md10 offset-md1 id="fullscreen-layout">
          <!-- PAGES -->
          <router-view />
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<style lang="scss">
h1.page-header {
  margin-top: 25px;
}

#fullscreen-layout {
  margin: 0;
}
</style>
