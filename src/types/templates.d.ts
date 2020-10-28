declare namespace Templates {
  //* State
  export interface State {
    records: Record[]
  }

  //* Record
  interface Base {
    id: string
    name: string
    inputs: Input[]
    languages: TemplateLanguages[]
  }
  export interface Record extends Base {
    inputs: Input[]
  }

  export interface RecordTranslated extends Base {
    inputs: InputTranslated[]
  }

  interface Option {
    id: string
    label: string
  }

  interface Input {
    id: string
    type: InputTypes
    options?: Option[]
  }

  type AnswerValue = string | number | boolean | string[] | null

  interface InputTranslated extends Input {
    value?: AnswerValue
    label?: string
  }

  interface FieldLanguage {
    id: string
    label: string
  }

  interface InputLanguage extends FieldLanguage {
    id: string
    label: string
    options?: FieldLanguage[]
  }

  export interface TemplateLanguages {
    lang: Auth.Lang
    inputs: InputLanguage[]
  }

  // dupe of docsD
  export enum InputTypes {
    text = 'text',
    number = 'number',
    checkbox = 'checkbox',
    select = 'select',
    multiselect = 'multiselect',
    country = 'country',
    date = 'date',
    time = 'time'
  }

  //*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

  export type CreateA = (p: Record) => Promise<Record>
  export type UpdateA = (p: Record) => Promise<Record>
  export type DeleteA = (p: Record) => Promise<null>
}
