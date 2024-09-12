import { Page, ElementHandle } from '@playwright/test';
import config from '../app.config';

/**
 * Interface representing the structure of article data.
 */
interface ArticleData {
  title: string;
  timestamp: number;
}

/**
 * Class representing a Hacker News page.
 * This class provides methods to interact with and scrape data from Hacker News.
 */
export class HackerNewsPage {
  private readonly page: Page;
  private readonly url: string = 'https://news.ycombinator.com/newest';
  private readonly selectors = {
    article: '.athing',
    age: '.age',
    searchInput: 'input[name="q"]',
    moreLink: 'a.morelink',
    mobileMenu: '.pagetop > a[href="news"]',
    comment: '.comment'
  };

  /**
   * Creates an instance of HackerNewsPage.
   * @param {Page} page - The Playwright Page object to interact with.
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to the Hacker News 'newest' page.
   */
  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  /**
   * Retrieves the first hundred articles from Hacker News.
   * @returns {Promise<ArticleData[]>} An array of ArticleData objects.
   */
  async getFirstHundredArticles(): Promise<ArticleData[]> {
    const urls = [
      this.url,
      `${this.url}?next=41512152&n=31`,
      `${this.url}?next=41511870&n=61`,
      `${this.url}?next=41511473&n=91`
    ];

    let allArticles: ArticleData[] = [];

    // Iterate through each URL to collect articles
    for (const url of urls) {
      await this.page.goto(url);
      await this.page.waitForSelector(this.selectors.article);

      const pageArticles = await this.page.$$eval(this.selectors.article, (articles, ageSelector) => {
        return articles.map(article => {
          const titleElement = article.querySelector('.titleline > a');
          const ageElement = article.nextElementSibling?.querySelector(ageSelector) as HTMLElement;
          return {
            title: titleElement?.textContent || '',
            timestamp: ageElement ? new Date(ageElement.title).getTime() : 0
          };
        });
      }, this.selectors.age);

      allArticles = allArticles.concat(pageArticles);
    }

    // Return only the first 100 articles
    return allArticles.slice(0, 100);
  }

  /**
   * Performs a search on Hacker News.
   * @param {string} query - The search query.
   */
  async performSearch(query: string): Promise<void> {
    await this.page.fill(this.selectors.searchInput, query);
    await this.page.press(this.selectors.searchInput, 'Enter');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Retrieves search results from the current page.
   * @returns {Promise<ElementHandle<Element>[]>} An array of ElementHandles representing search results.
   */
  async getSearchResults(): Promise<ElementHandle<Element>[]> {
    return this.page.$$(this.selectors.article);
  }

  /**
   * Clicks the 'More' link to load additional results.
   */
  async clickMoreLink(): Promise<void> {
    await this.page.click(this.selectors.moreLink);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Sets the viewport to mobile dimensions.
   */
  async setMobileViewport(): Promise<void> {
    await this.page.setViewportSize(config.viewports.mobile);
  }

  /**
   * Resets the viewport to desktop dimensions.
   */
  async resetViewport(): Promise<void> {
    await this.page.setViewportSize(config.viewports.desktop);
  }

  /**
   * Checks if the mobile menu is visible.
   * @returns {Promise<boolean>} True if the mobile menu is visible, false otherwise.
   */
  async isMobileMenuVisible(): Promise<boolean> {
    return this.page.isVisible(this.selectors.mobileMenu);
  }

  /**
   * Checks for broken links on the current page.
   * @returns {Promise<string[]>} An array of URLs that returned a 4xx or 5xx status code.
   */
  async checkBrokenLinks(): Promise<string[]> {
    const links = await this.page.$$('a');
    const brokenLinks: string[] = [];

    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('javascript:')) {
        const response = await this.page.request.head(href).catch(() => null);
        if (!response || response.status() >= 400) {
          brokenLinks.push(href);
        }
      }
    }

    return brokenLinks;
  }

  /**
   * Gets the comment count for a specific article.
   * @param {number} articleIndex - The index of the article.
   * @returns {Promise<number>} The number of comments for the article.
   */
  async getCommentCount(articleIndex: number): Promise<number> {
    const commentElements = await this.page.$$('.subtext');
    if (commentElements.length > articleIndex) {
      const commentText = await commentElements[articleIndex].textContent();
      const match = commentText?.match(/(\d+)\s+comments?/);
      return match ? parseInt(match[1]) : 0;
    }
    return 0;
  }

  /**
   * Navigates to the comments section of a specific article.
   * @param {number} articleIndex - The index of the article.
   */
  async navigateToComments(articleIndex: number): Promise<void> {
    const commentLinks = await this.page.$$('.subtext a:last-child');
    if (commentLinks.length > articleIndex) {
      await commentLinks[articleIndex].click();
    }
  }

  /**
   * Retrieves visible comments on the current page.
   * @returns {Promise<ElementHandle<Element>[]>} An array of ElementHandles representing comments.
   */
  async getVisibleComments(): Promise<ElementHandle<Element>[]> {
    return this.page.$$(this.selectors.comment);
  }

  /**
   * Retrieves the error log from the browser console.
   * @returns {Promise<string>} The error log as a string.
   */
  async getErrorLog(): Promise<string> {
    return await this.page.evaluate(() => {
      return (console.error as any).outputs ? (console.error as any).outputs.join('\n') : '';
    });
  }

  /**
   * Retrieves all articles on the current page.
   * @returns {Promise<ElementHandle<Element>[]>} An array of ElementHandles representing articles.
   */
  async getArticles(): Promise<ElementHandle<Element>[]> {
    return this.page.$$(this.selectors.article);
  }

  /**
   * Validates if the articles are sorted in descending order by timestamp.
   * @param {ArticleData[]} articles - An array of ArticleData objects to validate.
   * @returns {boolean} True if the articles are correctly sorted, false otherwise.
   */
  validateSorting(articles: ArticleData[]): boolean {
    return articles.every((article, index) => 
      index === 0 || article.timestamp <= articles[index - 1].timestamp
    );
  }
}