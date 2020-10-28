<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { ArticlesS, SpacesS, AuthS } from '@/types/'
import Spinner from '@/components/Spinner.vue'
import _ from 'lodash'
import moment from 'moment'
import { Routes } from '../router'
import TheBreadcrumbs from './TheBreadcrumbs.vue'
import Cta from '@/components/Cta.vue'
import WorkerCaseCreateDialog from '@/components/WorkerCaseCreateDialog.vue'
import { config } from '../utils/config'
import { Route } from 'vue-router'

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

@Component({
  components: { Spinner, TheBreadcrumbs, Cta, WorkerCaseCreateDialog }
})
export default class TheArticlesIndex extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...ArticlesS.getRecordsByTopic) articles: Articles.Record[]
  @G(...ArticlesS.getTopics) topics: Articles.Topic[]
  @G(...ArticlesS.getTopic) getTopic: Articles.Topic | null
  @A(...ArticlesS.setTopic) setTopic: Articles.SetTopicA
  @G(...ArticlesS.isFetchingArticles) isFetchingArticles: boolean

  //* Can user edit article
  @G(...SpacesS.isManager) isManager: boolean
  @G(...AuthS.getUser) getUser: Auth.User
  @G(...AuthS.getLang) getLang: string

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isWorkerCaseOpen = false

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get topicsList() {
    const topicsTop = {
      id: config.TopicAllId,
      name: this.$text.TopArticles,
      icon: 'mdi-note-multiple'
    }
    return [topicsTop, ...this.topics]
  }

  // Returns feed grouped by day of creation (date)
  // Object key serves as a group date
  get articlesGrouped() {
    const sorterByUpdatedAt = (a: Articles.Record) => a.updatedAt

    if (this.getTopic && this.getTopic.id !== config.TopicAllId) {
      const sortedArticles = _.orderBy(this.articles, sorterByUpdatedAt, 'desc')

      // Group feed by updated at
      const articlesGrouped = _.groupBy(sortedArticles, ({ updatedAt }) =>
        this.formatArticleUpdatedFromNow(updatedAt)
      )
      return articlesGrouped
    }

    const sorterByViewCount = (a: Articles.Record) => a.views
    const sortedArticles = _.orderBy(
      this.articles,
      [sorterByViewCount, sorterByUpdatedAt],
      ['desc', 'desc']
    )

    // Group feed by view count and updated at
    const articlesGrouped = _.groupBy(
      sortedArticles,
      ({ views, updatedAt }) => {
        return `${views}|${this.formatArticleUpdatedFromNow(updatedAt)}`
      }
    )

    // // Format group header
    // const mappedArticlesGrouped = _.mapKeys(articlesGrouped, (_, key) => {
    //   const arrs = key.split('|')
    //   return arrs.length >= 2 ? arrs[1] : arrs[0]
    // })
    return articlesGrouped
  }

  get isMobile() {
    return this.$vuetify.breakpoint.xs
  }

  get articleRowMargins() {
    return this.isMobile
      ? {
          marginLeft: 0,
          marginRight: 0
        }
      : {}
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  //* User can edit article if owner, or space admin, or global admin
  canEditArticle(article: Articles.Record) {
    return this.isManager
  }

  // Format group key (header) to represent date, with custom for today/yesterday
  formatGroupLabel(value: string, feedDate: string): string {
    // difference between today, and feed date
    const diff = moment().diff(feedDate, 'day')

    // Exception for today/yesterday
    if (diff === 0 || diff === 1) {
      return diff === 0 ? this.$text.Today : this.$text.Yesterday
    }

    // Regular date format
    return moment(feedDate).format('DD MMM YYYY')
  }

  getArticlePath({ id: articleId }: Articles.Record) {
    const name = Routes.articles.children.articlesRead.name
    return { name, params: { articleId } }
  }

  getArticleEditPath({ id: articleId }: Articles.Record) {
    const name = Routes.articles.children.articlesEdit.name
    return { name, params: { articleId } }
  }

  onSelectTopic(topic: Articles.Topic) {
    this.setTopic(topic)
  }

  formatArticleUpdatedFromNow(value: Date) {
    if (moment.locale() !== this.getLang) {
      moment.locale(this.getLang)
    }
    return moment(value).fromNow()
  }

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  @Watch('$route', { immediate: true, deep: true })
  onUrlChanged(newVal: Route) {
    if (newVal && newVal.path === '/support/index') {
      const { query = { topicId: '' } } = newVal
      if (query) {
        const topicId =
          query && query.topicId ? `${query.topicId}` : config.TopicAllId
        this.onSelectTopic({ id: topicId, name: '', icon: '' })
      }
    }
  }
}
</script>

<template>
  <v-container class="articles-index">
    <!-- Breadcrumbs Panel -->
    <v-row>
      <TheBreadcrumbs :items="[[$text.Articles, '/articles']]" />
    </v-row>

    <!-- Topics List -->
    <v-row>
      <div class="category__container">
        <div
          v-for="topic in topicsList"
          :key="topic.id"
          @click="onSelectTopic(topic)"
          class="category"
          :class="{
            selected:
              (topic.id === '-1' && !getTopic) ||
              topic.id === (getTopic && getTopic.id)
          }"
        >
          <!-- {{ category.id }} -> {{ getCategory && getCategory.id }} -->
          <div class="category__icon-box">
            <v-icon size="3em">{{ topic.icon }}</v-icon>
          </div>
          <div class="category__text">{{ topic.name }}</div>
        </div>
      </div>
    </v-row>

    <!-- Show loader if fetching articles -->
    <Spinner v-if="isFetchingArticles" />

    <!-- List all articles -->
    <template v-else-if="articles.length > 0">
      <v-row v-for="(group, index) in articlesGrouped" :key="index">
        <v-row class="articles-index__header" :style="articleRowMargins">
          <span>
            {{ $text.Updated }}
            {{ index.indexOf('|') >= 0 ? index.split('|')[1] : index }}
          </span>
        </v-row>
        <v-row
          v-for="item in group"
          :key="item.id"
          class="article__row"
          :style="articleRowMargins"
        >
          <v-col cols="12" class="article mt-5 mb-5">
            <div
              class="article__title"
              :class="{ 'ml-5': !isMobile, 'ml-3': isMobile }"
            >
              <router-link
                :to="getArticlePath(item)"
                class="article__link ml-3"
              >
                {{ item.title }}
              </router-link>
              <v-btn
                v-if="canEditArticle(item)"
                :to="getArticleEditPath(item)"
                class="ml-2 article__link"
                icon
              >
                <v-icon>
                  mdi-pencil
                </v-icon>
              </v-btn>

              <!-- <v-spacer />
              <span class="published-date"> -->
              <!-- // TODO: proper way is to display published date -->
              <!-- {{ item.createdAt | formatAgo }}
              </span> -->
            </div>
            <div class="article__short">
              <span>{{ item.summary ? item.summary : '&nbsp;' }}</span>
            </div>
            <div>
              <router-link
                :to="getArticlePath(item)"
                class="article__link ml-3"
              >
                {{ $text.ReadMore }}
              </router-link>
            </div>
          </v-col>
        </v-row>
      </v-row>
    </template>

    <!-- CTA if no articles -->
    <Cta v-else :message="$text.ArticlesNotFound" icon="mdi-folder-search" />

    <v-row v-if="!isFetchingArticles" class="worker__dialog">
      <span class="mb-6" v-text="$text.CannotFindIssue"></span>
      <v-btn @click="isWorkerCaseOpen = true" v-text="$text.RaiseACase"></v-btn>
      <WorkerCaseCreateDialog
        v-if="isWorkerCaseOpen"
        v-model="isWorkerCaseOpen"
      ></WorkerCaseCreateDialog>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
$colorAccent: #cc2531;

.articles-index {
  &__header {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.9em;
    margin-top: 1.5rem;

    width: 100%;
  }

  .article__row {
    width: 100%;
  }

  .article__link {
    text-decoration: none;
    color: #007ec9;
    word-break: break-word;

    &:hover {
      color: #40b8ff;
    }
  }

  .article {
    display: flex;
    flex-direction: column;
    width: 100%;

    .article__title {
      font-size: 1.3em;
      display: flex;
      align-items: center;

      .published-date {
        font-size: 0.8em;
        color: #888888;
      }
    }
  }

  .category {
    width: 8em;
    height: 8em;
    margin: 1em;
    display: flex;
    flex-direction: column;
    align-items: center;

    border: 2px solid #ffcfd2;
    border-radius: 5%;

    &.selected {
      .space__icon-box {
        background: #e9efff;
      }
      border: 2px solid $colorAccent;
    }
    &:hover:not(.selected) {
      cursor: pointer;

      /* background: #ffcfd2; */
      border: 2px solid $colorAccent;
    }

    &__container {
      display: flex;
      flex-wrap: wrap;
      margin: 1em;
    }

    &__icon-box {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 5em;
      height: 5em;
      margin-bottom: 0.2rem;
    }

    &__text {
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;

      $lineNumber: 2;
      $lineHeihgt: 1.3;
      -webkit-line-clamp: $lineNumber; /* number of lines to show */
      line-height: #{$lineHeihgt}em; /* fallback */
      max-height: #{$lineNumber * $lineHeihgt}em; /* fallback */
    }
  }

  .worker__dialog {
    display: flex;
    flex-direction: column;
    align-items: center;

    span {
      font-weight: bold;
    }
  }
}

@media only screen and (max-width: 360px) {
  .articles-index {
    .category {
      &__container {
        margin: 0;
      }
    }
  }
}

@media only screen and (min-width: 361px) and (max-width: 400px) {
  .articles-index {
    .category {
      &__container {
        margin: 0.5em;
      }
    }
  }
}
</style>
