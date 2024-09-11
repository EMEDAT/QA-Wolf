import { Page } from '@playwright/test';

export interface SecurityIssue {
  type: string;
  message: string;
}

interface Config {
  securityHeaders: string[];
}

export class SecurityScanner {
  private readonly page: Page;
  private readonly requiredHeaders: string[];

  constructor(page: Page, config: Config) {
    this.page = page;
    this.requiredHeaders = config.securityHeaders;
  }

  async scan(): Promise<SecurityIssue[]> {
    const securityIssues: SecurityIssue[] = [];

    await this.checkSecureConnection(securityIssues);
    await this.checkSecurityHeaders(securityIssues);

    return securityIssues;
  }

  private async checkSecureConnection(issues: SecurityIssue[]): Promise<void> {
    const isSecure = this.page.url().startsWith('https://');
    if (!isSecure) {
      issues.push({ 
        type: 'insecure_connection', 
        message: 'The page is not served over HTTPS' 
      });
    }
  }

  private async checkSecurityHeaders(issues: SecurityIssue[]): Promise<void> {
    const response = await this.page.goto(this.page.url());
    const headers = response?.headers() || {};
    
    const missingHeaders = this.requiredHeaders.filter(
      header => !headers[header.toLowerCase()]
    );

    missingHeaders.forEach(header => {
      issues.push({ 
        type: 'missing_header', 
        message: `Missing security header: ${header}` 
      });
    });
  }

  async analyzeSecurityIssues(): Promise<SecurityAnalysisResult> {
    const issues = await this.scan();
    return {
      issues,
      isSecure: issues.length === 0,
      summary: this.generateSummary(issues)
    };
  }

  private generateSummary(issues: SecurityIssue[]): string {
    if (issues.length === 0) {
      return 'No security issues found.';
    }

    const summary = issues.map(issue => `- ${issue.type}: ${issue.message}`).join('\n');
    return `Found ${issues.length} security issue(s):\n${summary}`;
  }
}

interface SecurityAnalysisResult {
  issues: SecurityIssue[];
  isSecure: boolean;
  summary: string;
}