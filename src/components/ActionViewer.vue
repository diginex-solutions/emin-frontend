<script lang="ts">
import _ from 'lodash'
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { DocsS, AuthS, SpacesS } from '@/types/'
import DatePicker from '@/components/DatePicker.vue'
import ActionInput from '@/components/ActionInput.vue'
import Dialog from '@/mixins/Dialog'
import CaseCreateDialog from '@/components/CaseCreateDialog.vue'
import { getInputsFull, finderById, getOptionLabel } from '@/utils/helpers'
import { config } from '@/utils/config'
import { FormStatuses } from '@/store/formsStore'

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Types

type Rule = (v: string) => string | true // validation rule type
interface Rules {
  [key: string]: Rule[]
}

interface Form extends Element {
  resetValidation: () => null
}

interface FormData {
  email: string
  name: string
  surname: string
  company: string
  message: string
}

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

// *  ActionViewer serves as a birdview for provided action

@Component({
  components: { DatePicker, ActionInput, CaseCreateDialog }
})
export default class ActionViewer extends Mixins(Dialog) {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @A(...DocsS.updateActionRequest) vuexUpdateAction: Docs.UpdateFormA
  @G(...AuthS.getLang) getLang: Auth.Language
  @G(...DocsS.records) docs: Docs.Record[]
  @G(...SpacesS.getSelected) getSelected: Spaces.Record

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop(Object) actionRaw: Forms.Record
  @Prop(Object) file: Docs.Record

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  // isLoading: show loader icon if true
  isLoading = false
  isAccept = false
  timeoutHandle: Types.Timeout = null
  formInputs: Forms.AnswerFull[] = []
  action: Forms.Record | null = null
  isEditing = false
  isCaseDialog = false

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get doc() {
    const doc: Docs.Record = (this.action && this.action.document) || this.file

    if (!doc && this.action?.docId) {
      const findById = finderById(this.action?.docId)
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

  get isInitiator() {
    return this.actionRaw && this.actionRaw.isInitiator
  }

  get inputTypes() {
    return {
      text: 'text',
      time: 'time',
      number: 'number',
      checkbox: 'checkbox',
      select: 'select',
      multiselect: 'multiselect',
      date: 'date'
    }
  }

  get displayUser() {
    if (!this.action) {
      return ''
    }

    const receiver = this.action.recipient
    const initiator = this.action.initiator

    return this.isInitiator ? receiver : initiator
  }

  get config() {
    return config
  }

  get isSpaceCases() {
    return this.getSelected?.isCases
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  destroyed() {
    window.clearTimeout(this.timeoutHandle)
  }

  mounted() {
    this.action = _.cloneDeep(this.actionRaw)

    const fullInputs = getInputsFull(this.action, this.getLang)
    if (!fullInputs) {
      return
    }

    this.formInputs = fullInputs

    if (this.isPending && !this.isInitiator) {
      this.timeoutHandle = setTimeout(this.updateStatusReceived, 5000)
    }
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  // onSubmitForm: validate form and either update or create record
  onSubmitForm(isAccept = false) {
    // cancel form submit if already submitted or form is invalid
    if (this.isLoading) {
      return false
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
      .catch(() => {
        this.isLoading = false
      })
  }

  updateStatusReceived() {
    if (!this.isPending || this.isInitiator) {
      return
    }

    const payload = {
      id: this.action ? this.action.id : '',
      status: FormStatuses.received
    }
    this.vuexUpdateAction(payload)
  }

  // Pull language for the option
  getOptionLabel(input: Templates.InputTranslated, value: string) {
    return getOptionLabel(input, value)
  }

  getMultiSelectValues(value: string) {
    // Fix for https://gitlab.diginex/Diginex/Trust/diginex-trust/issues/740
    // Because the values are in string for some reason, probably related to #739
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    width="600px"
    @keydown.esc="() => (!isLoading ? (isOpen = false) : false)"
    scrollable
    :persistent="isLoading || (!isInitiator && !isFilled) || isEditing"
    :fullscreen="$vuetify.breakpoint.xs"
    :transition="
      $vuetify.breakpoint.xs ? 'dialog-right-transition' : 'scale-transition'
    "
  >
    <v-card v-if="action" id="documents-share-dialog">
      <v-card-title>
        <span class="sharing__header">
          <span class="sharing__header__title">
            <span v-if="isFilled">{{ $text.DocumentReviewed }}</span>
            <span v-else-if="isInitiator">{{ $text.WaitingResponse }}</span>
            <span v-else>{{ $text.FormCta }}</span>
          </span>

          <!-- Button for opening new case -->
          <v-btn
            v-if="isInitiator && isSpaceCases"
            class="mr-5"
            color="accent"
            @click="isCaseDialog = true"
            outlined
          >
            {{ $text.CaseOpen }}
          </v-btn>

          <!-- Editing buttons - active only if form is filled, and recipient -->
          <span v-if="!isInitiator && isFilled">
            <!-- If editing - show save button -->
            <v-btn
              v-if="isEditing"
              @click="onSubmitForm(isFilled === 'accepted')"
              class="mr-1"
              color="#33b58f"
              outlined
              :loading="isLoading"
              :disabled="isLoading"
            >
              <v-icon class="mr-1">mdi-content-save</v-icon>
              {{ $text.Save }}
            </v-btn>
            <v-btn
              v-if="isEditing"
              @click="isOpen = false"
              class="mr-1"
              color="#777777"
              outlined
              :loading="isLoading"
              :disabled="isLoading"
            >
              <v-icon class="mr-1">close</v-icon>
              {{ $text.Cancel }}
            </v-btn>

            <!-- Else - show button for switching to edit mode -->
            <v-btn
              v-if="!isEditing && formInputs.length > 0"
              icon
              @click="isEditing = !isEditing"
              class="mr-1"
            >
              <v-icon size="30" color="grey lighten-1">edit</v-icon>
            </v-btn>
            <v-btn
              v-if="!isEditing"
              :disabled="isLoading"
              icon
              @click="isOpen = false"
            >
              <v-icon size="30" color="grey lighten-1">close</v-icon>
            </v-btn>
          </span>
          <!-- Close button -->
          <v-btn v-else icon @click="isOpen = false" :disabled="isLoading">
            <v-icon size="30" color="grey lighten-1">close</v-icon>
          </v-btn>
        </span>
      </v-card-title>
      <div class="header-separator">
        <div />
      </div>
      <v-card-text>
        <v-row>
          <v-col>
            <div v-if="action.message" class="mb-5">
              <h3 v-text="$text.Message" />
              <span style="white-space: pre-wrap;">{{ action.message }}</span>
            </div>
            <div v-if="doc">
              <h3 v-text="$text.File" />
              <a :href="doc.uri" @click.stop="updateStatusReceived">
                {{ doc | formatDocName }}
              </a>
              &nbsp;
              <span>({{ doc.size | filesize }})</span>
            </div>
          </v-col>
        </v-row>

        <v-row v-if="formInputs.length > 0">
          <v-col>
            <h3 v-text="$text.Form" />
            <div v-if="!isInitiator && (!isFilled || isEditing)">
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
            </div>
            <div v-else>
              <div v-for="input in formInputs" :key="input.id" class="mb-2">
                <div>
                  <b>{{ input.label }}</b>
                  <span
                    v-if="
                      input.type === 'select' || input.type === 'multiselect'
                    "
                  >
                    &nbsp; (
                    {{ $text.Options }}:
                    {{ input.options.map((o) => o.label).join(', ') }} )
                  </span>
                </div>

                <div v-if="input.value">
                  <div v-if="input.type === inputTypes.checkbox">
                    {{ input.value ? 'Yes' : 'No' }}
                  </div>
                  <ul v-else-if="input.type === inputTypes.multiselect">
                    <li
                      v-for="value in getMultiSelectValues(input.value)"
                      :key="value"
                    >
                      {{ getOptionLabel(input, value) }}
                    </li>
                  </ul>
                  <div v-else-if="input.type === inputTypes.select">
                    {{ getOptionLabel(input, input.value) }}
                  </div>
                  <div v-else>{{ input.value }}</div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <h3>
              <span v-if="isInitiator" v-text="$text.UserDetails" />
              <span v-else v-text="$text.From" />
            </h3>
            <div v-if="displayUser && displayUser.email">
              <b>{{ $text.Email }}:</b>
              <span class="ml-1">{{ displayUser && displayUser.email }}</span>
            </div>
            <div v-if="displayUser.name">
              <b>{{ $text.Name }}:</b>
              <span class="ml-1">{{ displayUser && displayUser.name }}</span>
            </div>
            <div v-if="displayUser.surname">
              <b>{{ $text.Surname }}:</b>
              <span class="ml-1">{{ displayUser && displayUser.surname }}</span>
            </div>
            <div v-if="displayUser.company">
              <b>{{ $text.Company }}:</b>
              <span class="ml-1">{{ displayUser && displayUser.company }}</span>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col class="mt-1">
            <div v-if="action.dateCreated">
              <b>{{ $text.DateSent }}:</b>
              <span class="ml-1">
                {{ action.dateCreated | formatDateSimple }}
              </span>
            </div>
            <div v-if="action.dateReceived">
              <b>{{ $text.DateReceived }}:</b>
              <span class="ml-1">
                {{ action.dateReceived | formatDateSimple }}
              </span>
            </div>
            <div v-if="action.dateFilled">
              <b>{{ $text.DateFilled }}:</b>
              <span class="ml-1">
                {{ action.dateFilled | formatDateSimple }}
              </span>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="mt-1">
            <div v-if="action.notes">
              <b>{{ $text.Comments }}:</b>
              <span style="white-space: pre-line" class="ml-1">
                {{ action.notes }}
              </span>
            </div>
          </v-col>
        </v-row>
        <v-divider />
        <v-row>
          <v-col>
            <div class="note-wrapper">
              <div v-if="isInitiator">
                <span v-if="!isFilled" v-text="$text.WaitingResponse" />
              </div>
              <div v-else-if="!isFilled" v-text="$text.ActionFillWarning" />
            </div>
            <div
              class="action-btn-wrapper"
              v-if="!isInitiator || (isInitiator && isFilled)"
            >
              <v-btn
                v-if="isFilled !== 'accepted'"
                :loading="isLoading && !isAccept"
                :disabled="isLoading && isAccept"
                color="accent"
                class="share-btn"
                :class="{ faded: isFilled === 'rejected' }"
                @click="onSubmitForm(false)"
              >
                <v-icon class="mr-1">close</v-icon>
                <span
                  v-if="isFilled === 'accepted' || isFilled === 'rejected'"
                  v-text="$text.Rejected"
                />
                <span v-else v-text="$text.Reject" />
              </v-btn>
              <div style="margin-right:10px">&nbsp;</div>
              <v-btn
                v-if="isFilled !== 'rejected'"
                :loading="isLoading && isAccept"
                :disabled="(isLoading && !isAccept) || isFilled === 'rejected'"
                color="#33b58f"
                @click="onSubmitForm(true)"
                class="share-btn white--text"
                :class="{ faded: isFilled === 'accepted' }"
              >
                <v-icon class="mr-1">check</v-icon>
                <span
                  v-if="isFilled === 'accepted' || isFilled === 'rejected'"
                  v-text="$text.Accepted"
                />
                <span v-else v-text="$text.Accept" />
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <CaseCreateDialog v-if="isCaseDialog" v-model="isCaseDialog" />
    </v-card>
  </v-dialog>
</template>

<style lang="scss">
$colorAccent: #cc2531;

#documents-share-dialog {
  .theme--light.v-text-field > .v-input__control > .v-input__slot:before {
    border-color: rgba(21, 21, 21, 1);
  }

  .v-text-field > .v-input__control > .v-input__slot:before {
    border-style: solid;
    border-width: 1px;
  }

  .file-icon {
    margin-right: 0.5rem;
  }

  .sharing {
    &__header {
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

  #share-dialog-form {
    padding: 1rem 1rem 0;
  }

  .header-separator {
    padding: 0 1.3rem;

    div {
      border-bottom: 2px solid #dddddd;
    }
  }

  .note-wrapper {
    justify-content: center;
    align-items: flex-end;
    padding: 10px 4rem;
    text-align: center;
    display: flex;
  }

  .action-btn-wrapper {
    justify-content: center;
    align-items: flex-end;
    padding: 10px;
    display: flex;

    .share-btn {
      height: 50px;
    }

    .faded {
      pointer-events: none;
      opacity: 0.5;
    }
  }
}
</style>
