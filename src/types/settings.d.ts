declare namespace Settings {
  // Record
  export interface Record {
    id: string
    user_id: string
    type: 'country' | 'user_config'
    name: string
    value: any
  }

  // State
  export interface State {
    records: Record[]
  }

  export interface Layout {
    x: number
    y: number
    w: number
    h: number
    minW: number
    minH: number
    i: string
  }

  // * === === === === === === === === === ===
  // * Actions 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖

  export type CreateA = (p: CreateP) => Promise<Record>
  type CreateP = {
    name: string
    value: any
  }

  export type UpdateA = (p: Record) => Promise<Record>
  export type DeleteA = (p: Record) => Promise<null>
  export type DashboardOffA = () => Promise<null>
  export type SetLayoutA = (p: Layout[]) => Promise<null>
}
