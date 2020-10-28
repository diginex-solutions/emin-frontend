np
<script lang="ts">
import { Component, Watch, Mixins } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { DocsS } from '@/types/'

import Dialog from '@/mixins/Dialog.ts'

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Types

type FillableObject = { [key: string]: string }

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

@Component({ components: {} })
export default class DocumentCategoryDialog extends Mixins(Dialog) {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @A(...DocsS.update) updateDoc: Docs.UpdateDocumentA
  @G(...DocsS.getDocumentsWithoutCategory)
  documentsWithoutCategory: Docs.Record[]

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isLoading = false
  fileCategories: FillableObject = {}

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get getHeaders() {
    return [
      {
        value: 'name',
        text: this.$text.FileName,
        align: 'left'
      },

      {
        value: 'category',
        text: this.$text.Category,
        align: 'left',
        sortable: false
      }
    ]
  }

  categoryList = [
    'EmploymentContract',
    'Visa',
    'Passport',
    'Medical',
    'CV_Resume',
    'Insurance',
    'Residential_Accommodation',
    'ID',
    'DriversLicense',
    'Certificates',
    'Education',
    'Financial',
    'Receipts',
    'Training',
    'Other'
  ]

  category = {
    // EmploymentContract: 'EmploymentContract',
    // Visa: 'Visa',
    // Passport: 'Passport',
    // Medical: 'Medical',
    // CVResume: 'CV_Resume',
    // Insurance: 'Insurance',
    // ResidentialAccommodation: 'Residential_Accommodation',
    // ID: 'ID',
    // DriversLicense: 'DriversLicense',
    // Certificates: 'Certificates',
    // Education: 'Education',
    // Financial: 'Financial',
    // Receipts: 'Receipts',
    // Training: 'Training',
    Other: 'Other'
  }

  get categories() {
    return this.categoryList.map((c) => ({
      value: c,
      text: c
    }))
  }

  get tableData() {
    const data = this.documentsWithoutCategory.map((doc) => ({
      extension: doc.extension,
      name: doc.name,
      // category: this.getCategory(doc),
      id: doc.id
    }))
    console.log('=> data <=', data)
    return data
  }

  get allCategoriesSpecified() {
    return (
      Object.keys(this.fileCategories).length ===
      Object.keys(this.documentsWithoutCategory).length
    )
  }

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  @Watch('documentsWithoutCategory')
  onChangeInDocumentsWithoutCategory() {
    const documentIds = this.documentsWithoutCategory.map((d) => d.id)
    this.fileCategories = documentIds.reduce((acc, cur) => {
      const oldValue = this.fileCategories[cur]
      if (oldValue != null) {
        acc[cur] = oldValue
      }
      return acc
    }, {} as FillableObject)
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  // getCategory(doc: Docs.Record) {
  //   return this.fileCategories[doc.id]
  // }

  updateCategory(payload: { id: string; category?: string }) {
    const { id, category } = payload

    if (category) {
      this.fileCategories = { ...this.fileCategories, [id]: category }
    } else {
      delete this.fileCategories[id]
      this.fileCategories = { ...this.fileCategories }
    }
  }

  updateOther(payload: { id: string; description?: string }) {
    const { id, description } = payload

    if (description) {
      this.fileCategories = { ...this.fileCategories, [id]: description }
    } else {
      this.fileCategories = {
        ...this.fileCategories,
        [id]: this.category.Other
      }
    }
  }

  showOther(id: string) {
    if (!id || !this.fileCategories[id]) {
      return false
    }
    const otherSelected = this.fileCategories[id] === this.category.Other
    const selectedCategoryIsNotInList = !this.categoryList.includes(
      this.fileCategories[id]
    )
    return otherSelected || selectedCategoryIsNotInList
  }

  saveCategories() {
    this.isLoading = true
    const docUpdates = Object.entries(this.fileCategories).map(
      ([key, value]) => {
        return { id: key, category: value }
      }
    )
    const updates = docUpdates.map((u) => this.updateDoc(u))
    Promise.all(updates)
      .then(() => this.$showSnack(this.$msg.categorySavedSuccess))
      .catch(() => this.$showSnack(this.$msg.categorySavedError))
      .finally(() => (this.isLoading = false))
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    width="800px"
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
        {{ $text.DocumentCategory }}
        <div class="spacer"></div>
        <!-- Close button -->
        <v-btn :disabled="isLoading" icon @click="isOpen = false">
          <v-icon size="30" color="grey lighten-1">close</v-icon>
        </v-btn>
      </v-card-title>
      <div class="header-separator"></div>
      <v-card-text class="pt-2">
        <p>{{ $text.DocumentCategoryExplaination }}</p>
        <!-- TABLE -->
        <v-data-table
          :headers="getHeaders"
          :items="tableData"
          :hide-default-footer="true"
          :disable-pagination="true"
          :footer-props="{ disablePagination: true, disableItemsPerPage: true }"
          class="elevation-1"
        >
          <template v-slot:item.category="{ item }">
            <div class="d-flex flex-wrap">
              <v-select
                :items="categories"
                :value="item.category"
                hide-details
                outlined
                dense
                :placeholder="$text.SelectCategory"
                :disabled="isLoading"
                @input="updateCategory({ id: item.id, category: $event })"
                style="padding: 0rem 0"
              ></v-select>
              <v-text-field
                v-show="showOther(item.id)"
                :label="$text.DescribeDocumentType"
                @input="updateOther({ id: item.id, description: $event })"
                hide-details
                outlined
                solo
                dense
                :disabled="isLoading"
                :ref="item.id"
              ></v-text-field>
            </div>
          </template>
        </v-data-table>
        <!-- Upload new version -->

        <v-btn
          class="mt-5"
          color="primary"
          style="width: 100%"
          :disabled="!allCategoriesSpecified || isLoading"
          @click="saveCategories"
        >
          <span v-if="!isLoading">{{ $text.Save }}</span>
          <span v-else>{{ $text.SavingCategories }}</span>
        </v-btn>
        <p>{{ $text.DocumentCategoryDisclaimer }}</p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
