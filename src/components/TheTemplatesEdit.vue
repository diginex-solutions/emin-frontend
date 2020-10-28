<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { DocsS, AuthS, TemplatesS } from '@/types/'
import Stx from '@/types/stx.ts'
import _ from 'lodash'
import { validator } from '@/utils/validator'
import uuid from 'uuid'
import TemplateInputEdit from '@/components/TemplateInputEdit.vue'
import LangSelector from './LangSelector.vue'
import { translateForm, finderById } from '../utils/helpers'
import { InputTypes } from '@/store/formsStore'

type Rule = (v: string) => string | true // vaidation rule type
interface Rules {
  [key: string]: Rule[]
}

interface Form extends Element {
  resetValidation: () => null
  validate: () => null
}

type Record = Templates.Record

const getDefaultLanguages = (): Templates.TemplateLanguages[] => {
  return [
    { lang: 'en', inputs: [] },
    { lang: 'hi', inputs: [] },
    { lang: 'ur', inputs: [] },
    { lang: 'bn', inputs: [] }
  ]
}

const FORM_EMPTY: Record = {
  id: '-1',
  name: '',
  inputs: [],
  languages: getDefaultLanguages()
}

@Component({
  components: { TemplateInputEdit, LangSelector }
})
export default class TheTemplatesEdit extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...AuthS.getLang) getLang: Auth.Language
  @G(...DocsS.records) docs: Docs.Record[]
  @A(...TemplatesS.create) vuexCreate: Templates.CreateA
  @A(...TemplatesS.update) vuexUpdate: Templates.UpdateA

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  // *** Required
  @Prop(Boolean) value: boolean // * v-model at parent level
  @Prop() edit: Record

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  // isLoading: show loader icon if true
  isLoading = false

  // Form fields
  formData: Record = { ...FORM_EMPTY }

  // rules: set of rules for validating record fields
  rules: Rules = {
    text: [
      (v: string) => validator.required(v),
      (v: string) => validator.lessOrEqual(v, this.valid.text.max),
      (v: string) => validator.moreOrEqual(v, this.valid.text.min)
    ]
  }

  isFormValid = false
  valid = {
    text: { min: 3, max: 50 },
    label: { min: 2, max: 100 }
  }

  dialogs: {
    isInputEdit: boolean
    edit: null | Templates.Input
  } = {
    isInputEdit: false,
    edit: null
  }

  selectedLang: Auth.Lang = Stx.lang.default
  isActive = false // * Needed to fix animation issues while toggles visibility of dialog

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  // * GetSet, Handling visibility of the dialog
  get isOpen() {
    return this.value && this.isActive
  }

  // * GetSet, delay-close dialog at parent level, to display closing animation
  set isOpen(value: boolean) {
    this.isActive = value

    setTimeout(() => {
      this.$emit('input', value)
    }, 300)
  }

  get form(): Form {
    return this.$refs.form as Form
  }

  get getStatuses() {
    return {
      pending: 'pending',
      accepted: 'accepted',
      rejected: 'rejected'
    }
  }

  get isEdit() {
    return !!this.edit
  }

  // Returns true if creating record, OR if edited record doesn't have actions
  get isEditAllowed() {
    if (!this.isEdit) {
      return true
    }
    const findActionByTemplate = (a: Forms.Record) =>
      a.isInitiator && a.template && a.template.id === this.edit.id
    const filterByTemplate = (d: Docs.Record) =>
      d.actions && d.actions.find(findActionByTemplate)

    const templateDocs = this.docs.filter(filterByTemplate)
    return templateDocs.length === 0
  }

  get hasInputs() {
    return this.formData.inputs.length > 0
    // TODO: low priority, ux: if editing - validate that update name is not the same as old name
    // const name = this.formData.name
    // const isNameValid = !this.isEdit || name !== this.edit.name
    // return this.formData.inputs.length > 0 && isNameValid
  }

  get translatedForm() {
    return translateForm(this.formData, this.selectedLang)
  }

  get getInputText() {
    return {
      [InputTypes.text]: this.$text.Text,
      [InputTypes.number]: this.$text.Number,
      [InputTypes.checkbox]: this.$text.Checkbox,
      [InputTypes.select]: this.$text.Select,
      [InputTypes.multiselect]: this.$text.Multiselect,
      [InputTypes.country]: this.$text.Country,
      [InputTypes.date]: this.$text.Date,
      [InputTypes.time]: this.$text.Time
    }
  }

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  @Watch('isOpen')
  initDialog(isOpen: boolean) {
    // if closing - reset data and form
    if (!isOpen) {
      this.formData = { ...FORM_EMPTY }
      this.formData.inputs = []

      this.isLoading = false
      this.form.resetValidation()

      // clear selected record for parent (edited record)
      this.$emit('update:edit', null)

      return
    }

    // if `edit` is supplied, means editing existing template
    // clone it into local form
    if (this.edit) {
      this.formData = _.cloneDeep(this.edit)
    }

    this.selectedLang = this.getLang
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  mounted() {
    this.isActive = true
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  setInputLanguage(
    id: string,
    label: string,
    options?: Templates.FieldLanguage[]
  ) {
    // Get the input from languages by id
    const input = this.getInputLanguage(id, this.selectedLang)

    if (!input) {
      return
    }

    input.label = label // Update input label

    if (options) {
      input.options = options

      // Synchronise options for other languages
      this.formData.languages.forEach((l: Templates.TemplateLanguages) => {
        if (l.lang === this.selectedLang) {
          return
        }

        // * Get interested input for the language
        const langInput = this.getInputLanguage(id, l.lang)
        if (!langInput) {
          return
        }

        // * Clone new options, if old label present - use it
        const oldOptions = langInput.options
        const newOptions = _.cloneDeep(options)
        newOptions.forEach((o: Templates.Option) => {
          const findById = finderById(o.id)
          const oldLabel = oldOptions && oldOptions.find(findById)

          if (oldLabel) {
            o.label = oldLabel.label
          }
        })

        // * Update language options
        langInput.options = newOptions
      })
    }
  }

  getInputLanguage(id: string, lang: Auth.Lang) {
    // Get from formdata inputs languages by currently set system language
    const currentLang = this.formData.languages.find(
      (l: Templates.TemplateLanguages) => l.lang === lang
    )
    if (!currentLang || !currentLang.inputs) {
      return
    }

    // Get the input from languages by id
    return currentLang.inputs.find((i: Templates.InputLanguage) => i.id === id)
  }

  // Get from formdata inputs languages by currently set system language
  addInputLanguage(
    id: string,
    label: string,
    options?: Templates.FieldLanguage[]
  ) {
    this.formData.languages.forEach((l: Templates.TemplateLanguages) => {
      const inputLanguage: Templates.InputLanguage = { id, label }

      if (options) {
        inputLanguage.options = [...options]
      }
      l.inputs.push(inputLanguage)
    })
  }

  // * Delete input langauges
  deleteInputLanguage(id: string) {
    this.formData.languages.forEach((l: Templates.TemplateLanguages) => {
      const findById = finderById(id)
      const index = l.inputs.findIndex(findById)
      if (index > -1) {
        l.inputs.splice(index, 1)
      }
    })
  }

  // * Validate form and either update or create record
  onSubmitForm() {
    // cancel form submit if already submitted or form is invalid
    const isValid =
      !this.isLoading &&
      this.form.validate() &&
      this.isFormValid &&
      this.hasInputs

    if (!isValid) {
      return false
    }

    // enable loading spinner
    this.isLoading = true

    let action = this.vuexCreate
    let successMsg = this.$msg.templateNewSuccess
    if (this.edit) {
      action = this.vuexUpdate
      successMsg = this.$msg.templateUpdateSuccess
    }

    action(this.formData)
      .then((template: Templates.Record) => {
        this.isOpen = false
        this.$showSnack(successMsg)
        this.$emit('onSuccess', template)
      })
      .catch(() => {
        this.isLoading = false
      })
  }

  questionEditResult(inputRaw: Templates.InputTranslated) {
    const input = _.cloneDeep(inputRaw)
    const options = input.options ? input.options : undefined

    // If creating input - push to array, set language
    if (!this.dialogs.edit) {
      input.id = uuid.v4()
      this.formData.inputs.push(input)
      this.addInputLanguage(input.id || '', inputRaw.label || '', options)

      return
    }

    this.setInputLanguage(input.id || '', inputRaw.label || '', options)

    const findById = (d: Templates.Input) => d.id === input.id
    const index = this.formData.inputs.findIndex(findById)

    this.formData.inputs[index] = input
    this.formData = { ...this.formData }
  }

  deleteQuestion(id: string) {
    // *** Delete input
    const findById = finderById(id)
    const index = this.formData.inputs.findIndex(findById)

    if (index > -1) {
      this.formData.inputs.splice(index, 1)
    }

    // *** Delete languages for the input
    this.deleteInputLanguage(id)
  }

  editQuestion(input: Templates.Input) {
    this.dialogs.edit = input
    this.dialogs.isInputEdit = true
  }

  // Move question up, by default. Check is not necessary, UI takes care of that.
  moveQuestion(index: number, isUp: false) {
    const indexA = isUp ? index - 1 : index
    const indexB = isUp ? index : index + 1

    const temp = this.formData.inputs[indexA]
    this.formData.inputs[indexA] = this.formData.inputs[indexB]
    this.formData.inputs[indexB] = temp

    this.formData.inputs = [...this.formData.inputs]
  }

  // Language of the labels has been changed
  onLangSelected(lang: Auth.Lang) {
    this.selectedLang = lang
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    width="600px"
    @keydown.esc="isOpen = false"
    scrollable
    persistent
  >
    <v-card id="documents-share-dialog">
      <v-card-title>
        <span class="sharing__header">
          <span class="file-icon">
            <v-icon size="40" color="grey darken-1">insert_drive_file</v-icon>
          </span>
          <div class="sharing__header__title">
            <span v-if="isEdit">{{ $text.Editing }} "{{ edit.name }}"</span>
            <span v-else>{{ $text.TemplateNew }}</span>
          </div>
          <v-btn icon @click="isOpen = false">
            <v-icon size="30" color="grey lighten-1">close</v-icon>
          </v-btn>
        </span>
      </v-card-title>
      <div class="header-separator">
        <div />
      </div>
      <v-card-text>
        <v-form
          id="dialog-form"
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
                v-model="formData.name"
                color="accent"
                :rules="rules.text"
                :counter="valid.text.max"
                :label="$text.TemplateName"
                required
              />
            </v-col>
          </v-row>

          <v-divider />
          <br />

          <!-- If any inputs present - ability to add multi-lang labels -->
          <span v-if="formData.inputs.length > 0">
            <span class="mr-3">
              {{ $text.TemplateLanguageTitle }}
            </span>
            <LangSelector
              isText
              noStore
              :lang="selectedLang"
              @onLangSelected="onLangSelected"
            />
          </span>
          <v-list-item
            two-line
            v-for="(input, index) in translatedForm.inputs"
            :key="input.id"
          >
            <v-list-item-content>
              <v-list-item-title style="display: flex;">
                <span class="question-title">
                  {{ index + 1 + '. ' + input.label }}
                </span>
                <span v-if="isEditAllowed">
                  <v-icon
                    :disabled="!(formData.inputs.length > 1 && index > 0)"
                    @click="moveQuestion(index, true)"
                    color="grey lighten-1"
                    :title="$text.MoveQuestionUp"
                  >
                    mdi-chevron-up
                  </v-icon>
                  <v-icon
                    :disabled="
                      !(
                        formData.inputs.length > 1 &&
                        index < formData.inputs.length - 1
                      )
                    "
                    @click="moveQuestion(index)"
                    color="grey lighten-1"
                    :title="$text.MoveQuestionDown"
                  >
                    mdi-chevron-down
                  </v-icon>

                  <v-icon
                    class="ml-5"
                    color="grey lighten-1"
                    @click="editQuestion(input)"
                  >
                    edit
                  </v-icon>
                  <v-icon
                    color="grey lighten-1"
                    @click="deleteQuestion(input.id)"
                  >
                    close
                  </v-icon>
                </span>
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ getInputText[input.type] }}
                <span
                  v-if="input.type === 'select' || input.type === 'multiselect'"
                >
                  ( {{ input.options.map((o) => o.label).join(', ') }} )
                </span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-form>
        <v-btn
          v-if="isEditAllowed"
          @click="dialogs.isInputEdit = true"
          text
          color="accent"
          class="add-btn pl-1 pr-1"
        >
          <v-icon>add</v-icon>
          {{ $text.AddInput }}
        </v-btn>
        <TemplateInputEdit
          v-if="dialogs.isInputEdit"
          v-model="dialogs.isInputEdit"
          :edit.sync="dialogs.edit"
          @onResult="questionEditResult"
        />
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="isLoading" color="secondary" @click="isOpen = false">
          {{ $text.Cancel }}
        </v-btn>

        <v-btn
          :loading="isLoading"
          color="accent"
          @click="onSubmitForm"
          class="share-btn"
          :disabled="!hasInputs"
        >
          {{ $text.Save }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss">
$colorAccent: #cc2531;

#documents-share-dialog {
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

  .question-title {
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
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

  #dialog-form {
    padding: 1rem 0rem 0;
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
    }
  }

  // override vuetify style for focused button
  .add-btn:focus::before {
    opacity: 0 !important;
  }
}
</style>
