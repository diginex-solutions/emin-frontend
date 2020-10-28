/*
  VeeValidate, custom error messages
*/

import {
  required,
  email,
  max,
  min,
  alpha,
  alpha_num as alhpaNum
} from 'vee-validate/dist/rules'
import { extend } from 'vee-validate'
import { Msg, i18n } from '@/plugins/i18n'

const t = (msg: Msg) => String(i18n.t(msg))

export const initValidation = () => {
  extend('required', {
    ...required,
    message: t(Msg.VeeRequired)
  })

  extend('requiredTos', {
    validate: (value) => !!value,
    message: t(Msg.VeeRequired)
  })

  extend('max', {
    ...max,
    message: t(Msg.VeeMax)
  })

  extend('min', {
    ...min,
    message: t(Msg.VeeMin)
  })

  extend('email', {
    ...email,
    message: t(Msg.VeeEmail)
  })

  extend('alpha', {
    ...alpha,
    message: t(Msg.VeeAlpha)
  })

  extend('alpha_num', {
    ...alhpaNum,
    message: t(Msg.VeeAlphaNum)
  })

  extend('truthy', {
    validate: (value) => !!value,
    message: t(Msg.VeeTruthy)
  })

  extend('password', {
    params: ['target'],
    validate: (value, { target }: any) => value === target,
    message: t(Msg.VeePassword)
  })
}
