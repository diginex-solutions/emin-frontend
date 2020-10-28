// === === === === === === === === === ===
// Azure configs

const redirectUri = encodeURI(process.env.VUE_APP_AZURE_REDIRECT_URI || '')

//* Recaptcha config
const recaptchaKey = process.env.VUE_APP_RECAPTCHA_KEY || ''
const captchaV2Key = process.env.VUE_APP_CAPTCHA_V2_KEY || ''
const isRecaptcha = (process.env.VUE_APP_RECAPTCHA || 'false').toLocaleLowerCase() === 'true'

const env = process.env.VUE_APP_ENV || ''

const clientId = process.env.VUE_APP_AZURE_APP_ID
const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&response_mode=query&scope=openid%20https%3A%2F%2Fgraph.microsoft.com%2Fuser.read&state=12345&redirect_uri=${redirectUri}`

// signout url
const signoutRedirectUrl = encodeURI(
  process.env.VUE_APP_AZURE_REDIRECT_DOMAIN || ''
)
const signoutUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${signoutRedirectUrl}`
const downloadDomain = process.env.VUE_APP_DOWNLOAD_DOMAIN
const backendUrl = process.env.VUE_APP_BACKEND_URL
const appName: string = process.env.VUE_APP_APP_NAME || 'Diginex Trust beta'
const logoFileName: string =
  process.env.VUE_APP_LOGO_FILE_NAME ||
  'Diginex-Trust-beta_logo_white.svg' ||
  '181129_Emin_Logo_White.svg'

const colorLogoFileName: string =
  process.env.VUE_APP_COLOR_LOGO_FILE_NAME || 'emin-logo-815x290.png'
const landingImageFileName: string =
  process.env.VUE_APP_LANDING_IMAGE_FILE_NAME ||
  'parallax-bg.jpg' ||
  'emin-parallax-bg.jpg'
const minimalOverview: boolean = JSON.parse(
  process.env.VUE_APP_MINIMAL_OVERVIEW || 'false'
)

const facebookAppID = process.env.VUE_APP_FACEBOOK_APP_ID
const facebookRedirect = encodeURI(
  process.env.VUE_APP_FACEBOOK_REDIRECT_URI || ''
)
const facebook = {
  authUrl: `https://www.facebook.com/v6.0/dialog/oauth?client_id=${facebookAppID}&redirect_uri=${facebookRedirect}&state=${'all right'}&scope=email`
}

// === === === === === === === === === ===
// Handling routes

const azure = {
  clientId,
  authUrl,
  signoutUrl
}

export const config = {
  downloadDomain,
  backendUrl,
  azure,
  facebook,
  appName,
  logoFileName,
  minimalOverview,
  landingImageFileName,
  colorLogoFileName,
  recaptchaKey,
  captchaV2Key,
  env,
  TopicAllId: '-1',
  isRecaptcha
}
