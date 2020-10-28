<script lang="ts">
import _ from 'lodash'
import { saveAs } from 'file-saver'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { VTextField, VTextarea, VSelect } from 'vuetify/lib'
import ContactSelectByType from '@/components/ContactsSelectByType.vue'
import { FormInputTypes } from '@/stx/stxForms'

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Types

//* Form fields binding, made from formFields prop (object - key = `name`, value = `value`)
type FormData = { [key in string]: string | number | null | File | File[] }

//* VueRef to input with `focus` method
interface VueRef extends Element {
  focus(): () => void
}

//* Form
interface Form extends Element {
  reset(): () => void
  resetValidation(): () => void
  validate: () => null
}

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

@Component({
  components: { VTextField, VTextarea, VSelect, ContactSelectByType }
})
export default class FormParser extends Vue {
  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop() isLoading: boolean // * Spinner
  @Prop() submitBtnText: string // * Submit button text
  @Prop() formFields: Types.FormField[] // * Form fields for parsing
  @Prop() noCancelBtn: boolean // * Form fields for parsing

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  formData: FormData = {}
  isFormValid = false // * Synced to form validation
  isMounted = false //* Flag to trigger computing on mount

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  // * Required if user has updated formFields (eg selected different record)
  @Watch('formFields')
  updateFormData() {
    this.formFields.forEach((field) => {
      this.formData[field.name] = field.value
    })

    this.formData = _.cloneDeep(this.formData) //* Reactivity caveat
    this.form?.resetValidation()
  }

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get inputTypes() {
    return FormInputTypes
  }

  //* Get ref to main form
  get form(): Form | null {
    if (!this.isMounted) return null
    return this.$refs.form as Form
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  //*** After rendered, focus on first input element
  mounted() {
    setTimeout(this.init, 150)
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  init() {
    this.isMounted = true

    // * On first app init - update formData to formFields values
    this.updateFormData()

    // * Focus on first field
    const defaultFieldName = (this.formFields && this.formFields[0]?.name) || ''
    const input = this.$refs[defaultFieldName] as VueRef[]

    if (input && input[0] && input[0].focus) {
      input[0].focus()
    }
  }

  // * User clicked submit button - emit onSubmit
  onSubmitForm() {
    if (this.isLoading || !this.isFormValid || !this.form?.validate())
      return false

    this.$emit('onSubmit', this.formData)
  }

  onCancel() {
    this.$emit('onCancel')
  }

  updateFormFields() {
    this.formFields.forEach((field) => {
      field.value = this.formData[field.name]
    })
    this.$emit('update:formFields', [...this.formFields])
  }

  openDialog(refKey: string) {
    const ref = this.$refs[refKey] as HTMLElement[]
    if (ref && ref.length > 0 && ref[0].click) {
      ref[0].click()
    }
  }

  setFileData(e: any, field: Types.FormField) {
    const { target } = e
    const { files } = target
    const { name, multiple = false, maxCount = 1 } = field || {}
    if (multiple) {
      if (this.formData[name]) {
        const existingFiles = this.formData[name] as File[]
        const allFiles = [...existingFiles, ...files] as File[]
        const uniqueFiles = allFiles.reduce((acc, f) => {
          const idx = acc.findIndex((a) => a.name === f.name)
          return idx >= 0 ? acc : acc.concat(f)
        }, [] as File[])
        this.formData[name] =
          uniqueFiles.length <= maxCount
            ? uniqueFiles
            : uniqueFiles.slice(uniqueFiles.length - maxCount)
      } else {
        const fileArray = [...files]
        this.formData[name] =
          fileArray.length <= maxCount
            ? fileArray
            : fileArray.slice(files.length - maxCount)
      }
    } else {
      const file = files[0]
      this.formData[name] = file
    }
  }

  trimFilename(file: File, trimSize: number) {
    if (!file) {
      return ''
    }

    return file.name.length > trimSize
      ? `${file.name.substring(0, trimSize)}...`
      : file.name
  }

  openFile(file: File) {
    if (file) {
      const { name: filename } = file
      saveAs(file, filename)
    }
  }

  deleteFile(name: string, index: number, multiple: boolean) {
    if (this.formData[name]) {
      if (multiple) {
        const files = this.formData[name] as File[]
        files.splice(index, 1)
        if (!files.length) {
          this.formData[name] = null
        }
      } else {
        const file = this.formData[name] as File
        this.formData[name] = null
      }
    }
  }

  disableFileButton(field: Types.FormField) {
    const { name, maxCount = 1 } = field || {}
    const fileData = this.formData[name]
    let fileArray: File[] = []
    if (fileData) {
      fileArray = Array.isArray(fileData)
        ? (fileData as File[])
        : [fileData as File]
    }
    return fileArray.length === maxCount
  }
}
</script>

<template>
  <v-card>
    <v-card-title>
      <slot></slot>
    </v-card-title>

    <!-- //* Form -->
    <v-card-text>
      <v-form ref="form" v-model="isFormValid">
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
              :required="field.valid && field.valid.required"
              :counter="field.valid && field.valid.max"
              @keydown.enter.prevent
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
              @keydown.enter.prevent
            />
          </template>
          <template v-else-if="field.inputType === inputTypes.select && $vuetify.breakpoint.xs">
            <label v-if="field.showLabelInSmallScreen" 
              v-text="field.label" 
              :key="`${field.name}-label`" 
            ></label>
            <v-select
              v-if="!field.hidden"
              :key="field.name"
              :ref="field.name"
              v-model="formData[field.name]"
              :rules="field.rules || []"
              :label="!field.showLabelInSmallScreen && field.label || ''"
              :item-text="field.selectorText || ''"
              :item-value="field.selectorValue || ''"
              :title="field.title || field.label"
              :required="field.valid && field.valid.required"
              :items="field.inputOptions || []"
              :disabled="field.disabled || false"
              @change="updateFormFields"
            />
          </template>
          <template v-else-if="field.inputType === inputTypes.select && !$vuetify.breakpoint.xs">
            <v-select
              v-if="!field.hidden"
              :key="field.name"
              :ref="field.name"
              v-model="formData[field.name]"
              :rules="field.rules || []"
              :label="field.label"
              :item-text="field.selectorText || ''"
              :item-value="field.selectorValue || ''"
              :title="field.title || field.label"
              :required="field.valid && field.valid.required"
              :items="field.inputOptions || []"
              :disabled="field.disabled || false"
              @change="updateFormFields"
            />
          </template>
          <template v-else-if="field.inputType === inputTypes.iconSelect">
            <v-select
              :key="field.name"
              :ref="field.name"
              v-model="formData[field.name]"
              :rules="field.rules || []"
              :label="field.label"
              :title="field.title || field.label"
              :required="field.valid && field.valid.required"
              :items="field.inputOptions || []"
            >
              <template v-slot:selection="{}">
                <v-icon>{{ formData[field.name] }}</v-icon>
              </template>
              <template v-slot:item="data">
                <v-list-item-avatar>
                  <v-avatar>
                    <v-icon>{{ data.item }}</v-icon>
                  </v-avatar>
                </v-list-item-avatar>
              </template>
            </v-select>
          </template>
          <template v-else-if="field.inputType === inputTypes.switch">
            <v-switch
              :key="field.name"
              :ref="field.name"
              v-model="formData[field.name]"
              color="green"
              class="ma-0 unreactive-label"
              :rules="field.rules || []"
              :label="field.label"
              :title="field.title || field.label"
            ></v-switch>
          </template>
          <template v-else-if="field.inputType === inputTypes.checkbox">
            <v-checkbox
              v-if="!field.hidden"
              @change="updateFormFields"
              :key="field.name"
              :ref="field.name"
              v-model="formData[field.name]"
              :label="field.label"
              :title="field.title || field.label"
            />
          </template>
          <template v-else-if="field.inputType === inputTypes.file">
            <div
              :key="`${field.name}-group`"
              class="my-2"
              :style="field.customStyle"
            >
              <input
                :key="`${field.name}-file`"
                type="file"
                :ref="`${field.name}FileInput`"
                @change="setFileData($event, field)"
                class="d-none"
                :multiple="field.multiple"
              />
              <div class="list-container">
                <v-list v-if="formData[field.name] && field.multiple">
                  <v-list-item
                    v-for="(file, i) in formData[field.name]"
                    :key="`file-${i}`"
                  >
                    <a
                      href="#"
                      :key="`${field.name}-url-${i}`"
                      :ref="`${field.name}-url-${i}`"
                      :class="file ? 'mr-2' : ''"
                      :title="file ? file.name : ''"
                      @click="openFile(file)"
                    >
                      {{ trimFilename(file, 40) }}
                    </a>
                    <v-icon
                      :key="`${field.name}-delete-${i}`"
                      :ref="`${field.name}-delete-${i}`"
                      v-if="file"
                      @click="deleteFile(field.name, i, field.multiple)"
                    >
                      mdi-delete
                    </v-icon>
                  </v-list-item>
                </v-list>
                <a
                  v-if="!field.multiple && formData[field.name]"
                  href="#"
                  :key="`${field.name}-url`"
                  :ref="`${field.name}-url`"
                  :class="formData[field.name] ? 'mr-2' : ''"
                  :title="formData[field.name] ? formData[field.name].name : ''"
                  @click="openFile(formData[field.name])"
                >
                  {{ trimFilename(formData[field.name], 40) }}
                </a>
                <v-icon
                  v-if="!field.multiple && formData[field.name]"
                  :key="`${field.name}-delete`"
                  :ref="`${field.name}-delete`"
                  @click="deleteFile(field.name, -1, field.multiple)"
                >
                  mdi-delete
                </v-icon>
                <div v-if="disableFileButton(field)">
                  <span class="red--text">{{ $text.MaxiumFileCount }}</span>
                </div>
              </div>
              <v-fade-transition>
                <v-btn
                  :key="field.name"
                  :ref="field.name"
                  @click.prevent="openDialog(`${field.name}FileInput`)"
                  :label="field.label"
                  outlined
                  small
                  :disabled="disableFileButton(field)"
                >
                  <v-icon
                    :key="`${field.name}-upload`"
                    :ref="`${field.name}-upload`"
                  >
                    mdi-file-upload
                  </v-icon>
                  {{ field.label }}
                </v-btn>
              </v-fade-transition>
            </div>
          </template>
          <template v-else-if="field.inputType === inputTypes.contactSelect">
            <ContactSelectByType
              :name="field.name"
              :key="field.name"
              :ref="field.name"
              :contactType="field.contactType"
              :rule="field.rules"
              :noDataText="$text.ContactsNotFound"
              :multiple="field.multiple"
              :allowInviteUser="field.allowInviteUser"
              :label="field.label"
              :user.sync="formData[field.name]"
            />
          </template>
        </template>
      </v-form>
    </v-card-text>

    <!-- //* BUTTONS: cancel and submit -->
    <v-card-actions>
      <!-- //** Aligns btns right -->
      <v-spacer />

      <!-- //** Cancel button -->
      <v-btn
        v-if="!noCancelBtn"
        :disabled="isLoading"
        :loading="isLoading"
        @click="onCancel"
        :title="$text.Cancel"
      >
        {{ $text.Cancel }}
      </v-btn>

      <!-- //** Submit button -->
      <v-btn
        :disabled="!isFormValid || isLoading"
        :loading="isLoading"
        color="accent"
        @click="onSubmitForm"
        :title="$text.Submit"
      >
        {{ submitBtnText }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
