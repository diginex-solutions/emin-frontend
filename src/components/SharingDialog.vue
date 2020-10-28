<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import {
  DocsS,
  SpacesS,
  AuthS,
  ConnectionsS,
  TemplatesS,
  UserDirectoryS
} from '@/types/'
import { validator } from '@/utils/validator'
import ContactsSelect from '@/components/ContactsSelect.vue'
import TheTemplatesEdit from '@/components/TheTemplatesEdit.vue'
import Dialog from '@/mixins/Dialog.ts'
import { formatDocName } from '@/utils/helpers'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type User = UserDirectory.Record
interface Form extends Element {
  validate: () => null
}

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

@Component({
  components: { ContactsSelect, TheTemplatesEdit },
  mixins: [Dialog]
})
export default class TheSharingDialog extends Mixins(Dialog) {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...SpacesS.getSelected) space: Spaces.Record
  @G(...UserDirectoryS.records) userDirectoryRecords: UserDirectory.Record[]
  @G(...ConnectionsS.records) connectionsRecords: UserDirectory.Record[]
  @A(...DocsS.createActionRequest) vuexCreateAction: Docs.CreateActionA
  @G(...TemplatesS.records) vuexTemplates: Templates.Record[]
  @G(...AuthS.getUser) getUser: Auth.User

  // @G(...ContactsS.records) contacts: Contacts.Record[]

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop() file: Docs.Record
  @Prop() template: Templates.Record
  @Prop() isVerifyDefault: boolean

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isLoading = false // * show loader icon if true
  isFormValid = false // * Validation rules
  isCreateDialog = false // * Toggling template creation dialog
  // Form fields
  formData: {
    users: User[]
    message: string
    template: string | null
    isVerify: boolean
  } = {
    users: [],
    message: '',
    template: '',
    isVerify: false
  }

  // * Restrictions on form fields
  valid = {
    message: { min: 3, max: 500 }
  }

  //  * Set of rules for validating record fields
  rules: Store.Rules = {
    users: [(v: User[]) => validator.required(v && v.length > 0)]
  }

  maxFilename = 40

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get form(): Form {
    return this.$refs.form as Form
  }

  get allowedContacts() {
    return this.contacts
  }

  get contacts() {
    const isUserDirectory = this.space && this.space?.isUserDirectory
    return isUserDirectory ? this.userDirectoryRecords : this.connectionsRecords
  }

  get getNoDataText() {
    if (this.contacts.length === 0) {
      return this.$text.ContactsListEmpty
    } else if (this.allowedContacts.length === 0) {
      //  if sharing, and all users already have access to the file
      return this.$text.ContactsListUsed
    }

    return this.$text.ContactsNotFound
  }

  get templates() {
    const emptyTemplate: Templates.Record = {
      id: '',
      name: this.$text.FormSelectEmpty,
      inputs: [],
      languages: []
    }

    return [emptyTemplate, ...this.vuexTemplates]
  }

  get getFilenameTooltip() {
    if (this.file.isFolder) {
      return ''
    }

    const fullname = formatDocName(this.file)
    return fullname.length > this.maxFilename ? fullname : ''
  }

  get isSpaceForms() {
    return this.space?.isForms
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  mounted() {
    const template = this.template || this.templates[0]
    this.formData.template = template?.id

    // * Prop - should verification be enabled by default
    this.formData.isVerify = !!this.isVerifyDefault
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  //* validate form and either update or create record
  onSubmitForm() {
    // cancel form submit if already submitted or form is invalid
    if (
      this.isLoading ||
      !this.form.validate() ||
      !this.isFormValid ||
      this.formData.users.length === 0
    ) {
      return false
    }

    // Pull template for formData
    const template = this.templates.find(
      (t: Templates.Record) => t.id === this.formData.template
    )

    if (!template) {
      return
    }

    // Compose payload
    const payload: Docs.CreateFormP = {
      document: this.file,
      ...this.formData,
      template
    }

    this.isLoading = true //* Enable loading spinner

    //* If filename is present - create doc, send form on top of it
    return this.vuexCreateAction(payload)
      .then(() => {
        this.isOpen = false

        // TODO: Custom msg for diff types: Sharing / Form / Verification
        this.$showSnack(this.$msg.RequestIsSent)
      })
      .catch(() => {
        this.isLoading = false
      })
  }

  onAddTemplate(record: Templates.Record) {
    this.formData.template = record.id
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    width="600px"
    @keydown.esc="isOpen = false"
    scrollable
    persistent
    :fullscreen="$vuetify.breakpoint.xs"
    :transition="
      $vuetify.breakpoint.xs ? 'dialog-right-transition' : 'scale-transition'
    "
  >
    <v-card id="docs-share-dialog">
      <v-card-title>
        <span class="sharing__header">
          <span v-if="file">
            <span class="file-icon">
              <v-icon size="40" color="grey darken-1" :title="file.extension">
                insert_drive_file
              </v-icon>
            </span>
            <span
              v-if="file"
              class="sharing__header__title"
              :title="getFilenameTooltip"
            >
              {{ file | formatDocName(maxFilename) }}
            </span>
          </span>
          <span v-else class="sharing__header__title">
            {{ $text.FormSend }}
          </span>
          <v-spacer />
          <v-btn icon @click="isOpen = false">
            <v-icon size="30" color="grey lighten-1">close</v-icon>
          </v-btn>
        </span>
      </v-card-title>
      <div class="header-separator">
        <div />
      </div>
      <v-card-text>
        <v-form
          id="share-dialog-form"
          ref="form"
          v-model="isFormValid"
          @keydown.enter="onSubmitForm"
          @submit="onSubmitForm"
          onsubmit="return false;"
          max-width="100px"
        >
          <v-row>
            <v-col>
              <ContactsSelect
                :selected.sync="formData.users"
                :contacts="allowedContacts"
                :rule="rules.users"
                :noDataText="getNoDataText"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                v-model="formData.message"
                color="accent"
                :counter="valid.message.max"
                :label="$text.Message"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-checkbox
                v-if="!!file"
                :label="$text.ShareVerify"
                v-model="formData.isVerify"
              />
            </v-col>
          </v-row>

          <!-- Template selector - hide if template already chosen by parent comp -->
          <v-row
            v-if="!template && isSpaceForms && !getUser.isExternal"
            v-show="formData.isVerify"
          >
            <v-col>
              <v-select
                v-model="formData.template"
                :items="templates"
                item-text="name"
                item-value="id"
                outlined
                :label="$text.Form"
                dense
                color="accent"
              ></v-select>

              <TheTemplatesEdit
                v-if="isCreateDialog"
                v-model="isCreateDialog"
                @onSuccess="onAddTemplate"
              />
              <v-btn @click="isCreateDialog = true" small text color="accent">
                <v-icon>add</v-icon>
                {{ $text.TemplateNew }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
        <div
          class="note-wrapper"
          v-text="$text.RequestNotice"
          v-if="isSpaceForms"
        />
        <div class="action-btn-wrapper">
          <v-btn
            :loading="isLoading"
            color="accent"
            @click="onSubmitForm"
            class="share-btn"
          >
            <span>{{ $text.Send }}</span>
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="scss">
$colorAccent: #cc2531;

#docs-share-dialog {
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

    &.status {
      font-size: 1.5rem;
      color: #666666;
    }
  }

  .action-btn-wrapper {
    justify-content: center;
    align-items: flex-end;
    padding: 10px;
    display: flex;

    .share-btn {
      height: 50px;
    }
  }
}
</style>
