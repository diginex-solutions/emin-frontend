<script lang="ts">
import { Getter as G } from 'vuex-class'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import { AuthS } from '@/types/'
import _ from 'lodash'

interface Dropzone extends Element {
  $el: HTMLElement
  removeAllFiles: () => void
  setOption: (name: 'url', value: string) => void
  removeFile: (file: File) => void
}

type File = any
interface FileIcons {
  [key: string]: {
    icon: string
    color: string
    spinning?: boolean
    isClickable?: boolean
  }
}
enum FileStatuses {
  success = 'success',
  queued = 'queued',
  canceled = 'canceled',
  uploading = 'uploading'
}

@Component({
  components: {
    VueDropzone: vue2Dropzone
  }
})
export default class TheChecklistUploader extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(...AuthS.getToken) getToken: string

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop(String) url: string

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  files: File[] = []
  uploadProgress = 0
  timeoutFunc: Types.Timeout = undefined

  // * === === === === === === === === === ===
  // * Computed 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏

  get dropzone() {
    return this.$refs.myVueDropzone as Dropzone
  }

  get dropzoneOptions() {
    const token = 'Bearer ' + this.getToken
    return {
      url: this.url, // get upload address
      maxFilesize: 500,
      timeout: 60 * 60 * 1000, // timeout in 1 hour (max file is 500MB, upload speed >200KBPS)
      headers: { Authorization: token }, // add authorization header
      parallelUploads: 1,
      success: (f: object, response: Docs.ChecklistRecord) =>
        this.$emit('onFileUploaded', response)
    }
  }

  get getUploadProgress() {
    return Math.floor(this.uploadProgress)
    // const sumProgress = (acc: number, f: File) => acc + f.upload.progress
    // return [...this.files].reduce(sumProgress, 0) / this.files.length
  }

  get isInfo() {
    return this.files.length > 0
  }

  get isUploadFinished() {
    const isActiveFile = !!this.files.find(
      (f: File) => f.status === 'uploading'
    )

    return this.getUploadProgress === 100 && !isActiveFile
  }

  // Title - either progress or finished
  get getInfoTitle() {
    // If finished - show result msg
    if (this.isUploadFinished) {
      const filterSuccessFiles = (f: File) =>
        f.status === FileStatuses.success || f.status === FileStatuses.uploading
      const successFiles = [...this.files].filter(filterSuccessFiles)

      return `Uploaded ${successFiles.length} files`
    }

    // Show progress message
    const filterActiveFiles = (f: File) =>
      f.status === FileStatuses.queued || f.status === FileStatuses.uploading
    const activeFiles = [...this.files].filter(filterActiveFiles)

    return `Uploading ${activeFiles.length} files`
  }

  // Watch path change
  @Watch('url')
  onPathChange(url: string) {
    this.dropzone.setOption('url', url)
  }

  @Watch('isUploadFinished')
  trackUploadFinished(isFinised: boolean) {
    if (isFinised) {
      clearTimeout(this.timeoutFunc)
      this.timeoutFunc = setTimeout(() => {
        this.onCloseInfo()
      }, 6000)
    }
  }

  // === === === === === === === === === ===
  // HOOKS

  // === === === === === === === === === ===
  // METHODS

  // Opens file-upload dialog, called externally
  onOpenDropzone() {
    this.dropzone.$el.click()
  }

  onUploadBegin(files: File[]) {
    if (files.length === 0) {
      return
    }

    // this.$emit('onResetSelected') // emit to reset parent's selected list

    // Merge to files list
    this.files = [...this.files, ...files]
    this.uploadProgress = 0

    // Clear any timeouts closing the uploader
    clearTimeout(this.timeoutFunc)
  }

  getFileProgress(file: File) {
    return _.round(file.upload.progress, 1)
  }

  // Get icon based on file status: loading, success, cancel
  getFileIcon(file: File) {
    const iconsMap: FileIcons = {
      success: {
        icon: 'check_circle',
        color: 'rgb(0, 195, 0)'
      },
      uploading: {
        icon: 'cancel',
        color: 'rgba(255, 0, 0, 0.5)',
        isClickable: true
      },
      canceled: {
        icon: 'error',
        color: 'orange'
      },
      queued: {
        icon: 'query_builder',
        color: 'rgba(0, 188, 212, 0.7)'
      }
    }

    return iconsMap[file.status]
  }

  onUpdateFile(file: File) {
    const files = [...this.files]
    const fileIndex = files.findIndex(
      (f: File) => f.upload.uuid === file.upload.uuid
    )
    files[fileIndex] = file

    this.files = files
  }

  onCloseInfo() {
    this.dropzone.removeAllFiles()
    this.files = []
    this.uploadProgress = 0
  }

  onUpdateProgress(progress: number) {
    if (progress > this.uploadProgress) {
      this.uploadProgress = Math.floor(progress)
    }
  }

  onRemoveFile(file: File) {
    if (file.status === 'uploading') {
      this.dropzone.removeFile(file)
    }
  }
}
</script>

<template>
  <div>
    <vue-dropzone
      ref="myVueDropzone"
      id="dropzone"
      :options="dropzoneOptions"
      name="upload"
      @vdropzone-files-added="onUploadBegin"
      @vdropzone-upload-progress="onUpdateFile"
      @vdropzone-success="onUpdateFile"
      @vdropzone-total-upload-progress="onUpdateProgress"
      class="d-none"
    />
    <v-snackbar
      v-if="files.length > 0"
      v-model="isInfo"
      :timeout="0"
      right
      bottom
      vertical
      color="white"
      id="upload-progress"
    >
      <div class="header">
        <div class="header__title">
          <span v-text="getInfoTitle" />
          <v-btn
            v-if="isUploadFinished"
            icon
            class="close-btn"
            color="gray"
            @click="onCloseInfo"
          >
            <v-icon color="#aaaaaa" size="20">close</v-icon>
          </v-btn>
        </div>
        <div class="header__subtitle">
          <v-progress-linear
            color="teal"
            buffer-value="0"
            :value="getUploadProgress"
            stream
          ></v-progress-linear>
        </div>
      </div>
      <div class="files-container">
        <div class="file" v-for="file in files" :key="file.upload.uuid">
          <v-icon class="file__icon">insert_drive_file</v-icon>
          <div class="file__text">
            <span class="file__name" v-text="file.upload.filename" />
            <span>&nbsp;({{ getFileProgress(file) }}%)</span>
          </div>
          <v-btn
            icon
            class="file__action"
            :class="{ 'disable-events': !getFileIcon(file).isClickable }"
            color="gray"
            @click="onRemoveFile(file)"
          >
            <v-progress-circular
              v-if="getFileIcon(file).spinning"
              indeterminate
              :color="getFileIcon(file).color"
              size="20"
              width="3"
            />
            <v-icon v-else :color="getFileIcon(file).color">
              {{ getFileIcon(file).icon }}
            </v-icon>
          </v-btn>
        </div>
      </div>
    </v-snackbar>
  </div>
</template>

<style lang="scss">
$colorAccent: #cc2531;

#dropzone {
  border: 2px dashed rgba(204, 37, 50, 0);
  transition: border-color 0.3s ease-in-out;

  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: calc(100% + 220px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  .cta-text {
    font-size: 1em;
    font-weight: bold;
    color: #cccccc;
    .hl-text {
      color: #cc2531;
      font-weight: bold;
      pointer-events: none;
    }
  }

  &.vue-dropzone > .dz-preview .dz-details {
    background: $colorAccent !important;
  }
}

// Hide dropzone tiles
.dropzone .dz-preview {
  display: none !important;
}

#upload-progress {
  z-index: 5;
  padding: 1em;
  color: #666666;

  // Override vuetify css
  .v-snack__wrapper {
    width: 400px !important;
    max-width: 400px !important;
  }
}

.v-snack__content {
  max-height: 90vh;
  overflow-y: auto;
}

#upload-progress {
  padding-bottom: 9px;

  .header {
    &__title {
      font-size: 1.5em;
      padding: 0;
      display: flex;
      align-items: center;

      span {
        flex-grow: 1;
        padding: 0 7px 0 0;
      }

      .action-icon {
        color: $colorAccent;
      }
    }
    &__subtitle {
      font-size: 1.1em;
      color: gray;
    }

    .close-btn {
      margin-top: 0 !important;
    }
  }

  .file {
    display: flex;
    align-items: center;
    &__icon {
      margin-right: 10px;
    }
    &__text {
      flex-grow: 1;
      display: flex;
      overflow: hidden;
    }

    &__name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__action {
      margin-top: 0 !important;
    }
  }
}

.disable-events {
  pointer-events: none;
}
</style>
