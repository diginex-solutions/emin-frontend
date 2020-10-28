<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { DocsS } from '@/types/'
import Dialog from '@/mixins/Dialog.ts'
import { formatDocName, downloadURI, to } from '../utils/helpers'
import TheTableIcon from '@/components/TheTableIcon.vue'

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

@Component({
  components: { TheTableIcon },
  mixins: [Dialog]
})
export default class VersionHistoryDialog extends Mixins(Dialog) {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...DocsS.documentVersionHistory)
  documentVersionHistory: Docs.VersionHistory[]

  @A(...DocsS.fetchDocVersionHistory)
  fetchDocVersionHistory: Docs.FetchDocVersionHistoryAction
  @A(...DocsS.uploadNewVersion) uploadNewVersion: Docs.ActionUploadNewVersion

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop() edit: Docs.Record //* Initial value, might get updated

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isLoading = false
  document: Docs.Record | null = null

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get getHeaders() {
    // TODO: i18n refac
    const t = (field: string) => this.$i18n.tc(field)

    return [
      {
        value: 'version',
        text: t('Version'),
        align: 'center',
        width: '100'
      },
      {
        value: 'fileType',
        text: t('FileType'),
        align: 'center',
        width: '100',
        sortable: false
      },
      {
        value: 'uploadedBy',
        text: t('UploadedBy'),
        align: 'center'
      },
      {
        value: 'uploadedAt',
        text: t('UploadedAt'),
        align: 'center',
        width: '150'
      },
      {
        value: 'download',
        text: t('Download'),
        align: 'center',
        width: '130',
        sortable: false
      }
    ]
  }

  get fileHistory() {
    const version = (index: number) =>
      this.documentVersionHistory.length - index

    return this.documentVersionHistory.map((historyElement, index) => {
      const { name, surname, email } = historyElement.uploader
      if (!this.document) return null

      return {
        fileType: this.document.extension,
        extension: this.document.extension,
        version: version(index),
        fileName: this.document.name,
        uploadedBy: `${surname} ${name} (${email})`,
        uploadedAt: historyElement.uploaded,
        download: historyElement.uri
      }
    })
  }

  get fileName() {
    if (!this.document) return '' //? Exn
    return `${this.document.name}.${this.document.extension}`
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  mounted() {
    this.fetchDocVersionHistory()
    this.document = this.edit
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  download(link: string) {
    if (!this.document) return
    const docName = formatDocName(this.document)
    this.$showSnack(this.$msg.documentsDownload, docName)
    downloadURI(link)
  }

  async uploader(e: Event) {
    //* Pull file, do validity checks
    const input = e.target as HTMLInputElement
    const file = input?.files && input.files[0]
    if (!this.document || !file || this.isLoading) return

    //* Check if extensions are compatible
    const [, extension] = file.name.split('.')
    if (this.document && extension !== this.document.extension) {
      const msg = `${extension} vs. ${this.document.extension}`
      this.$showSnack(this.$msg.docExtensionError, msg)
      input.value = ''
      return
    }

    //* Dispatch to upload new version
    const payload = { file, accessId: this.document.id }
    this.isLoading = true
    const [err, res] = await to(this.uploadNewVersion(payload))
    this.isLoading = false
    input.value = ''

    //* Handle error
    const errMsg = this.$msg.docVersionUploadError
    if (err) return this.$showSnack(errMsg, this.fileName)

    //* Update document with response
    this.document = res
    if (!this.document) return //? Exn: should not happen

    //* Compose new name for the file
    const versionSep = ` - v`
    const versionPostfix = `${versionSep}${this.documentVersionHistory.length}`
    const nameParts = this.document.name.split(versionSep)

    let nameSuggestion = ''
    if (nameParts.length === 2) {
      //** Clean deconstruction of file name - increment version
      nameParts.pop() //* Remove version section
      nameSuggestion = nameParts.join() + versionPostfix
    } else {
      //** Name deconstruction is complex - just add version text to the end
      nameSuggestion = this.document.name + versionPostfix
    }

    //* Show success snack and suggest to user new name for the file (AskText dialog)
    this.$showSnack(this.$msg.docVersionUploadSuccess, this.fileName)
    this.$emit('onRename', nameSuggestion)
  }

  openFileInput() {
    const inputFile = this.$refs.inputFile as HTMLInputElement
    inputFile.click()
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    width="1000px"
    @keydown.esc="() => (!isLoading ? (isOpen = false) : false)"
    scrollable
    :persistent="isLoading"
    :fullscreen="$vuetify.breakpoint.sm"
    :transition="
      $vuetify.breakpoint.sm ? 'dialog-right-transition' : 'scale-transition'
    "
  >
    <v-card>
      <v-card-title>
        {{ $text.VersionHistory }} - {{ fileName }}
        <div class="spacer"></div>
        <!-- Close button -->
        <v-btn :disabled="isLoading" icon @click="isOpen = false">
          <v-icon size="30" color="grey lighten-1">close</v-icon>
        </v-btn>
      </v-card-title>
      <div class="header-separator"></div>
      <v-card-text class="pt-2">
        <!-- TABLE -->
        <v-data-table
          :headers="getHeaders"
          :items="fileHistory"
          :items-per-page="5"
          class="elevation-1"
        >
          <template v-slot:item.version="{ item }">
            <v-chip class="ma-2">{{ item.version }}</v-chip>
          </template>
          <template v-slot:item.fileType="{ item }">
            <TheTableIcon :item="item" />
          </template>

          <template v-slot:item.uploadedAt="{ item }">
            <span>{{ item.uploadedAt | formatDate }}</span>
          </template>
          <template v-slot:item.download="{ item }">
            <v-btn
              outlined
              :disabled="false"
              color="primary"
              @click="download(item.download)"
            >
              {{ $text.Download }}
            </v-btn>
          </template>
        </v-data-table>
        <!-- Upload new version -->
        <input
          type="file"
          @change="uploader"
          ref="inputFile"
          style="display: none"
        />
        <v-btn
          class="mt-5"
          color="primary"
          style="width: 100%"
          :disabled="isLoading"
          @click="openFileInput"
        >
          <span v-if="!isLoading">{{ $text.VersionUpload }}</span>
          <span v-else>{{ $text.VersionUploadMessage }}</span>
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.file-icon {
  position: absolute;
  background: #555555;
  color: white;
  font-size: 10px;
  font-family: monospace;
  height: 18px;
  top: 50%;
  left: 50%;
  transform: translate(-59%, -15%); // accomodate for the offset of the icon
}

.file-name {
  word-break: break-word;
}
</style>
