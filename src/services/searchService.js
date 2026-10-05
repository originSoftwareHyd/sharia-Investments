import { articleService } from './articleService'

export const searchService = {
  async search(query) {
    const results = await articleService.search(query)
    return results.filter((item) => !item.isDraft)
  },
}
