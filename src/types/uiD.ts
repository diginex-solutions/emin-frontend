type Rule = (v: string | any) => string | true // validation rule type
export interface Rules {
  [key: string]: Rule[]
}

export interface Form extends Element {
  validate: () => null
  resetValidation: () => null
}
