// Import the Page object from Playwright test library
import { Page } from '@playwright/test';

// Define interfaces for security issues and configuration
export interface SecurityIssue {
  type: string;    // Type of security issue (e.g., 'insecure_connection', 'missing_header')
  message: string; // Descriptive message about the security issue
}

interface Config {
  securityHeaders: string[]; // Array of required security headers
}

interface SecurityAnalysisResult {
  issues: SecurityIssue[];  // Array of identified security issues
  isSecure: boolean;        // Boolean indicating if the page is secure (no issues found)
  summary: string;          // Summary of the security analysis
}

// SecurityScanner class for performing security checks on web pages
export class SecurityScanner {
  private readonly page: Page;                  // Playwright Page object
  private readonly requiredHeaders: string[];   // List of required security headers

  // Constructor initializes the SecurityScanner with a Page object and configuration
  constructor(page: Page, config: Config) {
    this.page = page;
    this.requiredHeaders = config.securityHeaders;
  }

  // Main method to scan for security issues
  async scan(): Promise<SecurityIssue[]> {
    const securityIssues: SecurityIssue[] = [];

    // Arrange & Act: Perform security checks
    await this.checkSecureConnection(securityIssues);
    await this.checkSecurityHeaders(securityIssues);

    // Assert: Return the security issues
    return securityIssues;
  }

  // Check if the connection is secure (HTTPS)
  private async checkSecureConnection(issues: SecurityIssue[]): Promise<void> {
    // Arrange: Check if the page URL starts with 'https://'
    const isSecure = this.page.url().startsWith('https://');
    
    // Assert: If not secure, add an issue to the list
    if (!isSecure) {
      issues.push({ 
        type: 'insecure_connection', 
        message: 'The page is not served over HTTPS' 
      });
    }
  }

  // Check for required security headers
  private async checkSecurityHeaders(issues: SecurityIssue[]): Promise<void> {
    // Arrange & Act: Navigate to the current page and get the response
    const response = await this.page.goto(this.page.url());
    
    // Arrange: Get the headers from the response, or an empty object if no response
    const headers = response?.headers() || {};
    
    // Act: Find missing headers by filtering the required headers
    const missingHeaders = this.requiredHeaders.filter(
      header => !headers[header.toLowerCase()]
    );

    // Assert: Add an issue for each missing header
    missingHeaders.forEach(header => {
      issues.push({ 
        type: 'missing_header', 
        message: `Missing security header: ${header}` 
      });
    });
  }

  // Analyze security issues and generate a report
  async analyzeSecurityIssues(): Promise<SecurityAnalysisResult> {
    // Arrange & Act: Perform the security scan
    const issues = await this.scan();
    
    // Assert: Return the analysis result
    return {
      issues,
      isSecure: issues.length === 0,  // Page is secure if no issues were found
      summary: this.generateSummary(issues)
    };
  }

  // Generate a summary of security issues
  private generateSummary(issues: SecurityIssue[]): string {
    // Assert: If no issues, return a simple message
    if (issues.length === 0) {
      return 'No security issues found.';
    }

    // Act: Generate a bullet-point list of issues
    const summary = issues.map(issue => `- ${issue.type}: ${issue.message}`).join('\n');
    
    // Assert: Return the summary with a count of issues
    return `Found ${issues.length} security issue(s):\n${summary}`;
  }
}