// SecurityScanner.js

class SecurityScanner {
    constructor(page) {
      this.page = page;
    }
  
    async scan() {
      try {
        const securityIssues = [];
  
        // Check for secure connection
        const isSecure = await this.checkSecureConnection();
        if (!isSecure) {
          securityIssues.push({ type: 'insecure_connection', message: 'The page is not served over HTTPS' });
        }
  
        // Check for presence of Content Security Policy
        const hasCSP = await this.checkContentSecurityPolicy();
        if (!hasCSP) {
          securityIssues.push({ type: 'missing_csp', message: 'Content Security Policy is not implemented' });
        }
  
        // Check for vulnerable JavaScript libraries
        const vulnerableLibraries = await this.checkVulnerableLibraries();
        securityIssues.push(...vulnerableLibraries);
  
        // Check for exposed sensitive information in HTML source
        const exposedInfo = await this.checkExposedInformation();
        securityIssues.push(...exposedInfo);
  
        if (securityIssues.length > 0) {
          console.warn('Security issues found:', JSON.stringify(securityIssues, null, 2));
        } else {
          console.log('No security issues found.');
        }
  
        return securityIssues;
      } catch (error) {
        console.error('Error during security scan:', error);
        throw new Error('Failed to perform security scan');
      }
    }
  
    async checkSecureConnection() {
      const url = this.page.url();
      return url.startsWith('https://');
    }
  
    async checkContentSecurityPolicy() {
      const headers = await this.page.evaluate(() => {
        return Object.fromEntries(
          Object.entries(window.performance.getEntriesByType('navigation')[0].serverTiming)
            .map(([key, value]) => [key.toLowerCase(), value])
        );
      });
      return headers.hasOwnProperty('content-security-policy');
    }
  
    async checkVulnerableLibraries() {
      // This is a simplified check and should be replaced with a more comprehensive solution
      const libraries = await this.page.evaluate(() => {
        return Array.from(document.getElementsByTagName('script'))
          .map(script => script.src)
          .filter(src => src.includes('jquery'));
      });
  
      return libraries.map(lib => ({
        type: 'vulnerable_library',
        message: `Potentially vulnerable library detected: ${lib}`
      }));
    }
  
    async checkExposedInformation() {
      const pageContent = await this.page.content();
      const exposedInfo = [];
  
      if (pageContent.match(/(?:\w[-.\w]*\w@\w[-.\w]*\w\.\w{2,3})/)) {
        exposedInfo.push({ type: 'exposed_email', message: 'Email address found in page source' });
      }
  
      if (pageContent.match(/(?:\d{3}[-.]?\d{3}[-.]?\d{4})/)) {
        exposedInfo.push({ type: 'exposed_phone', message: 'Phone number found in page source' });
      }
  
      return exposedInfo;
    }
  }
  
  module.exports = { SecurityScanner };