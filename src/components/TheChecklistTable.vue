<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { i18n } from '@/plugins/i18n'
import TheChecklistTableRow from '@/components/TheChecklistTableRow.vue'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

const makeHeaderObj = (
  name: string,
  label: string,
  width = 0,
  sortable = false
) => {
  const header = {
    text: i18n.tc(label),
    value: name,
    sortable
  }
  return width <= 0 ? header : { ...header, width }
}

@Component({
  components: {
    TheChecklistTableRow
  }
})
export default class TheChecklistTable extends Vue {
  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop() documents: Docs.ChecklistRecord[]
  @Prop(Boolean) isSearch: boolean

  // * === === === === === === === === === ===
  // * Data  🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏

  // * === === === === === === === === === ===
  // * Computed 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙

  get headers(): Types.Header[] {
    return [
      makeHeaderObj('category', 'Category'),
      makeHeaderObj('name', 'Name'),
      makeHeaderObj('description', 'Description'),
      makeHeaderObj('uploaded', 'Uploaded'),
      makeHeaderObj('isUploaded', 'IsUploaded', 50),
      makeHeaderObj('verified', 'Verified', 50),
      makeHeaderObj('select', 'Select', 50),
      makeHeaderObj('btnUpload', ' ')
    ]
  }

  // * === === === === === === === === === ===
  // * Hooks 🦅 🦅 🦅 🦅 🦅 🦅 🦅 🦅 🦅 🦅 🦅

  // * === === === === === === === === === ===
  // * Watchers 👀 👀 👀 👀 👀 👀 👀 👀 👀 👀

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  openHistoryDrawer(id: string) {
    this.$emit('openHistoryDrawer', id)
  }

  onSelectChecked(itemCategory: string) {
    this.$emit('onAddSelected', itemCategory)
  }

  openActionsDrawer(doc: Document, isRecipient = false) {
    this.$emit('openActionsDrawer', doc, isRecipient)
  }

  uploadFile(documentType: string) {
    this.$emit('uploadFile', documentType)
  }
}
</script>

<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="documents"
      class="elevation-1 users-table"
      item-key="_id"
      disable-pagination
      hide-default-footer
      :class="{ empty: documents.length === 0 }"
      no-data-text="No documents found"
      ref="dataTable"
    >
      <template v-slot:item="{ item }">
        <TheChecklistTableRow
          :data-id="item.id"
          :item="item"
          :isSearch="isSearch"
          @onSelectChecked="onSelectChecked"
          @openHistoryDrawer="openHistoryDrawer"
          @openActionsDrawer="openActionsDrawer"
          @uploadFile="uploadFile"
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
</style>
