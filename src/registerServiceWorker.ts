/* tslint:disable:no-console */

import { register } from 'register-service-worker'
import { i18n } from './plugins/i18n'
import { Msg } from '@/plugins/i18n'

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log(
        'App is being served from cache by a service worker.\n' +
          'For more details, visit https://goo.gl/AFskqB'
      )
    },
    registered() {
      console.log('Service worker has been registered.')
    },
    cached() {
      console.log('Content has been cached for offline use.')
    },
    updatefound() {
      console.log('New content is downloading.')
    },
    updated(registration) {
      console.log('New content is available; please refresh.')
      const reloadMsg = i18n.tc(Msg.ReloadMsg)
      if (confirm(reloadMsg)) {
        registration.waiting.postMessage({ action: 'skipWaiting' })
      }
    },
    offline() {
      alert('App is offline, please check your connection and try again.')
      console.log(
        'No internet connection found. App is running in offline mode.'
      )
    },
    error(error) {
      console.error('Error during service worker registration:', error)
    }
  })

  let refreshing: boolean
  if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('controllerchange', (e) => {
      if (refreshing) {
        return
      }
      window.location.reload()
      refreshing = true
    })
  }
}
