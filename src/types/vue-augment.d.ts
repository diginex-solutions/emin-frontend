import { MsgT, Msg } from '@/plugins/i18n'
import VueI18n from 'vue-i18n'

declare module 'vue/types/vue' {
  interface Vue {
    $msg: typeof Msg // List of i18n and snack messages
    $text: { [key in MsgT]: string } // List of i18n translations
    $txt: { [key in MsgT]: (v?: any) => VueI18n.TranslateResult } // Function to get translation w vars
    $showSnack: (msg: Msg, data?: string | number) => void
  }
}
