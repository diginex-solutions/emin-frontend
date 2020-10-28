<script lang="ts">
/* # Usage of the component

Look into `@/components/FormParserSample.vue`

Features (in comparison to FormParser.vue):

1. Veevalidate - clean errors definition, using Laravel syntax
2. Ability to add custom buttons outside of component (using default slot)
TODO:

1. Layout of form
2. Refact all to FormParserV2 and Remove validator.ts (make it a drop-in solution for formParser)
3. File - size restriction
4. Image - resize and save (base64 blob needs to transpile to File format first)

*/
import _ from 'lodash'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { VTextField, VTextarea, VSelect } from 'vuetify/lib'
import { FormInputTypesV2 } from '@/stx/stxFormsV2'

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Types

//* Form fields binding, made from formFields prop (object - key = `name`, value = `value`)
type FormData = { [key in string]: string | number | null }

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

@Component({ components: { VTextField, VTextarea, VSelect } })
export default class FormParser extends Vue {
  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop() isLoading: boolean // * Spinner
  @Prop() submitBtnText: string // * Submit button text
  @Prop() formFields: Types.FormFieldV2[] // * Form fields for parsing
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
    return FormInputTypesV2
  }

  //* Get ref to main form
  get form(): Form | null {
    if (!this.isMounted) return null
    return this.$refs.form as Form
  }

  get observer() {
    return this.$refs.observer as Types.VeeObserver
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
  async onSubmitForm() {
    const res = await this.observer?.validate()
    if (this.isLoading || !res || !this.formData) return false
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

  //* Accepts rules, returns number pertinent to rule 'max'
  getCounter(rules: string) {
    if (!rules) return null
    const Rule = 'max:'
    const rulesList = rules.split('|')

    //* Find `max` rule
    const isMaxRule = (r: string) => r.startsWith(Rule)
    const maxRule = rulesList.find(isMaxRule)
    if (!maxRule) return null //? Exnk

    //* Return number next to `max` rule
    const length = maxRule.slice(Rule.length)
    return Number(length)
  }
}
</script>

<template>
  <v-form ref="form" v-model="isFormValid">
    <ValidationObserver
      ref="observer"
      v-slot="{}"
      tag="form"
      @submit.prevent="submit()"
    >
      <template v-for="field in formFields">
        <!-- Handle different input types -->
        <template v-if="field.inputType === inputTypes.textfield">
          <ValidationProvider
            v-slot="{ errors }"
            :key="field.name"
            :name="field.label"
            :rules="field.rules || ''"
          >
            <v-text-field
              v-if="!field.hidden"
              v-model="formData[field.name]"
              :error-messages="errors"
              :ref="field.name"
              :label="field.label"
              :title="field.title || field.label"
              :counter="getCounter(field.rules)"
              @keydown.enter.prevent
            />
          </ValidationProvider>
        </template>
        <!-- Password field -->
        <template
          v-if="
            field.inputType === inputTypes.password ||
              field.inputType === inputTypes.passwordConfirm
          "
        >
          <ValidationProvider
            v-slot="{ errors }"
            :key="field.name"
            :name="field.name"
            :rules="field.rules || ''"
          >
            <v-text-field
              v-if="!field.hidden"
              v-model="formData[field.name]"
              type="password"
              :error-messages="errors"
              :ref="field.name"
              :label="field.label"
              :title="field.title || field.label"
              :counter="getCounter(field.rules)"
              @keydown.enter.prevent
            />
          </ValidationProvider>
        </template>
        <template v-else-if="field.inputType === inputTypes.textarea">
          <ValidationProvider
            v-slot="{ errors }"
            :key="field.name"
            :name="field.label"
            :rules="field.rules || ''"
          >
            <v-textarea
              v-model="formData[field.name]"
              :error-messages="errors"
              :ref="field.name"
              :label="field.label"
              :title="field.title || field.label"
              :counter="getCounter(field.rules)"
            />
          </ValidationProvider>
        </template>
        <template v-else-if="field.inputType === inputTypes.select">
          <ValidationProvider
            v-slot="{ errors }"
            :key="field.name"
            :name="field.label"
            :rules="field.rules || ''"
          >
            <v-select
              v-if="!field.hidden"
              :error-messages="errors"
              :ref="field.name"
              v-model="formData[field.name]"
              :label="field.label"
              :item-text="field.selectorText || ''"
              :item-value="field.selectorValue || ''"
              :title="field.title || field.label"
              :items="field.inputOptions || []"
              :disabled="field.disabled || false"
              @change="updateFormFields"
            />
          </ValidationProvider>
        </template>
        <template v-else-if="field.inputType === inputTypes.iconSelect">
          <ValidationProvider
            v-slot="{ errors }"
            :key="field.name"
            :name="field.label"
            :rules="field.rules || ''"
          >
            <v-select
              v-model="formData[field.name]"
              :error-messages="errors"
              :ref="field.name"
              :label="field.label"
              :title="field.title || field.label"
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
          </ValidationProvider>
        </template>
        <template v-else-if="field.inputType === inputTypes.switch">
          <ValidationProvider
            v-slot="{ errors }"
            :key="field.name"
            :name="field.label"
            :rules="field.rules || ''"
          >
            <v-switch
              v-model="formData[field.name]"
              :error-messages="errors"
              :ref="field.name"
              :rules="field.rules || []"
              :label="field.label"
              :title="field.title || field.label"
              color="green"
              class="ma-0 unreactive-label"
            />
          </ValidationProvider>
        </template>
        <template v-else-if="field.inputType === inputTypes.checkbox">
          <ValidationProvider
            v-slot="{ errors }"
            :key="field.name"
            :name="field.label"
            :rules="field.rules || ''"
          >
            <v-checkbox
              v-if="!field.hidden"
              v-model="formData[field.name]"
              :error-messages="errors"
              @change="updateFormFields"
              :ref="field.name"
              :label="field.label"
              :title="field.title || field.label"
            />
          </ValidationProvider>
        </template>
        <!-- Uploading file - returns File -->
        <!-- // TODO: multiple/batching (Connie used MaxiumFileCount to restrict number of files) -->
        <template v-else-if="field.inputType === inputTypes.file">
          <ValidationProvider
            v-slot="{ errors }"
            :key="field.name"
            :name="field.label"
            :rules="field.rules || ''"
          >
            <v-file-input
              v-model="formData[field.name]"
              :error-messages="errors"
              show-size
              :counter="false"
              :placeholder="field.placeholder"
              :label="field.label"
            ></v-file-input>
          </ValidationProvider>
        </template>
        <!-- Uploading image, accepted types - png, jpg, bmp -->
        <!-- // TODO: size restriction (might be handled by setting rules) -->
        <template v-else-if="field.inputType === inputTypes.image">
          <ValidationProvider
            v-slot="{ errors }"
            :key="field.name"
            :name="field.label"
            :rules="field.rules || ''"
          >
            <v-file-input
              v-model="formData[field.name]"
              :error-messages="errors"
              show-size
              :counter="false"
              accept="image/png, image/jpeg, image/bmp"
              :placeholder="field.placeholder"
              prepend-icon="mdi-camera"
              :label="field.label"
            ></v-file-input>
          </ValidationProvider>
        </template>
      </template>
    </ValidationObserver>

    <!-- //* Buttons -->
    <slot></slot>
  </v-form>
</template>
