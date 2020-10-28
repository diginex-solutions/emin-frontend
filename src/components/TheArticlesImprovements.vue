<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component } from 'vue-property-decorator'
import { ArticlesS, SpacesS } from '@/types/'
import Spinner from '@/components/Spinner.vue'
import AskText from '@/components/AskText.vue'
import TheBreadcrumbs from './TheBreadcrumbs.vue'
import ConfirmationDialog from './ConfirmationDialog.vue'
import FormFields from '../stx/stxForms'

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

@Component({
  components: { Spinner, TheBreadcrumbs, ConfirmationDialog, AskText }
})
export default class TheArticlesImprovements extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...ArticlesS.getImprovements) improvements: Articles.Improvement[]
  @A(...ArticlesS.deleteImprovement) vuexDelete: Articles.DeleteImprovementA
  @A(...ArticlesS.updateImprovement) vuexUpdate: Articles.UpdateImprovementA

  //* Can user edit improvements list
  @G(...SpacesS.isSpaceAdmin) isSpaceAdmin: boolean
  @G(...SpacesS.isAdminGlobal) isAdminGlobal: boolean

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  selected: Articles.Improvement | null = null
  isDeleteDialog = false
  isEditDialog = false
  isLoading = false
  formFields: Types.FormField[] = FormFields.improvement()

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get canUserEdit() {
    return this.isSpaceAdmin || this.isAdminGlobal
  }

  get headers(): Types.Header[] {
    return [
      {
        text: this.$text.Name,
        align: 'left',
        value: 'text'
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
    result.push([this.$text.Improvements, ''])
    return result
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  onEdit(item: Articles.Improvement) {
    this.selected = item
    this.isEditDialog = true
  }

  onDeleteConfirm(item: Articles.Improvement) {
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
        this.$showSnack(this.$msg.ImprovementDeleteSuccess)
      })
      .catch(() => {
        this.isEditDialog = false
      })
  }

  selectCategory() {
    console.log('TODO: select category')
  }

  onEditSuccess() {
    this.$showSnack(this.$msg.ImprovementSaved)
  }

  onSaveImprovement(text: string) {
    if (!this.selected) return //* Exn

    this.isLoading = true
    this.vuexUpdate({ id: this.selected.id, text })
      .then(() => {
        this.isLoading = false
        this.isEditDialog = false
        this.$showSnack(this.$msg.ImprovementUpdateSuccess)
      })
      .catch(() => {
        this.isEditDialog = false
      })
  }
}
</script>

<template>
  <v-container class="articles-index">
    <!-- Breadcrumbs Panel -->
    <v-row>
      <TheBreadcrumbs :items="getBreadcrumbs" router-mode />
    </v-row>

    <v-row>
      <v-col cols="12" class="mt-5 mb-5">
        <AskText
          v-if="isEditDialog"
          v-model="isEditDialog"
          :title="$text.ImprovementName"
          :inputTitle="$text.Text"
          :btnSubmit="$text.Save"
          :btnCancel="$text.Cancel"
          :isLoading="isLoading"
          :initial="selected.text"
          @onSubmit="onSaveImprovement"
          @onCancel="isEditDialog = false"
        />

        <!-- List all records -->
        <!-- TABLE -->
        <v-data-table
          :headers="headers"
          :items="improvements"
          item-key="id"
          color="accent"
        >
          <template v-slot:item.text="{ item }">
            <!-- Goto index page after selecting article -->
            <a @click="selectCategory">
              {{ item.text }}
            </a>
          </template>

          <template v-if="canUserEdit" v-slot:item.actions="{ item }">
            <v-btn icon @click="onEdit(item)">
              <v-icon color="grey lighten-1">edit</v-icon>
            </v-btn>

            <v-btn icon @click="onDeleteConfirm(item)">
              <v-icon color="grey lighten-1">close</v-icon>
            </v-btn>
          </template>
        </v-data-table>

        <!-- Confirm deleting record -->
        <ConfirmationDialog
          v-if="isDeleteDialog"
          v-model="isDeleteDialog"
          :isLoading="isLoading"
          :title="$text.ImprovementDelete"
          :body="$text.ImprovementDeleteBody"
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
