<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import Dialog from '@/mixins/Dialog.ts'
import FormParser from './FormParser.vue'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type Rule = (v: string) => string | true // * Validation rule
// * Vuetify form
interface VueForm extends Element {
  isFormValid: boolean
}
// * VueRef to input with `focus` method
interface VueRef extends Element {
  focus(): () => void
}

type Record = Types.RecordAny
type FormData = Types.FormDataAny

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

@Component({
  mixins: [Dialog],
  components: { FormParser, ConfirmationDialog }
})
export default class FormDialog extends Mixins(Dialog) {
  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop() edit: Record
  @Prop() formFields: Types.FormField[]

  // * Title props
  @Prop() icon: string
  @Prop() title: string
  @Prop() titleNew: string
  @Prop() titleEdit: string
  @Prop() persistent: boolean

  // * Event props
  @Prop() onCreate: (p: Record) => Promise<void>
  @Prop() onUpdate: (p: Record) => Promise<void>

  //* Confirming submit/cancel
  @Prop() confirmSubmit: boolean
  @Prop() confirmCancel: boolean

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isLoading = false
  isConfirmSubmitDialog = false
  isConfirmCancelDialog = false
  formData: FormData = null

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get isEdit() {
    return !!this.edit
  }

  get getTitle() {
    // * Exception - default title is set, return that
    if (this.title) return this.title

    if (this.isEdit) {
      return this.titleEdit ? this.titleEdit : `Editing '${this.edit.name}'`
    }
    return this.titleNew
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  onSubmit(formData: FormData) {
    this.formData = formData

    if (!this.confirmSubmit) return this.onSubmitForm()
    this.isConfirmSubmitDialog = true
  }

  onCancel() {
    const form = this.$refs.FormParser as VueForm

    if (!form.isFormValid || !this.confirmCancel) return this.onCancelForm()
    this.isConfirmCancelDialog = true
  }

  // * User clicked submit button
  onSubmitForm() {
    const formData = this.formData
    let action = this.onCreate
    let msg = this.$msg.RecordCreateSuccess

    const payload = { id: '', ...formData }

    // * If editing record - change dispatch type, snackmsg and edit payloadId
    if (this.isEdit) {
      action = this.onUpdate
      msg = this.$msg.RecordUpdateSuccess
      payload.id = this.edit?.id || ''
    }

    // * Enable loader, dispatch
    this.isLoading = true
    action(payload)
      .then((retCase) => {
        this.isLoading = false
        this.isOpen = false
        this.$showSnack(msg)
        this.$emit('onSuccess', retCase)
      })
      .catch(() => {
        this.isLoading = false
      })
  }

  onCancelForm() {
    this.isOpen = false
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    width="600px"
    @keydown.esc="onCancel"
    :persistent="persistent"
  >
    <FormParser
      ref="FormParser"
      :isLoading="isLoading"
      :formFields="formFields"
      :submitBtnText="!!edit ? $text.Save : $text.Create"
      @onSubmit="onSubmit"
      @onCancel="onCancel"
    >
      <!-- *** HEADER: title and close icon-btn -->
      <slot>
        <v-icon size="36" color="grey darken-1">
          <template v-if="isEdit">mdi-pencil</template>
          <template v-else>mdi-plus</template>
        </v-icon>

        <span class="ml-3">{{ getTitle }}</span>

        <v-spacer />
        <v-btn icon @click="onCancel">
          <v-icon color="grey lighten-1">close</v-icon>
        </v-btn>
      </slot>
    </FormParser>

    <!-- Confirm: submitting form -->
    <ConfirmationDialog
      v-if="isConfirmSubmitDialog"
      v-model="isConfirmSubmitDialog"
      :title="$text.FormDialogSubmitConfirm"
      :body="$text.FormDialogSubmitConfirmBody"
      :action="onSubmitForm"
    />

    <!-- Confirm: closing form -->
    <ConfirmationDialog
      v-if="isConfirmCancelDialog"
      v-model="isConfirmCancelDialog"
      :title="$text.FormDialogCloseConfirm"
      :body="$text.FormDialogCloseConfirmBody"
      :action="onCancelForm"
    />
  </v-dialog>
</template>
