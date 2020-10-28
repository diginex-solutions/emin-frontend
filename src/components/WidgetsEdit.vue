<script lang="ts">
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { DocsS, AuthS, TemplatesS, WidgetsS } from '@/types/'
import { materialIcons } from '@/utils/material-icons-list'

import _ from 'lodash'
import { validator } from '@/utils/validator'
import DatePicker from '@/components/DatePicker.vue'
import Dialog from '@/mixins/Dialog'
import { finderById } from '../utils/helpers'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

type Rule = (v: string) => string | true // vaidation rule type
interface Rules {
  [key: string]: Rule[]
}

interface Form extends Element {
  resetValidation: () => null
  validate: () => null
}

type Record = Widgets.Record

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

const FORM_EMPTY: Record = {
  id: '-1',
  name: '',
  icon: 'show_chart',
  templateId: '',
  fieldId: '',
  type: 'bar',
  allowDuplicates: false,
  data: {},

  groups: [],
  isYearsFromNow: false,
  isPercentage: false
}

@Component({
  components: { DatePicker },
  mixins: [Dialog]
})
export default class WidgetsEdit extends Mixins(Dialog) {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(...DocsS.records) documents: Docs.Record[]
  @G(...TemplatesS.records) templates: Templates.Record[]
  @A(...WidgetsS.create) vuexCreate: Widgets.CreateA
  @A(...WidgetsS.update) vuexUpdate: Widgets.UpdateA
  @G(...AuthS.getLang) getLang: Auth.Language

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop() edit: Record

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  isLoading = false // * Show loader icon if true
  formData: Record = { ...FORM_EMPTY } // * Form fields
  isFormValid = false // * v-model on form

  // * Set of rules for validating record fields
  rules: Rules = {
    text: [
      (v: string) => validator.required(v),
      (v: string) => validator.lessOrEqual(v, this.valid.text.max),
      (v: string) => validator.moreOrEqual(v, this.valid.text.min)
    ],
    required: [(v: string) => validator.required(v)],
    // required only if chart type is not count
    fieldId: [
      (v: string) => this.formData.type === 'count' || validator.required(v)
    ]
  }

  valid = {
    text: { min: 3, max: 50 },
    label: { min: 2, max: 100 }
  }

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
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

  get templateFields() {
    const findById = (a: { id: string }) => a.id === this.formData.templateId
    const template = this.templates.find(findById)
    return (template && template.inputs) || []
  }

  get selectedField() {
    const findTemplate = ({ id }: { id: string }) =>
      id === this.formData.fieldId
    return this.templateFields.find(findTemplate)
  }

  get isGroupable() {
    return (
      this.selectedField &&
      (this.selectedField.type === 'date' ||
        this.selectedField.type === 'number')
    )
  }

  get listIcons() {
    return materialIcons
  }

  get isTypeCount() {
    return this.formData.type === 'count'
  }

  // * === === === === === === === === === ===
  // * Watchers 👀 👀 👀 👀 👀 👀 👀 👀 👀 👀

  @Watch('isGroupable')
  // If type of the input has changed - add 1 mandatory group
  onFieldTypeChange(isGroupable: boolean) {
    // no need to reset if editing, and the field is groupable
    if (this.edit && isGroupable) {
      return
    }

    this.formData.groups = []

    if (isGroupable) {
      this.addGroup()
    }
  }

  // If type of the group values changed - reset
  @Watch('formData.isYearsFromNow')
  onGroupTypeChange(isYearsFromNow: boolean) {
    // if editing and type is the same - clone values from original edited file
    if (this.edit && this.edit.isYearsFromNow === isYearsFromNow) {
      this.formData.groups = _.cloneDeep(this.edit.groups)
      return
    }

    this.formData.groups = []
    const resetVal = isYearsFromNow ? 0 : ''
    this.addGroup(resetVal, resetVal)
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  mounted() {
    // if `edit` is supplied, means editing existing template, clone it into local form
    if (this.edit) {
      this.formData = _.cloneDeep(this.edit)
    }
  }

  destroyed() {
    this.$emit('update:edit', null) // Clear it at parent (needed for new/edit handling)
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  // Get label for the input with given id
  getInputLanguage(id: string) {
    // Fetch template that user has selected
    const findById = finderById(this.formData.templateId)
    const template = this.templates.find(findById)

    if (!template) {
      return
    }

    // Get from formdata inputs languages by currently set system language
    const currentLang = template.languages.find(
      (l: Templates.TemplateLanguages) => l.lang === this.getLang
    )
    if (!currentLang || !currentLang.inputs) {
      return
    }

    // Get the input from languages by id
    const lang = currentLang.inputs.find(
      (i: Templates.InputLanguage) => i.id === id
    )
    return lang?.label
  }

  // onSubmitForm: validate form and either update or create record
  onSubmitForm() {
    // cancel form submit if already submitted or form is invalid
    if (this.isLoading || !this.form.validate() || !this.isFormValid) {
      return false
    }

    // enable loading spinner
    this.isLoading = true

    let action: Widgets.CreateA | Widgets.UpdateA = this.vuexCreate
    let successMsg = this.$msg.widgetNewSuccess
    if (this.edit) {
      action = this.vuexUpdate
      successMsg = this.$msg.widgetUpdateSuccess
    }

    action(this.formData)
      .then((widget: Widgets.Record) => {
        this.isOpen = false
        this.$showSnack(successMsg)
        this.$emit('onResult', widget)
      })
      .catch(() => {
        this.isLoading = false
      })
  }

  isFieldDisallowed(i: Templates.Input) {
    const allowedTypes = [
      'number',
      'checkbox',
      'country',
      'select',
      'multiselect',
      'date'
    ]

    return !allowedTypes.includes(i.type)
  }

  addGroup(min: string | number = '', max: string | number = '') {
    this.formData.groups.push({ min, max })
  }

  deleteGroup(index: number) {
    if (!this.formData.groups || this.formData.groups.length <= 1) {
      return
    }

    this.formData.groups.splice(index, 1)
    this.formData.groups = [...this.formData.groups]
    this.formData = { ...this.formData }
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
    <v-card class="widgets-edit">
      <v-card-title>
        <span class="sharing__header">
          <span class="file-icon">
            <v-icon size="40" color="grey darken-1">insert_drive_file</v-icon>
          </span>
          <div class="sharing__header__title">
            <span v-if="isEdit">{{ $text.Editing }} "{{ edit.name }}"</span>
            <span v-else>{{ $text.NewWidget }}</span>
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
          <h3 class="mt-3">{{ $text.WidgetSettings }}</h3>

          <v-row>
            <v-col>
              <v-text-field
                v-model="formData.name"
                color="accent"
                :rules="rules.text"
                :counter="valid.text.max"
                :label="$text.Name"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select
                v-model="formData.icon"
                :prepend-icon="formData.icon"
                :items="listIcons"
                color="accent"
                :label="$text.WidgetSelectIcon"
                dense
              >
                <template v-slot:item="data">
                  <v-list-item-avatar>
                    <v-avatar>
                      <v-icon>{{ data.item }}</v-icon>
                    </v-avatar>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{ data.item }}</v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select
                v-model="formData.type"
                :items="['bar', 'doughnut', 'pie', 'count']"
                item-text="name"
                item-value="id"
                color="accent"
                :label="$text.WidgetSelectChart"
                dense
              />
            </v-col>
          </v-row>
          <div v-if="isTypeCount">
            {{ $text.WidgetTypeCountNotice }}
            <br />
            <br />
          </div>
          <v-row v-if="!isTypeCount" dense>
            <v-col>
              <v-checkbox
                :label="$text.ShowAsPercentage"
                v-model="formData.isPercentage"
              />
            </v-col>
          </v-row>
          <v-row v-if="templates">
            <v-col>
              <v-select
                v-model="formData.templateId"
                :items="templates"
                item-text="name"
                item-value="id"
                color="accent"
                :label="$text.WidgetSelectTemplate"
                :rules="rules.required"
                dense
              />
            </v-col>
          </v-row>
          <v-row v-if="!isTypeCount && formData.templateId">
            <v-col>
              <v-select
                v-model="formData.fieldId"
                :items="templateFields"
                :item-text="(i) => `${getInputLanguage(i.id)} (${i.type})`"
                item-value="id"
                :item-disabled="isFieldDisallowed"
                :rules="rules.fieldId"
                color="accent"
                :label="$text.WidgetSelectTemplateField"
                dense
              />

              <!-- Groups -->
              <div v-if="isGroupable">
                <v-btn
                  @click="addGroup"
                  text
                  color="accent"
                  class="add-btn pl-1 pr-1"
                >
                  <v-icon>add</v-icon>
                  {{ $text.AddGroup }}
                </v-btn>
                <!-- Show dates -->
                <div
                  v-if="
                    selectedField.type === 'date' && !formData.isYearsFromNow
                  "
                >
                  <v-row v-for="(input, index) in formData.groups" :key="index">
                    <v-col cols="12" sm="6">
                      <DatePicker
                        :value.sync="formData.groups[index].min"
                        :label="$text.DateMin"
                      />
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                      style="display: flex; align-items: center;"
                    >
                      <DatePicker
                        :value.sync="formData.groups[index].max"
                        :label="$text.MaxDate"
                      />
                      <v-btn
                        v-if="formData.groups.length > 1"
                        @click="deleteGroup(index)"
                        icon
                      >
                        <v-icon>close</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </div>
                <!-- Show year numbers -->
                <div v-else>
                  <v-row v-for="(input, index) in formData.groups" :key="index">
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="formData.groups[index].min"
                        type="number"
                        color="accent"
                        :label="`Group ${index + 1} - from`"
                        required
                      />
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                      style="display: flex; align-items: center;"
                    >
                      <v-text-field
                        v-model="formData.groups[index].max"
                        type="number"
                        color="accent"
                        :label="`Group ${index + 1} - to`"
                        required
                      />
                      <v-btn
                        v-if="formData.groups.length > 1"
                        @click="deleteGroup(index)"
                        icon
                      >
                        <v-icon>close</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </div>
                <v-row v-if="selectedField.type === 'date'">
                  <v-col>
                    <v-checkbox
                      label="Show in years from now"
                      v-model="formData.isYearsFromNow"
                    />
                  </v-col>
                </v-row>
                <v-divider />
              </div>
            </v-col>
          </v-row>
        </v-form>
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
        >
          {{ $text.Save }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss">
$colorAccent: #cc2531;

.widgets-edit {
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

  #dialog-form {
    padding: 1rem 0rem 0;
  }

  .header-separator {
    padding: 0 1.3rem;

    div {
      border-bottom: 2px solid #dddddd;
    }
  }
}
</style>
