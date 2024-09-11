import { Page, ElementHandle } from '@playwright/test';
import config from '../app.config';

interface ViewportSize {
  width: number;
  height: number;
}

interface ArticleData {
  title: string;
  timestamp: number;
}

export class HackerNewsPage {
  private page: Page;
  private url: string;
  private articleSelector: string;
  private ageSelector: string;
  private searchInputSelector: string;
  private mobileMenuSelector: string;
  private config: typeof config;
  private moreSelector: string;

  constructor(page: Page) {
    this.page = page;
    this.config = config;
    this.url = 'https://news.ycombinator.com/newest';
    this.articleSelector = '.athing';
    this.ageSelector = '.age';
    this.searchInputSelector = 'input[name="q"]';
    this.moreSelector = 'a.morelink';
    this.mobileMenuSelector = '.pagetop > a[href="news"]';
  }


  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

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
      await this.page.waitForSelector(this.articleSelector);

      const pageArticles = await this.page.$$eval('.athing', (articles, ageSelector) => {
        return articles.map(article => {
          const titleElement = article.querySelector('.titleline > a');
          const ageElement = article.nextElementSibling?.querySelector(ageSelector) as HTMLElement;
          return {
            title: titleElement?.textContent || '',
            timestamp: ageElement ? new Date(ageElement.title).getTime() : 0
          };
        });
      }, '.age');

      allArticles = allArticles.concat(pageArticles);
    }

    return allArticles.slice(0, 100);
  }

  async getArticles(): Promise<ElementHandle<Element>[]> {
    const articles = await this.page.$$(this.articleSelector);
    return articles;
  }

  async performSearch(query: string): Promise<void> {
    await this.page.fill(this.searchInputSelector, query);
    await this.page.press(this.searchInputSelector, 'Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async getSearchResults(): Promise<ElementHandle<Element>[]> {
    return this.page.$$(this.articleSelector);
  }

  async clickMoreLink(): Promise<void> {
    await this.page.click(this.moreSelector);
    await this.page.waitForLoadState('networkidle');
  }

  async setMobileViewport(): Promise<void> {
    await this.page.setViewportSize(this.config.viewports.mobile);
  }

  async resetViewport(): Promise<void> {
    await this.page.setViewportSize(this.config.viewports.desktop);
  }

  async isMobileMenuVisible(): Promise<boolean> {
    return this.page.isVisible(this.mobileMenuSelector);
  }

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

  async getCommentCount(articleIndex: number): Promise<number> {
    const commentElements = await this.page.$$('.subtext');
    if (commentElements.length > articleIndex) {
      const commentText = await commentElements[articleIndex].textContent();
      const match = commentText?.match(/(\d+)\s+comments?/);
      return match ? parseInt(match[1]) : 0;
    }
    return 0;
  }

  async navigateToComments(articleIndex: number): Promise<void> {
    const commentLinks = await this.page.$$('.subtext a:last-child');
    if (commentLinks.length > articleIndex) {
      await commentLinks[articleIndex].click();
    }
  }

  async getVisibleComments(): Promise<ElementHandle<Element>[]> {
    return this.page.$$('.comment');
  }

  async getErrorLog(): Promise<string> {
    // This is a placeholder to implement proper error logging.
    return await this.page.evaluate(() => {
      return window.console.error.toString();
    });
  }

  validateSorting(articles: ArticleData[]): boolean {
    let prevTimestamp = Infinity;
    
    for (const article of articles) {
      if (article.timestamp > prevTimestamp) {
        return false;
      }
      prevTimestamp = article.timestamp;
    }

    return true;
  }

  async getArticleTimestamp(article: ElementHandle<Element>): Promise<number> {
    const ageElement = await article.$('.subtext .age');
    if (!ageElement) {
      throw new Error('Age element not found');
    }
    const ageText = await ageElement.getAttribute('title');
    return ageText ? new Date(ageText).getTime() : 0;
  }
}
