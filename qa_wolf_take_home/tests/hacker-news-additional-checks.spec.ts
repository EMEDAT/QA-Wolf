// Import necessary testing modules and page object
import { test, expect } from '@playwright/test';
import { HackerNewsPage } from '../pages/HackerNewsPage';

// Define the test case for additional checks
test('Perform additional checks on Hacker News', async ({ page }) => {
  // Create an instance of the HackerNewsPage
  const hackerNewsPage = new HackerNewsPage(page);

  // Navigate to the Hacker News page
  await hackerNewsPage.navigate();

  // Retrieve the first 100 articles from the page
  const articles = await hackerNewsPage.getFirstHundredArticles();

  // Assert that we have exactly 100 articles
  expect(articles.length).toBe(100);

  // Additional check: Verify that each article's timestamp is less than or equal to the previous one
  let prevTimestamp = Infinity;
  for (const article of articles) {
    expect(article.timestamp).toBeLessThanOrEqual(prevTimestamp);
    prevTimestamp = article.timestamp;
  }

});