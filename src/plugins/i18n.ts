/*
  Languages File

  The recent approach is to write readable name for translation,
  and in one-level structure. (With exception for typed-scoped entities)

  1. If translation is not available, the name of the object will be given,
  one-liner has better readability both in code and console log
  2. Ease of outsource for translation
  3. No duplicates

*/

import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { Msg, translations, MsgT } from '@/plugins/i18n/translations.ts'

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Main

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  // silentTranslationWarn: true,
  messages: translations
})

// Returns translations object (keyed by Msg enum)
export type TranslationsObj = { [key in MsgT]?: string }
Vue.prototype.$text = translations

export const computeTranslations = () => {
  // * Map of translation codes to translated message
  const text: TranslationsObj = { ...Msg }

  Object.keys(Msg).forEach((key: string) => {
    if (key in Msg) {
      text[key as MsgT] = i18n.tc(key)
    }
  })

  return text
}

// * Icons that will be displayed next to snack message (optional)
const SnackIcons: {
  [key in Msg]?: string
} = {
  [Msg.fileRenameSuccess]: 'edit',
  [Msg.folderCreateError]: 'error',
  [Msg.fileRenameError]: 'error',
  [Msg.folderCreateSuccess]: 'edit',
  [Msg.formFillSuccess]: 'edit',
  [Msg.accountUpdateSuccess]: 'edit',
  [Msg.accountUpdateError]: 'error',
  [Msg.documentsMoveSuccess]: 'folder',
  [Msg.docsRestoreSuccess]: 'unarchive',
  [Msg.docsArchiveSuccess]: 'archive',
  [Msg.documentsDownload]: 'vertical_align_bottom',
  [Msg.docExtensionError]: 'error',
  [Msg.docVersionUploadSuccess]: 'edit',
  [Msg.docVersionUploadError]: 'error',
  [Msg.folderDeleteSuccess]: 'error',
  [Msg.recipientAddSuccess]: 'folder_shared',
  [Msg.recipientAddError]: 'error',
  [Msg.recipientDeleteSuccess]: 'folder_shared',
  [Msg.formNewSuccess]: 'assignment',
  [Msg.noConnection]: 'error',
  [Msg.disallowMove]: 'error',
  [Msg.signupSuccess]: 'person',
  [Msg.signupError]: 'error',
  [Msg.forgotPasswordSuccess]: 'email',
  [Msg.resetPasswordSuccess]: 'vpn_key',
  [Msg.templateNewSuccess]: 'insert_drive_file',
  [Msg.templateUpdateSuccess]: 'edit',
  [Msg.usersNewSuccess]: 'insert_drive_file',
  [Msg.contactsUpdateSuccess]: 'edit',
  [Msg.userIsRegistered]: 'person',
  [Msg.templateIsDeleted]: 'close',
  [Msg.contactsDeleteSuccess]: 'close',
  [Msg.casesCreateSuccess]: 'insert_drive_file',
  [Msg.casesUpdateSuccess]: 'edit',
  [Msg.casesDeleteSuccess]: 'close',
  [Msg.noFolder]: 'error',
  [Msg.documentsMoveSameFolder]: 'error',
  [Msg.widgetNewSuccess]: 'insert_drive_file',
  [Msg.widgetUpdateSuccess]: 'edit',
  [Msg.dashboardAllowed]: 'edit',
  [Msg.dashboardBadCode]: 'error',
  [Msg.dashboardDisabled]: 'edit',
  [Msg.templateIsUsed]: 'error',
  [Msg.templateOnlyName]: 'error',
  [Msg.userUpdateSuccess]: 'error',
  [Msg.userUpdateFailure]: 'error',
  [Msg.caseUserAdded]: 'mdi-clipboard-account',
  [Msg.userUpdateSuccess]: 'error',
  [Msg.passwordUpdateSuccess]: 'edit',
  [Msg.userReinviteSuccess]: 'email',
  [Msg.docShareSuccess]: 'mdi-file-multiple'
}

// ** Translations - convert enum to key->translation object
// Callable function, accepts vars in format {var1: 'Var 1', var2: 'Var2'}
const $txt: { [key in MsgT]: any } = { ...MsgT }

Object.keys(MsgT).forEach((key: string) => {
  if (key in MsgT) {
    const keyWithVars = (Msg as any)[key] // Translate key from enum to code
    $txt[key as MsgT] = (v: any = {}) => i18n.t(keyWithVars, v)
  }
})

export { i18n, Msg, MsgT, SnackIcons, $txt }
