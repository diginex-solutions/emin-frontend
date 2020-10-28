declare namespace UserDirectory {
  type Role = Spaces.SpaceRoles
  //  Object definition
  export interface Record {
    id: string
    name: string
    surname: string
    email: string
    brand: string
    company: string // TODO: probably will be depr in favor of `brand` field
    role: Role
    userType: UserType
    lang: Docs.Language
    isRegistered: boolean
    positionType: PositionType
  }

  export interface RawRecord {
    _id: string
    id?: string
    name: string
    surname: string
    email: string
    brand: string
    company: string // TODO: probably will be depr in favor of `brand` field
    role: Role
    userType: UserType
    lang: Docs.Language
    isRegistered: boolean
    positionType: PositionType
  }
  export type UserType = 'normal' | 'superUser' | 'diginexAdmin'
  export type PositionType = 'manager' | 'others'

  // Sync d.ts <-> D.ts
  export enum PositionTypes {
    manager = 'manager',
    others = 'others'
  }

  export interface Update {
    role?: Spaces.SpaceRoles
    userType?: UserType
    brand?: string
  }

  export interface UpdateUserPayload extends Update {
    id: string
  }

  export interface Updates {
    [id: string]: Update
  }

  export interface Updating {
    [id: string]: true
  }

  //  State
  export interface State {
    records: Record[]
    updates: Updates
    pendingUpdates: Updating
  }

  // Actions
  export type ActionUpdateUser = (p: UpdateUserPayload) => void
  export type ActionSendUpdate = (p: Record) => Promise<null>
  export type ActionSendUpdates = () => Promise<null>
  export type ActionResetUpdates = () => void
  export type ActionFetch = (noSpinner: boolean) => void
  export type DeleteA = (p: Record) => Promise<null>

  // Creating user - sending invite
  export type CreateA = (p: CreateP) => Promise<Record>
  type CreateP = Record

  // Reinviting user
  export type ReinviteA = (id: string) => Promise<void>
}
