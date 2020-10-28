declare namespace Store {
  export type Rule = (v: string | any) => string | true // validation rule type
  export interface Rules {
    [key: string]: Rule[]
  }

  // * === === === === === === === === === ===
  // * Actions 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖 🤖

  export type ActionShowSnackbar = (message: any) => {}

  type PathMethod = 'get' | 'post' | 'put' | 'delete'

  type Path = {
    path: string
    method: PathMethod
  }

  export type MyxoisP = {
    url: Path
    hideError?: boolean
    data: any
    onSuccess: (responseData: any) => {}
    onError: () => {}
    onFinish: () => {} // Executed either success or error
    options?: {}
  }
}
