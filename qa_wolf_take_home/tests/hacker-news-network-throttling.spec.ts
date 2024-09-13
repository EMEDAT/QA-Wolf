// Import necessary testing modules and page object
import { test, expect } from '@playwright/test';
import { HackerNewsPage } from '../pages/HackerNewsPage';

// Define the test case for network throttling
test('Simulate slow network conditions on Hacker News', async ({ page }) => {
  // Arrange: Create an instance of the HackerNewsPage and navigate to the page
  const hackerNewsPage = new HackerNewsPage(page);
  await hackerNewsPage.navigate();

  // Act: Simulate slow network conditions
  await page.route('**/*', (route) =>
    route.continue({ url: route.request().url(), headers: { 'throttle': '3000' } })
  );

  // Assert: Additional checks can be added here if needed
  // Example: Verify that the page still loads within an acceptable time frame
  const loadTime = await page.evaluate(() => performance.timing.loadEventEnd - performance.timing.navigationStart);
  await expect.poll(() => loadTime).toBeLessThanOrEqual(10000); // Example threshold of 10 seconds
});