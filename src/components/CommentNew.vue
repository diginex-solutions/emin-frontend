<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { AuthS, SpacesS, CasesS } from '@/types/'
import ConfirmationDialog from './ConfirmationDialog.vue'
import TheUploader from '@/components/TheUploader.vue'
import { routesApi } from '@/router'

@Component({
  components: { ConfirmationDialog, TheUploader }
})
export default class CommentNew extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(...AuthS.getUser) getUser: Auth.User
  @A(...CasesS.commentCreate) vuexCommentCreate: Cases.CommentCreateA
  @A(...CasesS.feedAdd) vuexFeedAdd: Cases.FeedAddA
  @G(...SpacesS.getSelected) getSelected: Spaces.Record

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop() theCase: Cases.Record

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  message = ''
  isLoading = false
  validComment = {
    max: 1000,
    min: 3
  }

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  // Returns string - 2 capitalized letters of user name and surname
  get getShortName(): string {
    const user = this.getUser
    if (!user) {
      return ''
    }

    if (user.name && user.surname) {
      return (
        user.name.substring(0, 1).toUpperCase() +
        user.surname.substring(0, 1).toUpperCase()
      )
    } else {
      return user.email.substring(0, 1).toUpperCase()
    }
  }

  get isFormValid() {
    const validMax = this.message.length <= this.validComment.max
    const validMin = this.message.length >= this.validComment.min

    return validMax && validMin
  }

  get uploadUrl() {
    const caseId = this.theCase.id
    const spaceId = this.getSelected?.id
    return routesApi.cases.fileUpload(caseId).path + `?spaceId=${spaceId}`
  }

  get isMobile() {
    return this.$vuetify.breakpoint.xs
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  onSave() {
    this.isLoading = true

    // 🤖 Dispatch to store
    const payload = { message: this.message }
    this.vuexCommentCreate(payload)
      .then(() => {
        this.isLoading = false
        this.message = ''
      })
      .catch(() => {
        this.isLoading = false
      })
  }

  onUploadFile() {
    const dropzone = this.$refs.TheUploader as TheUploader
    dropzone.onOpenDropzone()
  }

  onFileUploaded(data: Cases.CaseFeedItem) {
    this.vuexFeedAdd(data)
  }
}
</script>

<template>
  <div class="comment" :class="{ 'flex-column': isMobile }">
    <!-- <div>
      <v-list-item-avatar style="align-self: center">
        <v-avatar class="accent white--text user-avatar">
          {{ getShortName }}
        </v-avatar>
      </v-list-item-avatar>
    </div> -->
    <div class="comment__content">
      <!-- Comment text. Disabled, if waiting backend response.
      If edited text present - display it.-->
      <div class="comment__text">
        <div>
          <v-textarea
            :disabled="isLoading"
            dense
            ref="textarea"
            v-model="message"
            color="accent"
            :counter="validComment.max"
            auto-grow
            :label="$text.CaseCommentAdd"
            outlined
          />
        </div>
        <div class="d-flex" :class="{ 'flex-column': isMobile }">
          <v-btn
            :disabled="!isFormValid || isLoading"
            :loading="isLoading"
            color="#168f48"
            @click="onSave"
            outlined
            small
            :class="{ 'mb-2': isMobile }"
          >
            {{ $text.CommentBtn }}
          </v-btn>
          <v-btn
            @click="onUploadFile"
            small
            :disabled="isLoading"
            outlined
            :class="{ 'ml-3': !isMobile, 'mb-2': isMobile }"
          >
            <v-icon>attachment</v-icon>
            <span>{{ $text.ShareFile }}</span>
          </v-btn>

          <v-spacer />
          <v-fade-transition>
            <v-btn
              v-if="message && !isLoading"
              color="#aaaaaa"
              @click="message = ''"
              outlined
              small
              :class="{ 'mb-2': isMobile }"
            >
              <span style="color: #555555">
                {{ $text.CommentDraftDiscard }}
              </span>
            </v-btn>
          </v-fade-transition>
        </div>
      </div>
    </div>
    <TheUploader
      v-show="false"
      ref="TheUploader"
      @onFileUploaded="onFileUploaded"
      :url="uploadUrl"
    />
  </div>
</template>

<style lang="scss" scoped>
.comment {
  display: flex;
  width: 100%;
  color: #333333;

  &__header {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__content {
    flex-grow: 1;
    width: calc(100% - 1.5rem);

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
}
</style>
