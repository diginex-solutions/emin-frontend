<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component } from 'vue-property-decorator'
import { SpacesS } from '@/types/'
import ButtonsPanel from '@/components/ButtonsPanel.vue'
import TheBreadcrumbs from '@/components/TheBreadcrumbs.vue'
import AskText from '@/components/AskText.vue'
import FormFields from '@/stx/stxForms'
import FormDialog from '@/components/FormDialog.vue'
import SpacesIconView from '@/components/SpacesIconView.vue'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type Record = Spaces.Record

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

@Component({
  components: {
    ButtonsPanel,
    TheBreadcrumbs,
    AskText,
    FormDialog,
    SpacesIconView
  }
})
export default class TheSpaces extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...SpacesS.records) records: Spaces.Record[]
  @A(...SpacesS.create) vuexCreate: Spaces.CreateA
  @G(...SpacesS.getSelected) getSelected: Spaces.Record
  @A(...SpacesS.setSelected) setSelected: Spaces.SetSelectedA
  @G(...SpacesS.isAdminGlobal) isAdminGlobal: boolean

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  dialogs: {
    isCreate: boolean
    edit: null | Record
  } = {
    isCreate: false,
    edit: null
  }

  formFields: Types.FormField[] = FormFields.space()
  selected: null | Spaces.Record = null

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  onCreate() {
    this.selected = null
    this.dialogs.isCreate = true
  }

  onBtnClick(btn: { onClick: () => void }) {
    if (btn) {
      btn.onClick()
    }
  }

  onClickSpace(space: Spaces.Record) {
    if (space.id === this.getSelected?.id) {
      return
    }

    this.setSelected(space)
  }
}
</script>

<template>
  <v-container grid-list-md pa-0 ma-0 fluid>
    <v-layout wrap pa-0>
      <v-flex xs12 pa-0>
        <!-- Buttons panel, empty to maintain design -->
        <ButtonsPanel :buttons="[]" @btnClick="onBtnClick" />

        <!-- New space dialog -->
        <FormDialog
          v-if="dialogs.isCreate"
          v-model="dialogs.isCreate"
          :formFields="formFields"
          :titleNew="$text.SpaceNew"
          :onCreate="vuexCreate"
        />

        <!-- Breadcrumbs Panel -->
        <TheBreadcrumbs :items="[[$text.Space, '/spaces']]" />
      </v-flex>
      <v-flex xs12 pa-0 ml-5 mr-5>
        <SpacesIconView @onCreate="onCreate" />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<style lang="scss" scoped>
.space {
  &__container {
    display: flex;
    flex-wrap: wrap;
    margin: 1em;
  }
}
</style>
