import 'babel-polyfill'
import Vue from 'vue'
import VueHeadful from 'vue-headful'
import '@/plugins/vuetify'
import App from './App.vue'
import router, { Routes } from './router'
import './registerServiceWorker'
import { RootA, AuthS, DocsS, SpacesS } from '@/types/'
import store from './store/store'
import { RTX } from '@/utils/helpers'
import vuetify from '@/plugins/vuetify' // path to vuetify export
import DefaultLayout from '@/views/layouts/DefaultLayout.vue'
import FullscreenLayout from '@/views/layouts/FullscreenLayout.vue'
import PlainLayout from '@/views/layouts/PlainLayout.vue'
import moment from 'moment'
import filesize from 'filesize'
import { i18n, computeTranslations, Msg, MsgT } from '@/plugins/i18n'

import { VueReCaptcha } from 'vue-recaptcha-v3'
import { config } from './utils/config'
import { finderById } from './utils/helpers'
import stx from './types/stx'
import infiniteScroll from 'vue-infinite-scroll'
import { CreateElement } from 'vue/types/umd'

//* Quill editor import
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// * === === === === === === === === === ===
//* Quill

import Quill from 'quill'
import ImageResize from 'quill-image-resize-module'

import '@/assets/style.scss'

import { ValidationProvider, ValidationObserver } from 'vee-validate'
import { initValidation } from './utils/validation'

// TODO: fun stuff, just outputs logo
console.log(
  '%c ',
  "font-size:50px ;padding:28px 119px;line-height:10px;background:url('http://localhost:8080/img/Diginex.png') 0px 0px / 90px 50px no-repeat;"
)

//* Allow display of image element properties
const BaseImageFormat = Quill.import('formats/image')
const ImageFormatAttributesList = ['alt', 'height', 'width', 'style']

class ImageFormat extends BaseImageFormat {
  static formats(domNode: any) {
    return ImageFormatAttributesList.reduce(function(formats, attribute) {
      if (domNode.hasAttribute(attribute)) {
        ;(formats as any)[attribute] = domNode.getAttribute(attribute)
      }
      return formats
    }, {})
  }
  format(name: any, value: any) {
    if (ImageFormatAttributesList.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value)
      } else {
        this.domNode.removeAttribute(name)
      }
    } else {
      super.format(name, value)
    }
  }
}

Quill.register(ImageFormat, true)

//* Hook up image  resize module
Quill.register('modules/ImageResize', ImageResize)

//* Apply quill editor
Vue.use(VueQuillEditor)

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Constructor

// * List of all messages (translation/snacks)
Vue.prototype.$msg = { ...Msg }

// * Map of translation codes to translated message
Vue.prototype.$text = computeTranslations()

Vue.prototype.$showSnack = (type: Msg, data?: string | number) => {
  const msg = { type, data }
  store.dispatch(RootA.showSnackbar, msg, RTX)
}

if (config.isRecaptcha) {
  // For more options see below
  Vue.use(VueReCaptcha, {
    siteKey: config.recaptchaKey,
    loaderOptions: {
      useRecaptchaNet: true,
      autoHideBadge: true
    }
  })
}

Vue.component('vue-headful', VueHeadful)

// Init layouts
Vue.component('PlainLayout', PlainLayout)
Vue.component('FullscreenLayout', FullscreenLayout)
Vue.component('DefaultLayout', DefaultLayout)

Vue.config.productionTip = false

let loaderDispatch: () => void
let isInitial = true

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Main

//* After route is changed - triggers loader animation on top of the page
router.beforeEach((to, from, next) => {
  if (loaderDispatch) {
    loaderDispatch()
  }

  const updateSearch = DocsS.extUpdateSearchPage
  store.dispatch(updateSearch, to.name)

  // const isAuthRequired = to.meta.auth //* Wrong, parent route metas are not propagating to children
  const isAuthRequired = to.matched.some((route) => route.meta.auth)
  if (!isAuthRequired) return next() //* Exn: unauthed pages do not require space handling

  // * Spaces - query handling

  //*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Constructor

  const spaceSelected = store.getters[SpacesS.extGetSelected] //* Currently selected space
  const query = { ...to.query, spaceId: '' } //* Pull query from route
  const params = to.params //* Pull params from route
  const SpacePersonal = stx.SpaceAliasPersonal // * Slug for personal space

  //* Find in store space specified in url
  const spaceIdUrl = String(to.query.spaceId || '')
  const findById = finderById(spaceIdUrl)
  const spaceUrl = store.getters[SpacesS.extGetRecords].find(findById)

  //*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Main

  if (isInitial) {
    isInitial = false
    if (spaceIdUrl) return next() // TODO: explain
  }

  if (!spaceSelected) {
    if (spaceIdUrl === SpacePersonal) return next() //* Exn: url space is default - personal space

    let name = to.name

    //* Exn: if root - redirect to documents
    if (to.name === Routes.root.name) {
      name = Routes.documents.name
    }

    query.spaceId = SpacePersonal
    return next({ name, query, params })
  }

  //* Exn: Means space is not set in url - set
  if (!spaceIdUrl) {
    query.spaceId = spaceSelected.id
    return next({ name: to.name, query, params })
  }

  //* Space id in url is different from selected space's id - update (or default to personal)
  //* Will trigger route update
  if (spaceIdUrl !== spaceSelected.id) {
    store.dispatch(SpacesS.extSetSelected, spaceUrl || spaceSelected, RTX)
  }

  return next()
})

router.afterEach((to, from) => {
  // Verify if folder for path exists, if it does, goto folder (only if docs page)
  const path = to.query.path
  if (path && from.name && to.name === Routes.documents.name) {
    const updatePath = DocsS.extSetCurrentPath
    store.dispatch(updatePath, path)
  }
})

// INFINITE SCROLLER - register globally (used require cos no declaration file?)
// tslint:disable no-var-requires
Vue.use(infiniteScroll)

function updateMomentLocale() {
  const lang = store.getters[AuthS.extGetLang]
  if (moment.locale() !== lang) {
    moment.locale(lang)
  }
}

Vue.filter('formatDate', (value: string) => {
  if (!value) return '' //? Exn
  const format = 'HH:mm DD/MM/YYYY'
  updateMomentLocale()
  return moment(value).format(format)
})

Vue.filter('formatDateSmall', (value: string) => {
  const format = 'DD MMM'
  updateMomentLocale()
  return moment(value).format(format)
})

// Returns string - 2 capitalized letters of user name and surname
Vue.filter('getShortName', (user: Connections.Record) => {
  if (!user) return '' //? Exn

  if (user.name && user.surname) {
    return (
      user.name.substring(0, 1).toUpperCase() +
      user.surname.substring(0, 1).toUpperCase()
    )
  } else {
    return user.email.substring(0, 2).toUpperCase()
  }
})

Vue.filter('formatDateSimple', (value: string) => {
  if (!value) return '' //? Exn
  const format = 'DD/MM/YYYY'
  updateMomentLocale()
  return moment(value).format(format)
})

Vue.filter('formatDateSimpleInv', (value: string) => {
  if (!value) return '' //? Exn
  const format = 'YYYY-MM-DD'
  updateMomentLocale()
  return moment(value).format(format)
})

Vue.filter('formatDocName', (item?: Docs.Record, trimSize?: number) => {
  if (!item) return '' //? Exn
  const filename = item.name + (item.extension ? `.${item.extension}` : '')
  return !!trimSize && trimSize > 0 && filename.length > trimSize
    ? `${filename.substring(0, trimSize)}...`
    : filename
})

Vue.filter('filesize', (size: number) => {
  return filesize(size, { round: 1 })
})

Vue.filter('formatAgo', (value: string) => {
  updateMomentLocale()
  return moment(value).fromNow()
})

//* Validation provider
Vue.component('ValidationProvider', ValidationProvider)
Vue.component('ValidationObserver', ValidationObserver)
initValidation() //* Custom messages

new Vue({
  i18n,
  vuetify,
  router,
  store,
  render: (h: CreateElement) => h(App),
  created() {
    const dispatch = this.$store.dispatch

    // Upon initial load - reset "isLogged" flag at authStore
    dispatch(AuthS.extUpdateIsLogged)

    // Initially, app should contain spinner
    dispatch(RootA.updateLoading, true, RTX)
    const stopLoading = () => dispatch(RootA.updateLoading, false, RTX)
    setTimeout(stopLoading, 300)

    // ? Note: instance props are non-reactive
    // ** Fetch user's language
    const lang = this.$store.getters[AuthS.extGetLang]

    // ** Apply localization
    this.$i18n.locale = lang

    // * Map of translation codes to translated message
    Vue.prototype.$text = computeTranslations()
    Vue.prototype.$txt = { ...MsgT } // Translations - version 2

    //** Translations VERSION 2, accepts variables (now returns function instead of string)
    Object.keys(MsgT).forEach((key: string) => {
      if (key in MsgT) {
        const keyWithVars = (Msg as any)[key] // Translate key from enum to code
        this.$txt[key as MsgT] = (v: any = {}) => i18n.t(keyWithVars, v)
      }
    })
    // Usage sample:
    // this.$txt.Welcome({ name: 'John' })
  },
  mounted() {
    loaderDispatch = () => {
      this.$store.dispatch(RootA.doPageLoader, null, RTX) // trigger page loader
    }

    console.log('Hello world:', i18n.t(Msg.HelloWorld, { name: 'john' }))
    console.log('Hello world:', this.$txt.HelloWorld({ name: 'john' }))
  }
}).$mount('#app')
