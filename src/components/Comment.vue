<script lang="ts">
import moment from 'moment'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { VueRefFocus, AuthS, CasesS } from '@/types/'
import ConfirmationDialog from './ConfirmationDialog.vue'

// returns true if text within given field overflows
function checkOverflow(el: HTMLElement) {
  const curOverflow = el.style.overflow

  if (!curOverflow || curOverflow === 'visible') {
    el.style.overflow = 'hidden'
  }

  const isOverflowing =
    el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight

  el.style.overflow = curOverflow
  return isOverflowing
}

@Component({
  components: { ConfirmationDialog }
})
export default class Comment extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...AuthS.getUser) getUser: Auth.User
  @A(...CasesS.commentUpdate) vuexCommentUpdate: Cases.CommentUpdateA
  @A(...CasesS.commentDelete) vuexCommentDelete: Cases.CommentDeleteA

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Object) item: Cases.CaseFeedItem

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isExpanded = false
  isMounted = false
  isEditing = false
  isDeleting = false
  updated = ''
  isLoading = false
  validComment = {
    max: 1000,
    min: 3
  }

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get isExpandable() {
    if (!this.isMounted || !this.$refs.msg) return false
    return checkOverflow(this.$refs.msg as HTMLElement)
  }

  get isEdited() {
    const createdAt = new Date(this.item.createdAt)
    const updatedAt = new Date(this.item.updatedAt)
    return createdAt.getTime() !== updatedAt.getTime()
  }

  get isEditable() {
    return (
      this.item?.initiator?.email === this.getUser?.email && !this.isLoading
    )
  }

  // Returns string - 2 capitalized letters of user name and surname
  get getShortName() {
    const user = this.item.initiator
    if (!user) return ''

    if (user.name && user.surname) {
      return (
        user.name.substring(0, 1).toUpperCase() +
        user.surname.substring(0, 1).toUpperCase()
      )
    } else {
      return user.email.substring(0, 1).toUpperCase()
    }
  }

  get commentOwner() {
    return this.item.initiator
  }

  get getDate() {
    const date = this.item.createdAt
    const format = 'DD-MM-YYYY hh:mm A'
    return moment(date).format(format)
  }

  get isEditValid() {
    const validMax = this.updated.length <= this.validComment.max
    const validMin = this.updated.length >= this.validComment.min
    return validMax && validMin
  }

  get isMobile() {
    return this.$vuetify.breakpoint.xs
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  mounted() {
    this.isMounted = true
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  onEdit() {
    this.isEditing = true
    this.updated = this.item.data || ''

    this.$nextTick(() => {
      const textarea = this.$refs.textarea as VueRefFocus
      textarea?.focus()
    })
  }

  onEditSave() {
    this.isEditing = false
    this.isLoading = true

    // 🤖 Dispatch to store
    const payload = { id: this.item.id, message: this.updated }
    this.vuexCommentUpdate(payload)
      .then(() => {
        this.isLoading = false
        this.updated = ''
      })
      .catch(() => {
        this.isEditing = true // Enable editing back
        this.isLoading = false
      })
  }

  onDelete() {
    this.isDeleting = false
    this.isLoading = true

    // 🤖 Dispatch to store
    const payload = { id: this.item.id }
    this.vuexCommentDelete(payload)
      .then(() => {
        this.isLoading = false
      })
      .catch(() => {
        this.isLoading = false
      })
  }
}
</script>

<template>
  <div class="comment" :class="{ small: isMobile }">
    <div v-if="!isMobile">
      <v-list-item-avatar style="align-self: center">
        <v-avatar class="accent white--text user-avatar">
          {{ getShortName }}
        </v-avatar>
      </v-list-item-avatar>
    </div>
    <div class="comment__avatar" v-else>
      <v-list-item-avatar>
        <v-avatar class="accent white--text user-avatar">
          {{ getShortName }}
        </v-avatar>
      </v-list-item-avatar>
      <div class="comment__owner">
        <span>{{ `${commentOwner.name} ${commentOwner.surname}` }}</span>
      </div>
    </div>
    <div class="comment__content">
      <div class="comment__header mt-2 mb-2">
        <!-- // TODO: convert to template - update to fill email and date at i18n -->
        <div v-if="!isMobile">
          <span>{{ `${commentOwner.name} ${commentOwner.surname}` }}</span>
          <span class="ml-3 faded">
            {{ commentOwner.email }} {{ $text.AtTime }}
            <span :title="item.createdAt | formatDate">{{ getDate }}</span>
          </span>
        </div>
        <div v-else-if="isMobile">
          <!-- // TODO: convert to template - update to fill email and date at i18n -->
          <span class="ml-3 faded">
            {{ commentOwner.email }} {{ $text.AtTime }}
          </span>
        </div>
        <div v-else-if="isMobile">
          <span class="ml-3 faded" :title="item.createdAt | formatDate">
            {{ getDate }}
          </span>
        </div>
        <v-spacer />
        <v-progress-circular
          v-if="isLoading"
          size="20"
          width="2"
          indeterminate
          color="accent"
        />

        <!-- If editing record - display save/cancel buttons -->
        <div :class="{ 'ml-3': isMobile, faded: isMobile }" v-if="isEditing">
          <!-- Display save icon only if comment has been edited -->
          <v-icon
            v-if="item.data !== updated && isEditValid"
            size="20"
            color="green lighten-1"
            class="comment__button"
            @click="onEditSave"
          >
            check
          </v-icon>
          <v-icon
            size="20"
            color="red lighten-2"
            class="comment__button"
            @click="isEditing = false"
          >
            close
          </v-icon>
        </div>

        <div
          :class="{ 'ml-3': isMobile, faded: isMobile }"
          v-else-if="isEditable"
        >
          <v-icon
            size="20"
            color="grey lighten-1"
            class="comment__button"
            @click="onEdit"
          >
            edit
          </v-icon>
          <v-icon
            size="20"
            color="grey lighten-1"
            class="comment__button"
            @click="isDeleting = true"
          >
            delete
          </v-icon>

          <!-- Confirm: deleting record -->
          <ConfirmationDialog
            v-if="isDeleting"
            v-model="isDeleting"
            :title="$text.CommentDeleteTitle"
            :body="$text.CommentDeleteBody"
            :action="onDelete"
            :submitButtonText="$text.Delete"
            :isLoading="isLoading"
          />
        </div>
      </div>
      <!-- If: not editing - regular view of the comment -->

      <!-- Comment text. Disabled, if waiting backend response.
      If edited text present - display it.-->
      <div
        v-if="!isEditing"
        class="comment__text"
        :class="{ disabled: isLoading, 'ml-3': isMobile, faded: isMobile }"
      >
        <div>{{ updated || item.data }}</div>
        <div
          v-if="isEdited"
          class="comment__extras"
          :title="item.createdAt | formatDate"
        >
          {{ $text.Edited }} {{ item.updatedAt | formatAgo }}
        </div>
      </div>
      <div
        v-else
        class="comment__text"
        :class="{ 'ml-3': isMobile, faded: isMobile }"
      >
        <v-textarea
          ref="textarea"
          v-model="updated"
          color="accent"
          :counter="validComment.max"
          auto-grow
          :label="$text.CaseUpdateComment"
        />
      </div>
    </div>
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

  &__extras {
    margin-top: 0.4rem;
    font-size: 0.8em;
    color: #aaaaaa;
  }

  .disabled {
    opacity: 0.3;
  }

  &.small {
    display: flex;
    flex-direction: column;
    width: calc(100% - 1.5rem);

    .comment {
      &__avatar {
        display: flex;
      }

      &__owner {
        align-self: center;
      }

      &__header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  }
}
</style>
