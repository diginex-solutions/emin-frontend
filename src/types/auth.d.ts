declare namespace Auth {
  export interface State {
    isLogged: boolean
    user: User | null
    token: string
    isWelcomeScreen: boolean
    lang: Lang
  }

  export type Lang = 'en' | 'hi' | 'ur' | 'bn' | 'th'

  export type UserType = 'normal' | 'superUser' | 'diginexAdmin'
  export type PositionType = 'manager' | 'others'

  export interface User {
    email: string
    name: string
    surname: string
    brand: string
    dateOfBirth: string
    workDepartment: string
    workTitle: string
    countryCode: string
    phoneNumber: string
    gender: string
    location: string
    id: string
    createdAt: Date
    lang: Lang
    userType: UserType
    isRegistered: boolean
    role: string
    positionType: PositionType
    isExternal?: boolean
  }

  // * === === === === === === === === === ===
  // * Actions 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖

  // User closes initial welcome screen shown to new users
  export type HideWelcomeA = () => Promise<null>

  export type LogoutA = (noRedirect?: boolean) => Promise<null>

  export type UpdateUserA = (p: any) => Promise<void>

  // User selects interface language
  export type SetLangA = (lang: Lang) => Promise<null>

  // User signs in
  export type SigninA = (p: SigninP) => Promise<null>
  export interface SigninP {
    email: string
    password: string
    recaptcha: string
    captcha: string
  }

  export type IsEmailRegisteredA = (email: string) => Promise<boolean>

  // Forgot password - request to send email with reset link
  export type ForgotPasswordA = (p: ForgotPasswordP) => Promise<null>
  export interface ForgotPasswordP {
    email: string
    recaptcha: string
    captcha: string
  }

  // User resets password through reset link
  export type ResetPasswordA = (p: ResetPasswordP) => Promise<null>
  export interface ResetPasswordP {
    password: string
    passwordConfirm: string
  }

  export type ChangePasswordA = (p: ChangePasswordP) => Promise<null>
  export interface ChangePasswordP {
    currentPassword: string
    newPassword?: string
    password?: string
  }

  export type RegisterA = (user: NewUser) => Promise<null>
  export type LoginV8A = (jwt: string) => Promise<void>

  // * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀

  // Rest of the stuff
  export interface NewUser {
    email: string
    name: string
    surname: string
    password: string
    passwordConfirm: string
    lang: Language
    recaptcha: string
    captcha: string
  }

  // Used to handle users, that go through email link, and are not logged in yet
  export interface UnauthedUser {
    email: string
    name: string
    surname: string
    lang: Language
    token?: string
  }

  // * Server response, after user is authed
  export interface SigninResponse {
    user: User
    token: string
  }

  export type Language = 'en' | 'hi' | 'ur' | 'bn' | 'th'

  export interface ResetPasswordPayload {
    password: string
    passwordConfirm: string
  }

  export interface SigninPayload {
    email: string
    password: string
    recaptcha: string
    captcha: string
  }

  export interface LoginP {
    code?: string
    signInAuthority: AuthProviders
  }

  // ! Synced (*D <-> *.d)
  enum AuthProviders {
    facebook = 'facebook',
    microsoft = 'microsoft',
    diginex = 'diginex'
  }
}
