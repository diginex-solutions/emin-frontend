<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { DocsS, RootG } from '@/types/'
import Stx from '@/types/stx.ts'
import { toggleScrollbar } from '../utils/helpers'
import Dialog from '@/mixins/Dialog'
import { Routes } from '../router'

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  mixins: [Dialog]
})
export default class DocsHistoryDrawer extends Mixins(Dialog) {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @A(...DocsS.fetchDocumentHistory) fetchHistory: Docs.FetchHistoryA
  @G(...DocsS.getDocumentHistory) getDocumentHistory: Docs.History[]
  @G(RootG.isLoading) isLoading: boolean

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop() document: Docs.Record

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  headers = [
    {
      text: this.$text.Action,
      value: 'action',
      sortable: false
    },
    {
      text: this.$text.Date,
      value: 'date',
      sortable: false
    },
    {
      text: this.$text.FileOwner,
      value: 'fileOwner',
      sortable: false,
      align: 'center'
    },
    {
      text: this.$text.User,
      value: 'user',
      sortable: false,
      align: 'center'
    },
    {
      text: this.$text.Status,
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
    toggleScrollbar(true) // show main scrollbar

    this.isLoadingHistory = true
    this.fetchHistory(this.document).then(() => {
      this.isLoadingHistory = false
    })
  }

  destroyed() {
    toggleScrollbar(false) // hide main scrollbar
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  getUserName(user: History.User) {
    if (!user || !user.name) {
      return '-'
    }
    return user.name + ' ' + user.surname
  }

  onDownloadSummary(record: Spaces.Record) {
    const queryOld = this.$router.currentRoute.query

    const path = {
      name: Routes.history.name,
      params: { spaceId: record.id },
      query: { ...queryOld, id: this.document.id }
    }

    const routeData = this.$router.resolve(path)
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
      v-if="getDocumentHistory && getDocumentHistory.length > 0"
      :headers="headers"
      :items="getDocumentHistory"
      item-key="id"
      disable-pagination
      hide-default-footer
    >
      <template v-slot:item.action="{ item }">
        <span style="white-space: nowrap;">
          <v-icon>{{ historyActions[item.action].icon }}</v-icon>
          {{ historyActions[item.action].title }}
        </span>
      </template>
      <template v-slot:item.fileOwner="{ item }">
        {{ getUserName(item.fileOwner) }}
      </template>
      <template v-slot:item.user="{ item }">
        {{ getUserName(item.user) }}
      </template>
      <template v-slot:item.date="{ item }">
        {{ item.date | formatDate }}
      </template>
      <template v-slot:item.status="{ item }">
        <v-icon
          v-if="item.status"
          color="#39c776"
          :title="$text.HistoryTimestampCompleted"
        >
          {{ 'check_circle' }}
        </v-icon>
        <v-icon v-else color="#51bbfe" :title="$text.HistoryTimestampPending">
          autorenew
        </v-icon>
      </template>
    </v-data-table>

    <v-list v-if="getDocumentHistory && getDocumentHistory.length > 0">
      <v-list-item link @click="onDownloadSummary">
        <v-list-item-content>
          <v-list-item-title>
            <span class="download-btn" v-text="$text.HistoryPrint" />
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
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
