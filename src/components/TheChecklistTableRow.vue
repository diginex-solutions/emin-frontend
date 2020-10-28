<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import TheTableActions from '@/components/TheTableActions.vue'
import TheChecklistTableIcon from '@/components/TheChecklistTableIcon.vue'

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  components: {
    TheTableActions,
    TheChecklistTableIcon
  }
})
export default class TheChecklistTableRow extends Vue {
  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop() item: Docs.ChecklistRecord

  // * === === === === === === === === === ===
  // * Computed 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  // === === === === === === === === === ===
  // Emits

  openHistoryDrawer(id: string) {
    this.$emit('openHistoryDrawer', id)
  }

  openActionsDrawer(doc: Docs.ChecklistRecord, isRecipient = false) {
    this.$emit('openActionsDrawer', doc, isRecipient)
  }

  onSelectChecked(itemCategory: string) {
    this.$emit('onSelectChecked', itemCategory)
  }

  uploadFile(documentType: string) {
    this.$emit('uploadFile', documentType)
  }
}
</script>

<template>
  <tr class="table-row">
    <!-- MOBILE -->
    <template v-if="$vuetify.breakpoint.xs">
      <td class="pa-1 pt-3 pb-3">
        <div class="mobile-row">
          <div class="section-info">
            <!-- Document type -->
            <span>{{ item.category }}</span>
            <!-- Checklist file name -->
            <TheChecklistTableIcon
              :item="item"
              @openActionsDrawer="openActionsDrawer(item, true)"
              style="display: flex; align-items: center"
            />
            <!-- Uploaded date -->
            <div class="section-date">
              <a v-if="item.uploaded" @click.stop="openHistoryDrawer(item)">
                {{ item.uploaded | formatDateSmall }}
              </a>
            </div>
          </div>
          <div class="pt-4">
            <!-- Document type description -->
            <span>{{ item.categoryDescription || '' }}</span>
          </div>
          <div class="section-checkboxes">
            <!-- isUploaded -->
            <v-checkbox
              v-model="item.documentUploaded"
              label="Uploaded"
              readonly
            ></v-checkbox>
            <!-- verified -->
            <v-checkbox
              v-model="item.verified"
              label="Verified"
              readonly
            ></v-checkbox>
            <!-- select checkbox -->
            <v-checkbox
              v-model="item.select"
              label="Select"
              @click.stop.prevent="onSelectChecked(item.category)"
            ></v-checkbox>
          </div>
          <div>
            <v-btn
              small
              color="accent"
              @click.stop.prevent="uploadFile(item.category)"
            >
              {{ $text.PanelUpload }}
            </v-btn>
          </div>
        </div>
      </td>
    </template>

    <template v-else>
      <!-- DESKTOP  -->
      <!-- Document type -->
      <td class="border-right col-category">
        <span>{{ item.category }}</span>
      </td>

      <!-- Checklist file name -->
      <td class="border-right">
        <TheChecklistTableIcon
          :item="item"
          @openActionsDrawer="openActionsDrawer(item, true)"
          style="display: flex; align-items: center"
        />
      </td>

      <!-- Document type description -->
      <td class="border-right col-category">
        <span>{{ item.categoryDescription || '' }}</span>
      </td>

      <!-- Uploaded date -->
      <td class="border-right">
        <a v-if="item.uploaded" @click.stop="openHistoryDrawer(item)">
          {{ item.uploaded | formatDate }}
        </a>
      </td>

      <!-- isUploaded -->
      <td>
        <v-checkbox v-model="item.documentUploaded" readonly></v-checkbox>
      </td>

      <!-- verified -->
      <td>
        <v-checkbox v-model="item.verified" readonly></v-checkbox>
      </td>

      <!-- select checkbox -->
      <td>
        <v-checkbox
          v-model="item.select"
          @click.stop.prevent="onSelectChecked(item.category)"
        ></v-checkbox>
      </td>

      <!-- upload button -->
      <td>
        <v-btn
          small
          color="accent"
          @click.stop.prevent="uploadFile(item.category)"
        >
          {{ $text.PanelUpload }}
        </v-btn>
      </td>
    </template>
  </tr>
</template>

<style lang="scss" scoped>
.table-row {
  .border-right {
    border-right: 1px solid #ddd;
  }

  .col-category {
    width: 15rem;
    max-width: 30rem;
  }

  .mobile-row {
    display: flex;
    flex-direction: column;

    .section-info {
      padding-right: 0;
      flex: 1 1 0;

      display: flex;

      > * {
        flex: 1 1 0;
      }

      .section-date {
        text-align: right;
      }
    }

    .section-checkboxes {
      display: flex;

      > div {
        flex: 1 1 0;
      }
    }
  }
}
</style>
