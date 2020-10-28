<script lang="ts">
import _ from 'lodash'
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { DocsS } from '@/types/'
import Stx from '@/types/stx.ts'
import { listToTree, isPathParent } from '@/utils/helpers'
import Dialog from '@/mixins/Dialog.ts'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

type Rule = (v: string) => string | true // validation rule type
interface Form extends Element {
  validate: () => null
}
interface VueRef extends Element {
  focus(): () => void
}

type Doc = Docs.Record

export interface Folder {
  name: string
  id: string
  path: string
  children?: Folder[]
  parentId?: string
}

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

const ROOT_FOLDER_ID = '-1'

@Component({
  mixins: [Dialog]
})
export default class FolderMoveDialog extends Mixins(Dialog) {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(...DocsS.records) documents: Doc[]
  @A(...DocsS.createFolder) vuexCreateFolder: Docs.CreateFolderA

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  open = [ROOT_FOLDER_ID]
  files = {
    html: 'mdi-language-html5',
    js: 'mdi-nodejs',
    json: 'mdi-json',
    md: 'mdi-markdown',
    pdf: 'mdi-file-pdf',
    png: 'mdi-file-image',
    txt: 'mdi-file-document-outline',
    xls: 'mdi-file-excel'
  }
  tree = []
  selected: string[] = []

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop(Boolean) isLoading: boolean // Show loader icon if true

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get folders() {
    // # Filter for getting only folder
    const filterFolders = ({ isFolder }: Doc) => !!isFolder

    //  Should not be shared, only root of archived is allowed
    const filterAllowed = ({ path }: Doc) => {
      const noArchive = !isPathParent(Stx.PathArchived, path)
      const noShared = !isPathParent(Stx.PathShared, path)
      const noChecklist = !isPathParent(Stx.PathChecklist, path)
      return noArchive && noShared && noChecklist
    }

    // # Mapper to compose folder object
    const mapper = (doc: Docs.Record) => {
      return { name: doc.name, id: doc.id, path: doc.path }
    }

    // # Sort by name

    let folders: Folder[] = this.documents
      .filter(filterFolders)
      .filter(filterAllowed)
      .map(mapper)

    // sort by name
    const primarySorter = (doc: Doc) => doc.name.toLowerCase()
    folders = _.orderBy(folders, primarySorter, 'asc') as Folder[]

    // # Tree structure - drop each obj into appropriate parent, retain sort order

    return [
      {
        id: ROOT_FOLDER_ID,
        name: 'Documents',
        path: '/',
        children: listToTree(folders)
      }
    ]
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  mounted() {
    setTimeout(() => {
      const nameInput = this.$refs.nameInput as VueRef
      nameInput?.focus()
    }, 300)
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  // onSubmitForm: validate form and either update or create record
  onSubmitForm() {
    // cancel form submit if already submitted or form is invalid
    if (this.isLoading || !this.isOpen) {
      return false
    }

    const folderId = this.selected[0]

    // Handle the case of root folder
    if (folderId === ROOT_FOLDER_ID) {
      return this.$emit('onMoveFiles', '/')
    }

    const folder = this.documents.find((d) => d.id === folderId)

    if (!folder) {
      return
    }

    this.$emit('onMoveFiles', folder.path)
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    persistent
    max-width="600px"
    @keydown.esc="isOpen = false"
    id="crud-dialog"
    scrollable
  >
    <v-card>
      <v-card-title>{{ $text.SelectFolder }}</v-card-title>
      <v-divider></v-divider>

      <v-card-text style="height: 500px;">
        <v-flex xs12 class="treeview" pt-5>
          <v-treeview
            activatable
            :active.sync="selected"
            :open="open"
            hoverable
            :items="folders"
            item-key="id"
            rounded
          >
            <template v-slot:prepend="{ item, open }">
              <v-icon v-if="!item.file" color="#ffc107">
                {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
              </v-icon>
              <v-icon v-else>{{ files[item.file] }}</v-icon>
            </template>
          </v-treeview>
        </v-flex>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="isLoading" color="secondary" @click="isOpen = false">
          {{ $text.Cancel }}
        </v-btn>
        <v-btn
          :disabled="isLoading || selected.length === 0"
          :loading="isLoading"
          color="accent"
          @click="onSubmitForm"
        >
          {{ $text.Select }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss">
.v-treeview > .v-treeview-node--leaf {
  margin-left: 0;

  .v-treeview-node__root {
    padding-left: 24px;
  }
}
</style>
