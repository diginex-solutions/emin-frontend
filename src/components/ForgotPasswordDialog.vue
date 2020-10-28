<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action as A } from 'vuex-class'
import { AuthS } from '@/types/'
import { Form } from '@/types/'
import Stx from '@/types/stx.ts'
import { rules as r } from '@/utils/validator'
import { config } from '@/utils/config'
import Dialog from '@/mixins/Dialog'
import VueRecaptcha from 'vue-recaptcha'

@Component({
  components: { VueRecaptcha },
  mixins: [Dialog]
})
export default class ForgotPasswordDialog extends Mixins(Dialog) {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @A(...AuthS.forgotPassword) vuexForgotPassword: Auth.ForgotPasswordA

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isLoading = false //  show loader icon if true
  users: Forms.Recipient[] = []

  // * Form fields
  formData: Auth.ForgotPasswordP = {
    email: '',
    recaptcha: '',
    captcha: ''
  }

  // * Set of rules for validating record fields
  rules = r

  isFormValid = false

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  get form(): Form {
    return this.$refs.form as Form
  }

  get getSuggestedUsers() {
    if (!this.formData.email) {
      return this.users
    }
    return [this.formData, ...this.users]
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  async recaptcha() {
    // (optional) Wait until recaptcha has been loaded.
    await this.$recaptchaLoaded()

    // Execute reCAPTCHA with action "forgotPassword".
    return this.$recaptcha(Stx.recaptchaPages.forgotPassword)
  }

  get getConfig() {
    return config
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
      recaptcha = await this.recaptcha() // Get recaptcha token
    }

    const payload = {
      ...this.formData,
      recaptcha
    }

    // Dispatch action
    this.vuexForgotPassword(payload)
      .then(() => {
        this.isOpen = false
        this.$showSnack(this.$msg.forgotPasswordSuccess)
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
    width="400px"
    @keydown.esc="isLoading ? null : (isOpen = false)"
  >
    <v-card id="signin-dialog">
      <v-card-title>
        <span class="sharing__header">
          <span
            class="sharing__header__title"
            :title="$text.ForgotPasswordTitle"
            v-text="$text.ForgotPasswordTitle"
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
          <v-row>
            <v-col>
              <v-text-field
                v-model="formData.email"
                :rules="rules.email"
                :label="$text.ForgotPasswordLabelEmail"
                @keydown.enter="onSubmitForm"
                required
              />
            </v-col>
          </v-row>
          <v-row v-if="getConfig.isRecaptcha">
            <v-col>
              <vue-recaptcha
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
            :disabled="!isFormValid"
            :loading="isLoading"
            color="accent"
            @click="onSubmitForm"
            class="share-btn"
          >
            {{ $text.ForgotPasswordSubmitBtn }}
          </v-btn>
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
      height: 50px;
      min-width: 150px;
    }
  }
}
</style>
