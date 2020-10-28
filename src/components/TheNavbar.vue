<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Action as A, Getter as G } from 'vuex-class'
import { DocsS, AuthS, NotificationsS } from '@/types/'
import _ from 'lodash'
import ProfileManagementDialog from '@/components/ProfileManagementDialog.vue'

import LangSelector from '@/components/LangSelector.vue'
import SearchField from '@/components/SearchField.vue'
import { Routes } from '../router'
import SpaceSelector from './SpaceSelector.vue'
import { UserTypes } from '../types/userDirectoryD'

interface VueRef extends Element {
  focus(): () => void
}

@Component({
  components: {
    ProfileManagementDialog,
    LangSelector,
    SpaceSelector,
    SearchField
  }
})
export default class TheNavbar extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(...AuthS.getUser) getUser: Auth.User
  @G(...DocsS.getSearchQuery) search: string
  @G(...NotificationsS.records) notifications: Notifications.Record[]
  @A(...AuthS.logout) logout: Auth.LogoutA
  @A(...DocsS.updateSearchQuery) updateSearchQuery: Docs.UpdateSearchA
  @A(...DocsS.updateSearchPage) updateSearchPage: Docs.UpdatePageA

  // === === === === === === === === === ===
  // PROPS

  @Prop(Boolean) drawer: boolean

  // DATA === === === === === === === === === ===

  debounceUpdate = _.debounce(this.onUpdateQuery, 150)
  query = ''
  showProfileManagement = false
  windowTop = 0
  routeUpdated = false

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get isDocumentsSearch() {
    const route = this.$router.currentRoute.name
    const isDocsPage = route === Routes.documents.name
    const isSearchPage = route === Routes.search.name

    // Reactivity issue with $router
    if (this.routeUpdated) return isDocsPage || isSearchPage

    return isDocsPage || isSearchPage
  }

  get isArticlesSearch() {
    const route = this.$router.currentRoute.name
    const isArticlesPage = route === Routes.articles.children.articlesIndex.name

    // Reactivity issue with $router
    if (this.routeUpdated) return isArticlesPage
    return isArticlesPage
  }

  get isDrawerOpen() {
    return this.drawer
  }
  set isDrawerOpen(value: boolean) {
    this.$emit('update:drawer', value)
  }

  get getCounterText() {
    const total = this.pendingActions.length
    return total < 10 ? total : '9+'
  }

  get pendingActions() {
    const filterPending = (a: Notifications.Record) => !a.isRead
    return this.notifications.filter(filterPending)
  }

  get isAdminOrSuper() {
    const type = this.getUser?.userType
    return type === UserTypes.diginexAdmin || type === UserTypes.superUser
  }

  get getLabelUserType() {
    const mapTranslation = {
      [UserTypes.normal]: 'Employee',
      [UserTypes.superUser]: 'SuperUser',
      [UserTypes.diginexAdmin]: 'DiginexAdmin'
    }

    return mapTranslation[this.getUser.userType]
  }

  get isSearching() {
    const route = this.$router.currentRoute.query
    const isSearching = !!route.q
    const isSearchingDocs = this.search.length > 0

    // Reactivity issue with $router
    if (this.routeUpdated) return isSearching || isSearchingDocs
    return isSearching || isSearchingDocs
  }

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  // onActivate: to manually trigger this loader component - set vuex state `loaderActive` to true

  @Watch('search')
  onSearchQueryUpdate(value: string) {
    if (value === '') {
      this.query = ''
    }
  }

  //* Reactivity issue with $router
  @Watch('$route', { immediate: true, deep: true })
  onUrlChange() {
    this.routeUpdated = true
    this.$nextTick(() => (this.routeUpdated = false))
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  onUpdateQuery(query: string) {
    // Handle case for initial page load
    this.updateSearchQuery(query)

    // Update route
    if (query.length === 0) {
      return this.$router.push({ path: Routes.documents.name, query: {} })
    }
    const routeQuery = { query }
    this.$router.push({ path: 'search', query: routeQuery }).catch(() => null)
  }

  // If on mount route query is set - update state search query
  mounted() {
    const query = this.$route.query.query as string
    if (query) {
      this.query = String(query)
      this.onUpdateQuery(query)
    }
    window.addEventListener('scroll', this.onScroll)

    // In case if it's users first login, need to set new password
    if (!this.getUser.isRegistered) {
      this.showProfileManagement = true
    }
  }

  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
  }

  onScroll() {
    this.windowTop = window.top.scrollY
  }

  onOpenActionsDrawer() {
    this.$emit('onShowActions')
  }
}
</script>

<template>
  <v-app-bar
    app
    color="#ffffff"
    fixed
    flat
    height="74"
    class="denavbar no-print"
    :class="{
      active: isSearching,
      scrolled: windowTop > 0
    }"
  >
    <v-app-bar-nav-icon
      @click.stop="isDrawerOpen = !isDrawerOpen"
      class="burger"
    />
    <v-text-field
      v-if="isDocumentsSearch"
      solo
      :label="$text.SearchDocuments"
      prepend-inner-icon="search"
      class="search-box"
      v-model="query"
      @input="debounceUpdate"
      ref="searchInput"
    />

    <SearchField v-else-if="isArticlesSearch" class="search-box" />
    <v-spacer v-else />

    <!-- Dropdown menu for selecting space -->
    <SpaceSelector v-if="!getUser.isExternal" />
    <!-- <span
      v-if="!$vuetify.breakpoint.xs"
      class="user-name"
    >{{ getUser.name + ' ' + getUser.surname }}</span>-->
    <!-- <v-chip
      v-if="!$vuetify.breakpoint.xs &&!$vuetify.breakpoint.sm && getUser.userType != 'diginexAdmin'"
      color="primary"
      outlined
      class="chip"
    >{{ $i18n.tc(getLabelProfileType) }}</v-chip>-->
    <v-chip
      v-if="
        !$vuetify.breakpoint.xs && !$vuetify.breakpoint.sm && isAdminOrSuper
      "
      color="red"
      outlined
      class="chip"
    >
      {{ $i18n.tc(getLabelUserType) }}
    </v-chip>
    <!-- Bell - notifications about pending actions  -->
    <v-btn
      icon
      class="bell-btn"
      @click="onOpenActionsDrawer"
      :title="$i18n.tc($msg.PendingForms, pendingActions.length)"
    >
      <div
        v-if="pendingActions.length > 0"
        class="reddot"
        v-text="getCounterText"
      />
      <v-icon v-if="pendingActions.length > 0">notifications_active</v-icon>
      <v-icon v-else>notifications_none</v-icon>
    </v-btn>

    <v-btn
      v-if="!getUser.isExternal"
      :title="$text.Account"
      icon
      @click="showProfileManagement = true"
    >
      <v-icon>mdi-account</v-icon>
    </v-btn>

    <!-- Profile Management  -->
    <ProfileManagementDialog
      v-if="!getUser.isExternal"
      v-model="showProfileManagement"
    />

    <LangSelector v-if="!getUser.isExternal" />

    <!-- LOGOUT BUTTON -->
    <v-btn
      v-if="!getUser.isExternal"
      :title="$text.Logout"
      icon
      @click="() => logout()"
    >
      <v-icon>logout</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<style lang="scss">
$colorAccent: #cc2531;

.denavbar {
  min-width: 350px;
  max-height: 74px;
  z-index: 4 !important;

  // This is necessary for the sake of clipped drawer at "TheDoc" page
  right: 0 !important;

  transition: width 200ms ease 0s;

  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0) !important;
  transition: box-shadow 500ms;

  &.scrolled {
    box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.25) !important;
    transition: box-shadow 500ms;
  }

  .burger:focus::before {
    opacity: 0 !important;
  }

  .search-box {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 2px solid rgba(0, 0, 0, 0.1) !important;

    /* ? to offset elements after right separator (gray border)*/
    margin-right: 1rem;
  }

  .search-box input {
    color: gray !important;
  }

  .v-input__append-inner {
    display: none !important;
  }

  .v-toolbar__content {
    // style border
    border: 2px solid white;
    transition: border-color 0.3s ease-in-out;

    display: flex;
    width: 100%;
    height: 74px;
    flex-direction: row;
  }

  &.active {
    .v-toolbar__content {
      border-bottom: 2px solid $colorAccent;
    }

    .search-box.v-input i {
      color: $colorAccent !important;
    }
  }
}

// Override searchbox styles 100% width, minus drawer width. Top is - height of navbar
.search-box.v-input {
  .v-text-field__details {
    display: none;
  }

  .v-input__slot {
    margin: 0 !important;
    box-shadow: none !important;
    -webkit-box-shadow: none !important;
    padding-left: 0.4rem !important;
  }

  i {
    font-size: 1.8em;
    color: #dddddd;
    transition: color 0.3s ease-in-out;
  }
}

.user-name {
  margin-right: 1.1rem;
  padding-left: 2rem;
  padding-top: 4px;
  padding-bottom: 4px;
  font-size: 1.1em;

  display: inline-flex;
  align-items: center;

  .user-avatar {
    font-family: 'Open Sans', sans-serif;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.7) !important;
    font-size: 1.5em;
  }
}

.chip {
  margin: 0 0.5rem;
}

.active-lang {
  background: #dddddd;
  color: white;
}

.bell-btn {
  pointer-events: auto;

  .reddot {
    width: 22px;
    height: 22px;
    background: $colorAccent;
    border-radius: 10px;
    position: absolute;
    bottom: 10px;
    left: 24px;
    text-align: center;
    vertical-align: center;
    vertical-align: baseline;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
}

@media screen and (max-width: 480px) {
  .v-toolbar__content {
    .v-btn {
      width: 2.5em !important;
      height: 2.5em !important;
    }
  }
}

@media screen and (max-width: 384px) {
  .denavbar {
    .search-box {
      margin-right: 0.5rem;
    }

    .v-toolbar__content {
      .v-btn {
        width: 2em !important;
        height: 2em !important;
      }
    }

    .bell-btn {
      .reddot {
        width: 18px;
        height: 18px;
        top: -7px;
        left: 20px;
      }
    }
  }
}
</style>
