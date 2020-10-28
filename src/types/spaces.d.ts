declare namespace Spaces {
  type Fields =
    | 'id'
    | 'name'
    | 'icon'
    | 'isPrivate'
    | 'role'
    | 'description'
    | 'allowInviteAll'
    | 'isOrganization'
    | 'isForms'
    | 'isCases'
    | 'isDashboard'
    | 'isChecklist'
    | 'userLimit'

  type UserLimit = 10 | 50 | 100 | 1000 | 10000

  interface Record {
    id: string
    name: string
    icon: string
    isPrivate: boolean
    role: SpaceRoles // determines whether or not user can add manipulate users at UD
    description: string
    allowInviteAll: boolean

    isUserDirectory: boolean // personal/organizational
    isOrganization: boolean // personal/organizational
    isForms: boolean // Show/hide forms
    isCases: boolean // Show/hide cases
    isDashboard: boolean // Show/hide dashboard (widgets)
    isChecklist: boolean // Show/hide checklist page
    userLimit: UserLimit
    isSupport: boolean // Show/hide article index page
  }

  export interface State {
    records: Record[]
    selectedId: string
    managers: SpaceManager[]
    registeredUsers: SpaceManager[]
    caseManagers: SpaceManager[]
  }

  interface SpaceManager {
    id: string
    email: string
    name: string
    surname: string
    isRegistered: boolean
  }

  //*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

  // Update selected space
  export type SetSelectedA = (p: Record) => Promise<void>

  export type CreateA = (p: CreateP) => Promise<Record>
  interface CreateP {
    name: string
    description: string
    icon: string
    allowInviteAll?: boolean
  }

  export type UpdateA = (p: UpdateP) => Promise<Record>
  export interface UpdateP {
    id: string
    name: string
    description: string
    icon: string
  }

  export type UpdateSettingsAdminA = (p: SettingsAdminP) => Promise<Record>
  export interface SettingsAdminP {
    id: string
    isOrganization: boolean
    isForms: boolean
    isCases: boolean
    isDashboard: boolean
    userLimit: UserLimit
  }

  // Synced
  export enum SpaceRoles {
    admin = 'admin',
    employee = 'employee',
    manager = 'manager'
  }

  export type DeleteA = (p: Record) => Promise<void>
  export type LeaveA = () => Promise<Record>
  export type FetchSpacesAdminA = () => Promise<Record[]>
  export type FetchSpaceA = (id: string) => Promise<Record>
  export type UpdatePersonalSpaceA = () => Promise<void>

  export type FetchManagerA = (spaceId?: string) => Promise<SpaceManager[]>
  export type FetchRegisteredUsersA = (
    spaceId: string
  ) => Promise<SpaceManager[]>
  export type AddManagerA = (p: AddManagerP) => Promise<SpaceManager[]>
  export interface AddManagerP {
    spaceId: string
    managers: SpaceManager[]
  }
  export type DeleteManagerA = (p: DeleteManagerP) => Promise<void>
  export interface DeleteManagerP {
    spaceId: string
    managerId: string
  }
}
