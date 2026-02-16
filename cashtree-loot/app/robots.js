export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/dashboard/', // Don't let Google scan private user dashboards
    },
    sitemap: 'https://cashttree.online/sitemap.xml',
  }
}