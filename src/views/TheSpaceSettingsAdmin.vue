<script lang="ts">
import { Action as A } from 'vuex-class'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { SpacesS } from '@/types/'
import FormFields from '@/stx/stxForms'
import FormParser from '@/components/FormParser.vue'
import ButtonsPanel from '@/components/ButtonsPanel.vue'
import TheBreadcrumbs from '@/components/TheBreadcrumbs.vue'
import { Routes } from '../router'
import Spinner from '@/components/Spinner.vue'

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  components: { FormParser, ButtonsPanel, TheBreadcrumbs, Spinner }
})
export default class TheSpaceSettingsAdmin extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @A(...SpacesS.updateSettingsAdmin) vuexSave: Spaces.UpdateSettingsAdminA
  @A(...SpacesS.fetchSpace) fetchSpace: Spaces.FetchSpaceA

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  space: Spaces.Record | null = null
  isLoading = false
  formFields: Types.FormField[] = FormFields.spaceSettingsAdmin()

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get getHeaderText() {
    return this.$text.AdminSettings + ` (${this.space?.name})`
  }

  get breadcrumbs() {
    const name = this.space?.name
    return [
      [this.$text.SpacesAdmin, Routes.spacesAdmin.name],
      [name || this.$text.NotFound, '']
    ]
  }

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  // * Populate form fileds to edited record - always non-null
  @Watch('space', { immediate: true }) onSpaceUpdated(space: Spaces.Record) {
    if (!space) return

    const updateValue = (f: Types.FormField) => {
      f.value = space[f.name as Spaces.Fields]
    }
    this.formFields.forEach(updateValue)
    this.formFields = [...this.formFields] // * Trigger update (potential reactivity caveat)
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  //* When component is mounted - fetch required spaces
  mounted() {
    this.isLoading = true

    const spaceId = this.$route.params.spaceId
    this.fetchSpace(spaceId)
      .then((record: Spaces.Record) => {
        this.space = record
        this.isLoading = false
      })
      .catch(() => {
        this.isLoading = false
      })
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  //? Might be issue with updating space after navigation w route-history
  // * User clicked submit button, update Space - dispatch to store
  onSubmitForm(formData: Types.FormData) {
    this.isLoading = true
    const payload = { id: this.space?.id, ...formData }
    this.vuexSave(payload)
      .then((record) => {
        this.onSpaceUpdated(record)
        this.isLoading = false
        this.$showSnack(this.$msg.SpaceUpdateSuccess)
      })
      .catch(() => (this.isLoading = false))
  }
}
</script>

<template>
  <v-container class="space-settings-admin" grid-list-md pa-0 ma-0 fluid>
    <v-layout wrap pa-0>
      <v-flex xs12 pa-0>
        <!-- Buttons panel, empty to maintain design -->
        <ButtonsPanel :buttons="[]" />

        <!-- Breadcrumbs Panel -->
        <TheBreadcrumbs :items="breadcrumbs" isRouter />
      </v-flex>
      <v-flex xs12 pa-0 ml-5 mr-5>
        <Spinner v-if="isLoading" />
        <FormParser
          v-else-if="space"
          :isLoading="isLoading"
          :formFields="formFields"
          :submitBtnText="$text.Save"
          class="elevation-0"
          @onSubmit="onSubmitForm"
          :noCancelBtn="true"
        />
        <div v-else class="not-found">
          <v-icon size="60" class="mb-5" color="#888888">
            mdi-account-switch
          </v-icon>
          <div>{{ $text.SpaceNotFound }}</div>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<style lang="scss" scoped>
.space-settings-admin {
  .not-found {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
    color: #888888;
  }
}
</style>
