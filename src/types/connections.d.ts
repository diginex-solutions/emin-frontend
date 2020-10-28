declare namespace Connections {
  // * State
  export interface State {
    records: Record[]
  }

  //* Object definition
  export interface Record {
    id: string
    email: string
    name?: string
    surname?: string
  }

  // TODO: bug - fix types incompatibility btwn userDirectory
  export interface RecordCompat extends Record {
    userType: UserDirectory.UserType // TODO: mandatory, this is filled in by backend
    lang: Docs.Language // TODO: mandatory, this is filled in by backend
    brand?: string
    company?: string // TODO: probably will be depr in favor of `brand` field
    role?: UserDirectory.Role
  }

  export type Language = 'en' | 'hi' | 'ur'

  //*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

  export type CreateA = (p: { email: string }) => Promise<Record>
  export type UpdateA = (p: Record) => Promise<Record>
  export type DeleteA = (p: Record) => Promise<null>
  export type FetchA = () => Promise<void>
}
