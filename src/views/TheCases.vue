<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component } from 'vue-property-decorator'
import { AuthS, CasesS } from '@/types/'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import ButtonsPanel from '@/components/ButtonsPanel.vue'
import AskText from '@/components/AskText.vue'
import CaseCreateDialog from '@/components/CaseCreateDialog.vue'
import { Routes } from '../router'
import Spinner from '@/components/Spinner.vue'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

type Case = Cases.Record

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  components: {
    ConfirmationDialog,
    ButtonsPanel,
    AskText,
    CaseCreateDialog,
    Spinner
  }
})
export default class TheCases extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(...CasesS.records) records: Case[]
  @A(...CasesS.delete) vuexDelete: Cases.DeleteA
  // @A(...CasesS.create) vuexCaseCreate: Cases.CreateA
  @A(...CasesS.update) vuexCaseUpdate: Cases.UpdateA
  @G(...AuthS.isManager) isManager: boolean
  @A(...CasesS.createCaseTypes) vuexCreateCaseTypes: Cases.CreateCaseTypesA

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  dialogs: {
    isCreate: boolean
    edit: null | Cases.Record
    isDelete: boolean
  } = {
    isCreate: false,
    edit: null,
    isDelete: false
  }

  selected: null | Cases.Record = null
  isLoading = false
  isCreateCaseType = false

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get getCaseOpened() {
    return [
      {
        view: ['mdi-clipboard-text-outline', this.$text.NewCase],
        active: true,
        onClick: () => {
          this.selected = null
          this.dialogs.isCreate = true
        }
      }
    ]
  }

  get getButtonsPanel() {
    const routeName = this.$route.name

    const isCaseTypesPage = routeName === Routes.cases.children.caseTypes.name
    const isCasesIndexPage = routeName === Routes.cases.children.casesIndex.name

    return [
      {
        view: ['mdi-clipboard-text-outline', this.$text.NewCase],
        active: true,
        hidden: !this.isManager,
        onClick: () => {
          this.selected = null
          this.dialogs.isCreate = true
        }
      },
      {
        view: ['mdi-format-list-checkbox', this.$text.Cases],
        active: true,
        hidden: isCasesIndexPage || !this.isManager,
        onClick: () => {
          this.selected = null
          const pageName = Routes.cases.children.casesIndex.name
          this.$router.push({ name: pageName })
        }
      },
      {
        view: ['mdi-format-list-checkbox', this.$text.CaseTypes],
        active: true,
        hidden: isCaseTypesPage || !this.isManager,
        onClick: () => {
          this.selected = null
          const pageName = Routes.cases.children.caseTypes.name
          this.$router.push({ name: pageName })
        }
      },
      {
        view: ['mdi-clipboard-plus-outline', this.$text.NewCaseType],
        active: true,
        hidden: !isCaseTypesPage || !this.isManager,
        onClick: () => {
          this.selected = null
          this.isCreateCaseType = true
        }
      }
    ]
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  onDelete() {
    if (!this.selected) {
      return
    }

    this.vuexDelete(this.selected).then(() => {
      this.dialogs.isDelete = false
      this.$showSnack(this.$msg.casesDeleteSuccess)
    })
  }

  emitEvent(btn: { onClick: () => void }) {
    if (btn) {
      btn.onClick()
    }
  }

  onSaveCaseType(text: string) {
    this.vuexCreateCaseTypes([text]).then(() => {
      this.isCreateCaseType = false
      this.$showSnack(this.$msg.CaseTypeCreateSuccess)
    })
  }
}
</script>

<template>
  <div>
    <!-- New case dialog -->
    <CaseCreateDialog v-if="dialogs.isCreate" v-model="dialogs.isCreate" />

    <v-container grid-list-md pa-0 ma-0 fluid>
      <v-layout wrap pa-0>
        <v-flex xs12 pa-0>
          <!-- Buttons panel -->
          <ButtonsPanel :buttons="getButtonsPanel" @btnClick="emitEvent" />

          <!-- Confirm deleting record -->
          <ConfirmationDialog
            v-if="dialogs.isDelete"
            v-model="dialogs.isDelete"
            :title="$text.CaseDeleteTitle"
            :body="$text.CaseDeleteBody"
            :action="onDelete"
            :submitButtonText="$text.Delete"
          />

          <AskText
            v-if="isCreateCaseType"
            v-model="isCreateCaseType"
            :title="$text.CaseType"
            :inputTitle="$text.Text"
            :btnSubmit="$text.Save"
            :btnCancel="$text.Cancel"
            :isLoading="isLoading"
            @onSubmit="onSaveCaseType"
            @onCancel="isCreateCaseType = false"
          />
        </v-flex>
        <v-flex xs12 pa-0 ml-5 mr-5>
          <Spinner v-if="isLoading" />
          <router-view />
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<style lang="scss"></style>
