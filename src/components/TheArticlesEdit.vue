<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { ArticlesS } from '@/types/'
import { materialIconsBusiness } from '@/utils/material-icons-list'
import Spinner from '@/components/Spinner.vue'
import { finderById } from '../utils/helpers'
import TheBreadcrumbs from './TheBreadcrumbs.vue'
import { validator } from '@/utils/validator'
import { Rule } from '../stx/stxForms'
import TheArticlesSidebar from '@/components/TheArticlesSidebar.vue'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'

import { Routes } from '../router'
// import { Route } from 'vue-router'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

const DefaultForm: Articles.RecordNew = {
  id: '',
  title: '',
  text: '',
  summary: '',
  topicId: '',
  isPublished: false
}

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

@Component({
  components: {
    Spinner,
    TheBreadcrumbs,
    TheArticlesSidebar,
    ConfirmationDialog
  }
})
export default class TheArticles extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...ArticlesS.getRecords) articles: Articles.Record[]
  @A(...ArticlesS.save) save: Articles.SaveA
  @A(...ArticlesS.delete) deleteArticle: Articles.DeleteA
  @A(...ArticlesS.publish) publish: Articles.PublishA
  @A(...ArticlesS.unpublish) unpublish: Articles.UnpublishA
  @G(...ArticlesS.getTopics) topics: Articles.Topic[]
  @A(...ArticlesS.showArticlesEditSidebar)
  vuexShowArticlesEditSidebar: Articles.SetShowArticlesEditSidebarA
  @G(...ArticlesS.getArticlesEditSidebar) showSidebar: boolean

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isLoading = false
  isFormValid = false // * Synced to form validation
  formData = { ...DefaultForm }
  isPreview = false

  isDeleteDialog = false
  isUnpublishDialog = false
  isPublishDialog = false
  isResetDialog = false

  // * Rules for validating record fields
  rules: { title: Types.Rule[]; text: Types.Rule[]; summary: Types.Rule[] } = {
    title: [(v: string) => validator.required(v)],
    text: [],
    summary: [
      (v: string) => validator.required(v),
      (v: string) => validator.moreOrEqual(v, this.valid.summary.min),
      (v: string) => validator.lessOrEqual(v, this.valid.summary.max)
    ]
  }

  @Watch('isDirty')
  onUpdateQueryDirty(isDirty = false) {
    const query: any = Object.assign({}, this.$route.query)

    if (isDirty) {
      if (query.isDirty) return
      query.isDirty = true
    } else if (query.isDirty) {
      if (!query.isDirty) return
      delete query.isDirty
    }

    this.$router
      .replace({ query: { ...query } })
      .catch((e) => console.log('sol > :', e))
  }

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  //* If preview - hide toolbar and make readonly
  get editorOption() {
    return {
      readOnly: this.isPreview,
      theme: this.isPreview ? 'bubble' : 'snow',

      modules: {
        toolbar: '#toolbar-container',

        ImageResize: {
          modules: ['Resize', 'DisplaySize', 'Toolbar']
        }
      }
    }
  }

  get valid() {
    return {
      title: { min: 10, max: 100 },
      text: { min: 10 },
      summary: { min: 50, max: 500 }
    }
  }

  //* Fixing icons - `mdi-` prefix issue
  get materialIcons() {
    const withoutPrefix = materialIconsBusiness.map((n: string) => n.substr(4))
    return [...materialIconsBusiness, ...withoutPrefix]
  }

  get contentLength() {
    return this.formData.text.length
  }

  get article() {
    const articleId = this.$route.params.articleId
    const findById = finderById(articleId)

    console.log(' finding article by id> :', this.articles.find(findById))

    return this.articles.find(findById)
  }

  get getBreadcrumbs() {
    const result = [[this.$text.Articles, '/support']]

    if (this.article) {
      result.push([this.article.title, this.article.id])
    } else {
      result.push([this.$text.Create, ''])
    }

    return result
  }

  get form(): Types.Form {
    return this.$refs.form as Types.Form
  }

  get isDirty() {
    if (!this.article) return false //* Exn:
    const fd = this.formData //* Shorthand helper

    return (
      fd.id !== (this.article?.id || '') ||
      fd.title !== this.article.title ||
      fd.text !== this.article.text ||
      fd.summary !== this.article.summary ||
      fd.topicId !== this.article.topicId ||
      fd.isPublished !== this.article.isPublished
    )
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  mounted() {
    this.populateFormData()
    if (this.$vuetify.breakpoint.xs) {
      this.vuexShowArticlesEditSidebar(false)
    }
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  populateFormData() {
    this.formData = { ...DefaultForm }
    if (this.article) {
      this.formData = {
        id: this.article?.id || '',
        title: this.article.title,
        text: this.article.text,
        summary: this.article.summary,
        topicId: this.article.topicId,
        isPublished: this.article.isPublished
      }
    } else {
      this.formData.topicId = this.topics[0]?.id
    }
  }

  // * User clicked submit button
  onSave() {
    // *** Cancel form submit if loading, or disabled, or form validation fail
    if (this.isLoading || !this.isFormValid) return false

    const isEdit = !!this.formData.id
    this.isLoading = true

    this.save(this.formData).then((record: Articles.Record) => {
      this.onUpdateQueryDirty()
      this.isLoading = false

      const msg = isEdit
        ? this.$msg.ArticleEditSuccess
        : this.$msg.ArticleNewSuccess
      this.$showSnack(msg)

      //* Goto route
      const name = Routes.articles.children.articlesRead.name
      const params = { articleId: record.id }
      this.$router.push({ name, params })
    })
  }

  onDelete() {
    if (!this.article) return

    this.isLoading = true
    this.deleteArticle(this.article).then(() => {
      this.isLoading = false
      this.$showSnack(this.$msg.ArticleDeleteSuccess)

      const name = Routes.articles.children.articlesIndex.name
      this.$router.push({ name })
    })
  }

  onPublish() {
    if (!this.article) return
    this.isLoading = true
    this.publish(this.article)
      .then(() => {
        this.isLoading = false
      })
      .finally(() => (this.isPublishDialog = false))
  }

  onUnpublish() {
    if (!this.article) return
    this.isLoading = true
    this.unpublish(this.article)
      .then(() => {
        this.isLoading = false
      })
      .finally(() => (this.isUnpublishDialog = false))
  }

  //* Reactivity for the sake of `isDirty`
  onTextChange() {
    this.formData = { ...this.formData }
  }

  onReset() {
    this.populateFormData()
    this.isResetDialog = false
  }
}
</script>

<template>
  <div class="article-edit">
    <v-container>
      <TheArticlesSidebar
        :article="article ? article : formData"
        :topicId.sync="formData.topicId"
        :text="formData.text"
        :isPublished.sync="formData.isPublished"
        :isFormValid="isFormValid"
        :isLoading="isLoading"
        :isEdit="!!(article && article.id)"
        @onReset="populateFormData"
        @onSave="onSave"
        @onDelete="onDelete"
        @onPublish="onPublish"
        @onUnpublish="onUnpublish"
        v-if="showSidebar"
      />
      <!-- Breadcrumbs Panel -->
      <v-row>
        <TheBreadcrumbs :items="getBreadcrumbs" router-mode />
      </v-row>

      <!-- Categories List -->
      <v-row
        class="mx-5"
        :class="{
          'my-5': !$vuetify.breakpoint.xs,
          'my-3': $vuetify.breakpoint.xs
        }"
      >
        <v-form
          ref="form"
          v-model="isFormValid"
          @keydown.enter="onSave"
          @submit="onSave"
          onsubmit="return false;"
          style="width:100%"
        >
          <v-row xs12 v-if="$vuetify.breakpoint.xs">
            <div class="text-center d-flex align-center">
              <v-select
                v-model="formData.topicId"
                :items="topics"
                item-text="name"
                item-value="id"
                outlined
                :label="$text.Topic"
                dense
              ></v-select>
            </div>
          </v-row>
          <v-row xs12>
            <!-- * Input field -->
            <v-text-field
              v-model="formData.title"
              :rules="rules.title"
              :counter="valid.title.max"
              :label="$text.Name"
              required
              ref="input"
            />
          </v-row>

          <!-- Summary -->
          <!-- <v-row xs12>
            <v-textarea
              ref="textarea"
              v-model="formData.summary"
              color="accent"
              :counter="valid.summary.max"
              :rules="rules.summary || []"
              auto-grow
              :label="$text.ArticleSummary"
            />
          </v-row> 
          <v-row xs12 v-if="formData.text.length > valid.text.max">
            <v-alert type="error" width="100%">
              {{ $text.ArticleMaxChars + ' ' + valid.text.max }}
            </v-alert>
          </v-row> 
          <v-row xs12 class="mt-5 mb-5">
            <v-divider />
          </v-row> -->
          <v-row
            xs12
            :class="{
              'my-5': !$vuetify.breakpoint.xs,
              'my-3': $vuetify.breakpoint.xs
            }"
          >
            <div class="editor-header">{{ $text.Description }}</div>
          </v-row>
          <v-row xs12>
            <div id="toolbar-container">
              <span class="ql-formats">
                <select class="ql-font"></select>
                <select class="ql-size"></select>
                <select class="ql-header">
                  <option value="2">Heading 2</option>
                  <option value="3">Heading 3</option>
                  <option value="4">Heading 4</option>
                  <option value="5">Heading 5</option>
                  <option value="6">Heading 6</option>
                  <option value="">Normal</option>
                </select>
              </span>
              <span class="ql-formats">
                <button class="ql-bold"></button>
                <button class="ql-italic"></button>
                <button class="ql-underline"></button>
                <button class="ql-strike"></button>
              </span>
              <span class="ql-formats">
                <select class="ql-color"></select>
                <select class="ql-background"></select>
              </span>
              <span class="ql-formats">
                <button class="ql-script" value="sub"></button>
                <button class="ql-script" value="super"></button>
              </span>
              <span class="ql-formats">
                <!-- <select class="ql-header">
                  <option value="2">Heading 2</option>
                  <option value="3">Heading 3</option>
                  <option value="4">Heading 4</option>
                  <option value="5">Heading 5</option>
                  <option value="6">Heading 6</option>
                  <option value="">Normal</option>
                </select> -->
                <button class="ql-blockquote"></button>
                <button class="ql-code-block"></button>
              </span>
              <span class="ql-formats">
                <button class="ql-list" value="ordered"></button>
                <button class="ql-list" value="bullet"></button>
                <button class="ql-indent" value="-1"></button>
                <button class="ql-indent" value="+1"></button>
              </span>
              <span class="ql-formats">
                <button class="ql-direction" value="rtl"></button>
                <select class="ql-align"></select>
              </span>
              <span class="ql-formats">
                <button class="ql-link"></button>
                <button class="ql-image"></button>
                <button class="ql-video"></button>
                <button class="ql-formula"></button>
              </span>
              <span class="ql-formats">
                <button class="ql-clean"></button>
              </span>
            </div>
            <quill-editor
              class="editor"
              ref="myTextEditor"
              v-model="formData.text"
              :options="editorOption"
              :disabled="isPreview"
              @change="onTextChange"
            ></quill-editor>
          </v-row>
          <v-row xs12 class="mt-5 mb-5">
            <v-btn
              outlined
              @click="isUnpublishDialog = true"
              :disabled="isLoading"
              v-if="article && article.isPublished && $vuetify.breakpoint.xs"
              class="mt-1 mr-2"
            >
              {{ $text.ArticleUnpublish }}
            </v-btn>
            <ConfirmationDialog
              v-if="isUnpublishDialog"
              v-model="isUnpublishDialog"
              :title="$text.ArticleUnpublishConfirm"
              :body="$text.ArticleUnpublishConfirmBody"
              :action="onUnpublish"
              :submitButtonText="$text.Unpublish"
              :isLoading="isLoading"
            />
            <v-btn
              outlined
              @click="isPublishDialog = true"
              :disabled="isLoading"
              v-else-if="
                article && !article.isPublished && $vuetify.breakpoint.xs
              "
              class="mt-1 mr-2"
            >
              {{ $text.ArticlePublish }}
            </v-btn>

            <ConfirmationDialog
              v-if="isPublishDialog"
              v-model="isPublishDialog"
              :title="$text.ArticlePublishConfirm"
              :body="$text.ArticlePublishConfirmBody"
              :action="onPublish"
              :submitButtonText="$text.Publish"
              :isLoading="isLoading"
            />

            <v-btn
              outlined
              color="accent"
              @click="isDeleteDialog = true"
              :disabled="isLoading"
              v-if="article && article.id && $vuetify.breakpoint.xs"
              class="mt-1 mr-2"
            >
              {{ $text.ArticleDelete }}
            </v-btn>

            <!-- Confirm: deleting article -->
            <ConfirmationDialog
              v-if="isDeleteDialog"
              v-model="isDeleteDialog"
              :title="$text.ArticleDeleteConfirm"
              :body="$text.ArticleDeleteConfirmBody"
              :action="onDelete"
              :submitButtonText="$text.Ok"
              :isLoading="isLoading"
            />

            <v-checkbox
              v-if="!article && $vuetify.breakpoint.xs"
              v-model="formData.isPublished"
              class="mt-1 mr-2"
              :label="$text.ArticlePublishOnSave"
            />
            <!-- //** Submit button -->
            <v-btn
              :disabled="!isFormValid || isLoading || formData.text.length < 10"
              :loading="isLoading"
              color="accent"
              @click="onSave"
              :title="$text.Submit"
              v-if="$vuetify.breakpoint.xs"
              class="mt-1 mr-2"
            >
              {{ $text.Save }}
            </v-btn>

            <!-- Confirm: resetting article -->
            <ConfirmationDialog
              v-if="isResetDialog"
              v-model="isResetDialog"
              :title="$text.ArticleResetConfirm"
              :body="$text.ArticleResetConfirmBody"
              :action="onReset"
              :submitButtonText="$text.Ok"
              :isLoading="isLoading"
            />

            <v-btn
              text
              :disabled="isLoading"
              @click="isResetDialog = true"
              :title="$text.Reset"
              color="accent"
              v-if="$vuetify.breakpoint.xs"
              class="mt-1 mr-2"
            >
              {{ $text.Reset }}
            </v-btn>
          </v-row>
        </v-form>
      </v-row>
    </v-container>
  </div>
</template>

<style lang="scss" scoped>
$colorAccent: #cc2531;

.article-edit {
  .editor {
    width: 100%;
    min-height: 150px;
  }

  .editor-header {
    color: #444444;
    font-weight: 300;
  }
}

@media screen and (max-width: 600px) {
  .article-edit {
    .editor-header {
      font-size: 0.875em;
    }

    .ql-toolbar.ql-snow {
      padding-left: 0;
      padding-right: 0;

      .ql-formats {
        margin-right: 0;
      }

      .ql-picker {
        &.ql-font {
          width: 95px;
        }

        &.ql-size {
          width: 85px;
        }

        &.ql-header {
          width: 88px;
        }
      }
    }
  }
}

@media screen and (max-width: 384px) {
  .article-edit {
    .breadcrumbs {
      padding-left: 18px !important;
      padding-top: 4px !important;
      padding-bottom: 4px !important;
      margin-top: -12px;
    }

    .v-text-field {
      padding-top: 4px;
      margin-top: -12px;
    }
  }

  .ql-toolbar.ql-snow {
    .ql-formats {
      button {
        width: 20px;
        height: 20px;
      }
    }

    .ql-color-picker,
    .ql-icon-picker {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
