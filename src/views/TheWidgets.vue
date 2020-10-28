<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component, Watch } from 'vue-property-decorator'
import _ from 'lodash'
import { RootG, SettingsS, WidgetsS } from '@/types/'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import ButtonsPanel from '@/components/ButtonsPanel.vue'
import TheBreadcrumbs from '@/components/TheBreadcrumbs.vue'
import WidgetsEdit from '@/components/WidgetsEdit.vue'
import VueGridLayout from 'vue-grid-layout'
import ChartBar from '@/components/ChartBar.vue'
import ChartDoughnut from '@/components/ChartDoughnut.vue'
import ChartPie from '@/components/ChartPie.vue'
import { config } from '@/utils/config'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type Record = Widgets.Record

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

@Component({
  components: {
    ConfirmationDialog,
    ButtonsPanel,
    TheBreadcrumbs,
    WidgetsEdit,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    ChartBar,
    ChartDoughnut,
    ChartPie
  }
})
export default class TheWidgets extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(RootG.isLoading) isLoadingApp: boolean // todo: is needed
  @G(...WidgetsS.records) records: Widgets.Record[]
  @A(...WidgetsS.create) vuexCreate: Widgets.CreateA
  @A(...WidgetsS.delete) vuexDeleteTemplate: Widgets.DeleteA
  @A(...SettingsS.setLayout) vuexSetLayout: Settings.SetLayoutA
  @G(...SettingsS.layout) widgetsLayout: Settings.Layout[]

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  dialogs: {
    isCreate: boolean
    isDelete: boolean
    edit: null | Record
  } = {
    isCreate: false,
    edit: null,
    isDelete: false
  }

  headers: Types.Header[] = [
    {
      text: 'Name',
      align: 'left',
      value: 'name'
    },
    {
      text: 'Actions',
      value: 'actions',
      sortable: false,
      width: 180,
      align: 'center'
    }
  ]

  selected: null | Record = null
  layout: Settings.Layout[] = []
  isComponentInit = false

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get getButtonsPanel() {
    return [
      {
        view: ['mdi-clipboard-text', this.$text.NewWidget],
        onClick: () => (this.dialogs.isCreate = true),
        active: true
      },
      {
        view: ['mdi-printer', this.$text.Print],
        onClick: () => this.onPrint(),
        active: true
      }
    ]
  }

  // keyd by widget ids
  get widgets() {
    const mappedWidgets: Types.WidgetsMap = []

    this.records.forEach((w: Widgets.Record) => {
      mappedWidgets[w.id] = w
    })

    return mappedWidgets
  }

  get layoutFromStore() {
    return this.widgetsLayout
  }

  set layoutFromStore(value: Settings.Layout[]) {
    this.vuexSetLayout(value)
  }

  get getConfig() {
    return config
  }

  // * === === === === === === === === === ===
  // * Watchers 👀 👀 👀 👀 👀 👀 👀 👀 👀 👀

  @Watch('dialogs.isCreate')
  onDialogClose(isOpening: boolean) {
    if (!isOpening) {
      this.dialogs.edit = null
    }
  }

  @Watch('layoutFromStore')
  initApp() {
    this.refreshLayout()
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  mounted() {
    this.refreshLayout()
  }

  // === === === === === === === === === ===
  // METHODS
  editWidget(record: Record) {
    this.dialogs.isCreate = true
    this.dialogs.edit = record
  }

  deleteWidget(record: Record) {
    this.selected = record
    this.dialogs.isDelete = true
  }

  onDelete() {
    if (!this.selected) {
      return
    }

    this.$showSnack(this.$msg.templateIsDeleted) // todo: replace
    this.dialogs.isDelete = false
    this.vuexDeleteTemplate(this.selected).then(() => {
      this.refreshLayout()
    })
  }

  onClone(record: Record) {
    const newRecord = _.cloneDeep(record)
    newRecord.name += ' (copy)'

    this.vuexCreate(newRecord)
      .then(() => {
        const successMsg = this.$msg.templateNewSuccess // todo
        this.$showSnack(successMsg)
      })
      .catch(() => {
        // TODO: backend integration
        return
      })
  }

  refreshLayout() {
    this.layout = this.layoutFromStore
  }

  onLayoutUpdated(value: Settings.Layout[]) {
    this.layoutFromStore = value
  }

  onPrint() {
    window.print()
  }

  emitEvent(btn: { onClick: () => void }) {
    if (btn) {
      btn.onClick()
    }
  }
}
</script>

<template>
  <div>
    <WidgetsEdit
      v-if="dialogs.isCreate"
      v-model="dialogs.isCreate"
      :edit.sync="dialogs.edit"
      @onResult="refreshLayout"
    />

    <v-container grid-list-md pa-0 ma-0 fluid>
      <v-layout wrap pa-0>
        <v-flex xs12 pa-0>
          <!-- Header for printing purposes -->
          <div
            class="print-show dashboard-print-header"
            style="margin: 16px; width: 100%"
          >
            <div>
              <img
                :src="`/img/company-logos/${getConfig.colorLogoFileName}`"
                style="max-height: 64px; float: left"
              />
            </div>
            <div style="clear: left"></div>
            <div class="print-powered" style="float: right">
              Powered by Diginex Trust
            </div>
          </div>

          <!-- Buttons panel -->
          <ButtonsPanel :buttons="getButtonsPanel" @btnClick="emitEvent" />

          <!-- Breadcrumbs Panel -->
          <TheBreadcrumbs
            class="no-print"
            :items="[[$text.Dashboard, '/widgets']]"
          />

          <!-- Confirm deleting template -->
          <ConfirmationDialog
            v-if="dialogs.isDelete"
            v-model="dialogs.isDelete"
            :title="$text.WidgetDeleteConfirm"
            :body="$text.WidgetDeleteWarning"
            :action="onDelete"
            :submitButtonText="$text.Delete"
          />
        </v-flex>
        <v-flex
          xs12
          class="grid-wrapper pa-0 ml-5 mr-5 print-small"
          v-if="!isLoadingApp"
        >
          <grid-layout
            class="print-extra-margin"
            v-if="layout.length > 0"
            :layout="layout"
            :col-num="12"
            :row-height="30"
            :is-draggable="true"
            :is-resizable="true"
            :is-mirrored="false"
            :vertical-compact="true"
            :margin="[10, 10]"
            :use-css-transforms="true"
            :responsive="true"
            @layout-updated="onLayoutUpdated"
            :minW="4"
            :minH="10"
          >
            <grid-item
              v-for="item in layout"
              :x="item.x"
              :y="item.y"
              :w="item.w"
              :h="item.h"
              :i="item.i"
              :minW="item.minW"
              :minH="item.minH"
              :key="item.i"
              class="widget"
              :set="(widget = widgets[item.i])"
            >
              <v-card
                v-if="widget"
                class="mx-auto widget-container"
                height="100%"
              >
                <v-system-bar color="#333434" dark>
                  <v-spacer></v-spacer>
                  <v-icon
                    class="widget-btn no-print"
                    @click="editWidget(widgets[item.i])"
                  >
                    edit
                  </v-icon>
                  <v-icon
                    class="widget-btn no-print"
                    @click="deleteWidget(widgets[item.i])"
                  >
                    close
                  </v-icon>
                </v-system-bar>

                <div>
                  <v-app-bar dense flat>
                    <v-toolbar-title>
                      <v-icon mr-5 size="45">
                        {{ widget.icon || 'show_chart' }}
                      </v-icon>
                      <span class="ml-5">{{ widget.name }}</span>
                    </v-toolbar-title>
                  </v-app-bar>
                </div>
                <v-container class="chart-container">
                  <!-- Data Graphics: display diff depending on widget's type -->
                  <ChartBar
                    v-if="widget.type === 'bar'"
                    :data="widget.data"
                    :isPercentage="widget.isPercentage"
                  />
                  <ChartDoughnut
                    v-else-if="widget.type === 'doughnut'"
                    :data="{ ...widget.data }"
                  />
                  <ChartPie
                    v-else-if="widget.type === 'pie'"
                    :data="widget.data"
                  />
                  <div
                    v-else-if="widget.type === 'count'"
                    class="widget--counter"
                  >
                    <div>{{ widget.data }}</div>
                  </div>
                </v-container>
              </v-card>
            </grid-item>
          </grid-layout>
          <transition name="t__fade">
            <div v-if="layout.length == 0" class="widgets-cta">
              <div
                class="dropzone__cta"
                style="display: flex; flex-direction: column; align-items:center"
              >
                <v-icon color="#dddddd" size="150">widgets</v-icon>
                <span class="cta-text" style="font-size:1.5em; color:#bbbbbb;">
                  {{ $text.WidgetsCta }}
                </span>
              </div>
            </div>
          </transition>
          <!-- <v-data-table
            :headers="headers"
            :items="records"
            item-key="id"
            color="accent"
          >
            <template v-slot:item.actions="{ item }">
              <v-btn icon @click="editWidget(item)">
                <v-icon color="grey lighten-1">edit</v-icon>
              </v-btn>

              <v-btn icon @click="onClone(item)" :title="$text.Clone">
                <v-icon color="grey lighten-1">content_copy</v-icon>
              </v-btn>

              <v-btn icon @click="deleteWidget(item)">
                <v-icon color="grey lighten-1">close</v-icon>
              </v-btn>
            </template>
          </v-data-table>-->
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<style lang="scss" scoped>
.widget {
  background: white;

  &--counter {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 5em;
    color: #808080;
  }

  .widget-container {
    transition: box-shadow ease 300ms;
    height: 100%;
    display: flex;
    flex-direction: column;

    &:hover {
      box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
        0px 5px 8px 0px rgba(0, 0, 0, 0.14),
        0px 1px 14px 0px rgba(0, 0, 0, 0.12) !important;
    }
  }

  .widget-btn {
    cursor: pointer;
    color: rgba(255, 255, 255, 0.7);
    transition: color ease 300ms;

    &:hover {
      color: rgba(255, 255, 255, 1);
    }
  }
}

.chart-container {
  flex-grow: 1;
  min-height: 0;

  > div {
    position: relative;
    height: 100%;
  }
}

.grid-wrapper {
  min-height: 800px;
  position: relative;

  .widgets-cta {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.dashboard-print-header {
  display: none;
  // margin-top: 20mm;
  // margin-bottom: 10mm;
  // margin-left: 14mm;
  position: relative;

  .print-powered {
    position: absolute;
    right: 40px;
    bottom: 10px;
    font-size: 1em;
    color: #444444;
    opacity: 0.6;
  }
}
</style>
