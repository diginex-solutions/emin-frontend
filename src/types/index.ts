// TODO: clear out root store - do same as modules
import { Actions as RootA, Getters as RootG } from './storeD'
import { Decorators as ArticlesS } from './articlesD'
import { Decorators as AuthS } from './authD'
import { Decorators as DocsS } from './docsD'
import { Decorators as SpacesS } from './spacesD'
import { Decorators as SettingsS } from './settingsD'
import { Form as _Form, Rules as _Rules } from './uiD'
import { Decorators as FormsS } from './formsD'
import { Decorators as NotificationsS } from './notificationsD'
import { Decorators as ConnectionsS } from './connectionsD'
import { Decorators as ActionsS } from './actionsD'
import { Decorators as CasesS } from './casesD'
import { Decorators as DocumentTypesS } from './documentTypesD'
import { Decorators as TemplatesS } from './templatesD'
import { Decorators as UserDirectoryS } from './userDirectoryD'
import { Decorators as WidgetsS } from './widgetsD'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

export type Rules = _Rules
export type Form = _Form
export type TypeGetter = [string, { namespace: string }]
export interface VueRefFocus extends Element {
  focus(): () => void
}

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

export {
  DocsS,
  AuthS,
  RootG,
  RootA,
  SpacesS,
  ArticlesS,
  SettingsS,
  FormsS,
  NotificationsS,
  ConnectionsS,
  ActionsS,
  CasesS,
  DocumentTypesS,
  TemplatesS,
  UserDirectoryS,
  WidgetsS
}
