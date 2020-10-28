<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { DocsS } from '@/types/'
import Stx from '@/types/stx.ts'
import { getParentPath, isPathParent, finderById } from '@/utils/helpers'
import { Sortable } from 'sortablejs'
import { i18n } from '@/plugins/i18n'
import TheDocsTableRow from '@/components/TheDocsTableRow.vue'
import _ from 'lodash'
import TheDocsGotoParent from '@/components/TheDocsGotoParent.vue'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sortablejs = any
type Record = Docs.Record
interface MenuRef extends Vue {
  open(e: MouseEvent): (e: MouseEvent) => void
}

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

const makeHeaderObj = (name: string, label: string, sortable = true) => {
  return {
    text: i18n.tc(label),
    value: name,
    sortable
  }
}

@Component({
  components: { TheDocsTableRow, TheDocsGotoParent }
})
export default class TheDocsTable extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @A(...DocsS.archive) vuexArchive: Docs.ArchiveA
  @G(...DocsS.getCurrentPath) getCurrentPath: string
  @A(...DocsS.setCurrentPath) setCurrentPath: Docs.SetCurrentPathA
  @A(...DocsS.moveDocs) vuexMoveDocs: Docs.MoveDocsA
  @A(...DocsS.sort) vuexDocsSort: any
  @A(...DocsS.updateSearchQuery) updateSearchQuery: Docs.UpdateSearchA
  @A(...DocsS.setFolder) setFolder: Docs.SetFolderA

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop() page: Docs.Record[]
  @Prop() selected: Docs.Record[]
  @Prop(Number) itemsCount: number
  @Prop(Boolean) isSearch: boolean
  @Prop(Boolean) isPageShared: boolean // sharePage won't have requests column
  @Prop(Boolean) disableDrag: boolean
  @Prop(Boolean) isAllSelected: boolean

  // * === === === === === === === === === ===
  // * Data  🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏

  isDraggingFiles = false
  sortable: Sortablejs = null
  highlightedRow = '-1'
  throttleFolderClick = false

  // * === === === === === === === === === ===
  // * Computed 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙

  get headers() {
    const headers: Types.Header[] = [
      {
        // text: 'Icon',
        sortable: false,
        value: 'selector',
        width: 30
      },
      makeHeaderObj('name', 'Name'),
      makeHeaderObj('category', 'Category'),
      {
        text: this.$text.Extension,
        value: 'extension',
        width: 120
      },
      makeHeaderObj('uploaded', 'Uploaded'),
      makeHeaderObj('size', 'Size')
    ]

    if (!this.isPageShared) {
      headers.push(makeHeaderObj('actionRequests', 'Forms', false))
    }
    if (this.isSearch) {
      headers.push(makeHeaderObj('path', 'Path'))
    }

    return headers
  }

  get isSmallScreen() {
    return (
      this.$vuetify.breakpoint.xs ||
      this.$vuetify.breakpoint.sm ||
      this.$vuetify.breakpoint.md
    )
  }

  get isSharedPath() {
    return isPathParent(Stx.PathShared, this.getCurrentPath)
  }

  // * === === === === === === === === === ===
  // * Hooks 🦅 🦅 🦅 🦅 🦅 🦅 🦅 🦅 🦅 🦅 🦅

  mounted() {
    const table: HTMLElement | null = document.querySelector(
      '.users-table.v-data-table tbody'
    )
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const comp = this

    this.sortable = Sortable.create(table, {
      onMove() {
        return false
      },

      onStart(evt: any) {
        // compare 2 different lists, if differrent - means user drags non-selected row - hl it
        const allIdsTable = evt.items.map((i: any) => i.dataset.id).sort()
        const allIdsComp = comp.selected.map((i: Record) => i.id).sort()
        comp.isDraggingFiles = true

        if (
          evt.items.length === 0 ||
          !_.isEqual(allIdsTable, allIdsComp) ||
          !allIdsTable.includes(evt.item.dataset.id)
        ) {
          comp.resetSelected()
          comp.addSelected(evt.item.dataset.id)
        }
      },

      onEnd() {
        const dropId = comp.highlightedRow
        const findFolderById = (d: Record) => d.id === dropId && d.isFolder
        const folder = comp.page.find(findFolderById)

        // If path for moving is present (parent of folder) - move files there, otherwise reset table
        if (dropId === 'parent' || folder) {
          // Calculate path for moving: check drop folder, then get path (folder or parent path)
          const path = folder ? folder.path : getParentPath(comp.getCurrentPath)
          comp.moveTo(path)
        } else {
          comp.resetSortable()
        }

        comp.highlightedRow = '-1'
        comp.isDraggingFiles = false

        comp.rerenderTable() // Rerender table if drop event is over - reset rows, selection
      },

      setData(dataTransfer: any, dragEl: any) {
        // Set the new stylized "drag image" of the dragged element

        const myGhost = document.getElementById('my-ghost')
        const ghostText = document.getElementById('ghost-text')
        if (!myGhost || !ghostText) {
          return
        }

        // Count Files: If dragged el is in total array - count all, else - means only 1 file is selected
        // Needed because correct comp.selected list is updated after this logic is completed
        let countFiles = 1
        const selectedIds = comp.selected.map((i: Record) => i.id).sort()
        const draggedId = dragEl.dataset.id
        if (selectedIds.includes(draggedId)) {
          countFiles = comp.selected.length
        }

        // Update text of the HTML element
        ghostText.innerHTML = String(countFiles)
        dataTransfer.setDragImage(myGhost, 0, 0)
      },

      // Called when an item is selected / deselected
      onSelect(evt: any) {
        comp.resetSelected()
        comp.addSelected(evt.item.dataset.id)
      },

      onDeselect(evt: any) {
        comp.resetSelected()
        comp.addSelected(evt.item.dataset.id)
      },

      filter: '.non-draggable',
      multiDrag: true,
      selectedClass: 'selected'
    })

    // fix deselecting items on outside-click
    const deselectMultiDrag = this.sortable.multiDrag._deselectMultiDrag
    document.removeEventListener('pointerup', deselectMultiDrag, false)
    document.removeEventListener('mouseup', deselectMultiDrag, false)
    document.removeEventListener('touchend', deselectMultiDrag, false)
  }

  // * === === === === === === === === === ===
  // * Watchers 👀 👀 👀 👀 👀 👀 👀 👀 👀 👀

  // * Upon selected records update - sync to sortable
  @Watch('selected') syncSortable() {
    // Deselect sortable records, that are no longer selected
    const selected = document.querySelectorAll('.selected')
    selected.forEach((row) => {
      const id = row.getAttribute('data-id') || ''
      const findById = finderById(id)
      const staysSelected = this.selected.find(findById)

      if (!staysSelected) {
        Sortable.utils.deselect(row)
      }
    })

    // Sortable-select all local `selected` records by element's data prop
    setTimeout(() => {
      this.selected.forEach((doc: Docs.Record) => {
        const el = document.querySelector(`[data-id='${doc.id}']`)
        if (el) {
          Sortable.utils.select(el)
        }
      })
    }, 100)
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  onRowClick(id: string, isDragging = false) {
    this.$emit('onRowClick', id, isDragging || this.isDraggingFiles)
  }

  // Move files to new folder
  moveTo(pathAfter: string) {
    // * Handle exception-case if dropped path is shared
    const isDropShared = isPathParent(Stx.PathShared, pathAfter)

    // * Prevent moving files if disableDrag prop is set (moving is forbidden eg when in Archive)
    if (this.disableDrag || isDropShared) {
      this.resetSortable()
      this.$showSnack(this.$msg.disallowMove)
      return
    }

    const documents = this.selected.map((d: Record) => d.id)

    // * Handle exception-case if dropped path is archive
    const isDropArchive = isPathParent(Stx.PathArchived, pathAfter)
    if (isDropArchive) {
      this.vuexArchive({ archived: true, documents }).then(() => {
        // Show snackbar
        this.$showSnack(this.$msg.docsArchiveSuccess, documents.length)
      })
      this.resetSelected()
      return
    }

    // * Move documents
    this.vuexMoveDocs({ pathAfter, documents }).then(() => {
      this.$showSnack(this.$msg.documentsMoveSuccess, pathAfter)
    })
    this.resetSelected()
  }

  addSelected(id: string) {
    this.$emit('onAddSelected', id)
  }

  openHistoryDrawer(id: string) {
    this.$emit('openHistoryDrawer', id)
  }

  openActionsDrawer(doc: Record, isRecipient = false) {
    this.$emit('openActionsDrawer', doc, isRecipient)
  }

  resetSelected(isLightReset = false) {
    this.$emit('onResetSelected', isLightReset)
  }

  /*
      This block is intended to fix the issue with table items being "cramped" together
      after drag event has been cancelled
      why it works - I'd guess doz it forces to refresh table by recomputing computed prop `items` at docsPage,
      since it relies on "currentPath" state, which is forced to update using following lines
  */
  rerenderTable() {
    const currentPath = this.getCurrentPath
    this.setFolder('/diginex-trust')

    this.$nextTick(() => {
      this.setFolder(currentPath)
    })
  }

  updateCurrentPath(path: string) {
    this.resetSelected()
    this.$emit('paginatorReset')
    this.updateSearchQuery()

    // needed to prevent over-click
    setTimeout(() => {
      this.setCurrentPath(path)
    }, 100)
  }

  // dispatch to sort state items
  customSort(items: Record[], index: string[], isDesc: boolean[]) {
    const payload = {
      order: isDesc[0] ? 'desc' : 'asc',
      field: index[0] ? index[0] : ''
    }

    // if successfully sorted - reset selected items list
    this.vuexDocsSort(payload).then(() => {
      this.resetSelected()
    })
    return items
  }

  getParentPath(path: string) {
    return getParentPath(path)
  }

  // if table is left - reset highlighted row
  onTableLeave(evt: any) {
    if (evt && evt.dataTransfer.dropEffect === 'none') {
      this.highlightedRow = '-1'
    }
  }

  // if doc is folder - go there, else - if doc is not set - goto parent
  gotoFolder(doc?: Record) {
    if ((doc && !doc.isFolder) || this.throttleFolderClick) {
      return
    }
    const path = doc ? doc.path : getParentPath(this.getCurrentPath)

    this.resetSelected()
    this.throttleFolderClick = true
    this.updateCurrentPath(path)

    setTimeout(() => {
      this.throttleFolderClick = false
    }, 500)
  }

  selectAll() {
    this.$emit('onSelectAll')
  }

  // * Sortablejs reset selected (highlighted rows)
  resetSortable() {
    const selected = document.querySelectorAll('.selected')
    selected.forEach((row) => {
      Sortable.utils.deselect(row)
    })

    setTimeout(() => {
      this.selected.forEach((doc) => {
        const el = document.querySelector(`[data-id='${doc.id}']`)
        Sortable.utils.select(el)
      })
    }, 100)
  }
}
</script>

<template>
  <div @dragleave="onTableLeave">
    <div id="my-ghost" class="ghost-placeholder">
      <img width="50" src="/img/files.svg" />
      <div class="ghost-placeholder__container" id="ghost-text"></div>
    </div>
    <v-data-table
      :headers="headers"
      :items="page"
      class="elevation-1 users-table"
      item-key="id"
      disable-pagination
      hide-default-footer
      :class="{ empty: itemsCount === 0, 'use-hover': !isDraggingFiles }"
      no-data-text="No documents found"
      :custom-sort="customSort"
      ref="dataTable"
      must-sort
      sort-by="name"
    >
      <template v-slot:header.selector>
        <v-checkbox
          :value="isAllSelected"
          primary
          class="selector-checkbox non-draggable"
          @click.stop.prevent="selectAll"
        />
      </template>

      <!-- Goto Parent -->
      <template v-slot:body.prepend>
        <TheDocsGotoParent
          :isSharedPath="isSharedPath"
          :getCurrentPath="getCurrentPath"
          :isSearch="isSearch"
          :highlightedRow="highlightedRow"
          @gotoFolder="gotoFolder"
          @onHighlight="highlightedRow = 'parent'"
        />
      </template>

      <!-- `handle` class serves as a handle for dragging row around -->
      <template v-slot:item="{ item }">
        <TheDocsTableRow
          :data-id="item.id"
          @gotoFolder="gotoFolder(item)"
          @onDragEnter="highlightedRow = item.id"
          :isHighlighted="item.isFolder && highlightedRow === item.id"
          :class="{
            'non-draggable': isSmallScreen || throttleFolderClick
          }"
          :item="item"
          :selectedDocs.sync="selected"
          :isSearch="isSearch"
          :isSharedPath="isSharedPath"
          :isPageShared="isPageShared"
          :highlightedRow="highlightedRow"
          @gotoPath="updateCurrentPath"
          @onRowClick="onRowClick"
          @addSelected="addSelected"
          @openHistoryDrawer="openHistoryDrawer"
          @openActionsDrawer="openActionsDrawer"
        />
      </template>
    </v-data-table>
  </div>
</template>

<style lang="scss">
$headerBg: #ffffff;
$colorAccent: #cc2531;

$colorSpecial: rgba(255, 166, 71, 0.08);
$colorSpecialHl: rgba(255, 166, 71, 0.12);

.users-table {
  z-index: 3;
  opacity: 1;
  transition: opacity 300ms ease;

  a {
    text-decoration: underline;

    &:hover {
      color: $colorAccent;
    }
  }

  .nowrap {
    white-space: nowrap;
  }

  // VUETIFY STYLES OVERRIDE
  &.v-data-table {
    -webkit-box-shadow: none !important;
    box-shadow: none !important;
    color: #666666;
    position: relative !important; // set table pos to relative, to extract checkboxes

    &.use-hover tbody tr:hover:not(.v-data-table__expand-row):not(.selected) {
      background: rgba(0, 0, 0, 0.05) !important;

      &.is-special {
        background: $colorSpecialHl !important;
      }
    }

    tr.highlight-row {
      background: #fafaff !important;
      box-shadow: 0px 8px 8px -8px #00000070 inset,
        0px -15px 15px -23px #00000070 inset;

      transition: none;
    }

    tr.is-special {
      background: $colorSpecial !important;
      transition: none;
    }

    tr.disable-row {
      pointer-events: none;
    }

    // Cell styles: header
    th {
      color: #999999 !important;
      background: $headerBg !important;
    }

    .sent-requests-link {
      text-decoration: none;
    }
  }
}

.ghost-placeholder {
  top: -999999px;
  left: -999999px;
  width: 50px;
  height: 55px;
  color: #555555;
  padding: 0;
  font-size: 1rem;
  position: absolute;
  z-index: 4;

  &__container {
    position: absolute;
    left: 5px;
    top: 0px;
    right: 13px;
    bottom: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
