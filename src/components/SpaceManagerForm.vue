<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import ContactsSelect from '@/components/ContactsSelect.vue'
import { FormInputTypes } from '../stx/stxForms'
import { validator } from '@/utils/validator'

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
  closeList(): () => void
}

export type FormData = any
type Record = Spaces.SpaceManager

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({ components: { ContactsSelect } })
export default class SpaceManagerForm extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop() isLoading: boolean // * Spinner
  @Prop() managers: Record[] // Space Manager
  @Prop() users: Record[] // Space's user directory

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  isMounted = false
  formData: FormData = {}
  isFormValid = false // * Synced to form validation
  rules = [(v: any[]) => validator.required(v && v.length > 0)]

  // * === === === === === === === === === ===
  // * Computed 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏

  get inputTypes() {
    return FormInputTypes
  }

  get allowedContacts() {
    const users = this.users || []
    const managers = this.managers || []

    return users.filter((u) => managers.findIndex((m) => m.id === u.id) < 0)
  }

  get noDataText() {
    return this.$text.ContactsNotFound
  }

  get form(): Form | null {
    return this.isMounted ? (this.$refs.form as Form) : null
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  // *** After rendered, focus on first input element
  mounted() {
    this.isMounted = true
    this.formData.managers = []
    this.form?.resetValidation()
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  // * User clicked submit button
  onSubmitForm() {
    // *** Cancel form submit if loading, or disabled, or form validation fail
    if (this.isLoading || !this.isFormValid) {
      return false
    }

    const input = this.$refs.managers as VueRef
    if (input && input.closeList) {
      input.closeList()
    }

    this.$emit('onSubmit', this.formData)
    this.formData = {}
    this.formData.managers = []
    this.form?.resetValidation()
  }

  formatFullname(manager: Record) {
    return manager ? `${manager.name} ${manager.surname}` : ''
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
        <v-subheader v-text="$text.Manager"></v-subheader>
        <v-list-item v-for="manager in managers" :key="manager.id">
          <v-list-item-icon>
            <v-icon
              v-text="'mdi-delete'"
              @click.prevent="$emit('onConfirm', manager)"
            ></v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title
              v-text="formatFullname(manager)"
            ></v-list-item-title>
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
        <ContactsSelect
          key="managers"
          ref="managers"
          :selected.sync="formData['managers']"
          :contacts="allowedContacts"
          :rule="rules"
          :noDataText="noDataText"
          :allowInviteUser="false"
          :label="$text.Manager"
        />
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
        :title="$text.Add"
        v-text="$text.Add"
      />
    </v-card-actions>
  </v-card>
</template>
