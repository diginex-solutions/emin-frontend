declare namespace Widgets {
  // Record
  export interface Record {
    id: string

    // Representation
    name: string
    icon: string
    type: chartType

    // Aggregation settings
    templateId: string
    fieldId: string
    allowDuplicates: boolean
    groups: Group[]

    // Populated by server
    data: AggData | {}

    isYearsFromNow: boolean
    isPercentage: boolean
  }

  type Group = { min?: string | number; max?: string | number }

  type chartType = 'bar' | 'doughnut' | 'pie' | 'count'

  interface AggData {
    values: AggValue[]

    type: 'select' | 'checkbox' | 'multiselect' | 'country'
    label: string
  }

  interface AggValue {
    label: string
    value: string | number
  }
  // State
  export interface State {
    records: Record[]
  }

  // * === === === === === === === === === ===
  // * Actions 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖

  export type CreateA = (p: Record) => Promise<Record>
  export type UpdateA = (p: Record) => Promise<Record>
  export type DeleteA = (p: Record) => Promise<null>
}
