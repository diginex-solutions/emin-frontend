import { i18n, Msg } from '@/plugins/i18n'
import r, { Routes, routesApi } from '@/router'
import { FormTypes } from '@/store/formsStore'
import { AuthS, RootA, RootG, FormsS, ActionsS } from '@/types/'
import { Actions, Getters, Mutations } from '@/types/docsD'
import Stx from '@/types/stx.ts'
import {
  getParentPath,
  getPathAfterMove,
  isChildPath,
  isPathEqual,
  isPathParent
} from '@/utils/helpers'
import { saveAs } from 'file-saver'
import _ from 'lodash'
import Vue from 'vue'
import { Module } from 'vuex'
import { sendReq, RTX, sendReqProm } from '@/utils/helpers'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type Record = Docs.Record
type Document = Docs.Record
type ChecklistRecord = Docs.ChecklistRecord
export enum Pages {
  documents = 'documents'
}

const router: typeof r = r
const ROOT_PATH = '/'
const SEARCHABLE_PAGES = [
  'overview',
  'documents',
  'archived',
  'shared',
  'actions'
]

// TODO: potential
const DEFAULT_OVERVIEW = {
  history: []
}

const CHECKLIST_PATH = '/Checklist'

const sorters: any = {
  name: (doc: Record) => doc.name.toLowerCase(),
  extension: (doc: Record) => doc.extension.toLowerCase(),
  uploaded: (doc: Record) => doc.uploaded,
  size: (doc: Record) => (doc.isFolder ? doc.filesCount : doc.size),
  sharing: (doc: Record) => doc.sharing,
  path: (doc: Record) => doc.path
}

const getInitialState = (): Docs.State => {
  return {
    records: [],
    searchPage: 'overview',
    searchQuery: '',
    documentHistory: [],
    documentVersionHistory: [],
    selectedRecord: null,
    overview: DEFAULT_OVERVIEW,
    sort: {
      default: {
        field: 'name',
        order: 'asc'
      },
      field: '',
      order: 'asc'
    },

    currentPath: '/',
    checklistRecords: []
  }
}

// TODO: don't pass objects repeatedly through localization -
// ! separate into localization and re-computing local vars methods
const localizeDoc = (doc: Document, allDocs: Docs.Record[]) => {
  const folderIndex = doc.path.lastIndexOf('/')

  // Format names and parent - deconstruct out of `path` field
  if (folderIndex > -1 && doc.isFolder) {
    doc.name = doc.path.substring(folderIndex + 1)

    // PATH - Info of file number within folder
    const path = doc.path
    const countChildren = (agg: number, d: Document) => {
      const parentPath = d.isFolder ? getParentPath(d.path) : d.path
      return (agg += path.toLowerCase() === parentPath.toLowerCase() ? 1 : 0)
    }
    doc.filesCount = allDocs.reduce(countChildren, 0)
  }

  // Add "sharing" field (for sorting purposes)
  const isShared = doc.recipients.length > 0 || !!doc.owner
  doc.sharing = isShared ? i18n.tc(Msg.Public) : i18n.tc(Msg.Private)

  const isSharedWithMe = isPathParent(Stx.PathShared, doc.path)
  doc.sharing = isSharedWithMe ? i18n.tc(Msg.None) : doc.sharing

  // sort actions - recent ones should be on top
  doc.actions = _.orderBy(doc.actions, 'form.dateCreated', 'desc')

  return doc
}

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

export const docsStore: Module<Docs.State, RootStore.State> = {
  namespaced: true,
  state: getInitialState(),
  getters: {
    [Getters.getSelectedRecord](state): Docs.RecordDetailed {
      return state.selectedRecord
    },

    [Getters.getCurrentPath](state): string {
      return state.currentPath
    },

    [Getters.getDocumentHistory](state): Docs.History[] {
      return state.documentHistory
    },

    [Getters.documentVersionHistory](state): Docs.VersionHistory[] {
      return state.documentVersionHistory
    },

    [Getters.getHistory](state): History.Item[] {
      return [...state.overview.history]
    },

    [Getters.getSearchQuery](state): string {
      return state.searchQuery
    },

    // return new array of records
    [Getters.records](state): Document[] {
      return [...state.records]
    },

    // Get array of all actions, drop doc link inside of the action, only unique only
    [Getters.allActions](state, getters, rootx, rootGetters): Forms.Record[] {
      const allActions = rootGetters[FormsS.extGetRecords]

      // TODO: DELETE, ONLY FOR TESTING BACKEND BUG
      allActions.forEach((a: Forms.Record) => {
        if (a.docId === '5e5c8bf2a19c547e0edbb9e4') {
          a.docId = '5e5df34ba19c541edadbba59'
        }
      })
      const filterRecipient = (a: Forms.Record) => !a.isInitiator
      const actionsRecipient = allActions.filter(filterRecipient)

      return _.orderBy(actionsRecipient, 'form.dateCreated', 'desc')
    },
    [Getters.getDocumentsWithoutCategory](state): Record[] {
      // Only return main folder documents
      return state.records.filter((r) => {
        const isInRoot = r.path === '/'
        return r.category == null && !r.isFolder && isInRoot
      })
    },
    [Getters.getChecklist](state): ChecklistRecord[] {
      return state.checklistRecords.filter((r) => {
        const isInChecklist = r.path === CHECKLIST_PATH
        return !r.archived && !r.isFolder && isInChecklist
      })
    }
  },
  mutations: {
    // Process records before storing to local state - handle folder structure
    // ! Localization errors won't be displayed
    [Mutations.set](state, payload = []) {
      // Compute aggregate info for folders
      payload.forEach((doc: Document) => {
        doc = localizeDoc(doc, payload)
      })

      state.records = payload
    },

    [Mutations.updatePath](state, { documents, pathAfter, pathBefore }) {
      const getSpecified = (d: Document) => documents.includes(d.id)
      const docs = state.records.filter(getSpecified)
      docs.forEach((doc: Document) => {
        const prevPath = doc.path

        // for folder - update path for all child files
        if (doc.isFolder) {
          const getChildren = (d: Document) => isChildPath(d.path, prevPath)
          const children = state.records.filter(getChildren)
          children.forEach((d: Document) => {
            d.path = getPathAfterMove(d.path, pathBefore, pathAfter) || ''
          })
        }

        doc.path = getPathAfterMove(prevPath, pathBefore, pathAfter) || ''
      })

      Vue.set(state, 'records', state.records)
    },

    [Mutations.setSelectedRecord](state, payload) {
      state.selectedRecord = payload
    },

    [Mutations.setCurrentPath](state, path = '/') {
      state.currentPath = path
    },

    [Mutations.updateSearchPage](state, page = '') {
      // if moving away from documents page - reset current path too
      if (state.searchPage === Pages.documents && page !== Pages.documents) {
        state.currentPath = ROOT_PATH
      }

      state.searchPage = page
    },

    [Mutations.updateSearchQuery](state, query = '') {
      state.searchQuery = query
    },

    [Mutations.setDocumentHistory](state, payload: Docs.History[] = []) {
      state.documentHistory = payload
    },

    [Mutations.setOverview](state, payload = DEFAULT_OVERVIEW) {
      state.overview = payload
    },

    [Mutations.addRecord](state, payload) {
      const doc = localizeDoc(payload, [...state.records, payload])
      state.records = [...state.records, doc]
    },

    // update record's 'archived' field
    [Mutations.updateArchivedById](state, { id, archived }) {
      const index = state.records.findIndex((p: Document) => p.id === id)
      if (index > -1) {
        const record = state.records[index]
        record.archived = archived
        Vue.set(state.records, index, record)
      }
    },

    // Sort record. Default field is secondary column. Move folders on top
    [Mutations.sort](state, { field, order }) {
      const defaultField = state.sort.default.field

      state.sort.field = field
      state.sort.order = order

      const primarySorter = sorters[field]
      const secondarySorter = sorters[defaultField]

      // Shared and archived folders - move to top
      const sorterIsSpecial = (i: Record) => {
        const isArchived = isPathEqual(i.path, Stx.PathArchived)
        const isShared = isPathEqual(i.path, Stx.PathShared)
        return i.isFolder && (isArchived || isShared)
      }

      const docs = _.orderBy(
        state.records,
        [primarySorter, secondarySorter],
        order
      )

      let docsSpecial = docs.filter(sorterIsSpecial)
      let docsRegular = docs.filter((doc: Record) => !sorterIsSpecial(doc))

      docsSpecial = _.orderBy(docsSpecial, 'name', 'asc') // Sort special folders by name
      docsRegular = _.orderBy(docsRegular, 'isFolder', 'desc')

      state.records = [...docsSpecial, ...docsRegular]
    },

    // Updates record - accepts the record that needs to be updated, `id` field is required
    [Mutations.update](state, record) {
      const findById = (d: Document) => d.id === record.id
      const index = state.records.findIndex(findById)
      if (index === -1) return
      const doc = localizeDoc(record, state.records)
      Vue.set(state.records, index, doc)
    },

    [Mutations.reset](state) {
      Object.assign(state, getInitialState())
    },

    [Mutations.documentVersionHistory](state, history) {
      state.documentVersionHistory = history
    },

    [Mutations.setChecklist](state, records: Docs.ChecklistRecord[]) {
      records.forEach((doc: Document) => {
        doc = localizeDoc(doc, records)
      })

      const checklistRecords = records
        .map((r) => ({
          ...r,
          select: false
        }))
        .sort((a, b) => {
          const aCategory =
            (a && a.category && a.category.toLocaleLowerCase()) || ''
          const bCategory =
            (b && b.category && b.category.toLocaleLowerCase()) || ''

          return aCategory.localeCompare(bCategory)
        })

      state.checklistRecords = checklistRecords
    },

    [Mutations.singleSelectChecklist](state, documentType: string) {
      state.checklistRecords.forEach((r) => (r.select = false))

      const index = state.checklistRecords.findIndex(
        (r) => r.category === documentType
      )
      if (index >= 0) {
        state.checklistRecords[index].select = true
      }
    },

    [Mutations.updateChecklist](state, record: Record) {
      const findByDocumentType = (d: Record) =>
        d.category && record.category && d.category === record.category
      const index = state.checklistRecords.findIndex(findByDocumentType)
      if (index === -1) return

      const doc = localizeDoc(record, state.checklistRecords)
      const checklistDoc = {
        ...doc,
        select: true
      }

      Vue.set(state.checklistRecords, index, checklistDoc)
    }
  },

  actions: {
    // Fetch documents index list
    async [Actions.fetch]({ commit, dispatch }) {
      const url = routesApi.documents.index()
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn

      commit(Mutations.set, res)
      commit(Mutations.sort, res)

      // fix welcome screen flashing fix during login
      const isHide = res.length > 1
      const act = isHide ? AuthS.extHideWelcome : ActionsS.extSelectedRefresh
      dispatch(act, res, RTX)

      return Promise.resolve(res)
    },

    async [Actions.fetchDocument]({ commit, dispatch }, docId) {
      const url = routesApi.documents.details(docId)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn

      commit(Mutations.setSelectedRecord, res)
      return Promise.resolve(res)
    },

    async [Actions.createFolder]({ state, commit, dispatch }, name) {
      const url = routesApi.folders.create()
      const parent = state.currentPath === '/' ? '/' : state.currentPath + '/'
      const data = { path: parent + name }

      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn

      const docs = [...state.records, res]
      commit(Mutations.set, docs)
      commit(Mutations.sort, docs)

      return Promise.resolve(res)
    },

    async [Actions.deleteFolder]({ state, commit, dispatch }, folder) {
      //* Send request, wait for result
      const url = routesApi.folders.delete()
      const data = { path: folder.path }
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn

      //* After success
      const docs = [...state.records]
      const index = docs.findIndex((d: Document) => d.id === folder.id)
      if (index < 0) return
      docs.splice(index, 1)
      commit(Mutations.set, docs)

      return Promise.resolve(res)
    },

    async [Actions.fetchDocumentHistory](
      { commit, dispatch },
      doc: Docs.Record
    ) {
      if (!doc) return

      const url = routesApi.documents.history(doc.id)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn

      //* Successful response, Process history items
      res.forEach((item: Docs.History) => {
        if (item.action !== 'action_created') return

        // fix for when a new version is uploaded,
        // a new action_created is created without meta
        if (!item.meta) return
        const meta = JSON.parse(item.meta)
        const actions = doc.actions || []
        const isMatch = (a: Forms.Record) => a.dateCreated === meta.dateCreated
        item.actionObj = actions.find(isMatch)
      })

      commit(Mutations.setDocumentHistory, res) // * Save document history to state

      return Promise.resolve(res)
    },

    [Actions.updateSearchPage]({ commit }, page = '') {
      if (SEARCHABLE_PAGES.includes(page)) {
        commit(Mutations.updateSearchPage, page)
        commit(Mutations.updateSearchQuery) // Clear search query
      }
      return Promise.resolve()
    },

    [Actions.updateSearchQuery]({ commit }, query = '') {
      commit(Mutations.updateSearchQuery, query)
      return Promise.resolve()
    },

    // Document has been uploaded - add to the list
    [Actions.addRecord]({ state, commit }, doc) {
      commit(Mutations.set, [...state.records, doc])
      return Promise.resolve()
    },

    async [Actions.create]({ commit, dispatch }, data) {
      const url = routesApi.documents.create()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Actions.addRecord, res)
      return Promise.resolve(res)
    },

    // Update given record, and local data state
    async [Actions.update]({ commit, dispatch }, data) {
      const url = routesApi.documents.update(data.id)
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn

      commit(Mutations.update, res)
      if (res.path === CHECKLIST_PATH) {
        commit(Mutations.updateChecklist, res)
      }

      return Promise.resolve(res)
    },

    // Update given record, and local data state
    async [Actions.archive]({ dispatch }, { archived, documents }) {
      const url = routesApi.documents.updateArchived()
      const data = { archived, documents }
      const [err] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      return dispatch(Actions.fetch)
    },

    async [Actions.renameFolder](
      { state, commit, dispatch },
      data: Docs.MoveDocsP
    ) {
      commit(Mutations.updatePath, data) // Update documents
      const url = routesApi.folders.rename()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.set, state.records) // re-processing of files, to update folder stats
      return Promise.resolve(res)
    },

    async [Actions.moveDocs](
      { state, dispatch },
      { pathAfter, documents }: Docs.MoveDocsP
    ) {
      const pathBefore = state.currentPath

      //* Send request and wait for response
      const url = routesApi.folders.move()
      const data = { pathBefore, pathAfter, documents }
      const [err] = await sendReq(dispatch, { url, data })

      const fetchDocs = dispatch(Actions.fetch) // Update docs, since refreshing path in advance

      if (err) return Promise.reject(err) //? Exn: request error
      return fetchDocs //* Return promise - fetch dispatch
    },

    // Download zip file
    async [Actions.download]({ dispatch }, docs) {
      const url = routesApi.documents.downloadZip()
      const data = { documents: docs.map((d: Document) => d.id) }
      const options = {
        responseType: 'arraybuffer',
        headers: { 'Content-Type': 'application/json' }
      }

      const [err, res] = await sendReq(dispatch, { url, data, options })
      if (err) return Promise.reject(err) //? Exn

      const blob = new Blob([res], { type: 'application/octet-stream' })
      saveAs(blob, 'download.zip')

      return Promise.resolve(res)
    },

    // add recipient to given record
    [Actions.createActionRequest]({ commit, dispatch, state }, payload) {
      return new Promise((resolve, reject) => {
        const docId = payload.document?.id
        const url = routesApi.documents.formSend()
        const requests: any = []

        // * For each user, send separate request
        payload.users.forEach((user: UserDirectory.Record) => {
          const data = {
            docId,
            message: payload.message,
            isVerify: payload.isVerify,
            templateId: payload.template.id || null,
            inputs: payload.template.inputs,
            userId: user.id
          }
          const onSuccess = (forms: Forms.Record[]) => {
            // * Update related doc
            const findById = (d: Docs.Record) => d.id === docId
            const findByFormType = (f: Forms.Record) =>
              f.type === FormTypes.form || f.type === FormTypes.verification
            const verificationForms = forms.filter(
              (f) => f.type === FormTypes.verification
            )
            const allForms = forms.filter(findByFormType)
            const sharing: any = forms.find((f) => !findByFormType(f))
            const { recipients = [] } = sharing || {}

            const index = state.records.findIndex(findById)
            if (index > -1) {
              const doc = state.records[index]
              doc.actions?.push(...verificationForms)
              doc.recipients = [...recipients]
              commit(Mutations.update, doc)
            }

            const checklistIndex = state.checklistRecords.findIndex(findById)
            if (checklistIndex > -1) {
              const checklistDoc = state.checklistRecords[checklistIndex]
              checklistDoc.actions?.push(...verificationForms)
              checklistDoc.recipients = [...recipients]
              commit(Mutations.updateChecklist, checklistDoc)
            }

            dispatch(FormsS.extAddRecords, allForms, RTX)

            // * Update forms list - push
          }
          const reqPayload = { url, data, onSuccess }
          const req = sendReqProm(dispatch, reqPayload)
          requests.push(req)
        })

        // * After all users have been handled, refresh history
        Promise.all(requests)
          .then(resolve)
          .catch(reject)
        // // if formname is not present, means doc is set, else create and then send
        //   if (!payload.formName) {
        // } else {
        //   const docPayload = {
        //     name: payload.formName,
        //     path: '/'
        //   }
        //   dispatch(Actions.create, docPayload).then((doc) => {
        //     sendForms(doc.id)
        //   })
        // }
      })
    },

    // TODO: should be in formsStore
    async [Actions.updateActionRequest](
      { dispatch },
      { id, status, answers, ...rest }
    ) {
      const url = routesApi.forms.updateAction(id)
      const data = { status, answers, ...rest }

      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn

      dispatch(FormsS.extUpdate, res, RTX) // Update form
      return Promise.resolve(res)
    },

    // Reset module state
    [Actions.reset]({ commit }) {
      commit(Mutations.reset)
      return Promise.resolve()
    },

    [Actions.sort]({ state, commit }, { field, order }) {
      if (field === '') {
        field = state.sort.default.field
        order = state.sort.default.order
      }

      const dupe = state.sort.field === field && state.sort.order === order
      if (state.records.length === 0 || dupe) return

      commit(Mutations.sort, { field, order })

      return Promise.resolve()
    },

    [Actions.setCurrentPath]({ commit, rootGetters, state, dispatch }, path) {
      const isAppInit = !rootGetters[RootG.isLoading]

      const isSamePath =
        state.currentPath === path &&
        router.currentRoute.name === Routes.documents.name

      if (!isAppInit || !path || isSamePath) return

      const folder = state.records.find(
        (d: Docs.Record) =>
          d.isFolder && d.path.toLowerCase() === path.toLowerCase()
      )

      if (!folder && path !== ROOT_PATH) {
        dispatch(RootA.showSnackbar, Msg.noFolder, RTX)
        return Promise.reject()
      }

      // redirect, if query is not already set
      commit(Mutations.setCurrentPath, path)
      const current = router.currentRoute

      const isPathUpdated =
        current.name !== Routes.documents.name ||
        current.query.path !== state.currentPath

      if (isPathUpdated) {
        router.push({
          name: Routes.documents.name,
          query: { path: state.currentPath }
        })
      }

      return Promise.resolve()
    },

    [Actions.setFolder]({ commit }, path = '/') {
      commit(Mutations.setCurrentPath, path)
    },

    [Actions.resetRecords]({ state, commit }) {
      commit(Mutations.set, state.records)
    },

    [Actions.rename]({ dispatch }, { name, edit }) {
      // *** Handle case for renaming files separately - update file
      if (!edit.isFolder) {
        const filePayload = { id: edit.id, name }
        return dispatch(Actions.update, filePayload)
      }

      // *** Renaming folder
      const pathBefore = edit.path
      let pathAfter = '/' + name
      const countSlash = pathBefore.split('/').length - 1
      if (countSlash > 1) {
        const folderIndex = pathBefore.lastIndexOf('/')

        // Format names and parent - deconstruct out of path` field
        if (folderIndex > -1) {
          pathAfter = pathBefore.substring(0, folderIndex + 1) + name
        }
      }

      const folderPayload = {
        documents: [edit.id],
        pathBefore,
        pathAfter
      }

      return dispatch(Actions.renameFolder, folderPayload)
    },

    async [Actions.fetchDocVersionHistory]({ commit, dispatch, rootGetters }) {
      const selectedRecords = rootGetters[ActionsS.extRecords]
      if (selectedRecords.length === 0) return

      const docId = selectedRecords[0].id
      const url = routesApi.documents.fetchVersionHistory(docId)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn

      commit(Mutations.documentVersionHistory, res)

      return Promise.resolve(res)
    },

    async [Actions.uploadNewVersion]({ commit, dispatch }, { file, accessId }) {
      const url = routesApi.documents.uploadNewVersion(accessId)
      const data = new FormData()
      data.append('file', file)
      const options = {
        headers: { 'Content-Type': 'multipart/form-data' }
      }

      const [err, res] = await sendReq(dispatch, { url, data, options })
      if (err) return Promise.reject(err) //? Exn

      commit(Mutations.update, res)
      commit(Mutations.setSelectedRecord, res)

      //? Timeout is necessary due to resetting selected in DocsTable
      setTimeout(() => {
        dispatch(ActionsS.extSelectedSet, [res], RTX)
      }, 250)

      await dispatch(Actions.fetchDocVersionHistory)
      return Promise.resolve(res)
    },

    async [Actions.fetchChecklist]({ commit, dispatch }) {
      const url = routesApi.documents.checklist()

      dispatch(RootA.updateLoading, true, RTX)
      const [err, res] = await sendReq(dispatch, { url })
      dispatch(RootA.updateLoading, false, RTX)

      if (err) return Promise.reject(err) //? Exn

      commit(Mutations.setChecklist, res)
      return Promise.resolve(res)
    },

    [Actions.singleSelectChecklist]({ commit }, documentType: string) {
      commit(Mutations.singleSelectChecklist, documentType)
      return Promise.resolve()
    },

    [Actions.updateChecklist]({ commit }, doc: Record) {
      commit(Mutations.updateChecklist, {
        ...doc,
        documentUploaded: true,
        verified: false
      })
      commit(Mutations.addRecord, doc)
      return Promise.resolve()
    }
  }
}
