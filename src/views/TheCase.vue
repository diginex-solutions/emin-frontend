<script lang="ts">
import moment from 'moment'
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component, Watch, Provide } from 'vue-property-decorator'
import { AuthS, CasesS } from '@/types/'
import { finderById } from '../utils/helpers'
import TheBreadcrumbs from '@/components/TheBreadcrumbs.vue'
import TheCaseSidebar from '@/components/TheCaseSidebar.vue'
import ButtonsPanel from '@/components/ButtonsPanel.vue'
import CaseCreateDialog from '@/components/CaseCreateDialog.vue'
import { Routes } from '@/router'

@Component({
  components: {
    TheBreadcrumbs,
    TheCaseSidebar,
    ButtonsPanel,
    CaseCreateDialog
  }
})
export default class TheCase extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(...CasesS.records) cases: Cases.Record[]
  @A(...CasesS.selectedSet) selectedSet: Cases.SelectedSetA
  @G(...AuthS.isManager) isManager: boolean

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  isLoading = false
  isEditDialog = false
  tab: string = this.tabs[0].name

  @Provide()
  showSidebar = !this.$vuetify.breakpoint.xs

  @Provide()
  showToggleShowbarButton = this.$vuetify.breakpoint.xs

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get theCase() {
    const caseId = this.$route.params.caseId
    const findById = finderById(caseId)

    return this.cases.find(findById)
  }

  get tabs() {
    return [{ name: 'Feed', to: Routes.case.children.caseFeed.name }]
  }

  // get getDate() {
  //   const date = this.theCase?.createdAt
  //   const format = 'DD-MM-YYYY'
  //   return moment(date).format(format)
  // }

  // get getTime() {
  //   const date = this.theCase?.createdAt
  //   const format = 'hh:mm:ss A'
  //   return moment(date).format(format)
  // }

  get getDateTime() {
    const date = this.theCase?.createdAt
    const format = 'DD/MM/YYYY hh:mm A'
    return moment(date).format(format)
  }

  get getFiledBy() {
    const owner = this.theCase?.owner
    if (!owner) {
      return ''
    }
    const name = owner.name + ' ' + owner.surname
    return name + ' (' + owner.email + ')'
  }

  get panelButtons() {
    const lblToggleSidebar = this.showSidebar
      ? this.$text.CloseUserDetails
      : this.$text.ViewUserDetails
    return [
      {
        view: ['edit', this.$text.EditCase],
        active: true,
        hidden:
          !this.isManager || (this.theCase && this.theCase.status === 'closed'),
        onClick: () => {
          this.isEditDialog = true
        }
      },
      {
        isSpacer: true,
        view: ['', 'spacer']
      },
      {
        view: ['mdi-dots-vertical', lblToggleSidebar],
        active: true,
        hidden: !this.showToggleShowbarButton,
        onClick: () => {
          this.showSidebar = !this.showSidebar
        }
      }
    ]
  }

  // * === === === === === === === === === ===
  // * Watchers 👀 👀 👀 👀 👀 👀 👀 👀 👀 👀

  @Watch('theCase')
  caseUpdated(caseNew?: Cases.Record, caseOld?: Cases.Record) {
    if (!caseNew || (caseOld && caseOld.id === caseNew.id)) {
      return
    }

    this.selectedSet(caseNew) // Select to activate buttons panel for the document

    // TODO:
    // this.isLoading = true
    // this.fetchHistory(caseNew).then(() => {
    //   this.isLoading = false
    // })

    // this.selectedSet([case]) // Select to activate buttons panel for the document
  }

  @Watch('$vuetify.breakpoint.xs')
  breakpointXsUpdated(value: boolean) {
    this.showToggleShowbarButton = value
    this.showSidebar = !this.showToggleShowbarButton
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  mounted() {
    this.caseUpdated(this.theCase)
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  getPath(name: string) {
    const caseId = this.theCase?.id
    return { name, params: { caseId } }
  }

  emitEvent(btn: { onClick: () => void }) {
    if (btn) {
      btn.onClick()
    }
  }

  formatFullname(user: Cases.User) {
    if (!user) {
      return ''
    }

    return `${user.name} ${user.surname}`
  }
}

// * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀
</script>

<template>
  <div class="document-info" fill-height>
    <!-- Sidebar -->
    <TheCaseSidebar
      v-if="theCase && !isLoading && showSidebar"
      :theCase="theCase"
      class="vert-scroll"
    />

    <!-- Loader screen -->
    <v-container grid-list-md pa-0 ma-0 fluid v-if="isLoading">
      <div class="notfound">
        <div style="display: flex; flex-direction: column; align-items:center">
          <v-progress-circular indeterminate color="#dddddd" />
          <span class="cta-text" style="font-size:1.5em; color:#bbbbbb;">
            {{ $text.Loading }}
          </span>
        </div>
      </div>
    </v-container>
    <v-container grid-list-md pa-0 ma-0 fluid v-else-if="theCase">
      <v-layout wrap pa-0>
        <v-flex xs12 pa-0>
          <!-- Buttons panel -->
          <ButtonsPanel :buttons="panelButtons" @btnClick="emitEvent" />

          <!-- Breadcrumbs Panel -->
          <TheBreadcrumbs
            :items="[
              [$text.Cases, '/cases'],
              [theCase.caseNumber, theCase.id]
            ]"
            router-mode
          />
        </v-flex>

        <!-- ? Disabling multipaging till required -->
        <!-- Tabs -->
        <!-- <v-flex xs12 pa-0 ml-5 mr-5 mb-3>
          <v-tabs v-model="tab" background-color="transparent" color="accent">
            <v-tab v-for="tab in tabs" :to="getPath(tab.to)" :key="tab.name">{{ tab.name }}</v-tab>
          </v-tabs>
        </v-flex>-->

        <v-flex xs12 pa-0 ml-5 mr-5 mb-3>
          <!-- Display main case information -->
          <v-container class="mt-0">
            <v-row class="dense">
              <v-col>
                <b>{{ $text.CaseNumber }}:</b>
                {{ theCase.caseNumber }}
              </v-col>
              <v-col>
                <b>{{ $text.ReportedDateTime }}:</b>
                {{ getDateTime }}
              </v-col>
            </v-row>
            <v-row class="dense">
              <v-col>
                <b>{{ $text.CaseType }}:</b>
                {{ theCase.caseType }}
              </v-col>
              <v-col>
                <b>{{ $text.RelatedTo }}:</b>
                {{ formatFullname(theCase.relatedTo) }}
              </v-col>
            </v-row>
            <v-row class="dense">
              <v-col>
                <b>{{ $text.Description }}:</b>
                {{ theCase.description }}
              </v-col>
              <v-col>
                <b>{{ $text.AssignedTo }}:</b>
                {{ formatFullname(theCase.assignedTo) }}
              </v-col>
            </v-row>
            <v-row v-if="isManager" class="dense">
              <v-col>
                <b>{{ $text.ResolutionPlan }}:</b>
                {{ theCase.resolutionPlan }}
              </v-col>
              <v-col>
                <b>{{ $text.IssueType }}:</b>
                <span v-if="theCase.issueType === 'grievance'">
                  {{ $text.Grievance }}
                </span>
                <span v-else-if="theCase.issueType === 'others'">
                  {{ $text.Others }}
                </span>
              </v-col>
            </v-row>
            <v-row class="dense">
              <v-col>
                <b>{{ $text.Status }}:</b>
                <span v-if="theCase.status === 'new'">
                  {{ $text.CaseStatusNew }}
                </span>
                <span v-if="theCase.status === 'inProgress'">
                  {{ $text.CaseStatusInProgress }}
                </span>
                <span v-if="theCase.status === 'closed'">
                  {{ $text.CaseStatusClosed }}
                </span>
              </v-col>
            </v-row>
            <v-row class="dense"></v-row>
          </v-container>
        </v-flex>
        <v-divider />

        <!-- Page -->
        <v-flex xs12 pa-0 ml-5 mr-5 mb-3>
          <router-view
            :feed="theCase.events"
            :theCase="theCase"
            style="margin-top:1rem"
          />
        </v-flex>
      </v-layout>
    </v-container>
    <v-container grid-list-md pa-0 ma-0 fluid v-else>
      <div class="notfound">
        <div style="display: flex; flex-direction: column; align-items:center">
          <v-icon color="#dddddd" size="150">mdi-image-broken-variant</v-icon>
          <span class="cta-text" style="font-size:1.5em; color:#bbbbbb;">
            {{ $text.CaseNotFound }}
          </span>
        </div>
      </div>
    </v-container>
    <CaseCreateDialog
      v-if="isEditDialog"
      v-model="isEditDialog"
      :edit="theCase"
    />
  </div>
</template>

<style lang="scss" scoped>
.document-info {
  color: #666666;

  .notfound {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .vert-scroll {
    overflow-y: auto;
  }
}
</style>
