<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Stx from '@/types/stx.ts'
import { getParentPath, isPathEqual, isPathParent } from '@/utils/helpers'
import TheTableActions from '@/components/TheTableActions.vue'
import TheTableIcon from '@/components/TheTableIcon.vue'

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  components: {
    TheTableActions,
    TheTableIcon
  }
})
export default class TheDocsTableRow extends Vue {
  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop() item: Docs.Record
  @Prop() selectedDocs: Docs.Record[]
  @Prop(Boolean) isSearch: boolean
  @Prop(Boolean) isHighlighted: boolean
  @Prop(Boolean) isSharedPath: boolean
  @Prop(Boolean) isPageShared: boolean

  // * === === === === === === === === === ===
  // * Computed 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙

  get selected() {
    return this.selectedDocs
  }

  set selected(value) {
    this.$emit('update:selectedDocs', value)
  }

  get isSmallScreen() {
    return (
      this.$vuetify.breakpoint.xs ||
      this.$vuetify.breakpoint.sm ||
      this.$vuetify.breakpoint.md
    )
  }

  get isItemSpecial() {
    const path = this.item.path
    const isArchived = isPathEqual(path, Stx.PathArchived)
    const isShared = isPathEqual(path, Stx.PathShared)
    const isChecklist = isPathEqual(path, Stx.PathChecklist)
    return this.item.isFolder && (isArchived || isShared || isChecklist)
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  openHistoryDrawer(id: string) {
    this.$emit('openHistoryDrawer', id)
  }

  openActionsDrawer(doc: Docs.Record, isRecipient = false) {
    this.$emit('openActionsDrawer', doc, isRecipient)
  }

  getParentPath(path: string) {
    return getParentPath(path)
  }

  gotoParent(path: string) {
    const parentPath = getParentPath(path)
    this.gotoPath(parentPath)
  }

  isShared(doc: Docs.Record) {
    return isPathParent(Stx.PathShared, doc.path)
  }

  // === === === === === === === === === ===
  // Emits

  onRowClick() {
    this.$emit('onRowClick', this.item.id)
  }

  addSelected(id: string) {
    this.$emit('addSelected', id)
  }

  gotoPath(path: string) {
    this.$emit('gotoPath', path)
  }

  onDragEnter() {
    this.$emit('onDragEnter')
  }

  gotoFolder() {
    this.$emit('gotoFolder')
  }
}

// TODO: see if there are issues with not considering throttleFolderClick variable
// 'non-draggable': isSmallScreen   || throttleFolderClick,

// TODO: check if works without this
// 'highlight-row':  item.isFolder && highlightedRow === item.id && isMovingFiles,
</script>

<template>
  <tr
    :class="{
      highlighted: isHighlighted,
      'is-special non-draggable': isItemSpecial
    }"
    @dblclick="gotoFolder"
    @dragenter="onDragEnter"
    class="table-row"
  >
    <!-- MOBILE -->
    <template v-if="$vuetify.breakpoint.xs">
      <td class="pa-1 pt-3 pb-3">
        <div class="mobile-row">
          <div class="section-checkbox">
            <v-checkbox
              v-if="!isItemSpecial"
              v-model="selected"
              :value="item"
              primary
              class="selector-checkbox non-draggable"
              :key="item.id"
              @click.stop.prevent="addSelected(item.id)"
            />
          </div>

          <div class="section-info">
            <!-- INFO - FIRST ROW: title -->
            <!-- Name: name plus extension: show icon -->
            <TheTableIcon
              :item="item"
              @gotoFolder="gotoFolder(item)"
              @openActionsDrawer="openActionsDrawer(item, true)"
            />
            <!-- INFO: SECOND ROW -->
            <div>
              <div>
                <!-- Forms -->
                <span v-if="!isPageShared">
                  <span v-if="item.isFolder" />
                  <TheTableActions
                    v-else
                    @onClick="openActionsDrawer(item)"
                    :item="item"
                  />
                </span>
                <span v-if="!item.isFolder" class="ma-3">-</span>
              </div>

              <!-- Path -->
              <div v-if="isSearch">
                <a
                  v-if="item.isFolder"
                  @click="gotoFolder(getParentPath(item.path))"
                >
                  {{ getParentPath(item.path) }}
                </a>
                <a v-else @click="gotoFolder(item.path)">{{ item.path }}</a>
              </div>
            </div>
          </div>

          <div class="section-extras">
            <!-- DATE -->
            <div>
              <div
                v-if="item.isFolder"
                :title="$text.CreatedAt"
                class="nowrap mobile-date"
              >
                {{ item.uploaded | formatDateSmall }}
              </div>
              <a v-else @click.stop="openHistoryDrawer(item)" class="nowrap">
                {{ item.uploaded | formatDateSmall }}
              </a>
            </div>

            <!-- SIZE: format to human-readable -->
            <div class="nowrap">
              <span v-if="item.isFolder">
                {{ $i18n.tc($msg.FolderSize, item.filesCount) }}
              </span>
              <span v-else>{{ item.size | filesize }}</span>
            </div>
          </div>
        </div>
      </td>
    </template>

    <!-- DESKTOP  -->
    <template v-else>
      <td style="padding-right:0">
        <v-checkbox
          v-if="!isItemSpecial"
          v-model="selected"
          :value="item"
          primary
          class="selector-checkbox non-draggable"
          :key="item.id"
          @click.stop.prevent="addSelected(item.id)"
        />
      </td>
      <!-- Name: name plus extension: show icon -->
      <td style="padding-left: 5px">
        <TheTableIcon
          :item="item"
          @gotoFolder="gotoFolder(item)"
          @openActionsDrawer="openActionsDrawer(item, true)"
          style="display: flex; align-items: center"
        />
      </td>
      <!-- File category -->
      <td>
        <span v-if="!item.isFolder">
          {{ item.category ? item.category : item.documentType }}
        </span>
      </td>

      <td>{{ item.extension }}</td>
      <!-- Upload date: format -->
      <td>
        <span v-if="item.isFolder" :title="$text.CreatedAt">
          {{ item.uploaded | formatDate }}
        </span>
        <a v-else @click.stop="openHistoryDrawer(item)">
          {{ item.uploaded | formatDate }}
        </a>
      </td>
      <!-- File size: format to human-readable -->
      <td>
        <span v-if="item.isFolder">
          {{ $i18n.tc($msg.FolderSize, item.filesCount) }}
        </span>
        <span v-else>{{ item.size | filesize }}</span>
      </td>
      <!-- Forms -->
      <td v-if="!isPageShared">
        <span v-if="item.isFolder" />
        <TheTableActions
          v-else
          @onClick="openActionsDrawer(item)"
          :item="item"
        />
      </td>
      <!-- Path -->
      <td v-if="isSearch">
        <a v-if="item.isFolder" @click="gotoFolder(getParentPath(item.path))">
          {{ getParentPath(item.path) }}
        </a>
        <a v-else @click="gotoPath(item.path)">{{ item.path }}</a>
      </td>
    </template>
  </tr>
</template>

<style lang="scss" scoped>
$colorSpecial: rgba(255, 166, 71, 0.08);
$colorSpecialHl: rgba(255, 166, 71, 0.12);

.table-row {
  &.highlighted {
    background: #fafaff !important;
    box-shadow: 0px 8px 8px -8px #00000070 inset,
      0px -15px 15px -23px #00000070 inset;

    transition: none;
  }

  &.is-special {
    background: $colorSpecial !important;

    &:hover {
      background: $colorSpecialHl !important;
    }
  }

  .mobile-row {
    display: flex;

    .section-checkbox {
      padding-right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .section-info {
      padding-right: 0;
      flex: 1 1 0;
    }

    .section-extras {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-end;

      > div {
        justify-content: flex-start;
      }

      .date {
        flex-grow: 1;
      }
    }
  }

  .nowrap {
    white-space: nowrap;
  }

  // COPIED FROM TABLE
  transition: border-color 0.3s ease-in-out;
  transition: background-color 0.3s ease-in-out;

  &:hover:not(.v-data-table__expand-row) {
    background: unset;
  }

  // handle issues with sortablejs - checkbox problem
  &:not(.sortable-chosen) {
    transform: unset !important;
  }
  &.sortable-chosen:not(.sortable-drag) {
    transform: unset !important;
  }
  &.sortable-chosen {
    transform: unset !important;
    background: none !important;

    &.sortable-ghost {
      background: #dddddd !important;
    }
  }

  &.sortable-ghost {
    display: none;
  }

  &.sortable-drag .selector-checkbox {
    display: none !important;
  }

  &.sortable-chosen {
    position: relative !important;
    margin: 0;
  }

  .selector-checkbox {
    height: 32px;
    margin: 0;

    v-input--selection-controls:not(.v-input--hide-details) .v-input__slot {
      margin-bottom: 0 !important;
    }
    v-input--selection-controls__input {
      margin: 0 !important;
    }
  }

  &.selected,
  &.selected:hover {
    background: #dddddd !important;

    // Borders: add to cells
    &:not(:last-child) {
      border-bottom: 1px solid rgba(0, 0, 0, 0);
    }
  }
  // Borders: remove from row
  &:not(:last-child) {
    border-bottom: none;
  }

  // Borders: add to cells
  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }
}
</style>
