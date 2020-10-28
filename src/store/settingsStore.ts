import { routesApi } from '@/router'
import { RootA, WidgetsS } from '@/types/'
import Stx from '@/types/stx.ts'
import _ from 'lodash'
import Vue from 'vue'
import { Module } from 'vuex'
import { sendReq, RTX } from '@/utils/helpers'
import { Getters, Mutations, Actions } from '@/types/settingsD'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary;

//* Returns layout with default parameters (position, size on the canvas)
const getDefaultLayout = (i = '-1'): Settings.Layout => {
  return { i, x: 0, y: 0, w: 4, h: 10, minW: 4, minH: 10 }
}

type Record = Settings.Record
type ModuleState = Settings.State

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

export const settingsStore: Module<ModuleState, RootStore.State> = {
  namespaced: true,
  state: {
    records: []
  },
  getters: {
    // return new array of records
    [Getters.records](state): Record[] {
      return [...state.records]
    },

    // Show dashboard only if allowed
    [Getters.isShowDashboard](state): boolean {
      const findSetting = (s: Record) => s.name === Stx.showDashboard
      const isShowDashboard = state.records.find(findSetting)
      return Boolean(isShowDashboard && isShowDashboard.value)
    },

    [Getters.getLayoutsSetting](state): Record | undefined {
      const findLayouts = (s: Record) => s.name === Stx.settingsLayout
      return state.records.find(findLayouts)
    },

    // Get layout
    [Getters.layout](state): Settings.Layout[] {
      const findSetting = (s: Record) => s.name === Stx.settingsLayout
      const layout = state.records.find(findSetting)
      if (!layout || !layout.value) return []
      return [...layout.value]
    }
  },
  mutations: {
    [Mutations.set](state, payload = []) {
      state.records = payload
    },

    [Mutations.create](state, payload) {
      state.records = [...state.records, payload]
    },

    [Mutations.delete](state, id) {
      const finderById = (p: Record) => p.id === id
      const index = state.records.findIndex(finderById)
      if (index < 0) return
      state.records.splice(index, 1)
    },

    [Mutations.update](state, record) {
      const index = state.records.findIndex((p: Record) => p.id === record.id)
      Vue.set(state.records, index, record)
    }
  },

  actions: {
    async [Actions.fetch]({ commit, dispatch }) {
      const url = routesApi.settings.index()
      dispatch(RootA.updateLoading, true, RTX)
      const [err, res] = await sendReq(dispatch, { url })
      dispatch(RootA.updateLoading, false, RTX)
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.set, res)
      return Promise.resolve(res)
    },

    async [Actions.create]({ commit, dispatch }, data) {
      const url = routesApi.settings.create()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.create, res)
      return Promise.resolve(res)
    },

    async [Actions.update]({ commit, dispatch }, data) {
      const url = routesApi.settings.update(data.id)
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.update, res)
      return Promise.resolve(res)
    },

    async [Actions.delete]({ dispatch }, { id }) {
      const url = routesApi.settings.delete(id)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      return Promise.resolve(res)
    },

    async [Actions.dashboardDisable]({ state, commit, dispatch }) {
      const findSetting = (s: Record) => s.name === Stx.showDashboard
      const dashboardSetting = state.records.find(findSetting)
      if (!dashboardSetting) return

      //* Send request
      const url = routesApi.settings.delete(dashboardSetting.id)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.delete, dashboardSetting.id)
      return Promise.resolve(res)
    },

    [Actions.reset]({ commit }) {
      commit(Mutations.set)
      return Promise.resolve()
    },

    [Actions.setLayout]({ state, dispatch }, payload) {
      const findLayouts = (s: Record) => s.name === Stx.settingsLayout
      const layoutsSetting = state.records.find(findLayouts)

      const convertLayout = (l: Settings.Layout) => {
        return {
          x: l.x,
          y: l.y,
          w: l.w,
          h: l.h,
          minW: l.minW ? l.minW : getDefaultLayout().minW,
          minH: l.minH ? l.minH : getDefaultLayout().minH,
          i: l.i
        }
      }
      const value = payload.map(convertLayout)

      // If layout setting is not set yet - initiate create flow
      if (!layoutsSetting) {
        const payload = { name: Stx.settingsLayout, value }
        return dispatch(Actions.create, payload)
      }

      layoutsSetting.value = value
      return dispatch(Actions.update, layoutsSetting)
    },

    [Actions.syncLayouts]({ dispatch, getters, rootGetters }) {
      const widgets = rootGetters[WidgetsS.extRecords]
      const layouts = getters[Getters.layout]

      //* Clear empty layouts - happens if user deleted widget from another browser/machine
      layouts.forEach((layout: Settings.Layout) => {
        const finderById = (p: Record) => p.id === layout.i
        if (widgets.find(finderById)) return Promise.reject()
        const findById = (l: Settings.Layout) => l.i === layout.i
        const layoutIndex = layouts.findIndex(findById)
        layouts.splice(layoutIndex, 1)
      })

      // Check if every widget has a layout assigned
      widgets.forEach((widget: Widgets.Record) => {
        // if there's layout for this widget - skip
        const findById = ({ i }: { i: string }) => i === widget.id
        if (layouts.find(findById)) return Promise.reject()

        // else, if no layout - copy existing layout or create
        let layoutRow = getDefaultLayout()

        if (layouts.length > 0) {
          // Copy the values of the most-bottom widget on the page
          const sortByLayout = (l: Settings.Layout) => l.y
          const layoutSorted = _.orderBy(layouts, sortByLayout, 'desc')
          //! TODO: it used to be "layout", w unused 'layoutSOrted' - bug?
          layoutRow = _.clone(layoutSorted[0])
        }

        layoutRow.i = widget.id
        layouts.push(layoutRow)
      })
      return dispatch(Actions.setLayout, [...layouts])
    },

    [Actions.resetLayout]({ dispatch, state }) {
      //* Refactored version, not tested
      // const getWidgetReset = (w: Settings.Record) => getDefaultLayout(w.id)
      // const layoutReset = state.records.map(getWidgetReset)
      // return dispatch(Actions.setLayout, layoutReset)

      const layout: Settings.Layout[] = []

      state.records.forEach((w) => {
        const layoutRow = getDefaultLayout()
        layoutRow.i = w.id
        layout.push(layoutRow)
      })

      return dispatch(Actions.setLayout, layout)
    }
  }
}
