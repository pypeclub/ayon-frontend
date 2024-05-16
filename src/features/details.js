import { createSlice } from '@reduxjs/toolkit'
import getInitialStateLocalStorage from './middleware/getInitialStateLocalStorage'

export const filterActivityTypes = {
  activity: ['comment', 'version.publish', 'status.change', 'assignee.add', 'assignee.remove'],
  comments: ['comment'],
  publishes: ['version.publish'],
  checklists: ['checklist'],
}

const initialStateSlideOut = {
  entityType: '',
  entityId: '',
  projectName: '',
}

const scopes = ['dashboard', 'project']

const detailsSlice = createSlice({
  name: 'details',
  initialState: {
    pinned: {
      filter: getInitialStateLocalStorage('details/filter', 'activity'),
      activityTypes:
        filterActivityTypes[getInitialStateLocalStorage('details/filter', 'activity')] || [],
      tab: 'feed', // feed | attribs | representations
    },
    slideOut: {
      dashboard: initialStateSlideOut,
      project: initialStateSlideOut,
      filter: 'activity',
      activityTypes: filterActivityTypes.activity,
      tab: 'feed', // feed | attribs | representations
    },
  },
  reducers: {
    updateDetailsPanelTab: (state, { payload }) => {
      const location = payload.isSlideOut ? 'slideOut' : 'pinned'

      // toggle the details open
      state[location].tab = payload.tab
    },
    updateFeedFilter: (state, { payload }) => {
      const location = payload.isSlideOut ? 'slideOut' : 'pinned'
      state[location].filter = payload.value
      state[location].activityTypes =
        filterActivityTypes[payload.value] || filterActivityTypes.activity
      // switch back to feed tab
      state[location].tab = 'feed'
    },
    openSlideOut: (state, { payload }) => {
      const scope = payload.scope
      if (!scope && scopes.includes(scope)) return
      // open slide out
      state.slideOut[scope].entityType = payload.entityType
      state.slideOut[scope].entityId = payload.entityId
      state.slideOut[scope].projectName = payload.projectName
      // close all other scopes
      for (const s of scopes) {
        if (s !== scope) {
          state.slideOut[s] = initialStateSlideOut
        }
      }

      state.slideOut.tab = payload.tab || state.slideOut.tab
    },
    closeSlideOut: (state) => {
      for (const scope of scopes) {
        state.slideOut[scope] = initialStateSlideOut
      }
    },
  },
})

export const { updateDetailsPanelTab, updateFeedFilter, openSlideOut, closeSlideOut } =
  detailsSlice.actions
export default detailsSlice.reducer

// topics that need to set localStorage. If there is no explicit value, it will be the payload value
export const detailsLocalItems = {
  'dashboard/updateFeedFilter': [{ key: 'details/filter' }],
}