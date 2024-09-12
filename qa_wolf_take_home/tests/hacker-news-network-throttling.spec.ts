// Import necessary testing modules and page object
import { test, expect } from '@playwright/test';
import { HackerNewsPage } from '../pages/HackerNewsPage';

// Define the test case for network throttling
test('Simulate slow network conditions on Hacker News', async ({ page }) => {
  // Create an instance of the HackerNewsPage
  const hackerNewsPage = new HackerNewsPage(page);

  // Navigate to the Hacker News page
  await hackerNewsPage.navigate();

  // Simulate slow network conditions
  await page.route('**/*', (route) =>
    route.continue({ url: route.request().url(), headers: { 'throttle': '3000' } })
  );

  // Additional checks can be added here if needed
});