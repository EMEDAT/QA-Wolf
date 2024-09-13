// Import necessary testing modules and page object
import { test, expect } from '@playwright/test';
import { HackerNewsPage } from '../pages/HackerNewsPage';

// Define the test case for additional checks
test('Perform additional checks on Hacker News', async ({ page }) => {
  // Arrange: Create an instance of the HackerNewsPage and navigate to the page
  const hackerNewsPage = new HackerNewsPage(page);
  await hackerNewsPage.navigate();

  // Act: Retrieve the first 100 articles from the page
  const articles = await hackerNewsPage.getFirstHundredArticles();

  // Assert: Verify that we have exactly 100 articles
  expect(articles.length).toBe(100);

  // Additional check: Verify that each article's timestamp is less than or equal to the previous one
  let prevTimestamp = Infinity;
  for (const article of articles) {
    await expect.poll(() => article.timestamp).toBeLessThanOrEqual(prevTimestamp);
    prevTimestamp = article.timestamp;
  }
});