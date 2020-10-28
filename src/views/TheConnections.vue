<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component } from 'vue-property-decorator'
import { RootA, ConnectionsS } from '@/types/'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import ButtonsPanel from '@/components/ButtonsPanel.vue'
import TheBreadcrumbs from '@/components/TheBreadcrumbs.vue'
import AskText from '@/components/AskText.vue'
import ConnectionNew from '@/components/ConnectionNew.vue'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type Record = Connections.Record

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

@Component({
  components: {
    ConfirmationDialog,
    ButtonsPanel,
    TheBreadcrumbs,
    AskText,
    ConnectionNew
  }
})
export default class TheConnections extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @A(RootA.showSnackbar) showSnackbar: Store.ActionShowSnackbar
  @G(...ConnectionsS.records) records: Record[]
  @A(...ConnectionsS.delete) vuexDelete: Connections.DeleteA

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isLoading = false
  isCreateDialog = false
  isDeleteDialog = false

  selected: null | Record = null

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get headers(): Types.Header[] {
    return [
      {
        text: this.$text.Name,
        align: 'left',
        value: 'fullname'
      },
      {
        text: this.$text.Email,
        value: 'email'
      },
      {
        text: this.$text.Status,
        value: 'isRegistered'
      },
      {
        text: this.$text.Actions,
        value: 'actions',
        sortable: false,
        width: 180,
        align: 'center'
      }
    ]
  }

  get getButtonsPanel() {
    return [
      {
        view: ['mdi-clipboard-text-outline', this.$text.ConnectionAdd],
        active: true,
        onClick: () => (this.isCreateDialog = true)
      }
    ]
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  onDeleteConfirm(item: Record) {
    this.selected = item
    this.isDeleteDialog = true
  }

  onDelete() {
    if (!this.selected) {
      return
    }

    this.$showSnack(this.$msg.ConnectionDeleteSuccess)
    this.isDeleteDialog = false

    const disableLoading = () => (this.isLoading = false)

    //* Enable loader and dispatch
    this.isLoading = true

    this.vuexDelete(this.selected)
      .then(disableLoading)
      .catch(disableLoading)
  }

  emitEvent(btn: { onClick: () => void }) {
    if (btn) {
      btn.onClick()
    }
  }
}
</script>

<template>
  <div>
    <ConnectionNew v-if="isCreateDialog" v-model="isCreateDialog" />

    <v-container grid-list-md pa-0 ma-0 fluid>
      <v-layout wrap pa-0>
        <v-flex xs12 pa-0>
          <!-- Buttons panel -->
          <ButtonsPanel :buttons="getButtonsPanel" @btnClick="emitEvent" />

          <!-- Breadcrumbs Panel -->
          <TheBreadcrumbs :items="[[$text.Connections, '/connections']]" />

          <!-- Confirm deleting record -->
          <ConfirmationDialog
            v-if="isDeleteDialog"
            v-model="isDeleteDialog"
            :title="$text.ConnectionsDelete"
            :body="$text.ConnectionsDeleteBody"
            :action="onDelete"
            :submitButtonText="$text.Delete"
            :isLoading="isLoading"
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
            <template v-slot:item.fullname="{ item }">
              {{ item.name }} {{ item.surname }}
            </template>

            <template v-slot:item.isRegistered="{ item }">
              {{ item.isRegistered ? $text.Registered : $text.Pending }}
            </template>

            <template v-slot:item.actions="{ item }">
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
