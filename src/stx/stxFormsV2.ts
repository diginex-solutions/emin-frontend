import { i18n, Msg } from '@/plugins/i18n'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

const t = (msg: Msg) => i18n.tc(msg)

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

export enum FormInputTypesV2 {
  textfield = 'textfield',
  password = 'password',
  passwordConfirm = 'passwordConfirm', //* In order to work password field should have ref="password"
  textarea = 'textarea',
  select = 'select',
  iconSelect = 'iconSelect',
  switch = 'switch',
  checkbox = 'checkbox',
  image = 'image'
}

// Sample of using FormParserV2
const rules = {
  email: 'required|email',
  password: 'required|min:8|max:30', // TODO: complexity rule eg `MustContain`
  passwordConfirm: 'required|password:@password' // @password - field's name, from which value is read
}

const sample = (): Types.FormFieldV2[] => {
  return [
    {
      name: 'email',
      value: '',
      inputType: FormInputTypesV2.textfield,
      label: t(Msg.Email),
      rules: rules.email
    },
    {
      name: 'password',
      value: '',
      inputType: FormInputTypesV2.password,
      label: t(Msg.Password),
      rules: rules.password
    },
    {
      name: 'passwordConfirm',
      value: '',
      inputType: FormInputTypesV2.passwordConfirm,
      label: t(Msg.PasswordConfirm),
      rules: rules.passwordConfirm
    }
  ]
}

//*===💀===💀===💀===💀===💀===💀===💀===💀===💀===💀===💀===💀Export

export default {
  sample
}
