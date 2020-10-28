<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { ArticlesS } from '@/types'
import { finderById } from '@/utils/helpers'

@Component({})
export default class ArticleFeedback extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @A(...ArticlesS.fetchFeedback) fetchArticleFeedback: Articles.FetchFeedbackA
  @G(...ArticlesS.getImprovements) improvements: Articles.Improvement[]

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Object) article: Articles.Record

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isLoading = false //* TODO: needed when articles are fetched dynamically
  feedback: Articles.Feedback[] = []

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  //* When component is mounted - fetch article by ID specified in articleId param
  mounted() {
    this.isLoading = true
    this.feedback = []

    const articleId = this.article.id
    this.fetchArticleFeedback(articleId)
      .then((records: Articles.Feedback[]) => {
        this.feedback = records
        this.isLoading = false
      })
      .catch(() => {
        this.isLoading = false
      })
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  // Returns string - 2 capitalized letters of user name and surname
  getShortName(feedback: Articles.Feedback) {
    const user = feedback.user
    if (!user) return ''

    if (!user.name || !user.surname)
      return user.email.substring(0, 2).toUpperCase()

    return (
      user.name.substring(0, 1).toUpperCase() +
      user.surname.substring(0, 1).toUpperCase()
    )
  }

  feedbackOwner(feedback: Articles.Feedback) {
    return feedback.user
  }

  getImprovement(feedback: Articles.Feedback) {
    const findById = finderById(feedback?.improvementId)
    return this.improvements.find(findById)
  }
}
</script>

<template>
  <div class="article-feedback">
    <div class="ma-5">
      <h2 class="title">{{ $text.UserFeedback }} ({{ feedback.length }})</h2>
    </div>

    <!-- List feedbacks -->
    <div v-for="item in feedback" :key="item.id" class="feedback">
      <div>
        <v-list-item-avatar style="align-self: center">
          <v-avatar class="accent white--text user-avatar">
            {{ getShortName(item) }}
          </v-avatar>
        </v-list-item-avatar>
      </div>
      <div class="feedback__content">
        <div class="feedback__header mt-2 mb-2">
          <span>{{ item.user.name + ' ' + item.user.surname }}</span>
          <span class="ml-3 faded">
            <span>{{ item.user.email }}</span>
          </span>
          <v-spacer />
          <span :title="item.createdAt | formatDate">
            {{ item.createdAt | formatDate }}
          </span>
        </div>

        <div class="feedback__text">
          <!-- Reason for not being useful -->
          <div class="mb-2" style="color: gray">
            <span v-if="item.isHelpful">{{ $text.FeedbackHelpfulYes }}</span>
            <span v-else>{{ $text.FeedbackHelpfulNo }}:</span>
            {{ getImprovement(item) && getImprovement(item).text }}
          </div>
          <div>{{ item.tellUsMore }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.article-feedback {
  .title {
    color: #444444;
  }

  .feedback {
    display: flex;
    width: 100%;
    color: #333333;

    &__header {
      display: flex;
      align-items: center;
    }

    &__content {
      flex-grow: 1;
      &__button {
        opacity: 0.7;
        cursor: pointer;

        &:hover {
          opacity: 1;
        }
      }

      .faded {
        color: #707070;
      }
    }

    .disabled {
      opacity: 0.3;
    }
  }
}
</style>
