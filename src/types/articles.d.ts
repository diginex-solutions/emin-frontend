declare namespace Articles {
  export interface State {
    records: Record[]
    topics: Topic[]
    topicId: string | null
    selectedId: string | null
    improvements: Improvement[]
    isFetchingArticles: boolean
    showArticlesEditSidebar: boolean
  }

  interface Record {
    id: string
    title: string
    text: string
    summary: string
    topicId: string | null
    isPublished: boolean

    createdAt: Date
    updatedAt: Date

    userId: string
    user: Connections.Record //* Hydrated at backend
    views?: number
  }

  //* RecordEdit
  interface RecordNew {
    id?: string
    title: string
    text: string
    summary: string
    topicId: string | null
    isPublished: boolean
  }

  interface Topic {
    id: string
    name: string
    icon: string
  }

  interface FeedbackNew {
    articleId?: string
    isHelpful: boolean
    improvementId: string //* Id of the field
    tellUsMore: string
  }

  interface Feedback {
    id: string
    isHelpful: boolean
    improvementId: string //* Id of the field
    tellUsMore: string
    userId: string
    user: Connections.Record
    createdAt: Date
    updatedAt: Date
  }

  interface Improvement {
    id: string
    text: string
  }

  //*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

  export type FetchA = () => Promise<Record[]>
  export type SetTopicA = (p: Topic) => Promise<void>

  export type CreateA = (p: RecordNew) => Promise<Record>
  export type SaveA = (p: RecordNew) => Promise<Record>

  export type PublishA = (p: Record) => Promise<Record>
  export type UnpublishA = (p: Record) => Promise<Record>
  export type DeleteA = (p: Record) => Promise<void>

  export type CreateTopicA = (p: CreateTopicP) => Promise<Topic>
  interface CreateTopicP {
    name: string
    icon: string
  }

  export type UpdateTopicA = (p: Topic) => Promise<Topic>
  export type DeleteTopicA = (p: Topic) => Promise<void>

  export type FetchArticleA = (id: string) => Promise<Record>
  export type CreateFeedbackA = (p: FeedbackNew) => Promise<Feedback>
  export type FetchFeedbackA = (id: string) => Promise<Feedback[]>
  export type CountViewA = (p: Record) => Promise<void>

  export type CreateImprovementA = (
    p: CreateImprovementP
  ) => Promise<Improvement>
  type CreateImprovementP = { text: string }
  export type UpdateImprovementA = (p: Improvement) => Promise<void>
  export type DeleteImprovementA = (p: Improvement) => Promise<void>

  export type SetShowArticlesEditSidebarA = (p: boolean) => Promise<void>
}
