import * as EmailValidator from 'email-validator'
import _ from 'lodash'
import { RootA } from '@/types'

// Make folder filter - display only files inside folder
export const isInFolder = (
  currentPath: string,
  path: string,
  name: string,
  isFolder: boolean
) => {
  const root = '/'
  // in case  of folder - need to remove folder name from the path (and check for root)
  if (isFolder) {
    const postfixSize = -1 * (name.length + 1)

    let normalPath = path.slice(0, postfixSize)

    // root check
    normalPath = normalPath.length === 0 ? root : normalPath

    return currentPath.toLowerCase() === normalPath.toLowerCase()
  }

  return currentPath.toLowerCase() === path.toLowerCase()
}

// Make folder filter - display only files inside folder
export const getPathAfterMove = (
  path: string,
  pathBefore: string,
  pathAfter: string
) => {
  const root = '/'

  // Validate change - update request should be correct
  const isCorrect =
    pathBefore === root ||
    (path.startsWith(pathBefore) &&
      (path.length === pathBefore.length || path[pathBefore.length] === '/'))

  if (!isCorrect) {
    return null
  }

  // if root - add extra slash in front, which will be replaced
  if (pathBefore === root) {
    path = '/' + path

    path = path.replace(pathBefore, pathAfter)

    // if only root should have '/' as last symbol
    if (path !== root && path[path.length - 1] === '/') {
      path = path.slice(0, path.length - 1)
    }
    return path
  }

  let newPath = path.replace(pathBefore, pathAfter)
  newPath = newPath.replace('//', '/')

  return newPath
}

// Return folder parent of given path
export const getParentPath = (path: string) => {
  // If only 1 slash - means itself or the next parent is immediate root
  const countSlash = path.split('/').length - 1
  if (countSlash === 1) {
    return '/'
  }

  // Deconstruct parent path out of current path
  const folderIndex = path.lastIndexOf('/')
  if (folderIndex > -1) {
    return path.substring(0, folderIndex)
  }

  return '/'
}

export const isChildPath = (child: string, parent: string) => {
  const root = '/'

  // Validate - that ends in '/', or root
  const isProper =
    parent === root || child === parent || child[parent.length] === '/'

  return child.startsWith(parent) && isProper
}

export const formatDocName = (doc: Docs.Record) => {
  return doc.name + (doc.extension ? `.${doc.extension}` : '')
}

interface Folder {
  name: string
  id: string
  path: string
  children?: Folder[]
}

export const getFolderParent = (folder: Folder, list: Folder[]) => {
  for (const parentFolder of list) {
    if (parentFolder.path === getParentPath(folder.path)) {
      return parentFolder.id
    }
  }

  return null
}

export const listToTree = (list: Folder[]) => {
  const map: {
    [key: string]: number
  } = {}
  let node
  const roots = []
  let i

  for (i = 0; i < list.length; i += 1) {
    map[list[i].id] = i // initialize the map
    list[i].children = [] // initialize the children
  }

  for (i = 0; i < list.length; i += 1) {
    node = list[i]

    const parentId = getFolderParent(node, list)
    if (parentId) {
      const parent = list[map[parentId]]
      // if you have dangling branches check that map[node.parentId] exists
      parent.children = parent.children ? parent.children : []
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

export const isValidEmail = (email: string) => EmailValidator.validate(email)

export function downloadURI(uri: string) {
  const link = document.createElement('a')
  link.download = 'name'
  link.href = uri
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // delete link todo:
}

// show/hide scrollbar depending on value. Add extra margin to compensate jerky movement of el's
export function toggleScrollbar(isOpen: boolean) {
  const htmlEl = document.querySelector('html')
  if (htmlEl) {
    htmlEl.style.overflowY = isOpen ? 'hidden' : 'scroll'
    htmlEl.style.marginRight = isOpen ? '15px' : '0' // compensate for offset
  }
}

// === === === === === === === === === ===
//  handling chart

// iterator to get sequence of colors
function* colorCreator() {
  const colors = [
    [225, 33, 51], // red
    [68, 93, 179], // blue
    [255, 158, 95], // carrot
    [18, 143, 106], // green
    [141, 71, 157], // purple
    [255, 146, 189], // pink
    [143, 234, 255], // skyblue
    [0, 171, 255], // light blue
    [0, 209, 178], // bulma
    [43, 89, 113] // navy
  ]
  const opacityMain = 1
  const opacityBorder = 1

  const colorsMap = colors.map((c) => {
    return {
      main: `rgba(${c.join(', ')}, ${opacityMain})`,
      border: `rgba(${c.join(', ')},  ${opacityBorder})`
    }
  })

  let i = 0
  while (true) {
    if (i >= colorsMap.length) {
      i = 0
    }

    yield colorsMap[i++]
  }
}

export const dataRawToChart = (
  raw: Widgets.AggData,
  isReverseColors = false
) => {
  const getColor = colorCreator() // reset iterator
  // get colors map
  const columnColors = raw.values.map(() => getColor.next().value)

  const bgColors = columnColors.map((c) => c && c.main).reverse()
  const borderColors = columnColors.map((c) => c && c.border).reverse()

  let datasets = [
    {
      data: raw.values.map((v) => v.value),
      backgroundColor: isReverseColors ? bgColors : bgColors.reverse(),
      borderColor: isReverseColors ? borderColors : borderColors.reverse(),
      borderWidth: 1
    }
  ]

  datasets = datasets.reverse()

  return {
    labels: raw.values.map((v) => v.label),
    datasets
  }
}

export const finderById = (targetId: string) => {
  return ({ id }: { id: string }) => id === targetId
}

export const getInputLanguage = (
  id: string,
  languages: Templates.TemplateLanguages[],
  lang: string
) => {
  // Get from formdata inputs languages by currently set system language
  const currentLang = languages.find(
    (l: Templates.TemplateLanguages) => l.lang === lang
  )
  if (!currentLang || !currentLang.inputs) {
    return
  }

  // Get the input from languages by id
  return currentLang.inputs.find((i: Templates.InputLanguage) => i.id === id)
}

export const translateForm = (form: Templates.Record, lang: Auth.Lang) => {
  // Verify 🔐
  if (!form) {
    return null
  }

  const translated: Templates.RecordTranslated = _.cloneDeep(form)

  // Get from formdata inputs languages by currently set system language
  const currentLang = form.languages.find(
    (l: Templates.TemplateLanguages) => l.lang === lang
  )

  if (!currentLang || !currentLang.inputs) {
    return null
  }

  translated.inputs.forEach((input: Templates.InputTranslated) => {
    const inputLang = currentLang.inputs.find(
      (i: Templates.InputLanguage) => i.id === input.id
    )

    input.label = (inputLang && inputLang.label) || ''

    if (input.options) {
      input.options.forEach((o: Templates.Option) => {
        const findById = finderById(o.id)
        if (inputLang && inputLang.options) {
          const translatedOption = inputLang.options.find(findById)
          o.label = (translatedOption && translatedOption.label) || '(No Label)'
        }
      })
    }
  })

  return translated
}

export const getInputsFull = (action: Forms.Record, lang: Auth.Lang) => {
  // Populate value
  const template: Templates.RecordTranslated | null = translateForm(
    action.template,
    lang
  )
  if (!template) {
    return
  }

  const answers = action.answers
  const inputs = (template && template.inputs) || []

  // populate answer label
  const answersFull: Forms.AnswerFull[] = inputs.map((i: Templates.Input) => {
    const label = getInputLanguage(i.id || '', template.languages, lang)

    return {
      ...i,
      value: null,
      label: label ? label.label : '(Label is not provided)'
    }
  })

  answersFull.forEach((answerFull: Forms.AnswerFull) => {
    const answerWithValue = answers.find(
      (a: Forms.Answer) => a.id === answerFull.id
    )

    answerFull.value = answerWithValue && answerWithValue.value
  })

  return answersFull
}

// Pull language for the option
export const getOptionLabel = (
  input: Templates.InputTranslated,
  value: string
) => {
  // See: https://gitlab.diginex/Diginex/Trust/diginex-trust/issues/739
  if (value[0] === '"' && value[value.length - 1] === '"') {
    value = value.substring(1, value.length - 1)
  }
  // * 1. Verify 🔷
  const allOptions = input.options

  if (!allOptions) {
    return
  }

  // * Pull option from input's options list
  const findById = finderById(value)
  const option = allOptions.find(findById)

  return (option && option.label) || ''
}

// Returns string - 2 capitalized letters of user name and surname
export const getShortName = (user: {
  name: string
  surname: string
  email: string
}) => {
  const letter1 = user.name ? user.name.substring(0, 1).toUpperCase() : ''
  const letter2 = user.surname ? user.surname.substring(0, 1).toUpperCase() : ''

  const shortname = `${letter1}${letter2}`
  return shortname ? shortname : user.email.substring(0, 2).toLowerCase()
}

// Check if paths are equal, case-insensitive
export const isPathEqual = (pathOne: string, pathTwo: string) => {
  return pathOne.toLowerCase() === pathTwo.toLowerCase()
}

// Check if path is the parent of child path
export const isPathParent = (pathParent: string, path: string) => {
  const pathLC = path.toLowerCase()
  const pathParentLC = pathParent.toLowerCase()
  return pathLC.startsWith(pathParentLC)
}

type SorterFunc = (d: Docs.Record) => string | number | boolean
type Sorter = { [key in string]: SorterFunc }
interface SorterPayload {
  items: Docs.Record[]
  index: string[]
  isDesc: boolean[]
  defaultField: string
  sorters: Sorter
}

export const sortItems = ({
  items,
  index,
  isDesc,
  defaultField,
  sorters
}: SorterPayload) => {
  // Process vuetify inputs, set default field and order
  const field = index[0] ? index[0] : defaultField
  const order = isDesc[0] ? 'desc' : 'asc'

  // Define primary and secondary sorting rules
  const primarySorter = sorters[field]
  const secondarySorter = sorters[defaultField]

  // Return sorted result
  return _.orderBy(items, [primarySorter, secondarySorter], order)
}

//* Helper to use golang-style syntax with js promises
export const to = (promise: Promise<any>) => {
  return promise.then((val) => [null, val]).catch((err) => [err])
}

//* Wrapper, helper to send requests to myxios instance
type SendReqP = {
  url: Types.ReqUrl
  data?: any
  options?: any
  headers?: any
  onSuccess?: any
}

//* Store dispatches, used to dispatch from root context
export const RTX = { root: true }

//** Promise version
export const sendReqProm = (dispatch: any, payload: SendReqP) => {
  return dispatch(RootA.myxios, payload, RTX)
}
//** Async/await version
export const sendReq = (dispatch: any, payload: SendReqP) => {
  return to(sendReqProm(dispatch, payload))
}

//* Helpers for formatting store
export const makeDecoratorHelpers = (namespace: string) => {
  return {
    scope: { namespace },
    get: 'Getters.',
    act: 'Actions.',
    mut: 'Mutations.'
  }
}
