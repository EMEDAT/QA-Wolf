import { Page, ElementHandle } from '@playwright/test';
import config from '../app.config';

interface ArticleData {
  title: string;
  timestamp: number;
}

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

  constructor(page: Page) {
    this.page = page;
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

  async performSearch(query: string): Promise<void> {
    await this.page.fill(this.selectors.searchInput, query);
    await this.page.press(this.selectors.searchInput, 'Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async getSearchResults(): Promise<ElementHandle<Element>[]> {
    return this.page.$$(this.selectors.article);
  }

  async clickMoreLink(): Promise<void> {
    await this.page.click(this.selectors.moreLink);
    await this.page.waitForLoadState('networkidle');
  }

  async setMobileViewport(): Promise<void> {
    await this.page.setViewportSize(config.viewports.mobile);
  }

  async resetViewport(): Promise<void> {
    await this.page.setViewportSize(config.viewports.desktop);
  }

  async isMobileMenuVisible(): Promise<boolean> {
    return this.page.isVisible(this.selectors.mobileMenu);
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
    return this.page.$$(this.selectors.comment);
  }

  async getErrorLog(): Promise<string> {
    return await this.page.evaluate(() => {
      return (console.error as any).outputs ? (console.error as any).outputs.join('\n') : '';
    });
  }

  async getArticles(): Promise<ElementHandle<Element>[]> {
    return this.page.$$(this.selectors.article);
  }

  validateSorting(articles: ArticleData[]): boolean {
    return articles.every((article, index) => 
      index === 0 || article.timestamp <= articles[index - 1].timestamp
    );
  }
}