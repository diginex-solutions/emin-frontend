<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

// TODO: switching to icons style should be based on height of
// element - if over one row, then icons

export interface PanelButton {
  view: [string, string]
  active: boolean
  hidden: boolean
}

@Component({})
export default class ButtonsPanel extends Vue {
  // === === === === === === === === === ===
  // PROPS

  @Prop() buttons: PanelButton[]

  // === === === === === === === === === ===
  // COMPUTED

  get isSmallScreen() {
    return (
      this.$vuetify.breakpoint.xs ||
      this.$vuetify.breakpoint.sm ||
      this.$vuetify.breakpoint.md
    )
  }

  // === === === === === === === === === ===
  //  METHODS

  emitEvent(btn: PanelButton) {
    this.$emit('btnClick', btn)
  }
}
</script>

<template>
  <v-card
    class="pa-0 mx-auto mb-4 buttons-panel no-print"
    outlined
    min-width="100%"
    style="min-height:56px"
  >
    <v-card-actions class="pa-0 pl-5 flex-wrap">
      <template v-if="isSmallScreen">
        <!-- <v-tooltip bottom v-for="button in buttons" :key="button.view[1]">
          <template v-slot:activator="{ on, attrs }"> -->
        <template v-for="button in buttons">
          <v-spacer
            v-show="!button.hidden && !!button.isSpacer"
            :key="`${button.view[1]}-spacer`"
          />
          <v-btn
            :key="button.view[1]"
            text
            color="primary"
            @click="emitEvent(button)"
            v-show="!button.hidden && !button.isSpacer"
            class="actions-panel__btn buttonStyles mobile"
            :disabled="!button.active"
          >
            <v-icon color="primary" v-text="button.view[0]" class="btn-icon" />
          </v-btn>
        </template>
        <!-- </template>
          <span>{{ button.view[2] || button.view[1] }}</span>
        </v-tooltip> -->
      </template>
      <template v-else>
        <template v-for="button in buttons">
          <v-spacer
            v-show="!button.hidden && !!button.isSpacer"
            :key="`${button.view[1]}-spacer`"
          />
          <v-btn
            :key="button.view[1]"
            text
            color="primary"
            @click="emitEvent(button)"
            v-show="!button.hidden && !button.isSpacer"
            class="actions-panel__btn buttonStyles"
            :disabled="!button.active"
          >
            <v-icon
              color="primary"
              v-text="button.view[0]"
              class="btn-icon right-padding"
            />
            <span>{{ button.view[1] }}</span>
          </v-btn>
        </template>
      </template>
    </v-card-actions>
  </v-card>
</template>

<style lang="scss" scoped>
$headerBg: #f4f6fa;
$headerBg: #f7f7f7;
$colorAccent: #cc2531;

.buttons-panel {
  background: $headerBg !important;
  transition: opacity 300ms ease;

  &.hidden {
    pointer-events: none;
    opacity: 0;
  }
  &__btn {
    font-size: 0.8em !important;
    border-radius: 0 !important;
    margin: 0 !important;
    height: 3rem !important;
  }

  // This element is needed for multiline
  .buttons-wrapper {
    min-height: 48px;
  }

  .v-btn {
    &.mobile {
      min-width: 38px;
      padding: 0;
    }

    .btn-icon {
      &.right-padding {
        padding-right: 5px;
      }
    }
  }

  .buttonStyles {
    font-size: 0.8em;
    border-radius: 0;
    margin: 0;
    height: 3.5rem;
  }
}
</style>
