<script lang="ts">
import { Getter as G } from 'vuex-class'
import { Vue, Component, Prop } from 'vue-property-decorator'
import ConfirmationDialog from './ConfirmationDialog.vue'
import { ArticlesS, AuthS } from '../types'

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

@Component({
  components: { ConfirmationDialog }
})
export default class TheArticlesSidebar extends Vue {
  @G(...ArticlesS.getTopics) topics: Articles.Topic[]
  @G(...AuthS.getUser) getAuthed: Auth.User

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Object) article: Articles.Record
  @Prop(String) topicId: string | null
  @Prop(String) text: string
  @Prop(Boolean) isPublished: boolean
  @Prop(Boolean) isFormValid: boolean
  @Prop(Boolean) isLoading: boolean
  @Prop(Boolean) isEdit: boolean

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isDeleteDialog = false
  isUnpublishDialog = false
  isPublishDialog = false
  isResetDialog = false

  //*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

  get user() {
    return this.isEdit ? this.article.user : this.getAuthed
  }

  get topic() {
    return this.topicId
  }
  set topic(topicIdUpdated) {
    this.$emit('update:topicId', topicIdUpdated)
  }

  get isPublishedL() {
    return this.isPublished
  }
  set isPublishedL(value) {
    this.$emit('update:isPublished', value)
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  onReset() {
    this.$emit('onReset')
    this.isResetDialog = false
  }

  onSave() {
    this.$emit('onSave')
  }

  onDelete() {
    this.$emit('onDelete')
  }

  onPublish() {
    this.$emit('onPublish')
    this.isPublishDialog = false
  }

  onUnpublish() {
    this.$emit('onUnpublish')
    this.isUnpublishDialog = false
  }
}
</script>

<template>
  <v-navigation-drawer
    v-if="article"
    permanent
    right
    app
    clipped
    class="articles-sidebar"
    color="#f7f7f7"
  >
    <template v-slot:prepend>
      <v-divider />

      <!-- Owner information -->

      <v-list-item>
        <v-list-item-content>
          <b v-if="article.title">{{ article.title }}</b>
          <span></span>
        </v-list-item-content>
      </v-list-item>

      <v-list-item two-line>
        <v-list-item-avatar
          class="accent white--text"
          style="align-self: center"
          left
        >
          <v-avatar class="accent white--text user-avatar">
            {{ user | getShortName }}
          </v-avatar>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>
            {{ user.name + ' ' + user.surname }}
          </v-list-item-title>
          <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <!-- Selector with topics -->
      <v-list-item v-if="!$vuetify.breakpoint.xs">
        <v-list-item-content>
          <div class="text-center d-flex align-center">
            <v-select
              v-model="topic"
              :items="topics"
              item-text="name"
              item-value="id"
              outlined
              :label="$text.Topic"
              dense
            ></v-select>
          </div>
        </v-list-item-content>
      </v-list-item>

      <!-- Topic Add Btn
      <v-list-item class="mt-5 mb-2">
        <v-list-item-content>
          //TODO
        </v-list-item-content>
      </v-list-item> -->
      <!-- Button and dialog for deleting article-->
      <v-list-item v-if="article.id" class="mt-2">
        <!-- Confirm: publish/unpublish article-->
        <v-list-item-content
          v-if="article.isPublished && !$vuetify.breakpoint.xs"
        >
          <v-btn
            outlined
            @click="isUnpublishDialog = true"
            :disabled="isLoading"
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
        </v-list-item-content>
        <v-list-item-content
          v-else-if="!article.isPublished && !$vuetify.breakpoint.xs"
        >
          <v-btn outlined @click="isPublishDialog = true" :disabled="isLoading">
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
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-if="article.id && !$vuetify.breakpoint.xs">
        <v-list-item-content>
          <v-btn
            outlined
            color="accent"
            @click="isDeleteDialog = true"
            :disabled="isLoading"
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
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>
          <v-checkbox
            v-if="!article.id"
            v-model="isPublishedL"
            class="ml-2"
            :label="$text.ArticlePublishOnSave"
          />
          <!-- //** Submit button -->
          <v-btn
            :disabled="!isFormValid || isLoading || text.length < 10"
            :loading="isLoading"
            color="accent"
            @click="onSave"
            :title="$text.Submit"
            v-if="!$vuetify.breakpoint.xs"
          >
            {{ $text.Save }}
          </v-btn>
        </v-list-item-content>
      </v-list-item>
      <!-- //** Reset button -->
      <v-btn
        text
        :disabled="isLoading"
        @click="isResetDialog = true"
        :title="$text.Reset"
        color="accent"
        v-if="!$vuetify.breakpoint.xs"
      >
        {{ $text.Reset }}
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
    </template>
  </v-navigation-drawer>
</template>
<style lang="scss" scoped>
.articles-sidebar {
  .v-btn:before {
    display: none;
  }
}
</style>
