const { test, expect } = require('@playwright/test');
const { HackerNewsPage } = require('./pages/HackerNewsPage');
const { ArticleValidator } = require('./utils/ArticleValidator');
const { PerformanceAnalyzer } = require('./utils/PerformanceAnalyzer');
const { AccessibilityChecker } = require('./utils/AccessibilityChecker');
const { SecurityScanner } = require('./utils/SecurityScanner');
const { reportResults } = require('./utils/Reporter');
const config = require('./app.config.js');  // Import the app.config.js here

/**
 * Main test suite for Hacker News validation
 * This suite demonstrates advanced usage of Playwright, including:
 * - Page Object Model
 * - Performance testing
 * - Accessibility testing
 * - Security scanning
 * - Comprehensive error handling and reporting
 */
test.describe('Hacker News Validation', () => {
  let page;
  let hackerNewsPage;
  let articleValidator;
  let performanceAnalyzer;
  let accessibilityChecker;
  let securityScanner;

  // Setup before all tests
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    hackerNewsPage = new HackerNewsPage(page);
    articleValidator = new ArticleValidator();
    performanceAnalyzer = new PerformanceAnalyzer(page);
    accessibilityChecker = new AccessibilityChecker(page);
    securityScanner = new SecurityScanner(page);

    // Set default timeout for all operations to 30 seconds
    test.setTimeout(30000);
  });

  // Cleanup after all tests
  test.afterAll(async () => {
    await page.close();
  });

  /**
   * Main test case that validates article sorting and performs additional checks
   * This test case is broken down into multiple steps for better organization and reporting
   */
  test('Validate article sorting and perform additional checks', async () => {
    // Step 1: Navigate to Hacker News newest page
    await test.step('Navigate to Hacker News newest page', async () => {
      await hackerNewsPage.navigate(config.baseUrl);  // Use baseUrl from config
      // Verify that the correct page has loaded
      await expect(page).toHaveTitle(/Hacker News/);
    });

    // Step 2: Validate sorting and perform full validation of first 100 articles
    await test.step('Validate sorting and perform full validation of first 100 articles', async () => {
      const articles = await hackerNewsPage.getArticles(config.articleCount);
      const fullValidationResult = await articleValidator.performFullValidation(articles);
      
      expect(fullValidationResult.sorting.isValid, 'Articles should be correctly sorted').toBeTruthy();
      expect(fullValidationResult.isFullyValid, 'Articles should pass all validation checks').toBeTruthy();
      
      if (!fullValidationResult.isFullyValid) {
        console.error('Validation errors:', JSON.stringify(fullValidationResult, null, 2));
      }
    });

    // Step 3: Perform additional interactions
    await test.step('Perform additional interactions', async () => {
      // Perform a search and validate results
      await hackerNewsPage.performSearch(config.searchQuery);
      const searchResults = await hackerNewsPage.getSearchResults();
      expect(searchResults.length, 'Search should return results').toBeGreaterThan(0);

      // Click "More" link and validate additional articles are loaded
      await hackerNewsPage.clickMoreLink();
      const additionalArticles = await hackerNewsPage.getArticles(config.additionalArticlesCount);
      expect(additionalArticles.length, 'Additional articles should be loaded').toBe(config.additionalArticlesCount);
    });

    // Step 4: Check responsive design
    await test.step('Check responsive design', async () => {
      await hackerNewsPage.setMobileViewport(config.viewports.mobile);  // Use mobile viewport from config
      const isMobileMenuVisible = await hackerNewsPage.isMobileMenuVisible();
      expect(isMobileMenuVisible, 'Mobile menu should be visible in mobile viewport').toBeTruthy();
      await hackerNewsPage.resetViewport(config.viewports.desktop);  // Use desktop viewport from config
    });

    // Step 5: Perform performance analysis
    await test.step('Perform performance analysis', async () => {
      const performanceMetrics = await performanceAnalyzer.captureMetrics();
      expect(performanceMetrics.firstContentfulPaint, 'First Contentful Paint should be under threshold')
        .toBeLessThan(config.performanceThresholds.firstContentfulPaint);
      expect(performanceMetrics.timeToInteractive, 'Time to Interactive should be under threshold')
        .toBeLessThan(config.performanceThresholds.timeToInteractive);
      
      console.log('Performance Metrics:', JSON.stringify(performanceMetrics, null, 2));
    });

    // Step 6: Check accessibility
    await test.step('Check accessibility', async () => {
      const accessibilityViolations = await accessibilityChecker.analyze(config.accessibilityLevel);
      expect(accessibilityViolations.length, 'There should be no accessibility violations').toBe(0);
      
      if (accessibilityViolations.length > 0) {
        console.error('Accessibility Violations:', JSON.stringify(accessibilityViolations, null, 2));
      }
    });

    // Step 7: Perform security scan
    await test.step('Perform security scan', async () => {
      const securityIssues = await securityScanner.scan(config.securityHeaders);
      expect(securityIssues.length, 'There should be no security issues').toBe(0);
      
      if (securityIssues.length > 0) {
        console.error('Security Issues:', JSON.stringify(securityIssues, null, 2));
      }
    });

    // New step: Check for broken links
    await test.step('Check for broken links', async () => {
      const brokenLinks = await hackerNewsPage.checkBrokenLinks();
      expect(brokenLinks.length, 'There should be no more than the maximum allowed broken links')
        .toBeLessThanOrEqual(config.maxBrokenLinks);
      
      if (brokenLinks.length > 0) {
        console.error('Broken Links:', JSON.stringify(brokenLinks, null, 2));
      }
    });

    // New step: Validate comment functionality
    await test.step('Validate comment functionality', async () => {
      const commentCount = await hackerNewsPage.getCommentCount(1); // Get comment count for the first article
      await hackerNewsPage.navigateToComments(1);
      const actualComments = await hackerNewsPage.getVisibleComments();
      expect(actualComments.length, 'Visible comments should match the comment count').toBe(commentCount);
    });
  });

  // Additional test case for error handling
  test('Handle network errors gracefully', async () => {
    // Simulate a network error
    await page.route('**/*', route => route.abort('failed'));
    
    await expect(async () => {
      await hackerNewsPage.navigate(config.baseUrl);
    }).rejects.toThrow('net::ERR_FAILED');

    // Verify that our error handling logic captures this error
    const errorLog = await hackerNewsPage.getErrorLog();
    expect(errorLog).toContain('Navigation failed');
  });
});

// Exporting the test results
test.afterAll(async () => {
  await reportResults(test.info().results);
});