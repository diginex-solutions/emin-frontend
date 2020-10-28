<script lang="ts">
import { Getter as G } from 'vuex-class'
import { Vue, Component, Prop } from 'vue-property-decorator'
import _ from 'lodash'
import moment from 'moment'
import Comment from '@/components/Comment.vue'
import CommentNew from '@/components/CommentNew.vue'
import { AuthS } from '@/types/'
import Stx from '@/types/stx.ts'

type Feed = any

@Component({ components: { Comment, CommentNew } })
export default class TheCaseFeed extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...AuthS.getUser) getUser: Auth.User

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop() feed: Feed[]
  @Prop() theCase: Cases.Record

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get historyActions() {
    return Stx.historyActions
  }

  // * Returns feed grouped by day of creation (date)
  // * Object key serves as a group date
  get feedGrouped() {
    // Sort by date, oldes first
    const sorterByDate = (doc: Cases.CaseFeedItem) => doc.createdAt
    const sortedFeed = _.orderBy(this.feed, sorterByDate, 'asc')

    // Group feed by day
    const feedGrouped = _.groupBy(sortedFeed, ({ createdAt }) =>
      moment(moment(createdAt).toDate())
        .startOf('isoWeek')
        .format()
    )

    // Format group header
    return _.mapKeys(feedGrouped, this.formatGroupLabel as any)
  }

  get eventTypes() {
    return {
      created: 'created',
      comment: 'comment',
      userJoin: 'userJoin',
      file: 'file',
      managerAssigned: 'managerAssigned',
      managerRemoved: 'managerRemoved',
      caseNew: 'caseNew',
      caseInProgress: 'caseInProgress',
      caseClosed: 'caseClosed'
    }
  }

  get eventData() {
    return {
      managerRemoved: 'managerRemoved',
      closed: 'closed'
    }
  }

  get commentStyle() {
    const smallScreen =
      this.$vuetify.breakpoint.xs ||
      this.$vuetify.breakpoint.sm ||
      this.$vuetify.breakpoint.md
    return {
      whiteSpace: smallScreen ? 'normal' : 'nowrap'
    }
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  viewAction(action: Forms.Record) {
    this.$emit('viewAction', action)
  }

  // Format group key (header) to represent date, with custom for today/yesterday
  formatGroupLabel(value: string, feedDate: string) {
    // difference between today, and feed date
    const diff = moment().diff(feedDate, 'day')

    // Exception for today/yesterday
    if (diff === 0 || diff === 1) {
      return diff === 0 ? this.$text.Today : this.$text.Yesterday
    }

    // Regular date format
    return moment(feedDate).format('DD MMM YYYY')
  }

  formatFullname(user: UserDirectory.Record) {
    return user ? `${user.name} ${user.surname}` : ''
  }

  getCaseStatusChange(item: any) {
    const getStatusText = (fromStatus: string, toStatus: string) => {
      const statusChanged = this.$text.CaseStatusChanged
      const to = this.$text.To
      return `${statusChanged} ${fromStatus} ${to} ${toStatus} ${this.$text.AtTime}`
    }
    const {
      CaseStatusInProgress: inProgress,
      CaseStatusNew: statusNew,
      CaseStatusClosed: closed,
      CaseCreatedAt: createdAt
    } = this.$text

    let fromStatus = ''
    if (item.action === this.eventTypes.caseInProgress) {
      fromStatus =
        item.data && item.data === this.eventData.closed ? closed : statusNew
    }

    switch (item.action) {
      case this.eventTypes.caseNew:
        return item.data === this.eventData.managerRemoved
          ? getStatusText(inProgress, statusNew)
          : createdAt
      case this.eventTypes.caseClosed:
        return getStatusText(inProgress, closed)
      case this.eventTypes.caseInProgress:
        return getStatusText(fromStatus, inProgress)
      default:
        break
    }
  }
}
</script>

<template>
  <div class="case-feed mx-5 pl-3">
    <div v-for="(group, index) in feedGrouped" :key="index">
      <div class="case-feed__header">
        <span>{{ index }}</span>
      </div>
      <div v-for="item in group" :key="item.id" class="case-feed__item">
        <!-- <div
          v-if="item.action === eventTypes.created"
          class="content pt-5 pb-5"
        >
          <div style="white-space: nowrap;">
            <v-icon>mdi-clipboard-plus</v-icon>
            <span class="ml-1 mr-1">{{ $text.CaseCreatedAt }} {{ $text.AtTime }}</span>
            <i>{{ item.createdAt | formatDate }}</i>
          </div>
        </div> -->
        <div v-if="item.action === 'comment'" class="content pt-5 pb-5">
          <Comment :item="item" />
        </div>
        <div
          v-else-if="item.action === eventTypes.caseNew"
          class="content pt-5 pb-5"
        >
          <div :style="commentStyle">
            <v-icon>mdi-clipboard-alert</v-icon>
            <span class="ml-1 mr-1">{{ getCaseStatusChange(item) }}</span>
            <i>{{ item.createdAt | formatDate }}</i>
          </div>
        </div>
        <div
          v-else-if="item.action === eventTypes.caseClosed"
          class="content vertical pt-5 pb-5"
        >
          <div :style="commentStyle">
            <v-icon>mdi-clipboard-alert</v-icon>
            <span class="ml-1 mr-1">{{ $text.CaseClosedAt }}</span>
            <i>{{ item.createdAt | formatDate }}</i>
          </div>
          <div :style="commentStyle">
            <v-icon>mdi-clipboard-alert</v-icon>
            <span class="ml-1 mr-1">{{ getCaseStatusChange(item) }}</span>
            <i>{{ item.createdAt | formatDate }}</i>
          </div>
        </div>
        <div
          v-else-if="item.action === eventTypes.caseInProgress"
          class="content pt-5 pb-5"
        >
          <div :style="commentStyle">
            <v-icon>mdi-clipboard-alert</v-icon>
            <span class="ml-1 mr-1">{{ getCaseStatusChange(item) }}</span>
            <i>{{ item.createdAt | formatDate }}</i>
          </div>
        </div>
        <div
          v-else-if="item.action === eventTypes.userJoin"
          class="content pt-5 pb-5"
        >
          <div :style="commentStyle">
            <v-icon>mdi-account</v-icon>
            <span class="ml-1 mr-1">
              <!-- // TODO: potentially bad translation, use template -->
              {{ $text.User }}
              <span v-text="item.recipient.email" />
              {{ $text.WasAddedAt }}
            </span>
            <i>{{ item.createdAt | formatDate }}</i>
          </div>
        </div>
        <div
          v-else-if="item.action === eventTypes.file"
          class="content pt-5 pb-5"
        >
          <div :style="commentStyle">
            <v-icon>mdi-attachment</v-icon>
            <span class="ml-1">
              <!-- // TODO: potentially bad translation, use template -->
              {{ $text.File }}
              <b>
                <a :href="item.file.uri">{{ item.file.name }}</a>
              </b>
              {{ $text.WasUploadedAt }}
            </span>
            <i>{{ item.createdAt | formatDate }}</i>
            {{ $text.By }}
            <i>{{ item.initiator.email }}</i>
          </div>
        </div>
        <div
          v-else-if="item.action === eventTypes.managerAssigned"
          class="content pt-5 pb-5"
        >
          <div :style="commentStyle">
            <v-icon>mdi-account</v-icon>
            <span class="ml-1 mr-1">
              {{ $text.AssignedCase }}
              <span v-text="formatFullname(item.manager)" />
              {{ $text.AtTime }}
            </span>
            <i>{{ item.createdAt | formatDate }}</i>
          </div>
        </div>
        <div
          v-else-if="item.action === eventTypes.managerRemoved"
          class="content pt-5 pb-5"
        >
          <div :style="commentStyle">
            <v-icon>mdi-account</v-icon>
            <span class="ml-1 mr-1">
              {{ $text.RemoveCase }}
              <span v-text="formatFullname(item.manager)" />
              {{ $text.AtTime }}
            </span>
            <i>{{ item.createdAt | formatDate }}</i>
          </div>
        </div>
      </div>
    </div>

    <!-- Comment add -->
    <div v-if="theCase.status !== 'closed'" class="case-feed__item mt-5 mb-5">
      <CommentNew class="content" :theCase="theCase" />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.case-feed {
  &__header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: 1.1em;
    margin-top: 1.5rem;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    &:not(.no-border):last-child {
      .content {
        border-bottom: none;
      }
    }

    .content {
      border-bottom: 1px solid #eeeeee;
      max-width: 900px;
      display: flex;
      flex-grow: 1;
      justify-content: flex-start;

      &.vertical {
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
      }
    }
  }
}
</style>
