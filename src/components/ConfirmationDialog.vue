<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { i18n } from '@/plugins/i18n'
import Dialog from '@/mixins/Dialog.ts'
import { Msg } from '@/plugins/i18n'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

interface VueRef extends Element {
  $el: HTMLElement
}

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  mixins: [Dialog]
})
export default class ConfirmationDialog extends Mixins(Dialog) {
  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop(Boolean) isLoading: boolean // * Show spinner on buttons if waiting response
  @Prop(Boolean) hideCancleBtn: boolean // * Toggle cancel button visibility
  @Prop(Boolean) persistent: boolean // * Prevent closing dialog by clicking backdrop
  @Prop(String) title: string // * Text displayed in header
  @Prop(Function) action: () => {} | undefined // * Action to be executed upon confirming
  @Prop(String) body: string // * Text displayed as body
  @Prop({ default: i18n.tc(Msg.Confirm), type: String })
  submitButtonText: string

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  mounted() {
    setTimeout(() => {
      const confirmBtn = this.$refs.confirmBtn as VueRef
      confirmBtn?.$el?.focus()
    }, 100)
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  onSubmit() {
    if (this.action) {
      return this.action()
    }
    this.isOpen = false
  }
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="350" :persistent="persistent">
    <v-card>
      <!-- *** Title and message of the confirmation -->
      <v-card-title>
        <span class="headline">{{ title }}</span>
      </v-card-title>
      <v-card-text>{{ body }}</v-card-text>

      <!-- *** Action buttons -->
      <v-card-actions>
        <v-spacer />
        <v-btn
          v-if="!hideCancleBtn"
          :disabled="isLoading"
          color="secondary"
          @click="isOpen = false"
        >
          {{ $text.Cancel }}
        </v-btn>
        <v-btn
          :loading="isLoading"
          ref="confirmBtn"
          color="accent"
          @click="onSubmit"
        >
          {{ submitButtonText }}
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
