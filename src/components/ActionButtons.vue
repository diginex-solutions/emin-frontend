<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import ButtonsPanel from '@/components/ButtonsPanel.vue'
import { DocsS, ActionsS } from '@/types/'
import Stx from '@/types/stx.ts'
import { isPathParent, downloadURI, isPathEqual } from '../utils/helpers'
import FolderMoveDialog from './FolderMoveDialog.vue'
import ConfirmationDialog from './ConfirmationDialog.vue'
import DocsHistoryDrawer from '@/components/DocsHistoryDrawer.vue'
import SharingDialog from '@/components/SharingDialog.vue'
import TheActionsDrawer from '@/components/TheActionsDrawer.vue'
import AskText from './AskText.vue'
import VersionHistoryDialog from '@/components/VersionHistoryDialog.vue'
import ShareListDrawer from '@/components/ShareListDrawer.vue'
import DocumentCategoryDialog from '@/components/DocumentCategoryDialog.vue'
import { Route } from 'vue-router'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

export enum DrawerTypes {
  history = 'history',
  share = 'share',
  forms = 'forms',
  formsReceived = 'formsReceived'
}

type Doc = Docs.Record

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  components: {
    ButtonsPanel,
    FolderMoveDialog,
    ConfirmationDialog,
    DocsHistoryDrawer,
    TheActionsDrawer,
    AskText,
    SharingDialog,
    VersionHistoryDialog,
    ShareListDrawer,
    DocumentCategoryDialog
  }
})
export default class ActionButtons extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @A(...DocsS.download) vuexDownload: Docs.DownloadA
  @G(...DocsS.getCurrentPath) getCurrentPath: string
  @A(...DocsS.moveDocs) vuexMoveDocs: Docs.MoveDocsA
  @A(...DocsS.archive) vuexArchive: Docs.ArchiveA
  @A(...DocsS.deleteFolder) vuexDeleteFolder: Docs.DeleteFolderA
  @A(...DocsS.setCurrentPath) setCurrentPath: Docs.SetCurrentPathA
  @G(...ActionsS.records) selected: Docs.Record[]
  @A(...ActionsS.selectedSet) selectedSet: Actions.SetA
  @A(...DocsS.createFolder) vuexCreateFolder: Docs.CreateFolderA
  @A(...DocsS.renameFolder) vuexRenameFolder: Docs.MoveDocsA
  @A(...DocsS.rename) vuexRename: Docs.RenameA
  @A(...DocsS.create) vuexDocCreate: Docs.CreateA
  @G(...DocsS.getDocumentsWithoutCategory)
  documentsWithoutCategory: Docs.Record[]

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Boolean) isFolderView: boolean

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isWR = false
  isMovingFiles = false
  isLoading = false

  dialogs = {
    isRename: false,
    isArchive: false,
    isRestoring: false,
    isMove: false,
    isFolderCreate: false,
    isFolderDelete: false,
    isFormSend: false,
    isDocCreate: false,
    isVersionHistory: false,
    isShare: false,
    isDocumentCategory: false
  }

  drawers = {
    isHistory: false,
    isForms: false,
    isFormsReceived: false,
    isShareList: false
  }

  renameInitial = ''

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  // Return panel mode, based on number and type of selected documents
  get getType() {
    const type = {
      active: false,
      archived: false,
      shared: false,
      mixed: false,
      folder: false,
      checklist: false
    }

    // If selected files list is empty - return
    const files = this.selected
    if (files.length === 0) {
      return type
    }

    const isShared = (d: Docs.Record) => isPathParent(Stx.PathShared, d.path)
    const isChecklist = (d: Docs.Record) =>
      isPathParent(Stx.PathChecklist, d.path)

    // If there are selected files - check files type
    const filterArchived = (d: Doc) => d.archived
    const filterActive = (d: Doc) => !d.archived && !isShared(d)
    const filterShared = (d: Doc) => isShared(d)
    const findFolder = (d: Doc) => d.isFolder
    const filterChecklist = (d: Doc) => isChecklist(d)

    const archivedFiles = files.filter(filterArchived).length
    const activeFiles = files.filter(filterActive).length
    const sharedFiles = files.filter(filterShared).length
    const checklistFiles = files.filter(filterChecklist).length
    type.folder = !!files.find(findFolder)

    if (archivedFiles === files.length) {
      type.archived = true
    } else if (activeFiles === files.length) {
      type.active = true
    } else if (sharedFiles === files.length) {
      type.shared = true
    }

    if (checklistFiles === files.length) {
      type.checklist = true
    }

    return type
  }

  get panelButtons() {
    const docs = this.selected

    const filterRecipient = (a: Forms.Record) => !a.isInitiator

    const selected = {
      none: docs.length === 0,
      one: docs.length === 1,
      many: docs.length > 0,
      any: true,
      folder: docs.length === 1 && docs[0].isFolder,
      pendingForms:
        docs.length === 1 &&
        docs[0].actions &&
        docs[0].actions.filter(filterRecipient).length
    }

    const type = this.getType

    const isArchivedRoot = isPathEqual(this.getCurrentPath, Stx.PathArchived)

    const isSharedPage = isPathParent(Stx.PathShared, this.getCurrentPath)
    const isArchivedPage = isPathParent(Stx.PathArchived, this.getCurrentPath)
    const isChecklistPage = isPathParent(Stx.PathChecklist, this.getCurrentPath)
    const isDocumentRouterPath = this.$router.currentRoute.path === '/documents'
    const isSpecialFolder =
      !this.isFolderView || isSharedPage || isArchivedPage || isChecklistPage

    return [
      {
        view: ['folder_open', this.$text.PanelOpenFolder],
        active: selected.folder && selected.one,
        hidden: !this.isFolderView || !selected.one || !selected.folder,
        onClick: () => this.setCurrentPath(this.selected[0].path)
      },
      // {
      //   view: ['add', this.$text.SpaceNew],
      //   active: selected.any,
      //   hidden: !this.isFolderView || isSharedPage || isArchivedPage,
      //   onClick: () => (this.dialogs.isDocCreate = true)
      // },
      // {
      //   view: ['mdi-clipboard-plus', this.$text.FormSend],
      //   active: selected.any,
      //   hidden: !this.isFolderView || isSharedPage || isArchivedPage,
      //   onClick: () => (this.dialogs.isFormSend = true)
      // },
      {
        view: ['folder', this.$text.PanelCreateFolder],
        active: selected.any,
        hidden: isSpecialFolder,
        onClick: () => (this.dialogs.isFolderCreate = true)
      },
      {
        view: ['account_tree', this.$text.PanelMove],
        active: selected.one || selected.many,
        hidden: !type.active || type.checklist,
        onClick: () => (this.dialogs.isMove = true)
      },
      {
        view: ['close', this.$text.PanelDeleteFolder],
        active: selected.folder,
        hidden: !(type.folder && type.active) || !this.isFolderView,
        onClick: () => (this.dialogs.isFolderDelete = true)
      },
      {
        view: ['vertical_align_bottom', this.$text.PanelDownload],
        active: selected.many,
        hidden: selected.none || (selected.one && !docs[0].id),
        onClick: () => this.onDownloadSelected()
      },
      {
        view: ['history', this.$text.PanelHistory],
        active: selected.one && !selected.folder,
        hidden:
          selected.none || selected.folder || (selected.one && !docs[0].id),
        onClick: () => (this.drawers.isHistory = true)
      },
      {
        view: ['file_upload', this.$text.PanelUpload],
        active: selected.any,
        hidden: isSpecialFolder && (isDocumentRouterPath || !type.checklist),
        onClick: () => this.emitOpenUploader()
      },
      {
        view: ['archive', this.$text.PanelArchive],
        active: selected.many,
        hidden: !type.active || type.checklist,
        onClick: () => (this.dialogs.isArchive = true)
      },
      {
        view: ['mdi-clipboard-flow', this.$text.Requests],
        active: selected.one && !selected.folder,
        hidden: !type.active || type.folder || (selected.one && !docs[0].id),
        onClick: () => {
          this.drawers.isForms = true
          this.drawers.isFormsReceived = false
        }
      },
      {
        view: ['mdi-clipboard-arrow-down', this.$text.RequestsReceived],
        active: selected.one && selected.pendingForms,
        hidden: type.folder || selected.none || !selected.pendingForms,
        onClick: () => {
          this.drawers.isForms = true
          this.drawers.isFormsReceived = true
        }
      },
      {
        view: ['edit', this.$text.PanelRename],
        active: selected.one,
        hidden:
          !type.active || isChecklistPage || (selected.one && !docs[0].id),
        onClick: () => (this.dialogs.isRename = true)
      },
      {
        view: ['replay', this.$text.PanelRestore],
        active: selected.many,
        hidden: !type.archived || !isArchivedRoot,
        onClick: () => this.setArchiveDialog(true)
      },
      {
        view: ['mdi-stairs', this.$text.PanelVersionHistory],
        active: true,
        hidden: !selected.one || (selected.one && !docs[0].id),
        onClick: () => (this.dialogs.isVersionHistory = true)
      },
      {
        view: ['person_add', this.$text.Share],
        active: selected.one,
        hidden: !selected.one || (selected.one && !docs[0].id),
        onClick: () => (this.dialogs.isShare = true)
      },
      {
        view: ['mdi-account', this.$text.SharedWith],
        active: selected.one,
        hidden: !selected.one || (selected.one && !docs[0].id),
        onClick: () => (this.drawers.isShareList = true)
      }
    ]
  }

  // Defines buttons map for current page mode (order is important)

  get getArchiveDialogMsg() {
    if (this.dialogs.isRestoring) {
      return this.$text.ConfirmRestore
    }
    return this.$text.ConfirmArchive
  }

  // return all forms for selected document, if drawer is open
  get getSelectedForms() {
    if (!this.drawers.isForms || !this.selected[0]) {
      return []
    }
    const forms = (this.selected[0] && this.selected[0].actions) || []

    // Filter function - filter eithrer forms of initator or recipient
    let filterFunc = (a: Forms.Record) => a.isInitiator
    if (this.drawers.isFormsReceived) {
      filterFunc = (a: Forms.Record) => !a.isInitiator
    }
    // Filter and return forms
    return forms.filter(filterFunc)
  }

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  @Watch('documentsWithoutCategory')
  onChangeInDocumentsWithoutCategory() {
    this.dialogs.isDocumentCategory = this.documentsWithoutCategory.length > 0
  }

  @Watch('$route', { immediate: true, deep: true })
  onUrlChange(newVal: Route) {
    if (newVal.path === '/documents') {
      this.dialogs.isDocumentCategory = this.documentsWithoutCategory.length > 0
    }
  }

  // * === === === === === === === === === ===
  // * Emits

  onRenameOpen(suggestedName: string) {
    this.renameInitial = suggestedName
    this.dialogs.isRename = true
  }

  onRenameClose() {
    this.renameInitial = ''
    this.dialogs.isRename = false
  }

  emitOpenUploader() {
    this.$emit('onOpenUploader')
  }

  emitSelectOne(doc: Docs.Record) {
    this.$emit('onSelectOne', doc)
  }

  emitResetSelected() {
    this.$emit('onResetSelected')
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  onDownloadSelected() {
    const docsCount = this.selected.length
    this.$showSnack(this.$msg.documentsDownload, docsCount)

    // if single file is selected, and not folder - download file
    const doc = this.selected[0]

    if (docsCount === 1 && doc && !doc.isFolder) {
      downloadURI(doc.uri)
    } else {
      this.vuexDownload(this.selected)
    }
  }

  // Move files to new folder - VIEW FROM TREEVIEW, available only if no search
  moveFiles(pathAfter: string) {
    if (this.getCurrentPath.toLowerCase() === pathAfter.toLowerCase()) {
      const msg = this.$msg.documentsMoveSameFolder
      return this.$showSnack(msg, pathAfter)
    }
    // enable loading spinner
    this.isMovingFiles = true

    const documents = this.selected.map((d: Docs.Record) => d.id)
    this.vuexMoveDocs({ pathAfter, documents })
      .then(() => {
        this.isMovingFiles = false
        this.dialogs.isMove = false

        this.$showSnack(this.$msg.documentsMoveSuccess, pathAfter)
        this.emitResetSelected()
      })
      .catch(() => {
        this.isMovingFiles = false
        this.dialogs.isMove = false
        this.emitResetSelected()
      })
  }

  // Method for handling archiving and unarchiving records
  onArchiveSelected() {
    this.isWR = true

    const archived = this.dialogs.isRestoring ? false : true
    const documents = this.selected.map((d: Docs.Record) => d.id)

    this.vuexArchive({ archived, documents })
      .then(() => {
        // Close archive/restore dialogs
        this.setArchiveDialog(false)

        // Stop spinner and reset selected records
        this.isWR = false

        // TODO: test this after upgrading docs space page
        // Need to reset selected only if viewing folder structure
        if (this.isFolderView) {
          this.selectedSet([])
        }

        const msg = archived
          ? this.$msg.docsArchiveSuccess
          : this.$msg.docsRestoreSuccess
        this.$showSnack(msg, documents.length)
      })
      .catch(() => {
        this.isWR = false
        this.setArchiveDialog(false)
      })
  }

  setArchiveDialog(value = false) {
    this.dialogs.isRestoring = value
    this.dialogs.isArchive = value
  }

  handleFolderDelete() {
    this.isWR = true

    const folder = this.selected[0]

    this.vuexDeleteFolder(folder)
      .then(() => {
        this.isWR = false
        this.dialogs.isFolderDelete = false
        // Stop spinner and reset selected records
        this.emitResetSelected() // this is necessary only in folder view
        // TODO: show snackbar
      })
      .catch(() => {
        this.isWR = false
        this.dialogs.isFolderDelete = false
      })
  }

  onActionsDrawerClose() {
    this.drawers.isForms = false
    this.drawers.isFormsReceived = false
  }

  emitEvent(btn: { onClick: () => void }) {
    if (btn) {
      btn.onClick()
    }
  }

  // * Creating folder dialog event handler
  onCreateFolder(value: string) {
    this.isLoading = true
    this.vuexCreateFolder(value)
      .then((folder: Docs.Record) => {
        this.isLoading = false
        this.$showSnack(this.$msg.folderCreateSuccess)
        this.emitSelectOne(folder)
        this.dialogs.isFolderCreate = false
      })
      .catch(() => {
        this.isLoading = false
        // ? Error case snackbar is handled by backend (eg "folder already exists")
        this.dialogs.isFolderCreate = false
      })
  }

  // * === === === === === === === === === ===
  // * External - parent can open a drawer

  // Open appropriate drawer, based on value of input
  onOpenDrawer(name: DrawerTypes) {
    switch (name) {
      case DrawerTypes.history:
        this.drawers.isHistory = true
        return
      case DrawerTypes.forms:
        this.drawers.isForms = true
        return
      case DrawerTypes.share:
        this.dialogs.isShare = true
        return

      case DrawerTypes.formsReceived:
        this.drawers.isForms = true
        this.drawers.isFormsReceived = true
        return
    }
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  // * Renaming - handle cases for renamine files and folders
  onRename(value: string) {
    this.isLoading = true

    this.dialogs.isVersionHistory = false
    const payload = {
      name: value,
      edit: this.selected[0]
    }
    this.vuexRename(payload)
      .then(() => {
        this.isLoading = false
        this.dialogs.isRename = false
        this.$showSnack(this.$msg.fileRenameSuccess)
      })
      .catch(() => {
        this.isLoading = false
      })
  }

  onDocCreate(name: string) {
    this.isLoading = true
    const path = this.getCurrentPath

    this.vuexDocCreate({ name, path })
      .then(() => {
        this.isLoading = false
        this.dialogs.isDocCreate = false
        this.$showSnack(this.$msg.fileRenameSuccess) // TODO:
      })
      .catch(() => {
        this.isLoading = false
      })
  }
}
</script>

<template>
  <div>
    <ButtonsPanel :buttons="panelButtons" @btnClick="emitEvent" />

    <!-- 🌙 Dialogs 🌙 -->
    <!-- Moving Folder -->
    <FolderMoveDialog
      v-if="dialogs.isMove"
      v-model="dialogs.isMove"
      :isLoading="isMovingFiles"
      @onMoveFiles="moveFiles"
    />
    <!-- Confirm: archiving/restoring record -->
    <ConfirmationDialog
      v-if="dialogs.isArchive"
      v-model="dialogs.isArchive"
      :title="$i18n.tc($msg.SelectedRecords, selected.length)"
      :body="getArchiveDialogMsg"
      :action="onArchiveSelected"
      :submitButtonText="dialogs.isRestoring ? $text.Restore : $text.Archive"
      :isLoading="isWR"
    />

    <!-- Drawer: viewing document history -->
    <DocsHistoryDrawer
      v-if="drawers.isHistory"
      v-model="drawers.isHistory"
      :document="selected[0]"
    />

    <!-- Dialog: sharing document -->
    <SharingDialog
      v-if="dialogs.isShare"
      v-model="dialogs.isShare"
      :file="selected[0]"
    />

    <!-- Dialog: create form-->
    <!-- <SharingDialog v-if="dialogs.isFormSend" v-model="dialogs.isFormSend" /> -->

    <!-- Drawer: forms drawer -->
    <TheActionsDrawer
      v-if="drawers.isForms"
      v-model="drawers.isForms"
      @onClose="onActionsDrawerClose"
      :document="selected[0]"
      :actions="getSelectedForms"
      :isActionsInitiator="!drawers.isFormsReceived"
    />

    <!-- Drawer: list of shared users -->
    <ShareListDrawer
      v-if="drawers.isShareList"
      v-model="drawers.isShareList"
      :list="selected[0].recipients"
    />

    <!-- Dialog: deleting folder -->
    <ConfirmationDialog
      v-if="dialogs.isFolderDelete"
      v-model="dialogs.isFolderDelete"
      :title="$text.ConfirmDeleteFolderTitle"
      :body="$text.ConfirmDeleteFolder"
      :action="handleFolderDelete"
      :submitButtonText="$text.Delete"
      :isLoading="isWR"
    />

    <!-- Dialog: version history -->
    <VersionHistoryDialog
      v-if="dialogs.isVersionHistory"
      v-model="dialogs.isVersionHistory"
      :edit="selected[0]"
      @onRename="onRenameOpen"
    />

    <!-- Dialog: set document type -->
    <DocumentCategoryDialog
      v-if="dialogs.isDocumentCategory"
      v-model="dialogs.isDocumentCategory"
    />

    <!-- * Create doc-->
    <AskText
      v-if="dialogs.isDocCreate"
      v-model="dialogs.isDocCreate"
      :title="$text.NewDocumentTitle"
      :inputTitle="$text.DocumentName"
      :btnSubmit="$text.Save"
      :btnCancel="$text.Cancel"
      :isLoading="isLoading"
      :badChars="['/']"
      @onSubmit="onDocCreate"
      @onCancel="dialogs.isDocCreate = false"
    />

    <!-- * Renaming record -->
    <AskText
      v-if="dialogs.isRename"
      v-model="dialogs.isRename"
      :title="$text.RenameDialogTitle"
      :inputTitle="$text.FolderName"
      :btnSubmit="$text.Save"
      :btnCancel="$text.Cancel"
      :isLoading="isLoading"
      :badChars="['/']"
      :notEqual="selected[0] ? [selected[0].name] : []"
      :initial="renameInitial || (selected[0] && selected[0].name) || ''"
      @onSubmit="onRename"
      @onCancel="onRenameClose"
    />
    <!-- * Folder create -->
    <AskText
      v-if="dialogs.isFolderCreate"
      v-model="dialogs.isFolderCreate"
      :title="$text.FolderCreateTitle"
      :inputTitle="$text.FolderName"
      :btnSubmit="$text.Save"
      :btnCancel="$text.Cancel"
      :isLoading="isLoading"
      :badChars="['/']"
      @onSubmit="onCreateFolder"
      @onCancel="dialogs.isFolderCreate = false"
    />
  </div>
</template>
