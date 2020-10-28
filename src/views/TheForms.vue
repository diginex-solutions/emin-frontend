<script lang="ts">
import { Getter as G } from 'vuex-class'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { FormStatuses, FormTypes } from '@/store/formsStore'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import ButtonsPanel from '@/components/ButtonsPanel.vue'
import ActionViewer from '@/components/ActionViewer.vue'
import ActionFiller from '@/components/ActionFiller.vue'
import FormsHistoryDrawer from '@/components/FormsHistoryDrawer.vue'
import _ from 'lodash'
import { FormsS } from '@/types'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

type Record = Forms.Record

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  components: {
    ConfirmationDialog,
    ButtonsPanel,
    ActionViewer,
    ActionFiller,
    FormsHistoryDrawer
  }
})
export default class TheForms extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...FormsS.records) allForms: Record[]
  @Prop(String) selectedActionId: string

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  headers: Types.Header[] = [
    {
      text: this.$text.SR,
      value: 'isInitiator',
      align: 'left',
      width: '70'
    },
    {
      text: this.$text.User,
      value: 'contactEmail',
      align: 'left'
    },
    {
      text: this.$text.Subject,
      value: 'message',
      filterable: false
    },
    {
      text: this.$text.Status,
      value: 'status'
    },
    {
      text: this.$text.Date,
      value: 'dateCreated',
      filterable: false
    },
    // TODO: uncomment to show form type column
    // {
    //   text: 'Type',
    //   value: 'template'
    // },
    // Arman: to disable history drawer comment out code below
    // Start
    {
      text: this.$text.History,
      value: 'actions',
      sortable: false,
      width: 60,
      align: 'center'
    }
    // End
  ]

  selected: null | Forms.Record = null

  dialogs = {
    isView: false,
    isFill: false,
    selectedActionId: ''
  }

  isHistoryDrawer = false

  selectedAction: Forms.Record | null = null // TODO: replace, same as `selected`
  search = '' // User is searching through table

  get forms() {
    const isForm = (r: Forms.Record) => r.type !== FormTypes.verification
    return this.allForms.filter(isForm)
  }

  // * Get sorted forms
  get formsSorted() {
    return _.orderBy(this.forms, 'dateCreated', 'desc')
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  viewAction(action: Forms.Record | null = null) {
    this.selectedAction = action

    if (!action) {
      return
    }

    // Compute isFilled
    const status = this.selectedAction?.status
    const filled =
      status === FormStatuses.accepted || status === FormStatuses.rejected
    const isFilled = filled ? status : false

    // TODO: refac into 2 lines

    // Cloase all dialogs
    this.dialogs.isView = false
    this.dialogs.isFill = false

    // Open appropritate dialog
    if (!action.isInitiator && !isFilled) {
      this.dialogs.isFill = true
    } else {
      this.dialogs.isView = true
    }
  }

  // Search through records, searchable fields: initiator, recipient, or subject
  filterRecords(value: string | number, search: string, form: Forms.Record) {
    const needle = search.toLocaleUpperCase()
    const haystack = form.initiator.email + form.recipient.email + form.message

    // Return result of search, both needle and haystack should be the same case
    return haystack.toLocaleUpperCase().indexOf(needle) !== -1
  }

  onViewHistory(form: Forms.Record) {
    this.selected = form
    this.isHistoryDrawer = true
  }
}
</script>

<template>
  <div class="the-forms">
    <ActionFiller
      v-if="dialogs.isFill"
      v-model="dialogs.isFill"
      :actionRaw="selectedAction"
    />
    <ActionViewer
      v-if="dialogs.isView"
      v-model="dialogs.isView"
      :actionRaw="selectedAction"
    />

    <!-- Drawer: viewing document history -->
    <FormsHistoryDrawer
      v-if="isHistoryDrawer"
      v-model="isHistoryDrawer"
      :form="selected"
    />

    <v-container grid-list-md pa-0 ma-0 fluid>
      <v-layout wrap pa-0>
        <v-flex xs12 pa-0>
          <!-- Buttons panel, empty to maintain design -->
          <ButtonsPanel :buttons="[]" />

          <v-card-title>
            <span class="page-header">{{ $text.Forms }}</span>
            <v-spacer />
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              :label="$text.Search"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
        </v-flex>
        <v-flex xs12 pa-0 ml-5 mr-5>
          <!-- TABLE -->
          <v-data-table
            :headers="headers"
            :items="formsSorted"
            item-key="id"
            color="accent"
            :search="search"
            :custom-filter="filterRecords"
            sort-by="dateCreated"
            sort-desc
          >
            <!-- Show conctact info - diff if authedUser is initiator of the request -->
            <template v-slot:item.isInitiator="{ item }">
              <!-- If  sent out - show recipient email and arrow right red -->
              <span v-if="item.isInitiator">
                <v-icon color="red">mdi-arrow-right-bold</v-icon>
              </span>
              <!-- If received - show sender email and green left arrow -->
              <span v-else>
                <v-icon color="#62c899">mdi-arrow-left-bold</v-icon>
              </span>
            </template>
            <!-- Show conctact info - diff if authedUser is initiator of the request -->
            <template v-slot:item.contactEmail="{ item }">
              <!-- If  sent out - show recipient email and arrow right red -->
              <span v-if="item.isInitiator">
                <a @click="viewAction(item)" style="text-decoration:underline">
                  {{ item.recipient.email }}
                </a>
              </span>
              <!-- If received - show sender email and green left arrow -->
              <span v-else>
                <a @click="viewAction(item)" style="text-decoration:underline">
                  {{ item.initiator.email }}
                </a>
              </span>
            </template>
            <template v-slot:item.message="{ item }">
              <span style="white-space: pre-wrap;">{{ item.message }}</span>
            </template>
            <template v-slot:item.dateCreated="{ item }">
              <span :title="item.dateCreated | formatDate">
                {{ item.dateCreated | formatAgo }}
              </span>
            </template>

            <!-- // TODO: uncomment to show form type column -->
            <!-- <template v-slot:item.template="{ item }">
              <span v-if="item.template" title="Questionnaire">
                <v-icon>mdi-briefcase-check</v-icon>
              </span>
              <span v-else title="Form">
                <v-icon>mdi-clipboard-text</v-icon>
              </span>
            </template>-->

            <!-- Arman: to disable history drawer comment out code below -->
            <!-- Start -->
            <template v-slot:item.actions="{ item }">
              <v-btn icon @click="onViewHistory(item)" :title="$text.History">
                <v-icon color="#ee9000">mdi-history</v-icon>
              </v-btn>
            </template>
            <!-- End -->
          </v-data-table>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<style lang="scss">
.the-forms {
  .page-header {
    color: #333333;
    font-weight: 400;
    font-size: 0.96em;
    margin-left: 2.4rem;
  }
}
</style>
