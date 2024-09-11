// index.ts

import { test, expect, Page, Browser, TestInfo } from '@playwright/test';
import { HackerNewsPage } from './pages/HackerNewsPage';
import { ArticleValidator, FullValidationResult } from './utils/ArticleValidator';
import { PerformanceAnalyzer, PerformanceMetrics } from './utils/PerformanceAnalyzer';
import { AccessibilityChecker } from './utils/AccessibilityChecker';
import { SecurityScanner } from './utils/SecurityScanner';
import { reportResults, PlaywrightTestResult } from './utils/Reporter';
import config from './app.config';

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
  let page: Page;
  let hackerNewsPage: HackerNewsPage;
  let articleValidator: ArticleValidator;
  let performanceAnalyzer: PerformanceAnalyzer;
  let accessibilityChecker: AccessibilityChecker;
  let securityScanner: SecurityScanner;

  // Setup before all tests
  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    page = await browser.newPage();
    hackerNewsPage = new HackerNewsPage(page);
    articleValidator = new ArticleValidator();
    performanceAnalyzer = new PerformanceAnalyzer(page, config);
    accessibilityChecker = new AccessibilityChecker(page, config);
    securityScanner = new SecurityScanner(page, config);
  
    test.setTimeout(30000);
  });

  // Cleanup after all tests
  test.afterAll(async () => {
    await page.close();
  });


  test('Validate first 100 articles on Hacker News/newest are sorted from newest to oldest', async () => {
    // Get the first 100 articles using the provided links
    const articles = await hackerNewsPage.getFirstHundredArticles();

    // Validate that we have exactly 100 articles
    expect(articles.length).toBe(100);

    // Validate sorting
    const isSorted = hackerNewsPage.validateSorting(articles);
    expect(isSorted).toBe(true);

    // Additional check: Verify timestamps are in descending order
    let prevTimestamp = Infinity;
    for (const article of articles) {
      expect(article.timestamp).toBeLessThanOrEqual(prevTimestamp);
      prevTimestamp = article.timestamp;
    }
  });

  // Main test case that validates article sorting and performs additional checks
  test('Validate article sorting and perform additional checks', async () => {
    await navigateToHackerNews();
    await validateArticleSorting();
    await performAdditionalInteractions();
    await checkResponsiveDesign();
    await performPerformanceAnalysis();
    await checkAccessibility();
    await performSecurityScan();
    await checkForBrokenLinks();
    await validateCommentFunctionality();
  });

  // Additional test case for error handling
  test('Handle network errors gracefully', async () => {
    await simulateNetworkError();
  });

  // Exporting the test results
  test.afterAll(async ({ }, testInfo: TestInfo) => {
    await reportResults(testInfo as any as PlaywrightTestResult);
  });

  // Helper functions
  async function navigateToHackerNews() {
    await test.step('Navigate to Hacker News newest page', async () => {
      await hackerNewsPage.navigate();
      await expect(page).toHaveTitle(/Hacker News/);
    });
  }

  async function validateArticleSorting() {
    await test.step('Validate sorting and perform full validation of first 100 articles', async () => {
      const articles = await hackerNewsPage.getArticles();
      const fullValidationResult: FullValidationResult = await articleValidator.performFullValidation(articles);
      
      expect(fullValidationResult.sorting.isValid, 'Articles should be correctly sorted').toBeTruthy();
      expect(fullValidationResult.isFullyValid, 'Articles should pass all validation checks').toBeTruthy();
      
      if (!fullValidationResult.isFullyValid) {
        console.error('Validation errors:', JSON.stringify(fullValidationResult, null, 2));
      }
    });
  }

  async function performAdditionalInteractions() {
    await test.step('Perform additional interactions', async () => {
      await hackerNewsPage.performSearch(config.searchQuery);
      const searchResults = await hackerNewsPage.getSearchResults();
      expect(searchResults.length, 'Search should return results').toBeGreaterThan(0);

      await hackerNewsPage.clickMoreLink();
      const additionalArticles = await hackerNewsPage.getArticles();
      expect(additionalArticles.length, 'Additional articles should be loaded').toBe(config.additionalArticlesCount);
    });
  }

  async function checkResponsiveDesign() {
    await test.step('Check responsive design', async () => {
      await hackerNewsPage.setMobileViewport();
      const isMobileMenuVisible = await hackerNewsPage.isMobileMenuVisible();
      expect(isMobileMenuVisible, 'Mobile menu should be visible in mobile viewport').toBeTruthy();
      await hackerNewsPage.resetViewport();
    });
  }

  async function performPerformanceAnalysis() {
    await test.step('Perform performance analysis', async () => {
      const performanceMetrics: PerformanceMetrics = await performanceAnalyzer.captureMetrics();
      expect(performanceMetrics.firstContentfulPaint, 'First Contentful Paint should be under threshold')
        .toBeLessThan(config.performanceThresholds.firstContentfulPaint);
      expect(performanceMetrics.timeToInteractive, 'Time to Interactive should be under threshold')
        .toBeLessThan(config.performanceThresholds.timeToInteractive);
      
      console.log('Performance Metrics:', JSON.stringify(performanceMetrics, null, 2));
    });
  }

  async function checkAccessibility() {
    await test.step('Check accessibility', async () => {
      const accessibilityViolations = await accessibilityChecker.analyze();
      expect(accessibilityViolations.length, 'There should be no accessibility violations').toBe(0);
      
      if (accessibilityViolations.length > 0) {
        console.error('Accessibility Violations:', JSON.stringify(accessibilityViolations, null, 2));
      }
    });
  }

  async function performSecurityScan() {
    await test.step('Perform security scan', async () => {
      const securityIssues = await securityScanner.scan();
      expect(securityIssues.length, 'There should be no security issues').toBe(0);
      
      if (securityIssues.length > 0) {
        console.error('Security Issues:', JSON.stringify(securityIssues, null, 2));
      }
    });
  }

  async function checkForBrokenLinks() {
    await test.step('Check for broken links', async () => {
      const brokenLinks = await hackerNewsPage.checkBrokenLinks();
      expect(brokenLinks.length, 'There should be no more than the maximum allowed broken links')
        .toBeLessThanOrEqual(config.maxBrokenLinks);
      
      if (brokenLinks.length > 0) {
        console.error('Broken Links:', JSON.stringify(brokenLinks, null, 2));
      }
    });
  }

  async function validateCommentFunctionality() {
    await test.step('Validate comment functionality', async () => {
      const commentCount = await hackerNewsPage.getCommentCount(1); // Get comment count for the first article
      await hackerNewsPage.navigateToComments(1);
      const actualComments = await hackerNewsPage.getVisibleComments();
      expect(actualComments.length, 'Visible comments should match the comment count').toBe(commentCount);
    });
  }

  async function simulateNetworkError() {
    await page.route('**/*', route => route.abort('failed'));
    
    await expect(async () => {
      await hackerNewsPage.navigate();
    }).rejects.toThrow('net::ERR_FAILED');

    const errorLog = await hackerNewsPage.getErrorLog();
    expect(errorLog).toContain('Navigation failed');
  }
});