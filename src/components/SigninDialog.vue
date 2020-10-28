<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { Action as A } from 'vuex-class'
import { Form, Rules, AuthS } from '@/types/'
import Stx from '@/types/stx.ts'
import { validator } from '@/utils/validator'
import ForgotPasswordDialog from '@/components/ForgotPasswordDialog.vue'
import { config } from '../utils/config'
import Dialog from '@/mixins/Dialog'
import VueRecaptcha from 'vue-recaptcha'

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Types

// * Type to reset recaptcha
interface Recaptcha extends Element {
  reset(): () => void
}

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

@Component({
  components: { ForgotPasswordDialog, VueRecaptcha },
  mixins: [Dialog]
})
export default class SigninDialog extends Mixins(Dialog) {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @A(...AuthS.signin) vuexSignin: Auth.SigninA

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Boolean) isUnauthed: boolean
  @Prop(Object) unauthedUser: Auth.UnauthedUser

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isLoading = false // * isLoading: show loader icon if true
  showPassword = false
  isForgotPassword = false

  users: Forms.Recipient[] = []

  // * Form fields
  formData: Auth.SigninP = {
    email: '',
    password: '',
    recaptcha: '',
    captcha: ''
  }

  // * Set of rules for validating record fields
  rules: Rules = {
    email: [(v: string) => this.isToken || validator.required(v)],
    password: [
      (v: string) => this.isToken || validator.required(v),
      (v: string) =>
        this.isToken || validator.moreOrEqual(v, this.valid.password.min),
      (v: string) =>
        this.isToken || validator.lessOrEqual(v, this.valid.password.max)
    ]
  }

  isFormValid = false // * v-model on vuetify form
  valid = {
    password: { min: 8, max: 50 }
  }

  //*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

  get form(): Form {
    return this.$refs.form as Form
  }

  get recaptcha(): Recaptcha {
    return this.$refs.recaptcha as Recaptcha
  }

  get getSuggestedUsers() {
    if (!this.formData.email) {
      return this.users
    }
    return [this.formData, ...this.users]
  }

  get getConfig() {
    return config
  }

  // If token is set - no need for email and password
  get isToken() {
    return !!this.unauthedUser.token
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  mounted() {
    // to prevent autofill
    if (this.isUnauthed && this.unauthedUser.email) {
      this.formData.email = this.unauthedUser.email
    }

    // Show reCAPTCHA badge
    const recaptcha = this.$recaptchaInstance
    recaptcha?.showBadge()
  }

  destroyed() {
    // Hide reCAPTCHA badge
    const recaptcha = this.$recaptchaInstance
    recaptcha?.hideBadge()
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  async recaptchaCheck() {
    // (optional) Wait until recaptcha has been loaded.
    await this.$recaptchaLoaded()

    // Execute reCAPTCHA with action "login".
    return this.$recaptcha(Stx.recaptchaPages.signin)
  }

  recaptchaReset() {
    this.recaptcha.reset()
  }

  onVerify(response: string) {
    this.formData.captcha = response
  }
  onExpired() {
    this.formData.captcha = ''
  }

  // * Validate form and either update or create record
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
    const payload = {
      email: this.formData.email,
      password: this.formData.password,
      token: this.unauthedUser.token,
      recaptcha,
      captcha: this.formData.captcha
    }

    this.vuexSignin(payload)
      .then(() => {
        this.isOpen = false
      })
      .catch(() => {
        this.isLoading = false
        if (config.isRecaptcha) {
          this.recaptchaReset()
        }
      })
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    width="380px"
    @keydown.esc="() => (!isLoading ? (isOpen = false) : null)"
    persistent
  >
    <v-card id="signin-dialog">
      <ForgotPasswordDialog
        v-if="isForgotPassword"
        v-model="isForgotPassword"
      />

      <v-card-title>
        <span class="sharing__header">
          <span
            class="sharing__header__title"
            :title="$text.SignIn"
            v-text="$text.SignIn"
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
          class="dialog-form"
          ref="form"
          v-model="isFormValid"
          @keydown.enter="onSubmitForm"
          @submit="onSubmitForm"
          onsubmit="return false;"
          max-width="100px"
        >
          <v-row v-if="isUnauthed">
            <v-col class="text-center">{{ $text.SigninNoitce }}</v-col>
          </v-row>
          <!-- If user is trying to sign in using token - no need to show email/password fields -->
          <v-row v-if="!isToken">
            <v-col>
              <v-text-field
                v-model="formData.email"
                :rules="rules.email"
                :label="$text.EmailUsername"
                @keydown.enter="onSubmitForm"
                required
              />
              <v-text-field
                v-model="formData.password"
                :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                :rules="rules.password"
                :type="showPassword ? 'text' : 'password'"
                password
                :label="$text.Password"
                required
                @click:append="showPassword = !showPassword"
                @keydown.enter="onSubmitForm"
              ></v-text-field>
              <div style="text-align:right">
                <a @click="isForgotPassword = true">
                  {{ $text.ForgotPasswordQuestion }}
                </a>
              </div>
            </v-col>
          </v-row>
          <v-row v-if="getConfig.isRecaptcha">
            <v-col>
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
            <span v-if="isToken">{{ $text.GoToApp }}</span>
            <span v-else>{{ $text.SignInDiginex }}</span>
          </v-btn>
        </div>
        <div v-if="!isToken" class="action-btn-wrapper">
          {{ $text.or }}
        </div>
        <div v-if="!isToken" class="action-btn-wrapper">
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

#signin-dialog {
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

  .dialog-form {
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
