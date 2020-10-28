<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component } from 'vue-property-decorator'
import { SpacesS } from '@/types/'
import { Routes } from '../router'
import { SpaceRoles } from '../types/spacesD'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type Record = Spaces.Record

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

@Component({})
export default class SpacesIconView extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...SpacesS.records) records: Spaces.Record[]
  @G(...SpacesS.getSelected) getSelected: Spaces.Record
  @A(...SpacesS.setSelected) setSelected: Spaces.SetSelectedA
  @G(...SpacesS.isAdminGlobal) isAdminGlobal: boolean

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  onCreate() {
    this.$emit('onCreate')
  }

  onClickSpace(space: Spaces.Record) {
    if (space.id === this.getSelected?.id) return
    this.setSelected(space)
  }

  getSpacePath(record: Spaces.Record) {
    const name = Routes.space.children.spaceSettings.name
    return { name, params: { spaceId: record.id } }
  }

  isSpaceAdmin(record: Spaces.Record) {
    return record.role === SpaceRoles.admin
  }
}
</script>

<template>
  <v-container class="spaces-icon-view" grid-list-md pa-0 ma-0 fluid>
    <v-layout wrap pa-0>
      <v-flex xs12 pa-0 ml-5 mr-5>
        <div class="space__container">
          <div
            v-for="space in records"
            :key="space.id"
            @click="onClickSpace(space)"
            class="space__item"
            :class="{ selected: space.id == getSelected.id }"
          >
            <div class="space__icon-box">
              <!-- Display badges for statuses organizational/allowInvite -->
              <v-badge
                v-if="space.isOrganization"
                class="badge badge__organization"
                avatar
                size="50"
                color="#006ad7"
                icon="mdi-domain"
                :title="$text.Organizational"
              ></v-badge>

              <v-badge
                v-if="space.allowInviteAll"
                class="badge badge__invites"
                avatar
                size="50"
                color="#24aa79"
                icon="mdi-email"
                :title="$text.AllowInvites"
              ></v-badge>

              <v-btn
                v-if="
                  (!space.isPrivate || isAdminGlobal) && isSpaceAdmin(space)
                "
                class="badge badge__pencil"
                color="red"
                fab
                dark
                x-small
                :to="getSpacePath(space)"
              >
                <v-icon>mdi-settings</v-icon>
              </v-btn>

              <v-icon size="3em">{{ space.icon }}</v-icon>
            </div>
            <div class="space__text">{{ space.name }}</div>
          </div>
          <div @click="onCreate" class="space__item">
            <div class="space__icon-box">
              <v-icon size="3em">mdi-plus</v-icon>
            </div>
            <div class="space__text">{{ $text.SpaceNew }}</div>
          </div>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<style lang="scss" scoped>
.spaces-icon-view {
  .badge {
    position: absolute;

    &__organization {
      left: 0em;
      bottom: 0em;
    }

    &__invites {
      left: 1.5em;
      bottom: 0em;
    }

    &__pencil {
      top: -0.5em;
      right: -0.5em;
    }
  }
  .space {
    &__container {
      display: flex;
      flex-wrap: wrap;
      margin: 1em;
    }

    &__item {
      width: 8em;
      height: 8em;
      margin: 1em;
      display: flex;
      flex-direction: column;
      align-items: center;

      &.selected {
        .space__icon-box {
          background: #e9efff;
        }
      }
      &:hover:not(.selected) {
        cursor: pointer;

        .space__icon-box {
          background: #edf6ff;
          border: 2px solid #49a0c8;
        }
      }
    }

    &__icon-box {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 5em;
      height: 5em;
      border: 2px solid #2980a8;
      border-radius: 5%;
      margin-bottom: 0.2rem;
      position: relative;
    }

    &__text {
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;

      $lineNumber: 2;
      $lineHeihgt: 1.3;
      -webkit-line-clamp: $lineNumber; /* number of lines to show */
      line-height: #{$lineHeihgt}em; /* fallback */
      max-height: #{$lineNumber * $lineHeihgt}em; /* fallback */
    }
  }
}
</style>
