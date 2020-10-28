<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component, Prop } from 'vue-property-decorator'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import FormFields from '@/stx/stxForms'
import DocumentTypeForm from '@/components/DocumentTypeForm.vue'
import { DocumentTypesS } from '../types'

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

@Component({ components: { ConfirmationDialog, DocumentTypeForm } })
export default class TheSpaceDocumentTypes extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @A(...DocumentTypesS.create) documentTypeCreate: DocumentTypes.CreateA
  @A(...DocumentTypesS.delete) documentTypeDelete: DocumentTypes.DeleteA
  @G(...DocumentTypesS.records) documentTypes: DocumentTypes.Record[]

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop() space: Spaces.Record // * Always non-null

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isLoading = false

  isConfirmDelete = false
  formFields: Types.FormField[] = FormFields.documentType()
  selectedType: DocumentTypes.Record

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  // * User clicked submit button, update Document types - dispatch to store
  onSubmitForm(formData: Types.FormData) {
    console.log('submitting document type form > :', formData)

    // * Create Document Category - dispatch to store
    this.isLoading = true

    const payload = {
      spaceId: this.space.id,
      ...formData
    }
    console.log(' > payload:', payload)

    this.isLoading = false

    this.documentTypeCreate(payload)
      .then(() => {
        this.isLoading = false
        this.$showSnack(this.$msg.DocumentTypeCreatedSuccess)
      })
      .catch(() => {
        this.isLoading = false
      })
  }

  onConfirmDelete(type: DocumentTypes.Record) {
    this.selectedType = type
    this.isConfirmDelete = true
  }

  onDelete() {
    this.isLoading = true
    this.documentTypeDelete(this.selectedType)
      .then(() => {
        this.isLoading = false
        this.isConfirmDelete = false
        this.$showSnack(this.$msg.DocumentTypeDeletedSuccess)
      })
      .catch(() => {
        this.isLoading = false
      })
  }
}
</script>

<template>
  <div v-if="space">
    <!-- *** Document Type Form -->
    <DocumentTypeForm
      :formFields="formFields"
      @onSubmit="onSubmitForm"
      @onConfirm="onConfirmDelete"
      :submitBtnText="$text.Create"
      :types="documentTypes"
      class="elevation-0"
    />

    <ConfirmationDialog
      v-if="isConfirmDelete"
      v-model="isConfirmDelete"
      :title="$text.DocumentTypeDeleteTitle"
      :body="$text.DocumentTypeDeleteBody"
      :isLoading="isLoading"
      :submitButtonText="$text.Delete"
      :action="onDelete"
    />
  </div>
</template>
