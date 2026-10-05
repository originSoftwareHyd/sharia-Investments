export const appConfig = {
  siteName: 'Shariah Investments',
  siteShortName: 'Shariah Investments',
  contactEmail: 'mujeeb.ansari@gmail.com',
  contactEmailSource: 'Public email shown on the primary site on article and author pages. It is not presented here as a separately verified corporate inbox.',
  apiBaseUrl: import.meta.env?.VITE_API_BASE_URL?.replace(/\/+$/, '') || '',
  storageKeys: {
    userPosts: 'shariah-investments-user-posts',
    drafts: 'shariah-investments-drafts',
  },
  sourceUrls: {
    primary: 'https://shariahinvestments.in/',
    author: 'https://shariahinvestments.in/author/mujeeb-ansarigmail-com/',
  },
}
