// === === === === === === === === === ===

// HistoryActions - info for presenting history actions, eg title, icon, color
export const HistoryActions = {
  create: {
    title: 'Create',
    code: 'create',
    icon: 'insert_drive_file',
    color: '#6058dc',
    iconClass: 'blue white--text'
  },
  share: {
    title: 'Share',
    code: 'share',
    icon: 'lock_open',
    color: '#e47348',
    iconClass: 'red white--text'
  },
  unshare: {
    title: 'Unshare',
    code: 'unshare',
    icon: 'lock',
    color: '#75cc25',
    iconClass: 'red white--text'
  },
  archived: {
    title: 'Archived',
    code: 'archived',
    icon: 'archive',
    color: '#929292',
    iconClass: 'pink white--text'
  },
  restored: {
    title: 'Restored',
    code: 'restored',
    icon: 'unarchive',
    color: '#6ab99c',
    iconClass: 'pink white--text'
  },
  renamed: {
    title: 'Renamed',
    code: 'renamed',
    icon: 'person_add',
    color: '#58cadc',
    iconClass: 'pink white--text'
  },
  // eslint-disable-next-line
  action_created: {
    title: 'Verification Request Sent',
    code: 'action_created',
    icon: 'assignment',
    color: '#cc2531',
    iconClass: 'white--text'
  },

  // eslint-disable-next-line
  action_received: {
    title: 'Verification Request Received',
    code: 'action_received',
    icon: 'assignment_late',
    color: 'orange',
    iconClass: 'white--text'
  },

  // eslint-disable-next-line
  action_accepted: {
    title: 'Verification Accepted',
    code: 'action_accepted',
    icon: 'assignment_turned_in',
    color: '#1bb7a1',
    iconClass: 'white--text'
  },

  // eslint-disable-next-line
  action_rejected: {
    title: 'Verification Rejected',
    code: 'action_rejected',
    icon: 'assignment_turned_in',
    color: '#e99090',
    iconClass: 'white--text'
  },
  // eslint-disable-next-line
  action_updated: {
    title: 'Action Edited',
    code: 'action_updated',
    icon: 'mdi-clipboard-text',
    color: '#e99090',
    iconClass: 'white--text'
  },

  // ? Form history viewed | filled

  // ? Dupe of create
  created: {
    title: 'Create',
    code: 'create',
    icon: 'insert_drive_file',
    color: '#6058dc',
    iconClass: 'blue white--text'
  },

  viewed: {
    title: 'Viewed',
    code: 'viewed',
    icon: 'mdi-eye',
    color: '#58cadc',
    iconClass: 'pink white--text'
  },

  filled: {
    title: 'Filled',
    code: 'filled',
    icon: 'assignment_turned_in',
    color: '#58cadc',
    iconClass: 'pink white--text'
  },

  // ? Dupe of action_accepted
  accepted: {
    title: 'Verification Accepted',
    code: 'action_accepted',
    icon: 'assignment_turned_in',
    color: '#1bb7a1',
    iconClass: 'white--text'
  },

  // ? Dupe of action_rejected
  rejected: {
    title: 'Verification Rejected',
    code: 'action_rejected',
    icon: 'assignment_turned_in',
    color: '#e99090',
    iconClass: 'white--text'
  },
  // eslint-disable-next-line
  new_version: {
    title: 'New Version Uploaded',
    code: 'action_new_version',
    icon: 'mdi-new-box',
    color: '#e99090',
    iconClass: 'white--text'
  },
  // eslint-disable-next-line
  category_added: {
    title: 'Category updated',
    code: 'category_added',
    icon: 'check_box',
    color: '#e99090',
    iconClass: 'white--text'
  }
}
