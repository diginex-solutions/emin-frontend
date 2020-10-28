<script lang="ts">
import { Action as A, Getter as G } from 'vuex-class'
import { Vue, Component } from 'vue-property-decorator'
import { SpacesS, DocumentTypesS } from '@/types/'
import { finderById } from '@/utils/helpers'
import TheBreadcrumbs from '@/components/TheBreadcrumbs.vue'
import ButtonsPanel from '@/components/ButtonsPanel.vue'
import { Routes } from '../router'

@Component({
  components: {
    TheBreadcrumbs,
    ButtonsPanel
  }
})
export default class TheSpace extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(...SpacesS.records) spaces: Spaces.Record[]
  @A(...DocumentTypesS.fetch) fetchDocumentTypes: DocumentTypes.FetchA
  @A(...SpacesS.fetchManagers) fetchManagers: Spaces.FetchManagerA
  @A(...SpacesS.fetchRegisteredUsers)
  fetchRegisteredUsers: Spaces.FetchRegisteredUsersA

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  isLoading = false
  isEditDialog = false
  tab: string = this.tabs[0].name

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get space() {
    const spaceId = this.$route.params.spaceId
    const findById = finderById(spaceId)

    return this.spaces.find(findById)
  }

  get tabs() {
    return [
      {
        name: this.$text.Settings,
        to: Routes.space.children.spaceSettings.name
      },
      {
        name: this.$text.Category,
        to: Routes.space.children.spaceDocumentTypes.name
      },
      {
        name: this.$text.Manager,
        to: Routes.space.children.spaceManagers.name
      }
    ]
  }

  get panelButtons() {
    return []
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  getPath(name: string) {
    const spaceId = this.space?.id
    return { name, params: { spaceId } }
  }

  emitEvent(btn: { onClick: () => void }) {
    if (btn) {
      btn.onClick()
    }
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  async mounted() {
    const spaceId = this.space?.id
    if (spaceId) {
      await this.fetchDocumentTypes(spaceId)
      await this.fetchManagers(spaceId)
      await this.fetchRegisteredUsers(spaceId)
    }
  }
}

// * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀
</script>

<template>
  <div class="the-space" fill-height>
    <!-- Loader screen -->
    <v-container grid-list-md pa-0 ma-0 fluid v-if="isLoading">
      <div class="notfound">
        <div style="display: flex; flex-direction: column; align-items:center">
          <v-progress-circular indeterminate color="#dddddd" />
          <span class="cta-text" style="font-size:1.5em; color:#bbbbbb;">
            {{ $text.Loading }}
          </span>
        </div>
      </div>
    </v-container>
    <v-container grid-list-md pa-0 ma-0 fluid v-else-if="space">
      <v-layout wrap pa-0>
        <v-flex xs12 pa-0>
          <!-- Buttons panel -->
          <ButtonsPanel :buttons="panelButtons" @btnClick="emitEvent" />

          <!-- Breadcrumbs Panel -->
          <TheBreadcrumbs
            :items="[
              [$text.Spaces, '/spaces'],
              [space.name, space.id]
            ]"
            router-mode
          />
        </v-flex>

        <!-- ? Disabling multipaging till required -->
        <!-- Tabs -->
        <v-flex xs12 pa-0 ml-5 mr-5 mb-3 style="width: calc(100% - 40px)">
          <v-tabs
            v-model="tab"
            background-color="transparent"
            color="accent"
            show-arrows
          >
            <v-tab v-for="tab in tabs" :to="getPath(tab.to)" :key="tab.name">
              {{ tab.name }}
            </v-tab>
          </v-tabs>
        </v-flex>

        <v-divider />

        <!-- Page -->
        <v-flex xs12 pa-0 ml-5 mr-5 mb-3>
          <router-view :space="space" />
        </v-flex>
      </v-layout>
    </v-container>
    <v-container grid-list-md pa-0 ma-0 fluid v-else>
      <div class="notfound">
        <div style="display: flex; flex-direction: column; align-items:center">
          <v-icon color="#dddddd" size="150">mdi-image-broken-variant</v-icon>
          <span class="cta-text" style="font-size:1.5em; color:#bbbbbb;">
            {{ $text.SpaceNotFound }}
          </span>
        </div>
      </div>
    </v-container>
  </div>
</template>

<style lang="scss" scoped>
.the-space {
  color: #666666;

  .notfound {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
