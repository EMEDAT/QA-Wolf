// app.config.js

module.exports = {
    // URL for Hacker News newest page
    baseUrl: 'https://news.ycombinator.com/newest',
  
    // Number of articles to validate for sorting
    articleCount: 100,
  
    // Search query for testing search functionality
    searchQuery: 'playwright',
  
    // Number of additional articles to load when clicking "More"
    additionalArticlesCount: 30,
  
    // Performance thresholds (in milliseconds)
    performanceThresholds: {
      firstContentfulPaint: 3000,
      timeToInteractive: 6000,    
      domContentLoaded: 4000,     
      loadTime: 10000            
    },
  
    // Viewport sizes for responsive design testing
    viewports: {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1280, height: 720 }
    },
  
    // Timeout for network requests (in milliseconds)
    networkTimeout: 10000,
  
    // Maximum allowed broken links
    maxBrokenLinks: 5,
  
    // Accessibility compliance level ('A', 'AA', or 'AAA')
    accessibilityLevel: 'AA',
  
    // Security headers to check for
    securityHeaders: [
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-XSS-Protection'
    ],
  
    // Test data
    testData: {
      validUsername: 'testuser',
      validPassword: 'testpass123'
    }
  };