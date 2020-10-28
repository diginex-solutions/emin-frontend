declare namespace Docs {
  // * === === === === === === === === === === Externals

  type User = UserDirectory.Record

  //*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

  export interface State {
    records: Record[]
    documentHistory: History[]
    documentVersionHistory: VersionHistory[]
    searchQuery: string
    searchPage: string
    selectedRecord: RecordDetailed
    overview: {
      history: History.Item[]
    }
    sort: {
      field: string
      order: 'asc' | 'desc'
      default: {
        field: string
        order: 'asc' | 'desc'
      }
    }
    currentPath: string
    checklistRecords: ChecklistRecord[]
  }

  export type Language = 'en' | 'hi' | 'ur' | 'bn' | 'th'

  export interface History {
    id: string
    action: string
    date: string
    fileId: string
    ipAddress: string
    status: string
    txHash: string
    by: {
      name: string
      surname: string
      email: string
    }
    document: {
      name: string
      extension: string
    }
    meta: any //  todo; delete this, not used after demo3

    actionObj?: Forms.Record
  }

  export interface VersionHistory {
    isCurrentVer: boolean
    uploaded: number
    size: number
    uri: string
    id: string
    uploader: {
      email: string
      name: string
      surname: string
    }
  }

  export interface UploadNewVersionPayload {
    file: File
    accessId: string
  }

  export type ActionUploadNewVersion = (
    payload: UploadNewVersionPayload
  ) => Promise<string>

  export type RecordDetailed = {
    archived: boolean
    extension: string
    id: string
    name: string
    recipients: string[]
    size: number
    uploaded: Date
    uri: string
    user: User
    actions: Forms.Record[]
  } | null

  // Migrating to this name instead of "Document", coz reserved
  export interface Record {
    archived: boolean
    extension: string
    id: string
    name: string
    recipients: Forms.Recipient[]
    size?: number
    uploaded?: Date
    uri: string
    category?: string

    // local only
    isFolder?: boolean
    owner?: {
      id: string
      name: string
      surname: string
      email: string
    }
    parent?: string | null
    path: string

    sharing?: string | number // Used locally for sorting purposes
    filesCount?: number | null
    actions?: Forms.Record[]
  }

  //*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

  interface ChecklistRecord extends Record {
    documentUploaded: boolean
    verified: boolean
    select: boolean
    categoryDescription?: string
  }

  // * === === === === === === === === === ===
  // * Action 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

  export type FetchA = () => Promise<void>
  export type FetchHistoryA = (r: Record) => Promise<null>
  export type FetchDocumentA = (id: string) => Promise<Record>

  export type UpdateSearchA = (query?: string) => Promise<null>
  export type SetCurrentPathA = (path?: string) => Promise<null> | null
  export type UpdatePageA = (page?: string) => Promise<null>
  export type AddDocumentA = (doc: Record) => {}
  export type DeleteFolderA = (folder: Record) => Promise<null>
  export type MoveDocsA = (p: MoveDocsP) => Promise<null>
  export type CreateFolderA = (name: string) => Promise<Record>

  export type CreateA = (p: CreateP) => Promise<null>
  export interface CreateP {
    name: string
    path: string
  }

  export type CreateActionA = (p: CreateFormP) => Promise<null>
  export interface CreateFormP {
    formName?: string
    document: Record
    users: User[]
    message: string
    template: Templates.Record
    isVerify?: boolean
  }

  export type UpdateFormA = (p: UpdateFormP) => Promise<null>
  export type FetchDocVersionHistoryAction = () => Promise<null>
  export interface UpdateFormP {
    id: string
    status: string
  }

  export type SetFolderA = (p: string) => Promise<null>
  export type RenameA = (p: {
    name: string
    edit: null | Record
  }) => Promise<null>

  export interface MoveDocsP {
    pathAfter: string
    pathBefore?: string
    documents?: string[]
  }

  // Updating document
  export type UpdateDocumentA = (p: UpdateDocumentP) => Promise<null>
  export interface UpdateDocumentP {
    id: string
    name?: string
    archived?: boolean
  }

  export type ArchiveA = any

  // Add Recipient
  export interface ShareP {
    document: Record
    users: User[]
  }

  export type ShareA = (p: ShareP) => Promise<null>

  // Download
  export type DownloadA = (docsList: Record[]) => void

  // Clear Selected Checklist
  export type SingleSelectChecklistA = (docId: string) => void

  // Update Checklist
  export type UpdateChecklistA = (doc: Record) => Promise<null>
}

// * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀

declare namespace History {
  export type ActionTypes =
    | 'view'
    | 'create'
    | 'share'
    | 'unshare'
    | 'archived'
    | 'restored'
    | 'renamed'

  export interface User {
    id?: string
    name: string
    surname: string
    email: string
    company?: string
  }

  export interface Item {
    action: ActionTypes
    by: User
    with?: User
    date: string
    document: {
      extension: string
      name: string
    }
    fileId: string
    id: string
    ipAddress: string
    status: boolean
    txHash: string
    txNetwork: string
    tezosNetwork: string
    tezosOpHash: string
  }
}
