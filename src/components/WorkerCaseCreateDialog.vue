<script lang="ts">
import _ from 'lodash'
import { Action as A, Getter as G } from 'vuex-class'
import { Component, Prop, Mixins } from 'vue-property-decorator'
import FormDialog from '@/components/FormDialog.vue'
import Dialog from '@/mixins/Dialog.ts'
import FormFields, { FormInputTypes } from '@/stx/stxForms'
import { AuthS, CasesS } from '@/types'
import { Routes } from '@/router'
import { CaseIssueType } from '../types/casesD'

type FormData = { [key in string]: string | number | File | null }

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({ mixins: [Dialog], components: { FormDialog } })
export default class WorkerCaseCreateDialog extends Mixins(Dialog) {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @A(...CasesS.create) vuexCreate: Cases.CreateA
  @G(...CasesS.getCaseTypes) caseTypes: Cases.CaseType[]
  @G(...AuthS.getUser) getUser: Auth.User
  @A(...CasesS.selectedSet) selectedSet: Cases.SelectedSetA
  @A(...CasesS.fileUploads) vuexFileUploads: Cases.FileUploadsA

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop() isLoading: boolean // * Spinner

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  formFields: Types.FormField[] = FormFields.workerCase()
  uploadForm = new FormData()
  isFormValid = false // * Synced to form validation
  formData: FormData = {}

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get inputTypes() {
    return FormInputTypes
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  // *** After rendered, focus on first input element
  mounted() {
    const caseType = this.formFields.find((f) => f.name === 'caseType')
    if (caseType) {
      const caseTypeSelectOptions = this.caseTypes.map((c) => ({
        value: c.value,
        text: c.value
      }))
      caseType.inputOptions = caseTypeSelectOptions || [{ value: '', text: '' }]
      caseType.value = (caseType.inputOptions[0] as {
        value: string
        text: string
      }).value
    }

    this.formFields.forEach((field) => {
      this.formData[field.name] = field.value
    })

    this.formData = _.cloneDeep(this.formData) //* Reactivity caveat
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  onSuccess(record: Cases.Record) {
    // * If case has been created - go to cases page
    if (record && record.id) {
      const caseId = record.id
      const path = {
        name: Routes.case.children.caseFeed.name,
        params: { caseId }
      }
      this.$router.push(path)
    }

    this.isOpen = false
  }

  createGrievanceCase(payload: any) {
    let newCase: Cases.Record

    return this.vuexCreate({
      caseType: payload.caseType,
      description: payload.description,
      resolutionPlan: '',
      relatedTo: this.getUser.id,
      issueType: CaseIssueType.Grievance,
      status: 'new'
    })
      .then((caseResp: Cases.Record) => {
        newCase = caseResp
        // upload new files
        this.selectedSet(caseResp)
        return payload.file
          ? this.vuexFileUploads({ ...payload, id: caseResp.id })
          : Promise.resolve([])
      })
      .then(() => newCase)
  }
}
</script>

<template>
  <FormDialog
    v-if="isOpen"
    v-model="isOpen"
    :formFields="formFields"
    :titleNew="$text.NewCase"
    :onCreate="createGrievanceCase"
    :persistent="true"
    :confirmCancel="true"
    @onSuccess="onSuccess"
  />
</template>
