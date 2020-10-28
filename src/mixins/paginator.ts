import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Paginator extends Vue {
  // DATA ###########################

  pageLoading = false
  pageSize = 30
  readonly pageLimit = 30
  pagination = false

  // COMPUTED #######################

  // external
  get items() {
    return []
  }

  // external
  get isLoading() {
    return false
  }

  get page() {
    return this.pagination ? this.items.slice(0, this.pageSize) : this.items
  }

  get isLoaderVisible() {
    const hasMore = this.page.length < this.items.length
    return this.items && !this.isLoading && hasMore
  }

  // METHODS ########################

  // pagination, end of the page is reached, load more items
  onLoadMore() {
    if (this.items.length < this.pageSize) {
      return
    }

    this.pageLoading = true

    this.pageSize += this.pageLimit

    // async
    setTimeout(() => {
      this.pageLoading = false
    }, 50)
  }

  // reset pagination
  paginatorReset() {
    this.pageSize = this.pageLimit
  }
}
