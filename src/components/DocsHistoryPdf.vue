<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { DocsS, AuthS, SpacesS, RootG } from '@/types/'
import Stx from '@/types/stx.ts'
import { config } from '@/utils/config'
import Spinner from '@/components/Spinner.vue'

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Main

@Component({ components: { Spinner } })
export default class DocsHistoryPdf extends Vue {
  @G(...AuthS.isLogged) isLogged: boolean
  @G(RootG.isLoading) isLoading: boolean
  @G(...DocsS.getDocumentHistory) history: Docs.History[]
  @G(...DocsS.getSelectedRecord) doc: Docs.RecordDetailed
  @A(...DocsS.fetchDocumentHistory) fetchHistory: Docs.FetchHistoryA
  @A(...DocsS.fetchDocument) fetchDocument: Docs.FetchDocumentA
  @G(...SpacesS.getSelected) getSelected: Spaces.Record

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get historyActions() {
    return Stx.historyActions
  }

  get isHistoryReady() {
    return this.doc && this.history && this.history.length > 0
  }

  get getConfig() {
    return config
  }

  get isReady() {
    return this.getSelected && this.isLogged && !this.isLoading
  }

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  // If user is logged (aka bearer token is set) - fetch data
  @Watch('isReady')
  fetchUsers(isReady?: boolean) {
    if (!isReady) return

    const docId = this.$route.query.id
    this.fetchDocument(docId as string).then((doc: Docs.Record) =>
      this.fetchHistory(doc)
    )
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  getUserName(user: History.User) {
    if (!user || !user.name) {
      return '-'
    }
    return user.name + ' ' + user.surname
  }

  getUserInfo(user: History.User) {
    const name = this.getUserName(user)
    const companyInfo = user.company ? user.company + ', ' : ''
    return `${name} (${companyInfo}${user.email})`
  }

  getTezosRecordUrl(item: History.Item) {
    type Iterable = {
      [key in string]: string
    }
    const networks: Iterable = {
      mainnet: 'main',
      testnet: 'babylon'
    }
    const dir = networks[item.tezosNetwork || 'mainnet']

    return `https://better-call.dev/${dir}/${item.tezosOpHash}`
  }

  getRecordUrl(item: History.Item) {
    const prefix =
      !item.txNetwork || item.txNetwork === 'mainnet'
        ? ''
        : item.txNetwork + '.'
    return `https://${prefix}etherscan.io/tx/${item.txHash}`
  }
}
</script>

<template>
  <div class="history" id="history" v-if="isLogged && doc">
    <!-- FULLSCREEN-SPINNER -->
    <Spinner v-if="!isHistoryReady" :fullscreen="true" />

    <!-- TODO: uncomment after demo at 23rd April -->
    <!-- <div style="text-align:center;">
      <img width="300" :src="`/img/company-logos/${getConfig.colorLogoFileName}`" />
    </div>-->

    <br />
    <hr style="border: 1px solid #ddd" />
    <br />

    <!-- FILE INFO -->
    <div>
      {{ $text.Date }}:
      <span>{{ doc.uploaded | formatDate }}</span>
    </div>
    <div>
      {{ $text.File }}:
      <span>{{ doc | formatDocName }}</span>
    </div>
    <div>
      {{ $text.Size }}:
      <span>{{ doc.size | filesize }}</span>
    </div>

    <!-- HEADER "HISTORY" -->
    <div style="font-size:32px; margin-top:50px; font-weight:600">
      {{ $text.History }}
    </div>

    <table class="history__table" style="width:100%; margin-top: 20px">
      <thead>
        <tr>
          <th>{{ $text.Action }}</th>
          <th>{{ $text.Date }}</th>
          <th>{{ $text.FileOwner }}</th>
          <th>{{ $text.IPAddress }}</th>
          <th>{{ $text.Proof }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="item in history">
          <tr :key="item.id + 'header'">
            <td class="action">
              <v-icon size="30" class="mr-2">
                {{ historyActions[item.action].icon }}
              </v-icon>
              {{ historyActions[item.action].title }}
            </td>
            <td>{{ item.date | formatDate }}</td>
            <td>{{ item.fileOwner.name + ' ' + item.fileOwner.surname }}</td>
            <td>{{ item.ipAddress }}</td>

            <!-- Explorer link -->
            <td v-if="item.status && item.tezosNetwork" class="confirmed">
              <a :href="getRecordUrl(item)" target="_blank">
                {{ $text.EthereumViewRecord }}
              </a>
              <br />
              <a :href="getTezosRecordUrl(item)" target="_blank">
                {{ $text.TezosViewRecord }}
              </a>
              <br />
            </td>

            <td v-else-if="item.status" class="confirmed">
              <a :href="getRecordUrl(item)" target="_blank">
                {{ $text.RecordView }}
              </a>
              <br />
            </td>

            <td v-else class="pending">
              {{ $text.HistoryPendingConfirmations }}
            </td>
          </tr>
          <tr :key="item.id + 'content'" class="data">
            <td colspan="5">
              <!-- Display action information -->
              <!-- Shared -->
              <div v-if="item.action === historyActions.share.code">
                {{ getUserInfo(item.fileOwner) }} shared with
                {{ getUserInfo(item.user.email) }}
              </div>
              <!-- Unshared -->
              <div v-else-if="item.action === historyActions.unshare.code">
                {{ getUserInfo(item.fileOwner) }} unshared with
                {{ getUserInfo(item.user.email) }}
              </div>
              <!-- Create -->
              <div v-else-if="item.action === historyActions.create.code">
                {{ getUserInfo(item.fileOwner) }} created file at
                {{ item.date | formatDate }}
              </div>
              <!-- Archived -->
              <div v-else-if="item.action === historyActions.archived.code">
                {{ getUserInfo(item.fileOwner) }} archived file at
                {{ item.date | formatDate }}
              </div>
              <!-- Restored -->
              <div v-else-if="item.action === historyActions.restored.code">
                {{ getUserInfo(item.fileOwner) }} restored file at
                {{ item.date | formatDate }}
              </div>
              <!-- Renamed -->
              <div v-else-if="item.action === historyActions.renamed.code">
                {{ getUserInfo(item.fileOwner) }} renamed file at
                {{ item.date | formatDate }}
              </div>
              <!-- Display blockchain status -->
              <div v-if="item.status">
                {{ $text.BlockEthereumHash }}
                <span style="font-family: monospace">{{ item.txHash }}</span>
                <template v-if="item.tezosOpHash">
                  <br />
                  {{ $text.BlockTezosHash }}
                  <span style="font-family: monospace">
                    {{ item.tezosOpHash }}
                  </span>
                </template>
              </div>
              <div v-else>
                {{ $text.BlockPendingConfirmation }}
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <div class="safety-note">
      <h2>{{ $text.BlockInfoHeader }}</h2>
      <p>{{ $text.BLockInfo }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$colorAccent: #cc2531;

.history {
  padding: 20px;
  background: white;
  color: #888888;
  font-size: 25px;

  h1 {
    color: $colorAccent;
    font-family: 'Open Sans', sans-serif;
    font-size: 50px;
    font-weight: 600;
  }

  &__table {
    border-spacing: 0;
    border-collapse: collapse;

    table,
    tr,
    td {
      border-spacing: 0;
      border-collapse: collapse;
    }

    tr.data td {
      text-align: left;
      font-size: 16px;
      padding: 15px;
    }

    td {
      text-align: center;
      border-collapse: collapse;
      font-size: 20px;
      &.action {
        display: flex;
        justify-content: center;
      }

      &.pending {
        font-style: italic;
      }

      &.confirmed a {
        color: $colorAccent;
        text-decoration: none;
      }

      &.pending {
        font-style: italic;
      }
    }

    th,
    td {
      padding: 5px;
    }

    tbody tr {
      border: 1pt solid #dddddd;
    }

    th {
      font-weight: 500;
      color: #cccccc;
    }
  }

  .safety-note {
    margin-top: 50px;
    font-size: 20px;

    h3 {
      margin-bottom: 20px;
    }
  }
}

.t__fade-spinner {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.5s;
  }
  &-enter {
    opacity: 0;
  }
  &-leave-to {
    // transition delay is used so it won't fade out before login view fades out
    transition-delay: 0.5s;
    opacity: 0;
  }
}
</style>
