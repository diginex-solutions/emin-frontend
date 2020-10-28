<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Getter as G } from 'vuex-class'
import { RootG, AuthS, NotificationsS } from '@/types/'
import TheNavbar from '@/components/TheNavbar.vue'
import TheDrawer from '@/components/TheDrawer.vue'
import NotificationsDrawer from '@/components/NotificationsDrawer.vue'

@Component({
  components: {
    TheNavbar,
    TheDrawer,
    NotificationsDrawer
  }
})
export default class DefaultLayout extends Vue {
  @G(...AuthS.isLogged) isLogged: string
  @G(...NotificationsS.records) notifications: Notifications.Record[]
  @G(RootG.isLoading) isLoading: boolean

  drawer = true

  drawers = {
    isActions: false,
    isAppInit: false
  }

  selectedActionId = ''

  @Watch('isLoading')
  trackPendingActions(isLoading: boolean) {
    if (isLoading) {
      this.drawers.isAppInit = false
      return
    }

    this.drawers.isAppInit = true

    // if view=actions query is set, or any pending actions - open drawer
    const view = this.$route.query.view as string
    if (this.pendingActions.length > 0 || view === 'actions') {
      this.drawers.isActions = true
    }

    this.selectedActionId = this.$route.query.id as string
  }

  get pendingActions() {
    const filterPending = (a: Notifications.Record) => !a.isRead
    return this.notifications.filter(filterPending)
  }

  mounted() {
    // close the drawer for small screens
    if (this.isMobile()) {
      this.drawer = false
    }
  }

  isMobile() {
    const mobileWidth = 1265

    const win = window
    const doc = document
    const docElem = doc.documentElement
    const body = doc.getElementsByTagName('body')[0]
    const x = win.innerWidth || docElem.clientWidth || body.clientWidth

    return x < mobileWidth
  }

  //* Show notifications drawer (If no notifications - snackbar).
  showNotifications() {
    if (this.notifications.length === 0) {
      return this.$showSnack(this.$msg.NotificationsNotFound)
    }
    this.drawers.isActions = true
  }
}
</script>

<template>
  <div v-if="isLogged">
    <!-- PAGE LAYOUT: drawer, navbar, content -->
    <TheDrawer :drawer.sync="drawer" @update:drawer="drawer = $event" />
    <TheNavbar
      :drawer.sync="drawer"
      @update:drawer="drawer = $event"
      @onShowActions="showNotifications"
    />

    <!-- Drawer: actions drawer -->
    <NotificationsDrawer
      v-if="drawers.isActions && notifications && notifications.length > 0"
      v-model="drawers.isActions"
      :notifications="notifications"
      :selectedId="selectedActionId"
    />

    <v-content class="print-no-padding mobile-no-padding" style="height: 100vh">
      <v-flex xs12>
        <!-- PAGES -->
        <router-view />
      </v-flex>
    </v-content>
  </div>
</template>
