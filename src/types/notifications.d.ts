declare namespace Notifications {
  export interface State {
    records: Record[]
  }

  //  Object definition
  export interface Record {
    id: string
    type: Type
    isRead: boolean // Once user opens the notif - dispatch to BE to set to true

    initiator?: UserDirectory.Record // User who triggered the event
    form?: Forms.Record // Relation column `formId`
    doc?: Docs.Record

    createdAt: Date
    spaceId: string
  }

  type Type =
    | 'verification'
    | 'shared'
    | 'form'
    | 'version'
    | 'verification_filled'
    | 'form_filled'
    | 'space_invited'

  //*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

  export type MarkReadA = (p: Record) => Promise<void>
}
