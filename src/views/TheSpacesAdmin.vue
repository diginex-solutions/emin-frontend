<script lang="ts">
import { Action as A } from 'vuex-class'
import { Vue, Component } from 'vue-property-decorator'
import { SpacesS } from '@/types/'
import ButtonsPanel from '@/components/ButtonsPanel.vue'
import TheBreadcrumbs from '@/components/TheBreadcrumbs.vue'
import FormFields from '@/stx/stxForms'
import { Routes } from '@/router'
import { materialIconsBusiness } from '@/utils/material-icons-list'
import Spinner from '@/components/Spinner.vue'

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

@Component({ components: { ButtonsPanel, TheBreadcrumbs, Spinner } })
export default class TheSpaces extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @A(...SpacesS.fetchSpacesAdmin) fetchSpacesAdmin: Spaces.FetchSpacesAdminA

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  formFields: Types.FormField[] = FormFields.space()
  records: Spaces.Record[] = []
  isLoading = false

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get headers(): Types.Header[] {
    return [
      {
        text: this.$text.Name,
        align: 'left',
        value: 'name'
      },
      {
        text: this.$text.Owner,
        align: 'left',
        value: 'admins'
      },
      {
        text: this.$text.Description,
        align: 'left',
        value: 'description'
      },
      {
        text: this.$text.SpaceIsOrganization,
        align: 'left',
        value: 'isOrganization'
      },

      {
        text: this.$text.SpaceOpenInvitation,
        align: 'left',
        value: 'allowInviteAll'
      }
    ]
  }

  //* Fixing icons - `mdi-` prefix issue
  get materialIcons() {
    const withoutPrefix = materialIconsBusiness.map((n: string) => n.substr(4))
    return [...materialIconsBusiness, ...withoutPrefix]
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  //* When component is mounted - fetch all spaces
  mounted() {
    this.isLoading = true

    this.fetchSpacesAdmin()
      .then((records: Spaces.Record[]) => {
        this.records = records
        this.isLoading = false
      })
      .catch(() => (this.isLoading = false))
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  //* Returns router-path to settings page
  getSettingsPath(record: Spaces.Record) {
    const name = Routes.spaceSettingsAdmin.name
    const params = { spaceId: record.id }
    return { name, params }
  }

  //* Process space icon - if invalid, return defalt
  getIcon(name: string, Default = 'mdi-help') {
    const isValid = this.materialIcons.includes(name)
    return isValid ? name : Default
  }
}
</script>

<template>
  <v-container class="spaces-admin" grid-list-md pa-0 ma-0 fluid>
    <v-layout wrap pa-0>
      <v-flex xs12 pa-0>
        <!-- Buttons panel, empty to maintain design -->
        <ButtonsPanel :buttons="[]" />

        <!-- Breadcrumbs Panel -->
        <TheBreadcrumbs :items="[[$text.SpacesAdmin, '/spaces']]" />
      </v-flex>
      <v-flex xs12 pa-0 ml-5 mr-5>
        <Spinner v-if="isLoading" />
        <!-- TABLE -->
        <v-data-table v-else :headers="headers" :items="records" item-key="id">
          <template v-slot:item.name="{ item }">
            <div class="space-name">
              <v-icon class="mr-2">{{ getIcon(item.icon) }}</v-icon>
              <!-- //* Link to space settings page -->
              <router-link :to="getSettingsPath(item)">
                {{ item.name }}
              </router-link>
            </div>
          </template>

          <template v-slot:item.admins="{ item }">
            <div v-for="user in item.admins" :key="user.email">
              <span>{{ user.email }} ({{ user.name }} {{ user.surname }})</span>
            </div>
          </template>

          <template v-slot:item.owner="{ item }">
            {{ formatUser(item.owner) }}
          </template>

          <template v-slot:item.isOrganization="{ item }">
            <v-icon>
              {{ item.isOrganization ? 'mdi-check' : 'mdi-close' }}
            </v-icon>
          </template>

          <template v-slot:item.allowInviteAll="{ item }">
            <v-icon>
              {{ item.allowInviteAll ? 'mdi-check' : 'mdi-close' }}
            </v-icon>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<style lang="scss" scoped>
.spaces-admin {
  .space-name {
    display: flex;
    align-items: center;
  }
}
</style>
