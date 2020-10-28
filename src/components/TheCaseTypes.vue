<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component } from 'vue-property-decorator'
import { CasesS } from '@/types'
import TheBreadcrumbs from '@/components/TheBreadcrumbs.vue'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'

type CaseType = Cases.CaseType

@Component({
  components: {
    TheBreadcrumbs,
    ConfirmationDialog
  }
})
export default class TheCaseTypes extends Vue {
  @G(...CasesS.getCaseTypes)
  casesTypes: CaseType[]

  @A(...CasesS.deleteCaseType)
  vueDeleteCaseType: Cases.DeleteCaseTypesA

  isDeleteDialog = false
  selected: CaseType
  isLoading = false

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get headers() {
    return [
      {
        text: this.$text.CaseType,
        align: 'left',
        value: 'value'
      },
      {
        text: this.$text.Actions,
        align: 'right',
        value: 'actions',
        width: '200'
      }
    ]
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods
  onDeleteConfirm(item: CaseType) {
    console.log('item', item)
    this.selected = item
    this.isDeleteDialog = true
  }

  onDelete() {
    if (!this.selected) {
      return
    }
    this.isLoading = true
    this.vueDeleteCaseType(this.selected.id)
      .then(() => {
        this.isLoading = false
        this.isDeleteDialog = false
        this.$showSnack(this.$msg.CaseTypeDeleteSuccess)
      })
      .catch(() => {
        this.isDeleteDialog = false
      })
  }
}
</script>
<template>
  <div>
    <v-container grid-list-md pa-0 ma-0 fluid>
      <v-layout wrap pa-0>
        <v-flex xs12 pa-0>
          <!-- Breadcrumbs Panel -->
          <TheBreadcrumbs :items="[[$text.CaseTypes, '/cases/types']]" />
        </v-flex>
        <v-flex xs12 pa-0 ml-5 mr-5>
          <!-- TABLE -->
          <v-data-table
            :headers="headers"
            :items="casesTypes"
            item-key="id"
            color="accent"
          >
            <template v-slot:item.value="{ item }">
              {{ item.value }}
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn icon @click="onDeleteConfirm(item)">
                <v-icon color="grey lighten-1">close</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-flex>

        <!-- Confirm deleting record -->
        <ConfirmationDialog
          v-if="isDeleteDialog"
          v-model="isDeleteDialog"
          :isLoading="isLoading"
          :title="$text.CaseTypeDelete"
          :body="$text.CaseTypeDeleteBody"
          :action="onDelete"
          :submitButtonText="$text.Delete"
        />
      </v-layout>
    </v-container>
  </div>
</template>

<style lang="scss"></style>
