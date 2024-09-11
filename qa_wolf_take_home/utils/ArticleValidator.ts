import { ElementHandle } from 'playwright';

export interface FullValidationResult {
  sorting: SortingResult;
  content: ContentValidationResult[];
  timestampAccuracy: TimestampAccuracyResult;
  uniqueness: UniquenessResult;
  isFullyValid: boolean;
}

interface SortingResult {
  isValid: boolean;
  errorIndex?: number;
  message: string;
}

interface ContentValidationResult {
  isValid: boolean;
  details: ArticleDetails;
}

interface TimestampAccuracyResult {
  isAccurate: boolean;
  inaccurateArticles: InaccurateArticle[];
}

interface UniquenessResult {
  isUnique: boolean;
  duplicates: DuplicateArticle[];
}

interface ArticleDetails {
  title: string;
  url: string;
  author: string;
  score: number;
}

interface InaccurateArticle {
  index: number;
  timestamp: number;
}

interface DuplicateArticle {
  index: number;
  title: string;
}

export class ArticleValidator {
  private readonly timeThreshold: number;

  constructor(timeThresholdMinutes: number = 5) {
    this.timeThreshold = timeThresholdMinutes * 60 * 1000;
  }

  async validateSorting(articles: ElementHandle[]): Promise<SortingResult> {
    if (!Array.isArray(articles) || articles.length === 0) {
      throw new Error('Invalid input: articles must be a non-empty array');
    }

    if (articles.length !== 100) {
      return { isValid: false, message: `Expected 100 articles, but found ${articles.length}` };
    }

    let prevTimestamp = Infinity;
    for (let i = 0; i < articles.length; i++) {
      const timestamp = await this.getArticleTimestamp(articles[i]);
      if (timestamp !== null && timestamp > prevTimestamp) {
        return { 
          isValid: false, 
          errorIndex: i,
          message: `Sorting error at index ${i}: ${new Date(timestamp).toISOString()} is newer than ${new Date(prevTimestamp).toISOString()}`
        };
      }
      if (timestamp !== null) {
        prevTimestamp = timestamp;
      }
    }
    return { isValid: true, message: 'All articles are correctly sorted' };
  }

  private async getArticleTimestamp(article: ElementHandle): Promise<number | null> {
    try {
      const ageElement = await article.$('.age');
      if (!ageElement) {
        throw new Error('Age element not found');
      }
      const ageText = await ageElement.getAttribute('title');
      return ageText ? new Date(ageText).getTime() : null;
    } catch (error) {
      console.error(`Error getting timestamp for article: ${(error as Error).message}`);
      return null;
    }
  }

  async validateArticleContent(article: ElementHandle): Promise<ContentValidationResult> {
    const details = await this.extractArticleDetails(article);
    return {
      isValid: this.isValidArticleContent(details),
      details
    };
  }

  private async extractArticleDetails(article: ElementHandle): Promise<ArticleDetails> {
    const title = await article.$eval('.titlelink', (el: HTMLElement) => el.textContent || '');
    const url = await article.$eval('.titlelink', (el: HTMLAnchorElement) => el.href);
    const author = await article.$eval('.hnuser', (el: HTMLElement) => el.textContent || '');
    const score = await article.$eval('.score', (el: HTMLElement) => parseInt(el.textContent || '0', 10));

    return { title, url, author, score };
  }

  private isValidArticleContent(details: ArticleDetails): boolean {
    return Boolean(details.title && details.url && details.author && !isNaN(details.score));
  }

  async validateTimestampAccuracy(articles: ElementHandle[]): Promise<TimestampAccuracyResult> {
    const now = Date.now();
    const inaccurateArticles: InaccurateArticle[] = [];

    for (let i = 0; i < articles.length; i++) {
      const timestamp = await this.getArticleTimestamp(articles[i]);
      if (timestamp !== null && now - timestamp > this.timeThreshold) {
        inaccurateArticles.push({ index: i, timestamp });
      }
    }

    return {
      isAccurate: inaccurateArticles.length === 0,
      inaccurateArticles
    };
  }

  async validateUniqueness(articles: ElementHandle[]): Promise<UniquenessResult> {
    const titles = new Set<string>();
    const duplicates: DuplicateArticle[] = [];

    for (let i = 0; i < articles.length; i++) {
      const title = await articles[i].$eval('.titlelink', (el: HTMLElement) => el.textContent || '');
      if (titles.has(title)) {
        duplicates.push({ index: i, title });
      } else {
        titles.add(title);
      }
    }

    return {
      isUnique: duplicates.length === 0,
      duplicates
    };
  }

  async performFullValidation(articles: ElementHandle[]): Promise<FullValidationResult> {
    const [sorting, content, timestampAccuracy, uniqueness] = await Promise.all([
      this.validateSorting(articles),
      Promise.all(articles.map(this.validateArticleContent.bind(this))),
      this.validateTimestampAccuracy(articles),
      this.validateUniqueness(articles)
    ]);

    return {
      sorting,
      content,
      timestampAccuracy,
      uniqueness,
      isFullyValid: sorting.isValid && 
                    content.every(r => r.isValid) && 
                    timestampAccuracy.isAccurate &&
                    uniqueness.isUnique
    };
  }
}