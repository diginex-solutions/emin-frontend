import { i18n, Msg } from '@/plugins/i18n'
import stx from '@/types/stx'
import { validator } from '@/utils/validator'
import { ContactSource } from '@/types/casesD'

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Types

export enum FormInputTypes {
  textfield = 'textfield',
  textarea = 'textarea',
  select = 'select',
  iconSelect = 'iconSelect',
  switch = 'switch',
  checkbox = 'checkbox',
  file = 'file',
  contactSelect = 'contactSelect'
}

type RuleValue = string | number

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Helpers

export type Rule = (v: string | number) => true | string // * Validation rule

const t = (msg: Msg) => i18n.tc(msg)
const validFieldValues: {
  [key in string]: {
    [key in string]: Types.FormFieldValid
  }
} = {
  space: {
    name: { min: 3, max: 500, required: true },
    description: { min: 3, max: 500 },
    icon: {}
    // allowInviteAll: { boolean: true }
  },

  case: {
    caseType: { required: true },
    relatedTo: {},
    description: { min: 2, max: 500, required: true },
    resolutionPlan: { max: 500 }
  },

  documentType: {
    title: { min: 0, max: 100, required: true },
    description: { min: 2, max: 200, required: true }
  },

  article: {
    title: { min: 2, max: 150, required: true },
    text: { min: 2, max: 1000, required: true }
  },

  topic: {
    name: { min: 3, max: 500, required: true },
    icon: {}
  },

  articleFeedback: {
    // isHelpful: {}, // Boolean
    // notUsefulReason: {}, // Should be index of provided reasons
    // text: {} // String, could be empty
  },

  issue: {
    caseType: { required: true },
    name: { min: 2, max: 250, required: true },
    description: { min: 2, max: 500, required: true },
    upload: { required: false }
  },

  improvement: {
    text: { min: 3, max: 500, required: true }
  }
}

// * Restrictions on form fields

// * Helper to compose rules based on validFieldValues
export const getRules = (valid: Types.FormFieldValid): Types.Rule[] => {
  const rules: Types.Rule[] = []
  if (!valid) return rules

  if (valid.min) {
    const minFunc = (v: RuleValue) => validator.moreOrEqual(v, valid.min)
    rules.push(minFunc)
  }
  if (valid.max) {
    const maxFunc = (v: RuleValue) => validator.lessOrEqual(v, valid.max)
    rules.push(maxFunc)
  }
  return rules
}

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Main

// ! Value is required - will be default
// * Needs to be callable, to gen new object, otherwise reference issues
const space = () => {
  const valid = validFieldValues.space
  return [
    {
      name: 'name',
      value: '',
      inputType: FormInputTypes.textfield,
      label: t(Msg.Name),
      rules: getRules(valid.name),
      valid: valid.name
    },
    {
      name: 'description',
      value: '',
      label: t(Msg.Description),
      inputType: FormInputTypes.textarea,
      rules: getRules(valid.description),
      valid: valid.description
    },
    {
      name: 'icon',
      value: stx.materialIconsBusiness[0],
      title: t(Msg.Icon),
      label: t(Msg.Icon),
      inputType: FormInputTypes.iconSelect,
      inputOptions: stx.materialIconsBusiness,
      valid: valid.icon
    },
    {
      name: 'isUserDirectory',
      value: true,
      label: t(Msg.SpaceSettingsUserDirectory),
      inputType: FormInputTypes.switch
    },
    {
      name: 'allowInviteAll',
      value: false,
      label: t(Msg.SpaceSettingsAllowInvite),
      inputType: FormInputTypes.switch
    }
  ]
}

const spaceSettingsAdmin = (): Types.FormField[] => {
  return [
    {
      name: 'isOrganization',
      value: true,
      label: t(Msg.SpaceSettingsIsOrganization),
      inputType: FormInputTypes.switch
    },
    {
      name: 'isForms',
      value: true,
      label: t(Msg.SpaceSettingsIsForms),
      inputType: FormInputTypes.switch
    },
    {
      name: 'isCases',
      value: true,
      label: t(Msg.SpaceSettingsIsCases),
      inputType: FormInputTypes.switch
    },
    {
      name: 'isDashboard',
      value: true,
      label: t(Msg.SpaceSettingsIsDashboard),
      inputType: FormInputTypes.switch
    },
    {
      name: 'isChecklist',
      value: true,
      label: t(Msg.SpaceSettingsIsChecklist),
      inputType: FormInputTypes.switch
    },
    {
      name: 'isSupport',
      value: true,
      label: t(Msg.SpaceSettingsIsSupport),
      inputType: FormInputTypes.switch
    },

    {
      name: 'userLimit',
      value: 100,
      title: t(Msg.UserLimit),
      label: t(Msg.UserLimit),
      inputType: FormInputTypes.select,
      inputOptions: [10, 50, 100, 1000, 10000]
    }
  ]
}

const caseFields = () => {
  const valid = validFieldValues.case

  return [
    {
      name: 'caseType',
      value: '',
      inputType: FormInputTypes.select,
      label: t(Msg.CaseType),
      rules: getRules(valid.caseType),
      valid: valid.caseType,
      selectorText: 'text',
      selectorValue: 'id'
    },
    {
      name: 'relatedTo',
      value: null,
      inputType: FormInputTypes.contactSelect,
      label: t(Msg.RelatedTo),
      rules: [(v: any) => validator.required(v)],
      multiple: false,
      allowInviteUser: false,
      contactType: ContactSource.userDirectory
    },
    {
      name: 'description',
      value: '',
      label: t(Msg.Description),
      inputType: FormInputTypes.textarea,
      rules: getRules(valid.description),
      valid: valid.description
    },
    {
      name: 'resolutionPlan',
      value: '',
      label: t(Msg.ResolutionPlan),
      inputType: FormInputTypes.textarea,
      rules: getRules(valid.resolutionPlan),
      valid: valid.resolutionPlan
    },
    {
      name: 'file',
      value: null,
      inputType: FormInputTypes.file,
      label: t(Msg.PanelUpload),
      multiple: true,
      maxCount: 3,
      customStyle: {
        display: 'flex',
        justifyContent: 'space-between'
      }
    }
  ]
}

const documentType = () => {
  const valid = validFieldValues.documentType

  return [
    {
      name: 'title',
      value: '',
      inputType: FormInputTypes.textfield,
      label: t(Msg.Category),
      rules: getRules(valid.title),
      valid: valid.title
    },
    {
      name: 'description',
      value: '',
      inputType: FormInputTypes.textarea,
      label: t(Msg.Description),
      rules: getRules(valid.description),
      valid: valid.description
    }
  ]
}

const article = (): Types.FormField[] => {
  const valid = validFieldValues.article

  return [
    {
      name: 'title',
      value: '',
      inputType: FormInputTypes.textfield,
      label: t(Msg.Name),
      rules: getRules(valid.title),
      valid: valid.title
    },
    {
      name: 'text',
      value: '',
      inputType: FormInputTypes.textfield,
      label: t(Msg.ArticleText),
      rules: getRules(valid.text),
      valid: valid.text
    }
  ]
}

const articleFeedback = (): Types.FormField[] => {
  const valid = validFieldValues.articleFeedback

  return [
    {
      name: 'isHelpful',
      value: false,
      inputType: FormInputTypes.checkbox,
      label: t(Msg.ArticleIsUseful),
      rules: getRules(valid.title),
      valid: valid.title,
      hidden: true
    },
    {
      name: 'improvementId',
      value: 100,
      title: t(Msg.ArticleNotUsefulReason),
      label: t(Msg.ArticleNotUsefulReason),
      inputType: FormInputTypes.select,
      inputOptions: [],
      selectorText: 'text',
      selectorValue: 'id',
      showLabelInSmallScreen: true
    },
    {
      name: 'tellUsMore',
      value: '',
      inputType: FormInputTypes.textfield,
      label: t(Msg.ArticleTellMore),
      rules: getRules(valid.text),
      valid: valid.text
    }
  ]
}

const topic = () => {
  const valid = validFieldValues.space
  return [
    {
      name: 'name',
      value: '',
      inputType: FormInputTypes.textfield,
      label: t(Msg.Name),
      rules: getRules(valid.name),
      valid: valid.name
    },
    {
      name: 'icon',
      value: stx.materialIconsBusiness[0],
      title: t(Msg.Icon),
      label: t(Msg.Icon),
      inputType: FormInputTypes.iconSelect,
      inputOptions: stx.materialIconsBusiness,
      valid: valid.icon
    }
  ]
}

const workerCase = () => {
  const valid = validFieldValues.issue

  return [
    {
      name: 'caseType',
      value: '',
      inputType: FormInputTypes.select,
      label: t(Msg.CaseType),
      rules: getRules(valid.caseType),
      valid: valid.caseType,
      selectorText: 'text',
      selectorValue: 'id'
    },
    {
      name: 'description',
      value: '',
      inputType: FormInputTypes.textarea,
      label: t(Msg.Description),
      rules: getRules(valid.description),
      valid: valid.description
    },
    {
      name: 'file',
      value: null,
      inputType: FormInputTypes.file,
      label: t(Msg.PanelUpload),
      multiple: true,
      maxCount: 3,
      customStyle: {
        display: 'flex',
        justifyContent: 'space-between'
      }
    }
  ]
}

const editCase = () => {
  const valid = validFieldValues.case

  return [
    {
      name: 'assignedTo',
      value: '',
      inputType: FormInputTypes.contactSelect,
      label: t(Msg.AssignedTo),
      multiple: false,
      allowInviteUser: false,
      contactType: ContactSource.manager
    },
    {
      name: 'resolutionPlan',
      value: '',
      label: t(Msg.ResolutionPlan),
      inputType: FormInputTypes.textarea,
      rules: getRules(valid.resolutionPlan),
      valid: valid.resolutionPlan
    }
  ]
}

const improvement = () => {
  const valid = validFieldValues.improvement
  return [
    {
      name: 'text',
      value: '',
      inputType: FormInputTypes.textfield,
      label: t(Msg.Text),
      rules: getRules(valid.text),
      valid: valid.text
    }
  ]
}

const FormFields = {
  space,
  case: caseFields,
  spaceSettingsAdmin,
  documentType,
  topic,
  articleFeedback,
  article,
  workerCase,
  editCase,
  improvement
}

export default FormFields
