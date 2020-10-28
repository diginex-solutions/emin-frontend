<script lang="ts">
import { Getter as G } from 'vuex-class'
import { Vue, Component, Prop } from 'vue-property-decorator'
import _ from 'lodash'
import moment from 'moment'
import { AuthS } from '@/types/'
import Stx from '@/types/stx.ts'

@Component({ components: {} })
export default class TheDocHistory extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...AuthS.getUser) getUser: Auth.User

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop() feed: Types.Feed[]

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get historyActions() {
    return Stx.historyActions
  }

  // Returns feed grouped by day of creation (date)
  // Object key serves as a group date
  get feedGrouped() {
    // Sort by date, oldes first
    const sorterByDate = (doc: Docs.History) => doc.date
    const sortedFeed = _.orderBy(this.feed, sorterByDate, 'asc')

    // Group feed by day
    const feedGrouped = _.groupBy(sortedFeed, ({ date }) =>
      moment(moment(date).toDate())
        .startOf('isoWeek')
        .format()
    )

    // Format group header
    return _.mapKeys(feedGrouped, this.formatGroupLabel as any)
  }

  get actionTypes() {
    return {
      actionSent: 'action_created'
    }
  }

  get isMobile() {
    return this.$vuetify.breakpoint.xs
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  viewAction(action: Forms.Record) {
    this.$emit('viewAction', action)
  }

  // Format group key (header) to represent date, with custom for today/yesterday
  formatGroupLabel(value: string, feedDate: string): string {
    // difference between today, and feed date
    const diff = moment().diff(feedDate, 'day')

    // Exception for today/yesterday
    if (diff === 0 || diff === 1) {
      return diff === 0 ? 'Today' : 'Yesterday'
    }

    // Regular date format
    return moment(feedDate).format('DD MMM YYYY')
  }
}
</script>

<template>
  <!-- Main document -->
  <div>
    <div v-for="(group, index) in feedGrouped" :key="index">
      <div class="space-feed__header">
        <span>{{ index }}</span>
      </div>
      <div v-for="item in group" :key="item.id">
        <div
          v-if="item.action === actionTypes.actionSent"
          class="space-feed__item mt-5 mb-5"
          :class="{ mobile: isMobile }"
        >
          <div style="white-space: nowrap;">
            <!-- Show icon, based on authed user - recipient or initiator -->
            <v-icon
              v-if="item.actionObj.recipient.email === getUser.email"
              color="#ff6529"
            >
              mdi-clipboard-alert
            </v-icon>
            <v-icon v-else>{{ historyActions[item.action].icon }}</v-icon>

            <!-- Form name -->
            <a @click="viewAction(item.actionObj)" class="font-weight-medium">
              <span v-if="item.actionObj.template">
                {{ item.actionObj.template.name }}
              </span>
              <span v-else>{{ $text.RequestTypeAccept }}</span>
            </a>
            {{ $text.SentTo }}
            <!-- If current user is recipient -->
            <span v-if="item.actionObj.recipient.email === getUser.email">
              {{ $text.Me }}
            </span>
            <span v-else>{{ item.actionObj.recipient.email }}</span>
          </div>
          <div class="mr-1 ml-1">{{ $text.AtTime }}</div>
          <div>{{ item.date | formatDate }}</div>
        </div>
        <div
          v-else
          class="space-feed__item mt-5 mb-5"
          :class="{ mobile: isMobile }"
        >
          <div style="white-space: nowrap;">
            <v-icon>{{ historyActions[item.action].icon }}</v-icon>
            {{ historyActions[item.action].title }}
          </div>
          <div class="mr-1 ml-1">{{ $text.AtTime }}</div>
          <div>{{ item.date | formatDate }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.space-feed {
  &__header {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.1em;
    margin-top: 1.5rem;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;

    &.mobile {
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
