<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { RootA, AuthS, DocsS, SpacesS } from '@/types/'
import Stx from '@/types/stx.ts'
import {
  rules as defaultRules,
  valid as defaultValidation
} from '@/utils/validator'

import AskText from '@/components/AskText.vue'
import PasswordRequirementsCard from '@/components/PasswordRequirementsCard.vue'
import CountrySelector from '@/components/CountrySelector.vue'
import Settings from '@/components/Settings.vue'
import { Routes } from '../router'
import { Gender } from '../types/userDirectoryD'

interface EditableFields {
  name: string
  surname: string
  email: string
  dateOfBirth: string
  workDepartment: string
  workTitle: string
  countryCode: string
  phoneNumber: string
  gender: string
  location: string
}

@Component({
  components: { AskText, PasswordRequirementsCard, CountrySelector, Settings }
})
export default class ProfileManagementDialog extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧
  @G(...AuthS.getUser) getUser: Auth.User
  @A(...AuthS.updateUser) vuexUpdate: Auth.UpdateUserA
  @A(...AuthS.changePassword) changePassword: Auth.ChangePasswordA
  @A(...DocsS.fetch) fetchDocs: Docs.FetchA
  @A(RootA.updateLoading) updateLoading: RootStore.UpdateLoadingA
  @A(...SpacesS.updatePersonalSpace)
  updatePersonalSpace: Spaces.UpdatePersonalSpaceA

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop(Boolean) value: boolean // * v-model at parent level ; here: showProfileManagementDialog

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  // isLoading: show loader icon if true
  isLoading = false
  pendingPasswordUpdate = false
  isFormValid = true
  showPwd = false
  showBirthdayMenu = false
  askCurrentPassword = false

  rules = defaultRules
  valid = defaultValidation

  emptyRecord: EditableFields = {
    name: '',
    surname: '',
    email: '',
    dateOfBirth: '',
    workDepartment: '',
    workTitle: '',
    countryCode: '',
    phoneNumber: '',
    gender: '',
    location: ''
  }

  newPassword = ''

  record = { ...this.emptyRecord }

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  // * GetSet, Handling visibility of the dialog
  get isOpen() {
    return this.value
  }

  set isOpen(value: boolean) {
    this.$emit('input', value)
  }

  get countriesList() {
    return Stx.countries
  }

  get formattedBirthday() {
    if (this.record.dateOfBirth?.length === 0) {
      return ''
    }
    return new Date(this.record.dateOfBirth).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  get passwordRules() {
    // If reset password is required - force rules
    if (this.isResetPassword) {
      return this.rules.password
    }
    return this.newPassword ? this.rules.password : [() => true]
  }

  get formUpdated() {
    return this.updatedNonPasswordFields || this.newPassword
  }

  get updatedNonPasswordFields() {
    return Object.keys(this.getUpdates()).length > 0
  }

  get genders() {
    // TODO: i18n export refac
    return [
      {
        value: Gender.male,
        text: this.$text.GenderMale
      },
      {
        value: Gender.female,
        text: this.$text.GenderFemale
      },
      {
        value: Gender.other,
        text: this.$text.GenderOther
      }
    ]
  }

  // After user logs in for the first time, and not registered - force password reset
  get isResetPassword() {
    return !this.getUser.isRegistered
  }

  // === === === === === === === === === ===
  // HOOKS

  mounted() {
    if (!this.getUser) {
      return
    }

    this.resetUpdates()
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  onSubmit() {
    // If user is logged in first time - no need to ask current password
    const isFirstLogin = !this.getUser.isRegistered

    if (!!this.newPassword && !isFirstLogin) {
      this.askCurrentPassword = true
    } else {
      this.submitUpdates()
    }

    // If first time login, need to set password
    if (isFirstLogin) {
      this.continueSubmit('')

      setTimeout(() => {
        // Refresh documents, then redirect
        this.fetchDocs().then(() => {
          this.isOpen = false
          this.updateLoading(false)
          // Go to documents
          const path = { name: Routes.documents.name }
          this.$router.push(path)
        })
      }, 300)
    }
  }

  submitUpdates() {
    this.isLoading = true

    const updates = this.getUpdates()
    const updateName = 'name' in updates

    this.vuexUpdate(updates)
      .then(() => (updateName ? this.updatePersonalSpace() : Promise.resolve()))
      .then(() => {
        this.isLoading = false
        this.resetUpdates()
        this.$showSnack(this.$msg.accountUpdateSuccess)
      })
      .catch(() => {
        this.isLoading = false
        this.$showSnack(this.$msg.accountUpdateError)
      })
  }

  continueSubmit(currentPassword: string) {
    this.pendingPasswordUpdate = true

    const payload = {
      currentPassword,
      password: this.newPassword
    }

    this.changePassword(payload)
      .then(() => {
        this.askCurrentPassword = false
        this.pendingPasswordUpdate = false
        this.newPassword = ''
        this.$showSnack(this.$msg.passwordUpdateSuccess)
      })
      .catch(() => {
        this.pendingPasswordUpdate = false
      })

    if (this.updatedNonPasswordFields) {
      this.submitUpdates()
    }
  }

  resetUpdates() {
    this.record = { ...this.emptyRecord }
    Object.keys(this.record).forEach((k) => {
      const key = k as keyof EditableFields
      const prop = k as keyof Auth.User
      if (this.getUser[prop] != null) {
        this.record[key] = this.getUser[prop]?.toString() || ''
      }
    })
  }

  getUpdates() {
    interface FillableWithStrings {
      [k: string]: string
    }

    const updates: FillableWithStrings = {}
    Object.keys(this.record).forEach((f) => {
      const editableField = f as keyof EditableFields
      const userField = f as keyof Auth.User
      const fieldValue = this.record[editableField]
      const originalValue = this.getUser[userField]
      const noOriginalValue = originalValue == null || originalValue === ''
      const emptyOrResetedField = fieldValue === '' || fieldValue == null
      if (emptyOrResetedField && noOriginalValue) {
        return
      }
      if (fieldValue !== originalValue) {
        updates[editableField] = fieldValue || ''
      }
    })

    return updates
  }

  onCancel() {
    this.resetUpdates()
    this.newPassword = ''
    this.isOpen = false
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    max-width="600px"
    @keydown.esc="isOpen = false"
    id="crud-dialog"
    :persistent="isResetPassword"
  >
    <!-- Password popup -->
    <AskText
      v-if="askCurrentPassword"
      v-model="askCurrentPassword"
      :title="$text.PasswordConfirm"
      :inputTitle="$text.PasswordConfirmInput"
      :btnSubmit="$text.Submit"
      :btnCancel="$text.Cancel"
      @onSubmit="continueSubmit"
      @onCancel="askCurrentPassword = false"
      :isPassword="true"
      :isLoading="pendingPasswordUpdate"
    />
    <v-card>
      <!-- Header -->
      <v-card-title style="justify-content: space-between">
        <span class="headline pl-3 pt-3">{{ $text.AccountTitle }}</span>
        <v-btn v-if="!isResetPassword" icon @click="isOpen = false">
          <v-icon color="grey lighten-1">close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Form -->
      <v-card-text>
        <!-- Show message for first-time user -->
        <v-alert v-if="isResetPassword" type="info">
          {{ $text.FirstLoginNotification }}
        </v-alert>
        <v-form
          id="main-form"
          ref="form"
          v-model="isFormValid"
          @submit="onSubmit"
          class="account-details"
        >
          <v-col cols="12">
            <v-row justify="center">
              <v-col cols="6">
                <v-text-field
                  v-model="record.name"
                  :rules="rules.text"
                  :counter="valid.text.max"
                  :label="$text.Name"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="record.surname"
                  :rules="rules.text"
                  :counter="valid.text.max"
                  :label="$text.Surname"
                />
              </v-col>
              <v-col cols="6">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      v-model="record.email"
                      class="no-edit"
                      readonly
                      v-on="on"
                      :rules="rules.email"
                      :label="$text.Email"
                    />
                  </template>
                  <span>{{ $text.NotEditable }}</span>
                </v-tooltip>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newPassword"
                  :rules="passwordRules"
                  :type="showPwd ? 'text' : 'password'"
                  :append-icon="showPwd ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="showPwd = !showPwd"
                  clearable
                  @click:clear="newPassword = ''"
                  :label="$text.PasswordNew"
                />
                <password-requirements-card
                  :password="newPassword"
                  :validationParams="valid"
                />
              </v-col>
              <v-col cols="6">
                <v-menu
                  v-model="showBirthdayMenu"
                  :close-on-content-click="false"
                  :nudge-right="0"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :value="formattedBirthday"
                      readonly
                      @click:clear="record.dateOfBirth = ''"
                      :label="$text.Birthday"
                      v-on="on"
                      clearable
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="record.dateOfBirth"
                    @input="showBirthdayMenu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="record.gender"
                  :items="genders"
                  :label="$text.Gender"
                  hide-details
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="2" class="pr-0">
                <v-text-field
                  v-model="record.countryCode"
                  :label="$text.PhoneCountryCode"
                  :rules="rules.countryCode"
                  :counter="valid.countryCode.max"
                />
              </v-col>
              <v-col cols="4" class="pl-2">
                <v-text-field
                  v-model="record.phoneNumber"
                  :label="$text.PhoneNumber"
                  :rules="rules.phoneNumber"
                  :counter="valid.phoneNumber.max"
                />
              </v-col>
              <v-col cols="6">
                <country-selector
                  :value.sync="record.location"
                  :label="$text.Location"
                  :clearable="true"
                  :noIcon="true"
                />
              </v-col>
              <v-col cols="6">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      v-model="getUser.brand"
                      class="no-edit"
                      readonly
                      v-on="on"
                      :label="$text.Company"
                      hide-details
                    />
                  </template>
                  <span>{{ $text.NotEditable }}</span>
                </v-tooltip>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="record.workDepartment"
                  :rules="rules.optionalText"
                  :counter="valid.optionalText.max"
                  :label="$text.WorkDepartment"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="record.workTitle"
                  :rules="rules.optionalText"
                  :counter="valid.optionalText.max"
                  :label="$text.WorkTitle"
                />
              </v-col>
              <v-col cols="12">
                <settings />
              </v-col>
            </v-row>
          </v-col>
        </v-form>
      </v-card-text>

      <!-- Buttons -->
      <v-card-actions>
        <v-col cols="6" class="d-flex pt-0 pl-4 pb-4">
          <v-btn
            :disabled="!isFormValid || !formUpdated || isLoading"
            :loading="isLoading"
            color="accent"
            class="mr-3"
            style="flex-basis: 50%"
            @click="onSubmit"
          >
            {{ $text.Save }}
          </v-btn>
          <v-btn
            :disabled="!formUpdated || isLoading"
            color="secondary"
            style="flex-basis: 50%"
            @click="onCancel"
          >
            {{ $text.Cancel }}
          </v-btn>
        </v-col>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style>
#main-form {
  width: 100%;
}

form.account-details .col {
  padding-top: 0;
}

.no-edit input {
  cursor: not-allowed;
}
</style>
