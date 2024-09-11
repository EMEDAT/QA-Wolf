export default {
  baseUrl: 'https://news.ycombinator.com/newest',
  articleCount: 100,
  searchQuery: 'playwright',
  additionalArticlesCount: 30,
  performanceThresholds: {
  firstContentfulPaint: 3000,
  timeToInteractive: 6000,
  domContentLoaded: 4000,
  loadTime: 10000
},
viewports: {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 }
},
networkTimeout: 10000,
maxBrokenLinks: 5,
accessibilityLevel: 'AA' as const,
securityHeaders: [
  'Strict-Transport-Security',
  'Content-Security-Policy',
  'X-Frame-Options',
  'X-XSS-Protection'
],
testData: {
  validUsername: 'testuser',
  validPassword: 'testpass123'
}
};