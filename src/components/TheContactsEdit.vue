<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { AuthS, SpacesS, UserDirectoryS } from '@/types/'
import Stx from '@/types/stx.ts'
import _ from 'lodash'
import { validator } from '@/utils/validator'
import Dialog from '@/mixins/Dialog.ts'
import { SpaceRoles } from '../types/spacesD'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

type Rule = (v: string) => string | true // vaidation rule type
interface Rules {
  [key: string]: Rule[]
}

interface Form extends Element {
  resetValidation: () => null
  validate: () => null
}

type Record = UserDirectory.Record

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

const FORM_EMPTY: Record = {
  id: '-1',
  name: '',
  surname: '',
  email: '',
  company: '',
  lang: Stx.lang.default,

  brand: '',
  role: SpaceRoles.employee,
  userType: 'normal', // TODO: ref: pull const from UserDirectoryS
  isRegistered: false,
  positionType: 'others'
}

@Component({ mixins: [Dialog] })
export default class TheContractsEdit extends Mixins(Dialog) {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(...AuthS.getUser) getUser: Auth.User
  @A(...UserDirectoryS.create) vuexCreate: UserDirectory.CreateA
  // @A(...UserDirectoryS.update) vuexUpdate: Contacts.UpdateA // TODO: should be invite
  @G(...UserDirectoryS.records) contacts: Record[]
  @G(...SpacesS.isUserDirectory) isUserDirectory: boolean

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  // isLoading: show loader icon if true
  isLoading = false

  // Form fields
  formData: Record = { ...FORM_EMPTY }

  // rules: set of rules for validating record fields
  rules: Rules = {
    email: [
      (v: string) => validator.required(v),
      (v: string) => v !== this.valid.ownerEmail || this.$text.RuleYourEmail,
      (v: string) =>
        !this.valid.existingEmails.includes(v) || this.$text.RuleEmailDupe
    ],
    text: [
      (v: string) => validator.required(v),
      (v: string) => validator.lessOrEqual(v, this.valid.text.max),
      (v: string) => validator.moreOrEqual(v, this.valid.text.min)
    ],
    template: [(v: string) => validator.required(v)]
  }

  isFormValid = false
  valid: {
    text: { min: number; max: number }
    ownerEmail: string
    existingEmails: string[]
  } = {
    text: { min: 2, max: 30 },
    ownerEmail: '',
    existingEmails: []
  }

  languageKeys = Stx.lang.list

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop() edit: Record

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get form(): Form {
    return this.$refs.form as Form
  }

  get getStatuses() {
    return {
      pending: 'pending',
      accepted: 'accepted',
      rejected: 'rejected'
    }
  }

  get getInputTypes() {
    return [
      { value: 'text', text: this.$text.Text },
      { value: 'number', text: this.$text.Number },
      { value: 'checkbox', text: this.$text.Checkbox },
      { value: 'select', text: this.$text.Select },
      { value: 'multiselect', text: this.$text.Multiselect }
    ]
  }

  get isEdit() {
    return !!this.edit
  }

  get getRoles() {
    return [SpaceRoles.employee, SpaceRoles.admin]
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌
  mounted() {
    this.valid.existingEmails = this.contacts
      .map((c: Record) => c.email)
      .filter((e: string) => !this.edit || e !== this.edit.email)

    // if `edit` is supplied, means editing existing template
    // clone it into local form
    if (this.edit) {
      this.formData = _.cloneDeep(this.edit)
    }

    this.valid.ownerEmail = (this.getUser && this.getUser.email) || ''
  }

  // TODO: is it needed?..
  destroyed() {
    this.$emit('update:edit', null)
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  // * Validate form and either update or create record
  onSubmitForm() {
    // cancel form submit if already submitted or form is invalid
    if (this.isLoading || !this.form.validate() || !this.isFormValid) {
      return false
    }

    // enable loading spinner
    this.isLoading = true

    const action = this.vuexCreate
    let successMsg = this.$msg.usersNewSuccess

    if (this.edit) {
      // action = this.vuexUpdate // TODO: if not implementing updating record - delete
      successMsg = this.$msg.contactsUpdateSuccess
    }

    action(this.formData)
      .then((user: UserDirectory.Record) => {
        this.isOpen = false
        this.$showSnack(successMsg)
        this.$emit('onSuccess', user)
      })
      .catch(() => {
        this.isLoading = false
      })
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
  >
    <v-card id="documents-share-dialog">
      <v-card-title>
        <span class="sharing__header">
          <span class="header-icon">
            <v-icon v-if="isEdit" size="40" color="grey darken-1">
              mdi-account-edit
            </v-icon>
            <v-icon v-else size="40" color="grey darken-1">
              mdi-account-plus
            </v-icon>
          </span>
          <div class="sharing__header__title">
            <span v-if="isEdit">{{ $text.Editing }} "{{ edit.name }}"</span>
            <span v-else>
              <span v-if="isUserDirectory" v-text="$text.InviteUser" />
              <span v-else v-text="$text.ConnectionAdd" />
            </span>
          </div>
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
          <!-- EMAIL -->
          <v-row>
            <v-col>
              <v-text-field
                v-model="formData.email"
                color="accent"
                :rules="rules.email"
                :label="$text.Email"
                :disabled="!!edit"
                required
              />
            </v-col>
          </v-row>

          <!-- NAME and SURNAME -->
          <v-row>
            <v-col>
              <v-text-field
                v-model="formData.name"
                color="accent"
                :rules="rules.text"
                :counter="valid.text.max"
                :label="$text.FirstName"
                required
              />
            </v-col>
            <v-col>
              <v-text-field
                v-model="formData.surname"
                color="accent"
                :counter="valid.text.max"
                :label="$text.Surname"
                required
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <v-select
                v-model="formData.lang"
                :items="languageKeys"
                :label="$text.Language"
                dense
                color="accent"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <v-select
                v-model="formData.role"
                :items="getRoles"
                :label="$text.Role"
                dense
                color="accent"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="isLoading"
          color="secondary"
          @click="isOpen = false"
          v-text="$text.Cancel"
        />

        <v-btn
          :loading="isLoading"
          color="accent"
          @click="onSubmitForm"
          class="share-btn"
        >
          Save
        </v-btn>
      </v-card-actions>
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

  .header-icon {
    margin-right: 2rem;
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

  // override vuetify style for focused button
  .add-btn:focus::before {
    opacity: 0 !important;
  }
}
</style>
