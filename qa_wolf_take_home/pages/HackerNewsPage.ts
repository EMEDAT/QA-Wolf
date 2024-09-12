import { Page, ElementHandle } from '@playwright/test';
import config from '../app.config';

// Interface to define the structure of article data
interface ArticleData {
  title: string;
  timestamp: number;
}

// Class representing the Hacker News page
export class HackerNewsPage {
  private readonly page: Page;
  private readonly url: string = 'https://news.ycombinator.com/newest';
  private readonly selectors = {
    article: '.athing', // Selector for articles
    age: '.age', // Selector for article age
    searchInput: 'input[name="q"]', // Selector for search input
    moreLink: 'a.morelink', // Selector for "More" link
    mobileMenu: '.pagetop > a[href="news"]', // Selector for mobile menu
    comment: '.comment' // Selector for comments
  };

  // Constructor to initialize the page object
  constructor(page: Page) {
    this.page = page;
  }

  // Method to navigate to the Hacker News page
  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  // Method to get the first hundred articles
  async getFirstHundredArticles(): Promise<ArticleData[]> {
    const urls = [
      this.url,
      `${this.url}?next=41512152&n=31`,
      `${this.url}?next=41511870&n=61`,
      `${this.url}?next=41511473&n=91`
    ];

    let allArticles: ArticleData[] = [];

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

    return allArticles.slice(0, 100);
  }

  // Method to perform a search
  async performSearch(query: string): Promise<void> {
    await this.page.fill(this.selectors.searchInput, query);
    await this.page.press(this.selectors.searchInput, 'Enter');
    await this.page.waitForLoadState('networkidle');
  }

  // Method to get search results
  async getSearchResults(): Promise<ElementHandle<Element>[]> {
    return this.page.$$(this.selectors.article);
  }

  // Method to click the "More" link
  async clickMoreLink(): Promise<void> {
    await this.page.click(this.selectors.moreLink);
    await this.page.waitForLoadState('networkidle');
  }

  // Method to set the mobile viewport
  async setMobileViewport(): Promise<void> {
    await this.page.setViewportSize(config.viewports.mobile);
  }

  // Method to reset the viewport to desktop size
  async resetViewport(): Promise<void> {
    await this.page.setViewportSize(config.viewports.desktop);
  }

  // Method to check if the mobile menu is visible
  async isMobileMenuVisible(): Promise<boolean> {
    return this.page.isVisible(this.selectors.mobileMenu);
  }

  // Method to check for broken links
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

  // Method to get the comment count for an article
  async getCommentCount(articleIndex: number): Promise<number> {
    const commentElements = await this.page.$$('.subtext');
    if (commentElements.length > articleIndex) {
      const commentText = await commentElements[articleIndex].textContent();
      const match = commentText?.match(/(\d+)\s+comments?/);
      return match ? parseInt(match[1]) : 0;
    }
    return 0;
  }

  // Method to navigate to the comments section of an article
  async navigateToComments(articleIndex: number): Promise<void> {
    const commentLinks = await this.page.$$('.subtext a:last-child');
    if (commentLinks.length > articleIndex) {
      await commentLinks[articleIndex].click();
    }
  }

  // Method to get visible comments
  async getVisibleComments(): Promise<ElementHandle<Element>[]> {
    return this.page.$$(this.selectors.comment);
  }

  // Method to get the error log
  async getErrorLog(): Promise<string> {
    return await this.page.evaluate(() => {
      return (console.error as any).outputs ? (console.error as any).outputs.join('\n') : '';
    });
  }

  // Method to get all articles
  async getArticles(): Promise<ElementHandle<Element>[]> {
    return this.page.$$(this.selectors.article);
  }

  // Method to validate the sorting of articles
  validateSorting(articles: ArticleData[]): boolean {
    return articles.every((article, index) => 
      index === 0 || article.timestamp <= articles[index - 1].timestamp
    );
  }
}