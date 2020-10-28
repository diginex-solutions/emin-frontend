<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import _ from 'lodash'
import { validator } from '@/utils/validator'
import { InputTypes } from '@/store/formsStore'
import uuid from 'uuid'

type Rule = (v: string) => string | true // vaidation rule type
interface Rules {
  [key: string]: Rule[]
}

interface Form extends Element {
  resetValidation: () => null
  validate: () => null
}

const FORM_EMPTY: Templates.Input = {
  id: '-1',
  type: InputTypes.text
}

@Component({})
export default class TemplateInputEdit extends Vue {
  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  // Form fields
  formData: Templates.Input = { ...FORM_EMPTY }

  // rules: set of rules for validating record fields
  rules: Rules = {
    label: [
      (v: string) => validator.required(v),
      (v: string) => validator.lessOrEqual(v, this.valid.label.max),
      (v: string) => validator.moreOrEqual(v, this.valid.label.min)
    ],
    template: [(v: string) => validator.required(v)]
  }

  isFormValid = false
  valid = {
    label: { min: 2, max: 100 }
  }
  label = ''
  isActive = false // * Needed to fix animation issues while toggles visibility of dialog

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  // drawer: synced prop, responsible for visibility of the side drawer
  @Prop(Boolean) value: boolean
  @Prop() edit: Templates.Input

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  // * GetSet, Handling visibility of the dialog
  get isOpen() {
    return this.value && this.isActive
  }

  // * GetSet, delay-close dialog at parent level, to display closing animation
  set isOpen(value: boolean) {
    this.isActive = value

    setTimeout(() => {
      this.$emit('update:edit', null)
      this.$emit('input', value)
    }, 300)
  }

  get form(): Form {
    return this.$refs.form as Form
  }

  get isEdit() {
    return !!this.edit
  }

  get getInputTypes() {
    const makeOption = (value: string, translationName: string) => {
      const text = this.$i18n.tc(translationName)
      return { value, text }
    }

    // TODO: i18n
    return [
      makeOption('text', 'Text'),
      makeOption('number', 'Number'),
      makeOption('checkbox', 'Checkbox'),
      makeOption('select', 'Select'),
      makeOption('multiselect', 'Multiselect'),
      makeOption('date', 'Date'),
      makeOption('time', 'Time'),
      makeOption('country', 'Country')
    ]
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  mounted() {
    this.isActive = true
    // if editing - clone supplied object
    if (this.edit) {
      this.formData = _.cloneDeep(this.edit)
    }
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  // onSubmitForm: validate form and either update or create record
  onSubmitForm() {
    // cancel form submit if already submitted or form is invalid
    if (!this.form.validate() || !this.isFormValid) {
      return false
    }

    this.$emit('onResult', this.formData)

    this.isOpen = false
  }

  addOption() {
    this.formData.options = this.formData.options || []
    this.formData.options.push({
      id: uuid.v4(),
      label: ''
    })
    this.formData = { ...this.formData }
  }

  deleteOption(index: number) {
    if (!this.formData.options || this.formData.options.length <= 2) {
      return
    }
    this.formData.options.splice(index, 1)
    this.formData = { ...this.formData }
  }

  // If type of the input has changed - add 2 mandatory options
  onTypeChange(value: string) {
    if (value === 'select' || value === 'multiselect') {
      this.formData.options = []
      this.addOption()
      this.addOption()
    } else {
      this.formData.options = []
    }
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
            <span v-if="isEdit">{{ $text.EditQuestion }}</span>
            <span v-else>{{ $text.TemplateCreateNew }}</span>
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
          id="share-dialog-form"
          ref="form"
          v-model="isFormValid"
          @keydown.enter="onSubmitForm"
          @submit="onSubmitForm"
          onsubmit="return false;"
          max-width="100px"
        >
          <!-- <v-row dense>
            <v-col>
              <h4 v-text="$i18n.tc($msg.InputTitle, index + 1)" />
            </v-col>
          </v-row>-->
          <v-row dense>
            <v-col>
              <v-text-field
                v-model="formData.label"
                :rules="rules.label"
                color="accent"
                :label="$text.Text"
                :counter="valid.label.max"
                required
              />
            </v-col>
          </v-row>
          <v-row dense>
            <v-col>
              <v-select
                v-model="formData.type"
                :items="getInputTypes"
                :label="$text.ChooseType"
                @change="onTypeChange"
                dense
              ></v-select>
            </v-col>
          </v-row>
          <v-card
            v-if="formData.type === 'select' || formData.type === 'multiselect'"
            outlined
            style="border: 1px solid lightgray !important"
          >
            <v-card-text>
              <div>
                <span v-text="$text.OptionsTitle" />
                <v-btn
                  text
                  icon
                  color="accent"
                  class="add-btn ml-1"
                  @click="addOption"
                >
                  <v-icon>add</v-icon>
                </v-btn>
              </div>
              <v-text-field
                v-for="(option, index) in formData.options"
                :key="index"
                v-model="formData.options[index].label"
                color="accent"
                :label="$i18n.tc($msg.OptionLabel, index + 1)"
                :append-icon="formData.options.length > 2 ? 'close' : ''"
                @click:append="deleteOption(index)"
                required
                class="ml-5 mr-5"
                :rules="rules.label"
              />
            </v-card-text>
          </v-card>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          @click="isOpen = false"
          v-text="$text.Cancel"
        />
        <v-btn color="accent" @click="onSubmitForm" class="share-btn">
          Save
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

  #share-dialog-form {
    padding: 1rem 1rem 0;
  }

  .header-separator {
    padding: 0 1.3rem;

    div {
      border-bottom: 2px solid #dddddd;
    }
  }

  .note-wrapper {
    justify-content: center;
    align-items: flex-end;
    padding: 10px 4rem;
    text-align: center;
    display: flex;

    &.status {
      font-size: 1.5rem;
      color: #666666;
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
