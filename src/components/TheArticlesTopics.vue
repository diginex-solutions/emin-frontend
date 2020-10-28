<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component } from 'vue-property-decorator'
import { ArticlesS, AuthS, SpacesS } from '@/types/'
import Spinner from '@/components/Spinner.vue'
import FormDialog from '@/components/FormDialog.vue'
import TheBreadcrumbs from './TheBreadcrumbs.vue'
import ConfirmationDialog from './ConfirmationDialog.vue'
import FormFields from '@/stx/stxForms'
import { config } from '@/utils/config'

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

@Component({
  components: { Spinner, TheBreadcrumbs, ConfirmationDialog, FormDialog }
})
export default class TheArticlesTopics extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...ArticlesS.getRecordsByTopic) articles: Articles.Record[]
  @G(...ArticlesS.getTopics) topics: Articles.Topic[]
  @G(...ArticlesS.getTopic) getTopic: Articles.Topic | null //* Selected topic
  @A(...ArticlesS.setTopic) setTopic: Articles.SetTopicA

  @A(...ArticlesS.deleteTopic) vuexDelete: Articles.DeleteTopicA

  //* Can user edit article
  @G(...AuthS.getUser) getUser: Auth.User
  @G(...SpacesS.isSpaceAdmin) isSpaceAdmin: boolean
  @G(...SpacesS.isAdminGlobal) isAdminGlobal: boolean
  @A(...ArticlesS.updateTopic) vuexUpdateTopic: Articles.UpdateTopicA

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  selected: Articles.Topic | null = null
  isDeleteDialog = false
  isEditDialog = false
  isLoading = false
  topicFormFields: Types.FormField[] = FormFields.topic()

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get canUserEdit() {
    return this.isSpaceAdmin || this.isAdminGlobal
  }

  get headers(): Types.Header[] {
    return [
      {
        text: this.$text.Icon,
        align: 'left',
        value: 'icon',
        width: '75'
      },
      {
        text: this.$text.Name,
        align: 'left',
        value: 'name'
      },
      {
        text: this.$text.Actions,
        align: 'right',
        value: 'actions',
        width: '200'
      }
    ]
  }

  get getBreadcrumbs() {
    const result = [[this.$text.Articles, '/support']]
    result.push([this.$text.Topics, ''])
    return result
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  onEdit(item: Articles.Topic) {
    if (!item) return
    this.selected = item
    this.isEditDialog = true

    const updateValue = (f: Types.FormField) =>
      (f.value = this.selected ? (this.selected as any)[f.name] : '')
    this.topicFormFields.forEach(updateValue)
    this.topicFormFields = [...this.topicFormFields] // * Trigger update (potential reactivity caveat)
  }

  onEditSuccess() {
    this.$showSnack(this.$msg.TopicSaved)
  }

  onDeleteConfirm(item: Articles.Topic) {
    this.selected = item
    this.isDeleteDialog = true
  }

  onDelete() {
    if (!this.selected) return
    this.isLoading = true
    this.vuexDelete(this.selected)
      .then(() => {
        this.isLoading = false
        this.isDeleteDialog = false
        this.$showSnack(this.$msg.TopicDeleteSuccess)
      })
      .catch(() => {
        this.isDeleteDialog = false
      })
  }

  isEditable(topic: Articles.Topic) {
    return topic.id !== config.TopicAllId
  }

  onTopicUpdated() {
    this.isEditDialog = false
    this.$showSnack(this.$msg.TopicUpdateSuccess)
  }
}
</script>

<template>
  <v-container class="articles-index">
    <!-- Breadcrumbs Panel -->
    <v-row>
      <TheBreadcrumbs :items="getBreadcrumbs" router-mode />
    </v-row>

    <!-- Topics List - icon view -->
    <!-- <v-row>
      <div class="category__container">
        <div
          v-for="topic in topics"
          :key="topic.id"
          @click="onSelectTopic(topic)"
          class="category"
          :class="{
            selected: topic.id === (getTopic && getTopic.id)
          }"
        >
          <div class="category__icon-box">
            <v-icon size="3em">{{ topic.icon }}</v-icon>
          </div>
          <div class="category__text">{{ topic.name }}</div>
        </div>
      </div>
    </v-row> -->
    <v-row>
      <v-col cols="12" class="mt-5 mb-5">
        <!-- List all topics -->
        <!-- TABLE -->
        <v-data-table
          :headers="headers"
          :items="topics"
          item-key="id"
          color="accent"
        >
          <template v-slot:item.icon="{ item }">
            <v-icon>{{ item.icon }}</v-icon>
          </template>

          <template v-slot:item.actions="{ item }">
            <div v-if="canUserEdit && isEditable(item)">
              <v-btn icon @click="onEdit(item)">
                <v-icon color="grey lighten-1">edit</v-icon>
              </v-btn>

              <v-btn icon @click="onDeleteConfirm(item)">
                <v-icon color="grey lighten-1">close</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>

        <!-- Update topic -->
        <FormDialog
          v-if="isEditDialog"
          v-model="isEditDialog"
          :formFields="topicFormFields"
          :titleNew="$text.TopicUpdate"
          :edit="selected"
          :onUpdate="vuexUpdateTopic"
          @onSuccess="onTopicUpdated"
        />

        <!-- Confirm deleting record -->
        <ConfirmationDialog
          v-if="isDeleteDialog"
          v-model="isDeleteDialog"
          :title="$text.TopicDelete"
          :body="$text.TopicDeleteBody"
          :isLoading="isLoading"
          :action="onDelete"
          :submitButtonText="$text.Delete"
        />
      </v-col>
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
    font-size: 1.1em;
    margin-top: 1.5rem;

    width: 100%;
  }

  .article__link {
    text-decoration: none;
    color: #007ec9;

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
}
</style>
