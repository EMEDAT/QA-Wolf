import { test, expect, Page, Browser, TestInfo } from '@playwright/test';
import { HackerNewsPage } from './pages/HackerNewsPage';
import { ArticleValidator, FullValidationResult } from './utils/ArticleValidator';
import { PerformanceAnalyzer, PerformanceMetrics } from './utils/PerformanceAnalyzer';
import { AccessibilityChecker } from './utils/AccessibilityChecker';
import { SecurityScanner } from './utils/SecurityScanner';
import { reportResults, PlaywrightTestResult } from './utils/Reporter';
import config from './app.config';

// Import AxePuppeteer for accessibility testing
const { AxePuppeteer } = require('axe-puppeteer');

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
  // Declare variables for page, utilities, and helpers
  let page: Page;
  let hackerNewsPage: HackerNewsPage;
  let articleValidator: ArticleValidator;
  let performanceAnalyzer: PerformanceAnalyzer;
  let accessibilityChecker: AccessibilityChecker;
  let securityScanner: SecurityScanner;

  // Setup before all tests
  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    // Initialize the page
    page = await browser.newPage();
    
    // Initialize utility classes
    hackerNewsPage = new HackerNewsPage(page);
    articleValidator = new ArticleValidator(page);
    performanceAnalyzer = new PerformanceAnalyzer(page, config);
    accessibilityChecker = new AccessibilityChecker(page, config);
    securityScanner = new SecurityScanner(page, config);

    // Set a timeout for the tests
    test.setTimeout(30000);
  });

  // Cleanup after all tests
  test.afterAll(async () => {
    // Close the page after all tests are completed
    await page.close();
  });

  // Test: Validate first 100 articles on Hacker News/newest are sorted from newest to oldest
  test('Validate first 100 articles on Hacker News/newest are sorted from newest to oldest', async () => {
    // Retrieve the first 100 articles from the page
    const articles = await hackerNewsPage.getFirstHundredArticles();
    
    // Check if we got exactly 100 articles
    expect(articles.length).toBe(100);

    // Validate that the articles are sorted correctly
    const isSorted = hackerNewsPage.validateSorting(articles);
    
    // Expect the sorting to be correct
    expect(isSorted).toBe(true);

    // Additional check: Verify that each article's timestamp is less than or equal to the previous one
    let prevTimestamp = Infinity;
    for (const article of articles) {
      // Check if the current article's timestamp is less than or equal to the previous one
      expect(article.timestamp).toBeLessThanOrEqual(prevTimestamp);
      // Update the previous timestamp for the next iteration
      prevTimestamp = article.timestamp;
    }
  });

  // Main test case that validates article sorting and performs additional checks
  test('Validate article sorting and perform additional checks', async () => {
    // Navigate to Hacker News
    await navigateToHackerNews();
    
    // Validate article sorting
    await validateArticleSorting();
    
    // Perform additional interactions on the page
    await performAdditionalInteractions();
    
    // Check responsive design
    await checkResponsiveDesign();
    
    // Analyze performance metrics
    await performPerformanceAnalysis();
    
    // Check accessibility
    await checkAccessibility();
    
    // Perform security scan
    await performSecurityScan();
    
    // Check for broken links
    await checkForBrokenLinks();
    
    // Validate comment functionality
    await validateCommentFunctionality();
  });

  // Additional test case for error handling
  test('Handle network errors gracefully', async () => {
    // Simulate a network error and check error handling
    await simulateNetworkError();
  });

  // Exporting the test results
  test.afterAll(async ({ }, testInfo: TestInfo) => {
    // Report the results of all tests
    await reportResults(testInfo as any as PlaywrightTestResult);
  });

  // Helper functions

  // Navigate to Hacker News newest page
  async function navigateToHackerNews() {
    await test.step('Navigate to Hacker News newest page', async () => {
      // Navigate to the Hacker News page
      await hackerNewsPage.navigate();
      
      // Check if the page title contains "Hacker News"
      await expect(page).toHaveTitle(/Hacker News/);
    });
  }

  // Validate sorting and perform full validation of first 100 articles
  async function validateArticleSorting() {
    await test.step('Validate sorting and perform full validation of first 100 articles', async () => {
      // Get all article elements from the page
      const articleElements = await hackerNewsPage.getArticles();

      // Perform full validation on the articles
      const fullValidationResult: FullValidationResult = await articleValidator.performFullValidation(articleElements);

      // Check if articles are correctly sorted
      expect(fullValidationResult.sorting.isValid, 'Articles should be correctly sorted').toBeTruthy();
      
      // Check if articles pass all validation checks
      expect(fullValidationResult.isFullyValid, 'Articles should pass all validation checks').toBeTruthy();

      // Log validation errors if any
      if (!fullValidationResult.isFullyValid) {
        console.error('Validation errors:', JSON.stringify(fullValidationResult, null, 2));
      }
    });
  }

  // Perform additional interactions
  async function performAdditionalInteractions() {
    await test.step('Perform additional interactions', async () => {
      // Perform a search using the configured search query
      await hackerNewsPage.performSearch(config.searchQuery);
      
      // Get search results
      const searchResults = await hackerNewsPage.getSearchResults();
      
      // Check if search returned any results
      expect(searchResults.length, 'Search should return results').toBeGreaterThan(0);

      // Click on the "More" link to load additional articles
      await hackerNewsPage.clickMoreLink();
      
      // Get the newly loaded articles
      const additionalArticles = await hackerNewsPage.getArticles();
      
      // Check if additional articles were loaded
      expect(additionalArticles.length, 'Additional articles should be loaded').toBeGreaterThan(0);
    });
  }

  // Check responsive design
  async function checkResponsiveDesign() {
    await test.step('Check responsive design', async () => {
      // Simulate desktop viewport
      await page.setViewportSize({ width: 1024, height: 768 });
      
      // Simulate mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });

      // Set mobile viewport on the HackerNewsPage object
      await hackerNewsPage.setMobileViewport();
      
      // Check if mobile menu is visible
      const isMobileMenuVisible = await hackerNewsPage.isMobileMenuVisible();
      
      // Expect mobile menu to be visible in mobile viewport
      expect(isMobileMenuVisible, 'Mobile menu should be visible in mobile viewport').toBeTruthy();
      
      // Reset viewport to default
      await hackerNewsPage.resetViewport();
    });
  }

  // Perform performance analysis
  async function performPerformanceAnalysis() {
    await test.step('Perform performance analysis', async () => {
      // Capture performance metrics
      const performanceMetrics: PerformanceMetrics = await performanceAnalyzer.captureMetrics();
      
      // Check if First Contentful Paint is under the threshold
      expect(performanceMetrics.firstContentfulPaint, 'First Contentful Paint should be under threshold')
        .toBeLessThan(config.performanceThresholds.firstContentfulPaint);
      
      // Check if Time to Interactive is under the threshold
      expect(performanceMetrics.timeToInteractive, 'Time to Interactive should be under threshold')
        .toBeLessThan(config.performanceThresholds.timeToInteractive);

      // Log performance metrics
      console.log('Performance Metrics:', JSON.stringify(performanceMetrics, null, 2));
    });
  }

  // Check accessibility
  async function checkAccessibility() {
    await test.step('Check accessibility', async () => {
      // Analyze accessibility using AxePuppeteer
      const results = await new AxePuppeteer(page).analyze();
      
      // Log accessibility violations
      console.log(results.violations);

      // Analyze accessibility using our custom AccessibilityChecker
      const accessibilityViolations = await accessibilityChecker.analyze();
      
      // Check if there are no accessibility violations
      expect(accessibilityViolations.length, 'There should be no accessibility violations').toBe(0);

      // Log accessibility violations if any
      if (accessibilityViolations.length > 0) {
        console.error('Accessibility Violations:', JSON.stringify(accessibilityViolations, null, 2));
      }
    });
  }

  // Perform security scan
  async function performSecurityScan() {
    await test.step('Perform security scan', async () => {
      // Scan for security issues
      const securityIssues = await securityScanner.scan();
      
      // Check if there are no security issues
      expect(securityIssues.length, 'There should be no security issues').toBe(0);

      // Log security issues if any
      if (securityIssues.length > 0) {
        console.error('Security Issues:', JSON.stringify(securityIssues, null, 2));
      }
    });
  }

  // Check for broken links
  async function checkForBrokenLinks() {
    await test.step('Check for broken links', async () => {
      // Check for broken links on the page
      const brokenLinks = await hackerNewsPage.checkBrokenLinks();
      
      // Check if the number of broken links is within the allowed limit
      expect(brokenLinks.length, 'There should be no more than the maximum allowed broken links')
        .toBeLessThanOrEqual(config.maxBrokenLinks);

      // Log broken links if any
      if (brokenLinks.length > 0) {
        console.error('Broken Links:', JSON.stringify(brokenLinks, null, 2));
      }
    });
  }

  // Validate comment functionality
  async function validateCommentFunctionality() {
    await test.step('Validate comment functionality', async () => {
      // Get comment count for the first article
      const commentCount = await hackerNewsPage.getCommentCount(1);
      
      // Navigate to the comments section of the first article
      await hackerNewsPage.navigateToComments(1);
      
      // Get the number of visible comments
      const actualComments = await hackerNewsPage.getVisibleComments();
      
      // Check if the number of visible comments matches the comment count
      expect(actualComments.length, 'Visible comments should match the comment count').toBe(commentCount);
    });
  }

  // Simulate network error
  async function simulateNetworkError() {
    // Abort all network requests to simulate a network error
    await page.route('**/*', route => route.abort('failed'));

    // Expect navigation to throw an error
    await expect(async () => {
      await hackerNewsPage.navigate();
    }).rejects.toThrow('net::ERR_FAILED');

    // Get the error log
    const errorLog = await hackerNewsPage.getErrorLog();
    
    // Check if the error log contains the expected error message
    expect(errorLog).toContain('Navigation failed');
  }
});