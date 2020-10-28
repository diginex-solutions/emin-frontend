<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component, Watch, Prop, Provide } from 'vue-property-decorator'
import ActionButtons, { DrawerTypes } from '@/components/ActionButtons.vue'
import ButtonsPanel from '@/components/ButtonsPanel.vue'
import TheBreadcrumbs from '@/components/TheBreadcrumbs.vue'
import TheChecklistTable from '@/components/TheChecklistTable.vue'
import TheChecklistUploader from '@/components/TheChecklistUploader.vue'
import { routesApi } from '@/router'
import { DocsS, SpacesS, ActionsS } from '@/types/'
import Stx from '@/types/stx'
import { isPathEqual } from '@/utils/helpers'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

const finderByDocumentType = (target: string) => {
  return ({ category = '' }: { category?: string }) => category === target
}

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  components: {
    ButtonsPanel,
    TheBreadcrumbs,
    TheChecklistTable,
    ActionButtons,
    TheChecklistUploader
  }
})
export default class TheChecklistPage extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  // Checklists vuex calls
  @G(...DocsS.getChecklist) documents: Docs.ChecklistRecord[]
  @A(...DocsS.singleSelectChecklist)
  singleSelectedChecklist: Docs.SingleSelectChecklistA
  @A(...DocsS.updateChecklist) updateChecklist: Docs.UpdateChecklistA

  // * Vuex calls for handling list of selected documents
  @G(...ActionsS.records) selected: Docs.Record[]
  @A(...ActionsS.selectedSet) selectedSet: Actions.SetA
  @A(...ActionsS.selectedDelete) selectedDelete: Actions.DeleteA

  // * Vuex calls for handling space
  @G(...SpacesS.getSelected) getSelected: Spaces.Record

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop(Boolean) isSearch: boolean
  @Prop(String) currentPath: string

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  isLoading = false

  @Provide()
  documentType = ''

  // * === === === === === === === === === ===
  // * Computed 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏

  get metas() {
    return this.$route.meta
  }

  // * === === === === === === === === === ===
  // * Watchers 👀 👀 👀 👀 👀 👀 👀 👀 👀 👀

  @Watch('$route', { immediate: true, deep: true })
  onUrlChange() {
    // clear select flag and selected document in store
    this.selectedSet([])
    this.singleSelectedChecklist('')
  }

  // If documents list is updated - need to update selected documents list (`selected`)
  @Watch('documents')
  onUpdateSelected(updatedDocs: Docs.Record[], oldDocs: Docs.Record[]) {
    if (updatedDocs.length === oldDocs.length) {
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
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  mounted() {
    this.selectedSet([]) // Reset selected docs list
  }

  beforeDestroy() {
    this.selectedSet([]) // Reset selected docs list
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  selectOne(doc: Docs.ChecklistRecord) {
    setTimeout(() => {
      if (doc) {
        this.selectedSet([]) // Reset array
        this.selectDocument(doc)
        this.singleSelectedChecklist(doc.id)
      }
    }, 100)
  }

  openDrawer(drawerName: DrawerTypes, doc?: Docs.ChecklistRecord) {
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

  openHistoryDrawer(doc?: Docs.ChecklistRecord) {
    this.openDrawer(DrawerTypes.history, doc)
  }

  openActionsDrawer(doc?: Docs.ChecklistRecord, isReceived = false) {
    const drawerName = isReceived
      ? DrawerTypes.formsReceived
      : DrawerTypes.forms
    this.openDrawer(drawerName, doc)
  }

  onOpenDropzone(doc?: Docs.ChecklistRecord) {
    if (doc || (this.selected && this.selected.length > 0)) {
      const firstDoc = doc ? doc : this.selected[0]
      if (firstDoc && firstDoc.category) {
        this.documentType = firstDoc.category
        const dropzone = this.$refs.TheUploader as TheChecklistUploader
        dropzone.onOpenDropzone()
      }
    }
  }

  addSelected(documentType: string) {
    const findByDocumentType = finderByDocumentType(documentType)

    // If exists - remove
    const existingIndex = this.selected.findIndex(findByDocumentType)
    if (existingIndex > -1) {
      this.selectedDelete(this.selected[existingIndex])
      this.singleSelectedChecklist('')
      return
    }

    // Else - add doc to selected docs array
    const doc = this.documents.find(findByDocumentType)

    if (doc) {
      this.selectDocument(doc)
    }
  }

  isItemSpecial(item: Docs.ChecklistRecord) {
    const path = item.path
    const isArchived = isPathEqual(path, Stx.PathArchived)
    const isShared = isPathEqual(path, Stx.PathShared)
    return item.isFolder && (isArchived || isShared)
  }

  selectDocument(doc: Docs.ChecklistRecord) {
    if (this.isItemSpecial(doc)) {
      return
    }

    this.$nextTick(() => {
      // if already selected - return
      const findByDocumentType = finderByDocumentType(doc.category || '')
      const isSelected = this.selected.find(findByDocumentType)

      if (isSelected) {
        return
      }

      this.selectedSet([doc])
      this.singleSelectedChecklist(doc.category || '')
    })
  }

  get uploadUrl() {
    const path = this.currentPath
    const spaceId = this.getSelected?.id
    const documentType = this.documentType

    return routesApi.documents.uploadChecklist(path, spaceId, documentType)
  }

  uploadFile(documentType: string) {
    this.documentType = documentType
    if (documentType) {
      const findByDocumentType = finderByDocumentType(documentType)

      const existingIndex = this.selected.findIndex(findByDocumentType)
      const doc = this.documents.find(findByDocumentType)
      if (doc && existingIndex < 0) {
        this.selectDocument(doc)
      }

      if (doc) {
        this.onOpenDropzone(doc)
      }
    }
  }

  fileUploaded(response: Docs.Record) {
    this.updateChecklist(response)
    this.selectedSet([response])
  }
}
</script>

<template>
  <v-container grid-list-md pa-0 ma-0 fluid>
    <v-layout wrap pa-0>
      <v-flex xs12 pa-0>
        <!-- Buttons panel -->
        <ActionButtons
          ref="ActionButtons"
          :isFolderView="false"
          @onOpenUploader="onOpenDropzone"
        />

        <!-- Breadcrumbs Panel -->
        <TheBreadcrumbs :items="[[$text.ChecklistTitle]]" />
      </v-flex>
      <v-flex xs12 pa-0 ml-5 mr-5 class="dragzone-parent">
        <TheChecklistTable
          :documents="documents"
          @onAddSelected="addSelected"
          @openHistoryDrawer="openHistoryDrawer"
          @openActionsDrawer="openActionsDrawer"
          @uploadFile="uploadFile"
        />
        <TheChecklistUploader
          v-show="metas.isChecklistPage"
          ref="TheUploader"
          :url="uploadUrl"
          @onFileUploaded="fileUploaded"
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<style lang="scss" scoped>
.dragzone-parent {
  position: relative;
}
</style>
