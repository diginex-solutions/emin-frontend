declare namespace DocumentTypes {
  interface Record {
    _id: string
    spaceId: string
    title: string
    description: string
  }

  export interface State {
    records: Record[]
  }

  // * === === === === === === === === === ===
  // * Actions 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖

  export type CreateA = (p: CreateP) => Promise<Record>
  interface CreateP {
    spaceId: string
    title: string
  }

  export type DeleteA = (p: Record) => Promise<void>
  export type FetchA = (spaceId: string) => Promise<null>
}
