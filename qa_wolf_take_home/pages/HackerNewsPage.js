//HackerNewsPage.js

class HackerNewsPage {
  constructor(page, config) {
    this.page = page;
    this.url = config.baseUrl;
    this.articleSelector = '.athing';
    this.ageSelector = '.age';
    this.searchInputSelector = 'input[name="q"]';
    this.moreLinkSelector = 'a.morelink';
    this.mobileMenuSelector = '.pagetop > a[href="news"]';
  }
  
    async navigate() {
      await this.page.goto(this.url);
    }
  
    async getArticles(count) {
      const articles = await this.page.$$(this.articleSelector);
      return articles.slice(0, count);
    }
  
    async performSearch(query) {
      await this.page.fill(this.searchInputSelector, query);
      await this.page.press(this.searchInputSelector, 'Enter');
      await this.page.waitForLoadState('networkidle');
    }
  
    async getSearchResults() {
      return this.page.$$(this.articleSelector);
    }
  
    async clickMoreLink() {
      await this.page.click(this.moreLinkSelector);
      await this.page.waitForLoadState('networkidle');
    }
  
    async setMobileViewport() {
      await this.page.setViewportSize(config.viewports.mobile);
    }

    async resetViewport() {
      await this.page.setViewportSize(config.viewports.desktop);
    }
  
    async isMobileMenuVisible() {
      return this.page.isVisible(this.mobileMenuSelector);
    }

    async checkBrokenLinks() {
      const links = await this.page.$$('a');
      const brokenLinks = [];
  
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
  
    async getCommentCount(articleIndex) {
      const commentLink = await this.page.$$('.subtext > a:last-child').nth(articleIndex - 1);
      const commentText = await commentLink.innerText();
      return parseInt(commentText.split(' ')[0]) || 0;
    }
  
    async navigateToComments(articleIndex) {
      const commentLink = await this.page.$$('.subtext > a:last-child').nth(articleIndex - 1);
      await commentLink.click();
      await this.page.waitForLoadState('networkidle');
    }
  
    async getVisibleComments() {
      return this.page.$$('.comment');
    }

    async getErrorLog() {
      // This is a placeholder. In a real-world scenario, you'd implement proper error logging.
      return await this.page.evaluate(() => {
        return window.console.error.toString();
      });
    }
  }