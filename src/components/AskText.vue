<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { validator, validation } from '@/utils/validator'
import Dialog from '@/mixins/Dialog.ts'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

type Rule = (v: string) => string | true // * Validation rule
// * Vuetify form
interface Form extends Element {
  reset: () => null
}
// * VueRef to input with `focus` method
interface VueRef extends Element {
  focus(): () => void
}

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  mixins: [Dialog]
})
export default class AskText extends Mixins(Dialog) {
  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  // *** Required
  @Prop(String) title: string // * Header of the dialog
  @Prop(String) inputTitle: string // * Title of the input field
  @Prop(String) btnSubmit: string // * Submit btn text
  @Prop(String) btnCancel: string // * Cancel btn text
  @Prop(Boolean) isLoading: boolean // * Loader, prevent any user interaction
  @Prop(Boolean) disabled: boolean // * Disabled submit/cancel btns

  // *** Optional
  @Prop(Number) min: number | undefined // * Min length of input text
  @Prop(Number) max: number | undefined // * Max length of input text
  @Prop(String) initial: string | undefined // * Initial string value of the form
  @Prop(Boolean) optional: boolean | undefined // * Whether or not the component is required
  @Prop(Array) badChars: string[] | undefined // * Forbidden chars
  @Prop(Array) notEqual: string[] | undefined // * Should not be equal
  @Prop(Boolean) isPassword: boolean | undefined // * Hide input content

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  text = '' // * Form data

  // * Rules for validating record fields
  rules: { text: Rule[] } = {
    text: [
      (v: string) => this.optional || validator.required(v),
      ...validation()
        .lessOrEqual(this.validText.max)
        .moreOrEqual(this.validText.min)
        .badChars(this.badChars || [])
        .notEqual(this.notEqual || [])
        .getRules()
    ]
  }

  isFormValid = false // * Synced to form validation
  showPwd = false

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  // * Reference to form
  get form(): Form {
    return this.$refs.form as Form
  }

  // * Restriction for text
  get validText() {
    return {
      min: this.min || 1,
      max: this.max || 150
    }
  }

  get getAppendIcon() {
    if (!this.isPassword) return ''
    return this.showPwd ? 'mdi-eye' : 'mdi-eye-off'
  }

  get getBtnTextCancel() {
    const textCancel = this.$text.Cancel
    return this.btnCancel ? this.btnCancel : textCancel
  }

  get getBtnTextSubmit() {
    const textSubmit = this.$text.Submit
    return this.btnSubmit ? this.btnSubmit : textSubmit
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  // * After mounting - use initial text, if provided
  mounted() {
    this.text = this.initial || ''

    // *** After rendered, focus on input element
    this.focusAsync()
  }

  focusAsync() {
    setTimeout(() => {
      const input = this.$refs.input as VueRef
      input?.focus()
    }, 150)
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  // * User clicked submit button
  onSubmitForm() {
    // *** Cancel form submit if loading, or disabled, or form validation fail
    if (this.isLoading || this.disabled || !this.isFormValid) {
      return false
    }

    // *** Dispatch event to parent, along with input value
    this.$emit('onSubmit', this.text)
    // refocus after submit because wrong input
    this.focusAsync()
  }
}
</script>

<template>
  <v-dialog v-model="isOpen" width="400px" @keydown.esc="isOpen = false">
    <v-card>
      <!-- *** HEADER: title and close icon-btn -->
      <v-card-title style="flex-wrap: nowrap; word-break: normal">
        <span>{{ title }}</span>
        <v-spacer />
        <v-btn icon @click="isOpen = false">
          <v-icon color="grey lighten-1">close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- *** FORM: has textfield-->
      <v-card-text>
        <v-form
          ref="form"
          v-model="isFormValid"
          @keydown.enter="onSubmitForm"
          @submit="onSubmitForm"
          onsubmit="return false;"
        >
          <v-flex xs12>
            <!-- * Input field -->
            <v-text-field
              v-model="text"
              :rules="rules.text"
              :counter="max || validText.max"
              :type="!isPassword || showPwd ? 'text' : 'password'"
              :append-icon="getAppendIcon"
              @click:append="showPwd = !showPwd"
              :label="inputTitle"
              required
              ref="input"
            />
          </v-flex>
        </v-form>
      </v-card-text>

      <!-- *** BUTTONS: cancel and submit -->
      <v-card-actions>
        <!-- Align btns right -->
        <v-spacer />

        <!-- * Cancel button -->
        <v-btn
          :disabled="disabled || isLoading"
          :loading="isLoading"
          @click="isOpen = false"
          :title="btnCancel"
        >
          {{ getBtnTextCancel }}
        </v-btn>

        <!-- * Submit button -->
        <v-btn
          :disabled="disabled || !isFormValid || isLoading"
          :loading="isLoading"
          color="accent"
          @click="onSubmitForm"
          :title="btnSubmit"
        >
          {{ getBtnTextSubmit }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
