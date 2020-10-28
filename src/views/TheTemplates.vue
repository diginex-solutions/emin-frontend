<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component } from 'vue-property-decorator'
import _ from 'lodash'
import { DocsS, TemplatesS } from '@/types/'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import ButtonsPanel from '@/components/ButtonsPanel.vue'
import TheBreadcrumbs from '@/components/TheBreadcrumbs.vue'
import TheTemplatesEdit from '@/components/TheTemplatesEdit.vue'
import SharingDialog from '@/components/SharingDialog.vue'
import { Routes } from '../router'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

type Record = Templates.Record

interface Header {
  text: string
  value: string
  sortable?: boolean
  width?: number
  align?: string
}

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  components: {
    ConfirmationDialog,
    ButtonsPanel,
    TheBreadcrumbs,
    TheTemplatesEdit,
    SharingDialog
  }
})
export default class TheTemplates extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(...DocsS.records) docs: Docs.Record[]
  @G(...TemplatesS.records) records: Templates.Record[]
  @A(...TemplatesS.create) vuexCreate: Templates.CreateA
  @A(...TemplatesS.delete) vuexDelete: Templates.DeleteA

  // DATA === === === === === === === === === ===

  dialogs: {
    isCreate: boolean
    edit: null | Record
    isDelete: boolean
    isDeleting: boolean
    isFormSend: boolean
  } = {
    isCreate: false,
    edit: null,
    isDelete: false,
    isDeleting: false,
    isFormSend: false
  }

  headers: Header[] = [
    {
      text: this.$text.Name,
      align: 'left',
      value: 'name'
    },
    { text: this.$text.inputsCount, value: 'inputsCount' },
    {
      text: this.$text.Actions,
      value: 'actions',
      sortable: false,
      width: 180,
      align: 'center'
    }
  ]

  selected: null | Record = null

  // COMPUTED === === === === === === === === === ===

  get getButtonsPanel() {
    return [
      {
        view: ['mdi-clipboard-text', this.$text.PanelNewTemplate],
        onClick: () => (this.dialogs.isCreate = true),
        active: true
      }
    ]
  }

  // === === === === === === === === === ===
  // METHODS

  editTemplate(template: Record) {
    if (this.hasActions(template)) {
      this.$showSnack(this.$msg.templateOnlyName)
    }

    this.dialogs.isCreate = true
    this.dialogs.edit = template
  }

  deleteTemplate(item: Record) {
    if (this.hasActions(item)) {
      return this.$showSnack(this.$msg.templateIsUsed)
    }

    this.selected = item
    this.dialogs.isDelete = true
  }

  // True if any documents with attached template are found
  hasActions(item: Record) {
    const findActionByTemplate = (a: Forms.Record) =>
      a.isInitiator && a.template && a.template.id === item.id
    const filterByTemplate = (d: Docs.Record) =>
      d.actions && d.actions.find(findActionByTemplate)

    const templateDocs = this.docs.filter(filterByTemplate)

    return templateDocs.length > 0
  }

  onDelete() {
    if (!this.selected) {
      return
    }

    this.dialogs.isDeleting = true // enable loader for prompt box buttons

    // Dispatch to delete - on result disable loaders and close dialogs
    this.vuexDelete(this.selected)
      .then(() => {
        this.dialogs.isDeleting = false
        this.$showSnack(this.$msg.templateIsDeleted)
        this.dialogs.isDelete = false
      })
      .catch(() => {
        this.dialogs.isDeleting = false
        this.dialogs.isDelete = false
      })
  }

  onClone(record: Record) {
    const newRecord = _.cloneDeep(record)
    newRecord.name += ' (copy)'

    this.vuexCreate(newRecord)
      .then(() => {
        this.$showSnack(this.$msg.templateNewSuccess)
      })
      .catch(() => {
        // TODO: backend integration
        return
      })
  }

  getTemplatePath(templateId: string) {
    return {
      name: Routes.template.children.results.name,
      params: { templateId }
    }
  }

  emitEvent(btn: { onClick: () => void }) {
    if (btn) {
      btn.onClick()
    }
  }

  onAddForm(template: Templates.Record) {
    this.dialogs.isFormSend = true
    this.dialogs.edit = template
  }
}
</script>

<template>
  <div>
    <!-- DIALOGS -->
    <TheTemplatesEdit
      v-if="dialogs.isCreate"
      v-model="dialogs.isCreate"
      :edit.sync="dialogs.edit"
    />

    <!-- Dialog: create form with no attached document -->
    <SharingDialog
      v-if="dialogs.isFormSend"
      v-model="dialogs.isFormSend"
      :template="dialogs.edit"
    />

    <!-- MAIN -->
    <v-container grid-list-md pa-0 ma-0 fluid>
      <v-layout wrap pa-0>
        <v-flex xs12 pa-0>
          <!-- Buttons panel -->
          <ButtonsPanel :buttons="getButtonsPanel" @btnClick="emitEvent" />

          <!-- Breadcrumbs Panel -->
          <TheBreadcrumbs :items="[[$text.Templates, '/templates']]" />

          <!-- Confirm deleting template -->
          <ConfirmationDialog
            v-if="dialogs.isDelete"
            v-model="dialogs.isDelete"
            :title="$text.TemplatesConfirmDeleteTitle"
            :body="$text.TemplatesConfirmDelete"
            :action="onDelete"
            :submitButtonText="$text.Delete"
            :isLoading="dialogs.isDeleting"
          />
        </v-flex>
        <v-flex xs12 pa-0 ml-5 mr-5>
          <v-data-table
            :headers="headers"
            :items="records"
            item-key="id"
            color="accent"
          >
            <template v-slot:item.name="{ item }">
              <router-link :to="getTemplatePath(item.id)">
                {{ item.name }}
              </router-link>
            </template>

            <template v-slot:item.inputsCount="{ item }">
              {{ item.inputs.length }}
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn icon @click="onAddForm(item)" :title="$text.FormSend">
                <v-icon color="#62c899">mdi-clipboard-plus</v-icon>
              </v-btn>

              <v-btn icon @click="editTemplate(item)" :title="$text.Edit">
                <v-icon color="grey lighten-1">edit</v-icon>
              </v-btn>

              <v-btn icon @click="onClone(item)" :title="$text.PanelClone">
                <v-icon color="grey lighten-1">content_copy</v-icon>
              </v-btn>

              <v-btn icon @click="deleteTemplate(item)" :title="$text.Delete">
                <v-icon color="grey lighten-1">close</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<style lang="scss"></style>
