// Import necessary types from Playwright
import { ElementHandle, Page } from 'playwright';

// Define interfaces for validation results
export interface FullValidationResult {
  sorting: SortingResult;                  // Result of sorting validation
  content: ContentValidationResult[];      // Results of content validation for each article
  timestampAccuracy: TimestampAccuracyResult; // Result of timestamp accuracy validation
  uniqueness: UniquenessResult;            // Result of uniqueness validation
  isFullyValid: boolean;                   // Whether all validations passed
}

interface SortingResult {
  isValid: boolean;      // Whether sorting is valid
  errorIndex?: number;   // Index where sorting error occurred (if any)
  message: string;       // Descriptive message about sorting result
}

interface ContentValidationResult {
  isValid: boolean;      // Whether article content is valid
  details: ArticleDetails; // Details of the article
}

interface TimestampAccuracyResult {
  isAccurate: boolean;              // Whether all timestamps are accurate
  inaccurateArticles: InaccurateArticle[]; // List of inaccurate articles
}

interface UniquenessResult {
  isUnique: boolean;               // Whether all articles are unique
  duplicates: DuplicateArticle[];  // List of duplicate articles
}

interface ArticleDetails {
  title: string;   // Article title
  url: string;     // Article URL
  author: string;  // Article author
  score: number;   // Article score
}

interface InaccurateArticle {
  index: number;    // Index of the inaccurate article
  timestamp: number; // Timestamp of the inaccurate article
}

interface DuplicateArticle {
  index: number;  // Index of the duplicate article
  title: string;  // Title of the duplicate article
}

// Class representing the Article Validator
export class ArticleValidator {
  private readonly page: Page;
  private readonly timeThreshold: number;

  // Constructor to initialize the page object and time threshold
  constructor(page: Page, timeThresholdMinutes: number = 5) {
    this.page = page;
    this.timeThreshold = timeThresholdMinutes * 60 * 1000; // Convert minutes to milliseconds
  }

  // Validate the sorting of articles
  async validateSorting(articles: ElementHandle[]): Promise<SortingResult> {
    // Check if articles is a valid, non-empty array
    if (!Array.isArray(articles) || articles.length === 0) {
      throw new Error('Invalid input: articles must be a non-empty array');
    }

    // Check if there are exactly 100 articles
    if (articles.length !== 100) {
      return { isValid: false, message: `Expected 100 articles, but found ${articles.length}` };
    }

    let prevTimestamp = Infinity;
    // Iterate through articles to check if they're sorted by timestamp
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

  // Extract timestamp from an article
  private async getArticleTimestamp(article: ElementHandle): Promise<number | null> {
    try {
      // Find the age element within the article
      const ageElement = await article.$('.age');
      if (!ageElement) {
        throw new Error('Age element not found');
      }
      // Get the title attribute of the age element, which contains the timestamp
      const ageText = await this.page.evaluate(el => el?.getAttribute('title'), ageElement);
      return ageText ? new Date(ageText).getTime() : null;
    } catch (error) {
      console.error(`Error getting timestamp for article: ${(error as Error).message}`);
      return null;
    }
  }

  // Validate content of a single article
  async validateArticleContent(article: ElementHandle): Promise<ContentValidationResult> {
    const details = await this.extractArticleDetails(article);
    return {
      isValid: this.isValidArticleContent(details),
      details
    };
  }

  // Extract details from an article
  private async extractArticleDetails(article: ElementHandle): Promise<ArticleDetails> {
    // Extract title, URL, author, and score from the article
    const title = await this.page.evaluate(el => el?.textContent || '', await article.$('.titlelink'));
    const url = await this.page.evaluate(el => (el as HTMLAnchorElement)?.href || '', await article.$('.titlelink'));
    const author = await this.page.evaluate(el => el?.textContent || '', await article.$('.hnuser'));
    const score = await this.page.evaluate(el => parseInt(el?.textContent || '0', 10), await article.$('.score'));

    return { title, url, author, score };
  }

  // Check if article content is valid
  private isValidArticleContent(details: ArticleDetails): boolean {
    return Boolean(details.title && details.url && details.author && !isNaN(details.score));
  }

  // Validate timestamp accuracy of articles
  async validateTimestampAccuracy(articles: ElementHandle[]): Promise<TimestampAccuracyResult> {
    const now = Date.now();
    const inaccurateArticles: InaccurateArticle[] = [];

    // Check each article's timestamp against the current time
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

  // Validate uniqueness of articles
  async validateUniqueness(articles: ElementHandle[]): Promise<UniquenessResult> {
    const titles = new Set<string>();
    const duplicates: DuplicateArticle[] = [];

    // Check for duplicate titles
    for (let i = 0; i < articles.length; i++) {
      const title = await this.page.evaluate(el => el?.textContent || '', await articles[i].$('.titlelink'));
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

  // Perform full validation on articles
  async performFullValidation(articles: ElementHandle[]): Promise<FullValidationResult> {
    // Run all validations concurrently
    const [sorting, content, timestampAccuracy, uniqueness] = await Promise.all([
      this.validateSorting(articles),
      Promise.all(articles.map(this.validateArticleContent.bind(this))),
      this.validateTimestampAccuracy(articles),
      this.validateUniqueness(articles)
    ]);

    // Combine all validation results
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