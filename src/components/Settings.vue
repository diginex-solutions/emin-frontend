<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import Stx from '@/types/stx.ts'
import AskText from '@/components/AskText.vue'
import { SettingsS } from '../types'

type Rule = (v: string) => string | true // validation rule type
interface Form extends Element {
  validate: () => null
}

@Component({ components: { AskText } })
export default class SettingsDialog extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(...SettingsS.isShowDashboard) isShowDashboard: boolean
  @A(...SettingsS.create) vuexCreateSetting: Settings.CreateA
  @A(...SettingsS.dashboardDisable)
  vuexDashboardDisable: Settings.DashboardOffA

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  // @Prop(Boolean) value: boolean // * v-model at parent level ; here: showSettings

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  // isLoading: show loader icon if true
  isLoading = false
  showPasswordPopup = false

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  // === === === === === === === === === ===
  // HOOKS

  // === === === === === === === === === ===
  // METHODS

  onApplyCode(code: string) {
    if (this.isLoading) {
      return false
    }
    // debugger
    const VALID_CODE = 'iamadmin'

    if (code.toUpperCase() !== VALID_CODE.toUpperCase()) {
      this.$showSnack(this.$msg.dashboardBadCode)
      return
    }

    this.isLoading = true

    const payload = {
      name: Stx.showDashboard,
      value: true
    }
    this.vuexCreateSetting(payload)
      .then(() => {
        this.isLoading = false
        this.showPasswordPopup = false

        this.$showSnack(this.$msg.dashboardAllowed)
      })
      .catch(() => (this.isLoading = false))
  }

  toogleShowDashboard() {
    if (this.isShowDashboard === true) {
      this.disableDashboard()
    } else {
      this.showPasswordPopup = true
    }
  }

  disableDashboard() {
    if (this.isLoading) {
      return
    }
    this.isLoading = true
    this.vuexDashboardDisable()
      .then(() => {
        this.isLoading = false
        this.$showSnack(this.$msg.dashboardDisabled)
      })
      .catch(() => {
        this.isLoading = false
      })
  }
}
</script>

<template>
  <!-- Settings -->
  <div style="width:50%">
    <AskText
      v-if="showPasswordPopup"
      v-model="showPasswordPopup"
      :title="$text.InputCodeTitle"
      :inputTitle="$text.InputCodeField"
      :btnSubmit="$text.Submit"
      :btnCancel="$text.Cancel"
      :isLoading="isLoading"
      @onSubmit="onApplyCode"
      @onCancel="showPasswordPopup = 'canceled'"
      isPassword
    />
    <v-switch
      :input-value="isShowDashboard"
      @click.prevent="toogleShowDashboard"
      color="#cc2531"
      hide-details
      class="ma-0 unreactive-label"
      :label="$text.DashboardEnable"
    ></v-switch>
  </div>
</template>

<style>
.unreactive-label label {
  pointer-events: none;
}
.unreactive-label:hover {
  cursor: pointer;
}

.unreactive-label:hover
  .v-input--selection-controls__input
  .v-input--selection-controls__ripple:before {
  background: currentColor;
  transform: scale(1.2);
  transition: transform 0.3s;
}
</style>
