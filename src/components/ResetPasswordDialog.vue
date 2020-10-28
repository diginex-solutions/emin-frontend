<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { AuthS } from '@/types/'
import Stx from '@/types/stx.ts'
import { validator } from '@/utils/validator'
import Dialog from '@/mixins/Dialog'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

type Rule = (v: string) => string | true // validation rule type
interface Rules {
  [key: string]: Rule[]
}

interface Form extends Element {
  validate: () => null
  resetValidation: () => null
}

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  mixins: [Dialog]
})
export default class ResetPasswordDialog extends Mixins(Dialog) {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...AuthS.getUser) getUser: Auth.User
  @A(...AuthS.register) vuexRegister: Auth.RegisterA
  @A(...AuthS.resetPassword) vuexResetPassword: Auth.ResetPasswordA

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  isLoading = false // * Show loader icon if true
  showPassword = false

  users: Forms.Recipient[] = []

  // * Form fields
  formData: Auth.ResetPasswordP = {
    password: '',
    passwordConfirm: ''
  }

  // * Set of rules for validating record fields
  rules: Rules = {
    password: [
      (v: string) => validator.required(v),
      (v: string) => validator.moreOrEqual(v, this.valid.password.min),
      (v: string) => validator.lessOrEqual(v, this.valid.password.max)
    ]
  }

  isFormValid = false
  valid = {
    password: { min: 8, max: 50 }
  }

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get form(): Form {
    return this.$refs.form as Form
  }

  get passwordConfirm() {
    const pass = this.formData.password
    return (v: string) => v === pass || this.$text.RulePasswordConfirm
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  async recaptcha() {
    // (optional) Wait until recaptcha has been loaded.
    await this.$recaptchaLoaded()

    // Execute reCAPTCHA with action "forgotPassword".
    return this.$recaptcha(Stx.recaptchaPages.resetPassword)
  }

  // onSubmitForm: validate form and either update or create record
  async onSubmitForm() {
    // cancel form submit if already submitted or form is invalid
    if (this.isLoading || !this.form.validate()) {
      return false
    }

    this.isLoading = true // Enable loading spinner

    const recaptcha = await this.recaptcha() // Get recaptcha token
    const payload = {
      ...this.formData,
      recaptcha
    }

    // Dispatch action
    this.vuexResetPassword(payload)
      .then(() => {
        this.isOpen = false
        this.$router.push('/')

        this.$showSnack(this.$msg.resetPasswordSuccess)
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
    @keydown.esc="() => (isLoading ? null : (isOpen = false))"
    persistent
  >
    <v-card id="documents-share-dialog">
      <v-card-title>
        <span class="sharing__header">
          <span
            class="sharing__header__title"
            :title="$text.ResetPassword"
            v-text="$text.ResetPassword"
          />
          <v-btn :disabled="isLoading" icon @click="isOpen = false">
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
              <v-text-field
                v-model="formData.password"
                :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                :rules="[...rules.password, passwordConfirm]"
                :type="showPassword ? 'text' : 'password'"
                password
                :label="$text.Password"
                required
                @input="formData.passwordConfirm = ''"
                @click:append="showPassword = !showPassword"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="formData.passwordConfirm"
                :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                :rules="[...rules.password, passwordConfirm]"
                :type="showPassword ? 'text' : 'password'"
                password
                :label="$text.ResetPasswordConfirm"
                required
                @click:append="showPassword = !showPassword"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
        <div class="action-btn-wrapper">
          <v-btn
            :disabled="!isFormValid"
            :loading="isLoading"
            color="accent"
            @click="onSubmitForm"
            class="share-btn"
          >
            {{ $text.ResetPassword }}
          </v-btn>
        </div>
      </v-card-text>
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

  .action-btn-wrapper {
    justify-content: center;
    align-items: flex-end;
    padding: 10px;
    display: flex;

    .share-btn {
      height: 50px;
      min-width: 150px;
    }
  }
}
</style>
