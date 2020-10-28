declare namespace Cases {
  //  Object definition
  export interface Record {
    id: string
    name: string
    events?: CaseFeedItem[]
    users: User[]
    owner: User
    isOpen: boolean

    description: string
    resolutionPlan: string
    caseType: string
    relatedTo?: User
    createdAt: Date

    status: StatusType
    issueType: CaseIssueType
    assignedTo?: User
    caseNumber: string
  }
  type StatusType = 'new' | 'inProgress' | 'closed'

  type FeedItem = CaseFeedItem
  export interface CaseFeedItem {
    id: string
    action:
      | 'created'
      | 'status_opened'
      | 'status_closed'
      | 'comment'
      | 'user_join' // Either 'created' or 'comment'
      | 'managerAssigned'
      | 'managerRemoved'
      | 'caseNew'
      | 'caseInProgress'
      | 'caseClosed'
    createdAt: Date
    updatedAt: Date
    message?: string // Available only if this item is of  type comment
    initiator?: User
    recipient?: User
    isOpen?: boolean
    data?: string
    manager?: User
  }

  export interface User {
    id: string
    email: string
    name: string
    surname: string
    company: string
    isRegistered: boolean
  }

  export interface CaseType {
    id: string
    value: string
    spaceId?: string
  }

  export enum CaseIssueType {
    Grievance = 'grievance',
    Others = 'others'
  }
  
  //  State
  export interface State {
    records: Record[]
    selected: Record | null
    caseTypes: CaseType[]
  }

  // * === === === === === === === === === ===
  // * Actions 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖

  export type CommentCreateA = (p: CommentCreateP) => Promise<void>
  export type CommentCreateP = { message: string }

  export type CreateA = (p: CreateP) => Promise<Record>
  interface CreateP {
    description: string
    resolutionPlan: string
    caseType: string
    relatedTo: string
    issueType: CaseIssueType
    status: StatusType
  }

  export type updateA = (p: UpdateP) => Promise<Record>
  interface UpdateP {
    id: string
    resolutionPlan: string
    assignedTo: string
    status: StatusType
  }

  export type UpdateA = (p: { name: string }) => Promise<Record>

  export type FeedAddA = (p: CaseFeedItem) => Promise<void>

  export type DeleteA = (p: Record) => Promise<void>

  export type CommentUpdateA = (p: CommentUpdateP) => Promise<Record>
  export type CommentUpdateP = { id: string; message: string } // Payload type for create

  export type CommentDeleteA = (p: { id: string }) => Promise<void>

  export type SelectedSetA = (p: Record) => Promise<void>

  export type usersAddA = (
    p: Cases.User[]
  ) => Promise<{ user: Cases.User; event: CaseFeedItem }>

  export type StatusUpdateA = (status: StatusType) => Promise<void>

  export type FetchCaseTypesA = () => Promise<CaseType[]>

  export type FileUploadsA = (formData: {
    [key: string]: any
  }) => Promise<CaseFeedItem[]>

  export type CreateCaseTypesA = (caseTypes: string[]) => Promise<CaseType[]>
  export type DeleteCaseTypesA = (caseTypeId: string) => Promise<{ success: boolean }>
}
