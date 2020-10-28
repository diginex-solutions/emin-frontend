<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { Action as A } from 'vuex-class'
import Stx from '@/types/stx.ts'
import { toggleScrollbar } from '../utils/helpers'
import Dialog from '@/mixins/Dialog'
import { FormsS } from '@/types'

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  mixins: [Dialog]
})
export default class FormHistoryDrawer extends Mixins(Dialog) {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @A(...FormsS.fetchHistory) fetchHistory: Forms.FetchHistoryA

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop() form: Forms.Record

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  formHistory: Forms.History[] = []

  headers = [
    {
      text: 'Type',
      value: 'type',
      sortable: false
    },
    {
      text: 'Date',
      value: 'createdAt',
      sortable: false
    },
    {
      text: 'Status',
      value: 'status',
      sortable: false
    }
  ]

  isLoadingHistory = false

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get historyActions() {
    return Stx.historyActions
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  mounted() {
    toggleScrollbar(true) // hide main scrollbar

    this.isLoadingHistory = true
    this.formHistory = []

    this.fetchHistory(this.form).then((history: Forms.History[]) => {
      this.formHistory = history
      this.isLoadingHistory = false
    })
  }

  destroyed() {
    toggleScrollbar(false) // show main scrollbar
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  getUserName(user: History.User) {
    if (!user || !user.name) {
      return '-'
    }
    return user.name + ' ' + user.surname
  }

  // TODO: dispatch to open forms history, same as actions. Needs api endpoint implementation
  onDownloadSummary() {
    const routeData = this.$router.resolve({
      name: 'history',
      query: { id: this.form.id }
    })
    window.open(routeData.href, '_blank')
  }
}
</script>

<template>
  <v-navigation-drawer v-model="isOpen" right fixed app width="600" temporary>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          <span class="header">{{ $text.AuditTrail }}</span>
        </v-list-item-title>
        <v-list-item-subtitle class="header__subtitle mt-2">
          <span class="pl-3" v-text="$text.HistoryInfo" />
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action>
        <v-btn icon @click="isOpen = false">
          <v-icon size="30" color="grey lighten-1">close</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>

    <v-divider></v-divider>
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>
            <span class="header">{{ $text.History }}</span>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-data-table
      v-if="formHistory && formHistory.length > 0"
      :headers="headers"
      :items="formHistory"
      item-key="id"
      disable-pagination
      hide-default-footer
    >
      <template v-slot:item.type="{ item }">
        <span style="white-space: nowrap;">
          <v-icon>{{ historyActions[item.type].icon }}</v-icon>
          {{ historyActions[item.type].title }}
        </span>
      </template>
      <template v-slot:item.createdAt="{ item }">
        {{ item.createdAt | formatDate }}
      </template>
      <template v-slot:item.status="{ item }">
        <v-icon
          v-if="item.status === false"
          color="#51bbfe"
          :title="$text.HistoryTimestampPending"
        >
          {{ 'autorenew' }}
        </v-icon>
        <v-icon v-else color="#39c776" :title="$text.HistoryTimestampCompleted">
          {{ 'check_circle' }}
        </v-icon>
      </template>
    </v-data-table>

    <div v-else-if="isLoadingHistory" class="spinner-container">
      <v-progress-circular :size="20" :width="2" indeterminate />
    </div>
    <div v-else>{{ $text.HistoryEmpty }}</div>
  </v-navigation-drawer>
</template>

<style lang="scss" scoped>
$fontColor: #666666;
$colorAccent: #cc2531;

.header {
  margin-left: 12px;
  color: $fontColor;
  font-size: 1.4em;

  &__subtitle {
    display: flex !important;
    white-space: normal !important;
    align-items: center !important;
  }
}

.download-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  color: $colorAccent;

  span {
    font-size: 1em;
  }
}

.spinner-container {
  justify-content: center;
  align-items: center;
  display: flex;
}
</style>
