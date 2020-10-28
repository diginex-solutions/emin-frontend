<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { DocsS, ActionsS, TemplatesS } from '@/types/'
import ActionButtons from '@/components/ActionButtons.vue'
import TheBreadcrumbsPath from '@/components/TheBreadcrumbsPath.vue'
import { finderById } from '../utils/helpers'
import ActionFiller from '@/components/ActionFiller.vue'
import ActionViewer from '@/components/ActionViewer.vue'
import { Routes } from '../router'
import { FormStatuses } from '@/store/formsStore'

@Component({
  components: {
    ActionButtons,
    TheBreadcrumbsPath,
    ActionFiller,
    ActionViewer
  }
})
export default class TheDoc extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...DocsS.records) docs: Docs.Record[]
  @G(...DocsS.getDocumentHistory) getDocumentHistory: Docs.History[]
  @A(...DocsS.fetchDocumentHistory) fetchHistory: Docs.FetchHistoryA
  @A(...DocsS.setFolder) setFolder: Docs.SetFolderA
  @A(...ActionsS.selectedSet) selectedSet: Actions.SetA
  @G(...TemplatesS.records) templates: Templates.Record[]

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isLoading = false
  dialogs = {
    isView: false,
    isFill: false
  }

  selectedAction: Forms.Record | null = null

  tab: string = this.tabs[0].name

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get doc() {
    const documentId = this.$route.params.documentId
    const findById = finderById(documentId)

    return this.docs.find(findById)
  }

  get template() {
    const templateId = this.$route.query.templateId as string
    const findById = finderById(templateId)
    return this.templates.find(findById)
  }

  get feed() {
    const feedableEvents = [
      'create',
      'share',
      'unshare',
      'archived',
      'restored',
      'action_created'
    ]

    const filterFeedables = (h: Docs.History) =>
      feedableEvents.includes(h.action)
    return this.getDocumentHistory.filter(filterFeedables)
  }

  get tabs() {
    return [
      { name: 'Info', to: Routes.doc.children.docInfo.name },
      { name: 'History', to: Routes.doc.children.docHistory.name },
      { name: 'Users', to: Routes.doc.children.docUsers.name },
      { name: 'Templates', to: Routes.doc.children.docTemplates.name }
    ]
  }

  get isMobile() {
    return this.$vuetify.breakpoint.xs
  }

  // * === === === === === === === === === ===
  // * Watchers 👀 👀 👀 👀 👀 👀 👀 👀 👀 👀

  @Watch('doc')
  docUpdated(doc?: Docs.Record, docOld?: Docs.Record) {
    this.setFolder((doc && doc.path) || '/')

    if (!doc || (docOld && docOld.id === doc.id)) return //? Exn

    this.isLoading = true
    this.fetchHistory(doc).then(() => {
      this.isLoading = false
    })

    this.selectedSet([doc]) // Select to activate buttons panel for the document
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  mounted() {
    this.docUpdated(this.doc)
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  getPath(name: string) {
    return { name, params: { documentId: this.doc && this.doc.id } }
  }

  viewAction(action: Forms.Record | null = null) {
    this.selectedAction = action

    const doc =
      (this.selectedAction && this.selectedAction.document) || this.doc
    const isInitiator = doc && !doc.owner

    // Compute isFilled
    const status = this.selectedAction && this.selectedAction.status
    const filled =
      status === FormStatuses.accepted || status === FormStatuses.rejected
    const isFilled = filled ? status : false

    this.dialogs.isView = false
    this.dialogs.isFill = false

    if (!isInitiator && !isFilled) {
      this.dialogs.isFill = true
    } else {
      this.dialogs.isView = true
    }
  }
}

// * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀
</script>

<template>
  <div class="document-info" fill-height>
    <ActionFiller
      v-if="dialogs.isFill"
      v-model="dialogs.isFill"
      :file="doc"
      :actionRaw="selectedAction"
    />
    <ActionViewer
      v-if="dialogs.isView"
      v-model="dialogs.isView"
      :file="doc"
      :actionRaw="selectedAction"
    />

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
    <v-container grid-list-md pa-0 ma-0 fluid v-else-if="doc">
      <v-layout wrap pa-0>
        <v-flex xs12 pa-0>
          <!-- Buttons panel -->
          <ActionButtons />

          <!-- Breadcrumbs Panel -->
          <TheBreadcrumbsPath
            :root-text="$text.Documents"
            :textAppend="doc.name"
          />
        </v-flex>
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

          <!-- PAGES -->
          <router-view
            :feed="feed"
            :doc="doc"
            @viewAction="viewAction"
            style="margin-top:1rem"
          />
        </v-flex>
      </v-layout>
    </v-container>
    <v-container grid-list-md pa-0 ma-0 fluid v-else>
      <div class="notfound">
        <div style="display: flex; flex-direction: column; align-items:center">
          <v-icon color="#dddddd" size="150">mdi-image-broken-variant</v-icon>
          <span class="cta-text" style="font-size:1.5em; color:#bbbbbb;">
            {{ $text.DocumentNotFound }}
          </span>
        </div>
      </div>
    </v-container>
  </div>
</template>
<style lang="scss" scoped>
.document-info {
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
