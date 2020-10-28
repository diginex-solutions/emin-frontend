declare namespace Types {
  export type WidgetsMap = any // TODO:
  export interface Header {
    text?: string
    value: string
    sortable?: boolean
    width?: number | string
    align?: string
    filterable?: boolean
  }

  type Rule = (v: string) => string | true // * Validation rule
  type FormRule = {
    [key in string]: { min: number; max: number }
  }

  interface VeeObserver extends Element {
    reset(): () => void
    validate(): () => void
  }

  type FormFieldValid = { min?: number; max?: number; required?: boolean }
  interface FormField {
    name: string
    label?: string
    title?: string
    inputType:
      | 'textfield'
      | 'textarea'
      | 'select'
      | 'iconSelect'
      | 'switch'
      | 'checkbox'
      | 'file'
      | 'contactSelect'
    rules?: Rule[]
    inputOptions?: (
      | string
      | number
      | { id: string; text: string }
      | Record<string, any>
    )[]
    valid?: FormFieldValid
    value?: any // Default value
    hidden?: boolean
    multiple?: boolean
    allowInviteUser?: boolean
    contactType?: any
    disabled?: boolean
    selectorText?: string
    selectorValue?: string
    maxCount?: number
    customStyle?: Object
    showLabelInSmallScreen?: boolean
  }

  export interface Form extends Element {
    validate: () => null
    resetValidation: () => null
  }

  // TODO: fix any types
  type FormData = any
  export type Feed = any
  export type Timeout = any
  export type ChartOptions = any
  export type ChartComponent = any
  export type RoutesItem = any
  export type AxiosDummy = any
  export type VuexStore = any

  export type FormDataAny = any
  export type RecordAny = any
  export type Route = any

  //* Synced to stxForms
  enum FormInputTypes {
    textfield = 'textfield',
    textarea = 'textarea',
    select = 'select',
    iconSelect = 'iconSelect',
    switch = 'switch',
    checkbox = 'checkbox',
    file = 'file',
    image = 'image'
  }

  //* Synced to stxForms
  enum FormInputTypesV2 {
    textfield = 'textfield',
    password = 'password',
    passwordConfirm = 'passwordConfirm',
    textarea = 'textarea',
    select = 'select',
    iconSelect = 'iconSelect',
    switch = 'switch',
    checkbox = 'checkbox',
    image = 'image'
  }

  interface FormFieldV2 {
    name: string
    label?: string
    title?: string
    inputType: FormInputTypesV2
    rules?: string
    inputOptions?: (
      | string
      | number
      | { id: string; text: string }
      | Record<string, any>
    )[]
    value?: any // Default value
    hidden?: boolean
    disabled?: boolean
    selectorText?: string
    selectorValue?: string
  }

  type ReqUrl = { method: string; path: string }
}
