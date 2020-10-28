<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { config } from '@/utils/config'
import { AuthS } from '@/types/'
import Stx from '@/types/stx.ts'
import {
  validation,
  rules as defaultRules,
  valid as defaultValidation
} from '../utils/validator'
import Dialog from '@/mixins/Dialog'
import VueRecaptcha from 'vue-recaptcha'
import PasswordRequirementsCard from '@/components/PasswordRequirementsCard.vue'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

// * Type to reset recaptcha
interface Recaptcha extends Element {
  reset(): () => void
}

type Rule = (v: string) => string | true // validation rule type
interface Rules {
  [key: string]: Rule[]
}

interface Form extends Element {
  validate: () => null
  resetValidation: () => null
}

export interface ValidationParams {
  text: { min: number; max: number }
  password: { min: number; max: number }
}

const USER_EMPTY: Auth.NewUser = {
  email: '',
  name: '',
  surname: '',
  lang: 'en',
  password: '',
  passwordConfirm: '',
  recaptcha: '',
  captcha: ''
}

@Component({
  components: { VueRecaptcha, PasswordRequirementsCard },
  mixins: [Dialog]
})
export default class RegisterDialog extends Mixins(Dialog) {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @A(...AuthS.register) vuexRegister: Auth.RegisterA
  @G(...AuthS.getUser) getUser: Auth.User

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Boolean) isUnauthed: boolean
  @Prop(Object) unauthedUser: Auth.UnauthedUser

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  // isLoading: show loader icon if true
  isLoading = false
  showPassword = false

  users: Forms.Recipient[] = []

  // Form fields
  formData: Auth.NewUser = { ...USER_EMPTY }

  valid = {
    ...defaultValidation,
    text: { min: 2, max: 60 }
  }
  // rules: set of rules for validating record fields
  rules: Rules = {
    ...defaultRules,
    text: validation()
      .required()
      .lessOrEqual(this.valid.text.max)
      .moreOrEqual(this.valid.text.min)
      .getRules()
  }

  isFormValid = false

  languageKeys = Stx.lang.list

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get form(): Form {
    return this.$refs.form as Form
  }

  get getSuggestedUsers() {
    if (!this.formData.email) {
      return this.users
    }
    return [this.formData, ...this.users]
  }

  get passwordConfirm() {
    const pass = this.formData.password
    return (v: string) => v === pass || this.$text.RulePasswordConfirm
  }

  get getConfig() {
    return config
  }

  get recaptcha(): Recaptcha {
    return this.$refs.recaptcha as Recaptcha
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  mounted() {
    // to get prevent autofill
    if (this.isUnauthed && this.unauthedUser.email) {
      this.formData.email = this.unauthedUser.email
      this.formData.name = this.unauthedUser.name
      this.formData.surname = this.unauthedUser.surname
      this.formData.lang = this.unauthedUser.lang
    }

    // Show reCAPTCHA badge
    const recaptcha = this.$recaptchaInstance
    recaptcha?.showBadge()
  }

  destroyed() {
    // Hide reCAPTCHA badge
    const recaptcha = this.$recaptchaInstance
    recaptcha.hideBadge()
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods
  async recaptchaCheck() {
    // (optional) Wait until recaptcha has been loaded.
    await this.$recaptchaLoaded()

    // Execute reCAPTCHA with action "login".
    return this.$recaptcha(Stx.recaptchaPages.register)
  }

  onVerify(response: string) {
    this.formData.captcha = response
  }
  onExpired() {
    this.formData.captcha = ''
  }

  // onSubmitForm: validate form and either update or create record
  async onSubmitForm() {
    const isCaptchaFail = config.isRecaptcha && !this.formData.captcha

    // cancel form submit if already submitted or form is invalid
    if (this.isLoading || !this.form.validate() || isCaptchaFail) {
      return false
    }

    // enable loading spinner
    this.isLoading = true

    let recaptcha = ''
    if (config.isRecaptcha) {
      recaptcha = await this.recaptchaCheck() // Get recaptcha token
    }

    // Dispatch action
    const payload = { ...this.formData, recaptcha }
    this.vuexRegister(payload)
      .then(() => {
        this.isOpen = false
        this.$showSnack(this.$msg.signupSuccess)
      })
      .catch(() => {
        this.isLoading = false
        this.recaptcha.reset()
      })
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    width="600px"
    @keydown.esc="isOpen = false"
    persistent
  >
    <v-card id="register-dialog">
      <v-card-title>
        <span class="sharing__header">
          <span
            class="sharing__header__title"
            :title="$text.Register"
            v-text="$text.Register"
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
          id="register-dialog-form"
          ref="form"
          v-model="isFormValid"
          @keydown.enter="onSubmitForm"
          @submit="onSubmitForm"
          onsubmit="return false;"
          max-width="100px"
        >
          <v-row v-if="isUnauthed">
            <v-col class="text-center">{{ $text.RegisterNoitce }}</v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="formData.email"
                :rules="rules.email"
                :label="$text.EmailUsername"
                required
                autocomplete="new-password"
              />
            </v-col>
          </v-row>
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
                autocomplete="new-password"
              ></v-text-field>
              <password-requirements-card
                :password="formData.password"
                :validationParams="valid"
              />
            </v-col>
            <v-col>
              <v-text-field
                v-model="formData.passwordConfirm"
                :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                :rules="[...rules.password, passwordConfirm]"
                :type="showPassword ? 'text' : 'password'"
                password
                :label="$text.PasswordConfirm"
                required
                @click:append="showPassword = !showPassword"
              ></v-text-field>
            </v-col>
          </v-row>
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
                :rules="rules.text"
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
          <v-row v-if="getConfig.isRecaptcha">
            <v-col class="d-flex justify-center">
              <vue-recaptcha
                ref="recaptcha"
                @verify="onVerify"
                @expired="onExpired"
                :sitekey="getConfig.captchaV2Key"
                :loadRecaptchaScript="true"
              ></vue-recaptcha>
            </v-col>
          </v-row>
        </v-form>
        <div class="action-btn-wrapper">
          <v-btn
            :loading="isLoading"
            color="accent"
            @click="onSubmitForm"
            class="share-btn text-none"
          >
            <img height="15px" src="/img/diginex-logo-white.png" class="pr-3" />
            {{ $text.SignUpDiginex }}
          </v-btn>
        </div>
        <div class="action-btn-wrapper">
          {{ $text.or }}
        </div>
        <div class="action-btn-wrapper">
          <a :href="getConfig.azure.authUrl">
            <img src="/img/microsoft-signin.svg" class="microsoft-signin" />
          </a>
        </div>
        <div class="action-btn-wrapper">
          <a :href="getConfig.facebook.authUrl">
            <img
              src="/img/continue-with-facebook-button.png"
              class="facebook-button"
            />
          </a>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="scss">
$colorAccent: #cc2531;

#register-dialog {
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

  #register-dialog-form {
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
      height: 40px;
      min-width: 150px;
    }

    .microsoft-signin {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .facebook-button {
      width: 220px;
    }
  }
}
</style>
