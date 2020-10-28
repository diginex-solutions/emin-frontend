<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import Dialog from '@/mixins/Dialog.ts'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

interface VueRef extends Element {
  $el: HTMLElement
}

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({ mixins: [Dialog] })
export default class CaseInfoDialog extends Mixins(Dialog) {
  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop(Object) theCase: Cases.Record // * Current case
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="500">
    <v-card>
      <!-- *** Title and message of the confirmation -->
      <v-card-title>
        <span class="headline">{{ $text.CaseInformation }}</span>
      </v-card-title>
      <v-card-text>
        <v-flex>
          <h3>{{ $text.Description }}</h3>
          <span>{{ theCase.description }}</span>
        </v-flex>
        <v-flex mt-4>
          <h3>{{ $text.ResolutionPlan }</h3>
          <span>{{ theCase.resolutionPlan }}</span>
        </v-flex>
        <v-flex mt-4>
          <h3>{{ $text.CaseType }}</h3>
          <span>{{ theCase.caseType }}</span>
        </v-flex>
        <v-flex mt-4>
          <h3>{{ $text.Employee }}</h3>
          <span>{{ theCase.employee }}</span>
        </v-flex>
      </v-card-text>

      <!-- *** Action buttons -->
      <v-card-actions>
        <v-spacer />
        <v-btn color="secondary" @click="isOpen = false">
          {{ $text.Close }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.headline {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
