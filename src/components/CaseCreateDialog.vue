<script lang="ts">
import { Action as A, Getter as G } from 'vuex-class'
import { Component, Prop, Mixins } from 'vue-property-decorator'
import Dialog from '@/mixins/Dialog.ts'
import FormDialog from '@/components/FormDialog.vue'
import { Routes } from '@/router'
import FormFields from '@/stx/stxForms'
import { AuthS, SpacesS, CasesS } from '@/types'
import { ContactSource, StatusType, CaseIssueType } from '../types/casesD'

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

@Component({ mixins: [Dialog], components: { FormDialog } })
export default class CaseCreateDialog extends Mixins(Dialog) {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @A(...CasesS.create) vuexCreate: Cases.CreateA
  @A(...CasesS.update) vuexUpdate: Cases.updateA
  @G(...CasesS.getCaseTypes) caseTypes: Cases.CaseType[]
  @A(...CasesS.selectedSet) selectedSet: Cases.SelectedSetA
  @A(...CasesS.fileUploads) vuexFileUploads: Cases.FileUploadsA
  @A(...CasesS.removeAssigned) vuexRemoveAssigned: Cases.DeleteA
  @G(...AuthS.getUser) getUser: Auth.User
  @G(...SpacesS.isUserDirectory) isUserDirectory: boolean

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(String) caseType: string | undefined // * Initial string value for case type
  @Prop(String) employee: string | undefined // * Initial string value for case type
  @Prop() edit: Cases.Record

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  formFields: Types.FormField[] = []

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  // *** After rendered, focus on first input element
  mounted() {
    this.formFields = this.edit ? FormFields.editCase() : FormFields.case()
    const findFieldCaseType = this.findByFieldName('caseType')
    const caseType = this.formFields.find(findFieldCaseType)
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

    const findFieldRelatedTo = this.findByFieldName('relatedTo')
    const fldRelatedTo = this.formFields.find(findFieldRelatedTo)
    if (fldRelatedTo) {
      fldRelatedTo.contactType = this.isUserDirectory
        ? ContactSource.userDirectory
        : ContactSource.connection
    }

    // if `edit` is supplied, means editing existing recored
    // clone it into local form
    if (!this.edit) {
      const findCaseType = ({ name }: Types.FormField) => name === 'caseType'
      const caseTypeField = this.formFields.find(findCaseType)
      if (caseTypeField) {
        if (this.caseType) {
          caseTypeField.value = this.caseType
        }
      }
    } else {
      // copy existing case to form fields
      this.formFields.forEach((field) => {
        switch (field.name) {
          case 'assignedTo':
            field.value = this.edit.assignedTo
            break
          case 'resolutionPlan':
            field.value = this.edit.resolutionPlan
            break
          default:
            break
        }
      })
    }
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  onSuccess(record: Cases.Record) {
    // * If case has been created - go to case
    if (!this.edit) {
      // Redirecting to the case
      if (record && record.id) {
        const caseId = record.id
        const path = {
          name: Routes.case.children.caseFeed.name,
          params: { caseId }
        }
        this.$router.push(path)
      }
    }

    this.isOpen = false
  }

  findByFieldName(name: string) {
    return (f: Types.FormField) => f.name === name
  }

  updateCase(formData: any) {
    const { resolutionPlan = '', assignedTo: objAssignedTo } = formData || {}
    const assignedTo = (objAssignedTo && objAssignedTo.id) || ''
    const { id } = this.edit || {}
    const status: StatusType = objAssignedTo ? 'inProgress' : 'new'

    return this.vuexUpdate({
      id,
      assignedTo,
      resolutionPlan,
      status
    }).then((ret: Cases.Record) => {
      const assignedToId = ret && ret.assignedTo && ret.assignedTo.id
      const ownerId = ret && ret.owner && ret.owner.id
      const currentUserId = this.getUser.id
      if (
        assignedToId &&
        currentUserId !== ownerId &&
        assignedToId !== currentUserId
      ) {
        return this.vuexRemoveAssigned(ret).then(() => {
          const path = {
            name: Routes.cases.name
          }
          this.$router.push(path)
        })
      }
      return Promise.resolve()
    })
  }

  createCase(formData: any) {
    const relatedTo =
      (formData && formData.relatedTo && formData.relatedTo.id) || ''
    let newCase: Cases.Record

    return this.vuexCreate({
      caseType: formData.caseType,
      description: formData.description,
      resolutionPlan: formData.resolutionPlan,
      relatedTo,
      issueType: CaseIssueType.Others,
      status: 'new'
    })
      .then((caseResp: Cases.Record) => {
        newCase = caseResp
        // upload new files
        this.selectedSet(caseResp)
        return formData.file
          ? this.vuexFileUploads({ ...formData, id: caseResp.id })
          : Promise.resolve([])
      })
      .then(() => newCase)
      .catch(console.error)
  }
}
</script>

<template>
  <FormDialog
    v-if="isOpen"
    v-model="isOpen"
    :formFields="formFields"
    :titleNew="$text.NewCase"
    :titleEdit="$text.EditCase"
    :onCreate="createCase"
    :onUpdate="updateCase"
    @onSuccess="onSuccess"
    :edit="edit"
    :confirmSubmit="false"
    :confirmCancel="false"
    :persistent="true"
  />
</template>
