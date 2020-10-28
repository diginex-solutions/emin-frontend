<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Stx from '@/types/stx.ts'
import { isPathEqual } from '../utils/helpers'
import { Routes } from '../router'

const MAX_FILENAME = 40

@Component({})
export default class TheTableIcon extends Vue {
  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop() item: Docs.Record

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get isSmallScreen() {
    return (
      this.$vuetify.breakpoint.xs ||
      this.$vuetify.breakpoint.sm ||
      this.$vuetify.breakpoint.md
    )
  }

  // Returns icon. Exception for shared and archived folders
  get getFolderIcon() {
    const colorSpecial = '#ffa647'
    let color = '#ffc107'
    let icon = 'folder'

    const path = this.item.path
    if (isPathEqual(path, Stx.PathArchived)) {
      color = colorSpecial
      icon = 'mdi-folder-remove'
    } else if (isPathEqual(path, Stx.PathShared)) {
      color = colorSpecial
      icon = 'mdi-folder-account'
    } else if (isPathEqual(path, Stx.PathChecklist)) {
      color = colorSpecial
      icon = 'mdi-folder-text'
    }

    return {
      color,
      icon
    }
  }

  get getShortFilename() {
    const { name = '' } = this.item || {}
    if (this.item.isFolder) {
      return name
    }

    return name.length > MAX_FILENAME
      ? `${name.substring(0, MAX_FILENAME)}...`
      : name
  }

  get getFilenameTooltip() {
    if (this.item.isFolder) {
      return ''
    }

    const { name = '' } = this.item || {}
    return name.length > MAX_FILENAME ? name : ''
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  // Returns true if has at least one action with given type
  anyActions(status: 'pending' | 'rejected' | 'accepted') {
    const filterRecipient = (a: Forms.Record) => !a.isInitiator
    const filterStatus = (d: Forms.Record) => d.status === status

    const actions = this.item.actions || []
    return actions.filter(filterRecipient).filter(filterStatus).length > 0
  }

  // only if small screen
  gotoFolder() {
    if (this.isSmallScreen) {
      this.$emit('gotoFolder')
    }
  }

  openActionsDrawer() {
    this.$emit('openActionsDrawer')
  }

  // extension - substring down to 4 characters
  cleanFileExtension(extension: string) {
    if (!extension) {
      return ''
    }
    // cutdown extension to 3 symbols
    return extension.substring(0, 4)
  }

  getDocPath(documentId: string) {
    const name = Routes.doc.children.docInfo.name
    return { name, params: { documentId } }
  }
}
</script>

<template>
  <div class="doc-icon">
    <!-- ICONS -->
    <!-- For folder -->
    <v-icon
      v-if="item.isFolder"
      :color="getFolderIcon.color"
      @click="gotoFolder"
      class="mr-1"
      :size="32"
    >
      {{ getFolderIcon.icon }}
    </v-icon>

    <!-- Has Form Requests: pending -->
    <v-icon
      v-else-if="anyActions('pending') || anyActions('received')"
      color="#ff9ea7"
      :title="$text.FormsPending"
      class="notifications-icon open-actions-btn mr-1"
      @click="openActionsDrawer"
      :size="32"
    >
      error
    </v-icon>
    <!-- Has Form Requests: completed -->
    <v-icon
      v-else-if="anyActions('accepted') || anyActions('rejected')"
      color="#44dd99"
      :title="$text.FormsNoPending"
      class="notifications-icon mr-1"
      @click="openActionsDrawer"
      :size="32"
    >
      assignment_turned_in
    </v-icon>

    <!-- Icon for file - hide on xs displays-->

    <span v-else-if="!$vuetify.breakpoint.xs" style="position: relative">
      <span>
        <v-icon :size="32" color="#555555" class="mr-1" :title="item.extension">
          mdi-file-outline
        </v-icon>
        <span
          class="file-icon"
          v-text="cleanFileExtension(item.extension)"
        ></span>
      </span>

      <!-- <img class="mr-1" height="25px" :src="`/img/file-icons/txt.svg`" style="opacity:0.7" /> -->
      <!-- <img class="mr-1" height="30px" :src="`/img/file-icons/png.svg`" /> -->
      <!-- <v-icon color="#639ea7" class="mr-1" :title="item.extension">insert_drive_file</v-icon> -->
    </span>

    <!-- TEXT -->
    <span
      v-if="item.isFolder"
      @click="gotoFolder(item)"
      :class="{ clickable: isSmallScreen }"
    >
      {{ item | formatDocName }}
    </span>
    <router-link v-else :to="getDocPath(item.id)" :title="getFilenameTooltip">
      {{ getShortFilename }}
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
.doc-icon {
  .notifications-icon {
    &:hover {
      cursor: pointer;
    }

    &.open-actions-btn {
      &:hover {
        color: #ff7777 !important;
      }
    }
  }

  .clickable {
    text-decoration: underline;
    cursor: pointer;
  }

  .file-icon {
    position: absolute;
    background: #555555;
    color: white;
    font-size: 10px;
    font-family: monospace;
    top: 50%;
    left: 50%;
    transform: translate(-59%, -15%); // accomodate for the offset of the icon
  }
}
</style>
