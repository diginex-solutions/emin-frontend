// TODO:  might be deprecated

declare namespace Actions {
  type Record = Docs.Record

  //  State
  export interface State {
    records: Record[]
  }

  // * === === === === === === === === === ===
  // * Actions 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖

  export type AddA = (p: Record) => Promise<Record>
  export type DeleteA = (p: Record) => Promise<void>
  export type SetA = (p: Record[]) => Promise<Record>
  export type RefreshA = (p: Record[]) => Promise<Record>
}
