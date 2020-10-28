<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { DocsS, SpacesS, ActionsS } from '@/types/'
import Stx from '@/types/stx.ts'
import TheUploader from '@/components/TheUploader.vue'
import TheBreadcrumbsPath from '@/components/TheBreadcrumbsPath.vue'
import TheDocsTable from '@/components/TheDocsTable.vue'
import ActionButtons, { DrawerTypes } from '@/components/ActionButtons.vue'
import Paginator from '@/mixins/paginator.ts'

import {
  isInFolder,
  isChildPath,
  formatDocName,
  finderById,
  isPathParent,
  isPathEqual
} from '@/utils/helpers'
import { Routes, routesApi } from '../router'

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  components: {
    TheUploader,
    TheBreadcrumbsPath,
    TheDocsTable,
    ActionButtons
  },
  mixins: [Paginator]
})
export default class TheDocsPage extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(...DocsS.records) documents: Docs.Record[]
  @G(...DocsS.getSearchQuery) search: string
  @A(...DocsS.updateSearchQuery) updateSearchQuery: Docs.UpdateSearchA
  @A(...DocsS.addRecord) vuexAddDocument: Docs.AddDocumentA

  // * Handling foler path
  @G(...DocsS.getCurrentPath) getCurrentPath: string
  @A(...DocsS.setFolder) setFolder: Docs.SetFolderA

  // * Vuex calls for handling list of selected documents
  @G(...ActionsS.records) selected: Docs.Record[]
  @A(...ActionsS.selectedSet) selectedSet: Actions.SetA
  @A(...ActionsS.selectedAdd) selectedAdd: Actions.AddA
  @A(...ActionsS.selectedDelete) selectedDelete: Actions.DeleteA
  @G(...SpacesS.getSelected) getSelected: Spaces.Record

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop(Boolean) isSearch: boolean
  @Prop(String) title: string

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  pagination = true // Enable pagination
  isDragging = false

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get isPageArchived() {
    return isPathParent(Stx.PathArchived, this.getCurrentPath)
  }

  get isPageShared() {
    return isPathParent(Stx.PathShared, this.getCurrentPath)
  }

  get isUploaderVisible() {
    return !this.isPageArchived && !this.isPageShared
    // && ! isPageSearch
  }

  get items() {
    // * Filter 1: folder - display only files inside folder
    let folderFilter = ({ name, isFolder, path }: Docs.Record) =>
      isInFolder(this.getCurrentPath, path, name, !!isFolder)

    // * Filter 2: search filter - fuzzy search name
    type DocsFilter = (d: Docs.Record) => boolean
    let searchFilter: DocsFilter = () => true
    if (this.isSearch && this.search.length > 0) {
      // ## folder filter should return all children of the folder (excl. folder itself)
      folderFilter = ({ path, isFolder }: Docs.Record) => {
        const pathCheck = isChildPath(path, this.getCurrentPath)
        const folderItself = isFolder && path === this.getCurrentPath

        return pathCheck && !folderItself
      }

      const query: string = this.search.toLowerCase()
      searchFilter = (d: Docs.Record) => {
        const name = formatDocName(d)
        return name.toLowerCase().includes(query)
      }
    }

    // * Apply filters and return documents list
    return this.documents.filter(folderFilter).filter(searchFilter)
  }

  get metas() {
    return this.$route.meta
  }

  // Items count excluding special items
  get itemsCount() {
    const docs = this.items.filter(
      (item: Docs.Record) => !this.isItemSpecial(item)
    )
    return docs.length
  }

  get isAllSelected() {
    // Exclude special items - shared and archived foldes
    const docs = this.selected.filter(
      (item: Docs.Record) => !this.isItemSpecial(item)
    )
    return this.itemsCount > 0 && docs.length === this.itemsCount
  }

  get uploadUrl() {
    const path = this.getCurrentPath
    const spaceId = this.getSelected?.id
    return routesApi.documents.uploadDocument(path, spaceId)
  }

  get hideUploader() {
    return this.getCurrentPath === Stx.PathChecklist
  }

  // * === === === === === === === === === ===
  // * Watchers 👀 👀 👀 👀 👀 👀 👀 👀 👀 👀

  // If documents list is updated - need to update selected documents list (`selected`)
  @Watch('documents')
  onUpdateSelected(updatedDocs: Docs.Record[], oldDocs: Docs.Record[]) {
    // If new files has been added to the list - highlight that file, sync to Sortablejs
    if (updatedDocs.length - oldDocs.length === 1) {
      const isExist = (parent: Docs.Record) =>
        oldDocs.find((d: Docs.Record) => d.id === parent.id)
      const uploaded = updatedDocs.filter(
        (doc: Docs.Record) => !isExist(doc)
      )[0]
      this.selectDocument(uploaded)
      return
    }

    // if file has been updated - no need to sync with Sortablejs
    const updatedSelected: Docs.Record[] = []
    this.selected.forEach((doc: Docs.Record) => {
      const updatedDoc = updatedDocs.find(
        ({ id }: Docs.Record) => id === doc.id
      )
      if (updatedDoc) {
        updatedSelected.push(updatedDoc)
      }
    })

    this.selectedSet(updatedSelected)
  }

  // * === === === === === === === === === ===
  // * Watchers 👀 👀 👀 👀 👀 👀 👀 👀 👀 👀

  // If search query is updated - reset selected documents list
  @Watch('search.query')
  onSearchUpdate() {
    this.resetSelected()
  }

  resetSelected() {
    this.isDragging = false
    this.selectedSet([])
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  mounted() {
    this.selectedSet([]) // Reset selected docs list
    window.addEventListener('keydown', this.onHuntEscape)
    window.addEventListener('dragenter', this.onDragEnter)
    window.addEventListener('dragleave', this.onDragLeave)
  }

  beforeDestroy() {
    this.selectedSet([]) // Reset selected docs list
    window.removeEventListener('keydown', this.onHuntEscape)
    window.removeEventListener('dragenter', this.onDragEnter)
    window.removeEventListener('dragleave', this.onDragLeave)

    // Reset current path, if moving to any other page (except space)
    const newPath = this.$router.currentRoute.name
    if (newPath !== 'space' && newPath !== 'documents') {
      // TODO: consider moving it to beforeEach hook
      this.setFolder('/') // reset current path to root, otherwise breadcrumb bug in contacts/templates
    }
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  onDragEnter(e: DragEvent) {
    const items = e.dataTransfer && e.dataTransfer.items
    if (!this.metas.isDocsPage || !items || items.length === 0) {
      return
    }

    // fix issue with dragging text over dropzone
    for (const item of items) {
      if (item.kind !== 'file') {
        return
      }
    }
    this.isDragging = true
  }

  onDragLeave(e: DragEvent) {
    if (e.screenX !== 0 || e.screenY !== 0) {
      return false
    }
    this.isDragging = false
  }

  // Exit search page
  onHuntEscape({ code }: KeyboardEvent) {
    if (this.search && code === 'Escape') {
      this.updateSearchQuery()
      this.$router.push({ path: Routes.documents.name })
    }
  }

  // TODO: figure out what it does, and what is the purpose of selectedDelete call
  addSelected(docId: string) {
    const findById = finderById(docId)

    // If exists - remove
    const existingIndex = this.selected.findIndex(findById)
    if (existingIndex > -1) {
      this.selectedDelete(this.selected[existingIndex])
      return this.selected.slice(existingIndex, 1)
    }

    // Else - add doc to selected docs array
    const doc = this.documents.find(findById)
    if (doc) {
      this.selectDocument(doc)
    }
  }

  isItemSpecial(item: Docs.Record) {
    const path = item.path
    const isArchived = isPathEqual(path, Stx.PathArchived)
    const isShared = isPathEqual(path, Stx.PathShared)
    return item.isFolder && (isArchived || isShared)
  }

  selectDocument(doc: Docs.Record) {
    if (this.isItemSpecial(doc)) {
      return
    }

    this.$nextTick(() => {
      // if already selected - return
      const findById = finderById(doc.id)
      const isSelected = this.selected.find(findById)
      if (isSelected) {
        return
      }

      this.selectedAdd(doc)
    })
  }

  selectOne(doc: Docs.Record) {
    setTimeout(() => {
      this.isDragging = false
      this.selectedSet([]) // Reset array
      this.selectDocument(doc)
    }, 100)
  }

  // Timeout is needed for smoother anim of opening drawer (only if needed select doc first)
  openDrawer(drawerName: DrawerTypes, doc?: Docs.Record) {
    let timeout = 0
    if (doc) {
      this.selectOne(doc)
      timeout = 100
    }

    setTimeout(() => {
      const actionButtons = this.$refs.ActionButtons as ActionButtons
      if (!actionButtons) {
        return
      }
      actionButtons.onOpenDrawer(drawerName)
    }, timeout)
  }

  openHistoryDrawer(doc?: Docs.Record) {
    this.openDrawer(DrawerTypes.history, doc)
  }

  openActionsDrawer(doc?: Docs.Record, isReceived = false) {
    const drawerName = isReceived
      ? DrawerTypes.formsReceived
      : DrawerTypes.forms
    this.openDrawer(drawerName, doc)
  }

  onOpenDropzone() {
    const dropzone = this.$refs.TheUploader as TheUploader
    dropzone.onOpenDropzone()
  }

  // Select / Deselect all documents upon clicking checkbox on top of table
  onSelectAll() {
    // If all notes are already selected - reset all and return
    if (this.isAllSelected) {
      this.resetSelected()
      return
    }

    // Go through each note and select
    this.items.forEach((doc: Docs.Record) => {
      // No need to select, if already selected
      const findById = finderById(doc.id)
      if (this.selected.find(findById)) {
        return
      }

      // Else - add note to selected notes array
      this.selectDocument(doc)
    })
  }
}
</script>

<template>
  <div
    :class="{
      dragenterClass: isDragging,
      'uploader-offset': isUploaderVisible && !isSearch
    }"
  >
    <v-container grid-list-md pa-0 ma-0 fluid>
      <v-layout wrap pa-0>
        <v-flex xs12 pa-0>
          <!-- Buttons panel -->
          <ActionButtons
            ref="ActionButtons"
            isFolderView
            @onOpenUploader="onOpenDropzone"
            @onSelectOne="selectOne"
            @onResetSelected="resetSelected"
          />

          <!-- Breadcrumbs Panel -->
          <TheBreadcrumbsPath
            :root-text="$text.Documents"
            :is-search="isSearch"
            @onChange="resetSelected"
          />
        </v-flex>
        <v-flex xs12 pa-0 ml-5 mr-5 class="dragzone-parent">
          <TheDocsTable
            :page="page"
            :selected="selected"
            :itemsCount="itemsCount"
            :disableDrag="isSearch || isPageArchived || isPageShared"
            @onAddSelected="addSelected"
            @onResetSelected="resetSelected"
            @paginatorReset="paginatorReset"
            @openHistoryDrawer="openHistoryDrawer"
            @openActionsDrawer="openActionsDrawer"
            :isSearch="isSearch"
            :isPageShared="isPageShared"
            @onSelectAll="onSelectAll"
            :isAllSelected="isAllSelected"
          />
          <div
            v-if="pagination"
            v-show="isLoaderVisible"
            v-infinite-scroll="onLoadMore"
            :infinite-scroll-disabled="pageLoading || !isLoaderVisible"
            infinite-scroll-distance="800"
            class="infinite-scroll"
          >
            <v-progress-circular :size="20" :width="2" indeterminate />
          </div>
          <TheUploader
            v-show="metas.isDocsPage && !isPageArchived && !isPageShared"
            ref="TheUploader"
            @onFileUploaded="vuexAddDocument"
            @onResetSelected="resetSelected"
            :url="uploadUrl"
            v-if="!hideUploader"
          />
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<style lang="scss">
.uploader-offset {
  // give space for absolute element (dropzone)
  padding-bottom: 250px;
}

.dragenterClass {
  // EXTERNAL - child component "TheDocsTable"
  .users-table {
    opacity: 0;
    pointer-events: none;
  }

  // EXTERNAL - child component "TheUploader"
  #dropzone {
    border-color: #90b7c4;

    .dropzone__bg {
      opacity: 1;
    }
    .dropzone__cta {
      opacity: 0;
    }
  }
}

.dragzone-parent {
  position: relative;
}

.infinite-scroll {
  background: white;
  position: relative !important;
  z-index: 1;
  display: flex;
  justify-content: center;
  padding: 0.5em;
}

.v-data-table__empty-wrapper {
  pointer-events: none !important;
}
</style>
