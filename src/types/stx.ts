// === === === === === === === === === ===
// Stx - statics, constants

import { 
  materialIcons,
  materialIconsBusiness
} from '@/utils/material-icons-list'
import { Countries } from './stxCountries'
import { HistoryActions } from './stxHistoryActions'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

const allowedLang: {
  [key: string]: Auth.Lang
} = { en: 'en', hi: 'hi', ur: 'ur', bn: 'bn', th: 'th' }

const recaptchaPages = {
  forgotPassword: 'forgotPassword',
  signin: 'signin',
  register: 'register',
  resetPassword: 'resetPassword'
}

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

export default {
  historyActions: HistoryActions,
  countries: Countries,
  showDashboard: 'SHOW_DASHBOARD',
  settingsLayout: 'LAYOUTS',

  lang: {
    allowed: allowedLang,
    default: allowedLang.en,
    list: [
      allowedLang.en,
      allowedLang.hi,
      allowedLang.ur,
      allowedLang.bn,
      allowedLang.th
    ]
  },
  PathArchived: '/Archived',
  PathShared: '/Shared',
  PathChecklist: '/Checklist',

  env: {
    local: 'local'
  },

  materialIcons,
  materialIconsBusiness,
  SpaceAliasPersonal: 'personal', // * Slug for personal space

  recaptchaPages
}
