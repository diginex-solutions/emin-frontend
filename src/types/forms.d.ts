declare namespace Forms {
  interface Record extends Recipient {
    id: string
    from: History.User

    document?: Docs.Record

    message: string
    status: 'pending' | 'accepted' | 'rejected' | 'received'
    dateCreated: Date
    dateFilled: Date | null
    dateReceived?: Date | null

    answers: Answer[]

    recipient: UserDirectory.Record
    initiator: UserDirectory.Record
    isInitiator: boolean
    template: Templates.Record
    docId: string

    initiatorDocId: string
    recipientDocId: string
    type: FormTypes
  }

  interface Recipient {
    email: string
    company: string
    name: string
    surname: string

    id?: string
    lang?: 'en' | 'hi' | 'ur' | 'bn'
    isRegistered?: boolean
  }

  enum FormTypes {
    form = 'form',
    verification = 'verification'
  }

  interface Answer {
    id: string
    value?: string | number | boolean | string[] | null
    range?: { min?: string; max?: string }[]
  }

  interface AnswerFull extends Templates.Input {
    value?: string | number | boolean | string[] | null
    range?: { min?: string; max?: string }[]
    label: string
  }

  export type FetchHistoryA = (p: Record) => Promise<History[]>

  export interface History {
    id: string
    formId: string // relationship to Forms table
    type: string // created | viewed | filled | accepted | rejected
    createdAt: Date
    status: boolean
  }
}
