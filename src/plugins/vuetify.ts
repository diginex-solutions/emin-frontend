// import Vue from 'vue'
// import Vuetify from 'vuetify/lib'
// import colors from 'vuetify/es5/util/colors'

// // Vue.use(Vuetify, {
// //   iconfont: 'md',
// // });

// Vue.use(Vuetify, {
//   theme: {
//     primary: '#727375', // a color that is not in the material colors palette
//     secondary: '#7f8285', // a color that is not in the material colors palette
//     accent: '#cc2531',
//     info: colors.teal.lighten1,
//     warning: colors.amber.base,
//     error: colors.deepOrange.accent4,
//     success: colors.green.accent3,
//     white: '#ffffff',
//     subtoolbar: '#3b6eb4',
//     primaryToolbar: '#315f9a',
//     secondaryToolbar: '#4393f9'
//   },
//   options: {
//     customProperties: true
//   }
// })

const iconfont: 'mdi' = 'mdi'
const opts = {
  icons: {
    iconfont
  },

  theme: {
    dark: false,
    themes: {
      light: {
        primary: '#333434', // a color that is not in the material colors palette
        secondary: '#7f8285', // a color that is not in the material colors palette
        accent: '#b71c1b',
        white: '#ffffff',
        subtoolbar: '#3b6eb4',
        primaryToolbar: '#315f9a',
        secondaryToolbar: '#4393f9'
      },
      dark: {
        primary: '#333434', // a color that is not in the material colors palette
        secondary: '#7f8285', // a color that is not in the material colors palette
        accent: '#cc2531',
        white: '#ffffff',
        subtoolbar: '#3b6eb4',
        primaryToolbar: '#315f9a',
        secondaryToolbar: '#4393f9'
      }
    }
  }
}

import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

export default new Vuetify(opts)
