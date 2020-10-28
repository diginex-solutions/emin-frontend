<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import _ from 'lodash'
import {
  translateForm,
  getInputsFull,
  finderById,
  getOptionLabel
} from '@/utils/helpers'
import { InputTypes, FormStatuses } from '@/store/formsStore'
import QuestionMultiselect from '@/components/QuestionMultiselect.vue'
import CaseCreateDialog from '@/components/CaseCreateDialog.vue'
import { SpacesS } from '../types'
import { Getter as G } from 'vuex-class'

interface User {
  email: string
  name: string
  surname: string
  actions: Forms.Record[]
}

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Types

type UserFormsMap = any
type Form = Forms.Record

interface Question {
  id: string
  label: string
}

// * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀

@Component({ components: { QuestionMultiselect, CaseCreateDialog } })
export default class TemplateResults extends Vue {
  @G(...SpacesS.getSelected) getSelected: Spaces.Record

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Array) actions: Forms.Record[]
  @Prop(Object) template: Templates.Record
  @Prop(String) lang: Auth.Lang

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  usersSelectedForms: UserFormsMap = []
  selectedQuestions: Question[] = []
  caseDialog = {
    isOpen: false,
    caseType: '',
    employee: ''
  }

  //*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

  get getTemplateUsers() {
    const template = this.template
    if (!template) {
      return []
    }

    return this.templateUsers(template)
  }

  get getTemplateHeaders() {
    const mapperTemplate = ({ id, label }: Question) => {
      return { text: label, value: id }
    }

    return this.selectedQuestions.map(mapperTemplate)
  }

  get headersUsers() {
    const userInfo = [
      {
        text: 'Recipient Name',
        align: 'left',
        value: 'name'
      },
      { text: 'Forms', value: 'forms' }
    ]

    return [...userInfo, ...this.getTemplateHeaders]
  }

  // All questions of selected template
  get getTemplateQuestions() {
    const template = this.template
    if (!template) {
      return []
    }

    // Translate the form first
    const translated = translateForm(template, this.lang)
    const inputs = (translated && translated.inputs) || []

    // Map to format of type `Question`
    return inputs.map((q) => {
      return { id: q.id || '', label: q.label || '' }
    })
  }

  get isSpaceCases() {
    return this.getSelected?.isCases
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  mounted() {
    this.resetSelection()
  }

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  @Watch('template')
  resetSelection() {
    // Reset user forms. By default, for each user select latest filled form
    this.usersSelectedForms = []
    this.getTemplateUsers.forEach(
      (u: { email: string; actions: Forms.Record[] }) => {
        const filterFilled = (a: Forms.Record) => !this.isFormEmpty(a)
        const actions = this.getFormsSorted(u.actions)
        // ! Coding style upgrade - new syntax has subject first
        const formsFilled = actions.filter(filterFilled)
        const form = formsFilled[0]

        this.usersSelectedForms[u.email] = form ? form.id : ''
      }
    )

    // Reset questions list. By default, select first template question
    this.selectedQuestions = []
    this.selectedQuestions[0] = this.getTemplateQuestions[0]
  }

  @Watch('actions')
  onActionsUpdated() {
    this.resetSelection()
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  getTemplateForms(template: Templates.Record) {
    const filterActionsByTemplate = (a: Forms.Record) => {
      const isEmpty = !template.id && !a.template
      return isEmpty || (a.template && a.template.id === template.id)
    }

    return this.actions.filter(filterActionsByTemplate)
  }

  // List users involved in template
  templateUsers(template: Templates.Record) {
    const templateForms = this.getTemplateForms(template)
    const actionUsers = templateForms.map((a: Forms.Record) => a.recipient)
    const users = _.uniqBy(actionUsers, 'email')

    // Attach actions, related to this user
    return users.map((u: { email: string }) => {
      const filterByEmail = (a: Forms.Record) => a.recipient.email === u.email
      return {
        ...u,
        actions: templateForms.filter(filterByEmail)
      }
    })
  }

  // Return all the templates involved in this document

  getFullName(user: User) {
    if (!user) {
      return ''
    }

    return user.name + ' ' + user.surname
  }

  isFormEmpty(form: Forms.Record) {
    const status = form && form.status
    const filled =
      status === FormStatuses.accepted || status === FormStatuses.rejected
    return !filled
  }

  // Forms - sort by latest first, and doc name
  getFormsSorted(forms: Forms.Record[]) {
    // Sort by latest first
    const sorterByDate = (a: Forms.Record) => a.dateCreated
    const actionsLatestFirst = _.orderBy(forms, sorterByDate, 'desc')

    //  Sort by document name
    const sorterByDoc = (a: Forms.Record) => (a.document ? a.document.name : '')
    return _.orderBy(actionsLatestFirst, sorterByDoc, 'asc')
  }

  getFormLabel(i: Form) {
    const docName = (i.document ? i.document.name : '') + ' ➡️ '
    const date = (this.$options.filters as any).formatDateSimple(i.dateCreated)
    const status = ` (${i.status})`
    return docName + date + status
  }

  getFormAnswer(formId: string, questionId: string) {
    // Fetch form
    const findById = finderById(formId)
    const form = this.actions.find(findById)
    if (!form) {
      return null
    }

    // Get filled form - `type` field
    const questions = getInputsFull(form, this.lang)
    const findAnswerById = (a: Forms.AnswerFull) => a.id === questionId
    const answer = questions && questions.find(findAnswerById)
    if (!answer) {
      return null
    }

    // Handle cases for selectors - pull option lable from translations
    if (answer.type === InputTypes.select) {
      return getOptionLabel(answer, answer.value as string)
    } else if (answer.type === InputTypes.multiselect) {
      let values = answer.value
      // work-around to cope with a string representing a non parsed array  "["some text"]"
      if (!Array.isArray(answer.value)) {
        values = JSON.parse(values as string)
      }
      return (values as string[])
        .map((v: string) => getOptionLabel(answer, v))
        .join(', ')
    }

    return answer.value
  }

  sortUsers(items: User[], index: string[], isDesc: boolean[]) {
    // Allowed fields
    const Fields = {
      name: 'name',
      forms: 'forms'
    }

    // Sorting rules
    const sorters: any = {
      [Fields.name]: (i: User) => i.name,
      [Fields.forms]: (i: User) => this.usersSelectedForms[i.email]
    }

    // * Sorting rules for question fields
    // Pull headers
    const headersForm = this.getTemplateHeaders.map(
      ({ value }: { value: string }) => value
    )

    headersForm.forEach((question: string) => {
      sorters[question] = (i: User) =>
        this.getFormAnswer(this.usersSelectedForms[i.email], question)
    })

    // Process vuetify inputs, set default field and order
    const field = index[0] ? index[0] : Fields.name
    const order = isDesc[0] ? 'desc' : 'asc'

    // Define primary and secondary sorting rules
    const primarySorter = sorters[field]
    const secondarySorter = sorters.name

    // Return sorted result
    return _.orderBy(items, [primarySorter, secondarySorter], order)
  }

  openCase(caseType: string, user: User) {
    this.caseDialog.isOpen = true
    this.caseDialog.caseType = caseType
    this.caseDialog.employee = this.getFullName(user) + ` (${user.email})`
  }
}

// * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀
</script>

<template>
  <div>
    <QuestionMultiselect
      v-if="template"
      :selected.sync="selectedQuestions"
      :items="getTemplateQuestions"
    />

    <!-- 🦅 Users list -->
    <v-data-table
      v-if="template"
      :headers="headersUsers"
      :items="getTemplateUsers"
      item-key="email"
      color="accent"
      :custom-sort="sortUsers"
    >
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ getFullName(item) }}</td>
          <td>
            <v-select
              v-model="usersSelectedForms[item.email]"
              item-value="id"
              :item-text="getFormLabel"
              single-line
              :items="getFormsSorted(item.actions)"
              :label="$text.FormView"
              dense
              color="accent"
              :item-disabled="isFormEmpty"
            />
          </td>
          <td v-for="header in getTemplateHeaders" :key="header.value">
            {{ getFormAnswer(usersSelectedForms[item.email], header.value) }}
            <!-- Button for opening new case -->
            <v-btn
              v-if="isSpaceCases"
              class="mr-5"
              color="accent"
              @click="openCase(header.text, item)"
              icon
            >
              <v-icon>mdi-clipboard-alert-outline</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>

    <CaseCreateDialog
      v-if="caseDialog.isOpen"
      v-model="caseDialog.isOpen"
      :caseType="caseDialog.caseType"
      :employee="caseDialog.employee"
    />
  </div>
</template>
