export interface FullValidationResult {
  sorting: { isValid: boolean; errorIndex?: number; message: string };
  content: { isValid: boolean; details: any }[];
  timestampAccuracy: { isAccurate: boolean; inaccurateArticles: { index: number; timestamp: number }[] };
  uniqueness: { isUnique: boolean; duplicates: { index: number; title: string }[] };
  isFullyValid: boolean;
}

export class ArticleValidator {
  private timeThreshold: number;

  constructor() {
    this.timeThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
  }

  async validateSorting(articles: any[]): Promise<{ isValid: boolean; errorIndex?: number; message: string }> {
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
  
    async getArticleTimestamp(article) {
      try {
        const ageElement = await article.$('.age');
        if (!ageElement) {
          throw new Error('Age element not found');
        }
        const ageText = await ageElement.getAttribute('title');
        return new Date(ageText).getTime();
      } catch (error) {
        console.error(`Error getting timestamp for article: ${error.message}`);
        return null;
      }
    }
  
    async validateArticleContent(article) {
      const title = await article.$eval('.titlelink', el => el.textContent);
      const url = await article.$eval('.titlelink', el => el.href);
      const author = await article.$eval('.hnuser', el => el.textContent);
      const score = await article.$eval('.score', el => parseInt(el.textContent));
  
      return {
        isValid: title && url && author && !isNaN(score),
        details: { title, url, author, score }
      };
    }
  
    async validateTimestampAccuracy(articles: any[]): Promise<{ isAccurate: boolean; inaccurateArticles: { index: number; timestamp: number }[] }> {
      const now = Date.now();
      const inaccurateArticles: { index: number; timestamp: number }[] = [];
  
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
  
    async validateUniqueness(articles: any[]): Promise<{ isUnique: boolean; duplicates: { index: number; title: string }[] }> {
      const titles = new Set<string>();
      const duplicates: { index: number; title: string }[] = [];
  
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
  
    async performFullValidation(articles: any[]): Promise<FullValidationResult> {
      const sortingResult = await this.validateSorting(articles);
      const contentResults = await Promise.all(articles.map(this.validateArticleContent));
      const timestampAccuracy = await this.validateTimestampAccuracy(articles);
      const uniquenessResult = await this.validateUniqueness(articles);
  
      return {
        sorting: sortingResult,
        content: contentResults,
        timestampAccuracy,
        uniqueness: uniquenessResult,
        isFullyValid: sortingResult.isValid && 
                      contentResults.every(r => r.isValid) && 
                      timestampAccuracy.isAccurate &&
                      uniquenessResult.isUnique
      };
    }
  }
  
  module.exports = { ArticleValidator };