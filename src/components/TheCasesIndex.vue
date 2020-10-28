<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component } from 'vue-property-decorator'
import { AuthS } from '@/types/'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import ButtonsPanel from '@/components/ButtonsPanel.vue'
import TheBreadcrumbs from '@/components/TheBreadcrumbs.vue'
import { Routes } from '../router'
import { CasesS } from '@/types'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

type Case = Cases.Record

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  components: {
    ConfirmationDialog,
    ButtonsPanel,
    TheBreadcrumbs
  }
})
export default class TheCasesIndex extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(...CasesS.records) records: Case[]
  @A(...CasesS.delete) vuexDelete: Cases.DeleteA
  @A(...CasesS.update) vuexCaseUpdate: Cases.UpdateA
  @G(...AuthS.isManager) isManager: boolean

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  dialogs: {
    isDelete: boolean
  } = {
    isDelete: false
  }

  fixedHeaders: Types.Header[] = [
    {
      text: this.$text.CaseNumber,
      align: 'left',
      value: 'caseNumber'
    },
    {
      text: this.$text.CaseType,
      align: 'left',
      value: 'caseType'
    },
    {
      text: this.$text.ReportedDate,
      align: 'left',
      value: 'createdAt'
    },
    {
      text: this.$text.RelatedTo,
      align: 'left',
      value: 'relatedTo'
    },
    {
      text: this.$text.AssignedTo,
      align: 'left',
      value: 'assignedTo'
    },
    {
      text: this.$text.Status,
      align: 'left',
      value: 'status'
    }
    // TODO: this column is for actions like deleting case
    // {
    //   text: 'Actions',
    //   value: 'actions',
    //   sortable: false,
    //   width: 180,
    //   align: 'center'
    // }
  ]

  colIssueType = {
    text: this.$text.IssueType,
    align: 'left',
    value: 'issueType'
  }

  selected: null | Cases.Record = null

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get headers() {
    return this.isManager
      ? [...this.fixedHeaders, this.colIssueType]
      : this.fixedHeaders
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  formatUser(owner: Cases.User) {
    if (!owner) {
      return ''
    }
    const name = owner.name + ' ' + owner.surname
    return name + ' (' + owner.email + ')'
  }

  onDeleteConfirm(item: Case) {
    this.selected = item
    this.dialogs.isDelete = true
  }

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

  // TODO:
  // onCaseUpdate(name: string) {
  //   const caseUpdate = {
  //     id: this.selected?.id || 'bad_id',
  //     name
  //   }
  //   this.vuexCaseUpdate(caseUpdate).then(() => {
  //     this.$showSnack(this.$msg.casesUpdateSuccess)
  //     this.dialogs.isCreate = false
  //   })
  // }

  getCasePath(theCase: Cases.Record) {
    const name = Routes.case.children.caseFeed.name

    return { name, params: { caseId: theCase.id } }
  }

  formatFullname(owner: UserDirectory.Record) {
    return owner ? `${owner.name} ${owner.surname}` : ''
  }
}
</script>

<template>
  <div>
    <v-container grid-list-md pa-0 ma-0 fluid>
      <v-layout wrap pa-0>
        <v-flex xs12 pa-0>
          <!-- Breadcrumbs Panel -->
          <TheBreadcrumbs :items="[[$text.Cases, '/cases']]" />

          <!-- Confirm deleting record -->
          <ConfirmationDialog
            v-if="dialogs.isDelete"
            v-model="dialogs.isDelete"
            :title="$text.CaseDeleteTitle"
            :body="$text.CaseDeleteBody"
            :action="onDelete"
            :submitButtonText="$text.Delete"
          />
        </v-flex>
        <v-flex xs12 pa-0 ml-5 mr-5>
          <!-- TABLE -->
          <v-data-table
            :headers="headers"
            :items="records"
            item-key="id"
            color="accent"
          >
            <template v-slot:item.caseNumber="{ item }">
              <router-link :to="getCasePath(item)">
                {{ item.caseNumber }}
              </router-link>
            </template>

            <template v-slot:item.createdAt="{ item }">
              {{ item.createdAt | formatDateSimple }}
            </template>

            <template v-slot:item.relatedTo="{ item }">
              {{ formatFullname(item.relatedTo) }}
            </template>

            <template v-slot:item.assignedTo="{ item }">
              {{ formatFullname(item.assignedTo) }}
            </template>

            <template v-slot:item.status="{ item }">
              <span v-if="item.status === 'new'">
                {{ $text.CaseStatusNew }}
              </span>
              <span v-else-if="item.status === 'inProgress'">
                {{ $text.CaseStatusInProgress }}
              </span>
              <span v-else-if="item.status === 'closed'">
                {{ $text.CaseStatusClosed }}
              </span>
            </template>

            <template v-slot:item.issueType="{ item }">
              <span v-if="item.issueType === 'grievance'">
                {{ $text.Grievance }}
              </span>
              <span v-else-if="item.issueType === 'others'">
                {{ $text.Others }}
              </span>
            </template>

            <template v-slot:item.actions="{ item }">
              <!-- <v-btn icon disabled @click="onEdit(item)">
                <v-icon color="grey lighten-1">edit</v-icon>
              </v-btn>-->

              <v-btn icon @click="onDeleteConfirm(item)">
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
