/* Readme

##

### //! Route - meta

Important, parent's meta auth is not propagating:
in children instead of 

`meta: { auth: true }`
use
`const isAuthRequired = to.matched.some((route) => route.meta.auth)`


*/

import TheTemplateResults from '@/components/TheTemplateResults.vue'
import _ from 'lodash'
import Vue from 'vue'
import Router, { RouteConfig } from 'vue-router'
import DocsHistoryPdf from './components/DocsHistoryPdf.vue'
import TheCaseFeed from './components/TheCaseFeed.vue'
import TheDocHistory from './components/TheDocHistory.vue'
import TheDocInfo from './components/TheDocInfo.vue'
import TheDocTemplates from './components/TheDocTemplates.vue'
import TheDocUsers from './components/TheDocUsers.vue'
import { config } from './utils/config'
import TheCase from './views/TheCase.vue'
import TheCases from './views/TheCases.vue'
import TheChecklistPage from './views/TheChecklistPage.vue'
import TheConnections from './views/TheConnections.vue'
import TheDoc from './views/TheDoc.vue'
// Import pages
import TheDocsPage from './views/TheDocsPage.vue'
import TheDownloadPage from './views/TheDownloadPage.vue'
import TheForms from './views/TheForms.vue'
import TheLandingPage from './views/TheLandingPage.vue'
import TheSpace from './views/TheSpace.vue'
import TheSpaceDocumentTypes from './views/TheSpaceDocumentTypes.vue'
import TheSpaceManagers from './views/TheSpaceManagers.vue'
import TheSpaces from './views/TheSpaces.vue'
import TheSpacesAdmin from './views/TheSpacesAdmin.vue'
import TheSpaceSettings from './views/TheSpaceSettings.vue'
import TheSpaceSettingsAdmin from './views/TheSpaceSettingsAdmin.vue'
import TheTemplate from './views/TheTemplate.vue'
import TheTemplates from './views/TheTemplates.vue'
import TheUserDirectoryPage from './views/TheUserDirectoryPage.vue'
import TheWidgets from './views/TheWidgets.vue'
import TheArticles from './views/TheArticles.vue'
import TheArticlesRead from './components/TheArticlesRead.vue'
import TheArticlesIndex from './components/TheArticlesIndex.vue'
import TheArticlesEdit from './components/TheArticlesEdit.vue'
import TheArticlesTopics from './components/TheArticlesTopics.vue'
import TheArticlesImprovements from './components/TheArticlesImprovements.vue'
import TheLoginV8 from './views/TheLoginV8.vue'
import TheCasesIndex from './components/TheCasesIndex.vue'
import TheCaseTypes from './components/TheCaseTypes.vue'
import FormParserSample from './components/FormParserSample.vue'

// * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀

Vue.use(Router)

// This scheme of Routes is used to exposes the routes, to leverage typing and autosuggest
export const Routes = {
  root: {
    path: '/',
    name: 'landing',
    component: TheLandingPage,
    meta: { layout: 'plain', noauth: true, disallowAuthed: true }
  },
  resetPassword: {
    path: '/reset-password',
    component: TheLandingPage,
    meta: { layout: 'plain', noauth: true, resetPassword: true }
  },
  overview: {
    path: '/overview',
    name: 'overview',
    component: TheWidgets,
    meta: { auth: true }
  },
  documents: {
    path: '/documents',
    name: 'documents',
    component: TheDocsPage,
    meta: { auth: true, isDocsPage: true }
  },
  templates: {
    path: '/templates',
    name: 'templates',
    component: TheTemplates,
    meta: { auth: true }
  },
  template: {
    path: '/templates/:templateId',
    component: TheTemplate,
    meta: { auth: true },
    redirect: { name: 'templateResults' },
    children: {
      results: {
        path: 'results',
        name: 'templateResults',
        component: TheTemplateResults
      }
    }
  },
  doc: {
    path: '/documents/:documentId',
    component: TheDoc,
    meta: { auth: true },
    redirect: { name: 'docInfo' },
    children: {
      docInfo: {
        path: 'info',
        name: 'docInfo',
        component: TheDocInfo
      },
      docHistory: {
        path: 'history',
        name: 'docHistory',
        component: TheDocHistory
      },
      docUsers: {
        path: 'users',
        name: 'docUsers',
        component: TheDocUsers
      },
      docTemplates: {
        path: 'templates',
        name: 'docTemplates',
        component: TheDocTemplates
      }
    }
  },
  forms: {
    path: '/forms',
    name: 'forms',
    component: TheForms,
    meta: { auth: true }
  },

  cases: {
    path: '/cases',
    name: 'cases',
    component: TheCases,
    meta: { auth: true },
    redirect: { name: 'casesIndex' },
    children: {
      casesIndex: {
        path: 'index',
        name: 'casesIndex',
        component: TheCasesIndex
      },
      caseTypes: {
        path: 'types',
        name: 'caseTypes',
        component: TheCaseTypes
      }
    }
  },
  case: {
    path: '/cases/:caseId',
    component: TheCase,
    meta: { auth: true },
    redirect: { name: 'caseFeed' },
    children: {
      caseFeed: {
        path: 'feed',
        name: 'caseFeed',
        component: TheCaseFeed
      }
    }
  },

  connections: {
    path: '/connections',
    name: 'connections',
    component: TheConnections,
    meta: { auth: true }
  },
  userDirectory: {
    path: '/userdirectory',
    name: 'userDirectory',
    component: TheUserDirectoryPage,
    meta: { auth: true }
  },

  archive: {
    path: '/archived',
    name: 'archived',
    component: TheDocsPage,
    meta: { auth: true, isArchivedPage: true }
  },
  shared: {
    path: '/shared',
    name: 'shared',
    component: TheDocsPage,
    meta: { auth: true, isActionsPage: true }
  },
  actions: {
    path: '/actions',
    name: 'actions',
    component: TheDocsPage,
    meta: { auth: true, isActionsPage: true }
  },
  history: {
    path: '/history',
    name: 'history',
    component: DocsHistoryPdf,
    meta: { layout: 'fullscreen', auth: true }
  },
  download: {
    path: '/download/:shareId',
    name: 'download',
    component: TheDownloadPage,
    meta: { layout: 'fullscreen', noauth: true }
  },
  microsoftSignin: {
    // is currently NOT in use as azure account is configured to use /signin as redirect
    path: '/microsoft-signin',
    name: 'microsoft-signin',
    meta: { disallowAuthed: true }

    // redirect: (to: Route) => {
    //   window.location.href = config.azure.authUrl
    //   return '/redirecting'
    // },
    // meta: { layout: 'plain', noauth: true }
  },
  facebookSignin: {
    path: '/facebook-signin',
    name: 'facebook-signin',
    meta: { disallowAuthed: true }
  },
  signin: {
    path: '/signin',
    name: 'signin',
    meta: { disallowAuthed: true }
  },
  search: {
    path: '/search',
    name: 'search',
    component: TheDocsPage,
    props: { isSearch: true },
    meta: { auth: true }
  },
  spaces: {
    path: '/spaces',
    name: 'spaces',
    component: TheSpaces,
    meta: { auth: true }
  },
  space: {
    path: '/spaces/:spaceId',
    component: TheSpace,
    meta: { auth: true },
    redirect: { name: 'spaceSettings' },
    children: {
      spaceSettings: {
        path: 'settings',
        name: 'spaceSettings',
        component: TheSpaceSettings
      },
      spaceDocumentTypes: {
        path: 'document-types',
        name: 'spaceDocumentTypes',
        component: TheSpaceDocumentTypes
      },
      spaceManagers: {
        path: 'managers',
        name: 'spaceManagers',
        component: TheSpaceManagers
      }
    }
  },

  spaceSettingsAdmin: {
    path: '/spaces-admin/:spaceId/settings-admin',
    name: 'spaceSettingsAdmin',
    component: TheSpaceSettingsAdmin
  },
  spacesAdmin: {
    path: '/spaces-admin',
    name: 'spacesAdmin',
    component: TheSpacesAdmin,
    beforeEnter: (to: never, prev: never, next: () => {}) => {
      // TODO: delegate route-space allowance to this hook
      // console.log(' > isAdminGlobal:')

      return next()
    }
  },
  checklist: {
    path: '/checklist',
    name: 'checklist',
    component: TheChecklistPage,
    props: { isSearch: true, currentPath: '/Checklist' },
    meta: { auth: true, isChecklistPage: true }
  },
  articles: {
    path: '/support',
    name: 'support',
    meta: { auth: true },
    component: TheArticles,
    redirect: { name: 'articlesIndex' },
    children: {
      articlesIndex: {
        path: 'index',
        name: 'articlesIndex',
        component: TheArticlesIndex
      },
      articlesCreate: {
        path: 'create',
        name: 'articlesCreate',
        component: TheArticlesEdit
      },
      articlesTopics: {
        path: 'topics',
        name: 'articlesTopics',
        component: TheArticlesTopics
      },
      articlesEdit: {
        path: ':articleId/edit',
        name: 'articlesEdit',
        component: TheArticlesEdit
      },
      articlesImprovements: {
        path: 'improvements',
        name: 'articlesImprovements',
        component: TheArticlesImprovements
      },
      articlesRead: {
        path: ':articleId',
        name: 'articlesRead',
        component: TheArticlesRead
      }
    }
  },
  loginExternal: {
    path: '/auth',
    name: 'loginExternal',
    component: TheLoginV8,
    meta: { layout: 'fullscreen', noauth: true }
  },
  sample: {
    path: '/sample',
    name: 'sample',
    component: FormParserSample,
    meta: { layout: 'plain', noauth: true }
  },
  redirect: { path: '*', redirect: '/' }
}

const normalizeChildren = (r: Types.RoutesItem): RouteConfig => {
  if (!r.children) return r
  return { ...r, children: _.values(r.children) }
}

// Convert routes obj into an array of routes, compatible with VueRouter
const routes = _.values(Routes).map(normalizeChildren)

const mode: 'history' = 'history'
const routerOptions = {
  mode,
  base: process.env.BASE_URL,
  scrollBehavior() {
    return { x: 0, y: 0 } // resetting scroll after route change
  },
  routes
}

// * === === === === === === === === === ===
// * Backend

// * Method Helper
export const PathMethod = {
  get: 'get',
  put: 'put',
  post: 'post',
  delete: 'delete'
}

// * Helpers to compose route paths
const makeRoute = (method: string, pathPart: string) => {
  const path = `${config.backendUrl}/${pathPart}`
  return { method, path }
}

const goGet = (path: string) => makeRoute(PathMethod.get, path)
const goPost = (path: string) => makeRoute(PathMethod.post, path)
const goPut = (path: string) => makeRoute(PathMethod.put, path)
const goDelete = (path: string) => makeRoute(PathMethod.delete, path)

const backendUrl = config.backendUrl
export const routesApi = {
  documents: {
    index: () => goGet(`documents`),
    create: () => goPost(`documents/empty`),
    update: (id: string) => goPut(`documents/${id}`),
    details: (id: string) => goGet(`documents/${id}`),
    formSend: () => goPost(`forms`),

    history: (id: string) => goGet(`history/${id}`),
    updateArchived: () => goPut(`documents/update-archived`),
    overview: () => goGet(`user/overview`),
    fetchVersionHistory: (id: string) => goGet(`documents/${id}/versions`),

    uploadNewVersion: (id: string) => goPost(`documents/${id}`),
    downloadZip: () => goPost(`documents/download-zip`),

    // ? Exception - not handled through axios
    uploadDocument: (path: string, space: string) =>
      `${backendUrl}/documents?path=${encodeURI(path)}&spaceId=${encodeURI(
        space
      )}`,

    // ? Exception - diff domain, since azure route
    download: (code: string, id: string) =>
      `${config.downloadDomain}/d/${code}/${id}`,
    checklist: () => goGet(`checklist`),
    uploadChecklist: (path: string, space: string, documentType: string) =>
      `${backendUrl}/checklist/${documentType}?path=${encodeURI(
        path
      )}&spaceId=${encodeURI(space)}`
  },

  folders: {
    create: () => goPost(`folders/create`),
    delete: () => goPost(`folders/delete`),
    move: () => goPut(`folders/move`), // TODO: method type verify
    rename: () => goPut(`folders/rename`) // TODO: method type verify
  },
  cases: {
    index: () => goGet(`cases`),
    create: () => goPost(`cases`),
    update: (id: string) => goPut(`cases/${id}`),
    fileUpload: (id: string) => goPost(`cases/${id}/document`),

    commentCreate: (id: string) => goPost(`cases/${id}/comments`),
    commentUpdate: (id: string) => goPut(`cases/comments/${id}`),
    commentDelete: (id: string) => goDelete(`cases/comments/${id}`),
    usersAdd: (id: string) => goPost(`cases/${id}/users`),

    fetchCaseTypes: () => goGet('cases/types'),
    fileUploads: (id: string) => goPost(`cases/${id}/documents`),
    createCaseTypes: () => goPost('cases/types'),
    deleteCaseTypes: (caseTypeId: string) => goDelete(`cases/types/${caseTypeId}`)
  },
  templates: {
    index: () => goGet(`templates`),
    create: () => goPost(`templates`),
    update: (id: string) => goPut(`templates/${id}`),
    delete: (id: string) => goDelete(`templates/${id}`)
  },
  forms: {
    index: () => goGet(`forms`),
    fetchHistory: (id: string) => goGet(`forms/${id}/history`),
    updateAction: (id: string) => goPut(`forms/${id}`)
  },
  userDirectory: {
    create: () => goPost(`users`),
    reinvite: (id: string) => goPost(`users/${id}/reinvite`),
    delete: (id: string) => goDelete(`users/${id}`),
    fetchManager: (spaceId: string) => goGet(`users/${spaceId}/list`),
    addManager: (spaceId: string) => goPut(`users/${spaceId}/manager`),
    deleteManager: (id: string) => goPut(`users/manager/${id}`)
  },
  notifications: {
    index: () => goGet(`notifications`),
    markRead: (id: string) => goPut(`notifications/${id}/markRead`)
  },
  settings: {
    index: () => goGet(`settings`),
    create: () => goPost(`settings`),
    update: (id: string) => goPut(`settings/${id}`),
    delete: (id: string) => goDelete(`settings/${id}`)
  },
  users: {
    index: () => goGet(`users/list`),
    updateRole: () => goPut(`users/profile-type`),
    updateUserType: () => goPut(`users/user-type`),
    updateBrand: () => goPut(`users/brand`)
  },

  widgets: {
    index: () => goGet(`widgets`),
    create: () => goPost(`widgets`),
    update: (id: string) => goPut(`widgets/${id}`),
    delete: (id: string) => goDelete(`widgets/${id}`)
  },

  // Authed user
  user: {
    info: () => goGet(`user/info`),
    update: () => goPut(`user/update`),
    login: () => goPost(`login`), // requires code in payload

    register: () => goPost(`signup`),
    signin: () => goPost(`signin`),
    forgotPassword: () => goPost(`user/reset`),
    changePassword: () => goPut(`user/change-password`),
    resetPassword: (token: string) => goPost(`user/reset?token=${token}`),
    isRegistered: (email: string) => goGet(`user/is-registered?email=${email}`),
    loginV8: () => goPost(`auth`)
  },
  spaces: {
    index: () => goGet(`spaces`),
    create: () => goPost(`spaces`),
    update: (id: string) => goPut(`spaces/${id}`),
    delete: (id: string) => goDelete(`spaces/${id}`),
    leave: (id: string) => goPost(`spaces/${id}/leave`),
    updateSettingsAdmin: (id: string) => goPut(`spaces/${id}/settings-admin`),
    indexAdmin: () => goGet(`spaces/admin`),
    fetch: (id: string) => goGet(`spaces/${id}`),

    fetchRegisteredUsers: (spaceId: string) => goGet(`spaces/${spaceId}/users`),
    fetchManagers: (spaceId: string) => goGet(`spaces/${spaceId}/managers`),
    fetchSelectedSpaceManagers: () => goGet(`spaces/managers/selected`),
    addManager: (spaceId: string, managerId: string) =>
      goPost(`spaces/${spaceId}/manager/${managerId}`),
    deleteManager: (spaceId: string, managerId: string) =>
      goDelete(`spaces/${spaceId}/manager/${managerId}`)
  },
  connections: {
    index: () => goGet(`connections`),
    create: () => goPost(`connections`),
    delete: (id: string) => goDelete(`connections/${id}`)
  },
  documenttypes: {
    index: (spaceId: string) => goGet(`checklist/document-type/${spaceId}`),
    create: (spaceId: string) => goPost(`checklist/document-type/${spaceId}`),
    delete: (spaceId: string, id: string) =>
      goDelete(`checklist/document-type/${spaceId}/${id}`)
  },
  articles: {
    topics: () => goGet(`supports/topics`),
    index: (q: string) => goGet(`supports/articles?q=${q}`),
    create: () => goPost(`supports/articles`),
    update: (id: string) => goPut(`supports/articles/${id}`),
    delete: (id: string) => goDelete(`supports/articles/${id}`),
    fetch: (id: string) => goGet(`supports/articles/${id}`),
    fetchFeedback: (id: string) => goGet(`supports/articles/${id}/feedback`),
    createFeedback: (id: string) => goPost(`supports/articles/${id}/feedback`),
    countView: (id: string) => goPost(`supports/articles/${id}/views`)
  },

  improvements: {
    fetch: () => goGet(`supports/improvements`),
    create: () => goPost(`supports/improvements`),
    update: (id: string) => goPut(`supports/improvements/${id}`),
    delete: (id: string) => goDelete(`supports/improvements/${id}`)
  },

  topics: {
    // fetch: () => goGet(`supports/topics`),
    create: () => goPost(`supports/topics`),
    update: (id: string) => goPut(`supports/topics/${id}`),
    delete: (id: string) => goDelete(`supports/topics/${id}`)
  }
}

const router = new Router(routerOptions)

router.beforeEach((to: any, prev: any, next: () => void) => {
  if (!prev.query.isDirty) return next() //* Exn: no isDirty flag
  if (prev.name === to.name) return next() //* Exn: going to same route

  //* Page has flag "isDirty", confirm with user if they really want to change page
  const answer = window.confirm(
    'Do you really want to leave? You have unsaved changes!'
  )
  if (answer) return next()
})

export default router
