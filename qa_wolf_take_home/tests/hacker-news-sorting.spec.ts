import { test, expect } from '@playwright/test';
import { HackerNewsPage } from '../pages/HackerNewsPage';

test('Validate first 100 articles on Hacker News/newest are sorted from newest to oldest', async ({ page }) => {
  const hackerNewsPage = new HackerNewsPage(page);

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