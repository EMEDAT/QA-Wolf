export default {
  // Base URL for the Hacker News 'newest' page
  baseUrl: 'https://news.ycombinator.com/newest',
  
  // Number of articles to analyze
  articleCount: 100,
  
  // Search query for filtering articles
  searchQuery: 'playwright',
  
  // Number of additional articles to load
  additionalArticlesCount: 30,
  
  // Performance thresholds (in milliseconds)
  performanceThresholds: {
    firstContentfulPaint: 3000,
    timeToInteractive: 6000,
    domContentLoaded: 4000,
    loadTime: 10000
  },
  
  // Viewport sizes for responsive testing
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 }
  },
  
  // Timeout for network requests (in milliseconds)
  networkTimeout: 10000,
  
  // Maximum number of broken links allowed
  maxBrokenLinks: 5,
  
  // Accessibility compliance level
  accessibilityLevel: 'AA' as const,
  
  // Required security headers
  securityHeaders: [
    'Strict-Transport-Security',
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-XSS-Protection'
  ],
  
  // Test user credentials
  testData: {
    validUsername: 'testuser',
    validPassword: 'testpass123'
  }
};