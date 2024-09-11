import { test, expect } from '@playwright/test';
import { HackerNewsPage } from '../pages/HackerNewsPage';

test('Validate first 100 articles on Hacker News/newest are sorted from newest to oldest', async ({ page }) => {
  const hackerNewsPage = new HackerNewsPage(page);

  await hackerNewsPage.navigate();

  const articles = await hackerNewsPage.getFirstHundredArticles();

  expect(articles.length).toBe(100);

  const isSorted = hackerNewsPage.validateSorting(articles);
  expect(isSorted).toBe(true);

  let prevTimestamp = Infinity;
  for (const article of articles) {
    expect(article.timestamp).toBeLessThanOrEqual(prevTimestamp);
    prevTimestamp = article.timestamp;
  }
});