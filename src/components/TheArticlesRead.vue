<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component } from 'vue-property-decorator'
import { ArticlesS, SpacesS, AuthS } from '@/types/'
import { materialIconsBusiness } from '@/utils/material-icons-list'
import Spinner from '@/components/Spinner.vue'
import Cta from '@/components/Cta.vue'
import ArticleFeedbackForm from '@/components/ArticleFeedbackForm.vue'
import TheBreadcrumbs from './TheBreadcrumbs.vue'
import { Routes } from '../router'
import ArticleFeedback from '@/components/ArticleFeedback.vue'
import { finderById } from '../utils/helpers'

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

@Component({
  components: {
    Spinner,
    TheBreadcrumbs,
    ArticleFeedbackForm,
    Cta,
    ArticleFeedback
  }
})
export default class TheArticles extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...ArticlesS.getRecords) articles: Articles.Record[]
  @A(...ArticlesS.fetchArticle) fetchArticle: Articles.FetchArticleA
  @A(...ArticlesS.countView) countView: Articles.CountViewA

  //* Can user edit article
  @G(...SpacesS.isManager) isManager: boolean
  @G(...AuthS.getUser) getUser: Auth.User
  @G(...ArticlesS.getTopics) topics: Articles.Topic[]

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isLoading = false
  article: Articles.Record | null = null

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  //* Fixing icons - `mdi-` prefix issue
  get materialIcons() {
    const withoutPrefix = materialIconsBusiness.map((n: string) => n.substr(4))
    return [...materialIconsBusiness, ...withoutPrefix]
  }

  get getArticleEditPath() {
    const name = Routes.articles.children.articlesEdit.name
    const articleId = this.article?.id
    return { name, params: { articleId } }
  }

  get editorOption() {
    return {
      readOnly: true,
      theme: 'bubble'
    }
  }

  //* User can edit article if owner, or space admin, or global admin
  get canEditArticle() {
    if (!this.article) return false //? Exn:

    const isUserOwner = this.article.userId === this.getUser.id
    return isUserOwner || this.isManager
  }

  //* Returns topic name of selected article
  get getTopicName() {
    if (!this.article) return '' //? Exn:

    const findById = finderById(this.article.topicId || '')
    const topic = this.topics.find(findById)

    return topic?.name || ''
  }

  get isMobile() {
    return this.$vuetify.breakpoint.xs
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  //* When component is mounted - fetch article by ID specified in articleId param
  mounted() {
    this.isLoading = true
    this.article = null

    const articleId = this.$route.params.articleId
    this.fetchArticle(articleId)
      .then((record: Articles.Record) => {
        this.article = record
        this.isLoading = false

        this.countView(this.article)
      })
      .catch(() => {
        this.isLoading = false
      })
  }
}
</script>

<template>
  <div class="article">
    <v-container>
      <!-- Breadcrumbs Panel -->
      <v-row v-if="article">
        <TheBreadcrumbs
          :items="[
            [$text.Articles, '/support'],
            [getTopicName, '/support?topicId=' + article.topicId],
            [article ? article.title : $text.NotFound, '']
          ]"
          router-mode
        />
      </v-row>

      <Spinner v-if="isLoading" />
      <template v-else-if="article">
        <!-- Categories List -->
        <v-row>
          <v-col>
            <h1 class="mb=0 pb-0" :class="{ titleFontSize: isMobile }">
              <span>
                {{ article.title }}
              </span>
              <v-btn
                v-if="canEditArticle"
                :to="getArticleEditPath"
                class="ml-2 article__link"
                icon
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </h1>
            <div
              class="subtitle"
              :title="$options.filters.formatDate(article.createdAt)"
            >
              {{ $text.ArticlePublishedAt }}
              {{ article.createdAt | formatDate }}
            </div>
            <div class="subtitle" v-if="canEditArticle">
              {{ $text.ViewsCount }}: {{ article.views }}
            </div>

            <quill-editor
              class="editor"
              ref="myTextEditor"
              :content="article.text"
              :options="editorOption"
              :disabled="true"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-divider />
            <ArticleFeedbackForm :articleId="article.id" />
            <!-- List feedbacks, if user has access -->
            <!-- <ArticleFeedback
              v-if="canEditArticle && article"
              :article="article"
            /> -->
          </v-col>
        </v-row>
      </template>
      <!-- CTA if article is not set -->
      <Cta v-else :message="$text.ArticleNotFound" icon="mdi-folder-search" />
    </v-container>
  </div>
</template>

<style lang="scss" scoped>
$colorAccent: #cc2531;

.article {
  .subtitle {
    margin-bottom: 2rem;
    color: #888888;
  }
}

.titleFontSize {
  font-size: 2em;
  margin-bottom: 1rem;
}
</style>
