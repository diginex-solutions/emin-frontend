<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { AuthS, DocsS } from '@/types/'
import _ from 'lodash'
import ActionInput from '@/components/ActionInput.vue'
import ActionFillerVerify from '@/components/ActionFillerVerify.vue'
import { getInputsFull, finderById } from '../utils/helpers'
import Dialog from '@/mixins/Dialog.ts'
import { FormStatuses } from '@/store/formsStore'

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

// * ActionFiller provides swipe-page view for filling action, improving ux of filling forms
@Component({
  components: { ActionInput, ActionFillerVerify },
  mixins: [Dialog]
})
export default class ActionFiller extends Mixins(Dialog) {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @A(...DocsS.updateActionRequest) vuexUpdateAction: Docs.UpdateFormA
  @G(...AuthS.getLang) getLang: Auth.Language
  @G(...DocsS.records) docs: Docs.Record[]
  @G(...AuthS.getUser) getUser: Auth.User

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop(Object) actionRaw: Forms.Record
  @Prop(Object) file: Docs.Record

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  // isLoading: show loader icon if true
  isLoading = false
  isAccept = false
  timeoutHandle: Types.Timeout = null

  formInputs: Forms.AnswerFull[] = []
  action: Forms.Record | null = null
  isEditing = false
  page = 1

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get doc() {
    const form = this.action
    const doc: Docs.Record = (this.action && this.action.document) || this.file

    if (!doc && form?.recipientDocId) {
      const docId = form.isInitiator ? form.initiatorDocId : form.recipientDocId
      const findById = finderById(docId)
      return this.docs.find(findById)
    }
    return doc
  }

  get isFilled() {
    const status = this.action && this.action.status
    const filled =
      status === FormStatuses.accepted || status === FormStatuses.rejected
    return filled ? status : false
  }

  get isPending() {
    const status = this.action && this.action.status
    return status === FormStatuses.pending
  }

  // * === === === === === === === === === ===
  // * Watchers 👀 👀 👀 👀 👀 👀 👀 👀 👀 👀

  mounted() {
    this.action = _.cloneDeep(this.actionRaw)

    if (this.action && this.action.template) {
      const fullInputs = getInputsFull(this.action, this.getLang)

      if (!fullInputs) {
        return
      }
      this.formInputs = fullInputs
    }

    if (this.isPending) {
      this.timeoutHandle = setTimeout(this.updateStatusReceived, 5000)
    }

    if (!this.doc) {
      this.page = 2
    }
  }

  destroyed() {
    window.clearTimeout(this.timeoutHandle)
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  // onSubmitForm: validate form and either update or create record
  onSubmitForm(isAccept = false) {
    // cancel form submit if already submitted or form is invalid
    if (this.isLoading) {
      return false
    }

    if (isAccept && this.formInputs.length > 0 && this.page === 1) {
      this.page++
      return
    }

    // enable loading spinner
    this.isLoading = true

    this.isAccept = isAccept
    const answersLocal: Forms.AnswerFull[] =
      isAccept || this.isEditing ? this.formInputs : []

    const answers: Forms.Answer[] = answersLocal.map(
      (answer: Forms.AnswerFull) => {
        return {
          id: answer.id || '',
          value: answer.value
        }
      }
    )

    const payload = {
      id: this.action ? this.action.id : '',
      status: isAccept ? 'accepted' : 'rejected',
      answers
    }

    this.vuexUpdateAction(payload)
      .then(() => {
        this.$showSnack(this.$msg.formFillSuccess)
        this.isOpen = false
      })
      .catch(() => (this.isLoading = false))
  }
  submitVerification({
    isAccept,
    notes
  }: {
    isAccept: boolean
    notes: string
  }) {
    // enable loading spinner
    this.isLoading = true

    this.isAccept = isAccept

    const payload = {
      id: this.action ? this.action.id : '',
      status: isAccept ? 'accepted' : 'rejected',
      notes
    }

    this.vuexUpdateAction(payload)
      .then(() => {
        this.$showSnack(this.$msg.formFillSuccess)
        this.isOpen = false
      })
      .catch(() => {
        this.isLoading = false
      })
  }

  updateStatusReceived() {
    // Prevent status update, if not pending, or loading (eg user submitted)
    if (!this.isPending || this.isLoading) {
      return
    }

    const payload = {
      id: this.action ? this.action.id : '',
      status: FormStatuses.received
    }
    this.vuexUpdateAction(payload)
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    width="600px"
    @keydown.esc="() => (!isLoading ? (isOpen = false) : false)"
    scrollable
    persistent
    :fullscreen="$vuetify.breakpoint.xs"
    :transition="
      $vuetify.breakpoint.xs ? 'dialog-right-transition' : 'scale-transition'
    "
  >
    <v-card v-if="action" id="action-filler">
      <v-card-title>
        <span class="dialog__header">
          <span class="dialog__header__title">
            <!-- Title: different for questionaire/verification type forms -->
            <span v-if="doc && page === 1">
              {{ $text.formVerificationCta }}
            </span>
            <span v-else>{{ $text.FormCta }}</span>
          </span>

          <!-- Close button -->
          <v-btn :disabled="isLoading" icon @click="isOpen = false">
            <v-icon size="30" color="grey lighten-1">close</v-icon>
          </v-btn>
        </span>
      </v-card-title>
      <div class="header-separator">
        <div />
      </div>
      <v-card-text class="pt-2">
        <!-- <v-pagination v-model="page" color="accent" :length="2" circle /> -->

        <template v-if="doc && page === 1">
          <ActionFillerVerify
            :isLoading="isLoading"
            :isAccept="isAccept"
            :action="action"
            :doc="doc"
            @onSubmit="submitVerification"
          />
        </template>
        <template v-if="page === 2 && formInputs.length > 0">
          <v-row dense v-for="input in formInputs" :key="input.id">
            <v-col>
              <ActionInput
                :type="input.type"
                :label="input.label"
                :value.sync="input.value"
                :options.sync="input.options"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col class="center-stuff">
              <v-btn
                v-if="isFilled !== 'rejected'"
                :loading="isLoading && isAccept"
                :disabled="(isLoading && !isAccept) || isFilled === 'rejected'"
                color="accent"
                @click="onSubmitForm(true)"
                :class="{ faded: isFilled === 'accepted' }"
                large
              >
                <span v-text="$text.Submit" />
              </v-btn>
            </v-col>
          </v-row>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="scss">
#action-filler {
  .dialog {
    div &__header {
      align-items: left;
      display: flex;
      width: 100%;
      align-items: center;
      height: 50px;

      &__title {
        flex-grow: 1;
        justify-content: center;
        font-size: 1.2rem;
        font-weight: normal;

        // one liner, overflow displays '..'
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }

  .header-separator {
    padding: 0 1.3rem;

    div {
      border-bottom: 2px solid #dddddd;
    }
  }

  .center-stuff {
    display: flex;
    justify-content: center;
  }
}
</style>
