import { i18n, Msg } from '@/plugins/i18n' // TODO: try refac to use composeTranslations
import { isValidEmail } from '@/utils/helpers'

// TODO: fix any
type Rule = (v: any, param?: any) => any
interface Ivalidator {
  [k: string]: Rule
}

export const validator: Ivalidator = {
  required: (v: string | boolean) => !!v || i18n.tc(Msg.RuleRequired),
  lessOrEqual: (v: string, max: number) =>
    !v || v.length <= max || i18n.tc(Msg.RuleLessOrEqual, max),
  moreOrEqual: (v: string, min: number) =>
    (!!v && v.length >= min) || i18n.tc(Msg.RuleMoreOrEqual, min),
  badChar: (v: string, char: string) =>
    (!!v && v.indexOf(char) === -1) || i18n.tc(Msg.RuleBadChar, 0, { char }),
  onlyLatin: (v: string) =>
    (!!v && /^[a-zA-Z]+$/.test(v)) || i18n.tc(Msg.RuleOnlyLatin),
  email: (v: string) => isValidEmail(v) || i18n.tc(Msg.RuleEmail),
  oneLowerCase: (v: string) =>
    /(?=.*[a-z])/.test(v) || i18n.tc(Msg.RuleOneLowerCase),
  oneUpperCase: (v: string) =>
    /(?=.*[A-Z])/.test(v) || i18n.tc(Msg.RuleOneUpperCase),
  oneSpecialChar: (v: string) =>
    /(?=.*\W)/.test(v) || i18n.tc(Msg.RuleOneSpecialChar),
  oneNumber: (v: string) => /(?=.*[0-9])/.test(v) || i18n.tc(Msg.RuleOneNumber),

  // Characters that string is forbidden to contain
  badChars: (v: string, badChars: string[]) => {
    for (const badChar of badChars) {
      if (!!v && v.indexOf(badChar) > -1) {
        return `Cannot contain ${badChar}`
      }
    }
    return true
  },

  // String should not be equal strings in array
  notEqual: (v: string, badEquals: string[]) => {
    for (const badEqual of badEquals) {
      if (!!v && v === badEqual) {
        return `Should not be equal to ${badEqual}`
      }
    }
    return true
  }
}

type Ivalidation = {
  [key: string]: (param?: any) => Ivalidation
} & { getRules: () => Rule[] }

function generateInterface() {
  const interfaceValidation = {} as Ivalidation
  const arrayOfRules = [] as Rule[]
  for (const rule of Object.keys(validator)) {
    interfaceValidation[rule] = (option) => {
      arrayOfRules.push((value: any) => validator[rule](value, option))
      return interfaceValidation
    }
  }
  interfaceValidation.getRules = () => arrayOfRules
  return interfaceValidation
}

export const validation = () => generateInterface()

export const valid = {
  password: {
    min: 8
  },
  text: {
    max: 30,
    min: 2
  },
  optionalText: {
    max: 30
  },
  countryCode: {
    max: 5
  },
  phoneNumber: {
    max: 10
  }
}

export const rules = {
  email: validation()
    .required()
    .email()
    .getRules(),
  password: validation()
    .moreOrEqual(valid.password.min)
    .lessOrEqual(valid.text.max)
    .oneLowerCase()
    .oneUpperCase()
    .oneNumber()
    .oneSpecialChar()
    .getRules(),
  text: validation()
    .required()
    .lessOrEqual(valid.text.max)
    .moreOrEqual(valid.text.min)
    .getRules(),
  phoneNumber: validation()
    .lessOrEqual(valid.phoneNumber.max)
    .getRules(),
  countryCode: validation()
    .lessOrEqual(valid.countryCode.max)
    .getRules(),
  optionalText: validation()
    .lessOrEqual(valid.optionalText.max)
    .getRules()
}
