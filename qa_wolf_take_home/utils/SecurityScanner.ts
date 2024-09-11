import { Page } from '@playwright/test';

interface SecurityIssue {
  type: string;
  message: string;
}

interface Config {
  securityHeaders: string[];
}

class SecurityScanner {
  private page: Page;
  private requiredHeaders: string[];

  constructor(page: Page, config: Config) {
    this.page = page;
    this.requiredHeaders = config.securityHeaders;
  }

  async scan(): Promise<SecurityIssue[]> {
    const securityIssues: SecurityIssue[] = [];

    // Check for secure connection
    const isSecure = await this.checkSecureConnection();
    if (!isSecure) {
      securityIssues.push({ type: 'insecure_connection', message: 'The page is not served over HTTPS' });
    }

    // Check for required security headers
    const missingHeaders = await this.checkSecurityHeaders();
    if (missingHeaders.length > 0) {
      missingHeaders.forEach(header => {
        securityIssues.push({ type: 'missing_header', message: `Missing security header: ${header}` });
      });
    }

    return securityIssues;
  }

  private async checkSecureConnection(): Promise<boolean> {
    const url = this.page.url();
    return url.startsWith('https://');
  }

  private async checkSecurityHeaders(): Promise<string[]> {
    const response = await this.page.goto(this.page.url());
    const headers = response?.headers() || {};
    const missingHeaders = this.requiredHeaders.filter(header => !headers[header.toLowerCase()]);
    return missingHeaders;
  }
}

export { SecurityScanner, SecurityIssue, Config };