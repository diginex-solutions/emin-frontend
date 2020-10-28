module.exports = {
  productionSourceMap: false,

  transpileDependencies: [
    'vuetify',
    'vuex-persist',
    'vuex-class',
    'vue-property-decorator',
    'vue-router'
  ],
  chainWebpack: (config) => {
    config.plugin('provide').use(require('webpack').ProvidePlugin, [
      {
        'window.Quill': 'quill/dist/quill.js',
        Quill: 'quill/dist/quill.js'
      }
    ])
  },
  configureWebpack: (config) => {
    config.entry = ['babel-polyfill', './src/main.ts']
  },

  pwa: {
    // configure the workbox plugin
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      // swSrc is required in InjectManifest mode.
      swSrc: 'public/service-worker.js'
      // ...other Workbox options...
    }
  }
}
