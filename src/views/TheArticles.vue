<script lang="ts">
import { Vue, Component, Provide, Watch } from 'vue-property-decorator'
import ButtonsPanel from '@/components/ButtonsPanel.vue'
import TheBreadcrumbs from '@/components/TheBreadcrumbs.vue'
import { materialIconsBusiness } from '@/utils/material-icons-list'
import Spinner from '@/components/Spinner.vue'
import AskText from '@/components/AskText.vue'
import FormDialog from '@/components/FormDialog.vue'
import { Routes } from '../router'
import { ArticlesS, SpacesS, AuthS } from '../types'
import { Action as A, Getter as G } from 'vuex-class'
import FormFields from '../stx/stxForms'

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

@Component({
  components: { ButtonsPanel, TheBreadcrumbs, Spinner, AskText, FormDialog }
})
export default class TheArticles extends Vue {
  @A(...ArticlesS.createImprovement)
  vuexCreateImprovement: Articles.CreateImprovementA
  @A(...ArticlesS.createTopic) vuexCreateTopic: Articles.CreateTopicA
  @G(...SpacesS.isManager) isManager: boolean
  @G(...AuthS.getUser) getUser: Auth.User
  @A(...ArticlesS.showArticlesEditSidebar)
  vuexShowArticlesEditSidebar: Articles.SetShowArticlesEditSidebarA
  @G(...ArticlesS.getArticlesEditSidebar) showSidebar: boolean

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  records: Articles.Record[] = []
  isLoading = false
  isCreateCategoryDialog = false
  isCreateTopic = false
  isCreateImprovement = false
  topicFormFields: Types.FormField[] = FormFields.topic()

  @Provide()
  showToggleShowbarButton = this.$vuetify.breakpoint.xs

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  //* Fixing icons - `mdi-` prefix issue
  get materialIcons() {
    const withoutPrefix = materialIconsBusiness.map((n: string) => n.substr(4))
    return [...materialIconsBusiness, ...withoutPrefix]
  }

  get getButtonsPanel() {
    const routeName = this.$route.name

    //* Flags - used to show/hide buttons
    const isTopicsPage =
      routeName === Routes.articles.children.articlesTopics.name

    const isImprovementsPage =
      routeName === Routes.articles.children.articlesImprovements.name

    const isArticlesEditPage =
      routeName === Routes.articles.children.articlesEdit.name

    const isArticlesCreatePage =
      routeName === Routes.articles.children.articlesCreate.name

    //* Define buttons
    //** Button - Create Article
    const create = {
      view: ['mdi-file-plus-outline', this.$text.ArticleNew],
      active: true,
      hidden: !this.isManager,

      onClick: () => {
        const articlesCreate = Routes.articles.children.articlesCreate.name
        this.$router.push({ name: articlesCreate })
      }
    }

    //** Button - View Topics
    const viewTopics = {
      view: [
        'mdi-clipboard-text-outline',
        this.$text.TopicsView,
        this.$text.Topics
      ],
      active: true,
      hidden: isTopicsPage || !this.isManager,
      onClick: () => {
        const pageName = Routes.articles.children.articlesTopics.name
        const query = this.$router.currentRoute.query
        this.$router.push({ name: pageName, query })
      }
    }

    //** Button - Add Topic
    const addTopic = {
      view: ['mdi-clipboard-plus-outline', this.$text.ArticlesTopicNew],
      active: true,
      hidden: !isTopicsPage || !this.isManager,
      onClick: () => {
        this.isCreateTopic = true
      }
    }

    //** Button - improvements
    const viewImprovements = {
      view: [
        'mdi-message-alert-outline',
        this.$text.ImprovementsView,
        this.$text.Improvements
      ],
      active: true,
      hidden: isImprovementsPage || !this.isManager,
      onClick: () => {
        const pageName = Routes.articles.children.articlesImprovements.name
        const query = this.$router.currentRoute.query
        this.$router.push({ name: pageName, query })
      }
    }

    //** Button - Create Improvement
    const addImprovement = {
      view: ['mdi-comment-plus-outline', this.$text.ArticlesImprovementNew],
      active: true,
      hidden: !isImprovementsPage,
      onClick: () => {
        this.isCreateImprovement = true
      }
    }

    const spacer = {
      isSpacer: true,
      view: ['', 'spacer']
    }

    const toggleArticleSidebar = {
      view: ['mdi-dots-vertical', ''],
      active: true,
      hidden:
        (!isArticlesEditPage && !isArticlesCreatePage) ||
        ((isArticlesEditPage || isArticlesCreatePage) &&
          !this.showToggleShowbarButton),
      onClick: () => {
        this.vuexShowArticlesEditSidebar(!this.showSidebar)
      }
    }

    //* Return array with buttons
    return [
      create,
      viewTopics,
      viewImprovements,
      addTopic,
      addImprovement,
      spacer,
      toggleArticleSidebar
    ]
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  // TODO: refac under ButtonPanel component
  onBtnClick(btn: { onClick: () => void }) {
    if (btn) return btn.onClick()
  }

  onSaveImprovement(text: string) {
    this.vuexCreateImprovement({ text }).then(() => {
      this.isCreateImprovement = false
      this.$showSnack(this.$msg.ImprovementCreateSuccess)
    })
  }

  onTopicCreated() {
    this.isCreateTopic = false
    this.$showSnack(this.$msg.TopicCreateSuccess)
  }

  mounted() {
    this.vuexShowArticlesEditSidebar(!this.$vuetify.breakpoint.xs)
  }

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  @Watch('$vuetify.breakpoint.xs')
  breakpointXsUpdated(value: boolean) {
    this.showToggleShowbarButton = value
    this.vuexShowArticlesEditSidebar(!this.showToggleShowbarButton)
  }
}
</script>

<template>
  <v-container class="articles" grid-list-md pa-0 ma-0 fluid>
    <v-layout wrap pa-0>
      <v-flex xs12 pa-0>
        <!-- Buttons panel, empty to maintain design -->
        <ButtonsPanel :buttons="getButtonsPanel" @btnClick="onBtnClick" />

        <AskText
          v-if="isCreateImprovement"
          v-model="isCreateImprovement"
          :title="$text.ImprovementName"
          :inputTitle="$text.Text"
          :btnSubmit="$text.Save"
          :btnCancel="$text.Cancel"
          :isLoading="isLoading"
          @onSubmit="onSaveImprovement"
          @onCancel="isCreateImprovement = false"
        />

        <!-- Create topic -->
        <FormDialog
          v-if="isCreateTopic"
          v-model="isCreateTopic"
          :formFields="topicFormFields"
          :titleNew="$text.TopicNew"
          :onCreate="vuexCreateTopic"
          @onSuccess="onTopicCreated"
        />
      </v-flex>
      <v-flex xs12 pa-0 ml-5 mr-5 class="article-child">
        <Spinner v-if="isLoading" />

        <router-view />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<style lang="scss" scoped>
.article-child {
  width: calc(100% - 40px);
}
</style>
