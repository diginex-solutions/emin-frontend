<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { VTextField } from 'vuetify/lib'
import { FormInputTypes } from '../stx/stxForms'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

type Rule = (v: string) => string | true // * Validation rule
// * Vuetify form
interface Form extends Element {
  reset: () => null
  resetValidation(): () => void
}
// * VueRef to input with `focus` method
interface VueRef extends Element {
  focus(): () => void
}

export type FormData = any
type Record = DocumentTypes.Record

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({ components: { VTextField } })
export default class DocumentTypeForm extends Vue {
  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop() isLoading: boolean // * Spinner
  @Prop() submitBtnText: string // * Submit button text
  @Prop() formFields: Types.FormField[] // * Form fields for parsing
  @Prop() types: Record[] // Document types

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  formData: FormData = {}
  isFormValid = false // * Synced to form validation
  isMounted = false

  // * === === === === === === === === === ===
  // * Computed 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏

  get inputTypes() {
    return FormInputTypes
  }

  //* Get ref to main form
  get form(): Form | null {
    if (!this.isMounted) return null
    return this.$refs.form as Form
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  // *** After rendered, focus on first input element
  mounted() {
    this.isMounted = true

    this.formFields.forEach((field) => {
      this.formData[field.name] = ''
    })
    this.form?.resetValidation()

    // * Focus on first field
    setTimeout(() => {
      const defaultFormName = this.formFields[0]?.name || ''
      const input = this.$refs[defaultFormName] as VueRef[]

      if (input && input[0] && input[0].focus) {
        input[0].focus()
      }
    }, 150)
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  // * User clicked submit button
  onSubmitForm() {
    // *** Cancel form submit if loading, or disabled, or form validation fail
    if (this.isLoading || !this.isFormValid) {
      return false
    }

    this.$emit('onSubmit', this.formData)
    this.formData = {}
    this.formFields.forEach((field) => {
      this.formData[field.name] = ''
    })
    this.form?.resetValidation()
  }
}
</script>

<template>
  <v-card>
    <v-card-title>
      <slot></slot>
    </v-card-title>

    <!-- *** FORM -->
    <v-card-text>
      <v-list dense>
        <v-subheader v-text="$text.Category"></v-subheader>
        <v-list-item two-line v-for="type in types" :key="type.id">
          <v-list-item-icon>
            <v-icon
              v-text="'mdi-delete'"
              @click.prevent="$emit('onConfirm', type)"
            ></v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="type.title"></v-list-item-title>
            <v-list-item-subtitle
              v-text="type.description"
              :title="type.description"
            ></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-spacer />

      <v-form
        ref="form"
        v-model="isFormValid"
        @keydown.enter="onSubmitForm"
        @submit.prevent="onSubmitForm"
      >
        <template v-for="field in formFields">
          <!-- Handle different input types -->
          <template v-if="field.inputType === inputTypes.textfield">
            <v-text-field
              :key="field.name"
              :ref="field.name"
              v-model="formData[field.name]"
              :rules="field.rules || []"
              :label="field.label"
              :title="field.title || field.label"
              :required="field.valid.required"
              :counter="field.valid && field.valid.max"
            />
          </template>
          <template v-else-if="field.inputType === inputTypes.textarea">
            <v-textarea
              :key="field.name"
              :ref="field.name"
              v-model="formData[field.name]"
              :rules="field.rules || []"
              :label="field.label"
              :title="field.title || field.label"
              :required="field.valid && field.valid.required"
              :counter="field.valid && field.valid.max"
              @keydown.enter.prevent=""
            />
          </template>
        </template>
      </v-form>
    </v-card-text>

    <!-- *** BUTTONS: cancel and submit -->
    <v-card-actions>
      <!-- Align btns right -->
      <v-spacer />

      <!-- * Submit button -->
      <v-btn
        :disabled="!isFormValid || isLoading"
        :loading="isLoading"
        color="accent"
        @click="onSubmitForm"
        :title="$text.Create"
        v-text="submitBtnText"
      />
    </v-card-actions>
  </v-card>
</template>
