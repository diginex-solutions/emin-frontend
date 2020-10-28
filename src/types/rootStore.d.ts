declare namespace RootStore {
  // State
  export interface State {
    snackbarMessage: string
    loaderActive: boolean
    loadingQueue: number
  }

  export type UpdateLoadingA = (isLoading: boolean) => Promise<void>
}
